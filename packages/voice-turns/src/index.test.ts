import { test } from "node:test";
import assert from "node:assert/strict";
import { EchoGate, QuietGate } from "./index.ts";

const tone = (n: number, level: number) => Float32Array.from({ length: n }, (_, i) => Math.sin(i / 3) * level * Math.SQRT2);

test("EchoGate: the assistant's own loud echo never counts as the user", () => {
  const g = new EchoGate();
  // Loud speakers: the mic hears 1.2 × the output.
  for (let i = 0; i < 7; i++) assert.equal(g.threshold(0.12, 0.1, 64), null); // warm-up (7 × 64 ms)
  for (let i = 0; i < 50; i++) {
    const bar = g.threshold(0.12, 0.1, 64)!;
    assert.ok(0.12 < bar, `echo 0.12 must stay under the bar ${bar}`);
  }
  // The user talks over it, clearly louder than the echo: counts.
  const bar = g.threshold(0.4, 0.1, 64)!;
  assert.ok(0.4 > bar, `user 0.4 must beat ${bar}`);
});

test("EchoGate: a quiet echo lets a normal voice through", () => {
  const g = new EchoGate();
  for (let i = 0; i < 40; i++) g.threshold(0.01, 0.1, 64);
  const bar = g.threshold(0.05, 0.1, 64)!;
  assert.ok(0.05 > bar, `a normal voice (0.05) beats ${bar}`);
  g.reset();
  assert.equal(g.threshold(0.3, 0.1, 64), null, "warm-up again after a reset");
});

test("QuietGate: rests in silence, replays the moment before a sound", () => {
  const q = new QuietGate({ holdSeconds: 0.5 });
  let t = 0;
  for (let i = 0; i < 30; i++) assert.equal(q.push(tone(1280, 0.001), (t += 80)), null);
  assert.equal(q.rested, 30);
  const woke = q.push(tone(1280, 0.05), (t += 80))!;
  assert.equal(woke.length, 2, "held audio, then the sound");
  assert.ok(woke[0].length >= 8000 - 1280 && woke[0].length <= 8000 + 1280, `≈0.5 s held, got ${woke[0].length}`);
  // Stays awake a while after, even through quiet.
  assert.deepEqual(q.push(tone(1280, 0.001), (t += 80))!.length, 1);
  // …then rests again.
  assert.equal(q.push(tone(1280, 0.001), (t += 3000)), null);
});

test("QuietGate: a steady hum doesn't keep it awake forever", () => {
  const q = new QuietGate();
  let t = 0;
  let awake = 0;
  for (let i = 0; i < 400; i++) if (q.push(tone(1280, 0.004), (t += 80))) awake++;
  assert.ok(awake < 60, `awake ${awake} of 400 chunks of hum`);
});
