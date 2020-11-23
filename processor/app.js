const config = require("./lib/config");
const _ = require("lodash");
const ejs = require("ejs");
const fs = require("fs");
const CP = require("child_process");
const P2P = require("pipe2pam");
const PD = require("pam-diff");
const hls = require("./lib/hls");
const abr = require("./lib/abr");
const ecs = require("./lib/ecs");
const cache = require("./lib/cache");
const logger = require("./lib/logger");
const utils = require("./lib/utils");
const options = require("./lib/ffmpeg");
const path = require("path");
const NodeMediaServer = require("node-media-server");

const generateTemplate = async () => {
  const channel = config.inputURL.split("/").pop();
  //console.log('generateTemplate');
  console.log(JSON.stringify(process.argv));
  const templateFile = "flv.template";
  const outputFile =
    config.basePath + "/hls/" + config.streamChannel + "/flv.html";
  const template = fs.readFileSync(templateFile, "utf8");
  //console.log(template);
  const output = ejs.render(template, { channel }, {});
  //console.log('output-------'+output);
  fs.writeFileSync(outputFile, output);
};
function mkdirsSync(dirname) {
  if (fs.existsSync(dirname)) {
    return true;
  } else {
    if (mkdirsSync(path.dirname(dirname))) {
      fs.mkdirSync(dirname);
      return true;
    }
  }
}
const init = async () => {
  try {
    const SERVER_ADDRESS =
      process.env.NODE_ENV === "production" ? await ecs.getServer() : "";
    const basePath = config.basePath;
    const spawn = CP.spawn;
    const motion = config.motion;
    //change this to /dev/shm/manifest.m3u8
    const pathToHLS = config.pathToHLS;
    //const pathToHLS = "/dev/shm/manifest.m3u8";
    const timeout = process.env.WAIT_TIME || 5000;
    //10000 = 10 seconds of recorded video, includes buffer of time before motion triggered recording
    //set the directory for the jpegs and mp4 videos to be saved
    const percent = process.env.PERCENT || 30;
    const diff = process.env.DIFF || 10;

    let p2p;
    let pd;

   await mkdirsSync(config.basePath + "/hls/" + config.streamChannel + "/480p");
   await mkdirsSync(config.basePath + "/record/" + config.streamChannel + "/720p");
   await mkdirsSync(config.basePath + "/record/" + config.streamChannel + "/mp4");
   await mkdirsSync(config.basePath + "/record/" + config.streamChannel + "/images");
   await mkdirsSync(
      config.basePath + "/record/" + config.streamChannel + "/motion/images"
    );
  await mkdirsSync(
      config.basePath + "/record/" + config.streamChannel + "/motion/mp4"
    );

  await fs.copyFileSync(
      "index.html",
      config.basePath + "/hls/" + config.streamChannel + "/index.html"
    );
    if (config.isFLV) {
      await generateTemplate();
      // await fs.copyFileSync(
      //   "flv.js",
      //   config.basePath + "/hls/" + config.streamChannel + "/flv.js"
      // );
    }

    let recordingStopper = null; //timer used to finish the mp4 recording with sigint after enough time passed with no additional motion events
    let motionRecorder = null; //placeholder for spawned ffmpeg process that will record video to disc
    let bufferReady = false; //flag to allow time for video source to create manifest.m3u8

    function setTimeoutCallback() {
      if (motionRecorder && motionRecorder.kill(0)) {
        motionRecorder.kill();
        motionRecorder = null;
        recordingStopper = null;
      }
      start = true;
      logger.log("recording finished");
    }

    logger.log("ffmpeg params:" + options.getParams());

    if (motion) {
      logger.log("start motion detector");
      var start = true;
      var beginTime;
      p2p = new P2P();
      p2p.on("pam", (data) => {
        // console.log(data);
        //  console.log('get image frame');
      });
      pd = new PD({ difference: diff, percent: percent }).on("diff", (data) => {
        //console.log("diff");

        if (fs.existsSync(pathToHLS) !== true) {
          return;
        }
        //wait just a moment to give ffmpeg a chance to write manifest.mpd
        if (bufferReady === false) {
          bufferReady = true;
          return;
        }
        if (recordingStopper === null) {
          const date = new Date();
          let name = `${date.getFullYear()}-${
            date.getMonth() + 1
          }-${date.getDate()}_${("0" + date.getHours()).substr(-2)}-${(
            "0" + date.getMinutes()
          ).substr(-2)}-${("0" + date.getSeconds()).substr(-2)}-${(
            "00" + date.getMilliseconds()
          ).substr(-3)}`;
          for (const region of data.trigger) {
            name += `_${region.name}-${region.percent}_`;
          }
          const jpeg = `${name}.jpeg`;
          const jpegPath = `${basePath}/record/${config.streamChannel}/motion/images/${jpeg}`;
          //logger.log(jpegPath);
          const mp4 = `${name}.mp4`;
          const mp4Path = `${basePath}/record/${config.streamChannel}/motion/mp4/${mp4}`;
          //logger.log(mp4Path);
          motionRecorder = spawn(
            "ffmpeg",
            [
              "-loglevel",
              "info",
              "-f",
              "pam_pipe",
              "-c:v",
              "pam",
              "-i",
              "pipe:0",
              "-re",
              "-i",
              pathToHLS,
              "-map",
              "1:v",
              //   "-an",
              "-c:v",
              "copy",
              //         "-s","320x240",
              "-movflags",
              "+faststart+empty_moov",
              mp4Path,
              "-map",
              "0:v",
              "-an",
              "-c:v",
              "mjpeg",
              "-pix_fmt",
              "yuvj422p",
              "-q:v",
              "1",
              "-huffman",
              "optimal",
              jpegPath,
            ],
            { stdio: ["pipe", "pipe", "ignore"] }
          )
            .on("error", (error) => {
              logger.log(error);
            })
            .on("exit", (code, signal) => {
              if (code !== 0 && code !== 255) {
                logger.log("motionRecorder", code, signal);
                motionRecorder = null;
                recordingStopper = null;
              }
            });
          motionRecorder.stdin.end(data.pam);
          recordingStopper = setTimeout(setTimeoutCallback, timeout);
          logger.log(`recording started for video ${mp4}`);
        } else {
          if (start === true) {
            beginTime = Date.now();
            start = false;
          }
          var interval = (Date.now() - beginTime) / 1000;
          // console.log("interval---" + interval);
          if (interval < 30) {
            logger.log(
              `due to continued motion, recording has been extended by ${
                timeout / 1000
              } seconds from now`
            );
            clearTimeout(recordingStopper);
            recordingStopper = setTimeout(setTimeoutCallback, timeout);
          } else {
            clearTimeout(recordingStopper);
            setTimeoutCallback();
          }
        }
      });
    }
    //
    const nmsConfig = {
      rtmp: {
        port: 1935,
        chunk_size: 80000,
        gop_cache: true,
        ping: 30,
        ping_timeout: 60,
      },
      http: {
        port: 8080,
        allow_origin: "*",
      },
    };

    //start flv server
    if (config.isFLV) {
      var nms = new NodeMediaServer(nmsConfig);
      nms.run();
    }
    //
    const ffmpeg = spawn("ffmpeg", options.getParams(), {
      stdio: ["pipe", "pipe", "pipe"],
    });
    ffmpeg.on("data", function (data) {
      logger.log("ffmpeg2 PARENT got message:", JSON.stringify(data));
    });

    ffmpeg.on("exit", function (code, signal) {
      //check status
      logger.log(
        "ffmpeg child process exited with code:" + code + " signal:" + signal
      );
    });

    ffmpeg.on("error", function (err) {
      console.log(err);
    });

    ffmpeg.on("close", function (code) {
      //stop task
      console.log("ffmpeg exited with code " + code);
    });

    ffmpeg.stderr.on("data", function (data) {
      // console.log('stderr: ' + data);
      var tData = data.toString("utf8");
      // var a = tData.split('[\\s\\xA0]+');
      var a = tData.split("\n");
      console.log(a);
    });

    this.streams = new Map();
    this.streams.set(config.streamChannel, Date.now());
    // Start the VOD S3 file watcher and sync.
    hls.monitorDir(config.basePath, this.streams);
    if (config.isLive || config.isFLV) {
      await abr.createPlaylist(config.basePath + "/hls", config.streamChannel);
      await cache.set(config.streamChannel, SERVER_ADDRESS);
    }
    if (motion) ffmpeg.stdout.pipe(p2p).pipe(pd);
    else ffmpeg.stdout;
  } catch (err) {
    logger.log("Can't start app", err);
    process.exit();
  }
};
init();
