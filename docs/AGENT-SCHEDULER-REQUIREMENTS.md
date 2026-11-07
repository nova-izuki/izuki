# Agent scheduler requirements — intelligent assignment & performance optimization

Owner request, 2026-11-03 night. This file is the recorded requirements set for
the agent-orchestration bridge ([AGENTS-BRIDGE.md](AGENTS-BRIDGE.md), Claude's
lane). It does not change how the bridge is owned or released: implementation
incrementally in `tools/agents/` and the coordinator workflow, feature-flagged
until each piece is proven, one release coordinator (Claude). The queue task
carrying this work lives on GitHub with the `agent-task` label.

Six items of the existing bridge already satisfy parts of it (per-agent state,
no flooding, event triggers, measured times, dashboard, queue). Everything
below is the target definition — gaps are listed per section.

## 1. Intelligent task assignment

- Detect when Claude Code and Freebuff are busy, idle, blocked, disconnected
  or ready, from real signals (issue labels, last commit activity, dispatcher
  heartbeats — not guesses).
- Assign tasks by capabilities, current workload, dependencies and **proven
  performance history** (see §2), not by name or habit.
- Never send a prompt to a busy agent; queue instead.
- Freebuff's tasks keep the shared-queue contract (AGENTS.md: it picks up the
  top assigned `agent:freebuff` issue when it finishes a piece of work) — the
  scheduler marks it ready when work lands, never pushes into its session.
- Claude Code takes new priorities at safe checkpoints (between tasks or at
  its declared checkpoint boundary) when its runtime supports it.
- Event-driven dispatch: after a task completes, the next eligible task is
  assigned right away; the 20-minute cron becomes reconciliation only (stale
  statuses, missed calls, queue health).

## 2. Measure real productivity

- **Rich metrics, not only verified tasks/hour.** Apply them as **per-lane
  multipliers on estimated work** so simple response-speed metrics don't
  dominate. Weight each lane: Verified tasks/hour cap 0.30, First-attempt test
  pass rate 0.20, Average task completion time 0.15, Quality of completed
  implementations (review fixes required, docs/discipline evidence) 0.15,
  Rework required 0.10, Regressions introduced 0.05, Queue wait time 0.03,
  Cost/resource usage 0.02.
- Reliability duties for this system: integration test jobs, infrastructure
  checks, bridge code edits — assigned to the dedicated lane before
  performance comparisons.
- Compare agents only on reasonably similar tasks: complex-architecture work
  and small fixes are separate scoring bins; a complex feature taking two
  hours can be worth more verified progress than five thirty-minute fixes.
- A score that collapses to zero is a wrong weighting choice — rebalance the
  model, then re-baseline with the metrics that remain.

## 3. Adaptive workload balancing

- The scheduler learns which agent performs best on which task classes
  (architecture/integration vs incremental implementation) from these
  weighted metrics, continuously.
- Independent frontend/backend work runs in parallel; dependent work waits
  for its prerequisite's verified result.
- An overloaded agent's unstarted tasks are automatically reassigned.
- Avoid pointless task switches: switching agents mid-task wastes prompt
  context, so an in-flight task stays with its agent unless recovery selects
  a change (§4).

## 4. Smart failure recovery

On repeated failures of the same task or file:

1. Classify the failure (test fail, compile fail, review finding, infra).
2. Read the relevant logs and test results; summarize with citations.
3. Change the debugging strategy based on the diagnosis.
4. Request a focused diagnostic investigation as its own queued task.
5. Reassign the work when justified and safe (respecting COLLAB.md file
   claims before any reassignment).
6. Escalate only genuine external blockers (credentials, store approvals,
   service outages).

Never retry the same failed prompt unchanged: every re-attempt carries a
new diagnosis or a new approach.

## 5. The continuous development loop

OBSERVE → UNDERSTAND → PRIORITIZE → ASSIGN → EXECUTE → VERIFY → RECOVER →
REPEAT — event-driven dispatch plus 20-minute reconciliation, continuing
through the IZUKI roadmap until all planned work is completed and verified
or a genuine external blocker stops progress.

## 6. Performance dashboard

- Agent status and current task, tasks completed and pending, verified
  productivity over time, peak efficiency windows, queue delays, failure and
  retry rates, current release readiness, next planned assignments — from
  the metrics in §2, not raw speed counts.

## 7. Safety and reliability

- One release coordinator at a time (external account), throttled
  (releases/deployments at most once a day naturally; hotfixes are the
  exception, never routine).
- Never yield partially failed or unreviewed files for reposting blindly;
  every retry carries the diagnosis current as of the attempt.
- Enforce mandatory wait windows between releases; no process calls release
  flows outside the coordinator.

## 8. Acceptance test (end-to-end, all implemented features)

With both-agent features enabled:
1. Both agents receive distinct assignments.
2. Freebuff stays busy without being flooded with prompts.
3. Claude Code receives an appropriate follow-up at a safe checkpoint.
4. Completed work is independently verified (checks pass).
5. The scheduler selects the next assignments by dependency and weighted
   performance evidence.
6. A simulated disconnect is recovered correctly.

## Freebuff-lane note (this lane's deliverables)

- This requirements file and the queue task are my deliverables; the bridge
  implementation belongs to its claimed lane (RULEs in AGENTS-BRIDGE.md).
- New capabilities Freebuff can consume in its role: tagged metrics rows the
  dashboard can read, disconnection detection for my lane's last-activity
  signal, and reassignment of my unstarted queued tasks after two
  reconciliation passes without pickup. My side contract stays: pick up the
  top assigned issue, push verified work, comment the SHA, label for review.

## Addendum — per-agent scheduling differences (owner, 2026-11-03, same night)

The owner has observed the asymmetry itself: Freebuff usually finishes its
current task before it processes newly submitted instructions, while Claude
Code can absorb new instructions mid-run. The bridge must accommodate that,
not fight it. Where a rule here repeats the main section, the main section
stands; these are the deltas and clarifications:

1. **Task-state taxonomy, per agent:** idle, busy, blocked, failed,
   disconnected, and ready-for-instructions, derived from real signals (queue
   labels, last push, heartbeat age) — never an assumption.
2. **Flood prevention holds absolutely:** a busy agent is never sent a
   repeated prompt; everything lands in the queue.
3. **The queue is persistent and prioritized, outside every chat context**
   (GitHub Issues already provides both).
4. **Freebuff:** follow-ups queue until its current task finishes, then the
   next assigned task dispatches. It has no safe reprioritization interface —
   its contract is pickup-at-checkout, and urgency therefore has to live in
   the queue's priority labels, not in interruptions.
5. **Claude Code:** checkpoint-based updates and reprioritization where its
   interface permits; new priorities apply at a declared safe checkpoint,
   never mid-edit.
6. **Event-driven completion beats the 20-minute poll:** completion events
   dispatch the next assignment immediately; the cron remains reconciliation
   for missed events and stale states.
7. **Metrics stay honest:** task completion time, queue wait time, failed
   attempts and verified output quality (checks, review rounds) — the inputs
   §2 already weighs, now including failed-attempt counts per task.
8. **Assignment is dynamic** — capability, current availability and history
   together; nothing assumes one agent is inherently faster.
9. **No waste:** no needless context resets, no repeated instructions, no
   duplicated work, no conflicting file edits (COLLAB.md claims remain the
   source of truth for who owns a file).
10. **Urgency lane:** security and release-blocking issues jump the queue;
    but a running unsafe or non-recoverable operation is never interrupted
    mid-flight — urgent work waits for a safe point.
11. **Timeouts, heartbeats, cancellation and recovery exist only where the
    agent's interface actually supports them** — for Freebuff that is
    queue-side staleness detection and reassignment, never a mid-task kill.
12. **On availability, the next verified, dependency-ready assignment goes
    out automatically** — an agent that has just pushed verified work gets
    its next task without waiting for the next cron tick.

**Demonstration obligations** (bridge lane, when the features land):
- A busy Freebuff session survives without flooding: while it is mid-task,
  the queue accumulates; on finishing, the next assigned task is picked up
  from the queue — *this behavior was already demonstrated live on the first
  night*: task #21 was assigned at 14:05Z while this lane was busy finishing
  the staging and scheduler commits; nothing was pushed into its chat, and
  the task was picked up, done, verified (599 passed, exit=0; cargo check
  exit=0) and pushed as 556ba4f at its next queue check.
- Claude Code receives a new task at a declared checkpoint (mid-run
  reprioritization) — to be demonstrated by the bridge lane with a real
  checkpoint handoff, not asserted.
