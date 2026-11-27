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
    // Stop pressed while the screen was being read: nothing more happens.
    assertRunning();
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
  /** What the screen looks like, cheaply: enough to tell whether an action changed it. */
  const look = (screen) => `${screen?.app || ""}|${(screen?.items || []).slice(0, 40).map((i) => `${i.kind}:${i.text}${i.focused ? "*" : ""}`).join("|")}`;

  /** Wait (briefly) for the screen to differ from `before`; the new screen, or null. */
  async function changedFrom(before, timeout = 2500) {
    const until = Date.now() + timeout;
    while (Date.now() < until) {
      if (!(await sleep(350))) throw new Error("Stopped.");
      const now = await readScreen().catch(() => null);
      if (now && look(now) !== before) return now;
    }
    return null;
  }

  async function openApp(name) {
    const n = needBridge();
    const opened = await n.launch(name);
    if (!opened?.name) throw new Error(`I couldn't find ${name} on this phone.`);
    // "Opened" only once Android shows that app in front (a slow phone can
    // take seconds; the old fixed wait typed into a splash screen).
    const shown = opened.id && n.waitForApp ? await n.waitForApp(opened.id, 9000) : null;
    assertRunning();
    if (shown === false) throw new Error(`I asked Android to open ${opened.name}, but it didn't come to the front.`);
    if (shown) add(`Opened ${opened.name}.`, "done");
    else add(`Asked Android to open ${opened.name} (I couldn't check that it came to the front).`, "warn");
    await sleep(shown ? 500 : 1200);
    return opened;
  }
  async function tapText(label) {
    const n = needBridge();
    const before = look(await readScreen().catch(() => null));
    assertRunning();
    const result = await n.act({ op: "tapText", text: label });
    if (!result?.done) throw new Error(n.why?.(result, `“${label}”`) || `I couldn't find “${label}” on this screen.`);
    const pressed = result.matched && result.matched.toLowerCase() !== String(label).toLowerCase() ? `“${result.matched}”` : `“${label}”`;
    // Android accepting the press isn't proof: look for the screen to react.
    const after = await changedFrom(before, 2000);
    if (after) add(`Tapped ${pressed}.`, "done");
    else add(`Pressed ${pressed}, but nothing on screen changed — it may need another look.`, "warn");
  }
  async function tapNumber(n) {
    const result = await needBridge().act({ op: "click", n });
    if (!result?.done) throw new Error("That control moved before I could press it.");
    add("Pressed it.", "done");
    await sleep(450);
  }

  /** A text box on this screen: the focused one, else the first. */
  const boxIn = (screen) => screen?.items?.find((item) => item.kind === "box" && item.focused)
    || screen?.items?.find((item) => item.kind === "box") || null;
  /** A box that says it's for searching (its words or its id): never a message box. */
  const SEARCHY = /(^|[^a-z])(search|find|query|url|address|omnibox|urlbar|searchbar|searchbox)([^a-z]|$)/i;
  // A field's purpose comes from its metadata, never a person's draft.
  const forSearch = (item) => SEARCHY.test(String(item?.hint || ""))
    || SEARCHY.test(String(item?.id || ""))
    || SEARCHY.test(String(item?.desc || ""));
  const searchBoxIn = (screen) => {
    const boxes = (screen?.items || []).filter((item) => item.kind === "box" && forSearch(item));
    return boxes.find((item) => item.focused) || boxes[0] || null;
  };
  /** A control that opens search — never "Voice search" or the microphone. */
  const searchOpener = (screen) => {
    // Both the label and the view id: an unlabelled "voice_search" icon is still the microphone.
    const items = (screen?.items || []).filter((item) => item.kind !== "box"
      && !/\b(voice|mic|microphone|history|clear)\b/i.test(String(item.text || ""))
      && !/(voice|mic)/i.test(String(item.id || "")));
    return items.find((item) => /^\s*search\s*$/i.test(String(item.text || "")))
      || items.find((item) => /\b(search|find)\b/i.test(String(item.text || "")) || /search/i.test(String(item.id || "")))
      || null;
  };

  async function typeText(text, { search = false } = {}) {
    const n = needBridge();
    // Find a text field on this screen, focus it, then set the words. A
    // search only ever types into a search box: a chat's message box is
    // never mistaken for one.
    const pick = search ? searchBoxIn : boxIn;
    let screen = await readScreen();
    let box = pick(screen);
    if (!box) {
      // A search icon is often the way in: open it, then wait for the field
      // it reveals. The old code typed at nothing ("open a search box first").
      const opener = searchOpener(screen);
      assertRunning();
      if (opener) {
        const opened = await n.act({ op: "click", n: opener.n });
        if (opened?.done) add(`Opened ${opener.text ? `“${opener.text}”` : "search"}.`, "done");
      }
      const until = Date.now() + 4000;
      while (!box && Date.now() < until) {
        if (!(await sleep(400))) throw new Error("Stopped.");
        screen = await readScreen().catch(() => screen);
        assertRunning();
        box = pick(screen);
      }
    }
    assertRunning();
    // A focused box the listing missed (deep in a page, or past its limit)
    // still takes the words: n = 0 types into the focused field.
    if (box) {
      await n.act({ op: "click", n: box.n });
      assertRunning();
    }
    // n = 0 types into whatever box is focused, so a search never does that.
    if (!box && search) throw new Error("I couldn't find this app's search box. Open its search, then say the request again.");
    const result = await n.act({ op: "type", text, n: box ? box.n : 0 });
    if (!box && result?.reason === "no-box") {
      throw new Error("I can't see a text box on this screen, and no Search button opened one. Open the search field, then say the request again.");
    }
    if (!result?.done) {
      throw new Error(n.why?.(result, "") || `I found the text box but couldn't type in it (${result?.reason || "Android gave no reason"}).`);
    }
    if (result.verified === false) add(`Typed “${text}”, but the box didn't show it back — check it.`, "warn");
    else add(`Typed “${text}”.`, "done");
    await sleep(250);
  }
  async function submit() {
    const n = needBridge();
    const screen = await readScreen();
    // Recheck the focused field on this fresh screen. A Search button
    // elsewhere cannot authorize Enter in a message composer.
    const box = (screen.items || []).find((item) => item.kind === "box" && item.focused);
    if (!box || !forSearch(box)) throw new Error("The focused box isn't a search or address box, so I didn't press Enter.");
    const before = look(screen);
    assertRunning();
    let result = await n.act({ op: "submit" });
    if (!result?.done) {
      for (const label of ["Search", "Go"]) {
        result = await n.act({ op: "tapText", text: label });
        if (result?.done) break;
      }
    }
    if (!result?.done) throw new Error(n.why?.(result, "") || "I couldn't find the Search or Enter control.");
    const after = await changedFrom(before, 3500);
    if (after) add("Searched — the results are on screen.", "done");
    else add("Pressed Enter, but the screen didn't change yet — have a look.", "warn");
  }
  async function scroll(dir, times) {
    const n = needBridge();
    const count = Math.max(1, Math.min(8, Number(times) || 1));
    for (let i = 0; i < count; i++) {
      assertRunning();
      const result = await n.act({ op: "scroll", dir });
      if (!result?.done) {
        if (i > 0 && /at-(end|top)/.test(String(result?.reason || ""))) break; // reached the end: that's done
        throw new Error(n.why?.(result, "") || "This screen doesn't scroll.");
      }
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
    // An installed app's exact name first: "open Learn and Play Music" is that
    // app, not "open Learn, then play Music".
    if ((m = goal.match(/^(?:open|launch|start)\s+(.+)$/i)) && window.IzukiNative?.isAppName?.(m[1]) === true) {
      const app = m[1].trim();
      return { title: `Open ${app}`, steps: [{ label: `Open ${app}`, run: () => openApp(app) }] };
    }
    // The installed apps couldn't be read (not yet, failed or empty): "open
    // X and play Y" might be one app's name, so the AI agent, which sees the
    // phone, decides instead of a guess.
    const appsUnknown = window.IzukiNative?.isAppName?.("") === null;
    if (!appsUnknown && (m = goal.match(/^(?:open|launch|start)\s+(.+?)\s+(?:and|then)\s+(?:search|find|look up|play)\s+(?:for\s+)?(.+)$/i))) {
      const app = m[1].trim();
      const query = m[2].trim();
      return {
        title: `Open ${app}, then search for ${query}`,
        steps: [
          { label: `Open ${app}`, run: () => openApp(app) },
          // typeText opens the app's search field itself (never Voice search).
          { label: `Search for ${query}`, run: async () => { await typeText(query, { search: true }); await submit(); } },
        ],
      };
    }
    // Only a plain "open <app>": "open my files and check what's taking
    // space" used to try opening an app with that whole sentence as its name.
    // (An installed app's exact name always counts, "Find My Mobile" included.)
    if ((m = goal.match(/^(?:open|launch|start)\s+(.+)$/i)) && (window.IzukiNative?.isAppName?.(m[1]) === true
      || (m[1].trim().split(/\s+/).length <= 3 && !/\b(?:and|then|check|what|how|why|find|see|look|show|tell)\b/i.test(m[1])))) {
      const app = m[1].trim();
      return { title: `Open ${app}`, steps: [{ label: `Open ${app}`, run: () => openApp(app) }] };
    }
    if ((m = goal.match(/^(?:search|look up|google)\s+(?:for\s+)?(.+)$/i))) {
      const query = m[1].trim();
      return { title: `Search for ${query}`, steps: [{ label: `Search for ${query}`, run: async () => { await typeText(query, { search: true }); await submit(); } }] };
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
    // The installed apps' names first (read once, a moment at most), so an
    // app called "Find My Mobile" or "Learn and Play Music" is opened as an app.
    await window.IzukiNative?.appNamesReady?.();
    if (state.running) return false;
    // The phone agent uses Android's numbered screen list too; one at a time.
    if (window.IzukiAgent?.busy) {
      state.log = [];
      add("Izuki's phone agent is working on the phone. Stop it first, then run this.", "bad");
      return false;
    }
    const made = plan(raw);
    state.goal = String(raw || "").trim();
    state.label = made?.title || "";
    state.step = 0;
    state.total = made?.steps?.length || 0;
    state.log = [];
    state.cancelled = false;
    if (!made) {
      // Not one of the quick routines: the AI phone agent does it, step by
      // checked step, in this same log. The old answer was "I don't know
      // that routine yet" for anything new.
      const agent = window.IzukiAgent, think = window.IzukiBrain?.agentThink;
      if (!agent?.run || typeof think !== "function") {
        state.running = false;
        add("Add an AI key in Settings so I can work this out, or try “open YouTube and search lofi”, “tap Search”, “scroll down”, or “go home”.", "bad");
        return false;
      }
      state.running = true;
      state.label = state.goal;
      add(`Autopilot (AI): ${state.goal}`, "title");
      emit();
      try {
        const result = await agent.run(state.goal, {
          think,
          see: !!window.IzukiBrain?.sees?.(),
          viaAutopilot: true,
          stopped: () => state.cancelled,
          onStep: (line) => { state.step += 1; add(line.replace(/…$/, ""), "step"); },
        });
        if (state.cancelled || result?.stopped) add("Stopped.", "bad");
        else add(result?.text || "Done.", result?.ok ? "done" : result?.asked ? "warn" : "bad");
        return !!result?.ok;
      } catch (error) {
        add(String(error?.message || error), "bad");
        return false;
      } finally {
        state.running = false;
        state.cancelled = false;
        emit();
      }
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
