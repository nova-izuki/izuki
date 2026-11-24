// The phone agent (docs/app/agent.js) against a fake phone and a scripted AI:
// it reads the screen, does one checked step at a time, finishes with an
// answer read off the screen, and never presses risky controls, acts while
// locked or taps Izuki's own page. No network, no phone.
const assert = require("assert/strict");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

function phone({ locked = false } = {}) {
  const calls = [];
  const state = { app: "com.novaizuki.mobile", locked };
  const screens = {
    "com.novaizuki.mobile": [{ n: 1, text: "Ask Izuki", kind: "box" }, { n: 2, text: "Send", kind: "button" }],
    "com.android.chrome": [{ n: 1, text: "Search or type web address", kind: "box" }],
    "com.android.settings": [
      { n: 1, text: "Storage", kind: "text" },
      { n: 2, text: "86.7 GB used of 128 GB", kind: "text" },
      { n: 3, text: "Apps", kind: "button" }, { n: 4, text: "38.2 GB", kind: "text" },
      { n: 5, text: "Images", kind: "button" }, { n: 6, text: "21.4 GB", kind: "text" },
      { n: 7, text: "Videos", kind: "button" }, { n: 8, text: "12.9 GB", kind: "text" },
      { n: 9, text: "Delete all trash", kind: "button" },
      { n: 10, text: "Free up space", kind: "button" },
    ],
  };
  const native = {
    async screen() { return state.locked ? null : { app: state.app, locked: state.locked, items: screens[state.app] || [] }; },
    async device() { return { battery: 64, charging: false, online: true, wifi: true, model: "SM-S918B", locked: state.locked }; },
    async storage() { return { total: 128e9, free: 41.3e9, used: 86.7e9 }; },
    async openPanel(name) { calls.push(`panel:${name}`); state.app = "com.android.settings"; return { opened: name }; },
    async act(args) {
      calls.push(`act:${args.op}:${args.n ?? ""}`);
      if (args.op === "click") {
        const item = (screens[state.app] || []).find((x) => x.n === args.n);
        if (/delete|send/i.test(item?.text || "")) return { done: false, reason: "needs-person", matched: item.text };
        return { done: true };
      }
      return { done: true };
    },
    async launch(name) { calls.push(`launch:${name}`); return null; },
    async pause() {},
    why: (r) => r?.reason || "",
  };
  return { native, calls, state };
}

function load(native) {
  const window = { IzukiNative: native };
  vm.runInNewContext(fs.readFileSync(path.resolve(__dirname, "../../docs/app/agent.js"), "utf8"), { window, console, setTimeout, clearTimeout, Date, Promise });
  return window.IzukiAgent;
}

/** An AI that answers from a script, and remembers what it was shown. */
function brain(replies) {
  const prompts = [];
  return {
    prompts,
    think: async (system, prompt) => {
      prompts.push({ system, prompt });
      const next = replies.shift();
      return typeof next === "function" ? next(prompt) : next;
    },
  };
}

/** Run the agent on a fake phone. */
async function A_run(p, goal, ctx) { return load(p.native).run(goal, ctx); }

(async () => {
  // 1. "What's taking space on my phone?" — Settings → Storage, then the answer from the screen.
  {
    const p = phone();
    const A = load(p.native);
    const ai = brain([
      '```json\n{"do":"settings","page":"storage"}\n```',
      (prompt) => {
        assert.match(prompt, /\[3\] button "Apps"/, "the AI sees the numbered screen");
        assert.match(prompt, /storage 87 GB used of 128 GB \(41 GB free\)/, "facts include the phone's storage");
        return '<think>sizes are listed</think>{"do":"done","say":"You have 41 GB free. Apps use 38.2 GB, images 21.4 GB and videos 12.9 GB."}';
      },
    ]);
    const steps = [];
    const r = await A.run("check what's taking space on my phone", { think: ai.think, onStep: (s) => steps.push(s) });
    assert.equal(r.ok, true);
    assert.match(r.text, /Apps use 38\.2 GB/);
    assert.deepEqual(p.calls, ["panel:storage"]);
    assert.deepEqual(steps, ["Opening Storage…"]);
    assert.match(ai.prompts[0].prompt, /Izuki's own chat/, "Izuki's page is described, not listed for tapping");
    assert.match(ai.prompts[1].prompt, /Opening Storage: opened Storage/, "each step's real result goes back to the AI");
  }

  // 2. A risky control is never pressed: the person is asked to tap it.
  {
    const p = phone();
    p.state.app = "com.android.settings";
    const A = load(p.native);
    const ai = brain(['{"action":"tap","target":9}']);
    const r = await A.run("delete my trash", { think: ai.think });
    assert.equal(r.asked, true);
    assert.match(r.text, /tap “Delete all trash” yourself/);
    assert.ok(!p.calls.some((c) => c.startsWith("act:click")), "the delete button is refused before Android is even asked");
  }

  // 3. Izuki's own page is never tapped.
  {
    const p = phone();
    const A = load(p.native);
    const ai = brain(['{"do":"tap","n":1}', '{"do":"done","say":"Done."}']);
    await A.run("tap the box", { think: ai.think });
    assert.ok(!p.calls.some((c) => c.startsWith("act:click")));
    assert.match(ai.prompts[1].prompt, /Izuki's own chat; open the app/);
  }

  // 4. A locked phone: nothing happens, and it says so.
  {
    const p = phone({ locked: true });
    const A = load(p.native);
    const ai = brain(['{"do":"done","say":"x"}']);
    const r = await A.run("open settings", { think: ai.think });
    assert.match(r.text, /locked/);
    assert.equal(ai.prompts.length, 0, "the AI isn't even asked while the phone is locked");
  }

  // 5. Stop between steps.
  {
    const p = phone();
    const A = load(p.native);
    let stop = false;
    const ai = brain([() => { stop = true; return '{"do":"settings","page":"storage"}'; }]);
    const r = await A.run("open storage", { think: ai.think, stopped: () => stop });
    assert.equal(r.stopped, true);
    assert.deepEqual(p.calls, [], "a step chosen after Stop is never done");
  }

  // 5b. Stop pressed while the box is being tapped: nothing is typed or searched.
  {
    const p = phone();
    p.state.app = "com.android.chrome";
    let stop = false;
    const act = p.native.act;
    p.native.act = async (args) => { const r = await act(args); if (args.op === "click") stop = true; return r; };
    const A = load(p.native);
    const r = await A.run("search lofi", { think: brain(['{"do":"type","n":1,"text":"lofi","enter":true}']).think, stopped: () => stop });
    assert.equal(r.stopped, true);
    assert.deepEqual(p.calls, ["act:click:1"], "nothing typed or submitted after Stop");
  }

  // 6. A model that answers in words (twice) is taken at its word; an unknown app is reported, not invented.
  {
    const p = phone();
    const A = load(p.native);
    const r1 = await A.run("hi", { think: brain(["Sure!", "You have 41 GB free."]).think });
    assert.equal(r1.text, "You have 41 GB free.");
    const ai = brain(['{"do":"open","app":"Snapchat"}', (prompt) => { assert.match(prompt, /Snapchat isn't installed/); return '{"do":"done","say":"Snapchat isn\'t on this phone."}'; }]);
    const r2 = await A.run("open snapchat", { think: ai.think });
    assert.equal(r2.text, "Snapchat isn't on this phone.");
  }

  // 7. Every tap carries the label it was planned on (Android refuses a renumbered list).
  {
    const p = phone();
    p.state.app = "com.android.settings";
    const seen = [];
    const act = p.native.act;
    p.native.act = async (args) => { if (args.op === "click") seen.push(args.expect); return act(args); };
    const A = load(p.native);
    await A.run("open apps", { think: brain(['{"do":"tap","n":3}', '{"do":"done","say":"ok"}']).think });
    assert.deepEqual(seen, ["Apps"]);
  }

  // 8. A web address the AI typed is never opened by itself.
  {
    const p = phone();
    p.state.app = "com.android.chrome";
    const A = load(p.native);
    p.native.screen = async () => ({ app: "com.android.chrome", items: [{ n: 1, text: "Search or type web address", hint: "Search or type web address", id: "url_bar", kind: "box" }] });
    const r = await A.run("look this up", { think: brain(['{"do":"type","n":1,"text":"https://example.test/?q=secret","enter":true}']).think });
    assert.equal(r.asked, true);
    assert.match(r.text, /didn't open it/);
    assert.ok(!p.calls.includes("act:submit:"), "Enter was never pressed");
    const r3 = await A.run("look this up", { think: brain(['{"do":"type","n":1,"text":"evil.example/?q=secret","enter":true}']).think });
    assert.match(r3.text, /didn't open it/, "a host with a query, without https://");
    const r4 = await A.run("look this up", { think: brain(['{"do":"type","n":1,"text":"files.internal:8080","enter":true}']).think });
    assert.match(r4.text, /didn't open it/, "a host with a port");
    // An ordinary search still goes through.
    const r2 = await A.run("search lofi", { think: brain(['{"do":"type","n":1,"text":"lofi beats","enter":true}', '{"do":"done","say":"Searched."}']).think });
    assert.equal(r2.text, "Searched.");
    assert.ok(p.calls.includes("act:submit:"));
  }

  // 9. One at a time with Autopilot: both use Android's numbered screen list.
  {
    const p = phone();
    const window = { IzukiNative: p.native, IzukiAutopilot: { state: { running: true } } };
    vm.runInNewContext(fs.readFileSync(path.resolve(__dirname, "../../docs/app/agent.js"), "utf8"), { window, console, setTimeout, clearTimeout, Date, Promise });
    const r = await window.IzukiAgent.run("open settings", { think: brain(['{"do":"done","say":"x"}']).think });
    assert.match(r.text, /Autopilot is running/);
    assert.equal(window.IzukiAgent.busy, false);
  }

  // 9b. A second run while one is working is refused, and doesn't end the first one's busy state.
  {
    const p = phone();
    const A = load(p.native);
    let release;
    const slow = brain([() => new Promise((r) => { release = () => r('{"do":"done","say":"first"}'); })]);
    const first = A.run("check storage", { think: slow.think });
    await new Promise((r) => setTimeout(r, 10));
    assert.equal(A.busy, true);
    const second = await A.run("open settings", { think: brain(['{"do":"done","say":"second"}']).think });
    assert.match(second.text, /already working/);
    assert.equal(A.busy, true, "the refused call left the running one alone");
    release();
    assert.equal((await first).text, "first");
    assert.equal(A.busy, false);
  }

  // 9c. A quiz or test on screen: the answer is picked, Submit is not.
  {
    const p = phone();
    p.native.screen = async () => ({ app: "com.android.chrome", items: [
      { n: 1, text: "Question 3 of 20", kind: "text" }, { n: 2, text: "Which port does HTTPS use?", kind: "text" },
      { n: 3, text: "443", kind: "button" }, { n: 4, text: "80", kind: "button" }, { n: 5, text: "Submit quiz", kind: "button" },
      { n: 6, text: "Time remaining 12:40", kind: "text" },
    ] });
    const A = load(p.native);
    const r = await A.run("answer this", { think: brain(['{"do":"tap","n":3}', '{"do":"done","say":"Port 443."}']).think });
    assert.ok(p.calls.some((c) => c.startsWith("act:click")), "the answer was picked");
    assert.equal(r.text, "Port 443.");

    // The Submit button on that same page is never pressed, by number or by point.
    const s = phone();
    s.native.screen = async () => ({ app: "com.android.chrome", items: [
      { n: 1, text: "Question 1 of 5", kind: "text" }, { n: 2, text: "Submit quiz", kind: "button", x: 0, y: 0, w: 200, h: 60 },
    ] });
    const SUBMIT = load(s.native);
    const byNumber = await SUBMIT.run("answer this", { think: brain(['{"do":"tap","n":2}']).think });
    assert.equal(byNumber.asked, true);
    assert.match(byNumber.text, /hands it in/);
    assert.ok(!s.calls.some((c) => c.startsWith("act:click")), "Submit was not pressed by number");
    assert.equal(A._test.testPage({ items: [{ text: "Storage" }, { text: "Apps 38 GB" }] }), false);
    assert.equal(A._test.testPage({ items: [{ text: "Question 3/20" }] }), true, "a compact counter");
    assert.equal(A._test.testPage({ items: [{ text: "Question 3" }, { text: "of 20" }] }), true, "a counter split across items");
    assert.equal(A._test.testPage({ items: [{ text: "Episode 4" }, { text: "Time remaining 12:40" }] }), false, "a video's timer isn't a test");
    assert.equal(A._test.testPage({ items: [{ text: "Which port does HTTPS use?" }, { text: "Choose one answer" }, { text: "Time left 08:12" }] }), true, "a timer with answers is");
    // The word "quiz" alone isn't a test: a search for "pub quiz" can be changed to "weather".
    const q = phone();
    q.native.screen = async () => ({ app: "com.android.chrome", items: [{ n: 1, text: "pub quiz near me", hint: "Search", id: "search_box", kind: "box" }, { n: 2, text: "Quiz night at The Crown", kind: "text" }] });
    const B = load(q.native);
    const typed = await B.run("search the weather instead", { think: brain(['{"do":"type","n":1,"text":"weather","enter":true}', '{"do":"done","say":"Searched."}']).think });
    assert.equal(typed.text, "Searched.");
    assert.ok(q.calls.some((c) => c.startsWith("act:type")), "typing went ahead");
  }

  // 10. Parsing what small models really send.
  {
    const A = load(phone().native);
    const { parse } = A._test;
    assert.equal(parse('{"do":"scroll","dir":"UP"}').dir, "up");
    assert.equal(parse('ok {"type":"press","number":"4",}').n, 4, "string numbers and trailing commas");
    assert.equal(parse('{"do":"settings","page":"Wi-Fi"}').page, "wifi");
    assert.equal(parse('{"do":"settings","page":"memory"}').page, "storage");
    assert.equal(parse('{"do":"teleport"}'), null);
    assert.equal(parse("no json here"), null);
    assert.equal(parse('{"do":"done","say":"a } inside \\"quotes\\""}').say, 'a } inside "quotes"');
    assert.ok(A._test.RISKY.test("Call"), "calling someone needs the person's finger");
    assert.ok(!A._test.RISKY.test("Storage"));
    // The new moves, as models write them.
    assert.equal(parse('{"do":"swipe","dir":"up"}').do, "scroll", "a finger moving up scrolls the list");
    assert.equal(parse('{"do":"swipe","dir":"up"}').dir, "down");
    assert.equal(parse('{"do":"swipe","dir":"left"}').do, "swipe");
    assert.equal(parse('{"action":"tap_xy","x":"512","y":300}').x, 512);
    assert.equal(parse('{"do":"long-press","n":4}').do, "long_press");
    assert.equal(parse('{"do":"double_tap","x":400,"y":300}').do, "double_tap");
    assert.equal(parse('{"do":"notifications"}').key, "notifications");
    assert.equal(parse('{"do":"torch","on":"on"}').on, true);
    assert.equal(parse('{"do":"tap","n":2,"plan":"1. open Files 2. read sizes"}').plan, "1. open Files 2. read sizes");
    const drag = parse('{"do":"drag","from_n":"1","to":2}');
    assert.equal(drag.do, "drag");
    assert.equal(drag.from_n, 1);
    assert.equal(drag.to_n, 2, "a bare to number is the target item");
    assert.equal(parse('{"do":"scroll_to","find":"Privacy"}').find, "Privacy");
    assert.equal(parse('{"do":"scroll_until","text":"Privacy"}').do, "scroll_to");
    assert.equal(parse('{"do":"scroll_until","text":"Privacy"}').find, "Privacy");
  }

  // 11. Eyes: a brain that sees pictures gets the screenshot, a point on it lands on the screen, and the risky check still holds.
  {
    const p = phone();
    p.state.app = "com.android.settings";
    const touches = [];
    const act = p.native.act;
    p.native.act = async (args) => { if (args.op === "tap" || args.op === "longpress" || args.op === "swipe") touches.push(args); return act(args); };
    p.native.snapshot = async () => ({ image: "AAAA", type: "image/jpeg", w: 1000, h: 2000 });
    const shots = [];
    const ai = brain([
      '{"do":"tap_at","x":500,"y":250,"plan":"1. tap the middle 2. finish"}',
      (prompt) => { assert.match(prompt, /Your plan: 1\. tap the middle/, "the plan comes back each turn"); assert.match(prompt, /screenshot of this screen is attached/); return '{"do":"done","say":"ok"}'; },
    ]);
    const think = (system, prompt, image) => { shots.push(image); return ai.think(system, prompt); };
    const r = await A_run(p, "tap the middle", { think, see: true });
    assert.equal(r.ok, true);
    assert.equal(shots[0]?.data, "AAAA", "the screenshot goes with the prompt");
    assert.deepEqual([touches[0].x, touches[0].y], [500, 500], "0-1000 on the screenshot → real screen pixels");
    // A point that lands on a risky control is refused like a numbered tap.
    const q = phone();
    q.state.app = "com.android.settings";
    q.native.snapshot = async () => ({ image: "AAAA", w: 1000, h: 2000 });
    q.native.screen = async () => ({ app: "com.android.settings", w: 1000, h: 2000, items: [{ n: 1, text: "Delete all trash", kind: "button", x: 400, y: 900, w: 200, h: 100 }] });
    const r2 = await A_run(q, "clean up", { think: brain(['{"do":"tap_at","x":500,"y":475}']).think, see: true });
    assert.equal(r2.asked, true);
    assert.match(r2.text, /tap “Delete all trash” yourself/);
    assert.ok(!q.calls.some((c) => c.startsWith("act:tap")), "the risky spot is never touched");
    // A harmless label inside a risky button doesn't hide the button.
    const inner = phone();
    inner.native.snapshot = async () => ({ image: "AAAA", w: 1000, h: 2000 });
    inner.native.screen = async () => ({ app: "com.android.settings", w: 1000, h: 2000, items: [
      { n: 1, text: "Delete account", kind: "button", x: 100, y: 800, w: 800, h: 300 },
      { n: 2, text: "Your photos and data", kind: "text", x: 150, y: 900, w: 300, h: 60 },
    ] });
    const r3 = await A_run(inner, "clean up", { think: brain(['{"do":"tap_at","x":300,"y":465}']).think, see: true });
    assert.match(r3.text, /tap “Delete account” yourself/);
    assert.ok(!inner.calls.some((c) => c.startsWith("act:tap")));
    // No screenshot (a brain without eyes): tap_at is refused with a reason, not guessed.
    const s = phone();
    s.state.app = "com.android.settings";
    const ai3 = brain(['{"do":"tap_at","x":500,"y":500}', (prompt) => { assert.match(prompt, /no screenshot to point at/); return '{"do":"done","say":"ok"}'; }]);
    await A_run(s, "tap", { think: ai3.think });
  }

  // 12. Swipes, keys, and the same step on the same screen three times.
  {
    const p = phone();
    p.state.app = "com.android.settings";
    const touches = [], keys = [];
    const act = p.native.act;
    p.native.act = async (args) => { if (args.op === "swipe") touches.push(args); return act(args); };
    p.native.phoneAction = async (k) => { keys.push(k); return true; };
    await A_run(p, "next photo, then notifications", { think: brain(['{"do":"swipe","dir":"left"}', '{"do":"key","key":"notifications"}', '{"do":"done","say":"ok"}']).think });
    assert.ok(touches[0] && touches[0].x > touches[0].x2, "a left swipe moves the finger right to left");
    // A double tap is two touches on the same spot.
    const d = phone();
    d.state.app = "com.android.settings";
    const taps = [];
    const dact = d.native.act;
    d.native.act = async (args) => { if (args.op === "tap") taps.push([args.x, args.y]); return dact(args); };
    d.native.screen = async () => ({ app: "com.android.settings", w: 1000, h: 2000, items: [{ n: 1, text: "Photo", kind: "button", x: 0, y: 0, w: 1000, h: 1000 }] });
    await A_run(d, "zoom in", { think: brain(['{"do":"double_tap","n":1}', '{"do":"done","say":"ok"}']).think });
    assert.deepEqual(taps, [[500, 500], [500, 500]]);
    // A long press on a harmless label inside a risky button is refused too.
    const lp = phone();
    lp.native.screen = async () => ({ app: "com.android.settings", w: 1000, h: 2000, items: [
      { n: 1, text: "Delete account", kind: "button", x: 0, y: 800, w: 1000, h: 300 },
      { n: 2, text: "Signed in as you", kind: "text", x: 300, y: 900, w: 400, h: 100 },
    ] });
    const lr = await A_run(lp, "hold it", { think: brain(['{"do":"long_press","n":2}']).think });
    assert.match(lr.text, /tap “Delete account” yourself/);
    assert.ok(!lp.calls.some((c) => c.startsWith("act:longpress")), "the risky parent is never pressed");
    // Swiping through photos: the list stays the same but the picture changes, so it isn't a repeat.
    const g = phone();
    g.state.app = "com.android.settings";
    let shotNo = 0;
    g.native.snapshot = async () => ({ image: ("P" + (++shotNo)).repeat(90), w: 1000, h: 2000 });
    const gp = brain([
      '{"do":"swipe","dir":"left"}', '{"do":"swipe","dir":"left"}', '{"do":"swipe","dir":"left"}',
      (prompt) => { assert.doesNotMatch(prompt, /third time on this same screen/, "a new photo each time is progress"); return '{"do":"done","say":"ok"}'; },
    ]);
    await A_run(g, "show me three photos", { think: gp.think, see: true });
    assert.deepEqual(keys, ["notifications"]);
    const q = phone();
    q.state.app = "com.android.settings";
    const ai = brain([
      '{"do":"scroll","dir":"down"}', '{"do":"scroll","dir":"down"}', '{"do":"scroll","dir":"down"}',
      (prompt) => { assert.match(prompt, /third time on this same screen/); return '{"do":"done","say":"ok"}'; },
    ]);
    q.native.act = async (args) => ({ done: args.op === "scroll" });
    await A_run(q, "find it", { think: ai.think });
  }

  // 13. Drag: from one numbered control to another (and by points), never onto a risky control.
  {
    const p = phone();
    p.native.screen = async () => ({ app: "com.example.list", w: 1000, h: 2000, items: [
      { n: 1, text: "Milk", kind: "text", x: 0, y: 0, w: 1000, h: 200 },
      { n: 2, text: "Bread", kind: "text", x: 0, y: 300, w: 1000, h: 200 },
      { n: 3, text: "Delete list", kind: "button", x: 0, y: 600, w: 1000, h: 200 },
    ] });
    const swipes = [];
    p.native.act = async (args) => { if (args.op === "swipe") swipes.push(args); return { done: true }; };
    const A = load(p.native);
    const ai = brain(['{"do":"drag","from_n":1,"to_n":2}', '{"do":"done","say":"Moved."}']);
    const r = await A.run("reorder my list", { think: ai.think });
    assert.equal(r.text, "Moved.");
    assert.deepEqual([swipes[0].x, swipes[0].y, swipes[0].x2, swipes[0].y2], [500, 100, 500, 400]);
    assert.ok(swipes[0].ms >= 500, "a drag is a slow swipe");
    // A drag that starts or ends on Delete is refused before Android is asked.
    const q = phone();
    q.native.screen = p.native.screen;
    const qw = [];
    q.native.act = async (args) => { if (args.op === "swipe") qw.push(args); return { done: true }; };
    const qr = await A_run(q, "move it onto delete", { think: brain(['{"do":"drag","from_n":1,"to_n":3}']).think });
    assert.equal(qr.asked, true);
    assert.match(qr.text, /Delete list/);
    assert.equal(qw.length, 0, "the risky endpoint was never touched");
    // Point-to-point drags use the screenshot's 0-1000 coordinates.
    const d = phone();
    d.native.snapshot = async () => ({ image: "AAAA", w: 1000, h: 2000 });
    d.native.screen = async () => ({ app: "com.example.map", w: 1000, h: 2000, items: [] });
    const dots = [];
    d.native.act = async (args) => { if (args.op === "swipe") dots.push(args); return { done: true }; };
    await A_run(d, "pan the map", { think: brain(['{"do":"drag","x":100,"y":100,"x2":500,"y2":500}', '{"do":"done","say":"ok"}']).think, see: true });
    assert.deepEqual([dots[0].x, dots[0].y, dots[0].x2, dots[0].y2], [100, 200, 500, 1000]);
  }

  // 14. Scroll to a control by its words, with a step limit and a stop at the bottom.
  {
    const p = phone();
    let scrolled = 0;
    p.native.screen = async () => ({ app: "com.android.settings", w: 1000, h: 2000, items: scrolled
      ? [{ n: 2, text: "Privacy", kind: "button" }]
      : [{ n: 1, text: "Storage", kind: "text" }] });
    p.native.act = async (args) => { if (args.op === "scroll") scrolled++; return { done: true }; };
    const ai = brain(['{"do":"scroll_to","find":"Privacy"}', '{"do":"done","say":"Found."}']);
    const r = await A_run(p, "find privacy", { think: ai.think });
    assert.equal(r.text, "Found.");
    assert.equal(scrolled, 1);
    assert.match(ai.prompts[1].prompt, /scrolled until “Privacy” was on screen/);
    // Already on screen: no scrolling.
    const q = phone();
    q.native.screen = async () => ({ app: "com.android.settings", items: [{ n: 1, text: "Privacy", kind: "button" }] });
    let qscroll = 0;
    q.native.act = async (args) => { if (args.op === "scroll") qscroll++; return { done: true }; };
    await A_run(q, "find privacy", { think: brain(['{"do":"scroll_to","find":"privacy"}', '{"do":"done","say":"ok"}']).think });
    assert.equal(qscroll, 0, "it was already visible");
    // The screen stops moving: it says so instead of scrolling for ever.
    const s = phone();
    s.native.screen = async () => ({ app: "com.android.settings", items: [{ n: 1, text: "Storage", kind: "text" }] });
    let sscroll = 0;
    s.native.act = async (args) => { if (args.op === "scroll") sscroll++; return { done: true }; };
    const sai = brain(['{"do":"scroll_to","find":"Privacy"}', (prompt) => {
      assert.match(prompt, /couldn't find “Privacy”/);
      return '{"do":"done","say":"ok"}';
    }]);
    await A_run(s, "find privacy", { think: sai.think });
    assert.equal(sscroll, 1, "one scroll showed the screen can't move further");
  }

  console.log("Phone agent: storage answer, risky refusal, own page, lock, Stop, parsing, screenshots, points, drag, scroll-to, swipes, keys, plan and repeat guard pass.");
})().catch((e) => { console.error(e); process.exitCode = 1; });
