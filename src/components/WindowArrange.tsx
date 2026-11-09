import { useRef, useState } from "react";
import { api } from "../lib/ipc";
import { Section } from "./ui";

type Kind = "side" | "focus" | "columns" | "grid";

/** Each layout, with its little picture: [left, top, width, height] in %. */
const KINDS: { id: Kind; name: string; hint: string; say: string; cells: [number, number, number, number][] }[] = [
  { id: "side", name: "Side by side", hint: "Your last two windows, half the screen each.", say: "put my windows side by side", cells: [[0, 0, 50, 100], [50, 0, 50, 100]] },
  { id: "focus", name: "Focus", hint: "The one you're using big, two more stacked beside it.", say: "focus layout", cells: [[0, 0, 66.6, 100], [66.6, 0, 33.4, 50], [66.6, 50, 33.4, 50]] },
  { id: "columns", name: "Columns", hint: "Up to four tall columns, great on a wide screen.", say: "put my windows in columns", cells: [[0, 0, 25, 100], [25, 0, 25, 100], [50, 0, 25, 100], [75, 0, 25, 100]] },
  { id: "grid", name: "Grid", hint: "Up to four windows, a quarter of the screen each.", say: "tile my windows", cells: [[0, 0, 50, 50], [50, 0, 50, 50], [0, 50, 50, 50], [50, 50, 50, 50]] },
];

/**
 * Arrange the app windows on this screen in one tap (arrange.rs): the window
 * used last gets the biggest spot, and Undo puts every one back. The same
 * works by voice ("put my windows side by side", "undo the layout").
 */
export function WindowArrange({ disabled, onBusy }: { disabled: boolean; onBusy: (key: string | null) => void }) {
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [canUndo, setCanUndo] = useState(false);
  const locked = useRef(false);

  const run = async (id: Kind | "undo") => {
    if (locked.current || disabled) return;
    locked.current = true;
    onBusy(`arrange-${id}`);
    setBusy(id);
    setError("");
    setMessage("");
    try {
      const said = id === "undo" ? await api.windowLayoutUndo() : await api.windowLayout(id);
      setMessage(said);
      setCanUndo(id !== "undo");
    } catch (e) {
      setError(String(e).replace(/^Error:\s*/, ""));
      if (id === "undo") setCanUndo(false);
    } finally {
      locked.current = false;
      setBusy("");
      onBusy(null);
    }
  };

  return (
    <Section
      id="style-arrange"
      title="Arrange my windows"
      hint="One tap lays out the app windows on this screen; the one you used last gets the biggest spot. Or just say it."
      right={canUndo && (
        <button type="button" disabled={!!busy || disabled} onClick={() => void run("undo")} className="izk-pill izk-no-drag px-3 py-1 text-[11px]">
          {busy === "undo" ? "Putting back…" : "Undo"}
        </button>
      )}
    >
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {KINDS.map((k) => (
          <button
            key={k.id}
            type="button"
            disabled={!!busy || disabled}
            onClick={() => void run(k.id)}
            title={`Or say “${k.say}”`}
            className="izk-no-drag group rounded-2xl border border-white/12 bg-white/[0.035] p-2.5 text-left transition-colors hover:border-izk-teal/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-izk-teal disabled:opacity-50"
          >
            <div aria-hidden className="relative aspect-[16/9] overflow-hidden rounded-lg border border-white/10 bg-black/30">
              {k.cells.map(([x, y, w, h], i) => (
                <span
                  key={i}
                  className="absolute rounded-[5px] border border-white/15 transition-colors duration-200"
                  style={{
                    left: `calc(${x}% + 3px)`,
                    top: `calc(${y}% + 3px)`,
                    width: `calc(${w}% - 6px)`,
                    height: `calc(${h}% - 6px)`,
                    background: i === 0 ? "rgba(78,205,196,0.32)" : "rgba(255,255,255,0.09)",
                  }}
                />
              ))}
            </div>
            <span className="mt-2 flex items-center justify-between gap-2 text-[12.5px] font-semibold text-izk-ink">
              {k.name}
              {busy === k.id && <span className="text-[10px] font-medium text-izk-teal">Arranging…</span>}
            </span>
            <span className="mt-0.5 block text-[10.5px] leading-snug text-izk-muted">{k.hint}</span>
          </button>
        ))}
      </div>
      {message && <p role="status" className="mt-3 text-[12px] leading-relaxed text-izk-teal">{message}</p>}
      {error && <p role="alert" className="mt-3 text-[12px] leading-relaxed text-izk-danger">{error}</p>}
    </Section>
  );
}
