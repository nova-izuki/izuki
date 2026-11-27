// The phone's voice match rules (docs/app/voicematch.js): the same maths as
// the PC's speakerMath.ts — two of three takes must agree above 0.85, bad
// templates are refused, and only real speech is judged.
const assert = require("assert/strict");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const window = {};
const store = new Map();
const localStorage = { getItem: (k) => (store.has(k) ? store.get(k) : null), setItem: (k, v) => store.set(k, String(v)) };
vm.runInNewContext(fs.readFileSync(path.resolve(__dirname, "../../docs/app/voicematch.js"), "utf8"), { window, localStorage, Math, Array, Set, Number, JSON, Error, Float32Array });
const V = window.IzukiVoiceMatch;
const T = V._test;

// Voices as directions in 512-D space: a person's takes cluster, others don't.
const axis = (i) => { const v = new Array(512).fill(0); v[i] = 1; return v; };
const near = (base, wobble, at) => { const v = base.slice(); v[at] += wobble; return T.unitVector(v); };
const me = axis(0);
const profile = { id: "a", name: "Solomon", samples: [near(me, 0.1, 5), near(me, 0.15, 6), near(me, 0.2, 7)] };

assert.equal(T.matching(T.unitVector(me), [profile])?.name, "Solomon", "the enrolled voice matches");
assert.equal(T.matching(T.unitVector(axis(1)), [profile]), null, "another voice doesn't");
// One take close to a stranger isn't enough: two of three must agree.
const lucky = { id: "b", name: "Lucky", samples: [T.unitVector(axis(2)), T.unitVector(axis(3)), T.unitVector(axis(4))] };
assert.equal(T.matching(T.unitVector(axis(2)), [lucky]), null, "one matching take is not a match");
assert.ok(T.similarity(T.unitVector(me), T.unitVector(me)) > 0.999);
assert.equal(T.similarity([1], T.unitVector(me)), -1, "a malformed template never matches");

assert.throws(() => T.unitVector(new Array(511).fill(1)), /Invalid voice template/);
assert.throws(() => T.unitVector(new Array(512).fill(0)), /No clear voice/);
assert.throws(() => T.unitVector([...new Array(511).fill(1), NaN]), /Invalid voice template/);

// Stored profiles are checked when read; the PC's format is the same.
const saved = JSON.stringify({ enabled: true, profiles: [profile] });
assert.equal(T.parse(saved).profiles[0].name, "Solomon");
assert.throws(() => T.parse(JSON.stringify({ enabled: true, profiles: [{ ...profile, samples: profile.samples.slice(0, 2) }] })), /Invalid voice profile/);
assert.throws(() => T.parse(JSON.stringify({ enabled: true, profiles: [profile, profile] })), /Duplicate/);
assert.equal(T.parse(null).enabled, false);

// Only speech is judged: silence is refused, and quiet margins are trimmed.
assert.throws(() => T.speechOnly(new Float32Array(32000)), /Not enough clear speech/);
const clip = new Float32Array(48000);
for (let i = 16000; i < 32000; i++) clip[i] = Math.sin(i / 7) * 0.2;
const trimmed = T.speechOnly(clip);
assert.ok(trimmed.length < clip.length && trimmed.length >= 16000, "quiet margins are trimmed, the speech kept");

// Off (or nobody enrolled): nothing is checked and nothing is blocked.
(async () => {
  const html = fs.readFileSync(path.resolve(__dirname, "../../docs/app/index.html"), "utf8");
  const wakeStart = html.indexOf("  async function startWake(");
  const wakeEnd = html.indexOf("  async function receiveWake(", wakeStart);
  assert.ok(wakeStart > 0 && wakeEnd > wakeStart);
  const heard = [], opened = [], checked = [];
  const wakeContext = vm.createContext({
    window: { IzukiVoiceMatch: { read: () => ({ enabled: true }), check: async (audio) => { checked.push(audio); return { ok: true }; } } },
    talking: false, wakeTurn: false, lastWakeText: "", lastWakeAt: 0,
    setStatus() {}, ready: () => true, openLive: () => opened.push(true), ask: (said) => heard.push(said), Date,
  });
  vm.runInContext(html.slice(wakeStart, wakeEnd) + "\nglobalThis.wake = startWake;", wakeContext);
  await wakeContext.wake("Hey Nova open maps", { voice: true, audio: "" });
  assert.deepEqual(heard, [], "an inline command without wake audio never bypasses voice matching");
  assert.equal(opened.length, 1, "record the command again for verification");
  assert.equal(wakeContext.wakeTurn, true);
  wakeContext.wakeTurn = false;
  await wakeContext.wake("Hey Nova open calendar", { voice: true, audio: "wav" });
  assert.equal(checked.length, 1);
  assert.deepEqual(heard, ["open calendar"], "a verified spoken wake can carry an inline command");
  // Execute the actual ask() transcription branch. A provider can return
  // partial words after its stream is aborted; they must not become actions.
  const askStart = html.indexOf("  async function ask(said, audio)");
  const askEnd = html.indexOf("  function replyTools()", askStart);
  assert.ok(askStart > 0 && askEnd > askStart);
  for (const reason of ["timeout", "cancelled"]) {
    let listening = 0;
    const notices = [];
    const context = vm.createContext({
      window: {}, attached: [], busy: false, wakeTurn: false, talking: true, turnCtx: null,
      ready: () => true, canHear: () => true, beginRequest() {}, finishRequest() {},
      brainKeys: { groq: true }, requestEnd: "", refreshSend() {}, setOrb() {}, setStatus() {}, stage() {},
      bubble: (_, words) => notices.push(words), endedSay: () => "Request timed out",
      groqHear: async () => { context.requestEnd = reason; return "delete this late transcript"; },
      listen: () => listening++, Error,
    });
    vm.runInContext(html.slice(askStart, askEnd) + "\nglobalThis.runAsk = ask;", context);
    await context.runAsk("", { type: "audio/wav", b64: "test" });
    assert.equal(context.busy, false, "the transcription request is cleaned up");
    assert.equal(listening, reason === "timeout" ? 1 : 0, "timeout resumes the call; Stop keeps it silent");
    assert.deepEqual(notices, reason === "timeout" ? ["Request timed out"] : [], "a partial timeout is explained without using late words");
  }
  assert.equal((await V.check({ b64: "" })).off, true);
  store.set("izuki.wake-speakers.v1", JSON.stringify({ enabled: false, profiles: [profile] }));
  assert.equal((await V.check({ b64: "" })).off, true);
  assert.equal(V.setEnabled(true).enabled, true);
  assert.equal(V.forget("a").enabled, false, "forgetting the last voice turns voice match off");
  console.log("Voice match: two-of-three rule, bad templates, speech trimming and off-by-default pass.");
})().catch((e) => { console.error(e); process.exitCode = 1; });
