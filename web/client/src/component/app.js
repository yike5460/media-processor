import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import './App.css';
import Login from './login';
import Navbar from './navbar';
import useToken from './useToken';

function App() {

  const { token, setToken } = useToken();

  if(!token) {
    return <Login setToken={setToken} />
  }

  return (
    <div className="wrapper">
      <BrowserRouter>
        <Switch>
          <Route path="/">
            <Navbar />
          </Route>
        </Switch>
      </BrowserRouter>
    </div>
  );
}

export default App;