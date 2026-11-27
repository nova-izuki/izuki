// Pins the one-command bump: it writes every file docs/BUMP-CHECKLIST.md
// names, moves the phone build numbers with the version, folds the pending
// list into real release notes, keeps each file's line endings, and refuses
// instead of half-writing when something in the tree has moved.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { bumpSources, VERSION_FILES, PENDING } from './bump-version.mjs';
import { checkVersions } from './check-versions.mjs';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

const LINES = [
  '- Idle downloads start by themselves, only when you said yes. [Freebuff]',
  '- Helpers left behind are closed on their own switch. [Freebuff]',
];

// A tree shaped like this repository at 1.0.226, with today's pending list.
const fixture = ({ version = '1.0.226', build = '226', eol = '\n', lock = version, ios = [build, build], pending = LINES } = {}) => {
  const files = {
    'package.json': `{\n  "name": "izuki",\n  "version": "${version}",\n  "private": true\n}\n`,
    'src-tauri/tauri.conf.json': `{\n  "productName": "Izuki",\n  "version": "${version}",\n  "bundle": {\n    "active": true\n  }\n}\n`,
    'src-tauri/Cargo.toml': `[package]\nname = "izuki"\nversion = "${version}"\nedition = "2021"\n\n[lib]\nname = "izuki_lib"\n\n[dependencies]\nserde = { version = "1.0.200", features = ["derive"] }\n`,
    'src-tauri/Cargo.lock': `version = 4\n\n[[package]]\nname = "izuki"\nversion = "${lock}"\n\n[[package]]\nname = "serde"\nversion = "1.0.200"\n`,
    'android/app/build.gradle': `android {\n    defaultConfig {\n        versionCode ${build}\n        versionName "${version}"\n    }\n}\n`,
    'ios/App/App.xcodeproj/project.pbxproj': ['Debug', 'Release']
      .map((c) => `\t\t${c} = {\n\t\t\tMARKETING_VERSION = ${version};\n\t\t\tCURRENT_PROJECT_VERSION = ${ios.shift() ?? build};\n\t\t};`)
      .join('\n') + '\n',
    [PENDING]: `# Waiting for the next release\n\nCodex and Freebuff: add one line per change you pushed.\n\n${pending.join('\n')}\n`,
  };
  for (const k of Object.keys(files)) files[k] = files[k].replace(/\n/g, eol);
  return files;
};

const clean = (result, what) => assert.deepEqual(result.problems, [], `${what}: ${JSON.stringify(result.problems)}`);
const refused = (result, pattern, what) =>
  assert.ok(
    result.problems.some((p) => pattern.test(p)),
    `${what}: expected a problem matching ${pattern}, got ${JSON.stringify(result.problems)}`,
  );

let cases = 0;

// The whole bump: every version file, both phone build numbers, the notes.
{
  const before = fixture();
  const result = bumpSources(before, { version: '1.0.227' });
  clean(result, 'the whole bump');

  for (const f of VERSION_FILES) assert.ok(result.sources[f], `${f} is still there`);
  assert.equal(JSON.parse(result.sources['package.json']).version, '1.0.227', 'package.json');
  assert.equal(JSON.parse(result.sources['src-tauri/tauri.conf.json']).version, '1.0.227', 'tauri.conf.json');
  assert.match(result.sources['src-tauri/Cargo.toml'], /\nversion = "1\.0\.227"\n/, 'Cargo.toml [package]');
  assert.match(result.sources['src-tauri/Cargo.toml'], /serde = \{ version = "1\.0\.200"/, 'a dependency version is left alone');
  assert.match(result.sources['src-tauri/Cargo.lock'], /name = "izuki"\nversion = "1\.0\.227"/, 'Cargo.lock');
  assert.match(result.sources['android/app/build.gradle'], /versionCode 227\b/, 'versionCode moved');
  assert.match(result.sources['android/app/build.gradle'], /versionName "1\.0\.227"/, 'versionName moved');
  const ios = result.sources['ios/App/App.xcodeproj/project.pbxproj'];
  assert.equal([...ios.matchAll(/CURRENT_PROJECT_VERSION = 227;/g)].length, 2, 'both iOS build numbers');
  assert.equal([...ios.matchAll(/MARKETING_VERSION = 1\.0\.227;/g)].length, 2, 'both iOS marketing versions');
  assert.equal([...ios.matchAll(/CURRENT_PROJECT_VERSION = 226;/g)].length, 0, 'no iOS build number left behind');

  const notes = result.sources['docs/RELEASE-1.0.227.md'];
  assert.ok(notes, 'the release notes were written');
  assert.ok(notes.startsWith('# Izuki 1.0.227'), 'notes are titled for the version');
  assert.match(notes, /Idle downloads start by themselves, only when you said yes\./, 'a pending line is carried over');
  assert.match(notes, /Helpers left behind are closed on their own switch\./, 'the second line too');
  assert.doesNotMatch(notes, /\[Freebuff\]/, 'the [Freebuff] tag is not in the notes');
  assert.ok(notes.replace(/\s/g, '').length >= 40, 'notes clear the release gate');
  assert.equal(result.notesFile, 'docs/RELEASE-1.0.227.md', 'notesFile');

  assert.doesNotMatch(result.sources[PENDING], /^- /m, 'the pending list is cleared');
  assert.match(result.sources[PENDING], /Codex and Freebuff: add one line per change you pushed\./, 'the header stays');

  // And the tree it wrote is accepted as a release by the same check CI runs.
  clean(
    checkVersions(result.sources, { release: true, after: '1.0.226', notes: (n) => result.sources[`docs/${n}`] ?? null }),
    'after the bump',
  );
  cases += 1;
}

// Each file keeps the line endings it had; the new notes match the list.
{
  const result = bumpSources(fixture({ eol: '\r\n' }), { version: '1.0.227' });
  clean(result, 'CRLF tree');
  for (const [name, text] of Object.entries(result.sources)) {
    assert.match(text, /\r\n/, `${name} still uses CRLF`);
    assert.doesNotMatch(text, /[^\r]\n/, `${name} has no bare LF`);
  }
  cases += 1;
}

// A Cargo.lock left behind earlier is brought along, not skipped.
{
  const result = bumpSources(fixture({ lock: '1.0.200' }), { version: '1.0.227' });
  clean(result, 'stale lock');
  assert.match(result.sources['src-tauri/Cargo.lock'], /name = "izuki"\nversion = "1\.0\.227"/, 'the lock follows the bump');
  assert.match(result.sources['src-tauri/Cargo.lock'], /name = "serde"\nversion = "1\.0\.200"/, 'another package is untouched');
  cases += 1;
}

// A minor bump keeps the build number growing (1.1.0 -> 1000), not falling to 0.
{
  const result = bumpSources(fixture(), { version: '1.1.0' });
  clean(result, 'minor bump');
  assert.match(result.sources['android/app/build.gradle'], /versionCode 1000\b/, 'versionCode 1000');
  assert.match(result.sources['ios/App/App.xcodeproj/project.pbxproj'], /CURRENT_PROJECT_VERSION = 1000;/);
  cases += 1;
}

// iOS configurations that disagreed are brought to the new number: the bump's
// job is to make every file agree, not to leave one behind.
{
  const result = bumpSources(fixture({ ios: ['226', '225'] }), { version: '1.0.227' });
  clean(result, 'iOS builds that disagreed');
  assert.equal(
    [...result.sources['ios/App/App.xcodeproj/project.pbxproj'].matchAll(/CURRENT_PROJECT_VERSION = 227;/g)].length,
    2,
    'both iOS configurations end at 227',
  );
  cases += 1;
}

// Refusals: nothing that would leave the release gate red is written.
refused(bumpSources(fixture(), { version: '1.0.226' }), /not newer than the version in the tree/, 'the same version');
refused(bumpSources(fixture(), { version: '1.0.225' }), /not newer than the version in the tree/, 'an older version');
refused(bumpSources(fixture(), { version: '1.1' }), /is not a version like/, 'a two-part version');
refused(bumpSources(fixture({ pending: [] }), { version: '1.0.227' }), /has no pending lines/, 'an empty pending list');
refused(
  bumpSources({ ...fixture(), 'android/app/build.gradle': 'android {\n    defaultConfig {\n        versionName "1.0.226"\n    }\n}\n' }, { version: '1.0.227' }),
  /expected one versionCode, found 0/,
  'an Android file with no versionCode',
);
refused(
  bumpSources({ ...fixture(), 'ios/App/App.xcodeproj/project.pbxproj': '\t\tMARKETING_VERSION = 1.0.226;\n' }, { version: '1.0.227' }),
  /no CURRENT_PROJECT_VERSION to bump/,
  'an iOS project with no build number',
);
refused(
  bumpSources({ ...fixture(), 'docs/RELEASE-1.0.227.md': '# Izuki 1.0.227\n' }, { version: '1.0.227' }),
  /already exists/,
  'notes that are already there',
);
cases += 7;

// Every file docs/BUMP-CHECKLIST.md names is written by the bump. Adding a row
// to the checklist without teaching this script fails here, not at the gate.
{
  const checklist = fs.readFileSync(path.join(ROOT, 'docs/BUMP-CHECKLIST.md'), 'utf8');
  const rows = checklist.split(/\r?\n/).filter((l) => /^\| `/.test(l));
  assert.ok(rows.length >= 6, `the checklist lists its files (found ${rows.length} rows)`);
  for (const row of rows) {
    const file = row.match(/^\| `([^`]+)`/)[1];
    if (/^docs\/RELEASE-.*\.md$/.test(file)) continue; // the notes the bump writes
    assert.ok(
      VERSION_FILES.includes(file) || file === PENDING,
      `${file} is in the checklist but the bump does not write it`,
    );
  }
  cases += 1;
}

console.log(`ok ${cases} cases: one command bumps every file the checklist names, with the phone build numbers and real notes, and refuses rather than half-writes.`);
