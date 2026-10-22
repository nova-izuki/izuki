import { useEffect, useMemo, useRef, useState } from "react";
import { Clock, Gamepad2, Gem, Heart, Image as ImageIcon, Layers, MapPin, Moon, Palette, RefreshCw, RotateCcw, Shuffle, Sparkles, Sun, Undo2, Wand2, Wrench, Zap } from "lucide-react";
import { api, type LookAuto, type LookPhoto, type LookPreset, type LooksStatus, type WindowsTweak } from "../../lib/ipc";
import { onStyleSection, takeStyleSection, type StyleSection } from "../../lib/styleNav";
import { cx } from "../ui";

/**
 * Style: how Windows looks, in one place — a big live preview of your
 * desktop, then Looks (one tap, painted wallpapers), Tweaks (Windhawk-style
 * switches as tiles) and Auto (daily photo, day & night, shuffle). Laid out in tiles so
 * nothing needs much scrolling. Movement only on hover or while applying,
 * so it costs nothing when you're not looking.
 */

/** Errors in plain words: Windows' codes in brackets are dropped. */
function friendly(e: unknown): string {
  const text = String(e).replace(/\s*\((?:[^()]|\([^()]*\))*\)/g, "").trim();
  return text ? `${text}${/[.!?]$/.test(text) ? "" : "."}` : "Windows didn't accept that change.";
}

/** Big wallpaper pictures, painted once per look. */
const big = new Map<string, string>();

function useBigPicture(id: string | null): string | null {
  const [url, setUrl] = useState<string | null>(id ? big.get(id) ?? null : null);
  useEffect(() => {
    if (!id) return setUrl(null);
    const have = big.get(id);
    if (have) return setUrl(have);
    let alive = true;
    void api
      .lookPreview(id)
      .then((u) => {
        if (!u) return;
        big.set(id, u);
        if (alive) setUrl(u);
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [id]);
  return url;
}

/** Big pictures of Daily photo's photos, by file. */
const bigPhotos = new Map<string, string>();

function useBigPhoto(file: string | null): string | null {
  const [url, setUrl] = useState<string | null>(file ? bigPhotos.get(file) ?? null : null);
  useEffect(() => {
    if (!file) return setUrl(null);
    const have = bigPhotos.get(file);
    if (have) return setUrl(have);
    setUrl(null);
    let alive = true;
    void api
      .lookPhotoPreview(file)
      .then((u) => {
        if (!u) return;
        bigPhotos.set(file, u);
        if (alive) setUrl(u);
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, [file]);
  return url;
}

/** "Sporty summits", else the place, else where it's from. */
function photoName(p: LookPhoto): string {
  return p.title && p.title !== p.source ? p.title : p.place || p.source;
}

/** The hero: your desktop in a look — wallpaper, a window, the taskbar. */
function Hero({ preset, photo, label, sweep, accent, dark, bars, titles }: { preset: LookPreset | null; photo: LookPhoto | null; label: string; sweep: number; accent: string; dark: boolean; bars: boolean; titles: boolean }) {
  const url = useBigPicture(photo ? null : preset?.id ?? null);
  const photoUrl = useBigPhoto(photo?.file ?? null);
  // Two layers crossfade: the new picture fades in over the old one.
  const [{ layers, front }, setFade] = useState<{ layers: [string | null, string | null]; front: number }>({ layers: [null, null], front: 0 });
  // A photo: the big picture, its small one while that loads.
  const shot = photoUrl ?? photo?.thumb;
  const bg = photo && shot ? `url(${shot}) center / cover` : url ? `url(${url}) center / cover` : preset?.preview ?? "linear-gradient(135deg,#1e293b,#0f172a)";
  useEffect(() => {
    setFade((cur) => {
      if (cur.layers[cur.front] === bg) return cur;
      const next = cur.front === 0 ? 1 : 0;
      const copy: [string | null, string | null] = [cur.layers[0], cur.layers[1]];
      copy[next] = bg;
      return { layers: copy, front: next };
    });
  }, [bg]);
  const glass = dark ? "rgba(17,19,26,0.82)" : "rgba(250,251,253,0.86)";
  const line = dark ? "rgba(255,255,255,0.12)" : "rgba(15,23,42,0.1)";
  const now = new Date();
  return (
    <div className="izk-hero relative aspect-[16/7.2] w-full overflow-hidden rounded-[18px] border border-white/10 shadow-[0_18px_50px_rgba(0,0,0,0.45)]">
      {layers.map((l, i) => (
        <div
          key={i}
          className={cx("izk-hero-layer absolute inset-0 transition-opacity duration-700", i === front ? "opacity-100" : "opacity-0")}
          style={{ background: l ?? undefined, animationName: i === front ? (front ? "izk-hero-in-b" : "izk-hero-in-a") : "none" }}
        />
      ))}
      {/* Stars that twinkle while you hover (dark painted looks). */}
      {dark && !photo &&
        [12, 27, 44, 61, 78, 90].map((x, i) => (
          <span key={i} className="izk-twinkle absolute h-[2px] w-[2px] rounded-full bg-white" style={{ left: `${x}%`, top: `${8 + ((i * 17) % 40)}%`, animationDelay: `${i * 0.37}s` }} />
        ))}
      {/* A window */}
      <div className="absolute left-[7%] top-[12%] h-[56%] w-[44%] overflow-hidden rounded-[8px] shadow-[0_12px_30px_rgba(0,0,0,0.4)] transition-colors duration-500" style={{ background: glass, border: `1px solid ${titles ? accent : line}` }}>
        <div className="flex h-[15%] items-center justify-between px-[4%] transition-colors duration-500" style={{ background: titles ? accent : "transparent" }}>
          <span className="h-[4px] w-[22%] rounded-full" style={{ background: titles ? "rgba(255,255,255,0.8)" : line }} />
          <span className="flex gap-[6px]">
            {[0, 1, 2].map((d) => (
              <span key={d} className="h-[5px] w-[5px] rounded-full" style={{ background: titles ? "rgba(255,255,255,0.7)" : line }} />
            ))}
          </span>
        </div>
        <div className="space-y-[5%] p-[5%]">
          <div className="h-[6px] w-[64%] rounded-full" style={{ background: line }} />
          <div className="h-[6px] w-[48%] rounded-full" style={{ background: line }} />
          <div className="h-[6px] w-[56%] rounded-full" style={{ background: line }} />
          <div className="mt-[6%] h-[18px] w-[30%] rounded-[6px] transition-colors duration-500" style={{ background: accent }} />
        </div>
      </div>
      {/* A widget */}
      <div className="absolute right-[6%] top-[14%] w-[22%] rounded-[10px] p-[1.6%] transition-colors duration-500" style={{ background: glass, border: `1px solid ${line}` }}>
        <div className={cx("text-[clamp(14px,2.4vw,26px)] font-semibold leading-none tracking-tight", dark ? "text-white" : "text-slate-800")}>
          {now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
        </div>
        <div className={cx("mt-1 text-[clamp(9px,1vw,11px)]", dark ? "text-white/60" : "text-slate-500")}>{now.toLocaleDateString([], { weekday: "long", day: "numeric", month: "long" })}</div>
        <div className="mt-2 h-[4px] w-full overflow-hidden rounded-full" style={{ background: line }}>
          <div className="h-full w-[62%] rounded-full transition-colors duration-500" style={{ background: accent }} />
        </div>
      </div>
      {/* The taskbar */}
      <div
        className="absolute inset-x-0 bottom-0 flex h-[11%] items-center justify-center gap-[1.4%] transition-colors duration-500"
        style={{ background: bars ? `color-mix(in srgb, ${accent} 42%, #090b10)` : glass }}
      >
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <span key={i} className="h-[46%] w-[2.6%] rounded-[4px] transition-colors duration-500" style={{ background: i === 0 ? accent : dark || bars ? "rgba(255,255,255,0.55)" : "rgba(15,23,42,0.38)" }} />
        ))}
      </div>
      {/* About this picture, like Windows Spotlight's: where it is, and the story on hover. */}
      {photo && (photo.place || photo.about || photo.title) && (
        <div className="group absolute bottom-[14%] right-[3%] max-w-[46%] rounded-[12px] bg-black/50 px-2.5 py-1.5 text-white shadow-[0_8px_24px_rgba(0,0,0,0.35)] backdrop-blur-md">
          <div className="flex items-center gap-1.5 text-[11.5px] font-semibold leading-tight">
            <MapPin size={12} className="shrink-0 opacity-80" />
            <span className="truncate">{photo.place || photoName(photo)}</span>
          </div>
          {photo.about && <p className="mt-1 hidden text-[10.5px] leading-snug text-white/80 group-hover:line-clamp-4 group-hover:block">{photo.about}</p>}
          {photo.credit && <p className="mt-0.5 truncate text-[9.5px] text-white/60">© {photo.credit}</p>}
        </div>
      )}
      {/* The sweep of light when a look goes on. */}
      {sweep > 0 && <div key={sweep} className="izk-hero-sweep pointer-events-none absolute inset-0" />}
      <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full border border-white/15 bg-black/45 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
        <span className="h-2 w-2 rounded-full" style={{ background: accent }} />
        {label}
      </div>
    </div>
  );
}

const GROUPS: Array<{ id: string; label: string; icon: string }> = [
  { id: "all", label: "All", icon: "✨" },
  { id: "taskbar", label: "Taskbar", icon: "▭" },
  { id: "start", label: "Start", icon: "⊞" },
  { id: "desktop", label: "Desktop", icon: "🖼️" },
  { id: "explorer", label: "File Explorer", icon: "📁" },
  { id: "look", label: "Look & cursor", icon: "🖱️" },
  { id: "speed", label: "Speed & gaming", icon: "⚡" },
  { id: "quiet", label: "Quiet & private", icon: "🤫" },
];

const PACKS: Array<{ id: string; label: string; hint: string; icon: React.ReactNode; colours: string }> = [
  { id: "gamer", label: "Gamer", hint: "Snappy windows, no game recording, no Sticky Keys pop-up", icon: <Gamepad2 size={15} />, colours: "from-fuchsia-500/30 to-indigo-500/25" },
  { id: "clean", label: "Clean & private", hint: "No ads, tips, nags or tracking ID", icon: <Sparkles size={15} />, colours: "from-emerald-500/25 to-cyan-500/25" },
  { id: "premium", label: "Premium & minimal", hint: "Just your apps on the taskbar: no search box, Task view, Widgets, Copilot or badges", icon: <Gem size={15} />, colours: "from-sky-500/25 to-violet-500/25" },
  { id: "power", label: "Power user", hint: "Extensions, hidden files, full paths, End task, seconds", icon: <Wrench size={15} />, colours: "from-amber-500/25 to-rose-500/25" },
];

function MiniSwitch({ on }: { on: boolean }) {
  return (
    <span className={cx("relative inline-block h-[18px] w-[32px] shrink-0 rounded-full border transition-colors duration-300", on ? "border-white/30" : "border-white/10 bg-black/35")} style={on ? { background: "linear-gradient(135deg,#7C5CFF,#4ECDC4)" } : undefined}>
      <span className="absolute top-[2px] h-[12px] w-[12px] rounded-full bg-white shadow transition-[left] duration-300" style={{ left: on ? 16 : 2 }} />
    </span>
  );
}

function Tile({ on, title, hint, onClick, disabled, badge }: { on: boolean; title: string; hint?: string; onClick: () => void; disabled?: boolean; badge?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      disabled={disabled}
      onClick={onClick}
      className={cx(
        "izk-tile izk-no-drag group relative flex min-h-[74px] flex-col gap-1 rounded-[14px] border p-2.5 text-left transition-all duration-200",
        "hover:-translate-y-[1px] disabled:cursor-wait disabled:opacity-60",
        on ? "border-izk-teal/40 bg-izk-teal/[0.09]" : "border-white/8 bg-white/[0.035] hover:border-white/20"
      )}
    >
      <span className="flex w-full items-start justify-between gap-2">
        <span className="text-[12px] font-semibold leading-tight text-izk-ink">{title}</span>
        <MiniSwitch on={on} />
      </span>
      {hint && <span className="line-clamp-2 text-[10.5px] leading-snug text-izk-muted">{hint}</span>}
      {badge && <span className="mt-auto self-start rounded-full bg-white/8 px-1.5 py-[1px] text-[9.5px] text-izk-muted">{badge}</span>}
    </button>
  );
}

export function StyleTab() {
  const [section, setSection] = useState<StyleSection>(() => takeStyleSection() ?? "looks");
  useEffect(() => onStyleSection(setSection), []);
  const [s, setS] = useState<LooksStatus | null>(null);
  const [tweaks, setTweaks] = useState<WindowsTweak[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const busyRef = useRef<string | null>(null);
  busyRef.current = busy;
  const [error, setError] = useState("");
  const [done, setDone] = useState("");
  const [hover, setHover] = useState<string | null>(null);
  const [sweep, setSweep] = useState(0);
  const [withWallpaper, setWithWallpaper] = useState(true);
  const [group, setGroup] = useState("taskbar");
  const [needsRestart, setNeedsRestart] = useState(false);
  const pickTimer = useRef<number | undefined>(undefined);
  const [picking, setPicking] = useState<string | null>(null);
  useEffect(() => () => window.clearTimeout(pickTimer.current), []);

  useEffect(() => {
    void api.looksStatus().then(setS).catch((e) => setError(friendly(e)));
    void api.tweaksList().then(setTweaks).catch((e) => setError(friendly(e)));
  }, []);

  const run = <T,>(key: string, what: () => Promise<T>, then: (v: T) => void, said: string | ((v: T) => string), failed?: () => void) => {
    setBusy(key);
    setError("");
    setDone("");
    void what()
      .then((v) => {
        then(v);
        setDone(typeof said === "function" ? said(v) : said);
      })
      .catch((e) => {
        setError(friendly(e));
        failed?.();
      })
      .finally(() => setBusy(null));
  };
  const setLooks = (next: LooksStatus | null) => next && setS(next);

  const presets = s?.presets ?? [];
  const current = presets.find((p) => p.id === s?.current) ?? null;
  const shown = presets.find((p) => p.id === hover) ?? current;
  const heroAccent = hover && shown ? shown.accent : picking ?? s?.accent ?? "#4ECDC4";
  const heroDark = hover && shown ? shown.dark : s?.dark ?? true;
  const heroBars = hover && shown ? shown.bars : s?.bars ?? false;
  const heroTitles = hover && shown ? shown.titles : s?.titles ?? false;
  const photoNow = s?.current === "photo" && s.photo ? s.photo : null;
  const heroPhoto = hover ? null : photoNow;
  const heroLabel = hover && shown ? `Preview: ${shown.name} — tap to use it` : current ? `Your look: ${current.name}` : photoNow ? `Your look: ${photoName(photoNow)}` : "Your own colours";

  const counts = useMemo(() => {
    const c: Record<string, [number, number]> = {};
    for (const t of tweaks) {
      for (const g of [t.group, "all"]) {
        const [on, all] = c[g] ?? [0, 0];
        c[g] = [on + (t.on ? 1 : 0), all + 1];
      }
    }
    return c;
  }, [tweaks]);

  const apply = (p: LookPreset) =>
    run(
      p.id,
      () => api.lookApply(p.id, withWallpaper),
      (next) => {
        setLooks(next);
        setSweep((n) => n + 1);
        setHover(null);
      },
      `${p.name} is on.`
    );

  const auto = s?.auto;
  const setAuto = (patch: Partial<LookAuto>) => {
    if (!auto) return;
    if (busy) return;
    const next = { ...auto, ...patch };
    setS((cur) => (cur ? { ...cur, auto: next } : cur));
    run("auto", () => api.lookAuto(next), setLooks, next.mode === "off" ? "Auto is off." : next.mode === "daynight" ? "Day & night is on." : next.mode === "photo" ? "Daily photo is on — fresh photos you haven't seen, colours to match." : "Shuffle is on.", () => {
      // Show what's really saved, not what failed to save.
      void api.looksStatus().then(setLooks).catch(() => setS((cur) => (cur ? { ...cur, auto } : cur)));
    });
  };

  // One tap: real photos with matching colours, and a clean taskbar.
  const makePremium = () => {
    if (!auto || busy) return;
    const next: LookAuto = { ...auto, mode: "photo" };
    run(
      "premium",
      async () => {
        const looks = await api.lookAuto(next);
        // The clean taskbar is a bonus: the photo counts even if a tweak doesn't.
        const tidy = await api.tweakPack("premium").catch(() => null);
        return { looks, tidy };
      },
      ({ looks, tidy }) => {
        setLooks(looks);
        if (tidy?.length) {
          setTweaks(tidy);
          // Some of the clean taskbar shows only after Explorer restarts.
          if (tidy.some((t) => t.on && t.restart)) setNeedsRestart(true);
        }
        setSweep((n) => n + 1);
        setSection("auto");
      },
      // Only what really happened.
      ({ looks, tidy }) =>
        `${looks?.photo ? `Premium is on: ${photoName(looks.photo)}, with colours to match` : "Real photos are on — the first one is still on its way"}${tidy?.length ? ", and a clean taskbar." : "."}`
    );
  };
  const photos = s?.history ?? [];

  return (
    <div className="flex flex-col gap-3">
      <Hero preset={shown} photo={heroPhoto} label={heroLabel} sweep={sweep} accent={heroAccent} dark={heroDark} bars={heroBars} titles={heroTitles} />

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex rounded-full border border-white/10 bg-white/5 p-[3px]">
          {(
            [
              ["looks", "Looks", <Palette key="p" size={13} />],
              ["tweaks", "Tweaks", <Wand2 key="w" size={13} />],
              ["auto", "Auto", <Clock key="c" size={13} />],
            ] as const
          ).map(([id, label, icon]) => (
            <button
              key={id}
              type="button"
              onClick={() => setSection(id)}
              className={cx(
                "izk-no-drag flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-all duration-200",
                section === id ? "bg-white/15 text-izk-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]" : "text-izk-muted hover:text-izk-ink"
              )}
            >
              {icon}
              {label}
              {id === "tweaks" && counts.all && <span className="rounded-full bg-white/10 px-1.5 text-[10px]">{counts.all[0]}</span>}
              {id === "auto" && auto && auto.mode !== "off" && <span className="h-1.5 w-1.5 rounded-full bg-izk-teal" />}
            </button>
          ))}
        </div>
        <span className="ml-auto text-[11px] text-izk-muted">
          {busy ? (busy === "premium" || busy === "photo" || (busy === "auto" && auto?.mode === "photo") ? "Finding a fresh 4K photo…" : "Working…") : error ? <span className="text-izk-danger">{error}</span> : done ? `✓ ${done}` : "Only your own Windows settings — nothing injected, all reversible."}
        </span>
      </div>

      {auto && auto.mode !== "photo" && (
        <div className="izk-card izk-rise flex flex-wrap items-center gap-3 p-3" style={{ background: "linear-gradient(115deg, rgba(124,92,255,0.16), rgba(78,205,196,0.10) 60%, rgba(255,255,255,0.03))" }}>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] bg-white/12 text-izk-ink">
            <Gem size={17} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[13px] font-semibold text-izk-ink">
              {auto.mode === "shuffle" ? "Your wallpaper is on Shuffle: Izuki's painted looks" : auto.mode === "daynight" ? "Your wallpaper is on Day & night: Izuki's painted looks" : "Make your PC feel premium"}
            </span>
            <span className="block text-[11px] leading-snug text-izk-muted">Real 4K photos from Windows Spotlight and Bing, a new one you haven't seen each time, with colours matched to it and a clean taskbar. Undo puts yours back.</span>
          </span>
          <button type="button" disabled={busy !== null} onClick={makePremium} className="izk-btn-primary izk-no-drag flex h-[32px] items-center gap-1.5 px-3.5 text-[12px] disabled:opacity-60">
            <Sparkles size={13} /> {busy === "premium" ? "Finding a photo…" : "Make my PC premium"}
          </button>
        </div>
      )}

      {section === "looks" && (
        <div id="style-looks" className="izk-card izk-grain izk-rise flex flex-col gap-3 p-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[13px] font-semibold text-izk-ink">{presets.length} looks</span>
            <span className="text-[11px] text-izk-muted">Hover to preview · tap to use · or say “make my PC look Synthwave”</span>
            <button
              type="button"
              onClick={() => setWithWallpaper((w) => !w)}
              className={cx("izk-no-drag ml-auto flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px]", withWallpaper ? "border-izk-teal/40 bg-izk-teal/10 text-izk-ink" : "border-white/10 text-izk-muted")}
            >
              <MiniSwitch on={withWallpaper} /> Wallpaper too
            </button>
            {s?.can_undo && (
              <button type="button" disabled={busy !== null} onClick={() => run("undo", () => api.lookUndo(), (n) => { setLooks(n); setSweep((x) => x + 1); }, "Your old look is back.")} className="izk-no-drag flex items-center gap-1.5 rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-izk-ink hover:bg-white/8">
                <Undo2 size={12} /> Put my old look back
              </button>
            )}
          </div>
          {!s && <p className="text-[11.5px] text-izk-muted">{error || "Reading your Windows colours…"}</p>}
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
            {presets.map((p) => {
              const on = s?.current === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  disabled={busy !== null}
                  onMouseEnter={() => setHover(p.id)}
                  onMouseLeave={() => setHover((h) => (h === p.id ? null : h))}
                  onFocus={() => setHover(p.id)}
                  onBlur={() => setHover(null)}
                  onClick={() => apply(p)}
                  className={cx("izk-look izk-no-drag group relative overflow-hidden rounded-[14px] border text-left transition-all duration-300 hover:-translate-y-[2px] disabled:cursor-wait", on ? "border-transparent" : "border-white/10")}
                  style={on ? { boxShadow: `0 0 0 2px ${p.accent}, 0 10px 28px color-mix(in srgb, ${p.accent} 40%, transparent)` } : undefined}
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <div className="izk-look-pic absolute inset-0" style={{ background: p.preview }} />
                    <div className="absolute inset-x-0 bottom-0 h-[14%]" style={{ background: p.bars ? `color-mix(in srgb, ${p.accent} 45%, #090b10)` : p.dark ? "rgba(14,16,22,0.75)" : "rgba(248,250,252,0.8)" }} />
                    <span className="absolute right-1.5 top-1.5 rounded-full bg-black/45 px-1.5 py-[1px] text-[9.5px] font-semibold text-white backdrop-blur-sm">{p.dark ? "Dark" : "Light"}</span>
                    {busy === p.id && <div className="izk-hero-sweep absolute inset-0" />}
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-1.5">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: p.accent }} />
                    <span className="truncate text-[12px] font-semibold text-izk-ink">{p.name}</span>
                    {on && <span className="ml-auto text-[10px] font-semibold text-izk-teal">ON</span>}
                  </div>
                </button>
              );
            })}
          </div>

          {s && (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <span className="mr-1 text-[12px] font-semibold text-izk-ink">Accent</span>
                {s.swatches.map(([name, colour]) => (
                  <button
                    key={name}
                    type="button"
                    title={name}
                    aria-label={`${name} accent`}
                    disabled={busy !== null}
                    onClick={() => run(`accent-${name}`, () => api.lookAccent(colour), setLooks, `Accent colour: ${name}.`)}
                    className={cx("izk-no-drag h-[22px] w-[22px] rounded-full border border-white/20 transition-transform duration-200 hover:scale-125", s.accent.toLowerCase() === colour.toLowerCase() && "ring-2 ring-white/80 ring-offset-2 ring-offset-black/40")}
                    style={{ background: colour }}
                  />
                ))}
                <label
                  title="Pick any colour"
                  className={cx("izk-no-drag relative h-[22px] w-[22px] cursor-pointer overflow-hidden rounded-full border border-white/30", !s.swatches.some(([, c]) => c.toLowerCase() === s.accent.toLowerCase()) && "ring-2 ring-white/80 ring-offset-2 ring-offset-black/40")}
                  style={{ background: "conic-gradient(from 0deg, #f43f5e, #f59e0b, #22c55e, #06b6d4, #6366f1, #d946ef, #f43f5e)" }}
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
                        // Another change is still going: skip this pick (pick again once it's done).
                        if (busyRef.current) return setPicking(null);
                        run("accent-custom", () => api.lookAccent(colour), (n) => { setLooks(n); setPicking(null); }, `Accent colour: ${colour}.`);
                      }, 700);
                    }}
                  />
                </label>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <Tile on={s.dark} title="Dark mode" hint="Windows and apps in dark colours." disabled={busy !== null} onClick={() => run("dark", () => api.lookSwitch("dark", !s.dark), setLooks, s.dark ? "Light mode on." : "Dark mode on.")} />
                <Tile on={s.glass} title="See-through" hint="Frosted-glass taskbar, Start and menus." disabled={busy !== null} onClick={() => run("glass", () => api.lookSwitch("glass", !s.glass), setLooks, "Done.")} />
                <Tile on={s.bars} title="Tinted taskbar & Start" hint={s.dark ? "Your accent colour on them." : "Needs dark mode."} disabled={busy !== null || !s.dark} onClick={() => run("bars", () => api.lookSwitch("bars", !s.bars), setLooks, "Done.")} />
                <Tile on={s.titles} title="Tinted title bars" hint="Window title bars and borders in your accent." disabled={busy !== null} onClick={() => run("titles", () => api.lookSwitch("titles", !s.titles), setLooks, "Done.")} />
              </div>
            </>
          )}
        </div>
      )}

      {section === "tweaks" && (
        <div id="style-tweaks" className="izk-card izk-grain izk-rise flex flex-col gap-3 p-3">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {PACKS.map((p) => (
              <button
                key={p.id}
                type="button"
                disabled={busy !== null}
                onClick={() => run(`pack-${p.id}`, () => api.tweakPack(p.id), setTweaks, `${p.label} pack is on.`, () => void api.tweaksList().then(setTweaks).catch(() => undefined))}
                className={cx("izk-no-drag group flex items-center gap-2.5 rounded-[14px] border border-white/10 bg-gradient-to-br p-2.5 text-left transition-all duration-200 hover:-translate-y-[1px] hover:border-white/25", p.colours)}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-white/12 text-izk-ink">{p.icon}</span>
                <span className="min-w-0">
                  <span className="block text-[12px] font-semibold text-izk-ink">{busy === `pack-${p.id}` ? "Turning on…" : `${p.label} pack`}</span>
                  <span className="block truncate text-[10.5px] text-izk-muted">{p.hint}</span>
                </span>
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {GROUPS.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => setGroup(g.id)}
                className={cx("izk-no-drag flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] transition-colors", group === g.id ? "border-izk-teal/50 bg-izk-teal/15 text-izk-ink" : "border-white/10 text-izk-muted hover:text-izk-ink")}
              >
                <span>{g.icon}</span>
                {g.label}
                {counts[g.id] && <span className="text-[9.5px] opacity-70">{counts[g.id][0]}/{counts[g.id][1]}</span>}
              </button>
            ))}
          </div>
          {!tweaks.length && <p className="text-[11.5px] text-izk-muted">{error || "Reading your Windows settings…"}</p>}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {tweaks
              .filter((t) => group === "all" || t.group === group)
              .map((t) => (
                <Tile
                  key={t.id}
                  on={t.on}
                  title={t.label}
                  hint={t.hint}
                  badge={t.restart ? "↻ after Explorer restarts" : undefined}
                  disabled={busy === t.id}
                  onClick={() =>
                    run(t.id, () => api.tweakSet(t.id, !t.on), (all) => {
                      setTweaks(all);
                      if (t.restart) setNeedsRestart(true);
                    }, `${t.label}: ${t.on ? "off" : "on"}.`)
                  }
                />
              ))}
          </div>
          {needsRestart && (
            <div className="flex flex-wrap items-center gap-2 rounded-[12px] border border-amber-300/30 bg-amber-300/10 p-2.5 text-[11.5px] text-izk-ink">
              <RotateCcw size={14} /> Some changes show after Windows Explorer restarts (the taskbar blinks; your apps stay open).
              <button
                type="button"
                disabled={busy !== null}
                className="izk-btn-primary izk-no-drag ml-auto h-[26px] px-3 text-[11px]"
                onClick={() => run("restart", () => api.restartExplorer(), () => setNeedsRestart(false), "Explorer restarted.")}
              >
                Restart Explorer
              </button>
            </div>
          )}
        </div>
      )}

      {section === "auto" && auto && (
        <div id="style-auto" className="izk-card izk-grain izk-rise flex flex-col gap-3 p-3">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {(
              [
                ["off", "Off", "Your look stays as it is.", <Zap key="z" size={16} />],
                ["photo", "Daily photo", "Real 4K photos like Windows Spotlight — never one you've seen, colours matched.", <ImageIcon key="i" size={16} />],
                ["daynight", "Day & night", "A light look by day, a dark one at night.", <Sun key="s" size={16} />],
                ["shuffle", "Shuffle", "A fresh look every so often.", <Shuffle key="h" size={16} />],
              ] as const
            ).map(([id, label, hint, icon]) => (
              <button
                key={id}
                type="button"
                disabled={busy !== null}
                onClick={() => setAuto({ mode: id })}
                className={cx("izk-no-drag flex flex-col gap-1 rounded-[14px] border p-2.5 text-left transition-all duration-200 hover:-translate-y-[1px]", auto.mode === id ? "border-izk-teal/50 bg-izk-teal/12" : "border-white/10 bg-white/[0.035]")}
              >
                <span className="flex items-center gap-1.5 text-[12.5px] font-semibold text-izk-ink">{icon}{label}</span>
                <span className="text-[10.5px] leading-snug text-izk-muted">{hint}</span>
              </button>
            ))}
          </div>

          {auto.mode === "photo" && (
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-3 rounded-[14px] border border-white/10 bg-white/[0.03] p-2.5 sm:flex-row">
                <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-[10px] bg-white/[0.06] sm:w-[200px]">
                  {s?.photo?.thumb && <img src={s.photo.thumb} alt={s.photo.place || s.photo.title || "Today's photo"} className="h-full w-full object-cover" />}
                  {s?.photo && <span className="absolute bottom-1.5 left-1.5 h-3 w-3 rounded-full border border-white/70" style={{ background: s.photo.accent }} title={`Accent ${s.photo.accent}`} />}
                  {busy === "photo" && <div className="izk-hero-sweep absolute inset-0" />}
                </div>
                {s?.photo ? (
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="text-[13px] font-semibold leading-tight text-izk-ink">{photoName(s.photo)}</span>
                    {s.photo.place && s.photo.place !== photoName(s.photo) && (
                      <span className="flex items-center gap-1 text-[11px] text-izk-ink/80">
                        <MapPin size={11} className="shrink-0" />
                        <span className="truncate">{s.photo.place}</span>
                      </span>
                    )}
                    {s.photo.about && <p className="line-clamp-3 text-[11px] leading-snug text-izk-muted">{s.photo.about}</p>}
                    <span className="truncate text-[10px] text-izk-muted" title={s.photo.credit}>
                      {s.photo.source}
                      {s.photo.credit ? ` · © ${s.photo.credit}` : ""} · {s.photo.dark ? "dark" : "light"} mode
                    </span>
                    <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
                      <button
                        type="button"
                        disabled={busy !== null}
                        onClick={() => run("photo", () => api.lookPhotoNow(true), setLooks, "A new photo, with colours to match.")}
                        className="izk-no-drag flex h-[30px] items-center gap-1.5 rounded-full border border-white/10 bg-white/6 px-3 text-[11px] font-semibold text-izk-ink hover:bg-white/12 disabled:opacity-60"
                      >
                        <RefreshCw size={12} /> New photo
                      </button>
                      <button
                        type="button"
                        disabled={busy !== null || !!s.photo.kept}
                        onClick={() => run("keep", () => api.lookPhotoKeep(), setLooks, "Kept in Pictures → Izuki Wallpapers.")}
                        className={cx("izk-no-drag flex h-[30px] items-center gap-1.5 rounded-full border px-3 text-[11px] font-semibold disabled:cursor-default", s.photo.kept ? "border-rose-300/40 bg-rose-400/15 text-izk-ink" : "border-white/10 bg-white/6 text-izk-ink hover:bg-white/12 disabled:opacity-60")}
                      >
                        <Heart size={12} className={s.photo.kept ? "fill-rose-300 text-rose-300" : undefined} /> {s.photo.kept ? "Kept" : "Keep it"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
                    <span className="text-[11.5px] leading-snug text-izk-muted">{busy === "auto" || busy === "photo" ? "Finding a fresh 4K photo…" : "The first photo hasn't come through yet (maybe offline). It tries again by itself, or tap New photo."}</span>
                    <button
                      type="button"
                      disabled={busy !== null}
                      onClick={() => run("photo", () => api.lookPhotoNow(true), setLooks, "A new photo, with colours to match.")}
                      className="izk-no-drag flex h-[30px] w-fit items-center gap-1.5 rounded-full border border-white/10 bg-white/6 px-3 text-[11px] font-semibold text-izk-ink hover:bg-white/12 disabled:opacity-60"
                    >
                      <RefreshCw size={12} /> New photo
                    </button>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <span className="mr-1 w-[110px] text-[12px] font-semibold text-izk-ink">New photo every</span>
                {(
                  [
                    [30, "30 min"],
                    [60, "hour"],
                    [180, "3 hours"],
                    [1440, "day"],
                  ] as const
                ).map(([min, label]) => (
                  <button
                    key={min}
                    type="button"
                    disabled={busy !== null}
                    onClick={() => setAuto({ photo_every_min: min })}
                    className={cx("izk-no-drag rounded-full border px-2.5 py-1 text-[11px]", (auto.photo_every_min ?? 1440) === min ? "border-izk-teal/50 bg-izk-teal/15 text-izk-ink" : "border-white/10 text-izk-muted hover:text-izk-ink")}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="mr-1 w-[110px] text-[12px] font-semibold text-izk-ink">Photos from</span>
                {(
                  [
                    ["both", "Spotlight & Bing"],
                    ["spotlight", "Windows Spotlight"],
                    ["bing", "Bing"],
                    ["favorites", `Your favourites${s?.favourites ? ` (${s.favourites})` : ""}`],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    disabled={busy !== null || (id === "favorites" && !s?.favourites)}
                    title={id === "favorites" && !s?.favourites ? "Tap Keep it on a photo you love first" : undefined}
                    onClick={() => setAuto({ source: id })}
                    className={cx("izk-no-drag rounded-full border px-2.5 py-1 text-[11px] disabled:opacity-50", auto.source === id ? "border-izk-teal/50 bg-izk-teal/15 text-izk-ink" : "border-white/10 text-izk-muted hover:text-izk-ink")}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {photos.length > 1 && (
                <div className="flex flex-col gap-1.5">
                  <span className="text-[12px] font-semibold text-izk-ink">Recent photos</span>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {photos.map((p) => {
                      const on = s?.photo?.file === p.file;
                      return (
                        <button
                          key={p.file}
                          type="button"
                          title={[photoName(p), p.place].filter((x, i, all) => x && all.indexOf(x) === i).join(" · ")}
                          disabled={busy !== null || on}
                          onClick={() => run(`use-${p.file}`, () => api.lookPhotoUse(p.file), (n) => { setLooks(n); setSweep((x) => x + 1); }, `Back to ${photoName(p)}.`)}
                          className={cx("izk-no-drag relative aspect-video w-[104px] shrink-0 overflow-hidden rounded-[9px] border-2 transition-transform duration-200 hover:-translate-y-[1px] disabled:cursor-default", on ? "border-white" : "border-transparent opacity-85 hover:opacity-100")}
                        >
                          {p.thumb ? <img src={p.thumb} alt="" className="h-full w-full object-cover" /> : <span className="block h-full w-full" style={{ background: p.accent }} />}
                          {p.kept && (
                            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-black/55">
                              <Heart size={9} className="fill-rose-300 text-rose-300" />
                            </span>
                          )}
                          {busy === `use-${p.file}` && <div className="izk-hero-sweep absolute inset-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {auto.mode === "daynight" && (
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {(
                [
                  ["day", "day_at", "By day, from", <Sun key="s" size={14} />],
                  ["night", "night_at", "At night, from", <Moon key="m" size={14} />],
                ] as const
              ).map(([which, at, label, icon]) => (
                <div key={which} className="rounded-[14px] border border-white/10 bg-white/[0.03] p-2.5">
                  <div className="mb-2 flex items-center gap-2 text-[12px] font-semibold text-izk-ink">
                    {icon} {label}
                    <input
                      type="time"
                      disabled={busy !== null}
                      value={auto[at]}
                      onChange={(e) => e.target.value && setAuto({ [at]: e.target.value } as Partial<LookAuto>)}
                      className="izk-field izk-no-drag ml-auto h-[26px] w-[96px] rounded-[8px] px-2 text-[11.5px]"
                    />
                  </div>
                  <div className="flex gap-1.5 overflow-x-auto pb-1">
                    {presets.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        title={p.name}
                        disabled={busy !== null}
                        onClick={() => setAuto({ [which]: p.id } as Partial<LookAuto>)}
                        className={cx("izk-no-drag relative h-[40px] w-[64px] shrink-0 overflow-hidden rounded-[8px] border-2 transition-transform hover:scale-105", auto[which] === p.id ? "border-white" : "border-transparent opacity-80")}
                        style={{ background: p.preview }}
                      >
                        <span className="absolute inset-x-0 bottom-0 bg-black/50 text-[9px] font-semibold text-white">{p.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {auto.mode === "shuffle" && (
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="mr-1 text-[12px] font-semibold text-izk-ink">Every</span>
                {(
                  [
                    [30, "30 min"],
                    [60, "hour"],
                    [180, "3 hours"],
                    [1440, "day"],
                  ] as const
                ).map(([min, label]) => (
                  <button
                    key={min}
                    type="button"
                    disabled={busy !== null}
                    onClick={() => setAuto({ every_min: min })}
                    className={cx("izk-no-drag rounded-full border px-2.5 py-1 text-[11px]", auto.every_min === min ? "border-izk-teal/50 bg-izk-teal/15 text-izk-ink" : "border-white/10 text-izk-muted")}
                  >
                    {label}
                  </button>
                ))}
                <span className="ml-auto text-[10.5px] text-izk-muted">{auto.pool.length ? `${auto.pool.length} looks in the mix` : "All looks in the mix — tap to choose"}</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-7">
                {presets.map((p) => {
                  const inMix = !auto.pool.length || auto.pool.includes(p.id);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      title={p.name}
                      disabled={busy !== null}
                      onClick={() => {
                        const base = auto.pool.length ? auto.pool : presets.map((x) => x.id);
                        const next = inMix ? base.filter((x) => x !== p.id) : [...base, p.id];
                        setAuto({ pool: next.length === presets.length ? [] : next.length ? next : [p.id] });
                      }}
                      className={cx("izk-no-drag relative aspect-[16/10] overflow-hidden rounded-[8px] border-2 transition-all", inMix ? "border-izk-teal/70" : "border-transparent opacity-40 grayscale")}
                      style={{ background: p.preview }}
                    >
                      <span className="absolute inset-x-0 bottom-0 bg-black/50 text-[9px] font-semibold text-white">{p.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {auto.mode !== "off" && (
            <div className="flex items-center gap-2 text-[11px] text-izk-muted">
              {auto.mode !== "photo" && (
                <button type="button" disabled={busy !== null} onClick={() => setAuto({ wallpaper: !auto.wallpaper })} className="izk-no-drag flex items-center gap-1.5 text-izk-ink">
                  <MiniSwitch on={auto.wallpaper} /> Change the wallpaper too
                </button>
              )}
              <span className="ml-auto flex items-center gap-1">
                <Layers size={12} /> Windows fades smoothly between pictures. Undo turns Auto off.
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
