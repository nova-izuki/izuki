const assert = require("assert/strict");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const calls = [];
let screen = {
  app: "YouTube",
  items: [
    { n: 1, text: "Search", kind: "button" },
    { n: 2, text: "Search YouTube", kind: "box" },
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
  assert.deepEqual(calls, ["launch:YouTube", "act:tapText:Search", "act:click:2", "act:type:lofi:2", "act:submit"], "steps run in order and type into the real field");
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
  assert.deepEqual(calls, ["act:click:1", "act:type:hello:1"], "it types, but never presses Enter without a Search control");
  assert.match(A.state.log.at(-1).text, /didn't press Enter/);

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
    items: [{ n: 1, text: "Search", kind: "button" }, { n: 2, text: "Search YouTube", kind: "box" }],
  };
  calls.length = 0;
  assert.equal(await A.run("scroll down twice"), true);
  assert.deepEqual(calls, ["act:scroll", "act:scroll"], "a repeated scroll runs the requested number of times");

  console.log("Autopilot: visible steps, field targeting, safety refusals and repeats pass.");
})().catch((error) => { console.error(error); process.exitCode = 1; });
