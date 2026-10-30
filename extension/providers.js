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

/** A composer that works on nearly every chat site, tried in order. */
const COMMON_COMPOSER = [
  'div[contenteditable="true"][role="textbox"]',
  'textarea[placeholder]',
  'div[contenteditable="true"]',
  "textarea",
];

export const PROVIDERS = [
  {
    id: "izuki",
    name: "Izuki on this PC",
    local: true,
    note: "Answers here in the panel, using the AI you set up in the Izuki app.",
  },
  {
    id: "chatgpt",
    name: "ChatGPT",
    hosts: ["chatgpt.com", "chat.openai.com"],
    open: "https://chatgpt.com/",
    composer: ["#prompt-textarea", ...COMMON_COMPOSER],
    send: ['button[data-testid="send-button"]', 'button[aria-label*="Send" i]'],
  },
  {
    id: "gemini",
    name: "Gemini",
    hosts: ["gemini.google.com"],
    open: "https://gemini.google.com/app",
    composer: [".ql-editor", 'rich-textarea div[contenteditable="true"]', ...COMMON_COMPOSER],
    send: ["button.send-button", 'button[aria-label*="Send" i]'],
  },
  {
    id: "claude",
    name: "Claude",
    hosts: ["claude.ai"],
    open: "https://claude.ai/new",
    composer: ['div[contenteditable="true"].ProseMirror', ...COMMON_COMPOSER],
    send: ['button[aria-label*="Send" i]'],
  },
  {
    id: "copilot",
    name: "Copilot",
    hosts: ["copilot.microsoft.com", "m365.cloud.microsoft"],
    open: "https://copilot.microsoft.com/",
    composer: ["#userInput", 'textarea[id*="prompt" i]', ...COMMON_COMPOSER],
    send: ['button[title*="Submit" i]', 'button[aria-label*="Send" i]'],
  },
  {
    id: "perplexity",
    name: "Perplexity",
    hosts: ["www.perplexity.ai", "perplexity.ai"],
    open: "https://www.perplexity.ai/",
    composer: ['textarea[placeholder*="ask" i]', ...COMMON_COMPOSER],
    send: ['button[aria-label*="Submit" i]', 'button[aria-label*="Send" i]'],
  },
  {
    id: "grok",
    name: "Grok",
    hosts: ["grok.com", "x.com"],
    open: "https://grok.com/",
    composer: COMMON_COMPOSER,
    send: ['button[aria-label*="Submit" i]', 'button[type="submit"]'],
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    hosts: ["chat.deepseek.com"],
    open: "https://chat.deepseek.com/",
    composer: ["#chat-input", ...COMMON_COMPOSER],
    send: ['button[aria-label*="Send" i]', 'button[type="submit"]'],
  },
  {
    id: "mistral",
    name: "Le Chat (Mistral)",
    hosts: ["chat.mistral.ai"],
    open: "https://chat.mistral.ai/chat",
    composer: COMMON_COMPOSER,
    send: ['button[type="submit"]', 'button[aria-label*="Send" i]'],
  },
  {
    id: "any",
    name: "Any AI tab I pick",
    hosts: [],
    composer: COMMON_COMPOSER,
    send: ['button[type="submit"]', 'button[aria-label*="Send" i]', 'button[aria-label*="Submit" i]'],
    note: "Pick any tab with a chat box. The panel types the question into it.",
  },
];

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
export function typeIntoComposer(text, composerSelectors, sendSelectors, autoSend, expectedOrigin = "") {
  if (expectedOrigin && location.origin !== expectedOrigin) return { ok: false, why: "changed-page" };
  const visible = (el) => {
    if (!el) return false;
    const box = el.getBoundingClientRect();
    const style = getComputedStyle(el);
    return box.width > 1 && box.height > 1 && style.visibility !== "hidden" && style.display !== "none";
  };
  let box;
  for (const selector of composerSelectors) {
    const matches = [...new Set([...document.querySelectorAll(selector)].filter(visible))];
    if (matches.length > 1) return { ok: false, why: "ambiguous" };
    if (matches.length === 1) { box = matches[0]; break; }
  }
  if (!box) return { ok: false, why: "no-composer" };
  if (box.disabled || box.readOnly || box.getAttribute("aria-disabled") === "true" || box.getAttribute("type") === "password") return { ok: false, why: "busy" };
  if (String(box.value || box.textContent || "").trim()) return { ok: false, why: "draft" };
  if ([...document.querySelectorAll('button[data-testid="stop-button"],button[aria-label*="Stop generating" i],button[aria-label*="Stop response" i]')].some(visible)) return { ok: false, why: "busy" };

  box.focus();
  const native = box.tagName === "TEXTAREA" || box.tagName === "INPUT";
  if (native) {
    // React tracks the value on the element; set it through the prototype
    // setter so its own onChange fires instead of being skipped.
    const setter = Object.getOwnPropertyDescriptor(
      box.tagName === "TEXTAREA" ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype,
      "value"
    )?.set;
    if (setter) setter.call(box, text);
    else box.value = text;
  } else {
    // A contenteditable editor: paste, which Lexical and ProseMirror both
    // understand, and fall back to typing it in as plain text.
    const data = new DataTransfer();
    data.setData("text/plain", text);
    const pasted = box.dispatchEvent(new ClipboardEvent("paste", { clipboardData: data, bubbles: true, cancelable: true }));
    if (pasted && !box.textContent.trim()) {
      box.textContent = text;
    }
  }
  box.dispatchEvent(new InputEvent("input", { bubbles: true, data: text, inputType: "insertText" }));
  box.dispatchEvent(new Event("change", { bubbles: true }));

  if (!autoSend) return { ok: true, sent: false };
  const ready = (el) => visible(el) && !el.disabled && el.getAttribute("aria-disabled") !== "true";
  const form = box.closest?.("form");
  let button;
  for (const selector of sendSelectors) {
    // A generic Submit belongs to this composer, never an unrelated form.
    const scope = selector === 'button[type="submit"]' ? form : document;
    if (!scope) continue;
    const matches = [...new Set([...scope.querySelectorAll(selector)].filter(ready))];
    if (matches.length === 1) { button = matches[0]; break; }
    if (matches.length > 1) return { ok: false, why: "ambiguous-send" };
  }
  if (button) {
    button.click();
    return { ok: true, sent: true };
  }
  return { ok: false, why: "no-send" };
}

/** What to say when a handoff didn't land, in words that say what to do. */
export function handoffProblem(why, name, id) {
  if (why === "draft") return `Your ${name} tab already has a draft. Send or clear it there first; your words were left alone.`;
  if (why === "busy") return `${name} is still answering or its message box isn't ready. Wait, then try again.`;
  if (why === "changed-page") return "That tab moved to another site. Connect it again before sharing anything.";
  if (why === "ambiguous" || why === "ambiguous-send") return `I found several possible chat controls in ${name}. Open the tab and choose the right one yourself.`;
  if (why === "no-send") return `The question is drafted in ${name}, but I couldn't verify its Send button. Open that tab and press Send yourself. It hasn't been sent.`;
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
