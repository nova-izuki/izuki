// Izuki in VR (docs/app/vr.js + vr-scene.js), checked without a headset:
// which requests are headset commands and which go on to the brain, what a
// "look" reply turns into (never raw JSON out loud), text fitting on the 3D
// cards, when the orb drifts after you, PC clicks, the app's hooks into the
// room, and that the 3D bundle really is built from its source.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "../..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const src = read("docs/app/vr.js");

let passed = 0;
// Objects made inside the sandbox have its own prototypes: compare them as plain data.
const plain = (v) => JSON.parse(JSON.stringify(v));
const tests = [];
const test = (name, fn) => tests.push([name, fn]);

// The pure helpers (vr.js hands them to module.exports when there's a module).
const helpers = (() => { const ctx = { module: { exports: {} } }; vm.runInNewContext(src, ctx); return ctx.module.exports; })();
const { command, parseLook, wrapLines, fitLines, followTarget, pcPoint, LOOK_SYSTEM } = helpers;

test("headset commands are recognised, whole and polite", () => {
  const cases = {
    look: ["what is this", "What's this?", "what's that thing", "what am I looking at", "Hey Nova, what am I looking at?", "what am i holding",
      "look at this", "take a look at this and tell me what's wrong", "can you see this", "what kind of plant is this", "what brand of shoe is that",
      "what does this say", "how do I fix this tap?", "how do i use this", "read this for me", "translate this", "is this ripe", "help me with this",
      "what do you see", "describe what you see", "what's in front of me", "look", "Izuki, could you look"],
    pc: ["show my PC", "Show me my computer", "open my laptop screen", "bring up my PC please", "my PC's screen", "let me see my computer"],
    "pc-hide": ["close my PC", "hide the computer screen", "put away my PC"],
    pin: ["pin that", "keep this", "pin it here", "save that for later", "Pin the answer on the wall"],
    come: ["come here", "come back", "Nova, come closer", "follow me", "where are you?"],
    exit: ["exit VR", "leave mixed reality", "close the headset view", "quit virtual reality"],
  };
  for (const [kind, list] of Object.entries(cases)) for (const s of list) assert.equal(command(s)?.kind, kind, `"${s}" should be ${kind}`);
});

test("everything else goes on to the brain as usual", () => {
  for (const s of ["what is this week's weather", "what's that song called", "open my PC's downloads", "on my PC open Spotify", "show my PC's battery",
    "what is the capital of France", "pin my tabs on the PC", "come here tomorrow at 5", "remind me to look at the oven", "look up the news",
    "what does my calendar say", "how do I fix my wifi", "explain quantum physics", "close Spotify on my PC", "", "   "]) {
    assert.equal(command(s), null, `"${s}" is not a headset command`);
  }
});

test("a look reply: JSON, fenced, thinking, prose and junk all become plain speech", () => {
  let r = parseLook('{"say":"That is a kettle.","marks":[{"x":500,"y":420,"label":"power switch"}]}');
  assert.equal(r.say, "That is a kettle.");
  assert.deepEqual(plain(r.marks), [{ x: 500, y: 420, label: "power switch" }]);
  r = parseLook('<think>hmm, a plant</think>\n```json\n{"say": "A basil plant. It needs water.", "marks": []}\n```');
  assert.equal(r.say, "A basil plant. It needs water.");
  assert.equal(r.marks.length, 0);
  r = parseLook("It looks like a bicycle chain that came off the gear.");
  assert.equal(r.say, "It looks like a bicycle chain that came off the gear.");
  r = parseLook('Sure! {"answer":"A router.","points":[{"x":-40,"y":1400,"label":"reset   button"},{"x":"a","y":3},{"x":10,"y":20},{"x":11,"y":21},{"x":12,"y":22},{"x":13,"y":23}]}');
  assert.equal(r.say, "A router.");
  assert.equal(r.marks.length, 4, "at most four marks, bad ones dropped");
  assert.deepEqual(plain(r.marks[0]), { x: 0, y: 1000, label: "reset button" }, "marks clamp into the picture");
  for (const junk of ["", "{}", '{"marks":[]}', "```json\n{broken", "{ \"say\": 4 }"]) {
    const j = parseLook(junk);
    assert.ok(j.say.length > 5, `"${junk}" still gets something to say`);
    assert.ok(!/[{}`]/.test(j.say), `"${junk}" never speaks code: ${j.say}`);
  }
});

test("the look instructions coach on tests and never invent", () => {
  assert.match(LOOK_SYSTEM, /quiz, test or exam/);
  assert.match(LOOK_SYSTEM, /never give the answers/);
  assert.match(LOOK_SYSTEM, /Never invent/);
  assert.match(LOOK_SYSTEM, /passwords or card numbers/);
});

test("card text wraps inside the card and shrinks before it cuts", () => {
  const measure = (s) => s.length * 10;
  const lines = wrapLines("the quick brown fox jumps over the lazy dog again and again", 100, measure);
  assert.ok(lines.length > 1);
  for (const l of lines) assert.ok(measure(l) <= 100, `"${l}" fits`);
  const long = wrapLines("supercalifragilisticexpialidocious", 100, measure);
  for (const l of long) assert.ok(measure(l) <= 100, "a long word breaks");
  assert.equal(long.join(""), "supercalifragilisticexpialidocious");
  const m2 = (s, size) => s.length * size * 0.5;
  const short = fitLines("Hello there", 400, 3, 40, 20, m2);
  assert.equal(short.size, 40, "short text keeps the big size");
  const story = "word ".repeat(200).trim();
  const fit = fitLines(story, 400, 3, 40, 20, m2);
  assert.equal(fit.lines.length, 3);
  assert.equal(fit.size, 20);
  assert.ok(fit.cut && fit.lines[2].endsWith("…"));
  for (const l of fit.lines) assert.ok(m2(l, 20) <= 400, "the cut line still fits");
});

test("the orb stays while you look at it and drifts after you turn or walk away", () => {
  const head = { x: 0, y: 1.6, z: 0, yaw: 0 };
  assert.equal(followTarget(head, { x: 0, y: 1.5, z: -0.75 }), null, "right in front: stays");
  assert.equal(followTarget(head, { x: 0.3, y: 1.5, z: -0.8 }), null, "a little to the side: stays (no swimming)");
  const turned = followTarget({ ...head, yaw: Math.PI / 2 }, { x: 0, y: 1.5, z: -0.75 });
  assert.ok(turned, "turned 90°: it comes round");
  assert.ok(Math.abs(turned.x - -0.75) < 1e-6 && Math.abs(turned.z) < 1e-6, "…to in front of you again");
  assert.ok(followTarget({ ...head, z: -3 }, { x: 0, y: 1.5, z: 0.5 }), "walked away: it follows");
  assert.ok(followTarget(head, { x: 0, y: 1.5, z: -0.1 }), "too close: it backs off");
});

test("a point on the PC panel becomes the same point on the PC", () => {
  assert.deepEqual(plain(pcPoint(0, 1)), { nx: 0, ny: 0 }, "top-left");
  assert.deepEqual(plain(pcPoint(1, 0)), { nx: 1, ny: 1 }, "bottom-right");
  assert.deepEqual(plain(pcPoint(0.25, 0.75)), { nx: 0.25, ny: 0.25 });
  assert.deepEqual(plain(pcPoint(-1, 2)), { nx: 0, ny: 0 }, "clamped");
});

// ---- the browser side, with a pretend headset -------------------------------
function browser({ camera = false, see = async () => "{}", denied = false, pcs = [], playFails = false, xr = null } = {}) {
  const local = new Map([["izuki.remotePcs", JSON.stringify(pcs)]]);
  const calls = [];
  let stopped = 0;
  const scene = {
    shown: false,
    states: [],
    orb(m) { this.states.push(m); }, heard() {}, said() {}, line() {}, level() {},
    showLook(v) { calls.push(["showLook", v]); }, pin(t) { calls.push(["pin", t]); }, comeHere() { calls.push(["come"]); },
    pcOpen: async () => { calls.push(["pcOpen"]); return ""; }, pcClose() { calls.push(["pcClose"]); }, pcShown() { return scene.shown; }, stop() { calls.push(["stop"]); },
  };
  const el = (tag) => tag === "video"
    ? { play: async () => { if (playFails) { const e = new Error("no play"); e.name = "NotReadableError"; throw e; } }, videoWidth: 640, videoHeight: 480, muted: false, playsInline: false, srcObject: null }
    : { width: 0, height: 0, getContext: () => ({ drawImage() {} }), toDataURL: () => "data:image/jpeg;base64,QUJD" };
  const window = {
    location: { search: "" },
    navigator: {
      userAgent: "Mozilla/5.0 (X11; Linux x86_64; Quest 3) OculusBrowser/40.0",
      mediaDevices: {
        enumerateDevices: async () => (camera ? [{ kind: "videoinput" }] : [{ kind: "audioinput" }]),
        getUserMedia: async () => { if (denied) { const e = new Error("no"); e.name = "NotAllowedError"; throw e; } return { getTracks: () => [{ stop() { stopped++; } }] }; },
      },
      xr,
    },
    IzukiCore: { see: async (prompt, b64, type, system) => { calls.push(["see", { prompt, b64, type, system }]); return see(); } },
  };
  const ctx = {
    window, document: { createElement: el, head: { appendChild() {} }, getElementById: () => null },
    localStorage: { getItem: (k) => (local.has(k) ? local.get(k) : null), setItem: (k, v) => local.set(k, String(v)), removeItem: (k) => local.delete(k) },
    setTimeout: (fn, ms) => setTimeout(fn, Math.min(ms, 5)), clearTimeout, URLSearchParams, console, Promise, Date, Math, JSON,
  };
  vm.runInNewContext(src, ctx);
  const vr = window.IzukiVr;
  vr.active = true;
  vr.scene = scene;
  return { vr, calls, scene, stopped: () => stopped };
}

test("a camera that won't play is let go of at once", async () => {
  const b = browser({ camera: true, playFails: true });
  const r = await b.vr.gate("what's this?");
  assert.match(r.say, /camera isn't free/);
  assert.equal(b.stopped(), 1, "its track was stopped");
  assert.ok(!b.calls.some((c) => c[0] === "see"), "nothing was sent");
});

test("leaving VR while the photo is taken: nothing is sent", async () => {
  const b = browser({ camera: true, see: async () => '{"say":"x"}' });
  const pending = b.vr.gate("what's this?");
  b.vr.active = false;
  const r = await pending;
  assert.match(r.say, /left VR/);
  assert.ok(!b.calls.some((c) => c[0] === "see"), "the photo never went to the AI");
});

test("if the 3D room can't load, the headset session is ended, not left empty", async () => {
  let ended = 0;
  const xr = { requestSession: async () => ({ end: async () => { ended++; } }), isSessionSupported: async () => true };
  const b = browser({ xr });
  b.vr.active = false;
  b.vr.scene = null;
  // In this sandbox import() fails, just as a failed download would.
  await assert.rejects(() => b.vr.enter("immersive-vr"));
  await new Promise((r) => setTimeout(r, 20));
  assert.equal(ended, 1);
  assert.equal(b.vr.active, false);
});

test("pin keeps the last real answer (not a thinking line)", async () => {
  const { vr, calls } = browser();
  let r = await vr.gate("pin that");
  assert.match(r.say, /nothing to pin/i);
  vr.line("izuki", "Paris is the capital of France.");
  vr.line("izuki", "Asking Gemini…", { thinking: true });
  r = await vr.gate("pin that");
  assert.equal(r.done, true);
  assert.deepEqual(plain(calls.find((c) => c[0] === "pin")), ["pin", "Paris is the capital of France."]);
});

test("show my PC opens the screen; anything else carries on to the brain", async () => {
  const { vr, calls } = browser();
  const r = await vr.gate("show my PC");
  assert.equal(r.done, true);
  assert.ok(calls.some((c) => c[0] === "pcOpen"));
  const on = await vr.gate("on my PC open Spotify");
  assert.deepEqual(plain(on), { said: "on my PC open Spotify" }, "a PC job is not swallowed");
});

test("what's this? with no camera: says so, or lets the PC answer when it's showing", async () => {
  const b = browser({ camera: false });
  let r = await b.vr.gate("what's this?");
  assert.equal(r.done, true);
  assert.match(r.say, /can't see through this headset's cameras/);
  b.scene.shown = true;
  r = await b.vr.gate("what's this?");
  assert.deepEqual(plain(r), { said: "what's this?" });
});

test("what's this? with a camera: one photo to the person's own AI, circles on it, the orb given back", async () => {
  const b = browser({ camera: true, see: async () => '```json\n{"say":"A kettle. The switch is at the back.","marks":[{"x":800,"y":300,"label":"switch"}]}\n```' });
  b.vr.orb("listening");
  const r = await b.vr.gate("what's this?");
  assert.equal(r.done, true);
  assert.equal(r.say, "A kettle. The switch is at the back.");
  const seen = b.calls.find((c) => c[0] === "see")[1];
  assert.equal(seen.b64, "QUJD");
  assert.equal(seen.type, "image/jpeg");
  assert.match(seen.system, /VR headset/);
  assert.match(seen.prompt, /what's this\?/);
  const shows = b.calls.filter((c) => c[0] === "showLook");
  assert.equal(shows.length, 2, "the photo shows at once, then with the answer");
  assert.deepEqual(plain(shows[1][1].marks), [{ x: 800, y: 300, label: "switch" }]);
  assert.deepEqual(plain(b.scene.states), ["listening", "thinking", "listening"], "the orb goes back to what the app had");
});

test("a refused camera gets plain words, not an error dump", async () => {
  const b = browser({ camera: true, denied: true });
  const r = await b.vr.gate("what am I looking at");
  assert.match(r.say, /need your yes to use the headset camera/);
});

// ---- the app's side ----------------------------------------------------------
test("the app tells the VR room everything it tells the TV", () => {
  const html = read("docs/app/index.html");
  assert.match(html, /<script src="vr\.js"><\/script>/);
  assert.match(html, /for \(const v of \[window\.IzukiTv, window\.IzukiVr\]\)/);
  for (const hook of ['toViews("orb"', 'toViews("heard"', 'toViews("said"', 'toViews("line"', 'toViews("level"']) assert.ok(html.includes(hook), hook);
  assert.ok(!/window\.IzukiTv\?\.(orb|heard|said|line)\?\./.test(html), "no hook is TV-only any more");
  assert.match(html, /\[window\.IzukiTv, window\.IzukiVr\]\.find\(\(v\) => v\?\.active && v\.gate\)/, "headset commands go first, like the TV's");
  assert.match(html, /see: \(prompt, b64, type = "image\/jpeg", system\)/);
  assert.match(html, /tap: \(\) => \$\("live-orb"\)\.click\(\)/);
  assert.match(html, /preferRecorder: /);
  assert.match(html, /window\.IzukiVr\?\.homeCard\?\.\(w\)/);
});

test("the small part works offline; the 3D bundle only loads in VR", () => {
  const sw = read("docs/app/sw.js");
  assert.match(sw, /"vr\.js"/);
  assert.ok(!sw.includes("vr-scene.js"), "the big 3D file isn't pushed to every phone");
  assert.match(src, /import\("\.\/vr-scene\.js"\)/);
});

test("izukinova.ai/vr opens the VR card", () => {
  const page = read("docs/vr/index.html");
  assert.match(page, /\.\.\/app\/\?vr/);
  assert.match(page, /noindex/);
});

test("vr-scene.js is built from vr-scene.src.js (run node tools/build-vr.cjs)", () => {
  const { options } = require(path.join(root, "tools/build-vr.cjs"));
  const built = require("esbuild").buildSync({ ...options(), write: false, logLevel: "silent" }).outputFiles[0].text;
  assert.equal(read("docs/app/vr-scene.js"), built);
  assert.match(built, /Permission is hereby granted, free of charge/, "three.js's MIT notice is in the bundle");
});

(async () => {
  for (const [name, fn] of tests) {
    try { await fn(); passed++; } catch (e) { console.error(`FAIL ${name}\n  ${e.message}`); process.exitCode = 1; }
  }
  console.log(`vr: ${passed}/${tests.length} passed`);
})();
