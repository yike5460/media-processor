import React, {
  useState,
  useRef,
  useEffect,
  useContext,
  useCallback,
} from "react";
import ReactPlayer from "react-player/file";
import { DanMuType } from "assets/types/types";
import WSContext from "context/WSContext";
import Danmaku from "rc-danmaku";

interface VideoDanMuProps {
  videoUrl: string;
}

const VideoDanMu: React.FC<VideoDanMuProps> = (props: VideoDanMuProps) => {
  const { videoUrl } = props;
  const danmakuInsRef = useRef<Danmaku | null>(null);
  const webSocket = useContext<any>(WSContext);
  const [danmuObj, setDanmuObj] = useState<DanMuType>();

  useEffect(() => {
    const danmakuIns = new Danmaku(".danmaku-wrapper");
    danmakuInsRef.current = danmakuIns;
  }, []);

  const sendDanMu = (content: string) => {
    if (danmakuInsRef.current) {
      danmakuInsRef.current.push(content);
    }
  };

  const addDanMu = useCallback(
    (wsContent) => {
      if (wsContent && wsContent.content) {
        console.info("wsContent.content:", wsContent.content);
        sendDanMu(wsContent.content);
        // setDanmuObj(wsContent);
      }
    },
    [danmuObj]
  );

  // receive messages
  useEffect(() => {
    console.info("LIVE VIDEO webSocket:", webSocket);
    if (webSocket?.data) {
      const { message } = webSocket?.data;
      const wsContent = message;
      setDanmuObj(wsContent);
      addDanMu(wsContent);
    }
  }, [webSocket?.data]);

  return (
    <div>
      <div className="player-wrapper">
        {/* <button
          style={{ zIndex: 999, position: "absolute" }}
          className="ml-5"
          type="button"
          onClick={(): void => {
            if (danmakuInsRef.current) {
              webSocket?.send({
                videoId: "123",
                userName: "admin",
                content: "双击666",
              });
            }
          }}
        >
          {"弹"}
        </button> */}
        {/* {videoUrl} */}
        <div className="ws-status">
          {webSocket?.readyState ? (
            <span className="online"></span>
          ) : (
            <span className="offline"></span>
          )}
        </div>
        <div className="danmu-outer">
          <div className="danmaku-wrapper" />
        </div>
        <ReactPlayer
          playsinline={true}
          muted={true}
          fluid={false}
          width="100%"
          height={window.screen.height * 0.32 - 30}
          className="react-player"
          playing={true}
          controls
          url={videoUrl}
        />
      </div>
    </div>
  );
};

export default VideoDanMu;
