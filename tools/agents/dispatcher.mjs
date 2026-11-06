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
// When Claude can't work (a usage limit, signed out, the service down), the
// task goes back unchanged and the dispatcher waits until the reset
// (.work/agents/unavailable.json). Its log: .work/agents/dispatcher.log.
//
// Freebuff isn't dispatched here: it has no programmatic interface (see
// docs/AGENTS-BRIDGE.md). Its tasks wait in the queue until it takes them.
import { spawn, execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { describe, writeState, unavailable, counts, PRIORITY } from './scheduler.mjs';
import * as gh from './github.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..', '..');
const WORK = path.join(ROOT, '.work', 'agents');
const ONCE = process.argv.includes('--once');
const HEARTBEAT_MS = 2 * 60 * 1000;
const CHECK_MS = 60 * 1000;
const LIMIT_MS = Number(process.env.BRIDGE_TASK_LIMIT_MIN || 120) * 60 * 1000;
const iso = () => new Date().toISOString();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const LOG = path.join(WORK, 'dispatcher.log');
const OUT = path.join(WORK, 'unavailable.json');
const PAUSE = path.join(WORK, 'paused');
fs.mkdirSync(WORK, { recursive: true });
/** Said on screen and in its own log, which stays small (over 1 MB it becomes dispatcher.log.1). */
const say = (...a) => {
  console.log(`[${iso().slice(11, 19)}]`, ...a);
  try { if (fs.statSync(LOG).size > 1024 * 1024) fs.renameSync(LOG, `${LOG}.1`); } catch { /* no log yet */ }
  try { fs.appendFileSync(LOG, `${iso()} ${a.join(' ')}\n`); } catch { /* the log is optional */ }
};
process.on('uncaughtException', (e) => { say(`dispatcher crashed: ${e?.stack || e}`); process.exit(1); });
process.on('unhandledRejection', (e) => { say(`dispatcher crashed: ${e?.stack || e}`); process.exit(1); });

// One dispatcher at a time: the lock file is created exclusively, so two
// starting together can't both take it. A lock left by a dead dispatcher is
// replaced once. After a restart its process number may belong to something
// else, so a live process holds the lock only if it's running this script.
const LOCK = path.join(WORK, 'dispatcher.lock');
function isDispatcher(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try { process.kill(pid, 0); } catch { return false; }
  try {
    const cmd = execFileSync('powershell', ['-NoProfile', '-Command', `(Get-CimInstance Win32_Process -Filter "ProcessId=${pid}").CommandLine`], { encoding: 'utf8', windowsHide: true, timeout: 30000 });
    return /dispatcher\.mjs/i.test(cmd);
  } catch { return true; } // can't tell: assume it is, so two never run at once
}
for (let tries = 0; ; tries++) {
  try { fs.writeFileSync(LOCK, String(process.pid), { flag: 'wx' }); break; } catch (e) {
    if (e.code !== 'EEXIST' || tries) { say(`another dispatcher holds the lock; nothing to do`); process.exit(0); }
    const held = fs.readFileSync(LOCK, 'utf8');
    const other = Number(held);
    if (isDispatcher(other)) { say(`another dispatcher (pid ${other}) is running; nothing to do`); process.exit(0); }
    // Checking takes a moment: another starter may have replaced the stale
    // lock meanwhile. Only the same stale lock is removed, never a fresh one.
    let now = null;
    try { now = fs.readFileSync(LOCK, 'utf8'); } catch { /* gone: try to take it */ }
    if (now !== null && now !== held) { say('another dispatcher just took the lock; nothing to do'); process.exit(0); }
    if (now !== null) fs.unlinkSync(LOCK);
  }
}
process.on('exit', () => { try { if (fs.readFileSync(LOCK, 'utf8') === String(process.pid)) fs.unlinkSync(LOCK); } catch {} });
// A pause that only waited for new dispatcher code ends when one starts.
try { if (/restart-to-resume/.test(fs.readFileSync(PAUSE, 'utf8'))) { fs.unlinkSync(PAUSE); say('removed the pause that was waiting for this restart'); } } catch { /* no pause */ }
// The code it started with: when the bridge's files change on disk (an
// update), it stops between tasks, so a task never runs on outdated logic.
const SOURCES = ['dispatcher.mjs', 'scheduler.mjs', 'github.mjs'].map((f) => path.join(ROOT, 'tools', 'agents', f));
const codeStamp = () => createHash('sha256').update(SOURCES.map((f) => { try { return fs.readFileSync(f, 'utf8'); } catch { return ''; } }).join('\0')).digest('hex');
const STAMP = codeStamp();

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
  // Work left in it (an interrupted attempt) is committed and pushed to its
  // own branch first, never thrown away: if saving fails, this throws and the
  // folder stays for the next try.
  let branch = '';
  try { branch = execFileSync('git', ['-C', tree, 'rev-parse', '--abbrev-ref', 'HEAD'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch { /* not a worktree any more */ }
  {
    if (branch.startsWith('agent/')) {
      if (execFileSync('git', ['-C', tree, 'status', '--porcelain'], { encoding: 'utf8' }).trim()) {
        execFileSync('git', ['-C', tree, 'add', '-A'], { stdio: 'ignore' });
        execFileSync('git', ['-C', tree, 'commit', '-m', 'WIP: work left by an interrupted attempt (saved by the dispatcher)'], { stdio: 'ignore' });
      }
      // Only real work is pushed: commits beyond the development branch.
      const ahead = Number(execFileSync('git', ['-C', tree, 'rev-list', '--count', `origin/${gh.DEV_BRANCH}..HEAD`], { encoding: 'utf8' }).trim());
      if (ahead > 0) {
        execFileSync('git', ['-C', tree, 'push', 'origin', branch], { stdio: 'ignore' });
        say(`saved what was in ${path.basename(tree)} to ${branch} (${ahead} commit(s))`);
      }
    }
  }
  const link = path.join(tree, 'node_modules');
  try { fs.lstatSync(link); execFileSync('cmd', ['/c', 'rmdir', link], { stdio: 'ignore' }); } catch { /* no link */ }
  if (fs.existsSync(link)) throw new Error(`couldn't remove the package link in ${tree} safely`);
  try { execFileSync('git', ['-C', ROOT, 'worktree', 'remove', '--force', tree], { stdio: 'ignore' }); } catch { /* not registered */ }
  try { execFileSync('git', ['-C', ROOT, 'worktree', 'prune'], { stdio: 'ignore' }); } catch {}
  if (fs.existsSync(tree)) fs.rmSync(tree, { recursive: true, force: true });
}

/**
 * The processes under `root` right now, with their start times (so a
 * process number reused later is never mistaken for one of them).
 */
function descendants(root) {
  const out = execFileSync('powershell', ['-NoProfile', '-Command', `$all = Get-CimInstance Win32_Process | Select-Object ProcessId, ParentProcessId, CreationDate; $byId = @{}; foreach ($p in $all) { $byId[[int]$p.ProcessId] = $p }; $parents = @(${root}); $found = @(); do { $next = @($all | Where-Object { $parents -contains $_.ParentProcessId -and $byId.ContainsKey([int]$_.ParentProcessId) -and $_.CreationDate -ge $byId[[int]$_.ParentProcessId].CreationDate }); $found += $next; $parents = @($next | ForEach-Object { $_.ProcessId }) } while ($parents.Count -gt 0); $found | Select-Object ProcessId, @{n='Start';e={$_.CreationDate.ToString('o')}} | ConvertTo-Json -Compress`], { encoding: 'utf8', windowsHide: true, timeout: 30000 }).trim();
  if (!out) return [];
  const list = JSON.parse(out);
  return (Array.isArray(list) ? list : [list]).map((p) => ({ pid: p.ProcessId, start: p.Start }));
}

/** Stop the recorded processes that are still the same processes (same start time). */
function stopRecorded(recorded) {
  if (!recorded.size) return 0;
  const want = [...recorded.values()];
  const script = `$want = '${JSON.stringify(want).replace(/'/g, "''")}' | ConvertFrom-Json; $n = 0; foreach ($w in $want) { $p = Get-CimInstance Win32_Process -Filter "ProcessId=$($w.pid)" -ErrorAction SilentlyContinue; if ($p -and $p.CreationDate.ToString('o') -eq $w.start) { Stop-Process -Id $w.pid -Force -ErrorAction SilentlyContinue; $n++ } }; $n`;
  return Number(execFileSync('powershell', ['-NoProfile', '-Command', script], { encoding: 'utf8', windowsHide: true, timeout: 30000 }).trim()) || 0;
}

/** A failure of the dispatcher itself (before the agent ran): never counted as the agent's. */
class SetupError extends Error {}

function nextTask() {
  return gh.listTasks().map(describe)
    .filter((t) => t.open && t.status === 'assigned' && t.state.agent === 'claude' && gh.trusted(t.author))
    .sort((a, b) => PRIORITY[a.priority] - PRIORITY[b.priority] || a.number - b.number)[0];
}

async function run(t) {
  const history = t.state.history || [];
  // A run cut short (paused for an urgent task, or Claude out of usage) picks
  // up from its branch; neither counts as an attempt.
  const resuming = ['paused', 'unavailable'].includes(history.at(-1)?.result) && t.state.branch;
  const attempt = history.filter(counts).length + 1;
  const branch = resuming ? t.state.branch : `agent/claude-${t.number}-${attempt}`;
  const tree = path.join(WORK, `task-${t.number}`);
  say(`#${t.number} (${t.title}): ${resuming ? 'resuming' : 'starting'} attempt ${attempt} on ${branch}`);
  try {
    execFileSync('git', ['-C', ROOT, 'fetch', 'origin', gh.DEV_BRANCH], { stdio: 'ignore' });
    clearTree(tree);
    let base = `origin/${gh.DEV_BRANCH}`;
    if (resuming) {
      try { execFileSync('git', ['-C', ROOT, 'fetch', 'origin', branch], { stdio: 'ignore' }); base = `origin/${branch}`; } catch { say(`#${t.number}: ${branch} isn't on GitHub; starting from ${gh.DEV_BRANCH}`); }
    }
    execFileSync('git', ['-C', ROOT, 'worktree', 'add', '-B', branch, tree, base], { stdio: 'ignore' });
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
  // Ends once its output is closed (so nothing is still in flight), with the
  // exit code or the signal. A launch that fails is the dispatcher's problem.
  // If a leftover background process keeps the pipes open after Claude
  // itself exits, 'close' would never come: 5 s after 'exit', the pipes are
  // let go and the run counts as ended.
  const ended = new Promise((resolve) => {
    let grace = null;
    const done = (value) => { clearTimeout(grace); resolve(value); };
    child.on('close', (code, signal) => done({ code, signal }));
    child.on('error', (error) => done({ code: null, signal: null, error }));
    child.on('exit', (code, signal) => {
      grace = setTimeout(() => { child.stdout.destroy(); child.stderr.destroy(); done({ code, signal }); }, 5000);
    });
  });
  const send = (text) => { if (!child.stdin.destroyed) child.stdin.write(JSON.stringify({ type: 'user', message: { role: 'user', content: [{ type: 'text', text }] } }) + '\n'); };
  child.stdin.on('error', () => { /* the run ended; nothing more to send */ });
  send(task);

  // The run is finished only when the agent says so (its RESULT line). A turn
  // that ends without one is a checkpoint: the agent may be waiting for its
  // own background work (a build), whose notices start its next turn.
  let pending = [], lastResult = '', turns = 0, buffer = '', closed = false, paused = false, finished = false;
  let lastEvent = Date.now(), nudged = false, resetsAt = 0, outage = null;
  const RESULT_LINE = /RESULT:\s*(done|failed|paused)\b/i;
  // Appended: a resumed run keeps the same attempt number and its transcript.
  const transcript = fs.createWriteStream(path.join(WORK, `task-${t.number}-${attempt}.jsonl`), { flags: 'a' });
  const finish = () => { if (!closed) { closed = true; child.stdin.end(); } };
  child.stdout.on('data', (chunk) => {
    buffer += chunk;
    lastEvent = Date.now();
    let i;
    while ((i = buffer.indexOf('\n')) >= 0) {
      const line = buffer.slice(0, i); buffer = buffer.slice(i + 1);
      transcript.write(line + '\n');
      let event; try { event = JSON.parse(line); } catch { continue; }
      // The service turned it away (a usage limit): when that resets.
      if (event.type === 'rate_limit_event' && event.rate_limit_info?.status === 'rejected') resetsAt = Number(event.rate_limit_info.resetsAt) * 1000 || 0;
      if (event.type === 'result') {
        turns++;
        lastResult = String(event.result || '');
        // Claude couldn't work at all (a usage limit, signed out, the service
        // down): end the run now, no nudge. It isn't the task's failure.
        outage = outage || unavailable(event, Date.now(), resetsAt);
        if (outage) finish();
        else if (pending.length) { const u = pending.shift(); say(`#${t.number}: checkpoint, delivering an update`); send(u); }
        else if (RESULT_LINE.test(lastResult)) { finished = true; finish(); }
      }
    }
  });
  child.stderr.on('data', (d) => transcript.write(`[stderr] ${d}`));

  let since = started, beat = Date.now(), deadline = Date.now() + LIMIT_MS, warned = false;
  // Its process tree, recorded each minute while Claude is alive.
  const recorded = new Map();
  const record = () => { try { for (const p of descendants(child.pid)) recorded.set(`${p.pid}@${p.start}`, p); } catch (e) { say(`#${t.number}: couldn't list its processes (${String(e.message).split('\n')[0]})`); } };
  let exit = null;
  while (!exit) {
    exit = await Promise.race([ended, sleep(CHECK_MS).then(() => null)]);
    if (exit) break;
    record();
    try {
      if (Date.now() - beat >= HEARTBEAT_MS) { setTask(t, null, { heartbeat: iso() }); beat = Date.now(); }
      for (const u of updates(t, since)) { since = u.at; pending.push(`Update from the coordinator for task #${t.number}: ${u.text}`); say(`#${t.number}: update queued for the next checkpoint`); }
      // An urgent task waiting for Claude (queued for Claude or either agent,
      // or already assigned, its dependencies done): pause this one at a safe
      // point, never mid-operation.
      const all = paused || t.priority === 'urgent' ? [] : gh.listTasks().map(describe);
      const done = new Set(all.filter((x) => x.status === 'done').map((x) => x.number));
      const urgent = all.find((x) => x.open && x.number !== t.number && x.priority === 'urgent' && gh.trusted(x.author) && x.deps.every((d) => done.has(d))
        && ((x.status === 'assigned' && x.state.agent === 'claude') || (x.status === 'queued' && ['claude', 'any'].includes(x.agent))));
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
  if (exit.error) { clearTree(tree); throw new SetupError(`Claude Code didn't start: ${exit.error.message}`); }
  const code = exit.code ?? (exit.signal ? `signal ${exit.signal}` : 'unknown');
  // Anything the run left going (a background build) is stopped before its
  // folder goes, so nothing is orphaned or holds files open: the processes
  // recorded under Claude while it ran, plus anything whose command line
  // names the task's folder (started in the last minute, say).
  try {
    const stopped = stopRecorded(recorded);
    if (stopped) say(`#${t.number}: stopped ${stopped} process(es) the run left going`);
  } catch (e) { say(`#${t.number}: couldn't stop its leftover processes (${String(e.message).split('\n')[0]})`); }
  try {
    execFileSync('powershell', ['-NoProfile', '-Command', `Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -like '*${path.basename(WORK)}*${path.basename(tree)}*' -and $_.ProcessId -ne ${process.pid} } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }`], { stdio: 'ignore', windowsHide: true, timeout: 30000 });
  } catch (e) { say(`#${t.number}: couldn't search for processes in its folder (${String(e.message).split('\n')[0]})`); }

  const result = /RESULT:\s*(done|failed|paused)\b\s*(\S+)?[^\n]*/i.exec(lastResult.split('\n').filter(Boolean).pop() || '') || /RESULT:\s*(done|failed|paused)\b\s*(\S+)?[^\n]*/i.exec(lastResult);
  const summary = (result?.[0] || lastResult.slice(-300) || `the run exited with code ${code}`).trim();
  const minutes = Math.round((Date.now() - Date.parse(started)) / 60000);
  const entry = { agent: 'claude', attempt, at: iso(), minutes, turns };
  let prNumber = null;
  try { prNumber = JSON.parse(execFileSync('gh', ['pr', 'list', '--repo', gh.REPO, '--head', branch, '--state', 'all', '--json', 'number'], { encoding: 'utf8' }))[0]?.number ?? null; } catch {}
  try { clearTree(tree); } catch (e) { say(`#${t.number}: ${e.message}`); }

  if (outage) {
    // Back to waiting, as it was: no attempt, no failure, and nothing more
    // for Claude until the reset (the file keeps that across a restart).
    const until = new Date(outage.until).toISOString();
    try { fs.writeFileSync(OUT, JSON.stringify({ reason: outage.reason, until, task: t.number, detail: outage.detail, at: iso() }, null, 2)); } catch (e) { say(`couldn't record the outage (${e.message})`); }
    const why = { 'usage-limit': 'its usage limit was reached', 'signed-out': 'Claude Code is signed out', service: "Claude's service was down" }[outage.reason];
    setTask(t, 'assigned', { branch, history: [...(t.state.history || []), { ...entry, result: 'unavailable', reason: outage.reason, until }] }, `Claude couldn't work on this after ${minutes} min: ${why} ("${outage.detail}"). Not counted as an attempt. It continues from \`${branch}\` after ${until.slice(0, 16).replace('T', ' ')} UTC.`);
  } else if (result?.[1]?.toLowerCase() === 'paused') {
    setTask(t, 'assigned', { branch, history: [...(t.state.history || []), { ...entry, result: 'paused' }] }, `Paused at a safe point for an urgent task (after ${minutes} min): ${summary}\nIt resumes from branch \`${branch}\` when Claude is free.`);
  } else if (result?.[1]?.toLowerCase() === 'done' && prNumber) {
    setTask(t, 'review', { pr: prNumber, history: [...(t.state.history || []), { ...entry, result: 'review' }] }, `Claude finished in ${minutes} min: ${summary}\nPR #${prNumber}. The coordinator merges it once every check passes.`);
  } else {
    const category = (result?.[1]?.toLowerCase() === 'failed' && result[2]) || (!finished && nudged ? 'stalled' : exit.code !== 0 ? 'disconnected' : prNumber ? 'unknown' : 'no-change');
    setTask(t, 'failed', { lastFailure: category, history: [...(t.state.history || []), { ...entry, result: 'failed', category }] }, `Claude's attempt ${attempt} didn't finish (${category}, ${minutes} min): ${summary}`);
  }
  say(`#${t.number}: ${t.status} after ${minutes} min`);
}

/** Keeps the newest 20 run transcripts; older ones go. */
function prune() {
  try {
    const files = fs.readdirSync(WORK).filter((f) => /^task-\d+-\d+\.jsonl$/.test(f)).map((f) => ({ f, at: fs.statSync(path.join(WORK, f)).mtimeMs })).sort((a, b) => b.at - a.at);
    for (const { f } of files.slice(20)) fs.unlinkSync(path.join(WORK, f));
  } catch (e) { say(`couldn't prune old transcripts (${e.message})`); }
}

// A waiting state is said once, not every minute.
let said = '';
const once = (key, text) => { if (said !== key) { said = key; say(text); } };
prune();
do {
  if (codeStamp() !== STAMP) { say('the bridge code changed on disk; stopping so the new code is used. Start it again (the scheduled task does that by itself).'); break; }
  if (fs.existsSync(PAUSE)) { once('paused', 'paused (.work/agents/paused)'); if (ONCE) break; await sleep(CHECK_MS); continue; }
  let out = null;
  try { out = JSON.parse(fs.readFileSync(OUT, 'utf8')); } catch { /* none */ }
  if (out && Date.parse(out.until) > Date.now()) { once(`out ${out.until}`, `Claude is unavailable (${out.reason}) until ${out.until}; waiting`); if (ONCE) break; await sleep(CHECK_MS); continue; }
  if (out) { try { fs.unlinkSync(OUT); } catch {} say(`Claude should be available again (${out.reason} ended ${out.until})`); }
  let t;
  try { t = nextTask(); } catch (e) { say(`couldn't read the queue: ${e.message}`); if (ONCE) break; await sleep(CHECK_MS); continue; }
  if (!t) { once('empty', 'nothing assigned to Claude'); if (ONCE) break; await sleep(CHECK_MS); continue; }
  said = '';
  try { await run(t); } catch (e) {
    // The dispatcher's own failure: the task goes back as it was (not an
    // attempt by the agent), and the dispatcher stops rather than churn.
    say(`#${t.number}: dispatcher failure: ${e.message}`);
    try { setTask(t, 'assigned', {}, `The dispatcher on the owner's PC hit its own problem before or around this run (${e.message.slice(0, 200)}). Not counted as an attempt; the task is waiting again.`); } catch {}
    break;
  }
  prune();
} while (!ONCE);
