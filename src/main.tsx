import React from "react";
import ReactDOM from "react-dom/client";
import App from "./GameApp";
import "./styles.css";
import "./screens.css";
import "./polish.css";
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
