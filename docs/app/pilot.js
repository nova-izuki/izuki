// Autopilot, in the normal phone app.
//
// The cockpit is a destination; you should not have to go there to run a
// routine. This sheet is opened from Home, from Settings -> Phone, and from a
// typed "autopilot ..." message. It also contains a safe self-test that uses
// only this sheet's own targets, so the new native gestures can be tried on a
// real phone without tapping some unrelated app.
(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const n = () => window.IzukiNative;
  const A = () => window.IzukiAutopilot;
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  let built = false;
  let poll = null;
  let unsubscribe = null;
  let device = null;
  let tapHits = 0;
  let labelHits = 0;
  let longHits = 0;
  let longTimer = null;
  let lastScreenApp = "";

  /** The accessibility tree's copy of a test target. Pure and testable. */
  function findTarget(screen, needle, widest = false) {
    const wanted = String(needle || "").toLowerCase();
    const items = Array.isArray(screen?.items) ? screen.items : [];
    const matches = items.filter((item) =>
      String(item?.text || "").toLowerCase().includes(wanted) ||
      String(item?.id || "").toLowerCase().includes(wanted.replace(/\s+/g, "-")));
    if (!matches.length) return null;
    // A swipe strip can expose both the strip and its child text. The widest
    // match is the thing a finger must actually drag across.
    if (widest) matches.sort((a, b) => (Number(b.w) * Number(b.h)) - (Number(a.w) * Number(a.h)));
    return matches[0];
  }

  /** Centre of an accessibility item in the phone's own pixels. */
  function center(item) {
    if (!item) return null;
    const x = Number(item.x), y = Number(item.y), w = Number(item.w), h = Number(item.h);
    if (![x, y, w, h].every(Number.isFinite) || w <= 0 || h <= 0) return null;
    return { x: Math.round(x + w / 2), y: Math.round(y + h / 2) };
  }

  function build() {
    if (built) return;
    built = true;
    const sheet = document.createElement("div");
    sheet.id = "izuki-pilot";
    sheet.hidden = true;
    sheet.setAttribute("role", "dialog");
    sheet.setAttribute("aria-modal", "true");
    sheet.setAttribute("aria-label", "Autopilot for your phone");
    sheet.innerHTML = `
      <div class="pl-sheet">
        <div class="pl-head">
          <div><div class="pl-kicker">IZUKI // AUTOPILOT</div><div class="pl-title">Do it on my phone</div></div>
          <button class="pl-x" id="pl-close" type="button" aria-label="Close Autopilot">×</button>
        </div>
        <p class="pl-sub">Short routines, one visible step at a time. It never sends, pays, buys or deletes; Stop ends it between actions.</p>
        <div class="pl-device" id="pl-device">Checking phone control…</div>
        <form class="pl-form" id="pl-form">
          <input id="pl-goal" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Open YouTube and search lofi" aria-label="Autopilot goal">
          <button class="pl-run" id="pl-run" type="submit">Run</button>
        </form>
        <div class="pl-chips" id="pl-chips"></div>
        <div class="pl-log" id="pl-log" aria-live="polite"><div class="pl-empty">Ready. Try “open YouTube and search lofi”, “tap Search”, “scroll down twice” or “go home”.</div></div>
        <div class="pl-test">
          <div class="pl-test-head"><b>Test phone control</b><button id="pl-test-run" type="button" disabled>Run test</button></div>
          <p class="pl-test-copy">Only taps and swipes the test targets below — never another app. Useful on a real phone without guessing.</p>
          <div class="pl-test-out" id="pl-test-out" aria-live="polite"><div class="pl-test-line warn">Not tested on this phone yet.</div></div>
          <div class="pl-targets">
            <button class="pl-target" id="pl-gesture-target" type="button">Izuki gesture target</button>
            <button class="pl-target" id="pl-label-target" type="button">Izuki label target</button>
          </div>
          <div class="pl-swipe" id="pl-swipe-zone" role="group" aria-label="Izuki swipe test" tabindex="0"><div class="pl-swipe-inner"><span>Izuki swipe test — swipe across this strip</span><span>← keep going →</span></div></div>
          <button class="pl-target" id="pl-long-target" type="button">Izuki long-press target</button>
        </div>
        <p class="pl-note">Android Accessibility control must be on and the phone unlocked. Autopilot runs only when you press Run; a locked phone is never touched.</p>
      </div>`;
    document.body.appendChild(sheet);
    $("pl-close").onclick = close;
    $("pl-form").onsubmit = (event) => { event.preventDefault(); void runGoal(); };
    const chips = $("pl-chips");
    for (const sample of A()?.samples || []) {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.textContent = sample;
      chip.onclick = () => { $("pl-goal").value = sample; $("pl-goal").focus(); };
      chips.appendChild(chip);
    }
    $("pl-test-run").onclick = () => void selfTest();
    $("pl-gesture-target").onclick = () => {
      tapHits++;
      $("pl-gesture-target").classList.add("ok");
    };
    $("pl-label-target").onclick = () => {
      labelHits++;
      $("pl-label-target").classList.add("ok");
    };
    const long = $("pl-long-target");
    long.addEventListener("contextmenu", (event) => { event.preventDefault(); longHits++; });
    long.addEventListener("pointerdown", () => {
      clearTimeout(longTimer);
      longTimer = setTimeout(() => { longHits++; }, 550);
    });
    for (const name of ["pointerup", "pointercancel", "pointerleave"]) long.addEventListener(name, () => clearTimeout(longTimer));
    sheet.addEventListener("click", (event) => { if (event.target === sheet) close(); });
    document.addEventListener("keydown", (event) => { if (event.key === "Escape" && !sheet.hidden) close(); });
    unsubscribe = A()?.subscribe?.(renderLog) || null;
    renderLog(A()?.state);
  }

  function open(goal = "") {
    build();
    const sheet = $("izuki-pilot");
    if (!sheet) return;
    sheet.hidden = false;
    document.body.style.overflow = "hidden";
    if (goal) {
      $("pl-goal").value = String(goal).slice(0, 400);
      setTimeout(() => $("pl-goal").focus(), 60);
    } else {
      setTimeout(() => $("pl-goal").focus(), 60);
    }
    paintDevice();
    clearInterval(poll);
    poll = setInterval(() => void paintDevice(), 4000);
  }

  function close() {
    const sheet = $("izuki-pilot");
    if (!sheet) return;
    // Closing is also a stop: no routine continues behind a hidden sheet.
    if (A()?.state?.running) A()?.stop?.();
    sheet.hidden = true;
    document.body.style.overflow = "";
    clearInterval(poll);
    poll = null;
  }

  async function paintDevice() {
    const line = $("pl-device");
    if (!line) return;
    const bridge = n();
    if (!bridge?.installed?.()) {
      device = null;
      line.className = "pl-device warn";
      line.textContent = "Install the Android companion to use Autopilot.";
      const run = $("pl-run");
      if (run) run.disabled = true;
      const test = $("pl-test-run");
      if (test) test.disabled = true;
      return;
    }
    let got = null;
    try { got = await bridge.device?.(); } catch { got = null; }
    device = got;
    const d = device;
    if (!d) {
      line.className = "pl-device warn";
      line.textContent = "Can't reach phone control. Turn on Android Accessibility, then try again.";
    } else if (!d.control) {
      line.className = "pl-device warn";
      line.textContent = "Accessibility control is off. Turn it on once in Settings → Phone.";
    } else if (d.locked) {
      line.className = "pl-device warn";
      line.textContent = "Phone is locked. Unlock it, then run a routine.";
    } else {
      line.className = "pl-device ok";
      line.textContent = `Control on · ${d.model || "this phone"}${d.width ? ` · ${d.width}×${d.height}` : ""}`;
    }
    const blocked = !d?.control || !!d?.locked;
    const running = !!A()?.state?.running;
    const run = $("pl-run");
    if (run && !running) run.disabled = blocked;
    const test = $("pl-test-run");
    if (test) test.disabled = blocked;
    const goal = $("pl-goal");
    if (goal && !running) goal.disabled = blocked;
  }

  function renderLog(state) {
    const log = $("pl-log");
    if (!log) return;
    if (!state?.log?.length) {
      log.innerHTML = '<div class="pl-empty">Ready. Try “open YouTube and search lofi”, “tap Search”, “scroll down twice” or “go home”.</div>';
    } else {
      log.innerHTML = state.log.map((line) => `<div class="pl-line ${esc(line.kind)}">${esc(line.text)}</div>`).join("");
      log.scrollTop = log.scrollHeight;
    }
    const running = !!state?.running;
    const run = $("pl-run");
    if (run) {
      run.textContent = running ? "Stop" : "Run";
      run.classList.toggle("stop", running);
      run.type = running ? "button" : "submit";
      run.onclick = running ? (event) => { event.preventDefault(); A()?.stop?.(); } : null;
      if (!running) run.disabled = !device?.control || !!device?.locked;
    }
    const goal = $("pl-goal");
    if (goal) goal.disabled = running || !device?.control || !!device?.locked;
  }

  async function runGoal() {
    const input = $("pl-goal");
    if (!input) return;
    const auto = A();
    if (!auto) {
      $("pl-log").innerHTML = '<div class="pl-line bad">Autopilot is not loaded.</div>';
      return;
    }
    if (auto.state?.running) { auto.stop(); return; }
    const goal = input.value.trim();
    if (!goal) { input.focus(); return; }
    input.value = "";
    await auto.run(goal);
  }

  function line(out, kind, text) {
    const el = document.createElement("div");
    el.className = `pl-test-line ${kind}`;
    el.textContent = (kind === "ok" ? "✓ " : kind === "bad" ? "✕ " : "! ") + text;
    out.appendChild(el);
  }

  async function selfTest() {
    const out = $("pl-test-out");
    const button = $("pl-test-run");
    if (!out || !button) return;
    out.innerHTML = "";
    button.disabled = true;
    tapHits = 0; labelHits = 0; longHits = 0;
    $("pl-gesture-target").classList.remove("ok");
    $("pl-label-target").classList.remove("ok");
    const bridge = n();
    try {
      if (!bridge?.gesture || !bridge?.screen || !bridge?.act) {
        line(out, "bad", "Install the Android companion and turn on Accessibility first.");
        return;
      }
      const d = await bridge.device?.();
      if (!d?.control) {
        line(out, "bad", "Accessibility control is off. Turn it on in Settings → Phone.");
        return;
      }
      if (d.locked) {
        line(out, "bad", "The phone is locked. Unlock it, then run the test.");
        return;
      }
      line(out, "ok", "Accessibility control is on.");
      document.activeElement?.blur?.();
      await sleep(250);

      const tap = await testTap(bridge);
      line(out, tap.ok ? "ok" : "bad", tap.text);

      const label = await testLabel(bridge);
      line(out, label.ok ? "ok" : "bad", label.text);

      const swipe = await testSwipe(bridge, tap.map);
      line(out, swipe.ok ? "ok" : "bad", swipe.text);

      const long = await testLong(bridge);
      line(out, long.ok ? "ok" : "warn", long.text);

      const failed = [tap.ok ? "" : "tap", label.ok ? "" : "tap-by-label", swipe.ok ? "" : "swipe"].filter(Boolean);
      if (!failed.length) line(out, "ok", "Tap, tap-by-label and swipe reached Izuki's test targets.");
      else line(out, "bad", `Not working yet: ${failed.join(", ")}. The lines above say what Android reported. Settings → Phone → Diagnostics has the details to share.`);
    } finally {
      button.disabled = false;
    }
  }

  async function targetOnScreen(bridge, id, needle, widest = false) {
    const el = $(id);
    el?.scrollIntoView?.({ block: "center" });
    await sleep(450);
    const screen = await bridge.screen?.();
    lastScreenApp = screen?.app || "";
    return findTarget(screen, needle, widest);
  }

  /** Android's reason in plain words, e.g. "Android cancelled the touch". */
  const why = (result) => n()?.why?.(result, "the target") || (result?.reason ? `Android said: ${result.reason}.` : "Android gave no reason.");

  /**
   * Page pixels → screen pixels, measured from a target both sides can see
   * (its rectangle here and its bounds from Android). Pure and testable.
   */
  function screenMap(rect, item) {
    if (!rect || !item || !(rect.width > 0) || !(Number(item.w) > 0)) return null;
    const scale = Number(item.w) / rect.width;
    return { scale, x: Number(item.x) - rect.left * scale, y: Number(item.y) - rect.top * scale };
  }

  async function testTap(bridge) {
    const item = await targetOnScreen(bridge, "pl-gesture-target", "gesture target");
    const point = center(item);
    if (!point) return { ok: false, text: "The tap target was not listed by the screen reader. Unlock the phone and keep Izuki in front, then run it again." };
    const map = screenMap($("pl-gesture-target")?.getBoundingClientRect?.(), item);
    if (map) map.app = lastScreenApp;
    const result = await bridge.gesture({ op: "tap", x: point.x, y: point.y });
    await sleep(650);
    return tapHits > 0
      ? { ok: true, map, text: `Coordinate tap reached the target at ${point.x},${point.y}.` }
      : { ok: false, map, text: result?.done ? "Android completed the tap, but the target didn't fire." : `The tap didn't happen: ${why(result)}` };
  }

  async function testLabel(bridge) {
    const item = await targetOnScreen(bridge, "pl-label-target", "label target");
    if (!item) return { ok: false, text: "The tap-by-label target was not listed by the screen reader." };
    const result = await bridge.act({ op: "tapText", text: "Izuki label target" });
    await sleep(600);
    const how = result?.how === "touch" ? "a real touch on the label" : result?.how === "action" ? "Android's press action" : "a press";
    if (labelHits > 0) return { ok: true, text: `Tap-by-label reached the target (${how}).` };
    return { ok: false, text: result?.done
      ? `Android accepted ${how} on “${result.matched || "the label"}”, but the button didn't fire.`
      : `Tap-by-label didn't happen: ${why(result)}` };
  }

  async function testSwipe(bridge, map) {
    const zone = $("pl-swipe-zone");
    if (!zone) return { ok: false, text: "The swipe strip is missing from this page." };
    let item = await targetOnScreen(bridge, "pl-swipe-zone", "swipe test", true);
    let where = "the screen reader's bounds";
    // Chromium may not name a scroll strip. The page knows where it is, and the
    // tap target gave the page-to-screen mapping: use that instead.
    if (!item && map) {
      // Only while Izuki's own page is in front: a swipe at these
      // coordinates must never land in another app.
      const front = await bridge.screen?.().catch?.(() => null);
      if (!front || front.app !== map.app) return { ok: false, text: "Izuki isn't in front any more, so the swipe test stopped." };
      const r = zone.getBoundingClientRect();
      item = { x: Math.round(map.x + r.left * map.scale), y: Math.round(map.y + r.top * map.scale), w: Math.round(r.width * map.scale), h: Math.round(r.height * map.scale) };
      where = "the page's own position";
    }
    if (!item) return { ok: false, text: "The swipe strip was not listed by the screen reader, and the tap test didn't give a position to use." };
    zone.scrollLeft = 0;
    const y = Math.round(item.y + item.h / 2);
    const from = Math.round(item.x + item.w - 18);
    const to = Math.round(item.x + 18);
    const result = await bridge.gesture({ op: "swipe", x: from, y, x2: to, y2: y, ms: 320 });
    await sleep(650);
    return zone.scrollLeft > 4
      ? { ok: true, text: `Swipe moved the test strip (found by ${where}).` }
      : { ok: false, text: result?.done ? "Android completed the swipe, but the strip didn't move." : `The swipe didn't happen: ${why(result)}` };
  }

  async function testLong(bridge) {
    const item = await targetOnScreen(bridge, "pl-long-target", "long-press target");
    const point = center(item);
    if (!point) return { ok: false, text: "The long-press target was not listed by the screen reader." };
    await bridge.gesture({ op: "longpress", x: point.x, y: point.y, ms: 750 });
    await sleep(800);
    return longHits > 0
      ? { ok: true, text: "Long-press reached the target." }
      : { ok: false, text: "Long-press was not observed; Android may reserve it for text selection. Tap and swipe are the primary checks." };
  }

  window.IzukiPilot = { open, close, selfTest, findTarget, center, screenMap };
})();
