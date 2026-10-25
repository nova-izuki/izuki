import { SPEAKER_CHANGED, SPEAKER_KEY, parseSpeakers, speakerAudio, type SpeakerPreferences } from "./speakerMath";
export { SPEAKER_CHANGED };
let enrolling = false;
export const speakerEnrollmentActive = () => enrolling;
export function setSpeakerEnrollment(active: boolean) {
  enrolling = active;
  window.dispatchEvent(new Event(SPEAKER_CHANGED));
}

export function readSpeakers(): SpeakerPreferences {
  return parseSpeakers(localStorage.getItem(SPEAKER_KEY));
}
export function saveSpeakers(value: SpeakerPreferences) {
  const checked = parseSpeakers(JSON.stringify(value));
  localStorage.setItem(SPEAKER_KEY, JSON.stringify(checked));
  window.dispatchEvent(new Event(SPEAKER_CHANGED));
}

let worker: Worker | null = null;
let seq = 0;
const pending = new Map<number, { resolve: (v: number[]) => void; reject: (e: Error) => void; timer: ReturnType<typeof setTimeout> }>();
function shutdown(message: string) {
  worker?.terminate(); worker = null;
  for (const p of pending.values()) { clearTimeout(p.timer); p.reject(new Error(message)); }
  pending.clear();
}
function request(audio?: Float32Array): Promise<number[]> {
  worker ??= new Worker(new URL("./speakerWorker.ts", import.meta.url), { type: "module" });
  worker.onmessage = (event: MessageEvent<{ id: number; ok: boolean; vector?: number[]; error?: string }>) => {
    const p = pending.get(event.data.id);
    if (!p) return;
    clearTimeout(p.timer); pending.delete(event.data.id);
    if (event.data.ok) p.resolve(event.data.vector ?? []);
    else p.reject(new Error(event.data.error || "Voice recognition failed."));
  };
  worker.onerror = () => shutdown("Voice recognition stopped. Try again.");
  return new Promise((resolve, reject) => {
    const id = ++seq;
    const timer = setTimeout(() => shutdown("Voice recognition timed out. Check the model download and try again."), audio ? 30_000 : 240_000);
    pending.set(id, { resolve, reject, timer });
    try { worker!.postMessage({ id, audio }, audio ? [audio.buffer] : []); }
    catch { shutdown("Voice recognition could not start."); }
  });
}
export const prepareSpeakers = () => request().then(() => undefined);
export const speakerEmbedding = (audio: Float32Array) => request(speakerAudio(audio));
