/// <reference lib="webworker" />
/**
 * Izuki's natural voice (Kokoro), on its own thread.
 *
 * Generating speech is heavy: on a laptop throttled to battery speeds one
 * short sentence took 20 s. On the panel's main thread that froze
 * everything else in it for as long — listening, push-to-talk, the chat.
 * Here it runs alongside instead, and the main thread only plays audio.
 *
 * Self-contained: a worker has no `window`, so no Tauri IPC in here.
 */
import type { KokoroTTS } from "kokoro-js";

const HOST = "http://izukimodel.localhost/";
const MODEL = "onnx-community/Kokoro-82M-v1.0-ONNX";
/** kokoro-js fetches voices from this exact URL, checking the cache first. */
const HUB_VOICES = "https://huggingface.co/onnx-community/Kokoro-82M-v1.0-ONNX/resolve/main/voices/";
const LOCAL_VOICES = `${HOST}${MODEL}/resolve/main/voices/`;

let tts: Promise<KokoroTTS> | null = null;
const cancelled = new Set<number>();

function load(): Promise<KokoroTTS> {
  tts ??= (async () => {
    const t = await import("@huggingface/transformers");
    t.env.remoteHost = HOST;
    t.env.allowLocalModels = false;
    t.env.useBrowserCache = false;
    const wasm = t.env.backends.onnx.wasm;
    if (wasm) wasm.wasmPaths = `${HOST}ort/`;
    const { KokoroTTS } = await import("kokoro-js");
    return KokoroTTS.from_pretrained(MODEL, { dtype: "q8", device: "wasm" });
  })();
  tts.catch(() => {
    tts = null;
  });
  return tts;
}

/** Put the voice's data where kokoro-js looks first (it can't reach the Hub). */
async function ensureVoice(voice: string) {
  const cache = await caches.open("kokoro-voices");
  if (await cache.match(HUB_VOICES + voice + ".bin")) return;
  const r = await fetch(`${LOCAL_VOICES}${voice}.bin`);
  if (!r.ok) throw new Error(`voice ${voice}: HTTP ${r.status}`);
  await cache.put(HUB_VOICES + voice + ".bin", new Response(await r.arrayBuffer()));
}

type Msg =
  | { id: number; kind: "load"; voice: string }
  | { id: number; kind: "speak"; pieces: string[]; voice: string; speed: number; background?: boolean }
  | { id: number; kind: "cancel" };

const post = (m: unknown, transfer: Transferable[] = []) => self.postMessage(m, transfer);

/**
 * One job at a time. Handled as they arrived, several lines (the short
 * lines rendered at start-up, a reply, "Mhm?") ran on the model at once and
 * none of them finished. Something to say *now* goes ahead of lines being
 * made in the background; a cancel lands immediately.
 */
type Job = Exclude<Msg, { kind: "cancel" }>;
const waiting: Job[] = [];
let busy = false;

self.onmessage = (e: MessageEvent<Msg>) => {
  const msg = e.data;
  if (msg.kind === "cancel") {
    cancelled.add(msg.id);
    return;
  }
  waiting.push(msg);
  void pump();
};

async function pump() {
  if (busy) return;
  busy = true;
  while (waiting.length) {
    const urgent = waiting.findIndex((j) => !(j.kind === "speak" && j.background));
    const [job] = waiting.splice(urgent >= 0 ? urgent : 0, 1);
    await run(job);
  }
  busy = false;
}

/** Silence after a sentence, by how it ends (seconds). */
export function pauseAfter(sentence: string): number {
  const end = sentence.trim().replace(/["'”’)\]]+$/, "");
  if (/(\.\.\.|…)$/.test(end)) return 0.38;
  if (/[?!]$/.test(end)) return 0.3;
  if (/[.。]$/.test(end)) return 0.24;
  if (/[,;:—–-]$/.test(end)) return 0.12;
  return 0.06;
}

function withPause(samples: Float32Array, rate: number, sentence: string): Float32Array {
  const extra = Math.round(pauseAfter(sentence) * rate);
  const out = new Float32Array(samples.length + extra);
  out.set(samples, 0);
  return out;
}

async function run(msg: Job) {
  try {
    if (cancelled.has(msg.id)) {
      post({ id: msg.id, kind: "done" });
      return;
    }
    const model = await load();
    await ensureVoice(msg.voice);
    if (msg.kind === "load") {
      post({ id: msg.id, kind: "loaded" });
      return;
    }
    const began = performance.now();
    let seconds = 0;
    let firstLogged = false;
    post({ id: msg.id, kind: "log", text: `starting "${msg.pieces.join(" ").slice(0, 32)}"${msg.background ? " (background)" : ""}` });
    const { TextSplitterStream } = await import("kokoro-js");
    for (const piece of msg.pieces) {
      // kokoro-js 1.2.1's stream(text) never closes the sentence splitter it
      // makes, so the last sentence — for "Mhm?", the only one — waited
      // forever for more text. Hand it one that's already closed.
      const splitter = new TextSplitterStream();
      splitter.push(piece);
      splitter.close();
      for await (const { text, audio } of model.stream(splitter, { voice: msg.voice as never, speed: msg.speed })) {
        if (!firstLogged) {
          firstLogged = true;
          post({ id: msg.id, kind: "log", text: `first audio in ${Math.round(performance.now() - began)} ms` });
        }
        if (cancelled.has(msg.id)) break;
        // Each sentence comes out on its own, and played back to back they
        // run together like a list being read. A person takes a beat after
        // a full stop, a little more after a question, a breath at a comma.
        const samples = withPause(audio.audio as Float32Array, audio.sampling_rate, String(text ?? ""));
        seconds += samples.length / audio.sampling_rate;
        post({ id: msg.id, kind: "chunk", samples, rate: audio.sampling_rate }, [samples.buffer]);
      }
      if (cancelled.has(msg.id)) break;
    }
    const text = msg.pieces.join(" ");
    post({
      id: msg.id,
      kind: "log",
      text: `made "${text.slice(0, 32)}" (${seconds.toFixed(1)} s of speech) in ${Math.round(performance.now() - began)} ms${cancelled.has(msg.id) ? " — cancelled" : ""}`,
    });
    post({ id: msg.id, kind: "done" });
  } catch (err) {
    post({ id: msg.id, kind: "error", error: err instanceof Error ? `${err.name}: ${err.message}` : String(err) });
  } finally {
    cancelled.delete(msg.id);
  }
}
