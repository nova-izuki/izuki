// Every file a build reads Izuki's version from must agree. Otherwise one
// platform ships a different number from the others, and the updater (which
// compares these numbers) offers the wrong thing.
//
//   node tools/check-versions.mjs                    the files agree
//   node tools/check-versions.mjs --release [--after 1.0.195]
//       ...and this version is ready to publish: its release notes exist,
//       and it is newer than the given (latest published) version.
import fs from 'node:fs';

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const args = process.argv.slice(2);
const problems = [];
const found = {};
const one = (name, text, re) => {
  const all = [...text.matchAll(new RegExp(re, 'g'))].map((m) => m[1]);
  if (!all.length) problems.push(`${name}: no version found`);
  else if (new Set(all).size > 1) problems.push(`${name}: disagrees with itself (${[...new Set(all)].join(', ')})`);
  else found[name] = all[0];
};
found['package.json'] = JSON.parse(read('package.json')).version;
found['src-tauri/tauri.conf.json'] = JSON.parse(read('src-tauri/tauri.conf.json')).version;
one('src-tauri/Cargo.toml', read('src-tauri/Cargo.toml').split(/\n\[(?!package\])/)[0], String.raw`(?:^|\n)version = "([^"]+)"`);
one('src-tauri/Cargo.lock', read('src-tauri/Cargo.lock'), String.raw`name = "izuki"\r?\nversion = "([^"]+)"`);
const gradle = read('android/app/build.gradle');
one('android versionName', gradle, String.raw`versionName "([^"]+)"`);
const ios = read('ios/App/App.xcodeproj/project.pbxproj');
one('iOS MARKETING_VERSION', ios, String.raw`MARKETING_VERSION = ([^;]+);`);
const version = found['package.json'];
for (const [name, v] of Object.entries(found)) if (v !== version) problems.push(`${name} says ${v}, package.json says ${version}`);
// The build numbers that let a phone install the new version over the old.
const androidCode = gradle.match(/versionCode (\d+)/)?.[1];
const iosCodes = [...new Set([...ios.matchAll(/CURRENT_PROJECT_VERSION = (\d+);/g)].map((m) => m[1]))];
if (!androidCode) problems.push('android versionCode: not found');
if (iosCodes.length !== 1 || iosCodes[0] !== androidCode) problems.push(`iOS CURRENT_PROJECT_VERSION (${iosCodes.join(', ')}) should equal Android versionCode (${androidCode})`);

if (args.includes('--release')) {
  const notes = `docs/RELEASE-${version}.md`;
  let text = '';
  try { text = read(notes); } catch {}
  if (text.trim().length < 40) problems.push(`${notes} is missing or empty: every release needs its notes`);
  const after = args[args.indexOf('--after') + 1];
  if (args.includes('--after') && after) {
    const n = (v) => v.split('.').map(Number);
    const [a, b] = [n(version), n(after)];
    const newer = a[0] - b[0] || a[1] - b[1] || a[2] - b[2];
    if (!(newer > 0)) problems.push(`${version} is not newer than the latest published ${after}`);
  }
}
if (problems.length) { for (const p of problems) console.error(`FAIL ${p}`); process.exit(1); }
console.log(`Versions agree: ${version} (build ${androidCode})${args.includes('--release') ? ', with release notes' : ''}.`);
