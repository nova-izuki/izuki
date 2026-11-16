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
  }

  console.log("Phone agent: storage answer, risky refusal, own page, lock, Stop and parsing pass.");
})().catch((e) => { console.error(e); process.exitCode = 1; });
