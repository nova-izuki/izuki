// The bridge's coordinator: one pass of OBSERVE → UNDERSTAND → PRIORITIZE →
// ASSIGN → VERIFY → RECOVER over the task issues. Runs in GitHub Actions on
// a schedule (:07, :27, :47) and on every task, PR and CI event, and by hand:
//   node tools/agents/coordinator.mjs            (do it)
//   node tools/agents/coordinator.mjs --dry-run  (say what it would do)
// It never runs anything from an issue's text: tasks are instructions for an
// agent, and only accounts with write access may give them.
import fs from 'node:fs';
import { describe, writeState, agentStates, performance, plan, recover, redistribute, classifyFailure, productivity, compose, WEIGHTED_ASSIGNMENT, AGENTS } from './scheduler.mjs';
import * as gh from './github.mjs';

const DRY = process.argv.includes('--dry-run');
const now = Date.now();
const iso = (t = now) => new Date(t).toISOString();
const log = [];
const act = (what, fn) => { log.push(what); if (!DRY) fn(); };
// One task's trouble (an API error, a deleted PR) never stops the pass for the rest.
const each = (label, items, fn) => {
  for (const item of items) {
    try { fn(item); } catch (e) { log.push(`${label}${item?.number ? ` #${item.number}` : ''}: skipped (${String(e.message).split('\n')[0].slice(0, 120)})`); }
  }
};

if (!DRY) gh.ensureLabels();
let tasks = gh.listTasks().map(describe);
const byNumber = () => new Map(tasks.map((t) => [t.number, t]));

// OBSERVE: Freebuff has no interface to ask, so its own recent commits on the
// branch say it's at work: they're all signed "Generated with Codebuff" (41
// of 41 checked). Anyone else's commit (Claude's, or Codex's, which once made
// Freebuff look busy) doesn't count. Claude's state comes from its dispatched
// runs' heartbeats instead; the owner's interactive Claude session committing
// doesn't make the dispatched one busy.
const facts = { claude: {}, freebuff: {} };
try {
  for (const c of gh.recentCommits(iso(now - 30 * 60 * 1000))) {
    if (!/Generated with Codebuff/i.test(c.commit.message)) continue;
    facts.freebuff.activeSince = Math.max(facts.freebuff.activeSince || 0, Date.parse(c.commit.committer.date));
  }
} catch (e) { log.push(`couldn't read recent commits: ${e.message}`); }

// Untrusted tasks are labelled once and never acted on.
each('untrusted', tasks.filter((t) => t.open && !gh.trusted(t.author) && !t.labels.includes('untrusted')), (t) => {
  act(`#${t.number}: from ${t.author}, who can't give the agents work — ignored`, () => {
    gh.setLabels(t.number, ['untrusted']);
    gh.comment(t.number, 'The agent bridge only takes tasks from accounts with write access to this repository. This one is ignored.');
  });
});

function update(t, status, statePatch, note) {
  const state = { ...t.state, ...statePatch };
  act(`#${t.number}: ${t.status} → ${status}${note ? ` (${note.slice(0, 80)})` : ''}`, () => {
    gh.editIssue(t.number, { body: writeState(t.body || gh.api(`repos/${gh.REPO}/issues/${t.number}`).body, state) });
    if (status !== t.status) gh.setLabels(t.number, [`status:${status}`], [`status:${t.status}`]);
    if (note) gh.comment(t.number, note);
    if (status === 'done') gh.editIssue(t.number, { state: 'closed', state_reason: 'completed' });
  });
  t.status = status;
  t.state = state;
}

// `recorded`: the run already wrote this failure into the history (the
// dispatcher does), so it's counted once, not twice.
function fail(t, category, detail, recorded = false) {
  const history = [...(t.state.history || []), ...(recorded ? [] : [{ agent: t.state.agent, result: 'failed', category, at: iso() }])];
  const next = recover({ ...t, state: { ...t.state, history } }, category);
  const text = `${detail ? `${detail}\n\n` : ''}${next.note}`;
  if (next.action === 'block') return update(t, 'blocked', { history, pr: undefined, commit: undefined }, text);
  update(t, 'queued', { history, agent: next.action === 'reassign' ? undefined : t.state.agent, strategy: next.note, pr: undefined, commit: undefined, reviewSince: undefined }, text);
  if (next.action === 'reassign') {
    act(`#${t.number}: to ${next.to}`, () => gh.setLabels(t.number, [`agent:${next.to}`], [`agent:${t.agent}`]));
    // The rest of this pass reads the task from memory, not from GitHub:
    // without this, the assign step below would hand the task straight back
    // to the agent that just failed it, under the other agent's label, and
    // both could start it.
    t.agent = next.to;
    t.labels = [...(t.labels || []).filter((l) => !l.startsWith('agent:')), `agent:${next.to}`];
  }
}

// Why checks failed, from their logs (a CodeRabbit failure is a review
// finding). One that can't be read counts as an unexplained CI failure.
function diagnose(runs) {
  return runs.map((r) => {
    if (r.app === 'coderabbitai') return { name: r.name, category: 'review', evidence: [] };
    try { return { name: r.name, ...(r.app === 'github-actions' ? classifyFailure(gh.jobLog(r.id)) : { category: 'ci-failed', evidence: [] }) }; } catch { return { name: r.name, category: 'ci-failed', evidence: [] }; }
  });
}
const cite = (why) => why.map((w) => `${w.name} (${w.category}${w.evidence.length ? `: "${w.evidence[0]}"` : ''})`).join('; ');
/**
 * Checks that failed (diagnosed): the task's failure, with the evidence
 * quoted, unless every failure was the infrastructure's (a download or the
 * runner). Then the task stays in review, said once per commit, until a
 * re-run or a newer push gives a verdict; true means it's waiting so.
 */
function failedChecks(t, why, where, sha) {
  if (why.every((w) => w.category === 'infra')) {
    if (t.state.infraNoted !== sha) update(t, 'review', { infraNoted: sha }, `Checks on ${where} failed for an infrastructure reason, not because of the change: ${cite(why)}. Not counted against the task; it stays in review until the checks are re-run (Actions → Re-run failed jobs) or a newer push passes.`);
    return true;
  }
  const first = why.find((w) => w.category !== 'infra');
  fail(t, first.category, `Checks failed on ${where}: ${cite(why)}.`);
}

// RECOVER: runs that stopped reporting.
const states0 = agentStates(tasks, now, facts);
each('recover', AGENTS.filter((a) => states0[a].state === 'disconnected').map((a) => byNumber().get(states0[a].running)), (t) => {
  fail(t, 'disconnected', `${t.state.agent}'s run on this task stopped reporting (last heartbeat ${t.state.heartbeat}).`);
});
// RECOVER: runs that reported a failure.
each('recover', tasks.filter((t) => t.open && t.status === 'failed'), (t) => fail(t, t.state.lastFailure || 'unknown', null, t.state.history?.at(-1)?.result === 'failed'));
// REDISTRIBUTE: an agent that can't work for a while (a usage limit) hands
// its unstarted tasks that could go to either agent to the other, if free.
// An outage is never a failure: nothing here counts against anyone.
each('redistribute', redistribute(tasks, agentStates(tasks, now, facts), now), (pick) => {
  const t = byNumber().get(pick.task);
  update(t, 'assigned', { agent: pick.to, assignedAt: iso() }, `Handed to **${pick.to}**: ${pick.why}, and this task can go to either agent.${t.state.branch ? ` Earlier work on it is on \`${t.state.branch}\`.` : ''}${pick.to === 'freebuff' ? ' Freebuff takes it from the queue when it finishes its current work.' : ''}`);
  act(`#${t.number}: ${pick.from} → ${pick.to}`, () => gh.setLabels(t.number, [`agent:${pick.to}`], [`agent:${pick.from}`]));
});

// VERIFY: finished work is done only when its checks pass. A PR into the
// development branch is merged then (standing authorization, AGENTS.md
// rule 2); a pushed commit just needs its checks green. Never main.
for (const t of tasks.filter((t) => t.open && t.status === 'review')) {
  // In review a day with no verdict (no checks ran, a PR left open, a PR that
  // doesn't exist): say so. Checked after any verdict, and after an error too.
  const stale = () => now - Date.parse(t.state.reviewSince || iso()) > 24 * 3600 * 1000;
  const flag = () => update(t, 'blocked', {}, `In review for over a day with no verdict${t.state.pr ? ` on PR #${t.state.pr}` : t.state.commit ? ` on ${t.state.commit.slice(0, 7)}` : ' (no PR or commit was reported)'}. Needs a look.`);
  try {
    if (!t.state.reviewSince) { t.state.reviewSince = iso(); act(`#${t.number}: review started`, () => gh.editIssue(t.number, { body: writeState(t.body, t.state) })); }
  } catch (e) { log.push(`#${t.number}: couldn't save the review start (${String(e.message).slice(0, 80)})`); }
  // "That PR or commit doesn't exist" is a verdict; any other API error isn't.
  // Read from gh's own error text (stderr), never the command line, which
  // names the PR or commit asked about (PR #404 isn't a missing one).
  const missing = (e) => /\(HTTP 404\)|\bNot Found\b/i.test(String(e?.stderr ?? ''));
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
      // The PR must be this task's before anything follows from it: the
      // dispatched run's own branch, or a PR whose title or description names
      // the task. A PR number read from a comment ("see PR #29") could be
      // someone else's work, which the bridge must never merge or count.
      const own = t.state.branch && s.pr.head.ref === t.state.branch;
      if (!own && !new RegExp(`#${t.number}(?!\\d)`).test(`${s.pr.title}\n${s.pr.body || ''}`)) { update(t, 'blocked', {}, `PR #${t.state.pr} isn't this task's branch and doesn't mention #${t.number}, so the bridge won't merge it or count it. If it is this task's work, mention #${t.number} in the PR and set the task back to review; otherwise report the right PR or commit.`); continue; }
      // A known verdict first: merged is done, whatever else.
      if (s.merged) { update(t, 'done', { doneAt: iso(), history: [...(t.state.history || []), { agent: t.state.agent, result: 'done', at: iso() }] }, `Verified and merged: PR #${t.state.pr}.`); continue; }
      if (s.base !== gh.DEV_BRANCH) { fail(t, 'conflict', `PR #${t.state.pr} targets ${s.base}; agent work goes to ${gh.DEV_BRANCH} only.`); continue; }
      // Changes to the bridge itself or to the workflows are never merged by
      // the bridge: Claude's main session reviews them.
      const touched = (gh.api(`repos/${gh.REPO}/pulls/${t.state.pr}/files?per_page=100`, { paginate: true }) || []).map((f) => f.filename);
      const guarded = touched.filter((f) => f.startsWith('.github/') || f.startsWith('tools/agents/') || f === 'docs/agents/roadmap.json');
      if (guarded.length && s.open) { update(t, 'blocked', {}, `PR #${t.state.pr} changes ${guarded.join(', ')}: the bridge never merges changes to itself or to the workflows. Claude's main session reviews it.`); continue; }
      // Closed without merging: a person stopped it, so a person decides.
      if (!s.open) { update(t, 'blocked', {}, `PR #${t.state.pr} was closed without being merged. Needs a look: reopen it, or re-plan the task.`); continue; }
      // Waiting on a re-run of infrastructure failures still ends after the day.
      if (s.failed.length) { if (failedChecks(t, diagnose(s.failedRuns), `PR #${t.state.pr}`, s.pr.head.sha) && stale()) flag(); continue; }
      if (!s.pending && !s.cancelled.length && s.runs > 0 && s.open) {
        act(`#${t.number}: merge PR #${t.state.pr} (${s.runs} checks green)`, () => gh.api(`repos/${gh.REPO}/pulls/${t.state.pr}/merge`, { method: 'PUT', body: { merge_method: 'squash', sha: s.pr.head.sha } }));
        update(t, 'done', { doneAt: iso(), history: [...(t.state.history || []), { agent: t.state.agent, result: 'done', at: iso() }] }, `Verified: all ${s.runs} checks passed on PR #${t.state.pr}; merged into ${gh.DEV_BRANCH}.`);
      } else if (stale()) flag();
    } else if (t.state.commit) {
      const sha = t.state.commit, short = sha.slice(0, 7);
      const green = (x) => !x.pending && !x.failed.length && !x.cancelled.length && x.runs > 0;
      const done = (note) => update(t, 'done', { doneAt: iso(), history: [...(t.state.history || []), { agent: t.state.agent, result: 'done', at: iso() }] }, note);
      const c = gh.commitChecks(sha);
      if (green(c)) done(`Verified: all ${c.runs} checks passed on ${short}.`);
      else if (!c.pending) {
        // Its own runs were cut off by a newer push, or failed: the branch
        // head that includes it decides. A superseded run or a flaky download
        // isn't the agent's failure; a failure that's still there is.
        const head = gh.api(`repos/${gh.REPO}/commits/${gh.DEV_BRANCH}`).sha;
        const h = head !== sha && gh.contains(head, sha) ? gh.commitChecks(head) : null;
        if (h && green(h)) done(`Verified: ${short}'s own checks ${c.failed.length ? `failed (${c.failed.join(', ')})` : 'were cancelled by a newer push'}, and all ${h.runs} checks passed on ${head.slice(0, 7)}, the ${gh.DEV_BRANCH} head that includes it.`);
        else if (c.failed.length && (!h || h.failed.some((n) => c.failed.includes(n)))) {
          // Its own failure first: a code failure there is the task's,
          // whatever the head shows. Only when its own runs failed for an
          // infrastructure reason does the newer head's evidence for those
          // same checks decide (and that note is once per head).
          const own = diagnose(c.failedRuns);
          const waiting = !h || own.some((w) => w.category !== 'infra')
            ? failedChecks(t, own, h ? `${short} (still failing on ${head.slice(0, 7)})` : short, sha)
            : failedChecks(t, diagnose(h.failedRuns.filter((r) => c.failed.includes(r.name))), `${head.slice(0, 7)}, the ${gh.DEV_BRANCH} head that includes ${short}`, head);
          if (waiting && stale()) flag();
        }
        else if (stale()) flag();
      } else if (stale()) flag();
    } else if (stale()) flag();
  } catch (e) {
    log.push(`#${t.number}: couldn't verify (${String(e.message).split('\n')[0].slice(0, 120)})`);
    // Only a reported PR or commit that doesn't exist counts against the
    // task (after the day); a passing API error leaves it in review.
    try { if (missing(e) && stale()) flag(); } catch (e2) { log.push(`#${t.number}: couldn't flag (${String(e2.message).slice(0, 80)})`); }
  }
}

// PRIORITIZE: the next approved roadmap item for an agent with nothing to do.
const roadmap = JSON.parse(fs.readFileSync(new URL('../../docs/agents/roadmap.json', import.meta.url), 'utf8')).items;
let states = agentStates(tasks, now, facts);
const usedKeys = new Map(tasks.filter((t) => t.state.key).map((t) => [t.state.key, t]));
each('roadmap', AGENTS, (agent) => {
  const waiting = tasks.some((t) => t.open && ['queued', 'assigned'].includes(t.status) && (t.agent === agent || t.agent === 'any'));
  if (states[agent].state !== 'idle' || waiting) return;
  const item = roadmap.find((i) => i.agent === agent && !usedKeys.has(i.key) && (i.after || []).every((k) => usedKeys.get(k)?.status === 'done'));
  if (!item) return;
  act(`new roadmap task for ${agent}: ${item.title}`, () => {
    const body = writeState(`${item.body}\n\nFiles: ${item.files.join(', ')}\n\n_From docs/agents/roadmap.json (${item.key})._`, { key: item.key });
    const created = gh.createIssue({ title: item.title, body, labels: ['agent-task', 'status:queued', `agent:${agent}`, `kind:${item.kind}`, `priority:${item.priority}`] });
    tasks.push(describe({ ...created, labels: created.labels.map((l) => l.name), author: { login: created.user.login }, state: 'OPEN', createdAt: created.created_at }));
  });
  usedKeys.set(item.key, { status: 'queued' });
});

// ASSIGN: dependency-ready work to free agents, by measured performance. When
// the weighted §2 score is enabled, it ranks the agents on each task kind;
// otherwise the smoothed first-try prior does (the dashboard shows the
// weighted score either way, so it can be proven before it drives anything).
const stats = performance(tasks);
const weighted = WEIGHTED_ASSIGNMENT || process.env.BRIDGE_WEIGHTED === '1';
const rank = weighted ? (agent, kind) => productivity(stats, kind)[agent] : undefined;
states = agentStates(tasks, now, facts);
each('assign', plan(tasks, states, stats, gh.trusted, rank), (pick) => {
  const t = byNumber().get(pick.task);
  update(t, 'assigned', { agent: pick.agent, assignedAt: iso(), ...(t.agent === 'any' || t.state.flexible ? { flexible: true } : {}) }, null);
  act(`#${t.number}: assigned to ${pick.agent} (${pick.why})`, () => {
    if (t.agent === 'any') gh.setLabels(t.number, [`agent:${pick.agent}`], ['agent:any']);
    gh.comment(t.number, `Assigned to **${pick.agent}**: ${pick.why}.${pick.agent === 'freebuff' ? ' Freebuff has no programmatic interface, so this waits until it finishes its current work and takes it from the queue (nothing is sent to its session).' : ' The dispatcher on the owner\'s PC starts it when Claude is free.'}`);
  });
});

// The dashboard: one issue, rewritten each pass.
states = agentStates(tasks, now, facts);
// The weighted §2 productivity score, head-to-head over each agent's whole
// record (shown whether or not it drives assignment yet).
const prod = compose(Object.fromEntries(AGENTS.map((a) => [a, stats[a] || null])));
const fmt = (xs) => (xs.length ? `${(xs.reduce((a, b) => a + b, 0) / xs.length).toFixed(0)} min` : '—');
const rows = AGENTS.map((a) => {
  const s = stats[a] || { done: 0, failed: 0, firstTry: 0, minutes: [], waits: [] };
  const cur = states[a].running || states[a].held[0];
  return `| ${a} | ${states[a].state}${states[a].until ? ` until ${states[a].until.slice(11, 16)} UTC` : ''} | ${cur ? `#${cur}` : '—'} | ${s.done} | ${s.done ? Math.round((100 * s.firstTry) / s.done) + '%' : '—'} | ${s.failed} | ${fmt(s.minutes)} | ${fmt(s.waits)} | ${prod[a].toFixed(2)} |`;
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

| Agent | State | Task | Verified done | First try | Failed attempts | Avg time to done | Avg queue wait | Weighted score |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
${rows.join('\n')}

Weighted score: the §2 productivity model (docs/AGENT-SCHEDULER-REQUIREMENTS.md) — verified rate, first-try pass, completion time, review fixes, re-work, regressions, queue wait and cost — compared head-to-head (0.50 means no comparative evidence yet). Weighted assignment is **${weighted ? 'on' : 'off'}**.

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
