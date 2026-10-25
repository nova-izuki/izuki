// Tests the real voice-matching rules in src/lib/speakerMath.ts — the ones
// that decide whether "Hey Nova" came from an enrolled person or from the TV,
// a podcast or someone else in the room.
//
// The module is transpiled and run as-is, so this is the shipped source. It
// needs no model and no microphone: the maths is pure, so these run in
// milliseconds. The model itself is checked separately, against the model
// author's own public recordings, by tools/speaker-model-check.mjs.
const fs = require("fs");
const path = require("path");
const assert = require("assert");
const ts = require("typescript");

const file = path.join(__dirname, "..", "src", "lib", "speakerMath.ts");
const js = ts.transpileModule(fs.readFileSync(file, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const mod = { exports: {} };
new Function("module", "exports", "require", js)(mod, mod.exports, require);
const { unitVector, similarity, matchingSpeaker, parseSpeakers, speakerAudio, SPEAKER_THRESHOLD } = mod.exports;

let failed = 0;
const check = (what, fn) => {
  try {
    fn();
    console.log(`  ok   ${what}`);
  } catch (e) {
    failed++;
    console.log(`  FAIL ${what}\n       ${e.message}`);
  }
};

/** A repeatable 512-value voice template, "near" another when close is set. */
function template(seed, close = null, drift = 0) {
  const v = new Float32Array(512);
  let x = seed * 2654435761;
  for (let i = 0; i < 512; i++) {
    x = (x * 1103515245 + 12345) & 0x7fffffff;
    v[i] = close ? close[i] + ((x / 0x7fffffff) - 0.5) * drift : (x / 0x7fffffff) - 0.5;
  }
  return unitVector(v);
}

console.log("voice match");

check("a template is a unit vector, so similarity is a plain cosine", () => {
  const a = template(1);
  assert.ok(Math.abs(Math.hypot(...a) - 1) < 1e-6, "not normalised");
  assert.ok(Math.abs(similarity(a, a) - 1) < 1e-6, "a voice must match itself");
});

check("unrelated voices score far below the threshold", () => {
  const a = template(2);
  const b = template(99);
  assert.ok(similarity(a, b) < 0.3, `two different voices scored ${similarity(a, b)}`);
});

check("silence or a dead mic is refused, never turned into a template", () => {
  assert.throws(() => unitVector(new Float32Array(512)), /No clear voice/);
  assert.throws(() => unitVector(new Float32Array(400)), /Invalid voice template/);
  assert.throws(() => unitVector(Float32Array.from({ length: 512 }, () => NaN)), /Invalid voice template/);
});

check("the enrolled person wakes Izuki", () => {
  const me = template(7);
  const profile = { id: "a", name: "Me", samples: [me, template(8, me, 0.02), template(9, me, 0.02)] };
  const again = template(10, me, 0.02);
  assert.equal(matchingSpeaker(again, [profile]), "a");
});

check("a different person does not wake it", () => {
  const me = template(7);
  const profile = { id: "a", name: "Me", samples: [me, template(8, me, 0.02), template(9, me, 0.02)] };
  assert.equal(matchingSpeaker(template(1234), [profile]), null);
});

check("one lucky take is not enough — two of the three must agree", () => {
  const me = template(11);
  // Only the first sample is anywhere near; the other two are other people.
  const profile = { id: "a", name: "Me", samples: [me, template(500), template(600)] };
  assert.equal(matchingSpeaker(template(12, me, 0.02), [profile]), null, "a single matching take let a voice in");
});

check("several people can each wake it, and are told apart", () => {
  const me = template(21);
  const them = template(31);
  const mine = { id: "me", name: "Me", samples: [me, template(22, me, 0.02), template(23, me, 0.02)] };
  const theirs = { id: "them", name: "Solomon", samples: [them, template(32, them, 0.02), template(33, them, 0.02)] };
  assert.equal(matchingSpeaker(template(24, me, 0.02), [mine, theirs]), "me");
  assert.equal(matchingSpeaker(template(34, them, 0.02), [mine, theirs]), "them");
  assert.equal(matchingSpeaker(template(999), [mine, theirs]), null);
});

check("nobody enrolled means nobody matches", () => {
  assert.equal(matchingSpeaker(template(5), []), null);
});

check("saved profiles that were tampered with are refused, not trusted", () => {
  assert.deepEqual(parseSpeakers(null), { enabled: false, profiles: [] });
  const ok = { enabled: true, profiles: [{ id: "a", name: "Me", samples: [template(1), template(2), template(3)] }] };
  assert.equal(parseSpeakers(JSON.stringify(ok)).profiles.length, 1);
  // Two takes instead of three, a blank name, duplicate ids, a short vector.
  const bad = [
    { enabled: true, profiles: [{ id: "a", name: "Me", samples: [template(1), template(2)] }] },
    { enabled: true, profiles: [{ id: "a", name: "  ", samples: [template(1), template(2), template(3)] }] },
    { enabled: true, profiles: [
      { id: "a", name: "Me", samples: [template(1), template(2), template(3)] },
      { id: "a", name: "Also me", samples: [template(4), template(5), template(6)] },
    ] },
    { enabled: true, profiles: [{ id: "a", name: "Me", samples: [[1, 2, 3], template(2), template(3)] }] },
    { enabled: "yes", profiles: [] },
  ];
  for (const b of bad) assert.throws(() => parseSpeakers(JSON.stringify(b)), `accepted a damaged profile: ${JSON.stringify(b).slice(0, 60)}`);
});

check("the threshold is strict enough to be worth having", () => {
  assert.ok(SPEAKER_THRESHOLD >= 0.8, `threshold ${SPEAKER_THRESHOLD} is too loose to keep other voices out`);
});

check("a quiet room gives nothing to match against", () => {
  assert.throws(() => speakerAudio(new Float32Array(32_000)), /Not enough clear speech/);
  // A click, then silence: still not speech.
  const blip = new Float32Array(32_000);
  for (let i = 0; i < 200; i++) blip[i] = 0.5;
  assert.throws(() => speakerAudio(blip), /Not enough clear speech/);
});

check("real speech is trimmed to the words, with a little room either side", () => {
  const spoken = new Float32Array(48_000);
  // 1.5 s of "speech" in the middle, loud enough to count.
  for (let i = 16_000; i < 40_000; i++) spoken[i] = Math.sin(i / 7) * 0.2;
  const trimmed = speakerAudio(spoken);
  assert.ok(trimmed.length < spoken.length, "nothing was trimmed");
  assert.ok(trimmed.length >= 24_000, `trimmed too much: ${trimmed.length}`);
});

console.log(failed ? `\n${failed} failed` : "\nall passed");
process.exit(failed ? 1 : 0);
