const fs = require('fs');
const path = require('path');
const src = fs.readFileSync(path.join(__dirname, '../../docs/shared/bugs.js'), 'utf8');

const store = {};
const cases = [];
const ok = (cond, what) => { cases.push([cond, what]); };

global.window = { addEventListener() {} };
global.document = { currentScript: { dataset: { app: 'phone', version: '2' }, src: 'https://izukinova.ai/shared/bugs.js' }, visibilityState: 'hidden' };
global.location = { href: 'https://izukinova.ai/app/', hostname: 'izukinova.ai', pathname: '/app/', origin: 'https://izukinova.ai' };
global.localStorage = { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = v; } };
global.matchMedia = () => ({ matches: false });
global.screen = { width: 390, height: 844 };
// Node 26 has its own read-only `navigator`, so it has to be defined, not set.
Object.defineProperty(globalThis, 'navigator', { configurable: true, writable: true, value: { onLine: true, userAgent: 'test-agent' } });
// Reports aren't configured here: the copy is what this checks.
global.fetch = async () => ({ ok: false, json: async () => null });

eval(src);
const B = global.window.izukiBugs;

ok(!!B && typeof B.fact === 'function', 'notes: the page has a fact channel');

B.fact('location', 'denied');
B.fact('route', 'offline');
let text = B.text();
ok(/Now:/.test(text) && /location: denied/.test(text), 'notes: a fact is in the copy');
ok(/route: offline/.test(text), 'notes: and so is the one after it');

// the newest value wins, once
B.fact('orb', 'trip line sent');
B.fact('orb', 'Android refused the orb');
text = B.text();
ok(text.split('orb: Android refused the orb').length === 2 && !/orb: trip line sent/.test(text), 'notes: a fact is kept once, newest');

// the same keys, emails and links are scrubbed as in a report
B.fact('key', 'AIza' + 'A'.repeat(30));
B.fact('who', 'someone@example.com');
B.fact('where', 'https://example.com/x?key=secret&q=hidden');
text = B.text();
ok(!/AIza/.test(text) && /\[key\]/.test(text), 'notes: a key never lands in a fact');
ok(!/someone@example\.com/.test(text), 'notes: an email never lands in a fact');
ok(!text.includes("secret") && !text.includes("q=hidden") && text.includes("key=["), 'notes: link secrets never land in a fact');

// problems are kept on the device, and shown above the facts' neighbours
B.report('Drive mode: location denied — User denied Geolocation');
text = B.text();
ok(/Problems:/.test(text) && /location denied/.test(text), 'notes: a reported problem is in the copy');
ok(Array.isArray(B.recent()) && B.recent().length === 1, 'notes: and kept on this device');

// twenty is the cap, oldest dropped
for (let i = 0; i < 25; i++) B.fact('many' + i, String(i));
text = B.text();
ok(!/many0:/.test(text) && /many24:/.test(text), 'notes: only the last twenty facts are kept');

let bad = 0;
for (const [c, w] of cases) { if (!c) { bad++; console.log('FAIL', w); } }
console.log(`Notes: ${cases.length - bad} passed, ${bad} failed`);
process.exit(bad ? 1 : 0);
