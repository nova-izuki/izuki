import React from "react";
import ReactDOM from "react-dom/client";
import { OverlayCanvas } from "./components/OverlayCanvas";
import { AirHost } from "./components/AirControl";
import { RemoteBadge } from "./components/RemoteBadge";
import { Recover, logUncaught } from "./components/Recover";
import "./styles.css";
import "./lib/escapeStop";

// Nothing in the overlay should ever show the webview's own menus or selection.
window.addEventListener("contextmenu", (e) => e.preventDefault());
window.addEventListener("dragstart", (e) => e.preventDefault());
logUncaught("overlay");

ReactDOM.createRoot(document.getElementById("overlay-root")!).render(
  <React.StrictMode>
    <Recover name="overlay" silent>
      <OverlayCanvas />
    </Recover>
    {/* Air control in every overlay mode (see AirHost). */}
    <Recover name="air" silent>
      <AirHost />
    </Recover>
    {/* "📱 … is controlling this PC · End" — never a silent remote session. */}
    <Recover name="remote" silent>
      <RemoteBadge />
    </Recover>
  </React.StrictMode>
);
