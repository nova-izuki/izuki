// Checks every binary asset in the repo, where code review can't look.
//
//   node tools/asset-check.mjs
//
// CodeRabbit reviews every file, but the bytes of a picture, a sound or a
// model aren't text, so a truncated, corrupted or mislabelled one passes
// review unnoticed. This opens each one the way its format defines it:
//
// - PNG: signature, every chunk's CRC, IHDR first and IEND last, and the
//   image data inflates to exactly the size its header promises.
// - JPEG: start and end markers, a frame header with a real size.
// - WebP: RIFF size matches the file, chunks walk to the end, real size.
// - ICO: every image entry lies inside the file and is a PNG or bitmap.
// - SVG: well-formed XML with no script, event handlers or javascript: links.
// - glTF binary (.glb): header, JSON chunk, and every buffer view inside the
//   binary chunk.
// - M4A/MP4: boxes add up to the file, with ftyp, moov and mdat present.
// - ZIP (and MediaPipe .task bundles): every entry's CRC matches; the packed
//   extension's manifest matches extension/manifest.json (not a stale build).
// - WebAssembly: validated by the engine itself.
// - ONNX: a real model, not a Git LFS pointer or an empty file.
// - PKCS#12 (.p12): one well-formed DER structure.
// - JSON: every file parses. Character rigs, skins, moves and tweens agree
//   with their images (frames inside the sprite sheet, joints inside the
//   picture, tweens between moves that exist).
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { execFileSync } from 'node:child_process';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..');
const files = execFileSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8' }).split('\0').filter(Boolean);
const problems = [];
const counts = {};
const fail = (file, why) => problems.push(`${file}: ${why}`);
const read = (file) => fs.readFileSync(path.join(root, file));
const ext = (file) => path.extname(file).toLowerCase();
const crc32 = zlib.crc32 ?? ((buf) => { let c = ~0; for (const b of buf) { c ^= b; for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1)); } return ~c >>> 0; });

function png(buf) {
  if (!buf.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) return 'not a PNG signature';
  let at = 8, first = true, ended = false, ihdr = null;
  const idat = [];
  while (at + 12 <= buf.length) {
    const len = buf.readUInt32BE(at), type = buf.toString('latin1', at + 4, at + 8);
    if (at + 12 + len > buf.length) return `${type} chunk runs past the end (truncated)`;
    const data = buf.subarray(at + 8, at + 8 + len);
    if (crc32(buf.subarray(at + 4, at + 8 + len)) !== buf.readUInt32BE(at + 8 + len)) return `${type} chunk CRC is wrong (corrupted)`;
    if (first && type !== 'IHDR') return 'IHDR is not the first chunk';
    first = false;
    if (type === 'IHDR') ihdr = { w: data.readUInt32BE(0), h: data.readUInt32BE(4), depth: data[8], color: data[9], interlace: data[12] };
    if (type === 'IDAT') idat.push(data);
    at += 12 + len;
    if (type === 'IEND') { ended = true; break; }
  }
  if (!ended) return 'no IEND chunk (truncated)';
  if (!ihdr || !ihdr.w || !ihdr.h) return 'no image size';
  if (!idat.length) return 'no image data';
  let raw;
  try { raw = zlib.inflateSync(Buffer.concat(idat)); } catch { return 'image data does not decompress (corrupted)'; }
  if (!ihdr.interlace) {
    const samples = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[ihdr.color];
    if (!samples) return `unknown color type ${ihdr.color}`;
    const want = ihdr.h * (1 + Math.ceil((ihdr.w * samples * ihdr.depth) / 8));
    if (raw.length !== want) return `image data is ${raw.length} bytes, its header promises ${want}`;
  }
  return '';
}

function jpeg(buf) {
  if (buf[0] !== 0xff || buf[1] !== 0xd8) return 'no JPEG start marker';
  let end = buf.length;
  while (end > 2 && buf[end - 1] === 0) end--;
  if (buf[end - 2] !== 0xff || buf[end - 1] !== 0xd9) return 'no JPEG end marker (truncated)';
  let at = 2;
  while (at + 4 <= buf.length) {
    if (buf[at] !== 0xff) return `bad marker at byte ${at}`;
    const marker = buf[at + 1];
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) { at += 2; continue; }
    const len = buf.readUInt16BE(at + 2);
    if ((marker >= 0xc0 && marker <= 0xcf) && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      return buf.readUInt16BE(at + 5) && buf.readUInt16BE(at + 7) ? '' : 'frame header has no size';
    }
    if (marker === 0xda) break;
    at += 2 + len;
  }
  return 'no frame header';
}

// WebP: the size (width, height), or a string saying what's wrong.
function webp(buf) {
  if (buf.toString('latin1', 0, 4) !== 'RIFF' || buf.toString('latin1', 8, 12) !== 'WEBP') return 'not a WebP file';
  const riff = buf.readUInt32LE(4) + 8;
  if (riff > buf.length) return `RIFF says ${riff} bytes, file has ${buf.length} (truncated)`;
  let at = 12, size = null;
  while (at + 8 <= riff) {
    const type = buf.toString('latin1', at, at + 4), len = buf.readUInt32LE(at + 4), d = at + 8;
    if (d + len > riff) return `${type} chunk runs past the end`;
    if (type === 'VP8X') size = [1 + buf.readUIntLE(d + 4, 3), 1 + buf.readUIntLE(d + 7, 3)];
    else if (type === 'VP8 ' && !size) {
      if (buf[d + 3] !== 0x9d || buf[d + 4] !== 0x01 || buf[d + 5] !== 0x2a) return 'VP8 start code missing';
      size = [buf.readUInt16LE(d + 6) & 0x3fff, buf.readUInt16LE(d + 8) & 0x3fff];
    } else if (type === 'VP8L' && !size) {
      if (buf[d] !== 0x2f) return 'VP8L signature missing';
      const bits = buf.readUInt32LE(d + 1);
      size = [1 + (bits & 0x3fff), 1 + ((bits >> 14) & 0x3fff)];
    }
    at = d + len + (len & 1);
  }
  if (at !== riff) return 'chunks do not end where the file does';
  return size && size[0] && size[1] ? size : 'no image size';
}

function ico(buf) {
  if (buf.readUInt16LE(0) !== 0 || buf.readUInt16LE(2) !== 1) return 'not an ICO header';
  const n = buf.readUInt16LE(4);
  if (!n) return 'no images inside';
  for (let i = 0; i < n; i++) {
    const e = 6 + i * 16, size = buf.readUInt32LE(e + 8), off = buf.readUInt32LE(e + 12);
    if (off + size > buf.length) return `image ${i + 1} lies past the end of the file`;
    const head = buf.subarray(off, off + 8);
    if (!head.equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) && buf.readUInt32LE(off) !== 40) return `image ${i + 1} is neither PNG nor bitmap`;
    if (head[0] === 137) { const why = png(buf.subarray(off, off + size)); if (why) return `image ${i + 1}: ${why}`; }
  }
  return '';
}

// Tags open and close in order (enough to catch a broken file; not a full
// XML parser).
function wellFormed(xml) {
  const stack = [];
  const re = /<!--[\s\S]*?-->|<!\[CDATA\[[\s\S]*?\]\]>|<\?[\s\S]*?\?>|<![^>]*>|<(\/?)([A-Za-z_][\w:.-]*)((?:[^>"']|"[^"]*"|'[^']*')*?)(\/?)>/g;
  let m;
  while ((m = re.exec(xml))) {
    if (!m[2]) continue;
    if (m[1]) { const open = stack.pop(); if (open !== m[2]) return `</${m[2]}> closes <${open ?? 'nothing'}>`; }
    else if (!m[4]) stack.push(m[2]);
  }
  return stack.length ? `<${stack.at(-1)}> is never closed` : '';
}

function svg(buf) {
  const text = buf.toString('utf8');
  if (!/<svg[\s>]/i.test(text)) return 'no <svg> element';
  const why = wellFormed(text);
  if (why) return why;
  if (/<script[\s>]/i.test(text)) return 'contains a <script>';
  if (/\son[a-z]+\s*=/i.test(text)) return 'contains an event handler (on…=)';
  if (/(?:href|src)\s*=\s*["']\s*javascript:/i.test(text)) return 'contains a javascript: link';
  if (/<foreignObject[\s>]/i.test(text)) return 'contains <foreignObject> (embedded HTML)';
  return '';
}

function glb(buf) {
  if (buf.toString('latin1', 0, 4) !== 'glTF') return 'not glTF binary';
  if (buf.readUInt32LE(4) !== 2) return `glTF version ${buf.readUInt32LE(4)}, expected 2`;
  if (buf.readUInt32LE(8) !== buf.length) return `header says ${buf.readUInt32LE(8)} bytes, file has ${buf.length}`;
  let at = 12, json = null, bin = 0;
  while (at + 8 <= buf.length) {
    const len = buf.readUInt32LE(at), type = buf.readUInt32LE(at + 4);
    if (at + 8 + len > buf.length) return 'a chunk runs past the end';
    if (type === 0x4e4f534a) { try { json = JSON.parse(buf.toString('utf8', at + 8, at + 8 + len)); } catch { return 'JSON chunk does not parse'; } }
    if (type === 0x004e4942) bin = len;
    at += 8 + len;
  }
  if (!json || json.asset?.version !== '2.0') return 'missing JSON chunk or asset.version 2.0';
  for (const [i, v] of (json.bufferViews || []).entries()) {
    if (v.buffer === 0 && !json.buffers?.[0]?.uri && (v.byteOffset || 0) + v.byteLength > bin) return `bufferView ${i} lies outside the binary chunk`;
  }
  for (const [i, a] of (json.accessors || []).entries()) if (a.bufferView !== undefined && !json.bufferViews?.[a.bufferView]) return `accessor ${i} points at a missing bufferView`;
  return '';
}

function mp4(buf) {
  let at = 0;
  const seen = new Set();
  while (at + 8 <= buf.length) {
    let size = buf.readUInt32BE(at);
    const type = buf.toString('latin1', at + 4, at + 8);
    if (size === 1) size = Number(buf.readBigUInt64BE(at + 8));
    if (size === 0) size = buf.length - at;
    if (size < 8 || at + size > buf.length) return `${type} box runs past the end (truncated)`;
    seen.add(type);
    at += size;
  }
  if (at !== buf.length) return 'boxes do not end where the file does';
  for (const need of ['ftyp', 'moov', 'mdat']) if (!seen.has(need)) return `no ${need} box`;
  return '';
}

// Every entry of a zip, inflated and CRC-checked; returns the entries.
function zip(buf) {
  let eocd = -1;
  for (let i = buf.length - 22; i >= Math.max(0, buf.length - 65557); i--) if (buf.readUInt32LE(i) === 0x06054b50) { eocd = i; break; }
  if (eocd < 0) return 'no end-of-archive record (truncated)';
  const count = buf.readUInt16LE(eocd + 10);
  let at = buf.readUInt32LE(eocd + 16);
  const entries = new Map();
  for (let i = 0; i < count; i++) {
    if (buf.readUInt32LE(at) !== 0x02014b50) return 'central directory is damaged';
    const method = buf.readUInt16LE(at + 10), crc = buf.readUInt32LE(at + 16), csize = buf.readUInt32LE(at + 20), usize = buf.readUInt32LE(at + 24);
    const nlen = buf.readUInt16LE(at + 28), xlen = buf.readUInt16LE(at + 30), clen = buf.readUInt16LE(at + 32), local = buf.readUInt32LE(at + 42);
    const name = buf.toString('utf8', at + 46, at + 46 + nlen);
    if (buf.readUInt32LE(local) !== 0x04034b50) return `${name}: local header missing`;
    const start = local + 30 + buf.readUInt16LE(local + 26) + buf.readUInt16LE(local + 28);
    if (start + csize > buf.length) return `${name}: runs past the end`;
    let data = buf.subarray(start, start + csize);
    if (method === 8) { try { data = zlib.inflateRawSync(data); } catch { return `${name}: does not decompress`; } }
    else if (method !== 0) return `${name}: unsupported compression ${method}`;
    if (data.length !== usize || crc32(data) !== crc) return `${name}: CRC or size mismatch (corrupted)`;
    entries.set(name, data);
    at += 46 + nlen + xlen + clen;
  }
  return entries;
}

function onnx(buf) {
  if (buf.toString('latin1', 0, 40).startsWith('version https://git-lfs')) return 'is a Git LFS pointer, not the model';
  if (buf.length < 1024) return `only ${buf.length} bytes`;
  if (buf[0] !== 0x08) return 'does not start like an ONNX model (ir_version field)';
  return '';
}

function der(buf) {
  if (buf[0] !== 0x30) return 'not a DER structure';
  let len = buf[1], head = 2;
  if (len & 0x80) { const n = len & 0x7f; len = buf.readUIntBE(2, n); head = 2 + n; }
  return head + len === buf.length ? '' : 'DER length does not match the file';
}

const sizes = new Map();
const checks = {
  '.png': png, '.jpg': jpeg, '.jpeg': jpeg, '.ico': ico, '.svg': svg, '.glb': glb, '.m4a': mp4, '.mp4': mp4,
  '.onnx': onnx, '.p12': der,
  '.webp': (buf, file) => { const r = webp(buf); if (Array.isArray(r)) { sizes.set(file, r); return ''; } return r; },
  '.wasm': (buf) => (WebAssembly.validate(buf) ? '' : 'WebAssembly.validate rejects it'),
  '.zip': (buf) => (typeof zip(buf) === 'string' ? zip(buf) : ''),
  '.task': (buf) => (typeof zip(buf) === 'string' ? zip(buf) : ''),
  '.json': (buf) => { try { JSON.parse(buf.toString('utf8').replace(/^﻿/, '')); return ''; } catch (e) { return `does not parse: ${e.message}`; } },
};
for (const file of files) {
  const check = checks[ext(file)];
  if (!check) continue;
  let buf;
  try { buf = read(file); } catch { continue; } // deleted in the working tree
  if (!buf.length) { fail(file, 'empty file'); continue; }
  const why = check(buf, file);
  if (why) fail(file, why);
  counts[ext(file)] = (counts[ext(file)] || 0) + 1;
}

// The packed extension is the one users download: it must be today's.
{
  const packed = files.find((f) => f === 'docs/extension/izuki-extension.zip');
  if (packed) {
    const entries = zip(read(packed));
    if (typeof entries !== 'string') {
      // Files sit at the root, no wrapper folder (scripts/pack-extension.mjs).
      const inside = entries.get('manifest.json');
      const want = JSON.parse(read('extension/manifest.json')).version;
      if (!inside) fail(packed, 'has no manifest.json at its root');
      else if (JSON.parse(inside).version !== want) fail(packed, `holds extension ${JSON.parse(inside).version}, extension/ is ${want}: run npm run extension`);
      // Known, low severity (docs/REVIEW-1.0.196.md): PowerShell 5.1's
      // Compress-Archive stores "icons\icon-16.png". Windows extracts that
      // fine; other unzip tools make a file with a backslash in its name.
      const slashed = [...entries.keys()].filter((n) => n.includes(String.fromCharCode(92)));
      if (slashed.length) console.warn(`warn ${packed}: ${slashed.length} entries use backslashes (e.g. ${slashed[0]}); the zip format wants "/"`);
    }
  }
}

// Characters: rigs and skins agree with their pictures; moves and tweens
// stay inside their sprite sheets and between moves that exist.
const inside = (r, [w, h]) => r.x >= 0 && r.y >= 0 && r.x + r.w <= w && r.y + r.h <= h;
const pt = ([x, y], [w, h]) => x >= 0 && y >= 0 && x <= w && y <= h;
let characters = 0;
for (const rig of files.filter((f) => /^docs\/app\/painted\/[^/]+\/rig\.json$/.test(f))) {
  const dir = path.posix.dirname(rig);
  const r = JSON.parse(read(rig));
  const base = sizes.get(`${dir}/base.webp`);
  if (!base) { fail(rig, 'no base.webp beside it'); continue; }
  if (r.size[0] !== base[0] || r.size[1] !== base[1]) fail(rig, `size ${r.size} but base.webp is ${base}`);
  for (const key of ['mouth', 'eyes']) if (r[key] && !pt(r[key].slice(0, 2), r.size)) fail(rig, `${key} lies outside the picture`);
  for (const key of ['head', 'neck', 'feet']) if (r[key] && !pt(r[key], r.size)) fail(rig, `${key} lies outside the picture`);
  for (const [name, [top, bottom]] of Object.entries(r.frames || {})) if (top < 0 || bottom > r.size[1] || top >= bottom) fail(rig, `frame "${name}" is outside the picture`);
  if (files.includes(`${dir}/skin.json`)) {
    const s = JSON.parse(read(`${dir}/skin.json`));
    if (s.size[0] !== r.size[0] || s.size[1] !== r.size[1]) fail(`${dir}/skin.json`, `size ${s.size} but rig.json says ${r.size}`);
    for (const [j, p] of Object.entries(s.joints || {})) if (!pt(p, s.size)) fail(`${dir}/skin.json`, `joint ${j} lies outside the picture`);
    const bones = new Set((s.bones || []).map((b) => b.name));
    for (const b of s.bones || []) {
      if (b.parent && !bones.has(b.parent)) fail(`${dir}/skin.json`, `bone ${b.name}'s parent ${b.parent} doesn't exist`);
      for (const j of [b.from, b.to]) if (j && !(j in (s.joints || {}))) fail(`${dir}/skin.json`, `bone ${b.name} uses missing joint ${j}`);
    }
  }
  characters++;
}
for (const moves of files.filter((f) => /^docs\/app\/painted\/[^/]+\/moves\.json$/.test(f))) {
  const dir = path.posix.dirname(moves);
  const m = JSON.parse(read(moves));
  const sheet = sizes.get(`${dir}/moves.webp`);
  if (!sheet) { fail(moves, 'no moves.webp beside it'); continue; }
  for (const [state, frames] of Object.entries(m.states || {})) frames.forEach((f, i) => { if (!inside(f, sheet)) fail(moves, `${state}.${i} lies outside moves.webp (${sheet})`); });
  if (files.includes(`${dir}/tweens.json`)) {
    const t = JSON.parse(read(`${dir}/tweens.json`));
    const tsheet = sizes.get(`${dir}/tweens.webp`);
    if (!tsheet) fail(`${dir}/tweens.json`, 'no tweens.webp beside it');
    for (const [key, frames] of Object.entries(t)) {
      for (const end of key.split('>')) {
        const [state, i] = end.split('.');
        if (!m.states?.[state]?.[Number(i)]) fail(`${dir}/tweens.json`, `${key} names ${end}, which isn't a move`);
      }
      if (tsheet) frames.forEach((f, i) => { if (!inside(f, tsheet)) fail(`${dir}/tweens.json`, `${key} frame ${i} lies outside tweens.webp`); });
    }
  }
}

if (problems.length) { for (const p of problems) console.error(`FAIL ${p}`); process.exit(1); }
console.log(`assets: ok (${Object.entries(counts).map(([e, n]) => `${n} ${e}`).join(', ')}; ${characters} character rigs cross-checked, packed extension current)`);
