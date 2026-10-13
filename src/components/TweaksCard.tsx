import { useEffect, useState } from "react";
import { api, type WindowsTweak } from "../lib/ipc";
import { Row, Section, Toggle } from "./ui";

/**
 * Windows tweaks, Windhawk-style (tweaks.rs): small ways to make Windows
 * yours, each one a switch. Read live from Windows — what's shown is what's
 * on — only your own settings (no admin), and each one flips back.
 */
export function TweaksCard() {
  const [tweaks, setTweaks] = useState<WindowsTweak[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  /** A switch that only shows after Explorer restarts was just flipped. */
  const [needsRestart, setNeedsRestart] = useState(false);
  const [restarting, setRestarting] = useState(false);

  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    void api
      .tweaksList()
      .then(setTweaks)
      .catch((e) => setError(`Couldn't read your Windows settings (${e}).`))
      .finally(() => setLoaded(true));
  }, []);

  const flip = (t: WindowsTweak, on: boolean) => {
    setBusy(t.id);
    setError("");
    void api
      .tweakSet(t.id, on)
      .then((all) => {
        setTweaks(all);
        if (t.restart) setNeedsRestart(true);
      })
      .catch((e) => setError(String(e)))
      .finally(() => setBusy(null));
  };

  return (
    <Section
      id="settings-tweaks"
      title="Windows tweaks"
      hint="Small ways to make Windows yours, each one a switch (like Windhawk). Only your own settings change — no admin needed — and every switch flips back the same way."
    >
      {!loaded && <p className="py-2 text-[11.5px] text-izk-muted">Reading your Windows settings…</p>}
      {tweaks.map((t) => (
        <Row key={t.id} label={t.label} hint={t.hint}>
          <Toggle checked={t.on} disabled={busy === t.id} onChange={(v) => flip(t, v)} />
        </Row>
      ))}
      {error && <p className="mt-1 text-[11.5px] text-izk-danger">{error}</p>}
      {needsRestart && (
        <Row label="Restart Explorer to see it" hint="The taskbar and desktop reload for a moment. Open File Explorer windows close; your apps stay open.">
          <button
            type="button"
            disabled={restarting}
            className="izk-btn-primary izk-no-drag h-[28px] px-3 text-[11.5px]"
            onClick={() => {
              setRestarting(true);
              void api
                .restartExplorer()
                .then(() => setNeedsRestart(false))
                .catch((e) => setError(String(e)))
                .finally(() => setRestarting(false));
            }}
          >
            {restarting ? "Restarting…" : "Restart Explorer"}
          </button>
        </Row>
      )}
    </Section>
  );
}
