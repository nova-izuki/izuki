import { useEffect, useRef, useState } from "react";
import { api, type LookPreset, type LooksStatus } from "../lib/ipc";
import { cx, Row, Section, Toggle } from "./ui";

/** A small picture of Windows in this look: wallpaper, a window, the taskbar. */
function Mock({ p }: { p: LookPreset }) {
  const glass = p.dark ? "rgba(20,22,30,0.78)" : "rgba(248,250,252,0.82)";
  const windowBody = p.dark ? "rgba(32,34,42,0.92)" : "rgba(255,255,255,0.94)";
  const line = p.dark ? "rgba(255,255,255,0.10)" : "rgba(15,23,42,0.08)";
  return (
    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-[10px]" style={{ background: p.preview }}>
      <div
        className="absolute left-[14%] top-[14%] h-[52%] w-[58%] overflow-hidden rounded-[5px] shadow-[0_6px_18px_rgba(0,0,0,0.35)]"
        style={{ background: windowBody, border: `1px solid ${p.titles ? p.accent : line}` }}
      >
        <div className="flex h-[16%] items-center gap-[3px] px-[6%]" style={{ background: p.titles ? p.accent : "transparent" }}>
          <span className="h-[3px] w-[18%] rounded-full" style={{ background: p.titles ? "rgba(255,255,255,0.75)" : line }} />
        </div>
        <div className="space-y-[6%] p-[8%]">
          <div className="h-[4px] w-[70%] rounded-full" style={{ background: line }} />
          <div className="h-[4px] w-[52%] rounded-full" style={{ background: line }} />
          <div className="h-[4px] w-[34%] rounded-full" style={{ background: p.accent, opacity: 0.85 }} />
        </div>
      </div>
      <div
        className="absolute inset-x-0 bottom-0 flex h-[12%] items-center justify-center gap-[3%]"
        style={{ background: p.bars ? `color-mix(in srgb, ${p.accent} 45%, #0b0d12)` : glass }}
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <span key={i} className="h-[46%] w-[3.4%] rounded-[2px]" style={{ background: i === 0 ? p.accent : p.dark || p.bars ? "rgba(255,255,255,0.55)" : "rgba(15,23,42,0.4)" }} />
        ))}
      </div>
    </div>
  );
}

/** Errors in plain words: Windows' codes in brackets are dropped. */
function friendly(e: unknown): string {
  const text = String(e).replace(/\s*\((?:[^()]|\([^()]*\))*\)/g, "").trim();
  return text ? `${text}${/[.!?]$/.test(text) ? "" : "."}` : "Windows didn't accept that change.";
}

/**
 * Looks (winlook.rs): one tap changes how Windows looks — dark or light, an
 * accent colour on the taskbar, Start and title bars, see-through effects
 * and a wallpaper painted for your screen. Windows' own settings only, and
 * Undo puts back everything from before the first change.
 */
export function LooksCard() {
  const [s, setS] = useState<LooksStatus | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");
  const [withWallpaper, setWithWallpaper] = useState(true);
  const [loaded, setLoaded] = useState(false);
  /** The picker fires while you drag: apply once you've settled on a colour. */
  const pickTimer = useRef<number | undefined>(undefined);
  const [picking, setPicking] = useState<string | null>(null);
  useEffect(() => () => window.clearTimeout(pickTimer.current), []);

  useEffect(() => {
    void api
      .looksStatus()
      .then(setS)
      .catch((e) => setError(`Couldn't read your Windows colours (${e}).`))
      .finally(() => setLoaded(true));
  }, []);

  const run = (key: string, what: () => Promise<LooksStatus | null>, said: string) => {
    setBusy(key);
    setError("");
    setDone("");
    void what()
      .then((next) => {
        if (next) setS(next);
        setDone(next?.note || said);
      })
      .catch((e) => setError(friendly(e)))
      .finally(() => setBusy(null));
  };

  return (
    <Section
      id="settings-looks"
      title="Looks"
      hint="Give Windows a whole new look in one tap: colours, dark or light, and a wallpaper painted for your screen. Only your own settings change, and Undo puts everything back."
    >
      {!s && !error && <p className="py-2 text-[11.5px] text-izk-muted">{loaded ? "Looks work in the Izuki app on Windows." : "Reading your Windows colours…"}</p>}
      {s && (
        <>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {s.presets.map((p) => {
              const current = s.current === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  disabled={busy !== null}
                  onClick={() => run(p.id, () => api.lookApply(p.id, withWallpaper), `${p.name} is on.`)}
                  className={cx(
                    "izk-no-drag group relative rounded-[14px] border p-1.5 text-left transition-all duration-200",
                    "hover:-translate-y-[1px] hover:border-white/25 disabled:cursor-wait",
                    current ? "border-transparent ring-2" : "border-white/10"
                  )}
                  style={current ? { boxShadow: `0 0 0 2px ${p.accent}, 0 8px 24px color-mix(in srgb, ${p.accent} 35%, transparent)` } : undefined}
                  aria-pressed={current}
                >
                  <Mock p={p} />
                  <div className="px-1 pb-0.5 pt-2">
                    <div className="flex items-center gap-1.5 text-[12.5px] font-semibold text-izk-ink">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ background: p.accent }} />
                      {p.name}
                      {current && <span className="ml-auto text-[10.5px] font-medium text-izk-muted">On</span>}
                      {busy === p.id && <span className="ml-auto text-[10.5px] font-medium text-izk-muted">Applying…</span>}
                    </div>
                    <div className="mt-0.5 text-[10.5px] leading-snug text-izk-muted">{p.blurb}</div>
                  </div>
                </button>
              );
            })}
          </div>

          <Row label="Change my wallpaper too" hint="Off keeps your own picture and changes just the colours.">
            <Toggle checked={withWallpaper} onChange={setWithWallpaper} />
          </Row>

          <div className="izk-divider" />

          <Row label="Accent colour" hint="Used for buttons, highlights, and wherever you turn it on below.">
            <div className="flex max-w-[260px] flex-wrap justify-end gap-1.5">
              {s.swatches.map(([name, colour]) => (
                <button
                  key={name}
                  type="button"
                  title={name}
                  aria-label={`${name} accent`}
                  disabled={busy !== null}
                  onClick={() => run(`accent-${name}`, () => api.lookAccent(colour), `Accent colour: ${name}.`)}
                  className={cx(
                    "izk-no-drag h-[22px] w-[22px] rounded-full border border-white/20 transition-transform hover:scale-110",
                    s.accent.toLowerCase() === colour.toLowerCase() && "ring-2 ring-white/80 ring-offset-2 ring-offset-black/40"
                  )}
                  style={{ background: colour }}
                />
              ))}
              {/* Any colour (shows yours when it isn't one of the swatches). */}
              <label
                title="Pick any colour"
                className={cx(
                  "izk-no-drag relative h-[22px] w-[22px] cursor-pointer overflow-hidden rounded-full border border-white/30",
                  !s.swatches.some(([, c]) => c.toLowerCase() === s.accent.toLowerCase()) && "ring-2 ring-white/80 ring-offset-2 ring-offset-black/40"
                )}
                style={{ background: `conic-gradient(from 0deg, #f43f5e, #f59e0b, #22c55e, #06b6d4, #6366f1, #d946ef, #f43f5e)` }}
              >
                <span className="absolute inset-[5px] rounded-full border border-white/40" style={{ background: picking ?? s.accent }} />
                <input
                  type="color"
                  aria-label="Pick any accent colour"
                  className="absolute inset-0 cursor-pointer opacity-0"
                  value={picking ?? s.accent}
                  disabled={busy !== null}
                  onChange={(e) => {
                    const colour = e.target.value;
                    setPicking(colour);
                    window.clearTimeout(pickTimer.current);
                    pickTimer.current = window.setTimeout(() => {
                      run("accent-custom", () => api.lookAccent(colour), `Accent colour: ${colour}.`);
                      setPicking(null);
                    }, 700);
                  }}
                />
              </label>
            </div>
          </Row>
          <Row label="Dark mode" hint="Windows and apps in dark colours.">
            <Toggle checked={s.dark} disabled={busy !== null} onChange={(v) => run("dark", () => api.lookSwitch("dark", v), v ? "Dark mode on." : "Light mode on.")} />
          </Row>
          <Row label="See-through effects" hint="Frosted-glass taskbar, Start and menus. Off is a little faster on a slow PC.">
            <Toggle checked={s.glass} disabled={busy !== null} onChange={(v) => run("glass", () => api.lookSwitch("glass", v), v ? "See-through effects on." : "See-through effects off.")} />
          </Row>
          <Row label="Accent on the taskbar and Start" hint={s.dark ? "Tints the taskbar and Start in your accent colour." : "Windows only allows this in dark mode."}>
            <Toggle checked={s.bars} disabled={busy !== null || !s.dark} onChange={(v) => run("bars", () => api.lookSwitch("bars", v), v ? "Taskbar and Start tinted." : "Taskbar and Start back to plain.")} />
          </Row>
          <Row label="Accent on title bars" hint="Window title bars and borders in your accent colour.">
            <Toggle checked={s.titles} disabled={busy !== null} onChange={(v) => run("titles", () => api.lookSwitch("titles", v), v ? "Title bars tinted." : "Title bars back to plain.")} />
          </Row>

          {s.can_undo && (
            <Row label="Undo" hint="Put back the colours and wallpaper you had before Izuki changed your look.">
              <button
                type="button"
                disabled={busy !== null}
                className="izk-btn-primary izk-no-drag h-[28px] px-3 text-[11.5px]"
                onClick={() => run("undo", () => api.lookUndo(), "Your old look is back.")}
              >
                {busy === "undo" ? "Putting it back…" : "Put my old look back"}
              </button>
            </Row>
          )}
        </>
      )}
      {done && !error && <p className="mt-1 text-[11.5px] text-izk-muted">✓ {done}</p>}
      {error && <p className="mt-1 text-[11.5px] text-izk-danger">{error}</p>}
      <p className="mt-2 text-[10.5px] leading-snug text-izk-muted/80">
        You can also just say “make my PC look Nova”, “accent colour purple” or “undo the look”. Izuki only changes your own Windows settings, so it can't make the taskbar fully see-through. On Windows 11 that needs a tool that changes Windows itself.
      </p>
    </Section>
  );
}
