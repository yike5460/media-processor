import React from "react";
import Logo from "assets/images/logo.svg";
import { Link } from "react-router-dom";

interface HeaderProps {
  activePage: string;
  hideMenu?: boolean;
}

const Header: React.FC<HeaderProps> = (props: HeaderProps) => {
  const { hideMenu, activePage } = props;
  return (
    <div className="ls-header">
      <img src={Logo} width="30" />
      <div className="ls-logo">
        <span className="s-name">亚马逊云科技低延迟直播方案</span>
      </div>
      {!hideMenu && (
        <nav className="nav">
          <Link className={activePage === "HOME" ? "active" : ""} to="/">
            首页
          </Link>
          <Link className={activePage === "LIST" ? "active" : ""} to="/list">
            直播管理
          </Link>
          <Link
            className={activePage === "SETTING" ? "active" : ""}
            to="/settings"
          >
            系统设置
          </Link>
        </nav>
      )}
    </div>
  );
};

export default Header;
