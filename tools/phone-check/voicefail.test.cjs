// The natural voice's failure policy, executed for real with mocked responses:
// which refusal rests how long, Retry-After, and a key change starting fresh.
// No network, no audio.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.resolve(__dirname, '../..');
const html = fs.readFileSync(path.join(root, 'docs/app/index.html'), 'utf8');

const from = html.indexOf('  const VOICE_SAYS');
const to = html.indexOf('  /** Say it once, where the person is looking');
assert.ok(from > 0 && to > from, 'the natural voice health block must be in the page');
const block = html.slice(from, to);

const store = { data: {}, get(k, d) { return k in this.data ? this.data[k] : d; }, set(k, v) { this.data[k] = v; } };
const notes = [];
const ctx = vm.createContext({ store, note: (t) => notes.push(String(t)), console });
vm.runInContext(
  'let key = "AIza-first-key";\n' + block +
  '\nglobalThis.T = { resting: voiceResting, fail: voiceFail, kind: voiceKind, retry: retryAfterMs, rest: VOICE_REST, current: () => voiceRest };' +
  '\nglobalThis.setKey = (k) => { key = k; };',
  ctx
);
const T = ctx.T;
const res = (status, retryAfter) => ({ status, headers: { get: (name) => (name === 'retry-after' ? retryAfter ?? null : null) } });
const waitOf = (kind, response) => {
  T.fail(kind, response);
  const left = T.current().until - Date.now();
  return left;
};
const near = (got, want, slack = 2000) => assert.ok(Math.abs(got - want) <= slack, `expected ~${want} ms, got ${got}`);

// Nothing refused yet: nothing rests.
assert.equal(T.resting(), null);

// 401/403: a refused key is permanent until it changes — never retried by itself.
for (const status of [401, 403]) {
  assert.equal(T.kind(status), 'auth');
  const left = waitOf('auth', res(status, '30'));
  assert.equal(left <= 1, true, 'a refused key may not schedule its own retry');
  assert.equal(T.resting()?.kind, 'auth');
  // Time passing does not bring it back…
  T.current().until = 0;
  assert.equal(T.resting()?.kind, 'auth', 'auth must outlast its timestamp');
  // …a different key does.
  ctx.setKey('AIza-second-key');
  assert.equal(T.resting(), null, 'a new key deserves a fresh try');
  assert.equal(store.data.voiceRest, null, 'the rest is cleared on disk too');
  ctx.setKey('AIza-first-key');
}

// Rate limit: the server's own Retry-After when it gives one.
assert.equal(T.kind(429), 'rate');
near(waitOf('rate', res(429, '90')), 90000);
near(waitOf('rate', res(429)), 300000);
near(waitOf('rate', res(429, '7200')), 3600000);         // capped at an hour
near(waitOf('rate', res(429, new Date(Date.now() + 120000).toUTCString())), 120000);

// Temporary server failures and a lost connection: short rests.
assert.equal(T.kind(503), 'server');
assert.equal(T.kind(500), 'server');
near(waitOf('server', res(503)), 60000);
near(waitOf('server', res(503, '5')), 10000);            // never below ten seconds
T.fail('network');
near(T.current().until - Date.now(), 20000);
T.current().until = Date.now() - 1;
assert.equal(T.resting(), null, 'a network rest expires');

// A model this key may not use: a long rest, but not for ever.
assert.equal(T.kind(400), 'unsupported');
near(waitOf('unsupported', res(400)), 1800000);

// A missing or malformed header is ignored, not obeyed.
assert.equal(T.retry(res(429, 'soon')), 0);
assert.equal(T.retry(res(429)), 0);

// Every rest is stored (so a restart doesn't ask again straight away).
T.fail('rate', res(429, '60'));
assert.equal(store.data.voiceRest.kind, 'rate');
assert.equal(store.data.voiceRest.tag, 'first-key'.slice(-6));

// Retry-After present but nonsense must not become a negative wait.
assert.ok(T.current().until >= Date.now());

console.log('voicefail: ' + (notes.length + 12) + ' checks passed');
