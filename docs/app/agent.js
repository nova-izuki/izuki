// Izuki's phone agent: the AI controls the Android phone the way the PC agent
// controls Windows, one checked step at a time.
//
// Each step: read the screen through Android control (a numbered list of
// what's on it), ask the AI for ONE action, do it with the same checked
// primitives Autopilot uses, look again to see whether it worked, repeat.
// It finishes with an answer read off the screen ("You have 41 GB free; Apps
// use 38 GB…") or a question for the person.
//
// What it never does: press anything that sends, pays, buys, deletes,
// uninstalls, clears or resets (checked here and again in Android), type a
// password, act on a locked phone, or tap Izuki's own page. Stop works
// between every step.
(() => {
  "use strict";
  // Long enough for real multi-app tasks; Stop works between every step.
  const MAX_STEPS = 30;
  const OWN = "com.novaizuki.mobile";
  // Calling someone is an outward action too: the person presses Call. So
  // are installing apps and granting permissions. The same actions in
  // Spanish, Portuguese, French and German, for phones set to those.
  const RISKY = /\b(send|call|dial|video call|pay|buy|order|purchase|delete|erase|remove|uninstall|check ?out|subscribe|transfer|place order|reset|format|wipe|clear (?:data|storage|cache|history|all)|factory|sign out|log ?out|force stop|disable|install|allow|grant|accept|enviar|llamar|eliminar|borrar|pagar|comprar|instalar|desinstalar|permitir|aceptar|excluir|aceitar|envoyer|appeler|supprimer|effacer|payer|acheter|installer|désinstaller|autoriser|accepter|restablecer|redefinir|formatear|formatar|desactivar|desativar|cerrar sesión|sair da conta|réinitialiser|formater|désactiver|déconnexion|se déconnecter|zurücksetzen|formatieren|deaktivieren|abmelden|senden|anrufen|löschen|entfernen|bezahlen|kaufen|installieren|deinstallieren|zulassen|erlauben|akzeptieren)\b/i;

  // Choosing an answer and typing it is fine - on a quiz as anywhere else.
  // Handing the work in is not: Submit / Turn in / Finish stays the person's.
  const HAND_IN = /\b(submit|turn ?in|hand ?in|hand it in|finish (?:test|attempt|quiz|exam|assessment)|end (?:test|exam|quiz)|finali[sz]e|grade (?:it|me|my|this)|abgeben|soumettre|remettre|entregar|enviar respuestas)\b/i;
  const PAGES = ["wifi", "internet", "bluetooth", "volume", "nfc", "storage", "battery", "battery_saver", "display", "sound", "apps",
    "notifications", "location", "data", "dnd", "about", "date", "language", "keyboard", "airplane", "camera", "settings"];
  const PAGE_ALIASES = {
    "wi-fi": "wifi", wlan: "wifi", network: "internet", "mobile data": "data", memory: "storage", space: "storage",
    power: "battery", "battery saver": "battery_saver", brightness: "display", screen: "display", applications: "apps",
    "do not disturb": "dnd", "about phone": "about", time: "date", languages: "language", "airplane mode": "airplane",
  };
  const PAGE_NAMES = { wifi: "Wi-Fi", internet: "internet settings", bluetooth: "Bluetooth", volume: "volume", nfc: "NFC", storage: "Storage",
    battery: "Battery", battery_saver: "Battery saver", display: "Display", sound: "Sound", apps: "Apps", notifications: "Notifications",
    location: "Location", data: "Data usage", dnd: "Do not disturb", about: "About phone", date: "Date and time",
    language: "Languages", keyboard: "Keyboard", airplane: "Airplane mode", camera: "the camera", settings: "Settings" };

  const SYSTEM = [
    "You are Izuki, operating the person's Android phone through Android accessibility, one careful step at a time, like a person holding the phone.",
    "Each turn you see the goal, what you did so far with the result of each step, some facts, and the current screen as a numbered list: [n] kind \"label\" (details). Kinds: button, box (text field), switch (on/off), scroll (scrollable area), text (read-only).",
    "Reply with exactly ONE JSON object and nothing else. The actions:",
    '{"do":"open","app":"<installed app name>"}',
    `{"do":"settings","page":"<${PAGES.join("|")}>"}  (straight to that Settings page; faster than menus)`,
    '{"do":"tap","n":<number from the screen>}',
    '{"do":"long_press","n":<number from the screen>}  (menus that open on a long press)',
    '{"do":"double_tap","n":<number>} or {"do":"double_tap","x":<0-1000>,"y":<0-1000>}  (zoom a photo or map, like a post)',
    '{"do":"tap_at","x":<0-1000>,"y":<0-1000>}  (a point on the screenshot, 0-1000 across and down; only for something with no number)',
    '{"do":"type","n":<number of a box>,"text":"<words>","enter":true|false}  (enter only for a search box)',
    '{"do":"scroll","dir":"down|up"}  (lists and pages)',
    '{"do":"swipe","dir":"left|right"}  (the next or previous photo, page, tab or story)',
    '{"do":"drag","from_n":<number>,"to_n":<number>} or {"do":"drag","x":<0-1000>,"y":<0-1000>,"x2":<0-1000>,"y2":<0-1000>}  (drag slowly: reorder a list, move a slider, pan a map)',
    '{"do":"scroll_to","find":"<words in the control>"}  (scroll down until that control is on screen, at most 8 screens)',
    '{"do":"key","key":"recents|notifications|quick_settings"}  (recent apps, the notification shade, quick settings)',
    '{"do":"media","key":"play|pause|next|previous"}  {"do":"volume","dir":"up|down"}  {"do":"torch","on":true|false}',
    '{"do":"navigate","to":"<place>"}  (Google Maps directions)',
    '{"do":"back"}  {"do":"home"}  {"do":"wait"}',
    '{"do":"done","say":"<the answer or what you did, 1-3 short spoken sentences>"}',
    '{"do":"ask","say":"<a short question for the person>"}',
    'Any reply may also carry "plan": a few short numbered steps for the whole goal. It is shown back to you each turn; update it when things change.',
    "Rules:",
    "- Work like an expert phone user: the fastest route first (an app's own search box, a Settings page directly, the share or ⋮ menu), then check the screen after every step.",
    "- When a screenshot is attached, the pink numbers on it are the numbers in the list. Use it to understand icons, images and layout; prefer numbered items and use tap_at only for something that has no number.",
    "- Close pop-ups that are in the way (Not now, Skip, Later, X, Got it) unless the goal needs them.",
    "- Only use numbers that are on the current screen. If what you need isn't visible, scroll or go another way.",
    "- If the same step didn't change anything, don't repeat it: try another way.",
    "- Read answers off the screen and the facts; never invent numbers or names. When the screen shows the answer, finish with done.",
    "- Storage questions: open settings page storage and read the sizes it lists (apps, images, videos, audio, documents, system, other); open a category only if it helps.",
    "- A quiz, test, exam or assignment: work the question out. On a practice quiz, drill or self-test, answer it: tap the choice or type the answer. On a graded quiz or exam (or if you can't tell), don't tap or type: finish with done and say the answer and why, so they can pick it. Never press Submit, Turn in, Finish, End test or Grade: that is theirs to press.",
    "- Never press anything that calls someone, sends, pays, buys, orders, deletes, uninstalls, clears, resets, signs out, force-stops or hands the work in (Submit, Turn in, Finish, End test, Grade). If the goal needs that, finish with ask and tell the person which button to press themselves.",
    "- Never type passwords, PINs or codes. Never change security or account settings.",
    "- If a step didn't work twice, try another way, or finish with done and say plainly what blocked you.",
    "- \"say\" is spoken aloud: plain words, no markdown, no emojis, numbers as people say them (\"41 gigabytes\" is fine as \"41 GB\"). Answer in the language the person used.",
  ].join("\n");

  // NFC: an accent written as a separate mark still matches the risky words.
  const norm = (s) => String(s || "").normalize("NFC").replace(/\s+/g, " ").trim();

  /** The screen as numbered lines for the AI (no passwords: Android never lists them). */
  function describe(screen) {
    const lines = [];
    const seen = new Set();
    for (const it of screen?.items || []) {
      if (lines.length >= 90) break;
      if (!it || !norm(it.text)) continue;
      if (Number(it.w) === 0 || Number(it.h) === 0) continue;
      const label = norm(it.text).slice(0, 70);
      const key = `${it.kind}|${label}|${Math.round((Number(it.y) || 0) / 40)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const extra = [];
      if (it.kind === "switch") extra.push(it.on ? "on" : "off");
      if (it.focused) extra.push("focused");
      if (it.disabled) extra.push("greyed out");
      if (it.kind === "box" && it.hint && norm(it.hint) !== label) extra.push(`for: ${norm(it.hint).slice(0, 40)}`);
      lines.push(`[${it.n}] ${it.kind || "text"} "${label.replace(/"/g, "'")}"${extra.length ? ` (${extra.join(", ")})` : ""}`);
    }
    return lines.join("\n");
  }

  /** One action from a model's reply: fenced, wrapped in <think>, or with odd key names. null if none. */
  function parse(raw) {
    const t = String(raw || "").replace(/<think>[\s\S]*?(<\/think>|$)/gi, "").replace(/```(?:json)?/gi, "").trim();
    const start = t.indexOf("{");
    if (start < 0) return null;
    let depth = 0, inString = false, escaped = false, end = -1;
    for (let i = start; i < t.length; i++) {
      const c = t[i];
      if (inString) {
        if (escaped) escaped = false;
        else if (c === "\\") escaped = true;
        else if (c === "\"") inString = false;
        continue;
      }
      if (c === "\"") inString = true;
      else if (c === "{") depth++;
      else if (c === "}" && --depth === 0) { end = i; break; }
    }
    if (end < 0) return null;
    const body = t.slice(start, end + 1);
    let obj = null;
    try { obj = JSON.parse(body); } catch { try { obj = JSON.parse(body.replace(/,\s*([}\]])/g, "$1")); } catch { return null; } }
    if (!obj || typeof obj !== "object") return null;
    const act = String(obj.do ?? obj.action ?? obj.type ?? obj.step ?? "").toLowerCase().replace(/[\s-]+/g, "_");
    const kinds = {
      open: "open", open_app: "open", launch: "open", start: "open",
      settings: "settings", open_settings: "settings", panel: "settings", settings_page: "settings",
      tap: "tap", click: "tap", press: "tap", select: "tap",
      type: "type", input: "type", write: "type", enter_text: "type",
      long_press: "long_press", longpress: "long_press", hold: "long_press", press_and_hold: "long_press",
      double_tap: "double_tap", doubletap: "double_tap", double_click: "double_tap",
      tap_at: "tap_at", tap_xy: "tap_at", click_at: "tap_at", tap_point: "tap_at",
      key: "key", recents: "key", notifications: "key", quick_settings: "key",
      media: "media", volume: "volume", torch: "torch", flashlight: "torch", navigate: "navigate", directions: "navigate",
      scroll: "scroll", swipe: "swipe", back: "back", go_back: "back", home: "home", go_home: "home", wait: "wait",
      drag: "drag", move: "drag", reorder: "drag", slide: "drag",
      scroll_to: "scroll_to", scrollto: "scroll_to", scroll_until: "scroll_to", bring_into_view: "scroll_to",
      done: "done", finish: "done", answer: "done", reply: "done", say: "done", ask: "ask", question: "ask", confirm: "ask",
    };
    let kind = kinds[act];
    if (!kind) return null;
    const dirWord = String(obj.dir ?? obj.direction ?? "").toLowerCase();
    // An up/down swipe is a scroll (a finger moving up scrolls the list down).
    if (kind === "swipe" && !/left|right/.test(dirWord)) kind = "scroll";
    const keyWord = String(obj.key ?? (["recents", "notifications", "quick_settings"].includes(act) ? act : "")).toLowerCase().replace(/[\s-]+/g, "_");
    const n = Number(obj.n ?? obj.target ?? obj.number ?? obj.item ?? obj.id);
    const page = norm(obj.page ?? (kind === "settings" ? obj.name : "")).toLowerCase();
    return {
      do: kind,
      n: Number.isFinite(n) ? Math.round(n) : 0,
      app: norm(obj.app ?? obj.name ?? ""),
      page: PAGES.includes(page) ? page : PAGE_ALIASES[page] || page.replace(/\s+/g, "_"),
      text: String(obj.text ?? obj.value ?? ""),
      enter: obj.enter === true || obj.submit === true,
      dir: /left/.test(dirWord) ? "left" : /right/.test(dirWord) ? "right"
        : act === "swipe" ? (/down/.test(dirWord) ? "up" : "down")
        : /up/.test(dirWord) ? "up" : "down",
      x: Number(obj.x), y: Number(obj.y), x2: Number(obj.x2 ?? obj.to_x ?? obj.toX), y2: Number(obj.y2 ?? obj.to_y ?? obj.toY),
      from_n: Number.isFinite(Number(obj.from_n ?? obj.fromN ?? obj.from?.n ?? (typeof obj.from === "number" ? obj.from : undefined))) ? Math.round(Number(obj.from_n ?? obj.fromN ?? obj.from?.n ?? obj.from)) : 0,
      to_n: Number.isFinite(Number(obj.to_n ?? obj.toN ?? obj.to?.n ?? (typeof obj.to === "number" ? obj.to : undefined))) ? Math.round(Number(obj.to_n ?? obj.toN ?? obj.to?.n ?? obj.to)) : 0,
      find: norm(obj.find ?? obj.until ?? (kind === "scroll_to" ? obj.text ?? obj.label ?? obj.value : "")),
      key: keyWord,
      on: obj.on === true || /^(on|true)$/i.test(String(obj.on ?? obj.state ?? "")),
      to: norm(obj.to ?? obj.place ?? obj.destination ?? ""),
      plan: norm(obj.plan ?? "").slice(0, 500),
      say: norm(obj.say ?? obj.answer ?? obj.message ?? obj.reply ?? obj.text ?? ""),
    };
  }

  /** A quiz, test or exam page, from its own words ("Question 3 of 20", "Submit quiz", "Time remaining"). */
  // Assessment markers, not just the word "quiz" (a search for "pub quiz" isn't a test).
  const TEST_WORDS = /\b(question \d+(?:\s+of\s+|\s*\/\s*)\d+|\d+ of \d+ questions|submit (?:test|quiz|exam|answers|attempt|assessment)|finish (?:test|attempt|quiz|exam)|attempt \d+(?: of \d+)?|(?:quiz|exam|test|assessment) (?:in progress|timer|results)|end (?:test|exam|quiz))\b/i;
  // A timer alone is a video or a download; with questions or answers it's a test.
  const TIMED = /\btime (?:left|remaining)\b/i;
  const ASKS = /\b(?:question|answer)s?\b/i;
  // Practice (fill it in) or graded (say the answer, they tap it): the owner's
  // choice on 2026-11-24. "Graded", "for credit", an exam, a proctor or points
  // win over the word practice; if it can't be told, it counts as graded.
  const PRACTICE = /\b(practice|self[- ]?(?:test|check|assessment|quiz)|drills?|flash ?cards?|review (?:quiz|questions)|ungraded|not graded|no grade|knowledge check|learning check|try it|quiz yourself|study mode|mock (?:test|exam|quiz))\b/i;
  const GRADED = /\b(graded|for (?:a )?(?:credit|grade)|counts? toward|points? possible|\d+(?:\.\d+)?\s*(?:points?|pts?)\b|attempts? (?:remaining|allowed|left|due)|time (?:limit|left|remaining)|due date|due(?=:)|proctor(?:ed|ing)?|final exam|midterm|exam(?:ination)? in progress|official (?:test|exam))\b/i;
  const screenText = (screen) => norm((screen?.items || []).slice(0, 120).map((i) => i.text || "").join(" "));
  const practicePage = (screen) => { const t = screenText(screen); const positive = t.replace(/\b(?:not graded|ungraded|no grade|won[’']t be graded|will not be graded)\b/gi, " "); return PRACTICE.test(t) && !GRADED.test(positive); };
  const gradedPage = (screen) => testPage(screen) && !practicePage(screen);
  const testPage = (screen) => {
    // One line of text: a marker split across items ("Question 3" / "of 20") still reads as one.
    const text = norm((screen?.items || []).slice(0, 120).map((i) => i.text || "").join(" "));
    return TEST_WORDS.test(text) || (TIMED.test(text) && ASKS.test(text));
  };

  const handInControl = (text, screen) => HAND_IN.test(norm(text)) || (testPage(screen) && /^(?:finish|end|grade)$/i.test(norm(text)));

  const SEARCHY = /(^|[^a-z])(search|find|query|url|address|omnibox|urlbar|searchbar|searchbox)([^a-z]|$)/i;
  const forSearch = (item) => !!item && (SEARCHY.test(String(item.hint || "")) || SEARCHY.test(String(item.id || "")) || SEARCHY.test(String(item.desc || "")));
  const look = (screen) => `${screen?.app || ""}|${(screen?.items || []).slice(0, 40).map((i) => `${i.kind}:${i.text}${i.focused ? "*" : ""}${i.on ? "+" : ""}`).join("|")}`;
  const gb = (b) => `${b / 1e9 >= 10 ? Math.round(b / 1e9) : Math.round(b / 1e8) / 10} GB`;

  /**
   * The screenshot with each control from the list boxed and numbered
   * (set-of-marks): a brain that sees pictures answers with the same numbers
   * and understands icons the list can't name. The plain screenshot when the
   * page can't draw (tests, old WebViews).
   */
  async function mark(shot, screen, size) {
    const plain = { mime: "image/jpeg", data: shot.image };
    try {
      if (typeof document === "undefined" || typeof createImageBitmap !== "function") return plain;
      const blob = await (await fetch(`data:image/jpeg;base64,${shot.image}`)).blob();
      const img = await createImageBitmap(blob);
      const c = document.createElement("canvas");
      c.width = img.width;
      c.height = img.height;
      const g = c.getContext("2d");
      g.drawImage(img, 0, 0);
      const k = img.width / (size?.w || img.width);
      const fontPx = Math.max(12, Math.round(img.width / 42));
      g.lineWidth = Math.max(2, Math.round(img.width / 360));
      g.font = `bold ${fontPx}px sans-serif`;
      g.textBaseline = "top";
      for (const it of (screen?.items || []).filter((i) => i.kind === "button" || i.kind === "box" || i.kind === "switch").slice(0, 70)) {
        const x = it.x * k, y = it.y * k, w = it.w * k, h = it.h * k;
        if (!(w > 3 && h > 3)) continue;
        g.strokeStyle = "rgba(255,45,149,.9)";
        g.strokeRect(x, y, w, h);
        const tag = String(it.n);
        const tw = g.measureText(tag).width + 6, th = fontPx + 4;
        const ty = y >= th ? y - th : y;
        g.fillStyle = "#ff2d95";
        g.fillRect(x, ty, tw, th);
        g.fillStyle = "#fff";
        g.fillText(tag, x + 3, ty + 2);
      }
      const url = c.toDataURL("image/jpeg", 0.72);
      img.close?.();
      return { mime: "image/jpeg", data: url.slice(url.indexOf(",") + 1) };
    } catch { return plain; }
  }

  /** What the AI should know without reading a screen: battery, network, storage. */
  async function facts(n) {
    const [d, s] = await Promise.all([n.device?.().catch(() => null), n.storage?.().catch(() => null)]);
    const out = [];
    if (d) {
      if (Number(d.battery) >= 0) out.push(`battery ${d.battery}%${d.charging ? " and charging" : ""}`);
      out.push(d.online ? (d.wifi ? "online on Wi-Fi" : "online on mobile data") : "offline");
      if (d.model) out.push(`phone model ${d.model}`);
    }
    if (s?.total) out.push(`storage ${gb(s.used)} used of ${gb(s.total)} (${gb(s.free)} free)`);
    return out.join("; ");
  }

  /** What a step is called in the chat, on the orb and in the log. */
  function label(a, screen) {
    const item = (screen?.items || []).find((x) => x.n === a.n);
    switch (a.do) {
      case "open": return `Opening ${a.app || "the app"}…`;
      case "settings": return `Opening ${PAGE_NAMES[a.page] || a.page}…`;
      case "tap": return item ? `Tapping “${norm(item.text).slice(0, 40)}”…` : "Tapping…";
      case "type": return `Typing “${a.text.slice(0, 40)}”…`;
      case "scroll": return `Scrolling ${a.dir}…`;
      case "swipe": return `Swiping ${a.dir}…`;
      case "drag": return "Dragging…";
      case "scroll_to": return `Looking for “${norm(a.find || a.text).slice(0, 40)}”…`;
      case "long_press": return item ? `Holding “${norm(item.text).slice(0, 40)}”…` : "Holding…";
      case "double_tap": return item ? `Double-tapping “${norm(item.text).slice(0, 40)}”…` : "Double-tapping…";
      case "tap_at": return "Tapping the screen…";
      case "key": return { recents: "Opening recent apps…", notifications: "Opening notifications…", quick_settings: "Opening quick settings…" }[a.key] || "Pressing a key…";
      case "media": return `Media: ${a.key || "play"}…`;
      case "volume": return `Volume ${a.dir === "up" ? "up" : "down"}…`;
      case "torch": return a.on ? "Turning the torch on…" : "Turning the torch off…";
      case "navigate": return `Directions to ${a.to.slice(0, 40)}…`;
      case "back": return "Going back…";
      case "home": return "Going home…";
      default: return "Waiting for the screen…";
    }
  }

  /**
   * Do `goal` on the phone. ctx: { think(system, prompt) → reply text,
   * stopped() → bool, onStep(text) }. Resolves { text, ok, asked?, stopped? }.
   */
  async function run(goal, ctx = {}) {
    const n = window.IzukiNative;
    const stopped = ctx.stopped || (() => false);
    const onStep = ctx.onStep || (() => {});
    const nap = (ms) => (n?.pause ? n.pause(ms) : new Promise((r) => setTimeout(r, ms)));
    const STOP = { text: "Stopped.", ok: false, stopped: true };
    if (!n?.screen || !n?.act || typeof ctx.think !== "function") {
      return { text: "Phone control needs the Android app with Android control on: Settings → Phone → Phone readiness.", ok: false };
    }
    let shotSize = null;
    async function changedFrom(before, ms) {
      const until = Date.now() + ms;
      while (Date.now() < until) {
        await nap(350);
        if (stopped()) return null;
        const now = await n.screen().catch(() => null);
        if (now && look(now) !== before) return now;
      }
      return null;
    }
    async function act(a, screen) {
      const items = screen?.items || [];
      const own = screen?.app === OWN;
      // A graded quiz or test: the answer is said, never put in. They tap it themselves.
      // (A practice quiz, drill or self-test: Izuki fills it in.)
      if (["tap", "type", "tap_at", "long_press", "double_tap", "drag"].includes(a.do) && gradedPage(screen)) {
        const pick = a.do === "type" ? String(a.text || "").trim() : String(items.find((i) => i.n === a.n)?.text || "").trim();
        // Submit / Turn in on a graded page: the hand-in guard below answers that.
        if (a.do === "type" || !handInControl(pick, screen)) {
        const said = pick ? `The answer is “${pick}”. ` : "";
        return { ok: false, stop: true, note: `${said}This looks like a graded quiz or test, so I'm telling you instead of tapping it: you pick it and you submit it. On a practice quiz I can fill it in for you.` };
        }
      }
      switch (a.do) {
        case "open": {
          if (!a.app) return { ok: false, note: "no app was named" };
          const r = await n.launch(a.app);
          if (!r?.name) return { ok: false, note: `${a.app} isn't installed (or can't be opened)` };
          const shown = r.id && n.waitForApp ? await n.waitForApp(r.id, 9000) : null;
          await nap(600);
          return shown === false ? { ok: false, note: `${r.name} didn't come to the front` } : { ok: true, note: `opened ${r.name}` };
        }
        case "settings": {
          const page = PAGES.includes(a.page) ? a.page : PAGE_ALIASES[a.page];
          if (!page) return { ok: false, note: `there's no Settings page called ${a.page}` };
          const before = look(screen);
          const r = await n.openPanel?.(page);
          if (!r) return { ok: false, note: `Android didn't open ${PAGE_NAMES[page]}` };
          const after = await changedFrom(before, 4000);
          return { ok: true, note: after ? `opened ${PAGE_NAMES[r.opened] || PAGE_NAMES[page]}` : `asked Android for ${PAGE_NAMES[page]} (the screen hasn't changed yet)` };
        }
        case "tap": {
          if (own) return { ok: false, note: "that's Izuki's own chat; open the app or Settings page you need first" };
          const item = items.find((x) => x.n === a.n);
          if (!item) return { ok: false, note: `there's no [${a.n}] on this screen` };
          if (handInControl(item.text, screen)) {
            return { ok: false, stop: true, note: `That’s “${norm(item.text)}” — the button that hands it in. The answer is in; submitting it is yours.` };
          }
          if (RISKY.test(norm(item.text))) {
            return { ok: false, stop: true, note: `That last step needs your finger: tap “${norm(item.text)}” yourself if you want it. I don't press buttons that call, send, pay, buy, delete or reset.` };
          }
          const before = look(screen);
          // `expect`: Android refuses if that number is something else by now.
          const r = await n.act({ op: "click", n: a.n, expect: item.text });
          if (!r?.done) {
            if (r?.reason === "needs-person") return { ok: false, stop: true, note: `That needs your finger: tap “${norm(r.matched || item.text)}” yourself if you want it.` };
            return { ok: false, note: n.why?.(r, `“${norm(item.text)}”`) || `Android didn't press “${norm(item.text)}”` };
          }
          const after = await changedFrom(before, 2500);
          return { ok: true, note: after ? `tapped “${norm(item.text)}”, the screen changed` : `pressed “${norm(item.text)}” but nothing changed` };
        }
        case "type": {
          if (own) return { ok: false, note: "that's Izuki's own chat; open the app you need first" };
          if (!a.text) return { ok: false, note: "there were no words to type" };
          const item = a.n ? items.find((x) => x.n === a.n) : null;
          if (a.n && !item) return { ok: false, note: `there's no [${a.n}] on this screen` };
          if (item && item.kind !== "box") return { ok: false, note: `[${a.n}] isn't a text box` };
          if (item) await n.act({ op: "click", n: a.n });
          // Stop pressed during that tap: nothing gets typed.
          if (stopped()) return { ok: false, stop: true, note: "Stopped before typing." };
          const r = await n.act({ op: "type", n: item ? a.n : 0, text: a.text });
          if (!r?.done) return { ok: false, note: n.why?.(r, "") || "Android didn't accept the typing" };
          let note = r.verified === false ? `typed “${a.text}” (the box didn't show it back)` : `typed “${a.text}”`;
          if (a.enter) {
            if (!forSearch(item)) note += "; didn't press Enter (it isn't a search box)";
            // Screen text reaches the AI, so a web address it typed could carry
            // something private off the phone: opening one needs the person's yes.
            // A scheme, "www.", a dotted host with a path or query ("x.example/?q="),
            // or a bare host with a common ending.
            else if (/:\/\/|\bwww\.|\blocalhost\b|\b[a-z0-9-]+(?:\.[a-z0-9-]+)+(?:[/?#]|:\d)|\b[a-z0-9-]+\.(?:com|net|org|io|ai|co|me|ly|app|dev|xyz|info|ru|cn|uk|ng|de|fr|tk|top|site|online|link)\b/i.test(a.text)) {
              return { ok: false, stop: true, note: `I typed the address “${a.text.slice(0, 80)}” but didn't open it: press Enter yourself if you want to go there.` };
            } else {
              if (stopped()) return { ok: false, stop: true, note: "Stopped before pressing Search." };
              const s = await n.act({ op: "submit" });
              note += s?.done ? " and pressed Search" : "; couldn't find a Search key";
              await nap(900);
            }
          }
          return { ok: true, note };
        }
        case "long_press":
        case "double_tap":
        case "tap_at": {
          if (own) return { ok: false, note: "that's Izuki's own chat; open the app you need first" };
          let x, y, item = null;
          if (a.do === "long_press" || (a.do === "double_tap" && a.n)) {
            const target = items.find((i) => i.n === a.n);
            if (!target) return { ok: false, note: `there's no [${a.n}] on this screen` };
            x = target.x + target.w / 2; y = target.y + target.h / 2;
          } else {
            if (!shotSize || !(a.x >= 0 && a.x <= 1000 && a.y >= 0 && a.y <= 1000)) return { ok: false, note: "there was no screenshot to point at: use a number from the list" };
            x = (a.x / 1000) * shotSize.w; y = (a.y / 1000) * shotSize.h;
          }
          // Everything under the point, if Android lists it: the same safety
          // rules as a numbered tap, for every control there (a harmless label
          // inside a "Delete" button doesn't hide the button). A point over
          // nothing listed (a map, a game, a drawing) is allowed.
          const under = items.filter((i) => i.w > 0 && i.h > 0 && x >= i.x && x <= i.x + i.w && y >= i.y && y <= i.y + i.h)
            .sort((p, q) => p.w * p.h - q.w * q.h);
          item = under.find((i) => RISKY.test(norm(i.text))) || (a.n ? items.find((i) => i.n === a.n) : null) || under[0] || null;
          if (item && handInControl(item.text, screen)) {
            return { ok: false, stop: true, note: `That’s “${norm(item.text)}” — the button that hands it in. The answer is in; submitting it is yours.` };
          }
          if (item && RISKY.test(norm(item.text))) {
            return { ok: false, stop: true, note: `That last step needs your finger: tap “${norm(item.text)}” yourself if you want it. I don't press buttons that call, send, pay, buy, delete or reset.` };
          }
          const before = look(screen);
          const point = { x: Math.round(x), y: Math.round(y) };
          let r = await n.act({ op: a.do === "long_press" ? "longpress" : "tap", ...point, ms: 650 });
          // A double tap: the second touch right after the first (Android's double-tap window is about 300 ms).
          if (r?.done && a.do === "double_tap") {
            if (stopped()) return { ok: false, stop: true, note: "Stopped after the first tap." };
            r = await n.act({ op: "tap", ...point });
          }
          if (!r?.done) return { ok: false, note: n.why?.(r, "") || "Android didn't take the touch" };
          const after = await changedFrom(before, 2500);
          const what = item ? `“${norm(item.text).slice(0, 40)}”` : "that spot";
          const did = a.do === "long_press" ? "held" : a.do === "double_tap" ? "double-tapped" : "tapped";
          return { ok: true, note: `${did} ${what}${after ? ", the screen changed" : " but nothing changed"}` };
        }
        case "drag": {
          if (own) return { ok: false, note: "that's Izuki's own chat; open the app you need first" };
          let start, end, fromItem = null, toItem = null;
          if (a.from_n || a.to_n) {
            if (!a.from_n || !a.to_n) return { ok: false, note: "drag needs both from_n and to_n, or x/y and x2/y2" };
            fromItem = items.find((i) => i.n === a.from_n);
            toItem = items.find((i) => i.n === a.to_n);
            if (!fromItem || !toItem) return { ok: false, note: `there's no [${!fromItem ? a.from_n : a.to_n}] on this screen` };
            start = { x: fromItem.x + fromItem.w / 2, y: fromItem.y + fromItem.h / 2 };
            end = { x: toItem.x + toItem.w / 2, y: toItem.y + toItem.h / 2 };
          } else {
            if (!shotSize || ![a.x, a.y, a.x2, a.y2].every((v) => Number.isFinite(v) && v >= 0 && v <= 1000)) {
              return { ok: false, note: "there was no screenshot to point at: use numbers from the list" };
            }
            start = { x: (a.x / 1000) * shotSize.w, y: (a.y / 1000) * shotSize.h };
            end = { x: (a.x2 / 1000) * shotSize.w, y: (a.y2 / 1000) * shotSize.h };
          }
          // Both ends get the same risky-control scan as a tap: a drag must not
          // start or finish on Send, Delete, Buy, Install and the like.
          const under = (px, py) => items.filter((i) => i.w > 0 && i.h > 0 && px >= i.x && px <= i.x + i.w && py >= i.y && py <= i.y + i.h)
            .sort((p, q) => p.w * p.h - q.w * q.h);
          const riskyItem = [fromItem, toItem, ...under(start.x, start.y), ...under(end.x, end.y)].find((i) => i && RISKY.test(norm(i.text)));
          if (riskyItem) {
            return { ok: false, stop: true, note: `That last step needs your finger: “${norm(riskyItem.text)}” is at one end of the drag. I don't drag onto buttons that call, send, pay, buy, delete or reset.` };
          }
          const before = look(screen);
          const r = await n.act({ op: "swipe", x: Math.round(start.x), y: Math.round(start.y), x2: Math.round(end.x), y2: Math.round(end.y), ms: 700 });
          if (!r?.done) return { ok: false, note: n.why?.(r, "") || "Android didn't take the drag" };
          const after = await changedFrom(before, 2500);
          const what = fromItem && toItem ? `“${norm(fromItem.text).slice(0, 40)}” to “${norm(toItem.text).slice(0, 40)}”` : "that spot";
          return { ok: true, note: `dragged ${what}${after ? ", the screen changed" : " but nothing changed"}` };
        }
        case "scroll_to": {
          if (own) return { ok: false, note: "that's Izuki's own chat; open the app you need first" };
          const wanted = norm(a.find || a.text);
          if (!wanted) return { ok: false, note: "no control words were given" };
          const has = (s) => (s?.items || []).find((i) => norm(i.text).toLowerCase().includes(wanted.toLowerCase()));
          const here = has(screen);
          if (here) return { ok: true, note: `“${norm(here.text).slice(0, 40)}” is already on screen` };
          let cur = screen;
          for (let k = 0; k < 8; k++) {
            if (stopped()) return { ok: false, stop: true, note: "Stopped while scrolling." };
            const before = look(cur);
            const r = await n.act({ op: "scroll", dir: "down" });
            if (!r?.done) return { ok: false, note: n.why?.(r, "") || "nothing scrolled" };
            await nap(450);
            const next = await n.screen().catch(() => null);
            if (!next || next.locked) return { ok: false, stop: true, note: "I couldn't read the screen while scrolling." };
            const hit = has(next);
            if (hit) return { ok: true, note: `scrolled until “${norm(hit.text).slice(0, 40)}” was on screen` };
            if (look(next) === before) return { ok: false, note: `couldn't find “${wanted}”; the screen stopped moving` };
            cur = next;
          }
          return { ok: false, note: `couldn't find “${wanted}” after 8 scrolls` };
        }
        case "swipe": {
          const w = Number(screen?.w) || 1080, h = Number(screen?.h) || 2340;
          const from = a.dir === "left" ? 0.82 : 0.18, to = a.dir === "left" ? 0.18 : 0.82;
          const before = look(screen);
          const r = await n.act({ op: "swipe", x: Math.round(w * from), y: Math.round(h * 0.5), x2: Math.round(w * to), y2: Math.round(h * 0.5), ms: 280 });
          if (!r?.done) return { ok: false, note: n.why?.(r, "") || "Android didn't take the swipe" };
          const after = await changedFrom(before, 2000);
          return { ok: true, note: after ? `swiped ${a.dir}` : `swiped ${a.dir} but nothing changed` };
        }
        case "key": {
          if (!["recents", "notifications", "quick_settings"].includes(a.key)) return { ok: false, note: `there's no key called ${a.key || "that"}` };
          const ok = await n.phoneAction?.(a.key);
          await nap(700);
          return ok ? { ok: true, note: `opened ${a.key.replace("_", " ")}` } : { ok: false, note: "Android didn't accept it" };
        }
        case "media": {
          const key = ["play", "pause", "next", "previous"].includes(a.key) ? a.key : "play";
          const ok = await n.media?.(key);
          return ok ? { ok: true, note: `pressed ${key}` } : { ok: false, note: "Android didn't take the media key" };
        }
        case "volume": {
          const ok = await n.volume?.(a.dir === "up" ? "up" : "down");
          return ok ? { ok: true, note: `turned the volume ${a.dir === "up" ? "up" : "down"}` } : { ok: false, note: "Android didn't change the volume" };
        }
        case "torch": {
          const r = await n.torch?.(a.on);
          return r ? { ok: true, note: `torch ${a.on ? "on" : "off"}` } : { ok: false, note: "this phone's torch couldn't be switched" };
        }
        case "navigate": {
          if (!a.to) return { ok: false, note: "no place was named" };
          const r = await n.navigate?.(a.to);
          await nap(1500);
          return r ? { ok: true, note: `started directions to ${a.to}` } : { ok: false, note: "Google Maps didn't start directions" };
        }
        case "scroll": {
          const r = await n.act({ op: "scroll", dir: a.dir });
          await nap(450);
          return r?.done ? { ok: true, note: `scrolled ${a.dir}` } : { ok: false, note: n.why?.(r, "") || "nothing scrolled" };
        }
        case "back":
        case "home": {
          const r = await n.act({ op: a.do });
          await nap(600);
          return r?.done ? { ok: true, note: a.do === "back" ? "went back" : "went home" } : { ok: false, note: "Android didn't accept it" };
        }
        default:
          await nap(1500);
          return { ok: true, note: "waited" };
      }
    }

    // One run at a time; a refused call never reaches the running one's cleanup.
    if (agentBusy) return { text: "I'm already working on the phone. Wait for that to finish, then ask again.", ok: false };
    if (!ctx.viaAutopilot && window.IzukiAutopilot?.state?.running) return { text: "Autopilot is running a routine on the phone. Stop it first, then ask me again.", ok: false };
    agentBusy = true;
    try {
      return await steps();
    } finally {
      agentBusy = false;
    }
    async function steps() {
    const known = await facts(n);
    const done = [];
    const tried = new Map();
    let misses = 0, fails = 0, plan = "";
    for (let i = 0; i < MAX_STEPS; i++) {
      if (stopped()) return STOP;
      const screen = await n.screen().catch(() => null);
      if (!screen) {
        const d = await n.device?.().catch(() => null);
        if (d?.locked) return { text: "Your phone is locked. Unlock it and ask me again: I never act on a locked phone.", ok: false };
        return { text: "I can't read the screen right now. Check that Android control is on in Settings → Phone → Phone readiness.", ok: false };
      }
      if (screen.locked) return { text: "Your phone is locked. Unlock it and ask me again: I never act on a locked phone.", ok: false };
      const own = screen.app === OWN;
      // Eyes as well as the list (a brain that sees pictures): the screen
      // with each control's number drawn on it. Protected screens have none.
      let image = null, picture = "";
      shotSize = null;
      if (ctx.see && !own && n.snapshot) {
        const shot = await n.snapshot().catch(() => null);
        if (shot?.image) {
          // A cheap fingerprint of the whole picture (FNV over every 61st character):
          // swiping through photos changes it even when the list doesn't.
          let h = 2166136261;
          for (let k = 0; k < shot.image.length; k += 61) { h ^= shot.image.charCodeAt(k); h = Math.imul(h, 16777619); }
          picture = `${shot.image.length}:${(h >>> 0).toString(36)}`;
          shotSize = { w: Number(shot.w) || Number(screen.w) || 0, h: Number(shot.h) || Number(screen.h) || 0 };
          if (!(shotSize.w > 0 && shotSize.h > 0)) shotSize = null;
          image = await mark(shot, screen, shotSize);
        }
      }
      const prompt = [
        `Goal: ${goal}`,
        plan ? `Your plan: ${plan}` : "",
        known ? `Facts: ${known}` : "",
        done.length ? `Done so far:\n${done.slice(-14).map((d, k) => `${done.length > 14 ? done.length - 14 + k + 1 : k + 1}. ${d}`).join("\n")}` : "Done so far: nothing yet.",
        own ? "On screen now: Izuki's own chat. Don't tap it: open the app or Settings page you need."
          : `On screen now (app ${screen.app || "unknown"}):\n${describe(screen) || "(nothing readable on this screen)"}`,
        image ? "A screenshot of this screen is attached; the pink numbers are the list's numbers." : "",
        "Your next single action, as one JSON object:",
      ].filter(Boolean).join("\n\n");
      let reply;
      try { reply = await ctx.think(SYSTEM, prompt, image); }
      catch (e) { if (stopped()) return STOP; throw e; }
      if (stopped()) return STOP;
      const a = parse(reply);
      if (!a) {
        // A model that answers in words twice: its words are the answer.
        if (++misses >= 2) {
          const words = norm(String(reply || "").replace(/<think>[\s\S]*?(<\/think>|$)/gi, "").replace(/[{}`*#]/g, ""));
          return { text: words || "I couldn't work out the next step on this screen.", ok: !!words };
        }
        done.push("(that reply wasn't one JSON action: answer with JSON only)");
        continue;
      }
      misses = 0;
      if (a.plan) plan = a.plan;
      if (a.do === "done") return { text: a.say || "Done.", ok: true, steps: done.length };
      if (a.do === "ask") return { text: a.say || "What should I do next?", ok: true, asked: true };
      const what = label(a, screen);
      // The same action on the same screen a third time: it isn't working.
      const sameKey = `${look(screen)}#${picture}#${a.do}|${a.n}|${a.app}|${a.page}|${a.text}|${a.dir}|${a.x}|${a.y}|${a.x2}|${a.y2}|${a.from_n}|${a.to_n}|${a.find}|${a.key}`;
      const times = (tried.get(sameKey) || 0) + 1;
      tried.set(sameKey, times);
      if (times >= 3) {
        done.push(`${what.replace(/…$/, "")}: skipped, that's the third time on this same screen and it hasn't helped; do something different`);
        if (++fails >= 4) return { text: "I keep ending up on the same screen without getting further, so I stopped here. Tell me what to do next, or take over.", ok: false };
        continue;
      }
      onStep(what);
      const r = await act(a, screen);
      if (stopped()) return STOP;
      done.push(`${what.replace(/…$/, "")}: ${r.note}`);
      if (r.stop) return { text: r.note, ok: false, asked: true };
      if (r.ok) fails = 0;
      else if (++fails >= 4) return { text: `I got stuck: ${r.note}. ${done.length > 1 ? "I left the phone where it is so you can take over." : ""}`.trim(), ok: false };
    }
    return { text: "That took more steps than I allow myself, so I stopped where it is. Tell me what to do next, or take over from here.", ok: false };
    }
  }

  /** Autopilot and the agent take turns: both use Android's one numbered screen list. */
  let agentBusy = false;

  window.IzukiAgent = { run, get busy() { return agentBusy; }, _test: { parse, describe, facts, RISKY, SYSTEM, PAGES, testPage, practicePage, gradedPage } };
})();
