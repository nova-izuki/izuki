// The PC's screen answer and what the status line may claim about it.
// `{ok:true, text:"…"}` is words, not proof: only the PC's own capture receipt
// in `screen.captured` may turn "requested" into "captured". Runs the page's
// own viaPc, statusLines and aiStatus with a stubbed PC — no network, no PC.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const html = fs.readFileSync(path.join(root, 'docs/app/index.html'), 'utf8');

const pcFrom = html.indexOf('  async function viaPc(said, out, opts = {}) {');
const pcTo = html.indexOf('  // ------------------------------------------------------------ attachments');
const linesFrom = html.indexOf('  function statusLines(m) {');
const linesTo = html.indexOf('  // ---- end what answered ----');
assert.ok(pcFrom > 0 && pcTo > pcFrom, 'the PC answer must be in the page');
assert.ok(linesFrom > pcFrom && linesTo > linesFrom, 'the status line must be in the page');

const ctx = vm.createContext({ console });
vm.runInContext(`
let answer = { ok: true, text: "" };
let failure = null;
const asked = [];
const bubbles = [];
const askPc = async (t) => { asked.push(t); if (failure) throw failure; return answer; };
const bubble = (who, text, opts = {}) => { bubbles.push({ who, text, opts }); return {}; };
const document = { createElement: (tag) => ({ tag, className: "", textContent: "", children: [], appendChild(c) { this.children.push(c); } }) };
const el = (tag, cls, txt) => ({ tag, cls, textContent: txt ?? "" });
`, ctx);
vm.runInContext(
  html.slice(pcFrom, pcTo) + html.slice(linesFrom, linesTo) + `
globalThis.PC = {
  run: viaPc,
  lines: statusLines,
  tag: (m) => { const box = aiStatus(m); return box ? box.children[0].textContent : ""; },
  say: (v) => { answer = v; },
  fail: (kind) => { failure = new Error(kind); },
  asked: () => asked,
  bubbles: () => bubbles,
  last: () => bubbles[bubbles.length - 1],
  reset: () => { answer = { ok: true, text: "" }; failure = null; asked.length = 0; bubbles.length = 0; },
};
`,
  ctx,
);
const PC = ctx.PC;

let checks = 0;
function check(cond, msg) {
  checks += 1;
  assert.ok(cond, msg);
}

// The working bubble viaPc replaces.
const working = () => ({ removed: false, remove() { this.removed = true; } });
// The status record the page builds for a PC answer.
const meta = () => ({ provider: 'Izuki on your PC', search: { offered: false, queries: [], found: 0, used: false, why: '' } });
const linesOf = (m) => PC.lines(m).join(' ');

(async () => {
  // 1. The PC says it captured its screen: that, and only that, is "captured".
  PC.reset();
  let m = meta();
  PC.say({ ok: true, text: 'Your screen shows the README open in VS Code.', screen: { device: 'pc', captured: true } });
  let out = working();
  let got = await PC.run('Look at your own PC screen and answer this: what is this?', out, { meta: m, screen: true });
  check(got === 'Your screen shows the README open in VS Code.', 'the PC answer is the reply');
  check(out.removed, 'the working bubble is replaced');
  check(m.screen && m.screen.device === 'pc', 'the status names the PC as the screen');
  check(m.screen.captured === true, 'a capture receipt is recorded as captured');
  check(m.screen.reported === true, 'a PC that sent a receipt is marked as reporting');
  check(/PC screen captured on your PC/.test(linesOf(m)), 'the status says the PC captured its screen');
  check(!/Screen read/.test(linesOf(m)), 'the phone never says it read the PC screen');
  check(!/PC screen read/i.test(linesOf(m)), 'never "PC screen read"');
  check(/PC screen captured/.test(PC.tag(m)), 'the summary tag says captured');
  check(PC.last().opts.meta === m, 'the bubble carries the same status record');
  check(/^Look at your own PC screen/.test(PC.asked().pop()), 'the PC is asked about its own screen');

  // 2. An empty answer: nothing happened, nothing was seen, no status claim.
  PC.reset();
  m = meta();
  PC.say({ ok: true, text: '   ', screen: { device: 'pc', captured: true } });
  out = working();
  got = await PC.run('Look at your own PC screen and answer this: what is this?', out, {
    empty: "Your PC answered with nothing about its screen, so I haven't seen it.",
    meta: m,
    screen: true,
  });
  check(/haven't seen it/.test(got), 'an empty answer says nothing was seen');
  check(!/Done/.test(got), 'an empty answer is never "Done."');
  check(PC.last().opts.error === true, 'an empty answer is an error bubble, not a reply');
  check(m.screen === undefined, 'an empty answer makes no screen claim at all');
  check(!/screen/i.test(linesOf(m)), 'an empty answer adds no screen line');

  // 3. A PC this network can't reach: said plainly, and no screen claim.
  PC.reset();
  m = meta();
  PC.fail('unreachable');
  out = working();
  got = await PC.run('Look at your own PC screen and answer this: what is this?', out, { meta: m, screen: true });
  check(/can't reach your PC/.test(got), 'an unreachable PC is named as such');
  check(/mobile data/.test(got), 'it says what to try');
  check(out.removed, 'the working bubble is replaced when the PC is away');
  check(m.screen === undefined, 'a PC that was never reached makes no screen claim');

  // A stop stays a stop: it is not dressed up as the PC being away.
  PC.reset();
  PC.fail('stopped');
  let threw = '';
  try { await PC.run('Look at your own PC screen and answer this: what is this?', working(), { meta: meta(), screen: true }); } catch (e) { threw = e.message; }
  check(threw === 'stopped', 'a stop is passed on, not swallowed');
  check(PC.bubbles().length === 0, 'a stop leaves no reply bubble behind');

  // 4. Permission refused on the PC: it answers why, and nothing was captured.
  PC.reset();
  m = meta();
  PC.say({
    ok: true,
    text: 'That needs your PC, and doing things on it from your phone is switched off (Izuki → Settings → Phone).',
    screen: { device: 'pc', captured: false },
  });
  got = await PC.run('Look at your own PC screen and answer this: what is this?', working(), { meta: m, screen: true });
  check(/switched off/.test(got), "the PC's own refusal is the reply");
  check(m.screen.captured === false, 'a refusal is not a capture');
  check(/requested, not verified/.test(linesOf(m)), 'a refusal is labelled requested, not verified');
  check(/without capturing/.test(linesOf(m)), 'it says the PC did not capture its screen');
  check(/PC screen not verified/.test(PC.tag(m)), 'the summary tag says not verified');
  check(!/Screen read/.test(linesOf(m)) && !/PC screen read/i.test(linesOf(m)), 'a refusal never claims a look');

  // 5. Missing evidence: words came back, but no receipt — unverified.
  PC.reset();
  m = meta();
  PC.say({ ok: true, text: 'Done.' });
  got = await PC.run('Look at your own PC screen and answer this: what is this?', working(), { meta: m, screen: true });
  check(got === 'Done.', 'a plain answer is still shown as given');
  check(m.screen.reported === false, 'no receipt means nothing was reported');
  check(m.screen.captured === false, 'no receipt is never read as a capture');
  check(/requested, not verified/.test(linesOf(m)), 'missing evidence reads as requested, not verified');
  check(/this PC's version can't say/.test(linesOf(m)), 'an older PC is named as unable to say');
  check(!/Screen read/.test(linesOf(m)), 'missing evidence is not called a read');

  // 6. An older PC that sends no `screen` field at all: still honest, no crash.
  PC.reset();
  m = meta();
  PC.say({ ok: true, text: 'It is open.', links: [['GitHub', 'https://github.com/login']] });
  got = await PC.run('Look at your own PC screen and answer this: what is this?', working(), { meta: m, screen: true });
  check(got === 'It is open.', "an older PC's answer is used as-is");
  check(PC.last().opts.chips.length === 1, 'its Connect chip still appears');
  check(m.screen.captured === false, 'an older PC cannot be called captured');
  // A null receipt is treated the same as none.
  PC.reset();
  m = meta();
  PC.say({ ok: true, text: 'It is open.', screen: null });
  got = await PC.run('Look at your own PC screen and answer this: what is this?', working(), { meta: m, screen: true });
  check(m.screen.reported === false, 'a null receipt is not a report');
  check(m.screen.captured === false, 'a null receipt is not a capture');
  check(/requested, not verified/.test(linesOf(m)), 'a null receipt is labelled not verified');

  // A PC answer that isn't about the screen makes no screen claim, even when
  // the PC happened to capture something while it worked.
  PC.reset();
  m = meta();
  PC.say({ ok: true, text: 'Opened Discord.', screen: { device: 'pc', captured: true } });
  got = await PC.run('Open Discord', working(), { meta: m });
  check(got === 'Opened Discord.', 'a non-screen PC task still answers');
  check(m.screen === undefined, 'a non-screen task records no screen');

  // The phone's own screen is unchanged: it is the one thing the phone really reads.
  check(/Screen read: this phone's screen/.test(linesOf({ provider: 'x', screen: { device: 'phone', detail: 'text and a picture' } })), "the phone's own screen still reads as read");
  check(/this screen/.test(PC.tag({ provider: 'x', screen: { device: 'phone', detail: '' } })), 'the phone tag is unchanged');

  console.log('pcscreen: ' + checks + ' checks passed');
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
