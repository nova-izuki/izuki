// 🌱 Touch Grass: run your PC's work from your phone while you're out
// (the PC side is src-tauri/src/touch.rs, through the private link).
//
//   IzukiTouch.open(pcLink, { pass, onPair })   show it; ✕ closes it
//
// Your missions with their real results (Verified, Partly done, Blocked…),
// add one and start them, stop everything — and anything Izuki has ready to
// send or post, waiting for your yes: Approve runs exactly that draft once,
// Reject drops it. Only a phone paired with this PC (the Remote's pass) can
// use it; nothing here moves the PC's mouse.
(() => {
  "use strict";
  let root = null, base = "", pass = "", timer = 0, onPair = () => {}, lastWaiting = new Set();
  let vapid = "", pushOn = false;
  const $ = (sel) => root.querySelector(sel);
  const auth = () => ({ Authorization: "Bearer " + pass, "Content-Type": "application/json" });
  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

  const STATE = {
    waiting: ["⏳", "Waiting"], running: ["⚙️", "Working on it…"], done: ["✅", "Verified"], needs_you: ["✋", "Needs you"],
    stopped: ["⏹", "Stopped"], partial: ["⚠️", "Partly done"], blocked: ["🔒", "Blocked"], failed: ["⚠️", "Failed"], unverified: ["❔", "Not verified"],
  };
  const APPROVAL = { waiting: "Waiting for you", sending: "Sending…", sent: "✅ Sent", rejected: "Rejected", failed: "⚠️ Didn't go through", expired: "Expired" };

  const css = `
  .izt{position:fixed;inset:0;z-index:2147482001;background:#0b0d16;color:#fff;display:flex;flex-direction:column;font:14px system-ui,-apple-system,Segoe UI,sans-serif;overflow:auto}
  .izt[hidden],.izt section[hidden],.izt [hidden]{display:none}
  .izt header{display:flex;align-items:center;gap:8px;padding:12px;padding-top:max(12px,env(safe-area-inset-top));position:sticky;top:0;background:#0b0d16;z-index:1}
  .izt header b{flex:1;font-size:17px}
  .izt button{background:rgba(255,255,255,.1);color:#fff;border:1px solid rgba(255,255,255,.14);border-radius:12px;padding:10px 12px;font:inherit;font-weight:600;touch-action:manipulation}
  .izt button:active{background:rgba(94,231,255,.3)}
  .izt section{margin:6px 12px 10px;padding:12px;border-radius:16px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.09);display:flex;flex-direction:column;gap:8px}
  .izt h3{margin:0;font-size:13px;letter-spacing:.04em;text-transform:uppercase;color:rgba(255,255,255,.55)}
  .izt .now{font-size:15px;color:#dff9ff}
  .izt .muted{color:rgba(255,255,255,.5);font-size:12px}
  .izt .warn{color:#ffd27a;font-size:12.5px}
  .izt .stop{background:rgba(255,80,110,.35);border-color:rgba(255,80,110,.5)}
  .izt .go{background:rgba(94,231,255,.25);border-color:rgba(94,231,255,.5)}
  .izt .ok{background:rgba(52,211,153,.3);border-color:rgba(52,211,153,.6)}
  .izt .row{display:flex;gap:8px}
  .izt .row > *{flex:1}
  .izt input{min-width:0;background:rgba(255,255,255,.08);color:#fff;border:1px solid rgba(255,255,255,.16);border-radius:12px;padding:10px;font:inherit}
  .izt .card{padding:10px;border-radius:12px;background:rgba(0,0,0,.25);border:1px solid rgba(255,255,255,.08);display:flex;flex-direction:column;gap:6px}
  .izt .card.ask{border-color:rgba(255,210,122,.55);background:rgba(255,210,122,.08)}
  .izt .draft{white-space:pre-wrap;font-size:13px;line-height:1.4;max-height:220px;overflow:auto}
  .izt .m{display:flex;gap:8px;align-items:flex-start}
  .izt .m .t{flex:1;min-width:0}
  .izt .m .t div:first-child{overflow-wrap:anywhere}
  .izt .m .x{padding:4px 8px;font-size:12px}
  .izt .note{margin:0 12px;min-height:18px;font-size:12.5px;color:#ffd27a}
  .izt .safe{height:env(safe-area-inset-bottom)}`;

  function build() {
    const st = document.createElement("style");
    st.textContent = css;
    document.head.append(st);
    root = document.createElement("div");
    root.className = "izt";
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-label", "Touch Grass — your PC's work from here");
    root.innerHTML = `
      <header><b>🌱 Touch Grass</b><button class="watch" type="button" aria-label="Watch the PC live">🖥️ Watch</button><button class="close" type="button" aria-label="Close">✕</button></header>
      <p class="note" role="status"></p>
      <section class="pairbox" hidden><h3>First, pair this phone</h3><div>Touch Grass needs this phone paired with your PC (once). Tap Pair — a code pops up on your PC to type in here.</div><button class="pair go" type="button">Pair this phone</button></section>
      <section class="bell"><h3>Notifications</h3><div class="muted belltext">Get a buzz on this phone when Izuki needs your yes or your missions finish — even with Izuki closed.</div><button class="push" type="button">🔔 Notify me on this phone</button></section>
      <section class="pc"><h3>Your PC</h3><div class="now">…</div><div class="warn locked" hidden>Your PC is locked, so anything that needs the screen waits. Email, apps and files still work.</div><button class="stop all" type="button">⏹ Stop everything</button></section>
      <section class="asks"><h3>Waiting for your yes</h3><div class="list"></div></section>
      <section class="ms"><h3>Missions</h3>
        <div class="row"><input class="new" maxlength="400" placeholder="Add a mission — e.g. summarise my unread emails" aria-label="New mission"><button class="add" type="button" style="flex:0">Add</button></div>
        <div class="list"></div>
        <div class="row"><button class="run go" type="button">▶ Start missions</button><button class="clear" type="button">Clear finished</button></div>
        <div class="muted">Izuki does them one by one and keeps your PC awake while it works. “Verified” means it saw the result; anything else tells you what to check.</div>
      </section>
      <div class="safe"></div>`;
    document.body.append(root);
    $(".close").onclick = close;
    $(".watch").onclick = () => { close(); window.IzukiRemote?.open(base, { pass }); };
    $(".pair").onclick = () => { close(); onPair(); };
    $(".all").onclick = () => act({ op: "stop" }, "Stopped everything on your PC.");
    $(".run").onclick = () => act({ op: "run" }, "Missions started.");
    $(".clear").onclick = () => act({ op: "clear" }, "");
    $(".push").onclick = togglePush;
    const add = () => {
      const t = $(".new").value.trim();
      if (!t) return;
      act({ op: "add", text: t }, "Mission added.").then((ok) => { if (ok) $(".new").value = ""; });
    };
    $(".add").onclick = add;
    $(".new").addEventListener("keydown", (e) => { if (e.key === "Enter") add(); });
  }

  function say(t) { if (root) $(".note").textContent = t || ""; }

  async function act(body, done) {
    try {
      const r = await fetch(base + "touch", { method: "POST", headers: auth(), body: JSON.stringify(body) });
      if (r.status === 401) { showPair(); return false; }
      const v = await r.json();
      if (v.ok === false) { say(v.error ? `Couldn't: ${v.error}` : (v.approval?.result || "That didn't work.")); refresh(); return false; }
      if (v.approval?.result) say(v.approval.result);
      else if (done) say(done);
      refresh();
      return true;
    } catch {
      say("Can't reach your PC — is it on, with Izuki running?");
      return false;
    }
  }

  /** Switch real notifications on (or off) for this phone. */
  async function togglePush() {
    const btn = $(".push");
    if (pushOn) {
      try { (await (await navigator.serviceWorker.ready).pushManager.getSubscription())?.unsubscribe(); } catch {}
      return act({ op: "push_off" }, "Notifications off on this phone.");
    }
    if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
      return say(/iphone|ipad/i.test(navigator.userAgent)
        ? "On iPhone: tap Share → Add to Home Screen, open Izuki from there, then tap this again (iOS 16.4 or newer)."
        : "This browser can't show notifications from a web app — try Chrome.");
    }
    if (!vapid) return say("Your PC needs Izuki 1.0.122 or newer for notifications.");
    btn.disabled = true;
    try {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") { say("Notifications are blocked for this site — allow them in the browser's site settings."); return; }
      const reg = await navigator.serviceWorker.ready;
      const key = Uint8Array.from(atob(vapid.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((vapid.length + 3) % 4)), (c) => c.charCodeAt(0));
      let sub = await reg.pushManager.getSubscription();
      if (sub) { try { await sub.unsubscribe(); } catch {} }
      sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key });
      await act({ op: "push_on", sub: sub.toJSON() }, "🔔 Notifications on — a test one is on its way.");
    } catch (e) {
      say("Couldn't switch notifications on: " + (e?.message || e));
    } finally {
      btn.disabled = false;
    }
  }

  function showPair() {
    $(".pairbox").hidden = false;
    for (const s of [".pc", ".asks", ".ms", ".bell"]) $(s).hidden = true;
  }

  function render(v) {
    $(".pairbox").hidden = true;
    for (const s of [".pc", ".asks", ".ms", ".bell"]) $(s).hidden = false;
    vapid = v.vapid || "";
    pushOn = !!v.push_on;
    $(".push").textContent = pushOn ? "🔕 Turn notifications off" : "🔔 Notify me on this phone";
    $(".belltext").textContent = pushOn
      ? "On — this phone buzzes when Izuki needs your yes or your missions finish."
      : "Get a buzz on this phone when Izuki needs your yes or your missions finish — even with Izuki closed.";
    $(".now").textContent = v.busy ? `🤖 ${v.doing || "Working…"}` : v.running ? "🤖 Doing your missions…" : v.lesson ? `🎓 ${v.lesson}` : "Free — nothing running.";
    $(".locked").hidden = !v.locked;
    $(".all").hidden = !(v.busy || v.running);

    // Approvals: waiting first, with the exact draft and two clear buttons.
    const asks = v.approvals || [];
    const box = $(".asks .list");
    box.innerHTML = asks.length ? "" : `<div class="muted">Nothing waiting. When Izuki has an email or post ready, it shows up here to approve.</div>`;
    for (const a of asks.slice(0, 8)) {
      const c = document.createElement("div");
      c.className = "card" + (a.state === "waiting" ? " ask" : "");
      c.innerHTML = `<div><b>${esc(a.app)}</b> · <span class="muted">${esc(APPROVAL[a.state] || a.state)} · ${new Date(a.at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</span></div><div class="draft">${esc(a.draft)}</div>${a.result ? `<div class="muted">${esc(a.result)}</div>` : ""}`;
      if (a.state === "waiting") {
        const row = document.createElement("div");
        row.className = "row";
        const yes = document.createElement("button");
        yes.type = "button"; yes.className = "ok"; yes.textContent = "✓ Approve";
        const no = document.createElement("button");
        no.type = "button"; no.textContent = "✕ Reject";
        // One tap decides: both buttons go quiet so it can't be sent and rejected.
        const decide = () => { yes.disabled = true; no.disabled = true; };
        yes.onclick = () => { decide(); act({ op: "approve", id: a.id }, ""); };
        no.onclick = () => { decide(); act({ op: "reject", id: a.id }, "Rejected — nothing was sent."); };
        row.append(yes, no);
        c.append(row);
      }
      box.append(c);
    }
    // A new one waiting: a buzz, so you notice it.
    const now = new Set(asks.filter((a) => a.state === "waiting").map((a) => a.id));
    if ([...now].some((id) => !lastWaiting.has(id)) && lastWaiting.size >= 0 && document.visibilityState === "visible") {
      try { navigator.vibrate?.([80, 60, 80]); } catch {}
    }
    lastWaiting = now;

    // Missions with their real results.
    const ms = v.missions || [];
    const list = $(".ms .list");
    list.innerHTML = ms.length ? "" : `<div class="muted">No missions yet.</div>`;
    for (const m of ms.slice(0, 30)) {
      const [icon, label] = STATE[m.state] || ["•", m.state];
      const el = document.createElement("div");
      el.className = "m";
      el.innerHTML = `<span>${icon}</span><div class="t"><div>${esc(m.text)}</div><div class="muted">${esc(label)}${m.result ? " — " + esc(m.result.slice(0, 160)) + (m.result.length > 160 ? "…" : "") : ""}</div></div>`;
      if (m.state === "waiting") {
        const x = document.createElement("button");
        x.type = "button"; x.className = "x"; x.textContent = "Remove"; x.setAttribute("aria-label", "Remove this mission");
        x.onclick = () => act({ op: "remove", id: m.id }, "");
        el.append(x);
      }
      list.append(el);
    }
    $(".run").disabled = !!v.running || !ms.some((m) => m.state === "waiting");
    $(".run").textContent = v.running ? "⚙️ Working…" : "▶ Start missions";
  }

  async function refresh() {
    clearTimeout(timer);
    if (!root || root.hidden) return;
    try {
      const r = await fetch(base + "touch/status", { headers: auth(), cache: "no-store" });
      if (r.status === 401) return showPair();
      render(await r.json());
    } catch {
      say("Can't reach your PC — is it on, with Izuki running?");
    }
    timer = setTimeout(refresh, 4000);
  }

  function open(pcLink, opts = {}) {
    base = pcLink.endsWith("/") ? pcLink : pcLink + "/";
    pass = opts.pass || "";
    onPair = opts.onPair || (() => {});
    if (!root) build();
    root.hidden = false;
    say("");
    if (!pass) return showPair();
    refresh();
  }

  function close() {
    clearTimeout(timer);
    if (root) root.hidden = true;
  }

  document.addEventListener("visibilitychange", () => { if (!document.hidden && root && !root.hidden) refresh(); });
  window.IzukiTouch = { open, close };
})();
