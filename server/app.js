const NodeMediaServer = require("node-media-server");
const _ = require("lodash");
const { join } = require("path");
const querystring = require("querystring");
const ecs = require("./lib/ecs");
const lambda = require("./lib/lambda");
const logger = require("./lib/logger");
const utils = require("./lib/utils");
const cache = require("./lib/cache");
const scheduler = require("./lib/scheduler");
const db = require("./lib/db");

const LOG_TYPE = 3;
var metaData;
var isAuth = true;
logger.setLogType(LOG_TYPE);
function getConfig() {
  return {
    logType: LOG_TYPE,
    rtmp: {
      port: 1935,
      chunk_size: 61440,
      gop_cache: true,
      ping: 30,
      ping_timeout: 60,
      ssl: {
        port: 1938,
        key: "./privatekey.pem",
        cert: "./certificate.pem",
      },
    },
    http: {
      port: 8000,
      allow_origin: "*",
    },
    auth: {
      api: true,
      play: false,
      api_user: 'admin',
      api_pass: 'admin',
      publish: true,
      secret: 'nodemedia2017privatekey'
    }
  };

  // https: {
  //   port: 8443,
  //   key:'./privatekey.pem',
  //   cert:'./certificate.pem',
  // },

}

// init RTMP server
const init = async () => {
  try {
    const SERVER_ADDRESS =
      process.env.NODE_ENV === "production"
        ? await ecs.getServer()
        : "127.0.0.1";

    const path = process.env.NODE_ENV === "production" ? "/dev/shm" : "media";

    // Set the Node-Media-Server config.
    const config = getConfig();
    // Construct the NodeMediaServer
    const nms = new NodeMediaServer(config);
    //
    // RTMP callbacks
    //
    nms.on("preConnect", async (id, StreamPath, args) => {
      logger.log(
        "[NodeEvent on preConnect]",
        `id=${id} args=${JSON.stringify(args)}`
      );
    });

    nms.on("postConnect", (id, args) => {
      logger.log(
        "[NodeEvent on postConnect]",
        `id=${id} args=${JSON.stringify(args)}`
      );
    });

    nms.on("doneConnect", (id, args) => {
      logger.log(
        "[NodeEvent on doneConnect]",
        `id=${id} args=${JSON.stringify(args)}`
      );
    });

    nms.on("prePublish", async (id, StreamPath, args) => {
      logger.log(
        "[NodeEvent on prePublish]",
        `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`
      );
      const name = StreamPath.split("/").pop();
      metaData = await db.getItem(name);
      if (_.isEmpty(metaData)) {
        logger.log(`The channel ${name} is not exist`);
        let session = await nms.getSession(id);
        await session.reject();
      }
    });

    nms.on("postPublish", async (id, StreamPath, args) => {
      logger.log(
        "[NodeEvent on postPublish]",
        `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`
      );
      const name = StreamPath.split("/").pop();
      const metaData = await db.getItem(name);

      if (StreamPath.indexOf("/stream/") != -1 && !_.isEmpty(metaData)) {
        logger.log("---begin to run ecs task---");
        logger.log("channel's metadata:" + JSON.stringify(metaData));
        var url;
        if (metaData.isRtmps == "true")
          url = "rtmps://" + SERVER_ADDRESS + ":1938/stream/" + name;
        else url = "rtmp://" + SERVER_ADDRESS + ":1935/stream/" + name;
        const params = {
          id: name,
          url: url,
          eventName: "start",
          metaData: metaData,
        };
        //await lambda.invokeLambda(params);
        await scheduler.invokeTask(params);
        logger.log(params);
        //await abr.createPlaylist(config.http.mediaroot+'/hls', name);
        // await cache.set(name, SERVER_ADDRESS);
      }
    });

    nms.on("donePublish", async (id, StreamPath, args) => {
      logger.log(
        "[NodeEvent on donePublish]",
        `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`
      );

      const name = StreamPath.split("/").pop();
      const metaData = await db.getItem(name);
      if (StreamPath.indexOf("/stream/") != -1 && !_.isEmpty(metaData)) {
        const name = StreamPath.split("/").pop();
        // Set the "stream key" <-> "id" mapping for this RTMP/HLS session
        // We use this when creating the DVR HLS playlist name on S3.
        const timeoutMs = _.isEqual(process.env.NODE_ENV, "development")
          ? 1000
          : 5 * 1000;
        logger.log("remove from cache:" + name);
        await cache.del(name);
        //waiting for processing video stream
        await utils.timeout(timeoutMs);
        //const url=SERVER_ADDRESS+"/stream/"+name;

        // if(isRtmps)
        //  url = "rtmps://" + SERVER_ADDRESS + "/stream/" + name;
        //  else
        url = "rtmp://" + SERVER_ADDRESS + "/stream/" + name;
        const params = { id: name, url: url, eventName: "stop" };
        await scheduler.invokeTask(params);
        logger.log(url);
      }
    });

    nms.on("prePlay", (id, StreamPath, args) => {
      logger.log(
        "[NodeEvent on prePlay]",
        `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`
      );
    });

    nms.on("postPlay", (id, StreamPath, args) => {
      logger.log(
        "[NodeEvent on postPlay]",
        `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`
      );
    });

    nms.on("donePlay", (id, StreamPath, args) => {
      logger.log(
        "[NodeEvent on donePlay]",
        `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`
      );
    });

    // Run the NodeMediaServer
    nms.run();
  } catch (err) {
    logger.log("Can't start app", err);
    process.exit();
  }
};
init();
