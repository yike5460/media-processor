import React, { useContext, useEffect, useState } from "react";
// import useWebSocketLite from "hooks/useWebSocketHook";
import { RouteComponentProps } from "react-router-dom";
import { RadioGroup, Radio } from "@blueprintjs/core";

import Header from "pages/common/Header";
import VideoDanMu from "pages/common/VideoDanMu";

import { DanMuType } from "assets/types/types";
import WSContext from "context/WSContext";
import AppContext from "context/AppContext";

interface MatchParams {
  id: string;
}

const LIVE_VIDEO_TYPE_ID = "__LIVE_VIDEO_TYPE_ID__";

const Live: React.FC<RouteComponentProps<MatchParams>> = (
  props: RouteComponentProps<MatchParams>
) => {
  const defaultType = localStorage.getItem(LIVE_VIDEO_TYPE_ID) || "";
  const id: string = props.match.params.id;
  const webSocket = useContext<any>(WSContext);
  const appConfig = useContext(AppContext);

  const [userName, setUserName] = useState("");
  const [userComments, setUserComments] = useState("");

  const [liveVideoType, setLiveVideoType] = useState(
    defaultType ? defaultType : "HLS"
  );

  const [videoUrl, setVideoUrl] = useState("");
  console.info("appConfig:appConfig:", appConfig);
  useEffect(() => {
    console.info("useEffectappConfig:appConfig:", appConfig);
    localStorage.setItem(LIVE_VIDEO_TYPE_ID, liveVideoType);
    if (liveVideoType === "FLV") {
      // setVideoUrl(
      //   "http://video-streaming-origin-lb-1110293271.cn-northwest-1.elb.amazonaws.com.cn/a3569ad5-4a4a-4cf0-b9ea-6443c2cb6925/live.flv"
      // );
      setVideoUrl(`http://${appConfig?.pullDNS}/${id}/live.flv`);
    } else {
      // setVideoUrl(
      //   "http://video-streaming-origin-lb-1110293271.cn-northwest-1.elb.amazonaws.com.cn/a3569ad5-4a4a-4cf0-b9ea-6443c2cb6925/live.m3u8"
      // );
      setVideoUrl(`http://${appConfig?.pullDNS}/${id}/live.m3u8`);
    }
  }, [liveVideoType, appConfig]);

  const sendData = () => {
    if (!userName) {
      alert("请输入用户名");
      return;
    }
    if (!userComments) {
      alert("请填写您想说的话");
      return;
    }
    const userComment: DanMuType = {
      videoId: id,
      userName: userName,
      content: userComments,
    };
    const message = JSON.stringify(userComment);
    if (message) {
      webSocket?.send(userComment);
      setUserComments("");
    }
  };

  return (
    <>
      <Header hideMenu={true} activePage="LIVE" />
      <div className="ls-pages">
        <div className="live-wrap pr">
          <div className="video">
            <VideoDanMu videoUrl={videoUrl} />
          </div>
          <div className="flex flex-row">
            {/* <div className="mr-10">视频格式:</div> */}
            <div>
              <RadioGroup
                inline
                onChange={(event) => {
                  const radioEvent =
                    event as React.ChangeEvent<HTMLInputElement>;
                  // console.info(event.target.value);
                  setLiveVideoType(radioEvent.target.value);
                }}
                selectedValue={liveVideoType}
              >
                <Radio label="HLS(手机用户)" value="HLS" />
                <Radio label="FLV(电脑用户)" value="FLV" />
              </RadioGroup>
            </div>
          </div>
          <div className="comment">
            <div className="label">用户名: </div>
            <div className="input">
              <input
                className="pt-input"
                type="text"
                value={userName}
                onChange={(event) => {
                  setUserName(event.target.value);
                }}
              />
            </div>
          </div>
          <div className="comment">
            <div className="label">说点什么: </div>
            <div className="input">
              <textarea
                rows={4}
                className="pt-input"
                // type="text"
                value={userComments}
                onChange={(event) => {
                  setUserComments(event.target.value);
                }}
              />
            </div>
          </div>
          <div className="button">
            <button onClick={sendData}>发送</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Live;
