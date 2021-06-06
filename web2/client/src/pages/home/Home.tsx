import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";

import Clock from "react-live-clock";
import { Icon } from "@blueprintjs/core";
import Axios from "common/http";
import AppContext from "context/AppContext";
import WSContext from "context/WSContext";

import Header from "pages/common/Header";
import { DanMuType, StreamType } from "assets/types/types";
import LiveVideoItem from "./comps/LiveVideoItem";

const Home: React.FC = (): JSX.Element => {
  const [loadingVideo, setLoadingVideo] = useState(true);

  const [streamList, setStreamList] = useState([]);
  const appConfig = useContext(AppContext);
  const webSocket = useContext<any>(WSContext);

  console.info("appConfig:", appConfig);
  const [firstVideo, setfirstVideo] = useState();
  const [secondVideo, setSecondVideo] = useState();

  const [commentList, setCommentList] = useState<DanMuType[]>([]);

  const [curMessage, setCurMessage] = useState<any>();

  // receive messages
  useEffect(() => {
    // console.info("HOMEHOME webSocket:", webSocket);
    if (webSocket?.data) {
      const { message } = webSocket?.data;
      setCurMessage(message);
      const wsContent = message;
      if (wsContent && wsContent.content) {
        setCommentList((prev: DanMuType[]) => {
          return [wsContent, ...prev];
        });
      }
    }
  }, [webSocket?.data]);

  useEffect(() => {
    setLoadingVideo(true);
    Axios.get("/videostreams")
      .then((res) => {
        setLoadingVideo(false);
        console.log(res);
        const videoList = res.data.data;
        setStreamList(videoList);
        if (videoList && videoList.length == 1) {
          setfirstVideo(videoList[0]);
        }
        if (videoList && videoList.length >= 2) {
          setfirstVideo(videoList[0]);
          setSecondVideo(videoList[1]);
        }
      })
      .catch((error) => {
        setLoadingVideo(false);
        console.error("Error:", error);
      });
  }, []);

  // if (loadingVideo) {
  //   return <div className="app-loading">正在加载数据...</div>;
  // }

  return (
    <>
      <Header activePage="HOME" />
      {loadingVideo ? (
        <div className="app-loading">正在加载数据...</div>
      ) : (
        <div className="ls-pages">
          <div className="ls-main-wrap">
            <div className="ls-left flex flex-col">
              <div className="time box">
                <div className="box-title">当前时间</div>
                <div className="clock">
                  <Clock format="HH:mm:ss" interval={1000} ticking={true} />
                </div>
              </div>
              <div className="ls-l-video box flex flex-col">
                <div className="box-title">
                  <Icon icon="mobile-video" /> 频道列表
                </div>
                <div className="pr flex1">
                  <div className="flex-overflow">
                    {streamList.map((element: StreamType, index) => {
                      return (
                        <div key={index} className="channel-item">
                          <div className="icon">
                            <Link to={`/live/${element.id}`}>
                              <Icon iconSize={40} color="#999" icon="video" />
                            </Link>
                          </div>
                          <div className="info">
                            <div>
                              <b>
                                <Link to={`/detail/${element.id}`}>
                                  {element.videoname}
                                </Link>
                              </b>
                            </div>
                            <div className="desc">{element.description}</div>
                            <div className="expire">
                              过期时间:{element.outdate}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="ls-statistic  flex flex-row">
                <div className="views box flex1 mr-10">
                  <div className="box-title">总在线人数</div>
                  {/* {JSON.stringify(curMessage)} */}
                  <div className="number">{curMessage?.clientCount || 0}</div>
                </div>
                <div className="comments flex1 box">
                  <div className="box-title">用户评论</div>
                  <div className="number">{commentList.length}</div>
                </div>
              </div>
              <div className="ls-l-comments box flex flex-col">
                <div className="box-title">
                  <Icon icon="chat" /> 用户评论列表
                </div>
                <div className="pr flex1">
                  <div className="flex-overflow">
                    {commentList.map((element, index) => {
                      return (
                        <div key={index} className="comment-item">
                          <div className="icon">
                            <Icon color="#ccc" icon="mugshot" iconSize={26} />
                          </div>
                          <div className="info">
                            <div>
                              <b>{element.userName}</b>
                            </div>
                            <div className="desc">{element.content}</div>
                            <div className="p-time">刚刚</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
            <div className="ls-main">
              <LiveVideoItem
                streamData={firstVideo}
                icon="mobile-video"
                title="现场直播画面"
                srcType="LIVE"
              />
              <LiveVideoItem
                streamData={secondVideo}
                icon="film"
                title="通过OBS推流画面"
                srcType="OBS"
              />
            </div>
            {/* <div className="ls-right">
              <div className="views box">
                <div className="box-title">总在线人数</div>
                <div className="number">128</div>
              </div>
              <div className="comments box">
                <div className="box-title">用户评论</div>
                <div className="number">{commentList.length + 1}</div>
              </div>
              <div className="comments box">
                <div className="box-title">扫码观看直播互动</div>
                <div className="number">23</div>
              </div>
              <div className="comments box">
                <div className="box-title">分享次数</div>
                <div className="number">23</div>
              </div>
              <div className="feelings box">
                <div>😄：100，😔：300</div>
              </div>
            </div> */}
          </div>
        </div>
      )}
    </>
  );
};

export default Home;
