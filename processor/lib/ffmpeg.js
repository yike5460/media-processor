const fs = require("fs");
const config = require('./config');
const path = require("path");

function getVideoParams() {
  return [
    //   '-an',
    "-c:v",
    config.transCoding,
    "-f",
    "segment",
    "-segment_time",
    config.videoTime,
    "-segment_format",
    "mp4",
    "-strict",
    "-2",
    // "-vf","scale=-1:320",
    "-strftime",
    "1",
    config.basePath + "/record/" + config.streamChannel + "/mp4/capture-%03d-%Y-%m-%d_%H-%M-%S.mp4",
  ];
}

function getImageParams() {
  // cmd=$cmd" -map 0:v -vf fps=1/${IMAGE_SEGMENT_TIME}  -strict -2 \
  // -strftime 1 $BASEpath/capture-%Y-%m-%d_%H-%M-%S.jpg"
  return [
    //   "-map",  "0:v",
    "-an",
    "-c:a",
    "copy",
    "-vf",
    "fps=1/" + config.imageTime,
    "-strict",
    "-2",
    "-strftime",
    "1",
    config.basePath + "/record/" + config.streamChannel + "/images/capture-%Y-%m-%d_%H-%M-%S.jpg",
  ];
}

function getMotionParams() {
  return [
    //   "-map", "0:v",
    /* output hls video that will used as source for recording when motion triggered */
    //   "-an",
    //"-c:a", "copy",
    // "-c:v",
    // "copy",
    // "-s",
    // "720x576",
    // "-c:a",
    // "copy",
    "-f",
    "hls",
    //   "-s","320x240",
    "-hls_time",
    "3",
    "-hls_list_size",
    "2",
    "-start_number",
    "0",
    //   "-hls_allow_cache", "0",
    "-hls_flags",
    "+delete_segments+omit_endlist",
    config.pathToHLS,
    /* output pam image that is used as source for motion detection analysis */
    //    "-map",  "0:v",
    "-an",
    "-c:v",
    "pam",
    "-pix_fmt",
    //'gray',
    config.pixFmt,
    "-f",
    "image2pipe",
    "-vf",
    "fps=2,scale=320:-1",
    //'-frames',
    //'1000',
    "pipe:1",
  ];
}

function getHLSParams() {
  return [
    "-f",
    "hls",
    //  '-codec:v','libx264',
    // '-codec:a', 'mp3',
    '-profile:v',
    'baseline',
    '-level',
    '3.0',
    "-hls_init_time", "1",
    //   "-preset","slow",
    "-tune",
    "zerolatency",
    "-fflags",
    "nobuffer",
    "-flags",
    "low_delay",
    "-movflags",
    "faststart",
    "-hls_time",
    config.hlsTime,
    "-hls_list_size",
    config.hlsListSize,
    "-hls_flags",
    "delete_segments",
    "-start_number",
    Date.now(),
    "-strict",
    "-2",
    "-hls_segment_filename",
    config.basePath + "/hls/" + config.streamChannel + "/480p/%03d.ts",
    config.basePath + "/hls/" + config.streamChannel + "/480p/index.m3u8"
  ];
}

function getCMAFParams() {
  return [
    '-map', '0',
    '-map', '0',
    // '-c:v', 'h264_videotoolbox',
    // '-allow_sw', '1',
    '-map', '0',
    '-c:a', 'aac',
    '-c:v', 'libx264',
    '-b:v:0', '800k',
    '-s:v:0', '1280x720',
    '-profile:v:0', 'main',
    '-b:v:1', '500k',
    '-s:v:1', '720x576',
    '-profile:v:1', 'main',
    '-b:v:2', '300k',
    '-s:v:2', '320x170',
    '-profile:v:2', 'baseline',
    // '-bf', '1',
    // '-keyint_min', '120',
    '-g', '120',
    '-sc_threshold', '0',
    '-b_strategy', '0',
    // '-ar:a:1', '22050',
    '-use_timeline', '1',
    '-use_template', '1',
    '-window_size', '5',
    '-adaptation_sets', 'id=0,streams=v id=1,streams=a',
    '-hls_playlist', '1',
    // "-tune", "zerolatency",
    // "-flags","low_delay",
    '-seg_duration', '4',
    '-streaming', '1',
    '-remove_at_exit', '1',
    '-f', 'dash',
    // "-strict",
    // "-2",
    config.basePath + "/hls/" + config.streamChannel + "/manifest.mpd",
  ];


}

function getFlvParams() {
  return [
    "-fflags",
    "nobuffer",
    "-f",
    "flv",
    "-y",
    "-tune",
    "zerolatency",
    "-fflags",
    "discardcorrupt",
    "-flags",
    "low_delay",
    // "-r",
    // "15",
    // "-c:v",
    // "libx264",
    //  "-crf",
    // "19",
    "-c",
    "copy",
    //      config.basePath+"/hls/" + config.streamChannel + "/480p/live.flv",
    "rtmp://localhost:1935/" + config.streamChannel + "/live"
  ];
}

function getOnDemandParams() {
  return [
    "-f",
    "hls",
    "-hls_time",
    config.ONDEMAND_TIME,
    "-hls_list_size",
    config.ONDEMAND_LIST_SIZE,
    "-hls_flags",
    "delete_segments",
    "-start_number",
    Date.now(),
    "-strict",
    "-2",
    "-hls_segment_filename",
    config.basePath + "/record/" + config.streamChannel + "/720p/%03d.ts",
    config.basePath + "/record/" + config.streamChannel + "/720p/index.m3u8"
  ];
}

function getWatermark(){
  return [
    '-vf',
    "drawtext=text=‘test’:x=10:y=10:fontsize=24:fontcolor=white:shadowy=2"
  ];
}

getParams = function () {
  var params = [
    "-loglevel",
    config.logLevel,
    /* use hardware acceleration */
    "-hwaccel",
    "auto", //vda, videotoolbox, none, auto
    /* use an rtsp ip cam video input */
    // "-rtsp_transport",
    // "tcp",
    "-abort_on",
    "empty_output",
    // "-stimeout",
    // "10000000",
    // "-stream_loop",
    // "-1",
    "-i",
    config.inputURL,
  ];
  if(config.isWatermark) params=params.concat(getWatermark());
  if (config.isMotion) params = params.concat(getMotionParams());
  if (config.isVideo) params = params.concat(getVideoParams());
  if (config.isImage) params = params.concat(getImageParams());
  // if (config.isLive) params = params.concat(getLiveParams());
  if (config.isOnDemand) params = params.concat(getOnDemandParams());
  // if(config.isFLV)params = params.concat(getFlvParams());
  // params=params.concat(['-y', 'pipe:1']);
  console.log("----ffmpeg record params:" + params);
  return params;
};


getLiveParams = function () {
  var params = [
    "-loglevel",
    config.logLevel,
    /* use hardware acceleration */
    "-hwaccel",
    "auto", //vda, videotoolbox, none, auto

    "-abort_on",
    "empty_output",
    "-i",
    // 'rtsp://freja.hiof.no:1935/rtplive/definst/hessdalen03.stream',
    config.inputURL,
  ];
  if(config.isWatermark) params=params.concat(getWatermark());
  if (config.isLive) params = params.concat(getHLSParams());
  if (config.isFLV) params = params.concat(getFlvParams());
  if (config.isCMAF) params = params.concat(getCMAFParams());
  // params=params.concat(['-y', 'pipe:1']);
  console.log("----ffmpeg live params:" + params);
  return params;
};

module.exports = {
  getParams,
  getLiveParams,
};
