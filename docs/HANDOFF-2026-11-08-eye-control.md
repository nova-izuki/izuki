# Eye Control handoff — 2026-11-08

Claude Code owns Eye Control from this point. Freebuff has moved its work to
`freebuff/continuation` in `.work/freebuff-continuation` and has not edited,
staged, committed, stashed or reverted any of the Eye files below.

## Owner report

Calibration now succeeds. Live gaze navigation is still inaccurate, and there
is no reliable emergency stop. Those are Claude's remaining bugs; the tests
below do not prove either one.

## Files in the shared `milestone-196` worktree

Modified but uncommitted (14 files):

- `package.json` (the `test:eye` script only)
- `src-tauri/src/capture.rs`
- `src-tauri/src/settings.rs`
- `src-tauri/src/shots.rs`
- `src/components/AirCard.tsx`
- `src/components/AirControl.tsx`
- `src/components/AirToggle.tsx`
- `src/lib/camera.ts`
- `src/lib/eyeGate.ts`
- `src/lib/eyeTrack.ts`
- `src/lib/eyeWorker.ts`
- `src/lib/ipc.ts`
- `src/lib/types.ts`
- `tools/eye-gate-check.cjs`

Untracked:

- `src/components/EyeControl.tsx`
- `src/lib/eyeControl.ts`
- `src/lib/eyeMap.ts`
- `tools/eye-control-check.cjs`

There are also two unrelated untracked Smart Vision repro artifacts
(`tools/repros/2026-11-03-smart-vision-live-cycle/frame-sample.jpg`,
`.../status-after-minimize.txt`); leave them alone unless owning that lane.

## What is implemented

- Nine-point calibration with progress, a reason when a dot cannot commit, a
  per-dot timeout, Retry, Retry all, and Cancel.
- Affine and quadratic map candidates; the affine map is used when it wins on
  held-out error.
- One-dot retry without discarding the other eight points.
- The bottom calibration row is raised to 70% (from 78%) because live samples
  showed the lower-lid/downward look collapsing horizontal signal.
- A bottom-row cue: look sideways as well as down.
- Hit-test markers (`data-izk-hit`) and direct callbacks for the retry and
  cancel controls, because the overlay is OS-level click-through.
- Calibration gate unchanged: `CALIBRATION_MAX_RMS = 0.14`; do not lower the
  threshold or auto-skip a point.

## Test evidence

Run from the shared worktree:

```text
npm run -s test:eye
  eye-gate checks pass
  eye-control checks pass
  exit 0
npx tsc --noEmit --pretty false   exit 0
npx vite build                    exit 0
git diff --check                  exit 0
```

These are logic and build checks, not a successful live gaze-navigation run.

## Live diagnostics

The overlay exposes `window.__izukiEyeCal` with `state`, `rms`, `failReason`,
`points`, `badIndex`, `retryIndex`, `gaze`, `eyes`, `headStable`. This
diagnostic hook exists only in a development build; a normal installed build
does not expose it. The last
pre-fix failure was RMS `0.2464`, with the bottom outer dots reading nearly
the same horizontal position; that is why the row moved to 70%.

## Known bugs / next steps for Claude

1. **Live pointer accuracy.** Calibration fitting well is not the same as the
   cursor landing on the intended target. Measure error at each target after
   commit, then fix the mapping/filter rather than widening the gate.
2. **Emergency stop.** Make a physical, always-available stop end cursor
   movement, click generation, calibration and camera processing immediately;
   verify it in a live run. It must not depend only on an overlay button.
3. **Retry controls.** The direct callbacks and hit-test markers are in the
   tree, but native click delivery has not been re-verified since the fix.
4. **Commit ownership.** Commit only Eye files, with focused messages. Do not
   include Freebuff's `freebuff/continuation` branch or its `resume.rs` work.

## Safety rules

Keep the camera off by default and behind the existing gate. Never persist
camera data. Never type passwords or act on the lock screen. Do not weaken the
calibration threshold to make a test pass. Do not claim a live fix without
observing the cursor and stop behaviour on the real camera.
