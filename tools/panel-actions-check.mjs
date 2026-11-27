// Driving the tab the person is on: what an answer's action tags mean, what the
// model is told, and that a numbered control is found, pressed and typed into.
// Pure rules and the injected functions from extension/page-actions.js.
//
// The DOM here is a small stand-in: this proves the numbering, the labels, the
// skip rules (a password is never numbered) and that click/type reach the
// element the snapshot numbered. It does not prove a real site's own scripts
// behave — that needs the browser.
import assert from 'node:assert/strict';
import { actionTags, stripActions, actionPrompt, riskyControl, committal, MAX_STEPS, moreRounds, pageControls, clickControl, typeControl } from '../extension/page-actions.js';

const test = (name, fn) => { fn(); console.log('  ✓ ' + name); };

// ---- what an answer may ask for -------------------------------------------

test('a click and a typed send, in the order asked', () => {
  assert.deepEqual(actionTags('Sure. [PAGE_CLICK: 3] then [PAGE_TYPE: 7 | my password is no \u23ce]'), [
    { op: 'click', n: 3 },
    { op: 'type', n: 7, text: 'my password is no', submit: true },
  ]);
});

test('nothing invented: no words, no number, or no such item is not an action', () => {
  assert.deepEqual(actionTags('[PAGE_TYPE: 4 |   ]'), []);
  assert.deepEqual(actionTags('[PAGE_CLICK: 0]'), []);
  assert.deepEqual(actionTags('[PAGE_CLICK: 9999]'), []);
  assert.deepEqual(actionTags('no tags at all'), []);
  assert.deepEqual(actionTags('[PAGE_CLICK:]'), []);
});

test('the tags come out of what the person reads', () => {
  assert.equal(stripActions('Opening it for you. [PAGE_CLICK: 2]\n\nHere it is.'), 'Opening it for you.\n\nHere it is.');
  assert.equal(stripActions('[PAGE_TYPE: 1 | hello]'), '');
});

test('the model is told the numbers and the limits', () => {
  const prompt = actionPrompt([{ n: 1, kind: 'link', label: 'Grades' }, { n: 2, kind: 'field', label: 'Search  courses' }]);
  assert.match(prompt, /1\. link “Grades”/);
  assert.match(prompt, /2\. field “Search courses”/);
  assert.match(prompt, /Never type a password/);
  assert.match(prompt, /\[PAGE_CLICK: n\]/);
});

test('a press that sends, buys or deletes belongs to the person', () => {
  assert.equal(riskyControl('Submit'), true);
  assert.equal(riskyControl('Send message'), true);
  assert.equal(riskyControl('Delete post'), true);
  assert.equal(riskyControl('Buy now'), true);
  assert.equal(riskyControl('Log out'), true);
  // Moving around a page is not a commitment.
  assert.equal(riskyControl('Grades'), false);
  assert.equal(riskyControl('Search courses'), false);
  assert.equal(riskyControl(''), false);
});

// ---- the page, as a stand-in ----------------------------------------------

const box = (w = 40, h = 20) => ({ width: w, height: h });
class FakeEl {
  constructor(tag, props = {}) {
    Object.assign(this, { tagName: tag, disabled: false, attrs: {}, clicked: 0, events: [] }, props);
    this.text = props.text || '';
  }
  get innerText() { return this.text; }
  get value() { return this._value || ''; }
  set value(v) { this._value = v; }
  getAttribute(k) { return this.attrs[k] ?? null; }
  setAttribute(k, v) { this.attrs[k] = String(v); }
  removeAttribute(k) { delete this.attrs[k]; }
  getBoundingClientRect() { return this._box || box(); }
  scrollIntoView() {}
  focus() { this.focused = true; }
  click() { this.clicked += 1; }
  dispatchEvent(e) { this.events.push(e.type); return true; }
}

const controls = [
  new FakeEl('A', { text: 'Grades', href: 'https://school.test/grades' }),
  new FakeEl('BUTTON', { text: '  Save   changes ' }),
  new FakeEl('INPUT', { type: 'text', attrs: { placeholder: 'Search courses' } }),
  new FakeEl('INPUT', { type: 'password', attrs: { 'aria-label': 'Password' } }),
  new FakeEl('INPUT', { type: 'hidden' }),
  new FakeEl('BUTTON', { text: 'Off screen', _box: box(0, 0) }),
  new FakeEl('INPUT', { type: 'checkbox', attrs: { 'aria-label': 'Remember me' } }),
  new FakeEl('A', { text: 'Gone', disabled: true }),
];

const byNumber = new Map();
globalThis.location = { href: 'https://school.test/course' };
globalThis.document = {
  title: 'Course home',
  querySelectorAll: (sel) => (sel === '[data-izuki-n]' ? [...byNumber.values()] : controls),
  querySelector: (sel) => {
    const m = /^\[data-izuki-n="(\d+)"\]$/.exec(sel);
    return m ? byNumber.get(m[1]) || null : null;
  },
};
globalThis.getComputedStyle = (el) => ({
  display: 'block',
  visibility: 'visible',
  opacity: el.opacity || '1',
});
globalThis.Event = class { constructor(type) { this.type = type; } };
globalThis.KeyboardEvent = class extends globalThis.Event {};
globalThis.HTMLInputElement = { prototype: {} };
globalThis.HTMLTextAreaElement = { prototype: {} };
Object.defineProperty(globalThis.HTMLInputElement.prototype, 'value', { set(v) { this._value = v; }, configurable: true });

test('the page is numbered without passwords, hidden fields, off-screen buttons or disabled links', () => {
  byNumber.clear();
  const snap = pageControls();
  assert.equal(snap.title, 'Course home');
  assert.deepEqual(snap.items.map((i) => [i.n, i.kind, i.label]), [
    [1, 'link', 'Grades'],
    [2, 'button', 'Save changes'],
    [3, 'field', 'Search courses'],
    [4, 'check', 'Remember me'],
  ]);
  for (const item of snap.items) byNumber.set(String(item.n), controls[item.n - 1]);
});

test('clicking item 1 presses that exact element', () => {
  const r = clickControl(1);
  assert.equal(r.ok, true);
  assert.equal(r.label, 'Grades');
  assert.equal(controls[0].clicked, 1);
  assert.equal(controls[1].clicked, 0);
});

test('a numbered item that has gone says so instead of guessing', () => {
  assert.equal(clickControl(9).ok, false);
});

test('typing sets the value, fires what a keystroke fires, and can press Enter', () => {
  const field = controls[2];
  const r = typeControl(3, 'biology', true);
  assert.equal(r.ok, true);
  assert.equal(field.value, 'biology');
  assert.deepEqual(field.events, ['input', 'change', 'keydown']);
  assert.equal(field.focused, true);
});

test('in a form, the send is the form own submit, not a floating Enter key', () => {
  const field = new FakeEl('INPUT', { type: 'search', attrs: { placeholder: 'Ask' } });
  let submitted = 0;
  field.form = { requestSubmit: () => { submitted += 1; } };
  byNumber.set('77', field);
  assert.equal(typeControl(77, 'hello', true).ok, true);
  assert.equal(submitted, 1);
  assert.equal(field.events.includes('keydown'), false);
});

test('a password box is never typed into', () => {
  const r = typeControl(3, 'hunter2');
  assert.equal(r.ok, true, 'item 3 is not the password box');
  byNumber.set('99', controls[3]);
  assert.equal(typeControl(99, 'hunter2').ok, false);
});

test('Enter in a message box is a send, though the box is only called Message', () => {
  const saved = globalThis.document.querySelectorAll;
  const message = new FakeEl('TEXTAREA', { attrs: { placeholder: 'Write a message' } });
  const search = new FakeEl('INPUT', { type: 'search', attrs: { placeholder: 'Search courses' } });
  const note = new FakeEl('TEXTAREA', { attrs: { placeholder: 'Notes' } });
  const send = new FakeEl('BUTTON', { text: 'Send' });
  // A composer bar: the box, and the Send button beside it.
  note.parentElement = { parentElement: null, querySelectorAll: () => [send] };
  globalThis.document.querySelectorAll = () => [message, search, note];
  try {
    const snap = pageControls();
    assert.deepEqual(Object.fromEntries(snap.items.map((i) => [i.label, i.sends])), {
      'Write a message': true, // the box says what it is
      'Search courses': false, // a search is not a send
      Notes: true,             // a Send button in the same bar
    });
    for (const item of snap.items) byNumber.set(String(item.n), [message, search, note][item.n - 1]);

    // The rule the panel applies to a [PAGE_TYPE: n | words \u23ce] tag.
    assert.equal(committal('Write a message', true), true);
    assert.equal(committal('Search courses', false), false);

    // And the press itself: the words go in, Enter never does.
    const typed = typeControl(1, 'see you at five', true);
    assert.equal(typed.ok, true);
    assert.equal(typed.sent, false);
    assert.equal(message.value, 'see you at five');
    assert.equal(message.events.includes('keydown'), false);

    // A search box is not a commitment: Enter there still searches.
    assert.equal(typeControl(2, 'biology', true).ok, true);
    assert.equal(search.events.includes('keydown'), true);
  } finally {
    globalThis.document.querySelectorAll = saved;
  }
});

test('a composer is a field, and its data-placeholder is its name', () => {
  const saved = globalThis.document.querySelectorAll;
  const slack = new FakeEl('DIV', {
    attrs: { contenteditable: 'true', role: 'textbox', 'aria-label': 'Message #general' },
  });
  const notes = new FakeEl('DIV', { attrs: { contenteditable: 'true', 'data-placeholder': 'Notes' } });
  const inert = new FakeEl('DIV', { attrs: { contenteditable: 'false', 'aria-label': 'Toolbar' } });
  globalThis.document.querySelectorAll = () => [slack, notes, inert];
  try {
    const snap = pageControls();
    assert.deepEqual(snap.items.map((i) => [i.n, i.kind, i.label, i.sends]), [
      [1, 'field', 'Message #general', true], // a chat box: Enter sends
      [2, 'field', 'Notes', false],           // editable, nothing says it sends
    ], 'contenteditable="false" is never numbered');
    for (const item of snap.items) byNumber.set(String(item.n), [slack, notes][item.n - 1]);

    // Typing inserts the words; the Enter a send would be is dropped.
    const typed = typeControl(1, 'on my way', true);
    assert.equal(typed.ok, true);
    assert.equal(typed.sent, false);
    assert.equal(slack.textContent, 'on my way');
    assert.equal(slack.events.includes('input'), true);
    assert.equal(slack.events.includes('keydown'), false);

    // A plain editable still takes its Enter.
    assert.equal(typeControl(2, 'remember milk', true).ok, true);
    assert.equal(notes.events.includes('keydown'), true);
  } finally {
    globalThis.document.querySelectorAll = saved;
  }
});

test('a chat box sends on Enter even when its name says nothing; a body does not', () => {
  const saved = globalThis.document.querySelectorAll;
  // No "message" in the name, and no Send button nearby: it still sends.
  const chat = new FakeEl('DIV', { attrs: { contenteditable: 'true', 'aria-label': 'Write something' } });
  // Gmail's body: Enter is a new line there, and its own Send button is separate.
  const body = new FakeEl('DIV', { attrs: { contenteditable: 'true', role: 'textbox', 'aria-label': 'Message Body' } });
  const send = new FakeEl('BUTTON', { text: 'Send' });
  body.parentElement = { parentElement: null, querySelectorAll: () => [send] };
  globalThis.document.querySelectorAll = () => [chat, body];
  try {
    const snap = pageControls();
    assert.deepEqual(snap.items.map((i) => [i.label, i.sends]), [
      ['Write something', true],
      ['Message Body', false],
    ]);
    for (const item of snap.items) byNumber.set(String(item.n), [chat, body][item.n - 1]);

    assert.equal(typeControl(1, 'hey', true).sent, false);
    assert.equal(chat.events.includes('keydown'), false);
    // The long-form box keeps its Enter: in Gmail that is a line break.
    assert.equal(typeControl(2, 'Dear Ana,', true).ok, true);
    assert.equal(body.events.includes('keydown'), true);
  } finally {
    globalThis.document.querySelectorAll = saved;
  }
});

test('a task has a budget, so a page cannot keep it going forever', () => {
  assert.equal(moreRounds(0, 0), true);
  assert.equal(moreRounds(4, 1), true);
  assert.equal(moreRounds(MAX_STEPS, 1), false);
  assert.equal(moreRounds(4, 5), false);
  // Four steps a round, twelve a task: the third round is the last that fits.
  assert.equal(moreRounds(8, 2), true);
  assert.equal(moreRounds(12, 3), false);
});

// ---- and each injected function runs on its own ----------------------------
// chrome.scripting.executeScript({ func }) sends func.toString() and runs it in
// the page with no module scope at all, so a helper left outside the function
// (a call to sendsFromHere, say) throws there and the panel gets no controls,
// while every check that imports the module still passes. Running the source
// text here — never the imported function — makes that failure visible.
const fromSource = (fn) => new Function('return (' + fn.toString() + ')')();

test('every injected function runs from its own text, with no module scope', () => {
  const saved = globalThis.document.querySelectorAll;
  const message = new FakeEl('TEXTAREA', { attrs: { placeholder: 'Write a message' } });
  const link = new FakeEl('A', { text: 'Grades' });
  globalThis.document.querySelectorAll = () => [link, message];
  try {
    const snap = fromSource(pageControls)();
    assert.equal(snap.items.length, 2);
    assert.equal(snap.items[1].label, 'Write a message');
    assert.equal(snap.items[1].sends, true, 'the Enter mark must be set from the injected text alone');
    for (const item of snap.items) byNumber.set(String(item.n), [link, message][item.n - 1]);

    assert.equal(fromSource(clickControl)(1).ok, true);
    assert.equal(link.clicked, 1);

    const typed = fromSource(typeControl)(2, 'on my way', true);
    assert.equal(typed.ok, true);
    assert.equal(typed.sent, false);
    assert.equal(message.value, 'on my way');
    assert.equal(message.events.includes('keydown'), false);

    // A composer, numbered and typed from the same bare copy.
    const chat = new FakeEl('DIV', { attrs: { contenteditable: 'true', 'aria-label': 'Message #general' } });
    globalThis.document.querySelectorAll = () => [chat];
    const snap2 = fromSource(pageControls)();
    assert.equal(snap2.items.length, 1);
    assert.equal(snap2.items[0].kind, 'field');
    assert.equal(snap2.items[0].sends, true);
    byNumber.set('1', chat);
    assert.equal(fromSource(typeControl)(1, 'hello there', false).ok, true);
    assert.equal(chat.textContent, 'hello there');
  } finally {
    globalThis.document.querySelectorAll = saved;
  }
});

console.log('\npanel-actions: 15 checks passed');
