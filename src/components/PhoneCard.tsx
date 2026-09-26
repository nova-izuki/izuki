import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, Copy, ExternalLink, Loader2, Smartphone, Unlink } from "lucide-react";
import { Badge, Row, Section, Toggle } from "./ui";
import { useIzuki } from "../lib/store";
import { api, EV, IS_TAURI, on } from "../lib/ipc";
import type { PhoneStatus } from "../lib/types";

async function openLink(url: string) {
  if (IS_TAURI) {
    const { openUrl } = await import("@tauri-apps/plugin-opener");
    await openUrl(url);
  } else {
    window.open(url, "_blank");
  }
}

/**
 * Izuki on your phone — free, no app store: a Telegram bot that Izuki on
 * this PC answers. Three steps: make the bot, paste its token, send it the
 * code. Then text it or send voice notes from anywhere.
 */
export function PhoneCard() {
  const settings = useIzuki((s) => s.settings);
  const patch = useIzuki((s) => s.patchSettings);
  const flush = useIzuki((s) => s.flushSettings);
  const [status, setStatus] = useState<PhoneStatus | null>(null);
  const [copied, setCopied] = useState(false);

  const refresh = useCallback(() => void api.phoneStatus().then(setStatus).catch(() => undefined), []);
  useEffect(() => {
    refresh();
    const off = on<void>(EV.phoneChanged, refresh);
    // The token is checked in the background; look again while setting up.
    const tick = setInterval(refresh, 3000);
    return () => {
      void off.then((f) => f());
      clearInterval(tick);
    };
  }, [refresh]);

  const hasToken = settings.telegram_token.trim().length > 0;
  const paired = status?.paired ?? settings.telegram_chat_id !== 0;
  const code = status?.code || settings.telegram_code;

  return (
    <Section
      title="Izuki on your phone"
      hint="Free, no app to install: text Izuki (or send a voice note) on Telegram from anywhere. Needs this PC on."
      right={
        paired ? (
          <Badge tone="good">connected</Badge>
        ) : hasToken && status?.bot ? (
          <Badge tone="accent">waiting for code</Badge>
        ) : undefined
      }
    >
      {!paired && (
        <ol className="mb-2 flex list-none flex-col gap-2.5 text-[12px] leading-snug text-izk-muted">
          <li className="flex gap-2">
            <Step n={1} />
            <div className="min-w-0 flex-1">
              In Telegram, open <b className="text-izk-ink">@BotFather</b>, send <b className="text-izk-ink">/newbot</b>,
              and pick any name. It gives you a token.
              <div className="mt-1.5">
                <button
                  type="button"
                  onClick={() => void openLink("https://t.me/BotFather")}
                  className="izk-pill izk-no-drag h-[26px] px-2.5 text-[11px]"
                >
                  <ExternalLink size={11} strokeWidth={2.4} /> Open BotFather
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
                value={settings.telegram_token}
                onChange={(e) => patch({ telegram_token: e.target.value })}
                onBlur={() => void flush().then(refresh)}
                placeholder="123456789:ABC…"
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
                  <CheckCircle2 size={11} strokeWidth={2.4} /> Found your bot, @{status.bot}
                </div>
              )}
            </div>
          </li>
          <li className="flex gap-2">
            <Step n={3} />
            <div className="min-w-0 flex-1">
              Send your bot this code:
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
                {status?.bot && (
                  <button
                    type="button"
                    onClick={() => void openLink(`https://t.me/${status.bot}`)}
                    className="izk-pill izk-no-drag h-[26px] px-2.5 text-[11px]"
                  >
                    <Smartphone size={11} strokeWidth={2.4} /> Open chat
                  </button>
                )}
              </div>
            </div>
          </li>
        </ol>
      )}

      {paired && (
        <div className="mb-1 text-[12px] leading-snug text-izk-muted">
          Your phone is paired{status?.bot ? <> with <b className="text-izk-ink">@{status.bot}</b></> : null}. Text it
          anything, hold the mic to send a voice note, <b className="text-izk-ink">/screen</b> to see your PC,{" "}
          <b className="text-izk-ink">/stop</b> to stop. Reminders are texted to you too. On iPhone, add a Siri
          Shortcut “Send message with Telegram” to talk to it hands-free.
        </div>
      )}

      <Row
        label="Let my phone use this PC"
        hint="“Play lofi on my PC”, “find my essay” — Izuki does it here and texts you what happened."
        icon={<Smartphone size={14} strokeWidth={2.3} />}
      >
        <Toggle checked={settings.phone_controls_pc} onChange={(v) => patch({ phone_controls_pc: v })} />
      </Row>

      {paired && (
        <button
          type="button"
          onClick={() =>
            void api.phoneUnpair().then((s) => {
              patch({ telegram_chat_id: 0, telegram_code: s.telegram_code });
              refresh();
            })
          }
          className="izk-pill izk-no-drag mt-1 h-[28px] px-3 text-[11.5px] text-izk-danger"
        >
          <Unlink size={12} strokeWidth={2.4} /> Unpair phone
        </button>
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
