import { useCallback, useEffect, useRef, useState } from "react";
import { Mic, RefreshCw } from "lucide-react";
import { Row } from "./ui";
import { useIzuki } from "../lib/store";
import { chooseMic, listMics, type Mic as MicDevice } from "../lib/speechInput";

/**
 * Which microphone Izuki listens with — e.g. a Bluetooth headset's mic
 * instead of a laptop mic that's broken or across the room. "Automatic"
 * prefers a connected headset. "Test" shows a live level bar, so it's
 * obvious whether the chosen mic actually hears you.
 */
/** Software "microphones" (VR, capture, loopback) — they never hear a voice. */
const isVirtual = (label: string) => /virtual|oculus|stereo mix|cable output|voicemeeter|loopback/i.test(label);

export function MicPicker() {
  const chosen = useIzuki((s) => s.settings.mic_device);
  const patch = useIzuki((s) => s.patchSettings);
  const [mics, setMics] = useState<MicDevice[]>([]);
  const [autoPick, setAutoPick] = useState<string | null>(null);
  const [level, setLevel] = useState<number | null>(null);
  const stopTest = useRef<() => void>(() => {});

  const refresh = useCallback(() => {
    void listMics().then(setMics);
    void chooseMic().then((m) => setAutoPick(m?.label ?? null));
  }, []);

  useEffect(() => {
    refresh();
    navigator.mediaDevices?.addEventListener?.("devicechange", refresh);
    return () => {
      navigator.mediaDevices?.removeEventListener?.("devicechange", refresh);
      stopTest.current();
    };
  }, [refresh]);

  // Re-resolve what "Automatic" means whenever the choice changes.
  useEffect(() => {
    void chooseMic().then((m) => setAutoPick(m?.label ?? null));
  }, [chosen]);

  const test = async () => {
    stopTest.current();
    const target = mics.find((m) => m.label === chosen) ?? (await chooseMic());
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: target ? { deviceId: { exact: target.deviceId } } : true,
      });
    } catch {
      setLevel(-1);
      return;
    }
    const ctx = new AudioContext();
    const an = ctx.createAnalyser();
    an.fftSize = 512;
    ctx.createMediaStreamSource(stream).connect(an);
    const buf = new Float32Array(an.fftSize);
    let flat = 0;
    const tick = setInterval(() => {
      an.getFloatTimeDomainData(buf);
      let mean = 0;
      for (let i = 0; i < buf.length; i++) mean += buf[i];
      mean /= buf.length;
      // Loudness is the wiggle around the middle, not the raw value: a
      // broken mic driver can send a signal stuck at full scale, which
      // would otherwise look like shouting.
      let sum = 0;
      for (let i = 0; i < buf.length; i++) sum += (buf[i] - mean) ** 2;
      const rms = Math.sqrt(sum / buf.length);
      flat = Math.abs(mean) > 0.5 && rms < 1e-4 ? flat + 1 : 0;
      setLevel(flat > 8 ? -2 : Math.min(1, Math.sqrt(Math.sqrt(rms)) * 2.2));
    }, 60);
    const done = setTimeout(() => stopTest.current(), 8000);
    stopTest.current = () => {
      clearInterval(tick);
      clearTimeout(done);
      stream.getTracks().forEach((t) => t.stop());
      void ctx.close().catch(() => undefined);
      setLevel(null);
      stopTest.current = () => {};
    };
  };

  const current = chosen
    ? isVirtual(chosen)
      ? `${chosen} — that's a virtual device (from Oculus/VR software), it can't hear you. Pick Automatic or a real mic.`
      : chosen
    : autoPick
      ? `Automatic — ${autoPick}`
      : "Automatic — Windows default";

  return (
    <>
      <Row label="Microphone" hint={`Listening with: ${current}`} icon={<Mic size={14} strokeWidth={2.3} />}>
        <div className="flex items-center gap-1.5">
          <select
            value={mics.some((m) => m.label === chosen) ? chosen : ""}
            onChange={(e) => patch({ mic_device: e.target.value })}
            className="izk-no-drag h-[30px] max-w-[170px] rounded-[10px] border border-white/10 bg-white/6 px-2 text-[12px] text-izk-ink outline-none"
          >
            <option value="" className="bg-[#1b2230]">
              Automatic (headset first)
            </option>
            {[...mics]
              .sort((a, b) => Number(isVirtual(a.label)) - Number(isVirtual(b.label)))
              .map((m) => (
                <option key={m.deviceId} value={m.label} className="bg-[#1b2230]">
                  {isVirtual(m.label) ? `⚠ ${m.label} — virtual, can't hear you` : m.label}
                </option>
              ))}
          </select>
          <button
            type="button"
            onClick={refresh}
            title="Look for mics again (e.g. after connecting headphones)"
            className="izk-pill izk-no-drag h-[30px] w-[30px] justify-center p-0"
          >
            <RefreshCw size={12} strokeWidth={2.4} />
          </button>
        </div>
      </Row>
      <div className="mb-1 flex items-center gap-2.5">
        <button
          type="button"
          onClick={() => (level === null ? void test() : stopTest.current())}
          className="izk-pill izk-no-drag h-[28px] shrink-0 px-2.5 text-[11px]"
        >
          {level === null ? "Test mic" : "Stop test"}
        </button>
        <div className="relative h-[8px] flex-1 overflow-hidden rounded-full bg-white/8">
          <div
            className="absolute inset-y-0 left-0 rounded-full transition-[width] duration-75"
            style={{
              width: `${Math.max(0, level ?? 0) * 100}%`,
              background: "linear-gradient(90deg,#22d3ee,#6366f1,#f472b6)",
            }}
          />
        </div>
        <span className="w-[96px] shrink-0 text-right text-[10.5px] text-izk-muted">
          {level === -1 ? "Couldn't open it" : level === -2 ? "Stuck — driver issue" : level === null ? "Say something…" : level > 0.25 ? "Hearing you ✓" : "Speak up…"}
        </span>
      </div>
    </>
  );
}
