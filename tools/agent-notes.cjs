#!/usr/bin/env node
// Read Izuki's own notes about what kept going wrong (`docs/AGENT-NOTES.md`).
//
// The app writes one JSON line per problem to %APPDATA%\Izuki\agent-notes.jsonl
// and never shows it. This turns that file into the short list whoever fixes
// Izuki actually needs: what happened, which part of the app, how often, and
// which build it came from.
//
//   node tools/agent-notes.cjs [--days 14] [--top 25] [--json] [--file <path>]
//
// Nothing here reads anything private: the app scrubs each note before it is
// written, and this only prints what is in the file.
const fs = require('fs');
const os = require('os');
const path = require('path');

const args = process.argv.slice(2);
const flag = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};

const roaming = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
const file = flag('--file', path.join(roaming, 'Izuki', 'agent-notes.jsonl'));
const days = Number(flag('--days', 14)) || 14;
const top = Number(flag('--top', 25)) || 25;

if (!fs.existsSync(file)) {
  console.log(`No notes yet — ${file}`);
  console.log('Izuki writes one whenever something in the app goes wrong or looks clumsy.');
  process.exit(0);
}

const rows = fs.readFileSync(file, 'utf8')
  .split('\n')
  .filter(Boolean)
  .map((line) => { try { return JSON.parse(line); } catch { return null; } })
  .filter((row) => row && typeof row.what === 'string');

const since = Date.now() - days * 86400000;
const recent = rows.filter((row) => {
  const at = Date.parse(row.at);
  return Number.isFinite(at) ? at >= since : true;
});

if (args.includes('--json')) {
  console.log(JSON.stringify(recent, null, 1));
  process.exit(0);
}

const groups = new Map();
for (const row of recent) {
  const key = `${row.area || 'app'}\u0000${row.what}`;
  const seen = groups.get(key) || {
    area: row.area || 'app',
    what: row.what,
    hint: row.hint || '',
    count: 0,
    last: row.at,
    version: row.version || '',
  };
  seen.count += 1;
  if (String(row.at) >= String(seen.last)) { seen.last = row.at; seen.version = row.version || seen.version; seen.hint = row.hint || seen.hint; }
  groups.set(key, seen);
}

const list = [...groups.values()].sort((a, b) => b.count - a.count || (a.last < b.last ? 1 : -1));

console.log(`Izuki's own notes — ${recent.length} in the last ${days} day${days === 1 ? '' : 's'}, ${list.length} distinct\n`);
if (!list.length) console.log('  (nothing went wrong in this window)');
for (const g of list.slice(0, top)) {
  console.log(`  ${String(g.count).padStart(4)}×  ${g.area}: ${g.what}`);
  if (g.hint) console.log(`         → ${g.hint}`);
  console.log(`         last ${g.last}${g.version ? ` · v${g.version}` : ''}`);
}
if (list.length > top) console.log(`\n  … ${list.length - top} more distinct notes (--top to see them)`);
console.log(`\nfile: ${file}`);
