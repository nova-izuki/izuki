// The bridge's only way to the outside: GitHub, through the `gh` CLI (signed
// in on the owner's PC; GH_TOKEN in Actions). Tasks are issues labelled
// `agent-task`; the dashboard is one issue labelled `agent-dashboard`.
import { execFileSync } from 'node:child_process';

export const REPO = process.env.GITHUB_REPOSITORY || 'nova-izuki/izuki';
export const DEV_BRANCH = 'milestone-196';

/** `gh api` with a JSON body; returns parsed JSON ('' bodies as null). */
export function api(path, { method = 'GET', body, paginate = false } = {}) {
  const args = ['api', path, '--method', method];
  if (paginate) args.push('--paginate', '--slurp');
  if (body !== undefined) args.push('--input', '-');
  const out = execFileSync('gh', args, { input: body === undefined ? undefined : JSON.stringify(body), encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, windowsHide: true });
  if (!out.trim()) return null;
  const value = JSON.parse(out);
  return paginate ? value.flat() : value;
}

/** Every task issue, open and closed, in the shape scheduler.describe reads. */
export function listTasks() {
  return api(`repos/${REPO}/issues?labels=agent-task&state=all&per_page=100`, { paginate: true })
    .filter((i) => !i.pull_request)
    .map((i) => ({ number: i.number, title: i.title, body: i.body || '', labels: i.labels.map((l) => l.name), author: { login: i.user.login }, state: i.state.toUpperCase(), createdAt: i.created_at, closedAt: i.closed_at }));
}

const permissions = new Map();
/**
 * May this account give the agents work? Only people with write access to
 * the repository (the owner, a commander signed in as the owner) and the
 * bridge's own automation. Anyone else's issue is never acted on.
 */
export function trusted(login) {
  if (!login) return false;
  if (login === 'github-actions[bot]') return true;
  if (!permissions.has(login)) {
    let ok = false;
    try { ok = ['admin', 'maintain', 'write'].includes(api(`repos/${REPO}/collaborators/${encodeURIComponent(login)}/permission`)?.permission); } catch { ok = false; }
    permissions.set(login, ok);
  }
  return permissions.get(login);
}

export function setLabels(number, add = [], remove = []) {
  for (const name of remove) {
    try { api(`repos/${REPO}/issues/${number}/labels/${encodeURIComponent(name)}`, { method: 'DELETE' }); } catch { /* wasn't there */ }
  }
  if (add.length) api(`repos/${REPO}/issues/${number}/labels`, { method: 'POST', body: { labels: add } });
}

export const editIssue = (number, fields) => api(`repos/${REPO}/issues/${number}`, { method: 'PATCH', body: fields });
export const comment = (number, text) => api(`repos/${REPO}/issues/${number}/comments`, { method: 'POST', body: { body: text } });
export const createIssue = (fields) => api(`repos/${REPO}/issues`, { method: 'POST', body: fields });
export const comments = (number) => api(`repos/${REPO}/issues/${number}/comments?per_page=100`, { paginate: true });

/** The labels the bridge uses, created once if the repository lacks them. */
export function ensureLabels() {
  const have = new Set(api(`repos/${REPO}/labels?per_page=100`, { paginate: true }).map((l) => l.name));
  const want = {
    'agent-task': '5319e7', 'agent-dashboard': '0e8a16', untrusted: 'b60205',
    'agent:claude': 'd4c5f9', 'agent:freebuff': 'c2e0c6', 'agent:any': 'ededed',
    'status:queued': 'fbca04', 'status:assigned': 'f9d0c4', 'status:in-progress': '1d76db', 'status:review': '0052cc',
    'status:done': '0e8a16', 'status:failed': 'd93f0b', 'status:blocked': 'b60205',
    'priority:urgent': 'b60205', 'priority:high': 'd93f0b', 'priority:normal': 'fef2c0', 'priority:low': 'c5def5',
  };
  for (const [name, color] of Object.entries(want)) {
    if (!have.has(name)) api(`repos/${REPO}/labels`, { method: 'POST', body: { name, color } });
  }
}

/** A pull request's state and whether every check on its head passed. */
export function pullStatus(number) {
  const pr = api(`repos/${REPO}/pulls/${number}`);
  const runs = api(`repos/${REPO}/commits/${pr.head.sha}/check-runs?per_page=100`).check_runs || [];
  const pending = runs.filter((r) => r.status !== 'completed');
  const failed = runs.filter((r) => r.status === 'completed' && !['success', 'skipped', 'neutral'].includes(r.conclusion));
  return { pr, runs: runs.length, pending: pending.length, failed: failed.map((r) => r.name), base: pr.base.ref, merged: pr.merged, open: pr.state === 'open' };
}

/** Every check on one commit (Freebuff pushes to the branch, not through PRs). */
export function commitChecks(sha) {
  const runs = api(`repos/${REPO}/commits/${sha}/check-runs?per_page=100`).check_runs || [];
  return { runs: runs.length, pending: runs.filter((r) => r.status !== 'completed').length, failed: runs.filter((r) => r.status === 'completed' && !['success', 'skipped', 'neutral'].includes(r.conclusion)).map((r) => r.name) };
}

/** Recent commits on the development branch (for an agent working on its own, like Freebuff). */
export const recentCommits = (since) => api(`repos/${REPO}/commits?sha=${DEV_BRANCH}&since=${since}&per_page=50`) || [];
