// Cockpit: a Tesla-like instrument panel for the phone, with Autopilot.
//
// It only reads safe device facts and drives the same explicit native actions
// as the rest of the app. Nothing runs in the background; the overlay closes
// its timers when it goes away.
(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const n = () => window.IzukiNative;
  const d = () => window.IzukiDrive;
  let built = false;
  let timer = null;
  let speedTimer = null;
  let device = null;
  let webBattery = null;
  let unsubscribe = null;

  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  function build() {
    if (built) return;
    built = true;
    // Launched from Settings → Phone, not the toolbar: the phone header is
    // already tight at 320px and the cockpit is an occasional destination.
    const panel = document.createElement("div");
    panel.id = "izuki-cockpit";
    panel.hidden = true;
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "true");
    panel.setAttribute("aria-label", "Izuki phone cockpit");
    panel.innerHTML = `
      <div class="ck-shell">
        <div class="ck-top">
          <div class="ck-brand">IZUKI // COCKPIT<small>PHONE INSTRUMENT PANEL</small></div>
          <div class="ck-live" id="ck-live"><i></i><span id="ck-live-text">CONNECTED</span></div>
          <button class="ck-close" id="ck-close" type="button" aria-label="Close cockpit">×</button>
        </div>
        <div class="ck-grid">
          <section class="ck-card ck-left" aria-label="Phone power and connection">
            <div class="ck-label">POWER</div>
            <div class="ck-battery">
              <div class="ck-ring">
                <svg viewBox="0 0 120 120" aria-hidden="true">
                  <circle class="ck-ring-track" cx="60" cy="60" r="51"></circle>
                  <circle id="ck-ring-fill" class="ck-ring-fill" cx="60" cy="60" r="51" stroke-dasharray="320.44" stroke-dashoffset="320.44"></circle>
                </svg>
                <div class="ck-ring-copy"><div><b id="ck-battery">--</b><span>BATTERY</span></div></div>
              </div>
              <div class="ck-charge" id="ck-charge">Reading phone…</div>
            </div>
            <div class="ck-facts">
              <div class="ck-fact"><span>Network</span><span id="ck-network">—</span></div>
              <div class="ck-fact"><span>Volume</span><span id="ck-volume">—</span></div>
              <div class="ck-fact"><span>Screen</span><span id="ck-screen">—</span></div>
              <div class="ck-fact"><span>Control</span><span id="ck-control">—</span></div>
            </div>
          </section>
          <section class="ck-card ck-centre" aria-label="Speed and time">
            <div class="ck-label">DRIVE</div>
            <div class="ck-speed"><b id="ck-speed">--</b><small id="ck-unit">MPH</small></div>
            <div class="ck-mode" id="ck-mode">PARKED</div>
            <div class="ck-clock" id="ck-clock">--:--</div>
            <div class="ck-date" id="ck-date"></div>
            <div class="ck-actions">
              <button type="button" id="ck-home"><i>⌂</i>Home</button>
              <button type="button" id="ck-back"><i>↩</i>Back</button>
              <button type="button" id="ck-music"><i>♫</i>Music</button>
              <button type="button" id="ck-lock"><i>⏻</i>Lock</button>
              <button type="button" id="ck-drive"><i>◈</i>Drive</button>
              <button type="button" id="ck-shot"><i>◉</i>Shot</button>
            </div>
          </section>
          <section class="ck-card ck-right" aria-label="Phone status">
            <div class="ck-label">SYSTEMS</div>
            <div class="ck-big" id="ck-model">This phone</div>
            <div class="ck-sub" id="ck-summary">Unlock the phone to use its controls.</div>
            <div class="ck-facts" style="margin-top:14px">
              <div class="ck-fact"><span>Android</span><span id="ck-sdk">—</span></div>
              <div class="ck-fact"><span>Screen</span><span id="ck-size">—</span></div>
              <div class="ck-fact"><span>Lock</span><span id="ck-locked">—</span></div>
            </div>
          </section>
        </div>
        <section class="ck-card ck-pilot" aria-label="Autopilot">
          <div class="ck-head">
            <div class="ck-label">AUTOPILOT</div>
            <span class="ck-kicker">VISIBLE STEPS · STOP ANY TIME</span>
          </div>
          <form class="ck-form" id="ck-form">
            <input id="ck-goal" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Tell Izuki what to do — open YouTube and search lofi" aria-label="Autopilot goal" />
            <button class="ck-run" id="ck-run" type="submit">Run</button>
          </form>
          <div class="ck-chips" id="ck-chips"></div>
          <div class="ck-log" id="ck-log" aria-live="polite"><div class="ck-empty">Ready. Autopilot opens, searches, taps, types and scrolls — it never sends, pays or deletes.</div></div>
          <div class="ck-note">Android Accessibility control must be on. Every step is shown here; Stop ends it between actions. Locked phones are never touched.</div>
        </section>
      </div>`;
    document.body.appendChild(panel);
    $("open-cockpit")?.addEventListener("click", open);
    $("ck-close").onclick = close;
    $("ck-home").onclick = () => void act("home");
    $("ck-back").onclick = () => void act("back");
    $("ck-music").onclick = () => void n()?.media("playpause");
    $("ck-lock").onclick = () => void act("lock");
    $("ck-drive").onclick = () => { close(); d()?.start?.(); };
    $("ck-shot").onclick = () => void act("screenshot");
    $("ck-form").onsubmit = (event) => {
      event.preventDefault();
      void runGoal();
    };
    const chips = $("ck-chips");
    for (const sample of window.IzukiAutopilot?.samples || []) {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = sample;
      b.onclick = () => {
        $("ck-goal").value = sample;
        void runGoal();
      };
      chips.appendChild(b);
    }
    unsubscribe = window.IzukiAutopilot?.subscribe?.(renderLog) || null;
    window.IzukiCockpit = { open, close };
    panel.addEventListener("click", (event) => { if (event.target === panel) close(); });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !panel.hidden) close();
    });
  }

  async function act(op) {
    if (!n()) return false;
    if (["home", "back", "lock", "screenshot", "recents", "notifications"].includes(op)) {
      return !!(await n().act({ op }))?.done;
    }
    return false;
  }

  async function runGoal() {
    const input = $("ck-goal");
    const goal = input.value.trim();
    if (!goal) { input.focus(); return; }
    input.value = "";
    await window.IzukiAutopilot?.run(goal);
    if (!window.IzukiAutopilot) $("ck-log").innerHTML = '<div class="ck-line bad">Autopilot is not loaded.</div>';
  }

  function renderLog(state) {
    const log = $("ck-log");
    if (!log || !state) return;
    if (!state.log?.length) {
      log.innerHTML = '<div class="ck-empty">Ready. Autopilot opens, searches, taps, types and scrolls — it never sends, pays or deletes.</div>';
      return;
    }
    log.innerHTML = state.log.map((line) => `<div class="ck-line ${esc(line.kind)}">${esc(line.text)}</div>`).join("");
    log.scrollTop = log.scrollHeight;
    const run = $("ck-run");
    if (run) {
      run.textContent = state.running ? "Stop" : "Run";
      run.classList.toggle("stop", state.running);
      run.type = state.running ? "button" : "submit";
      run.onclick = state.running ? (event) => { event.preventDefault(); window.IzukiAutopilot?.stop(); } : null;
    }
  }

  function fmtPct(value) {
    return Number.isFinite(value) && value >= 0 ? `${Math.round(value)}%` : "—";
  }

  function paintBattery() {
    const level = Number.isFinite(device?.battery) && device.battery >= 0
      ? device.battery
      : webBattery ? Math.round(webBattery.level * 100) : null;
    const charging = !!device?.charging || !!webBattery?.charging;
    const ring = $("ck-ring-fill");
    const b = $("ck-battery");
    if (b) b.textContent = level == null ? "--" : `${Math.round(level)}`;
    if (ring) {
      const circumference = 2 * Math.PI * 51;
      ring.style.strokeDasharray = String(circumference);
      ring.style.strokeDashoffset = String(circumference * (1 - Math.max(0, Math.min(100, level ?? 0)) / 100));
      ring.classList.toggle("low", level != null && level <= 20 && !charging);
    }
    const charge = $("ck-charge");
    if (charge) charge.textContent = level == null ? "No battery reading" : charging ? "⚡ Charging" : "On battery";
    const network = $("ck-network");
    if (network) {
      const online = device?.online ?? navigator.onLine;
      network.textContent = online ? (device?.wifi ? "Wi-Fi · online" : "Online") : "Offline";
      network.className = online ? "ok" : "warn";
    }
    const volume = $("ck-volume");
    if (volume) volume.textContent = Number.isFinite(device?.volume) && device.volume >= 0 && device.volumeMax > 0
      ? `${Math.round((device.volume / device.volumeMax) * 100)}%`
      : "—";
    const screen = $("ck-screen");
    if (screen) {
      screen.textContent = device?.screenOn === false ? "Off" : "On";
      screen.className = device?.screenOn === false ? "warn" : "";
    }
    const control = $("ck-control");
    if (control) {
      control.textContent = device?.control ? "On" : "Off";
      control.className = device?.control ? "ok" : "warn";
    }
    const locked = $("ck-locked");
    if (locked) {
      locked.textContent = device?.locked ? "Locked" : "Open";
      locked.className = device?.locked ? "warn" : "ok";
    }
    const model = $("ck-model");
    if (model && device?.model) model.textContent = device.model;
    const sdk = $("ck-sdk");
    if (sdk && device?.sdk) sdk.textContent = `API ${device.sdk}`;
    const size = $("ck-size");
    if (size && device?.width) size.textContent = `${device.width} × ${device.height}`;
    const summary = $("ck-summary");
    if (summary) {
      summary.textContent = device?.locked
        ? "Phone is locked. Unlock it, then run a routine."
        : device?.control
          ? "Control is on. Autopilot can act on this screen."
          : "Accessibility control is off. Enable it once in Settings.";
    }
    const live = $("ck-live");
    const liveText = $("ck-live-text");
    if (live) live.classList.toggle("off", !(device?.online ?? navigator.onLine));
    if (liveText) liveText.textContent = device?.online === false || !navigator.onLine ? "OFFLINE" : "CONNECTED";
    for (const id of ["ck-home", "ck-back", "ck-music", "ck-lock", "ck-shot"]) {
      const el = $(id);
      if (el) el.disabled = !device?.control || !!device?.locked;
    }
    const run = $("ck-run");
    if (run && !window.IzukiAutopilot?.state?.running) run.disabled = !device?.control || !!device?.locked;
    const goal = $("ck-goal");
    if (goal) goal.disabled = !device?.control || !!device?.locked;
  }

  function paintClock() {
    const now = new Date();
    const clock = $("ck-clock");
    if (clock) clock.textContent = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    const date = $("ck-date");
    if (date) date.textContent = now.toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" }).toUpperCase();
  }

  function paintSpeed() {
    const drive = d();
    const active = !!drive?.active;
    const speed = active && Number.isFinite(drive?.speed) ? drive.speed : null;
    const b = $("ck-speed");
    if (b) b.textContent = active ? (speed == null ? "--" : String(Math.round(speed * (drive.perMs || 2.23694)))) : "--";
    const unit = $("ck-unit");
    if (unit) unit.textContent = (drive?.unit || "mph").toUpperCase();
    const mode = $("ck-mode");
    if (mode) mode.textContent = active ? "DRIVE MODE · WATCHING" : "PARKED";
    paintClock();
  }

  async function refreshDevice() {
    const got = await n()?.device?.();
    if (got) device = got;
    paintBattery();
  }

  function open() {
    build();
    const panel = $("izuki-cockpit");
    if (!panel) return;
    panel.hidden = false;
    document.body.style.overflow = "hidden";
    paintBattery();
    paintSpeed();
    void refreshDevice();
    loadBattery();
    clearInterval(timer);
    clearInterval(speedTimer);
    timer = setInterval(() => { void refreshDevice(); }, 4000);
    speedTimer = setInterval(paintSpeed, 500);
  }

  function close() {
    const panel = $("izuki-cockpit");
    if (panel) panel.hidden = true;
    document.body.style.overflow = "";
    clearInterval(timer);
    clearInterval(speedTimer);
    timer = null;
    speedTimer = null;
  }

  function loadBattery() {
    if (!navigator.getBattery) return;
    navigator.getBattery().then((b) => { webBattery = b; paintBattery(); }).catch(() => undefined);
  }

  document.addEventListener("DOMContentLoaded", () => {
    if (!window.IzukiNative?.installed?.()) return;
    build();
  });
})();
