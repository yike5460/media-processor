import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "pages/common/Header";
import Axios from "common/http";
import { StreamType } from "assets/types/types";

const List: React.FC = () => {
  const [loadingData, setLoadingData] = useState(true);
  const [videoList, setVideoList] = useState([]);

  useEffect(() => {
    setLoadingData(true);
    Axios.get("/videostreams")
      .then((res) => {
        setLoadingData(false);
        console.log(res);
        // const videoList = res.data.data;
        setVideoList(res?.data?.data || []);
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
              <span className="bp3-breadcrumb bp3-breadcrumb-current">
                直播管理
              </span>
            </li>
          </ul>
          {/* <div className="page-title">直播管理</div> */}
          <div className="blue-bg table-list">
            <table width="100%" className="bp3-html-table">
              <thead>
                <tr>
                  <th>直播ID</th>
                  <th>直播名称</th>
                  <th>直播描述</th>
                  <th>过期时间</th>
                  <th>查看详情</th>
                </tr>
              </thead>
              <tbody>
                {videoList.map((element: StreamType, index) => {
                  return (
                    <tr key={index}>
                      <td width="380">
                        {/* <b>*/}
                        <Link to={`/detail/${element.id}`}>{element.id}</Link>
                        {/* </b> */}
                        {/* {element.id} */}
                      </td>
                      <td>{element.videoname}</td>
                      <td>{element.description}</td>
                      <td width="160">{element.outdate}</td>
                      <td width="140">
                        <Link to={`/detail/${element.id}`}>查看详情</Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {/* <tfoot>
              <tr>
                <td colSpan={3}>Total</td>
                <td>1408</td>
              </tr>
            </tfoot> */}
            </table>
          </div>
        </div>
      )}
    </>
  );
};

export default List;
