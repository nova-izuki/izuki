import { transformers } from "./localModels";
import { unitVector } from "./speakerMath";

const MODEL = "Xenova/wavlm-base-plus-sv";
let loaded: Promise<Awaited<ReturnType<typeof load>>> | null = null;
async function load() {
  const t = await transformers();
  const processor = await t.AutoProcessor.from_pretrained(MODEL);
  const model = await t.AutoModelForXVector.from_pretrained(MODEL, { dtype: "q8", device: "wasm" });
  return { processor, model };
}
// Serialize inference: WASM sessions should not compete with themselves.
let queue = Promise.resolve();
self.onmessage = (event: MessageEvent<{ id: number; audio?: Float32Array }>) => {
  const { id, audio } = event.data;
  queue = queue.then(async () => {
    try {
      loaded ??= load().catch((e) => { loaded = null; throw e; });
      const { processor, model } = await loaded;
      if (!audio) { self.postMessage({ id, ok: true }); return; }
      const output = await model(await processor(audio));
      self.postMessage({ id, ok: true, vector: unitVector(output.embeddings.data as Float32Array) });
    } catch (e) {
      self.postMessage({ id, ok: false, error: e instanceof Error ? e.message : "Voice recognition failed." });
    }
  });
};
