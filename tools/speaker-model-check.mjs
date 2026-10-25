// Integration check with public, non-owner recordings from the model author's
// documented examples. Downloads are kept inside the ignored .work directory.
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import { AutoProcessor, AutoModelForXVector, env } from '@huggingface/transformers';
const cache = path.resolve('.work/speaker-model-check');
await fs.mkdir(cache, { recursive: true });
env.cacheDir = cache;
const modelId = 'Xenova/wavlm-base-plus-sv';
const processor = await AutoProcessor.from_pretrained(modelId);
const model = await AutoModelForXVector.from_pretrained(modelId, { dtype: 'q8', device: 'cpu' });
async function audio(name) {
  const file = path.join(cache, `${name}.wav`);
  let bytes;
  try { bytes = await fs.readFile(file); }
  catch {
    const response = await fetch(`https://huggingface.co/datasets/Xenova/transformers.js-docs/resolve/main/sv_speaker-${name}.wav`);
    assert.ok(response.ok, `public fixture ${name}`);
    bytes = Buffer.from(await response.arrayBuffer()); await fs.writeFile(file, bytes);
  }
  assert.equal(bytes.toString('ascii', 0, 4), 'RIFF');
  let format, channels, rate, bits, data;
  for (let at = 12; at + 8 <= bytes.length;) {
    const kind = bytes.toString('ascii', at, at + 4), size = bytes.readUInt32LE(at + 4), start = at + 8;
    if (kind === 'fmt ') { format = bytes.readUInt16LE(start); channels = bytes.readUInt16LE(start + 2); rate = bytes.readUInt32LE(start + 4); bits = bytes.readUInt16LE(start + 14); }
    if (kind === 'data') data = bytes.subarray(start, start + size);
    at = start + size + size % 2;
  }
  assert.equal(channels, 1); assert.equal(rate, 16000); assert.equal(format, 1); assert.equal(bits, 16);
  return Float32Array.from({ length: data.length / 2 }, (_, i) => data.readInt16LE(i * 2) / 32768);
}
const vectors = [];
for (const name of ['1_1', '1_2', '2_1', '2_2']) {
  const samples = await audio(name);
  const began = performance.now();
  const result = await model(await processor(samples));
  const vector = Array.from(result.embeddings.data);
  assert.equal(vector.length, 512); assert.ok(vector.every(Number.isFinite));
  const norm = Math.hypot(...vector);
  vectors.push(vector.map((n) => n / norm));
  console.log(`Public fixture ${name}: ${Math.round(performance.now() - began)} ms`);
}
const sim = (a, b) => a.reduce((sum, n, i) => sum + n * b[i], 0);
const same = [sim(vectors[0], vectors[1]), sim(vectors[2], vectors[3])];
const different = [sim(vectors[0], vectors[2]), sim(vectors[1], vectors[3])];
assert.ok(same.every((n) => n >= 0.85), 'same-speaker recordings match');
assert.ok(different.every((n) => n < 0.85), 'different-speaker recordings are rejected');
console.log(JSON.stringify({ same, different, passed: true }));
await model.dispose();
