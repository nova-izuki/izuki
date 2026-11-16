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
  const MAX_STEPS = 14;
  const OWN = "com.novaizuki.mobile";
  // Calling someone is an outward action too: the person presses Call. So
  // are installing apps and granting permissions. The same actions in
  // Spanish, Portuguese, French and German, for phones set to those.
  const RISKY = /\b(send|call|dial|video call|pay|buy|order|purchase|delete|erase|remove|uninstall|check ?out|subscribe|transfer|place order|reset|format|wipe|clear (?:data|storage|cache|history|all)|factory|sign out|log ?out|force stop|disable|install|allow|grant|accept|enviar|llamar|eliminar|borrar|pagar|comprar|instalar|desinstalar|permitir|aceptar|excluir|aceitar|envoyer|appeler|supprimer|effacer|payer|acheter|installer|désinstaller|autoriser|accepter|restablecer|redefinir|formatear|formatar|desactivar|desativar|cerrar sesión|sair da conta|réinitialiser|formater|désactiver|déconnexion|se déconnecter|zurücksetzen|formatieren|deaktivieren|abmelden|senden|anrufen|löschen|entfernen|bezahlen|kaufen|installieren|deinstallieren|zulassen|erlauben|akzeptieren)\b/i;
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
    '{"do":"type","n":<number of a box>,"text":"<words>","enter":true|false}  (enter only for a search box)',
    '{"do":"scroll","dir":"down|up"}',
    '{"do":"back"}  {"do":"home"}  {"do":"wait"}',
    '{"do":"done","say":"<the answer or what you did, 1-3 short spoken sentences>"}',
    '{"do":"ask","say":"<a short question for the person>"}',
    "Rules:",
    "- Only use numbers that are on the current screen. If what you need isn't visible, scroll or go another way.",
    "- Read answers off the screen and the facts; never invent numbers or names. When the screen shows the answer, finish with done.",
    "- Storage questions: open settings page storage and read the sizes it lists (apps, images, videos, audio, documents, system, other); open a category only if it helps.",
    "- Never press anything that calls someone, sends, pays, buys, orders, deletes, uninstalls, clears, resets, signs out or force-stops. If the goal needs that, finish with ask and tell the person which button to press themselves.",
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
      scroll: "scroll", swipe: "scroll", back: "back", go_back: "back", home: "home", go_home: "home", wait: "wait",
      done: "done", finish: "done", answer: "done", reply: "done", say: "done", ask: "ask", question: "ask", confirm: "ask",
    };
    const kind = kinds[act];
    if (!kind) return null;
    const n = Number(obj.n ?? obj.target ?? obj.number ?? obj.item ?? obj.id);
    const page = norm(obj.page ?? (kind === "settings" ? obj.name : "")).toLowerCase();
    return {
      do: kind,
      n: Number.isFinite(n) ? Math.round(n) : 0,
      app: norm(obj.app ?? obj.name ?? ""),
      page: PAGES.includes(page) ? page : PAGE_ALIASES[page] || page.replace(/\s+/g, "_"),
      text: String(obj.text ?? obj.value ?? ""),
      enter: obj.enter === true || obj.submit === true,
      dir: /up/i.test(String(obj.dir ?? obj.direction ?? "")) ? "up" : "down",
      say: norm(obj.say ?? obj.answer ?? obj.message ?? obj.reply ?? obj.text ?? ""),
    };
  }

  /** A quiz, test or exam page, from its own words ("Question 3 of 20", "Submit quiz", "Time remaining"). */
  // Assessment markers, not just the word "quiz" (a search for "pub quiz" isn't a test).
  const TEST_WORDS = /\b(question \d+(?:\s+of\s+|\s*\/\s*)\d+|\d+ of \d+ questions|submit (?:test|quiz|exam|answers|attempt|assessment)|finish (?:test|attempt|quiz|exam)|attempt \d+(?: of \d+)?|(?:quiz|exam|test|assessment) (?:in progress|timer|results)|end (?:test|exam|quiz))\b/i;
  // A timer alone is a video or a download; with questions or answers it's a test.
  const TIMED = /\btime (?:left|remaining)\b/i;
  const ASKS = /\b(?:question|answer)s?\b/i;
  const testPage = (screen) => {
    // One line of text: a marker split across items ("Question 3" / "of 20") still reads as one.
    const text = norm((screen?.items || []).slice(0, 120).map((i) => i.text || "").join(" "));
    return TEST_WORDS.test(text) || (TIMED.test(text) && ASKS.test(text));
  };

  const SEARCHY = /(^|[^a-z])(search|find|query|url|address|omnibox|urlbar|searchbar|searchbox)([^a-z]|$)/i;
  const forSearch = (item) => !!item && (SEARCHY.test(String(item.hint || "")) || SEARCHY.test(String(item.id || "")) || SEARCHY.test(String(item.desc || "")));
  const look = (screen) => `${screen?.app || ""}|${(screen?.items || []).slice(0, 40).map((i) => `${i.kind}:${i.text}${i.focused ? "*" : ""}${i.on ? "+" : ""}`).join("|")}`;
  const gb = (b) => `${b / 1e9 >= 10 ? Math.round(b / 1e9) : Math.round(b / 1e8) / 10} GB`;

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
      // A quiz, test or exam on screen: Izuki explains, but never picks or types answers.
      if ((a.do === "tap" || a.do === "type") && testPage(screen)) {
        return { ok: false, stop: true, note: "This looks like a quiz or test, so I won't pick or type answers for you. Say “explain this” and I'll walk you through the question." };
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
              const s = await n.act({ op: "submit" });
              note += s?.done ? " and pressed Search" : "; couldn't find a Search key";
              await nap(900);
            }
          }
          return { ok: true, note };
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
    if (window.IzukiAutopilot?.state?.running) return { text: "Autopilot is running a routine on the phone. Stop it first, then ask me again.", ok: false };
    agentBusy = true;
    try {
      return await steps();
    } finally {
      agentBusy = false;
    }
    async function steps() {
    const known = await facts(n);
    const done = [];
    let misses = 0, fails = 0;
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
      const prompt = [
        `Goal: ${goal}`,
        known ? `Facts: ${known}` : "",
        done.length ? `Done so far:\n${done.map((d, k) => `${k + 1}. ${d}`).join("\n")}` : "Done so far: nothing yet.",
        own ? "On screen now: Izuki's own chat. Don't tap it: open the app or Settings page you need."
          : `On screen now (app ${screen.app || "unknown"}):\n${describe(screen) || "(nothing readable on this screen)"}`,
        "Your next single action, as one JSON object:",
      ].filter(Boolean).join("\n\n");
      let reply;
      try { reply = await ctx.think(SYSTEM, prompt); }
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
      if (a.do === "done") return { text: a.say || "Done.", ok: true, steps: done.length };
      if (a.do === "ask") return { text: a.say || "What should I do next?", ok: true, asked: true };
      const what = label(a, screen);
      onStep(what);
      const r = await act(a, screen);
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

  window.IzukiAgent = { run, get busy() { return agentBusy; }, _test: { parse, describe, facts, RISKY, SYSTEM, PAGES, testPage } };
})();
