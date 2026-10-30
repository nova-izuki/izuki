// Pack extension/ into the zip the website hands out.
//
// This existed only as somebody's hand-run command, and it showed: the
// shipped zip was three weeks stale and missing the files the side panel had
// started importing. A missing import doesn't degrade a module — it stops it
// loading at all, so the panel would have opened blank for everyone who
// downloaded it. Now it's a script, it refuses to pack a manifest that names
// a file that isn't there, and it lists what went in.
//
//   node scripts/pack-extension.mjs
import { createWriteStream } from 'node:fs';
import { readFile, readdir, stat, mkdir } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const from = path.join(root, 'extension');
const to = path.join(root, 'docs', 'extension', 'izuki-extension.zip');

async function walk(dir, base = '') {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const here = path.join(dir, entry.name);
    const name = base ? `${base}/${entry.name}` : entry.name;
    if (entry.isDirectory()) out.push(...(await walk(here, name)));
    else out.push({ file: here, name });
  }
  return out;
}

const files = await walk(from);
const names = new Set(files.map((f) => f.name));

// Everything the panel and the worker import has to be in the box.
const html = await readFile(path.join(from, 'sidepanel.html'), 'utf8');
const wanted = new Set();
for (const m of html.matchAll(/(?:src|href)="\.?\/?([\w./-]+\.(?:js|css|html))"/g)) wanted.add(m[1]);
for (const f of files.filter((f) => f.name.endsWith('.js'))) {
  const code = await readFile(f.file, 'utf8');
  for (const m of code.matchAll(/(?:from|import)\s*["']\.\/([\w./-]+)["']/g)) wanted.add(m[1]);
}
const manifest = JSON.parse(await readFile(path.join(from, 'manifest.json'), 'utf8'));
for (const m of JSON.stringify(manifest).matchAll(/"([\w./-]+\.(?:js|html|png))"/g)) wanted.add(m[1]);

const missing = [...wanted].filter((w) => !names.has(w));
if (missing.length) {
  console.error(`extension/ is missing files it refers to: ${missing.join(', ')}`);
  process.exit(1);
}

await mkdir(path.dirname(to), { recursive: true });
// PowerShell's Compress-Archive is on every Windows box and needs no package.
const list = files.map((f) => `'${f.file.replace(/'/g, "''")}'`).join(',');
await promisify(execFile)(
  'powershell.exe',
  ['-NoProfile', '-NonInteractive', '-Command',
   `$ErrorActionPreference='Stop'; $staging=Join-Path $env:TEMP 'izuki-extension'; ` +
   `if (Test-Path $staging) { Remove-Item -Recurse -Force -LiteralPath $staging }; ` +
   `New-Item -ItemType Directory -Path $staging | Out-Null; ` +
   `Copy-Item -Recurse -Force -Path (Join-Path '${from.replace(/'/g, "''")}' '*') -Destination $staging; ` +
   `Compress-Archive -Path $staging -DestinationPath '${to.replace(/'/g, "''")}' -Force; ` +
   `Remove-Item -Recurse -Force -LiteralPath $staging`],
  { windowsHide: true }
);

const { size } = await stat(to);
console.log(`extension packed: ${files.length} files, ${(size / 1024).toFixed(0)} KB`);
for (const f of files.filter((f) => !f.name.includes('/'))) console.log('  ', f.name);
void createWriteStream;
void list;
