# Integration tracker: what's in, what's next, what's blocked

One shared list for Claude, Freebuff and Codex. Update the row for your own
work when its state changes, and add a row for anything new you finish. The
release coordinator (Claude, AGENTS.md rule 2) cuts a release only from
rows marked **ready** whose verification is real.

The owner's goal for the next release (1.0.198): every completed, compatible
feature from all three agents in one stable update. Nothing unsafe or
unfinished ships just because it exists.

Last updated: 2026-11-08 (Claude): PRs #33, #35 and #36 merged; 1.0.198 prepared in release PR #38. It counts as released only after the post-merge checks in the checklist below pass.

## Who does what (owner, 2026-11-08, latest)

- **Two developers:** Claude Code and Freebuff. Either may work on any part
  of Izuki. Ownership is per GitHub issue, not per area. Claim an issue
  before starting, and agree on its comments before touching files the
  other holds (AGENTS.md, "Two developers, one app").
- **Claude Code:** Eye Control first. Claude is also the release
  coordinator: version files and release notes.
- **Freebuff:** works on `freebuff/continuation` (or its own `freebuff/…`
  branches).
- **Codex:** paused. Don't assign it work. Its finished work is merged and
  listed below.

## Work

| Item | Agent | Where | State | Verified by | In 1.0.198 |
| --- | --- | --- | --- | --- | --- |
| Eye Control safety: native emergency stop (Ctrl+Alt+Shift+X, Stop button, voice), physical mouse/keyboard takeover, watchdog, held-input release | Claude | `milestone-196` (PR #31) | merged | 619 Rust tests (8 `airsafe`); real-Windows `eye_stop_probe` 6/6, owner away | yes |
| Eye accuracy check: 5 fresh dots measure real error and wobble; the mouse moves only at ≤8% error and ≤3.5% wobble, to a steady look | Claude | `milestone-196` (PR #31) | merged | `test:eye` (accuracy cases) | yes, preview only (next row) |
| Eye release gate: installed builds draw the eye cursor only; the eye lane never moves the mouse until the supervised session passes | Claude | `milestone-196` (PR #36) | merged | `tsc`, `test:eye`, `airsafe` tests; CI | yes |
| Eye stop probe and hand-overlay native run | Claude | `milestone-196` (PR #34) | merged | probe 6/6; hand host assertions pass natively | tooling |
| Bridge: weighted §2 productivity score, per-agent attribution, dashboard column (flag off) | Claude (from the #25 run) | `milestone-196` (PR #33) | merged | `scheduler-check`; CI | tooling |
| Bridge: lanes in `docs/agents/roadmap.json` match the 2026-11-08 split | Claude | `milestone-196` | merged with this file | — | tooling |
| Chat history (local, searchable), pinned chats, deleted chats stay deleted; delete asks once more (Claude's review fix) | Freebuff | `milestone-196` (PR #35) | merged | `chat-history-check`, `tsc`, build; CI | yes |
| Desktop panel design (cosmic atmosphere, tab indicator, presence orb) | Freebuff | `milestone-196` (PR #35) | merged | `tsc`, build; Claude's visual check | yes |
| Unfinished tasks survive a restart and resume on "keep going" (a bare "yes" only right after a stop in this run); a wrong typed field or an unstarted video is reported as a failure, with a matching retry note | Freebuff, review fixes by Claude | `milestone-196` (PR #35) | merged | `resume` 6/6; the full Rust suite in CI (Windows job) | yes |
| Release review fixes (PR #39, from the review of release PR #38): unpinning an old chat never drops it; a still pinch keeps its button held; saved chats are written at most every 1.5 s while a reply streams; a reopened chat shows a cut-off reply as cut off; a keep-going checkpoint expires after 6 h, takes only the bare command after a restart, and is never loaded back once taken; the accuracy check's first status isn't dropped | Claude | `claude/release-198-review` | in review | `tsc`, `test:eye`, `chat-history` (new unpin case), new Rust tests in CI | yes |
| `test:workspace` runs on a Windows checkout too (it failed on CRLF line ends; CI on Linux was fine) | Claude | release commit | merged | `test:workspace` locally | tooling |
| Robot hand only during actions (#27) | Codex | `main` (1.0.197) | released | CI; native host assertions | shipped |
| Codex fallback foundation (#28) | Codex | `main` (1.0.197) | released | `contract.test.mjs` 10/10 | shipped |

## Next, after 1.0.198 (claimed on GitHub)

| Issue | Owner | Area |
| --- | --- | --- |
| #40 Eye Control: recover when the camera is switched, unplugged or busy | Claude | Eye |
| #41 Eye Control: steady eye cursor when the head moves after calibration | Claude | Eye |
| #42 Eye Control: first-run guide (stop key, calibration, preview) | Claude | Eye, Settings UI |
| #43 Eye Control: supervised accuracy session, then the eye lane may move the mouse | Claude + owner | Eye (blocked on the owner) |
| #44 AIR Control (hand): press-and-hold, drag and tracking-loss reliability | Claude | AIR |
| #18 Smart Screen Actions: check the result of scrolling, opening and shortcuts | Freebuff | computer automation |
| #32 Skip YouTube ads through the extension | Freebuff | browser |
| #37 Minor review findings from PRs #35 and #38 | Freebuff | Chat, design |

Not claimed yet, for whichever developer gets there first (open an issue to claim it): Chat reliability beyond #37 (streaming errors, retries, long chats), application performance (startup, idle CPU, the Settings page), and UI/UX polish outside Eye Control.

## Outstanding

- **Supervised Eye accuracy session** (owner and Claude, #43). Real camera: calibrate, run the 5-dot check, try the stop key, the Stop button, a voice stop and mouse takeover. If it passes, set `airsafe::EYE_MOUSE_RELEASED = true`.
- **Hand overlay: the native window-switch step** (#27, taken over by Claude; Codex is paused). From the owner's own terminal (a background terminal can't take the foreground), in `src-tauri`: `$env:IZUKI_TEST_MANIFEST=1; cargo build --example hand_overlay_probe`, then from the repo root `$env:IZUKI_HAND_TEST_HOST="$PWD\src-tauri\target\debug\examples\hand_overlay_probe.exe"; node tools/hand-overlay-check.cjs --native` (PowerShell; the manifest switch is needed or the probe can't start, see docs/VALIDATION-HAND-OVERLAY-2026-11-03.md).
- **Scheduler weights (Claude, bridge):** `rate` and `time` come from the same minutes, so speed carries 0.45, not 0.30. Measure `rate` over all working time (failed attempts included) before weighted assignment is turned on (`WEIGHTED_ASSIGNMENT` or `BRIDGE_WEIGHTED=1`).
- **#37** (PR #35's nine minor review findings: Chat recents focus, reduced motion, design-study wording, ownership notes): in Freebuff's queue, not release blockers.
- **#18** (Smart Screen Actions: check results) and **#32** (YouTube ad skip): in Freebuff's queue. #18 has unverified earlier work on `agent/claude-18-1`.
- **Disk space:** C: had 3.7 GB free on 2026-11-08 (builds failed). Claude freed 5.6 GB of stale build output and test profiles. Most of the disk is used outside this project.

## Release checklist (1.0.198)

1. Every row marked "yes" is merged into `milestone-196`, and its review findings are handled.
2. On the integrated milestone: `cargo test --lib`, `npx tsc --noEmit`, `npm run build`, `npm run test:eye`, `node tools/chat-history-check.mjs`, `node tools/agents/scheduler-check.mjs`.
3. GitHub checks are green on the release PR (Windows build, web, mobile, CodeRabbit).
4. Claude bumps the version and folds `docs/NEXT-RELEASE.md` into `docs/RELEASE-1.0.198.md`.
5. After the merge to `main`: the release has its installer, MSI and update signatures, `verify-updater` passes, the update endpoint serves 1.0.198, and the website links work.
