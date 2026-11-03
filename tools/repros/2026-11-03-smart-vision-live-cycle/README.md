# Smart Vision live cycle (observe → diagnose → retest), 2026-11-03

The milestone's "one real observe → diagnose → fix → retest cycle, recorded"
row, finally done on the dev machine itself. Never any publish or release:
the plan that was tested was already committed in `45f7446` — this run
proved the fixes live, on a window, not only in unit tests.

## What ran

- `cargo build --features devvision` (debug, not the release pipelines);
  the app was launched with `IZUKI_VISION=1` in `dev-run.log`.- The installed app (`Downloads\Izuki\izuki.exe` under the owner's own
  profile; the account name is deliberately not written here) was closed for
  the run (single-instance rule would otherwise bounce the dev build to the
  installed app); it was relaunched right after.
- The observer came up: `[izuki] smart vision watching on 127.0.0.1:9092`.

## Observe

- `/api/status` answered with the token file's Bearer (`status-*.txt`).
- `/api/events` answered (`{"events":[]}` — nothing happened, honest).
- `/api/frames/1` served a real JPEG of Izuki's own window (747×960,
  24 945 bytes; `frame-sample.jpg`).
  **The JPEG itself is deliberately not committed** — it shows the owner's
  own screen, and AGENTS.md forbids personal content in tracked files; a
  live rerun regenerates one (same command line in this README).

## Diagnose (the review 7 #1 probe, live)

- Window minimized (`ShowWindow SW_MINIMIZE`), sample taken while still
  minimized: `status-while-minimized.txt` — `captures` frozen (22→22) while
  `ticks` kept growing (114→128). Watch loop alive, nothing captured: the
  hidden window keeps its screen rect, and the old code would have quietly
  recorded the desktop behind it. That behaviour is what `45f7446` closed.
- Honest reading of the counters: they show no retained frames during the
  minimized interval, but the counter alone cannot separate the
  hidden-window gate from the existing dedupe (a repeated grab of the same
  pixels is dropped either way). A unit test of the gate would need a real
  window handle, so there is none — the gate is reviewed code
  (`window_visible` inside `capture_once`), and this live run is its
  evidence, consistent with it rather than an isolation of it.
- After restore, `captures` stays 22 until the window's pixels change —
  the restored view matches one inside the two-minute dedupe window, so
  the map drops it. Exactly the designed rule.

## Fix

Already in `45f7446` (review 7 #1: `IsWindowVisible` + `IsIconic` gate in
`capture_once`; see the commit and the review log rows). This run is the
retest half the previous cycle could not perform (no live build).

## Retest

`status-while-minimized.txt` vs `status-after-restore.txt`, plus the unit
tests in the same commit. Suites that cover the shape:
- devvision: 598 passed / 0 failed / 45 ignored (2026-11-03)
- default (release shape): 586 passed / 0 failed / 46 ignored

## Performance reading (debug build, same method as the baseline)

- `cpu-idle.txt`: the Izuki process used 8.8% of one core over 15 s idle
  (release baseline row on installed 1.0.195: 1.9%). A debug build without
  optimisations is not directly comparable; the release candidate gets the
  same 15 s sample before the owner signs off.

## Not exercised live (limitations)

- A Capture Bug button press and the dashboard in a real browser (both
  need a person at the devmode panel; the endpoints they wrap are the
  ones probed above).
- Timeline events with real actions this run produced none (nothing was
  saved or reported during the probe) — the record path stays covered by
  its devvision tests and the earlier reproduced-leak repro.
