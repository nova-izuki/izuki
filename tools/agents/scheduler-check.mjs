// The bridge scheduler's decisions, checked without GitHub or agents.
import assert from 'node:assert/strict';
import { readState, writeState, describe, overlaps, agentStates, performance, score, plan, recover, unavailable, counts, redistribute, classifyFailure, STALE_MS } from './scheduler.mjs';

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

// An agent that can't work (a usage limit) isn't a failed task. The result
// event is the real one from task #18's run, which was wrongly called stalled.
const limitHit = { type: 'result', subtype: 'success', is_error: true, api_error_status: 429, num_turns: 8, result: "You've hit your session limit · resets 12:20pm (America/Chicago)" };
const resetsAt = 1793730000 * 1000; // from the run's rejected rate_limit_event
let out = unavailable(limitHit, resetsAt - 3600_000, resetsAt);
assert.equal(out.reason, 'usage-limit');
assert.equal(out.until, resetsAt, 'waits for the reset the service gave');
assert.equal(unavailable({ ...limitHit, api_error_status: undefined }, now).reason, 'usage-limit', 'the words alone are enough');
assert.equal(unavailable(limitHit, now, now - 1).until, now + 3600_000, 'a reset already past (or none): an hour');
assert.equal(unavailable({ is_error: true, api_error_status: 401, result: 'Invalid API key · Please run /login' }, now).reason, 'signed-out');
assert.equal(unavailable({ is_error: true, api_error_status: 529, result: 'API Error: 529 Overloaded' }, now).reason, 'service');
assert.equal(unavailable({ is_error: false, result: 'RESULT: failed tests-failed — the rate limit test fails' }, now), null, 'a normal answer that mentions a limit is not an outage');
assert.equal(unavailable({ is_error: true, subtype: 'error_max_turns', result: '' }, now), null, "the run's own error stays a run failure");
assert.equal(unavailable({ is_error: true, api_error_status: 400, result: 'invalid request: the rate limit header is malformed' }, now), null, 'a status code decides over the words: a 400 is no outage, so it counts toward the attempt limit');
assert.equal(unavailable({ is_error: true, api_error_status: 404, result: 'Service unavailable for this model' }, now), null);
// Neither a pause nor an outage counts as an attempt or a failure.
assert(!counts({ result: 'unavailable' }) && !counts({ result: 'paused' }) && counts({ result: 'failed' }));
const outages = [{ agent: 'claude', result: 'unavailable', reason: 'usage-limit' }, { agent: 'claude', result: 'unavailable', reason: 'usage-limit' }, { agent: 'claude', result: 'failed' }];
assert.equal(recover(failing('claude', outages.map((h) => h.result)), 'tests-failed').action, 'retry', 'two outages and one failure: one attempt, not three');
const afterOutage = performance([done(50, 'claude', 'feature', [{ agent: 'claude', result: 'unavailable', reason: 'usage-limit' }, { agent: 'claude', result: 'done' }])]);
assert.equal(afterOutage.claude.failed, 0, 'an outage never lowers the measured score');
assert.equal(afterOutage.claude.firstTry, 1);
// Its state: unavailable until the reset, then waiting on its task again.
const outRecord = (ms) => [{ agent: 'claude', result: 'unavailable', reason: 'usage-limit', until: new Date(now + ms).toISOString() }];
const outTask = (n, extra = {}) => describe(issue(n, ['agent-task', 'status:assigned', 'agent:claude'], writeState('o\nFiles: src-tauri/src/automation.rs', { agent: 'claude', history: outRecord(2 * 3600_000), ...extra })));
states = agentStates([outTask(60)], now);
assert.equal(states.claude.state, 'unavailable');
assert.equal(states.claude.until, new Date(now + 2 * 3600_000).toISOString());
assert.equal(agentStates([outTask(60)], now + 3 * 3600_000).claude.state, 'assigned', 'after the reset it takes its task again');
assert(!plan([describe(issue(61, ['agent-task', 'status:queued', 'agent:claude'], 'q'))], states, {}, trusted).length, 'nothing new for an unavailable agent');
// A long outage hands a flexible, unstarted task to the idle other agent;
// a short one, a task meant for that agent only, or a busy other agent: nothing moves.
assert.deepEqual(redistribute([outTask(62, { flexible: true })], agentStates([outTask(62, { flexible: true })], now), now).map((p) => [p.task, p.to]), [[62, 'freebuff']]);
assert.equal(redistribute([outTask(63)], agentStates([outTask(63)], now), now).length, 0, 'not flexible: it waits for its agent');
const soon = outTask(64, { flexible: true, history: outRecord(30 * 60_000) });
assert.equal(redistribute([soon], agentStates([soon], now), now).length, 0, 'back within the hour: it waits');
const busyOther = [outTask(65, { flexible: true }), describe(issue(66, ['agent-task', 'status:in-progress', 'agent:freebuff'], writeState('b', { agent: 'freebuff' })))];
assert.equal(redistribute(busyOther, agentStates(busyOther, now), now).length, 0, 'the other agent is busy');
// Handed over, the outage stays Claude's: it still gets nothing new, and
// Freebuff, now holding the task, doesn't inherit it.
const handed = describe(issue(67, ['agent-task', 'status:assigned', 'agent:freebuff'], writeState('h', { agent: 'freebuff', flexible: true, history: outRecord(2 * 3600_000) })));
states = agentStates([handed], now);
assert.equal(states.claude.state, 'unavailable', 'handing its task over does not make it available');
assert.equal(states.freebuff.state, 'assigned');
assert(!plan([handed, describe(issue(68, ['agent-task', 'status:queued', 'agent:claude'], 'q'))], states, {}, trusted).length, 'still nothing new for Claude until the reset');

// Failed checks are classified from their logs, with the lines quoted. The
// first two are excerpts of real logs: Freebuff's 556ba4f (Android, a Maven
// download failed) and 53d705d (web, an asset check failed).
const ansi = '\x1b[36;1m';
const androidInfra = `2026-11-03T16:35:49.4911186Z FAILURE: Build failed with an exception.
2026-11-03T16:35:49.5035068Z * What went wrong:
2026-11-03T16:35:49.5141801Z > Could not resolve all artifacts for configuration 'classpath'.
2026-11-03T16:35:49.5191690Z    > Could not find org.jetbrains.kotlin:kotlin-stdlib:2.2.0.
2026-11-03T16:35:49.5270059Z    > Could not resolve org.apache.httpcomponents:httpmime:4.5.6.
2026-11-03T16:35:49.5277135Z          > Could not parse POM https://repo.maven.apache.org/maven2/org/apache/httpcomponents/httpmime/4.5.6/httpmime-4.5.6.pom
2026-11-03T16:35:49.5497524Z BUILD FAILED in 20s
2026-11-03T16:35:50.0098765Z ##[error]Process completed with exit code 1.`;
let c = classifyFailure(androidInfra);
assert.equal(c.category, 'infra', 'a dependency download that failed is not the change');
assert.equal(c.evidence[0], '> Could not parse POM https://repo.maven.apache.org/maven2/org/apache/httpcomponents/httpmime/4.5.6/httpmime-4.5.6.pom', 'quoted without the timestamp');
// A mistyped version prints "could not resolve" too: without a transient
// sign that's the change's fault, so it stays actionable.
const typo = "* What went wrong:\n> Could not resolve all artifacts for configuration 'classpath'.\n   > Could not find com.android.tools.build:gradle:8.99.0.\nBUILD FAILED in 9s\n##[error]Process completed with exit code 1.";
assert.equal(classifyFailure(typo).category, 'ci-failed', 'one dependency not found is not an outage');
// Many dependencies missing at once is no proof either (a change that
// dropped a package repository does that): only a transient sign counts.
const many = ['kotlin-stdlib:2.2.0', 'asm:9.8', 'asm-util:9.8', 'jopt-simple:4.9', 'grpc-core:1.69.1'].map((a, i) => `   > Could not find org.dep${i}:${a}.`).join('\n');
assert.equal(classifyFailure(`> Could not resolve all artifacts for configuration 'classpath'.\n${many}\nBUILD FAILED`).category, 'ci-failed');
// A URL or host that's simply wrong is the change's fault; a 5xx or a
// temporary DNS failure isn't.
assert.equal(classifyFailure("> Could not GET 'https://repo.example.invalid/a/b.pom'. Received status code 404 from server: Not Found").category, 'ci-failed');
assert.equal(classifyFailure('npm ERR! getaddrinfo ENOTFOUND registry.npmjs.og').category, 'ci-failed');
assert.equal(classifyFailure("> Could not GET 'https://repo.maven.apache.org/x.pom'. Received status code 503 from server: Service Unavailable").category, 'infra');
assert.equal(classifyFailure('npm ERR! request to https://registry.npmjs.org/vite failed, reason: getaddrinfo EAI_AGAIN registry.npmjs.org').category, 'infra');
c = classifyFailure(`2026-11-02T22:53:21.0000000Z ${ansi}> node tools/asset-check.mjs\n2026-11-02T22:53:21.1000000Z FAIL docs/extension/izuki-extension.zip: has an old assess.js: run npm run extension\n2026-11-02T22:53:21.3325011Z ##[error]Process completed with exit code 1.`);
assert.deepEqual([c.category, c.evidence[0]], ['tests-failed', 'FAIL docs/extension/izuki-extension.zip: has an old assess.js: run npm run extension']);
assert.equal(classifyFailure('error[E0425]: cannot find value `x` in this scope\nerror: could not compile `izuki` (lib) due to 1 previous error').category, 'compile-failed');
assert.equal(classifyFailure('src/lib/ipc.ts(12,3): error TS2304: Cannot find name \'foo\'.').category, 'compile-failed');
assert.equal(classifyFailure('test result: FAILED. 600 passed; 1 failed; 48 ignored').category, 'tests-failed');
assert.equal(classifyFailure('ℹ tests 10\nℹ pass 9\nℹ fail 1').category, 'tests-failed');
assert.equal(classifyFailure('ℹ fail 0\n##[error]Process completed with exit code 1.').category, 'ci-failed', 'no failing count, no claim');
// A real failure wins over network noise in the same log.
assert.equal(classifyFailure('retrying after ECONNRESET\ntest result: FAILED. 1 failed').category, 'tests-failed');
assert.equal(classifyFailure('npm ERR! code ECONNRESET\nnpm ERR! network request failed').category, 'infra');
c = classifyFailure('Run npm ci\n##[error]Process completed with exit code 1.');
assert.deepEqual([c.category, c.evidence], ['ci-failed', ['##[error]Process completed with exit code 1.']], "unknown: says so, with the error line");
assert.match(recover(failing('claude', ['failed']), 'compile-failed').note, /first compiler error/);
assert.match(recover(failing('claude', ['failed']), 'review').note, /CodeRabbit/);

console.log('agent scheduler: state blocks, task parsing, file overlap, agent states (busy, disconnected, working on its own, unavailable), evidence-based scores, planning (priority, dependencies, no second task, no shared files, untrusted ignored), recovery (new strategy, reassign, block), outages (usage limit, signed out, service down: never an attempt or a failure; long ones redistribute flexible work) and failed checks classified from their logs (infra, compile, tests, unknown; quoted) pass.');
