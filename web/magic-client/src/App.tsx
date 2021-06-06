import React, { useState, useEffect } from "react";
import "./App.scss";
import { HashRouter as Router, Route, Switch } from "react-router-dom";
import Axios from "common/http";
import Home from "pages/home/Home";
import Login from "pages/login/Login";
import List from "pages/list/List";
import Live from "pages/live/Live";
import Detail from "pages/detail/Detail";
import Settings from "pages/settings/Settings";

import "@blueprintjs/core/lib/css/blueprint.css";

import AppContext from "context/AppContext";
import WSContext from "context/WSContext";
import { AppConfigType } from "assets/types/types";
import useWebSocketLite from "hooks/useWebSocketHook";

function App(): JSX.Element {
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [appConfig, setAppConfig] = useState<AppConfigType>();

  const ws = useWebSocketLite({
    socketUrl: "ws://localhost:8080",
  });

  useEffect(() => {
    setLoadingConfig(true);
    Axios.get("/streamdns").then((res) => {
      // setTimeout(() => {
      setLoadingConfig(false);
      // }, 2000);
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
          <WSContext.Provider value={ws}>
            <Switch>
              <Route exact path="/" component={Home} />
              <Route exact path="/login" component={Login} />
              <Route exact path="/list" component={List} />
              <Route exact path="/live/:id" component={Live} />
              <Route exact path="/detail/:id" component={Detail} />
              <Route exact path="/settings" component={Settings} />
            </Switch>
          </WSContext.Provider>
        </AppContext.Provider>
      </Router>
    </div>
  );
}

export default App;
