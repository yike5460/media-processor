import React, { useContext, useState, useEffect } from "react";
import { RadioGroup, Radio } from "@blueprintjs/core";
import { StreamType } from "assets/types/types";
import AppContext from "context/AppContext";

interface TransCodePropType {
  streamData: StreamType | undefined;
}

enum ResolutionType {
  L360 = "360p",
  M480 = "480p",
  H720 = "720p",
  S1080 = "1080p",
}

const TransCodeStream: React.FC<TransCodePropType> = (
  props: TransCodePropType
): JSX.Element => {
  const { streamData } = props;
  const [recordLevel, setRecordLevel] = useState<string>(ResolutionType.L360);
  const appConfig = useContext(AppContext);
  const [transCodeUrl, setTransCodeUrl] = useState("");
  useEffect(() => {
    setTransCodeUrl(
      `http://${appConfig?.pullDNS}/${streamData?.id}/${recordLevel}/index.m3u8`
    );
  }, [streamData, recordLevel]);

  return (
    <>
      <div className="flex mt-10">
        <div className="mr-10">
          <b>视频转码</b>
        </div>
        <div className="flex1">
          <RadioGroup
            inline
            onChange={(event) => {
              const radioEvent = event as React.ChangeEvent<HTMLInputElement>;
              // console.info(event.target.value);
              setRecordLevel(radioEvent.target.value);
            }}
            selectedValue={recordLevel}
          >
            <Radio label="流畅" value={ResolutionType.L360} />
            <Radio label="标清" value={ResolutionType.M480} />
            <Radio label="高清" value={ResolutionType.H720} />
            <Radio label="超清" value={ResolutionType.S1080} />
          </RadioGroup>
        </div>
      </div>
      <div className="pr">
        <input
          defaultValue={transCodeUrl}
          disabled
          className="pt-input pr-60"
        />
        <span className="qr-code">{recordLevel}</span>
      </div>
    </>
  );
};

export default TransCodeStream;
