/** Local voice templates. No recordings or recognized words are persisted. */
export interface SpeakerProfile { id: string; name: string; samples: number[][] }
export interface SpeakerPreferences { enabled: boolean; profiles: SpeakerProfile[] }
export const SPEAKER_KEY = "izuki.wake-speakers.v1";
export const SPEAKER_CHANGED = "izuki:speakers-changed";
export const SPEAKER_THRESHOLD = 0.85;

export function unitVector(values: ArrayLike<number>): number[] {
  if (values.length !== 512) throw new Error("Invalid voice template.");
  const v = Array.from(values);
  if (v.some((n) => !Number.isFinite(n))) throw new Error("Invalid voice template.");
  const norm = Math.hypot(...v);
  if (norm < 1e-8) throw new Error("No clear voice was captured. Try again closer to the microphone.");
  return v.map((n) => n / norm);
}

export function similarity(a: number[], b: number[]): number {
  if (a.length !== 512 || b.length !== 512) return -1;
  return a.reduce((sum, n, i) => sum + n * b[i], 0);
}

export function matchingSpeaker(vector: number[], profiles: SpeakerProfile[]): string | null {
  let best = SPEAKER_THRESHOLD;
  let id: string | null = null;
  for (const p of profiles) {
    // At least two enrollment takes must agree, so one noisy sample cannot
    // grant every voice a match.
    const scores = p.samples.map((s) => similarity(vector, s)).sort((a, b) => b - a);
    if (scores.length >= 3 && scores[1] >= best) { best = scores[1]; id = p.id; }
  }
  return id;
}

export function parseSpeakers(raw: string | null): SpeakerPreferences {
  if (!raw) return { enabled: false, profiles: [] };
  const data = JSON.parse(raw) as SpeakerPreferences;
  if (!data || typeof data.enabled !== "boolean" || !Array.isArray(data.profiles) || data.profiles.length > 12) throw new Error("Voice profiles could not be read.");
  const profiles = data.profiles.map((p) => {
    if (typeof p.id !== "string" || !p.id || typeof p.name !== "string" || !p.name.trim() || p.name.length > 60 || !Array.isArray(p.samples) || p.samples.length !== 3) throw new Error("Invalid voice profile.");
    return { id: p.id, name: p.name, samples: p.samples.map(unitVector) };
  });
  if (new Set(profiles.map((p) => p.id)).size !== profiles.length) throw new Error("Duplicate voice profiles.");
  return { enabled: data.enabled, profiles };
}

/** Trim quiet margins, require speech, cap work to four seconds at 16 kHz. */
export function speakerAudio(audio: Float32Array): Float32Array {
  const input = audio.slice(-64_000);
  let first = -1, last = 0, voiced = 0;
  for (let at = 0; at + 320 <= input.length; at += 320) {
    let sum = 0;
    for (let i = at; i < at + 320; i++) sum += input[i] ** 2;
    if (Math.sqrt(sum / 320) > 0.008) { if (first < 0) first = at; last = at + 320; voiced += 320; }
  }
  if (voiced < 8000 || first < 0) throw new Error("Not enough clear speech. Say the whole phrase and try again.");
  return input.slice(Math.max(0, first - 1600), Math.min(input.length, last + 1600));
}
