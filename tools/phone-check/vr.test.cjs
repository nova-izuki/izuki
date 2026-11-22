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

test("the new headset commands: photos, screen, style, sleep", () => {
  const cases = {
    files: ["show my photos", "can you go into my photos and folders", "open my pictures on my PC", "show me my downloads", "open my documents folder", "browse my videos", "show my files"],
    "files-hide": ["close my photos", "hide the files"],
    "photo-ask": ["what's in this photo", "describe this picture", "who's in this photo?"],
    screen: ["what's on my screen", "what is the answer on my screen", "explain my PC screen", "read the screen for me", "what does my screen say"],
    "look-style": ["change your look", "switch your colours", "new look"],
    space: ["change the room", "change the background"],
    sleep: ["stop listening", "go to sleep"],
  };
  for (const [kind, list] of Object.entries(cases)) for (const s of list) assert.equal(command(s)?.kind, kind, `"${s}" should be ${kind}`);
  assert.equal(command("show my photos").folder, "Pictures");
  assert.equal(command("open my downloads folder").folder, "Downloads");
  assert.equal(command("show my files").folder, "");
  assert.equal(command("show my PC")?.kind, "pc", "still the PC's screen");
});

test("what goes to the PC (with its screen showing), and calling Izuki by name", () => {
  const { onPc, named } = helpers;
  for (const s of ["open Spotify", "click the send button", "type hello world", "scroll down", "search for cats", "close this window", "play the next song", "what's the weather on my PC"]) assert.ok(onPc(s), `"${s}" is for the PC`);
  for (const s of ["what's the weather", "tell me a joke", "how are you", "who won the game", "explain photosynthesis"]) assert.ok(!onPc(s), `"${s}" stays a question`);
  assert.deepEqual(plain(named("hey nova what's the time", "Nova")), { called: true, rest: "what's the time" });
  assert.deepEqual(plain(named("Izuki, open spotify")), { called: true, rest: "open spotify" });
  assert.deepEqual(plain(named("ok so hey sophie can you help", "Sophie")), { called: true, rest: "ok so can you help" });
  assert.equal(named("what time is it").called, false);
  assert.equal(named("I like supernovas").called, false, "a word that only contains the name isn't a call");
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
function browser({ camera = false, see = async () => "{}", denied = false, pcs = [], playFails = false, xr = null, ua = "Mozilla/5.0 (X11; Linux x86_64; Quest 3) OculusBrowser/40.0", facing = "", pcAnswers = {} } = {}) {
  const local = new Map([["izuki.remotePcs", JSON.stringify(pcs)]]);
  const calls = [];
  let stopped = 0, opens = 0;
  const scene = {
    shown: false,
    states: [],
    orb(m) { this.states.push(m); }, heard() {}, said() {}, line() {}, level() {},
    showLook(v) { calls.push(["showLook", v]); }, pin(t) { calls.push(["pin", t]); }, comeHere() { calls.push(["come"]); },
    pcOpen: async () => { calls.push(["pcOpen"]); return ""; }, pcClose() { calls.push(["pcClose"]); }, pcShown() { return scene.shown; }, stop() { calls.push(["stop"]); },
    pcFrame: () => (scene.shown ? { b64: "UENTQ1JFRU4=", url: "data:image/jpeg;base64,UENTQ1JFRU4=", w: 1280, h: 720 } : null),
    lookShown: () => false,
    filesOpen: async (folder) => { calls.push(["filesOpen", folder]); return ""; }, filesClose() { calls.push(["filesClose"]); },
    nextTheme: () => "This is Aurora.", notice(t) { calls.push(["notice", t]); },
  };
  // The paired PC: each path answers from pcAnswers (JSON), and every request is kept.
  const fetch = async (url, init = {}) => {
    calls.push(["fetch", String(url), init.body ? JSON.parse(init.body) : null]);
    const path = String(url).replace(/^https?:\/\/[^/]+\//, "").split("?")[0];
    const body = pcAnswers[path];
    if (body === undefined) return { ok: false, status: 404, headers: { get: () => "application/json" }, json: async () => ({}), text: async () => "" };
    return { ok: true, status: 200, headers: { get: () => "application/json" }, json: async () => body, text: async () => JSON.stringify(body) };
  };
  const el = (tag) => tag === "video"
    ? { play: async () => { if (playFails) { const e = new Error("no play"); e.name = "NotReadableError"; throw e; } }, videoWidth: 640, videoHeight: 480, muted: false, playsInline: false, srcObject: null }
    : { width: 0, height: 0, getContext: () => ({ drawImage() {} }), toDataURL: () => "data:image/jpeg;base64,QUJD" };
  const window = {
    location: { search: "" },
    navigator: {
      userAgent: ua,
      mediaDevices: {
        enumerateDevices: async () => (camera ? [{ kind: "videoinput" }] : [{ kind: "audioinput" }]),
        getUserMedia: async () => { opens++; await new Promise((r) => setTimeout(r, 2)); if (denied) { const e = new Error("no"); e.name = "NotAllowedError"; throw e; } const track = { stop() { stopped++; }, getSettings: () => (facing ? { facingMode: facing } : {}) }; return { getTracks: () => [track], getVideoTracks: () => [track] }; },
      },
      xr,
    },
    IzukiCore: { see: async (prompt, b64, type, system) => { calls.push(["see", { prompt, b64, type, system }]); return see(); }, name: () => "Nova" },
  };
  const ctx = {
    window, document: { createElement: el, head: { appendChild() {} }, getElementById: () => null },
    localStorage: { getItem: (k) => (local.has(k) ? local.get(k) : null), setItem: (k, v) => local.set(k, String(v)), removeItem: (k) => local.delete(k) },
    setTimeout: (fn, ms) => setTimeout(fn, Math.min(ms, 5)), clearTimeout, URLSearchParams, console, Promise, Date, Math, JSON, fetch, AbortController,
  };
  vm.runInNewContext(src, ctx);
  const vr = window.IzukiVr;
  vr.active = true;
  vr.scene = scene;
  return { vr, calls, scene, stopped: () => stopped, opens: () => opens };
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

test("two quick looks share one camera: never two streams", async () => {
  const b = browser({ camera: true, see: async () => '{"say":"A mug."}' });
  const [r1, r2] = await Promise.all([b.vr.gate("what's this?"), b.vr.gate("what is that")]);
  assert.equal(r1.say, "A mug.");
  assert.equal(r2.say, "A mug.");
  assert.equal(b.opens(), 1, "the camera was opened once");
});

test("a second tap while the room loads doesn't start a second room", async () => {
  let asked = 0;
  const xr = { requestSession: async () => { asked++; return { end: async () => {} }; }, isSessionSupported: async () => true };
  const b = browser({ xr });
  b.vr.active = false;
  b.vr.scene = null;
  const first = b.vr.enter("immersive-vr").catch(() => "failed");
  const second = await b.vr.enter("immersive-vr");
  assert.equal(second, undefined);
  assert.equal(await first, "failed");
  assert.equal(asked, 1, "one session asked for");
});

test("on a PC (tethered headset or preview) the webcam is never used to look", async () => {
  const b = browser({ camera: true, ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/140.0" });
  const r = await b.vr.gate("what's this?");
  assert.match(r.say, /can't see through this headset's cameras/);
  assert.ok(!b.calls.some((c) => c[0] === "see"));
});

test("a camera facing the person is refused and closed", async () => {
  const b = browser({ camera: true, facing: "user" });
  const r = await b.vr.gate("what's this?");
  assert.match(r.say, /faces you, not the room/);
  assert.equal(b.stopped(), 1);
  assert.ok(!b.calls.some((c) => c[0] === "see"));
});

test("an answer that arrives after you left VR is dropped, and the orb is left alone", async () => {
  let b;
  b = browser({ camera: true, see: async () => { b.vr.active = false; return '{"say":"A lamp."}'; } });
  b.vr.orb("listening");
  const r = await b.vr.gate("what's this?");
  assert.match(r.say, /left VR/);
  assert.equal(b.calls.filter((c) => c[0] === "showLook").length, 1, "only the photo; no stale answer drawn");
  assert.deepEqual(plain(b.scene.states), ["listening", "thinking"], "the orb isn't touched after leaving");
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

test("what's this? with no camera: says so, or looks at the PC's screen when it's showing", async () => {
  const b = browser({ camera: false, see: async () => '{"say":"Your PC shows the Settings app.","marks":[{"x":100,"y":80,"label":"Display"}]}' });
  let r = await b.vr.gate("what's this?");
  assert.equal(r.done, true);
  assert.match(r.say, /can't see through this headset's cameras/);
  b.scene.shown = true;
  r = await b.vr.gate("what's this?");
  assert.equal(r.say, "Your PC shows the Settings app.");
  const seen = b.calls.find((c) => c[0] === "see")[1];
  assert.match(seen.system, /PC screen/);
  assert.equal(seen.b64, "UENTQ1JFRU4=", "the PC's picture, not a camera photo");
});

test("what's on my screen? reads the PC's screen (even with a camera), else says how", async () => {
  const b = browser({ camera: true, see: async () => '{"say":"It asks you to restart.","marks":[]}' });
  let r = await b.vr.gate("what's on my screen?");
  assert.match(r.say, /show my PC/, "no PC showing and no real screen asked about: it says how");
  b.scene.shown = true;
  r = await b.vr.gate("Hey Nova, what is the answer on my screen");
  assert.equal(r.say, "It asks you to restart.");
  const seen = b.calls.find((c) => c[0] === "see")[1];
  assert.match(seen.system, /PC screen/);
  assert.match(seen.system, /never give the answers/, "a graded test on the PC still gets coaching");
  assert.equal(b.opens(), 0, "the camera wasn't opened for the PC's screen");
});

test("photos and folders: the gallery opens your PC's folder; unpaired, it says how", async () => {
  let b = browser();
  let r = await b.vr.gate("can you go into my photos and folders");
  assert.match(r.say, /Pair this headset with your PC/);
  assert.match(r.say, /Quest's own photos/);
  b = browser({ pcs: [{ name: "My PC", link: "https://pc.example/", pass: "p" }] });
  r = await b.vr.gate("can you go into my photos and folders");
  assert.deepEqual(plain(b.calls.filter((c) => c[0] === "filesOpen")), [["filesOpen", "Pictures"]]);
  r = await b.vr.gate("open my downloads folder on my PC");
  assert.deepEqual(plain(b.calls.filter((c) => c[0] === "filesOpen").pop()), ["filesOpen", "Downloads"]);
  await b.vr.gate("show my files");
  assert.deepEqual(plain(b.calls.filter((c) => c[0] === "filesOpen").pop()), ["filesOpen", ""]);
  await b.vr.gate("close my photos");
  assert.ok(b.calls.some((c) => c[0] === "filesClose"));
});

test("with the PC on the big screen, something to do is done on the PC; questions stay here", async () => {
  const b = browser({ pcs: [{ name: "My PC", link: "https://pc.example/", pass: "p" }], pcAnswers: { talk: { text: "Opened Spotify." } } });
  b.scene.shown = true;
  const r = await b.vr.gate("open Spotify");
  assert.equal(r.say, "Opened Spotify.");
  const sent = b.calls.find((c) => c[0] === "fetch" && c[1].endsWith("/talk"));
  assert.deepEqual(plain(sent[2]), { text: "open Spotify" });
  const q = await b.vr.gate("what's the capital of Kenya?");
  assert.deepEqual(plain(q), { said: "what's the capital of Kenya?" }, "a question goes to the brain as usual");
  b.scene.shown = false;
  const off = await b.vr.gate("open Spotify");
  assert.deepEqual(plain(off), { said: "open Spotify" }, "PC not showing: the usual way");
});

test("\"Hey Nova\" in the room: only what's said to Izuki is answered", async () => {
  const b = browser();
  b.vr.handsFree(true);
  assert.equal(await b.vr.gate("so what do you want for dinner"), null, "talk in the room isn't for Izuki");
  assert.deepEqual(plain(await b.vr.gate("Hey Nova, what's the time?")), { said: "what's the time?" });
  assert.equal((await b.vr.gate("hey nova")).say, "Mhm?");
  b.vr.line("izuki", "It's five o'clock.");
  assert.deepEqual(plain(await b.vr.gate("and in Tokyo?")), { said: "and in Tokyo?" }, "a follow-up right after needs no name");
  b.vr.handsFree(false);
  assert.deepEqual(plain(await b.vr.gate("what's the weather")), { said: "what's the weather" }, "after a tap (not hands-free) anything counts");
});

test("\"stop listening\" works hands-free even without the name", async () => {
  const b = browser();
  b.vr.handsFree(true);
  const r = await b.vr.gate("stop listening");
  assert.ok(r && r.done, "not ignored as room talk");
  assert.match(r.say, /stopped listening/);
});

test("change your look; stop listening", async () => {
  const b = browser();
  assert.equal((await b.vr.gate("change your look")).say, "This is Aurora.");
  assert.equal((await b.vr.gate("change the background")).say, "This is Aurora.");
  assert.match((await b.vr.gate("stop listening")).say, /stopped listening/);
});

test("what's this? with a camera: one photo to the person's own AI, circles on it, the orb given back", async () => {
  const b = browser({ camera: true, see: async () => '```json\n{"say":"A kettle. The switch is at the back.","marks":[{"x":800,"y":300,"label":"switch"}]}\n```' });
  b.vr.orb("listening");
  const r = await b.vr.gate("what's this?");
  assert.equal(r.done, true);
  assert.equal(r.say, "A kettle. The switch is at the back.");
  const sees = b.calls.filter((c) => c[0] === "see");
  assert.equal(sees.length, 1, "exactly one photo goes to the AI");
  const seen = sees[0][1];
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
  // Line endings aside (a Windows checkout may turn them into CRLF).
  const lf = (s) => s.replace(/\r\n/g, "\n");
  assert.equal(lf(read("docs/app/vr-scene.js")), lf(built));
  assert.match(built, /Permission is hereby granted, free of charge/, "three.js's MIT notice is in the bundle");
});

(async () => {
  for (const [name, fn] of tests) {
    try { await fn(); passed++; } catch (e) { console.error(`FAIL ${name}\n  ${e.message}`); process.exitCode = 1; }
  }
  console.log(`vr: ${passed}/${tests.length} passed`);
})();
