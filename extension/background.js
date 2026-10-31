// Izuki for Chrome / Edge — the page's eyes and hands for Izuki on this PC.
//
// Izuki (the desktop app) runs a tiny bridge on 127.0.0.1:47615. This
// worker asks it for work ("next"), does it in the tab you're looking at,
// and posts the result back. Nothing leaves your PC; nothing runs unless
// Izuki asks.

// The smart features (right-click menu, answer bubble, focus guard).
importScripts("smart.js");
importScripts("workspace-state.js", "provider-specs.js", "provider-dom.js", "provider-relay.js", "question-page.js", "question-runner.js", "lab-state.js", "workspace-worker.js");

const BRIDGE = "http://127.0.0.1:47615/izuki";
// The version tells Izuki when this copy is too old for what it asks of it.
const HEADERS = { "X-Izuki-Extension": "1", "X-Izuki-Extension-Version": chrome.runtime.getManifest().version, "Content-Type": "application/json" };
let running = false;

async function loop() {
  if (running) return;
  running = true;
  try {
    for (;;) {
      let job;
      try {
        const r = await fetch(`${BRIDGE}/next`, { headers: HEADERS });
        job = await r.json();
      } catch {
        // Izuki isn't running: try again later (the alarm restarts us).
        return;
      }
      if (!job || !job.id || job.op === "none") continue;
      let result;
      try {
        result = { id: job.id, ok: true, data: await run(job.op, job.args || {}) };
      } catch (e) {
        result = { id: job.id, ok: false, error: String(e && e.message ? e.message : e) };
      }
      try {
        await fetch(`${BRIDGE}/result`, { method: "POST", headers: HEADERS, body: JSON.stringify(result) });
      } catch {
        return;
      }
    }
  } finally {
    running = false;
  }
}

/** The tab a request is for: Izuki's pinned tab (where its task runs, even
 *  while you're on another tab), else the one in front. */
async function targetTab(args) {
  if (args && args.tab) {
    let t = null;
    try {
      t = await chrome.tabs.get(Number(args.tab));
    } catch {
      /* closed */
    }
    if (!t) throw new Error("Izuki's tab was closed");
    if (!/^https?:|^file:/.test(t.url || "")) throw new Error("this page can't be read (a browser page)");
    return t;
  }
  return activeTab();
}

async function activeTab() {
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  if (!tab || !tab.id) throw new Error("no browser tab in front");
  if (!/^https?:|^file:/.test(tab.url || "")) throw new Error("this page can't be read (a browser page)");
  return tab;
}

async function inPage(tabId, func, args = []) {
  const [res] = await chrome.scripting.executeScript({ target: { tabId }, func, args });
  return res ? res.result : null;
}

async function run(op, args) {
  // Blackboard's API needs no tab (and must work with none in front).
  if (op === "bbfetch") return await bbFetch(String(args.url || ""));
  // Where your school's site is: the addresses and titles of open tabs that
  // look like a learning site (nothing else is read from them).
  if (op === "lmstabs") {
    const tabs = await chrome.tabs.query({});
    return tabs
      .filter((t) => /^https:/.test(t.url || "") && (/blackboard|instructure|canvas|moodle|brightspace|d2l/i.test(t.url || "") || /Blackboard/.test(t.title || "")))
      .map((t) => ({ url: t.url, title: t.title || "" }));
  }
  // Pin the tab in front for a task; and is a pinned tab what you're looking at?
  if (op === "pin") {
    const t = await activeTab();
    return { tab: t.id, url: t.url, title: t.title || "" };
  }
  if (op === "tabinfo") {
    let t = null;
    try {
      t = await chrome.tabs.get(Number(args.tab));
    } catch {
      return { open: false, visible: false };
    }
    const w = await chrome.windows.get(t.windowId);
    return { open: true, tab: t.id, windowId: t.windowId, focused: !!w.focused, visible: !!t.active && w.state !== "minimized", url: t.url, title: t.title || "" };
  }
  const tab = await targetTab(args);
  switch (op) {
    case "snapshot":
      return { ...(await inPage(tab.id, snapshot)), url: tab.url, title: tab.title };
    case "click": {
      const clicked = await inPage(tab.id, clickEl, [args.id]);
      if (!clicked) throw new Error("that element is gone");
      // A click still to come tells the app how long to wait before looking.
      return clicked === true ? true : { deferred: clicked.deferred };
    }
    case "type":
      if (!(await inPage(tab.id, typeEl, [args.id, String(args.text || "")]))) throw new Error("that box is gone");
      return true;
    case "scroll":
      await inPage(tab.id, (dy) => window.scrollBy({ top: dy, behavior: "smooth" }), [Number(args.dy) || 600]);
      return true;
    case "open":
      await chrome.tabs.update(tab.id, { url: String(args.url) });
      return true;
    case "readlinks":
      // Look-ahead: pages linked from this one, read quietly with your own
      // sign-ins so the answer can come from behind the link.
      return await Promise.all((args.urls || []).slice(0, 4).map((u) => readLinked(String(u))));
    default:
      throw new Error(`unknown request: ${op}`);
  }
}

/**
 * Blackboard's own API, read with your Blackboard sign-in (Izuki never sees a
 * password). Only GET, only Blackboard's /learn/api/ paths: nothing else can
 * be fetched this way, and nothing can be changed.
 */
async function bbFetch(url) {
  let u;
  try {
    u = new URL(url);
  } catch {
    throw new Error("not a web address");
  }
  if (u.protocol !== "https:" || !u.pathname.startsWith("/learn/api/")) throw new Error("only Blackboard's read-only API can be fetched");
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 15000);
  try {
    const r = await fetch(u.href, { credentials: "include", signal: ctrl.signal, headers: { Accept: "application/json" } });
    const text = (await r.text()).slice(0, 2000000);
    let json = null;
    try {
      json = JSON.parse(text);
    } catch {
      /* not JSON: a sign-in page */
    }
    return { status: json === null && r.ok ? 401 : r.status, json };
  } finally {
    clearTimeout(timer);
  }
}

/** A linked page's words (no scripts or menus), read in the background. */
async function readLinked(url) {
  try {
    if (!/^https?:/i.test(url)) return { url, text: "" };
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 5000);
    const r = await fetch(url, { credentials: "include", signal: ctrl.signal, redirect: "follow" });
    clearTimeout(timer);
    const type = r.headers.get("content-type") || "";
    if (!r.ok || !/text\/html|text\/plain|application\/xhtml/.test(type)) return { url, text: "" };
    const html = (await r.text()).slice(0, 600000);
    const title = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1] || "";
    const text = html
      .replace(/<(script|style|noscript|svg|nav|header|footer|template)[\s\S]*?<\/\1>/gi, " ")
      .replace(/<br\s*\/?>|<\/(p|div|li|h[1-6]|tr)>/gi, "\n")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'")
      .replace(/[ \t]+/g, " ")
      .replace(/\n\s*\n+/g, "\n")
      .trim();
    return { url, title: title.trim(), text: text.slice(0, 3000) };
  } catch {
    return { url, text: "" };
  }
}

// ---- these run inside the page ---------------------------------------------

function snapshot() {
  const SEL = 'a[href],button,input:not([type=hidden]),select,textarea,summary,[role=button],[role=link],[role=tab],[role=menuitem],[role=checkbox],[role=radio],[role=option],[role=switch],[contenteditable="true"],[onclick]';
  const kindOf = (el) => {
    const tag = el.tagName.toLowerCase();
    const role = (el.getAttribute("role") || "").toLowerCase();
    const type = (el.getAttribute("type") || "").toLowerCase();
    if (type === "checkbox" || role === "checkbox" || role === "switch") return "CheckBox";
    if (type === "radio" || role === "radio") return "RadioButton";
    if (tag === "select") return "ComboBox";
    if (tag === "textarea" || el.isContentEditable || (tag === "input" && !["button", "submit", "reset", "image"].includes(type))) return "Edit";
    if (role === "tab") return "TabItem";
    if (role === "menuitem" || role === "option") return "MenuItem";
    if (tag === "a" || role === "link") return "Hyperlink";
    return "Button";
  };
  const nameOf = (el) => {
    const label = el.getAttribute("aria-label") || (el.labels && el.labels[0] && el.labels[0].innerText) || "";
    const text = (el.innerText || el.value || el.getAttribute("placeholder") || el.getAttribute("title") || "").trim();
    const img = el.querySelector && el.querySelector("img[alt]");
    return (label || text || (img && img.alt) || "").replace(/\s+/g, " ").trim().slice(0, 100);
  };
  const out = [];
  let n = Number(document.documentElement.getAttribute("data-izuki-next") || 1);
  for (const el of document.querySelectorAll(SEL)) {
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2 || r.bottom < 0 || r.right < 0 || r.top > innerHeight || r.left > innerWidth) continue;
    const st = getComputedStyle(el);
    if (st.visibility === "hidden" || st.display === "none" || Number(st.opacity) === 0) continue;
    let id = el.getAttribute("data-izuki-id");
    if (!id) {
      id = `i${n++}`;
      el.setAttribute("data-izuki-id", id);
    }
    const href = el.tagName === "A" ? el.href : null;
    out.push({ id, kind: kindOf(el), name: nameOf(el), href, rect: { x: r.left, y: r.top, w: r.width, h: r.height } });
    if (out.length >= 150) break;
  }
  document.documentElement.setAttribute("data-izuki-next", String(n));
  return {
    text: (document.body ? document.body.innerText : "").replace(/\n{3,}/g, "\n\n").slice(0, 6000),
    elements: out,
    metrics: { dpr: devicePixelRatio, screenX, screenY, outerWidth, innerWidth, outerHeight, innerHeight },
  };
}

function clickEl(id) {
  const el = document.querySelector(`[data-izuki-id="${CSS.escape(id)}"]`);
  if (!el) return false;
  el.scrollIntoView({ block: "center", inline: "center" });
  if (el.focus) el.focus({ preventScroll: true });
  // The answer card must not sit over the control being pressed.
  try { globalThis.__izukiBubbleDodge?.(el.getBoundingClientRect()); } catch {}
  if (!el.isConnected) return false;
  // A click that leaves the page (a link, a submit) tears down this script
  // before its reply can travel back, and Izuki then waited out its whole
  // timeout to say "unconfirmed" about a click that had worked. So those are
  // reported a moment *before* they happen — with how long until they do,
  // so the app waits that long before it looks again. Without that, a look
  // inside the gap saw nothing changed and could click a second time.
  // Everything else is clicked first and reported after: no gap at all.
  const leaves = !!el.closest('a[href]:not([href^="#"]):not([href^="javascript:"]), button[type="submit"], input[type="submit"], input[type="image"]')
    || (el.tagName === "BUTTON" && !el.getAttribute("type") && !!el.form);
  if (!leaves) {
    el.click();
    return true;
  }
  const deferred = 90;
  return new Promise((done) => {
    done({ deferred });
    setTimeout(() => {
      // Re-checked at the last moment: a page that redrew in the gap is not
      // clicked blindly. The next look sees whatever it became.
      if (el.isConnected) el.click();
    }, deferred);
  });
}
function typeEl(id, text) {
  const el = document.querySelector(`[data-izuki-id="${CSS.escape(id)}"]`);
  if (!el) return false;
  el.scrollIntoView({ block: "center" });
  el.focus();
  try { globalThis.__izukiBubbleDodge?.(el.getBoundingClientRect()); } catch {}
  if (el.isContentEditable) {
    document.execCommand("selectAll", false);
    document.execCommand("insertText", false, text);
    return true;
  }
  // Frameworks (React, Vue…) watch the native setter and input events.
  const proto = el.tagName === "TEXTAREA" ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(proto, "value");
  if (setter && setter.set) setter.set.call(el, text);
  else el.value = text;
  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
  return true;
}

// ---- stay connected --------------------------------------------------------
chrome.runtime.onStartup.addListener(loop);
chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create("izuki", { periodInMinutes: 0.5 });
  loop();
});
chrome.alarms.onAlarm.addListener(loop);
loop();
