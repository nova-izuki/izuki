import React from "react";
import ReactDOM from "react-dom/client";
import { GlassConfigPanel } from "./components/GlassConfigPanel";
import { Recover, logUncaught } from "./components/Recover";
import "./styles.css";

// The panel is chrome-less; stop the webview's own context menu and the
// browser drag-select from ever showing up on the glass.
window.addEventListener("contextmenu", (e) => e.preventDefault());
window.addEventListener("dragover", (e) => e.preventDefault());
window.addEventListener("drop", (e) => e.preventDefault());
logUncaught("panel");

// WebView2 can lose the panel's painted layers after a while (sleep, a
// locked screen, a graphics driver hiccup): only the colour blobs stay and
// the window looks empty. Nudging the page onto a fresh layer and back
// makes it paint everything again — done whenever you come back to it.
let lastRepaint = 0;
function repaint() {
  const now = Date.now();
  if (now - lastRepaint < 1500) return;
  lastRepaint = now;
  const root = document.getElementById("root");
  if (!root) return;
  root.style.transform = "translateZ(0)";
  requestAnimationFrame(() => requestAnimationFrame(() => (root.style.transform = "")));
}
window.addEventListener("focus", repaint);
document.addEventListener("visibilitychange", () => document.visibilityState === "visible" && repaint());
document.documentElement.addEventListener("pointerenter", repaint);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Recover name="panel">
      <GlassConfigPanel />
    </Recover>
  </React.StrictMode>
);
