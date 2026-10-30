// Small state helpers shared by the panel and its behavioral checks.
export const providerUrl = (url) => {
  try { return ['chatgpt.com', 'chat.openai.com', 'gemini.google.com'].includes(new URL(url).hostname); } catch { return false; }
};

export function cleanHistory(value) {
  if (!Array.isArray(value)) return [];
  return value.filter((m) => m && ['user', 'assistant'].includes(m.role) && typeof m.content === 'string' && m.content.trim())
    .slice(-20).map((m) => ({ role: m.role, content: m.content.slice(0, m.role === 'user' ? 6000 : 16000) }));
}

export class RequestGuard {
  current = null;
  begin(source) {
    this.cancel();
    return this.current = { id: crypto.randomUUID(), source: { ...source }, controller: new AbortController() };
  }
  active(request) { return this.current === request && !request.controller.signal.aborted; }
  cancel() { const previous = this.current; this.current = null; previous?.controller.abort(); return previous; }
  finish(request) { if (this.active(request)) this.current = null; }
}

/** One stable visible question, once per source page. No background re-send loop. */
export class QuestionGate {
  constructor() { this.reset(); }
  reset() { this.candidate = ''; this.since = 0; this.sent = new Set(); this.lastSent = -Infinity; }
  observe(source, text, now) {
    const normal = String(text || '').replace(/\s+/g, ' ').trim();
    if (normal.length < 16) { this.candidate = ''; return null; }
    const key = JSON.stringify([source.id, source.url, normal]);
    if (key !== this.candidate) { this.candidate = key; this.since = now; return null; }
    if (now - this.since < 1400 || now - this.lastSent < 8000 || this.sent.has(key)) return null;
    return { key, text: String(text).trim().slice(0, 9000) };
  }
  accept(key, now) {
    this.sent.add(key); this.lastSent = now;
    if (this.sent.size > 100) this.sent.delete(this.sent.values().next().value);
  }
}

/** Awaited polling: a slow capture or answer never starts overlapping requests. */
export class QuestionFollower {
  constructor({ capture, ask, changed, now = () => Date.now() }) {
    Object.assign(this, { capture, ask, changed, now });
    this.gate = new QuestionGate(); this.generation = 0; this.source = null; this.inFlight = false;
  }
  start(source) { this.stop(); this.source = { ...source }; this.gate.reset(); }
  stop(reason = '') { this.generation++; this.source = null; if (reason) this.changed(reason); }
  async tick() {
    if (!this.source || this.inFlight) return;
    const source = { ...this.source }, generation = this.generation;
    this.inFlight = true;
    try {
      const found = await this.capture(source.id);
      if (generation !== this.generation) return;
      if (!found || found.url !== source.url) { this.stop('Paused: the source page changed or can no longer be read. Enable Follow again on the page you want.'); return; }
      const ready = this.gate.observe(source, found.text, this.now());
      if (!ready) return;
      // ask returns null while the user has a manual request running. Keep this
      // question eligible until it can actually be accepted.
      const result = await this.ask(ready.text, source);
      if (generation !== this.generation || result === null) return;
      this.gate.accept(ready.key, this.now());
      if (!result) this.stop('Paused after a problem. Fix the connection, then enable Follow again.');
    } catch {
      if (generation === this.generation) this.stop('Paused: this page could not be read. Enable Follow again to retry.');
    } finally { this.inFlight = false; }
  }
}

/** Injected into the chosen source tab. Never reads form values or editable text. */
export function extractPage(mode = 'page') {
  const blocked = 'input,textarea,select,option,script,style,noscript,template,[contenteditable]:not([contenteditable="false"]),[hidden],[aria-hidden="true"],.timer,[role="timer"]';
  const visible = (node, viewport = false) => {
    if (!node || node.closest(blocked)) return false;
    const style = getComputedStyle(node), box = node.getBoundingClientRect();
    return style.display !== 'none' && style.visibility !== 'hidden' && box.width > 0 && box.height > 0 &&
      (!viewport || (box.bottom > 0 && box.top < innerHeight && box.right > 0 && box.left < innerWidth));
  };
  const words = (root, cap) => {
    const walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), out = [];
    let node, size = 0;
    while ((node = walk.nextNode()) && size < cap) {
      const text = node.textContent.trim();
      if (text && visible(node.parentElement)) { out.push(text); size += text.length + 1; }
    }
    return out.join('\n').slice(0, cap);
  };
  if (mode === 'question') {
    const selector = '.que,.display_question,.assessment-question,.question-wrapper,[data-testid="question"],[data-testid="question-container"],.question,fieldset,[role="radiogroup"],.question_text,[data-testid="question-text"]';
    const candidates = [...document.querySelectorAll(selector)].filter((node) => visible(node, true));
    // Prefer a surrounding question over its nested choices so the prompt and options stay together.
    const roots = candidates.filter((node) => !candidates.some((other) => other !== node && other.contains(node)));
    const root = roots.sort((a, b) => Math.abs(a.getBoundingClientRect().top) - Math.abs(b.getBoundingClientRect().top))[0];
    return { text: root ? words(root, 9000) : '', url: location.href, title: document.title };
  }
  const selection = getSelection();
  const safeSelection = selection && selection.rangeCount && visible(selection.anchorNode?.parentElement) && visible(selection.focusNode?.parentElement);
  return {
    text: document.body ? words(document.body, 14000) : '',
    selection: safeSelection ? String(selection).slice(0, 3000) : '',
    links: [...document.links].filter((a) => visible(a)).slice(0, 400).map((a) => ({ name: (a.innerText || a.title || a.getAttribute('aria-label') || '').trim().slice(0, 80), href: a.href })).filter((a) => a.name && /^https?:/.test(a.href)),
    url: location.href,
  };
}
