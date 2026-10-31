import { useRef, useState } from "react";
import { api, type WindowsTweak } from "../lib/ipc";
import { applyDesktopLayout, DESKTOP_LAYOUTS, layoutSwitches, readLayoutUndo, undoDesktopLayout, type LayoutChange } from "../lib/desktopLayouts";
import { Section } from "./ui";

const KEY = "izuki.desktop-layout-undo.v1";
const port = { read: api.tweaksList, set: api.tweakSet };

export function DesktopLayouts({ tweaks, onChange, onRestart, disabled, onBusy, picture }: { tweaks: WindowsTweak[]; onChange: (t: WindowsTweak[]) => void; onRestart: () => void; disabled: boolean; onBusy: (key: string | null) => void; picture?: string }) {
  const [undo, setUndo] = useState<LayoutChange[]>(() => {
    try { return readLayoutUndo(localStorage.getItem(KEY)); } catch { return []; }
  });
  const [busy, setBusy] = useState("");
  const locked = useRef(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const remember = (value: LayoutChange[]) => {
    setUndo(value);
    try { if (value.length) localStorage.setItem(KEY, JSON.stringify(value)); else localStorage.removeItem(KEY); } catch { /* Undo still works until this tab closes. */ }
  };
  const run = async (id: string) => {
    if (locked.current || disabled) return;
    locked.current = true;
    onBusy(`layout-${id}`);
    setBusy(id); setError(""); setMessage("");
    try {
      if (id === "undo") {
        const result = await undoDesktopLayout(port, undo);
        onChange(result.tweaks); if (result.restart) onRestart();
        remember([]);
        setMessage(result.restored ? `Previous layout switches restored.${result.skipped ? " Your later changes were kept." : ""}` : "Your later changes were kept. No switches needed restoring.");
      } else {
        const result = await applyDesktopLayout(port, id);
        onChange(result.tweaks); if (result.restart) onRestart();
        // Reapplying the same layout must not erase a useful Undo.
        if (result.undo.length) remember(result.undo);
        setMessage(`${DESKTOP_LAYOUTS.find((p) => p.id === id)?.name} is set. Your picture and daily rotation stay as they were.${result.restart ? " Restart Explorer below to finish." : ""}`);
      }
    } catch (e) {
      setError(String(e).replace(/^Error:\s*/, ""));
      try { onChange(await port.read()); } catch { /* Keep the last known switches. */ }
    } finally { locked.current = false; setBusy(""); onBusy(null); }
  };
  return (
    <Section id="style-layouts" title="Windows layouts" hint="Arrange Windows 11's taskbar and File Explorer. Your wallpaper, daily photos and colours stay yours." right={undo.length > 0 && <button type="button" disabled={!!busy || disabled} onClick={() => void run("undo")} className="izk-pill izk-no-drag px-3 py-1 text-[11px]">Undo layout</button>}>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {DESKTOP_LAYOUTS.map((layout) => {
          const values = layoutSwitches(layout);
          const available = Object.keys(values).every((id) => tweaks.some((t) => t.id === id));
          const active = available && Object.entries(values).every(([id, on]) => tweaks.find((t) => t.id === id)?.on === on);
          return (
            <button key={layout.id} type="button" disabled={!!busy || disabled || !available} onClick={() => void run(layout.id)} data-layout={layout.id} aria-pressed={active} className="izk-no-drag overflow-hidden rounded-2xl border border-white/15 bg-white/[0.035] text-left transition-colors hover:border-izk-teal/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-izk-teal disabled:opacity-50">
              <div aria-hidden className="relative aspect-[16/7] overflow-hidden" style={{ background: `radial-gradient(ellipse at 75% 20%, ${layout.accent}66, transparent 65%), linear-gradient(140deg,#142b3d,#191626)` }}>
                {picture && <img src={picture} alt="" className="absolute inset-0 h-full w-full object-cover opacity-65" />}
                {!layout.hideIcons && <div className="absolute left-[5%] top-[10%] grid gap-2">{[0, 1, 2].map((i) => <span key={i} className="h-3 w-3 rounded-sm bg-white/50" />)}</div>}
                <div className="absolute left-[24%] top-[12%] h-[60%] w-[55%] rounded-lg border border-white/20 bg-black/35 p-2">
                  <div className="mb-2 h-1.5 w-1/3 rounded-full" style={{ background: layout.accent }} />
                  <div className={layout.compact ? "space-y-1" : "space-y-2"}>{[0, 1, 2].map((i) => <div key={i} className="h-1 w-3/4 rounded-full bg-white/20" />)}</div>
                </div>
                <div className={`absolute bottom-0 flex w-full items-center gap-1.5 bg-black/40 px-3 ${layout.hideBar ? "h-1" : "h-[16%]"} ${layout.left ? "justify-start" : "justify-center"}`}>
                  {!layout.hideBar && [0, 1, 2, 3, 4].map((i) => <span key={i} className={`${layout.labels ? "w-7" : "w-2.5"} h-2.5 rounded-sm`} style={{ background: i === 0 ? layout.accent : "#ffffff70" }} />)}
                </div>
              </div>
              <div className="space-y-1 p-3">
                <span className="flex justify-between gap-2 text-[13px] font-semibold">{layout.name}<span className="text-[10px] text-izk-teal">{busy === layout.id ? "Applying…" : active ? "ON" : "Apply"}</span></span>
                <span className="block text-[11px] leading-relaxed text-izk-muted">{layout.hint}</span>
              </div>
            </button>
          );
        })}
      </div>
      {!tweaks.length && <p className="mt-2 text-[11px] text-izk-muted">Layouts are available in the Windows desktop app.</p>}
      {message && <p role="status" className="mt-3 text-[12px] text-izk-teal">{message}</p>}
      {error && <p role="alert" className="mt-3 text-[12px] text-izk-danger">{error}</p>}
    </Section>
  );
}
