// The orb over other apps and the glowing edges, from the real page code
// (docs/app/index.html): they show while Izuki works or talks and go away
// when it's done. The old repeat kept the mode it started with, so the orb
// said "Working… tap to stop" for ever after a task had finished.
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const html = fs.readFileSync(path.resolve(__dirname, "../../docs/app/index.html"), "utf8");
const start = html.indexOf("  let turnCtx = null;");
const end = html.indexOf("  const setOrb = (mode) => {");
assert.ok(start > 0 && end > start, "the orb block is where the test expects it");

function harness({ glowOn = true } = {}) {
  const orb = [], glow = [];
  const intervals = new Map();
  let id = 0;
  const autopilot = { state: { running: false } };
  const ctx = vm.createContext({
    console,
    store: { get: (_, v) => v },
    document: { hidden: true },
    setInterval: (fn) => { intervals.set(++id, fn); return id; },
    clearInterval: (n) => intervals.delete(n),
    window: {
      IzukiAutopilot: autopilot,
      IzukiEdge: { enabled: () => glowOn, useNative() {} },
      IzukiNative: {
        installed: () => true,
        orb: (state, text) => { orb.push(`${state}:${text}`); return Promise.resolve(true); },
        glow: (state) => { glow.push(state); return Promise.resolve(true); },
        controlStatus: () => Promise.resolve(true),
      },
    },
  });
  vm.runInContext("let orbState = \"\";\n" + html.slice(start, end) + `
    globalThis.t = {
      sync: syncNativeOrb,
      checkGlow: checkNativeGlow,
      set: (o) => { if ("agentBusy" in o) agentBusy = o.agentBusy; if ("orbState" in o) orbState = o.orbState; if ("turnCtx" in o) turnCtx = o.turnCtx; if ("keepOrb" in o) keepOrb = o.keepOrb; },
    };`, ctx);
  const tick = () => { for (const fn of [...intervals.values()]) fn(); };
  return { t: ctx.t, ctx, orb, glow, intervals, tick, autopilot };
}

(async () => {
  // 1. The phone agent works in the background, then finishes: the next beat takes the orb down.
  {
    const h = harness();
    await h.t.checkGlow();
    h.t.set({ agentBusy: true });
    h.t.sync();
    assert.equal(h.orb.at(-1), "think:Working…");
    assert.equal(h.glow.at(-1), "think", "the light shows while the agent works");
    assert.ok(h.intervals.size > 0, "the orb and the light are renewed while it works");
    h.t.set({ agentBusy: false });
    h.tick();
    assert.equal(h.orb.at(-1), "idle:", "a finished task no longer says “Working… tap to stop”");
    assert.equal(h.glow.at(-1), "", "the light goes out when the task is done");
    assert.equal(h.intervals.size, 0, "nothing keeps running once it's done");
  }

  // 2. An Autopilot run, kept orb: after the run the orb rests, ready for a tap.
  {
    const h = harness();
    await h.t.checkGlow();
    h.t.set({ keepOrb: true });
    h.autopilot.state.running = true;
    h.t.sync();
    assert.equal(h.orb.at(-1), "think:Working…");
    h.autopilot.state.running = false;
    h.tick();
    assert.equal(h.orb.at(-1), "rest:Tap to talk");
    assert.equal(h.glow.at(-1), "");
  }

  // 3. Talking, then quiet; listening in the app shows the light but never the orb.
  {
    const h = harness();
    await h.t.checkGlow();
    h.t.set({ orbState: "speaking" });
    h.t.sync();
    assert.equal(h.orb.at(-1), "talk:Tap to stop");
    assert.equal(h.glow.at(-1), "talk");
    h.t.set({ orbState: "listening" });
    h.t.sync();
    assert.equal(h.orb.at(-1), "idle:", "leaving the app is not listening");
    assert.equal(h.glow.at(-1), "listen");
    h.t.set({ orbState: "" });
    h.t.sync();
    assert.equal(h.glow.at(-1), "");
  }

  // 4. The switch off: no light at all, the orb still works.
  {
    const h = harness({ glowOn: false });
    await h.t.checkGlow();
    h.t.set({ agentBusy: true });
    h.t.sync();
    assert.equal(h.glow.at(-1), "", "switched off: the light stays off");
    assert.equal(h.orb.at(-1), "think:Working…");
  }

  // 5. A voice turn draws its own orb and light: the page stays out of the way.
  {
    const h = harness();
    await h.t.checkGlow();
    const before = h.glow.length;
    h.t.set({ turnCtx: { id: "x" }, agentBusy: true });
    h.t.sync();
    assert.equal(h.glow.length, before, "no page light during a voice turn");
    assert.equal(h.orb.length, 0, "no page orb during a voice turn");
  }

  console.log("Orb and edges: shown while working or talking, gone when done, switch respected, voice turns left alone.");
})().catch((e) => { console.error(e); process.exit(1); });
