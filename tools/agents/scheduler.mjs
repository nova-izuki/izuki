// The bridge's decisions, as pure functions (no GitHub, no processes), so
// they can be tested on their own (tools/agents/scheduler-check.mjs).
//
// A task is a GitHub issue labelled `agent-task`. Its state lives in labels
// (status:*, agent:*, priority:*, kind:*) and in a hidden JSON block in its
// body (`<!-- bridge {...} -->`): attempts, failures, timestamps, the agent
// that holds it, its last heartbeat.

export const AGENTS = ['claude', 'freebuff'];
/** Agents whose runs send heartbeats (the dispatcher's). Freebuff's don't: a
 *  missing heartbeat says nothing about whether it's still working. */
export const HEARTBEATS = ['claude'];
export const PRIORITY = { urgent: 0, high: 1, normal: 2, low: 3 };
export const STALE_MS = 20 * 60 * 1000; // no heartbeat for this long: the run is gone
export const MAX_ATTEMPTS = 3; // then the task is blocked and escalated
/** Hand a flexible task to the other agent when its own is out this much longer. */
export const REDISTRIBUTE_MS = 60 * 60 * 1000;

/**
 * Whether a history entry was a real attempt at the task. A pause for an
 * urgent task, a run cut short because the agent couldn't work at all (a
 * usage limit, signed out, the service down), or a run that ended with the
 * dispatcher running it (restarted, or its window closed) says nothing about
 * the task or the agent's skill: none counts as an attempt or a failure.
 */
export const counts = (h) => !['paused', 'unavailable', 'interrupted'].includes(h.result);

/**
 * Claude tasks marked in progress whose run is gone: no live dispatcher is
 * running them and they haven't reported for two heartbeats. `runs` are the
 * Claude processes running bridge tasks now, each `owned` when the
 * dispatcher that started it is still alive; one left behind by a dead
 * dispatcher is listed to stop. A run a live dispatcher owns is never touched.
 */
export function orphans(tasks, runs, now, beatMs) {
  return tasks
    .filter((t) => t.open && t.status === 'in-progress' && t.state.agent === 'claude')
    .filter((t) => !runs.some((r) => r.task === t.number && r.owned))
    .filter((t) => now - (Date.parse(t.state.heartbeat || '') || 0) > 2 * beatMs)
    .map((t) => ({ task: t.number, stop: runs.filter((r) => r.task === t.number).map((r) => r.pid) }));
}

/**
 * Whether a run ended because the agent couldn't work rather than because of
 * the task: `{ reason, until, detail }` or null. `event` is Claude Code's
 * stream-json result event; `resetsAt` (ms) is the reset time from a
 * rejected rate-limit event in the same run, when there was one.
 * Seen for real (task #18): is_error, api_error_status 429, "You've hit your
 * session limit · resets 12:20pm (America/Chicago)".
 */
export function unavailable(event, now, resetsAt = 0) {
  if (!event?.is_error) return null;
  const status = Number(event.api_error_status) || 0;
  const detail = String(event.result || '').slice(0, 200);
  // A status code decides when there is one; the words count only without
  // it. A 400 whose message mentions a rate limit is the run's own error,
  // and an outage never counts as an attempt, so it would retry forever.
  const says = (re) => !status && re.test(detail);
  if (status === 429 || says(/\b(session|usage|weekly|rate) limit\b|limit reached|out of (credits|extra usage)/i)) {
    return { reason: 'usage-limit', until: resetsAt > now ? resetsAt : now + 60 * 60 * 1000, detail };
  }
  if (status === 401 || status === 403 || says(/not logged in|please (run )?\/login|log ?in again|invalid api key|oauth token/i)) {
    return { reason: 'signed-out', until: now + 30 * 60 * 1000, detail };
  }
  // Claude Code's own words only: "Unable to connect to API (ConnectionRefused)"
  // is the PC offline (task #18, 2026-11-05). A bare ECONNRESET in a final
  // message could be a test's output, which is the run's own failure.
  if (status >= 500 || says(/overloaded|service unavailable|API Error: 5\d\d|Unable to connect to API/i)) {
    return { reason: 'service', until: now + 10 * 60 * 1000, detail };
  }
  return null;
}

const STATE = /<!-- bridge (\{[\s\S]*?\}) -->/;

/** The hidden state block of a task body ({} when there is none or it's broken). */
export function readState(body = '') {
  const m = STATE.exec(body);
  if (!m) return {};
  try { return JSON.parse(m[1]); } catch { return {}; }
}

/**
 * The body with its state block replaced (or added at the end). Refuses a
 * body with no task text: saving state onto one would erase the task's
 * description (it happened once, through a task record without its body).
 */
export function writeState(body, state) {
  if (typeof body !== 'string' || !body.replace(STATE, '').trim()) throw new Error('refusing to save task state over an empty description');
  const block = `<!-- bridge ${JSON.stringify(state)} -->`;
  return STATE.test(body) ? body.replace(STATE, block) : `${body.trimEnd()}\n\n${block}\n`;
}

const label = (task, prefix) => (task.labels.find((l) => l.startsWith(prefix)) || '').slice(prefix.length);

/** What a task issue says about itself: status, agent, priority, kind, files, dependencies. */
export function describe(issue) {
  const labels = issue.labels.map((l) => (typeof l === 'string' ? l : l.name));
  const t = { ...issue, labels };
  const body = issue.body || '';
  const files = (/^Files:\s*(.+)$/im.exec(body)?.[1] || '').split(',').map((f) => f.trim()).filter(Boolean);
  const deps = [...((/^Depends on:\s*(.+)$/im.exec(body)?.[1] || '').matchAll(/#(\d+)/g))].map((m) => Number(m[1]));
  return {
    number: issue.number,
    title: issue.title,
    body,
    author: issue.author?.login || issue.author || '',
    open: (issue.state || 'OPEN').toUpperCase() === 'OPEN',
    status: label(t, 'status:') || 'queued',
    agent: label(t, 'agent:') || 'any',
    priority: label(t, 'priority:') || 'normal',
    kind: label(t, 'kind:') || 'feature',
    files,
    deps,
    state: readState(body),
    createdAt: issue.createdAt,
    closedAt: issue.closedAt,
  };
}

/** Do two lists of file paths or folders touch the same files? (A folder covers what's inside it.) */
export function overlaps(a, b) {
  const norm = (p) => p.replace(/\\/g, '/').replace(/^\.\//, '').replace(/\/+$/, '').toLowerCase();
  return a.some((x) => b.some((y) => {
    const [p, q] = [norm(x), norm(y)];
    return p === q || p.startsWith(q + '/') || q.startsWith(p + '/');
  }));
}

/**
 * Each agent's state, from the tasks it holds and what's known about it:
 * idle, busy, disconnected (its run stopped reporting), or unreachable
 * (no way to hand it work right now).
 */
export function agentStates(tasks, now, facts = {}) {
  const out = {};
  for (const agent of AGENTS) {
    const held = tasks.filter((t) => t.open && t.state.agent === agent && ['assigned', 'in-progress'].includes(t.status));
    const running = held.find((t) => t.status === 'in-progress');
    const beat = running?.state.heartbeat ? Date.parse(running.state.heartbeat) : 0;
    // Out until a known time (a usage limit): the agent's own record in the
    // history of the task it was on. It stays there when that task is handed
    // to the other agent, who doesn't inherit it.
    const outUntil = Math.max(0, ...tasks.flatMap((t) => (t.state.history || []).filter((h) => h.agent === agent && h.result === 'unavailable').map((h) => Date.parse(h.until || '') || 0)));
    let state = 'idle';
    if (running && HEARTBEATS.includes(agent) && now - beat > STALE_MS) state = 'disconnected';
    else if (running) state = 'busy';
    else if (outUntil > now) state = 'unavailable';
    else if (facts[agent]?.activeSince && now - facts[agent].activeSince < 30 * 60 * 1000) state = 'busy'; // working on its own
    else if (held.length) state = 'assigned';
    if (facts[agent]?.reachable === false && state === 'idle') state = 'unreachable';
    out[agent] = { state, until: state === 'unavailable' ? new Date(outUntil).toISOString() : null, held: held.map((t) => t.number), running: running?.number ?? null, files: held.flatMap((t) => t.files) };
  }
  return out;
}

/**
 * How well each agent has done on each kind of task: verified completions,
 * first-try passes and failures over the finished tasks. A new agent or kind
 * starts at an even prior, so no one is assumed better.
 */
export function performance(tasks) {
  const stats = {};
  for (const t of tasks) {
    const agent = t.state.agent;
    if (!agent || !t.state.history?.length) continue;
    const s = (stats[agent] ??= { done: 0, failed: 0, firstTry: 0, minutes: [], waits: [], byKind: {} });
    const k = (s.byKind[t.kind] ??= { done: 0, failed: 0 });
    // Only real failures: a pause or an unavailable agent isn't one (`counts`).
    const failures = t.state.history.filter((h) => h.result === 'failed').length;
    s.failed += failures;
    k.failed += failures;
    if (t.status === 'done') {
      s.done++;
      k.done++;
      if (failures === 0) s.firstTry++;
      const started = Date.parse(t.state.startedAt || ''), ended = Date.parse(t.state.doneAt || '');
      if (started && ended > started) s.minutes.push((ended - started) / 60000);
      const created = Date.parse(t.createdAt || ''), assigned = Date.parse(t.state.assignedAt || '');
      if (created && assigned >= created) s.waits.push((assigned - created) / 60000);
    }
  }
  return stats;
}

/** Expected success on this kind of task (Laplace-smoothed, so evidence moves it gradually). */
export function score(stats, agent, kind) {
  const k = stats[agent]?.byKind?.[kind] || { done: 0, failed: 0 };
  return (k.done + 1) / (k.done + k.failed + 2);
}

/** Whether every task this one depends on is done. */
export function ready(task, byNumber) {
  return task.deps.every((n) => byNumber.get(n)?.status === 'done');
}

/**
 * The next assignments: queued, trusted, dependency-ready tasks, most
 * urgent first, each to an idle agent that can take it, never onto files
 * another agent holds, and never a second task for a busy agent.
 */
export function plan(tasks, states, stats, trusted) {
  const byNumber = new Map(tasks.map((t) => [t.number, t]));
  const free = new Set(AGENTS.filter((a) => states[a].state === 'idle'));
  const held = Object.fromEntries(AGENTS.map((a) => [a, [...states[a].files]]));
  const out = [];
  const queue = tasks
    .filter((t) => t.open && t.status === 'queued' && trusted(t.author) && ready(t, byNumber))
    .sort((a, b) => PRIORITY[a.priority] - PRIORITY[b.priority] || a.number - b.number);
  for (const task of queue) {
    const candidates = (task.agent === 'any' ? AGENTS : [task.agent]).filter((a) => free.has(a))
      .filter((a) => !AGENTS.some((other) => other !== a && overlaps(task.files, held[other])));
    if (!candidates.length) continue;
    candidates.sort((a, b) => score(stats, b, task.kind) - score(stats, a, task.kind));
    const agent = candidates[0];
    out.push({ task: task.number, agent, why: task.agent === 'any' ? `best measured on ${task.kind} (${score(stats, agent, task.kind).toFixed(2)}) among free agents` : `assigned to ${agent}` });
    free.delete(agent);
    held[agent].push(...task.files);
  }
  return out;
}

// What a CI log says went wrong. A code failure the log shows wins over
// network noise in the same log (a test of retries, say): infrastructure
// is the verdict only when no compile or test failure appears.
const FAILURES = [
  ['compile-failed', /error\[E\d{4}\]|could not compile `|error TS\d{4}:|SyntaxError:|Module not found|Cannot find module/i],
  ['tests-failed', /test result: FAILED|^FAIL\b|AssertionError|^not ok \d+|^ℹ fail [1-9]|\b[1-9]\d* (tests? )?(failed|failing)\b/i],
  // Only a sign of a transient fault: a download that came back garbled, a
  // 5xx or 429, a timeout, a dropped connection, a temporary DNS failure, the
  // runner itself. "Could not resolve", "Could not GET" or ENOTFOUND alone are
  // also what a mistyped version, URL or host prints: the change's fault.
  ['infra', /Could not parse POM |Received status code (5\d\d|429)|ECONNRESET|ETIMEDOUT|EAI_AGAIN|socket hang up|Read timed out|Connect(ion)? timed out|Connection reset|Remote host terminated the handshake|\b50[0234] (Internal Server Error|Bad Gateway|Service Unavailable|Gateway Time-?out)|\b429 Too Many Requests|API rate limit exceeded|runner has received a shutdown signal|lost communication with the server|No space left on device/i],
];

/**
 * Why a CI job failed, from its log: 'infra' (a download service or the
 * runner failed, not the agent's change), 'compile-failed', 'tests-failed',
 * or 'ci-failed' when the log doesn't say. With up to three lines that show
 * it, so the next attempt starts from the evidence, never the same prompt.
 */
export function classifyFailure(log = '') {
  const lines = String(log).replace(/\x1b\[[0-9;]*m/g, '').split(/\r?\n/)
    .map((l) => l.replace(/^\d{4}-\d\d-\d\dT[\d:.]+Z ?/, '').trim()).filter(Boolean);
  for (const [category, re] of FAILURES) {
    const hits = lines.filter((l) => re.test(l));
    if (hits.length) return { category, evidence: hits.slice(0, 3).map((l) => l.slice(0, 200)) };
  }
  return { category: 'ci-failed', evidence: lines.filter((l) => l.includes('##[error]')).slice(0, 2).map((l) => l.slice(0, 200)) };
}

/**
 * Tasks to hand over because their agent is out (a usage limit) for over
 * REDISTRIBUTE_MS more: only ones that could go to either agent (flexible),
 * not started, to the other agent only if it's idle and holds none of their
 * files. Nothing moves for a short outage: the agent resumes them itself.
 */
export function redistribute(tasks, states, now) {
  const out = [];
  for (const agent of AGENTS) {
    const s = states[agent];
    if (s.state !== 'unavailable' || Date.parse(s.until) - now <= REDISTRIBUTE_MS) continue;
    const other = AGENTS.find((a) => a !== agent);
    if (states[other].state !== 'idle') continue;
    const task = tasks
      .filter((t) => t.open && t.status === 'assigned' && t.state.agent === agent && t.state.flexible && !overlaps(t.files, states[other].files))
      .sort((a, b) => PRIORITY[a.priority] - PRIORITY[b.priority] || a.number - b.number)[0];
    if (task) out.push({ task: task.number, from: agent, to: other, why: `${agent} is unavailable until ${s.until}` });
  }
  return out;
}

/**
 * What to do with a task whose run failed: try again with a different
 * approach, hand it to the other agent, or stop and escalate. Never the same
 * prompt again.
 */
export function recover(task, category) {
  const history = task.state.history || [];
  const attempts = history.filter(counts).length;
  const mine = history.filter((h) => h.agent === task.state.agent && h.result === 'failed').length;
  if (attempts >= MAX_ATTEMPTS) return { action: 'block', note: `Blocked after ${attempts} attempts (last: ${category}). Needs a person or a new plan.` };
  const strategy = {
    'tests-failed': 'Start by reading the failing tests and their output; find the root cause before changing code.',
    'ci-failed': 'Read the CI log of the failed run first; reproduce the failure locally before fixing.',
    'compile-failed': 'It failed to compile: start from the first compiler error quoted above, fix it, and build locally before pushing.',
    review: "CodeRabbit's review failed the check: read its findings on the pull request first and fix what's confirmed.",
    timeout: 'Split the task: do the smallest verifiable part first, commit it, then continue.',
    disconnected: 'The previous run stopped reporting. Check the branch for partial work before starting again.',
    conflict: 'Another change touched the same files. Rebase on the latest branch and re-check the overlap first.',
  }[category] || 'Investigate why the previous attempt failed before trying again.';
  const other = task.state.agent === 'claude' ? 'freebuff' : 'claude';
  if (mine >= 2 && (task.agent === 'any' || task.state.flexible)) return { action: 'reassign', to: other, note: `Reassigned to ${other} after ${mine} failed attempts by ${task.state.agent}. ${strategy}` };
  return { action: 'retry', note: `Attempt ${attempts + 1}: ${strategy}` };
}
