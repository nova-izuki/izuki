// The phone as a remote for the PC (the PC side is src-tauri/src/remote.rs),
// through the private link the phone already has to its PC.
//
//   IzukiRemote.open(pcLink, { pass, savePass })    show it; ✕ closes it
//
// A live video of the PC's screen (tap it: the pointer goes there and
// clicks), a trackpad (slide to move, tap to click, two fingers to scroll or
// right-click, press and hold to drag), typing, keys and music buttons —
// and what Izuki is doing, with Stop and an "Ask Izuki" box, so you can
// watch it work. The PC must have "Let my phone control this PC" on, and
// this phone must be one you allowed there (Pair this phone: a box with a
// code pops up on the PC; the pass it gives is kept on this phone).
(() => {
  "use strict";
  let root = null, base = "", live = true, shotTimer = 0, shotUrl = "", inFlight = false;
  let pass = "", savePass = () => {}, streamCtl = null, statusTimer = 0, quality = "balanced";
  let seen = { frames: 0, at: performance.now(), fps: 0 };
  const QUALITY = {
    saver: { w: 640, fps: 3, q: 45, label: "Data saver" },
    balanced: { w: 960, fps: 6, q: 55, label: "Balanced" },
    smooth: { w: 1280, fps: 10, q: 60, label: "Smooth" },
  };
  try { quality = localStorage.getItem("izuki.remoteQuality") || "balanced"; } catch {}
  if (!QUALITY[quality]) quality = "balanced";
  const auth = () => (pass ? { Authorization: "Bearer " + pass } : {});
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
  .izr .safe{height:env(safe-area-inset-bottom)}
  .izr header select{background:rgba(255,255,255,.1);color:#fff;border:1px solid rgba(255,255,255,.14);border-radius:12px;padding:8px;font:inherit;font-size:12px}
  .izr .ai{margin:6px 12px 0;padding:8px 10px;border-radius:12px;background:rgba(94,231,255,.08);border:1px solid rgba(94,231,255,.2);font-size:12px;display:flex;flex-direction:column;gap:6px}
  .izr .ai .doing{color:#dff9ff}
  .izr .ai .stats{color:rgba(255,255,255,.5);font-size:11px}
  .izr .ai .askrow{display:flex;gap:6px}
  .izr .ai input{flex:1;min-width:0;background:rgba(255,255,255,.08);color:#fff;border:1px solid rgba(255,255,255,.16);border-radius:10px;padding:8px;font:inherit;font-size:12px}
  .izr .ai button{padding:8px 10px;font-size:12px}
  .izr .ai .stop{background:rgba(255,80,110,.35)}
  .izr .pair{margin:6px 12px 0;padding:10px;border-radius:12px;background:rgba(255,210,122,.1);border:1px solid rgba(255,210,122,.35);font-size:12.5px;display:flex;flex-direction:column;gap:8px}
  .izr .pair .code{font-size:26px;font-weight:800;letter-spacing:4px;text-align:center}`;

  function open(pcLink, opts = {}) {
    base = pcLink.endsWith("/") ? pcLink : pcLink + "/";
    pass = opts.pass || "";
    savePass = opts.savePass || (() => {});
    if (!root) build();
    root.hidden = false;
    live = true;
    say("");
    if (!pass) return showPair();
    $(".pair").hidden = true;
    refresh();
    pollStatus();
  }

  function close() {
    releaseDrag();
    if (!root) return;
    root.hidden = true;
    clearTimeout(shotTimer);
    clearTimeout(statusTimer);
    stopStream();
    if (shotUrl) URL.revokeObjectURL(shotUrl);
    shotUrl = "";
  }

  function stopStream() {
    if (streamCtl) streamCtl.abort();
    streamCtl = null;
  }

  // Pairing: the PC shows a box with this code; Yes there gives this phone
  // its own pass (kept here). Without it, the PC refuses every remote action.
  function showPair(note) {
    stopStream();
    const p = $(".pair");
    p.hidden = false;
    p.innerHTML = `<b>Pair this phone with your PC</b><span>${note || "Your PC only lets phones you allowed on it see or control it."} Tap below — a box pops up on your PC with a code. Check it matches, then press Yes there.</span><button data-pair>Pair this phone</button>`;
    p.querySelector("[data-pair]").onclick = async () => {
      const code = String(1000 + Math.floor(Math.random() * 9000));
      p.innerHTML = `<span>On your PC, check the box shows</span><div class="code">${code}</div><span>then press <b>Yes</b>. (Someone needs to be at the PC for this, once.)</span>`;
      try {
        const name = /iphone|ipad/i.test(navigator.userAgent) ? "iPhone" : "Android phone";
        const r = await fetch(base + "link", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, kind: "phone", code }) });
        const v = await r.json();
        if (!v.ok || !v.token) throw new Error(v.error || "The PC didn't allow it.");
        pass = v.token;
        savePass(pass);
        p.hidden = true;
        say("Paired ✓");
        refresh();
        pollStatus();
      } catch (e) {
        showPair(String(e.message || e));
      }
    };
  }

  function say(text) {
    const n = $(".note");
    if (n) n.textContent = text;
  }

  function explain(error) {
    if (error === "pair") return showPair("This phone isn't allowed on your PC yet (or it was removed there).");
    if (error === "off") say("Turn on “Let my phone control this PC” on your PC: Izuki → Settings → Phone.");
    else if (error === "locked") say("Your PC is locked — unlock it first (Izuki never works the lock screen).");
    else if (error) say("The PC said: " + error);
  }

  async function send(body) {
    try {
      const r = await fetch(base + "remote", { method: "POST", headers: { "Content-Type": "application/json", ...auth() }, body: JSON.stringify(body) });
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

  /** One picture of the live view on screen (the old one let go once it's replaced). */
  function show(bytes) {
    const url = URL.createObjectURL(new Blob([bytes], { type: "image/jpeg" }));
    const img = $(".shot img");
    const old = shotUrl;
    img.onload = () => old && URL.revokeObjectURL(old);
    img.src = url;
    shotUrl = url;
    $(".shot .wait").hidden = true;
    seen.frames++;
    const now = performance.now();
    if (now - seen.at > 1000) {
      seen.fps = (seen.frames * 1000) / (now - seen.at);
      seen = { frames: 0, at: now, fps: seen.fps };
    }
  }

  function find(buf, seq, from = 0) {
    outer: for (let i = from; i <= buf.length - seq.length; i++) {
      for (let j = 0; j < seq.length; j++) if (buf[i + j] !== seq[j]) continue outer;
      return i;
    }
    return -1;
  }

  // The live view: one long stream of pictures from the PC, read here part by
  // part (a header with its length, then the picture).
  async function refresh() {
    clearTimeout(shotTimer);
    stopStream();
    if (!root || root.hidden || !live || !pass) return;
    const q = QUALITY[quality];
    const ctl = new AbortController();
    streamCtl = ctl;
    let r;
    try {
      r = await fetch(`${base}remote/stream?w=${q.w}&fps=${q.fps}&q=${q.q}`, { headers: auth(), signal: ctl.signal, cache: "no-store" });
    } catch {
      if (ctl.signal.aborted) return;
      say("Can't reach your PC — is Izuki open with the phone link on?");
      shotTimer = setTimeout(refresh, 3000);
      return;
    }
    if (r.status === 401) return explain((await r.json().catch(() => ({}))).error || "pair");
    if (r.status === 404 || !r.body) return poll();
    if (!r.ok) {
      explain((await r.text()).trim());
      shotTimer = setTimeout(refresh, 4000);
      return;
    }
    if ($(".note").textContent.startsWith("Can't reach")) say("");
    const reader = r.body.getReader();
    const dec = new TextDecoder();
    let buf = new Uint8Array(0);
    try {
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        const joined = new Uint8Array(buf.length + value.length);
        joined.set(buf);
        joined.set(value, buf.length);
        buf = joined;
        for (;;) {
          const end = find(buf, [13, 10, 13, 10]);
          if (end < 0) break;
          const m = dec.decode(buf.subarray(0, end)).match(/Content-Length:\s*(\d+)/i);
          if (!m) { buf = buf.subarray(end + 4); continue; }
          const len = Number(m[1]);
          if (buf.length < end + 4 + len) break;
          show(buf.slice(end + 4, end + 4 + len));
          buf = buf.subarray(end + 4 + len);
        }
      }
    } catch {
      /* stopped, or the connection dropped */
    }
    if (!ctl.signal.aborted && root && !root.hidden && live) shotTimer = setTimeout(refresh, 1500);
  }

  // An older PC with no live stream: a picture every 1.5 s, as before.
  async function poll() {
    clearTimeout(shotTimer);
    if (!root || root.hidden || !live) return;
    try {
      const w = Math.min(1280, Math.round(innerWidth * (devicePixelRatio || 1)));
      const r = await fetch(base + "remote/screen?w=" + w, { cache: "no-store", headers: auth() });
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
    shotTimer = setTimeout(poll, 1500);
  }

  // What Izuki is doing on the PC (and how the stream is going), every 3 s.
  async function pollStatus() {
    clearTimeout(statusTimer);
    if (!root || root.hidden || !pass) return;
    try {
      const r = await fetch(base + "remote/status", { headers: auth(), cache: "no-store" });
      const v = await r.json();
      if (v.ok === false) {
        if (v.error === "pair") return explain("pair");
      } else {
        $(".ai .doing").textContent = "🤖 " + (v.doing || "");
        $(".ai .stop").hidden = !v.busy;
        const waiting = (v.missions || []).filter((m) => m.state === "waiting" || m.state === "running").length;
        const needs = (v.missions || []).filter((m) => m.state === "needs_you").length;
        $(".ai .stats").textContent =
          `${seen.fps ? seen.fps.toFixed(1) + " pictures/s here" : "—"} · ${Math.round(v.kbps || 0)} kb/s · ${v.encode_ms || 0} ms per picture` +
          (waiting || needs ? ` · missions: ${waiting} to go${needs ? `, ${needs} need you` : ""}` : "");
      }
    } catch {
      /* the stream shows the connection trouble */
    }
    statusTimer = setTimeout(pollStatus, 3000);
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
      <header><b>🖱️ Remote</b><select data-quality aria-label="Picture quality">${Object.entries(QUALITY).map(([k, v]) => `<option value="${k}">${v.label}</option>`).join("")}</select><button data-live aria-pressed="true">Live</button><button data-close aria-label="Close">✕</button></header>
      <div class="pair" hidden></div>
      <div class="shot"><span class="wait">Your PC's screen shows here</span><img alt="Your PC's screen — tap to click there"></div>
      <div class="note" aria-live="polite"></div>
      <div class="ai">
        <div class="doing">🤖 …</div>
        <div class="askrow"><input type="text" data-ask placeholder="Ask Izuki to do something on your PC…" enterkeyhint="send" autocomplete="off"><button data-asksend>Ask</button><button class="stop" data-stop hidden>Stop Izuki</button></div>
        <div class="stats"></div>
      </div>
      <div class="pad">Slide to move · tap to click · two fingers: tap = right-click, slide = scroll · press and hold to drag</div>
      <div class="row"><button data-click="left">Click</button><button data-click="right">Right-click</button><button data-click="double">Double</button></div>
      <div class="type"><input type="text" placeholder="Type on your PC…" enterkeyhint="send" autocomplete="off"><button data-send>Type</button></div>
      <div class="row"><button data-key="enter">Enter</button><button data-key="backspace">⌫</button><button data-key="tab">Tab</button><button data-key="escape">Esc</button><button data-key="left">←</button><button data-key="up">↑</button><button data-key="down">↓</button><button data-key="right">→</button></div>
      <div class="row"><button data-key="ctrl+c">Copy</button><button data-key="ctrl+v">Paste</button><button data-key="ctrl+z">Undo</button><button data-key="alt+tab">Switch</button><button data-key="win">Start</button></div>
      <div class="row"><button data-key="prevtrack">⏮</button><button data-key="playpause">⏯</button><button data-key="nexttrack">⏭</button><button data-key="volumedown">🔉</button><button data-key="volumeup">🔊</button><button data-key="volumemute">🔇</button></div>
      <div class="safe"></div>`;
    document.body.append(root);

    $("[data-close]").onclick = close;
    const qSel = $("[data-quality]");
    qSel.value = quality;
    qSel.onchange = () => {
      quality = qSel.value;
      try { localStorage.setItem("izuki.remoteQuality", quality); } catch {}
      refresh();
    };
    $("[data-stop]").onclick = () => void send({ op: "stop" }).then(() => pollStatus());
    // "Ask Izuki" — a request to the PC, done there while you watch.
    const askBox = $("[data-ask]");
    const ask = async () => {
      const text = askBox.value.trim();
      if (!text) return;
      askBox.value = "";
      say("Asked — watch it work…");
      try {
        const r = await fetch(base + "talk", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text }) });
        const v = await r.json();
        say(v.text ? "Izuki: " + v.text : "");
      } catch {
        say("Can't reach your PC — is Izuki open with the phone link on?");
      }
      pollStatus();
    };
    $("[data-asksend]").onclick = ask;
    askBox.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); ask(); } });
    $("[data-live]").onclick = (e) => {
      live = !live;
      e.currentTarget.setAttribute("aria-pressed", String(live));
      e.currentTarget.textContent = live ? "Live" : "Off";
      if (live) refresh();
      else stopStream();
    };
    root.querySelectorAll("[data-click]").forEach((b) => (b.onclick = () => {
      const k = b.dataset.click;
      void send({ op: "click", button: k === "right" ? "right" : "left", double: k === "double" });
    }));
    root.querySelectorAll("[data-key]").forEach((b) => (b.onclick = () => void send({ op: "key", combo: b.dataset.key })));
    const input = $(".type input");
    const typeIt = () => {
      const text = input.value;
      if (!text) return;
      input.value = "";
      void send({ op: "type", text });
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
      void send({ op: "point", nx, ny }).then(() => send({ op: "click", button: "left" }));
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
    };
    pad.addEventListener("pointerup", end);
    pad.addEventListener("pointercancel", end);
  }

  window.IzukiRemote = { open, close };
})();
