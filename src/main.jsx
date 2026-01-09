import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { HashRouter } from "react-router-dom"; // HashRouter import කළා

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HashRouter> {/* App එක HashRouter එක ඇතුළට දැම්මා */}
      <App />
    </HashRouter>
  </React.StrictMode>
);