import React, { useState, useEffect, useContext } from "react";
import PullStream from "./PullStream";
import Record from "./Record";
import RecordStream from "./TransCodeStream";
import VideoBridge from "./VideoBridge";
import WaterPrint from "./WaterPrint";
import { Icon, IconName } from "@blueprintjs/core";
import QRCode from "qrcode.react";

import AppContext from "context/AppContext";
import { StreamType } from "assets/types/types";
import QRCodeImg from "assets/images/QRcode.svg";
// import useWebSocketLite from "hooks/useWebSocketHook";
import VideoDanMu from "pages/common/VideoDanMu";

interface LiveVideoPropsType {
  icon: IconName;
  title: string;
  srcType: string;
  streamData: StreamType | undefined;
}

const LiveVideoItem: React.FC<LiveVideoPropsType> = (
  props: LiveVideoPropsType
): JSX.Element => {
  // use our hook
  // const ws = useWebSocketLite({
  //   socketUrl: "ws://localhost:8080",
  // });

  const appConfig = useContext(AppContext);
  const { icon, title, srcType, streamData } = props;

  const [pushURL, setPushURL] = useState("");
  const [videoUrl, setVideoUrl] = useState("");

  useEffect(() => {
    if (streamData) {
      setPushURL(
        `rtmp://${appConfig?.pushDNS}:1935/stream/${streamData?.id}?sign=${streamData?.key}`
      );
      setVideoUrl(`http://${appConfig?.pullDNS}/${streamData?.id}/live.flv`);
      // setVideoUrl(
      //   "http://playertest.longtailvideo.com/adaptive/bipbop/gear4/prog_index.m3u8"
      // );
    }
  }, [streamData]);

  return (
    <div className="live-video flex flex-col">
      <div className="video box mb-0">
        <div className="title">
          <Icon icon={icon} /> {title}
        </div>
        <div className="live pr flex flex-col">
          <div className="live-icon">{srcType}</div>
          <VideoDanMu videoUrl={videoUrl} />
        </div>
      </div>
      <div className="channel box over-y-auto">
        <div>
          <div>
            <b>推流地址</b>
          </div>
          <div className="pr">
            <input readOnly defaultValue={pushURL} className="pt-input" />
            <span className="qr-code">
              <img src={QRCodeImg} width="20" />
              <span className="qr-code-live">
                <QRCode
                  level="L"
                  value={pushURL} //value参数为生成二维码的链接
                  size={80} //二维码的宽高尺寸
                  bgColor="#ffffff"
                  fgColor="#000000" //二维码的颜色
                />
              </span>
            </span>
          </div>

          <div className="split">
            <PullStream streamData={streamData} />
          </div>
          <div className="split">
            <Record streamData={streamData} />
          </div>
          <div className="split">
            <RecordStream streamData={streamData} />
          </div>
          <div className="split">
            <WaterPrint />
          </div>
          <div className="split">
            <VideoBridge />
          </div>
          <div className="split">
            <div className="more-setting-btn">
              <a role="button" className="pt-button .modifier">
                更多设置
              </a>

              {/* <button type="button" className="">
                    Large button
                  </button> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveVideoItem;
