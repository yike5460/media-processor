直播推流：支持主流 RTMP 协议推流。支持 OBS/XSplit/FMLE 等常见的第三方推流软件，支持常见的第三方 RTMP 推流硬件和编码器或盒子等设备；
直播播放： 支持 HTTP-FLV 及 HLS\CMAF 三种播放协议。 支持常见的第三方 FLV、RTMP、HLS 播放器VLC,FFPLAY；
视频处理功能：直播转码、直播录制、直播截图，视频移动侦测等；；
音视频存储和点播 ，音视频存储（可做冷/热分层），支持录制hls分片点播
直播控制台：提供API 管理和图形化管理（开发中） ；
统一的推流域名、播流域名管理
直播安全： 推流鉴权支持推流 URL 防盗链，播放鉴权利用CloudFront签名URL支持播放 URL 防盗链以及播放鉴权；
上下行加速：推送的视频流通过AGA边缘节点进行加速保证上行传输的稳定性
