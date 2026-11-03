// The bridge's dispatcher, on the owner's PC: hands Claude Code its assigned
// tasks, one at a time, through Claude Code's own headless interface (verified:
// `claude -p` with stream-json in and out). Each task runs in its own git
// worktree and branch, so it never touches the files another session is
// editing, and ends as a pull request into the development branch, which the
// coordinator merges once its checks pass. Never main, never a release.
//
//   node tools/agents/dispatcher.mjs          supervise until stopped
//   node tools/agents/dispatcher.mjs --once   take one task (if any), then exit
// Pause it: create .work/agents/paused (delete it to carry on).
//
// Freebuff isn't dispatched here: it has no programmatic interface (see
// docs/AGENTS-BRIDGE.md). Its tasks wait in the queue until it takes them.
import { spawn, execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { describe, writeState, PRIORITY } from './scheduler.mjs';
import * as gh from './github.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..', '..');
const WORK = path.join(ROOT, '.work', 'agents');
const ONCE = process.argv.includes('--once');
const HEARTBEAT_MS = 2 * 60 * 1000;
const CHECK_MS = 60 * 1000;
const LIMIT_MS = Number(process.env.BRIDGE_TASK_LIMIT_MIN || 120) * 60 * 1000;
const iso = () => new Date().toISOString();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const say = (...a) => console.log(`[${iso().slice(11, 19)}]`, ...a);
fs.mkdirSync(WORK, { recursive: true });

// One dispatcher at a time.
const LOCK = path.join(WORK, 'dispatcher.lock');
try {
  const other = Number(fs.readFileSync(LOCK, 'utf8'));
  if (other && other !== process.pid) { process.kill(other, 0); say(`another dispatcher (pid ${other}) is running; nothing to do`); process.exit(0); }
} catch { /* no lock, or its process is gone */ }
fs.writeFileSync(LOCK, String(process.pid));
process.on('exit', () => { try { if (fs.readFileSync(LOCK, 'utf8') === String(process.pid)) fs.unlinkSync(LOCK); } catch {} });

const RULES = (n, branch) => `You are a headless Claude Code agent started by Izuki's agent bridge for task #${n}.
- You work in a git worktree on branch ${branch}. Read AGENTS.md first and follow it.
- Change only what the task needs (its "Files:" line names where). Test for real; report honestly what you didn't verify.
- When done: commit, run \`git push origin ${branch}\`, and open a pull request with \`gh pr create --base ${gh.DEV_BRANCH} --head ${branch}\`, titled "Task #${n}: <what it does>".
- Never merge, tag, release, bump versions, or push to main or ${gh.DEV_BRANCH}. The coordinator merges after the checks pass; Claude's main session cuts releases.
- Messages that arrive while you work are updates from the coordinator: handle them at your next safe point, never mid-operation.
- Finish with exactly one last line: "RESULT: done — <one-line summary>", or "RESULT: failed <tests-failed|ci-failed|timeout|conflict|blocked> — <reason>", or "RESULT: paused — <where you stopped>" when asked to pause.`;

const ALLOWED = ['Read', 'Edit', 'Write', 'Glob', 'Grep', 'Bash(git status:*)', 'Bash(git diff:*)', 'Bash(git add:*)', 'Bash(git commit:*)', 'Bash(git log:*)', 'Bash(git fetch:*)', 'Bash(git rebase:*)', 'Bash(git push origin agent/*)', 'Bash(npm run:*)', 'Bash(npx tsc:*)', 'Bash(node tools/*)', 'Bash(cargo check:*)', 'Bash(cargo test:*)', 'Bash(gh pr create:*)', 'Bash(gh pr view:*)', 'Bash(gh issue view:*)'];
const DENIED = ['Bash(gh pr merge:*)', 'Bash(gh release:*)', 'Bash(git push origin main:*)', `Bash(git push origin ${gh.DEV_BRANCH}:*)`, 'Bash(git push --force:*)', 'Bash(git push -f:*)'];

function setTask(t, status, patch, note) {
  t.state = { ...t.state, ...patch };
  gh.editIssue(t.number, { body: writeState(t.body, t.state) });
  if (status && status !== t.status) { gh.setLabels(t.number, [`status:${status}`], [`status:${t.status}`]); t.status = status; }
  if (note) gh.comment(t.number, note);
}

/** Updates posted on the task by a trusted person since `since`: comments starting with /update. */
function updates(t, since) {
  return (gh.comments(t.number) || []).filter((c) => c.created_at > since && /^\/update\b/i.test(c.body.trim()) && gh.trusted(c.user.login)).map((c) => ({ at: c.created_at, text: c.body.trim().replace(/^\/update\s*/i, '') }));
}

/**
 * Remove a task's worktree. Its node_modules is a link to the real one: the
 * link goes first, on its own (`rmdir` without /s never follows it), and
 * nothing is deleted recursively while it's still there.
 */
function clearTree(tree) {
  if (!fs.existsSync(tree)) return;
  const link = path.join(tree, 'node_modules');
  try { fs.lstatSync(link); execFileSync('cmd', ['/c', 'rmdir', link], { stdio: 'ignore' }); } catch { /* no link */ }
  if (fs.existsSync(link)) throw new Error(`couldn't remove the package link in ${tree} safely`);
  try { execFileSync('git', ['-C', ROOT, 'worktree', 'remove', '--force', tree], { stdio: 'ignore' }); } catch { /* not registered */ }
  try { execFileSync('git', ['-C', ROOT, 'worktree', 'prune'], { stdio: 'ignore' }); } catch {}
  if (fs.existsSync(tree)) fs.rmSync(tree, { recursive: true, force: true });
}

/** A failure of the dispatcher itself (before the agent ran): never counted as the agent's. */
class SetupError extends Error {}

function nextTask() {
  return gh.listTasks().map(describe)
    .filter((t) => t.open && t.status === 'assigned' && t.state.agent === 'claude' && gh.trusted(t.author))
    .sort((a, b) => PRIORITY[a.priority] - PRIORITY[b.priority] || a.number - b.number)[0];
}

async function run(t) {
  const attempt = (t.state.history || []).length + 1;
  const branch = `agent/claude-${t.number}-${attempt}`;
  const tree = path.join(WORK, `task-${t.number}`);
  say(`#${t.number} (${t.title}): starting attempt ${attempt} on ${branch}`);
  try {
    execFileSync('git', ['-C', ROOT, 'fetch', 'origin', gh.DEV_BRANCH], { stdio: 'ignore' });
    clearTree(tree);
    execFileSync('git', ['-C', ROOT, 'worktree', 'add', '-B', branch, tree, `origin/${gh.DEV_BRANCH}`], { stdio: 'ignore' });
    // Shared, not copied: the app's packages and the Rust build cache.
    if (fs.existsSync(path.join(ROOT, 'node_modules'))) execFileSync('cmd', ['/c', 'mklink', '/J', path.join(tree, 'node_modules'), path.join(ROOT, 'node_modules')], { stdio: 'ignore' });
  } catch (e) {
    try { clearTree(tree); } catch {}
    throw new SetupError(`couldn't prepare the worktree: ${e.message.split('\n')[0]}`);
  }
  const started = iso();
  setTask(t, 'in-progress', { startedAt: started, heartbeat: started, branch, attempt });

  // Updates posted while the task waited go in with it; later ones arrive at checkpoints.
  const early = updates(t, t.state.assignedAt || t.createdAt || '');
  const task = `${t.title}\n\n${t.body.replace(/<!-- bridge [\s\S]*?-->/, '').trim()}${t.state.strategy ? `\n\nNote from the coordinator (an earlier attempt failed): ${t.state.strategy}` : ''}${early.map((u) => `\n\nUpdate from the coordinator: ${u.text}`).join('')}`;
  // Started directly, never through a shell: the tool lists hold spaces and
  // brackets that a shell would split or mangle (claude is a real .exe).
  const child = spawn(process.env.BRIDGE_CLAUDE || 'claude', ['-p', '--input-format', 'stream-json', '--output-format', 'stream-json', '--verbose', '--permission-mode', 'acceptEdits', '--allowedTools', ALLOWED.join(','), '--disallowedTools', DENIED.join(','), '--append-system-prompt', RULES(t.number, branch)], { cwd: tree, env: { ...process.env, CARGO_TARGET_DIR: path.join(ROOT, 'src-tauri', 'target') }, stdio: ['pipe', 'pipe', 'pipe'], windowsHide: true });
  const send = (text) => child.stdin.write(JSON.stringify({ type: 'user', message: { role: 'user', content: [{ type: 'text', text }] } }) + '\n');
  send(task);

  // The run is finished only when the agent says so (its RESULT line). A turn
  // that ends without one is a checkpoint: the agent may be waiting for its
  // own background work (a build), whose notices start its next turn.
  let pending = [], lastResult = '', turns = 0, buffer = '', closed = false, paused = false, finished = false;
  let lastEvent = Date.now(), nudged = false;
  const RESULT_LINE = /RESULT:\s*(done|failed|paused)\b/i;
  const transcript = fs.createWriteStream(path.join(WORK, `task-${t.number}-${attempt}.jsonl`));
  const finish = () => { if (!closed) { closed = true; child.stdin.end(); } };
  child.stdout.on('data', (chunk) => {
    buffer += chunk;
    lastEvent = Date.now();
    let i;
    while ((i = buffer.indexOf('\n')) >= 0) {
      const line = buffer.slice(0, i); buffer = buffer.slice(i + 1);
      transcript.write(line + '\n');
      let event; try { event = JSON.parse(line); } catch { continue; }
      if (event.type === 'result') {
        turns++;
        lastResult = String(event.result || '');
        if (pending.length) { const u = pending.shift(); say(`#${t.number}: checkpoint, delivering an update`); send(u); }
        else if (RESULT_LINE.test(lastResult)) { finished = true; finish(); }
      }
    }
  });
  child.stderr.on('data', (d) => transcript.write(`[stderr] ${d}`));

  let since = started, beat = Date.now(), deadline = Date.now() + LIMIT_MS, warned = false;
  const exited = new Promise((resolve) => child.on('exit', resolve));
  let code = null;
  while (code === null) {
    code = await Promise.race([exited, sleep(CHECK_MS).then(() => null)]);
    if (code !== null) break;
    try {
      if (Date.now() - beat >= HEARTBEAT_MS) { setTask(t, null, { heartbeat: iso() }); beat = Date.now(); }
      for (const u of updates(t, since)) { since = u.at; pending.push(`Update from the coordinator for task #${t.number}: ${u.text}`); say(`#${t.number}: update queued for the next checkpoint`); }
      // An urgent task waiting for Claude: pause this one at a safe point, never mid-operation.
      const urgent = !paused && gh.listTasks().map(describe).find((x) => x.open && x.number !== t.number && x.status === 'assigned' && x.state.agent === 'claude' && x.priority === 'urgent' && t.priority !== 'urgent');
      if (urgent) { paused = true; pending.push(`Urgent task #${urgent.number} is waiting. At your next safe point: commit and push what's verified to ${branch}, then end with "RESULT: paused — <where you stopped>". Don't start anything new.`); say(`#${t.number}: urgent #${urgent.number} waiting, pause requested`); }
    } catch (e) { say(`#${t.number}: GitHub check failed (${e.message}); carrying on`); }
    // Quiet for 10 minutes with no RESULT and nothing to deliver: one nudge,
    // then, still silent 10 minutes later, end it as stalled.
    if (!finished && !closed && !pending.length && Date.now() - lastEvent > 10 * 60 * 1000) {
      if (!nudged) { nudged = true; lastEvent = Date.now(); say(`#${t.number}: quiet for 10 min, nudging`); send(`Task #${t.number}: if your background work is finished, complete the task (commit, push, open the pull request) and end with the RESULT line. If something is still running, say what and keep going.`); }
      else { say(`#${t.number}: still silent after a nudge; ending the run as stalled`); lastResult = lastResult || ''; finish(); }
    }
    if (!warned && Date.now() > deadline) { warned = true; pending.push(`Time limit reached for task #${t.number}. Commit and push what's verified, then end with a RESULT line.`); deadline = Date.now() + 10 * 60 * 1000; }
    else if (warned && Date.now() > deadline) { say(`#${t.number}: past its time limit; stopping it`); child.kill(); }
  }
  transcript.end();
  // Anything the run left going in its folder (a background build) is stopped
  // before the folder goes, so nothing is orphaned or holds files open.
  try {
    execFileSync('powershell', ['-NoProfile', '-Command', `Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -like '*${path.basename(WORK)}*${path.basename(tree)}*' -and $_.ProcessId -ne ${process.pid} } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }`], { stdio: 'ignore', windowsHide: true, timeout: 30000 });
  } catch {}

  const result = /RESULT:\s*(done|failed|paused)\b\s*(\S+)?[^\n]*/i.exec(lastResult.split('\n').filter(Boolean).pop() || '') || /RESULT:\s*(done|failed|paused)\b\s*(\S+)?[^\n]*/i.exec(lastResult);
  const summary = (result?.[0] || lastResult.slice(-300) || `the run exited with code ${code}`).trim();
  const minutes = Math.round((Date.now() - Date.parse(started)) / 60000);
  const entry = { agent: 'claude', attempt, at: iso(), minutes, turns };
  let prNumber = null;
  try { prNumber = JSON.parse(execFileSync('gh', ['pr', 'list', '--repo', gh.REPO, '--head', branch, '--state', 'all', '--json', 'number'], { encoding: 'utf8' }))[0]?.number ?? null; } catch {}
  try { clearTree(tree); } catch (e) { say(`#${t.number}: ${e.message}`); }

  if (result?.[1]?.toLowerCase() === 'paused') {
    setTask(t, 'assigned', { history: [...(t.state.history || []), { ...entry, result: 'paused' }] }, `Paused at a safe point for an urgent task (after ${minutes} min): ${summary}\nIt resumes from branch \`${branch}\` when Claude is free.`);
  } else if (result?.[1]?.toLowerCase() === 'done' && prNumber) {
    setTask(t, 'review', { pr: prNumber, history: [...(t.state.history || []), { ...entry, result: 'review' }] }, `Claude finished in ${minutes} min: ${summary}\nPR #${prNumber}. The coordinator merges it once every check passes.`);
  } else {
    const category = (result?.[1]?.toLowerCase() === 'failed' && result[2]) || (!finished && nudged ? 'stalled' : code !== 0 ? 'disconnected' : prNumber ? 'unknown' : 'no-change');
    setTask(t, 'failed', { lastFailure: category, history: [...(t.state.history || []), { ...entry, result: 'failed', category }] }, `Claude's attempt ${attempt} didn't finish (${category}, ${minutes} min): ${summary}`);
  }
  say(`#${t.number}: ${t.status} after ${minutes} min`);
}

do {
  if (fs.existsSync(path.join(WORK, 'paused'))) { say('paused (.work/agents/paused)'); if (ONCE) break; await sleep(CHECK_MS); continue; }
  let t;
  try { t = nextTask(); } catch (e) { say(`couldn't read the queue: ${e.message}`); if (ONCE) break; await sleep(CHECK_MS); continue; }
  if (!t) { if (ONCE) { say('nothing assigned to Claude'); break; } await sleep(CHECK_MS); continue; }
  try { await run(t); } catch (e) {
    // The dispatcher's own failure: the task goes back as it was (not an
    // attempt by the agent), and the dispatcher stops rather than churn.
    say(`#${t.number}: dispatcher failure: ${e.message}`);
    try { setTask(t, 'assigned', {}, `The dispatcher on the owner's PC hit its own problem before or around this run (${e.message.slice(0, 200)}). Not counted as an attempt; the task is waiting again.`); } catch {}
    break;
  }
} while (!ONCE);
