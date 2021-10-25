import React from "react";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

import TimeChart from "./components/TimeChart";

function App() {
  return (
    <Router>
      <nav className="navbar navbar-expand navbar-dark bg-dark">
        <a href="/chart" className="navbar-brand">
          CAATS 
        </a>
        <div className="navbar-nav mr-auto">
          <li className="nav-item">
            <Link to={"/chart"} className="nav-link">
              TimeSeriesChart
            </Link>
          </li>
        </div>
      </nav>

      <div className="mt-3">
        <Switch>
          <Route exact path={["/", "/chart"]} component={TimeChart} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;
