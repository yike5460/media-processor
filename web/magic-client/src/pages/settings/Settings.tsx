import React, { useState, useEffect } from "react";
import Header from "pages/common/Header";
import Axios from "common/http";
import { AppConfigType } from "assets/types/types";

const Settings: React.FC = (): JSX.Element => {
  const [loadingData, setLoadingData] = useState(true);
  const [systemConfig, setSystemConfig] = useState<AppConfigType>({
    pushDNS: "",
    pullDNS: "",
  });

  useEffect(() => {
    setLoadingData(true);
    Axios.get("/streamdns").then((res) => {
      // setTimeout(() => {
      setLoadingData(false);
      // }, 2000);
      console.info("RES:", res);
      setSystemConfig(res.data.data);
    });
  }, []);

  const udpateSystemConfig = () => {
    Axios.post("/streamdns", systemConfig)
      .then((res) => {
        console.info("res:", res);
        console.info("SUCCESS");
      })
      .catch((error) => {
        console.error(error);
      });
  };

  return (
    <>
      <Header activePage="SETTING" />
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
              <span className="bp3-breadcrumb bp3-breadcrumb-current">
                系统设置
              </span>
            </li>
          </ul>
          <div className="table-list">
            <div className="detail-item blue-bg pb-20">
              <div className="item-title">系统设置</div>
              <div className="detail-form">
                <div className="form-item flex">
                  <div className="form-label">推流域名：</div>
                  <div className="form-input">
                    <input
                      value={systemConfig?.pushDNS}
                      onChange={(event) => {
                        setSystemConfig((data) => {
                          return { ...data, pushDNS: event.target.value };
                        });
                      }}
                      className="pt-detail-input"
                      type="text"
                    />
                  </div>
                </div>
                <div className="form-item flex">
                  <div className="form-label">拉流域名：</div>
                  <div className="form-input">
                    <input
                      value={systemConfig?.pullDNS}
                      onChange={(event) => {
                        setSystemConfig((data) => {
                          return { ...data, pullDNS: event.target.value };
                        });
                      }}
                      type="text"
                      className="pt-detail-input"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="detail-button text-right">
              <button
                onClick={() => {
                  udpateSystemConfig();
                }}
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Settings;
