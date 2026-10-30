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
  follow: false,
  companion: false,
  autoSend: true,
};

const gate = new QuestionGate();
let watching = null;

// ---- remembering the choice ------------------------------------------------

async function load() {
  try {
    const saved = (await chrome.storage.local.get(KEY))?.[KEY];
    if (saved && typeof saved === "object") Object.assign(state, saved);
  } catch {}
  // Following the page is never restored as "on": it starts a conversation
  // with an outside AI by itself, so it is asked for each session.
  state.follow = false;
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
}

function say(text) {
  const help = $("connection-help");
  if (help) help.textContent = text;
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

async function connect() {
  const p = provider(state.providerId);
  const button = $("connect");
  if (button) button.disabled = true;
  try {
    if (p.local) {
      const up = await izukiIsUp();
      say(up ? "Connected to Izuki on this PC." : "Izuki isn't running — open the Izuki app, then press Connect.");
      return up;
    }
    let tabs = await providerTabs(p);
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
    say(`Connected to your ${p.name} tab. Questions you ask here go to it.`);
    return true;
  } finally {
    if (button) button.disabled = false;
  }
}

// ---- handing a question to an AI tab ---------------------------------------

/** Send `text` to the connected provider tab. Returns a plain problem or "". */
export async function handToProvider(text) {
  const p = provider(state.providerId);
  if (p.local) return "";
  if (state.tabId == null) {
    await fillTabs();
    if (state.tabId == null) return handoffProblem("no-tab", p.name, p.id);
  }
  const tab = await chrome.tabs.get(state.tabId).catch(() => null);
  // The tab we connected to may have been sent somewhere else since. Typing
  // into whatever is there now would hand the question — and the page it
  // came from — to a site nobody chose, and could submit its form.
  if (!tab || (p.id !== "any" && !hostedBy(p, tab.url))) {
    state.tabId = null;
    await fillTabs();
    return handoffProblem("no-tab", p.name, p.id);
  }
  let result;
  try {
    [result] = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: typeIntoComposer,
      args: [text, p.composer || [], p.send || [], state.autoSend],
      world: "MAIN",
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
function startFollowing(onQuestion) {
  stopFollowing();
  watching = setInterval(async () => {
    if (!state.follow) return;
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true }).catch(() => []);
    if (!tab?.id || !/^https?:/.test(tab.url || "")) return;
    // Never follow the AI's own tab: it would feed its answers back to it.
    if (state.tabId != null && tab.id === state.tabId) return;
    const found = await visibleQuestion(tab.id);
    if (!found?.text) return;
    const ready = gate.observe({ id: tab.id, url: found.url || tab.url }, found.text, Date.now());
    if (!ready) return;
    gate.accept(ready.key, Date.now());
    onQuestion(ready.text, { title: found.title || tab.title || "", url: found.url || tab.url });
  }, 1200);
}

function stopFollowing() {
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
  if ($("show-companion")) $("show-companion").checked = state.companion;

  $("provider")?.addEventListener("change", async (e) => {
    state.providerId = e.target.value;
    state.tabId = null;
    gate.reset();
    remember();
    await fillTabs();
    const now = provider(state.providerId);
    say(now.note || `Press Connect to use your ${now.name} tab.`);
  });

  $("provider-tabs")?.addEventListener("change", (e) => {
    state.tabId = e.target.value ? Number(e.target.value) : null;
    remember();
  });

  $("refresh-tabs")?.addEventListener("click", () => void fillTabs());
  $("connect")?.addEventListener("click", () => void connect());

  $("follow-questions")?.addEventListener("change", (e) => {
    state.follow = !!e.target.checked;
    gate.reset();
    if (state.follow) {
      startFollowing(onFollowed);
      followState("On. A new question on the page you're reading is sent once, on its own. It never picks or submits an answer for you.");
    } else {
      stopFollowing();
      followState("Off. Turn it on to have each new question on the page sent for you.");
    }
  });

  $("show-companion")?.addEventListener("change", (e) => {
    state.companion = !!e.target.checked;
    remember();
    // The desktop app owns the character; the panel only asks for it. This
    // is the same switch as "Only the glowing edges" in the app, so turning
    // it off here turns it off there.
    fetch("http://127.0.0.1:47615/izuki/companion", {
      method: "POST",
      headers: { "X-Izuki-Extension": "1", "Content-Type": "application/json" },
      body: JSON.stringify({ show: state.companion }),
    }).catch(() => {});
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
