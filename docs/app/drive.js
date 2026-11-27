// Drive mode: Izuki as a co-pilot, hands-free, like a car's own assistant.
//
// It rides on the hands-free call (IzukiCore) and adds what a driver needs at
// a glance: your speed, the time and battery, and big buttons. Google Maps
// does the turns — "take me to Walmart" starts its turn-by-turn — and Izuki
// looks up what's left on its own. Things a driver says often are done at
// once with no AI ("find gas near me", "play music", "how fast am I going",
// "text that I'm on my way"); anything else goes to Izuki as usual, told to
// keep it short and never ask you to look or type.
//
// On its own, it speaks up when it matters: a long stretch at the wheel, a
// low battery, and (if you set one) a speed you asked to be warned above.
//
// Once it knows where you're going it rides along, like a car's own co-pilot:
// it measures the trip itself from location fixes — distance covered, time at
// the wheel — and speaks at real moments (a check-in on a long leg, a word in
// a crawl, a nudge when a long stop looks like arrival).
//
// It can also say what's left. The place you named is looked up on OpenStreetMap
// and routed from your current fix to that point, so the trip line and your
// questions carry a real remaining distance and drive time — the road's usual
// time, never live traffic. When the lookup or the router can't answer, it says
// exactly that instead of guessing. Maps still owns the turns.
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
  let trip = null, rideAlong = store.get("ride", true), crawlSince = 0, stoppedSince = 0;
  let ambient = "", ambientAt = 0, savedAt = 0, overMaps = false;
  const rideSaid = {};   // one companion line per trip per moment

  // ------------------------------------------------------------ the screen
  const css = `
  #live.driving .lines { display: none; }
  /* Nothing opens the keyboard by itself at the wheel — but the Type button
     stays, so "Where to?" can be answered by typing when the car is parked. */
  #live.driving #live-type { opacity: 0.9; }
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
  .drive-trip { display: none; align-items: baseline; gap: 6px; font-size: 15px; opacity: 0.85; font-variant-numeric: tabular-nums; }
  .drive-trip.on { display: flex; }
  .drive-trip b { font-weight: 700; }
  /* A phone on its side is only about 360 px tall and the drive HUD is taller
     than that, so the six buttons used to fall off the bottom with no way to
     reach them. Sideways, the orb takes the left column, the speed and the
     buttons the right, and the column scrolls inside itself if a short screen
     plus a large system font still does not fit. Portrait is untouched. */
  @media (orientation: landscape) and (max-height: 540px) {
    #live.driving { display: grid; grid-template-columns: minmax(0, 0.75fr) minmax(0, 1.25fr); grid-template-rows: auto minmax(0, 1fr) auto;
      grid-template-areas: "top top" "orb hud" "bar bar"; align-items: center; column-gap: 14px; row-gap: 6px; overflow-y: auto; overflow-x: hidden;
      padding: calc(var(--safe-top) + 8px) 14px calc(var(--safe-bottom) + 8px); }
    #live.driving .live-top { grid-area: top; text-align: left; }
    #live.driving .live-top b { display: inline; font-size: 15px; }
    #live.driving .live-top span { font-size: 11.5px; }
    #live.driving #live-orb { grid-area: orb; justify-self: center; width: min(34vh, 132px); height: min(34vh, 132px); }
    #live.driving .drive-hud { grid-area: hud; align-self: stretch; width: 100%; max-width: none; min-height: 0; padding: 0; gap: 7px;
      overflow-y: auto; overscroll-behavior: contain; -webkit-overflow-scrolling: touch; }
    #live.driving .drive-speed { font-size: clamp(32px, 11vh, 52px); letter-spacing: -1px; }
    #live.driving .drive-side { font-size: 12px; line-height: 1.3; }
    #live.driving .drive-said { min-height: 0; font-size: 14px; }
    #live.driving .drive-alert { font-size: 13px; padding: 6px 10px; }
    #live.driving .drive-grid { gap: 6px; }
    #live.driving .drive-grid button { min-height: 46px; border-radius: 14px; gap: 2px; font-size: 12px; }
    #live.driving .drive-grid button span { font-size: 17px; }
    #live.driving .live-bar { grid-area: bar; justify-self: center; gap: 20px; align-items: center; }
    #live.driving .round i { width: 46px; height: 46px; }
    #live.driving .round.end i { width: 52px; height: 52px; }
    #live.driving .round span { font-size: 11px; }
    #live.driving .round svg { width: 20px; height: 20px; }
  }
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
      <div class="drive-trip" id="drive-trip"></div>
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
    const tr = $("drive-trip");
    if (tr) {
      const line = trip ? tripLine() : "";
      tr.textContent = line;
      tr.classList.toggle("on", Boolean(line));
    }
  }
  function alertLine(t) {
    const a = $("drive-alert");
    if (!a) return;
    a.textContent = t;
    a.hidden = !t;
  }

  // ------------------------------------------------------------ the trip
  // What Izuki can honestly know about a drive it didn't plan: the place you
  // named, how far the phone has travelled since you set off, and how long
  // you've been at it. Maps owns the route, the turns and the arrival time.
  function metresBetween(a, b) {
    const R = 6371000, toRad = (x) => (x * Math.PI) / 180;
    const dLat = toRad(b.lat - a.lat), dLon = toRad(b.lon - a.lon);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  }
  /** How far you've come, in the units you think in. */
  function far() {
    const m = trip ? trip.metres : 0;
    if (metric) return m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`;
    return `${(m / 1609.34).toFixed(1)} mi`;
  }
  const tripMins = () => (trip ? Math.max(0, Math.round((Date.now() - trip.at) / 60000)) : 0);
  function tripLine() {
    if (!trip) return "";
    const mins = tripMins();
    const bits = [`To ${trip.place}`];
    if (trip.found === "no" && !trip.route) bits.push(trip.why === "address" ? "no saved address" : "place not found");
    // With the router's answer, what's left matters more than what's covered —
    // the time at the wheel is already in the corner.
    if (trip.route) bits.push(`${leftText(trip.route.metres)} left`, `about ${timeText(trip.route.secs)}`);
    else bits.push(`${far()} covered`, mins < 1 ? "just set off" : `${mins} min`);
    return bits.join(" · ");
  }

  // ------------------------------------------------------- out of sight
  // Google Maps takes the screen for the drive itself, so the app goes with
  // it. The orb over Maps is then the only place Izuki can still show what's
  // left — and it says the same honest numbers the trip line does, never a
  // guess.
  function ambientLine() {
    const r = trip && trip.route;
    return r ? `${timeText(r.secs)} · ${leftText(r.metres)} to ${trip.place}` : "";
  }
  // The page already keeps a local list of what went wrong (shared/bugs.js).
  // These are the places drive mode used to fail in silence: now each one says
  // so, on this phone, for whoever has to fix it.
  function noteFact(name, value) {
    try { window.izukiBugs?.fact(name, value); } catch { /* notes are optional */ }
  }
  function noteProblem(what, extra) {
    try { window.izukiBugs?.report(what, extra); } catch { /* notes are optional */ }
  }

  function showAmbient(force) {
    const native = window.IzukiNative;
    if (!native || typeof native.orb !== "function") return;
    // Whether Android took the line at all is the first thing to know when the
    // orb "didn't show anything".
    const push = (state, text, lease) => {
      try {
        const p = native.orb(state, text, lease);
        noteFact("orb", text ? "trip line sent" : "resting");
        if (p && typeof p.then === "function") p.catch(() => noteFact("orb", "Android refused the orb"));
      } catch (e) {
        noteFact("orb", "no orb bridge" + (e && e.message ? ": " + e.message : ""));
      }
    };
    // In the app the trip line under the speed already says this.
    const line = active && document.visibilityState !== "visible" ? ambientLine() : "";
    const now = Date.now();
    if (!line) {
      if (!ambient) return;
      ambient = ""; ambientAt = 0;
      // Hand the orb back the way Maps left it.
      push("rest", overMaps ? "Maps is driving — tap to talk" : "", 0);
      return;
    }
    // The orb's lease runs out in two minutes and its words go with it, so the
    // line is renewed while it stands — but re-sent only when it changes,
    // because a caption that rewrites itself every five seconds is noise at
    // the wheel.
    if (!force && line === ambient && now - ambientAt < 50_000) return;
    ambient = line; ambientAt = now;
    push("trip", line, 120_000);
  }

  // A drive outlives the screen. Leaving for Google Maps is normal; Android
  // ending the page is not — and neither should cost you the destination. The
  // place, the minutes and the distance covered are written down as the drive
  // goes; the route is not, because by the time it came back it would be a
  // guess, so it is asked for again from wherever the next fix is.
  function saveTrip() {
    savedAt = Date.now();
    store.set("trip", trip
      ? { place: trip.place, at: trip.at, metres: trip.metres, dest: trip.dest, found: trip.found, why: trip.why, run: active, maps: overMaps }
      : null);
  }
  function resumeTrip() {
    const s = store.get("trip", null);
    if (!s || !s.place || !Number.isFinite(s.at)) return;
    // Written down mid-drive, and recent. Hours later it is somebody else's
    // errand, not this one.
    if (!s.run || Date.now() - s.at > 3 * 3600_000) { store.set("trip", null); return; }
    trip = { place: s.place, at: s.at, metres: Math.max(0, Number(s.metres) || 0), anchor: null, dest: s.dest || null, route: null, found: s.found || "asking", why: s.why || "" };
    overMaps = Boolean(s.maps);
  }

  function beginTrip(place) {
    // The last fix becomes the starting anchor, so the first stretch counts.
    trip = { place, at: Date.now(), metres: 0, anchor: last ? { lat: last.lat, lon: last.lon, t: last.t } : null, dest: null, route: null, found: "asking", why: "" };
    // "Take me home" has no address to look up. Saying so beats routing to a
    // random place that happens to be called Home.
    if (/^(?:home|work|the office|my office)$/i.test(place)) { trip.found = "no"; trip.why = "address"; }
    crawlSince = 0;
    stoppedSince = 0;
    planning = null;
    // A new destination is a new drive: nothing from the last one carries over.
    overMaps = false;
    for (const k of Object.keys(rideSaid)) delete rideSaid[k];
    saveTrip();
    void findPlace(place);
  }

  // ------------------------------------------------------------ what's left
  // The place you named becomes a point on the map, and the drive is routed
  // from your current fix to it. That is what lets the trip line and your
  // questions carry a real remaining distance and time.
  //
  // Free, keyless OpenStreetMap services, called straight from the browser:
  // Photon for the lookup (Open-Meteo's gazetteer if that has nothing) and OSRM
  // for the route. One request at a time, and not again for 90 seconds. Either
  // can fail, and then the answer is "I can't tell you" — never a guess.
  const ROUTER = "https://router.project-osrm.org/route/v1/driving/";
  const LOOKUPS = [
    (q) => `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=1&lang=en${last ? `&lat=${last.lat}&lon=${last.lon}` : ""}`,
    (q) => `https://geocoding-api.open-meteo.com/v1/search?count=1&language=en&name=${encodeURIComponent(q)}`,
  ];
  let planning = null;

  function getJSON(url, ms = 7000) {
    const Ctl = typeof AbortController === "function" ? AbortController : null;
    const stop = Ctl ? new Ctl() : null;
    const timer = stop ? setTimeout(() => stop.abort(), ms) : 0;
    return Promise.resolve(fetch(url, { signal: stop ? stop.signal : undefined, headers: { Accept: "application/json" }, cache: "no-store" }))
      .then((r) => (r && r.ok ? r.json() : Promise.reject(new Error("http " + (r && r.status)))))
      .finally(() => { if (timer) clearTimeout(timer); });
  }

  /** Photon is fuzzy: it will find something, anywhere. Does your word appear? */
  function soundsRight(place, hit) {
    const words = String(place).toLowerCase().match(/[a-z0-9]{3,}/g) || [];
    const hay = [hit.name, hit.street, hit.city, hit.state, hit.admin1, hit.postcode, hit.country].filter(Boolean).join(" ").toLowerCase();
    return words.length > 0 && words.some((w) => hay.includes(w));
  }

  /** The place, as a point — or an honest "not found". */
  async function findPlace(place) {
    const t = trip;
    if (!t || t.place !== place || t.why === "address") return;
    for (const ask of LOOKUPS) {
      try {
        const d = await getJSON(ask(place));
        const f = d && d.features && d.features[0];
        const c = f && f.geometry && f.geometry.coordinates;
        const g = d && d.results && d.results[0];
        // A fuzzy hit that shares no word with what you said is a different
        // place — refusing it is better than routing you somewhere random.
        const hit = Array.isArray(c) && c.length === 2 && soundsRight(place, f.properties || {})
          ? { lat: c[1], lon: c[0] }
          : g && Number.isFinite(g.latitude) && soundsRight(place, g) ? { lat: g.latitude, lon: g.longitude } : null;
        if (hit) {
          if (trip !== t) return;            // a newer destination won
          t.dest = hit;
          t.found = "yes";
          saveTrip();
          await plan(true);
          return;
        }
      } catch (e) {
        // Both gazetteers failing is why "I couldn't find it" happens; the
        // reason is worth keeping.
        noteFact("place lookup", (e && e.message) || "failed");
      }
    }
    if (trip === t) { t.found = "no"; paint(); saveTrip(); }
  }

  /** What the router says is left from here — null when it won't say. */
  async function routeLeft(t) {
    if (!t || !t.dest || !last) return null;
    try {
      const d = await getJSON(`${ROUTER}${last.lon},${last.lat};${t.dest.lon},${t.dest.lat}?overview=false&steps=false`);
      const r = d && d.code === "Ok" && d.routes && d.routes[0];
      if (!r || !Number.isFinite(r.distance) || !Number.isFinite(r.duration)) return null;
      return { metres: r.distance, secs: r.duration, at: Date.now() };
    } catch (e) {
      noteFact("route", (e && e.message) || "failed");
      return null;
    }
  }

  /** Ask again — unless it just answered, and never two at once. */
  function plan(force) {
    // The trip this answer belongs to: a new destination named while the old
    // request is still out must never inherit the old trip's numbers.
    const t = trip;
    if (!t || !t.dest) return Promise.resolve(null);
    if (planning) return planning;
    if (!force && t.route && Date.now() - t.route.at < 90_000) return Promise.resolve(t.route);
    if (!last) return Promise.resolve(t.route || null);
    const asked = routeLeft(t).then((r) => {
      if (planning === asked) planning = null;
      if (trip !== t) return null;
      if (r) t.route = r;
      paint();
      saveTrip();
      // The route just landed, so say it on the orb now: waiting for the next
      // five-second check can be a whole minute behind Maps, where background
      // timers are throttled.
      if (r) showAmbient(false);
      return t.route || null;
    });
    planning = asked;
    return asked;
  }

  /** Remaining distance, in the units you think in. */
  function leftText(m) {
    if (!Number.isFinite(m) || m < 0) return "";
    if (metric) return m < 1000 ? `${Math.max(10, Math.round(m / 10) * 10)} m` : `${(m / 1000).toFixed(m < 9950 ? 1 : 0)} km`;
    const mi = m / 1609.34;
    return mi < 0.19 ? `${Math.max(50, Math.round(m / 0.3048 / 50) * 50)} ft` : `${mi.toFixed(mi < 9.95 ? 1 : 0)} mi`;
  }
  /** A drive time, rounded the way a person says it. */
  function timeText(s) {
    const n = Math.max(1, Math.round(s / 60));
    if (n < 60) return `${n} min`;
    const h = Math.floor(n / 60), rest = n % 60;
    return rest ? `${h} h ${rest} min` : `${h} h`;
  }
  /** Why there's no answer, in words that don't pretend. */
  const noPlaceSay = () => (trip.why === "address"
    ? `I don't have a saved ${trip.place} address, so I can't tell you what's left — Google Maps still has the turns.`
    : `I couldn't find ${trip.place} on the map, so I can't tell you what's left — Google Maps still has the turns.`);
  /** The route's own numbers, spoken. */
  function leftSay() {
    const r = trip && trip.route;
    if (!r) return "";
    const head = r.metres < 40
      ? `You're at ${trip.place} — about ${leftText(r.metres)} to the pin.`
      : `About ${timeText(r.secs)} and ${leftText(r.metres)} to ${trip.place}.`;
    // The router plans a normal drive, not today's traffic. Say so once.
    if (!rideSaid.traffic) { rideSaid.traffic = true; return `${head} That's the road's usual time, not live traffic.`; }
    return head;
  }
  /** "How much longer?" — the router's answer, or an honest no. */
  function wayAhead() {
    if (!trip) return { say: "No destination yet — say “take me to…” and I'll ride along." };
    if (trip.route && Date.now() - trip.route.at < 120_000) return { say: leftSay() };
    if (trip.found === "no") return { say: noPlaceSay() };
    return {
      say: "One sec — checking what's left.",
      // The route arrives after that sentence, so it's the next thing said.
      then: () => {
        void plan(true).then((r) => {
          const good = r && Date.now() - r.at < 300_000;
          say(good ? leftSay()
            : `I can't reach the route service right now, so what's left is only what I've measured — ${far()} covered so far. Google Maps has the turns and the arrival time.`);
        });
      },
    };
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
    // Keep the glass orb above it so Izuki is still one tap away.
    if (window.Capacitor?.isNativePlatform?.()) {
      // Keep the glass orb above the app we are leaving for — resting, not
      // "Listening…", because nothing is listening.
      void window.IzukiNative?.orb?.("rest", "", 0);
      location.href = url;
      return;
    }
    const w = window.open(url, "_blank", "noopener");
    if (!w) location.assign(url);
  }
  const enc = encodeURIComponent;

  const navigateTo = (place) => {
    if (active) beginTrip(place);
    return {
      say: `Taking you to ${place} — Google Maps has the turns. I'll ride along.`,
      then: () => {
        const web = `https://www.google.com/maps/dir/?api=1&destination=${enc(place)}&travelmode=driving&dir_action=navigate`;
        const native = window.IzukiNative;
        // Android opens Maps' own turn-by-turn screen directly. If that bridge is
        // missing, the web directions still work.
        if (native?.installed?.() && native.navigate) {
          // navigate() opens turn-by-turn and raises the orb itself. If Android
          // only had a place search, keep the trip going with web directions.
          void native.navigate(place).then((r) => {
            if (!r || r.navigation === false) { open(web); return; }
            // Maps owns the screen from here: the orb is what still shows.
            overMaps = true;
            saveTrip();
          }).catch(() => open(web));
          return;
        }
        open(web);
      },
    };
  };
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
    if (STOP.test(said)) {
      const done = trip ? `Drive mode off — ${far()} covered. Nice driving.` : "Drive mode off. Nice driving.";
      stop(false);
      return { say: done };
    }
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
    // The drive itself: answered with what the phone really measured.
    if (/^(?:how'?s|how is) (?:the )?(?:drive|ride|trip)(?: going)?$|^how far (?:have we|have i)(?: gone| come| driven)$|^how long have (?:we|i) been driving$/i.test(said)) {
      if (!trip) return { say: "No destination yet — say “take me to…” and I'll ride along." };
      const r = trip.route;
      return { say: `${trip.place}: ${far()} covered in ${tripMins()} minutes${r ? `, ${leftText(r.metres)} left, about ${timeText(r.secs)}` : ""}.` };
    }
    // How long is left: the router's own answer, or an honest no.
    if (/^how (?:much )?(?:long(?:er)?|further|far(?:ther)?)(?: (?:is|to go|left|now|more))?(?: (?:is )?(?:it|left|to go|away))?$/i.test(said)
      || /^how (?:much )?(?:long|far) (?:until|till) (?:we|i|you) (?:get|are|arrive)(?: there)?$/i.test(said)
      || /^when (?:will|are) (?:we|i|you) (?:be )?(?:there|arrive|get there|getting there)$/i.test(said)
      || /^(?:what'?s|whats|what is) (?:the |my )?(?:eta|arrival time|time of arrival)$|^(?:eta|time left|remaining time|time to go)$/i.test(said)) {
      return wayAhead();
    }
    if (/^where (?:are we|am i) going$|^what'?s the destination$/i.test(said)) {
      return { say: trip ? `${trip.place}.` : "Nothing yet — say “take me to…” and I'll take you." };
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
    const base = "The user is DRIVING right now. Answer in one or two short spoken sentences. Never ask them to look at the screen, read, type or tap; never suggest anything that takes their eyes off the road. You do not have the drive's numbers yourself, and you must never invent a route, a remaining distance, an arrival time, traffic or delays. Izuki does measure the trip and asks OpenStreetMap's router for the real distance and time left — so if they ask how long is left, tell them to say the words “how long is left” and Izuki answers with those numbers. The turns stay with Google Maps. — never invent them; if asked, say it only knows how far you've come and how long you've been driving. For directions, places, music or texts, Izuki opens Google Maps, the music app or Messages itself — so if they want one, tell them to say \"take me to…\", \"find … near me\", \"play …\" or \"text that I'm on my way\".";
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
    if (trip) {
      if (!trip.anchor) trip.anchor = { lat: c.latitude, lon: c.longitude, t: p.timestamp };
      else {
        const step = metresBetween(trip.anchor, { lat: c.latitude, lon: c.longitude });
        const gap = (p.timestamp - trip.anchor.t) / 1000;
        // A few metres is jitter while you sit at a light. A jump after a long
        // gap is a lost fix, not travel — re-anchor instead of inventing km.
        if (step >= 4) {
          if (!(step > 70 && gap > 60)) trip.metres += step;
          trip.anchor = { lat: c.latitude, lon: c.longitude, t: p.timestamp };
        }
      }
    }
    // Ignore GPS jitter when stopped.
    speed = v === null ? speed : v < 0.8 ? 0 : v;
    paint();
  }
  function check() {
    if (!active) return;
    paint();
    flush();
    const now = Date.now();
    // What's left, from the router: refreshed as you drive, one request at a
    // time, and never more often than every 90 seconds.
    if (trip && trip.dest && last && (!trip.route || now - trip.route.at > 90_000)) void plan(false);
    // The trip is written down as it goes, so a reload — or Android ending the
    // page while Maps has the screen — picks it back up instead of losing it.
    if (trip && now - savedAt > 15_000) saveTrip();
    // What's left, on the orb, while the app is out of sight.
    showAmbient(false);
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

    // Riding along: only with a destination, only at moments the phone can
    // actually see, and once each. Quiet is the default in between.
    if (trip && rideAlong) {
      const mins = tripMins();
      const rolling = speed !== null && speed * perMs >= 1;
      const mark = mins >= 45 ? Math.floor(mins / 30) * 30 : mins >= 15 ? 15 : 0;
      if (mark && !rideSaid["m" + mark] && trip.metres >= 300) {
        rideSaid["m" + mark] = true;
        say(`${mark} minutes into the drive to ${trip.place} — ${far()} covered. Maps still has the turns.`);
      }
      // What's left really moved: the road opened up, or it closed. Say the
      // new number instead of waiting to be asked — once per real drop, never
      // twice within three minutes, only while actually moving, and never on
      // the approach where "almost there" is the line.
      if (trip.route && !rideSaid.near) {
        const secs = trip.route.secs;
        if (rideSaid.leftSecs === undefined) rideSaid.leftSecs = secs;
        else if (secs > rideSaid.leftSecs) rideSaid.leftSecs = secs;
        else if (
          rideSaid.leftSecs - secs >= 180 &&
          now - (rideSaid.leftAt || 0) >= 180_000 &&
          rolling &&
          speed * perMs >= 5 &&
          trip.route.metres > 800
        ) {
          rideSaid.leftSecs = secs;
          rideSaid.leftAt = now;
          say(`Now about ${timeText(secs)} and ${leftText(trip.route.metres)} to ${trip.place}.`);
        }
      }
      if (rolling && speed * perMs < 6) { if (!crawlSince) crawlSince = now; } else crawlSince = 0;
      if (crawlSince && now - crawlSince > 90_000 && !rideSaid.crawl) {
        rideSaid.crawl = true;
        say("Looks like we're crawling. No rush — I'll stay quiet and keep an eye out.");
      }
      // Nearly there, from the router's own distance: said once, and only if
      // it really is close.
      if (trip.route && trip.route.metres <= 400 && !rideSaid.near) {
        rideSaid.near = true;
        say(`Almost there — ${leftText(trip.route.metres)} to ${trip.place}.`);
      }
      const atPin = Boolean(trip.route) && trip.route.metres <= 300;
      const halted = speed !== null && speed * perMs < 1;
      if (halted && (trip.metres >= 500 || atPin)) { if (!stoppedSince) stoppedSince = now; } else stoppedSince = 0;
      if (stoppedSince && now - stoppedSince > 180_000 && !rideSaid.arrive) {
        rideSaid.arrive = true;
        say(atPin
          ? `We've been stopped a few minutes and ${trip.place} should be right here — say “we're here” and I'll end Drive mode.`
          : `We've been stopped a few minutes — is this ${trip.place}? Say “we're here” and I'll end Drive mode.`);
      }
    }

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
  document.addEventListener("visibilitychange", () => {
    if (!active) return;
    if (document.visibilityState === "visible") void keepAwake();
    // Out from under the app, or back in it: the orb carries the trip line, or
    // hands it back to the screen.
    showAmbient(true);
  });

  // Why there's no fix, said once per reason rather than on every failed read.
  let geoWhy = "";
  function onGeoError(err) {
    const code = err && typeof err.code === "number" ? err.code : 0;
    const why = code === 1 ? "denied" : code === 2 ? "unavailable" : code === 3 ? "timed out" : "failed";
    noteFact("location", why);
    if (geoWhy === why) return;
    geoWhy = why;
    noteProblem("Drive mode: location " + why + (err && err.message ? " — " + err.message : ""));
  }

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
    void navigator.permissions?.query?.({ name: "geolocation" })
      .then((p) => noteFact("location permission", p && p.state))
      .catch(() => undefined);
    try {
      watch = navigator.geolocation?.watchPosition(onPosition, onGeoError, { enableHighAccuracy: true, maximumAge: 1000, timeout: 15000 });
    } catch (e) {
      watch = null;
      noteProblem("Drive mode: no location watch — " + ((e && e.message) || e));
    }
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
    trip = null;
    planning = null;
    saveTrip();          // nothing left over to pick up on the next launch
    showAmbient(true);   // the orb goes back to resting, or to its Maps hint
    overMaps = false;
    crawlSince = 0;
    stoppedSince = 0;
    for (const k of Object.keys(rideSaid)) delete rideSaid[k];
    if (!fromEnd) { /* the call carries on — only drive mode ends */ }
  }

  // ---------------------------------------------------------------- driving?
  //
  // Getting the phone out and finding Drive mode is exactly what nobody does
  // while pulling out of a parking space. So the phone watches its own speed
  // in the background and offers once, when it's sure: a sustained speed no
  // walk or bike reaches.
  //
  // Deliberately cautious. It asks rather than grabs the screen, it asks at
  // most once a trip, and "No" is remembered for the rest of the day — being
  // wrong about this is worse than being late to offer.
  const DRIVING_SPEED = 11;      // m/s, about 25 mph / 40 kph
  const DRIVING_FOR = 25_000;    // held that fast this long
  let fastSince = 0;
  let askedAt = 0;
  let sentry = null;

  const declinedToday = () => {
    const no = store.get("noAuto", 0);
    return no && new Date(no).toDateString() === new Date().toDateString();
  };

  function offerDrive() {
    // Never over a call, never twice, never when it's already on.
    if (active || askedAt || declinedToday() || core()?.busy?.()) return;
    askedAt = Date.now();
    const bar = document.createElement("div");
    bar.className = "drive-offer";
    bar.innerHTML = '<b>Driving?</b><span>I can take over hands-free.</span>';
    const yes = document.createElement("button");
    yes.type = "button";
    yes.textContent = "Start Drive mode";
    yes.onclick = () => { bar.remove(); start(); };
    const no = document.createElement("button");
    no.type = "button";
    no.className = "ghost";
    no.textContent = "Not driving";
    no.onclick = () => { bar.remove(); store.set("noAuto", Date.now()); };
    bar.append(yes, no);
    document.body.appendChild(bar);
    // Unanswered: it goes quietly rather than sitting on the screen.
    setTimeout(() => bar.isConnected && bar.remove(), 30_000);
  }

  function watchForDriving() {
    if (sentry !== null || !navigator.geolocation || store.get("autoOff", false)) return;
    try {
      sentry = navigator.geolocation.watchPosition(
        (pos) => {
          const v = pos?.coords?.speed;
          if (typeof v !== "number" || Number.isNaN(v)) return;
          if (v >= DRIVING_SPEED) {
            if (!fastSince) fastSince = Date.now();
            if (Date.now() - fastSince >= DRIVING_FOR) offerDrive();
          } else if (v < DRIVING_SPEED * 0.5) {
            // Properly stopped: ready to offer again on the next trip.
            fastSince = 0;
            if (askedAt && Date.now() - askedAt > 10 * 60_000) askedAt = 0;
          }
        },
        () => undefined,
        { enableHighAccuracy: false, maximumAge: 10_000, timeout: 30_000 }
      );
    } catch {
      sentry = null;
    }
  }

  window.IzukiDrive = {
    gate,
    system,
    start,
    stop: () => stop(false),
    get active() { return active; },
    /** Live speed in metres per second while Drive mode is on. */
    get speed() { return speed; },
    get perMs() { return perMs; },
    /** Start watching for driving (called once the app is up). */
    watchForDriving,
    /** Turn the "Driving?" offer off or on. */
    autoOffer(on) { store.set("autoOff", !on); if (on) watchForDriving(); },
    get autoOfferOn() { return !store.get("autoOff", false); },
    get fun() { return fun; },
    /** Location fixes arrive here while Drive mode watches them. */
    track: onPosition,
    /** The trip being ridden along: destination, distance covered, minutes. */
    get trip() { return trip; },
    /** What's left, when the router has answered: metres and seconds. */
    get left() { return trip && trip.route ? { metres: trip.route.metres, secs: trip.route.secs, at: trip.route.at } : null; },
    /** The trip line exactly as it is shown under the speed. */
    get line() { return tripLine(); },
    /** Ask the router again now (Drive mode's own check does this too). */
    routeNow: () => plan(true),
    /** The line the glass orb is showing over Maps, if any. */
    get ambient() { return ambient; },
    /** Pick the trip back up after a reload (the page calls this at start-up). */
    resume: resumeTrip,
    /** One of the 5 s checks (the timer calls this; tests do too). */
    tick: check,
    /** Talk on the way: check-ins, a word in traffic, an arrival nudge. */
    rideAlong(on) { rideAlong = Boolean(on); store.set("ride", rideAlong); paint(); return rideAlong; },
    get rideAlongOn() { return rideAlong; },
    /** Warn above this speed in the local unit (0 = never). */
    warnAbove(v) { store.set("warnAbove", Math.max(0, Number(v) || 0)); },
    unit,
  };
  document.addEventListener("DOMContentLoaded", () => {
    resumeTrip();
    const b = $("go-drive");
    if (b) b.onclick = () => { start(); say("Drive mode's on. Where to?"); };
    const w = $("drive-warn");
    const r = $("drive-ride");
    if (r) {
      r.checked = rideAlong;
      r.onchange = () => { rideAlong = r.checked; store.set("ride", rideAlong); };
    }
    if (w) {
      w.value = String(store.get("warnAbove", 0) || "");
      w.placeholder = `Off (${unit})`;
      w.onchange = () => window.IzukiDrive.warnAbove(w.value);
    }
  });
})();
