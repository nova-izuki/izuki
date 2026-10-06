// Izuki TV — the same companion, made for the big screen and the remote.
//
// Turns on by itself on Android TV / Google TV / Fire TV (or with ?tv in the
// address). A full-screen, ten-foot design: a big realistic orb with a soft
// reflection, the time, what you said and what Izuki says in large type,
// and big tiles the remote's arrows move between.
//
// Two ways to talk, switchable on screen:
//   • "Hey Nova" — hands-free; Izuki only answers when it hears its name
//     (or right after it spoke), so the TV's own sound doesn't set it off.
//   • Hold OK — hold the remote's middle button, talk (a live waveform shows
//     it's hearing you), let go.
//
// And it runs the TV: with "Let Izuki control this TV" on (Android's
// Accessibility switch), it opens any app by name, plays/pauses, changes
// the volume, and for anything else it reads what's on the screen, acts,
// and looks again until it's done — out loud as it goes. Linked to the PC
// (home Wi-Fi + Allow on the PC), it copies the PC's setup and memories, and
// the PC can hand it TV jobs ("Hey Nova, open YouTube on the TV").

import { drawGlassOrb, faceFromStorage } from "./glass-orb.js";

const N = () => window.Capacitor?.Plugins?.IzukiControl;
const core = () => window.IzukiCore;
const $ = (id) => document.getElementById(id);
const store = {
  get(k, d) { try { const v = localStorage.getItem("izuki.tv." + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem("izuki.tv." + k, JSON.stringify(v)); } catch {} },
};

const ORBS = [
  ["ripple", "Tidal pearl"], ["ferrofluid", "Clear water"], ["dew", "Pure water"], ["constellation", "Star crystal"],
  ["particles", "Stardust"], ["face", "Hologram face"], ["model:holo-female", "Hologram woman"], ["model:holo-male", "Hologram man"], ["model:lightskin-female", "Woman (3D)"], ["model:black-male", "Man (3D)"], ["ferro", "Ferrofluid"], ["aurora", "Aurora"], ["nebula", "Nebula"],
];
/** TV looks built on a glass orb plus a colour grade. */
const GRADE = { aurora: ["ripple", "tv-aurora"], nebula: ["particles", "tv-nebula"] };

let mode = store.get("mode", "wake");          // "wake" | "hold"
let orbStyle = store.get("orb", "ripple");
if (orbStyle === "holo3d" || orbStyle === "avatar") orbStyle = "model:holo-female";
let link = store.get("link", null);             // { ip, name, token }
let state = "idle";
let energy = 0;
let lastSpoke = 0;
let control = false;
const FOLLOW_ON_MS = 30000;

const tv = {
  active: false,
  /** What was heard decides: not for Izuki (null), done here, or go on as chat. */
  async gate(said) {
    let s = said.trim();
    const called = /^(?:hey|hi|ok|okay)?[\s,]*(?:nova|izuki|atlas)\b[\s,.!?]*/i;
    if (mode === "wake") {
      const named = called.test(s) || /\b(?:hey|ok|okay) (?:nova|izuki)\b/i.test(s);
      if (!named && Date.now() - lastSpoke > FOLLOW_ON_MS) return null;
      s = s.replace(called, "").replace(/\b(?:hey|ok|okay) (?:nova|izuki)\b[\s,.!?]*/i, "").trim();
      if (!s) { wokeElsewhere(); return { done: true, said, say: "Mhm?" }; }
      wokeElsewhere();
    }
    const done = await tvDo(s);
    if (done) return { done: true, said: s, say: done };
    return { said: s };
  },
  orb(m) { if (!tv.active) return; setState(m === "listening" ? "listen" : m === "thinking" ? "think" : m === "speaking" ? "talk" : "idle"); },
  heard(t) { if (tv.active && t) showHeard(t); },
  said(t) { if (tv.active && t) showSaid(t); },
  line(who, t) {
    if (!tv.active) return;
    if (who === "me") showHeard(t);
    else if (who === "izuki") { showSaid(t); lastSpoke = Date.now(); }
  },
};
window.IzukiTv = tv;

// ---- is this a TV? ---------------------------------------------------------------

async function isTv() {
  if (new URLSearchParams(location.search).has("tv")) return true;
  try { const s = await N()?.status(); control = !!s?.running; return !!s?.tv; } catch { return false; }
}

isTv().then((yes) => { if (yes) start(); });

// ---- the screen -----------------------------------------------------------------------

function build() {
  const css = document.createElement("link");
  css.rel = "stylesheet";
  css.href = "tv.css";
  document.head.appendChild(css);
  const root = document.createElement("div");
  root.id = "tv";
  root.innerHTML = `
    <div class="tv-sky"><i></i><i></i><i></i></div>
    <header class="tv-top">
      <div class="tv-brand">IZUKI</div>
      <div class="tv-chips"><span id="tv-link-chip" class="tv-chip"></span><span id="tv-mode-chip" class="tv-chip"></span><span id="tv-timer-chip" class="tv-chip" hidden></span><span id="tv-weather" class="tv-chip" hidden></span></div>
      <div class="tv-time"><b id="tv-clock"></b><span id="tv-date"></span></div>
    </header>
    <main class="tv-stage">
      <div class="tv-orb-wrap"><div class="tv-bloom"></div><canvas id="tv-orb" width="560" height="560"></canvas></div>
      <div id="tv-state" class="tv-state">Ready</div>
      <canvas id="tv-wave" class="tv-wave" width="900" height="90" hidden></canvas>
      <div id="tv-heard" class="tv-heard"></div>
      <div id="tv-said" class="tv-said"></div>
      <div id="tv-steps" class="tv-steps"></div>
    </main>
    <nav class="tv-tiles" aria-label="Izuki">
      <button class="tv-tile" id="tv-talk"><span>🎙️</span><b>Talk</b><small>Hold OK and speak</small></button>
      <button class="tv-tile" id="tv-mode"><span>👂</span><b>Hey Nova</b><small id="tv-mode-sub"></small></button>
      <button class="tv-tile" id="tv-control"><span>🧭</span><b>Control this TV</b><small id="tv-control-sub"></small></button>
      <button class="tv-tile" id="tv-orb-pick"><span>🫧</span><b>Orb</b><small id="tv-orb-sub"></small></button>
      <button class="tv-tile" id="tv-link"><span>💻</span><b>My PC</b><small id="tv-link-sub"></small></button>
      <button class="tv-tile" id="tv-more"><span>⚙️</span><b>Settings</b><small>Keys, voice, apps</small></button>
    </nav>
    <div id="tv-hint" class="tv-hint"></div>
    <div id="tv-sheet" class="tv-sheet" hidden></div>`;
  document.body.appendChild(root);
  document.documentElement.classList.add("is-tv");
}

let restTimer = 0;
function setState(s) {
  state = s;
  const label = { listen: "Listening…", think: "Thinking…", talk: "", idle: mode === "wake" ? "Say “Hey Nova”" : "Hold OK to talk" }[s];
  $("tv-state").textContent = label ?? "";
  $("tv").dataset.state = s;
  // Hold-OK mode: once it's done talking, the orb settles back after a moment
  // and springs forward again the moment you hold OK.
  clearTimeout(restTimer);
  $("tv").classList.remove("orb-rest");
  if (s === "idle" && mode === "hold") restTimer = setTimeout(() => $("tv").classList.add("orb-rest"), 3000);
  // Away in another app: the little orb in the corner shows it instead.
  if (document.hidden && control) N()?.orb({ state: s, text: s === "talk" ? $("tv-said").textContent.slice(0, 140) : "" }).catch(() => {});
}
function showHeard(t) { $("tv-heard").textContent = t ? `“${t.slice(0, 160)}”` : ""; }
function showSaid(t) { $("tv-said").textContent = t.replace(/[*_#`]/g, "").slice(0, 420); }
function steps(lines) {
  const box = $("tv-steps");
  box.innerHTML = "";
  for (const l of lines.slice(-4)) { const d = document.createElement("div"); d.textContent = l; box.appendChild(d); }
}

function refresh() {
  $("tv-mode-sub").textContent = mode === "wake" ? "On — just say it" : "Off — hold OK instead";
  $("tv-mode-chip").textContent = mode === "wake" ? "👂 Say “Hey Nova”" : "🎙️ Hold OK to talk";
  $("tv-control-sub").textContent = control ? "On — I can open and press things" : "Off — turn it on";
  $("tv-orb-sub").textContent = (ORBS.find(([k]) => k === orbStyle) || ORBS[0])[1];
  $("tv-link-sub").textContent = link ? `Linked to ${link.name}` : "Link to copy your setup";
  $("tv-link-chip").textContent = link ? `💻 ${link.name}` : "";
  $("tv-link-chip").hidden = !link;
  $("tv-hint").textContent = !core()?.ready()
    ? "First, link to your PC (My PC) — it copies your setup — or add a key in Settings."
    : mode === "wake"
      ? "Try: “Hey Nova, open Netflix” · “Hey Nova, play the next episode” · “Hey Nova, what's the weather?”"
      : "Hold OK and say: “open YouTube” · “search for cooking videos” · “turn it down”";
  if (state === "idle") setState("idle");
}

/** The weather in the top bar (the PC's town, once linked). */
async function weather() {
  const wx = await window.IzukiWeather?.now();
  const chip = $("tv-weather");
  if (!wx || !chip) return;
  chip.textContent = `${wx.icon} ${wx.temp}° · ${wx.place}`;
  chip.hidden = false;
}

// ---- timers ("set a timer for 10 minutes"): a countdown chip, said out loud when done
const timers = [];
function timerTick() {
  const chip = $("tv-timer-chip");
  const now = Date.now();
  for (const t of timers.filter((x) => x.ends <= now)) {
    timers.splice(timers.indexOf(t), 1);
    void say(`⏰ ${t.label} — time's up!`);
  }
  if (!timers.length) { chip.hidden = true; return; }
  const t = timers.reduce((a, b) => (a.ends < b.ends ? a : b));
  const left = Math.max(0, Math.round((t.ends - now) / 1000));
  chip.textContent = `⏱ ${t.label} ${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")}`;
  chip.hidden = false;
}
function timerAsk(s) {
  const t = s.toLowerCase();
  if (!/\btimer\b/.test(t)) return null;
  if (/\b(cancel|stop|clear)\b/.test(t)) { const had = timers.length; timers.length = 0; return had ? "Timer cancelled." : "There's no timer running."; }
  const m = t.match(/(\d+(?:\.\d+)?)\s*(hours?|hrs?|minutes?|mins?|seconds?|secs?)/);
  if (!m) return null;
  const n = parseFloat(m[1]);
  const secs = Math.round(n * (/^h/.test(m[2]) ? 3600 : /^m/.test(m[2]) ? 60 : 1));
  const named = t.match(/(\w+) timer/);
  const label = named && !/^(a|the|my|set|start|\d+)$/.test(named[1]) ? named[1][0].toUpperCase() + named[1].slice(1) : "Timer";
  timers.push({ label, ends: Date.now() + secs * 1000 });
  timerTick();
  return `${label} set for ${m[1]} ${m[2]}.`;
}

function tick() {
  const now = new Date();
  $("tv-clock").textContent = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  $("tv-date").textContent = now.toLocaleDateString([], { weekday: "long", month: "long", day: "numeric" });
}

// ---- the orb ------------------------------------------------------------------------

function animate() {
  const c = $("tv-orb");
  const ctx = c.getContext("2d");
  const [style, grade] = GRADE[orbStyle] || [orbStyle, ""];
  c.className = grade;
  let t0 = performance.now();
  let idleSince = Date.now();
  // The 3D face's saved look, re-read every few seconds, not parsed every frame.
  let face = null, faceAt = -1e9;
  const frame = (now) => {
    if (now - faceAt > 3000) { face = faceFromStorage(GRADE[orbStyle]?.[0] || orbStyle); faceAt = now; }
    const t = (now - t0) / 1000;
    const target = state === "talk" ? 0.45 + 0.35 * Math.abs(Math.sin(t * 7.3)) * Math.abs(Math.sin(t * 2.1)) : state === "listen" ? 0.18 + energy : 0.05;
    energy *= 0.9;
    const e = target;
    ctx.clearRect(0, 0, c.width, c.height);
    const ok = drawGlassOrb(ctx, c.width, GRADE[orbStyle]?.[0] || orbStyle, t, e, state === "think" ? 1 : 0, state === "talk" ? 0.4 : 0, face);
    if (!ok) {
      // No WebGL on this TV: a soft painted orb instead.
      const g = ctx.createRadialGradient(c.width * 0.42, c.height * 0.38, 10, c.width / 2, c.height / 2, c.width * 0.48 * (1 + e * 0.1));
      g.addColorStop(0, "#c9f4ff"); g.addColorStop(0.45, "#7c5cff"); g.addColorStop(1, "rgba(10,8,30,0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(c.width / 2, c.height / 2, c.width * 0.46, 0, Math.PI * 2); ctx.fill();
    }
    // Screensaver: nothing for a while — the room goes dim and the orb drifts.
    if (state !== "idle") idleSince = Date.now();
    $("tv").classList.toggle("ambient", Date.now() - idleSince > 120000);
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
  void style;
}

// ---- hold OK to talk ------------------------------------------------------------------

let rec = null, chunks = [], holdTimer = null, waveRaf = 0, micStream = null;

async function holdStart() {
  if (rec || !core()) return;
  if (!core().canHear()) return say("To talk to me, link your PC or add a free key in Settings.");
  core().hush();
  // The hands-free listener steps aside while you hold the button.
  if (core().calling()) core().stopCall();
  try {
    micStream = micStream && micStream.getAudioTracks().some((t) => t.readyState === "live") ? micStream : await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
  } catch { return say("I can't use a microphone on this TV. Use a remote or phone with a mic, or link your PC and talk to it."); }
  const type = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"].find((t) => window.MediaRecorder?.isTypeSupported?.(t)) || "";
  chunks = [];
  rec = new MediaRecorder(micStream, type ? { mimeType: type } : undefined);
  rec.ondataavailable = (e) => { if (e.data?.size) chunks.push(e.data); };
  rec.start(200);
  setState("listen");
  wave(micStream);
}

async function holdEnd() {
  if (!rec) return;
  const r = rec;
  rec = null;
  cancelAnimationFrame(waveRaf);
  $("tv-wave").hidden = true;
  await new Promise((done) => { r.onstop = done; r.stop(); });
  const blob = new Blob(chunks, { type: chunks[0]?.type || "audio/webm" });
  if (blob.size < 2500) { setState("idle"); return; }
  setState("think");
  const b64 = await new Promise((done) => { const f = new FileReader(); f.onload = () => done(String(f.result).split(",")[1] || ""); f.readAsDataURL(blob); });
  let words = "";
  try { words = await core().hear({ type: (blob.type || "audio/webm").split(";")[0], b64 }); } catch (e) { return say(String(e?.message || e)); }
  if (!words.trim()) { setState("idle"); return; }
  showHeard(words);
  const before = mode;
  mode = "hold"; // held: it's for Izuki, no name needed
  try { await core().ask(words); } finally {
    mode = before;
    if (mode === "wake") setTimeout(() => { if (!core().calling()) core().startCall(); }, 400);
  }
}

function wave(stream) {
  const c = $("tv-wave");
  c.hidden = false;
  let ac, an;
  try {
    ac = new (window.AudioContext || window.webkitAudioContext)();
    an = ac.createAnalyser();
    an.fftSize = 256;
    ac.createMediaStreamSource(stream).connect(an);
  } catch { return; }
  const data = new Uint8Array(an.frequencyBinCount);
  const ctx = c.getContext("2d");
  const draw = () => {
    an.getByteFrequencyData(data);
    ctx.clearRect(0, 0, c.width, c.height);
    const bars = 48, w = c.width / bars;
    let sum = 0;
    for (let i = 0; i < bars; i++) {
      const v = data[Math.floor((i / bars) * data.length * 0.7)] / 255;
      sum += v;
      const h = Math.max(4, v * c.height * 0.95);
      const g = ctx.createLinearGradient(0, (c.height - h) / 2, 0, (c.height + h) / 2);
      g.addColorStop(0, "#67e8f9"); g.addColorStop(1, "#a78bfa");
      ctx.fillStyle = g;
      ctx.fillRect(i * w + w * 0.2, (c.height - h) / 2, w * 0.6, h);
    }
    energy = Math.min(0.8, sum / bars * 1.6);
    waveRaf = requestAnimationFrame(draw);
  };
  draw();
}

// ---- the remote -------------------------------------------------------------------------

function keys() {
  document.addEventListener("keydown", (e) => {
    if (!tv.active || !$("tv-sheet").hidden) return;
    const ok = e.key === "Enter" || e.keyCode === 23 || e.keyCode === 66;
    // Hold OK anywhere (the Talk tile, or nothing focused) to talk.
    const onTalk = document.activeElement === $("tv-talk") || document.activeElement === document.body;
    if (ok && onTalk) {
      e.preventDefault();
      if (!holdTimer && !rec) holdTimer = setTimeout(() => { holdTimer = null; void holdStart(); }, 280);
    }
    // The remote's own mic / search button: talk.
    if (e.key === "MediaRecord" || e.keyCode === 84 || e.keyCode === 231) { e.preventDefault(); void holdStart(); }
  });
  document.addEventListener("keyup", (e) => {
    const ok = e.key === "Enter" || e.keyCode === 23 || e.keyCode === 66 || e.keyCode === 84 || e.keyCode === 231;
    if (!ok) return;
    if (holdTimer) {
      clearTimeout(holdTimer); holdTimer = null;
      // A quick press on Talk: start a hands-free turn instead.
      if (document.activeElement === $("tv-talk")) { e.preventDefault(); if (!core()?.calling()) core()?.startCall(); }
      return;
    }
    if (rec) { e.preventDefault(); void holdEnd(); }
  });
}

// ---- doing things on the TV ---------------------------------------------------------------

/** Things the TV can do straight away, no AI. What to say, or null. */
async function quick(s) {
  const n = N();
  if (!n) return null;
  const t = s.toLowerCase().replace(/[.!?]+$/, "").replace(/\b(please|for me|on (?:the|my|this) tv|the tv|tv)\b/g, " ").replace(/\s+/g, " ").trim();
  const open = t.match(/^(?:open|launch|start|go to|switch to|put on)\s+(?:the\s+)?(.+?)(?:\s+app)?$/);
  if (open && !/\b(episode|movie|show|video|channel|first|second|third|next|this|that|it)\b/.test(open[1])) {
    try { const r = await n.launch({ name: open[1] }); return `Opening ${r.name}.`; } catch (e) { return null; }
  }
  const media = [
    [/^(?:pause|pause it|stop it|hold on)$/, "pause", "Paused."], [/^(?:play|resume|play it|continue|unpause)$/, "play", "Playing."],
    [/^(?:next|skip|next one|next episode|skip this)$/, "next", "Next."], [/^(?:previous|go back one|last one)$/, "previous", "Back one."],
    [/^(?:fast forward|forward|skip ahead)$/, "forward", "Skipping ahead."], [/^(?:rewind|go back a bit)$/, "rewind", "Rewinding."],
  ];
  for (const [re, key, said] of media) if (re.test(t)) { await n.media({ key }); return said; }
  if (/^(?:louder|volume up|turn (?:it )?up|turn the volume up)$/.test(t)) { await n.volume({ dir: "up", steps: 3 }); return "Louder."; }
  if (/^(?:quieter|volume down|turn (?:it )?down|turn the volume down|lower (?:it|the volume))$/.test(t)) { await n.volume({ dir: "down", steps: 3 }); return "Quieter."; }
  if (/^(?:mute|mute it|silence)$/.test(t)) { await n.volume({ dir: "mute" }); return "Muted."; }
  if (/^(?:unmute|sound on)$/.test(t)) { await n.volume({ dir: "unmute" }); return "Sound's back."; }
  if (control && /^(?:go )?home$/.test(t)) { await n.act({ op: "home" }); return "Home."; }
  if (control && /^(?:go )?back$/.test(t)) { await n.act({ op: "back" }); return "Back."; }
  if (control && /^scroll (?:down|up)$/.test(t)) { await n.act({ op: "scroll", dir: t.endsWith("up") ? "up" : "down" }); return "Done."; }
  return null;
}

/** A request about the TV screen ("play the second one", "search for…"). */
const SCREEN_JOB = /\b(open|play|watch|put on|search|find|look for|select|choose|pick|click|press|tap|go to|start|next|episode|season|movie|show|channel|subtitles?|captions?|settings|sign in|profile|resume|continue watching|type|scroll|home|back)\b/i;

async function tvDo(s) {
  const timed = timerAsk(s);
  if (timed) return timed;
  const fast = await quick(s).catch(() => null);
  if (fast) return fast;
  if (!N() || !control || !SCREEN_JOB.test(s)) return null;
  return agent(s);
}

const AGENT_RULES = `You control an Android TV for the user, step by step, by looking at what is on screen.
Each turn you get the app in front and a numbered list of what's on screen. Reply with ONE JSON object and nothing else:
{"do":"open","app":"Netflix"} — open an app by name
{"do":"click","n":4} — press item 4 (a button, a tile, a show, a menu entry)
{"do":"type","n":2,"text":"stranger things"} — put words in box 2 (n 0 = the box that's focused)
{"do":"key","key":"back"} — back, home, play, pause
{"do":"scroll","dir":"down"} — down, up, left or right
{"do":"done","say":"one short friendly sentence"} — when it's done (or it can't be done, say why)
Rules: pick items by their words; to find a show, open the app, press its Search, type, then press the right result.
Never sign in, buy, rent or change account settings unless the user clearly asked for exactly that. Don't repeat an action that didn't change anything — try another way.`;

async function agent(goal) {
  const n = N();
  const lines = [];
  setState("think");
  let last = "";
  for (let round = 0; round < 10; round++) {
    let scr;
    try { scr = await n.screen(); } catch { return "I need “Control this TV” switched on first — it's on the Izuki screen."; }
    const items = (scr.items || []).slice(0, 90).map((it) => `${it.n}. [${it.kind}${it.focused ? ", focused" : ""}] ${it.text}`).join("\n");
    const prompt = `The user asked: "${goal}"\nApp in front: ${scr.app || "?"}\nOn screen:\n${items || "(nothing readable)"}\nSteps so far: ${lines.join(" → ") || "none"}\nYour next action (JSON only):`;
    let reply = "";
    try { reply = await core().think(prompt, AGENT_RULES); } catch (e) { return `My AI brain didn't answer — ${String(e?.message || e)}`; }
    const m = String(reply || "").match(/\{[\s\S]*\}/);
    let act = null;
    try { act = m ? JSON.parse(m[0]) : null; } catch { act = null; }
    if (!act || !act.do) return lines.length ? "I did what I could — have a look." : "I couldn't work out how to do that here.";
    const sig = JSON.stringify(act);
    if (sig === last && act.do !== "done") { lines.push("(tried that already)"); }
    last = sig;
    if (act.do === "done") { steps([]); return String(act.say || "Done."); }
    try {
      if (act.do === "open") { const r = await n.launch({ name: String(act.app) }); lines.push(`Opened ${r.name}`); }
      else if (act.do === "click") { const it = (scr.items || []).find((x) => x.n === Number(act.n)); await n.act({ op: "click", n: Number(act.n) }); lines.push(`Pressed ${it ? it.text.slice(0, 40) : act.n}`); }
      else if (act.do === "type") { await n.act({ op: "type", n: Number(act.n) || 0, text: String(act.text || "") }); lines.push(`Typed “${String(act.text).slice(0, 30)}”`); }
      else if (act.do === "key") {
        const k = String(act.key);
        if (k === "play" || k === "pause") await n.media({ key: k }); else await n.act({ op: k });
        lines.push(k[0].toUpperCase() + k.slice(1));
      } else if (act.do === "scroll") { await n.act({ op: "scroll", dir: String(act.dir || "down") }); lines.push(`Scrolled ${act.dir || "down"}`); }
    } catch (e) { lines.push(`(that didn't work: ${String(e?.message || e).slice(0, 60)})`); }
    steps(lines);
    if (round === 0) core().speak(lines[0] ? `${lines[0]}…` : "On it…");
    await new Promise((r) => setTimeout(r, 1300));
  }
  return "That took a lot of steps — have a look, and tell me what's next.";
}

async function say(t) {
  showSaid(t);
  lastSpoke = Date.now();
  await core()?.speak(t);
  setState("idle");
}

// ---- linking to the PC -------------------------------------------------------------------

function sheet(html) {
  const s = $("tv-sheet");
  s.innerHTML = html;
  s.hidden = false;
  const first = s.querySelector("button");
  first?.focus();
}
function closeSheet() { $("tv-sheet").hidden = true; $("tv-link").focus(); }

async function pcHttp(path, opts = {}) {
  const r = await N().http({ url: `http://${link.ip}:47616${path}`, method: opts.method || "GET", body: opts.body ? JSON.stringify(opts.body) : undefined, auth: link.token, timeout: opts.timeout || 25000 });
  return JSON.parse(r.body || "{}");
}

async function linkPc() {
  if (!N()?.findPcs) return sheet(`<h2>Link to your PC</h2><p>This needs the Izuki app on the TV (not the website).</p><button onclick="this.closest('.tv-sheet').hidden=true">OK</button>`);
  sheet(`<h2>Looking for Izuki on your Wi-Fi…</h2><p>On your PC: Izuki → Settings → Control my TV → turn on <b>“Let my phone and TV link to this PC”</b>.</p><button id="tv-x">Cancel</button>`);
  $("tv-x").onclick = closeSheet;
  let pcs = [];
  try { pcs = (await N().findPcs()).pcs || []; } catch {}
  if (!pcs.length) {
    sheet(`<h2>No PC found</h2><p>Make sure Izuki is open on your PC, it's on the same Wi-Fi as this TV, and <b>“Let my phone and TV link to this PC”</b> is on (Settings → Control my TV).</p><button id="tv-again">Look again</button><button id="tv-x">Close</button>`);
    $("tv-again").onclick = linkPc; $("tv-x").onclick = closeSheet;
    return;
  }
  sheet(`<h2>Link to which PC?</h2>${pcs.map((p, i) => `<button data-i="${i}">💻 ${escapeHtml(p.name)}</button>`).join("")}<button id="tv-x">Cancel</button>`);
  $("tv-x").onclick = closeSheet;
  $("tv-sheet").querySelectorAll("button[data-i]").forEach((b) => (b.onclick = () => askPc(pcs[Number(b.dataset.i)])));
}

async function askPc(pc) {
  const code = String(1000 + Math.floor(Math.random() * 9000));
  sheet(`<h2>Press Allow on your PC</h2><p>A box popped up on <b>${escapeHtml(pc.name)}</b>. Check it shows</p><div class="tv-code">${code}</div><p>then press <b>Yes</b>.</p>`);
  try {
    const r = await N().http({ url: `http://${pc.ip}:47616/izuki/link`, method: "POST", body: JSON.stringify({ name: deviceName(), kind: "tv", code }), timeout: 120000 });
    const v = JSON.parse(r.body || "{}");
    if (!v.ok) throw new Error(v.error || "The PC didn't allow it.");
    link = { ip: pc.ip, name: pc.name, token: v.token };
    store.set("link", link);
    core()?.applySetup(v.setup);
    sheet(`<h2>Linked! 🎉</h2><p>Your AI, your apps and what Izuki knows about you are on this TV now — it works even when the PC is off. And “Hey Nova, … on the TV” on your PC comes here.</p><button id="tv-x">Great</button>`);
    $("tv-x").onclick = closeSheet;
    refresh();
    follow();
  } catch (e) {
    sheet(`<h2>Didn't link</h2><p>${escapeHtml(String(e?.message || e))}</p><button id="tv-again">Try again</button><button id="tv-x">Close</button>`);
    $("tv-again").onclick = () => askPc(pc); $("tv-x").onclick = closeSheet;
  }
}

function deviceName() {
  const m = navigator.userAgent.match(/;\s*([^;)]+?)\s+Build\//);
  return (m ? m[1] : "Android TV").slice(0, 40);
}

/** Follow the PC: its jobs for this TV, and fresh setup now and then. */
let following = false;
async function follow() {
  if (following || !link) return;
  following = true;
  let after = 0;
  try { const v = await pcHttp("/izuki/setup"); if (v.ok) core()?.applySetup(v.setup); } catch {}
  while (link) {
    try {
      const v = await pcHttp(`/izuki/events?after=${after}`, { timeout: 30000 });
      if (v.error === "not linked") { link = null; store.set("link", null); refresh(); break; }
      for (const ev of v.events || []) {
        after = Math.max(after, ev.n);
        if (ev.state === "tvdo" && ev.text) {
          const said = (await tvDo(ev.text)) || "I couldn't do that on the TV.";
          void say(said);
        }
      }
      if (typeof v.last === "number" && after === 0) after = v.last;
    } catch { await new Promise((r) => setTimeout(r, 8000)); }
  }
  following = false;
}

/** This TV answered "Hey Nova": the PC doesn't answer it too. */
function wokeElsewhere() {
  if (link) pcHttp("/izuki/woke", { method: "POST", body: {} }).catch(() => {});
}

function escapeHtml(s) { return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]); }

// ---- the tiles ----------------------------------------------------------------------------

function tiles() {
  $("tv-mode").onclick = () => {
    mode = mode === "wake" ? "hold" : "wake";
    store.set("mode", mode);
    if (mode === "wake") core()?.startCall(); else core()?.stopCall();
    refresh();
  };
  $("tv-control").onclick = async () => {
    if (control) return say("I can already open apps and press things on this TV. Just ask.");
    sheet(`<h2>Let Izuki control this TV</h2><p>In the next screen, choose <b>Izuki Companion</b> and turn it <b>on</b>. Then I can open apps, press, type and scroll for you — only when you ask. I never read passwords.</p><button id="tv-go">Open the setting</button><button id="tv-x">Not now</button>`);
    $("tv-go").onclick = () => { N()?.openAccessibilitySettings(); closeSheet(); };
    $("tv-x").onclick = closeSheet;
  };
  $("tv-orb-pick").onclick = () => {
    sheet(`<h2>Pick an orb</h2><div class="tv-grid">${ORBS.map(([k, label]) => `<button data-k="${k}" class="${k === orbStyle ? "on" : ""}">${label}</button>`).join("")}</div>`);
    $("tv-sheet").querySelectorAll("button[data-k]").forEach((b) => (b.onclick = () => {
      orbStyle = b.dataset.k; store.set("orb", orbStyle);
      $("tv-orb").className = (GRADE[orbStyle] || [0, ""])[1];
      closeSheet(); refresh();
    }));
  };
  $("tv-link").onclick = () => {
    if (!link) return linkPc();
    sheet(`<h2>Linked to ${escapeHtml(link.name)}</h2><p>Your setup comes from this PC, and it can send me TV jobs.</p><button id="tv-sync">Copy the setup again</button><button id="tv-unlink">Unlink</button><button id="tv-x">Close</button>`);
    $("tv-sync").onclick = async () => { try { const v = await pcHttp("/izuki/setup"); if (v.ok) core()?.applySetup(v.setup); } catch {} closeSheet(); refresh(); };
    $("tv-unlink").onclick = async () => { try { await pcHttp("/izuki/unlink", { method: "POST", body: {} }); } catch {} link = null; store.set("link", null); closeSheet(); refresh(); };
    $("tv-x").onclick = closeSheet;
  };
  $("tv-more").onclick = () => {
    $("tv").classList.add("tv-behind");
    document.getElementById("open-settings")?.click();
    setTimeout(() => $("tv").classList.remove("tv-behind"), 200);
    $("tv").hidden = true;
    const back = (e) => { if (e.key === "Escape" || e.key === "GoBack" || e.keyCode === 4 || e.key === "BrowserBack") { $("tv").hidden = false; $("tv-more").focus(); document.removeEventListener("keydown", back); } };
    document.addEventListener("keydown", back);
  };
  document.addEventListener("keydown", (e) => {
    if ((e.key === "Escape" || e.key === "GoBack" || e.keyCode === 4) && !$("tv-sheet").hidden) { e.preventDefault(); closeSheet(); }
  });
}

// ---- go -------------------------------------------------------------------------------------

function start() {
  tv.active = true;
  build();
  tiles();
  keys();
  tick();
  setInterval(tick, 15000);
  setInterval(timerTick, 1000);
  void weather();
  setInterval(weather, 30 * 60000);
  animate();
  refresh();
  core()?.setReadAloud(true);
  if (mode === "wake" && core()?.ready()) core()?.startCall();
  $("tv-talk").focus();
  setInterval(async () => {
    try { const s = await N()?.status(); const was = control; control = !!s?.running; if (was !== control) refresh(); } catch {}
  }, 5000);
  // Back from another app: the corner orb goes away; leaving: it can show.
  document.addEventListener("visibilitychange", () => { if (!document.hidden) N()?.orb({ state: "idle" }).catch(() => {}); });
  if (link) follow();
  checkForUpdate();
}

/** A newer Izuki app: a tile to update it in one press. */
async function checkForUpdate() {
  const u = await window.IzukiNative?.checkUpdate?.();
  if (!u) return;
  const tile = document.createElement("button");
  tile.className = "tv-tile tv-update";
  tile.innerHTML = `<span>⬆️</span><b>Update Izuki</b><small>Version ${u.latest} is ready</small>`;
  tile.onclick = async () => {
    tile.querySelector("small").textContent = "Downloading…";
    const r = await window.IzukiNative.installUpdate(u.url);
    tile.querySelector("small").textContent =
      r === "ok" ? "Press Install on the next screen" : r === "allow" ? "Allow Izuki to install, then press again" : r;
  };
  document.querySelector(".tv-tiles")?.prepend(tile);
  document.querySelector(".tv-tiles").style.gridTemplateColumns = "repeat(7, 1fr)";
  tile.focus();
}
