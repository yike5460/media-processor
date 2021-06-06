import React, { useContext, useState } from "react";
// import useWebSocketLite from "hooks/useWebSocketHook";
import { RouteComponentProps } from "react-router-dom";

import Header from "pages/common/Header";
import VideoDanMu from "pages/common/VideoDanMu";

import { DanMuType } from "assets/types/types";
import WSContext from "context/WSContext";
import AppContext from "context/AppContext";

interface MatchParams {
  id: string;
}

const Live: React.FC<RouteComponentProps<MatchParams>> = (
  props: RouteComponentProps<MatchParams>
) => {
  const id: string = props.match.params.id;
  const webSocket = useContext<any>(WSContext);
  const appConfig = useContext(AppContext);

  const [userName, setUserName] = useState("");
  const [userComments, setUserComments] = useState("");
  const videoId = "123";

  const sendData = () => {
    const userComment: DanMuType = {
      videoId: videoId,
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
            <VideoDanMu
              videoUrl={`http://${appConfig?.pullDNS}/${id}/live.flv`}
            />
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
