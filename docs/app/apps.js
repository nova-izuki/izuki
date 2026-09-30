// Izuki in the user's own apps, straight from the phone — Gmail, Calendar,
// Drive, Slack, GitHub, Blackboard and hundreds more, through Composio's
// Tool Router. This is the same protocol the PC uses (src-tauri/src/composio.rs),
// so the two behave identically.
//
// Why this can live in a browser at all: Composio echoes the caller's Origin on
// authenticated calls, so no proxy or server is needed. Each person uses their
// own free Composio key and nothing is hosted by Izuki.
//
// Kept light on the AI: rather than stuffing hundreds of tool definitions into
// the prompt, the model *searches* for what it needs, gets back just those
// tools, runs one, sees the result and answers. The model speaks a tiny JSON
// protocol, so it works with every brain.
//
// Two rules that matter more than they look:
//   1. Nothing about the user's data may be claimed until a tool has really
//      run. A search only finds *tools*; it does not open the mailbox, and a
//      model left to itself will invent an inbox and then insist it "checked it
//      directly". So an answer with no tool behind it is sent back, and if it
//      still won't look we say so honestly instead of guessing.
//   2. A repeat read is answered from the last real answer, with no AI call at
//      all — so asking twice costs nothing, is instant, and cannot invent.
//
// Nothing is sent, posted, deleted or bought without the user saying yes.

(() => {
  "use strict";

  const API = "https://backend.composio.dev/api/v3";
  /** Look/act rounds for one request. */
  const MAX_ROUNDS = 6;
  /** Never keep them waiting for minutes. */
  const BUDGET_MS = 70000;
  /** How long a cached answer counts as current. */
  const SNAPSHOT_MINS = 5;
  const KEPT = 8;

  const KEY = "composio";
  const USER = "composioUser";

  const read = (k) => {
    try {
      return localStorage.getItem("izuki." + k) || "";
    } catch {
      return "";
    }
  };
  const write = (k, v) => {
    try {
      localStorage.setItem("izuki." + k, v);
    } catch {}
  };
  const forget = (k) => {
    try {
      localStorage.removeItem("izuki." + k);
    } catch {}
  };

  const key = () => read(KEY).trim();
  const configured = () => !!key();

  // ------------------------------------------------------------- transport
  const sessionId = { id: null, for: "" };

  async function post(path, body, useKey) {
    const res = await fetch(API + path, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": useKey },
      body: JSON.stringify(body),
    });
    const v = await res.json().catch(() => null);
    if (!res.ok) {
      const msg =
        v?.error?.message || v?.message || v?.error || res.statusText || "no details";
      throw new Error(`Composio answered ${res.status}: ${msg}`);
    }
    return v;
  }

  /** This phone's Composio user — made once and kept. */
  function userId() {
    let id = read(USER);
    if (!id) {
      const rand = crypto.randomUUID ? crypto.randomUUID().replace(/-/g, "") : String(Date.now()) + Math.random().toString(36).slice(2);
      id = "izuki-" + rand.slice(0, 20);
      write(USER, id);
    }
    return id;
  }

  async function session(fresh) {
    const k = key();
    if (!fresh && sessionId.id && sessionId.for === k) return sessionId.id;
    // No premium (paid-per-call) tools: Izuki stays free.
    const v = await post("/tool_router/session", { user_id: userId(), premium_usage: false }, k);
    if (!v.session_id) throw new Error("Composio gave no session");
    sessionId.id = v.session_id;
    sessionId.for = k;
    return v.session_id;
  }

  /** Call the router, making a new session once if the old one expired. */
  async function router(action, body) {
    const k = key();
    try {
      return await post(`/tool_router/session/${await session(false)}/${action}`, body, k);
    } catch (e) {
      if (/404|session/i.test(String(e.message))) {
        return await post(`/tool_router/session/${await session(true)}/${action}`, body, k);
      }
      throw e;
    }
  }

  // ----------------------------------------------------------------- setup
  /** Check a key works (the Settings "Test" button), before it is saved. */
  async function testKey(candidate) {
    const v = await post("/tool_router/session", { user_id: userId(), premium_usage: false }, candidate.trim());
    if (!v.session_id) throw new Error("Composio didn't accept that key");
    return true;
  }

  function saveKey(value) {
    const k = String(value || "").trim();
    if (k) write(KEY, k);
    else forget(KEY);
    sessionId.id = null;
    sessionId.for = "";
  }

  /** This phone's linked apps (toolkit slugs like "gmail"). */
  async function connected() {
    if (!configured()) return [];
    const res = await fetch(`${API}/connected_accounts?user_ids=${encodeURIComponent(userId())}&statuses=ACTIVE&limit=100`, {
      headers: { "x-api-key": key(), Accept: "application/json" },
    });
    if (!res.ok) throw new Error(`Composio answered ${res.status}`);
    const v = await res.json().catch(() => ({}));
    const out = (v.items || [])
      .map((c) => c?.toolkit?.slug || c?.toolkit_slug)
      .filter(Boolean)
      .map((s) => s.toLowerCase());
    return [...new Set(out)].sort();
  }

  /** A sign-in page for one app. */
  async function link(toolkit) {
    const v = await router("link", { toolkit: String(toolkit).trim().toLowerCase() });
    const url = v.redirect_url || v.data?.redirect_url || "";
    if (!url) throw new Error(`Composio couldn't make a sign-in link for ${toolkit}`);
    return url;
  }

  // ------------------------------------------------------------- snapshots
  // The last finished answer per app, so a repeat question costs no AI.
  const snaps = new Map();

  const nowMins = () => Math.floor(Date.now() / 60000);

  const ago = (then) => {
    const n = nowMins() - then;
    if (n <= 0) return "just now";
    if (n === 1) return "a minute ago";
    if (n < 60) return `${n} minutes ago`;
    return `${Math.floor(n / 60)} hours ago`;
  };

  function snapPut(app, text) {
    snaps.set(app, { at: nowMins(), text });
    while (snaps.size > KEPT) snaps.delete(snaps.keys().next().value);
  }

  /** The app a read-only question is about, if we recognise it. */
  const APPS = [
    ["inbox", "gmail"], ["gmail", "gmail"], ["email", "gmail"], ["mail", "gmail"],
    ["calendar", "googlecalendar"], ["diary", "googlecalendar"], ["schedule", "googlecalendar"],
    ["drive", "googledrive"], ["cloud file", "googledrive"], ["notion", "notion"],
    ["notes", "notion"], ["slack", "slack"], ["github", "github"], ["blackboard", "blackboard"],
    ["canvas", "canvas"], ["whatsapp", "whatsapp"], ["telegram", "telegram"], ["youtube", "youtube"],
  ];
  const askedApp = (said) => {
    const t = String(said || "").toLowerCase();
    return (APPS.find(([k]) => t.includes(k)) || [])[1] || null;
  };

  /**
   * A question that only *reads* — safe to answer from a snapshot. Anything
   * that sends, posts, changes or deletes is never served this way, however
   * innocent it sounds ("delete the last email" is not a question).
   */
  function isReadQuestion(said) {
    const t = String(said || "").toLowerCase();
    const READ = ["new", "unread", "latest", "any", "check", "what's in", "whats in", "read", "show me", "how many", "last "];
    const ACTS = [
      "send", "delete", "remove", "archive", "reply", "respond", "forward", "post",
      "schedule", "book", "move", "rename", "add ", "create", "update", "set ",
      "mark", "star", "unread it", "buy", "pay", "cancel", "confirm", "summarise",
      "summarize", "explain", "translate",
    ];
    if (ACTS.some((k) => t.includes(k))) return false;
    // "check again" / "refresh" means they want a fresh look, not the cache.
    if (["again", "refresh", "now", "re-", "update"].some((k) => t.includes(k))) return false;
    return READ.some((k) => t.includes(k));
  }

  /** The snapshot answer for a repeat read — no AI involved. */
  function snapAnswer(said) {
    const app = askedApp(said);
    if (!app || !isReadQuestion(said)) return null;
    const s = snaps.get(app);
    if (!s || nowMins() - s.at > SNAPSHOT_MINS) return null;
    return `${s.text}\n\n(That is what I read ${ago(s.at)} — say “check again” for a fresh look.)`;
  }

  // ------------------------------------------------------------- the model
  const PROMPT =
    "You are Izuki, the user's warm, quick AI companion, working in their apps " +
    "(email, calendar, files, chat apps, notes, social media and more) through tools. Work step by step. " +
    "Every reply is ONE JSON object and nothing else, one of:\n" +
    '{"search": "what you need to do, e.g. find unread emails from today"} — finds the right tools and ' +
    "tells you which apps are connected. Always search before using a tool you haven't seen.\n" +
    '{"run": {"tool": "TOOL_SLUG", "arguments": {…}}} — runs a tool you found, with arguments ' +
    "matching its schema.\n" +
    '{"connect": "gmail"} — when a needed app isn\'t connected: gives the user a sign-in link.\n' +
    '{"reply": "what you say to the user"} — when you\'re done, or need to ask something.\n' +
    "Rules: keep replies short and friendly, plain text. Summarise results the way a person would " +
    '("You\'ve got 3 new emails — one from Sam about Friday…"), never dump raw data. NEVER send, post, ' +
    "reply, delete, pay, accept or change anything on the user's behalf unless their latest message " +
    'clearly says yes to exactly that — first show them the draft or what you\'ll do and ask "Want me to ' +
    'send it?". Reading and searching needs no permission. If a tool fails, try once another way, then ' +
    "tell them simply what went wrong.";

  /** The first JSON object in a reply (models wrap it in prose or fences). */
  function parseStep(raw) {
    const s = String(raw || "");
    const a = s.indexOf("{");
    const b = s.lastIndexOf("}");
    if (a < 0 || b <= a) return null;
    try {
      const v = JSON.parse(s.slice(a, b + 1));
      return v && typeof v === "object" && !Array.isArray(v) ? v : null;
    } catch {
      return null;
    }
  }

  const clip = (s, n) => (s.length <= n ? s : s.slice(0, n) + "…");

  const pretty = (app) =>
    ({
      gmail: "Gmail",
      googlecalendar: "Google Calendar",
      googledrive: "Google Drive",
      googledocs: "Google Docs",
      googlesheets: "Google Sheets",
      outlook: "Outlook",
      github: "GitHub",
      linkedin: "LinkedIn",
      youtube: "YouTube",
    })[app] ||
    app.charAt(0).toUpperCase() + app.slice(1);

  /** The search result, trimmed to what the model needs to pick and call. */
  function describeSearch(v) {
    let s = "";
    const wanted = [];
    for (const r of v.results || []) {
      const tools = r.primary_tool_slugs || [];
      if (tools.length) s += `Tools for this: ${tools.join(", ")}\n`;
      if (r.execution_guidance) s += `How: ${clip(r.execution_guidance, 600)}\n`;
      const steps = r.recommended_plan_steps || [];
      if (steps.length) s += `Plan: ${steps.slice(0, 6).map((x) => clip(String(x), 200)).join(" → ")}\n`;
      if ((r.known_pitfalls || []).length) s += `Watch out: ${clip(r.known_pitfalls.slice(0, 3).join("; "), 400)}\n`;
      wanted.push(...tools);
    }
    for (const c of v.toolkit_connection_statuses || []) {
      const on = c.has_active_connection === true;
      s += `App ${c.toolkit || "?"}: ${on ? "connected" : 'NOT connected — use {"connect": "<app>"}'}\n`;
    }
    const schemas = v.tool_schemas || {};
    for (const slug of wanted.slice(0, 4)) {
      if (schemas[slug]) s += `Schema ${slug}: ${clip(JSON.stringify(schemas[slug]), 1800)}\n`;
    }
    return clip(s || `Nothing found. ${clip(JSON.stringify(v.error || ""), 300)}`, 7000);
  }

  /** The first app a search said isn't linked yet. */
  const unconnected = (v) => {
    const bad = (v.toolkit_connection_statuses || []).find((c) => c.has_active_connection !== true);
    return bad?.toolkit ? String(bad.toolkit).toLowerCase() : null;
  };

  // ------------------------------------------------------------------ ask
  /**
   * Answer a request that needs the user's apps. `complete(messages)` runs the
   * phone's own brain. Returns {text, links}.
   */
  async function ask(history, complete) {
    if (!configured()) {
      return { text: "Link your apps in Settings first, and I can read and handle them from here.", links: [] };
    }
    const last = [...history].reverse().find((t) => t.role !== "model")?.content || "";

    // A repeat read: answer from the last real answer. No AI, instant, true.
    const cached = snapAnswer(last);
    if (cached) return { text: cached, links: [] };

    const messages = [{ role: "system", content: PROMPT }];
    for (const t of history.slice(-10)) {
      messages.push({ role: t.role === "model" ? "assistant" : "user", content: t.content });
    }

    const links = [];
    let executed = false;
    let nagged = 0;
    let missing = null;
    let readApp = null;
    const began = Date.now();

    for (let round = 0; round < MAX_ROUNDS; round++) {
      if (Date.now() - began > BUDGET_MS) break;
      const raw = await complete(messages);
      const step = parseStep(raw);
      if (!step) return { text: String(raw || "").trim().replace(/`/g, ""), links };

      messages.push({ role: "assistant", content: JSON.stringify(step) });

      let seen;
      if (typeof step.reply === "string") {
        // An answer that never read anything is a guess, not an answer.
        if (!executed && nagged < 2) {
          nagged++;
          messages.push({
            role: "user",
            content:
              "You have not read anything yet. Searching only finds which tools exist — it does not open " +
              'the app, so you cannot know what is in the user\'s inbox, calendar or files. Either ' +
              '{"run": {"tool": …, "arguments": {…}}} to really call a tool and read its result, or ' +
              '{"connect": "<app>"} if that app is not linked yet. Until a tool has run, do not describe ' +
              "the user's data.",
          });
          continue;
        }
        if (!executed) {
          // It still will not look. Say so honestly instead of inventing.
          const app = missing || "gmail";
          try {
            links.push([pretty(app), await link(app)]);
          } catch {}
          return {
            text: `I couldn't actually open your ${pretty(app)} just now, so I don't want to guess at what's in there. Sign in with the link (just once), then ask me again.`,
            links,
          };
        }
        const text = step.reply.trim();
        if (readApp) snapPut(readApp, text);
        return { text, links };
      } else if (typeof step.search === "string") {
        try {
          const v = await router("search", { queries: [{ use_case: step.search }] });
          missing = missing || unconnected(v);
          seen = describeSearch(v);
        } catch (e) {
          seen = `Search failed: ${e.message}`;
        }
      } else if (typeof step.connect === "string") {
        const app = String(step.connect).trim().toLowerCase();
        try {
          const url = await link(app);
          links.push([pretty(app), url]);
          return {
            text: `I need access to your ${pretty(app)} first — sign in with the link (just once), then ask me again.`,
            links,
          };
        } catch (e) {
          seen = `Couldn't make a sign-in link: ${e.message}`;
        }
      } else if (step.run && typeof step.run === "object") {
        executed = true;
        const tool = String(step.run.tool || "");
        const args = step.run.arguments && typeof step.run.arguments === "object" ? step.run.arguments : {};
        try {
          const v = await router("execute", { tool_slug: tool, arguments: args });
          if (v.error) {
            seen = `${tool} failed: ${v.error}`;
          } else {
            readApp = String(tool).split("_")[0].toLowerCase();
            seen = `${tool} result: ${clip(JSON.stringify(v.data ?? v), 6000)}`;
          }
        } catch (e) {
          seen = `${tool} failed: ${e.message}`;
        }
      } else {
        seen = "That wasn't one of the four JSON shapes — reply with search, run, connect or reply.";
      }
      messages.push({ role: "user", content: `[tool output]\n${seen}` });
    }

    // Out of steps: say what it got to rather than nothing.
    messages.push({ role: "user", content: 'Out of steps — reply now with what you found or did, as {"reply": …}.' });
    const raw = await complete(messages);
    const step = parseStep(raw);
    const text = (step && typeof step.reply === "string" ? step.reply : String(raw || "")).trim().replace(/`/g, "");
    if (readApp) snapPut(readApp, text);
    return { text, links };
  }

  window.izukiApps = {
    configured,
    key,
    saveKey,
    testKey,
    connected,
    link,
    ask,
    // Exposed for the tests, not for the app.
    _test: { parseStep, askedApp, isReadQuestion, snapAnswer, snapPut, describeSearch, unconnected, pretty },
  };
})();
