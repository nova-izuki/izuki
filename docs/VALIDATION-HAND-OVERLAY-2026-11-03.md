# Robot hand investigation and verification — 2026-11-03

Issue #27; branch `codex/hand-overlay-lifecycle`. Claude retains release and
bridge ownership; Freebuff retains Air/Eye, documents and pointing/chat work.
Changes to shared source files are limited to hand visibility/settings and the
single cursor-thread registration. No active uncommitted changes were adopted.

## Actual source and cause

The desktop robot hand is `HandCursor.tsx` → `HandGlyph` in `IzukiMark.tsx`,
rendered by the transparent Tauri window named `overlay` (`Izuki Overlay`).
It runs inside Izuki/WebView2, not a separate robot/hand executable. The actual
installed Izuki process was PID 15588, product version **1.0.196** at inspection;
it was not terminated, replaced or pointed at test data.

Two paths caused unexpected appearance:

- `follow_mode_enabled` (“Always show the hand”) mounted a hand following the
  mouse even when no task or camera tracking was active. It also controlled a
  useful floating chat, combining unrelated visuals and functionality.
- Preview/draw rendering mounted `HandCursor` unconditionally, independently
  of that setting. Voice/chat tasks could therefore reveal it with the setting
  off. Finishing work could return to the persistent follower.

The Rust `izuki-follow` thread supplied cursor events for both that decoration
and useful widget hit-testing. It polled when the saved follower flag was true
even if the actual overlay was hidden. The hand engine used an animation loop;
simply hiding its SVG would leave the component/resources alive.

This is separate from `AirHost`/`AirControl`'s useful camera-tracking ring and
calibration, Smart Vision's developer observer and the drawing-mode prediction
marker. Those features, their gates and their camera lifecycles are preserved.

## Resulting behavior

- Removed the idle cursor follower and unconditional preview hand entirely.
- The legacy `follow_mode_enabled` setting now controls the existing floating
  chat bubble only; its serialized name stays compatible. Existing chat access
  and its Reset remain available independently of the action hand.
- Added **Show hand during screen actions**, off by default, including for old
  profiles. This controls only a visual; automation, clicks, pointing marks,
  Air gestures and Eye tracking continue independently.
- `ActionHand` mounts `HandCursor` only after an actual screen-action event.
  Its duration is bounded (at most 3.5 seconds per event). It unmounts on expiry,
  disable, Stop, completed thinking/session, overlay close/reopen, page hiding
  and native foreground-window change. Enabling never replays an old action.
- The optional hand is pointer-events-none, never a hit-test widget, never
  focuses a window, never sends input and never acquires a camera. Unmounting
  destroys the existing hand engine; no idle animation loop remains.
- The existing native cursor thread is retained for chat/Island/Air widget
  hit-testing, but fast polling now depends on actual overlay visibility. It
  no longer clones settings periodically or wakes solely for an old preference.
  Foreground changes emit a payload-free reset event; no window titles/handles
  are sent to the UI.

## Checks completed before native verification

- Typecheck, production build, conversation and Air checks passed.
- `node tools/hand-overlay-check.cjs --desktop`: real Windows Edge window,
  actual React hand and actual OverlayCanvas. Disabled/idle/follow/preview,
  action preference changes, expiry, Stop, completion, close/reopen, session
  reset, foreground reset event, input underneath, typing, no camera requests
  and no remaining animation frames after expiry/unmount passed.
- The harness initially found a Windows profile-cleanup race after successful
  assertions. Later Windows cleanup was denied even after retries, and automatic
  approval review rejected a manual profile deletion (“blocked by policy”).
  No alternate deletion method was used. Local reruns use the explicit
  `--retain-artifacts` option; a read-only process check still requires that
  **all test browser processes exit**, including Edge relaunches. Nonprivate
  fixture profiles/caches remain ignored in `.work`; they are not desktop
  overlays or background workers. CI keeps normal profile cleanup. No owner
  browser or agent is terminated by the harness.
- Two native settings regressions cover old saved profiles and independence
  from enabled Air control; their full Rust outcome is recorded below when done.

## Native Windows verification (pending until recorded below)

`src-tauri/examples/hand_overlay_probe.rs` is an isolated verification host:
the real Tauri overlay builder, click-through plumbing and updated cursor
thread, loading only the hand fixture through its own loopback dev server.
It never calls `izuki_lib::run`, `Store`, owner settings, hotkeys, cameras,
agents, autostart or release routines. Its test-only WebView2 profile is a
fresh directory in the worktree. The normal installed app keeps running.

After building the example, run:

```powershell
$env:IZUKI_HAND_TEST_HOST = '<compiled hand_overlay_probe.exe>'
node tools/hand-overlay-check.cjs --native --retain-artifacts
```

The host asserts native mouse transparency and unchanged foreground on overlay
show. The driver additionally creates a disposable native window, changes
foreground, checks that the *real cursor thread* hides the hand and restores
the previous foreground without sending it input. The test host exits and its
profile is cleaned up afterward. The test-only close/switch commands are in
the example, never registered in the product.

These WebView2 environment overrides are documented by
[Microsoft](https://learn.microsoft.com/en-us/microsoft-edge/webview2/reference/win32/webview2-idl).
The new read-only `Hand overlay regression` workflow runs the browser regression
on PRs; it does not alter release/coordinator workflows or grant write tokens.

Native execution, full Rust results, review and commit/PR references will be
appended after verification. Until then this is not a shipped or complete fix.

## Native run, 2026-11-08 (Claude, current `milestone-196`, owner away from the PC)

Host built from `milestone-196` (`1f28bfc`) with `IZUKI_TEST_MANIFEST=1 cargo build --example hand_overlay_probe`. Without the manifest switch, any example that links today's library fails to start (Windows: `TaskDialogIndirect` missing from the default Common Controls).

- **Passed natively:** the host's own assertions ("NATIVE: real overlay click-through and no-focus assertions passed"). The overlay passes native mouse input through and never takes focus when shown.
- **Passed in the native host's webview** (driven over DevTools, with simulated input and events inside the fixture page, not physical input or full native workflows):
  - a disabled hand ignores actions;
  - enabling never replays an old action;
  - the hand is `pointer-events: none`, and a simulated click on the fixture passes through it to the element underneath;
  - simulated typing into a fixture field is unaffected;
  - the stop, switched, ended, finished, closed and reopened *event handlers* each hide it (the events are emitted directly; the native overlay isn't actually closed or reopened);
  - idle stops animation frames.
- What the host's own native assertions cover: the overlay window passes real mouse input through (`WS_EX_TRANSPARENT`) and doesn't take the foreground when shown.
- **Not completed:** the real foreground switch (`probe_switch_window`). Windows refuses to bring a window forward for a process started from a background terminal (foreground lock), so the precondition "a real native foreground switch must occur" failed. That isn't a hand failure. To finish it, run `node tools/hand-overlay-check.cjs --native` from your own terminal with `IZUKI_HAND_TEST_HOST` set to the built host.
- **Fixed:** a timing race in the check. The page could load before the host printed its verdict; it now waits up to 30 s for the verdict line, or for a panic.
