# Izuki Computer Control & Long-Task Reliability

Status: audit and phased plan. The advanced computer-use system is **not**
finished; this records the real gaps and the order to fix them.

## Existing foundation

Izuki already has substantial computer-control code:

- `automation.rs` — Enigo mouse/keyboard, human-like travel, UIA snapping,
  loading/covered/lock-screen checks, typed-text verification, stop handling,
  background-window execution, and a real-window action bench.
- `uia.rs` — Windows UI Automation discovery, numbered controls, named
  controls, focused values, window activation, and direct invocation.
- `browser.rs` + `browser-page.js` — WebView2 browser with page text, numbered
  DOM controls, click/type verification, video state, and an extension bridge.
- `capture.rs`, `ocr.rs`, `vision.rs` — screenshots, OCR, visual grounding, and
  a multi-round screenshot planner.
- `execution.rs`, `missions.rs`, `mission_journal.rs` — task contracts,
  budgets, durable checkpoints, evidence, interrupted-run recovery, and
  stop/retry states.
- `MissionsCard.tsx` — background mission progress, evidence, and final result.

## Actual long-task failure causes

1. **Two execution stacks.** Durable contracts, checkpoints, and journals are
   used by missions and a few specialised paths. Interactive chat/computer-use
   turns run through `brain.rs`/`companion.rs` without the same durable step
   state. A model timeout, restart, or interrupted turn can lose the plan.
2. **Action success is not universally verified.** Some actions check typed
   text, control identity, covering, and loading. Many clicks, keys, window
   changes, file operations, and browser actions do not prove the intended
   outcome before the loop continues.
3. **No common action-result contract.** `automation::execute` returns
   strings/errors, not `requested / observed / verified / unknown` plus
   precondition, postcondition, evidence, and retry policy.
4. **Retries can duplicate work.** There is no persisted idempotency key or
   per-step claim/complete ledger for interactive actions.
5. **Limits and loop detection are uneven.** Missions have time, round, action,
   and request budgets. Interactive runs do not enforce the same durable
   limits, and stall detection is mostly prompt guidance.
6. **Browser scope is narrower than it looks.** The in-app browser reads light
   DOM, not iframes/shadow DOM or a full accessibility tree. Its settle window
   is text-stability based, not a complete loading model.
7. **Task visibility is incomplete.** Missions have a progress card; an
   interactive long task has no consistent live steps, evidence, pause, resume,
   and verified outcome view.
8. **No end-to-end reliability benchmark.** Unit fixtures and a real-window
   bench exist, but there is no repeatable measurement of verified action
   success, task success, recovery, duplicates, time, CPU, and memory.

## Phased implementation

### Phase 0 — Instrument the current system

- One run record shared by chat tasks and missions.
- Counters for steps, retries, duplicate incidents, observations, and
  verification outcomes.
- Controlled scenarios: browser form, file rename/move, app switch, dialog,
  interruption/restart, stale target, lock screen.
- Record a baseline before changing control behaviour.

### Phase 1 — Durable task state

- `TaskRun`: objective, success criteria, ordered steps, current step, status,
  attempts, evidence, checkpoint, timestamps.
- Persist after every step with the same atomic side-file/rename pattern as
  `missions.rs`.
- Add pause, resume, cancel, retry, and recover transitions.
- Resume after restart without replaying completed writes.
- Put interactive execution inside the existing `execution::Scope`.

### Phase 2 — Observe → act → verify

- One observation provider: active window/process/title, UIA controls, focused
  control, loading/dialog/covered/locked state, browser URL/text/controls, and
  screenshot/OCR only when structured state is insufficient.
- Every step gets a precondition, postcondition, timeout, and verification
  policy.
- Verify with control presence/value, URL/title, window appearance, file
  existence, or an authorized visual region.
- If the outcome cannot be observed, mark `unknown` and escalate.

### Phase 3 — Semantic actions first

- Prefer UIA invoke/value/selection/focus and browser DOM actions over
  coordinates.
- Re-ground by control identity when a page moves.
- Add iframe/shadow-DOM support where needed; keep the extension path for the
  user's signed-in browser.
- Coordinate clicking is a recorded fallback only.

### Phase 4 — Recovery and duplicate prevention

- Persist an idempotency key before each write action.
- Classify failures: stale target, disabled, covered, loading, permission,
  network, app crash, ambiguity.
- Recover in order: wait/re-observe, re-ground, alternate semantic action,
  restore checkpoint, ask the user.
- Bound retries; detect repeated actions with no state change; never replay an
  `unknown` write automatically.

### Phase 5 — Task activity UI

- Compact current task, completed steps, current action, blocker, evidence,
  pause/resume/stop, and verified final result.
- Reuse `MissionsCard` and execution evidence; no second task system.
- Keep technical logs collapsed.

### Phase 6 — Real testing and metrics

Measure end-to-end success, verified action success, recovery success,
duplicate incidents, completion time, CPU/memory, and failure reasons on
controlled Windows/browser fixtures and real applications. A command returning
is not success; an observed postcondition is.

## Security

Keep existing scopes and approvals. Require visible desktop-control consent and
an immediate stop. Confirm sensitive, destructive, financial, and irreversible
actions. Never type passwords/OTP codes, bypass Windows security, or elevate
silently. Redact screenshots and logs; stop on the lock screen.

## Immediate sequence

1. Finish Eye Control calibration on the raised bottom row.
2. Add Phase 0 instrumentation and the `TaskRun` state model.
3. Convert one browser-form + file-operation flow to observe→act→verify with a
   durable checkpoint.
4. Measure before expanding to more applications.

## Implementation progress (2026-11-08)

On `freebuff/continuation`:

- `resume.rs` adds a bounded, atomic checkpoint for an unfinished task: the
  objective and completed steps survive an app restart, and are loaded only
  when the user says “keep going”. It never replays actions automatically.
- `automation.rs` no longer reports a typed field that shows different text as
  success, and a YouTube search that did not start playback is a failure.
- `brain.rs` feeds those failures back as recoverable snags, so the next look
  can fix the field or choose a real result instead of claiming completion.
- Regression tests cover checkpoint round trips, corruption and bounds; the
  recoverable-failure test is written but its execution is still pending
  because the running app held the shared test target lock.

Still not implemented: a full persisted step graph, task-level pause/resume
controls for interactive runs, a durable idempotency ledger, scroll/key/app
postconditions beyond the existing checks, and the task activity panel.
