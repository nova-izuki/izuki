# Claude continuity record — Codex backup, 2026-11-03

Audit began around 15:57 UTC; observations below are snapshots, not guarantees
that a live process has remained unchanged. Re-check the queue before resuming.
Repository: `nova-izuki/izuki`. No release, merge, dispatcher restart or agent
ownership transfer was performed by Codex.

## Where Claude stopped and what remains alive

- Shared checkout: `milestone-196`, `8002c4a`. Last committed work records
  scheduler requirements, not their implementation. Claude's active bridge PR
  is #24, `claude/agent-bridge`, `3f357462e57e60a7e857b04e57f1b34b6f1dbf39`,
  targeting `main`. It must remain Claude's branch.
- Shared uncommitted `tools/agents/coordinator.mjs`: moves review-deadline
  initialization ahead of comment lookup; checks merged verdict first;
  distinguishes missing objects from transient verification API errors.
  Shared uncommitted `dispatcher.mjs`: validates parent/child creation times
  during process-tree discovery. These correspond to the latest CodeRabbit
  findings; they are **not yet pushed/verified fixes** in the audited PR.
- Local dispatcher PID **24036** owns `.work/agents/dispatcher.lock`; its Claude
  child PID **27664** started at 15:51 UTC. Task #18 is in progress, attempt 1,
  branch `agent/claude-18-1`, worktree `.work/agents/task-18`, based on `e794b0f`.
  Its worktree was clean at inspection: no action-result implementation landed.
  Heartbeats continued through 16:06 UTC. A live heartbeat is not task progress.
- The task transcript's last event at 16:03 UTC was `type: result`,
  `subtype: success`, **`is_error: true`**. Do not interpret the subtype alone
  as success or restart the run. A Cargo build started by that lane remained
  alive; Codex's baseline Rust test correctly waited for its build lock.
  Inspect the runtime diagnosis through the owning session before recovering.
- The older primary Claude process and Freebuff desktop processes are also
  alive. Their existence alone does not establish that a model is available.
  No such process was killed or replaced.

## Completed work: do not repeat

| Area | Evidence / actual state |
| --- | --- |
| 1.0.196 | Public release published 07:48:21 UTC; Windows EXE/MSI signatures, updater `latest.json`, portable EXE, Android APK and iPhone IPA uploaded. Release doc identifies `9bfafba`. Historical milestone checkboxes are not current publication status. This audit checked release metadata, not a new installer/rollback drill. |
| Action/speed baseline | WORKSTREAMS records 11/11 decision scenarios, median 0.8 s, and 7/7 real action benchmark cases. Per-action scroll/open/shortcut verification, broader re-plan and wait optimization remain roadmap work. Do not rerun mouse-driving benchmarks while agents/the owner use the desktop. |
| Bridge demonstration | #20 completed through merged PR #23 (`775fb27`); #22 simulated-disconnect demonstration completed. #18 depends on #20 and is already dispatched. |
| Review fixes | `33d4708` handles 15 findings, `5e7125d` four more, `e794b0f` review deadline/process-tree cleanup. PR branch has its own corresponding commits; use file content and PR head, not milestone hashes alone. |
| Freebuff document increments | `201494d`: typed-only intent routing; `0af45ea`: one repair for prose instead of document output; `dd5f7c1`: real staged PDF/Office attachment copies. Preserve these. |
| Scheduler request | `8002c4a` adds the requirements; task #25 holds implementation. Existing basic metrics do not satisfy the richer weighted/per-lane acceptance requirements. |

## Ownership and unfinished work

- **Claude:** PR #24 review fixes/CI; Smart Screen Actions #18; scheduler #25;
  security/UI Automation/speed; all merges, version bumps and releases.
- **Freebuff:** document editing/intelligence, attachments/chat deliverables;
  Air/Eye, Smart Vision/Developer Mode; #21 redundant non-Windows capture stub.
  The shared dirty `capture.rs` removes that stub. Smart Vision repro JPG/status
  files remain untracked and were not inspected or staged by Codex.
  `attachments.rs` became dirty during this audit: evidence of continuing work,
  not abandoned changes.
- Remaining document work: filled PDF form values and difficult CID-font text,
  actual edited deliverables and originals preserved, file-result UI/opening,
  fixture/live validation. Original owner documents were not read by Codex.
- Remaining Smart Vision/Eye work includes real live-cycle proof, calibration,
  look-to-scroll and chat pointing integration, as tracked by Freebuff.
- Roadmap: result checks → re-plan; measured wait optimization; extension-based
  YouTube skipping; eye calibration → look-to-scroll. Respect these dependencies.
- Dashboard #19 was last rewritten at **14:42 UTC**, describing #18 as assigned.
  That conflicts with newer issue heartbeats/process evidence: dashboard is stale.
- Scheduled coordinator workflow is **absent on `main`** (GitHub contents API
  returned 404). The cron `7,27,47 * * * *` is implemented on the bridge branch,
  but automatic default-branch scheduling is not established until it lands.
  The local dispatcher is separately running; do not start a second one.
- Open development PR is now #17 (“Next release after 1.0.196”), not the
  historical draft #16 mentioned in some repository instructions.

## Independent PR #24 assessment

At audited head `3f35746`, both Windows and both web runs and CodeRabbit status
were successful; GitHub reported mergeable/clean. **Green does not resolve the
review findings.** The seven unresolved, non-outdated threads include:

1. Commander trust/approval coupling (Trivial security classification): tasks
   created with the owner's token have the same author identity as the owner.
   This is a real trust boundary limitation; the owner has explicitly authorized
   autonomous work. Claude should record the intended trust decision rather
   than claim credential separation or invent an extra approval requirement.
2. Release authentication wording (Major): the release doc says no other local
   program can impersonate either side. A program with access to the same user's
   shared pairing key can sign messages. Narrow the claim; never expose/read
   the key during this review. The current PR release wording is still broad.
3. `agent:any` reassignment (Major): current code preserves `state.flexible`;
   inspect that fix before treating the older unresolved thread as new work.
4. Background process shutdown (Major): recorded process/start identities and
   stop logic are present. Retain the latest parent-relationship fix below.
5. Deadline before comments (Major): valid at PR head; matching local coordinator
   edit exists. Comment/API errors must not prevent a deadline from starting.
6. Transient verification failure (Major): valid at PR head; matching local edit
   exists. A failed lookup is not a failed task verdict.
7. Parent/child PID reuse (Major): valid at PR head; matching local dispatcher
   edit exists. Otherwise an unrelated older process can enter the kill set.

Threads are on [PR #24](https://github.com/nova-izuki/izuki/pull/24).
No PR thread was resolved and no PR #24 source was changed by Codex.
Milestone CI at audit included a successful web run, another verification run
still active and a queued mobile build. Re-check exact SHA before release.

## Codex's safe independent deliverable

Issue [#26](https://github.com/nova-izuki/izuki/issues/26), branch
`codex/fallback-contract`, isolated worktree `.work/codex-fallback`.
Only new `tools/codex-fallback/*`, this record and additive coordination/release
notes. No `tools/agents/*`, roadmap, workflow or version files were changed.
The issue deliberately lacks `agent-task`: current scheduler cannot own Codex
and that label could cause duplicate assignment to another agent.

- Official CLI metadata probe passed on **codex-cli 0.162.0-alpha.2**:
  required exec flags present; `login status` returned success. No credential
  file was opened and no model turn/extra worker was launched.
- Streaming completion contract and argument builder implemented; 10 tests
  pass, including every UTF-8 chunk split, invalid lifecycle, process errors,
  command-output spoofing, incomplete turns and sanitized probe failures.
- `npx.cmd tsc --noEmit -p .`, production build, conversation checks **35/0**,
  Air voice **18/0** and all Air scroll cases passed. The `.cmd` launchers are
  necessary under this PC's PowerShell policy; no policy was bypassed.
- Full Rust test was started with `IZUKI_TEST_MANIFEST=1` and shared Cargo target;
  initially blocked safely on the active build lock. Final outcome and commit
  references will be appended once available; do not infer a pass from this row.

**Automatic fallback is NOT integrated.** See `tools/codex-fallback/README.md`
for the remaining adapter, queue/capability, cancellation, heartbeat and real
end-to-end proof required under Claude's bridge ownership.

## New owner request: random robot hand

Issue [#27](https://github.com/nova-izuki/izuki/issues/27), separate branch
`codex/hand-overlay-lifecycle`, worktree `.work/codex-hand`. Codex claims only
the hand lifecycle and atomic overlay/settings/tray hooks. Freebuff's Air/Eye,
camera, CalloutChips and document files remain untouched.

Root cause found: idle `HandCursor` rendered by the old follower option, plus an
unconditional preview-mode hand ignoring that option. The separate Air tracking
ring is useful and must stay. Work in progress adds an off-by-default action
visual setting, bounded/stop/window-switch cleanup and hidden-overlay polling
cleanup. Real Windows desktop Edge component regression passed; native Tauri
and full Rust verification remain pending. Do not call this shipped or complete.

## Resume checklist

1. Re-read live COLLAB, shared dirty diffs, #18 heartbeat/transcript and dispatcher
   lock/process identity. Resume the existing runtime; don't blindly relaunch it.
2. Finish Claude's two dirty PR #24 fixes, confirm deadline fix is included,
   resolve/acknowledge remaining findings, run checks and push Claude's branch.
3. Review Codex's independent PR(s); no automated self-merge of bridge work.
4. Verify #18's actual result before closing it; implement #25 against the full
   scheduler requirements, not basic task/hour counts.
5. Let Freebuff finish document and capture work. Never stage its dirty files.
6. Release only through Claude's established verified workflow; keep updater
   signature checks, original files and rollback intact.

## Follow-up snapshot and verified delivery

- At 16:14 UTC, dispatcher-owned task #18 changed to `status:failed`, category
  `stalled`, after 23 minutes / two turns. Its final message explicitly reports
  a session limit resetting at **12:20 pm America/Chicago**. The dispatcher
  performed its own shutdown; Codex did not interrupt it or recover the task.
  No Smart Screen Actions implementation exists on the clean task worktree.
- Freebuff committed `556ba4f` locally: removes #21's dead capture stub and an
  unused attachment import. This commit also carries the shared coordination
  claims added by Codex. At the subsequent remote check, `milestone-196` was
  still `8002c4a`, and #21 was still in progress: do not call it verified/done
  until Freebuff reports its push/checks. No dirty attachment/capture edits
  remained at that snapshot. Dirty coordinator/dispatcher fixes still remained.
- Codex fallback implementation commit: **`e026b1c`**. Full local Rust suite
  completed: **599 passed, 0 failed, 48 ignored**, 23.59 s execution after the
  build-lock wait/compilation. Ignored/manual hardware tests were not forced.
  Frontend/build/conversation/Air results above apply to the same base/code.
- CodeRabbit CLI completed analysis of all eight committed fallback files:
  **`review_completed`, zero findings**. This was an actual completed review,
  not a heartbeat, skipped review or missing service response.
- The implementation never invoked a model turn. CLI authentication/readiness
  and deterministic protocol tests are the proven boundary; automatic backup
  scheduling remains unimplemented and disabled.

### Additional confirmed bridge finding (Major): resource limits corrupt metrics

The live #18 result at 16:03 UTC says “You've hit your session limit” and has
`is_error: true`. In `dispatcher.mjs`'s `event.type === 'result'` handler,
`is_error` is ignored: only a textual RESULT line ends the task. The dispatcher
later nudges the limited session and records `stalled` / `result: failed` in
#18's history. That is an availability failure, not evidence that an agent
implemented the task badly. The recorded 23-minute failed attempt is therefore
unsuitable for quality/productivity comparisons without classification.

Claude's bridge lane should distinguish quota/auth/service-unavailable results
from task/test failures, stop unnecessary nudges, preserve partial work, back
off until availability returns and exclude these events from agent-quality
failure metrics. Add a fixture for this observed result and verify recovery
without relaunching an in-flight runtime. Codex did not edit the owned dispatcher
or rewrite #18's history. The diagnostic was handed to scheduler task #25.

PR #28 now has all audited GitHub checks green (both Windows, both web and
CodeRabbit), in addition to the local results above. The PR remains open for
Claude; Codex did not merge it.
