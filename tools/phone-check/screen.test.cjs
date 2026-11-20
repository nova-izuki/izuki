// The screen question: which screen, permission, denial, expiry, cancellation
// and a PC that isn't there. Runs the page's own functions with fake timers —
// no camera, no accessibility service, no network.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const html = fs.readFileSync(path.join(root, 'docs/app/index.html'), 'utf8');

const from = html.indexOf('  async function screenChoice(out) {');
const to = html.indexOf('  /** Settings → What Izuki can see');
assert.ok(from > 0 && to > from, 'the screen choice block must be in the page');

const timers = new Map();
let seq = 0;
const ctx = vm.createContext({
  AbortController,
  console,
  setTimeout: (fn, ms) => { timers.set(++seq, { fn, ms, kind: 't' }); return seq; },
  clearTimeout: (id) => timers.delete(id),
  setInterval: (fn, ms) => { timers.set(++seq, { fn, ms, kind: 'i' }); return seq; },
  clearInterval: (id) => timers.delete(id),
});
vm.runInContext(`
let screenSource = "ask";
let turnCtx = null;
let pc = "";
let requestAbort = null;
let busy = true;
let requestEnd = "";
let isIOS = false;
let android = true;
const document = { hidden: false };
const window = { IzukiNative: null };
const store = { data: {}, get(k, d) { return k in this.data ? this.data[k] : d; }, set(k, v) { this.data[k] = v; } };
const agentReady = () => android;
const el = (tag, cls, txt) => ({ tag, cls, textContent: txt ?? "", children: [], appendChild(c) { this.children.push(c); }, remove() { this.removed = true; } });
const log = { scrollTop: 0, scrollHeight: 0 };
const notes = [];
const note = (t) => notes.push(String(t));
`, ctx);
vm.runInContext(html.slice(from, to) + `
globalThis.T = {
  choice: screenChoice,
  source: (v) => { screenSource = v; },
  pc: (v) => { pc = v; },
  turn: (v) => { turnCtx = v; },
  agent: (v) => { android = v; },
  ios: (v) => { isIOS = v; },
  end: (v) => { requestEnd = v; },
  reset: () => { store.data = {}; requestEnd = ""; pc = ""; turnCtx = null; android = true; isIOS = false; },
  grant: () => { store.data.screenOk = true; },
  data: () => store.data,
  notes: () => notes,
};
`, ctx);
const T = ctx.T;

const out = () => ({ children: [], appendChild(c) { this.children.push(c); } });
const settle = () => new Promise((r) => setTimeout(r, 0));
const row = (o) => o.children[o.children.length - 1];
function click(o, label) {
  const r = row(o);
  assert.ok(r, 'a question must be showing');
  const b = r.children.find((c) => c.textContent === label);
  assert.ok(b, 'no chip "' + label + '" in [' + r.children.map((c) => c.textContent).join(' | ') + ']');
  b.onclick();
}
const fire = (ms) => { for (const [id, t] of [...timers]) if (t.ms === ms) { timers.delete(id); t.fn(); } };
const beat = () => { for (const [id, t] of [...timers]) if (t.kind === 'i') t.fn(); };

// The PC lane: an answer with no words in it is never reported as a reply.
const pcTimers = [];
const pcCtx = vm.createContext({ console, document: { createElement: () => ({}) } });
vm.runInContext(`
let answer = { text: "" };
const saids = [];
const asked = [];
const askPc = async (t) => { asked.push(t); return answer; };
const canvas = [];
const bubble = (who, text, opts) => { canvas.push({ who, text, opts }); return {}; };
const out = { remove() { this.removed = true; } };
` + html.slice(html.indexOf("  async function viaPc(said, out, opts = {}) {"), html.indexOf("  // ------------------------------------------------------------ attachments")) + `
globalThis.PC = { run: viaPc, answer: (v) => { answer = v; }, canvas: () => canvas, asked: () => asked, out: () => out };
`, pcCtx);
const PC = pcCtx.PC;

(async () => {
  // An empty PC answer about a screen is explained, never called "Done.".
  PC.answer({ text: "   " });
  const quiet = await PC.run("Look at your own PC screen and answer this: what is this?", PC.out(), { empty: "Your PC answered with nothing about its screen, so I haven't seen it." });
  assert.match(quiet, /haven't seen it/);
  const last = PC.canvas().pop();
  assert.equal(last.text, quiet);
  assert.equal(last.opts.error, true, 'an empty answer is not a success bubble');
  assert.equal(quiet.includes('Done'), false);

  // The same for any other PC answer: no invented "Done.".
  PC.answer({ text: "" });
  const blank = await PC.run("anything", PC.out());
  assert.equal(blank.includes('Done'), false);
  assert.match(blank, /didn't send an answer/);

  // A real answer keeps its status line, screen included.
  PC.answer({ text: "Your screen shows a chart." });
  const meta = { provider: 'Izuki on your PC', model: '', screen: { device: 'pc', detail: '' }, search: { offered: false, queries: [], found: 0, used: false, why: '' } };
  const good = await PC.run("Look at your own PC screen and answer this: what is this?", PC.out(), { meta });
  assert.equal(good, 'Your screen shows a chart.');
  assert.equal(PC.canvas().pop().opts.meta, meta);
  assert.match(PC.asked().pop(), /^Look at your own PC screen/);
  // Ask each time on a new install: the person picks the screen, then allows.
  T.reset();
  T.source('ask');
  let o = out();
  let p = T.choice(o);
  await settle();
  assert.equal(o.children.length, 1, 'one question: which screen');
  assert.match(row(o).children[0].textContent, /Which screen/);
  click(o, '📱 This phone');
  await settle();
  assert.equal(o.children.length, 2, 'then the permission question');
  assert.match(row(o).children[0].textContent, /read the text on this screen/);
  click(o, 'Allow');
  let r = await p;
  assert.equal(r.source, 'phone');
  assert.equal(r.why, '');
  assert.equal(T.data().screenOk, true, 'the yes is remembered');

  // A refusal reads correctly and never grants anything.
  T.reset();
  T.source('ask');
  o = out(); p = T.choice(o); await settle();
  click(o, '📱 This phone'); await settle();
  click(o, 'Not now');
  r = await p;
  assert.equal(r.source, '', 'a refusal reads nothing');
  assert.match(r.why, /won't read your screen/);
  assert.equal(T.data().screenOk, undefined, 'a refusal grants nothing');
  assert.ok(T.notes().some((n) => /screen look refused/.test(n)));

  // No answer at all: the question expires and says so.
  T.reset();
  T.source('ask');
  o = out(); p = T.choice(o); await settle();
  fire(20000);
  r = await p;
  assert.equal(r.source, '');
  assert.match(r.why, /didn't get an answer/);
  assert.ok(row(o).removed, 'an expired question is taken off the screen');

  // Stop while waiting: cancelled, silent, no deadline ever started.
  T.reset();
  T.source('ask');
  o = out(); p = T.choice(o); await settle();
  click(o, '📱 This phone'); await settle();
  T.end('cancelled');
  beat();
  r = await p;
  assert.equal(r.source, '');
  assert.equal(r.why, '', 'a cancelled request says nothing extra');
  assert.ok(o.children.every((x) => x.removed), 'every question row is taken away');

  // A saved PC choice: used when the PC is linked, explained when it isn't.
  T.reset();
  T.source('pc');
  T.pc('https://pc.example/tunnel/');
  r = await T.choice(out());
  assert.equal(r.source, 'pc');
  T.pc('');
  r = await T.choice(out());
  assert.equal(r.source, '', 'a missing PC never claims a screen');
  assert.match(r.why, /isn't linked/);

  // "No screen context" is honoured out loud.
  T.reset();
  T.source('off');
  r = await T.choice(out());
  assert.equal(r.source, '');
  assert.match(r.why, /Screen context is off/);

  // Unsupported platforms explain themselves instead of guessing.
  T.reset();
  T.source('phone');
  T.agent(false);
  T.ios(true);
  r = await T.choice(out());
  assert.match(r.why, /iPhone/);
  T.ios(false);
  r = await T.choice(out());
  assert.match(r.why, /screenshot/, 'a desktop web page is told what to do instead');

  // A remembered yes is not asked again.
  T.reset();
  T.source('phone');
  T.agent(true);
  o = out(); p = T.choice(o); await settle();
  assert.equal(o.children.length, 1, 'one question: permission');
  click(o, 'Allow');
  assert.equal((await p).source, 'phone');
  o = out();
  r = await T.choice(o);
  assert.equal(r.source, 'phone');
  assert.equal(o.children.length, 0, 'no question the second time');

  // Over another app the orb is on that screen: no "which screen" question,
  // and once allowed, no permission question either.
  T.reset();
  T.source('ask');
  T.turn({ id: 'turn-1' });
  T.grant();
  o = out();
  r = await T.choice(o);
  assert.equal(r.source, 'phone');
  assert.equal(o.children.length, 0, 'no device guess is asked over another app');
  T.turn(null);

  // Without that yes, a voice turn is told where to allow it — it never waits
  // on a button in a window nobody can see.
  T.reset();
  T.source('ask');
  T.turn({ id: 'turn-2' });
  o = out();
  r = await T.choice(o);
  assert.equal(r.source, '', 'no screen is read without a yes');
  assert.match(r.why, /Settings/, 'it says where to allow it');
  assert.equal(o.children.length, 0, 'nothing waits on an invisible tap');
  T.turn(null);

  // The reply's own clock starts after the screen question, never before.
  const choiceAt = html.indexOf('await screenChoice(out)');
  const deadlineAt = html.indexOf('beginRequest(chosen.source === "pc" || wantsWebRead(said)');
  assert.ok(choiceAt > 0 && deadlineAt > choiceAt, 'the reply deadline must start after the screen question');
  assert.equal(html.includes('beginRequest(wantsWebRead(said) ? 120000 : 90000);'), false, 'no deadline at the top of ask()');
  assert.ok(html.indexOf('if (requestEnd) throw new Error("stopped");') > choiceAt, 'a Stop during the question ends the request');
  assert.ok(html.includes('store.get("screenSource", "ask")'), '"Ask each time" is the default for a new install');
  assert.ok(html.includes("if (store.get(\"screenOk\", false) !== true) return \"I haven't been allowed"), 'reading a screen needs the permission even from another path');

  assert.ok(html.includes('id="screen-allow"'), 'the yes is reachable from Settings');
  console.log('screen: 39 checks passed');
})();
