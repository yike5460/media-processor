const fs = require("fs");
const config = require('./config');
const path = require("path");
const logger = require("./logger");

function getVideoParams() {
  return [
    //   '-an',
    "-c:v",
    config.transCoding,
    // "-map",
    // "0",
    "-f",
    "segment",
    "-segment_time",
    config.videoTime,
    // "-segment_format",
    // "mp4",
    "-segment_list",
    config.basePath + "/record/" + config.streamChannel + "/mp4/vod-index.m3u8",
    "-force_key_frames",
    "expr:gte(t,n_forced*1)",
    "-segment_format_options",
    "movflags=+faststart",
    "-reset_timestamps",
    "1",
    "-strict",
    "-2",
    // "-vf","scale=-1:320",
    "-strftime",
    "1",
    config.basePath + "/record/" + config.streamChannel + "/mp4/capture-%03d-%Y-%m-%d_%H-%M-%S.mp4",
  ];
}

/**
 * get image params
 * @returns {string[]}
 */
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

/**
 * get motion params
 * @returns {(string|string|*)[]}
 */
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
    // "-s","320x240",
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
    "-map", "0:v",
    "-an",
    "-c:v",
    "pam",
    "-pix_fmt",
    //'gray',
    config.pixFmt,
    "-f",
    "image2pipe",
    '-vf',
    'fps=1,scale=iw*1/6:ih*1/6',
    '-frames',
    '100',
    "pipe:1",
  ];
}


function getLiveBasePath() {
  if (config.isCluster)
    return config.livePath + "/livestreaming/" + config.streamChannel
  else
    return config.basePath + "/livestreaming/" + config.streamChannel
}

function getMBRParam(code,w,h,bv,maxrate,bufsize,ba,filename){
return [
  '-vf', `scale=w=${w}:h=${h}:force_original_aspect_ratio=decrease`,
  '-c:a', 'aac',
  '-ar', '48000',
  '-c:v', code,
  '-profile:v', 'main',
  '-crf', '20',
  '-sc_threshold', '0',
  '-g', '48',
  '-keyint_min', '48',
  '-hls_time', '4',
  '-b:v', bv,
  '-maxrate', maxrate,
  '-bufsize', bufsize,
  '-b:a', ba,
  '-hls_segment_filename' ,
  `${getLiveBasePath()}/${filename}_%03d.ts`, 
  `${getLiveBasePath()}/${filename}.m3u8`
]
}

function getMBRParams() {
  let params=new Array();
  params=params.concat(getMBRParam('libx264','640','360','800k','856k','1200k','96k','360p'));
  // params=params.concat(getMBRParam('842','480','1400k','1498k','2100k','128k','480p'));
  //params= params.concat(getMBRParam('1280','720','2800k','2996k','4200k','128k','720p'));
  // params=params.concat(getMBRParam('1920','1080','5000k','5350k','7500k','192k','1080p'));
  params=params.concat ([
    '-f', 'hls',
    '-hls_time', '2',
    '-hls_list_size', '5',
    '-hls_flags', 'independent_segments',
    '-hls_segment_type', 'mpegts',
    '-remove_at_exit', '1',
  ]);
  return params;
}
/**
 * get HLS params
 * @returns {(string|*|number)[]}
 */
function getHLSParams() {
  return [
    "-f",
    "hls",
    //  '-codec:v','libx264',
    // '-codec:a', 'mp3',
    '-profile:v',
    'main',
    '-lhls', '1',
    '-streaming', '1',
    '-hls_playlist', '1',
    "-hls_init_time", "1",
    "-preset", "veryfast",
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
    getLiveBasePath() + "/480p/%03d.ts",
    getLiveBasePath() + "/480p/index.m3u8"
  ];
}

function getCMAFParams() {
  return [
    '-c:v', 'copy',
    '-b:v', '500k',
    '-ldash', '1',
    '-adaptation_sets', 'id=0,streams=v id=1,streams=a',
    '-streaming', '1',
    '-use_template', '1',
    '-use_timeline', '0',
    '-seg_duration', '4',
    '-remove_at_exit', '1',
    '-window_size', '5',
    '-hls_playlist', '1',
    "-tune", "zerolatency",
    '-f', 'dash',
    // "-strict",
    // "-2",
    getLiveBasePath() + "/manifest.mpd",
  ];
}
/**
 * get cmaf params
 * @returns {string[]}
 */
function getCMAF1Params() {
  return [
    '-map', '0',
    '-map', '0',
    // '-c:v', 'h264_videotoolbox',
    // '-allow_sw', '1',
    '-map', '0',
    '-c:a', 'aac',
    '-c:v', 'libx264',
    '-b:v:0', '1000k',
    '-s:v:0', '1280x720',
    '-profile:v:0', 'main',
    '-b:v:1', '800k',
    '-s:v:1', '960x540',
    '-profile:v:1', 'main',
    '-b:v:2', '500k',
    '-s:v:2', '640x360',
    '-profile:v:2', 'main',
    // '-bf', '1',
    // '-keyint_min', '120',
    '-g', '120',
    '-sc_threshold', '0',
    '-b_strategy', '0',
    // '-ar:a:1', '22050',
    '-use_timeline', '0',
    '-use_template', '1',
    '-window_size', '5',
    '-adaptation_sets', 'id=0,streams=v id=1,streams=a',
    '-hls_playlist', '1',
    "-tune", "zerolatency",
    // '-min_seg_duration','10000000', 
    // "-flags","low_delay",
    '-seg_duration', '4',
    '-streaming', '1',
    '-remove_at_exit', '1',
    '-f', 'dash',
    // "-strict",
    // "-2",
    getLiveBasePath() + "/manifest.mpd",
  ];
}

function getTransParam() {
  if (config.isWatermark)
    return "libx264";
  else return "copy"
}


/**
 * get flv params
 * @returns {string[]}
 */
function getFlvParams() {
  return [

    "-preset",
    "medium",
    "-vprofile",
    "baseline",
    // "-profile:v",
    // "basline",
    "-fflags",
    "nobuffer",
    "-f",
    "flv",
    "-y",
    "-tune",
    "zerolatency",
    "-fflags",
    "discardcorrupt",
    // "-flags",
    // "low_delay",
    // "-r",
    // "15",
    // "-c:v",
    // "libx264",
    //  "-crf",
    // "19",
    "-c:v",
    getTransParam(),
    // "-c:a",
    // "aac",
    //      config.basePath+"/hls/" + config.streamChannel + "/480p/live.flv",
    "rtmp://localhost:1935/" + config.streamChannel + "/live"
  ];
}

/**
 * on demand param
 * @returns {(string|*|number)[]}
 */
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

/**
 * watermark parameter
 * @returns {string[]}
 */
function getWatermark() {
  return [
    '-vf',
    `drawtext=fontfile=simhei.ttf: text=${config.waterMarkText}:x=${config.waterMarkLeft}:y=${config.waterMarkTop}:fontsize=${config.waterMarkFontSize}:fontcolor=${config.waterMarkFontColor}`
  ];
}
//"color=color=black, drawtext=enable='gte(t,3)':fontfile=Vera.ttf:fontcolor=white:textfile=text.txt:reload=1:y=h-line_h-10:x=(W/tw)*n"

function getDynamicText() {
  return [
    "-vf",
    "color=color=black, drawtext=enable='gte(t,3)':fontfile=simhei.ttf:fontcolor=white:textfile=text.txt:reload=1:y=h-line_h-10:x=(W/tw)*n"
  ];
  // 如果要指定水印的大小，比如 384x216：

  // ffmpeg -i input.mp4 -i wm.png -filter_complex "[1:v]scale=384:216[wm];[0:v][wm]overlay=0:0"
}
/**
 * return params according to medadata
 * @returns {(string|*)[]}
 */
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
  if (config.isWatermark) params = params.concat(getWatermark());
  if (config.isMotion) params = params.concat(getMotionParams());
  if (config.isVideo) params = params.concat(getVideoParams());
  if (config.isImage) params = params.concat(getImageParams());
  // if (config.isLive) params = params.concat(getLiveParams());
  if (config.isOnDemand) params = params.concat(getOnDemandParams());
  // if(config.isFLV)params = params.concat(getFlvParams());
  // params=params.concat(['-y', 'pipe:1']);
  logger.log("----ffmpeg record params:" + params);
  return params;
};

getFLVParams = function () {
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
  if (config.isWatermark) params = params.concat(getWatermark());
  params = params.concat(getFlvParams());
  logger.log("----ffmpeg flv params:" + params);
  return params;
}

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
  if (config.isWatermark) params = params.concat(getWatermark());
  if (config.isLive) params = params.concat(getHLSParams());
  if (config.isCMAF) params = params.concat(getCMAFParams());
  // params=params.concat(['-y', 'pipe:1']);

  logger.log("----ffmpeg live params:" + params);
  return params;
};

getRelayParams = function () {
  var params = [
    "-loglevel",
    config.logLevel,
    /* use hardware acceleration */
    "-hwaccel",
    "auto", //vda, videotoolbox, none, auto
    "-abort_on",
    "empty_output",
    "-i",
    config.inputURL,
    "-preset",
    "veryfast",
    "-fflags",
    "nobuffer",
    "-vprofile",
    "baseline",
    "-f",
    "flv",
    "-y",
    "-tune",
    "zerolatency",
    "-fflags",
    "discardcorrupt",
    "-flags",
    "low_delay",
    "-c:v",
    "copy",
    config.RELAY_URL
  ];
  logger.log("----ffmpeg relay params:" + params);
  return params;
}



module.exports = {
  getParams,
  getLiveParams,
  getFLVParams,
  getRelayParams
};
