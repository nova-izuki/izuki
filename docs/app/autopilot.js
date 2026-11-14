// Autopilot: a short, visible sequence of real phone actions.
//
// It is deliberately not a hidden agent. Every step is shown as it runs, Stop
// works between steps, and it only navigates, searches, types and presses what
// the person asked for. It never sends a message, pays, buys or deletes: those
// controls are refused even if a planned tap lands on one.
(() => {
  "use strict";
  const bridge = () => window.IzukiNative;
  const listeners = new Set();
  const state = {
    running: false,
    goal: "",
    label: "",
    step: 0,
    total: 0,
    log: [],
    cancelled: false,
  };
  let wake = null;

  const emit = () => {
    const view = { ...state, log: state.log.slice(-60) };
    for (const fn of listeners) {
      try { fn(view); } catch { /* a listener must not break a run */ }
    }
  };
  const add = (text, kind = "step") => {
    state.log.push({ text, kind, at: Date.now() });
    if (state.log.length > 120) state.log.shift();
    emit();
  };
  const norm = (s) => String(s || "").replace(/\s+/g, " ").trim().toLowerCase();
  const sleep = (ms) => new Promise((resolve) => {
    if (state.cancelled) { resolve(false); return; }
    const timer = setTimeout(() => { wake = null; resolve(true); }, ms);
    wake = () => { clearTimeout(timer); wake = null; resolve(false); };
  });
  const assertRunning = () => {
    if (state.cancelled) throw new Error("Stopped.");
  };
  const needBridge = () => {
    const n = bridge();
    if (!n?.screen || !n?.act) throw new Error("Install the Android companion and turn on its Accessibility control first.");
    return n;
  };
  async function readScreen() {
    const n = needBridge();
    const screen = await n.screen();
    if (!screen) throw new Error("The phone screen isn't readable — unlock it and check Accessibility control.");
    return screen;
  }

  /**
   * Lock-aware pause: never touch a locked phone, but don't throw the routine
   * away either. Wait visibly for the person to unlock, then continue exactly
   * where the plan stopped. Stop still wins at any moment.
   */
  async function waitForUnlocked() {
    const n = needBridge();
    if (!n.device) return;
    const until = Date.now() + 90_000;
    let announced = false;
    while (true) {
      assertRunning();
      const d = await n.device().catch(() => null);
      if (!d) return;
      if (!d.locked && d.screenOn !== false) {
        if (announced) add("Unlocked. Continuing.", "done");
        return;
      }
      if (!announced) {
        add(d.locked
          ? "Phone is locked. Unlock it — I'll wait and continue."
          : "Phone screen is off. Turn it on — I'll wait and continue.", "warn");
        announced = true;
      }
      if (Date.now() > until) throw new Error("The phone stayed locked. Unlock it, then run the routine again.");
      if (!(await sleep(800))) throw new Error("Stopped.");
    }
  }
  async function waitFor(text, timeout = 7000) {
    const wanted = norm(text);
    const until = Date.now() + timeout;
    while (Date.now() < until) {
      assertRunning();
      const screen = await readScreen().catch(() => null);
      const hit = screen?.items?.find((item) => norm(item.text).includes(wanted));
      if (hit) return hit;
      if (!(await sleep(450))) throw new Error("Stopped.");
    }
    return null;
  }
  async function openApp(name) {
    const n = needBridge();
    const opened = await n.launch(name);
    if (!opened?.name) throw new Error(`I couldn't find ${name} on this phone.`);
    add(`Opened ${opened.name}.`, "done");
    await sleep(900);
    return opened;
  }
  async function tapText(label) {
    const n = needBridge();
    const result = await n.act({ op: "tapText", text: label });
    if (!result?.done) throw new Error(`I couldn't find “${label}” on this screen.`);
    add(`Tapped “${label}”.`, "done");
    await sleep(450);
  }
  async function tapNumber(n) {
    const result = await needBridge().act({ op: "click", n });
    if (!result?.done) throw new Error("That control moved before I could press it.");
    add("Pressed it.", "done");
    await sleep(450);
  }
  async function typeText(text) {
    const n = needBridge();
    // Find a text field on this screen, focus it, then set the words. If the
    // app uses the already-focused field, n = 0 still works.
    let screen = await readScreen();
    let box = screen.items?.find((item) => item.kind === "box" && item.focused)
      || screen.items?.find((item) => item.kind === "box");
    if (!box) {
      await sleep(500);
      screen = await readScreen();
      box = screen.items?.find((item) => item.kind === "box");
    }
    if (box) await n.act({ op: "click", n: box.n });
    const result = await n.act({ op: "type", text, n: box?.n || 0 });
    if (!result?.done) throw new Error("I couldn't type into this screen. Open a search box first.");
    add(`Typed “${text}”.`, "done");
    await sleep(250);
  }
  async function submit() {
    const n = needBridge();
    const screen = await readScreen();
    const items = Array.isArray(screen.items) ? screen.items : [];
    // Only submit where the screen itself shows a Search/Go control. Pressing
    // Enter in a chat box would send a message, which Autopilot must never do.
    const searchable = items.some((item) => /\b(search|go)\b/i.test(String(item.text || "")));
    if (!searchable) throw new Error("I couldn't find a Search control on this screen, so I didn't press Enter.");
    let result = await n.act({ op: "submit" });
    if (!result?.done) {
      for (const label of ["Search", "Go"]) {
        result = await n.act({ op: "tapText", text: label });
        if (result?.done) break;
      }
    }
    if (!result?.done) throw new Error("I couldn't find the Search or Enter control.");
    add("Pressed Enter.", "done");
    await sleep(700);
  }
  async function scroll(dir, times) {
    const n = needBridge();
    const count = Math.max(1, Math.min(8, Number(times) || 1));
    for (let i = 0; i < count; i++) {
      assertRunning();
      const result = await n.act({ op: "scroll", dir });
      if (!result?.done) throw new Error("This screen doesn't scroll.");
    }
    add(`Scrolled ${dir}${count > 1 ? ` ${count} times` : ""}.`, "done");
    await sleep(350);
  }
  async function key(name, label) {
    const n = needBridge();
    const result = await n.act({ op: name });
    if (!result?.done) throw new Error(`I couldn't ${label}.`);
    add(`${label[0].toUpperCase()}${label.slice(1)}.`, "done");
    await sleep(350);
  }
  async function media(key, label) {
    const n = needBridge();
    const done = await n.media(key);
    if (!done) throw new Error("The phone didn't accept that media control.");
    add(label, "done");
  }
  async function volume(dir, label) {
    const n = needBridge();
    const done = await n.volume(dir);
    if (!done) throw new Error("The phone didn't accept that volume control.");
    add(label, "done");
  }

  const DANGER = /\b(send|pay|buy|order|purchase|delete|erase|remove|uninstall|confirm|place order|check ?out)\b/i;
  const safeTap = (label) => {
    if (DANGER.test(label)) {
      return { label: `Tap “${label}”`, run: () => { throw new Error(`I won't press “${label}” by myself — that one needs your finger.`); } };
    }
    return { label: `Tap “${label}”`, run: () => tapText(label) };
  };

  /** Turn a short goal into visible steps. No AI, no hidden plan. */
  function plan(raw) {
    const goal = String(raw || "").trim().replace(/[.!?]+$/, "");
    if (!goal) return null;
    const lower = goal.toLowerCase();
    let m;
    if ((m = goal.match(/^(?:open|launch|start)\s+(.+?)\s+(?:and|then)\s+(?:search|find|look up|play)\s+(?:for\s+)?(.+)$/i))) {
      const app = m[1].trim();
      const query = m[2].trim();
      return {
        title: `Open ${app}, then search for ${query}`,
        steps: [
          { label: `Open ${app}`, run: () => openApp(app) },
          { label: `Search for ${query}`, run: async () => { await tapText("Search").catch(() => {}); await typeText(query); await submit(); } },
        ],
      };
    }
    if ((m = goal.match(/^(?:open|launch|start)\s+(.+)$/i))) {
      const app = m[1].trim();
      return { title: `Open ${app}`, steps: [{ label: `Open ${app}`, run: () => openApp(app) }] };
    }
    if ((m = goal.match(/^(?:search|look up|google)\s+(?:for\s+)?(.+)$/i))) {
      const query = m[1].trim();
      return { title: `Search for ${query}`, steps: [{ label: `Search for ${query}`, run: async () => { await typeText(query); await submit(); } }] };
    }
    if ((m = goal.match(/^(?:tap|press|click)\s+(.+)$/i))) {
      return { title: `Tap ${m[1].trim()}`, steps: [safeTap(m[1].trim())] };
    }
    if ((m = goal.match(/^type\s+(.+)$/i))) {
      const text = m[1].trim();
      return { title: `Type ${text}`, steps: [{ label: `Type ${text}`, run: () => typeText(text) }] };
    }
    if ((m = goal.match(/^scroll\s+(up|down)(?:\s+(\d+|twice|three times|two times))?$/i))) {
      const dir = m[1].toLowerCase();
      const times = /twice|two/.test(m[2] || "") ? 2 : /three/.test(m[2] || "") ? 3 : Number(m[2] || 1);
      return { title: `Scroll ${dir}`, steps: [{ label: `Scroll ${dir}`, run: () => scroll(dir, times) }] };
    }
    if (/^(?:go\s+)?home$/i.test(lower)) return { title: "Go home", steps: [{ label: "Go home", run: () => key("home", "Went home") }] };
    if (/^(?:go\s+)?back$/i.test(lower)) return { title: "Go back", steps: [{ label: "Go back", run: () => key("back", "Went back") }] };
    if (/^(?:show\s+)?(?:recent|recent apps|app switcher)$/i.test(lower)) return { title: "Recent apps", steps: [{ label: "Recent apps", run: () => key("recents", "Opened recent apps") }] };
    if (/^(?:open\s+)?notifications$/i.test(lower)) return { title: "Notifications", steps: [{ label: "Notifications", run: () => key("notifications", "Opened notifications") }] };
    if (/^(?:lock|lock\s+(?:my\s+|the\s+)?phone)$/i.test(lower)) return { title: "Lock the phone", steps: [{ label: "Lock the phone", run: () => key("lock", "Locked the phone") }] };
    if (/^(?:take\s+a\s+)?screenshot$/i.test(lower)) return { title: "Screenshot", steps: [{ label: "Take a screenshot", run: () => key("screenshot", "Took a screenshot") }] };
    if (/^(?:play|pause|resume|play\/pause)$/i.test(lower)) {
      const keyName = /pause/.test(lower) ? "pause" : /play\/pause/.test(lower) ? "playpause" : "play";
      return { title: "Media", steps: [{ label: "Press play/pause", run: () => media(keyName, "Pressed play/pause.") }] };
    }
    if (/^(?:next|next song|skip)$/i.test(lower)) return { title: "Next track", steps: [{ label: "Next track", run: () => media("next", "Skipped to the next track.") }] };
    if (/^(?:previous|previous song)$/i.test(lower)) return { title: "Previous track", steps: [{ label: "Previous track", run: () => media("previous", "Went to the previous track.") }] };
    if (/^(?:volume up|louder|turn it up)$/i.test(lower)) return { title: "Volume up", steps: [{ label: "Volume up", run: () => volume("up", "Turned the volume up.") }] };
    if (/^(?:volume down|quieter|turn it down)$/i.test(lower)) return { title: "Volume down", steps: [{ label: "Volume down", run: () => volume("down", "Turned the volume down.") }] };
    if (/^(?:read|what'?s on)\s+(?:the\s+|my\s+)?screen$/i.test(lower)) {
      return {
        title: "Read the screen",
        steps: [{
          label: "Read the screen",
          run: async () => {
            const screen = await readScreen();
            const count = Array.isArray(screen.items) ? screen.items.length : 0;
            add(`I can see ${count} control${count === 1 ? "" : "s"}${screen.app ? ` in ${screen.app}` : ""}.`, "done");
          },
        }],
      };
    }
    return null;
  }

  async function run(raw) {
    if (state.running) return false;
    const made = plan(raw);
    state.goal = String(raw || "").trim();
    state.label = made?.title || "";
    state.step = 0;
    state.total = made?.steps?.length || 0;
    state.log = [];
    state.cancelled = false;
    if (!made) {
      state.running = false;
      add("I don't know that routine yet. Try “open YouTube and search lofi”, “tap Search”, “scroll down”, or “go home”.", "bad");
      return false;
    }
    state.running = true;
    add(`Autopilot: ${made.title}`, "title");
    emit();
    try {
      for (let i = 0; i < made.steps.length; i++) {
        assertRunning();
        state.step = i + 1;
        add(`Step ${i + 1}/${made.steps.length}: ${made.steps[i].label}`, "step");
        await waitForUnlocked();
        try {
          await made.steps[i].run();
        } catch (error) {
          // A lock can land between the check and the action. The native layer
          // refuses locked actions, and its bridge may turn that refusal into
          // a null result rather than an error, so ask the phone directly.
          const phone = await needBridge().device?.().catch(() => null);
          if (phone?.locked || /locked|screen isn't readable/i.test(String(error?.message || error))) {
            await waitForUnlocked();
            await made.steps[i].run();
          } else {
            throw error;
          }
        }
        assertRunning();
      }
      add("Done. Nothing was sent, paid for or deleted.", "done");
      return true;
    } catch (error) {
      if (state.cancelled) add("Stopped.", "bad");
      else add(String(error?.message || error), "bad");
      return false;
    } finally {
      state.running = false;
      state.cancelled = false;
      emit();
    }
  }

  function stop() {
    if (!state.running) return false;
    state.cancelled = true;
    wake?.();
    add("Stopping…", "bad");
    return true;
  }

  window.IzukiAutopilot = {
    run,
    stop,
    plan: (goal) => {
      const made = plan(goal);
      return made ? { title: made.title, steps: made.steps.map((s) => s.label) } : null;
    },
    subscribe(fn) {
      listeners.add(fn);
      fn({ ...state, log: state.log.slice(-60) });
      return () => listeners.delete(fn);
    },
    get state() { return { ...state, log: state.log.slice(-60) }; },
    samples: [
      "open YouTube and search lofi",
      "open Chrome and search weather today",
      "scroll down",
      "go home",
      "lock",
    ],
  };
})();
