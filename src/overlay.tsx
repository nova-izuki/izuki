import React from "react";
import ReactDOM from "react-dom/client";
import { OverlayCanvas } from "./components/OverlayCanvas";
import { Recover, logUncaught } from "./components/Recover";
import "./styles.css";

// Nothing in the overlay should ever show the webview's own menus or selection.
window.addEventListener("contextmenu", (e) => e.preventDefault());
window.addEventListener("dragstart", (e) => e.preventDefault());
logUncaught("overlay");

ReactDOM.createRoot(document.getElementById("overlay-root")!).render(
  <React.StrictMode>
    <Recover name="overlay" silent>
      <OverlayCanvas />
    </Recover>
  </React.StrictMode>
);
