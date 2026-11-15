// Trims old Izuki build outputs from this checkout's Rust cache, the way the
// owner asked after the cache filled the drive (40+ GB of `izuki*` builds).
//
//   node tools/trim-build-cache.mjs           # report only
//   node tools/trim-build-cache.mjs --apply   # remove what it reported
//   node tools/trim-build-cache.mjs --target=../../src-tauri/target   # another checkout
//
// Only a src-tauri/target folder is touched (this checkout's unless
// --target names another), and only regenerable build output: `izuki*` /
// `libizuki*` files in target/<profile>/deps older than --hours (default 2,
// so a build in progress is never cut), and the unused incremental folders.
// Dependencies' compiled code stays, so the next build doesn't start from
// nothing. Never source, never node_modules.
import { readdirSync, statSync, rmSync, existsSync } from 'node:fs';
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

const sizeOf = (p) => {
  let total = 0;
  const walk = (q) => {
    let st;
    try { st = statSync(q, { throwIfNoEntry: false }); } catch { return; }
    if (!st) return;
    if (st.isDirectory()) { for (const n of readdirSync(q)) walk(path.join(q, n)); } else total += st.size;
  };
  walk(p);
  return total;
};
const gb = (n) => `${(n / 1024 ** 3).toFixed(2)} GB`;

if (!existsSync(target)) {
  console.log(`trim: nothing to do (no ${path.relative(process.cwd(), target) || target})`);
  process.exit(0);
}
const victims = [];
for (const profile of readdirSync(target)) {
  const deps = path.join(target, profile, 'deps');
  if (existsSync(deps)) {
    for (const name of readdirSync(deps)) {
      if (!/^(lib)?izuki[-_.]/i.test(name)) continue;
      const file = path.join(deps, name);
      const st = statSync(file, { throwIfNoEntry: false });
      if (st && st.mtimeMs < cutoff) victims.push({ file, size: st.isDirectory() ? sizeOf(file) : st.size });
    }
  }
  const incremental = path.join(target, profile, 'incremental');
  if (existsSync(incremental)) victims.push({ file: incremental, size: sizeOf(incremental) });
}
const total = victims.reduce((n, v) => n + v.size, 0);
console.log(`trim: cache ${gb(sizeOf(target))}; ${victims.length} old Izuki build outputs (${gb(total)}) older than ${hours} h${apply ? '' : ' — run with --apply to remove them'}`);
if (apply) {
  for (const v of victims) rmSync(v.file, { recursive: true, force: true, maxRetries: 3, retryDelay: 200 });
  console.log(`trim: removed ${gb(total)}`);
}
