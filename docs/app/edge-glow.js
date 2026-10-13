// Glowing screen edges while Izuki is with you — the same as the PC
// (src/components/EdgeGlow.tsx). Listening: calm cyan, slowly drifting.
// Thinking: every colour, flowing fast. Talking: swells with each word.
// Idle: fades away and nothing is left running.
//
//   IzukiEdge.mode("listening")  idle | listening | thinking | speaking
//   IzukiEdge.level(0.4)         a live sound level, 0..1
//   IzukiEdge.enabled(false)     the setting (saved as izuki.edgeGlow)
//
// Cheap on purpose: thin strips whose colours only slide (transform — the
// graphics chip moves them, nothing repaints), no blur filters.
(() => {
  "use strict";
  const VIVID = "#5EE7FF, #7C5CFF, #FF5CAA, #FFB547, #4ECDC4, #5EE7FF";
  const CALM = "#5EE7FF, #3BB8FF, #8FF5FF, #4ECDC4, #5EE7FF";
  const SPEED = { listening: 1, thinking: 3.2, speaking: 1.6 };
  const LOOP_MS = 9000;
  const FADE_MS = 650;
  const KEY = "izuki.edgeGlow";
  let on = true;
  try { on = localStorage.getItem(KEY) !== "0"; } catch {}
  const still = !!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  let root = null, layers = null, anims = [], mode = "idle", hideTimer = 0, fadeIn = 0;

  const build = () => {
    root = document.createElement("div");
    root.setAttribute("aria-hidden", "true");
    root.style.cssText = `position:fixed;inset:0;pointer-events:none;z-index:2147483000;overflow:hidden;opacity:0;transition:opacity ${FADE_MS}ms ease`;
    layers = { calm: layer(CALM), vivid: layer(VIVID) };
    root.append(layers.calm, layers.vivid);
    document.body.append(root);
    if (!still) {
      anims = [...root.querySelectorAll("[data-flow]")].map((band) => {
        const v = band.dataset.flow === "y", back = band.dataset.back === "1";
        const a = back ? "-50%" : "0%", b = back ? "0%" : "-50%";
        const tr = (x) => (v ? `translateY(${x})` : `translateX(${x})`);
        return band.animate([{ transform: tr(a) }, { transform: tr(b) }], { duration: LOOP_MS, iterations: Infinity });
      });
    }
  };

  const layer = (colors) => {
    const el = document.createElement("div");
    el.style.cssText = "position:absolute;inset:0;transition:opacity 500ms ease";
    for (const side of ["top", "right", "bottom", "left"]) el.append(...edge(side, colors));
    return el;
  };

  const edge = (side, colors) => {
    const vertical = side === "left" || side === "right";
    const back = side === "bottom" || side === "left";
    const dir = vertical ? "to bottom" : "to right";
    const inward = { top: "to bottom", bottom: "to top", left: "to right", right: "to left" }[side];
    const band = () => {
      const b = document.createElement("div");
      b.dataset.flow = vertical ? "y" : "x";
      b.dataset.back = back ? "1" : "0";
      const rest = colors.split(", ").slice(1).join(", ");
      b.style.cssText = `position:absolute;left:0;top:0;width:${vertical ? "100%" : "200%"};height:${vertical ? "200%" : "100%"};background:linear-gradient(${dir}, ${colors}, ${rest});will-change:transform`;
      return b;
    };
    const span = vertical ? `top:0;bottom:0;${side}:0;` : `left:0;right:0;${side}:0;`;
    const glow = document.createElement("div");
    const fadeIn = `linear-gradient(${inward}, #000 0%, rgba(0,0,0,.45) 30%, transparent 100%)`;
    const fadeEnds = `linear-gradient(${dir}, transparent 0, #000 70px, #000 calc(100% - 70px), transparent 100%)`;
    glow.style.cssText = `position:absolute;overflow:hidden;${span}${vertical ? "width" : "height"}:34px;` +
      `opacity:calc(var(--izk-bright, .6) * .55);transform:${vertical ? "scaleX" : "scaleY"}(var(--izk-swell, 1));transform-origin:${side};` +
      `transition:transform 110ms linear, opacity 110ms linear;` +
      `-webkit-mask-image:${fadeIn}, ${fadeEnds};mask-image:${fadeIn}, ${fadeEnds};-webkit-mask-composite:source-in;mask-composite:intersect`;
    glow.append(band());
    const line = document.createElement("div");
    line.style.cssText = `position:absolute;overflow:hidden;${span}${vertical ? "width" : "height"}:3px`;
    line.append(band());
    return [glow, line];
  };

  const show = (m) => {
    clearTimeout(hideTimer);
    if (!root) build();
    const vivid = m !== "listening";
    layers.calm.style.opacity = vivid ? "0" : "1";
    layers.vivid.style.opacity = vivid ? "1" : "0";
    for (const a of anims) {
      if (a.playState === "paused") a.play();
      if (a.updatePlaybackRate) a.updatePlaybackRate(SPEED[m]); else a.playbackRate = SPEED[m];
    }
    cancelAnimationFrame(fadeIn);
    fadeIn = requestAnimationFrame(() => root && (root.style.opacity = "1"));
  };

  const hide = () => {
    cancelAnimationFrame(fadeIn);
    if (!root) return;
    root.style.opacity = "0";
    clearTimeout(hideTimer);
    // Gone for good once faded: nothing keeps running while Izuki is quiet.
    hideTimer = setTimeout(() => {
      anims.forEach((a) => a.cancel());
      anims = [];
      root?.remove();
      root = layers = null;
    }, FADE_MS);
  };

  window.IzukiEdge = {
    mode(m) {
      mode = SPEED[m] ? m : "idle";
      if (on && mode !== "idle") show(mode); else hide();
    },
    level(v) {
      if (!root || !Number.isFinite(v)) return;
      const l = Math.max(0, Math.min(1, v));
      root.style.setProperty("--izk-swell", (1 + l * 1.6).toFixed(3));
      root.style.setProperty("--izk-bright", (0.55 + l * 0.45).toFixed(3));
    },
    enabled(v) {
      if (v === undefined) return on;
      on = !!v;
      try { localStorage.setItem(KEY, on ? "1" : "0"); } catch {}
      this.mode(mode);
      return on;
    },
  };
})();
