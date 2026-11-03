// The bridge scheduler's decisions, checked without GitHub or agents.
import assert from 'node:assert/strict';
import { readState, writeState, describe, overlaps, agentStates, performance, score, plan, recover, STALE_MS } from './scheduler.mjs';

const issue = (number, labels, body = '', extra = {}) => ({ number, title: `Task ${number}`, labels, body, author: { login: 'owner' }, state: 'OPEN', createdAt: '2026-11-03T08:00:00Z', ...extra });
const trusted = (login) => login === 'owner';
const now = Date.parse('2026-11-03T10:00:00Z');

// The state block round-trips, and a broken one reads as empty.
const body = writeState('Do the thing.\nFiles: src/a.ts', { agent: 'claude', attempts: 1 });
assert.deepEqual(readState(body), { agent: 'claude', attempts: 1 });
assert.deepEqual(readState(writeState(body, { agent: 'freebuff' })), { agent: 'freebuff' }, 'replaced, not added twice');
assert.equal((writeState(body, {}).match(/<!-- bridge/g) || []).length, 1);
assert.deepEqual(readState('<!-- bridge {not json} -->'), {});
// Saving state never erases a task's description (a record without its
// body once wiped one): no text, no write.
assert.throws(() => writeState(undefined, {}), /empty description/);
assert.throws(() => writeState('', {}), /empty description/);
assert.throws(() => writeState('\n<!-- bridge {"a":1} -->\n', {}), /empty description/);
assert.equal(describe({ number: 1, title: 't', labels: [], body: 'text\nFiles: a' }).body, 'text\nFiles: a', 'the record keeps the text');

// A task describes itself from labels and body lines.
const t = describe(issue(7, ['agent-task', 'status:queued', 'agent:any', 'priority:urgent', 'kind:security'], 'Fix it.\nFiles: src-tauri/src/ext.rs, extension/\nDepends on: #3, #5'));
assert.deepEqual([t.status, t.agent, t.priority, t.kind], ['queued', 'any', 'urgent', 'security']);
assert.deepEqual(t.files, ['src-tauri/src/ext.rs', 'extension/']);
assert.deepEqual(t.deps, [3, 5]);

// Files overlap by path or folder, never by a shared prefix of a name.
assert(overlaps(['extension/'], ['extension/background.js']));
assert(overlaps(['src\\lib\\ipc.ts'], ['./src/lib/ipc.ts']));
assert(!overlaps(['src/lib/ipc.ts'], ['src/lib/ipc.tsx']));
assert(!overlaps([], ['anything']));

// Agent states: a running task with a fresh heartbeat is busy; a stale one is disconnected.
const fresh = new Date(now - 60_000).toISOString(), stale = new Date(now - STALE_MS - 1).toISOString();
let tasks = [
  describe(issue(1, ['agent-task', 'status:in-progress', 'agent:claude'], writeState('x\nFiles: src/a.ts', { agent: 'claude', heartbeat: fresh }))),
  describe(issue(2, ['agent-task', 'status:in-progress', 'agent:freebuff'], writeState('y', { agent: 'freebuff' }))),
];
let states = agentStates(tasks, now);
assert.equal(states.claude.state, 'busy');
assert.equal(states.freebuff.state, 'busy', "Freebuff sends no heartbeats: its work in progress is never taken for a lost run");
assert.deepEqual(states.claude.files, ['src/a.ts']);
// Claude's dispatched run that stopped reporting is.
assert.equal(agentStates([describe(issue(3, ['agent-task', 'status:in-progress', 'agent:claude'], writeState('z', { agent: 'claude', heartbeat: stale })))], now).claude.state, 'disconnected');
// An agent known to be working on its own (Freebuff, seen in recent commits) is busy, not idle.
states = agentStates([], now, { freebuff: { activeSince: now - 5 * 60_000 } });
assert.equal(states.freebuff.state, 'busy');
assert.equal(states.claude.state, 'idle');

// Performance: evidence moves the score; no evidence is an even 0.5.
const done = (n, agent, kind, history) => describe(issue(n, ['agent-task', 'status:done', `agent:${agent}`, `kind:${kind}`], writeState('z', { agent, history, startedAt: '2026-11-03T08:10:00Z', doneAt: '2026-11-03T08:40:00Z', assignedAt: '2026-11-03T08:05:00Z' }), { state: 'CLOSED' }));
const history = [
  done(10, 'claude', 'perf', [{ agent: 'claude', result: 'done' }]),
  done(11, 'claude', 'perf', [{ agent: 'claude', result: 'done' }]),
  done(12, 'freebuff', 'perf', [{ agent: 'freebuff', result: 'failed' }, { agent: 'freebuff', result: 'done' }]),
  done(13, 'freebuff', 'ui', [{ agent: 'freebuff', result: 'done' }]),
];
const stats = performance(history);
assert.equal(stats.claude.done, 2);
assert.equal(stats.claude.firstTry, 2);
assert.equal(stats.freebuff.failed, 1);
assert.deepEqual(stats.claude.minutes, [30, 30]);
assert.deepEqual(stats.claude.waits, [5, 5]);
assert.equal(score({}, 'claude', 'anything'), 0.5, 'no evidence: no assumption');
assert(score(stats, 'claude', 'perf') > score(stats, 'freebuff', 'perf'));
assert(score(stats, 'freebuff', 'ui') > score(stats, 'claude', 'ui'));

// Planning: urgent first; dependencies wait; a busy agent gets nothing more;
// another agent's files are never handed out; untrusted tasks are ignored;
// "any" goes to the agent with the better record on that kind.
tasks = [
  describe(issue(20, ['agent-task', 'status:queued', 'agent:any', 'kind:perf'], 'a\nFiles: src-tauri/src/uia.rs')),
  describe(issue(21, ['agent-task', 'status:queued', 'agent:any', 'priority:urgent', 'kind:ui'], 'b\nFiles: src/components/X.tsx')),
  describe(issue(22, ['agent-task', 'status:queued', 'agent:any'], 'c\nDepends on: #99')),
  describe(issue(23, ['agent-task', 'status:queued', 'agent:any'], 'd', { author: { login: 'stranger' } })),
  describe(issue(99, ['agent-task', 'status:review', 'agent:claude'], 'dep not done yet')),
];
const idle = agentStates([], now);
let picks = plan(tasks, idle, stats, trusted);
assert.deepEqual(picks.map((p) => [p.task, p.agent]), [[21, 'freebuff'], [20, 'claude']], 'urgent ui to the better ui agent, then perf to the remaining one');
assert(!picks.some((p) => p.task === 22), 'waits for its dependency');
assert(!picks.some((p) => p.task === 23), 'untrusted tasks are never assigned');
// Claude busy on uia.rs: nothing more for Claude, and nobody else gets uia.rs.
states = agentStates([describe(issue(30, ['agent-task', 'status:in-progress', 'agent:claude'], writeState('w\nFiles: src-tauri/src/uia.rs', { agent: 'claude', heartbeat: fresh })))], now);
picks = plan(tasks, states, stats, trusted);
assert(!picks.some((p) => p.agent === 'claude'), 'a busy agent is never given a second task');
assert(!picks.some((p) => p.task === 20), "Claude's files are never handed to Freebuff");
assert.deepEqual(picks.map((p) => p.task), [21]);
// The dependency done: it becomes ready.
tasks[4] = describe(issue(99, ['agent-task', 'status:done', 'agent:claude'], 'done now', { state: 'CLOSED' }));
assert(plan([tasks[2], tasks[4]], idle, {}, trusted).some((p) => p.task === 22));

// Recovery: a different strategy each time, then another agent, then a person.
const failing = (agent, results, anyAgent = true) => describe(issue(40, ['agent-task', 'status:failed', `agent:${anyAgent ? 'any' : agent}`], writeState('f', { agent, history: results.map((r) => ({ agent, result: r })) })));
let r = recover(failing('claude', ['failed']), 'tests-failed');
assert.equal(r.action, 'retry');
assert.match(r.note, /failing tests/);
r = recover(failing('claude', ['failed', 'failed']), 'timeout');
assert.equal(r.action, 'reassign');
assert.equal(r.to, 'freebuff');
assert.equal(recover(failing('claude', ['failed', 'failed'], false), 'timeout').action, 'retry', 'a task meant for one agent stays with it');
// An "any agent" task keeps that after assignment relabels it (state.flexible).
const flexible = describe(issue(41, ['agent-task', 'status:failed', 'agent:claude'], writeState('f', { agent: 'claude', flexible: true, history: [{ agent: 'claude', result: 'failed' }, { agent: 'claude', result: 'failed' }] })));
assert.equal(recover(flexible, 'timeout').action, 'reassign');
assert.equal(recover(failing('claude', ['failed', 'failed', 'failed']), 'ci-failed').action, 'block');

console.log('agent scheduler: state blocks, task parsing, file overlap, agent states (busy, disconnected, working on its own), evidence-based scores, planning (priority, dependencies, no second task, no shared files, untrusted ignored) and recovery (new strategy, reassign, block) pass.');
