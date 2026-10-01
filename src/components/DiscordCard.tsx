import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Copy, ExternalLink, Loader2, MessagesSquare, Unlink } from "lucide-react";
import { Badge, Section } from "./ui";
import { useIzuki } from "../lib/store";
import { api, EV, IS_TAURI, on } from "../lib/ipc";
import type { DiscordStatus } from "../lib/types";

async function openLink(url: string) {
  if (IS_TAURI) {
    const { openUrl } = await import("@tauri-apps/plugin-opener");
    await openUrl(url);
  } else {
    window.open(url, "_blank");
  }
}

/**
 * Izuki on your phone through Discord — for when Telegram isn't an option
 * (Discord signs up with just an email). Make a free bot, paste its token,
 * add it to a server of yours, and DM it the code.
 */
export function DiscordCard() {
  const settings = useIzuki((s) => s.settings);
  const patch = useIzuki((s) => s.patchSettings);
  const flush = useIzuki((s) => s.flushSettings);
  const [status, setStatus] = useState<DiscordStatus | null>(null);
  const [copied, setCopied] = useState(false);
  const [delivery, setDelivery] = useState("");

  const refresh = useCallback(() => void api.discordStatus().then(setStatus).catch(() => undefined), []);
  useEffect(() => {
    refresh();
    const off = on<void>(EV.discordChanged, refresh);
    const tick = setInterval(refresh, 3000);
    return () => {
      void off.then((f) => f());
      clearInterval(tick);
    };
  }, [refresh]);

  const hasToken = settings.discord_token.trim().length > 0;
  const paired = status?.paired ?? settings.discord_user_id !== "";
  const code = status?.code || settings.telegram_code;

  return (
    <Section
      title="Izuki on Discord"
      hint="Same as Telegram, for when Telegram doesn't work for you — Discord signs up with just an email. Free; needs this PC on."
      right={paired ? <Badge tone={status?.online ? "good" : "accent"}>{status?.online ? "online" : "reconnecting"}</Badge> : hasToken && status?.bot ? <Badge tone="accent">almost there</Badge> : undefined}
    >
      {!paired && (
        <ol className="flex list-none flex-col gap-2.5 text-[12px] leading-snug text-izk-muted">
          <li className="flex gap-2">
            <Step n={1} />
            <div className="min-w-0 flex-1">
              On the Discord developer site, press <b className="text-izk-ink">New Application</b>, name it (e.g.
              “My Izuki”) and press <b className="text-izk-ink">Create</b>. Open <b className="text-izk-ink">Bot</b> on
              the left. Scroll down to <b className="text-izk-ink">Privileged Gateway Intents</b> and turn{" "}
              <b className="text-izk-ink">ON</b> the <b className="text-izk-ink">Message Content Intent</b> (without it
              the bot can’t read your messages), then <b className="text-izk-ink">Save</b>. Now scroll back up, press{" "}
              <b className="text-izk-ink">Reset Token</b> → <b className="text-izk-ink">Yes</b> → <b className="text-izk-ink">Copy</b>.
              <div className="mt-1.5">
                <button
                  type="button"
                  onClick={() => void openLink("https://discord.com/developers/applications")}
                  className="izk-pill izk-no-drag h-[26px] px-2.5 text-[11px]"
                >
                  <ExternalLink size={11} strokeWidth={2.4} /> Open Discord developers
                </button>
              </div>
            </div>
          </li>
          <li className="flex gap-2">
            <Step n={2} />
            <div className="min-w-0 flex-1">
              Paste the token here:
              <input
                type="password"
                value={settings.discord_token}
                onChange={(e) => patch({ discord_token: e.target.value })}
                onBlur={() => void flush().then(refresh)}
                placeholder="MTI3…"
                spellCheck={false}
                autoComplete="off"
                className="izk-field izk-no-drag mt-1.5 h-[34px] py-0 text-[12px]"
              />
              {hasToken && !status?.bot && !status?.error && (
                <div className="mt-1 flex items-center gap-1.5 text-[11px]">
                  <Loader2 size={11} className="animate-spin" /> Checking the token…
                </div>
              )}
              {status?.error && <div className="mt-1 text-[11px] text-izk-danger">{status.error}</div>}
              {status?.bot && (
                <div className="mt-1 flex items-center gap-1.5 text-[11px] text-izk-teal">
                  <CheckCircle2 size={11} strokeWidth={2.4} /> Found your bot, {status.bot}
                </div>
              )}
            </div>
          </li>
          <li className="flex gap-2">
            <Step n={3} />
            <div className="min-w-0 flex-1">
              Add the bot to a server of yours — no server yet? In Discord press <b className="text-izk-ink">+</b> →{" "}
              <b className="text-izk-ink">Create My Own</b>, it takes a second.
              {status?.invite && (
                <div className="mt-1.5">
                  <button
                    type="button"
                    onClick={() => void openLink(status.invite)}
                    className="izk-pill izk-no-drag h-[26px] px-2.5 text-[11px]"
                  >
                    <ExternalLink size={11} strokeWidth={2.4} /> Add bot to my server
                  </button>
                </div>
              )}
            </div>
          </li>
          <li className="flex gap-2">
            <Step n={4} />
            <div className="min-w-0 flex-1">
              In the server, tap the bot's name → <b className="text-izk-ink">Message</b>, and send it this code:
              <div className="mt-1.5 flex items-center gap-2">
                <span className="izk-inset rounded-[10px] px-3 py-1 font-mono text-[16px] font-semibold tracking-[0.2em] text-izk-ink">
                  {code || "······"}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    void navigator.clipboard?.writeText(code).catch(() => undefined);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  }}
                  className="izk-pill izk-no-drag h-[26px] px-2.5 text-[11px]"
                >
                  <Copy size={11} strokeWidth={2.4} /> {copied ? "Copied" : "Copy"}
                </button>
              </div>
            </div>
          </li>
        </ol>
      )}

      {paired && (
        <div className="flex flex-col gap-2 text-[12px] leading-snug text-izk-muted">
          <p>Discord uses this PC's Izuki version and connected apps. New email and meeting alerts arrive here while the PC is awake, online, and Izuki is running. Enable phone notifications for this Discord conversation.</p>
          {status?.error && <p className="text-izk-danger">{status.error}</p>}
          <button type="button" disabled={delivery === "Sending…"} className="izk-pill izk-no-drag h-[28px] px-3 text-[11.5px]" onClick={async () => {
            setDelivery("Sending…");
            try { await flush(); await api.discordTest(); setDelivery("Discord accepted the test — check your messages."); }
            catch (e) { setDelivery(String(e)); }
          }}>Test phone notification</button>
          {delivery && <p>{delivery}</p>}
          <div className="flex items-start gap-2">
            <MessagesSquare size={14} strokeWidth={2.3} className="mt-[1px] shrink-0" />
            <span>
              Paired{status?.bot ? <> with <b className="text-izk-ink">{status.bot}</b></> : null}. Message it or hold the
              mic for a voice message; <b className="text-izk-ink">/screen</b>, <b className="text-izk-ink">/stop</b>,{" "}
              <b className="text-izk-ink">/call</b> and <b className="text-izk-ink">/reminders</b> work too. Reminders
              come here as well.
            </span>
          </div>
          <div>
            <button
              type="button"
              onClick={() =>
                void api.discordUnpair().then((s) => {
                  patch({ discord_user_id: "", telegram_code: s.telegram_code });
                  refresh();
                })
              }
              className="izk-pill izk-no-drag h-[28px] px-3 text-[11.5px] text-izk-danger"
            >
              <Unlink size={12} strokeWidth={2.4} /> Unpair Discord
            </button>
          </div>
        </div>
      )}
    </Section>
  );
}

function Step({ n }: { n: number }) {
  return (
    <span className="flex h-[20px] w-[20px] shrink-0 items-center justify-center rounded-full border border-izk-violet/40 bg-izk-violet/15 text-[10.5px] font-semibold text-izk-ink">
      {n}
    </span>
  );
}
