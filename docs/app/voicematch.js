// Voice match for the phone (optional): "Hey Nova" only goes on to act when
// it sounds like someone who taught Izuki their voice — the way a phone
// assistant learns its owner's voice. Off until the person turns it on.
//
// The same model and rules as the PC (src/lib/speakers.ts, speakerMath.ts):
// WavLM speaker vectors, three recordings per person, and at least two of the
// three must agree above 0.85, so one noisy take can't let every voice in.
// Only the 512 numbers of each voice template are kept (in this phone's
// storage); recordings and words are never kept. The model (about 95 MB) is
// downloaded once, only when the person turns this on.
//
// It is not a lock: a recording of the person, or someone with a very
// similar voice, can still match. It keeps the TV, a podcast and other
// people from starting things.
(() => {
  "use strict";
  const KEY = "izuki.wake-speakers.v1";
  const THRESHOLD = 0.85;
  const MODEL = "Xenova/wavlm-base-plus-sv";
  const LIB = "https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1/dist/transformers.min.js";

  // ---- the maths (pure, tested in tools/phone-check/voicematch.test.cjs) ----

  function unitVector(values) {
    if (!values || values.length !== 512) throw new Error("Invalid voice template.");
    const v = Array.from(values);
    if (v.some((n) => !Number.isFinite(n))) throw new Error("Invalid voice template.");
    const norm = Math.hypot(...v);
    if (norm < 1e-8) throw new Error("No clear voice was captured. Try again closer to the microphone.");
    return v.map((n) => n / norm);
  }

  function similarity(a, b) {
    if (!a || !b || a.length !== 512 || b.length !== 512) return -1;
    let sum = 0;
    for (let i = 0; i < 512; i++) sum += a[i] * b[i];
    return sum;
  }

  /** The enrolled person this voice is, or null: two of three takes must agree. */
  function matching(vector, profiles) {
    let best = THRESHOLD, found = null;
    for (const p of profiles || []) {
      const scores = (p.samples || []).map((s) => similarity(vector, s)).sort((a, b) => b - a);
      if (scores.length >= 3 && scores[1] >= best) { best = scores[1]; found = { id: p.id, name: p.name, score: scores[1] }; }
    }
    return found;
  }

  function parse(raw) {
    if (!raw) return { enabled: false, profiles: [] };
    const data = JSON.parse(raw);
    if (!data || typeof data.enabled !== "boolean" || !Array.isArray(data.profiles) || data.profiles.length > 12) throw new Error("Voice profiles could not be read.");
    const profiles = data.profiles.map((p) => {
      if (typeof p.id !== "string" || !p.id || typeof p.name !== "string" || !p.name.trim() || p.name.length > 60 || !Array.isArray(p.samples) || p.samples.length !== 3) throw new Error("Invalid voice profile.");
      return { id: p.id, name: p.name, samples: p.samples.map(unitVector) };
    });
    if (new Set(profiles.map((p) => p.id)).size !== profiles.length) throw new Error("Duplicate voice profiles.");
    return { enabled: data.enabled, profiles };
  }

  /** Trim quiet margins, require speech, cap the work at four seconds of 16 kHz audio. */
  function speechOnly(audio) {
    const input = audio.slice(-64000);
    let first = -1, last = 0, voiced = 0;
    for (let at = 0; at + 320 <= input.length; at += 320) {
      let sum = 0;
      for (let i = at; i < at + 320; i++) sum += input[i] ** 2;
      if (Math.sqrt(sum / 320) > 0.008) { if (first < 0) first = at; last = at + 320; voiced += 320; }
    }
    if (voiced < 8000 || first < 0) throw new Error("Not enough clear speech. Say the whole phrase and try again.");
    return input.slice(Math.max(0, first - 1600), Math.min(input.length, last + 1600));
  }

  // ---- storage --------------------------------------------------------------

  function read() {
    try { return parse(localStorage.getItem(KEY)); } catch { return { enabled: false, profiles: [] }; }
  }
  function save(value) {
    const checked = parse(JSON.stringify(value));
    localStorage.setItem(KEY, JSON.stringify(checked));
    return checked;
  }

  // ---- audio ----------------------------------------------------------------

  /** Any recording (a Blob, or {type, b64}) → mono Float32 at 16 kHz. */
  async function toSpeech(recording) {
    const bytes = recording instanceof Blob
      ? await recording.arrayBuffer()
      : Uint8Array.from(atob(String(recording?.b64 || "")), (c) => c.charCodeAt(0)).buffer;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    const ctx = new Ctx();
    let decoded;
    try { decoded = await ctx.decodeAudioData(bytes.slice(0)); }
    finally { try { await ctx.close(); } catch {} }
    const frames = Math.max(1, Math.round(decoded.duration * 16000));
    const offline = new OfflineAudioContext(1, frames, 16000);
    const source = offline.createBufferSource();
    source.buffer = decoded;
    source.connect(offline.destination);
    source.start();
    const rendered = await offline.startRendering();
    return rendered.getChannelData(0);
  }

  // ---- the model, in a worker so the page stays responsive -------------------

  let worker = null, seq = 0;
  const pending = new Map();
  function stopWorker(message) {
    try { worker?.terminate(); } catch {}
    worker = null;
    for (const p of pending.values()) { clearTimeout(p.timer); p.reject(new Error(message)); }
    pending.clear();
  }
  function request(audio) {
    if (!worker) {
      const code = `
        import { AutoProcessor, AutoModelForXVector, env } from "${LIB}";
        env.allowLocalModels = false;
        let loaded = null;
        let queue = Promise.resolve();
        self.onmessage = (e) => {
          const { id, audio } = e.data;
          queue = queue.then(async () => {
            try {
              loaded ??= (async () => ({
                processor: await AutoProcessor.from_pretrained("${MODEL}"),
                model: await AutoModelForXVector.from_pretrained("${MODEL}", { dtype: "q8", device: "wasm" }),
              }))().catch((err) => { loaded = null; throw err; });
              const { processor, model } = await loaded;
              if (!audio) { self.postMessage({ id, ok: true }); return; }
              const out = await model(await processor(audio));
              self.postMessage({ id, ok: true, vector: Array.from(out.embeddings.data) });
            } catch (err) {
              self.postMessage({ id, ok: false, error: String(err && err.message || err) });
            }
          });
        };`;
      worker = new Worker(URL.createObjectURL(new Blob([code], { type: "text/javascript" })), { type: "module" });
      worker.onmessage = (e) => {
        const p = pending.get(e.data.id);
        if (!p) return;
        clearTimeout(p.timer); pending.delete(e.data.id);
        if (e.data.ok) p.resolve(e.data.vector || []); else p.reject(new Error(e.data.error || "Voice match failed."));
      };
      worker.onerror = () => stopWorker("Voice match stopped. Try again.");
    }
    return new Promise((resolve, reject) => {
      const id = ++seq;
      // The first time also downloads the model: give that time, not a check.
      const timer = setTimeout(() => stopWorker("Voice match took too long. Check the connection and try again."), audio ? 30000 : 300000);
      pending.set(id, { resolve, reject, timer });
      try { worker.postMessage({ id, audio }, audio ? [audio.buffer] : []); }
      catch { stopWorker("Voice match could not start."); }
    });
  }

  const prepare = () => request(null).then(() => true);
  const vectorOf = async (recording) => unitVector(await request(speechOnly(await toSpeech(recording))));

  /** Three recordings of one person → a saved profile. */
  async function enroll(name, recordings) {
    if (!Array.isArray(recordings) || recordings.length !== 3) throw new Error("Three recordings are needed.");
    const samples = [];
    for (const r of recordings) samples.push(await vectorOf(r));
    const prefs = read();
    const profile = { id: `v${Date.now().toString(36)}`, name: String(name || "Me").trim().slice(0, 60) || "Me", samples };
    // One profile per name: teaching again replaces it.
    const profiles = prefs.profiles.filter((p) => p.name.toLowerCase() !== profile.name.toLowerCase()).concat(profile).slice(-12);
    return save({ enabled: true, profiles });
  }

  /**
   * Does this recording sound like someone enrolled? {ok, name, score} or
   * {ok: false, why}. When voice match is off (or nobody enrolled) it's
   * {ok: true, off: true}: nothing is checked and nothing is blocked.
   */
  async function check(recording) {
    const prefs = read();
    if (!prefs.enabled || !prefs.profiles.length) return { ok: true, off: true };
    try {
      const hit = matching(await vectorOf(recording), prefs.profiles);
      return hit ? { ok: true, name: hit.name, score: hit.score } : { ok: false, why: "not-you" };
    } catch (error) {
      // A recording too short to judge isn't a stranger: say so, don't block silently.
      return { ok: false, why: "unclear", message: String(error?.message || error) };
    }
  }

  function setEnabled(on) {
    const prefs = read();
    return save({ ...prefs, enabled: !!on && prefs.profiles.length > 0 });
  }
  function forget(id) {
    const prefs = read();
    const profiles = prefs.profiles.filter((p) => p.id !== id);
    return save({ enabled: prefs.enabled && profiles.length > 0, profiles });
  }

  window.IzukiVoiceMatch = {
    read, enroll, check, prepare, setEnabled, forget,
    _test: { unitVector, similarity, matching, parse, speechOnly, THRESHOLD },
  };
})();
