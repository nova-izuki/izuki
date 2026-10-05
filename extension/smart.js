// Izuki's smart features inside the browser — on their own, not just as
// Izuki's eyes for the orb:
//  • right-click: Explain / Translate / Sum up / Read aloud / Save to Nova
//    Notes / Remind me later on selected text; Sum up this link; Sum up or
//    save the whole page;
//  • Alt+Shift+I (or the toolbar popup): ask anything about this page;
//  • Focus guard: during Izuki's Focus mode, a gentle nudge on distracting
//    sites.
// Answers come from Izuki on this PC, with your own AI — the extension holds
// no keys. Read aloud uses the browser's own voice, so it works offline.

const BRIDGE_URL = "http://127.0.0.1:47615/izuki";
const JSON_HEADERS = { "X-Izuki-Extension": "1", "Content-Type": "application/json" };

async function izuki(path, body) {
  try {
    const r = await fetch(`${BRIDGE_URL}/${path}`, { method: "POST", headers: JSON_HEADERS, body: JSON.stringify(body || {}) });
    // An older Izuki on the PC doesn't know these yet.
    if (r.status === 404) return { ok: false, text: "Update Izuki on your PC (it updates itself — or restart it) to use this." };
    return await r.json();
  } catch {
    return { ok: false, text: "Izuki isn't running on this PC — open the Izuki app, then try again." };
  }
}

// ---- the right-click menu ---------------------------------------------------

const MENU = [
  { id: "izk-explain", title: "Explain this", contexts: ["selection"] },
  { id: "izk-translate", title: "Translate to English", contexts: ["selection"] },
  { id: "izk-summarise", title: "Sum it up", contexts: ["selection"] },
  { id: "izk-read", title: "Read it aloud", contexts: ["selection"] },
  { id: "izk-note", title: "Save to Nova Notes", contexts: ["selection"] },
  { id: "izk-later", title: "Remind me later", contexts: ["selection"] },
  { id: "izk-link", title: "Sum up this link", contexts: ["link"] },
  { id: "izk-page", title: "Sum up this page", contexts: ["page"] },
  { id: "izk-page-note", title: "Save this page to Nova Notes", contexts: ["page"] },
  { id: "izk-page-read", title: "Read this page aloud", contexts: ["page"] },
];

function buildMenu() {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({ id: "izk", title: "Izuki", contexts: ["selection", "link", "page"] });
    for (const m of MENU) chrome.contextMenus.create({ ...m, parentId: "izk" });
  });
}
chrome.runtime.onInstalled.addListener(buildMenu);
chrome.runtime.onStartup.addListener(buildMenu);

async function pageText(tabId) {
  try {
    const [r] = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => (document.body ? document.body.innerText : "").replace(/\n{3,}/g, "\n\n").slice(0, 14000),
    });
    return r ? r.result : "";
  } catch {
    return "";
  }
}

function speak(text) {
  chrome.tts.stop();
  chrome.tts.speak(String(text).slice(0, 30000), { rate: 1.0, enqueue: false });
}

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!tab || !tab.id) return;
  const sel = (info.selectionText || "").trim();
  const base = { title: tab.title || "", url: tab.url || "" };
  const show = (heading, body, opts) => bubble(tab.id, heading, body, opts);
  switch (info.menuItemId) {
    case "izk-explain":
    case "izk-translate":
    case "izk-summarise": {
      const task = { "izk-explain": "explain", "izk-translate": "translate", "izk-summarise": "summarise" }[info.menuItemId];
      const heading = { explain: "Explained", translate: "Translation", summarise: "In short" }[task];
      await show(heading, "…", { loading: true });
      const r = await izuki("ask", { ...base, task, text: sel });
      return show(heading, r.text, { ok: r.ok });
    }
    case "izk-read":
      speak(sel);
      return show("Reading aloud", "Reading it now. Click Stop to end.", { stopVoice: true });
    case "izk-note": {
      const r = await izuki("note", { ...base, text: sel, page: false });
      return show("Nova Notes", r.text, { ok: r.ok, brief: true });
    }
    case "izk-later": {
      const r = await izuki("later", { text: sel });
      return show("Later list", r.text, { ok: r.ok, brief: true });
    }
    case "izk-link": {
      await show("That link, in short", "…", { loading: true });
      const r = await izuki("ask", { ...base, task: "link", text: info.linkUrl || "" });
      return show("That link, in short", r.text, { ok: r.ok });
    }
    case "izk-page": {
      await show("This page, in short", "…", { loading: true });
      const r = await izuki("ask", { ...base, task: "summarise", text: await pageText(tab.id) });
      return show("This page, in short", r.text, { ok: r.ok });
    }
    case "izk-page-note": {
      await show("Nova Notes", "Making notes from this page…", { loading: true });
      const r = await izuki("note", { ...base, text: await pageText(tab.id), page: true });
      return show("Nova Notes", r.text, { ok: r.ok, brief: true });
    }
    case "izk-page-read":
      speak(await pageText(tab.id));
      return show("Reading aloud", "Reading this page now. Click Stop to end.", { stopVoice: true });
  }
});

// ---- the answer bubble, on the page --------------------------------------------

async function bubble(tabId, heading, body, opts = {}) {
  try {
    await chrome.scripting.executeScript({ target: { tabId }, func: drawBubble, args: [heading, String(body || ""), opts] });
  } catch {
    /* a browser page Izuki can't draw on */
  }
}

// Runs inside the page.
function drawBubble(heading, body, opts) {
  const ID = "izuki-bubble-host";
  let host = document.getElementById(ID);
  if (!host) {
    host = document.createElement("div");
    host.id = ID;
    host.style.cssText = "position:fixed;z-index:2147483647;top:16px;right:16px;";
    document.documentElement.appendChild(host);
    host.attachShadow({ mode: "open" });
  }
  const root = host.shadowRoot;
  root.innerHTML = `
    <style>
      .b{width:min(380px,90vw);max-height:60vh;overflow:auto;font:14px/1.5 "Segoe UI",system-ui,sans-serif;color:#f4f1fb;
         background:rgba(12,11,26,.96);border:1px solid rgba(167,139,250,.45);border-radius:16px;padding:14px 16px;
         box-shadow:0 18px 50px rgba(0,0,0,.45);backdrop-filter:blur(10px);animation:in .18s ease-out}
      @keyframes in{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}
      .h{display:flex;align-items:center;gap:8px;font-weight:700;font-size:13px;letter-spacing:.02em;color:#c4b5fd;margin-bottom:6px}
      .dot{width:9px;height:9px;border-radius:50%;background:linear-gradient(135deg,#7c5cff,#4ecdc4)}
      .x{margin-left:auto;background:none;border:0;color:#aaa6bf;font-size:18px;cursor:pointer;line-height:1}
      .t{white-space:pre-wrap}
      .bad{color:#fca5a5}
      .row{display:flex;gap:6px;margin-top:10px}
      .row button{font:inherit;font-size:12px;padding:4px 10px;border-radius:999px;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.06);color:#f4f1fb;cursor:pointer}
      .row button:hover{background:rgba(255,255,255,.14)}
      .spin{display:inline-block;width:12px;height:12px;border:2px solid #67e8f9;border-top-color:transparent;border-radius:50%;animation:s .8s linear infinite;vertical-align:-2px;margin-right:6px}
      @keyframes s{to{transform:rotate(360deg)}}
    </style>
    <div class="b" role="dialog" aria-label="Izuki">
      <div class="h"><span class="dot"></span><span class="hd"></span><button class="x" title="Close">×</button></div>
      <div class="t"></div>
      <div class="row"></div>
    </div>`;
  root.querySelector(".hd").textContent = heading;
  const t = root.querySelector(".t");
  if (opts.loading) t.innerHTML = '<span class="spin"></span>Thinking…';
  else t.textContent = body;
  if (opts.ok === false) t.classList.add("bad");
  root.querySelector(".x").onclick = () => host.remove();
  const row = root.querySelector(".row");
  const btn = (label, fn) => { const b = document.createElement("button"); b.textContent = label; b.onclick = fn; row.appendChild(b); };
  if (!opts.loading && !opts.brief && opts.ok !== false && !opts.stopVoice) {
    btn("Copy", () => navigator.clipboard.writeText(body));
    btn("Read aloud", () => chrome.runtime.sendMessage({ izukiSpeak: body }));
  }
  if (opts.stopVoice) btn("Stop", () => { chrome.runtime.sendMessage({ izukiStop: true }); host.remove(); });
  if (opts.brief) setTimeout(() => host.remove(), 4000);
}

chrome.runtime.onMessage.addListener((m) => {
  if (m && m.izukiSpeak) speak(m.izukiSpeak);
  if (m && m.izukiStop) chrome.tts.stop();
  if (m && m.izukiAsk) {
    // From the popup: a question about the page in front.
    (async () => {
      const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
      if (!tab || !tab.id) return;
      await bubble(tab.id, "About this page", "…", { loading: true });
      const r = await izuki("ask", { title: tab.title, url: tab.url, task: m.izukiAsk.task || "ask", question: m.izukiAsk.question || "", text: await pageText(tab.id) });
      await bubble(tab.id, m.izukiAsk.task === "summarise" ? "This page, in short" : "About this page", r.text, { ok: r.ok });
    })();
  }
});

// ---- Alt+Shift+I: ask about this page -------------------------------------------------

chrome.commands.onCommand.addListener(async (cmd) => {
  if (cmd !== "ask-page") return;
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  if (!tab || !tab.id) return;
  try {
    const [r] = await chrome.scripting.executeScript({ target: { tabId: tab.id }, func: () => prompt("Ask Izuki about this page:") });
    const question = r && r.result;
    if (!question) return;
    await bubble(tab.id, "About this page", "…", { loading: true });
    const a = await izuki("ask", { title: tab.title, url: tab.url, task: "ask", question, text: await pageText(tab.id) });
    await bubble(tab.id, "About this page", a.text, { ok: a.ok });
  } catch {
    /* a browser page */
  }
});

// ---- Focus guard ------------------------------------------------------------------------

const DISTRACTING = /(^|\.)(youtube\.com|tiktok\.com|instagram\.com|facebook\.com|twitter\.com|x\.com|reddit\.com|netflix\.com|twitch\.tv|snapchat\.com|pinterest\.com)$/;
const snoozedUntil = {};

chrome.tabs.onUpdated.addListener(async (tabId, change, tab) => {
  if (change.status !== "complete" || !tab.url) return;
  let host = "";
  try { host = new URL(tab.url).hostname; } catch { return; }
  if (!DISTRACTING.test(host) || (snoozedUntil[host] || 0) > Date.now()) return;
  const f = await izuki("focus", {});
  if (!f.ok || !f.left) return;
  const mins = Math.max(1, Math.ceil(f.left / 60));
  try {
    const [r] = await chrome.scripting.executeScript({ target: { tabId }, func: focusNudge, args: [mins] });
    if (r && r.result === "snooze") snoozedUntil[host] = Date.now() + 5 * 60000;
  } catch {
    /* ignore */
  }
});

// Runs inside the page: a calm full-page card. Resolves "back" or "snooze".
function focusNudge(mins) {
  return new Promise((resolve) => {
    const host = document.createElement("div");
    host.style.cssText = "position:fixed;inset:0;z-index:2147483647;";
    const root = host.attachShadow({ mode: "open" });
    root.innerHTML = `
      <style>
        .w{position:fixed;inset:0;display:grid;place-items:center;background:rgba(6,6,16,.86);backdrop-filter:blur(8px);font:16px/1.5 "Segoe UI",system-ui,sans-serif;color:#f4f1fb}
        .c{text-align:center;max-width:420px;padding:28px}
        .o{width:72px;height:72px;margin:0 auto 14px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#e0f7ff,#7c5cff 55%,#140f30)}
        h2{margin:0 0 6px;font-size:22px} p{margin:0 0 18px;color:#cfd3f5}
        button{font:inherit;padding:10px 18px;border-radius:999px;border:0;margin:4px;cursor:pointer}
        .a{background:linear-gradient(135deg,#7c5cff,#4ecdc4);color:#fff;font-weight:600}
        .s{background:rgba(255,255,255,.1);color:#f4f1fb}
      </style>
      <div class="w"><div class="c"><div class="o"></div>
        <h2>You're focusing 🎯</h2><p>${mins} minute${mins === 1 ? "" : "s"} left in your focus session. This can wait — you've got this.</p>
        <button class="a">Back to work</button><button class="s">Just 5 minutes</button></div></div>`;
    document.documentElement.appendChild(host);
    root.querySelector(".a").onclick = () => { host.remove(); resolve("back"); history.length > 1 ? history.back() : (location.href = "about:blank"); };
    root.querySelector(".s").onclick = () => { host.remove(); resolve("snooze"); };
  });
}
