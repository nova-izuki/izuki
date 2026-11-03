// Checks a release the way Izuki's updater will, before anyone is offered it:
//
//   node tools/verify-updater.mjs <dir with latest.json and the assets> <version>
//
// - latest.json names exactly this version;
// - every Windows platform entry points at this release's own download;
// - the signature in latest.json is the one in the asset's .sig file;
// - that signature is a valid minisign (Ed25519) signature of the very file,
//   made by the key built into the app (tauri.conf.json), trusted comment
//   included, and the trusted comment records this version (the app checks
//   it: requireSignedVersion).
// A release that fails any of these must stay a draft.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const [dir, version] = process.argv.slice(2);
if (!dir || !version) { console.error('usage: verify-updater.mjs <dir> <version>'); process.exit(2); }
const conf = JSON.parse(fs.readFileSync(new URL('../src-tauri/tauri.conf.json', import.meta.url), 'utf8'));
const repo = (conf.plugins.updater.endpoints[0].match(/github\.com\/([^/]+\/[^/]+)\//) || [])[1];

// minisign: a public key is "Ed" + 8-byte key id + 32-byte key; a signature
// line is "ED" (BLAKE2b-512 prehashed) or "Ed" + key id + 64-byte signature.
const lines = (b64) => Buffer.from(b64.trim(), 'base64').toString('utf8').split(/\r?\n/);
const keyLine = Buffer.from(lines(conf.plugins.updater.pubkey)[1], 'base64');
if (keyLine.length !== 42 || keyLine.subarray(0, 2).toString() !== 'Ed') throw Error('tauri.conf.json: not a minisign public key');
const keyId = keyLine.subarray(2, 10);
const publicKey = crypto.createPublicKey({ key: Buffer.concat([Buffer.from('302a300506032b6570032100', 'hex'), keyLine.subarray(10)]), format: 'der', type: 'spki' });

function verify(file, signatureB64) {
  const [, sigLine, trusted, globalLine] = lines(signatureB64);
  const sig = Buffer.from(sigLine || '', 'base64');
  if (sig.length !== 74) return 'the signature is malformed';
  const alg = sig.subarray(0, 2).toString();
  if (!sig.subarray(2, 10).equals(keyId)) return 'it was signed by a different key';
  const data = fs.readFileSync(file);
  const message = alg === 'ED' ? crypto.createHash('blake2b512').update(data).digest() : alg === 'Ed' ? data : null;
  if (!message) return `unknown signature type ${alg}`;
  if (!crypto.verify(null, message, publicKey, sig.subarray(10))) return 'the signature does not match the file';
  if (!trusted?.startsWith('trusted comment: ')) return 'the trusted comment is missing';
  const global = Buffer.from(globalLine || '', 'base64');
  if (!crypto.verify(null, Buffer.concat([sig.subarray(10), Buffer.from(trusted.slice('trusted comment: '.length))]), publicKey, global)) return 'the trusted comment was altered';
  // The app requires the signed version (tauri.conf.json requireSignedVersion):
  // without it, or with another one, every user's updater would refuse this
  // release, so it must never be published.
  const signed = trusted.slice('trusted comment: '.length).split('\t').find((f) => f.startsWith('version:'))?.slice('version:'.length);
  if (!signed) return 'the signature records no version (the app refuses such updates)';
  if (signed.replace(/^v/, '') !== version) return `the signature is for version ${signed}, not ${version}`;
  return '';
}

const problems = [];
const manifest = JSON.parse(fs.readFileSync(path.join(dir, 'latest.json'), 'utf8'));
if (manifest.version !== version) problems.push(`latest.json says ${manifest.version}, not ${version}`);
for (const target of ['windows-x86_64', 'windows-x86_64-msi', 'windows-x86_64-nsis']) {
  const entry = manifest.platforms?.[target];
  if (!entry?.url || !entry.signature) { problems.push(`${target}: missing from latest.json`); continue; }
  const base = `https://github.com/${repo}/releases/download/v${version}/`;
  if (!entry.url.startsWith(base)) { problems.push(`${target}: points at ${entry.url}, not this release`); continue; }
  const name = decodeURIComponent(entry.url.slice(base.length));
  const file = path.join(dir, name);
  if (!fs.existsSync(file)) { problems.push(`${target}: ${name} is not in the release`); continue; }
  const sigFile = `${file}.sig`;
  if (!fs.existsSync(sigFile)) problems.push(`${target}: ${name}.sig is not in the release`);
  else if (fs.readFileSync(sigFile, 'utf8').trim() !== entry.signature.trim()) problems.push(`${target}: latest.json's signature isn't the one in ${name}.sig`);
  const why = verify(file, entry.signature);
  if (why) problems.push(`${target}: ${name}: ${why}`);
  else console.log(`ok   ${target}: ${name} (${(fs.statSync(file).size / 1048576).toFixed(1)} MB) signed by key ${Buffer.from(keyId).reverse().toString('hex').toUpperCase()}`);
}
if (problems.length) { for (const p of problems) console.error(`FAIL ${p}`); process.exit(1); }
console.log(`Updater check passed for ${version}.`);
