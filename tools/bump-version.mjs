// One command does the whole version bump, so a release cannot miss a file.
//
// docs/BUMP-CHECKLIST.md lists what a bump touches. Doing it by hand went wrong
// once: the phone build numbers were left behind, every other check still
// passed, and the release was one a phone would refuse to install. So the list
// lives here as code. Every edit is counted, a file whose line has moved is an
// error rather than a silent skip, nothing is written unless all of them
// worked, and the result is read back through check-versions.mjs before the
// command exits.
//
//   node tools/bump-version.mjs 1.0.227              write the whole bump
//   node tools/bump-version.mjs 1.0.227 --dry-run    show it, write nothing
//
// The pending docs/NEXT-RELEASE.md lines become docs/RELEASE-<version>.md and
// the list is cleared, the same two steps the checklist's bump commit does.
// Those lines are kept as a short list so nothing is lost; rewrite the file
// into prose if the release body should read like the earlier ones.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { checkVersions, expectedBuild } from './check-versions.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

// Every file a bump writes, in the order the checklist lists them.
export const VERSION_FILES = [
  'package.json',
  'src-tauri/tauri.conf.json',
  'src-tauri/Cargo.toml',
  'src-tauri/Cargo.lock',
  'android/app/build.gradle',
  'ios/App/App.xcodeproj/project.pbxproj',
];

// The pending list the bump folds into the release notes, then clears.
export const PENDING = 'docs/NEXT-RELEASE.md';

export const notesName = (version) => `RELEASE-${version}.md`;

function compare(a, b) {
  const parts = (v) => String(v).split('.').map(Number);
  const [x, y] = [parts(a), parts(b)];
  return x[0] - y[0] || x[1] - y[1] || x[2] - y[2];
}

// The whole bump, as a pure function of the files' text, so it can be pinned
// by a test without copying the repository around.
//
//   sources: { 'package.json': text, 'src-tauri/Cargo.lock': text, ... }
//   options: { version }
// returns: { previous, version, build, sources, notesFile, problems }
export function bumpSources(sources, options = {}) {
  const version = String(options.version ?? '').trim();
  const problems = [];
  const fail = (m) => problems.push(m);
  const out = { ...sources };

  if (!/^\d+\.\d+\.\d+$/.test(version)) return { problems: [`"${version}" is not a version like 1.0.227`] };
  let previous;
  try {
    previous = JSON.parse(out['package.json'] ?? '{}').version;
  } catch {
    return { problems: ['package.json is not readable JSON'] };
  }
  if (!previous) return { problems: ['package.json has no version'] };
  const build = expectedBuild(version);
  if (!Number.isFinite(build)) return { problems: [`${version} has no phone build number`] };
  if (compare(version, previous) <= 0) fail(`${version} is not newer than the version in the tree (${previous})`);

  // JSON: every field still holding the current version, then read it back so a
  // rewrite of something else in the file cannot pass unnoticed.
  for (const name of ['package.json', 'src-tauri/tauri.conf.json']) {
    const text = String(out[name] ?? '');
    if (!text) {
      fail(`${name}: not found`);
      continue;
    }
    let bumped = 0;
    const next = text.replace(/((?:"version")\s*:\s*")([^"]+)(")/g, (all, lead, value, tail) => {
      if (value !== previous) return all;
      bumped += 1;
      return `${lead}${version}${tail}`;
    });
    if (!bumped) {
      fail(`${name}: no "version": "${previous}" field to bump`);
      continue;
    }
    let readBack;
    try {
      readBack = JSON.parse(next).version;
    } catch {
      fail(`${name}: would not be JSON after the bump`);
      continue;
    }
    if (readBack !== version) fail(`${name}: reads ${readBack} after the bump, not ${version}`);
    else out[name] = next;
  }

  // Cargo.toml: the [package] table's own version, never a dependency's.
  {
    const name = 'src-tauri/Cargo.toml';
    const text = String(out[name] ?? '');
    if (!text) fail(`${name}: not found`);
    else {
      const head = text.split(/\n\[(?!package\])/)[0];
      const line = /^version = "[^"]+"/m;
      const lines = head.split(/\r?\n/).filter((l) => line.test(l)).length;
      if (!line.test(head) || lines !== 1) fail(`${name}: expected one [package] version line, found ${lines}`);
      else out[name] = head.replace(line, `version = "${version}"`) + text.slice(head.length);
    }
  }

  // Cargo.lock: the izuki package's entry. Reading it as the new version keeps
  // `cargo --locked` happy without a network call.
  {
    const name = 'src-tauri/Cargo.lock';
    const text = String(out[name] ?? '');
    const entry = /(name = "izuki"\r?\nversion = ")[^"]+(")/;
    if (!text) fail(`${name}: not found`);
    else if ((text.match(/name = "izuki"\r?\nversion = /g) ?? []).length !== 1) fail(`${name}: expected exactly one izuki package entry`);
    else if (!entry.test(text)) fail(`${name}: the izuki entry has no version line`);
    else out[name] = text.replace(entry, (all, lead, tail) => `${lead}${version}${tail}`);
  }

  // Android: the version and the build number that lets a phone replace the
  // copy it already has.
  {
    const name = 'android/app/build.gradle';
    const text = String(out[name] ?? '');
    if (!text) fail(`${name}: not found`);
    else {
      const code = /\bversionCode \d+/g;
      const label = /\bversionName "[^"]+"/g;
      const codes = (text.match(code) ?? []).length;
      const labels = (text.match(label) ?? []).length;
      if (codes !== 1) fail(`${name}: expected one versionCode, found ${codes}`);
      if (labels !== 1) fail(`${name}: expected one versionName, found ${labels}`);
      if (codes === 1 && labels === 1) {
        out[name] = text.replace(code, `versionCode ${build}`).replace(label, `versionName "${version}"`);
      }
    }
  }

  // iOS: both build configurations, each with its marketing version and build
  // number. A missing pair is an error, not half a bump.
  {
    const name = 'ios/App/App.xcodeproj/project.pbxproj';
    const text = String(out[name] ?? '');
    const marketing = /MARKETING_VERSION = [^;]+;/g;
    const project = /CURRENT_PROJECT_VERSION = [^;]+;/g;
    const a = (text.match(marketing) ?? []).length;
    const b = (text.match(project) ?? []).length;
    if (!text) fail(`${name}: not found`);
    else if (!a) fail(`${name}: no MARKETING_VERSION to bump`);
    else if (!b) fail(`${name}: no CURRENT_PROJECT_VERSION to bump`);
    else if (a !== b) fail(`${name}: ${a} MARKETING_VERSION lines but ${b} CURRENT_PROJECT_VERSION lines`);
    else out[name] = text.replace(marketing, `MARKETING_VERSION = ${version};`).replace(project, `CURRENT_PROJECT_VERSION = ${build};`);
  }

  // Release notes, folded from the pending list, and the list cleared.
  const notesFile = `docs/${notesName(version)}`;
  {
    const list = String(out[PENDING] ?? '');
    if (!list) fail(`${PENDING}: not found`);
    else {
      const eol = list.includes('\r\n') ? '\r\n' : '\n';
      const pending = [];
      const kept = [];
      let open = false;
      for (const line of list.split(/\r?\n/)) {
        if (/^- /.test(line)) {
          pending.push(line.slice(2).trim());
          open = true;
          continue;
        }
        if (open && line.trim()) {
          pending[pending.length - 1] += ` ${line.trim()}`;
          continue;
        }
        if (open) open = false;
        kept.push(line);
      }
      if (!pending.length) fail(`${PENDING} has no pending lines: the release notes would be empty`);
      if (out[notesFile] !== undefined) fail(`${notesFile} already exists`);
      if (pending.length && out[notesFile] === undefined) {
        out[PENDING] = `${kept.join(eol).replace(/(\r?\n)+$/, '')}${eol}`;
        out[notesFile] = [
          `# Izuki ${version}`,
          '',
          'What changed in this release:',
          '',
          ...pending.map((p) => `- ${p.replace(/\s*\[(?:freebuff|codex|claude)\]\s*$/i, '')}`),
          '',
        ].join(eol);
      }
    }
  }

  // Say so now rather than at the release gate: the tree this wrote has to pass
  // the same check CI runs.
  if (!problems.length) {
    const check = checkVersions(out, { release: true, notes: (n) => out[`docs/${n}`] ?? null });
    for (const p of check.problems) fail(`after the bump: ${p}`);
  }

  return { previous, version, build, sources: out, notesFile: problems.length ? null : notesFile, problems };
}

const isMain = process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;
if (isMain) {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const version = args.find((a) => !a.startsWith('--'));
  if (!version) {
    console.error('usage: node tools/bump-version.mjs <version> [--dry-run]');
    process.exit(2);
  }
  const sources = {};
  const missing = [];
  for (const p of [...VERSION_FILES, PENDING]) {
    try {
      sources[p] = fs.readFileSync(path.join(ROOT, p), 'utf8');
    } catch {
      missing.push(p);
    }
  }
  if (missing.length) {
    for (const p of missing) console.error(`FAIL ${p} is missing`);
    console.error('Nothing was written.');
    process.exit(1);
  }
  const result = bumpSources(sources, { version });
  if (result.problems.length) {
    for (const p of result.problems) console.error(`FAIL ${p}`);
    console.error('Nothing was written.');
    process.exit(1);
  }
  const changed = Object.keys(result.sources).filter((p) => result.sources[p] !== sources[p]);
  for (const p of changed) console.log(`${sources[p] === undefined ? 'create' : 'update'}  ${p}`);
  if (dryRun) {
    console.log(`Would bump ${result.previous} -> ${result.version} (build ${result.build}) in ${changed.length} files. Nothing was written (--dry-run).`);
    process.exit(0);
  }
  for (const p of changed) fs.writeFileSync(path.join(ROOT, p), result.sources[p], 'utf8');
  console.log(`Bumped ${result.previous} -> ${result.version} (build ${result.build}) in ${changed.length} files, with notes in ${result.notesFile}.`);
  console.log(`Next: npm run test:versions, then node tools/check-versions.mjs --release --after <latest published>.`);
}
