module.exports = Object.freeze({
  inputURL: process.env.INPUT_URL || "rtmp://58.200.131.2:1935/livetv/natlgeo",
  basePath: process.env.NODE_ENV === "production" ? "/dev/shm" : "media",
  streamChannel: (
    process.env.INPUT_URL || "rtmp://58.200.131.2:1935/livetv/natlgeo"
  )
    .split("/")
    .pop(),
   
  pathToHLS: (process.env.NODE_ENV === "production" ? "/dev/shm" : "media") + "/index.m3u8",
  channel: process.env.CHANNEL || 'test05',
  isMotion: (process.env.IS_MOTION || 'false')=== 'true',
  isVideo: (process.env.IS_VIDEO || 'false')=== 'true',
  isImage: (process.env.IS_IMAGE|| 'false')=== 'true' ,
  isOnDemand: (process.env.IS_ONDEMAND || 'false')=== 'true',
  isLive: (process.env.IS_HLS || 'true')=== 'true',
  isFLV: (process.env.IS_FLV || 'true')=== 'true',

  imageTime: process.env.IMAGE_TIME || "10",
  videoTime: process.env.VIDEO_TIME || "30",
  hlsTime: process.env.HLS_TIME || "2",
  hlsListSize: process.env.HLS_LIST_SIZE || "2",

  logLevel: process.env.LOG_LEVEL || "warning",
  transCoding: process.env.TRANSCODING || "copy",
  pixFmt: process.env.PIX_FORMAT || "rgb24",
  buckName:process.env.ASSETS_BUCKET||'video-streaming-assets-assetsbucket-1kf2tlxbhy4qz',
  regions: [
    {
      name: "region1",
      difference: 10,
      percent: 51,
      polygon: [
        { x: 0, y: 0 },
        { x: 0, y: 360 },
        { x: 160, y: 360 },
        { x: 160, y: 0 },
      ],
    },
    {
      name: "region2",
      difference: 10,
      percent: 51,
      polygon: [
        { x: 160, y: 0 },
        { x: 160, y: 360 },
        { x: 320, y: 360 },
        { x: 320, y: 0 },
      ],
    },
    {
      name: "region3",
      difference: 10,
      percent: 51,
      polygon: [
        { x: 320, y: 0 },
        { x: 320, y: 360 },
        { x: 480, y: 360 },
        { x: 480, y: 0 },
      ],
    },
    {
      name: "region4",
      difference: 10,
      percent: 51,
      polygon: [
        { x: 480, y: 0 },
        { x: 480, y: 360 },
        { x: 640, y: 360 },
        { x: 640, y: 0 },
      ],
    },
  ]
});
