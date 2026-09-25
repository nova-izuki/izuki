import { useCallback, useEffect, useState } from "react";
import { Download, ExternalLink, FolderOpen } from "lucide-react";
import { api, EV, emit, IS_TAURI, on } from "../lib/ipc";

/**
 * Which wake words Izuki listens for — your own; none is built in. Yours
 * ("Hey Nova", "Hey Izuki") is a small model file — openwakeword.com has
 * ready-made "Hey Nova" models (free with an account) and trains new ones;
 * download it, click "Add it", done.
 */
export function WakeWords() {
  const [custom, setCustom] = useState<string[]>([]);
  const [note, setNote] = useState<string | null>(null);

  const refresh = useCallback(() => void api.listWakewords().then(setCustom).catch(() => undefined), []);
  useEffect(() => {
    refresh();
    const off = on<void>(EV.wakewordsChanged, refresh);
    return () => void off.then((f) => f());
  }, [refresh]);

  const open = async (url: string) => {
    if (!IS_TAURI) return void window.open(url, "_blank");
    const { openUrl } = await import("@tauri-apps/plugin-opener");
    await openUrl(url);
  };

  const add = async () => {
    const r = await api.importWakewords().catch(() => ({ added: [] as string[], recordings: [] as string[], tflite: [] as string[] }));
    if (r.added.length) {
      setNote(`Added ${r.added.map(pretty).join(", ")} — say it any time.`);
      void emit(EV.wakewordsChanged);
      refresh();
    } else if (r.tflite.length) {
      setNote("That's the .tflite version — download the ONNX version of the same model instead, then click Add it.");
    } else if (r.recordings.length) {
      setNote(
        "Those are voice recordings (.wav), not the wake-word model. On openwakeword.com open Library → “Hey Nova” → Download → ONNX, then click Add it."
      );
    } else {
      setNote("No wake-word model (.onnx or .zip) in your Downloads folder yet.");
    }
  };

  const pretty = (f: string) =>
    f.replace(/\.onnx$/i, "").replace(/([_-](v?\d+(\.\d+)*))+$/i, "").replace(/[_-]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <div className="mb-1 rounded-[14px] border border-white/8 bg-white/4 p-2.5">
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] text-izk-muted">Wake words:</span>
        {custom.map((f) => (
          <span key={f} className="rounded-full border border-izk-hand/30 bg-izk-hand/10 px-2 py-0.5 text-[11px] text-izk-hand">
            {pretty(f)}
          </span>
        ))}
        {!custom.length && (
          <span className="text-[11px] text-amber-300/90">None yet — add one below to talk hands-free</span>
        )}
      </div>
      <p className="mt-1.5 text-[10.5px] leading-relaxed text-izk-muted">
        Make it yours: get a free “Hey Nova” model (sign in at openwakeword.com → Library → search “Hey Nova”,
        test it with your mic, download the .onnx) — or train “Hey Izuki” there. Then click <b>Add it</b>.
      </p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        <button type="button" onClick={() => void open("https://openwakeword.com/library")} className="izk-pill izk-no-drag h-[26px] px-2.5 text-[11px]">
          <ExternalLink size={11} strokeWidth={2.4} />
          Get “Hey Nova”
        </button>
        <button type="button" onClick={() => void add()} className="izk-pill izk-no-drag h-[26px] px-2.5 text-[11px]">
          <Download size={11} strokeWidth={2.4} />
          Add it
        </button>
        <button type="button" onClick={() => void api.openWakewordsFolder()} className="izk-pill izk-no-drag h-[26px] px-2.5 text-[11px]">
          <FolderOpen size={11} strokeWidth={2.4} />
          Folder
        </button>
      </div>
      {note && <p className="mt-1.5 text-[10.5px] text-izk-teal">{note}</p>}
    </div>
  );
}
