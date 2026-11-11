import { useEffect, useRef, useState } from "react";
import { api, type DimLevel, type SavedLayout } from "../lib/ipc";
import { useIzuki } from "../lib/store";
import { Section, Toggle } from "./ui";

type Kind = "side" | "focus" | "columns" | "grid";

/** Each layout, with its little picture: [left, top, width, height] in %. */
const KINDS: { id: Kind; name: string; hint: string; say: string; cells: [number, number, number, number][] }[] = [
  { id: "side", name: "Side by side", hint: "Your last two windows, half the screen each.", say: "put my windows side by side", cells: [[0, 0, 50, 100], [50, 0, 50, 100]] },
  { id: "focus", name: "Focus", hint: "The one you're using big, two more stacked beside it.", say: "focus layout", cells: [[0, 0, 66.6, 100], [66.6, 0, 33.4, 50], [66.6, 50, 33.4, 50]] },
  { id: "columns", name: "Columns", hint: "Up to four tall columns, great on a wide screen.", say: "put my windows in columns", cells: [[0, 0, 25, 100], [25, 0, 25, 100], [50, 0, 25, 100], [75, 0, 25, 100]] },
  { id: "grid", name: "Grid", hint: "Up to four windows, a quarter of the screen each.", say: "tile my windows", cells: [[0, 0, 50, 50], [50, 0, 50, 50], [0, 50, 50, 50], [50, 50, 50, 50]] },
];

/** How dark "dim the rest" goes, with the dot each chip shows. */
const DIMS: { id: DimLevel | null; name: string; shade: number }[] = [
  { id: null, name: "Off", shade: 0 },
  { id: "soft", name: "Soft", shade: 0.35 },
  { id: "medium", name: "Medium", shade: 0.57 },
  { id: "deep", name: "Deep", shade: 0.78 },
];

/** "3 min ago", "yesterday", "12 Nov" for when a layout was saved. */
function savedWhen(at: number): string {
  const secs = Date.now() / 1000 - at;
  if (secs < 90) return "just now";
  if (secs < 3600) return `${Math.round(secs / 60)} min ago`;
  if (secs < 86400) return `${Math.round(secs / 3600)} h ago`;
  if (secs < 2 * 86400) return "yesterday";
  return new Date(at * 1000).toLocaleDateString(undefined, { day: "numeric", month: "short" });
}

/**
 * Arrange the app windows on this screen in one tap (arrange.rs): the window
 * used last gets the biggest spot, and Undo puts every one back. The same
 * works by voice ("put my windows side by side", "undo the layout").
 *
 * Saved layouts: "Save" remembers where every app window is on every
 * screen; "Set up" puts them back and opens the apps that aren't running
 * ("save my windows as Work", "set up my Work layout").
 *
 * Dim the rest (haze.rs): everything but the window in front fades back, and
 * follows you when you switch windows ("dim the rest", "undim"); Focus mode
 * can turn it on by itself.
 */
export function WindowArrange({ disabled, onBusy }: { disabled: boolean; onBusy: (key: string | null) => void }) {
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [canUndo, setCanUndo] = useState(false);
  const [saved, setSaved] = useState<SavedLayout[]>([]);
  const [name, setName] = useState("");
  // The layout whose delete was pressed once (a second press deletes).
  const [deleting, setDeleting] = useState("");
  const [dim, setDim] = useState<DimLevel | null>(null);
  const focusDims = useIzuki((s) => s.settings.focus_dims);
  const patch = useIzuki((s) => s.patchSettings);
  const locked = useRef(false);
  const refreshAsk = useRef(0);
  const dimAsk = useRef(0);
  const alive = useRef(true);
  /** How dark the rest is, read again; an older answer never overwrites a newer one. */
  const readDim = () => {
    const n = ++dimAsk.current;
    void api.dimState().then((v) => alive.current && n === dimAsk.current && setDim(v)).catch(() => undefined);
  };
  /** What can be undone, the saved list and the dim, read again; an older answer never overwrites a newer one. */
  const refresh = () => {
    const n = ++refreshAsk.current;
    void api.windowLayoutCanUndo().then((v) => n === refreshAsk.current && setCanUndo(v)).catch(() => undefined);
    void api.layoutsSaved().then((v) => n === refreshAsk.current && setSaved(v)).catch(() => undefined);
    readDim();
  };

  // An arrangement made earlier (or by voice) can still be put back, layouts
  // saved by voice show up here, and a dim said by voice shows when you come
  // back to the panel.
  useEffect(() => {
    alive.current = true;
    void api.windowLayoutCanUndo().then((v) => alive.current && setCanUndo(v)).catch(() => undefined);
    void api.layoutsSaved().then((v) => alive.current && setSaved(v)).catch(() => undefined);
    readDim();
    window.addEventListener("focus", readDim);
    return () => {
      alive.current = false;
      window.removeEventListener("focus", readDim);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** One thing at a time; the message (or the problem) shown after. */
  const go = async (key: string, work: () => Promise<string>) => {
    if (locked.current || disabled) return;
    locked.current = true;
    onBusy(`arrange-${key}`);
    setBusy(key);
    setError("");
    setMessage("");
    setDeleting("");
    try {
      setMessage(await work());
    } catch (e) {
      setError(String(e).replace(/^Error:\s*/, ""));
    } finally {
      locked.current = false;
      setBusy("");
      onBusy(null);
      refresh();
    }
  };

  const run = (id: Kind | "undo") => go(id, () => (id === "undo" ? api.windowLayoutUndo() : api.windowLayout(id)));

  const save = () => {
    const n = name.trim();
    if (!n) return;
    void go("save", async () => {
      const said = await api.layoutSave(n);
      setName("");
      return said;
    });
  };

  const forget = (n: string) => {
    if (deleting !== n) {
      setDeleting(n);
      return;
    }
    void go(`forget-${n}`, async () => {
      await api.layoutForget(n);
      return `Deleted your ${n} layout.`;
    });
  };

  return (
    <Section
      id="style-arrange"
      title="Arrange my windows"
      hint="One tap lays out the app windows on this screen; the one you used last gets the biggest spot. Or just say it — even for one app: “put Chrome on the left”, “move Spotify to my other screen”, “Discord in the top right corner”."
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
      <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.025] p-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-[12px] font-semibold text-izk-ink">Saved layouts</span>
          <form
            className="flex min-w-0 flex-1 items-center justify-end gap-1.5"
            onSubmit={(e) => {
              e.preventDefault();
              save();
            }}
          >
            <input
              name="layout-name"
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 32))}
              placeholder="Name it: Work, Coding…"
              aria-label="Name for this window layout"
              className="izk-field izk-no-drag h-[28px] min-w-0 max-w-[190px] flex-1 px-2.5 text-[11.5px]"
            />
            <button type="submit" disabled={!!busy || disabled || !name.trim()} className="izk-btn-primary izk-no-drag h-[28px] shrink-0 px-3 text-[11.5px] disabled:opacity-50">
              {busy === "save" ? "Saving…" : "Save these windows"}
            </button>
          </form>
        </div>
        {saved.length === 0 ? (
          <p className="mt-2 text-[10.5px] leading-snug text-izk-muted">
            Place your apps the way you like them, name it and save. Later, one tap (or “set up my Work layout”) puts every window back and opens the apps that aren’t running.
          </p>
        ) : (
          <ul className="mt-2 flex flex-col gap-1.5">
            {saved.map((l) => (
              <li key={l.name} className="flex items-center gap-2 rounded-xl border border-white/8 bg-black/15 px-2.5 py-1.5">
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[12px] font-semibold text-izk-ink">{l.name}</span>
                  <span className="block truncate text-[10.5px] text-izk-muted" title={l.apps.join(", ")}>
                    {l.apps.length} app{l.apps.length === 1 ? "" : "s"}: {l.apps.join(", ")} · {savedWhen(l.at)}
                  </span>
                </span>
                <button
                  type="button"
                  disabled={!!busy || disabled}
                  onClick={() => void go(`restore-${l.name}`, () => api.layoutRestore(l.name))}
                  title={`Or say “set up my ${l.name} layout”`}
                  className="izk-pill izk-no-drag shrink-0 px-3 py-1 text-[11px]"
                >
                  {busy === `restore-${l.name}` ? "Setting up…" : "Set up"}
                </button>
                <button
                  type="button"
                  disabled={!!busy || disabled}
                  onClick={() => forget(l.name)}
                  onBlur={() => deleting === l.name && setDeleting("")}
                  aria-label={deleting === l.name ? `Press again to delete ${l.name}` : `Delete ${l.name}`}
                  className={`izk-no-drag shrink-0 rounded-full px-2 py-1 text-[11px] transition-colors ${deleting === l.name ? "bg-izk-danger/20 text-izk-danger" : "text-izk-muted hover:text-izk-ink"}`}
                >
                  {deleting === l.name ? "Delete?" : "✕"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="mt-3 rounded-2xl border border-white/10 bg-white/[0.025] p-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="min-w-0">
            <span className="block text-[12px] font-semibold text-izk-ink">Dim the rest</span>
            <span className="block text-[10.5px] leading-snug text-izk-muted">Everything but the window you’re in fades back. Switch windows and the light follows you.</span>
          </span>
          <div role="group" aria-label="How dark the rest goes" className="flex shrink-0 items-center gap-1">
            {DIMS.map((d) => (
              <button
                key={d.name}
                type="button"
                aria-pressed={dim === d.id}
                disabled={!!busy || disabled}
                onClick={() => void go(`dim-${d.name}`, () => api.dimSet(d.id))}
                title={d.id ? `Or say “dim the rest${d.id === "soft" ? " a little" : d.id === "deep" ? " more" : ""}”` : "Or say “undim”"}
                className="izk-pill izk-no-drag flex items-center gap-1.5 px-2.5 py-1 text-[11px]"
              >
                <span aria-hidden className="h-2 w-2 rounded-full border border-white/30" style={{ background: d.shade ? `rgba(0,0,0,${d.shade})` : "rgba(255,255,255,0.8)" }} />
                {d.name}
              </button>
            ))}
          </div>
        </div>
        <label className="mt-2 flex items-center justify-between gap-2 text-[11px] text-izk-muted">
          <span>Also while I focus (“focus for 25 minutes”)</span>
          <Toggle checked={!!focusDims} onChange={(v) => patch({ focus_dims: v })} label="Dim the rest while I focus" />
        </label>
        <p className="mt-2 text-[10.5px] leading-snug text-izk-muted">
          By voice, for one app: “keep Spotify on top”, “make Discord see-through”, “make this window 50% transparent”, “unpin Spotify”, “make Discord solid again” — or “hide everything except this” (“undo the layout” brings them back).
        </p>
      </div>
      {message && <p role="status" className="mt-3 text-[12px] leading-relaxed text-izk-teal">{message}</p>}
      {error && <p role="alert" className="mt-3 text-[12px] leading-relaxed text-izk-danger">{error}</p>}
    </Section>
  );
}
