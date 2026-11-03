// The extension takes jobs only from Izuki: a job must be signed with this
// user's pairing key for the challenge the extension just made.
// (Before, a program holding the bridge port while Izuki wasn't running got
// any page read with the user's sign-ins: reproduced, docs/REVIEW-1.0.196.md.)
//
// The real extension/background.js runs in a sandbox. "fetch" plays the
// bridge server (Izuki, or an impostor), the web (a private page that only
// answers with cookies) and the extension's own pairing.json.
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import vm from 'node:vm';

const KEY = crypto.randomBytes(32).toString('hex');
const sign = (key, nonce, body) => crypto.createHmac('sha256', Buffer.from(key, 'hex')).update(`${nonce}\n${body}`).digest('hex');

// The same HMAC as Izuki's ring (RFC 4231 case 2, also in ext.rs's tests).
const subtleKey = await crypto.webcrypto.subtle.importKey('raw', Buffer.from('Jefe'), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
assert.equal(Buffer.from(await crypto.webcrypto.subtle.sign('HMAC', subtleKey, Buffer.from('what do ya want for nothing?'))).toString('hex'),
  '5bdcc146bf60754e6a042426089575c75a003f089d2739839dec58b964ec3843');

async function session({ server, paired = true }) {
  const seen = [];
  let served = false;
  const event = () => ({ addListener() {} });
  const tab = { id: 1, url: 'https://news.example.org/', title: 'News', active: true, windowId: 1 };
  const chrome = {
    runtime: { getManifest: () => ({ version: '1.6.0' }), onMessage: event(), onInstalled: event(), onStartup: event(), getURL: (p) => 'chrome-extension://x/' + p, id: 'x' },
    alarms: { create() {}, onAlarm: event() }, contextMenus: { create() {}, removeAll(cb) { cb && cb(); }, onClicked: event() },
    tabs: { query: async () => [tab], get: async () => tab, onActivated: event(), onUpdated: event(), onRemoved: event() },
    storage: { local: { get: async () => ({}), set: async () => {} }, session: { get: async () => ({}), set: async () => {} }, onChanged: event() },
    action: { setBadgeText: async () => {} }, commands: { onCommand: event() }, sidePanel: { setPanelBehavior: async () => {} },
    windows: { onRemoved: event() },
    // The page in front links to one article (not to the mailbox).
    scripting: { executeScript: async () => [{ result: ['https://news.example.org/story'] }] },
  };
  const fetch = async (url, opts = {}) => {
    const u = String(url);
    seen.push({ url: u, credentials: opts.credentials || 'omit', body: opts.body });
    if (u === 'chrome-extension://x/pairing.json') {
      if (!paired) throw new TypeError('Failed to fetch');
      return { ok: true, json: async () => ({ key: KEY }) };
    }
    if (u.endsWith('/izuki/next')) {
      const nonce = opts.headers?.['X-Izuki-Nonce'];
      // One job, then the server goes away (as when Izuki closes): the worker's
      // loop ends, so this check can wait for it.
      if (served) throw new TypeError('Failed to fetch');
      const job = { id: 7, op: 'readlinks', args: { urls: ['https://mail.example.com/inbox', 'https://news.example.org/story'] } };
      served = true;
      return { ok: true, json: async () => server(job, nonce) };
    }
    if (u.startsWith('https://')) {
      const signedIn = opts.credentials === 'include';
      return { ok: true, headers: { get: () => 'text/html' }, text: async () => (signedIn ? `<title>T</title><p>PRIVATE ${u}</p>` : '<p>Please sign in</p>') };
    }
    return { ok: true, json: async () => ({}), text: async () => '' };
  };
  const ctx = vm.createContext({ chrome, fetch, console: { ...console, warn() {} }, URL, AbortController, setTimeout, clearTimeout, setInterval, clearInterval,
    // (One realm, as in the browser: Node's WebCrypto rejects a sandbox's own Uint8Array.)
    crypto: crypto.webcrypto, TextEncoder, Uint8Array, structuredClone, importScripts() {}, self: {} });
  ctx.globalThis = ctx;
  vm.runInContext('var IzukiWorkspaceState={createHistoryStore(){return {}}};', ctx);
  // The worker starts its loop when it loads; this check starts it instead
  // (that one call removed) and waits for that very run to end, so a pass
  // can't come from a loop that never ran.
  let src = fs.readFileSync(new URL('../extension/background.js', import.meta.url), 'utf8');
  const startCall = '\nloop();';
  const start = src.lastIndexOf(startCall);
  assert(start > 0, 'background.js starts its loop at load');
  src = src.slice(0, start) + src.slice(start + startCall.length);
  try { vm.runInContext(src, ctx, { filename: 'background.js' }); } catch { /* wiring past the bridge */ }
  assert.equal(typeof ctx.loop, 'function', 'the bridge loop must load, or this check proves nothing');
  let timer;
  await Promise.race([ctx.loop(), new Promise((_, no) => { timer = setTimeout(() => no(new Error('the bridge loop never finished')), 10000); })]);
  clearTimeout(timer);
  const result = seen.find((s) => s.url.endsWith('/izuki/result'));
  return { seen, result: result && JSON.parse(result.body), polled: seen.some((s) => s.url.endsWith('/izuki/next')) };
}
const mail = (s) => s.seen.some((x) => x.url.startsWith('https://mail.example.com/'));

// 1. An impostor (no key): plain jobs are ignored. Nothing is read, nothing answered.
let s = await session({ server: (job) => job });
assert(s.polled, 'the bridge was asked for work');
assert.equal(mail(s), false, 'an unsigned job must not read the mailbox');
assert.equal(s.result, undefined, 'and nothing is sent back to the impostor');

// 2. Signed with the wrong key: ignored the same way.
s = await session({ server: (job, nonce) => { const body = JSON.stringify(job); return { signed: body, mac: sign(crypto.randomBytes(32).toString('hex'), nonce, body) }; } });
assert(s.polled);
assert.equal(mail(s), false);
assert.equal(s.result, undefined);

// 3. A signature from an earlier challenge (a replay): ignored.
s = await session({ server: (job) => { const body = JSON.stringify(job); return { signed: body, mac: sign(KEY, '00112233445566778899aabbccddeeff', body) }; } });
assert(s.polled);
assert.equal(mail(s), false, 'a replayed signature is not accepted');

// 4. Izuki (the right key, this challenge): the job runs, but only links on the page are read.
s = await session({ server: (job, nonce) => { const body = JSON.stringify(job); return { signed: body, mac: sign(KEY, nonce, body) }; } });
assert(s.result?.ok, `Izuki's signed job runs: ${JSON.stringify(s.result)}`);
assert.equal(mail(s), false, 'an address that is not a link on the page is never fetched');
const [inbox, story] = s.result.data;
assert.equal(inbox.refused, 'not a link on this page');
assert.match(story.text, /PRIVATE https:\/\/news\.example\.org\/story/, 'a real link on the page is read, with sign-ins');

// 5. Set up by hand (no pairing.json): no jobs taken at all.
s = await session({ server: (job) => job, paired: false });
assert.equal(s.polled, false, 'an unpaired extension does not take jobs');

console.log('bridge auth: unsigned, wrong-key and replayed jobs ignored (nothing read, nothing answered); Izuki\'s signed job runs and reads only links on the page; an unpaired extension takes no jobs; HMAC agrees with ring (RFC 4231).');

// ---- Part 2: nothing private goes to the port unless Izuki proves itself ----
// bridge-proof.js, used before questions, page text, selections and tasks.
async function proofIn({ paired = true, ping }) {
  let pings = 0;
  const ctx = vm.createContext({
    chrome: { runtime: { getURL: (p) => 'chrome-extension://x/' + p } },
    crypto: crypto.webcrypto, TextEncoder, Uint8Array, AbortSignal, Date,
    fetch: async (url, opts = {}) => {
      if (url === 'chrome-extension://x/pairing.json') {
        if (!paired) throw new TypeError('Failed to fetch');
        return { json: async () => ({ key: KEY }) };
      }
      pings++;
      return ping(opts.headers['X-Izuki-Nonce']);
    },
  });
  vm.runInContext(fs.readFileSync(new URL('../extension/bridge-proof.js', import.meta.url), 'utf8'), ctx);
  return { proof: ctx.IzukiBridgeProof, pings: () => pings };
}
const signedPing = (key) => async (nonce) => ({ json: async () => ({ ok: true, proof: sign(key, nonce, 'ping') }) });

let p = await proofIn({ paired: false, ping: signedPing(KEY) });
assert.equal((await p.proof.check()).why, 'unpaired');
await assert.rejects(p.proof.require(), /Set this extension up from Izuki/);
assert.equal(p.pings(), 0, 'an unpaired extension asks nothing');

p = await proofIn({ ping: async () => ({ json: async () => ({ ok: true, name: 'Izuki' }) }) });
assert.equal((await p.proof.check()).why, 'unproven', 'an impostor that only says "Izuki" is refused');
await assert.rejects(p.proof.require(), /Something other than Izuki/);

p = await proofIn({ ping: signedPing(crypto.randomBytes(32).toString('hex')) });
assert.equal((await p.proof.check()).why, 'unproven', 'a proof signed with another key is refused');

p = await proofIn({ ping: async () => { throw new TypeError('Failed to fetch'); } });
assert.equal((await p.proof.check()).why, 'offline');

p = await proofIn({ ping: signedPing(KEY) });
assert.equal((await p.proof.check()).ok, true, 'Izuki proves itself');
await p.proof.require();
assert.equal(p.pings(), 1, 'a good proof is trusted for a minute, not asked again each time');

console.log('bridge auth part 2: the panel, worker and selection helpers send only after Izuki proves itself (unpaired, impostor, wrong key and offline refused; a good proof trusted for a minute).');
