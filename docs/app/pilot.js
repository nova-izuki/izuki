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

  /** The accessibility tree's copy of a test target. Pure and testable. */
  function findTarget(screen, needle) {
    const wanted = String(needle || "").toLowerCase();
    const items = Array.isArray(screen?.items) ? screen.items : [];
    return items.find((item) => String(item?.text || "").toLowerCase().includes(wanted)) || null;
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
          <div class="pl-swipe" id="pl-swipe-zone" aria-label="Izuki swipe test" tabindex="0"><div class="pl-swipe-inner"><span>Izuki swipe test — swipe across this strip</span><span>← keep going →</span></div></div>
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

      const swipe = await testSwipe(bridge);
      line(out, swipe.ok ? "ok" : "bad", swipe.text);

      const long = await testLong(bridge);
      line(out, long.ok ? "ok" : "warn", long.text);

      if (tap.ok && label.ok && swipe.ok) line(out, "ok", "Tap, tap-by-label and swipe reached Izuki's test targets.");
      else line(out, "bad", "Some controls did not fire. Keep the phone unlocked and retry once.");
    } finally {
      button.disabled = false;
    }
  }

  async function targetOnScreen(bridge, id, needle) {
    const el = $(id);
    el?.scrollIntoView?.({ block: "center" });
    await sleep(300);
    const screen = await bridge.screen?.();
    return findTarget(screen, needle);
  }

  async function testTap(bridge) {
    const item = await targetOnScreen(bridge, "pl-gesture-target", "gesture target");
    const point = center(item);
    if (!point) return { ok: false, text: "The tap target was not listed by the screen reader. Try again after unlocking." };
    const result = await bridge.gesture({ op: "tap", x: point.x, y: point.y });
    await sleep(650);
    return tapHits > 0
      ? { ok: true, text: `Coordinate tap reached the target at ${point.x},${point.y}.` }
      : { ok: false, text: result?.done ? "The tap was sent but the target did not fire." : "The phone refused the tap." };
  }

  async function testLabel(bridge) {
    const item = await targetOnScreen(bridge, "pl-label-target", "label target");
    if (!item) return { ok: false, text: "The tap-by-label target was not listed by the screen reader." };
    const result = await bridge.act({ op: "tapText", text: "Izuki label target" });
    await sleep(500);
    return labelHits > 0 && result?.done
      ? { ok: true, text: "Tap-by-label reached the target." }
      : { ok: false, text: "Tap-by-label did not reach the target." };
  }

  async function testSwipe(bridge) {
    const zone = $("pl-swipe-zone");
    const item = await targetOnScreen(bridge, "pl-swipe-zone", "swipe test");
    if (!zone || !item) return { ok: false, text: "The swipe strip was not listed by the screen reader." };
    zone.scrollLeft = 0;
    const y = Math.round(item.y + item.h / 2);
    const from = Math.round(item.x + item.w - 18);
    const to = Math.round(item.x + 18);
    const result = await bridge.gesture({ op: "swipe", x: from, y, x2: to, y2: y, ms: 320 });
    await sleep(650);
    return zone.scrollLeft > 4
      ? { ok: true, text: "Swipe moved the test strip." }
      : { ok: false, text: result?.done ? "The swipe was sent but the test strip did not move." : "The phone refused the swipe." };
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

  window.IzukiPilot = { open, close, selfTest, findTarget, center };
})();
