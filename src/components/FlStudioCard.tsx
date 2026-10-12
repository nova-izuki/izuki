import { useEffect, useRef, useState } from "react";
import { Loader2, Music2, RefreshCw, Wand2 } from "lucide-react";
import { Section } from "./ui";
import { api, emit, EV, on, type FlStatus } from "../lib/ipc";

/**
 * FL Studio co-producer (flstudio.rs): Izuki drives FL Studio through its
 * own scripting API over a virtual MIDI cable — exact and fast, not the
 * mouse. One-time setup here; then just ask ("make afrobeats").
 */
export function FlStudioCard() {
  const [status, setStatus] = useState<FlStatus | null>(null);
  const [checking, setChecking] = useState(false);
  const [settingUp, setSettingUp] = useState(false);
  const [lines, setLines] = useState<string[]>([]);
  const [result, setResult] = useState("");
  const mounted = useRef(true);
  useEffect(() => () => void (mounted.current = false), []);

  const check = async () => {
    setChecking(true);
    try {
      const s = await api.flStatus();
      if (mounted.current) setStatus(s);
    } catch (e) {
      if (mounted.current) setResult(String(e));
    } finally {
      if (mounted.current) setChecking(false);
    }
  };
  useEffect(() => {
    void check();
    const off = on<string>(EV.flSetup, (line) => mounted.current && setLines((l) => [...l, line].slice(-6)));
    return () => void off.then((f) => f());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setup = async () => {
    setSettingUp(true);
    setLines([]);
    setResult("");
    try {
      const said = await api.flSetup();
      if (mounted.current) setResult(said);
    } catch (e) {
      if (mounted.current) setResult(String(e));
    } finally {
      if (mounted.current) setSettingUp(false);
    }
    void check();
  };
  const ask = (text: string) => void emit(EV.runChat, { id: Date.now(), text });

  const tick = (ok: boolean | undefined, yes: string, no: string) => (
    <div className="flex items-start gap-2 py-1 text-[11.5px]">
      <span aria-hidden>{ok ? "✅" : "⚪"}</span>
      <span className={ok ? "" : "text-izk-muted"}>{ok ? yes : no}</span>
    </div>
  );

  return (
    <Section
      id="settings-flstudio"
      title="FL Studio"
      hint="Izuki as your producer: it controls FL Studio directly (not the mouse) — fast and exact. Say “make afrobeats”, “make a trap beat at 140”, “stop”, “tempo 128”. Every change is one undo step: Ctrl+Z in FL takes it back."
    >
      <div className="izk-inset mb-2 rounded-[14px] p-2.5">
        <div className="mb-1 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[12px] font-semibold">
            <Music2 size={14} strokeWidth={2.3} className="text-izk-teal" /> Link
          </span>
          <button type="button" onClick={() => void check()} disabled={checking} className="izk-pill izk-no-drag flex h-[26px] items-center gap-1 px-2.5 text-[11px] disabled:opacity-60">
            {checking ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />} Check link
          </button>
        </div>
        {status ? (
          <>
            {tick(status.fl_installed, "FL Studio is installed", "FL Studio isn't installed on this PC")}
            {tick(!!status.cable, `Virtual MIDI cable: ${status.cable}`, "No virtual MIDI cable yet — Set up makes one")}
            {tick(status.script, "Izuki's script is in FL Studio", "Izuki's script isn't in FL Studio yet")}
            {tick(status.connected, "FL Studio is answering", status.fl_running ? "FL Studio is open but not answering — pick Izuki in Options → MIDI settings" : "Open FL Studio to connect")}
            {status.problem && <div className="text-[10.5px] text-amber-300/90">{status.problem}</div>}
          </>
        ) : (
          <div className="py-1 text-[11px] text-izk-muted">Looking…</div>
        )}
        <div className="mt-2 flex flex-wrap gap-1.5">
          <button type="button" onClick={() => void setup()} disabled={settingUp} className="izk-pill izk-no-drag flex h-[28px] items-center gap-1 px-3 text-[11px] font-semibold disabled:opacity-60">
            {settingUp ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />} {status?.cable && status.script ? "Set up again" : "Set up (one time)"}
          </button>
          {status?.connected &&
            ["Make afrobeats", "Make a trap beat at 140", "Make amapiano"].map((t) => (
              <button key={t} type="button" onClick={() => ask(t)} className="izk-pill izk-no-drag h-[28px] px-3 text-[11px]">
                {t}
              </button>
            ))}
        </div>
        {lines.length > 0 && settingUp && (
          <div className="mt-1.5 text-[10.5px] leading-snug text-izk-muted">
            {lines.map((l, i) => (
              <div key={i}>{l}</div>
            ))}
          </div>
        )}
        {result && <p className="mt-1.5 text-[11px] leading-snug">{result}</p>}
      </div>
      <p className="text-[10.5px] leading-snug text-izk-muted">
        Set up puts Izuki's script into FL Studio and makes a private virtual MIDI cable with Windows' own MIDI system (loopMIDI if FL can't see it). Then one step in FL: Options → MIDI settings → pick the Izuki cable as input and output, Controller type “Izuki”, Port 236. Coming next: melodies and 808s in the piano roll, finishing your beat, mixing vocals and fixing timing.
      </p>
    </Section>
  );
}
