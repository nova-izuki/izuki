# Workstreams, ownership and status

Set by the owner on 2026-11-03. Freebuff keeps **Smart Eye / Air Control,
Smart Vision and Developer Mode**; Claude Code keeps **Smart Screen Actions,
speed optimization and security fixes**. Both finish existing critical work
first, claim in `docs/COLLAB.md` before editing, never overwrite the other's
files, and never merge or publish without the owner.

These are **user-facing features for everyone who downloads Izuki** — unlike
the owner-only Smart Developer Mode, which is compiled out of public builds.

## 1. Smart Screen Actions — Claude Code

**Understand the screen, pick the right target, act only when authorized,
check the result, recover when it didn't work.**

- In place:
  - **The look → plan → act loop** (`brain.rs`), with numbered real controls
    from UI Automation (`uia.rs`): the model picks "control 7", not pixels
    (`vision::resolve_targets`).
  - **Safe Hands** (`automation.rs`): before a click the target is checked as
    present, enabled and not covered (`check_target`, `covered_at`); a covered
    one is pressed through accessibility instead; typed text is read back
    (`check_typed`); a snag continues the task with a note.
  - **Browser pages through the extension**: DOM snapshot, click, type, links
    on the page. Since 1.0.196, with the user's pairing key: every request
    the extension sends is signed, and Izuki signs its jobs and its ping
    answer. Izuki's other replies (answers, statuses) are plain; the
    extension sends anything private only after a signed ping proved it's
    Izuki (`ext.rs`, `extension/bridge-proof.js`).
  - **Authorization and limits**: confirmation for send, post, buy and delete;
    no passwords, no lock screen; graded-quiz answers held back, practice pages
    allowed (`assess.rs`, shared cases in `tools/assessment-cases.json`).
  - **Records**: task verdicts and contracts (`execution.rs`), missions with an
    evidence journal.
- Missing:
  - One "did it work?" check after every action type. Today it covers clicks
    and typing; scrolling, opening and shortcuts mostly aren't verified.
  - Re-planning from the new screen after any failed step, not just the snag
    note.
  - A measured success rate on a fixed scenario set. Nothing claims "better"
    without numbers. **Baseline, 2026-11-03:** `tools/brain-check` (the
    decision only: real screens, Easy Mode's prompt, Groq
    `qwen/qwen3.8-27b`) got 11 of 11 right, in 0.5–4.0 s per decision
    (median 0.8 s). A busy Groq now counts as "not run", never as a pass or
    a fail. It doesn't yet cover acting, checking or recovering: that's the
    scenario set below.
- Dependencies: UI Automation and OCR quality per app, the extension, the
  model brains. Freebuff's eye control will snap to targets through `uia.rs`:
  agree changes to its interface in `docs/COLLAB.md` first.
- Next steps for Claude Code: a scenario set with pass/fail and timing
  (extend `tools/brain-check`), then per-action-type result checks, then
  re-plan on failure. Build on the classifier and the magnetic hand; no
  rewrite.

## 2. Fast Action Engine — Claude Code

**The same work, faster: accessibility and DOM first, screenshots and model
calls only when needed, no fixed wait where a condition can be checked.**

- In place: plain commands with no AI (`instant.rs`) and named clicks with no
  AI when exactly one control matches (`run_named_click`); a backup brain
  raced in when the first is slow (`ask_racing`) and the fastest recent brain
  first (`order_by_speed`); broken brains rested (`skip_broken`); a short
  menu for small models (`easy.rs`); the screen read while the user is still
  talking (`prefetch_screen`) and connections warmed up.
- Missing:
  - A benchmark: time to first action, time to finish, screenshots and model
    calls per task, before and after each change.
  - Fixed waits: 33 in `automation.rs`, 17 in `brain.rs`, 6 in `patience.rs`.
    Some deliberately let slow PCs settle, so each is measured before it's
    replaced with a check for the condition it waits on, never removed blindly.
  - Fewer repeated screenshots and model calls within one task.
- Dependencies: the Smart Screen Actions scenario set (the same tasks are
  timed); `assess.rs` stays the only page classifier, so both lanes read the
  same truth.
- Measured 2026-11-03 (installed 1.0.195, idle): 12–26% of one core across
  three samples. Where it goes, per thread: the always-open mic's echo and
  noise processing about 4%, the overlay redrawing about 5% with nothing
  changing on screen, the auto-skip-ads/cookie loop about 1% (a 160-control
  page walk every 5 s on YouTube). `tools/idle-check.cjs` shows the main
  window resting completely; the overlay can only be measured inside the
  app. Leads, each to be measured before and after: find the overlay
  element with DevTools in a dev build; read YouTube's skip button through
  the extension instead of walking the page; open the wake-word mic without
  echo processing while Izuki is silent (needs a real voice and Bluetooth
  test, see the mic notes in the izuki-dev skill).
- Next steps for Claude Code: the timing benchmark on the owner's laptop and
  one other machine, then replace the waits it shows matter, one at a time,
  with before and after numbers. Public speed claims only after the benchmark
  agrees.

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

Preserved today: the voice conversation (wake word, barge-in, natural voice);
chat and its tools, deep research, Campus and Blackboard, notes, PC Care and
Smart Care; the phone and TV companion, Discord and Telegram, routines and
reminders, FL Studio help, Office editing, characters. Planned and not
started: Linux support; "Jarvis" wake, sleep and shutdown; fuller remote
control after the real PC setup; the per-user gaps in
`docs/PRODUCT-PRINCIPLE.md` (data export, erase-all, cross-device accounts,
one permissions register, privacy-preserving learning). Unassigned work is
claimed in `docs/COLLAB.md` before it starts.

## 5. Public-product compatibility — both

Everything in works 1–4 is for everyone who downloads Izuki. So anything
written for it must: degrade without internet, skip optional camera/AI parts
cleanly, never leak user content or the user name in what he leaves the house
with (same standard the observer now redacts at the boundary), keep version
and release discipline through the owner, and never hardcode one laptop's
setup. The owner-only Smart Developer Mode stays compiled-out by default
(`devmode.rs`, `DeveloperMode.tsx`, `--features devvision` observer with
`IZUKI_VISION=1`): public users never gain an observer.
