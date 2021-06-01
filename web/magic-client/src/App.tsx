import React, { useState, useEffect } from "react";
import "./App.scss";
import { HashRouter as Router, Route, Link, Switch } from "react-router-dom";
import Axios from "common/http";
import Home from "pages/home/Home";
import Login from "pages/login/Login";
import Settings from "pages/settings/Settings";
import Logo from "assets/images/logo.svg";
import "@blueprintjs/core/lib/css/blueprint.css";

import AppContext from "context/AppContext";
import { AppConfigType } from "assets/types/types";

function App(): JSX.Element {
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [appConfig, setAppConfig] = useState<AppConfigType>();

  useEffect(() => {
    setLoadingConfig(true);
    Axios.get("/streamdns").then((res) => {
      setLoadingConfig(false);
      console.info("RES:", res);
      setAppConfig(res.data.data);
    });
  }, []);

  if (loadingConfig) {
    return (
      <div className="app-loading">欢迎使用亚马逊云科技低延迟直播方案</div>
    );
  }

  return (
    <div className="App bp3-dark">
      <Router>
        <AppContext.Provider value={appConfig}>
          <div className="ls-header">
            <img src={Logo} width="30" />
            <div className="ls-logo">
              <span className="s-name">亚马逊云科技低延迟直播方案</span>
            </div>
            <nav className="nav">
              <Link to="/">首页</Link>
              {/* <Link to="/login">Login</Link> */}
              <Link to="/settings">系统设置</Link>
            </nav>
          </div>
          <div className="ls-pages">
            <Switch>
              <Route exact path="/" component={Home} />
              <Route exact path="/login" component={Login} />
              <Route exact path="/settings" component={Settings} />
            </Switch>
          </div>
        </AppContext.Provider>
      </Router>
    </div>
  );
}

export default App;
