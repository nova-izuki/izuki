// The side panel's connection: which AI gets the question, and what happens
// when the answer has to be typed into somebody else's website.
//
// What this proves: the provider table is complete and consistent, a URL is
// matched to the right assistant, and `typeIntoComposer` picks the right box,
// sets it the way React insists on, fires the events a real keystroke fires,
// and reports a plain reason when a site has no box it recognises.
//
// What this does NOT prove: that ChatGPT's or Gemini's real pages still use
// the selectors in the table. Those change without notice, which is why
// "Any AI tab I pick" exists and why a miss says "I found your tab but not
// its message box" instead of looking like the AI ignored you. Checking the
// live sites needs the real-browser harness and a signed-in session.
import assert from 'node:assert/strict';
import { PROVIDERS, provider, hostedBy, typeIntoComposer, handoffProblem } from '../extension/providers.js';

// ---- the table -------------------------------------------------------------

assert(PROVIDERS.length >= 8, 'the point is that it works with any AI, not three');
assert.equal(PROVIDERS[0].id, 'izuki', 'Izuki on this PC is the default');
assert(PROVIDERS.some((p) => p.id === 'any'), 'there has to be a catch-all: this list will always be out of date');

const ids = PROVIDERS.map((p) => p.id);
assert.equal(new Set(ids).size, ids.length, 'duplicate provider id');
for (const p of PROVIDERS) {
  assert(p.name && p.name.length < 40, `${p.id}: needs a short name`);
  if (p.local) continue;
  assert(Array.isArray(p.composer) && p.composer.length, `${p.id}: no composer selectors`);
  assert(Array.isArray(p.send) && p.send.length, `${p.id}: no send selectors`);
  // Every website provider except the catch-all must be openable and findable.
  if (p.id !== 'any') {
    assert(p.hosts?.length, `${p.id}: no hosts, so its tab can never be found`);
    assert(/^https:\/\//.test(p.open || ''), `${p.id}: needs an https page to open`);
    assert(p.hosts.some((h) => p.open.includes(h)), `${p.id}: the page it opens isn't one of its own hosts`);
  }
}

// An unknown id falls back to Izuki rather than throwing.
assert.equal(provider('nope').id, 'izuki');
assert.equal(provider(undefined).id, 'izuki');

// ---- matching a tab to an assistant ---------------------------------------

assert(hostedBy(provider('chatgpt'), 'https://chatgpt.com/c/abc'));
assert(hostedBy(provider('chatgpt'), 'https://chat.openai.com/'));
assert(hostedBy(provider('gemini'), 'https://gemini.google.com/app'));
assert(hostedBy(provider('claude'), 'https://claude.ai/new'));
// Not a near-miss hostname, and not a page that merely mentions it.
assert(!hostedBy(provider('chatgpt'), 'https://notchatgpt.com/'));
assert(!hostedBy(provider('chatgpt'), 'https://example.com/?q=chatgpt.com'));
assert(!hostedBy(provider('gemini'), 'https://google.com/'));
// Rubbish in doesn't throw.
assert(!hostedBy(provider('chatgpt'), 'not a url'));
assert(!hostedBy(provider('izuki'), 'https://chatgpt.com/'), 'Izuki on this PC has no website');
assert(!hostedBy(provider('any'), 'https://anything.com/'), '"any" is chosen by tab, not by host');

// ---- typing into somebody else's chat box ---------------------------------

/** Enough of a DOM for the one function that touches a page. */
function fakePage({ kind = 'textarea', sendButton = true, disabled = false } = {}) {
  const events = [];
  const clicks = [];
  const make = (tag, props = {}) => ({
    tagName: tag,
    value: '',
    textContent: '',
    disabled: false,
    attrs: {},
    getAttribute(name) { return this.attrs[name] ?? null; },
    getBoundingClientRect: () => ({ width: 300, height: 40, top: 10, bottom: 50, left: 0, right: 300 }),
    focus() { this.focused = true; },
    click() { clicks.push(this); },
    dispatchEvent(e) { events.push({ on: this, type: e.type, data: e.data }); return true; },
    ...props,
  });
  const box = kind === 'textarea' ? make('TEXTAREA') : make('DIV', { contentEditable: 'true' });
  const button = sendButton ? make('BUTTON', { disabled, attrs: disabled ? { 'aria-disabled': 'true' } : {} }) : null;
  const bySelector = new Map();
  if (kind === 'textarea') bySelector.set('textarea', [box]);
  else bySelector.set('div[contenteditable="true"]', [box]);
  if (button) bySelector.set('button[type="submit"]', [button]);
  return {
    box,
    button,
    events,
    clicks,
    install() {
      globalThis.document = { querySelectorAll: (s) => bySelector.get(s) || [] };
      box.closest = () => globalThis.document;
      globalThis.getComputedStyle = () => ({ visibility: 'visible', display: 'block' });
      globalThis.HTMLTextAreaElement = { prototype: {} };
      globalThis.HTMLInputElement = { prototype: {} };
      globalThis.InputEvent = class { constructor(type, init = {}) { this.type = type; this.data = init.data; } };
      globalThis.Event = class { constructor(type) { this.type = type; } };
      globalThis.KeyboardEvent = class { constructor(type, init = {}) { this.type = type; this.key = init.key; } };
      globalThis.ClipboardEvent = class { constructor(type, init = {}) { this.type = type; this.clipboardData = init.clipboardData; } };
      globalThis.DataTransfer = class { constructor() { this.data = {}; } setData(k, v) { this.data[k] = v; } getData(k) { return this.data[k]; } };
    },
  };
}

// A plain textarea: filled, told about it, and sent with its own button.
let page = fakePage();
page.install();
let out = typeIntoComposer('what is a subnet mask?', ['textarea'], ['button[type="submit"]'], true);
assert.deepEqual(out, { ok: true, sent: true });
assert.equal(page.box.value, 'what is a subnet mask?');
assert(page.box.focused, 'the box has to take the keyboard first');
assert.deepEqual(page.events.map((e) => e.type), ['input', 'change'], 'React ignores a value set without these');
assert.equal(page.clicks.length, 1, 'its own send button is pressed');

// Asked not to send: typed, left for the person to read and press Enter.
page = fakePage();
page.install();
out = typeIntoComposer('hello', ['textarea'], ['button[type="submit"]'], false);
assert.deepEqual(out, { ok: true, sent: false });
assert.equal(page.box.value, 'hello');
assert.equal(page.clicks.length, 0);

// A contenteditable editor (Gemini, Claude): pasted, which is what Lexical
// and ProseMirror understand.
page = fakePage({ kind: 'contenteditable' });
page.install();
out = typeIntoComposer('explain this', ['div[contenteditable="true"]'], ['button[type="submit"]'], true);
assert.equal(out.ok, true);
assert(page.events.some((e) => e.type === 'paste'), 'a contenteditable editor is pasted into');
assert.equal(page.box.textContent, 'explain this', 'and falls back to the text when the paste is ignored');

// Missing and disabled Send controls leave a draft, never claim delivery.
page = fakePage({ sendButton: false });
page.install();
out = typeIntoComposer('go', ['textarea'], ['button[type="submit"]'], true);
assert.deepEqual(out, { ok: false, why: 'no-send' });
assert.equal(page.events.filter((e) => e.type.startsWith('key')).length, 0);
assert.equal(page.box.value, 'go');

// A disabled send button is not a send button.
page = fakePage({ disabled: true });
page.install();
out = typeIntoComposer('go', ['textarea'], ['button[type="submit"]'], true);
assert.deepEqual(out, { ok: false, why: 'no-send' });
assert.equal(page.clicks.length, 0);

page = fakePage(); page.install(); page.box.value = 'my unfinished message';
out = typeIntoComposer('a new question', ['textarea'], ['button[type="submit"]'], true);
assert.deepEqual(out, { ok: false, why: 'draft' });
assert.equal(page.box.value, 'my unfinished message');
assert.equal(page.clicks.length, 0);
page = fakePage(); page.install(); page.box.disabled = true;
assert.deepEqual(typeIntoComposer('question', ['textarea'], ['button[type="submit"]'], true), { ok:false, why:'busy' });

// The site changed its markup: say so, rather than looking ignored.
page = fakePage();
page.install();
out = typeIntoComposer('hi', ['#nothing-like-this'], [], true);
assert.deepEqual(out, { ok: false, why: 'no-composer' });

// The first matching selector wins, so a provider's own box beats the generic one.
page = fakePage();
page.install();
out = typeIntoComposer('hi', ['#nope', 'textarea'], ['button[type="submit"]'], false);
assert.equal(out.ok, true);

// ---- what it says when it can't -------------------------------------------

for (const [why, must] of [['no-tab', 'Connect'], ['no-composer', 'message box'], ['blocked', 'another assistant']]) {
  const said = handoffProblem(why, 'ChatGPT', 'chatgpt');
  assert(said.includes(must), `"${why}" should mention ${must}: got "${said}"`);
  assert(!/undefined|null|\[object/.test(said), `"${why}" has a hole in it: ${said}`);
}
assert(handoffProblem('something else', 'Gemini', 'gemini').includes('Gemini'));

// "Any AI tab I pick" has no page of its own, so Connect can't open one for
// it. Saying so produced "No Any AI tab I pick tab is open. Press Connect and
// the panel opens one." — unreadable, and the instruction was false.
const anyTab = handoffProblem('no-tab', provider('any').name, 'any');
assert(!anyTab.includes('Press Connect'), `"any" must not be told to press Connect: ${anyTab}`);
assert(!/No Any/i.test(anyTab), `that sentence reads badly: ${anyTab}`);
assert(/refresh tabs/i.test(anyTab), `it should say what to actually do: ${anyTab}`);

// ---- the controls exist -----------------------------------------------------
//
// This is the bug that was actually shipped: the panel's HTML grew a set of
// new controls and nothing ever looked them up, so Connect, the assistant
// picker and the follow switch sat there doing nothing. An id that only one
// side knows about is a dead control, and it looks exactly like a feature.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const read = (f) => readFileSync(path.join(here, '..', 'extension', f), 'utf8');
const html = read('sidepanel.html');
const code = read('connect.js') + read('sidepanel.js');

const inHtml = new Set([...html.matchAll(/\bid="([\w-]+)"/g)].map((m) => m[1]));
const lookedUp = new Set([...code.matchAll(/\$\("([\w-]+)"\)/g)].map((m) => m[1]));

const dead = [...lookedUp].filter((id) => !inHtml.has(id));
assert.deepEqual(dead, [], `the code reaches for ids the page hasn't got: ${dead.join(', ')}`);

// And every control the page offers has to be wired to something.
const mustBeWired = ['provider', 'provider-tabs', 'refresh-tabs', 'connect', 'follow-questions', 'show-companion', 'task-run', 'task-cancel', 'task-text', 'stop'];
const unwired = mustBeWired.filter((id) => !lookedUp.has(id));
assert.deepEqual(unwired, [], `these controls exist on the page but nothing uses them: ${unwired.join(', ')}`);

// The panel is an ES module, so a file it imports must be one the packer ships.
for (const from of [...code.matchAll(/from\s+["']\.\/([\w.-]+)["']/g)].map((m) => m[1])) {
  assert.doesNotThrow(() => read(from), `sidepanel imports ${from}, which isn't in extension/`);
}
assert(/<script[^>]+type="module"/.test(html), 'sidepanel.html must load the panel as a module for its imports to work');

// The handoff routes the panel calls have to be the ones the desktop serves.
const bridge = readFileSync(path.join(here, '..', 'src-tauri', 'src', 'ext.rs'), 'utf8');
for (const route of [...code.matchAll(/\/side\/(\w+)/g)].map((m) => m[1])) {
  assert(bridge.includes(`"/izuki/side/${route}"`), `the panel calls /izuki/side/${route}, which ext.rs doesn't route`);
}

// ---- the bugs a review caught, so they can't come back ---------------------

const panel = readFileSync(path.join(here, '..', 'extension', 'sidepanel.js'), 'utf8');
const wiring = readFileSync(path.join(here, '..', 'extension', 'connect.js'), 'utf8');
const rust = readFileSync(path.join(here, '..', 'src-tauri', 'src', 'ext.rs'), 'utf8');

// `task_review` needs the tab the task was written about; without it every
// desktop task was refused with "Choose an open browser tab first."
assert(/tabId:\s*source\.id/.test(panel), 'prepare must send the frozen source tab the reviewed task belongs to');
assert(rust.includes('"tabId"'), 'ext.rs still expects a tabId — keep the panel sending it');

// Stop without a kind cancels a chat and leaves the task running.
assert(/side\("stop",\s*\{\s*requestId:\s*job\.id,\s*kind:\s*"task"\s*\}/.test(panel), 'Stop must say it is stopping a task');

// The connected tab can be navigated anywhere; typing into whatever is there
// would hand the question and the page to a site nobody chose.
assert(/hostedBy\(p,\s*tab\.url\)/.test(wiring), 'the tab host must be checked again right before typing into it');

// A change under docs/app is invisible to installed phones until the service
// worker's cache name changes.
const sw = readFileSync(path.join(here, '..', 'docs', 'app', 'sw.js'), 'utf8');
assert(/const CACHE = "izuki-phone-v(\d+)"/.test(sw), 'sw.js must name its cache');

console.log(`panel: ok (${PROVIDERS.length} assistants, composer handoff on a stub DOM, every control wired, every route served)`);
