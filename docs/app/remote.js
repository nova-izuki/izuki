// The phone as a remote for the PC (the PC side is src-tauri/src/remote.rs),
// through the private link the phone already has to its PC.
//
//   IzukiRemote.open(pcLink)    show it (full screen); ✕ closes it
//
// A live look at the PC's screen (tap it: the pointer goes there and
// clicks), a trackpad (slide to move, tap to click, two fingers to scroll or
// right-click, press and hold to drag), typing, keys and music buttons.
// The PC must have "Let my phone control this PC" switched on.
(() => {
  "use strict";
  let root = null, base = "", live = true, shotTimer = 0, shotUrl = "", inFlight = false;
  let pend = { dx: 0, dy: 0 };
  /** A held button (press-and-hold drag): always let go of it, never leave it down on the PC. */
  let dragging = false;
  function releaseDrag() {
    if (!dragging) return;
    dragging = false;
    void send({ op: "up", button: "left" });
  }
  addEventListener("pagehide", releaseDrag);
  document.addEventListener("visibilitychange", () => { if (document.hidden) releaseDrag(); });
  const $ = (sel) => root.querySelector(sel);

  const css = `
  .izr{position:fixed;inset:0;z-index:2147482000;background:#0b0d16;color:#fff;display:flex;flex-direction:column;font:14px system-ui,-apple-system,Segoe UI,sans-serif}
  .izr header{display:flex;align-items:center;gap:8px;padding:10px 12px;padding-top:max(10px,env(safe-area-inset-top))}
  .izr header b{flex:1;font-size:16px}
  .izr button{background:rgba(255,255,255,.1);color:#fff;border:1px solid rgba(255,255,255,.14);border-radius:12px;padding:10px 12px;font:inherit;font-weight:600;touch-action:manipulation}
  .izr button:active{background:rgba(94,231,255,.3)}
  .izr .shot{position:relative;margin:0 12px;border-radius:12px;overflow:hidden;background:#000;aspect-ratio:16/9;max-height:34vh}
  .izr .shot img{width:100%;height:100%;object-fit:contain;display:block}
  .izr .note{margin:6px 12px 0;font-size:12px;color:#ffd27a;min-height:16px}
  .izr .pad{flex:1;min-height:150px;margin:8px 12px;border-radius:16px;background:linear-gradient(160deg,rgba(124,92,255,.18),rgba(78,205,196,.12));border:1px solid rgba(255,255,255,.12);touch-action:none;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,.45);font-size:12px;text-align:center;padding:10px}
  .izr .row{display:flex;gap:6px;padding:0 12px 6px;flex-wrap:wrap}
  .izr .row button{flex:1;min-width:36px;padding:10px 4px}
  .izr .shot img:not([src]){visibility:hidden}
  .izr .shot .wait{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,.45);font-size:12px}
  .izr .type{display:flex;gap:6px;padding:0 12px 6px}
  .izr .type input{flex:1;min-width:0;background:rgba(255,255,255,.08);color:#fff;border:1px solid rgba(255,255,255,.16);border-radius:12px;padding:10px;font:inherit}
  .izr .safe{height:env(safe-area-inset-bottom)}`;

  function open(pcLink) {
    base = pcLink.endsWith("/") ? pcLink : pcLink + "/";
    if (!root) build();
    root.hidden = false;
    live = true;
    say("");
    refresh();
  }

  function close() {
    releaseDrag();
    if (!root) return;
    root.hidden = true;
    clearTimeout(shotTimer);
    if (shotUrl) URL.revokeObjectURL(shotUrl);
    shotUrl = "";
  }

  function say(text) {
    const n = $(".note");
    if (n) n.textContent = text;
  }

  function explain(error) {
    if (error === "off") say("Turn on “Let my phone control this PC” on your PC: Izuki → Settings → Phone.");
    else if (error === "locked") say("Your PC is locked — unlock it first (Izuki never works the lock screen).");
    else if (error) say("The PC said: " + error);
  }

  async function send(body) {
    try {
      const r = await fetch(base + "remote", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const v = await r.json();
      if (!v.ok) explain(v.error);
      else if ($(".note").textContent.startsWith("Turn on") || $(".note").textContent.startsWith("Can't reach")) say("");
      return v;
    } catch {
      say("Can't reach your PC — is Izuki open with the phone link on?");
      return { ok: false };
    }
  }

  // Finger movement is gathered and sent one request at a time (never a queue).
  function move(dx, dy) {
    pend.dx += dx;
    pend.dy += dy;
    if (inFlight) return;
    const go = () => {
      if (!pend.dx && !pend.dy) return;
      const d = pend;
      pend = { dx: 0, dy: 0 };
      inFlight = true;
      send({ op: "move", dx: d.dx, dy: d.dy }).finally(() => {
        inFlight = false;
        go();
      });
    };
    go();
  }

  async function refresh() {
    clearTimeout(shotTimer);
    if (!root || root.hidden || !live) return;
    try {
      const w = Math.min(1280, Math.round(innerWidth * (devicePixelRatio || 1)));
      const r = await fetch(base + "remote/screen?w=" + w, { cache: "no-store" });
      if (r.ok) {
        const blob = await r.blob();
        const url = URL.createObjectURL(blob);
        $(".shot img").src = url;
        $(".shot .wait").hidden = true;
        if (shotUrl) URL.revokeObjectURL(shotUrl);
        shotUrl = url;
      } else explain((await r.text()).trim());
    } catch {
      say("Can't reach your PC — is Izuki open with the phone link on?");
    }
    shotTimer = setTimeout(refresh, 1500);
  }

  function build() {
    const style = document.createElement("style");
    style.textContent = css;
    document.head.append(style);
    root = document.createElement("div");
    root.className = "izr";
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-label", "Remote for your PC");
    root.innerHTML = `
      <header><b>🖱️ Remote</b><button data-live aria-pressed="true">Live view</button><button data-close aria-label="Close">✕</button></header>
      <div class="shot"><span class="wait">Your PC's screen shows here</span><img alt="Your PC's screen — tap to click there"></div>
      <div class="note" aria-live="polite"></div>
      <div class="pad">Slide to move · tap to click · two fingers: tap = right-click, slide = scroll · press and hold to drag</div>
      <div class="row"><button data-click="left">Click</button><button data-click="right">Right-click</button><button data-click="double">Double</button></div>
      <div class="type"><input type="text" placeholder="Type on your PC…" enterkeyhint="send" autocomplete="off"><button data-send>Type</button></div>
      <div class="row"><button data-key="enter">Enter</button><button data-key="backspace">⌫</button><button data-key="tab">Tab</button><button data-key="escape">Esc</button><button data-key="left">←</button><button data-key="up">↑</button><button data-key="down">↓</button><button data-key="right">→</button></div>
      <div class="row"><button data-key="ctrl+c">Copy</button><button data-key="ctrl+v">Paste</button><button data-key="ctrl+z">Undo</button><button data-key="alt+tab">Switch</button><button data-key="win">Start</button></div>
      <div class="row"><button data-key="prevtrack">⏮</button><button data-key="playpause">⏯</button><button data-key="nexttrack">⏭</button><button data-key="volumedown">🔉</button><button data-key="volumeup">🔊</button><button data-key="volumemute">🔇</button></div>
      <div class="safe"></div>`;
    document.body.append(root);

    $("[data-close]").onclick = close;
    $("[data-live]").onclick = (e) => {
      live = !live;
      e.currentTarget.setAttribute("aria-pressed", String(live));
      e.currentTarget.textContent = live ? "Live view" : "View off";
      if (live) refresh();
    };
    root.querySelectorAll("[data-click]").forEach((b) => (b.onclick = () => {
      const k = b.dataset.click;
      void send({ op: "click", button: k === "right" ? "right" : "left", double: k === "double" }).then(() => setTimeout(refresh, 250));
    }));
    root.querySelectorAll("[data-key]").forEach((b) => (b.onclick = () => void send({ op: "key", combo: b.dataset.key }).then(() => setTimeout(refresh, 250))));
    const input = $(".type input");
    const typeIt = () => {
      const text = input.value;
      if (!text) return;
      input.value = "";
      void send({ op: "type", text }).then(() => setTimeout(refresh, 250));
    };
    $("[data-send]").onclick = typeIt;
    input.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); typeIt(); } });

    // A tap on the screen view: the pointer goes there, and clicks.
    $(".shot img").addEventListener("click", (e) => {
      const img = e.currentTarget;
      const box = img.getBoundingClientRect();
      // The picture is "contain"-fitted: work out where it actually sits.
      const iw = img.naturalWidth || 16, ih = img.naturalHeight || 9;
      const scale = Math.min(box.width / iw, box.height / ih);
      const w = iw * scale, h = ih * scale;
      const nx = (e.clientX - box.left - (box.width - w) / 2) / w;
      const ny = (e.clientY - box.top - (box.height - h) / 2) / h;
      if (nx < 0 || nx > 1 || ny < 0 || ny > 1) return;
      void send({ op: "point", nx, ny }).then(() => send({ op: "click", button: "left" })).then(() => setTimeout(refresh, 300));
    });

    // The trackpad.
    const pad = $(".pad");
    const touches = new Map();
    let start = 0, moved = 0, maxFingers = 0, holdTimer = 0, lastScrollY = null, scrollAcc = 0;
    pad.addEventListener("pointerdown", (e) => {
      pad.setPointerCapture?.(e.pointerId);
      touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
      maxFingers = Math.max(maxFingers, touches.size);
      // A second finger during a drag: let go first (it becomes a scroll).
      if (touches.size >= 2) releaseDrag();
      if (touches.size === 1) {
        start = performance.now();
        moved = 0;
        // Press and hold, still: pick it up to drag.
        holdTimer = setTimeout(() => {
          if (moved < 8 && touches.size === 1) {
            dragging = true;
            navigator.vibrate?.(20);
            void send({ op: "down", button: "left" });
          }
        }, 450);
      }
    });
    pad.addEventListener("pointermove", (e) => {
      const t = touches.get(e.pointerId);
      if (!t) return;
      const dx = e.clientX - t.x, dy = e.clientY - t.y;
      t.x = e.clientX;
      t.y = e.clientY;
      moved += Math.abs(dx) + Math.abs(dy);
      if (touches.size >= 2) {
        // Two fingers: scroll.
        const ys = [...touches.values()].map((p) => p.y);
        const y = ys.reduce((a, b) => a + b, 0) / ys.length;
        if (lastScrollY !== null) {
          scrollAcc += (lastScrollY - y) / 18;
          const n = Math.trunc(scrollAcc);
          if (n) {
            scrollAcc -= n;
            void send({ op: "scroll", dy: n });
          }
        }
        lastScrollY = y;
        return;
      }
      // Faster finger, further pointer (like a laptop trackpad).
      const speed = Math.hypot(dx, dy);
      const gain = 1.6 + Math.min(3, speed / 6);
      move(dx * gain, dy * gain);
    });
    const end = (e) => {
      if (!touches.has(e.pointerId)) return;
      touches.delete(e.pointerId);
      clearTimeout(holdTimer);
      if (touches.size) return;
      lastScrollY = null;
      scrollAcc = 0;
      const quick = performance.now() - start < 260 && moved < 10;
      if (dragging) {
        releaseDrag();
      } else if (quick) {
        void send({ op: "click", button: maxFingers >= 2 ? "right" : "left" });
      }
      maxFingers = 0;
      setTimeout(refresh, 300);
    };
    pad.addEventListener("pointerup", end);
    pad.addEventListener("pointercancel", end);
  }

  window.IzukiRemote = { open, close };
})();
