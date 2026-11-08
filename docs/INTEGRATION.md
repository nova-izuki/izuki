# Integration tracker: what's in, what's next, what's blocked

One shared list for Claude, Freebuff and Codex. Update the row for your own
work when its state changes, and add a row for anything new you finish. The
release coordinator (Claude, AGENTS.md rule 2) cuts a release only from
rows marked **ready** whose verification is real.

The owner's goal for the next release (1.0.198): every completed, compatible
feature from all three agents in one stable update. Nothing unsafe or
unfinished ships just because it exists.

Last updated: 2026-11-08 (Claude).

## Lanes (owner, 2026-11-08)

- **Claude Code:** Eye Control (tracking, calibration, cursor, emergency
  stop, real Windows testing); the agent bridge (`tools/agents/`); releases
  and version files.
- **Freebuff:** everything else in the product, including computer control,
  Smart Screen Actions, browser and application control, documents, Smart
  Vision, Developer Mode, design and Chat. It works on `freebuff/continuation`.
- **Codex:** its assigned tasks, when available.

## Work

| Item | Agent | Where | State | Verified by | In 1.0.198 |
| --- | --- | --- | --- | --- | --- |
| Eye Control safety: native emergency stop (Ctrl+Alt+Shift+X, Stop button, voice), physical mouse/keyboard takeover, watchdog, held-input release | Claude | `milestone-196` (PR #31) | merged | 619 Rust tests (8 `airsafe`); real-Windows `eye_stop_probe` 6/6, owner away | yes |
| Eye accuracy check: 5 fresh dots measure real error and wobble; the mouse moves only at ≤8% error and ≤3.5% wobble, to a steady look | Claude | `milestone-196` (PR #31) | merged | `test:eye` (accuracy cases) | yes, preview only (next row) |
| Eye release gate: installed builds draw the eye cursor only; the eye lane never moves the mouse until the supervised session passes | Claude | `claude/eye-release-gate` | in review | `tsc`, `test:eye`, `airsafe` tests | yes |
| Eye stop probe and hand-overlay native run | Claude | `milestone-196` (PR #34) | merged | probe 6/6; hand host assertions pass natively | tooling |
| Bridge: weighted §2 productivity score, per-agent attribution, dashboard column (flag off) | Claude (from the #25 run) | PR #33 | in review | `scheduler-check` | tooling |
| Bridge: lanes in `docs/agents/roadmap.json` match the 2026-11-08 split | Claude | `milestone-196` | merged with this file | — | tooling |
| Chat history (local, searchable), pinned chats, deleted chats stay deleted | Freebuff | `freebuff/continuation` | committed, not pushed | `chat-history-check`, `tsc`, build | yes, after CI on the integration PR |
| Desktop panel design (cosmic atmosphere, tab indicator, presence orb) | Freebuff | `freebuff/continuation` | committed, not pushed | `tsc`, build | yes, after a visual check |
| Unfinished tasks survive a restart and resume on "keep going"; a wrong typed field or an unstarted video is reported as a failure | Freebuff | `freebuff/continuation` | committed, not pushed | `resume` 6/6; two automation regression tests not yet run (disk was full) | yes, once CI runs those tests |
| Robot hand only during actions (#27) | Codex | `main` (1.0.197) | released | CI; native host assertions | shipped |
| Codex fallback foundation (#28) | Codex | `main` (1.0.197) | released | `contract.test.mjs` 10/10 | shipped |

## Outstanding

- **Supervised Eye accuracy session** (owner and Claude). Real camera: calibrate, run the 5-dot check, try the stop key, the Stop button, a voice stop and mouse takeover. If it passes, set `airsafe::EYE_MOUSE_RELEASED = true`.
- **Hand overlay: the native window-switch step** (Codex's #27). Run `node tools/hand-overlay-check.cjs --native` from the owner's own terminal. A background terminal can't take the foreground.
- **#18** (Smart Screen Actions: check results) and **#32** (YouTube ad skip): in Freebuff's queue. #18 has unverified earlier work on `agent/claude-18-1`.
- **Disk space:** C: had 3.7 GB free on 2026-11-08 (builds failed). Claude freed 5.6 GB of stale build output and test profiles. Most of the disk is used outside this project.

## Release checklist (1.0.198)

1. Every row marked "yes" is merged into `milestone-196`, and its review findings are handled.
2. On the integrated milestone: `cargo test --lib`, `npx tsc --noEmit`, `npm run build`, `npm run test:eye`, `node tools/chat-history-check.mjs`, `node tools/agents/scheduler-check.mjs`.
3. GitHub checks are green on the release PR (Windows build, web, mobile, CodeRabbit).
4. Claude bumps the version and folds `docs/NEXT-RELEASE.md` into `docs/RELEASE-1.0.198.md`.
5. After the merge to `main`: the release has its installer, MSI and update signatures, `verify-updater` passes, the update endpoint serves 1.0.198, and the website links work.
