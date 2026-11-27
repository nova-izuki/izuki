// Every file a build reads Izuki's version from must agree. Otherwise one
// platform ships a different number from the others, and the updater (which
// compares these numbers) offers the wrong thing.
//
// The phone build numbers must move with the version too. Leaving them behind
// passes every other check, but Android and iOS refuse to install a package
// whose build number they already have, so such a release never reaches an
// installed phone.
//
//   node tools/check-versions.mjs                    the files agree
//   node tools/check-versions.mjs --release [--after 1.0.195]
//       ...and this version is ready to publish: its release notes exist,
//       and it is newer than the given (latest published) version.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

export const SOURCES = [
  'package.json',
  'src-tauri/tauri.conf.json',
  'src-tauri/Cargo.toml',
  'src-tauri/Cargo.lock',
  'android/app/build.gradle',
  'ios/App/App.xcodeproj/project.pbxproj',
];

// The build number a version has to carry. For 1.0.x that is the version
// without its dots (1.0.225 -> 225). A minor bump keeps it growing (1.1.0 ->
// 1000) instead of falling back to 0, which every phone would refuse as a
// downgrade. A major bump means revisiting this rule on purpose.
export function expectedBuild(version) {
  const parts = String(version).split('.').map(Number);
  if (parts.length !== 3 || parts.some((n) => !Number.isInteger(n) || n < 0)) return NaN;
  const [, minor, patch] = parts;
  return minor * 1000 + patch;
}

// The whole check, as a pure function of the files' text, so it can be pinned
// by a test without copying the repository around.
//
//   sources: { 'package.json': text, 'src-tauri/Cargo.lock': text, ... }
//   options: { release, after, notes(name) -> text | null }
export function checkVersions(sources, options = {}) {
  const problems = [];
  const found = {};
  const one = (name, text, re) => {
    const all = [...String(text ?? '').matchAll(new RegExp(re, 'g'))].map((m) => m[1]);
    if (!all.length) problems.push(`${name}: no version found`);
    else if (new Set(all).size > 1) problems.push(`${name}: disagrees with itself (${[...new Set(all)].join(', ')})`);
    else found[name] = all[0];
  };
  found['package.json'] = JSON.parse(sources['package.json']).version;
  found['src-tauri/tauri.conf.json'] = JSON.parse(sources['src-tauri/tauri.conf.json']).version;
  one('src-tauri/Cargo.toml', String(sources['src-tauri/Cargo.toml']).split(/\n\[(?!package\])/)[0], String.raw`(?:^|\n)version = "([^"]+)"`);
  one('src-tauri/Cargo.lock', sources['src-tauri/Cargo.lock'], String.raw`name = "izuki"\r?\nversion = "([^"]+)"`);
  const gradle = String(sources['android/app/build.gradle']);
  one('android versionName', gradle, String.raw`versionName "([^"]+)"`);
  const ios = String(sources['ios/App/App.xcodeproj/project.pbxproj']);
  one('iOS MARKETING_VERSION', ios, String.raw`MARKETING_VERSION = ([^;]+);`);
  const version = found['package.json'];
  for (const [name, v] of Object.entries(found)) if (v !== version) problems.push(`${name} says ${v}, package.json says ${version}`);

  // The build numbers that let a phone install the new version over the old.
  const want = expectedBuild(version);
  const androidCode = gradle.match(/versionCode (\d+)/)?.[1];
  const iosCodes = [...new Set([...ios.matchAll(/CURRENT_PROJECT_VERSION = (\d+);/g)].map((m) => m[1]))];
  if (!Number.isFinite(want)) problems.push(`package.json: ${version} is not a three-part version`);
  if (!androidCode) problems.push('android versionCode: not found');
  else if (Number.isFinite(want) && androidCode !== String(want)) {
    problems.push(`android versionCode ${androidCode} does not move with ${version} (expected ${want}); a phone refuses to install an update with the same build number`);
  }
  if (iosCodes.length !== 1) problems.push(`iOS CURRENT_PROJECT_VERSION: expected one value, found ${iosCodes.join(', ') || 'none'}`);
  else if (androidCode && iosCodes[0] !== androidCode) problems.push(`iOS CURRENT_PROJECT_VERSION (${iosCodes[0]}) should equal Android versionCode (${androidCode})`);

  if (options.release) {
    const notes = `RELEASE-${version}.md`;
    const text = options.notes ? options.notes(notes) : null;
    if (!text || text.trim().length < 40) problems.push(`docs/${notes} is missing or empty: every release needs its notes`);
    if (options.after) {
      const n = (v) => v.split('.').map(Number);
      const [a, b] = [n(version), n(options.after)];
      const newer = a[0] - b[0] || a[1] - b[1] || a[2] - b[2];
      if (!(newer > 0)) problems.push(`${version} is not newer than the latest published ${options.after}`);
    }
  }
  return { version, androidCode, problems };
}

const isMain = process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url;
if (isMain) {
  const args = process.argv.slice(2);
  const sources = {};
  for (const p of SOURCES) sources[p] = fs.readFileSync(path.join(ROOT, p), 'utf8');
  const result = checkVersions(sources, {
    release: args.includes('--release'),
    after: args.includes('--after') ? args[args.indexOf('--after') + 1] : '',
    notes: (name) => {
      try {
        return fs.readFileSync(path.join(ROOT, 'docs', name), 'utf8');
      } catch {
        return null;
      }
    },
  });
  if (result.problems.length) {
    for (const p of result.problems) console.error(`FAIL ${p}`);
    process.exit(1);
  }
  console.log(`Versions agree: ${result.version} (build ${result.androidCode})${args.includes('--release') ? ', with release notes' : ''}.`);
}
