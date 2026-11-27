// Pins the rule the release rehearsal found missing: a version bump that
// leaves Android versionCode and iOS CURRENT_PROJECT_VERSION at the old number
// used to pass every check, yet a phone refuses to install an update whose
// build number it already has. The build numbers have to move with the version.
import assert from 'node:assert/strict';
import { checkVersions, expectedBuild } from './check-versions.mjs';

const files = ({ version = '1.0.225', build = '225', lock = version, tauri = version, cargo = version, name = version, android = build, ios = [build, build], marketing = [version, version] } = {}) => ({
  'package.json': JSON.stringify({ name: 'izuki', version }, null, 2),
  'src-tauri/tauri.conf.json': JSON.stringify({ productName: 'Izuki', version: tauri }, null, 2),
  'src-tauri/Cargo.toml': `[package]\nname = "izuki"\nversion = "${cargo}"\nedition = "2021"\n\n[lib]\nname = "izuki_lib"\n`,
  'src-tauri/Cargo.lock': `version = 4\n\n[[package]]\nname = "izuki"\nversion = "${lock}"\n\n[[package]]\nname = "serde"\nversion = "1.0.200"\n`,
  'android/app/build.gradle': `    defaultConfig {\n        applicationId "ai.izuki.companion"\n        versionCode ${android}\n        versionName "${name}"\n    }\n`,
  'ios/App/App.xcodeproj/project.pbxproj': [
    ...marketing.map((v, i) => `\t\t\t\tMARKETING_VERSION = ${v};\n\t\t\t\tCURRENT_PROJECT_VERSION = ${ios[i]};`),
    `\t\t\t\tMARKETING_VERSION = ${marketing[1]};\n\t\t\t\tCURRENT_PROJECT_VERSION = ${ios[1]};`,
  ].join('\n') + '\n',
});

const run = (opts, extra = {}) => checkVersions(files(opts), extra).problems;
const clean = (problems, what) => assert.deepEqual(problems, [], `${what}: expected no problems, got ${JSON.stringify(problems)}`);
const found = (problems, pattern, what) => {
  assert.ok(problems.some((p) => pattern.test(p)), `${what}: expected a problem matching ${pattern}, got ${JSON.stringify(problems)}`);
};

let cases = 0;

// The tree as it ships today: 1.0.225 with build 225.
clean(run(), 'current tree');
cases++;

// The gap: a version bump that forgets both build numbers.
found(run({ version: '1.0.226', name: '1.0.226', marketing: ['1.0.226', '1.0.226'] }), /android versionCode 225 does not move with 1\.0\.226 \(expected 226\)/, 'version bumped, build numbers left');
cases++;

// The same, caught through the version files agreeing but the build staying.
found(run({ version: '1.0.226', build: '225', name: '1.0.226', marketing: ['1.0.226', '1.0.226'] }), /does not move with/, 'version bumped, build 225');
cases++;

// Bumped on Android only: iOS must equal Android, so this fails twice over.
found(run({ version: '1.0.226', build: '226', name: '1.0.226', marketing: ['1.0.226', '1.0.226'], ios: ['225', '225'] }), /should equal Android versionCode/, 'iOS build left');
cases++;

// A minor bump keeps the build number growing rather than falling back to 0.
clean(run({ version: '1.1.0', build: '1000', name: '1.1.0', marketing: ['1.1.0', '1.1.0'] }), 'minor bump');
assert.equal(expectedBuild('1.1.0'), 1000);
cases++;

// One of the two iOS MARKETING_VERSION lines left behind.
found(run({ marketing: ['1.0.225', '1.0.226'] }), /MARKETING_VERSION: disagrees with itself/, 'one iOS marketing line bumped');
cases++;

// A hand-edited Cargo.toml that never regenerated Cargo.lock.
found(run({ version: '1.0.226', build: '226', name: '1.0.226', marketing: ['1.0.226', '1.0.226'], lock: '1.0.225' }), /Cargo\.lock says 1\.0\.225, package\.json says 1\.0\.226/, 'Cargo.lock left');
cases++;

// A build number that is neither the old nor the new one is still refused.
found(run({ version: '1.0.226', build: '999', name: '1.0.226', marketing: ['1.0.226', '1.0.226'] }), /android versionCode 999 does not move with 1\.0\.226/, 'unrelated build number');
cases++;

// Release readiness: notes must exist, be real, and the version must move forward.
const notes = (map) => (name) => map[name] ?? null;
const bumped = { version: '1.0.226', build: '226', name: '1.0.226', marketing: ['1.0.226', '1.0.226'] };
clean(checkVersions(files(bumped), { release: true, after: '1.0.225', notes: notes({ 'RELEASE-1.0.226.md': '# Izuki 1.0.226\n\nA short but real note about this release.\n' }) }).problems, 'release ready');
cases++;
found(checkVersions(files(bumped), { release: true, after: '1.0.225', notes: notes({}) }).problems, /docs\/RELEASE-1\.0\.226\.md is missing or empty/, 'release without notes');
cases++;
found(checkVersions(files(bumped), { release: true, after: '1.0.225', notes: notes({ 'RELEASE-1.0.226.md': '# 1.0.226\n\n' }) }).problems, /is missing or empty/, 'release with an empty note');
cases++;
found(checkVersions(files(bumped), { release: true, after: '1.0.226', notes: notes({ 'RELEASE-1.0.226.md': '# Izuki 1.0.226\n\nA short but real note about this release.\n' }) }).problems, /1\.0\.226 is not newer than the latest published 1\.0\.226/, 'sideways release');
cases++;

// The tree as it is today cannot be released twice.
found(checkVersions(files(), { release: true, after: '1.0.225', notes: notes({ 'RELEASE-1.0.225.md': '# Izuki 1.0.225\n\nA short but real note about this release.\n' }) }).problems, /not newer than the latest published 1\.0\.225/, 'rebuilding the published version');
cases++;

console.log(`ok ${cases} cases: the build numbers move with the version, and a release needs its notes and a newer number.`);
