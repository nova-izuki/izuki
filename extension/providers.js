// Which AI the side panel hands a question to.
//
// Izuki on this PC is one option among many — not the only one. If someone
// already pays for ChatGPT, Gemini, Claude, Copilot, Perplexity, Grok,
// DeepSeek or Le Chat, that tab open beside the page they're reading is the
// best AI they have, and it's already signed in. The panel's job is to carry
// the page over to it, not to replace it.
//
// "Any AI tab I pick" is the catch-all, because this list will always be out
// of date: pick the tab and the panel types into whatever composer it finds.
// Nothing here knows a provider's API or key — it types into the page the
// person is already logged into, the way they would themselves.

import "./provider-specs.js";
import "./provider-dom.js";
export const PROVIDERS = globalThis.IzukiProviderSpecs;

export const provider = (id) => PROVIDERS.find((p) => p.id === id) || PROVIDERS[0];

/** Is this URL one of `p`'s own pages? */
export function hostedBy(p, url) {
  if (!p || !p.hosts || !p.hosts.length) return false;
  try {
    return p.hosts.includes(new URL(url).hostname);
  } catch {
    return false;
  }
}

/** The tabs that could serve as this provider's chat. "Any" offers them all. */
export async function providerTabs(p) {
  const all = await chrome.tabs.query({}).catch(() => []);
  const usable = all.filter((t) => t.id != null && /^https?:/.test(t.url || ""));
  if (p?.id === "any") return usable;
  return usable.filter((t) => hostedBy(p, t.url));
}

/**
 * Type `text` into whichever composer this page has, and send it if asked.
 *
 * Runs inside the chosen tab, so it is the person's own signed-in session
 * doing what they would do by hand. It reports what it found rather than
 * failing silently: a site that has changed its markup should say
 * "I couldn't find the box" instead of looking like the AI ignored you.
 *
 * Every event a real keystroke fires is fired here too — these editors are
 * React and Lexical, and a plain `value =` assignment is thrown away on the
 * next render, which is the classic way this breaks.
 */
export const typeIntoComposer = globalThis.IzukiProviderDOM.typeIntoComposer;

/** What to say when a handoff didn't land, in words that say what to do. */
export function handoffProblem(why, name, id) {
  if (why === "draft") return `Your ${name} tab already has a draft. Send or clear it there first; your words were left alone.`;
  if (why === "busy") return `${name} is still answering or its message box isn't ready. Wait, then try again.`;
  if (why === "changed-page") return "That tab moved to another site. Connect it again before sharing anything.";
  if (why === "ambiguous" || why === "ambiguous-send") return `I found several possible chat controls in ${name}. Open the tab and choose the right one yourself.`;
  if (why === "no-send") return `The question is drafted in ${name}, but I couldn't verify its Send button. Open that tab and press Send yourself. It hasn't been sent.`;
  if (why === "no-text") return `${name}'s message box wouldn't take the question — nothing was sent. Copy it and paste it there, or pick another assistant.`;
  if (why === "no-tab" && id === "any") {
    // "Any AI tab I pick" has no page of its own to open, so telling someone
    // to press Connect would be a false instruction (and reads as "No Any AI
    // tab I pick tab is open").
    return "Open the AI you want in a tab, then press Refresh tabs and pick it.";
  }
  if (why === "no-tab") return `No ${name} tab is open. Press Connect and the panel opens one.`;
  if (why === "no-composer") return `I found your ${name} tab but not its message box — ${name} may have changed its layout. Open the tab and ask there, or pick another assistant.`;
  if (why === "blocked") return `Chrome won't let an extension type into that page. Pick another assistant, or use Izuki on this PC.`;
  return `I couldn't hand that to ${name}.`;
}
