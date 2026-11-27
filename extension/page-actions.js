// Driving the tab the person is actually on: read its controls, click one, type
// into one. Izuki answers about the page it is already reading; when the answer
// carries [PAGE_CLICK: n] or [PAGE_TYPE: n | words], the panel does it here, in
// this tab, on the site the person is signed in to — not in a browser window of
// Izuki's own.
//
// The tag names carry PAGE_ on purpose: Izuki on the PC has its own [CLICK: n]
// and [TYPE: n | words] for its own browser window, and those must never be
// performed here by mistake (or the other way round).
//
// pageControls, clickControl and typeControl are injected with
// chrome.scripting.executeScript({ func }), so each one must stand alone: no
// imports, no module scope, nothing but the DOM. The tag parser and the prompt
// are pure so tools/panel-actions-check.mjs can pin them.

/** How many controls are ever numbered, and the most an answer may act on. */
export const MAX_ITEMS = 120;

/**
 * Words on a control that change the world instead of moving around the page:
 * sending, buying, deleting. A page (or a model reading one) must never get
 * these pressed by itself — the person can do it, or ask for exactly that.
 */
const RISKY = /\b(log ?out|sign ?out|delete|remove|unsubscribe|submit|send|post|publish|buy|pay|purchase|order|checkout|confirm|approve|reset|transfer|withdraw)\b/i;

/** Is pressing this control a commitment rather than a click? */
export function riskyControl(label) {
  return RISKY.test(String(label || ""));
}

/**
 * The actions an answer asks for, in the order it asked for them.
 *
 * [PAGE_CLICK: 3] presses item 3 and [PAGE_TYPE: 3 | hello ⏎] types into it (⏎
 * presses Enter). A TYPE with no words is not an action, a number that was
 * never numbered is not one either, and anything the page didn't offer is
 * dropped rather than guessed at.
 */
export function actionTags(text) {
  const out = [];
  const re = /\[PAGE_(CLICK|TYPE)\s*:\s*#?(\d+)(?:\s*\|\s*([^\]]*))?\]/gi;
  let found;
  while ((found = re.exec(String(text || "")))) {
    const n = Number(found[2]);
    if (!Number.isInteger(n) || n < 1 || n > MAX_ITEMS) continue;
    if (found[1].toUpperCase() === "CLICK") {
      out.push({ op: "click", n });
      continue;
    }
    const raw = String(found[3] || "").trim();
    if (!raw) continue;
    const submit = raw.endsWith("\u23ce");
    out.push({ op: "type", n, text: raw.replace(/\u23ce$/, "").trim(), submit });
  }
  return out;
}

/** The same answer without its action tags: what the person reads. */
export function stripActions(text) {
  return String(text || "")
    .replace(/\[PAGE_(?:CLICK|TYPE)\s*:\s*#?\d+(?:\s*\|[^\]]*)?\]/gi, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** What the model is told when a page can be used, with the numbered controls. */
export function actionPrompt(items) {
  const list = (Array.isArray(items) ? items : [])
    .slice(0, 60)
    .map((i) => `${i.n}. ${i.kind} \u201c${String(i.label || "").replace(/\s+/g, " ").slice(0, 80)}\u201d`)
    .join("\n");
  return `
[This page is open in the person's browser and you can use it. To act, reply with ONLY the tag, then you will get the page again:
[PAGE_CLICK: n] \u2014 press item n.
[PAGE_TYPE: n | words] \u2014 type into item n (end the words with \u23ce to press Enter).
Never type a password or a card number. Never send, post, buy or delete unless the person asked for exactly that, in this conversation.
${list}
]`;
}

// ---- injected into the tab --------------------------------------------------

/** Every visible thing on the page that can be pressed or typed into, numbered. */
export function pageControls() {
  const name = (el) =>
    String(el.innerText || el.value || el.getAttribute("aria-label") || el.getAttribute("title") || el.getAttribute("placeholder") || el.name || "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 80);
  const shown = (el) => {
    const style = getComputedStyle(el);
    if (style.display === "none" || style.visibility === "hidden" || style.opacity === "0") return false;
    const box = el.getBoundingClientRect();
    return box.width >= 8 && box.height >= 8;
  };
  const kind = (el, tag) => {
    if (tag === "A") return "link";
    if (tag === "SELECT") return "choice";
    if (tag === "TEXTAREA") return "field";
    if (tag === "INPUT") {
      const type = String(el.type || "text").toLowerCase();
      if (type === "checkbox" || type === "radio") return "check";
      return "field";
    }
    return "button";
  };
  // Last look's numbers are stale now: nothing may point at an old item.
  for (const old of document.querySelectorAll("[data-izuki-n]")) old.removeAttribute("data-izuki-n");
  const items = [];
  const all = document.querySelectorAll(
    'a[href], button, [role="button"], [role="link"], [role="tab"], [role="menuitem"], [role="checkbox"], [role="radio"], input, textarea, select, summary'
  );
  for (const el of all) {
    if (items.length >= 120) break;
    const tag = String(el.tagName || "").toUpperCase();
    if (el.disabled) continue;
    // A password is never read, never numbered, never typed into.
    if (tag === "INPUT" && /^(password|hidden|file|image)$/i.test(String(el.type || ""))) continue;
    if (!shown(el)) continue;
    const label = name(el);
    if (!label) continue;
    const n = items.length + 1;
    el.setAttribute("data-izuki-n", String(n));
    items.push({ n, label, kind: kind(el, tag) });
  }
  return { title: document.title || "", url: location.href, items };
}

/** Press item `n` from the last look. */
export function clickControl(n) {
  const el = document.querySelector('[data-izuki-n="' + Number(n) + '"]');
  if (!el) return { ok: false, why: "that item is no longer on the page" };
  const label = String(el.innerText || el.getAttribute("aria-label") || el.value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
  if (el.scrollIntoView) el.scrollIntoView({ block: "center" });
  el.click();
  return { ok: true, label };
}

/** Type into item `n` from the last look; `submit` presses Enter. */
export function typeControl(n, text, submit) {
  const el = document.querySelector('[data-izuki-n="' + Number(n) + '"]');
  if (!el) return { ok: false, why: "that item is no longer on the page" };
  const tag = String(el.tagName || "").toUpperCase();
  if (tag === "INPUT" && /password/i.test(String(el.type || ""))) return { ok: false, why: "never a password box" };
  const label = String(el.innerText || el.getAttribute("aria-label") || el.getAttribute("placeholder") || el.value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
  if (el.scrollIntoView) el.scrollIntoView({ block: "center" });
  if (el.focus) el.focus();
  if (tag === "INPUT" && /^(checkbox|radio)$/i.test(String(el.type || ""))) {
    el.click();
    return { ok: true, label };
  }
  if (tag === "SELECT") {
    el.value = String(text);
    el.dispatchEvent(new Event("input", { bubbles: true }));
    el.dispatchEvent(new Event("change", { bubbles: true }));
    return { ok: true, label };
  }
  if (tag === "INPUT" || tag === "TEXTAREA") {
    // The setter the page's own framework watches, so React sees the words.
    const proto = tag === "TEXTAREA" ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(proto, "value")?.set;
    if (setter) setter.call(el, String(text));
    else el.value = String(text);
  } else {
    el.textContent = String(text);
  }
  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
  if (submit) {
    const form = el.form;
    if (form && form.requestSubmit) form.requestSubmit();
    else el.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", keyCode: 13, which: 13, bubbles: true }));
  }
  return { ok: true, label };
}
