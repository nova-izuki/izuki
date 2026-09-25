/// <reference lib="webworker" />
/**
 * Izuki's ears, on their own thread.
 *
 * Transcription used to share the config panel's main thread with the
 * natural voice — so when Izuki was talking (or just saying "On it."),
 * turning your words into text waited its turn: 4 s for a 3.6 s sentence.
 * Here it runs alongside instead.
 *
 * Self-contained on purpose: a worker has no `window`, so none of the
 * Tauri IPC helpers work here. Model files still come from Izuki's own
 * model server (see localModels.ts / models.rs).
 */

/**
 * Two sizes of the same model. "base" is the more accurate for real
 * sentences; "tiny" is faster and — tested — far better on short phrases:
 * base turns "Hey Nova" into nothing at all, tiny gets it right. So wake
 * words use tiny, and a short phrase base drops gets a second try on tiny.
 */
const MODELS = {
  base: "onnx-community/moonshine-base-ONNX",
  tiny: "onnx-community/moonshine-tiny-ONNX",
  // Slower, but it hears what Moonshine returns nothing for — tested on a
  // real Bluetooth-headset "Hey Nova!" that both Moonshine sizes missed.
  whisper: "onnx-community/whisper-tiny.en",
} as const;
type Size = keyof typeof MODELS;
const HOST = "http://izukimodel.localhost/";

type Transcriber = (audio: Float32Array) => Promise<{ text: string } | Array<{ text: string }>>;
const models = new Map<Size, Promise<Transcriber>>();

function load(size: Size): Promise<Transcriber> {
  let m = models.get(size);
  if (!m) {
    m = import("@huggingface/transformers").then(async (t) => {
      t.env.remoteHost = HOST;
      t.env.allowLocalModels = false;
      t.env.useBrowserCache = false;
      const wasm = t.env.backends.onnx.wasm;
      if (wasm) wasm.wasmPaths = `${HOST}ort/`;
      const p = await t.pipeline("automatic-speech-recognition", MODELS[size], { dtype: "q8", device: "wasm" });
      return p as unknown as Transcriber;
    });
    m.catch(() => models.delete(size)); // let the next request retry
    models.set(size, m);
  }
  return m;
}

type SttRequest =
  | { id: number; kind: "load"; size: Size }
  | { id: number; kind: "transcribe"; size: Size; audio: Float32Array };

self.onmessage = async (e: MessageEvent<SttRequest>) => {
  const msg = e.data;
  try {
    const run = await load(msg.size);
    if (msg.kind === "load") {
      self.postMessage({ id: msg.id, ok: true });
      return;
    }
    const out = await run(msg.audio);
    const text = Array.isArray(out) ? out.map((o) => o.text).join(" ") : out.text;
    self.postMessage({ id: msg.id, ok: true, text });
  } catch (err) {
    self.postMessage({ id: msg.id, ok: false, error: err instanceof Error ? `${err.name}: ${err.message}` : String(err) });
  }
};
