import { useEffect, useRef, useState } from "react";
import { Loader2, Mic, Trash2 } from "lucide-react";
import { streamMic } from "../lib/speechInput";
import { readSpeakers, saveSpeakers, prepareSpeakers, speakerEmbedding, setSpeakerEnrollment } from "../lib/speakers";
import { similarity, type SpeakerPreferences } from "../lib/speakerMath";
import { Row, Toggle } from "./ui";

export function WakeSpeakers() {
  const [preferences, setPreferences] = useState<SpeakerPreferences>({ enabled: false, profiles: [] });
  const [name, setName] = useState("");
  const [takes, setTakes] = useState<number[][]>([]);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const generation = useRef(0);
  const cancelRecording = useRef<() => void>(() => {});
  useEffect(() => {
    try { setPreferences(readSpeakers()); } catch { setError("Voice profiles could not be read. Turn the filter off and enroll again."); }
    return () => { generation.current++; cancelRecording.current(); setSpeakerEnrollment(false); };
  }, []);
  const save = (value: SpeakerPreferences) => {
    try { saveSpeakers(value); setPreferences(value); setError(""); }
    catch (e) { setError(e instanceof Error ? e.message : String(e)); }
  };
  const record = async () => {
    const person = name.trim();
    if (!person || busy) return;
    const mine = ++generation.current;
    setError(""); setBusy("Preparing local voice model...");
    try {
      await prepareSpeakers();
      if (generation.current !== mine) return;
      setSpeakerEnrollment(true);
      setBusy('Say: "Hey Nova, are you there?"');
      const audio = await new Promise<Float32Array>((resolve, reject) => {
        const chunks: Float32Array[] = [];
        let length = 0, finished = false;
        let stop: () => void = () => {};
        const timer = setTimeout(() => finish(new Error("No microphone audio arrived. Check the microphone test.")), 10_000);
        const finish = (error?: Error) => {
          if (finished) return;
          finished = true; clearTimeout(timer); stop();
          if (error) { reject(error); return; }
          const output = new Float32Array(length);
          let at = 0;
          for (const c of chunks) { output.set(c, at); at += c.length; }
          resolve(output);
        };
        stop = streamMic((chunk) => {
          chunks.push(chunk); length += chunk.length;
          if (length >= 64_000) finish();
        }, () => { if (!finished) finish(new Error("The microphone stopped. Try again.")); });
        cancelRecording.current = () => finish(new Error("Recording cancelled."));
      });
      if (generation.current !== mine) return;
      setBusy("Checking this take...");
      const vector = await speakerEmbedding(audio);
      if (generation.current !== mine) return;
      if (takes.length && takes.every((v) => similarity(v, vector) < 0.8)) throw new Error("These takes sound different. Use the same microphone in a quiet room and try this take again.");
      const next = [...takes, vector];
      if (next.length === 3) {
        save({ ...preferences, profiles: [...preferences.profiles, { id: crypto.randomUUID(), name: person, samples: next }] });
        setTakes([]); setName("");
      } else setTakes(next);
    } catch (e) { if (generation.current === mine) setError(e instanceof Error ? e.message : String(e)); }
    finally { if (generation.current === mine) { setBusy(""); setSpeakerEnrollment(false); } }
  };
  return <div className="mt-3 rounded-[14px] border border-white/10 p-3">
    <Row label="Recognize enrolled voices" hint="Only enrolled people can wake Nova. Optional; the talk key always works. Templates stay on this PC. Recordings can still imitate a voice.">
      <Toggle checked={preferences.enabled} onChange={(enabled) => save({ ...preferences, enabled })} />
    </Row>
    {preferences.enabled && !preferences.profiles.length && <p className="mt-1 text-[11px] text-amber-200">Enroll someone below to enable voice wake-ups.</p>}
    <div className="mt-2 flex flex-col gap-1">
      {preferences.profiles.map((p) => <div key={p.id} className="flex items-center gap-2 text-[12px]">
        <Mic size={13} /><span className="flex-1">{p.name}</span>
        <button type="button" aria-label={`Remove ${p.name}'s voice`} disabled={!!busy} onClick={() => save({ ...preferences, profiles: preferences.profiles.filter((v) => v.id !== p.id) })} className="izk-pill p-2 disabled:opacity-40"><Trash2 size={13} /></button>
      </div>)}
    </div>
    {preferences.profiles.length < 12 && <div className="mt-2 flex items-center gap-2">
      <input aria-label="Person's name" maxLength={60} disabled={!!busy || takes.length > 0} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name or another person" className="izk-field min-w-0 flex-1 px-2 py-1.5 text-[12px]" />
      <button type="button" disabled={!!busy || !name.trim()} onClick={() => void record()} className="izk-pill flex items-center gap-1 px-2 py-1.5 text-[12px] disabled:opacity-40">{busy ? <Loader2 size={13} className="animate-spin" /> : <Mic size={13} />} Record {takes.length + 1}/3</button>
    </div>}
    {(busy || takes.length > 0) && <div className="mt-2 flex items-center gap-2 text-[11px]"><span className="flex-1" role="status">{busy || `${takes.length} of 3 takes recorded. Repeat the same phrase.`}</span><button type="button" className="izk-pill px-2 py-1" onClick={() => { generation.current++; cancelRecording.current(); setSpeakerEnrollment(false); setBusy(""); setTakes([]); }}>Cancel</button></div>}
    {error && <p role="alert" className="mt-2 text-[12px] text-izk-danger">{error}</p>}
    <p className="mt-2 text-[10.5px] text-izk-muted">First use downloads a local voice model. Three takes per person help with matching; use the same mic you use for hands-free.</p>
  </div>;
}
