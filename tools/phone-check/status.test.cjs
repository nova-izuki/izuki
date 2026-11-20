// The little status under a reply: the lines must come from the run's own
// metadata, and must never carry a key, a prompt or a guess.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const html = fs.readFileSync(path.join(root, 'docs/app/index.html'), 'utf8');

const from = html.indexOf('  let turnMeta = null;');
const end = html.indexOf('  /** The small, quiet, expandable line under a reply. */');
assert.ok(from > 0 && end > from, 'the what-answered block must be in the page');
const ctx = vm.createContext({});
vm.runInContext(html.slice(from, end) + '\nglobalThis.statusLines = statusLines;\nglobalThis.newTurnMeta = newTurnMeta;', ctx);
const { statusLines, newTurnMeta } = ctx;

const meta = (patch) => Object.assign({ provider: 'Google Gemini', model: 'gemini-flash-latest', fallback: false, local: false, screen: { device: '', detail: '' }, search: { offered: false, queries: [], found: 0, used: false, why: '' } }, patch);

// A searched answer that used its sources.
let lines = statusLines(meta({ search: { offered: true, queries: ['top event in houston'], found: 2, used: true, why: '' } }));
assert.equal(lines[0], 'Answered by Google Gemini · gemini-flash-latest.');
assert.equal(lines[1], 'Web search: “top event in houston”.');
assert.equal(lines[2], 'Results: 2 sources came back.');
assert.equal(lines[3], 'Used in the answer: yes.');

// One source is singular, and an unused search says so plainly.
lines = statusLines(meta({ search: { offered: true, queries: ['houston events'], found: 1, used: false, why: '' } }));
assert.equal(lines[2], 'Results: 1 source came back.');
assert.match(lines[3], /^Used in the answer: no/);

// Search offered, nothing came back.
lines = statusLines(meta({ search: { offered: true, queries: ['x'], found: 0, used: false, why: '' } }));
assert.equal(lines[2], 'Results: nothing useful came back.');
assert.equal(lines.length, 3);

// Offered but Google chose not to search.
lines = statusLines(meta({ search: { offered: true, queries: [], found: 0, used: false, why: '' } }));
assert.equal(lines[1], 'Web search: offered, but Google answered without searching.');

// Not offered: the reason the brain itself gave.
lines = statusLines(meta({ search: { offered: false, queries: [], found: 0, used: false, why: "Web search: not attempted — this question didn't need it." } }));
assert.equal(lines[1], "Web search: not attempted — this question didn't need it.");

// Another brain, and a fallback, are both named.
lines = statusLines(meta({ provider: 'Groq', model: 'qwen/qwen3.8-27b', fallback: true }));
assert.equal(lines[0], 'Answered by Groq · qwen/qwen3.8-27b, after a fallback.');

// Local-only processing is stated as such.
lines = statusLines(meta({ local: true }));
assert.equal(lines[1], 'Everything ran on this phone — nothing left it.');

// Which screen was read is named, and a PC is never claimed as seen.
lines = statusLines(meta({ screen: { device: 'phone', detail: 'text and a picture' } }));
assert.equal(lines[lines.length - 1], "Screen read: this phone's screen, text and a picture.");
lines = statusLines(meta({ screen: { device: 'phone', detail: 'text only' } }));
assert.equal(lines[lines.length - 1], "Screen read: this phone's screen, text only.");
lines = statusLines(meta({ provider: 'Izuki on your PC', model: '', screen: { device: 'pc', detail: '' } }));
assert.match(lines[lines.length - 1], /^Screen: your PC's own — .*cannot see it\.$/);

// No screen read, no screen line.
lines = statusLines(meta({ search: { offered: true, queries: ['q'], found: 1, used: true, why: '' } }));
assert.equal(lines.some((l) => /^Screen/.test(l)), false);

// A reply that never used a brain (a device action) shows nothing at all.
assert.equal(statusLines(meta({ provider: '' })).length, 0);
assert.equal(statusLines(null).length, 0);
const fresh = newTurnMeta();
assert.equal(fresh.search.offered, false);
assert.equal(statusLines(fresh).length, 0, 'a fresh turn has no status to show yet');

// Nothing sensitive: no keys, no prompt text.
const all = JSON.stringify([
  statusLines(meta({ search: { offered: true, queries: ['q'], found: 3, used: true, why: '' } })),
  statusLines(fresh),
]);
assert.equal(/AIza|api[_-]?key|Bearer|sk-/i.test(all), false);

console.log('status: 18 checks passed');
