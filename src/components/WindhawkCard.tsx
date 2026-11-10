import { useEffect, useRef, useState } from "react";
import { ExternalLink } from "lucide-react";
import { api, type WindhawkStatus } from "../lib/ipc";
import { Section } from "./ui";

/** Shown before "Show all". */
const FIRST = 6;

/**
 * Going further than Izuki's own tweaks (windhawk.rs). Izuki never injects
 * into Explorer itself; Windhawk does, so it's the person's choice: what it
 * is, install it (winget, Windows asks first), open it, and the mods worth
 * starting with, each by its page on windhawk.net.
 */
export function WindhawkCard() {
  const [s, setS] = useState<WindhawkStatus | null>(null);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [all, setAll] = useState(false);
  const locked = useRef(false);

  useEffect(() => {
    let alive = true;
    void api.windhawkStatus().then((v) => alive && setS(v)).catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);

  const run = async (key: string, what: () => Promise<void>) => {
    if (locked.current) return;
    locked.current = true;
    setBusy(key);
    setError("");
    setNote("");
    try {
      await what();
    } catch (e) {
      setError(String(e).replace(/^Error:\s*/, ""));
    } finally {
      locked.current = false;
      setBusy("");
    }
  };

  const install = () =>
    run("install", async () => {
      const next = await api.windhawkInstall();
      setS(next);
      if (next.installed) setNote("Windhawk is installed. Open it, go to Explore, and pick a mod.");
    });

  // An install started before this card opened: check back until it's done.
  const installingElsewhere = !!s?.installing && busy !== "install";
  useEffect(() => {
    if (!installingElsewhere) return;
    const t = window.setInterval(() => void api.windhawkStatus().then(setS).catch(() => undefined), 5000);
    return () => window.clearInterval(t);
  }, [installingElsewhere]);

  const mods = s?.mods ?? [];
  const shown = all ? mods : mods.slice(0, FIRST);

  return (
    <Section id="style-windhawk" title="Go further with Windhawk" hint="A vertical taskbar, a restyled Start menu, a clock with the weather: deeper changes than Windows' own settings allow.">
      <p className="text-[11.5px] leading-relaxed text-izk-muted">
        Izuki's tweaks only change Windows' own settings, so they're safe and easy to undo. <b className="text-izk-ink">Windhawk</b> is a free, open-source app by Ramen Software that goes deeper: it works by injecting its mods into Explorer and other apps. That's why adding it is your choice. Every mod can be switched off, or Windhawk uninstalled, at any time.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {s?.installed ? (
          <>
            <span className="rounded-full border border-izk-teal/30 bg-izk-teal/10 px-2.5 py-1 text-[11px] font-semibold text-izk-teal">Windhawk is installed</span>
            <button type="button" disabled={!!busy} onClick={() => void run("open", api.windhawkOpen)} className="izk-btn-primary izk-no-drag h-[30px] px-3.5 text-[12px] disabled:opacity-60">
              Open Windhawk
            </button>
          </>
        ) : (
          <>
            {s?.can_install && (
              <button type="button" disabled={!!busy || s.installing} onClick={() => void install()} className="izk-btn-primary izk-no-drag h-[30px] px-3.5 text-[12px] disabled:opacity-60">
                {busy === "install" || s.installing ? "Installing… (Windows may ask)" : "Install Windhawk"}
              </button>
            )}
            <button type="button" onClick={() => void api.openUrl("https://windhawk.net/")} className="izk-pill izk-no-drag flex h-[30px] items-center gap-1.5 px-3 text-[11.5px]">
              windhawk.net <ExternalLink size={11} />
            </button>
          </>
        )}
      </div>
      {note && <p role="status" className="mt-2 text-[11.5px] text-izk-teal">{note}</p>}
      {error && <p role="alert" className="mt-2 text-[11.5px] text-izk-danger">{error}</p>}

      {mods.length > 0 && (
        <>
          <div className="mt-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-izk-muted">Mods worth starting with</div>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {shown.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => void run(m.id, () => api.windhawkMod(m.id))}
                title="Open this mod's page on windhawk.net"
                className="izk-no-drag flex flex-col gap-1 rounded-[14px] border border-white/8 bg-white/[0.035] p-2.5 text-left transition-colors hover:border-izk-teal/50"
              >
                <span className="flex w-full items-start justify-between gap-2">
                  <span className="text-[12px] font-semibold leading-tight text-izk-ink">{m.name}</span>
                  <ExternalLink size={11} className="mt-[2px] shrink-0 text-izk-muted" />
                </span>
                <span className="text-[10.5px] leading-snug text-izk-muted">{m.what}</span>
                {m.win11 && <span className="mt-auto self-start rounded-full bg-white/8 px-1.5 py-[1px] text-[9.5px] text-izk-muted">Windows 11</span>}
              </button>
            ))}
          </div>
          {mods.length > FIRST && (
            <button type="button" onClick={() => setAll((v) => !v)} className="izk-pill izk-no-drag mt-2 px-3 py-1 text-[11px]">
              {all ? "Show fewer" : `Show all ${mods.length}`}
            </button>
          )}
          <p className="mt-2 text-[10.5px] leading-snug text-izk-muted">In Windhawk, open <b className="text-izk-ink">Explore</b>, search for the mod's name and press Install. Its settings and its off switch are there too.</p>
        </>
      )}
    </Section>
  );
}
