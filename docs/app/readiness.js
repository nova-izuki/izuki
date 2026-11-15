// Phone Readiness: what the Android companion can really do right now, in
// plain words, with one action per row. Pure (no DOM, no bridge), so
// tools/phone-check/readiness.test.cjs can feed it every state Android
// reports: granted, denied, restricted, unavailable, enabled-but-not-running.
//
// "Ready" only ever comes from Android's own answer: Android control is
// ready when its service is connected (not merely switched on in Settings),
// and the floating orb is ready when that service is, because the orb is an
// accessibility overlay. Izuki never asks for "Appear on top".
(() => {
  "use strict";

  const samsung = (st) => /samsung/i.test(String(st?.manufacturer || ""));

  /** Where Android keeps Izuki's switch, in this phone's own words. */
  function accessibilityPath(st) {
    return samsung(st)
      ? "Settings → Accessibility → Installed apps → Izuki Companion control → On"
      : "Settings → Accessibility → Izuki Companion control (under Downloaded apps) → On";
  }

  /** Android 13+ "restricted settings", step by step, for the phone it's on. */
  function restrictedSteps(st) {
    const menu = samsung(st) ? "⋮ (top right)" : "⋮ (top right corner)";
    return [
      "Tap “Open App info” below.",
      `Tap ${menu}, then “Allow restricted settings”, and confirm with your PIN, pattern or fingerprint.`,
      "Come back to Izuki and tap “Turn on”.",
      `Then: ${accessibilityPath(st)}.`,
      "No “Allow restricted settings” in that menu? Try turning Izuki on in Accessibility once — Android adds the option only after it has blocked it.",
    ];
  }

  function controlRow(st) {
    const state = String(st?.controlState || (st?.running ? "ready" : st?.control ? "not-connected" : "off"));
    const base = { id: "control", title: "Android control", optional: false };
    if (state === "ready") {
      return { ...base, state: "ready", ok: true,
        text: "On and connected. Izuki can go Home and Back, press, type, scroll and run Autopilot when you ask.",
        action: { id: "test-control", label: "Test" } };
    }
    if (state === "not-connected") {
      return { ...base, state: "starting", ok: false,
        text: "Switched on in Android, but Android hasn't started it yet. This usually takes a moment; if it stays, turn it off and on again there.",
        action: { id: "control", label: "Open" }, steps: [accessibilityPath(st)] };
    }
    if (state === "restricted") {
      return { ...base, state: "restricted", ok: false,
        text: "Android is blocking this switch because Izuki was installed from a file, not a store (it shows “Restricted setting” or “App was denied access”). You can allow it once in App info.",
        action: { id: "app-info", label: "Open App info" }, steps: restrictedSteps(st) };
    }
    const maybe = state === "maybe-restricted";
    return { ...base, state: "action", ok: false,
      text: "Off. Needed for Home, Back, taps, typing, Autopilot and the floating orb.",
      action: { id: "control", label: "Turn on" },
      steps: [accessibilityPath(st)],
      ...(maybe || Number(st?.sdk) >= 33 ? {
        note: "If Android says “App was denied access” or “Restricted setting”, that's Android protecting apps installed from a file:",
        noteSteps: restrictedSteps(st),
        noteAction: { id: "app-info", label: "Open App info" },
      } : {}),
    };
  }

  function orbRow(st, opts) {
    const base = { id: "orb", title: "Floating orb", optional: true };
    if (opts?.keepOrb === false) {
      return { ...base, state: "off-optional", ok: true, text: "Off by your choice (Settings → Phone → “Hey Nova” → Keep the glass orb over other apps)." };
    }
    if (st?.running) {
      return { ...base, state: "ready", ok: true,
        text: "Ready. It floats over other apps through Android control — Izuki doesn't use “Appear on top”, so it isn't listed there.",
        action: { id: "test-orb", label: "Show it" } };
    }
    return { ...base, state: "needs-control", ok: false,
      text: "Turns on with Android control above. It doesn't need “Appear on top”." };
  }

  function micRow(st) {
    const base = { id: "mic", title: "Microphone", optional: false };
    if (st?.mic === undefined || st?.mic === null) return null;
    return st.mic
      ? { ...base, state: "ready", ok: true, text: "Allowed. Calls and “Hey Nova” can hear you." }
      : { ...base, state: "action", ok: false, text: "Not allowed. Needed to talk to Izuki and for “Hey Nova”.", action: { id: "mic", label: "Allow" } };
  }

  function notificationsRow(st) {
    const base = { id: "notifications", title: "Notifications", optional: false };
    if (st?.notifications === undefined || st?.notifications === null) return null;
    return st.notifications
      ? { ...base, state: "ready", ok: true, text: "Allowed. Reminders and the “Hey Nova is listening” notice can show." }
      : { ...base, state: "action", ok: false, text: "Not allowed. Needed for reminders and the visible notice while “Hey Nova” listens.", action: { id: "notifications", label: "Allow" } };
  }

  function wakeRow(st, wake) {
    const on = !!(wake?.on ?? st?.wakeOn);
    if (!on) return null;
    const base = { id: "wake", title: "“Hey Nova”", optional: true };
    const state = String(wake?.state || (st?.wakeRunning ? "ARMED" : "OFF"));
    const note = String(wake?.note || "");
    switch (state) {
      case "ARMED":
      case "HEARING":
        return { ...base, state: "ready", ok: true, text: "Listening quietly in the background. Only a short check runs when someone speaks." };
      case "PAUSED":
        return { ...base, state: "ready", ok: true, text: note || "Paused while Izuki is open — it listens again when you leave." };
      case "QUIET":
        return { ...base, state: "paused", ok: true, text: note || "Resting for a couple of minutes: lots of talking nearby that wasn't “Hey Nova”." };
      case "DETECTED":
        return { ...base, state: "ready", ok: true, text: "Heard “Hey Nova” just now." };
      case "ERROR":
        return { ...base, state: "action", ok: false, text: note || wake?.lastError || "“Hey Nova” stopped.", action: { id: "wake-retry", label: "Try again" } };
      default:
        return { ...base, state: "action", ok: false,
          text: wake?.lastError || "Switched on, but not running. Android may have stopped it after a restart.",
          action: { id: "wake-retry", label: "Start" } };
    }
  }

  function batteryRow(st, wake) {
    if (!(wake?.on ?? st?.wakeOn)) return null; // only matters for "Hey Nova"
    const base = { id: "battery", title: "Background use", optional: true };
    if (st?.backgroundRestricted) {
      return { ...base, state: "action", ok: false,
        text: "Android has Izuki set to “Restricted” battery use, so “Hey Nova” can't run in the background.",
        action: { id: "app-info", label: "Open App info" },
        steps: ["App info → Battery → Unrestricted (or Optimised)."] };
    }
    if (st?.battery === undefined || st?.battery === null) return null;
    const samsungNote = samsung(st)
      ? "Samsung also keeps its own sleeping-apps list that Izuki can't read: Settings → Battery → Background usage limits — make sure Izuki isn't in “Sleeping” or “Deep sleeping” apps."
      : "";
    return st.battery
      ? { ...base, state: "ready", ok: true, text: "Android lets Izuki keep listening for “Hey Nova”.", ...(samsungNote ? { note: samsungNote } : {}) }
      : { ...base, state: "action", ok: false,
        text: "Recommended for “Hey Nova”: let Android keep Izuki running in the background.",
        action: { id: "battery", label: "Allow" }, ...(samsungNote ? { note: samsungNote } : {}) };
  }

  /** Every row for this phone, most important first. Nulls (not applicable) are dropped. */
  function rows(st, opts = {}) {
    if (!st || typeof st !== "object") return [];
    if (st.tv) return [controlRow(st)];
    return [
      controlRow(st),
      micRow(st),
      notificationsRow(st),
      orbRow(st, opts),
      wakeRow(st, opts.wake),
      batteryRow(st, opts.wake),
    ].filter(Boolean);
  }

  /** "All set" / "2 of 3 ready" over the rows that aren't optional. */
  function summary(list) {
    const core = (list || []).filter((r) => !r.optional);
    const done = core.filter((r) => r.ok).length;
    const restricted = (list || []).some((r) => r.state === "restricted");
    return {
      ready: done === core.length && core.length > 0,
      text: !core.length ? "Update app" : done === core.length ? "All set" : `${done} of ${core.length} ready`,
      issues: (list || []).filter((r) => !r.ok && !r.optional),
      restricted,
    };
  }

  window.IzukiReadiness = { rows, summary, restrictedSteps, accessibilityPath };
})();
