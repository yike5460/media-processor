import React, { useState, useEffect } from "react";
import { Checkbox } from "@blueprintjs/core";
import { RadioGroup, Radio } from "@blueprintjs/core";

import Header from "pages/common/Header";
import { RouteComponentProps } from "react-router-dom";
import Axios from "common/http";
import { StreamType } from "assets/types/types";

interface MatchParams {
  id: string;
}

enum ResolutionType {
  L360 = "360p",
  M480 = "480p",
  H720 = "720p",
  S1080 = "1080p",
}

enum WaterPrintEnum {
  TEXT = "TEXT",
  IMAGE = "IMAGE",
}

const Detail: React.FC<RouteComponentProps<MatchParams>> = (
  props: RouteComponentProps<MatchParams>
) => {
  const id: string = props.match.params.id;
  const [waterPrintType, setWaterPrintType] = useState<string>(
    WaterPrintEnum.TEXT
  );
  const [recordLevel, setRecordLevel] = useState<string>(ResolutionType.L360);
  const [loadingData, setLoadingData] = useState(true);
  const [curVideoData, setCurVideoData] = useState<StreamType>({
    id: "",
    key: "",
    videoname: "",
    description: "",
    outdate: "",
    isImage: false,
    isVideo: false,
    isOnDemand: false,
    isRelay: false,
    relayURL: "",
  });

  useEffect(() => {
    setLoadingData(true);
    Axios.get("/videostreams")
      .then((res) => {
        setLoadingData(false);
        console.log(res);
        const videoList = res.data?.data;
        if (videoList.length > 0) {
          const exactItem = videoList.find(
            (element: StreamType) => element.id === id
          );
          setCurVideoData(exactItem);
          console.info("exactItem:", exactItem);
        }
        // setVideoList(res?.data?.data || []);
      })
      .catch((error) => {
        setLoadingData(false);
        console.error("Error:", error);
      });
  }, []);

  return (
    <>
      <Header activePage="LIST" />
      {loadingData ? (
        <div className="app-loading">正在加载数据...</div>
      ) : (
        <div className="ls-pages">
          <ul className="bp3-breadcrumbs">
            <li>
              <a href="/#/" className="bp3-breadcrumb">
                首页
              </a>
            </li>
            <li>
              <a href="/#/list" className="bp3-breadcrumb">
                直播管理
              </a>
            </li>
            <li>
              <span className="bp3-breadcrumb bp3-breadcrumb-current">
                {curVideoData?.videoname}
              </span>
            </li>
          </ul>
          <div className="table-list">
            <div className="detail-item blue-bg">
              <div className="item-title">基本信息</div>
              <div className="detail-form">
                <div className="form-item flex">
                  <div className="form-label">直播ID：</div>
                  <div className="form-input">
                    <input
                      defaultValue={curVideoData?.id}
                      readOnly
                      className="pt-detail-input"
                      type="text"
                    />
                  </div>
                </div>
                <div className="form-item flex">
                  <div className="form-label">直播密钥：</div>
                  <div className="form-input">
                    <input
                      defaultValue={curVideoData?.key}
                      readOnly
                      className="pt-detail-input"
                      type="text"
                    />
                  </div>
                </div>
                <div className="form-item flex">
                  <div className="form-label">直播名称：</div>
                  <div className="form-input">
                    <input
                      value={curVideoData?.videoname}
                      onChange={(event) => {
                        setCurVideoData((data) => {
                          return { ...data, videoname: event.target.value };
                        });
                      }}
                      className="pt-detail-input"
                      type="text"
                    />
                  </div>
                </div>
                <div className="form-item flex">
                  <div className="form-label">直播描述：</div>
                  <div className="form-input">
                    <textarea
                      value={curVideoData?.description}
                      onChange={(event) => {
                        setCurVideoData((data) => {
                          return { ...data, description: event.target.value };
                        });
                      }}
                      rows={3}
                      className="pt-detail-input"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="detail-item blue-bg">
              <div className="item-title">视频录制</div>
              <div className="detail-form">
                <div className="form-item flex">
                  <div className="form-label">录制选项：</div>
                  <div className="form-input pt-10">
                    <Checkbox
                      checked={curVideoData?.isImage === true}
                      inline
                      label="截图"
                    />
                    <Checkbox
                      checked={curVideoData?.isVideo === true}
                      inline
                      label="MP4录制"
                    />
                    <Checkbox
                      checked={curVideoData?.isOnDemand === true}
                      inline
                      label="HLS录制"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="detail-item blue-bg">
              <div className="item-title">视频转码</div>
              <div className="detail-form">
                <div className="form-item flex">
                  <div className="form-label">转码率：</div>
                  <div className="form-input pt-10">
                    <RadioGroup
                      inline
                      onChange={(event) => {
                        const radioEvent =
                          event as React.ChangeEvent<HTMLInputElement>;
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
              </div>
            </div>

            <div className="detail-item blue-bg">
              <div className="item-title">视频水印</div>
              <div className="detail-form">
                <div className="form-item flex">
                  <div className="form-label">水印类型：</div>
                  <div className="form-input pt-10">
                    <RadioGroup
                      inline
                      onChange={(event) => {
                        const radioEvent =
                          event as React.ChangeEvent<HTMLInputElement>;
                        // console.info(event.target.value);
                        setWaterPrintType(radioEvent.target.value);
                      }}
                      selectedValue={waterPrintType}
                    >
                      <Radio label="文字水印" value={WaterPrintEnum.TEXT} />
                      <Radio label="图片水印" value={WaterPrintEnum.IMAGE} />
                    </RadioGroup>
                    <div>
                      {waterPrintType === WaterPrintEnum.IMAGE && (
                        <div className="pr flex water-settings">
                          <div className="item">
                            <label>图片URL:</label>
                            <div>
                              <input
                                placeholder="http://link/abc.jpg"
                                className="pt-input .modifier pr-10"
                                type="text"
                              />
                            </div>
                          </div>
                          <div className="item">
                            <label>图片宽度:</label>
                            <div>
                              <input
                                placeholder="100px"
                                className="pt-input .modifier pr-10"
                                type="text"
                              />
                            </div>
                          </div>
                          <div className="item">
                            <label>图片高度:</label>
                            <div>
                              <input
                                placeholder="50px"
                                className="pt-input .modifier pr-10"
                                type="text"
                              />
                            </div>
                          </div>
                          <div className="item">
                            <label>上间距:</label>
                            <div>
                              <input
                                placeholder="40px"
                                className="pt-input .modifier pr-10"
                                type="text"
                              />
                            </div>
                          </div>
                          <div className="item">
                            <label>左间距:</label>
                            <div>
                              <input
                                placeholder="70px"
                                className="pt-input .modifier pr-10"
                                type="text"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                      {waterPrintType === WaterPrintEnum.TEXT && (
                        <div className="pr flex water-settings">
                          <div className="item">
                            <label>水印文字:</label>
                            <div>
                              <input
                                placeholder="例:亚马逊云科技"
                                className="pt-input .modifier pr-10"
                                type="text"
                              />
                            </div>
                          </div>
                          <div className="item">
                            <label>文字大小:</label>
                            <div>
                              <input
                                placeholder="18px"
                                className="pt-input .modifier pr-10"
                                type="text"
                              />
                            </div>
                          </div>
                          <div className="item">
                            <label>文字颜色:</label>
                            <div>
                              <input
                                placeholder="#CDCDCD"
                                className="pt-input .modifier pr-10"
                                type="text"
                              />
                            </div>
                          </div>
                          <div className="item">
                            <label>上间距:</label>
                            <div>
                              <input
                                placeholder="40px"
                                className="pt-input .modifier pr-10"
                                type="text"
                              />
                            </div>
                          </div>
                          <div className="item">
                            <label>左间距:</label>
                            <div>
                              <input
                                placeholder="60px"
                                className="pt-input .modifier pr-10"
                                type="text"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="detail-item blue-bg">
              <div className="item-title">视频中继</div>
              <div className="detail-form">
                <div className="form-item flex">
                  <div className="form-label">转播地址：</div>
                  <div className="form-input">
                    <input
                      placeholder="请输入转播地址"
                      className="pt-detail-input"
                      type="text"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="detail-button text-right">
              <button>保存</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Detail;
