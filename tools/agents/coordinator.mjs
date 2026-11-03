// The bridge's coordinator: one pass of OBSERVE → UNDERSTAND → PRIORITIZE →
// ASSIGN → VERIFY → RECOVER over the task issues. Runs in GitHub Actions on
// a schedule (:07, :27, :47) and on every task, PR and CI event, and by hand:
//   node tools/agents/coordinator.mjs            (do it)
//   node tools/agents/coordinator.mjs --dry-run  (say what it would do)
// It never runs anything from an issue's text: tasks are instructions for an
// agent, and only accounts with write access may give them.
import fs from 'node:fs';
import { describe, writeState, agentStates, performance, plan, recover, AGENTS } from './scheduler.mjs';
import * as gh from './github.mjs';

const DRY = process.argv.includes('--dry-run');
const now = Date.now();
const iso = (t = now) => new Date(t).toISOString();
const log = [];
const act = (what, fn) => { log.push(what); if (!DRY) fn(); };

if (!DRY) gh.ensureLabels();
let tasks = gh.listTasks().map(describe);
const byNumber = () => new Map(tasks.map((t) => [t.number, t]));

// OBSERVE: Freebuff has no interface to ask, so its own recent commits on the
// branch (no Claude co-author line) say it's at work. Claude's state comes
// from its dispatched runs' heartbeats instead; the owner's interactive
// Claude session committing doesn't make the dispatched one busy.
const facts = { claude: {}, freebuff: {} };
try {
  for (const c of gh.recentCommits(iso(now - 30 * 60 * 1000))) {
    if (/Co-Authored-By: Claude/i.test(c.commit.message)) continue;
    facts.freebuff.activeSince = Math.max(facts.freebuff.activeSince || 0, Date.parse(c.commit.committer.date));
  }
} catch (e) { log.push(`couldn't read recent commits: ${e.message}`); }

// Untrusted tasks are labelled once and never acted on.
for (const t of tasks.filter((t) => t.open && !gh.trusted(t.author) && !t.labels.includes('untrusted'))) {
  act(`#${t.number}: from ${t.author}, who can't give the agents work — ignored`, () => {
    gh.setLabels(t.number, ['untrusted']);
    gh.comment(t.number, 'The agent bridge only takes tasks from accounts with write access to this repository. This one is ignored.');
  });
}

function update(t, status, statePatch, note) {
  const state = { ...t.state, ...statePatch };
  act(`#${t.number}: ${t.status} → ${status}${note ? ` (${note.slice(0, 80)})` : ''}`, () => {
    gh.editIssue(t.number, { body: writeState(t.body || gh.api(`repos/${gh.REPO}/issues/${t.number}`).body, state) });
    gh.setLabels(t.number, [`status:${status}`], [`status:${t.status}`]);
    if (note) gh.comment(t.number, note);
    if (status === 'done') gh.editIssue(t.number, { state: 'closed', state_reason: 'completed' });
  });
  t.status = status;
  t.state = state;
}

function fail(t, category, detail) {
  const history = [...(t.state.history || []), { agent: t.state.agent, result: 'failed', category, at: iso() }];
  const next = recover({ ...t, state: { ...t.state, history } }, category);
  const text = `${detail ? `${detail}\n\n` : ''}${next.note}`;
  if (next.action === 'block') return update(t, 'blocked', { history }, text);
  update(t, 'queued', { history, agent: next.action === 'reassign' ? undefined : t.state.agent, strategy: next.note }, text);
  if (next.action === 'reassign') act(`#${t.number}: to ${next.to}`, () => gh.setLabels(t.number, [`agent:${next.to}`], [`agent:${t.agent}`]));
}

// RECOVER: runs that stopped reporting.
const states0 = agentStates(tasks, now, facts);
for (const agent of AGENTS) {
  if (states0[agent].state !== 'disconnected') continue;
  const t = byNumber().get(states0[agent].running);
  fail(t, 'disconnected', `${agent}'s run on this task stopped reporting (last heartbeat ${t.state.heartbeat}).`);
}
// RECOVER: runs that reported a failure.
for (const t of tasks.filter((t) => t.open && t.status === 'failed')) fail(t, t.state.lastFailure || 'unknown', null);

// VERIFY: finished work is done only when its checks pass. A PR into the
// development branch is merged then (standing authorization, AGENTS.md
// rule 2); a pushed commit just needs its checks green. Never main.
for (const t of tasks.filter((t) => t.open && t.status === 'review')) {
  try {
    // Freebuff reports by comment ("pushed 1a2b3c4", "PR #45"): read it from there.
    if (!t.state.pr && !t.state.commit) {
      for (const c of (gh.comments(t.number) || []).filter((c) => gh.trusted(c.user.login)).reverse()) {
        const pr = /\bPR\s*#(\d+)/i.exec(c.body), sha = /\b([0-9a-f]{7,40})\b/.exec(c.body);
        if (pr) { t.state.pr = Number(pr[1]); break; }
        if (sha) {
          try { t.state.commit = gh.api(`repos/${gh.REPO}/commits/${sha[1]}`).sha; break; } catch { /* not a commit */ }
        }
      }
      if (!t.state.agent) t.state.agent = t.agent === 'any' ? 'freebuff' : t.agent;
    }
    if (t.state.pr) {
      const s = gh.pullStatus(t.state.pr);
      if (s.base !== gh.DEV_BRANCH) { fail(t, 'conflict', `PR #${t.state.pr} targets ${s.base}; agent work goes to ${gh.DEV_BRANCH} only.`); continue; }
      if (s.merged) { update(t, 'done', { doneAt: iso(), history: [...(t.state.history || []), { agent: t.state.agent, result: 'done', at: iso() }] }, `Verified and merged: PR #${t.state.pr}.`); continue; }
      if (s.failed.length) { fail(t, 'ci-failed', `Checks failed on PR #${t.state.pr}: ${s.failed.join(', ')}.`); continue; }
      if (!s.pending && s.runs > 0 && s.open) {
        act(`#${t.number}: merge PR #${t.state.pr} (${s.runs} checks green)`, () => gh.api(`repos/${gh.REPO}/pulls/${t.state.pr}/merge`, { method: 'PUT', body: { merge_method: 'squash', sha: s.pr.head.sha } }));
        update(t, 'done', { doneAt: iso(), history: [...(t.state.history || []), { agent: t.state.agent, result: 'done', at: iso() }] }, `Verified: all ${s.runs} checks passed on PR #${t.state.pr}; merged into ${gh.DEV_BRANCH}.`);
      }
    } else if (t.state.commit) {
      const c = gh.commitChecks(t.state.commit);
      if (c.failed.length) fail(t, 'ci-failed', `Checks failed on ${t.state.commit.slice(0, 7)}: ${c.failed.join(', ')}.`);
      else if (!c.pending && c.runs > 0) update(t, 'done', { doneAt: iso(), history: [...(t.state.history || []), { agent: t.state.agent, result: 'done', at: iso() }] }, `Verified: all ${c.runs} checks passed on ${t.state.commit.slice(0, 7)}.`);
    }
  } catch (e) { log.push(`#${t.number}: couldn't verify (${e.message})`); }
}

// PRIORITIZE: the next approved roadmap item for an agent with nothing to do.
const roadmap = JSON.parse(fs.readFileSync(new URL('../../docs/agents/roadmap.json', import.meta.url), 'utf8')).items;
let states = agentStates(tasks, now, facts);
const usedKeys = new Map(tasks.filter((t) => t.state.key).map((t) => [t.state.key, t]));
for (const agent of AGENTS) {
  const waiting = tasks.some((t) => t.open && ['queued', 'assigned'].includes(t.status) && (t.agent === agent || t.agent === 'any'));
  if (states[agent].state !== 'idle' || waiting) continue;
  const item = roadmap.find((i) => i.agent === agent && !usedKeys.has(i.key) && (i.after || []).every((k) => usedKeys.get(k)?.status === 'done'));
  if (!item) continue;
  act(`new roadmap task for ${agent}: ${item.title}`, () => {
    const body = writeState(`${item.body}\n\nFiles: ${item.files.join(', ')}\n\n_From docs/agents/roadmap.json (${item.key})._`, { key: item.key });
    const created = gh.createIssue({ title: item.title, body, labels: ['agent-task', 'status:queued', `agent:${agent}`, `kind:${item.kind}`, `priority:${item.priority}`] });
    tasks.push(describe({ ...created, labels: created.labels.map((l) => l.name), author: { login: created.user.login }, state: 'OPEN', createdAt: created.created_at }));
  });
  usedKeys.set(item.key, { status: 'queued' });
}

// ASSIGN: dependency-ready work to free agents, by measured performance.
const stats = performance(tasks);
states = agentStates(tasks, now, facts);
for (const pick of plan(tasks, states, stats, gh.trusted)) {
  const t = byNumber().get(pick.task);
  update(t, 'assigned', { agent: pick.agent, assignedAt: iso() }, null);
  act(`#${t.number}: assigned to ${pick.agent} (${pick.why})`, () => {
    if (t.agent === 'any') gh.setLabels(t.number, [`agent:${pick.agent}`], ['agent:any']);
    gh.comment(t.number, `Assigned to **${pick.agent}**: ${pick.why}.${pick.agent === 'freebuff' ? ' Freebuff has no programmatic interface, so this waits until it finishes its current work and takes it from the queue (nothing is sent to its session).' : ' The dispatcher on the owner\'s PC starts it when Claude is free.'}`);
  });
}

// The dashboard: one issue, rewritten each pass.
states = agentStates(tasks, now, facts);
const fmt = (xs) => (xs.length ? `${(xs.reduce((a, b) => a + b, 0) / xs.length).toFixed(0)} min` : '—');
const rows = AGENTS.map((a) => {
  const s = stats[a] || { done: 0, failed: 0, firstTry: 0, minutes: [], waits: [] };
  const cur = states[a].running || states[a].held[0];
  return `| ${a} | ${states[a].state} | ${cur ? `#${cur}` : '—'} | ${s.done} | ${s.done ? Math.round((100 * s.firstTry) / s.done) + '%' : '—'} | ${s.failed} | ${fmt(s.minutes)} | ${fmt(s.waits)} |`;
});
const open = tasks.filter((t) => t.open);
const list = (st) => open.filter((t) => t.status === st).map((t) => `#${t.number}`).join(' ') || '—';
let release = '—';
try {
  const latest = gh.api(`repos/${gh.REPO}/releases/latest`);
  const head = gh.api(`repos/${gh.REPO}/commits/${gh.DEV_BRANCH}`);
  const checks = gh.commitChecks(head.sha);
  release = `latest ${latest.tag_name} (${latest.published_at.slice(0, 10)}); ${gh.DEV_BRANCH} at ${head.sha.slice(0, 7)}: ${checks.failed.length ? `failing (${checks.failed.join(', ')})` : checks.pending ? 'checks running' : 'all checks green'}`;
} catch (e) { release = `unknown (${e.message.slice(0, 60)})`; }
const next = roadmap.filter((i) => !usedKeys.has(i.key)).slice(0, 3).map((i) => `${i.agent}: ${i.title}`).join('; ') || '—';
const dashboard = `Rewritten by the agent coordinator (tools/agents/coordinator.mjs) on every pass. Last pass: ${iso()}.

| Agent | State | Task | Verified done | First try | Failed attempts | Avg time to done | Avg queue wait |
| --- | --- | --- | --- | --- | --- | --- | --- |
${rows.join('\n')}

**Queued:** ${list('queued')} · **Assigned:** ${list('assigned')} · **In progress:** ${list('in-progress')} · **In review:** ${list('review')} · **Blocked:** ${list('blocked')}

**Release:** ${release}. Claude coordinates releases.

**Next on the roadmap:** ${next}

**This pass:** ${log.length ? log.map((l) => `\n- ${l}`).join('') : 'nothing to do.'}
`;
if (DRY) console.log(dashboard);
else {
  const existing = gh.api(`repos/${gh.REPO}/issues?labels=agent-dashboard&state=open&per_page=5`) || [];
  if (existing[0]) gh.editIssue(existing[0].number, { body: dashboard });
  else gh.createIssue({ title: '🤖 Agent dashboard', body: dashboard, labels: ['agent-dashboard'] });
  console.log(`coordinator: ${log.length} action(s)\n${log.join('\n')}`);
}
