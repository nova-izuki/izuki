import React from "react";
import ReactDOM from "react-dom/client";
import { Mate } from "./components/Mate";
import { Recover, logUncaught } from "./components/Recover";
import "./styles.css";

// The mate's window shows nothing of the webview's own: no menus, no selection.
window.addEventListener("dragstart", (e) => e.preventDefault());
logUncaught("mate");

ReactDOM.createRoot(document.getElementById("mate-root")!).render(
  <React.StrictMode>
    <Recover name="mate" silent>
      <Mate />
    </Recover>
  </React.StrictMode>
);
