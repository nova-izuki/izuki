/**
 * Izuki's natural voice — Kokoro-82M, an open neural TTS model, running on
 * the user's own PC. Free, no account, works offline once the model
 * (~90 MB) has downloaded the first time.
 *
 * The model runs in its own worker (ttsWorker.ts): generating speech is
 * heavy, and on the panel's main thread it froze listening and the chat
 * for as long as it took. This module plays what the worker makes.
 *
 * Why not the Web Speech API: WebView2 only exposes Windows' old desktop
 * voices to `speechSynthesis` — the natural "Online" voices Edge has are
 * missing there (WebView2Feedback #2660) — so it always sounded robotic.
 */
import { api } from "./ipc";

let ready = false;

export interface VoiceStatus {
  state: "idle" | "loading" | "ready" | "failed";
  /** 0–100 while downloading. */
  progress: number;
  error: string | null;
}

let status: VoiceStatus = { state: "idle", progress: 0, error: null };
const listeners = new Set<(s: VoiceStatus) => void>();

function setStatus(next: Partial<VoiceStatus>) {
  status = { ...status, ...next };
  listeners.forEach((l) => l(status));
}

/** Follow the natural voice's download/ready state (for the Settings line). */
export function onVoiceStatus(l: (s: VoiceStatus) => void): () => void {
  listeners.add(l);
  l(status);
  return () => listeners.delete(l);
}
let ctx: AudioContext | null = null;
/** Bumped by every new utterance and by stop(), so stale ones go quiet. */
let generation = 0;
let playing: AudioBufferSourceNode[] = [];

let preferredVoice = "af_heart";

// ---- the worker ------------------------------------------------------------

type WorkerReply =
  | { id: number; kind: "loaded" }
  | { id: number; kind: "chunk"; samples: Float32Array; rate: number }
  | { id: number; kind: "done" }
  | { id: number; kind: "error"; error: string }
  | { id: number; kind: "log"; text: string };

let worker: Worker | null = null;
let seq = 0;
const handlers = new Map<number, (m: WorkerReply) => void>();

function voiceWorker(): Worker {
  if (!worker) {
    worker = new Worker(new URL("./ttsWorker.ts", import.meta.url), { type: "module" });
    worker.onmessage = (e: MessageEvent<WorkerReply>) => {
      if (e.data.kind === "log") void api.log(`voice: ${e.data.text}`);
      else handlers.get(e.data.id)?.(e.data);
    };
    worker.onerror = (e) => {
      const error = e.message || "voice worker crashed";
      handlers.forEach((h, id) => h({ id, kind: "error", error }));
      handlers.clear();
      worker = null;
      loading = null;
      ready = false;
    };
  }
  return worker;
}

/**
 * Generate `pieces` in the worker; `onChunk` gets each sentence's audio as
 * it's ready. Resolves when all are done (or rejects on an error). Returns
 * a cancel function via `onStart`.
 */
function generate(
  pieces: string[],
  voice: string,
  speed: number,
  onChunk: (samples: Float32Array, rate: number) => void,
  background = false
): { done: Promise<void>; cancel: () => void } {
  const id = ++seq;
  const w = voiceWorker();
  let finish = () => {};
  const done = new Promise<void>((resolve, reject) => {
    finish = resolve;
    handlers.set(id, (m) => {
      if (m.kind === "chunk") onChunk(m.samples, m.rate);
      else if (m.kind === "done") {
        handlers.delete(id);
        resolve();
      } else if (m.kind === "error") {
        handlers.delete(id);
        reject(new Error(m.error));
      }
    });
  });
  w.postMessage({ id, kind: "speak", pieces, voice, speed, background });
  const job = {
    done,
    // Cancelled counts as finished — whoever awaits `done` must not wait
    // forever for a line that was cut off.
    cancel: () => {
      w.postMessage({ id, kind: "cancel" });
      handlers.delete(id);
      finish();
    },
  };
  // Lines being spoken stop with the voice; lines made ahead of time
  // (renderLine) run to the end.
  if (!background) {
    speaking_jobs.add(job.cancel);
    void done.catch(() => undefined).finally(() => speaking_jobs.delete(job.cancel));
  }
  return job;
}

/** Cancels for the lines being made to be spoken now. */
const speaking_jobs = new Set<() => void>();

let loading: Promise<void> | null = null;

/** Start (or join) the one-time model load. Safe to call repeatedly. */
export function preloadNaturalVoice(voice?: string): Promise<void> {
  if (voice) preferredVoice = voice;
  if (!loading) {
    setStatus({ state: "loading", error: null });
    void api.log("natural voice: loading");
    const began = Date.now();
    loading = new Promise<void>((resolve, reject) => {
      const id = ++seq;
      handlers.set(id, (m) => {
        handlers.delete(id);
        if (m.kind === "loaded") resolve();
        else if (m.kind === "error") reject(new Error(m.error));
      });
      voiceWorker().postMessage({ id, kind: "load", voice: preferredVoice });
    })
      .then(() => {
        ready = true;
        setStatus({ state: "ready", progress: 100 });
        void api.log(`natural voice: ready (${Math.round((Date.now() - began) / 1000)}s)`);
      })
      .catch((e) => {
        loading = null; // let a later call retry
        const msg = e instanceof Error ? e.message : String(e);
        setStatus({ state: "failed", error: msg });
        void api.log(`natural voice: FAILED — ${msg}`);
        throw e;
      });
  }
  return loading;
}

/** Whether the model is loaded and speech will start near-instantly. */
export function naturalVoiceReady() {
  return ready;
}

// ---- how fast this PC makes speech ------------------------------------------

/**
 * Seconds of work per second of speech, smoothed. Under 1 the voice keeps
 * up with itself; far over (a laptop on battery managed 7–16) and every
 * reply stalls between sentences for many seconds.
 */
/** Remembered between launches, so Izuki knows from the first word (no 12 s check at startup). */
const SPEED_KEY = "izuki.voiceSpeed";
function loadSpeed(): { rtf: number; at: number } | null {
  try {
    const v = JSON.parse(localStorage.getItem(SPEED_KEY) ?? "null");
    // A week-old reading is still a good first guess; it's refreshed when idle.
    return v && typeof v.rtf === "number" && Date.now() - v.at < 7 * 24 * 3600_000 ? v : null;
  } catch {
    return null;
  }
}
function saveSpeed() {
  try {
    localStorage.setItem(SPEED_KEY, JSON.stringify({ rtf, at: Date.now() }));
  } catch {
    /* private mode — measure again next time */
  }
}
const known = loadSpeed();
let rtf = known?.rtf ?? 0;
let rtfSamples = known ? 1 : 0;
function noteSpeed(workMs: number, audioSeconds: number) {
  if (audioSeconds <= 0.2) return;
  const r = workMs / 1000 / audioSeconds;
  rtf = rtfSamples ? rtf * 0.6 + r * 0.4 : r;
  rtfSamples++;
  saveSpeed();
}

/** True when this PC can't generate the natural voice fast enough right now. */
export function naturalVoiceTooSlow(): boolean {
  return rtfSamples > 0 && rtf > 1.6;
}

export function naturalVoiceSpeed(): number | null {
  return rtfSamples ? rtf : null;
}

let lastProbe = Date.now();
let probeTimer: ReturnType<typeof setTimeout> | null = null;
/**
 * Time a short line in the background (nothing plays) to learn how fast
 * this PC is right now. It changes: plugged in vs on battery was 3–4× here.
 * On a slow PC one check is ~12 s of heavy CPU — it used to run every few
 * minutes *while you were talking to Izuki* and make everything lag. Now:
 * at most every 20 minutes, and only after a minute with no speaking.
 */
export function probeVoiceSpeed(voice = preferredVoice) {
  if (!ready || Date.now() - lastProbe < 20 * 60_000 || probeTimer) return;
  probeTimer = setTimeout(() => {
    probeTimer = null;
    if (speakingNow || streamOpen) return; // busy — try again another time
    lastProbe = Date.now();
    probeNow(voice);
  }, 60_000);
}

function probeNow(voice: string) {
  // On battery the answer is "still too slow", and finding out costs
  // seconds of heavy CPU — only re-check once the charger is in.
  const nav = navigator as Navigator & { getBattery?: () => Promise<{ charging: boolean }> };
  if (nav.getBattery && rtfSamples) {
    void nav.getBattery().then((b) => {
      if (b.charging) runProbe(voice);
    }).catch(() => runProbe(voice));
    return;
  }
  runProbe(voice);
}

function runProbe(voice: string) {
  const began = performance.now();
  void renderLine("Alright, I can do that for you.", voice)
    .then(({ samples, rate }) => {
      const secs = samples.length / rate;
      const r = (performance.now() - began) / 1000 / secs;
      // A fresh reading replaces the old one outright — the point is to
      // notice the laptop being plugged back in.
      rtf = r;
      rtfSamples = Math.max(1, rtfSamples);
      saveSpeed();
      void api.log(`voice: speed check ${r.toFixed(1)}× real time`);
    })
    .catch(() => undefined);
}

// ---- speaking state + live output level (drives the "responding" orb) ----

let analyser: AnalyserNode | null = null;
let levelBuf: Float32Array<ArrayBuffer> | null = null;
/** True while a stream is still producing chunks for the current utterance. */
let streamOpen = false;
let speakingNow = false;
const speakingListeners = new Set<(speaking: boolean) => void>();

function setSpeaking(v: boolean) {
  if (v === speakingNow) return;
  speakingNow = v;
  speakingListeners.forEach((l) => l(v));
}

/** Follow when the natural voice starts and stops actually playing. */
export function onNaturalSpeaking(l: (speaking: boolean) => void): () => void {
  speakingListeners.add(l);
  return () => speakingListeners.delete(l);
}

export function naturalSpeaking() {
  return speakingNow;
}

/** What Izuki is saying right now — to recognise its own voice in the mic. */
let saying = "";

/**
 * Whether something the mic heard is just Izuki's own reply coming back
 * (speakers, or a headset's echo). Mostly the same words as the line being
 * spoken → ignore it; "Hey Izuki, stop" still gets through.
 */
export function isEchoOfMe(heard: string): boolean {
  if (!speakingNow || !saying) return false;
  const words = heard.toLowerCase().match(/[a-z']+/g) ?? [];
  if (words.length < 2) return true;
  const mine = new Set(saying.toLowerCase().match(/[a-z']+/g) ?? []);
  const hits = words.filter((w) => mine.has(w)).length;
  return hits / words.length >= 0.6;
}

/** How loud the voice is right now, 0..1 — for the "responding" waveform. */
export function naturalOutputLevel(): number {
  if (!analyser || !levelBuf || !speakingNow) return 0;
  analyser.getFloatTimeDomainData(levelBuf);
  let sum = 0;
  for (let i = 0; i < levelBuf.length; i++) sum += levelBuf[i] * levelBuf[i];
  return Math.min(1, Math.sqrt(Math.sqrt(sum / levelBuf.length)) * 1.8);
}

/**
 * Silence the voice. `why` goes in the log whenever this actually cuts
 * something off — a reply that "stops halfway" is always one of these.
 */
export function stopNatural(why = "stopped") {
  if (speakingNow || streamOpen) void api.log(`voice: cut off — ${why}`);
  generation++;
  streamOpen = false;
  // Stop making the rest too: the worker does one line at a time, and the
  // next thing to say shouldn't wait behind a reply nobody will hear.
  for (const cancel of [...speaking_jobs]) cancel();
  for (const s of playing) {
    try {
      s.stop();
    } catch {
      /* already ended */
    }
  }
  playing = [];
  setSpeaking(false);
}

// ---- feeling in the voice ------------------------------------------------

/**
 * How each mood is delivered by the on-device voice: pace and energy only.
 * (Shifting pitch by resampling was tried and made it sound less human —
 * it moves the formants too, the "chipmunk" effect. The cloud voices take
 * the mood natively instead.)
 */
const MOODS: Record<string, { speed: number; gain: number }> = {
  neutral: { speed: 1.0, gain: 1 },
  cheerful: { speed: 1.04, gain: 1.04 },
  excited: { speed: 1.1, gain: 1.1 },
  playful: { speed: 1.05, gain: 1.04 },
  curious: { speed: 1.0, gain: 1 },
  calm: { speed: 0.94, gain: 0.92 },
  serious: { speed: 0.96, gain: 0.98 },
  sympathetic: { speed: 0.92, gain: 0.9 },
};

/** The shared output: one AudioContext, one analyser (for the level meter). */
async function output(): Promise<{ ctx: AudioContext; out: AnalyserNode } | null> {
  ctx ??= new AudioContext();
  // resume() can stay pending forever (a hidden window, audio device
  // switching) instead of failing — never let a line wait on it.
  if (ctx.state === "suspended") {
    await Promise.race([ctx.resume().catch(() => undefined), new Promise((r) => setTimeout(r, 800))]);
  }
  // Chromium's autoplay rule can keep audio blocked in a window nobody has
  // clicked; then let the caller fall back to the system voice, not silence.
  if (ctx.state !== "running") {
    void api.log(`natural voice: audio output blocked (AudioContext ${ctx.state}) — Windows voice this time`);
    return null;
  }
  if (!analyser) {
    analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    analyser.connect(ctx.destination);
    levelBuf = new Float32Array(analyser.fftSize);
  }
  return { ctx, out: analyser };
}

/**
 * Plays one utterance chunk by chunk, gap-free, and keeps the shared
 * speaking state right. `push` returns false once the utterance was
 * superseded (stop, or a newer line).
 */
function player(mine: number, ctx: AudioContext, out: AnalyserNode, gainValue: number, onStart?: () => void) {
  let at = 0; // when the next chunk should start, in ctx time
  let started = false;
  streamOpen = true;
  return {
    get started() {
      return started;
    },
    push(buf: AudioBuffer): boolean {
      if (mine !== generation) return false;
      const src = ctx.createBufferSource();
      src.buffer = buf;
      const level = ctx.createGain();
      level.gain.value = gainValue;
      src.connect(level).connect(out);
      at = Math.max(at, ctx.currentTime + 0.02);
      src.start(at);
      at += buf.duration;
      playing.push(src);
      src.onended = () => {
        playing = playing.filter((p) => p !== src);
        if (!playing.length && !streamOpen && mine === generation) setSpeaking(false);
      };
      if (!started) {
        started = true;
        setSpeaking(true);
        onStart?.();
      }
      return true;
    },
    done() {
      if (mine === generation) {
        streamOpen = false;
        if (!playing.length) setSpeaking(false);
      }
    },
  };
}

// ---- short lines, ready before they're needed -----------------------------

/** "Mhm?", "Okay!", "On it." — rendered ahead of time, keyed by voice + text. */
const ready_lines = new Map<string, AudioBuffer>();
const lineKey = (voice: string, text: string) => `${voice}|${text}`;
const LINE_CACHE = "izuki-lines-v1";
const lineUrl = (voice: string, text: string) => `https://izuki.lines/${encodeURIComponent(voice)}/${encodeURIComponent(text)}`;

/** Whether `text` is one of the pre-rendered lines (instant, whatever the PC). */
export function lineReady(voice: string, text: string): boolean {
  return ready_lines.has(lineKey(voice, text));
}

/** Make the whole of `text` in one go (for short lines). */
function renderLine(text: string, voice: string): Promise<{ samples: Float32Array; rate: number }> {
  const parts: Float32Array[] = [];
  let rate = 24000;
  const job = generate(
    [text],
    voice,
    1,
    (samples, r) => {
      parts.push(samples);
      rate = r;
    },
    true
  );
  return job.done.then(() => {
    const out = new Float32Array(parts.reduce((n, p) => n + p.length, 0));
    let at = 0;
    for (const p of parts) {
      out.set(p, at);
      at += p.length;
    }
    return { samples: out, rate };
  });
}

/**
 * Have short, often-said lines ready so saying them is instant — "Hey
 * Izuki" → "Mhm?" with no wait. Rendered once, then kept on disk (browser
 * cache) so later launches don't spend the CPU again.
 */
export async function prepareLines(lines: string[], voice: string) {
  // Lines already made (on disk) don't need the model at all — only missing
  // ones do, and only on a PC fast enough to use the natural voice.
  const o = await output().catch(() => null);
  if (!o) return;
  let cache: Cache | null = null;
  try {
    cache = await caches.open(LINE_CACHE);
  } catch {
    /* no cache — render them each launch */
  }
  let rendered = 0;
  for (const text of lines) {
    const key = lineKey(voice, text);
    if (ready_lines.has(key)) continue;
    try {
      let samples: Float32Array;
      let rate: number;
      const hit = await cache?.match(lineUrl(voice, text));
      if (hit) {
        rate = Number(hit.headers.get("x-rate") ?? 24000);
        samples = new Float32Array(await hit.arrayBuffer());
      } else {
        if (naturalVoiceTooSlow()) continue; // said by the quick voice instead
        await preloadNaturalVoice(voice);
        const began = performance.now();
        ({ samples, rate } = await renderLine(text, voice));
        noteSpeed(performance.now() - began, samples.length / rate);
        rendered++;
        await cache
          ?.put(lineUrl(voice, text), new Response(samples.slice().buffer, { headers: { "x-rate": String(rate) } }))
          .catch(() => undefined);
      }
      const buf = o.ctx.createBuffer(1, samples.length, rate);
      buf.copyToChannel(samples as Float32Array<ArrayBuffer>, 0);
      ready_lines.set(key, buf);
    } catch {
      /* it'll just be generated live when needed */
    }
  }
  // Everything came from the disk cache: still learn how fast this PC is.
  if (!rtfSamples && ready) probeVoiceSpeed(voice);
  void api.log(
    `voice: ${ready_lines.size} short lines ready (${rendered} made now${rtfSamples ? `, speed ${rtf.toFixed(1)}× real time` : ""})`
  );
}

/**
 * Speak `text` in the natural voice. Resolves `false` straight away if the
 * model isn't loaded yet (the caller falls back to the system voice; the
 * load carries on in the background for next time). `onStart` fires the
 * moment the first audio actually plays — captions sync to that. `mood`
 * sets the pace and energy (see MOODS).
 */
export async function speakNatural(
  text: string,
  voice: string,
  onStart?: () => void,
  mood?: string | null,
  /** The character's pace (1 = as made). */
  pace = 1
): Promise<boolean> {
  // A line made ahead of time plays without the model — even on a PC too
  // slow to run it ("Mhm?" is instant and natural either way).
  if (!ready && !ready_lines.has(lineKey(voice, text))) {
    // Known too slow: don't load a model that won't be used (it cost ~10 s
    // of CPU at every start).
    if (naturalVoiceTooSlow()) return false;
    void api.log(`natural voice: not ready (${status.state} ${status.progress}%) — Windows voice this time`);
    void preloadNaturalVoice().catch(() => undefined);
    return false;
  }
  // Claim the voice before any await: two lines started close together
  // ("On it." and then the answer) used to finish their setup in either
  // order, and the loser's late stop cut the other off mid-sentence.
  stopNatural("a newer line started");
  const mine = generation;
  saying = text;
  const o = await output();
  if (!o) return false;
  if (mine !== generation) return true; // something newer took over

  const m = MOODS[mood ?? ""] ?? MOODS.neutral;
  const play = player(mine, o.ctx, o.out, m.gain, onStart);
  const cached = ready_lines.get(lineKey(voice, text));
  if (cached) {
    play.push(cached);
    play.done();
    return true;
  }

  // Kokoro reads at most ~510 phonemes at a time and silently drops the
  // rest, so it gets pieces, never the whole reply.
  let last = performance.now();
  const job = generate(splitForSpeech(text, 280), voice, m.speed * pace, (samples, rate) => {
    const now = performance.now();
    noteSpeed(now - last, samples.length / rate);
    last = now;
    const buf = o.ctx.createBuffer(1, samples.length, rate);
    buf.copyToChannel(samples as Float32Array<ArrayBuffer>, 0);
    if (!play.push(buf)) job.cancel(); // superseded or stopped
  });
  // Nothing heard for too long (the PC is busy): let the instant Windows
  // voice say it — a quick "Mhm?" matters more than which voice says it.
  // The first sentence should be ready within about its own length (a
  // person speaks ~15 characters a second); a little slack, 2.5–5 s at most.
  const firstSentence = splitForSpeech(text, 280)[0] ?? text;
  const patience = Math.min(5000, Math.max(2500, (firstSentence.length / 15) * 1000 * 1.3));
  let gaveUp = false;
  const slow = setTimeout(() => {
    if (play.started || mine !== generation) return;
    void api.log(`natural voice: nothing after ${Math.round(patience)} ms — Windows voice for "${text.slice(0, 32)}"`);
    gaveUp = true;
    // That's a measurement too: at least this slow. Remembered, so the next
    // lines go straight to the quick voice instead of waiting again.
    noteSpeed(patience, Math.max(0.5, firstSentence.length / 15));
    stopNatural("too slow to start");
  }, patience);
  try {
    await job.done;
    // Gave up waiting → the Windows voice says it. Replaced by a newer line
    // → say nothing.
    if (gaveUp) return false;
  } catch (e) {
    void api.log(`natural voice: speaking failed — ${e instanceof Error ? e.message : String(e)}`);
    if (!play.started) return false; // nothing played: let the Windows voice say it
  } finally {
    clearTimeout(slow);
    play.done();
  }
  if (rtfSamples) void api.log(`voice: speed ${rtf.toFixed(1)}× real time`);
  return true;
}

// ---- cloud voices (tts.rs) ----------------------------------------------

/**
 * Break a reply into sentences short enough for a cloud voice (Orpheus
 * reads at most 200 characters a request). Long sentences split at commas,
 * then at spaces.
 */
export function splitForSpeech(text: string, max = 180): string[] {
  const sentences = text.replace(/\s+/g, " ").trim().match(/[^.!?…]+[.!?…]*["')\]]*\s*/g) ?? [];
  const out: string[] = [];
  const pushPiece = (piece: string) => {
    let rest = piece.trim();
    while (rest.length > max) {
      let cut = rest.lastIndexOf(", ", max);
      if (cut < max * 0.4) cut = rest.lastIndexOf(" ", max);
      if (cut <= 0) cut = max;
      out.push(rest.slice(0, cut + 1).trim());
      rest = rest.slice(cut + 1).trim();
    }
    if (rest) out.push(rest);
  };
  // Merge very short sentences ("Oh!" "Okay.") into the next, so each
  // request carries enough to sound natural.
  let carry = "";
  for (const s of sentences) {
    const joined = carry ? `${carry} ${s.trim()}` : s.trim();
    if (joined.length < 40 && s !== sentences[sentences.length - 1]) {
      carry = joined;
      continue;
    }
    carry = "";
    pushPiece(joined);
  }
  if (carry) pushPiece(carry);
  return out;
}

/** Join sentences back up to `max` characters — fewer, fuller requests. */
function packPieces(pieces: string[], max: number): string[] {
  const out: string[] = [];
  for (const p of pieces) {
    const last = out[out.length - 1];
    if (last && last.length + 1 + p.length <= max) out[out.length - 1] = `${last} ${p}`;
    else out.push(p);
  }
  return out;
}

/**
 * Speak `text` in a cloud voice ("orpheus", "openai", "gemini" or "edge"), sentence by
 * sentence: the first starts playing as soon as it arrives while the next
 * is already being made. Resolves `false` if nothing could be played (no
 * key, no credits, offline) so the caller can fall back to the local voice.
 */
export async function speakCloud(
  engine: string,
  text: string,
  mood?: string | null,
  onStart?: () => void
): Promise<boolean> {
  const pieces = cloudPieces(engine, text);
  if (!pieces.length) return true;
  stopNatural("a newer line started");
  const mine = generation;
  saying = text;
  const o = await output();
  if (!o) return false;
  if (mine !== generation) return true;
  const play = player(mine, o.ctx, o.out, 1, onStart);

  const fetchOne = (piece: string) => {
    const p = fetchAudio(engine, piece, mood).then((bytes) => o.ctx.decodeAudioData(bytes.slice(0)));
    p.catch(() => undefined); // awaited below; don't report it twice
    return p;
  };
  // Two requests in flight: the next sentence is ready by the time the
  // current one finishes playing.
  const queue: Array<Promise<AudioBuffer>> = [];
  let next = 0;
  let played = 0;
  const pump = () => {
    while (queue.length < 2 && next < pieces.length) queue.push(fetchOne(pieces[next++]));
  };
  pump();
  try {
    while (queue.length) {
      const buf = await queue.shift()!;
      pump();
      if (!play.push(buf)) return true;
      played++;
    }
  } catch (e) {
    void api.log(`cloud voice (${engine}): ${e instanceof Error ? e.message : String(e)}`);
    lastCloudError = e instanceof Error ? e.message : String(e);
    if (!play.started) return false;
    // Ran out partway (a rate limit, a dropped connection): finish the
    // reply in the on-device voice rather than going quiet mid-thought.
    if (ready) {
      const rest = pieces.slice(played).flatMap((p) => splitForSpeech(p, 280));
      const job = generate(rest, preferredVoice, 1, (samples, rate) => {
        const buf = o.ctx.createBuffer(1, samples.length, rate);
        buf.copyToChannel(samples as Float32Array<ArrayBuffer>, 0);
        if (!play.push(buf)) job.cancel();
      });
      await job.done.catch(() => undefined);
    }
  } finally {
    play.done();
  }
  return true;
}

/**
 * How a reply is cut up for a cloud voice. Orpheus reads at most 200
 * characters a request, so it gets a sentence or two at a time. The natural
 * voices read long passages beautifully — a sentence break inside one
 * request gets a real, breathing pause, and the tune carries across — so
 * they get the first sentence alone (it starts talking sooner), then the
 * rest in long runs.
 */
function cloudPieces(engine: string, text: string): string[] {
  // Gemini's free allowance counts requests, and it reads long passages
  // well: a whole reply in as few requests as possible.
  if (engine === "gemini") return packPieces(splitForSpeech(text, 400), 900);
  // Azure is the Natural voices through Microsoft's own door: the same
  // long, breathing runs suit it.
  if (engine !== "edge" && engine !== "azure") return packPieces(splitForSpeech(text), 180);
  const sentences = splitForSpeech(text, 400);
  if (sentences.length <= 1) return sentences;
  return [sentences[0], ...packPieces(sentences.slice(1), 700)];
}

/** Audio already asked for, so the next line is ready the moment it's needed. */
const prefetched = new Map<string, Promise<ArrayBuffer>>();
const fetchKey = (engine: string, piece: string, mood?: string | null) => `${engine}|${mood ?? ""}|${piece}`;

function fetchAudio(engine: string, piece: string, mood?: string | null): Promise<ArrayBuffer> {
  const key = fetchKey(engine, piece, mood);
  const early = prefetched.get(key);
  if (early) {
    prefetched.delete(key);
    return early;
  }
  return api.speakCloud(engine, piece, mood);
}

/**
 * Start making a line's audio now, while the one before it is still being
 * said — the gap between sentences disappears. Harmless if it's never used.
 */
export function prefetchCloud(engine: string, text: string, mood?: string | null) {
  if (!["edge", "orpheus", "openai", "gemini", "azure", "elevenlabs"].includes(engine) || !text.trim()) return;
  for (const piece of cloudPieces(engine, text).slice(0, 2)) {
    const key = fetchKey(engine, piece, mood);
    if (prefetched.has(key)) continue;
    const p = api.speakCloud(engine, piece, mood);
    p.catch(() => prefetched.delete(key));
    prefetched.set(key, p);
  }
  // Only the latest few matter.
  while (prefetched.size > 8) prefetched.delete(prefetched.keys().next().value as string);
}

/**
 * Play a clip (a voice preview) through the same output, so it stops with
 * everything else and moves the orb. Resolves when it's done.
 */
export async function playClip(bytes: ArrayBuffer): Promise<void> {
  stopNatural("a preview started");
  const mine = generation;
  const o = await output();
  if (!o) throw new Error("audio output is blocked — click anywhere in Izuki, then try again");
  const buf = await o.ctx.decodeAudioData(bytes.slice(0));
  if (mine !== generation) return;
  const play = player(mine, o.ctx, o.out, 1);
  play.push(buf);
  play.done();
  await new Promise((r) => setTimeout(r, buf.duration * 1000 + 60));
}

/** Why the last cloud voice attempt failed — shown once as a caption. */
export let lastCloudError: string | null = null;

/** Voices worth offering — Kokoro's best-rated English ones. */
export const NATURAL_VOICES: Array<{ id: string; label: string }> = [
  { id: "af_heart", label: "Heart — warm (US)" },
  { id: "af_bella", label: "Bella — bright (US)" },
  { id: "af_nicole", label: "Nicole — soft (US)" },
  { id: "am_michael", label: "Michael — calm (US)" },
  { id: "am_fenrir", label: "Fenrir — deep (US)" },
  { id: "bf_emma", label: "Emma — British" },
  { id: "bm_george", label: "George — British" },
];
