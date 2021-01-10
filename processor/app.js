const config = require("./lib/config");
const _ = require("lodash");
const axios = require('axios');
const ejs = require("ejs");
const fs = require("fs");
const CP = require("child_process");
const hls = require("./lib/hls");
const abr = require("./lib/abr");
const ecs = require("./lib/ecs");
const cache = require("./lib/cache");
const logger = require("./lib/logger");
const motionDetect = require("./lib/motion");
const options = require("./lib/ffmpeg");
const path = require("path");
const NodeMediaServer = require("node-media-server");
const spawn = CP.spawn;

const generateTemplate = async () => {
  const channel = config.inputURL.split("/").pop();
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

//
const nmsConfig = {
  rtmp: {
    port: 1935,
    chunk_size: 60000,
    gop_cache: true,
    ping: 30,
    ping_timeout: 60,
  },
  http: {
    port: 8080,
    allow_origin: "*",
  },
};


const init = async () => {
  try {
    const SERVER_ADDRESS =
      process.env.NODE_ENV === "production" ? await ecs.getServer() : "";

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


      await fs.copyFileSync(
        "hls.html",
        config.basePath + "/hls/" + config.streamChannel + "/hls.html"
      );
      await fs.copyFileSync(
        "dash.html",
        config.basePath + "/hls/" + config.streamChannel + "/dash.html"
      );
  
      await generateTemplate();
  
    const motion = config.isMotion;
    let p2p;
    let pd;
    const result = motionDetect.motionDetect(motion, p2p, pd);
    p2p = result.p2p;
    pd = result.pd;
    //start flv server
    if (config.isFLV) {
      var nms = new NodeMediaServer(nmsConfig);
      nms.run();
    }
    //
    if (config.isMaster) {
      if (config.isImage || config.isMotion || config.isVideo || config.isOnDemand) {
        logger.log('start recording process');
        await runRecordProcess(motion, p2p, pd);
        this.streams = new Map();
        this.streams.set(config.streamChannel, Date.now());
        // Start the VOD S3 file watcher and sync.
        await hls.monitorDir(config.basePath, this.streams);
      }
    }
    if (config.IS_RELAY) {
      logger.log('start relay process');
      await runRelayProcess();
    }
     
    if (config.isFLV || config.isLive || config.isCMAF) {
      logger.log('*** start live process ***');
      await runLiveProcess();
      await abr.createPlaylist(config.basePath + "/hls", config.streamChannel);
      logger.log('add channel:' + config.streamChannel + '- address:' + SERVER_ADDRESS);
      //add channel and ip to cache
      await cache.set(config.streamChannel, SERVER_ADDRESS);
      await axios.get('http://localhost:8000/api/server', { timeout: 2000 })
        .then(function (response) {
          logger.log(response.data);
        })
        .catch(function (error) {
          //invoke task stop
          console.log("get api status error: " + error);
        })
    }

  } catch (err) {
    logger.log("Can't start app", err);
    process.exit();
  }
};

init();

/**
 * 
 * @param {*} spawn 
 */
const runLiveProcess = async () => {
  // function runLiveProcess() {
  const liveProcess = spawn("ffmpeg", options.getLiveParams(), {
    stdio: ["pipe", "pipe", "pipe"],
  });
  liveProcess.on("data", function (data) {
    logger.log("ffmpeg2 PARENT got message:", JSON.stringify(data));
  });

  liveProcess.on("exit", function (code, signal) {
    //logger.log("waiting 30s to restart live process");
    var serverStatus;
    const serverUrl = 'http://' + config.address + ':8000/api/server';
    console.log("Checking Server Status...");
    // Make a request for a user with a given ID
    axios.get(serverUrl, { timeout: 2000 })
      .then(function (response) {
        logger.log("check status success,waiting 30s to restart live process");
        setTimeout(runLiveProcess, config.retryTimeout);
      })
      .catch(function (error) {
        //invoke task stop
        ecs.shutdown();
        console.log("check status false,ffmpeg stream exit with code " + code);
      })
  });

  liveProcess.on("error", function (err) {
    console.log(err);
  });

  liveProcess.on("close", function (code) {
    //stop task
    // setTimeout(runLiveProcess, config.retryTimeout);
    console.log("ffmpeg stream closed with code " + code);
  });

  liveProcess.stderr.on("data", function (data) {
    // console.log('stderr: ' + data);
    var tData = data.toString("utf8");
    // var a = tData.split('[\\s\\xA0]+');
    var a = tData.split("\n");
    console.log(a);
  });
  liveProcess.stdout;
}
/**
 * 
 * @param {*} spawn 
 * @param {*} motion 
 * @param {*} p2p 
 * @param {*} pd 
 */
const runRecordProcess= async (motion, p2p, pd) => {
  const ffmpeg = spawn("ffmpeg", options.getParams(), {
    stdio: ["pipe", "pipe", "pipe"],
  });
  ffmpeg.on("data", function (data) {
    logger.log("ffmpeg2 PARENT got message:", JSON.stringify(data));
  });

  ffmpeg.on("exit", function (code, signal) {
    //check status
    logger.log(
      "media stream recording process exited with code:" + code + " signal:" + signal
    );
    setTimeout(runRecordProcess, config.retryTimeout);
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
  if (motion)
    ffmpeg.stdout.pipe(p2p).pipe(pd);
  else
    ffmpeg.stdout;
}

/**
 * 
 * @param {*} spawn 
 */
const runRelayProcess = async () => {
  // function runLiveProcess() {
  const relayProcess = spawn("ffmpeg", options.getRelayParams(), {
    stdio: ["pipe", "pipe", "pipe"],
  });
  relayProcess.on("data", function (data) {
    logger.log("ffmpeg PARENT got message:", JSON.stringify(data));
  });

  relayProcess.on("exit", function (code, signal) {
    //logger.log("waiting 30s to restart live process");
    var serverStatus;
    const serverUrl = 'http://' + config.address + ':8000/api/server';
    console.log("Checking Server Status...");
    // Make a request for a user with a given ID
    axios.get(serverUrl, { timeout: 2000 })
      .then(function (response) {
        logger.log("check status success,waiting 30s to restart live process");
        setTimeout(runLiveProcess, config.retryTimeout);
      })
      .catch(function (error) {
        //invoke task stop
        ecs.shutdown();
        console.log("check status false,ffmpeg stream exit with code " + code);
      })
  });

  relayProcess.on("error", function (err) {
    console.log(err);
  });

  relayProcess.on("close", function (code) {
    //stop task
    // setTimeout(runLiveProcess, config.retryTimeout);
    console.log("ffmpeg relay stream closed with code " + code);
  });

  relayProcess.stderr.on("data", function (data) {
    // console.log('stderr: ' + data);
    var tData = data.toString("utf8");
    // var a = tData.split('[\\s\\xA0]+');
    var a = tData.split("\n");
    console.log(a);
  });
  relayProcess.stdout;
}

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