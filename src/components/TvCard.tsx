import { useEffect, useState } from "react";
import { Home, Loader2, Play, Search, Tv, Volume2 } from "lucide-react";
import { Badge, Row, Section, Toggle } from "./ui";
import { api } from "../lib/ipc";
import { useIzuki } from "../lib/store";

type Found = { host: string; name: string; on: boolean; allowed: boolean } | null;

/**
 * The TV: Izuki finds a Roku, Samsung or LG TV on the Wi-Fi by itself — nothing to install on
 * the TV — then "… on the TV" works from voice and chat. If the TV is set to
 * "Limited" control, it says exactly where to change that.
 */
export function TvCard() {
  const [tv, setTv] = useState<Found | "looking" | "none">("looking");
  const [said, setSaid] = useState<string | null>(null);

  const look = async (fresh: boolean) => {
    setTv("looking");
    const found = await api.tvFind(fresh).catch(() => null);
    setTv(found ?? "none");
  };
  useEffect(() => {
    void look(false);
  }, []);

  const tryIt = async (words: string) => {
    setSaid("…");
    setSaid(await api.tvDo(words).catch((e) => (e instanceof Error ? e.message : String(e))));
  };

  const found = tv && typeof tv === "object" ? tv : null;
  return (
    <Section
      title="Control my TV"
      hint="Say “open Netflix on the TV”, “turn the TV up”, “search the TV for Stranger Things” or “pause the TV”. Works with Roku, Samsung and LG TVs over your Wi-Fi — nothing to install on the TV. (Samsung and LG ask you to press Allow on the TV the first time.)"
      right={found ? <Badge tone={found.allowed ? "good" : "warn"}>{found.allowed ? "ready" : "needs ok"}</Badge> : undefined}
    >
      <div className="flex items-center gap-3 rounded-[14px] border border-white/10 bg-white/5 p-3">
        <Tv size={22} className="shrink-0 text-izk-teal" />
        <div className="min-w-0 flex-1 text-[12.5px]">
          {tv === "looking" ? (
            <span className="flex items-center gap-2 text-izk-muted">
              <Loader2 size={13} className="animate-spin" /> Looking for your TV on the Wi-Fi…
            </span>
          ) : found ? (
            <>
              <div className="font-semibold text-izk-ink">{found.name}</div>
              <div className="text-izk-muted">{found.allowed ? "Connected — just ask." : "Found it, but it's only allowing limited control."}</div>
            </>
          ) : (
            <span className="text-izk-muted">No TV found. Make sure the TV is on and on the same Wi-Fi as this PC (Roku, Samsung or LG).</span>
          )}
        </div>
        <button type="button" onClick={() => void look(true)} className="izk-pill shrink-0 px-3 py-1.5 text-[11.5px]">
          Find again
        </button>
      </div>

      {found && !found.allowed && (
        <div className="mt-2 rounded-[14px] border border-amber-400/30 bg-amber-400/10 p-3 text-[12px] leading-relaxed text-izk-ink">
          <b>One step on the TV:</b> Settings → System → Advanced system settings → <b>Control by mobile apps</b> → Network access →{" "}
          <b>Default</b>. Then press “Find again”.
        </div>
      )}

      {found && found.allowed && (
        <div className="mt-2 grid grid-cols-4 gap-2">
          {[
            { label: "Home", icon: <Home size={16} />, words: "tv go home" },
            { label: "Netflix", icon: <Play size={16} />, words: "open netflix on the tv" },
            { label: "Louder", icon: <Volume2 size={16} />, words: "turn the tv up" },
            { label: "Search", icon: <Search size={16} />, words: "search the tv for comedy" },
          ].map((b) => (
            <button
              key={b.label}
              type="button"
              onClick={() => void tryIt(b.words)}
              className="flex h-[54px] flex-col items-center justify-center gap-1 rounded-[14px] bg-white/[0.07] text-[11.5px] text-izk-ink transition hover:bg-white/[0.12] active:scale-[0.97]"
            >
              {b.icon}
              {b.label}
            </button>
          ))}
        </div>
      )}
      {said && <p className="mt-2 text-[11.5px] text-izk-muted">{said}</p>}

      <LinkAndLook />

      {found && (
        <details className="mt-3 rounded-[14px] border border-white/10 bg-white/[0.04] p-3 text-[12px] leading-relaxed text-izk-ink">
          <summary className="cursor-pointer font-semibold">📺 Put the Izuki screen on your Roku (free)</summary>
          <p className="mt-2 text-izk-muted">
            The Izuki channel shows the orb and what Izuki says right on your TV while it works. It installs in Roku's
            free developer mode:
          </p>
          <ol className="mt-2 list-decimal space-y-1.5 pl-5">
            <li>
              On the Roku remote press <b>Home ×3, Up ×2, Right, Left, Right, Left, Right</b>. Choose <b>Enable installer and
              restart</b>, agree, and pick a password you'll remember.
            </li>
            <li>
              <button type="button" onClick={() => void api.openUrl("https://nova-izuki.github.io/izuki/tv/izuki-roku.zip")} className="izk-pill px-2.5 py-1 text-[11.5px]">
                ⬇ Download the Izuki channel
              </button>
            </li>
            <li>
              <button type="button" onClick={() => void api.openUrl(`http://${found.host}`)} className="izk-pill px-2.5 py-1 text-[11.5px]">
                Open your Roku's installer
              </button>{" "}
              — sign in as <b>rokudev</b> with that password, choose the file you downloaded, press <b>Install</b>.
            </li>
          </ol>
          <p className="mt-2 text-izk-muted">Then open Izuki on the TV — it follows along whenever you talk to Izuki.</p>
        </details>
      )}
    </Section>
  );
}

/**
 * The Izuki TV and phone apps: link them to this PC (they copy the setup and
 * then work on their own), Izuki's voice from the TV, and the TV's orb.
 */
function LinkAndLook() {
  const settings = useIzuki((s) => s.settings);
  const patch = useIzuki((s) => s.patchSettings);
  const [link, setLink] = useState<{ running: boolean; ip: string | null; devices: Array<{ name: string; kind: string }> } | null>(null);
  useEffect(() => {
    const look = () => void api.linkStatus().then(setLink).catch(() => undefined);
    look();
    const t = setInterval(look, 4000);
    return () => clearInterval(t);
  }, [settings.lan_link, settings.linked_devices.length]);

  return (
    <div className="mt-3 flex flex-col gap-1">
      <Row
        label="Let my phone and TV link to this PC"
        hint="Open Izuki on your Android TV, Google TV, Fire TV or phone and it finds this PC on your Wi-Fi. Press Allow here, and it copies your setup — your AI, your connected apps, your voice and what Izuki remembers — so it works on its own, even when this PC is off. (Windows may ask once about the firewall — choose Allow.)"
      >
        <Toggle checked={settings.lan_link} onChange={(v) => patch({ lan_link: v })} />
      </Row>
      {settings.lan_link && link && (
        <div className="rounded-[14px] border border-white/10 bg-white/[0.04] p-3 text-[12px] text-izk-ink">
          <div className="text-izk-muted">
            {link.running ? <>This PC is ready to link{link.ip ? <> at <b className="text-izk-ink">{link.ip}</b></> : null}.</> : "Starting…"}
          </div>
          {link.devices.length > 0 ? (
            <ul className="mt-2 flex flex-col gap-1">
              {link.devices.map((d) => (
                <li key={d.name + d.kind} className="flex items-center gap-2">
                  <span>{d.kind === "tv" ? "📺" : "📱"}</span>
                  <span className="min-w-0 flex-1 truncate">{d.name}</span>
                  <button type="button" className="izk-pill px-2 py-0.5 text-[10.5px]" onClick={() => void api.linkForget(d.name)}>
                    Unlink
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-1 text-izk-muted">No phone or TV linked yet.</div>
          )}
        </div>
      )}
      <Row label="Talk from the TV" hint="While the Izuki screen is open on the TV, Izuki's voice comes out of the TV's speakers instead of this PC's.">
        <Toggle checked={settings.tv_voice} onChange={(v) => patch({ tv_voice: v })} />
      </Row>
      <Row label="Orb on the TV" hint="The orb the TV shows — the same as here, or its own.">
        <select aria-label="TV orb style" className="izk-field izk-no-drag max-w-[145px] py-1 text-[11.5px]" value={settings.tv_orb} onChange={(e) => patch({ tv_orb: e.target.value })}>
          <option value="">Same as here</option>
          <option value="liquid">Liquid glass</option>
          <option value="ferrofluid">Clear water</option>
          <option value="dew">Pure water</option>
          <option value="ripple">Tidal pearl</option>
          <option value="constellation">Star crystal</option>
          <option value="particles">Stardust</option>
          <option value="face">Hologram face</option>
          <option value="ferro">Ferrofluid</option>
          <option value="aurora">Aurora (TV)</option>
          <option value="nebula">Nebula (TV)</option>
        </select>
      </Row>
    </div>
  );
}
