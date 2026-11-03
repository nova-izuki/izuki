// The bridge's decisions, as pure functions (no GitHub, no processes), so
// they can be tested on their own (tools/agents/scheduler-check.mjs).
//
// A task is a GitHub issue labelled `agent-task`. Its state lives in labels
// (status:*, agent:*, priority:*, kind:*) and in a hidden JSON block in its
// body (`<!-- bridge {...} -->`): attempts, failures, timestamps, the agent
// that holds it, its last heartbeat.

export const AGENTS = ['claude', 'freebuff'];
export const PRIORITY = { urgent: 0, high: 1, normal: 2, low: 3 };
export const STALE_MS = 20 * 60 * 1000; // no heartbeat for this long: the run is gone
export const MAX_ATTEMPTS = 3; // then the task is blocked and escalated

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
    let state = 'idle';
    if (running && now - beat > STALE_MS) state = 'disconnected';
    else if (running) state = 'busy';
    else if (facts[agent]?.activeSince && now - facts[agent].activeSince < 30 * 60 * 1000) state = 'busy'; // working on its own
    else if (held.length) state = 'assigned';
    if (facts[agent]?.reachable === false && state === 'idle') state = 'unreachable';
    out[agent] = { state, held: held.map((t) => t.number), running: running?.number ?? null, files: held.flatMap((t) => t.files) };
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

/**
 * What to do with a task whose run failed: try again with a different
 * approach, hand it to the other agent, or stop and escalate. Never the same
 * prompt again.
 */
export function recover(task, category) {
  const history = task.state.history || [];
  const attempts = history.length;
  const mine = history.filter((h) => h.agent === task.state.agent && h.result === 'failed').length;
  if (attempts >= MAX_ATTEMPTS) return { action: 'block', note: `Blocked after ${attempts} attempts (last: ${category}). Needs a person or a new plan.` };
  const strategy = {
    'tests-failed': 'Start by reading the failing tests and their output; find the root cause before changing code.',
    'ci-failed': 'Read the CI log of the failed run first; reproduce the failure locally before fixing.',
    timeout: 'Split the task: do the smallest verifiable part first, commit it, then continue.',
    disconnected: 'The previous run stopped reporting. Check the branch for partial work before starting again.',
    conflict: 'Another change touched the same files. Rebase on the latest branch and re-check the overlap first.',
  }[category] || 'Investigate why the previous attempt failed before trying again.';
  const other = task.state.agent === 'claude' ? 'freebuff' : 'claude';
  if (mine >= 2 && task.agent === 'any') return { action: 'reassign', to: other, note: `Reassigned to ${other} after ${mine} failed attempts by ${task.state.agent}. ${strategy}` };
  return { action: 'retry', note: `Attempt ${attempts + 1}: ${strategy}` };
}
