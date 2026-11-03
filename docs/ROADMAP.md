# Izuki roadmap: workstreams, owners and status

Izuki is a public product: every workstream here is for everyone who downloads it, except Smart Developer Mode (the owner's private dev tooling, compiled out of public builds).

**Order (owner, 2026-11-02):**
1. Finish the security-critical fixes and the milestone 1.0.196 verification.
2. Then the feature workstreams below.

No rewrites, and no agent overwrites another's work. Claims go in `docs/COLLAB.md` and the rules in `AGENTS.md`. Nothing is merged or published without the owner's approval.

| # | Workstream | Owner | State |
| --- | --- | --- | --- |
| 1 | Smart Screen Actions | Claude | Working core; gaps below |
| 2 | Fast Action Engine | Claude | Many speed paths exist; not benchmarked |
| 3 | Smart Eye / Air Control | Freebuff | Hand-based Air Control works; eye tracking not started |
| 4 | Other advanced capabilities | Unassigned (claim in COLLAB.md) | Preserved; list below |
| 5 | Smart Vision + Smart Developer Mode (private, dev builds only) | Freebuff | In progress (milestone §5) |
| — | Security fixes | Claude | Ongoing (`docs/REVIEW-1.0.196.md`) |

## 1. Smart Screen Actions (Claude)

Understand the screen, pick the right target, act only when authorized, check the result, recover when it didn't work.

**There now:**
- **The look → plan → act loop** (`brain.rs`), with numbered real controls from UI Automation (`uia.rs`). The model picks "control 7", not pixels (`vision::resolve_targets`).
- **Safe Hands** (`automation.rs`):
  - before a click: the target is checked as present, enabled and not covered (`check_target`, `covered_at`);
  - a covered target is pressed through accessibility instead;
  - typed text is read back (`check_typed`);
  - a snag continues the task with a note instead of ending it.
- **Browser pages through the extension:** DOM snapshot, click, type and read links. Since 1.0.196 a job must carry Izuki's signature.
- **Authorization and limits:**
  - confirmation for send, post, buy and delete;
  - no passwords and no lock screen;
  - graded-quiz answers held back, practice pages allowed (`assess.rs`).
- **Records:** task verdicts and contracts (`execution.rs`), and missions with an evidence journal.

**Missing:**
- One consistent "did it work?" check after every action type. Today it covers clicks and typing; scrolling, opening and keyboard shortcuts mostly aren't verified.
- Recovery that re-plans from the new screen after a failed step, for every step type, not just the snag note.
- A measured success rate on a fixed scenario set. Nothing claims "better" without numbers.

**Depends on:** UI Automation and OCR quality per app, the extension (browsers), the model brains.

**Next:**
1. A scenario set with pass/fail and timing (extend `tools/brain-check`).
2. Per-action-type result checks.
3. Re-plan on failure.

## 2. Fast Action Engine (Claude)

Faster answers and actions: accessibility and DOM first, screenshots and model calls only when needed, no fixed waits where a condition can be checked.

**There now:**
- **Plain commands with no AI** (`instant.rs`), and named clicks with no AI when exactly one control matches (`run_named_click`).
- **Racing and choosing brains:** a backup brain is asked if the first is slow (`ask_racing`), and the fastest recent brain goes first (`order_by_speed`).
- **Avoiding dead brains:** broken ones rest (`skip_broken`).
- **Small-model menu** (`easy.rs`).
- **Prefetch and warm-up:** the screen is read while the user is still talking (`prefetch_screen`), and connections are warmed up.

**Missing:**
- **A benchmark:** time to first action, time to finish, and screenshots and model calls per task, before and after each change.
- **Fixed waits:** 33 in `automation.rs`, 17 in `brain.rs`, 6 in `patience.rs`. Some deliberately let slow PCs settle (`izuki-patient-not-spammy`). Each one is measured before it's replaced with a check for the condition it waits on, never removed blindly.
- **Fewer repeated screenshots and model calls** within one task.

**Depends on:** the Smart Screen Actions scenario set (the same tasks are timed).

**Next:**
1. The timing benchmark on the owner's laptop and one other machine.
2. Replace the waits the benchmark shows matter, one at a time, with before and after numbers.

## 3. Smart Eye / Air Control (Freebuff)

Hands-free control for everyone who turns it on: look at a target, blink or pinch to press, calibration, accessibility controls.

**There now:**
- **Air Control by hand** (MediaPipe hand landmarker, `public/air/`): `src/lib/airActions.ts`, `airScroll.ts`, `airWorker.ts`, `hand.ts`.
- **Tests:** `npm run test:air`.

**Missing:**
- Eye control: face and iris tracking, look-to-target (snapping to real UI Automation controls), blink and dwell to press, a calibration flow, accessibility settings (dwell time, sensitivity, one-eye mode).
- Clear on and off states and a visible camera indicator.

**Rules:** off by default; it starts only when the user turns it on; the camera is used on the device only; tested with a real camera before it's called done.

**Depends on:** `uia.rs` for snapping (Claude's area: coordinate in COLLAB.md before changing it).

**Next:** a FaceLandmarker iris prototype behind a setting, then a calibration UI, then the owner's real-camera test.

## 4. Other advanced capabilities (unassigned; claim before starting)

Preserved, not abandoned:
- the voice conversation (wake word, barge-in, natural voice);
- chat and its tools, deep research, Campus and Blackboard, notes, PC Care and Smart Care;
- the phone and TV companion, Discord and Telegram, routines and reminders, FL Studio help, Office editing, characters.

**Planned and not started:**
- Linux support;
- "Jarvis" wake, sleep and shutdown;
- fuller remote control after the real PC setup;
- the per-user gaps in `docs/PRODUCT-PRINCIPLE.md`: data export, erase-all, cross-device accounts, one permissions register, privacy-preserving learning.

## 5. Public-product compatibility (every workstream)

- **Per user:** profile, memories, settings and keys in that user's own data folder; no owner names, paths, accounts or devices in code.
- **Opt-in** for anything that watches, listens or acts on its own. Explicit authorization for sensitive actions.
- **Works on modest PCs** (8–16 GB, integrated graphics): idle budget 14% of one core. The 1.0.195 baseline is in the milestone checklist.
- **Developer tooling stays out of public builds** (the `devvision` feature).
