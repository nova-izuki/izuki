/// <reference lib="webworker" />
/**
 * The dedicated wake-word detector's thread (see wakeEngine.ts). Gets 16 kHz
 * mic audio from the page, runs every 80 ms, and reports a detection —
 * nothing else leaves it.
 */
import * as ort from "onnxruntime-web";
import { WakeEngine } from "./wakeEngine";

const HOST = "http://izukimodel.localhost/";
ort.env.wasm.wasmPaths = `${HOST}ort/`;
ort.env.wasm.numThreads = 1;

/**
 * Score needed to count as the wake word. openWakeWord's default is 0.5;
 * a real voice through a Bluetooth headset scores lower than the clean
 * speech the models are benchmarked on, and a false wake is harmless here
 * (Izuki says "Mhm?" and closes again), so a little lower.
 */
const THRESHOLD = 0.4;
/** Scores this high that didn't trigger are logged, to tune the above. */
const NEAR = 0.12;
let nearBest: { name: string; score: number } | null = null;
let nearSince = 0;
/** One call is one detection, not several. */
const COOLDOWN_MS = 2000;

let engine: WakeEngine | null = null;
let lastFire = 0;
let frames = 0;
let busyMs = 0;

const fetchModel = async (path: string) => {
  const r = await fetch(HOST + "wakeword/" + path);
  if (!r.ok) throw new Error(`${path}: HTTP ${r.status}`);
  return new Uint8Array(await r.arrayBuffer());
};

type Msg = { kind: "start"; custom: string[] } | { kind: "audio"; samples: Float32Array } | { kind: "reset" };

self.onmessage = async (e: MessageEvent<Msg>) => {
  const msg = e.data;
  try {
    if (msg.kind === "start") {
      // Only the user's own wake words ("Hey Nova") — none is bundled.
      const wake: Array<{ name: string; bytes: Uint8Array }> = [];
      for (const file of msg.custom) {
        wake.push({ name: prettyName(file), bytes: await fetchModel("custom/" + encodeURIComponent(file)) });
      }
      engine = await WakeEngine.create(ort, fetchModel, wake, { executionProviders: ["wasm"], graphOptimizationLevel: "all" });
      self.postMessage({ kind: "ready", words: engine.models.map((m) => m.name) });
      return;
    }
    if (msg.kind === "reset") {
      engine?.reset();
      return;
    }
    if (!engine) return;
    const began = performance.now();
    const results = await engine.feed(msg.samples);
    busyMs += performance.now() - began;
    for (const scores of results) {
      frames++;
      for (const [name, score] of Object.entries(scores)) {
        if (score >= NEAR && score < THRESHOLD && (!nearBest || score > nearBest.score)) {
          nearBest = { name, score };
          nearSince ||= Date.now();
        }
        if (score >= THRESHOLD && Date.now() - lastFire > COOLDOWN_MS) {
          lastFire = Date.now();
          engine.reset();
          self.postMessage({ kind: "wake", name, score });
        }
      }
    }
    // A near miss, once it's over (a second after the best score).
    if (nearBest && Date.now() - nearSince > 1000) {
      self.postMessage({ kind: "near", name: nearBest.name, score: nearBest.score });
      nearBest = null;
      nearSince = 0;
    }
    // Every ~20 s: how much of one core this takes (for the log).
    if (frames >= 250) {
      self.postMessage({ kind: "load", msPerFrame: busyMs / frames });
      frames = 0;
      busyMs = 0;
    }
  } catch (err) {
    self.postMessage({ kind: "error", error: err instanceof Error ? err.message : String(err) });
  }
};

/** "hey_nova_v2.onnx" / "Hey_Nova_20260328_194345.onnx" → "Hey Nova". */
function prettyName(file: string): string {
  return file
    .replace(/\.onnx$/i, "")
    .replace(/([_-](v?\d+(\.\d+)*))+$/i, "")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}
