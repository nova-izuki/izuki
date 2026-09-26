/**
 * Izuki's ears — speech-to-text that runs on this PC.
 *
 * Why not the webview's built-in `SpeechRecognition`: WebView2 Runtime 153
 * broke it — every session dies at once with a "network" error
 * (WebView2Feedback #5724) — which is exactly the "it says listening, then
 * the waveform vanishes" bug. So Izuki records the mic itself, decides for
 * itself when you've finished talking, and transcribes with Moonshine
 * (a small, fast open speech model) through transformers.js. Free, no
 * account, offline once the ~60 MB model is on disk.
 *
 * The same one mic stream also measures loudness for the voice ring, so the
 * waveform is always your real voice — never a second capture competing
 * with the first.
 */
import { api } from "./ipc";
import { transformers } from "./localModels";

const MODEL = "onnx-community/moonshine-base-ONNX";
const RATE = 16_000;

const log = (m: string) => void api.log(`speech: ${m}`).catch(() => undefined);

// ------------------------------------------------------------ the model

/**
 * "tiny" for wake words and short phrases, "base" for real sentences,
 * "whisper" as the careful second opinion when both hear nothing.
 */
export type ModelSize = "base" | "tiny" | "whisper";
type Transcriber = (audio: Float32Array, size: ModelSize) => Promise<string>;
let model: Promise<Transcriber> | null = null;

/**
 * The models on their own thread (sttWorker.ts), so transcribing never
 * waits behind the voice. Falls back to this thread if workers aren't
 * available.
 */
function workerTranscriber(): Promise<Transcriber> {
  const worker = new Worker(new URL("./sttWorker.ts", import.meta.url), { type: "module" });
  let seq = 0;
  const pending = new Map<number, { ok: (v: string) => void; fail: (e: Error) => void }>();
  worker.onmessage = (e: MessageEvent<{ id: number; ok: boolean; text?: string; error?: string }>) => {
    const p = pending.get(e.data.id);
    if (!p) return;
    pending.delete(e.data.id);
    if (e.data.ok) p.ok(e.data.text ?? "");
    else p.fail(new Error(e.data.error ?? "transcription failed"));
  };
  worker.onerror = (e) => {
    const err = new Error(e.message || "speech worker crashed");
    pending.forEach((p) => p.fail(err));
    pending.clear();
  };
  const ask = (msg: { kind: "load"; size: ModelSize } | { kind: "transcribe"; size: ModelSize; audio: Float32Array }) =>
    new Promise<string>((ok, fail) => {
      const id = ++seq;
      pending.set(id, { ok, fail });
      if (msg.kind === "transcribe") worker.postMessage({ id, ...msg }, [msg.audio.buffer]);
      else worker.postMessage({ id, ...msg });
    });
  // Tiny first — it's what the wake word needs, and it's small.
  return ask({ kind: "load", size: "tiny" })
    .then(() => ask({ kind: "load", size: "base" }))
    .then(
      () => (audio: Float32Array, size: ModelSize) => ask({ kind: "transcribe", size, audio }),
      (e) => {
        worker.terminate();
        throw e;
      }
    );
}

function inlineTranscriber(): Promise<Transcriber> {
  const pipes = new Map<ModelSize, Promise<(a: Float32Array) => Promise<{ text: string } | Array<{ text: string }>>>>();
  const get = (size: ModelSize) => {
    let p = pipes.get(size);
    if (!p) {
      const id = size === "tiny" ? "onnx-community/moonshine-tiny-ONNX" : MODEL;
      p = transformers().then(
        (t) => t.pipeline("automatic-speech-recognition", id, { dtype: "q8", device: "wasm" }) as never
      );
      pipes.set(size, p);
    }
    return p;
  };
  return get("tiny").then(() => async (audio: Float32Array, size: ModelSize) => {
    const out = await (await get(size))(audio);
    return Array.isArray(out) ? out.map((o) => o.text).join(" ") : out.text;
  });
}

/** Start (or join) the one-time model load. Safe to call repeatedly. */
export function preloadSpeechInput(): Promise<Transcriber> {
  if (!model) {
    const began = Date.now();
    log("loading");
    model = workerTranscriber()
      .catch((e) => {
        log(`worker unavailable (${e instanceof Error ? e.message : String(e)}) — transcribing on the main thread`);
        return inlineTranscriber();
      })
      .then((run) => {
        log(`ready (${Math.round((Date.now() - began) / 1000)}s)`);
        return run;
      })
      .catch((e) => {
        model = null; // let a later listen retry
        log(`FAILED — ${e instanceof Error ? `${e.name}: ${e.message}` : String(e)}`);
        throw e;
      });
  }
  return model;
}

/**
 * Things speech models are known to "hear" in near-silence or noise —
 * returned as if you'd said them. Dropped rather than acted on.
 */
const PHANTOMS = /^(\[.*\]|\(.*\)|you|thank you|thanks|thanks for watching|bye|okay|oh|uh|um|hmm|so)[.!?]*$/i;

/**
 * Words from recorded speech. `size: "tiny"` is for the wake word (fast,
 * good on short phrases). Otherwise "base" — and if that comes back empty
 * for a short clip (its known weak spot: "Hey Nova", "yes", "stop"), tiny
 * gets a second go.
 */
/** 16 kHz mono float samples → a WAV file's bytes. */
export function toWav(samples: Float32Array, rate = RATE): Uint8Array {
  const out = new DataView(new ArrayBuffer(44 + samples.length * 2));
  const text = (at: number, s: string) => [...s].forEach((c, i) => out.setUint8(at + i, c.charCodeAt(0)));
  text(0, "RIFF");
  out.setUint32(4, 36 + samples.length * 2, true);
  text(8, "WAVEfmt ");
  out.setUint32(16, 16, true);
  out.setUint16(20, 1, true);
  out.setUint16(22, 1, true);
  out.setUint32(24, rate, true);
  out.setUint32(28, rate * 2, true);
  out.setUint16(32, 2, true);
  out.setUint16(34, 16, true);
  text(36, "data");
  out.setUint32(40, samples.length * 2, true);
  for (let i = 0; i < samples.length; i++) {
    out.setInt16(44 + i * 2, Math.max(-1, Math.min(1, samples[i])) * 0x7fff, true);
  }
  return new Uint8Array(out.buffer);
}

/** Quick words for the live bar: the small model, no logging, no retry. */
export async function transcribePartial(audio: Float32Array): Promise<string> {
  const run = await preloadSpeechInput();
  return (await run(audio, "tiny")).replace(/\s+/g, " ").trim();
}

let whisperBusy = false;

/**
 * Whisper's second opinion on a clip, or null if one is already running
 * (the caller shouldn't wait in line — on a slow laptop each takes 5–8 s).
 */
export async function whisperCheck(audio: Float32Array): Promise<string | null> {
  if (whisperBusy) return null;
  whisperBusy = true;
  const began = Date.now();
  try {
    const run = await preloadSpeechInput();
    let text = (await run(audio, "whisper")).replace(/\s+/g, " ").trim();
    if (/^[[(].*[\])]$|^(you|thank you\.?|\.+)$/i.test(text)) text = "";
    log(`second opinion (whisper) in ${Date.now() - began}ms: "${text.slice(0, 60)}"`);
    return text;
  } finally {
    whisperBusy = false;
  }
}

export async function transcribe(
  audio: Float32Array,
  size: ModelSize = "base",
  o: { whisperFallback?: boolean } = {}
): Promise<string> {
  const run = await preloadSpeechInput();
  const began = Date.now();
  const seconds = (audio.length / RATE).toFixed(1);
  // The worker takes ownership of the buffer it's sent, so keep a copy for
  // a possible second try.
  const spare = size !== "whisper" && audio.length < RATE * 8 ? audio.slice() : null;
  let text = (await run(audio, size)).replace(/\s+/g, " ").trim();
  let used: ModelSize = size;
  if (!text && spare && size === "base" && spare.length < RATE * 4) {
    text = (await run(spare.slice(), "tiny")).replace(/\s+/g, " ").trim();
    used = "tiny";
  }
  // Still nothing: Whisper. Moonshine returned nothing at all for a real
  // Bluetooth-headset "Hey Nova!" that Whisper got right. One at a time,
  // so a noisy room can't queue these up.
  if (!text && spare && !whisperBusy && o.whisperFallback !== false) {
    whisperBusy = true;
    try {
      text = (await run(spare, "whisper")).replace(/\s+/g, " ").trim();
      // Whisper's filler for silence and noise.
      if (/^[[(].*[\])]$|^(you|thank you\.?|\.+)$/i.test(text)) text = "";
      used = "whisper";
    } finally {
      whisperBusy = false;
    }
  }
  log(`heard ${seconds}s in ${Date.now() - began}ms (${used}): "${text.slice(0, 80)}"`);
  // A very short clip that came back as a filler word is almost always noise.
  if (!text || (PHANTOMS.test(text) && Number(seconds) < 1.2)) return "";
  return text;
}

// ------------------------------------------------------------ recording

export interface ListenOptions {
  /** 0..1 loudness, ~20 times a second, for the voice ring. */
  onLevel?: (level: number) => void;
  /** Fired once, the moment speech is first detected. */
  onSpeech?: () => void;
  /** Give up if nobody speaks within this long (ms). 0 = wait forever. */
  noSpeechMs?: number;
  /** How long a pause ends the utterance (ms). */
  silenceMs?: number;
  /** Hard cap on one utterance (ms). */
  maxMs?: number;
  /**
   * Called about every 0.8 s while you're talking with everything said so
   * far — for showing your words live.
   */
  onPartial?: (audioSoFar: Float32Array) => void;
  /**
   * Only count speech that starts after at least this much quiet (ms) —
   * so a listen that begins mid-sentence doesn't grab the tail of
   * someone else's conversation.
   */
  quietFirstMs?: number;
  /**
   * Listening while Izuki is busy (thinking or talking), so you can cut in
   * the way you would with a person. While `busy()` is true the wait for
   * you doesn't count down, and it takes a clearer, longer burst of voice to
   * count as you — Izuki's own voice leaking into the mic mustn't. When you
   * do cut in, `onCutIn` fires (stop talking!) and the listen carries on
   * recording you, from just before you started.
   */
  cutIn?: {
    busy: () => boolean;
    onCutIn: () => void;
    /**
     * Whether cutting in is possible right now. Off while Izuki's voice is
     * coming out of speakers the echo canceller can't see (the Windows
     * voice) — otherwise its own voice in the mic would stop it mid-sentence.
     */
    allowed?: () => boolean;
  };
}

export interface Listening {
  /**
   * Resolves with the recorded utterance (16 kHz mono), or null if nothing
   * was said / it was cancelled. Rejects if the mic couldn't be opened.
   */
  audio: Promise<Float32Array | null>;
  /** "I'm done talking" — end now and keep what was said. */
  finish: () => void;
  /** True once the recording hit `maxMs` — the speaker was still going. */
  readonly cutOff: boolean;
  /**
   * Why it ended: "speech" (you said something), "silence" (nobody spoke
   * for `noSpeechMs`), or "cancelled" (stopped, mic taken away). Only real
   * silence should ever close a conversation.
   */
  readonly endReason: "speech" | "silence" | "cancelled";
  /** Throw it away. */
  cancel: () => void;
}

// ------------------------------------------------------------ which mic

/** Headsets and earbuds, whichever way Windows names them. */
const HEADSET = /hands-?free|headset|headphone|earbud|earphone|airpods|buds|bluetooth/i;
/** Never listen to these by choice — they're loopbacks or app devices. */
const NOT_A_MIC = /virtual|oculus|stereo mix|cable output|voicemeeter|loopback/i;

export interface Mic {
  deviceId: string;
  label: string;
}

/**
 * The real microphones Windows has. Names only show up once the page has
 * been allowed to record, so without them this opens the default mic for
 * a moment first.
 */
export async function listMics(): Promise<Mic[]> {
  const md = navigator.mediaDevices;
  if (!md?.enumerateDevices) return [];
  let devices = (await md.enumerateDevices()).filter((d) => d.kind === "audioinput");
  if (devices.length && !devices.some((d) => d.label)) {
    try {
      const s = await md.getUserMedia({ audio: true });
      s.getTracks().forEach((t) => t.stop());
      devices = (await md.enumerateDevices()).filter((d) => d.kind === "audioinput");
    } catch {
      /* no permission — nothing more to learn */
    }
  }
  // "default"/"communications" are aliases of a real device listed anyway.
  return devices
    .filter((d) => d.deviceId !== "default" && d.deviceId !== "communications")
    .map((d) => ({ deviceId: d.deviceId, label: d.label || "Microphone" }));
}

/**
 * The mic to record from: the one picked in settings (matched by name), or
 * automatically a connected headset — a laptop's own mic is the usual
 * Windows default and the usual one that's broken or too far away.
 * `undefined` = Windows' default.
 */
export async function chooseMic(): Promise<Mic | undefined> {
  const want = ((await api.getSettings().catch(() => null))?.mic_device ?? "").trim().toLowerCase();
  const mics = await listMics().catch(() => [] as Mic[]);
  if (want) {
    const hit = mics.find((m) => m.label.toLowerCase() === want) ?? mics.find((m) => m.label.toLowerCase().includes(want));
    if (hit) return hit;
  }
  const real = mics.filter((m) => !NOT_A_MIC.test(m.label));
  // A headset first; otherwise any real mic. Never fall back to Windows'
  // default blindly — here it had become an Oculus *virtual* mic, which
  // hears nothing, so every "Hey Nova" went unheard.
  return real.find((m) => HEADSET.test(m.label)) ?? real[0];
}

/** Whether this webview can record at all. */
export function canListen() {
  return typeof navigator !== "undefined" && !!navigator.mediaDevices?.getUserMedia;
}

// ------------------------------------------------------------ one mic, kept open

/**
 * The open microphone, shared by every listen in this window.
 *
 * Opening a mic per phrase was causing real trouble: on Bluetooth headsets
 * Windows flips the headphones between "music" and "hands-free call" mode
 * every time a mic opens or closes — which cut Izuki's own voice off
 * mid-reply — and every open clicks and costs ~150 ms. So the mic opens
 * once, stays open while it's being used, and closes a while after the
 * last listen.
 */
interface OpenMic {
  stream: MediaStream;
  ctx: AudioContext;
  source: MediaStreamAudioSourceNode;
  label: string;
  /** Groups a device's mic and speaker — see `micOutputGroup`. */
  groupId: string;
  openedAt: number;
}
let openMic: OpenMic | null = null;
/** Name of the last mic opened — what a reopen would use. */
let lastMicLabel = "";

/**
 * The device group of the mic that's open right now, or null. On a
 * Bluetooth headset an open mic switches it into hands-free ("call") mode,
 * where sound sent to its music channel goes quiet — so Izuki's voice has
 * to play through the same device's call channel (same group) meanwhile.
 */
export function micOutputGroup(): string | null {
  return openMic?.groupId || null;
}
let opening: Promise<OpenMic> | null = null;
let users = 0;
let closeTimer: ReturnType<typeof setTimeout> | null = null;
const LINGER_MS = 30_000;

function closeMic() {
  const m = openMic;
  openMic = null;
  if (!m) return;
  m.stream.getTracks().forEach((t) => t.stop());
  void m.ctx.close().catch(() => undefined);
  log(`mic closed: ${m.label}`);
}

async function acquireMic(): Promise<OpenMic> {
  // Izuki is talking through a Bluetooth headset: wait for it to finish.
  while (voiceHold) await voiceHold;
  users++;
  if (closeTimer) {
    clearTimeout(closeTimer);
    closeTimer = null;
  }
  try {
    const wanted = await chooseMic().catch(() => undefined);
    // A different mic was picked since this one opened — switch over.
    if (openMic && wanted && openMic.label !== wanted.label) closeMic();
    // A track that died (headset switched off) is no use either.
    if (openMic && openMic.stream.getAudioTracks().every((t) => t.readyState === "ended")) closeMic();
    if (openMic) return openMic;
    opening ??= (async () => {
      const began = Date.now();
      const base: MediaTrackConstraints = {
        channelCount: 1,
        // Cancels Izuki's own voice out of the mic, so it doesn't hear itself.
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      };
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: wanted ? { ...base, deviceId: { exact: wanted.deviceId } } : base,
        });
      } catch (e) {
        if (!wanted) throw e;
        // The chosen mic vanished (unplugged headset) — use the default.
        log(`mic "${wanted.label}" unavailable (${e instanceof Error ? e.name : e}) — using the default`);
        stream = await navigator.mediaDevices.getUserMedia({ audio: base });
      }
      // The context resamples the mic to the 16 kHz the model wants.
      const ctx = new AudioContext({ sampleRate: RATE });
      void ctx.resume().catch(() => undefined);
      const m: OpenMic = {
        stream,
        ctx,
        source: ctx.createMediaStreamSource(stream),
        label: stream.getAudioTracks()[0]?.label || "default",
        groupId: stream.getAudioTracks()[0]?.getSettings().groupId ?? "",
        openedAt: Date.now(),
      };
      log(`mic open: ${m.label} (+${m.openedAt - began}ms)`);
      openMic = m;
      lastMicLabel = m.label;
      return m;
    })().finally(() => {
      opening = null;
    });
    const m = await opening;
    // Izuki started talking while the mic was opening: give it back.
    if (voiceHold) {
      closeMic();
      users--;
      return acquireMic();
    }
    return m;
  } catch (e) {
    users--;
    throw e;
  }
}

// ---------------------------------------------------------------- Bluetooth

/** The open mic is a headset/earbuds (so Izuki's voice can't leak into it). */
export function micIsHeadset(): boolean {
  const label = openMic?.label ?? lastMicLabel;
  return HEADSET.test(label) && !NOT_A_MIC.test(label);
}

/** Mics that switch a Bluetooth headset into low-quality "call" mode. */
const BLUETOOTH = /bluetooth|hands-?free|headset|airpods|buds/i;
/** Every listen in progress, by its cancel — so a hold can end them. */
const liveListens = new Set<() => void>();
let voiceHold: Promise<void> | null = null;
let endHold: (() => void) | null = null;
/** How long a headset takes to switch back to full-quality sound. */
const SWITCH_MS = 900;

/**
 * Let go of a Bluetooth mic so Izuki's voice plays in full quality.
 *
 * While any app has a Bluetooth headset's mic open, the headset is in
 * hands-free ("call") mode and *everything* it plays sounds like a phone
 * call — Izuki's natural voice came out robotic. So before a reply is
 * spoken the mic is closed (listening waits), and `releaseMicForVoice`
 * reopens it afterwards. Called as soon as a request goes to the brain,
 * the switch finishes while the model is still thinking. A no-op for
 * wired or built-in mics.
 */
export async function holdMicForVoice(): Promise<void> {
  if (voiceHold) return; // already let go
  // Interrupting by talking needs ears while Izuki talks.
  if (keepMicWhileTalking) return;
  // Decide on the mic that's open, or being opened, or was last used — a
  // listen reopening it right this moment must not slip through.
  const m = openMic ?? (opening ? await opening.catch(() => null) : null);
  const label = m?.label ?? lastMicLabel;
  if (!BLUETOOTH.test(label)) return;
  if (voiceHold) return;
  voiceHold = new Promise<void>((r) => (endHold = r));
  liveListens.forEach((cancel) => cancel());
  const wasOpen = !!openMic;
  closeMic();
  if (wasOpen) {
    log("mic paused so the headset plays Izuki in full quality");
    await new Promise((r) => setTimeout(r, SWITCH_MS));
  }
}

/**
 * Keep the mic open while Izuki talks, so you can talk over it. On a
 * Bluetooth headset that means its voice plays in call quality.
 */
let keepMicWhileTalking = false;
export function setKeepMicWhileTalking(on: boolean) {
  keepMicWhileTalking = on;
  if (on) releaseMicForVoice();
}

/** Izuki is done talking — listening can take the mic back. */
export function releaseMicForVoice() {
  if (!voiceHold) return;
  const end = endHold;
  voiceHold = null;
  endHold = null;
  end?.();
}

/**
 * Headphones connected (or the open mic unplugged): move over straight
 * away, the way a phone does when AirPods connect — not the next time the
 * mic happens to reopen. Ending the live listens makes each one restart,
 * and the restart opens the newly chosen mic.
 */
if (typeof navigator !== "undefined" && navigator.mediaDevices?.addEventListener) {
  let pending: ReturnType<typeof setTimeout> | null = null;
  navigator.mediaDevices.addEventListener("devicechange", () => {
    // Bluetooth devices appear in a few steps; act once they've settled.
    if (pending) clearTimeout(pending);
    pending = setTimeout(async () => {
      pending = null;
      const m = openMic;
      if (!m) return;
      const wanted = await chooseMic().catch(() => undefined);
      const dead = m.stream.getAudioTracks().every((t) => t.readyState === "ended");
      if (!dead && (!wanted || wanted.label === m.label)) return;
      log(`mic change: ${m.label} → ${wanted?.label ?? "default"}`);
      liveListens.forEach((cancel) => cancel());
      closeMic();
    }, 1500);
  });
}

function releaseMic() {
  users = Math.max(0, users - 1);
  if (users === 0 && !closeTimer) {
    closeTimer = setTimeout(() => {
      closeTimer = null;
      if (users === 0) closeMic();
    }, LINGER_MS);
  }
}

/**
 * A continuous feed of the shared mic, 16 kHz mono, for the wake-word
 * detector. Ends (and says so via `onEnd`) when the mic is taken away —
 * e.g. while Izuki talks through a Bluetooth headset — so the caller can
 * start a new one, which waits until the mic is free again.
 */
export function streamMic(onChunk: (samples: Float32Array) => void, onEnd: () => void): () => void {
  let stopped = false;
  let teardown = () => {};
  const stop = () => {
    if (stopped) return;
    stopped = true;
    liveListens.delete(stop);
    teardown();
    onEnd();
  };
  liveListens.add(stop);
  void acquireMic()
    .then((mic) => {
      if (stopped) {
        releaseMic();
        return;
      }
      const proc = mic.ctx.createScriptProcessor(1024, 1, 1);
      const mute = mic.ctx.createGain();
      mute.gain.value = 0;
      mic.source.connect(proc);
      proc.connect(mute);
      mute.connect(mic.ctx.destination);
      proc.onaudioprocess = (e) => onChunk(new Float32Array(e.inputBuffer.getChannelData(0)));
      teardown = () => {
        proc.onaudioprocess = null;
        try {
          mic.source.disconnect(proc);
          proc.disconnect();
          mute.disconnect();
        } catch {
          /* already gone */
        }
        releaseMic();
      };
    })
    .catch(() => stop());
  return stop;
}

/**
 * Record one utterance: waits for you to start talking, then stops by
 * itself once you pause. Trims the silence before you started.
 */
export function listen(opts: ListenOptions = {}): Listening {
  const noSpeechMs = opts.noSpeechMs ?? 8000;
  const quietFirstMs = opts.quietFirstMs ?? 0;
  let cutOff = false;
  const silenceMs = opts.silenceMs ?? 900;
  const maxMs = opts.maxMs ?? 30_000;

  let settle: (v: Float32Array | null) => void = () => {};
  let fail: (e: unknown) => void = () => {};
  const audio = new Promise<Float32Array | null>((resolve, reject) => {
    settle = resolve;
    fail = reject;
  });

  let ended = false;
  let keep = false;
  let endReason: "speech" | "silence" | "cancelled" = "cancelled";
  let teardown: () => void = () => {};
  const end = (keepIt: boolean) => {
    if (ended) return;
    ended = true;
    keep = keepIt;
    if (keepIt) endReason = "speech";
    liveListens.delete(cancelThis);
    teardown();
  };
  const cancelThis = () => end(false);
  liveListens.add(cancelThis);

  void (async () => {
    let mic: OpenMic;
    try {
      mic = await acquireMic();
    } catch (e) {
      log(`mic refused: ${e instanceof Error ? `${e.name}: ${e.message}` : String(e)}`);
      fail(e);
      return;
    }
    if (ended) {
      releaseMic();
      settle(null);
      return;
    }

    const { ctx, source } = mic;
    // ScriptProcessor is deprecated but still the simplest way to get raw
    // samples without shipping a separate worklet file; 1024 frames = 64 ms.
    const proc = ctx.createScriptProcessor(1024, 1, 1);
    const mute = ctx.createGain();
    mute.gain.value = 0;
    source.connect(proc);
    proc.connect(mute);
    mute.connect(ctx.destination);

    const chunks: Float32Array[] = [];
    const chunkMs = (1024 / RATE) * 1000;
    let floor = 0.004; // running estimate of the room's background noise
    let loudRun = 0;
    let speechAt = -1; // index of the chunk where speech began
    let quietMs = 0;
    let elapsed = 0;
    /** Quiet time just before the current loud run (for `quietFirstMs`). */
    let quietRunMs = 0;
    let quietBefore = 0;
    /** Chunks that were actually loud, once speech started. */
    let voiced = 0;
    let lastPartial = 0;
    let waitedWhileBusy = 0;
    /** A freshly opened mic clicks and its gain settles — not speech. */
    const warmupUntil = mic.openedAt + 350;

    proc.onaudioprocess = (e) => {
      if (ended) return;
      const data = new Float32Array(e.inputBuffer.getChannelData(0));
      elapsed += chunkMs;

      // Measured around the chunk's own middle, so a mic driver that sends
      // a signal stuck at full scale reads as silence, not endless speech.
      let mean = 0;
      for (let i = 0; i < data.length; i++) mean += data[i];
      mean /= data.length;
      let sum = 0;
      for (let i = 0; i < data.length; i++) sum += (data[i] - mean) ** 2;
      const rms = Math.sqrt(sum / data.length);
      opts.onLevel?.(Math.min(1, Math.sqrt(rms) * 2.2));
      if (Date.now() < warmupUntil) return;
      // Izuki talking out loud where its own voice can't be told apart from
      // yours: don't count anything as you cutting in (the wait still
      // doesn't run down meanwhile).
      if (speechAt < 0 && opts.cutIn?.busy() && opts.cutIn.allowed && !opts.cutIn.allowed()) {
        waitedWhileBusy += chunkMs;
        return;
      }
      chunks.push(data);

      // Capped, so a room with a TV or people talking doesn't push the bar
      // so high that your own voice stops counting.
      const busy = speechAt < 0 && !!opts.cutIn?.busy();
      // While Izuki talks, its own voice may reach the mic: the bar is
      // relative to that (the floor learns it) and not capped.
      const threshold = busy ? Math.max(0.03, floor * 2.5) : Math.max(0.012, Math.min(floor * 3, 0.045));
      const loud = rms > threshold;
      // Waiting on Izuki doesn't use up your time to answer.
      if (busy) waitedWhileBusy += chunkMs;

      if (speechAt < 0) {
        // Learn the background level only while nobody is talking.
        floor = rms < floor ? floor * 0.8 + rms * 0.2 : floor * 0.98 + rms * 0.02;
        loudRun = loud ? loudRun + 1 : 0;
        // How much quiet came right before this burst of sound — checked
        // before the quiet counter resets for it.
        if (loud && loudRun === 1) quietBefore = quietRunMs >= quietFirstMs ? 1 : 0;
        quietRunMs = loud ? 0 : quietRunMs + chunkMs;
        if (loudRun >= 2 && quietFirstMs && !quietBefore) {
          // Speech already under way when we started listening — let it
          // finish and wait for the next pause.
          loudRun = 0;
        } else if (loudRun >= (busy ? 5 : 2)) {
          // Keep ~300 ms from before the first loud chunk — the start of
          // most words is quieter than the middle.
          speechAt = Math.max(0, chunks.length - loudRun - 5);
          if (busy) opts.cutIn?.onCutIn();
          opts.onSpeech?.();
        } else if (noSpeechMs && elapsed - waitedWhileBusy > noSpeechMs) {
          endReason = "silence";
          end(false);
        } else if (chunks.length > 40) {
          // Still waiting (it can be up to half an hour): only the last
          // moment before you speak is ever needed — don't hoard silence.
          chunks.splice(0, chunks.length - 10);
        }
        return;
      }

      if (loud) voiced++;
      if (opts.onPartial && elapsed - lastPartial >= 800 && voiced >= 4) {
        lastPartial = elapsed;
        const sofar = chunks.slice(speechAt);
        const buf = new Float32Array(sofar.reduce((n, c) => n + c.length, 0));
        let at = 0;
        for (const c of sofar) {
          buf.set(c, at);
          at += c.length;
        }
        opts.onPartial(buf);
      }
      quietMs = rms > threshold * 0.6 ? 0 : quietMs + chunkMs;
      if (quietMs >= silenceMs) end(true);
      else if (elapsed >= maxMs) {
        cutOff = true;
        end(true);
      }
    };

    teardown = () => {
      proc.onaudioprocess = null;
      try {
        source.disconnect(proc);
        proc.disconnect();
        mute.disconnect();
      } catch {
        /* already disconnected */
      }
      releaseMic();
      opts.onLevel?.(0);

      // A blip (a cough, a knock, a click) — not worth transcribing.
      if (!keep || speechAt < 0 || voiced < 4) {
        settle(null);
        return;
      }
      const spoken = chunks.slice(speechAt);
      const out = new Float32Array(spoken.reduce((n, c) => n + c.length, 0));
      let at = 0;
      for (const c of spoken) {
        out.set(c, at);
        at += c.length;
      }
      settle(out.length > RATE * 0.25 ? out : null);
    };
    // A finish/cancel that landed while the mic was still opening.
    if (ended) teardown();
  })().catch((e) => {
    log(`recording failed: ${String(e)}`);
    fail(e);
  });

  return {
    audio,
    finish: () => end(true),
    cancel: () => end(false),
    get cutOff() {
      return cutOff;
    },
    get endReason() {
      return endReason;
    },
  };
}
