// Drive mode: Izuki as a co-pilot, hands-free, like a car's own assistant.
//
// It rides on the hands-free call (IzukiCore) and adds what a driver needs at
// a glance: your speed, the time and battery, and big buttons. Google Maps
// does the maps — "take me to Walmart" starts its turn-by-turn — so there's
// nothing to keep up to date here. Things a driver says often are done at
// once with no AI ("find gas near me", "play music", "how fast am I going",
// "text that I'm on my way"); anything else goes to Izuki as usual, told to
// keep it short and never ask you to look or type.
//
// On its own, it speaks up when it matters: a long stretch at the wheel, a
// low battery, and (if you set one) a speed you asked to be warned above.
// Fun mode makes it a cheeky road-trip buddy — jokes, roasts, trivia, games.
(() => {
  const $ = (id) => document.getElementById(id);
  const core = () => window.IzukiCore;
  const store = {
    get(k, d) { try { const v = localStorage.getItem("izuki.drive." + k); return v === null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem("izuki.drive." + k, JSON.stringify(v)); } catch { /* storage is optional */ } },
  };
  const metric = !/^en-(US|GB|LR|MM)$/i.test(navigator.language || "en-US");
  const unit = metric ? "km/h" : "mph";
  const perMs = metric ? 3.6 : 2.23694;

  let active = false, fun = store.get("fun", false), started = 0, watch = null, lock = null, timer = null;
  let speed = null, last = null, overSince = 0, warnedAt = 0, breakAt = 0, batteryTold = false, battery = null, awaiting = null;

  // ------------------------------------------------------------ the screen
  const css = `
  #live.driving .lines { display: none; }
  /* No typing at the wheel. */
  #live.driving #live-type { display: none; }
  #live.driving #live-orb { width: min(34vw, 150px); height: min(34vw, 150px); }
  .drive-hud { display: none; }
  #live.driving .drive-hud { display: flex; flex-direction: column; gap: 14px; width: min(100%, 520px); padding: 0 16px; box-sizing: border-box; }
  .drive-top { display: flex; align-items: flex-end; justify-content: space-between; gap: 12px; }
  .drive-speed { font: 800 clamp(56px, 18vw, 96px)/0.9 system-ui, sans-serif; letter-spacing: -2px; font-variant-numeric: tabular-nums; }
  .drive-speed small { font-size: 0.24em; font-weight: 700; letter-spacing: 0; opacity: 0.6; margin-left: 6px; }
  .drive-side { text-align: right; font-size: 15px; opacity: 0.8; line-height: 1.5; font-variant-numeric: tabular-nums; }
  .drive-said { min-height: 2.6em; font-size: 18px; line-height: 1.3; opacity: 0.92; }
  .drive-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
  .drive-grid button { min-height: 76px; border: 0; border-radius: 22px; background: rgba(255,255,255,0.09); color: inherit; font: 700 15px system-ui, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 6px; }
  .drive-grid button span { font-size: 26px; line-height: 1; }
  .drive-grid button:active { transform: scale(0.97); background: rgba(255,255,255,0.16); }
  .drive-grid button[aria-pressed="true"] { background: linear-gradient(135deg, rgba(255,92,170,0.75), rgba(124,92,255,0.75)); }
  .drive-alert { border-radius: 16px; padding: 10px 14px; background: rgba(255,170,60,0.16); color: #ffd28a; font-size: 15px; }
  `;

  function build() {
    if ($("drive-hud")) return;
    const style = document.createElement("style");
    style.textContent = css;
    document.head.appendChild(style);
    const hud = document.createElement("div");
    hud.className = "drive-hud";
    hud.id = "drive-hud";
    hud.innerHTML = `
      <div class="drive-top">
        <div class="drive-speed" id="drive-speed" aria-live="off">--<small>${unit}</small></div>
        <div class="drive-side"><div id="drive-clock"></div><div id="drive-battery"></div><div id="drive-for"></div></div>
      </div>
      <div class="drive-alert" id="drive-alert" hidden></div>
      <div class="drive-said" id="drive-said" aria-live="polite">Where to? Say “take me to…” — or just talk.</div>
      <div class="drive-grid">
        <button type="button" id="drive-nav"><span>🧭</span>Navigate</button>
        <button type="button" id="drive-gas"><span>⛽</span>Gas</button>
        <button type="button" id="drive-food"><span>🍔</span>Food</button>
        <button type="button" id="drive-music"><span>🎵</span>Music</button>
        <button type="button" id="drive-omw"><span>💬</span>On my way</button>
        <button type="button" id="drive-fun" aria-pressed="false"><span>🎉</span>Fun mode</button>
      </div>`;
    const live = $("live");
    live.insertBefore(hud, live.querySelector(".live-bar"));
    $("drive-nav").onclick = () => { awaiting = "destination"; say("Where to?"); };
    $("drive-gas").onclick = () => run(nearby("gas station"));
    $("drive-food").onclick = () => run(nearby("food"));
    $("drive-music").onclick = () => run(music(""));
    $("drive-omw").onclick = () => run(text("I'm on my way"));
    $("drive-fun").onclick = () => run(setFun(!fun));
    // Ending the call ends the drive.
    $("live-end").addEventListener("click", () => stop(true));
  }

  const show = (id, t) => { const el = $(id); if (el) el.textContent = t; };
  function paint() {
    if (!active) return;
    const sp = $("drive-speed");
    if (sp) sp.innerHTML = `${speed === null ? "--" : Math.round(speed * perMs)}<small>${unit}</small>`;
    show("drive-clock", new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }));
    show("drive-battery", battery ? `🔋 ${Math.round(battery.level * 100)}%${battery.charging ? " ⚡" : ""}` : "");
    const mins = Math.floor((Date.now() - started) / 60000);
    show("drive-for", mins < 1 ? "Just set off" : mins < 60 ? `${mins} min driving` : `${Math.floor(mins / 60)} h ${mins % 60} min driving`);
    $("drive-fun")?.setAttribute("aria-pressed", String(fun));
  }
  function alertLine(t) {
    const a = $("drive-alert");
    if (!a) return;
    a.textContent = t;
    a.hidden = !t;
  }

  // ------------------------------------------------------------ speaking
  // Spoken only when Izuki isn't already talking or thinking — never over you.
  const queue = [];
  function say(t) {
    show("drive-said", t);
    const c = core();
    if (!c) return;
    if (c.busy()) { queue.push(t); return; }
    void c.speak(t);
  }
  function flush() {
    const c = core();
    if (queue.length && c && !c.busy()) void c.speak(queue.shift());
  }

  // ------------------------------------------------------------ opening apps
  function open(url) {
    // In the Android app, leaving for a link hands it to the Maps / Spotify /
    // Messages app (Capacitor opens anything off the app's own pages there).
    // In a browser, a new tab keeps Izuki where it is.
    if (window.Capacitor?.isNativePlatform?.()) { location.href = url; return; }
    const w = window.open(url, "_blank", "noopener");
    if (!w) location.assign(url);
  }
  const enc = encodeURIComponent;
  const navigateTo = (place) => ({
    say: `Taking you to ${place} — Google Maps has the turns. I'm still here if you need me.`,
    then: () => open(`https://www.google.com/maps/dir/?api=1&destination=${enc(place)}&travelmode=driving&dir_action=navigate`),
  });
  const nearby = (what) => ({
    say: `Here's ${/s$/.test(what) ? "" : "the nearest "}${what} near you in Google Maps.`.replace("the nearest food", "food"),
    then: () => open(`https://www.google.com/maps/search/?api=1&query=${enc(what + " near me")}`),
  });
  function music(what) {
    const spotify = /spotify/i.test(what);
    const q = what.replace(/\s*on\s+(spotify|youtube music|youtube)\s*$/i, "").trim();
    return {
      say: q ? `Playing ${q}${spotify ? " on Spotify" : ""}.` : "Opening your music.",
      then: () => open(spotify ? `https://open.spotify.com/search/${enc(q)}` : q ? `https://music.youtube.com/search?q=${enc(q)}` : "https://music.youtube.com/"),
    };
  }
  const text = (body) => ({
    say: "Opening Messages with that written — just pick who it's for.",
    then: () => open(`sms:?&body=${enc(body)}`),
  });
  function setFun(on) {
    fun = on;
    store.set("fun", fun);
    paint();
    return { say: fun ? "Fun mode on. Buckle up — I've got jokes, games and opinions." : "Fun mode off. Back to sensible co-pilot." };
  }
  /** A button: say it, then open the app once the words are out. */
  function run(r) {
    if (!r) return;
    show("drive-said", r.say);
    const c = core();
    Promise.resolve(c ? c.speak(r.say) : null).catch(() => undefined).finally(() => r.then?.());
  }

  // ------------------------------------------------------------ what you say
  const START = /^(?:start |open |turn on |go (?:in|into) )?(?:drive|driving|car) mode$|^i'?m (?:driving|in the car)(?: now)?$|^let'?s (?:drive|go for a drive|roll)$/i;
  const STOP = /^(?:stop|end|exit|close|turn off|leave) (?:drive|driving|car) mode$|^(?:i'?m|we'?re) (?:here|parked|home)$|^(?:i'?ve |we'?ve )?arrived$/i;
  function gate(raw) {
    const said = String(raw || "").trim().replace(/[.!?]+$/, "");
    if (!said) return null;
    if (START.test(said)) { start(); return { say: "Drive mode's on. Where to? Or just talk — I'll keep it short." }; }
    if (!active) return null;
    if (STOP.test(said)) { stop(false); return { say: "Drive mode off. Nice driving." }; }
    if (awaiting === "destination") {
      awaiting = null;
      if (!/^(?:never ?mind|cancel|nowhere|no)$/i.test(said)) return navigateTo(said.replace(/^(?:to|go to|take me to)\s+/i, ""));
      return { say: "Okay." };
    }
    let m;
    if ((m = said.match(/^(?:take me|navigate|directions|drive me|get me|route me|head|let'?s go)(?: back)? (?:to |home$)(.*)$/i)) || (m = said.match(/^how do i get (?:to )?(.+)$/i))) {
      const place = (m[1] || "").trim() || "home";
      return navigateTo(place);
    }
    if ((m = said.match(/^(?:find|where'?s|where is|show me|any|is there an?)\s+(?:the |a |an |some )?(?:nearest |closest )?(.+?)\s*(?:near me|nearby|around here|close by|on the way|near here)$/i))
      || (m = said.match(/^(?:nearest|closest)\s+(.+)$/i))
      || (m = said.match(/^find (?:me )?(?:a |an |the |some )(?!my\b)(.+)$/i))) {
      return nearby(m[1].trim());
    }
    if (/^(?:i need|i'?m low on|low on) (?:gas|fuel|petrol)$/i.test(said)) return nearby("gas station");
    if (/^(?:i'?m hungry|i need food|i need coffee)$/i.test(said)) return nearby(/coffee/i.test(said) ? "coffee" : "food");
    // "Play trivia" / "play a game" is for Izuki, not the music app.
    if ((m = said.match(/^(?:play|put on)\s+(.+)$/i)) && !/\b(?:game|games|trivia|would you rather|20 questions|twenty questions|i spy|riddles?|quiz)\b/i.test(m[1])) {
      const what = /^(?:some )?(?:music|songs?|my music|my playlist|something)$/i.test(m[1].trim()) ? "" : m[1];
      return music(what);
    }
    if (/^(?:how fast am i going|what'?s my speed|my speed|speed)$/i.test(said)) {
      return { say: speed === null ? "I can't tell your speed yet — I need your location to see it." : `You're doing ${Math.round(speed * perMs)} ${metric ? "kilometres an hour" : "miles an hour"}.` };
    }
    if (/^(?:text|message|tell)\b/i.test(said) && (m = said.match(/\b(?:i'?m|im|i am)\s+(on my way|running (?:a bit )?late|almost there|close|nearly there|\d+\s*(?:min(?:ute)?s?)\s*away)\b/i))) {
      return text(`I'm ${m[1]}`);
    }
    if (/^(?:turn on |start |go )?(?:fun|party|unhinged|road ?trip) mode(?: on)?$|^be fun$/i.test(said)) return setFun(true);
    if (/^(?:turn off |stop |end )(?:fun|party|unhinged|road ?trip) mode$|^(?:fun|party) mode off$|^be (?:normal|serious)$/i.test(said)) return setFun(false);
    return null;
  }

  /** What the brain is told while you drive. */
  function system() {
    if (!active) return "";
    const base = "The user is DRIVING right now. Answer in one or two short spoken sentences. Never ask them to look at the screen, read, type or tap; never suggest anything that takes their eyes off the road. For directions, places, music or texts, Izuki opens Google Maps, the music app or Messages itself — so if they want one, tell them to say \"take me to…\", \"find … near me\", \"play …\" or \"text that I'm on my way\".";
    const party = "FUN MODE is on: you're their road-trip co-pilot — playful, cheeky and bold. Quick jokes, playful roasts, hot takes, trivia, would-you-rather and road-trip games when they're up for it. Banter like a close friend in the passenger seat; nothing hateful, and nothing that pulls their attention from driving.";
    return fun ? base + "\n" + party : base;
  }

  // ------------------------------------------------------------ watching
  function onPosition(p) {
    const c = p.coords;
    let v = Number.isFinite(c.speed) && c.speed !== null ? c.speed : null;
    if (v === null && last) {
      const dt = (p.timestamp - last.t) / 1000;
      const R = 6371000, toRad = (d) => (d * Math.PI) / 180;
      const dLat = toRad(c.latitude - last.lat), dLon = toRad(c.longitude - last.lon);
      const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(last.lat)) * Math.cos(toRad(c.latitude)) * Math.sin(dLon / 2) ** 2;
      const d = 2 * R * Math.asin(Math.sqrt(a));
      if (dt > 0.5 && dt < 30) v = d / dt;
    }
    last = { lat: c.latitude, lon: c.longitude, t: p.timestamp };
    // Ignore GPS jitter when stopped.
    speed = v === null ? speed : v < 0.8 ? 0 : v;
    paint();
  }
  function check() {
    if (!active) return;
    paint();
    flush();
    const now = Date.now();
    // A long stretch at the wheel: every two hours.
    if (now - started >= 2 * 3600_000 && now - breakAt >= 2 * 3600_000) {
      breakAt = now;
      const h = Math.round((now - started) / 3600_000);
      say(`You've been driving about ${h} hour${h === 1 ? "" : "s"}. A quick break soon? Say “find a rest stop near me”.`);
    }
    // Battery: once, when it gets low and isn't charging.
    if (battery && !battery.charging && battery.level <= 0.2 && !batteryTold) {
      batteryTold = true;
      alertLine(`Phone battery ${Math.round(battery.level * 100)}%`);
      say(`Heads up — your phone's at ${Math.round(battery.level * 100)} percent. Plug it in if you can.`);
    }
    if (battery && battery.charging) { batteryTold = false; alertLine(""); }
    // Your own speed warning (off unless set), after 8 seconds over it.
    const limit = Number(store.get("warnAbove", 0));
    const over = limit > 0 && speed !== null && speed * perMs > limit;
    if (!over) overSince = 0;
    else if (!overSince) overSince = now;
    else if (now - overSince > 8000 && now - warnedAt > 120_000) {
      warnedAt = now;
      say(`Easy — you're doing ${Math.round(speed * perMs)}.`);
    }
  }

  async function keepAwake() {
    try { lock = await navigator.wakeLock?.request("screen"); } catch { lock = null; }
  }
  document.addEventListener("visibilitychange", () => { if (active && document.visibilityState === "visible") void keepAwake(); });

  // ------------------------------------------------------------ on / off
  function start() {
    if (active) return;
    build();
    active = true;
    started = Date.now();
    breakAt = started;
    batteryTold = false;
    $("live").classList.add("driving");
    const c = core();
    if (c && !c.calling()) c.startCall();
    void keepAwake();
    try { watch = navigator.geolocation?.watchPosition(onPosition, () => undefined, { enableHighAccuracy: true, maximumAge: 1000, timeout: 15000 }); } catch { watch = null; }
    void navigator.getBattery?.().then((b) => { battery = b; paint(); }).catch(() => undefined);
    clearInterval(timer);
    timer = setInterval(check, 5000);
    paint();
  }
  function stop(fromEnd) {
    if (!active) return;
    active = false;
    awaiting = null;
    // Nothing left over to say on the next drive.
    queue.length = 0;
    $("live")?.classList.remove("driving");
    if (watch !== null) try { navigator.geolocation.clearWatch(watch); } catch { /* fine */ }
    watch = null;
    clearInterval(timer);
    try { void lock?.release(); } catch { /* fine */ }
    lock = null;
    speed = null;
    alertLine("");
    if (!fromEnd) { /* the call carries on — only drive mode ends */ }
  }

  window.IzukiDrive = {
    gate,
    system,
    start,
    stop: () => stop(false),
    get active() { return active; },
    get fun() { return fun; },
    /** Warn above this speed in the local unit (0 = never). */
    warnAbove(v) { store.set("warnAbove", Math.max(0, Number(v) || 0)); },
    unit,
  };
  document.addEventListener("DOMContentLoaded", () => {
    const b = $("go-drive");
    if (b) b.onclick = () => { start(); say("Drive mode's on. Where to?"); };
    const w = $("drive-warn");
    if (w) {
      w.value = String(store.get("warnAbove", 0) || "");
      w.placeholder = `Off (${unit})`;
      w.onchange = () => window.IzukiDrive.warnAbove(w.value);
    }
  });
})();
