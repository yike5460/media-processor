import React from 'react';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import CheckBoxOutlineBlankIcon from '@material-ui/icons/CheckBoxOutlineBlank';

export const columns =  [
    // {title: "视频流ID", field: "id",editable: 'never',cellStyle:{backgroundColor: "green" }},
    // {title: "签名KEY",  field: "key",editable: 'never',      headerStyle: {
    //       backgroundColor: "green"       
    //   }},
    { title: "名称", field: "videoname" },
    { title: "视频ID", field: "id", editable: 'never', hidden: true },
    { title: "签名KEY", field: "key", editable: 'never', hidden: true },
    { title: "推流域名", field: "pushDNS" },
    { title: "播放域名", field: "pullDNS" },
    { title: "过期时间", field: "outdate", type: 'date' },
    { title: "FLV输出", field: "isFlv", type: 'boolean', initialEditValue: true, render: rowData=>rowData.isFlv===true? <CheckBoxIcon />:<CheckBoxOutlineBlankIcon /> },
    { title: "HLS输出", field: "isHls", type: 'boolean', initialEditValue: false,render: rowData=>rowData.isHls===true? <CheckBoxIcon />:<CheckBoxOutlineBlankIcon />  },
    { title: "CMAF输出", field: "isCMAF", type: 'boolean' ,render: rowData=>rowData.isCMAF===true? <CheckBoxIcon />:<CheckBoxOutlineBlankIcon /> },
    { title: "水印输出", field: "isWaterMark", type: 'boolean', initialEditValue: false,render: rowData=>rowData.isWaterMark===true? <CheckBoxIcon />:<CheckBoxOutlineBlankIcon />  },
    { title: "截图", field: "isImage", type: 'boolean', initialEditValue: false ,render: rowData=>rowData.isImage===true? <CheckBoxIcon />:<CheckBoxOutlineBlankIcon /> },
    { title: "视频录制", field: "isVideo", type: 'boolean', initialEditValue: false,render: rowData=>rowData.isVideo===true? <CheckBoxIcon />:<CheckBoxOutlineBlankIcon />  },
    { title: "点播", field: "isOnDemand", type: 'boolean', initialEditValue: false,render: rowData=>rowData.isOnDemand===true? <CheckBoxIcon />:<CheckBoxOutlineBlankIcon />  },
    { title: "移动侦测", field: "isMotion", type: 'boolean', initialEditValue: false,render: rowData=>rowData.isMotion===true? <CheckBoxIcon />:<CheckBoxOutlineBlankIcon />  },
    { title: "HLS输出数量", field: "hls_list_size", type: 'numeric', initialEditValue: '6' },
    { title: "HLS输出频率", field: "hls_time", type: 'numeric', initialEditValue: '3' },
    { title: "水印文字", field: "WaterMarkText" },
    { title: "文字大小", field: "WaterMarkFontSize", type: 'numeric' },
    { title: "文字颜色", field: "WaterMarkFontColor" },
    { title: "截图频率", field: "image_time", type: 'numeric', initialEditValue: '30' },
    { title: "视频录制频率", field: "video_time", type: 'numeric', initialEditValue: '60' },
    { title: "像素变化", field: "motion_percent", type: 'numeric', initialEditValue: '30' },

  ]