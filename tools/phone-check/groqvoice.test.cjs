// The second natural voice (docs/app/index.html, "the second natural voice"):
// Orpheus on Groq speaks when Gemini's small free speech allowance rests.
// Before it, a Quest went silent after a few replies (its browser has no voice
// of its own) and showed only the words. Run against the page's real code.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const html = fs.readFileSync(path.resolve(__dirname, "../../docs/app/index.html"), "utf8");
const start = html.indexOf("  // ---- the second natural voice");
const end = html.indexOf("  // ---- end the second natural voice ----");
assert.ok(start > 0 && end > start, "the second-voice block is where the test expects it");
const block = html.slice(start, end);

let passed = 0;
const tests = [];
const test = (name, fn) => tests.push([name, fn]);

/** A small WAV: 16-bit mono at `rate`, with `n` samples of value v. */
function wav(n, v = 1, rate = 24000, streamed = false) {
  const out = new Uint8Array(44 + n * 2);
  const w = new DataView(out.buffer);
  const tag = (at, s) => { for (let i = 0; i < 4; i++) out[at + i] = s.charCodeAt(i); };
  tag(0, "RIFF"); w.setUint32(4, 36 + n * 2, true); tag(8, "WAVE");
  tag(12, "fmt "); w.setUint32(16, 16, true); w.setUint16(20, 1, true); w.setUint16(22, 1, true);
  w.setUint32(24, rate, true); w.setUint32(28, rate * 2, true); w.setUint16(32, 2, true); w.setUint16(34, 16, true);
  tag(36, "data"); w.setUint32(40, streamed ? 0xffffffff : n * 2, true);
  for (let i = 0; i < n; i++) w.setInt16(44 + i * 2, v, true);
  return out;
}

function page({ groqKey = "gsk_test_123456", lang = "en-US", person = "nova", gemini = async () => null, replies = [] } = {}) {
  const local = new Map();
  const fetched = [];
  let made = 0;
  const ctx = {
    console, Date, Math, JSON, Promise, Uint8Array, DataView, ArrayBuffer, String, Number, Object, setTimeout, clearTimeout, AbortController,
    store: { get: (k, d) => (local.has(k) ? local.get(k) : d), set: (k, v) => local.set(k, v) },
    brainKeys: { groq: groqKey },
    hearing: () => ({ code: lang, words: "English" }),
    person: () => ({ id: person }),
    note() {},
    retryAfterMs: () => 0,
    voiceResting: () => null,
    voiceWhy: () => "rate limit",
    geminiVoice: gemini,
    Blob: class { constructor(parts, opts) { this.parts = parts; this.type = opts?.type; } },
    URL: { createObjectURL: (b) => { made++; ctx.lastBlob = b; return "blob:voice-" + made; } },
    fetch: async (url, init) => {
      fetched.push({ url, body: JSON.parse(init.body), auth: init.headers.Authorization });
      const r = replies.shift() || { ok: true, wav: wav(4) };
      if (r.ok) return { ok: true, status: 200, arrayBuffer: async () => r.wav.buffer.slice(r.wav.byteOffset, r.wav.byteOffset + r.wav.byteLength) };
      return { ok: false, status: r.status, text: async () => r.body || "", headers: { get: () => "" } };
    },
  };
  vm.runInNewContext(block + "\n;globalThis.out = { ORPHEUS_FOR, orpheusPieces, joinWavs, groqVoiceKind, groqVoice, groqVoiceResting, naturalVoice, quietWhy, setKey: (k) => { brainKeys.groq = k; } };", ctx);
  return { ...ctx.out, fetched, ctx, local };
}

test("long replies are split where Orpheus can read them whole", () => {
  const { orpheusPieces } = page();
  const text = "This is the first sentence. " + "word ".repeat(80).trim() + ". And a short end!";
  const pieces = orpheusPieces(text, 180);
  for (const p of pieces) assert.ok(p.length <= 180, `piece fits: ${p.length}`);
  assert.equal(pieces.join(" ").replace(/\s+/g, " "), text.replace(/\s+/g, " "), "no word is lost or changed");
  // (Arrays made in the sandbox compare as plain data.)
  const plain = (v) => JSON.parse(JSON.stringify(v));
  assert.deepEqual(plain(orpheusPieces("Hi. How are you?", 180)), ["Hi. How are you?"], "short sentences are packed together");
  assert.deepEqual(plain(orpheusPieces("   ", 180)), []);
  assert.deepEqual(plain(orpheusPieces("It costs 3.5 dollars. See izukinova.ai today.", 30)), ["It costs 3.5 dollars.", "See izukinova.ai today."], "a decimal or an address is never split at its dot");
});

test("the clips are joined into one WAV; mismatched or broken ones are refused", () => {
  const { joinWavs } = page();
  const joined = joinWavs([wav(3, 7), wav(2, 9)]);
  const w = new DataView(joined.buffer);
  assert.equal(String.fromCharCode(...joined.slice(0, 4)), "RIFF");
  assert.equal(w.getUint32(40, true), 10, "5 samples of 2 bytes");
  assert.equal(w.getUint32(24, true), 24000, "the rate is kept");
  assert.deepEqual([w.getInt16(44, true), w.getInt16(50, true)], [7, 9]);
  assert.equal(joinWavs([wav(2, 1, 24000), wav(2, 1, 22050)]), null, "different rates aren't glued together");
  assert.equal(joinWavs([new Uint8Array([1, 2, 3])]), null);
  assert.equal(new DataView(joinWavs([wav(3, 5, 24000, true)]).buffer).getUint32(40, true), 6, "a streamed WAV of unknown length still joins");
});

test("each character has an Orpheus voice", () => {
  const { ORPHEUS_FOR } = page();
  const people = [...html.matchAll(/\{ id: "([a-z]+)", name: "[^"]+", voice: "/g)].map((m) => m[1]);
  assert.ok(people.length >= 9);
  for (const id of people) assert.ok(ORPHEUS_FOR[id], `${id} has a voice`);
});

test("Orpheus speaks: one request a piece, the character's voice, a direction, one playable clip", async () => {
  const p = page({ person: "leo" });
  const url = await p.groqVoice("Hello there. " + "This is a longer bit that goes on. ".repeat(8));
  assert.match(url, /^blob:voice-/);
  assert.ok(p.fetched.length >= 2, "split into pieces");
  for (const f of p.fetched) {
    assert.equal(f.url, "https://api.groq.com/openai/v1/audio/speech");
    assert.equal(f.body.model, "canopylabs/orpheus-v1-english");
    assert.equal(f.body.voice, "troy");
    assert.equal(f.body.response_format, "wav");
    assert.match(f.body.input, /^\[friendly\] /);
    assert.ok(f.body.input.length <= 200);
    assert.equal(f.auth, "Bearer gsk_test_123456");
  }
  assert.equal(p.ctx.lastBlob.type, "audio/wav");
});

test("no key, or another language: no request at all", async () => {
  let p = page({ groqKey: "" });
  assert.equal(await p.groqVoice("Hi"), null);
  assert.equal(p.fetched.length, 0);
  p = page({ lang: "fr-FR" });
  assert.equal(await p.groqVoice("Bonjour"), null);
  assert.equal(p.fetched.length, 0, "Orpheus is English only");
});

test("a used-up allowance rests (a day's for hours), a refused key until it changes, the terms until accepted", async () => {
  let p = page({ replies: [{ ok: false, status: 429, body: "Rate limit reached for model on requests per day (RPD)" }] });
  assert.equal(await p.groqVoice("Hi"), null);
  assert.equal(p.groqVoiceResting().kind, "daily");
  assert.ok(p.groqVoiceResting().until - Date.now() > 5 * 3600000);
  assert.equal(await p.groqVoice("Hi again"), null);
  assert.equal(p.fetched.length, 1, "no second request while resting");

  p = page({ replies: [{ ok: false, status: 401, body: "Invalid API Key" }] });
  await p.groqVoice("Hi");
  assert.equal(p.groqVoiceResting().kind, "auth");
  p.setKey("gsk_other_key_999999");
  assert.equal(p.groqVoiceResting(), null, "a new key starts fresh");

  p = page({ replies: [{ ok: false, status: 400, body: "The model `canopylabs/orpheus-v1-english` requires terms acceptance" }] });
  await p.groqVoice("Hi");
  assert.equal(p.groqVoiceResting().kind, "terms");
  assert.match(p.quietWhy(), /terms accepted once/);
  assert.equal(p.groqVoiceKind(429, "tokens per minute"), "rate");
  assert.equal(p.groqVoiceKind(503, ""), "server");
});

test("Gemini first; Orpheus only when Gemini gives nothing", async () => {
  let p = page({ gemini: async () => "blob:gemini" });
  assert.equal(await p.naturalVoice("Hi"), "blob:gemini");
  assert.equal(p.fetched.length, 0, "Groq isn't asked when Gemini spoke");
  p = page({ gemini: async () => null });
  assert.match(await p.naturalVoice("Hi"), /^blob:voice-/);
  assert.equal(p.fetched.length, 1);
});

test("the page uses it, and a headset is told why it's quiet", () => {
  assert.match(html, /url: natural\(\) \? naturalVoice\(w\) : Promise\.resolve\(null\)/);
  assert.match(html, /function offerHear\([^)]*\) \{[\s\S]{0,400}toViews\("quiet", why === "muted" \? [^:]+: quietWhy\(\)\)/);
  assert.match(html, /offerHear\(null, t\.replace\([^)]*\), "muted"\)/, "a muted reply isn't reported as a failure");
  const p = page({ groqKey: "" });
  p.ctx.voiceResting = () => ({ kind: "rate" });
  assert.match(p.quietWhy(), /Add a free Groq key/);
});

(async () => {
  for (const [name, fn] of tests) {
    try { await fn(); passed++; } catch (e) { console.error(`FAIL ${name}\n  ${e.message}`); process.exitCode = 1; }
  }
  console.log(`groqvoice: ${passed}/${tests.length} passed`);
})();
