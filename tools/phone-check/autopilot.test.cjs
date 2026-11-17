const assert = require("assert/strict");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const calls = [];
let screen = {
  app: "YouTube",
  items: [
    { n: 1, text: "Search", kind: "button" },
    { n: 2, text: "Search YouTube", hint: "Search YouTube", kind: "box", focused: true },
    { n: 3, text: "Home", kind: "button" },
  ],
};
const window = {
  IzukiNative: {
    async launch(name) {
      const wanted = String(name);
      calls.push(`launch:${wanted}`);
      if (wanted.toLowerCase() !== "youtube") throw new Error("not installed");
      return { name: "YouTube" };
    },
    async screen() { return screen; },
    async act(args) {
      calls.push(`act:${args.op}${args.text ? `:${args.text}` : ""}${args.n ? `:${args.n}` : ""}`);
      return { done: true };
    },
    async media(key) { calls.push(`media:${key}`); return true; },
    async volume(dir) { calls.push(`volume:${dir}`); return true; },
  },
};
const context = { window, console, setTimeout, clearTimeout, Date, Promise };
vm.runInNewContext(fs.readFileSync(path.resolve(__dirname, "../../docs/app/autopilot.js"), "utf8"), context);
const A = window.IzukiAutopilot;

(async () => {
  assert.ok(A, "IzukiAutopilot is exposed");
  assert.equal(JSON.stringify(A.plan("open YouTube and search lofi")), JSON.stringify({
    title: "Open YouTube, then search for lofi",
    steps: ["Open YouTube", "Search for lofi"],
  }));
  assert.equal(JSON.stringify(A.plan("tap Search")), JSON.stringify({ title: "Tap Search", steps: ["Tap “Search”"] }));
  assert.equal(A.plan("write a poem"), null, "an unknown plan must not pretend it can run");

  calls.length = 0;
  const openedSearch = await A.run("open YouTube and search lofi");
  if (!openedSearch) console.log(A.state.log);
  assert.equal(openedSearch, true);
  // A box is already on screen: no blind "tap Search" first (it could hit Voice search).
  assert.deepEqual(calls, ["launch:YouTube", "act:click:2", "act:type:lofi:2", "act:submit"], "steps run in order and type into the real field");
  assert.match(A.state.log.at(-1).text, /Nothing was sent, paid for or deleted/);

  calls.length = 0;
  assert.equal(await A.run("tap Delete"), false, "a destructive label is refused");
  assert.deepEqual(calls, [], "nothing may be tapped for a refused label");
  assert.match(A.state.log.at(-1).text, /won't press “Delete”/);

  // A box with no Search/Go control must not fall back to Enter: that could
  // send a message in a chat app.
  screen = { app: "Messages", items: [{ n: 1, text: "Message", kind: "box" }] };
  calls.length = 0;
  assert.equal(await A.run("search hello"), false);
  // A message box is never taken for a search box: nothing is typed or sent.
  assert.deepEqual(calls, [], "a search never types into a chat message box");
  assert.match(A.state.log.at(-1).text, /search box/);

  screen = { app: "Home", items: [] };
  calls.length = 0;
  assert.equal(await A.run("go home"), true);
  assert.deepEqual(calls, ["act:home"]);

  calls.length = 0;
  assert.equal(await A.run("volume up"), true);
  assert.deepEqual(calls, ["volume:up"]);

  calls.length = 0;
  assert.equal(await A.run("next song"), true);
  assert.deepEqual(calls, ["media:next"]);

  screen = {
    app: "YouTube",
    items: [{ n: 1, text: "Search", kind: "button" }, { n: 2, text: "Search YouTube", hint: "Search YouTube", kind: "box", focused: true }],
  };
  calls.length = 0;
  assert.equal(await A.run("scroll down twice"), true);
  assert.deepEqual(calls, ["act:scroll", "act:scroll"], "a repeated scroll runs the requested number of times");

  // A lock is a pause, not a lost task: the routine waits, then continues.
  let lockPolls = 0;
  window.IzukiNative.device = async () => {
    lockPolls++;
    return { locked: lockPolls === 1, screenOn: true };
  };
  screen = { app: "Home", items: [] };
  calls.length = 0;
  assert.equal(await A.run("go home"), true);
  assert.deepEqual(calls, ["act:home"], "a locked phone waits and then runs the same step once");
  assert.match(A.state.log.map((x) => x.text).join(" "), /Phone is locked.*Unlocked/);

  // A search icon with no visible box: open it, then type into the field it
  // reveals instead of failing with a generic "open a search box" message.
  screen = { app: "YouTube", items: [{ n: 1, text: "Search", kind: "button" }] };
  const actBefore = window.IzukiNative.act;
  window.IzukiNative.act = async (args) => {
    calls.push(`act:${args.op}${args.text ? `:${args.text}` : ""}${args.n ? `:${args.n}` : ""}`);
    if (args.op === "click" && args.n === 1) {
      screen = { app: "YouTube", items: [{ n: 1, text: "Search", kind: "button" }, { n: 2, text: "Search YouTube", hint: "Search YouTube", kind: "box", focused: true }] };
    }
    return { done: true };
  };
  calls.length = 0;
  assert.equal(await A.run("search hello"), true);
  assert.deepEqual(calls, ["act:click:1", "act:click:2", "act:type:hello:2", "act:submit"], "the search icon opens the field first");
  window.IzukiNative.act = actBefore;

  // "Opened" only once Android shows the app: a launch that never reaches
  // the front is a failure, not a success.
  window.IzukiNative.launch = async (name) => { calls.push(`launch:${name}`); return { name: "YouTube", id: "com.google.android.youtube" }; };
  window.IzukiNative.waitForApp = async () => false;
  calls.length = 0;
  assert.equal(await A.run("open YouTube"), false);
  assert.match(A.state.log.at(-1).text, /didn't come to the front/);
  window.IzukiNative.waitForApp = async (id) => id === "com.google.android.youtube";
  assert.equal(await A.run("open YouTube"), true);
  assert.match(A.state.log.map((x) => x.text).join(" "), /Opened YouTube/);

  // The search opener is never "Voice search" (that opens the microphone).
  screen = { app: "YouTube", items: [{ n: 1, text: "Voice search", kind: "button" }, { n: 2, text: "Search", kind: "button" }] };
  window.IzukiNative.act = async (args) => {
    calls.push(`act:${args.op}${args.text ? `:${args.text}` : ""}${args.n ? `:${args.n}` : ""}`);
    if (args.op === "click" && args.n === 2) screen = { app: "YouTube", items: [{ n: 1, text: "Voice search", kind: "button" }, { n: 3, text: "Search YouTube", hint: "Search YouTube", kind: "box", focused: true }] };
    if (args.op === "submit") screen = { app: "YouTube", items: [{ n: 4, text: "lofi hip hop radio", kind: "button" }] };
    return { done: true, verified: true };
  };
  calls.length = 0;
  assert.equal(await A.run("search lofi"), true);
  assert.deepEqual(calls, ["act:click:2", "act:click:3", "act:type:lofi:3", "act:submit"], "the plain Search button opens the field, not Voice search");
  assert.match(A.state.log.map((x) => x.text).join(" "), /results are on screen/);

  // Draft contents never authorize searching, even with a Search button
  // somewhere else. An address field's own metadata does authorize it.
  const fastContext = { window, console, Date, Promise, clearTimeout,
    setTimeout: (fn) => setTimeout(fn, 0) };
  vm.runInNewContext(fs.readFileSync(path.resolve(__dirname, "../../docs/app/autopilot.js"), "utf8"), fastContext);
  const fast = window.IzukiAutopilot;
  for (const text of ["Search for flights", "Please search for flights"]) {
    screen = { app: "Messages", items: [{ n: 1, kind: "box", text, focused: true }] };
    calls.length = 0;
    assert.equal(await fast.run("search cats"), false);
    assert.deepEqual(calls, [], "a person's draft is not search metadata");
  }
  screen = { app: "Browser", items: [{ n: 1, kind: "box", text: "", hint: "Address", id: "url_bar", focused: true }] };
  window.IzukiNative.act = async (args) => {
    calls.push(args.op);
    if (args.op === "type") screen.items[0].text = args.text;
    if (args.op === "submit") screen = { app: "Browser", items: [{ kind: "text", text: "Results" }] };
    return { done: true };
  };
  calls.length = 0;
  assert.equal(await fast.run("search kittens"), true, "an address field works without a separate Search button");
  assert.deepEqual(calls, ["click", "type", "submit"]);
  // Some apps expose their search purpose only as a content description;
  // the field's visible text is not evidence that it is a search box.
  screen = { app: "Browser", items: [{ n: 1, kind: "box", text: "Search", desc: "Search", focused: true }, { n: 2, kind: "button", text: "Go" }] };
  window.IzukiNative.act = async (args) => {
    calls.push(args.op);
    if (args.op === "type") screen.items[0].text = args.text;
    if (args.op === "submit") screen = { app: "Browser", items: [{ kind: "text", text: "Results" }] };
    return { done: true };
  };
  calls.length = 0;
  assert.equal(await fast.run("search otters"), true, "a description-only search field works");
  assert.deepEqual(calls, ["click", "type", "submit"]);
  screen = { app: "Messages", items: [{ n: 1, kind: "box", hint: "Search", focused: true }, { n: 2, kind: "button", text: "Search" }] };
  window.IzukiNative.act = async (args) => {
    calls.push(args.op);
    if (args.op === "type") screen.items[0] = { n: 1, kind: "box", hint: "Message", text: args.text, focused: true };
    return { done: true };
  };
  calls.length = 0;
  assert.equal(await fast.run("search kittens"), false, "a field changed to a composer must not be submitted");
  assert.deepEqual(calls, ["click", "type"], "an unrelated Search control cannot authorize sending");

  // A label that isn't there says so; nothing else is pressed.
  window.IzukiNative.act = async (args) => { calls.push(`act:${args.op}:${args.text || ""}`); return { done: false, reason: "not-found" }; };
  window.IzukiNative.why = (r, what) => (r?.reason === "not-found" ? `I couldn't find ${what} on this screen.` : "");
  calls.length = 0;
  assert.equal(await A.run("tap Downloads"), false);
  assert.deepEqual(calls, ["act:tapText:Downloads"]);
  assert.match(A.state.log.at(-1).text, /couldn't find “Downloads”/);

  // Anything that isn't a quick routine goes to the AI phone agent, in this same log.
  const asked = [];
  window.IzukiBrain = { agentThink: async () => "{}" };
  window.IzukiAgent = {
    busy: false,
    async run(goal, ctx) {
      asked.push({ goal, via: ctx.viaAutopilot, think: typeof ctx.think });
      ctx.onStep("Opening Storage…");
      return { ok: true, text: "Apps use 38 GB; you have 41 GB free." };
    },
  };
  assert.equal(await A.run("open my files and check what's taking space"), true);
  assert.deepEqual(asked, [{ goal: "open my files and check what's taking space", via: true, think: "function" }]);
  assert.ok(A.state.log.some((l) => l.text === "Opening Storage"), "the agent's steps show in the log");
  assert.equal(A.state.log.at(-1).text, "Apps use 38 GB; you have 41 GB free.");
  assert.equal(A.state.running, false);
  window.IzukiBrain = undefined;
  assert.equal(await A.run("make me a sandwich"), false);
  assert.match(A.state.log.at(-1).text, /Add an AI key/, "without a brain it says what's missing");
  window.IzukiAgent = undefined;

  console.log("Autopilot: visible steps, field targeting, safety refusals, repeats, lock resume and the AI fallback pass.");
})().catch((error) => { console.error(error); process.exitCode = 1; });
