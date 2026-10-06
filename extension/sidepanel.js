// Izuki's side panel: ask about the page you're on, like a friend reading
// along. It follows the tab in front, can take in other open tabs too, and
// keeps the conversation going. Answers come from Izuki on this PC.

const BRIDGE = "http://127.0.0.1:47615/izuki";
const H = { "X-Izuki-Extension": "1", "Content-Type": "application/json" };
const $ = (id) => document.getElementById(id);
const log = $("log");

/** The conversation: { role: "user" | "assistant", content } (kept for this browser session). */
let history = [];
let current = null; // the tab in front: { id, title, url, favIconUrl }
let extra = new Set(); // other tab ids the user shared
let busy = null; // AbortController while waiting

const store = {
  async get() {
    try { return (await chrome.storage.session.get("izkPanel")).izkPanel || null; } catch { return null; }
  },
  set(v) { try { chrome.storage.session.set({ izkPanel: v }); } catch {} },
};
const save = () => store.set({ history });

// ---- talking to Izuki on the PC ------------------------------------------------

async function ping() {
  const st = $("state");
  try {
    const r = await fetch(`${BRIDGE}/ping`, { headers: H });
    if (!r.ok) throw 0;
    st.className = "on";
    st.innerHTML = "<i></i>Connected";
    try {
      const f = await (await fetch(`${BRIDGE}/focus`, { method: "POST", headers: H, body: "{}" })).json();
      if (f.left) st.innerHTML += ` · 🎯 Focus ${Math.ceil(f.left / 60)} min`;
    } catch {}
    return true;
  } catch {
    st.className = "off";
    st.innerHTML = "<i></i>Izuki isn't running";
    return false;
  }
}

/** What's on a tab: its words (and what's selected), or null when the browser won't let anyone read it. */
async function readTab(tabId) {
  try {
    const [r] = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => ({
        text: (document.body ? document.body.innerText : "").replace(/\n{3,}/g, "\n\n").slice(0, 14000),
        selection: String(getSelection() || "").slice(0, 3000),
      }),
    });
    return r ? r.result : null;
  } catch {
    return null;
  }
}

// ---- the page in front --------------------------------------------------------------

async function follow() {
  const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
  if (!tab) return;
  const moved = current && current.id !== tab.id && history.length > 0;
  current = { id: tab.id, title: tab.title || tab.url || "This page", url: tab.url || "", favIconUrl: tab.favIconUrl || "" };
  $("ptitle").textContent = current.title;
  $("ptitle").title = current.url;
  const fav = $("fav");
  if (current.favIconUrl && /^https?:|^data:/.test(current.favIconUrl)) { fav.src = current.favIconUrl; fav.hidden = false; } else fav.hidden = true;
  extra.delete(tab.id);
  if (moved) divider(`Now on: ${current.title}`);
  drawTabs();
  if (!history.length) hello();
}

async function drawTabs() {
  const box = $("tabs");
  box.textContent = "";
  const tabs = (await chrome.tabs.query({ lastFocusedWindow: true })).filter((t) => current && t.id !== current.id && /^https?:/.test(t.url || ""));
  if (!tabs.length) return;
  for (const t of tabs.slice(0, 8)) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "chip" + (extra.has(t.id) ? " on" : "");
    b.textContent = (extra.has(t.id) ? "✓ " : "＋ ") + (t.title || t.url);
    b.title = extra.has(t.id) ? "Shared — click to stop sharing" : "Share this tab too (compare, combine)";
    b.onclick = () => { extra.has(t.id) ? extra.delete(t.id) : extra.size < 4 && extra.add(t.id); drawTabs(); };
    box.appendChild(b);
  }
}

// ---- the conversation ---------------------------------------------------------------

function esc(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
}

/** Light formatting for answers: paragraphs, - bullets, **bold**, `code`, links. */
function render(text) {
  const inline = (s) =>
    esc(s)
      .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\bhttps?:\/\/[^\s<)]+/g, (u) => `<a href="${u}" target="_blank" rel="noopener">${u}</a>`);
  const out = [];
  let list = null;
  for (const raw of String(text).split("\n")) {
    const line = raw.trim();
    const bullet = line.match(/^(?:[-*•]|\d+[.)])\s+(.*)/);
    if (bullet) {
      if (!list) { list = []; out.push(list); }
      list.push(`<li>${inline(bullet[1])}</li>`);
    } else {
      list = null;
      if (line) out.push(`<p>${inline(line.replace(/^#+\s*/, ""))}</p>`);
    }
  }
  return out.map((x) => (Array.isArray(x) ? `<ul>${x.join("")}</ul>` : x)).join("");
}

function bubble(role, content, bad = false) {
  log.querySelector(".hello")?.remove();
  const el = document.createElement("div");
  el.className = `msg ${role === "user" ? "me" : "it"}${bad ? " bad" : ""}`;
  if (role === "user") el.textContent = content;
  else {
    el.innerHTML = render(content);
    if (!bad) {
      const acts = document.createElement("div");
      acts.className = "acts";
      const act = (label, fn) => { const b = document.createElement("button"); b.className = "icon"; b.type = "button"; b.textContent = label; b.onclick = fn; acts.appendChild(b); };
      act("Copy", () => navigator.clipboard.writeText(content));
      act("Read aloud", () => chrome.runtime.sendMessage({ izukiSpeak: content }));
      act("Save to Notes", async () => {
        try {
          const n = await (await fetch(`${BRIDGE}/note`, { method: "POST", headers: H, body: JSON.stringify({ title: current?.title || "", url: current?.url || "", text: content, page: false }) })).json();
          divider(n.text);
        } catch { divider("Izuki isn't running on this PC."); }
      });
      el.appendChild(acts);
    }
  }
  log.appendChild(el);
  log.scrollTop = log.scrollHeight;
  return el;
}

function divider(text) {
  const d = document.createElement("div");
  d.className = "divider";
  d.textContent = text;
  log.appendChild(d);
  log.scrollTop = log.scrollHeight;
}

function hello() {
  if (log.querySelector(".hello")) return;
  log.textContent = "";
  const url = current?.url || "";
  const ideas = [
    ["📝 Sum up this page", "Sum up this page in a few short bullet points."],
    ["✅ What do I need to do here?", "What do I need to do on this page? Give me the steps."],
    ["💡 Explain it simply", "Explain this page simply, like I'm 12."],
    ["🔎 Key facts and numbers", "What are the key facts, dates and numbers on this page?"],
  ];
  if (/youtube\.com\/watch|youtu\.be\//.test(url)) ideas.unshift(["🎬 What's this video about?", "What's this video about? Use the title, description and anything shown on the page."]);
  if (/amazon\.|ebay\.|walmart\.|shop|store|product|cart/.test(url)) ideas.push(["🛒 Is this a good buy?", "Is this a good buy? Sum up the price, reviews and anything to watch out for."]);
  if (/mail\.google|outlook\.|mail\./.test(url)) ideas.push(["✉️ Draft a reply", "Draft a short, friendly reply to the email that's open."]);
  ideas.push(["🛡️ Is this site trustworthy?", "Does anything on this page look like a scam or something to be careful about?"]);
  const box = document.createElement("div");
  box.className = "hello";
  box.innerHTML = `<h1>Hi, I'm Izuki</h1><div>Ask me anything about this page.</div><div class="ideas"></div>`;
  for (const [label, q] of ideas.slice(0, 6)) {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = label;
    b.onclick = () => ask(q);
    box.querySelector(".ideas").appendChild(b);
  }
  log.appendChild(box);
}

async function ask(question) {
  question = String(question || "").trim();
  if (!question || busy || !current) return;
  bubble("user", question);
  const wait = document.createElement("div");
  wait.className = "msg it";
  wait.innerHTML = '<span class="dots"><span></span><span></span><span></span></span>';
  log.appendChild(wait);
  log.scrollTop = log.scrollHeight;
  busy = new AbortController();
  $("send").disabled = true;

  const share = $("share").checked;
  const page = share ? await readTab(current.id) : null;
  const tabs = [];
  for (const id of extra) {
    const t = await chrome.tabs.get(id).catch(() => null);
    const r = t && (await readTab(id));
    if (r) tabs.push({ title: t.title || t.url, url: t.url, text: r.text });
  }
  const body = {
    task: "chat",
    question,
    title: share ? current.title : "(the user chose not to share the page)",
    url: share ? current.url : "",
    text: page ? page.text : "",
    selection: page ? page.selection : "",
    tabs,
    history,
  };
  let answer, ok = false;
  try {
    const r = await fetch(`${BRIDGE}/ask`, { method: "POST", headers: H, body: JSON.stringify(body), signal: busy.signal });
    if (r.status === 404) answer = "Update Izuki on your PC (it updates itself — or restart it) to use this.";
    else { const j = await r.json(); answer = j.text; ok = !!j.ok; }
  } catch (e) {
    answer = e.name === "AbortError" ? "Stopped." : "Izuki isn't running on this PC — open the Izuki app, then ask again.";
    if (e.name !== "AbortError") ping();
  }
  wait.remove();
  if (share && !page && ok) divider("This page can't be read (a browser page or a PDF viewer) — I answered without it.");
  bubble("assistant", answer || "I couldn't come up with an answer.", !ok);
  if (ok) {
    history.push({ role: "user", content: question }, { role: "assistant", content: answer });
    history = history.slice(-20);
    save();
  }
  busy = null;
  $("send").disabled = false;
  $("q").focus();
}

// ---- wiring ---------------------------------------------------------------------------

const q = $("q");
$("ask").onsubmit = (e) => {
  e.preventDefault();
  const t = q.value;
  q.value = "";
  q.style.height = "";
  ask(t);
};
q.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); $("ask").requestSubmit(); }
  if (e.key === "Escape" && busy) busy.abort();
});
q.addEventListener("input", () => { q.style.height = ""; q.style.height = Math.min(q.scrollHeight, 140) + "px"; });
$("new").onclick = () => { if (busy) busy.abort(); history = []; save(); log.textContent = ""; hello(); };

chrome.tabs.onActivated.addListener(follow);
chrome.tabs.onUpdated.addListener((id, change) => { if (current && id === current.id && (change.title || change.status === "complete")) follow(); });
chrome.windows?.onFocusChanged?.addListener(() => follow());

// A question handed over from the right-click menu or Alt+Shift+I.
async function pending() {
  try {
    const { izkPending } = await chrome.storage.session.get("izkPending");
    if (!izkPending) return;
    await chrome.storage.session.remove("izkPending");
    if (izkPending.question) ask(izkPending.question);
    else q.focus();
  } catch {}
}
chrome.storage.onChanged.addListener((c, area) => { if (area === "session" && c.izkPending?.newValue) pending(); });

(async () => {
  const saved = await store.get();
  if (saved?.history?.length) {
    history = saved.history;
    for (const m of history) bubble(m.role, m.content);
  }
  await follow();
  ping();
  setInterval(ping, 15000);
  pending();
  q.focus();
})();
