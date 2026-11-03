# The agent bridge

Lets Claude Code and Freebuff keep developing Izuki with little intervention, and lets an authenticated outside "commander" (for example a ChatGPT assistant) see progress and add work.

```text
OBSERVE → UNDERSTAND → PRIORITIZE → ASSIGN → EXECUTE → VERIFY → RECOVER → REPEAT
```

## How it fits together

| Part | Where | What it does |
| --- | --- | --- |
| Task queue | GitHub issues labelled `agent-task` | One issue per task. Its labels say its state (`status:queued/assigned/in-progress/review/done/failed/blocked`), who has it (`agent:claude/freebuff/any`), how urgent (`priority:urgent/high/normal/low`) and what kind (`kind:feature/bug/perf/security/…`). A hidden block in the body holds the attempts, timestamps, heartbeat and pull request. The queue lives outside every agent's chat, survives restarts, and every change is on record. |
| Scheduler | `tools/agents/scheduler.mjs` | The decisions, as pure functions tested by `tools/agents/scheduler-check.mjs` (`npm`-free: `node tools/agents/scheduler-check.mjs`). |
| Coordinator | `tools/agents/coordinator.mjs`, run by `.github/workflows/agent-coordinator.yml` | Every 20 minutes (`7,27,47 * * * *`) and straight away on task, comment, PR and CI events. One pass: recover stalled runs, verify finished work against its checks, merge verified agent PRs into `milestone-196`, add the next roadmap task when an agent runs out, assign, and rewrite the dashboard. |
| Dispatcher | `tools/agents/dispatcher.mjs`, on the owner's PC | Starts Claude Code's assigned tasks, one at a time, through Claude Code's headless interface. |
| Roadmap | `docs/agents/roadmap.json` | The approved next steps (from `docs/WORKSTREAMS.md`). The coordinator only turns these into tasks; it never invents work. |
| Dashboard | The open issue labelled `agent-dashboard` ("🤖 Agent dashboard") | Each agent's state and current task, verified tasks done, first-try pass rate, failed attempts, average time to done and queue wait, the queue, release readiness, the next roadmap items, and what the last pass did. |

## What each agent can really do (checked 2026-11-03)

| | Claude Code | Freebuff |
| --- | --- | --- |
| Programmatic tasks | **Yes, verified.** `claude -p` (CLI 2.1.191) took a task and answered `BRIDGE-OK` (2.6 s of model time, 21 s with start-up). | **No.** Freebuff is a desktop app (`Freebuff.exe`, Electron). Its `freebuff://` link handler only opens the app (used for sign-in), and its bundled orchestrator is internal. There's no documented way to hand it a task. |
| New instructions mid-task | **Yes, at safe points**: stream-json input stays open, and a message sent while it works is handled when its current turn ends. | No interface, so nothing is sent while it works. |
| Own copy of the code | Yes: each task runs in its own git worktree and branch, so it never edits files another session is changing. | Works in the shared folder (claims files in `docs/COLLAB.md`). |
| State detection | The dispatcher's heartbeat on the task (every 2 minutes). | Its own commits on the branch (no Claude co-author line) in the last 30 minutes mean "busy"; a task it marked `status:in-progress` too. |

**Freebuff's shared-task workflow (its limit, stated plainly):** tasks for Freebuff wait in the queue with `agent:freebuff`. Nothing is pushed into its session, so it's never flooded or interrupted. AGENTS.md tells it to look at the queue when it finishes something and take the top task. The bridge can't make Freebuff start sooner than that.

Two more limits, found in the first live run:
- **"Assigned to Freebuff" means "next in line".** The coordinator labels the task; nothing reaches Freebuff until it looks.
- **Its "busy" signal only covers recent commits.** The coordinator runs on GitHub and can't see the PC, so Freebuff editing for 40 minutes without committing reads as idle. That's harmless, since an assignment sends it nothing, but its queue position may lag what it's actually doing.
- **The 20-minute schedule needs the workflow on `main`.** GitHub runs scheduled workflows from the default branch only. Until then, the coordinator runs on events from the open pull request (it already has) and by hand.

## Scheduling rules

- **Never flood a busy agent.** One task at a time per agent. A busy agent is never given a second task, and nothing is re-sent to it.
- **No two agents on the same files.** A task's `Files:` line is checked against what the other agent holds.
- **Dependencies first.** `Depends on: #12` holds a task until #12 is done (verified, not just finished).
- **Urgent first, without breaking anything.** `priority:urgent` goes first. If Claude is mid-task, it's asked to stop at its next safe point (commit and push what's verified) and the urgent task follows. Nothing is killed mid-operation.
- **Evidence, not assumptions.** A task that either agent may take goes to the free agent with the better verified record on that kind of task. With no record yet, both start even (a smoothed success rate), so neither is assumed faster.
- **Dispatch on completion.** When a Claude run finishes, the dispatcher takes the next assigned task straight away. The 20-minute pass is the safety net, not the trigger.

## Verification and recovery

- A task is **done** only when its pull request's checks all pass (then it's merged into `milestone-196`), or its pushed commit's checks pass. An agent saying "done" moves it to `review`, not `done`.
- A run that stops reporting for 20 minutes is **disconnected**: the task goes back to the queue with a note to check the branch for partial work.
- After a failure the next attempt carries a **different strategy** for that failure kind (read the failing tests first, read the CI log first, split the task, rebase first). After two failures by the same agent, a task either agent may take moves to the other. After three attempts it's **blocked** and shows on the dashboard for a person. The same prompt is never simply repeated.
- Releases stay with **one coordinator: Claude's main session** (AGENTS.md rule 2). Agents never merge to `main`, tag or release. The dispatcher's Claude can't run `gh pr merge`, `gh release` or push to `main` or `milestone-196`.

## Security

- **Only people with write access can give work.** A task or `/update` comment from anyone else is labelled `untrusted` and ignored. Issue text is instructions for an agent, never run as a command by the bridge.
- **No new secrets.** The coordinator uses the workflow's own token. The dispatcher uses the GitHub CLI and Claude Code already signed in on the owner's PC.
- **The coordinator's merges are limited.** Only agent pull requests into `milestone-196` whose checks all passed.

## Running it

- **Coordinator:** nothing to do. The workflow runs once it's on `main`. By hand: `node tools/agents/coordinator.mjs --dry-run` shows what it would do.
- **Dispatcher (owner's PC):** `node tools/agents/dispatcher.mjs` supervises until stopped (`--once` takes one task). Pause it by creating `.work/agents/paused`. Each run's full transcript is kept in `.work/agents/task-<n>-<attempt>.jsonl`.
- **Give Claude an update mid-task:** comment `/update <what changed>` on its task. It's delivered at the next safe point.
- **Who starts the dispatcher:** the owner. Claude's own session isn't permitted to run it continuously or install its scheduled task. Both were refused by Claude Code's permission checks (as "auto-mode bypass" and "unauthorized persistence"), and that's the owner's decision, not something to work around. Three ways:
  - run `node tools/agents/dispatcher.mjs` in a terminal and leave it open;
  - run `tools\agents\install-dispatcher.ps1` once, which starts it at sign-in and every 30 minutes;
  - add a permission rule in Claude Code's settings that allows Claude to start it.
  Until one of these happens, Claude's assigned tasks wait in the queue (#18 is waiting now).

## Connecting an outside commander (ChatGPT)

The commander talks to GitHub, never to the PC or the agents directly. Everything it does is an issue or a comment, on record.

1. **Make a token only for this:** on GitHub, Settings → Developer settings → Fine-grained tokens → Generate. Repository access: only `nova-izuki/izuki`. Permissions: Issues read and write, Pull requests read, Metadata read. Nothing else, so it can't push code or change settings. Set an expiry date.
2. **Create a custom GPT** in ChatGPT (Explore GPTs → Create → Configure → Actions → Create new action).
   - Authentication: API key, type Bearer, and paste the token there. It stays in ChatGPT's settings, never in a chat, a file or this repository.
   - Schema: an OpenAPI description of four GitHub REST calls on `https://api.github.com`:
     - `GET /repos/nova-izuki/izuki/issues?labels=agent-dashboard` (read the dashboard);
     - `GET /repos/nova-izuki/izuki/issues?labels=agent-task&state=all` (the queue);
     - `POST /repos/nova-izuki/izuki/issues` (a new task: title, body with `Files:` and optional `Depends on:`, labels `agent-task`, `status:queued`, `agent:any|claude|freebuff`, `priority:…`, `kind:…`);
     - `POST /repos/nova-izuki/izuki/issues/{number}/comments` (an `/update`).
3. **Instructions for the GPT:** read the dashboard first; add tasks only from the approved roadmap or the owner's requests; never set `status:` other than `queued`; never ask for merges or releases (Claude coordinates them).
4. **Tasks it creates are trusted** because the token is the owner's, which has write access.

If the token is ever exposed, revoke it on the same GitHub page. The bridge keeps running without a commander.

## End-to-end demonstration (2026-11-03, real repository, real agents)

Three tasks:
- **#20**, real work for Claude: remove a compiler warning in `roomrec.rs`.
- **#21**, real work for Freebuff: retire a redundant `capture_window` stub.
- **#22**, a recovery test: a run whose heartbeat stopped two hours earlier.

The roadmap had already produced **#18** for Claude (result checks), made to depend on #20.

| Step | What happened (evidence on the issues) |
| --- | --- |
| Recovery | The first coordinator pass found #22's heartbeat 2 hours old, recorded it as disconnected and requeued it with a different strategy ("check the branch for partial work before starting again"). #22 was then closed as a demo, with its simulated failure removed from Claude's record. |
| One task per agent | #18 was assigned to Claude first, so #20 correctly waited (the scheduler never gives a busy agent a second task). With #18 made to depend on #20, the next pass assigned #20. |
| Freebuff not flooded | #21 was labelled for Freebuff. Nothing was sent to its session; it takes the task from the queue when it finishes its own work. |
| Dispatch | The dispatcher started headless Claude Code on #20 in its own worktree and branch (`agent/claude-20-1`). |
| Checkpoint update | A `/update` posted mid-run was queued at 14:13:08 and delivered at the next safe point at 14:13:38, and Claude acknowledged it. In the final run, both updates were followed: the PR quotes the clean `cargo check` and its post-commit final line. |
| Result | Claude finished in 10 minutes: one line changed, `cargo check --lib` clean, committed, pushed, **PR #23** into `milestone-196`, "RESULT: done". |
| Event-driven pass | Opening PR #23 started a coordinator pass on GitHub by itself. It saw Claude free and gave it the next ready task, without waiting for the 20-minute schedule. |

**What the live runs caught, all fixed before the run that succeeded:**
1. The task record lacked the issue text, so saving state erased #20's description (restored). State is now never saved over an empty description, with a test.
2. A leftover folder from a failed try blocked the next one. The cleanup now removes the package link first (never deleting through it), then the folder.
3. Claude ended a turn to wait for its own background build, and the dispatcher took that as the task's end, stranding the build. A run now ends only on the agent's `RESULT:` line, with one nudge after 10 quiet minutes, and leftover processes are stopped.

None of these were counted against the agent: each was reset as the bridge's own fault.
