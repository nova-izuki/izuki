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
    send: ['div[role="button"][aria-disabled="false"]', 'button[type="submit"]'],
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
export function typeIntoComposer(text, composerSelectors, sendSelectors, autoSend) {
  const visible = (el) => {
    if (!el) return false;
    const box = el.getBoundingClientRect();
    const style = getComputedStyle(el);
    return box.width > 1 && box.height > 1 && style.visibility !== "hidden" && style.display !== "none";
  };
  const box = composerSelectors.flatMap((s) => [...document.querySelectorAll(s)]).find(visible);
  if (!box) return { ok: false, why: "no-composer" };

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
  const button = sendSelectors.flatMap((s) => [...document.querySelectorAll(s)]).find(ready);
  if (button) {
    button.click();
    return { ok: true, sent: true };
  }
  // No button to be found: Enter is how every one of these sends.
  for (const type of ["keydown", "keypress", "keyup"]) {
    box.dispatchEvent(new KeyboardEvent(type, { key: "Enter", code: "Enter", keyCode: 13, which: 13, bubbles: true, cancelable: true }));
  }
  return { ok: true, sent: true, by: "enter" };
}

/** What to say when a handoff didn't land, in words that say what to do. */
export function handoffProblem(why, name, id) {
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
