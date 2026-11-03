# Workstreams, ownership and status

Set by the owner on 2026-11-03. Freebuff keeps **Smart Eye / Air Control,
Smart Vision and Developer Mode**; Claude Code keeps **Smart Screen Actions,
speed optimization and security fixes**. Both finish existing critical work
first, claim in `docs/COLLAB.md` before editing, never overwrite the other's
files, and never merge or publish without the owner.

These are **user-facing features for everyone who downloads Izuki** — unlike
the owner-only Smart Developer Mode, which is compiled out of public builds.

## 1. Smart Screen Actions — Claude Code

**Izuki looks at the screen, does what its owner meant, and checks it
actually happened.**

- In place: `assess.rs` decides what kind of page is on screen from the page's own
  evidence (graded test vs practice vs neither, so self-checks scroll freely and
  real exams stay hands-off); `uia.rs` is the magnetic hand — before any click,
  Windows UI Automation names the real control under the point, so a rough mark
  still lands on the button; `automation.rs` moves the real mouse with a
  hand-like path; the overlay can watch and act.
- Missing for the whole loop: a working cycle of understand → pick an
  authorized target → act → verify the result → recover when a step fails
  (retry a safe way, or stop and say so). Per-action safety needs an approval
  ladder (what may run unasked, what waits until you tap Yes).
- Dependencies: `uia.rs` and `automation.rs` (shared with the Fast Action
  Engine, work 2); the overlay hit-test rules in `AGENTS.md` (click-through
  overlay, `data-izk-hit`).
- Next steps for Claude Code: define the action grammar and the approval
  ladder, wire verification (read back the control state after each action),
  add failure recovery, and add screen-action regression tests on recorded
  pages. No rewrite of the classifier or magnetic hand — build on them.

## 2. Fast Action Engine — Claude Code

**Do the same thing, faster, without wasting the owner's time.**

- In place: UI Automation snapping instead of pixel guessing (`uia.rs`),
  eased pointer travel instead of instant teleport (`automation.rs`), the
  request pipeline has its own caching rules (`docs/HOW-IZUKI-WORKS.md`).
- Missing: fewer screenshots and repeated model calls per action (re-look only
  when the screen changed); no fixed sleeps between steps (wait on UIA events);
  a speed and reliability benchmark so any improvement claim is a measurement,
  not a feeling.
- Dependencies: same actuator path as work 1; `assess.rs` stays the only
  page-minded classifier so both lanes read the same truth.
- Next steps for Claude Code: build the benchmark (recorded tasks → seconds and
  success rate, before/after), then drive act-on-UIA-event and screenshot
  dedupe. Public performance numbers only after the benchmark agrees.

## 3. Smart Eye / Air Control — Freebuff

**Hand first; iris, look-to-target and blinks are the planned next layer.**

- In place and working: the Meta-Quest-style hand — fingertip is the pointer,
  pinch = click, held pinch = drag, other pinches right-click / copy / paste /
  two-finger scroll (`air.rs`), with the exact snap-target box drawn around
  whatever a pinch would hit, window down to a tiny button; camera opening and
  camera choice persisted (`src/lib/camera.ts`), MediaPipe hand landmarks
  (`AirControl.tsx`), plus the card, keyboard switch and mirror
  (`AirCard/AirKeyboard/AirMirror/AirToggle.tsx`). Real-camera use is explicit
  and opt-in today.
- Missing from the plan the owner named: face/iris tracking; look-to-target;
  blink and other gaze-gesture interactions; calibration for where the eyes
  are looking; the accessibility controls (say what each gesture does, turn
  one lane off without killing the other, big visual feedback); the eye lane
  must pass a real-camera requirement of its own before it ships.
- Dependencies: the same overlay and camera-selection stack the hand lane
  built on (reuse, don't fork); the overlay is OS-level click-through — eye
  gestures need the panel surface, not raw screen clicks.
- Next steps for Freebuff: eye-gesture gate first (!) — the developer-mode
  lesson from milestone §5 is that always-on camera sensing must be off by
  default, dev-only or an explicit per-session opt-in, no angular data logged;
  then MediaPipe iris landmarks behind the same gates, one-gesture calibration,
  look-to-scroll as the first eye-only money feature, accessibility summary in
  Settings. Real-webcam testing on this PC before any "it works".

## 4. Keep the other planned capabilities alive — both

Do not quietly drop planned features because code-review hustle and Developer
Mode grabbed attention. The standing record lives in `docs/COMPANION-DIRECTION.md`,
`docs/HOW-IZUKI-WORKS.md`, `docs/NEXT-RELEASE.md` (one line, in plain English,
with your name, per change you push) and the release notes. Anything currently
shipped or half-shipped that wasn't on the two priority lists stays on its own
planned track; when prioritizing, this document defers it, it does not delete
it.

## 5. Public-product compatibility — both

Everything in works 1–4 is for everyone who downloads Izuki. So anything
written for it must: degrade without internet, skip optional camera/AI parts
cleanly, never leak user content or the user name in what he leaves the house
with (same standard the observer now redacts at the boundary), keep version
and release discipline through the owner, and never hardcode one laptop's
setup. The owner-only Smart Developer Mode stays compiled-out by default
(`devmode.rs`, `DeveloperMode.tsx`, `--features devvision` observer with
`IZUKI_VISION=1`): public users never gain an observer.
