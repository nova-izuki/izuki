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
const { command, parseLook, parseHolo, HOLO_SYSTEM, wrapLines, fitLines, followTarget, pcPoint, LOOK_SYSTEM } = helpers;

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
    help: ["What can you do?", "what can I say", "Hey Nova, what can you do here?", "how does this work", "help", "show me what you can do"],
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
  // Shouted or said fast, speech-to-text mishears the name: right after a greeting it still counts.
  assert.deepEqual(plain(named("Hey Noah, what's the time?")), { called: true, rest: "what's the time?" });
  assert.equal(named("Hey Nava!").called, true);
  assert.equal(named("hey isuki open spotify").rest, "open spotify");
  assert.equal(named("Hey, Nover.").called, true);
  assert.equal(named("Noah is coming over").called, false, "a name on its own isn't a call");
  assert.equal(named("hey novak").called, false);
});

test("everything else goes on to the brain as usual", () => {
  for (const s of ["what is this week's weather", "what's that song called", "open my PC's downloads", "on my PC open Spotify", "show my PC's battery",
    "what is the capital of France", "pin my tabs on the PC", "come here tomorrow at 5", "remind me to look at the oven", "tell me the news",
    "what does my calendar say", "how do I fix my wifi", "what can you do about my wifi", "help me write an email", "explain quantum physics", "close Spotify on my PC", "", "   "]) {
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
function browser({ camera = false, see = async () => "{}", denied = false, pcs = [], playFails = false, xr = null, ua = "Mozilla/5.0 (X11; Linux x86_64; Quest 3) OculusBrowser/40.0", facing = "", pcAnswers = {}, bitmap = async () => {}, think = async () => "{}" } = {}) {
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
    lookOpen: false,
    lookShown: () => scene.lookOpen,
    filesOpen: async (folder) => { calls.push(["filesOpen", folder]); return ""; }, filesClose() { calls.push(["filesClose"]); },
    nextTheme: () => "This is Aurora.", notice(t) { calls.push(["notice", t]); },
    holo: false,
    webSearch: async (q) => { calls.push(["webSearch", q]); return "Here's what Google found."; }, webClose() { calls.push(["webClose"]); },
    holoBuilding(t) { calls.push(["holoBuilding", t]); }, holoShow(spec) { calls.push(["holoShow", spec]); scene.holo = true; },
    holoFocus(f, i) { calls.push(["holoFocus", f, i]); }, holoClose() { calls.push(["holoClose"]); scene.holo = false; }, holoShown() { return scene.holo; },
  };
  // The paired PC: each path answers from pcAnswers (JSON), and every request is kept.
  const fetch = async (url, init = {}) => {
    calls.push(["fetch", String(url), init.body ? JSON.parse(init.body) : null]);
    const path = String(url).replace(/^https?:\/\/[^/]+\//, "").split("?")[0];
    const body = pcAnswers[path];
    if (body === undefined) return { ok: false, status: 404, headers: { get: () => "application/json" }, json: async () => ({}), text: async () => "" };
    return { ok: true, status: 200, headers: { get: () => "application/json" }, json: async () => body, text: async () => JSON.stringify(body), blob: async () => ({ size: 3 }) };
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
    IzukiCore: {
      see: async (prompt, b64, type, system) => { calls.push(["see", { prompt, b64, type, system }]); return see(); }, name: () => "Nova",
      think: async (prompt, system) => { calls.push(["think", prompt, system]); return think(); }, ready: () => true,
    },
  };
  const ctx = {
    window, document: { createElement: el, head: { appendChild() {} }, getElementById: () => null },
    localStorage: { getItem: (k) => (local.has(k) ? local.get(k) : null), setItem: (k, v) => local.set(k, String(v)), removeItem: (k) => local.delete(k) },
    setTimeout: (fn, ms) => setTimeout(fn, Math.min(ms, 5)), clearTimeout, URLSearchParams, console, Promise, Date, Math, JSON, fetch, AbortController,
    createImageBitmap: async () => { await bitmap(); return { width: 40, height: 30, close() {} }; },
  };
  vm.runInNewContext(src, ctx);
  const vr = window.IzukiVr;
  vr.active = true;
  vr.scene = scene;
  return { vr, calls, scene, core: window.IzukiCore, stopped: () => stopped, opens: () => opens };
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
  assert.match(r.say, /faces you, so I can't see your room/);
  assert.match(r.say, /Headset cameras/, "it says where the headset's setting is");
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

test("an answer about a photo you've since swapped never covers the new photo", async () => {
  const pc = { name: "My PC", link: "https://pc.example/", pass: "p" };
  let b;
  const ask = async (swapDuringLook) => {
    b = browser({
      pcs: [pc], pcAnswers: { "remote/files/get": {} },
      see: async () => { if (swapDuringLook) await b.vr.api().openPhoto("C:\\Pics", { name: "beach.jpg", size: 10 }); return '{"say":"Two dogs on a sofa."}'; },
    });
    await b.vr.api().openPhoto("C:\\Pics", { name: "dogs.jpg", size: 10 });
    b.scene.lookOpen = true;
    return b.vr.gate("what's in this photo?");
  };
  // Still the same photo: the answer shows on it, as before.
  let r = await ask(false);
  assert.equal(r.say, "Two dogs on a sofa.");
  assert.equal(b.calls.filter((c) => c[0] === "showLook").pop()[1].say, "Two dogs on a sofa.");
  // Another photo picked while the AI looked: the old answer is set aside and the new photo stays.
  r = await ask(true);
  assert.match(r.say, /picked another photo/);
  const last = b.calls.filter((c) => c[0] === "showLook").pop()[1];
  assert.equal(last.picked, true, "the last thing drawn is the photo you picked");
  assert.match(last.say, /beach\.jpg/);
  // Picked just before asking, it lands while the AI looks at the earlier one: set aside too.
  let hold = false, release;
  const held = new Promise((r) => (release = r));
  let next;
  b = browser({
    pcs: [pc], pcAnswers: { "remote/files/get": {} },
    bitmap: async () => { if (hold) { hold = false; await held; } },
    see: async () => { release(); await next; return '{"say":"Two dogs on a sofa."}'; },
  });
  await b.vr.api().openPhoto("C:\\Pics", { name: "dogs.jpg", size: 10 });
  b.scene.lookOpen = true;
  hold = true;
  next = b.vr.api().openPhoto("C:\\Pics", { name: "beach.jpg", size: 10 });
  r = await b.vr.gate("what's in this photo?");
  assert.match(r.say, /picked another photo/);
  assert.match(b.calls.filter((c) => c[0] === "showLook").pop()[1].say, /beach\.jpg/, "the photo on show is the one you picked last");
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

test("everything for the PC on the panel goes to that PC, even with another chosen", async () => {
  const home = { name: "Home PC", link: "https://home.example/", pass: "h" };
  const work = { name: "Work PC", link: "https://work.example/", pass: "w" };
  const b = browser({ pcs: [work, home], pcAnswers: { talk: { text: "Done." }, remote: { ok: true }, "remote/status": { ok: true } } });
  // The panel opened on the home PC; the chosen one (first in the list) is the work PC.
  b.scene.shown = true;
  b.scene.pcTarget = () => home;
  await b.vr.gate("open Spotify");
  const api = b.vr.api();
  await api.pc.send({ op: "click", button: "left" }, home);
  await api.pc.status(home);
  const urls = b.calls.filter((c) => c[0] === "fetch").map((c) => c[1]);
  assert.ok(urls.length >= 3);
  assert.ok(urls.every((u) => u.startsWith(home.link)), "never the chosen work PC: " + urls.join(" "));
  // With no PC named, calls go to the chosen one, as before.
  await api.pc.status();
  assert.ok(b.calls.filter((c) => c[0] === "fetch").pop()[1].startsWith(work.link));
});

test("\"Hey Nova\" in the room: only what's said to Izuki is answered", async () => {
  const b = browser();
  b.vr.handsFree(true);
  assert.equal(await b.vr.gate("so what do you want for dinner"), null, "talk in the room isn't for Izuki");
  assert.equal(await b.vr.gate("ok see you later then"), null);
  assert.equal(await b.vr.gate("yeah that sounds good to me"), null);
  assert.deepEqual(plain(await b.vr.gate("Hey Nova, what's the time?")), { said: "what's the time?" });
  assert.equal((await b.vr.gate("hey nova")).say, "Mhm?");
  b.vr.line("izuki", "It's five o'clock.");
  assert.deepEqual(plain(await b.vr.gate("and in Tokyo?")), { said: "and in Tokyo?" }, "a follow-up right after needs no name");
  b.vr.handsFree(false);
  assert.deepEqual(plain(await b.vr.gate("what's the weather")), { said: "what's the weather" }, "after a tap (not hands-free) anything counts");
});

test("no name needed for a real question or a call for help (hands-free in the room)", async () => {
  const { forIzuki } = helpers;
  for (const s of ["how tall is Mount Everest?", "what's the weather tomorrow", "I'm stuck, how do I export this video", "can you help me with my homework",
    "do you know when the shop closes", "help me plan my week", "explain how vaccines work", "where's the nearest pharmacy"]) assert.ok(forIzuki(s), `"${s}" is for Izuki`);
  for (const s of ["so what do you want for dinner", "are you coming tonight?", "what", "lol", "I think we should go now", "see you later", "did you see that"]) assert.ok(!forIzuki(s), `"${s}" isn't for Izuki`);
  const b = browser();
  b.vr.handsFree(true);
  assert.deepEqual(plain(await b.vr.gate("how tall is Mount Everest?")), { said: "how tall is Mount Everest?" });
});

test("timers by the orb, and breathing together", async () => {
  const { timerWords } = helpers;
  const cases = { "set a timer for 10 minutes": 600000, "timer for 30 seconds": 30000, "set a timer for an hour": 3600000, "start a timer for five minutes": 300000,
    "5 minute timer": 300000, "set a timer for half an hour": 1800000, "Hey Nova, set a timer for 2 hours please": 7200000 };
  for (const [s, ms] of Object.entries(cases)) { const c = command(s); assert.equal(c?.kind, "timer", s); assert.equal(c.ms, ms, s); }
  assert.equal(command("set a timer for 1 second"), null, "too short to be a timer");
  assert.equal(command("cancel the timer").kind, "timer-stop");
  assert.equal(timerWords(5400000), "1 hour 30 minutes");
  assert.equal(timerWords(60000), "1 minute");
  for (const s of ["help me relax", "breathing exercise", "I'm so stressed", "let's breathe", "calm down"]) assert.equal(command(s)?.kind, "breathe", s);
  assert.equal(command("stop the breathing").kind, "breathe-stop");
  const b = browser();
  const calls = [];
  Object.assign(b.scene, { timerStart: (ms, w) => calls.push(["timer", ms, w]), timerStop: () => true, breathe: (n) => calls.push(["breathe", n]), breatheStop: () => calls.push(["breathe-stop"]) });
  assert.equal((await b.vr.gate("set a timer for 10 minutes")).say, "Timer set for 10 minutes. It's floating by me.");
  assert.deepEqual(calls[0], ["timer", 600000, "10 minutes"]);
  assert.equal((await b.vr.gate("cancel the timer")).say, "Okay, timer cancelled.");
  assert.match((await b.vr.gate("help me relax")).say, /breathe together/);
  assert.deepEqual(calls[1], ["breathe", 4]);
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


test("the room's browser: what's a search, and what it searches for", () => {
  const web = {
    "search the web for cheap flights to Lagos": "cheap flights to Lagos", "google the best VR games": "the best VR games",
    "look up the news": "the news", "Hey Nova, search for pizza near me": "pizza near me",
    "can you look up how tall Everest is online": "how tall Everest is", "search google for weather in Paris": "weather in Paris",
    "look the score up": "the score",
  };
  for (const [s, q] of Object.entries(web)) {
    const c = command(s);
    assert.equal(c?.kind, "web", `"${s}" is a search`);
    assert.equal(c.q, q, `"${s}" searches for "${q}"`);
  }
  assert.equal(command("open the browser").kind, "web");
  assert.equal(command("open the browser").q, "");
  assert.equal(command("look it up").q, "", "nothing to search for yet: it asks");
  assert.equal(command("close the browser").kind, "web-hide");
  assert.equal(command("search for cats in the browser").here, true);
});

test("teach me in 3D: what builds a hologram, and what stays a look or a question", () => {
  for (const s of ["teach me how the heart works", "show me the solar system", "visualize the French revolution", "explain photosynthesis in 3D",
    "build me a model of an atom", "walk me through how a bill becomes law", "show me how a car engine works", "make a timeline of the Roman empire",
    "Hey Nova, can you teach me about black holes", "simulate a volcano erupting", "map out the causes of World War 1"]) {
    assert.equal(command(s)?.kind, "holo", `"${s}" builds a hologram`);
  }
  assert.equal(command("teach me about plants that live in deserts")?.kind, "holo", "a relative \"that\" isn't something in front of you");
  assert.equal(command("search the web for cats in the browser").q, "cats");
  for (const s of ["show me how this works", "teach me about this", "explain quantum physics", "what is the capital of France", "show my photos", "show me what you can do"]) {
    assert.notEqual(command(s)?.kind, "holo", `"${s}" isn't a hologram`);
  }
  assert.equal(command("show me what you can do").kind, "help");
  assert.equal(command("next").kind, "holo-next");
  assert.equal(command("go back").kind, "holo-back");
  assert.equal(command("say that again").kind, "holo-again");
  assert.equal(command("close the hologram").kind, "holo-hide");
});

test("a hologram from the AI: checked and trimmed, never code, no loops", () => {
  const h = parseHolo('```json\n{"title":"The solar system","kind":"model","say":"Here is our solar system.","items":[{"label":"Sun","size":5,"color":"amber","orbit":-1},{"label":"Earth","note":"our home","size":2,"color":"sky","orbit":0},{"label":"Moon","size":1,"color":"white","orbit":1},{"label":"Mars","size":2,"color":"rose","orbit":0,"link":[9,1,3]}],"steps":[{"say":"The Sun is in the middle.","focus":[0,7]}]}\n```');
  assert.equal(h.kind, "model");
  assert.equal(h.items.length, 4);
  assert.equal(h.items[2].orbit, 1, "the Moon circles the Earth");
  assert.deepEqual(plain(h.items[3].link), [1], "links only to real, other parts");
  assert.deepEqual(plain(h.steps[0].focus), [0]);
  // A part with no name is dropped, and references still mean the same parts.
  const gap = parseHolo('{"kind":"model","items":[{"label":"Sun"},{"label":""},{"label":"Earth","orbit":0},{"label":"Moon","orbit":2,"link":[1,0]}],"steps":[{"say":"Moon","focus":[3,1]}]}');
  assert.deepEqual(plain(gap.items.map((x) => x.label)), ["Sun", "Earth", "Moon"]);
  assert.equal(gap.items[2].orbit, 1, "the Moon still circles the Earth");
  assert.deepEqual(plain(gap.items[2].link), [0], "a link to the dropped part goes, not to another");
  assert.deepEqual(plain(gap.steps[0].focus), [2]);
  assert.equal(parseHolo('{"items":[{"label":{"x":1}},{"label":"A"},{"label":"B"}]}').items.length, 2, "a name that isn't text isn't a part");
  const loop = parseHolo('{"kind":"model","items":[{"label":"A","orbit":1},{"label":"B","orbit":0}]}');
  assert.equal(loop.items[0].orbit, -1, "only an earlier part can be circled: no loops");
  assert.equal(loop.items[1].orbit, 0);
  const many = parseHolo(JSON.stringify({ kind: "galaxy", items: Array.from({ length: 12 }, (_, i) => ({ label: "Idea " + i, color: "neon", size: 99 })) }));
  assert.equal(many.kind, "map", "an unknown kind becomes a map");
  assert.equal(many.items.length, 8, "eight parts at most");
  assert.ok(many.items.every((x) => x.color !== "neon" && x.size === 5));
  assert.equal(parseHolo('{"kind":"chart","items":[{"label":"A"},{"label":"B"}]}'), null, "a chart needs numbers");
  for (const junk of ["", "plain words", "{broken", '{"items":[]}', '{"items":[{"label":"only one"}]}']) assert.equal(parseHolo(junk), null, `"${junk}" isn't a hologram`);
  assert.ok(!/[{}`*]/.test(parseHolo('{"say":"**Hi** `x`","items":[{"label":"A"},{"label":"B"}]}').say));
  assert.match(HOLO_SYSTEM, /never give the answer/);
  assert.match(HOLO_SYSTEM, /Never invent facts/);
});

test("search the web: the room's browser opens; with your PC up, the PC searches", async () => {
  const b = browser({ pcs: [{ name: "My PC", link: "https://pc.example/", pass: "p" }], pcAnswers: { talk: { text: "Searched on your PC." } } });
  let r = await b.vr.gate("search the web for cheap flights");
  assert.deepEqual(plain(b.calls.filter((c) => c[0] === "webSearch")), [["webSearch", "cheap flights"]]);
  assert.equal(r.say, "Here's what Google found.");
  b.scene.shown = true;
  r = await b.vr.gate("search for cats");
  assert.equal(r.say, "Searched on your PC.", "with the PC on the big screen, it searches there");
  r = await b.vr.gate("search for cats in the browser");
  assert.deepEqual(plain(b.calls.filter((c) => c[0] === "webSearch").pop()), ["webSearch", "cats"], "unless you say in the browser");
  await b.vr.gate("close the browser");
  assert.ok(b.calls.some((c) => c[0] === "webClose"));
});

test("teach me in 3D: the AI's design is built, next walks the lesson; elsewhere next is just words", async () => {
  const design = {
    title: "How the heart pumps", kind: "steps", say: "Your heart is two pumps side by side.",
    items: [{ label: "Right atrium" }, { label: "Right ventricle" }, { label: "Lungs" }],
    steps: [{ say: "Blood comes back from the body.", focus: [0] }, { say: "It's pushed to the lungs.", focus: [1, 2] }],
  };
  const b = browser({ think: async () => JSON.stringify(design) });
  let r = await b.vr.gate("next");
  assert.deepEqual(plain(r), { said: "next" }, "no hologram up: next goes to the brain");
  r = await b.vr.gate("teach me how the heart works");
  const think = b.calls.find((c) => c[0] === "think");
  assert.equal(think[2], HOLO_SYSTEM);
  assert.ok(b.calls.some((c) => c[0] === "holoBuilding"));
  assert.equal(b.calls.find((c) => c[0] === "holoShow")[1].title, "How the heart pumps");
  // A lesson plays by itself, said in one go; "next" still steps through by hand.
  assert.match(r.say, /^Your heart is two pumps side by side\. Blood comes back from the body\. It's pushed to the lungs\. Say again/);
  assert.equal((await b.vr.gate("next")).say, "Blood comes back from the body.");
  assert.deepEqual(plain(b.calls.filter((c) => c[0] === "holoFocus").pop()), ["holoFocus", [0], 0]);
  assert.equal((await b.vr.gate("next")).say, "It's pushed to the lungs.");
  assert.match((await b.vr.gate("next")).say, /last step/);
  assert.equal((await b.vr.gate("go back")).say, "Blood comes back from the body.");
  assert.equal((await b.vr.gate("say that again")).say, "Blood comes back from the body.");
  // Hands-free, long after Izuki spoke: a lesson's "next" still needs no name.
  b.vr.handsFree(true);
  b.vr.line("izuki", "Blood comes back from the body.");
  await new Promise((r) => setTimeout(r, 5));
  assert.equal((await b.vr.gate("next")).say, "It's pushed to the lungs.");
  b.vr.handsFree(false);
  await b.vr.gate("close the hologram");
  assert.ok(b.calls.some((c) => c[0] === "holoClose"));
});

test("a hologram closed (or replaced) while it's designed never comes back", async () => {
  let release;
  const slow = new Promise((r) => { release = r; });
  const b = browser({ think: () => slow.then(() => JSON.stringify({ title: "Old", kind: "map", say: "Old one.", items: [{ label: "A" }, { label: "B" }] })) });
  const pending = b.vr.gate("show me the solar system");
  await new Promise((r) => setTimeout(r, 5));
  b.vr.api().holoClosed();
  release();
  const r = await pending;
  assert.ok(!b.calls.some((c) => c[0] === "holoShow"), "the closed one isn't built");
  assert.notEqual(r.say, "Old one. Point at any part to hear more.");
});

test("a hologram the AI couldn't design: its words are said (never code), and nothing is left up", async () => {
  let b = browser({ think: async () => "The heart has four chambers." });
  let r = await b.vr.gate("teach me how the heart works");
  assert.equal(r.say, "The heart has four chambers.");
  assert.ok(b.calls.some((c) => c[0] === "holoClose"));
  b = browser({ think: async () => '{"title": "broken' });
  r = await b.vr.gate("show me the solar system");
  assert.ok(!/[{}"]/.test(r.say), r.say);
});

test("vr-scene.js is built from vr-scene.src.js (run node tools/build-vr.cjs)", () => {
  const { options } = require(path.join(root, "tools/build-vr.cjs"));
  const built = require("esbuild").buildSync({ ...options(), write: false, logLevel: "silent" }).outputFiles[0].text;
  // Line endings aside (a Windows checkout may turn them into CRLF).
  const lf = (s) => s.replace(/\r\n/g, "\n");
  assert.equal(lf(read("docs/app/vr-scene.js")), lf(built));
  assert.match(built, /Permission is hereby granted, free of charge/, "three.js's MIT notice is in the bundle");
});

test("\"show me where\": Izuki points and numbers the steps instead of doing it", () => {
  for (const s of ["where do I click to save this", "Hey Nova, where should I click?", "where's the share button", "where is the settings icon",
    "show me where the wifi settings are", "which button do I press to send it", "what menu should I use", "point at the save button",
    "how do I change my wallpaper on my PC", "walk me through installing Zoom on my computer", "show me how to print this on my screen",
    "where do I plug this in", "where should I put the battery", "where is the button", "where's the menu"]) assert.equal(command(s)?.kind, "guide", `"${s}" should point and teach`);
  // Not "show me where": doing it, looking, lessons and the PC's screen keep their own lanes.
  assert.equal(command("how do I fix this tap?")?.kind, "look");
  assert.equal(command("show me how volcanoes work")?.kind, "holo");
  assert.equal(command("walk me through photosynthesis")?.kind, "holo");
  assert.equal(command("what's on my screen")?.kind, "screen");
  assert.equal(command("where are you?")?.kind, "come");
  for (const s of ["open Spotify", "click the send button", "how are you", "where is Paris"]) assert.notEqual(command(s)?.kind, "guide", `"${s}" isn't a "show me where"`);
});

test("\"show me where\" looks at the right thing: the PC for software, the camera for a real thing", async () => {
  const marks = async () => JSON.stringify({ say: "Here.", marks: [{ x: 100, y: 100, label: "Tap" }] });
  const pic = (b) => b.calls.filter((c) => c[0] === "see").map((c) => c[1].b64);
  const SCREEN = "UENTQ1JFRU4=";
  // A kettle's button, with the PC on show and the camera free: the camera.
  let b = browser({ camera: true, see: marks });
  b.scene.shown = true;
  await b.vr.gate("where do I press the power button on this kettle?");
  assert.notEqual(pic(b)[0], SCREEN, "a real thing in front of you goes to the camera");
  assert.ok(b.calls.some((c) => c[0] === "showLook" && c[1].steps), "drawn as steps");
  // Software named: the PC's screen, camera or not.
  for (const q of ["where do I click to save this?", "where's the share button", "where is the settings icon on my screen"]) {
    b = browser({ camera: true, see: marks });
    b.scene.shown = true;
    await b.vr.gate(q);
    assert.equal(pic(b)[0], SCREEN, `"${q}" reads the PC's screen`);
  }
});

test("the guide's numbered path is drawn in the room (steps flag reaches the scene)", () => {
  const scene = read("docs/app/vr-scene.src.js");
  assert.match(src, /showLook\(\{[^}]*steps: !!source\.steps/, "a guide look tells the scene to draw steps");
  assert.match(src, /They want to be SHOWN where, step by step/, "the guide prompt asks for ordered steps");
  assert.match(scene, /function drawStepPath\(/);
  assert.match(scene, /lookUi\.steps = !!steps/);
});

test("holograms look projected: a projector, a scan line, wire cages, and calm stays still", () => {
  const scene = read("docs/app/vr-scene.src.js");
  assert.match(scene, /function projShow\(width, scan\)/);
  assert.match(scene, /function holoMaterial\(color\)/, "parts get the fresnel + scan-line surface");
  assert.match(scene, /new LineSegments\(holoShell/, "each part has a wire cage");
  assert.match(scene, /if \(!proj\.group\.visible \|\| calm\) return;/, "reduced motion: the projector doesn't move");
  assert.match(scene, /holoClose\(\) \{\s*holoClear\(\);\s*proj\.group\.visible = false;/, "closing a hologram puts the projector away");
  assert.match(scene, /n\.shell\?\.material\.dispose\(\)/, "cages are cleaned up with their hologram");
});

test("the Quest app opens a full-screen way in, even over an old chat", () => {
  assert.match(src, /function launcher\(\)/);
  assert.match(src, /if \(wanted\) supportReady\.then\(\(\) => g\.setTimeout\?\.\(launcher/, "any ?vr visit gets the launcher, whatever the page shows");
  assert.match(src, /exited\(\) \{\s*\/\/[^\n]*\n\s*if \(asApp\) g\.setTimeout\?\.\(launcher/, "leaving the room in the app goes back to the launcher");
  assert.match(src, /Enter the room/);
  assert.match(src, /Chat here instead/);
  assert.match(src, /prefers-reduced-motion:reduce\)\{\.vr-launch-orb\{animation:none\}/, "the orb stays still with reduced motion");
});

test("dream mode: which words build a world, and which don't", () => {
  for (const s of ["dream mode", "Dream mode: a calm beach at sunset", "take me to a rainforest at night", "Hey Nova, take me to Mars",
    "put me on a snowy mountain", "imagine I'm in a forest of glowing mushrooms", "build me a world of floating islands",
    "I want to be in space", "dream of a quiet lake"]) assert.equal(command(s)?.kind, "dream", `"${s}" should dream`);
  assert.equal(command("take me to a rainforest at night").place, "a rainforest at night");
  for (const s of ["wake up", "wake me up", "end the dream", "take me back", "back to my room"]) assert.equal(command(s)?.kind, "dream-end", `"${s}" ends a dream`);
  // Your own things keep their lanes; lessons stay lessons.
  assert.equal(command("take me to my photos")?.kind, "files");
  assert.notEqual(command("take me to google")?.kind, "dream");
  assert.notEqual(command("take me to my PC screen")?.kind, "dream");
  assert.equal(command("show me the solar system")?.kind, "holo");
  assert.equal(command("show my PC")?.kind, "pc");
});

test("parseDream checks and clamps what the AI designs", () => {
  const { parseDream } = helpers;
  assert.equal(parseDream("I'd love to take you there!"), null, "words, not a design");
  assert.equal(parseDream('{"title":"x"}'), null, "no sky");
  const shapes = Array.from({ length: 9 }, () => ({ kind: "tree", count: 99, color: "#2a5", size: 40, spread: "nowhere" }));
  const w = plain(parseDream("```json\n" + JSON.stringify({
    title: "Night forest", say: "Welcome to the **forest**.", sky: { top: "#0a1030", horizon: "red", bottom: "#123" },
    ground: { kind: "lava", color: "#334455" }, light: "#ffeeaa", particles: { kind: "fireflies", color: "#ccff66", amount: 7 },
    shapes: shapes.concat([{ kind: "dragon", count: 3 }]),
  }) + "\n```"));
  assert.equal(w.title, "Night forest");
  assert.ok(!/[*]/.test(w.say), "no markdown is said");
  assert.equal(w.sky.top, "#0a1030");
  assert.equal(w.sky.horizon, "#3a4f7a", "a colour that isn't a colour falls back");
  assert.equal(w.sky.bottom, "#112233", "short colours expand");
  assert.equal(w.ground.kind, "grass", "unknown ground falls back");
  assert.equal(w.particles.amount, 1, "amount is clamped");
  assert.equal(w.shapes.length, 5, "6 groups at most, unknown kinds dropped, and the 120 cap empties the sixth");
  assert.ok(w.shapes.every((s) => s.count <= 24 && s.size <= 3 && s.spread === "mid"));
  assert.ok(w.shapes.reduce((n, s) => n + s.count, 0) <= 120, "never more than 120 things");
});

test("dream mode in the room: a world shows, wake up ends it, the prompt stays gentle", async () => {
  const { DREAM_SYSTEM } = helpers;
  assert.match(DREAM_SYSTEM, /nothing scary, violent or gory/);
  const scene = read("docs/app/vr-scene.src.js");
  assert.match(scene, /function dreamShow\(spec\)/);
  assert.match(scene, /dreamClose\(\);\s*clearTimeout\(noticeTimer\)/, "leaving VR clears the world");
  assert.match(src, /if \(c\?\.kind === "dream-end" && !vr\.scene\?\.dreamShown\?\.\(\)\) c = null;/, "\"wake up\" only ends a dream that's on");
  assert.match(src, /dreamGen\+\+;/, "a world being designed when you leave is dropped");
});

test("Izuki can float beside your other apps (a room hides them; a window doesn't)", () => {
  assert.match(src, /"Float beside my apps"/);
  assert.match(src, /store\.set\("launch", "float"\);[\s\S]{0,80}getElementById\("go-live"\)\?\.click\(\)/, "floating starts the hands-free call in the window");
  assert.match(src, /if \(support\.headset\) box\.append\(float, floatTip\)/, "only on a headset");
  assert.match(src, /last === "float"[\s\S]{0,120}goFloat\(\)/, "the app remembers floating");
  assert.match(src, /if \(ok && !chosen && box\.isConnected\) goFloat\(\)/, "a tap you made first wins over the automatic float");
  assert.match(src, /last === "room" && can\) void straightIn\(\)/, "and remembers the room");
  assert.doesNotMatch(src, /openedOnce/, "the old explainer no longer opens under the launcher");
});

test("in the room the chat brain knows it's in VR, not on a phone", () => {
  const { VR_CONTEXT } = helpers;
  const c = VR_CONTEXT(true, false, true);
  assert.match(c, /VR headset/);
  assert.match(c, /never talk about phone screens/);
  assert.match(c, /Want me to build it in 3D\?/);
  assert.match(c, /PC's screen is open/);
  assert.match(c, /dream world/);
  assert.doesNotMatch(VR_CONTEXT(false, false, false), /PC's screen is open|dream world you built/);
  const page = read("docs/app/index.html");
  assert.match(page, /window\.IzukiVr\?\.active \? "in their VR headset" : "on their phone"/);
  assert.match(page, /window\.IzukiVr\?\.active \? window\.IzukiVr\.system\?\.\(\) \|\| "" : ""/);
});

test("\"Want me to build it in 3D?\" … \"yes\" builds a hologram of what they asked", async () => {
  const { YES, OFFERS_3D } = helpers;
  for (const s of ["yes", "Yeah", "sure", "yes please", "do it", "go ahead", "build it", "let's do it"]) assert.ok(YES.test(s), s);
  for (const s of ["yesterday I went out", "no thanks", "maybe later"]) assert.ok(!YES.test(s), s);
  assert.ok(OFFERS_3D.test("Lava pushes up through the crust. Want me to build it in 3D?"));
  assert.ok(!OFFERS_3D.test("It's 3 degrees outside."));
  assert.ok(OFFERS_3D.test("Would you like me to show it in 3D?"));
  assert.ok(!OFFERS_3D.test("I can't build that in 3D. Want a longer explanation?"), "a refusal isn't an offer");
  const { OFFERS_TRIP } = helpers;
  assert.ok(OFFERS_TRIP.test("Want me to take you there?"));
  assert.ok(!OFFERS_TRIP.test("I can't take you there. Would you like a longer explanation?"), "a refusal isn't a trip");
  const holoJson = JSON.stringify({ title: "Volcano", kind: "steps", say: "Here's how.", items: [{ label: "Magma" }, { label: "Vent" }], steps: [] });
  const b = browser({ think: async () => holoJson });
  const first = await b.vr.gate("how do volcanoes erupt");
  assert.equal(first.said, "how do volcanoes erupt", "an ordinary question goes to the chat brain");
  b.vr.line("izuki", "Pressure builds until magma bursts out. Want me to build it in 3D?");
  const r = await b.vr.gate("yes");
  assert.ok(r.done, "the yes is handled in the room");
  const call = b.calls.find((c) => c[0] === "think");
  assert.ok(call && /volcanoes erupt/.test(call[1]), "the hologram is about what they asked");
  assert.ok(b.calls.some((c) => c[0] === "holoShow"), "and it's built");
  // An offer is used once; a later "yes" with no offer goes to the brain.
  const again = await b.vr.gate("yes");
  assert.ok(!again?.done, "no second hologram from the same offer");
});

test("in a headset call you can talk over Izuki, and voice bars show it hears you", () => {
  const page = read("docs/app/index.html");
  assert.match(page, /bargeWatch\(orbState === "speaking"\)/, "every time Izuki starts speaking, the cut-in watch starts");
  assert.match(page, /var bargeTimer = null;/, "safe while the page is still starting");
  assert.match(page, /!window\.IzukiVr\?\.active \|\| store\.get\("bargeIn", true\) === false/, "headset calls only, and it can be switched off");
  assert.match(page, /loud >= 350\) \{[^}]*hush\(\)/, "about a third of a second of your voice stops Izuki");
  const scene = read("docs/app/vr-scene.src.js");
  assert.match(scene, /function voiceBarsTick\(dt, t\)/);
  assert.match(scene, /const on = view\.state === "listening";/, "bars only while listening");
});

test("a lesson plays by itself, moving step by step in time with the voice, with light flowing", () => {
  const { lessonTimes } = helpers;
  const h = { say: "one two three four five", steps: [{ say: "six seven eight" }, { say: "nine ten" }] };
  assert.deepEqual(plain(lessonTimes(h, 1)), [5, 8], "each step starts when the voice reaches it");
  assert.deepEqual(plain(lessonTimes({ say: "", steps: [] })), [], "nothing to time");
  assert.match(src, /store\.get\("autoLesson", true\) !== false/, "on unless switched off");
  assert.match(src, /if \(!alive\(\) \|\| appState !== "speaking"\) return;/, "stops when the voice stops (cut in, new question)");
  const scene = read("docs/app/vr-scene.src.js");
  assert.match(scene, /l\.pulse\.position\.lerpVectors\(l\.a\.g\.position, l\.b\.g\.position, k\)/, "pulses travel the links");
  assert.match(scene, /l\.pulse\?\.material\.dispose\(\)/, "and are cleaned up");
});

test("with a photo open, \"this\" means the photo (seen on a real Quest: it talked about the room)", async () => {
  const { ROOM_WORDS, ABOUT_THIS } = helpers;
  assert.ok(ROOM_WORDS.test("what am I holding?") && ROOM_WORDS.test("what's in front of me"));
  assert.ok(!ROOM_WORDS.test("what's this?"));
  for (const s of ["where was this taken?", "who is he?", "is that my dog?", "describe it", "what's happening here?"]) assert.ok(ABOUT_THIS(s), s);
  for (const s of ["tell me a joke", "set a timer", "I like this"]) assert.ok(!ABOUT_THIS(s), s);
  const pc = { name: "My PC", link: "https://pc.example/", pass: "p" };
  const open = async () => {
    const b = browser({ camera: true, pcs: [pc], pcAnswers: { "remote/files/get": {} }, see: async () => '{"say":"A beach at sunset."}' });
    await b.vr.api().openPhoto("C:\\Pics", { name: "beach.jpg", size: 10 });
    b.scene.lookOpen = true;
    return b;
  };
  const system = (b) => b.calls.filter((c) => c[0] === "see").map((c) => c[1].system).pop() || "";
  for (const q of ["what's this?", "where was this taken?", "who is he?"]) {
    const b = await open();
    const r = await b.vr.gate(q);
    assert.ok(r.done, `"${q}" is handled in the room`);
    assert.match(system(b), /one of the person's own photos/, `"${q}" looks at the open photo`);
  }
  // Naming the real room still uses the camera.
  const b = await open();
  await b.vr.gate("what am I holding?");
  const seen = b.calls.filter((c) => c[0] === "see").pop();
  assert.ok(seen, "it really looked");
  assert.equal(seen[1].b64, "QUJD", "through the headset camera");
  assert.doesNotMatch(system(b), /own photos/, "the room named: the camera, not the photo");
});

test("a pinned card takes you back into that chat", async () => {
  const b = browser();
  await b.vr.gate("how far is the moon");
  b.vr.line("izuki", "About 384,000 kilometres away.");
  await b.vr.gate("pin that");
  assert.ok(b.calls.some((c) => c[0] === "pin"), "the answer is pinned");
  assert.match(src, /vr\.scene\?\.pin\(lastReply, undefined, false, lastAsk\)/, "with the question that led to it");
  const api = b.vr.api();
  api.notes.add("About 384,000 kilometres away.", "how far is the moon");
  const saved = plain(api.notes.list().pop());
  assert.equal(saved.ask, "how far is the moon", "the pin remembers what you asked");
  const recalled = [], spoken = [];
  b.core.recall = (q, a) => recalled.push([q, a]);
  b.core.speak = (t) => spoken.push(t);
  api.resume(saved);
  assert.deepEqual(recalled, [["how far is the moon", "About 384,000 kilometres away."]], "the chat carries on from it");
  assert.match(spoken[0], /^Back to: how far is the moon\. About 384,000/);
  assert.match(read("docs/app/index.html"), /recall: \(q, a\) => \{/, "the app takes the exchange back into its history");
  assert.match(read("docs/app/vr-scene.src.js"), /api\.resume \? api\.resume\(\{ text, ask \}\)/, "tapping the card resumes it");
});

test("draw it: the real shape of a thing, checked, and the right words get it", () => {
  const { parseSketch, PLACE_WORDS } = helpers;
  // Words: drawing a thing vs dreaming of a place.
  for (const s of ["draw me a volcano", "sketch how a bridge holds weight", "imagine a rocket", "what does a black hole look like", "Hey Nova, draw a heart"]) {
    assert.equal(command(s)?.kind, "holo", `"${s}" should draw`);
  }
  for (const s of ["imagine a beach at sunset", "imagine I'm in a forest", "take me to a rainforest at night"]) assert.equal(command(s)?.kind, "dream", `"${s}" should dream`);
  assert.ok(PLACE_WORDS.test("a beach at sunset") && !PLACE_WORDS.test("a rocket"));
  // The AI's shapes: checked and clamped into the drawing box.
  assert.equal(parseSketch({ kind: "sketch", shapes: [{ type: "line", points: [[0, 0, 0], [0, 1, 0]] }] }), null, "one shape isn't a drawing");
  const s = plain(parseSketch({ kind: "sketch", title: "A **volcano**", say: "Here.", shapes: [
    { type: "cone", center: [0, -0.3, 0], radius: 9, height: 1, color: "lava", label: "Volcano" },
    { type: "line", points: [[0, -5, 0], [0, 0.2, 0]], flow: true },
    { type: "dragon", center: [0, 0, 0] },
    { type: "curve", points: [[0, 0, 0]] },
    { type: "spiral", center: [0, 0, 0], turns: 40 } ], steps: [{ say: "Magma rises.", focus: [1, 7] }] }));
  assert.equal(s.kind, "sketch");
  assert.equal(s.title, "A volcano", "no markdown");
  assert.equal(s.shapes.length, 3, "unknown types and lines with one point are dropped");
  assert.equal(s.shapes[0].radius, 1, "sizes are clamped");
  assert.ok(["teal", "sky", "violet", "rose", "amber", "lime", "white"].includes(s.shapes[0].color), "only the palette");
  assert.deepEqual(s.shapes[1].points[0], [0, -1, 0], "points stay in the box");
  assert.equal(s.shapes[1].flow, true);
  assert.equal(s.shapes[2].turns, 6, "turns are clamped");
  assert.deepEqual(s.steps[0].focus, [1], "a step only points at shapes that exist");
  const scene = read("docs/app/vr-scene.src.js");
  assert.match(scene, /function sketchShow\(spec\)/);
  assert.match(scene, /if \(spec\.kind === "sketch"\) \{\s*projShow\(sketchShow\(spec\)/, "a sketch stands on the projector");
  assert.match(scene, /sketchClear\(\);/, "and is cleaned up with its hologram");
  assert.match(src, /\(Draw it: use kind sketch\.\)/, "drawing words ask the AI for a sketch");
});

(async () => {
  for (const [name, fn] of tests) {
    try { await fn(); passed++; } catch (e) { console.error(`FAIL ${name}\n  ${e.message}`); process.exitCode = 1; }
  }
  console.log(`vr: ${passed}/${tests.length} passed`);
})();
