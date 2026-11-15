// Trims old Izuki build outputs from this checkout's Rust cache, the way the
// owner asked after the cache filled the drive (40+ GB of `izuki*` builds).
//
//   node tools/trim-build-cache.mjs           # report only
//   node tools/trim-build-cache.mjs --apply   # remove what it reported
//   node tools/trim-build-cache.mjs --target=../../src-tauri/target   # another checkout
//
// Only a src-tauri/target folder is touched (this checkout's unless
// --target names another), and only regenerable build output: `izuki*` /
// `libizuki*` files in target/<profile>/deps (or target/<triple>/<profile>/deps)
// older than --hours (default 2, so a build in progress is never cut), and the
// unused incremental folders. Dependencies' compiled code stays, so the next
// build doesn't start from nothing. Never source, never node_modules, and
// never anything a link inside the cache points at: links (symlinks,
// junctions) are skipped, and every path is checked to really sit inside
// the cache before it's touched.
import { readdirSync, lstatSync, realpathSync, rmSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
// --target=<another checkout>/src-tauri/target, e.g. the main checkout's from
// a worktree; anything that isn't a src-tauri/target folder is refused.
const given = process.argv.find((a) => a.startsWith('--target='))?.slice('--target='.length);
const target = given ? path.resolve(given) : path.resolve(here, '..', 'src-tauri', 'target');
if (!/[\\/]src-tauri[\\/]target$/i.test(target)) {
  console.error(`trim: refusing ${target}: only a src-tauri/target folder is trimmed`);
  process.exit(1);
}
const apply = process.argv.includes('--apply');
const hoursArg = process.argv.find((a) => a.startsWith('--hours='));
const hours = Math.max(1, Number(hoursArg?.split('=')[1]) || 2);
const cutoff = Date.now() - hours * 3600_000;

if (!existsSync(target)) {
  console.log(`trim: nothing to do (no ${path.relative(process.cwd(), target) || target})`);
  process.exit(0);
}
const root = realpathSync(target);
if (lstatSync(target).isSymbolicLink()) {
  console.error(`trim: refusing ${target}: it is a link, not the cache itself`);
  process.exit(1);
}

/** A real entry inside the cache: not a link, and its real path is under the cache. */
const inside = (p) => {
  let st;
  try { st = lstatSync(p); } catch { return null; }
  if (st.isSymbolicLink()) return null;
  let real;
  try { real = realpathSync(p); } catch { return null; }
  // ('' is the cache itself: measured, never a candidate.)
  const rel = path.relative(root, real);
  if (rel.startsWith('..') || path.isAbsolute(rel)) return null;
  return st;
};
const sizeOf = (p) => {
  let total = 0;
  const walk = (q) => {
    const st = inside(q);
    if (!st) return;
    if (st.isDirectory()) { for (const n of list(q)) walk(path.join(q, n)); } else total += st.size;
  };
  walk(p);
  return total;
};
/** When anything under `p` last changed (the folder itself included). */
const newest = (p) => {
  let latest = 0;
  const walk = (q) => {
    const st = inside(q);
    if (!st) return;
    latest = Math.max(latest, st.mtimeMs);
    if (st.isDirectory()) for (const n of list(q)) walk(path.join(q, n));
  };
  walk(p);
  return latest;
};
const gb = (n) => `${(n / 1024 ** 3).toFixed(2)} GB`;
/** A folder's entries, or none if it vanished meanwhile (another build or cleaner). */
const list = (dir) => { try { return readdirSync(dir); } catch { return []; } };
// A Rust build running anywhere on this PC (cargo or rustc): incremental
// folders aren't touched at all, however old they look.
const building = (() => {
  try {
    const out = process.platform === 'win32'
      ? execFileSync('tasklist', ['/fo', 'csv', '/nh'], { encoding: 'utf8', windowsHide: true })
      : execFileSync('ps', ['-A', '-o', 'comm='], { encoding: 'utf8' });
    return /(^|[\\/"\s])(cargo|rustc)(\.exe)?"?(,|\s|$)/im.test(out);
  } catch {
    return true; // can't tell: assume one is, and keep them
  }
})();
const dirIn = (p) => inside(p)?.isDirectory() ?? false;

const victims = [];
// Profile folders: target/<profile>, and target/<triple>/<profile> for a
// build with --target (e.g. target/x86_64-pc-windows-msvc/release).
const profiles = [];
for (const name of list(target)) {
  const dir = path.join(target, name);
  if (!dirIn(dir)) continue;
  if (dirIn(path.join(dir, 'deps')) || dirIn(path.join(dir, 'incremental'))) profiles.push(dir);
  else for (const sub of list(dir)) {
    const inner = path.join(dir, sub);
    if (dirIn(inner) && (dirIn(path.join(inner, 'deps')) || dirIn(path.join(inner, 'incremental')))) profiles.push(inner);
  }
}
for (const profileDir of profiles) {
  const deps = path.join(profileDir, 'deps');
  if (dirIn(deps)) {
    for (const name of list(deps)) {
      if (!/^(lib)?izuki[-_.]/i.test(name)) continue;
      const file = path.join(deps, name);
      const st = inside(file);
      if (st && st.mtimeMs < cutoff) victims.push({ file, size: st.isDirectory() ? sizeOf(file) : st.size });
    }
  }
  // The incremental folder only when nothing in it changed for --hours: a
  // build running right now (any profile) keeps its data.
  const incremental = path.join(profileDir, 'incremental');
  if (!building && dirIn(incremental) && newest(incremental) < cutoff) victims.push({ file: incremental, size: sizeOf(incremental) });
}
const total = victims.reduce((n, v) => n + v.size, 0);
console.log(`trim: cache ${gb(sizeOf(target))}; ${victims.length} old Izuki build outputs (${gb(total)}) older than ${hours} h${apply ? '' : ' — run with --apply to remove them'}`);
if (building) console.log('trim: a Rust build is running, so incremental folders are kept');
if (apply) {
  let removed = 0;
  for (const v of victims) {
    // Checked again right before: still a real entry inside the cache.
    if (!inside(v.file)) continue;
    rmSync(v.file, { recursive: true, force: true, maxRetries: 3, retryDelay: 200 });
    removed += v.size;
  }
  console.log(`trim: removed ${gb(removed)}`);
}
