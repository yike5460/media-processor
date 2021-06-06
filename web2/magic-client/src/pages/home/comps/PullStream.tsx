import React, { useState, useEffect, useContext } from "react";
import { RadioGroup, Radio } from "@blueprintjs/core";
import { StreamType } from "assets/types/types";
import AppContext from "context/AppContext";
import QRCode from "qrcode.react";
import QRCodeImg from "assets/images/QRcode.svg";

interface PullStreamPropType {
  streamData: StreamType | undefined;
}

type MapObject = {
  raw: string;
  html: string;
};
interface PullStreamMapType {
  [key: string]: MapObject;
}

const PullStream: React.FC<PullStreamPropType> = (
  props: PullStreamPropType
): JSX.Element => {
  const [pullStreamType, setPullStreamType] = useState("FLV");
  const { streamData } = props;
  const [pullStreamURLMap, setPullStreamURLMap] = useState<PullStreamMapType>(
    {}
  );
  const appConfig = useContext(AppContext);
  useEffect(() => {
    setPullStreamURLMap({
      HLS: {
        raw: `http://${appConfig?.pullDNS}/${streamData?.id}/live.m3u8`,
        html: `http://${appConfig?.pullDNS}/${streamData?.id}/index.html`,
      },
      FLV: {
        raw: `http://${appConfig?.pullDNS}/${streamData?.id}/live.flv`,
        html: `http://${appConfig?.pullDNS}/${streamData?.id}/flv.html`,
      },
      CMAF_HLS: {
        raw: `http://${appConfig?.pullDNS}/${streamData?.id}/master.m3u8`,
        html: `http://${appConfig?.pullDNS}/${streamData?.id}/hls.html`,
      },
      CMAF_DASH: {
        raw: `http://${appConfig?.pullDNS}/${streamData?.id}/manifest.mpd`,
        html: `http://${appConfig?.pullDNS}/${streamData?.id}/dash.html`,
      },
    });
  }, [streamData]);

  return (
    <>
      <div className="flex mt-10">
        <div className="mr-10">
          <b>拉流地址</b>
        </div>
        <div className="flex1">
          <RadioGroup
            inline
            onChange={(event) => {
              const radioEvent = event as React.ChangeEvent<HTMLInputElement>;
              // console.info(event.target.value);
              setPullStreamType(radioEvent.target.value);
            }}
            selectedValue={pullStreamType}
          >
            <Radio label="HLS" value="HLS" />
            <Radio label="FLV" value="FLV" />
            <Radio label="CMAF HLS" value="CMAF_HLS" />
            <Radio label="CMAF DASH" value="CMAF_DASH" />
          </RadioGroup>
        </div>
      </div>
      <div className="pr">
        <input
          defaultValue={pullStreamURLMap[pullStreamType]?.raw}
          className="pt-input"
        />
        <span className="qr-code">
          <img src={QRCodeImg} width="20" />
          <span className="qr-code-live">
            <QRCode
              level="L"
              value={pullStreamURLMap[pullStreamType]?.html || ""} //value参数为生成二维码的链接
              size={80} //二维码的宽高尺寸
              bgColor="#ffffff"
              fgColor="#000000" //二维码的颜色
            />
          </span>
        </span>
      </div>
    </>
  );
};

export default PullStream;
