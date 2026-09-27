/**
 * A dedicated wake-word detector — the way voice-assistant
 * assistants listen: a tiny model that does one job, spotting one phrase in
 * raw sound, every 80 ms, for almost no CPU. Only when it fires does the
 * full speech recognition start.
 *
 * This is openWakeWord's streaming pipeline (github.com/dscripka/openWakeWord,
 * utils.py/model.py), ported faithfully:
 *   16 kHz audio in 1280-sample (80 ms) chunks
 *   → melspectrogram model on the chunk + 480 samples of context, `x/10 + 2`
 *   → embedding model on the last 76 mel frames → one 96-value embedding
 *   → each wake-word model on the last 16 embeddings → a 0..1 score.
 * Any openWakeWord-format model works: e.g. a "Hey Nova" made at openwakeword.com, or one
 * trained/downloaded for "Hey Nova" / "Hey Izuki" (openwakeword.com).
 *
 * `ort` is passed in, so the same code runs in the browser worker
 * (onnxruntime-web) and in a Node test (onnxruntime-node).
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
type Ort = any;

const CHUNK = 1280;
const CONTEXT = 160 * 3;
const MEL_BINS = 32;
const MEL_WINDOW = 76;
const EMB_WINDOW = 16;
const EMB_SIZE = 96;

export interface WakeModel {
  name: string;
  session: any;
  input: string;
}

export class WakeEngine {
  private raw: Float32Array = new Float32Array(0); // recent int16-range samples
  private pending: Float32Array = new Float32Array(0); // samples waiting for a full chunk
  private mel: Float32Array[] = [];
  private emb: Float32Array[] = [];
  private busy = false;

  private constructor(
    private ort: Ort,
    private melSession: any,
    private embSession: any,
    public models: WakeModel[]
  ) {
    // openWakeWord starts its mel buffer with 76 frames of ones.
    for (let i = 0; i < MEL_WINDOW; i++) this.mel.push(new Float32Array(MEL_BINS).fill(1));
  }

  static async create(
    ort: Ort,
    load: (name: string) => Promise<Uint8Array>,
    wakeModels: Array<{ name: string; bytes: Uint8Array }>,
    sessionOptions: object = {}
  ): Promise<WakeEngine> {
    const make = (bytes: Uint8Array) => ort.InferenceSession.create(bytes, sessionOptions);
    const [mel, emb] = await Promise.all([make(await load("melspectrogram.onnx")), make(await load("embedding_model.onnx"))]);
    const models: WakeModel[] = [];
    for (const m of wakeModels) {
      const session = await make(m.bytes);
      models.push({ name: m.name, session, input: session.inputNames[0] });
    }
    return new WakeEngine(ort, mel, emb, models);
  }

  /**
   * Feed audio (16 kHz mono floats, -1..1). Returns each model's score for
   * every complete 80 ms chunk processed (usually zero or one entry).
   */
  async feed(samples: Float32Array): Promise<Array<Record<string, number>>> {
    // int16 range, as the models were trained on 16-bit PCM
    const scaled = new Float32Array(samples.length);
    for (let i = 0; i < samples.length; i++) scaled[i] = Math.max(-32768, Math.min(32767, Math.round(samples[i] * 32767)));
    this.pending = concat(this.pending, scaled);
    const out: Array<Record<string, number>> = [];
    if (this.busy) return out; // the previous call is still working — it'll pick these up
    this.busy = true;
    try {
      while (this.pending.length >= CHUNK) {
        const chunk = this.pending.subarray(0, CHUNK);
        this.pending = this.pending.slice(CHUNK);
        out.push(await this.step(chunk));
      }
    } finally {
      this.busy = false;
    }
    return out;
  }

  private async step(chunk: Float32Array): Promise<Record<string, number>> {
    const { ort } = this;
    this.raw = concat(this.raw, chunk);
    if (this.raw.length > 16000 * 2) this.raw = this.raw.slice(this.raw.length - 16000 * 2);

    // 1. mel frames for this chunk (with a little context before it)
    const input = this.raw.subarray(Math.max(0, this.raw.length - CHUNK - CONTEXT));
    const melOut = await this.melSession.run({ input: new ort.Tensor("float32", Float32Array.from(input), [1, input.length]) });
    const spec = melOut[this.melSession.outputNames[0]].data as Float32Array;
    const frames = spec.length / MEL_BINS;
    for (let f = 0; f < frames; f++) {
      const row = new Float32Array(MEL_BINS);
      for (let b = 0; b < MEL_BINS; b++) row[b] = spec[f * MEL_BINS + b] / 10 + 2;
      this.mel.push(row);
    }
    if (this.mel.length > 970) this.mel.splice(0, this.mel.length - 970);

    // 2. one embedding from the last 76 mel frames
    const win = new Float32Array(MEL_WINDOW * MEL_BINS);
    const start = this.mel.length - MEL_WINDOW;
    for (let f = 0; f < MEL_WINDOW; f++) win.set(this.mel[start + f], f * MEL_BINS);
    const embOut = await this.embSession.run({
      input_1: new ort.Tensor("float32", win, [1, MEL_WINDOW, MEL_BINS, 1]),
    });
    this.emb.push(Float32Array.from(embOut[this.embSession.outputNames[0]].data as Float32Array));
    if (this.emb.length > 120) this.emb.splice(0, this.emb.length - 120);

    // 3. each wake-word model on the last 16 embeddings
    const scores: Record<string, number> = {};
    if (this.emb.length < EMB_WINDOW) {
      for (const m of this.models) scores[m.name] = 0;
      return scores;
    }
    const feats = new Float32Array(EMB_WINDOW * EMB_SIZE);
    for (let i = 0; i < EMB_WINDOW; i++) feats.set(this.emb[this.emb.length - EMB_WINDOW + i], i * EMB_SIZE);
    for (const m of this.models) {
      const r = await m.session.run({ [m.input]: new ort.Tensor("float32", feats, [1, EMB_WINDOW, EMB_SIZE]) });
      scores[m.name] = (r[m.session.outputNames[0]].data as Float32Array)[0];
    }
    return scores;
  }

  /** Forget recent audio (after a detection, so it doesn't fire twice). */
  reset() {
    this.emb = [];
    this.pending = new Float32Array(0);
  }
}

function concat(a: Float32Array, b: Float32Array): Float32Array {
  if (!a.length) return b.slice();
  const out = new Float32Array(a.length + b.length);
  out.set(a, 0);
  out.set(b, a.length);
  return out;
}
