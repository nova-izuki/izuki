// The panel's connection: which AI is answering, and how the page reaches it.
//
// Three things the owner asked for, in one place so the panel file stays
// Codex's:
//
//  1. Connect. Pick an AI, press Connect, and the panel either confirms Izuki
//     on this PC is up or finds/opens that provider's tab.
//  2. Follow the page. While it's on, a new question that appears on the tab
//     you're reading is carried over on its own, once. Off by default, and it
//     says so.
//  3. Hand a job to the PC. A task typed here is shown for review and only
//     runs when the person presses Run — an answer from an AI tab never turns
//     itself into a command.
//
// What it will not do, on a graded page: pick, type or submit the answer.
// It reads the question and shows you what the AI said, which is what Izuki
// has always done on a test — the page itself stays yours to click.

import { PROVIDERS, provider, providerTabs, typeIntoComposer, handoffProblem, hostedBy } from "./providers.js";
import { QuestionGate, extractPage } from "./sidepanel-state.js";

const $ = (id) => document.getElementById(id);
const KEY = "izkConnect";

const state = {
  providerId: "izuki",
  tabId: null,
  // The tab the person actually connected. Kept apart from `tabId` (which a
  // refresh may move) so a connection can never quietly follow it elsewhere.
  connectedTab: null,
  follow: false,
  companion: false,
  autoSend: true,
  autoConnect: true,
  ready: false,
  origin: "",
};

const gate = new QuestionGate();
let watching = null;
let watchGeneration = 0;

// ---- remembering the choice ------------------------------------------------

async function load() {
  try {
    const saved = (await chrome.storage.local.get(KEY))?.[KEY];
    if (saved && typeof saved === "object") Object.assign(state, saved);
  } catch {}
  // Following the page is never restored as "on": it starts a conversation
  // with an outside AI by itself, so it is asked for each session.
  state.follow = false;
  state.ready = false;
  state.origin = "";
  state.connectedTab = null;
}

const remember = () => {
  chrome.storage.local.set({ [KEY]: { ...state, follow: false } }).catch(() => {});
};

// ---- the controls ----------------------------------------------------------

function fillProviders() {
  const select = $("provider");
  if (!select) return;
  select.innerHTML = "";
  for (const p of PROVIDERS) {
    const option = document.createElement("option");
    option.value = p.id;
    option.textContent = p.name;
    select.appendChild(option);
  }
  select.value = state.providerId;
}

async function fillTabs() {
  const row = $("provider-tabs-row");
  const select = $("provider-tabs");
  const p = provider(state.providerId);
  if (!row || !select) return;
  if (p.local) {
    row.hidden = true;
    return;
  }
  const tabs = await providerTabs(p);
  row.hidden = false;
  select.innerHTML = "";
  if (!tabs.length) {
    const option = document.createElement("option");
    option.value = "";
    option.textContent = p.id === "any" ? "No pages open" : `No ${p.name} tab — Connect opens one`;
    select.appendChild(option);
    select.value = "";
    return;
  }
  for (const t of tabs) {
    const option = document.createElement("option");
    option.value = String(t.id);
    option.textContent = (t.title || t.url || "").slice(0, 70);
    select.appendChild(option);
  }
  // Keep the chosen tab if it's still there, else the first one.
  const keep = tabs.some((t) => t.id === state.tabId);
  select.value = String(keep ? state.tabId : tabs[0].id);
  state.tabId = Number(select.value);
  // A refresh must never move a live connection to a different tab. Two
  // ChatGPT tabs share an origin, so the origin check in the handoff can't
  // tell them apart: with the connected tab closed, the next question would
  // be typed into whichever tab happened to be first — a different
  // conversation, chosen by nobody. Ask again instead of guessing.
  if (state.ready && state.connectedTab != null && state.tabId !== state.connectedTab) {
    state.ready = false;
    state.origin = "";
    state.connectedTab = null;
    say("The tab you connected is gone or no longer first. Press Connect to choose which tab answers.");
  }
}

function say(text) {
  const help = $("connection-help");
  if (help) help.textContent = text;
  window.dispatchEvent(new Event("izuki:connected"));
}

function followState(text) {
  const el = $("follow-state");
  if (el) el.textContent = text;
}

// ---- connecting ------------------------------------------------------------

async function izukiIsUp() {
  try {
    const r = await fetch("http://127.0.0.1:47615/izuki/ping", {
      headers: { "X-Izuki-Extension": "1" },
      signal: AbortSignal.timeout(2500),
    });
    return r.ok;
  } catch {
    return false;
  }
}

/**
 * Connect to the AI tab that is already open. Nothing is typed into it here:
 * this only decides which tab an answer comes from, and says whose it is.
 */
async function connect({ automatic = false } = {}) {
  const p = provider(state.providerId);
  state.ready = false;
  const button = $("connect");
  if (button) button.disabled = true;
  try {
    if (p.local) {
      const up = await izukiIsUp();
      say(up ? "Connected to Izuki on this PC." : "Izuki isn't running — open the Izuki app, then press Connect.");
      return up;
    }
    const tabs = await providerTabs(p);
    if (automatic) {
      // Never opens a tab and never asks: only a tab that is already there.
      if (!tabs.length || p.id === "any") return false;
      const [active] = await chrome.tabs.query({ active: true, lastFocusedWindow: true }).catch(() => []);
      const chosen = tabs.find((t) => t.id === active?.id) ?? tabs[0];
      state.tabId = chosen.id;
      const select = $("provider-tabs");
      if (select) select.value = String(chosen.id);
    } else {
      if (!tabs.length && p.open) {
        // Beside the page being read, not on top of it.
        const made = await chrome.tabs.create({ url: p.open, active: false }).catch(() => null);
        if (made) {
          say(`Opened ${p.name} in a tab. Sign in there if it asks, then press Connect again.`);
          await fillTabs();
          return false;
        }
      }
      if (!tabs.length) {
        say(handoffProblem("no-tab", p.name, p.id));
        return false;
      }
      await fillTabs();
    }
    const selected = await chrome.tabs.get(state.tabId).catch(() => null);
    if (!selected || (p.id !== "any" && !hostedBy(p, selected.url))) return false;
    state.origin = new URL(selected.url).origin;
    state.connectedTab = state.tabId;
    state.ready = true;
    say(automatic
      ? `Connected by itself to “${(selected.title || p.name).slice(0, 70)}”. Pick another tab above, or untick “Use the AI tab that's already open”.`
      : `Connected to your ${p.name} tab. Questions you ask here go to it.`);
    return true;
  } finally {
    if (button) button.disabled = false;
  }
}

/** The quiet version: no tab is opened, and nothing is typed or sent. */
async function autoConnectNow() {
  if (!state.autoConnect || state.ready || provider(state.providerId).local) return false;
  return connect({ automatic: true }).catch(() => false);
}

/** A tab opening later is the usual case: the Gemini icon, a new ChatGPT tab. */
let autoSoon = null;
function scheduleAutoConnect() {
  if (!state.autoConnect || state.ready) return;
  clearTimeout(autoSoon);
  autoSoon = setTimeout(() => void autoConnectNow(), 700);
}

// ---- handing a question to an AI tab ---------------------------------------

/** Send `text` to the connected provider tab. Returns a plain problem or "". */
export async function handToProvider(text, connection = connected()) {
  const p = connection.provider;
  if (p.local) return "";
  if (!connection.ready || connection.tabId == null) return "Choose the AI tab and press Connect before sharing a question.";
  const tab = await chrome.tabs.get(connection.tabId).catch(() => null);
  // The tab we connected to may have been sent somewhere else since. Typing
  // into whatever is there now would hand the question — and the page it
  // came from — to a site nobody chose, and could submit its form.
  if (!tab || (p.id !== "any" && !hostedBy(p, tab.url))) {
    state.tabId = null;
    state.ready = false;
    state.origin = "";
    state.connectedTab = null;
    await fillTabs();
    return handoffProblem("no-tab", p.name, p.id);
  }
  if (new URL(tab.url).origin !== connection.origin) return handoffProblem("changed-page", p.name, p.id);
  let result;
  try {
    [result] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: typeIntoComposer,
      args: [text, p.composer || [], p.send || [], connection.autoSend, connection.origin],
    });
  } catch {
    return handoffProblem("blocked", p.name, p.id);
  }
  const out = result?.result;
  if (!out?.ok) return handoffProblem(out?.why || "", p.name, p.id);
  return "";
}

/** Which AI is answering, for the panel to show. */
export const connected = () => ({ ...state, provider: provider(state.providerId) });

// ---- following the page ----------------------------------------------------

/** The question visible on `tab` right now, or "" if the page has none. */
async function visibleQuestion(tabId) {
  try {
    const [out] = await chrome.scripting.executeScript({
      target: { tabId },
      func: extractPage,
      args: ["question"],
    });
    return out?.result || null;
  } catch {
    return null;
  }
}

/**
 * Watch the page being read and carry each new question over once.
 *
 * The gate (Codex's `QuestionGate`) is what makes this liveable: a question
 * has to be the same for a moment and hasn't been sent before, so a page that
 * redraws itself doesn't start a new conversation every second.
 */
async function startFollowing(onQuestion) {
  stopFollowing();
  const generation = watchGeneration;
  const [source] = await chrome.tabs.query({ active: true, currentWindow: true }).catch(() => []);
  if (!state.follow || generation !== watchGeneration) return;
  if (!source?.id || !/^https?:/.test(source.url || "") || source.id === state.tabId || PROVIDERS.some((p) => hostedBy(p, source.url))) {
    state.follow = false; $("follow-questions").checked = false;
    return followState("Open the page with questions before turning this on.");
  }
  let checking = false;
  watching = setInterval(async () => {
    if (!state.follow || generation !== watchGeneration || checking || document.hidden || !$("share").checked) return;
    checking = true;
    try {
      const tab = await chrome.tabs.get(source.id).catch(() => null);
      if (!tab?.id || tab.url !== source.url) {
        state.follow = false; $("follow-questions").checked = false; stopFollowing();
        return followState("Paused because the source page changed. Turn follow mode on again on the page you want.");
      }
      if (state.tabId != null && tab.id === state.tabId) return;
      const found = await visibleQuestion(tab.id);
      if (!state.follow || generation !== watchGeneration || !found?.text) return;
      const ready = gate.observe({ id: tab.id, url: found.url || tab.url }, found.text, Date.now());
      if (!ready) return;
      const accepted = await onQuestion(ready.text, { id:tab.id, title:found.title || tab.title || "", url:found.url || tab.url });
      if (accepted) gate.accept(ready.key, Date.now());
      else {
        state.follow = false; $("follow-questions").checked = false; stopFollowing();
        followState("Paused. Finish the current answer or check the connection, then turn follow mode on again.");
      }
    } catch {
      state.follow = false; $("follow-questions").checked = false; stopFollowing();
      followState("Paused because this page couldn't be read. Turn follow mode on again to retry.");
    } finally { checking = false; }
  }, 900);
}

function stopFollowing() {
  watchGeneration++;
  if (watching) clearInterval(watching);
  watching = null;
}

// ---- wiring it up ----------------------------------------------------------

/**
 * `ask` is the panel's own question path (Izuki on this PC). `onFollowed` is
 * called with a question the page offered by itself.
 */
export async function setUpConnection({ ask, onFollowed }) {
  await load();
  fillProviders();
  await fillTabs();
  const p = provider(state.providerId);
  say(p.note || `Questions go to your ${p.name} tab.`);
  const companion = $("show-companion");
  if (companion) {
    companion.disabled = true;
    fetch("http://127.0.0.1:47615/izuki/companion", { method:"POST", headers:{"X-Izuki-Extension":"1","Content-Type":"application/json"}, body:JSON.stringify({read:true}), signal:AbortSignal.timeout(3000) })
      .then((r) => r.json()).then((r) => { if (r.ok) { state.companion = !!r.show; companion.checked = state.companion; } })
      .catch(() => {}).finally(() => { companion.disabled = false; });
  }

  $("provider")?.addEventListener("change", async (e) => {
    state.providerId = e.target.value;
    state.ready = false;
    state.origin = "";
    state.connectedTab = null;
    state.follow = false; $("follow-questions").checked = false; stopFollowing();
    window.dispatchEvent(new Event("izuki:panel-cancel"));
    state.tabId = null;
    gate.reset();
    remember();
    await fillTabs();
    const now = provider(state.providerId);
    say(now.note || `Press Connect to use your ${now.name} tab.`);
    if (state.autoConnect) void autoConnectNow();
  });

  $("provider-tabs")?.addEventListener("change", (e) => {
    state.tabId = e.target.value ? Number(e.target.value) : null;
    state.ready = false;
    remember();
  });

  $("refresh-tabs")?.addEventListener("click", () => void fillTabs());
  $("connect")?.addEventListener("click", () => void connect());

  const auto = $("auto-connect");
  if (auto) {
    auto.checked = state.autoConnect;
    auto.addEventListener("change", (e) => {
      state.autoConnect = !!e.target.checked;
      remember();
      if (state.autoConnect) void autoConnectNow();
    });
  }
  // The AI tab is usually already open when the panel appears. Connecting to
  // it sends nothing and types nothing — it only says which tab answers.
  if (state.autoConnect) await autoConnectNow();
  // ...and it is often opened *after* the panel: the Gemini icon, a new tab.
  chrome.tabs.onUpdated.addListener((_id, change) => {
    if (change.status === "complete" || change.url) scheduleAutoConnect();
  });

  $("follow-questions")?.addEventListener("change", (e) => {
    state.follow = !!e.target.checked;
    gate.reset();
    if (state.follow) {
      void startFollowing(onFollowed);
      followState("On. A new question on the page you're reading is sent once, on its own. It never picks or submits an answer for you.");
    } else {
      stopFollowing();
      followState("Off. Turn it on to have each new question on the page sent for you.");
    }
  });

  $("show-companion")?.addEventListener("change", async (e) => {
    const toggle = e.target;
    const wanted = !!toggle.checked;
    toggle.disabled = true;
    // The desktop app owns the character; the panel only asks for it. This
    // is the same switch as "Only the glowing edges" in the app, so turning
    // it off here turns it off there.
    try {
    const response = await fetch("http://127.0.0.1:47615/izuki/companion", {
      method: "POST",
      headers: { "X-Izuki-Extension": "1", "Content-Type": "application/json" },
      body: JSON.stringify({ show: wanted }),
      signal: AbortSignal.timeout(3000),
    });
    const result = await response.json();
    if (!result.ok) throw Error(result.text || "Izuki couldn't change the companion setting.");
    state.companion = !!result.show; toggle.checked = state.companion; remember();
    } catch { toggle.checked = state.companion; say("Open Izuki on this PC before changing the desktop companion."); }
    finally { toggle.disabled = false; }
  });

  // A tab that closes shouldn't leave the panel pointing at nothing.
  chrome.tabs.onRemoved.addListener((id) => {
    if (id === state.tabId) {
      state.tabId = null;
      void fillTabs();
    }
  });

  return { ask, handToProvider, connected };
}
