// Izuki for Chrome / Edge — the page's eyes and hands for Izuki on this PC.
//
// Izuki (the desktop app) runs a tiny bridge on 127.0.0.1:47615. This
// worker asks it for work ("next"), does it in the tab you're looking at,
// and posts the result back. Nothing leaves your PC; nothing runs unless
// Izuki asks.

const BRIDGE = "http://127.0.0.1:47615/izuki";
const HEADERS = { "X-Izuki-Extension": "1", "Content-Type": "application/json" };
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
  const tab = await activeTab();
  switch (op) {
    case "snapshot":
      return { ...(await inPage(tab.id, snapshot)), url: tab.url, title: tab.title };
    case "click":
      if (!(await inPage(tab.id, clickEl, [args.id]))) throw new Error("that element is gone");
      return true;
    case "type":
      if (!(await inPage(tab.id, typeEl, [args.id, String(args.text || "")]))) throw new Error("that box is gone");
      return true;
    case "scroll":
      await inPage(tab.id, (dy) => window.scrollBy({ top: dy, behavior: "smooth" }), [Number(args.dy) || 600]);
      return true;
    case "open":
      await chrome.tabs.update(tab.id, { url: String(args.url) });
      return true;
    default:
      throw new Error(`unknown request: ${op}`);
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
  el.click();
  return true;
}

function typeEl(id, text) {
  const el = document.querySelector(`[data-izuki-id="${CSS.escape(id)}"]`);
  if (!el) return false;
  el.scrollIntoView({ block: "center" });
  el.focus();
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
