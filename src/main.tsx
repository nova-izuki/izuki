import React from "react";
import ReactDOM from "react-dom/client";
import { GlassConfigPanel } from "./components/GlassConfigPanel";
import "./styles.css";

// The panel is chrome-less; stop the webview's own context menu and the
// browser drag-select from ever showing up on the glass.
window.addEventListener("contextmenu", (e) => e.preventDefault());
window.addEventListener("dragover", (e) => e.preventDefault());
window.addEventListener("drop", (e) => e.preventDefault());

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <GlassConfigPanel />
  </React.StrictMode>
);
