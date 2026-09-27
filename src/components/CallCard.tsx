import { useCallback, useEffect, useState } from "react";
import { Copy, ExternalLink, Loader2, PhoneCall, Smartphone } from "lucide-react";

/** The free phone app; `#pc=` links it to this PC in one scan. */
const PHONE_APP = "https://nova-izuki.github.io/izuki/app/";
import { Row, Toggle } from "./ui";
import { QrCode } from "./QrCode";
import { useIzuki } from "../lib/store";
import { api, EV, IS_TAURI, on } from "../lib/ipc";
import type { CallStatus } from "../lib/types";

async function openLink(url: string) {
  if (IS_TAURI) {
    const { openUrl } = await import("@tauri-apps/plugin-opener");
    await openUrl(url);
  } else {
    window.open(url, "_blank");
  }
}

const SAYS: Record<string, string> = {
  downloading: "Getting the free Cloudflare tunnel (once, about 60 MB)…",
  starting: "Opening the line…",
};

/**
 * "Call Izuki": a link to open on the phone and talk hands-free. The
 * phone's own speech does the listening and talking; a free Cloudflare
 * tunnel reaches this PC. The link is also texted to a paired phone.
 */
export function CallCard() {
  const settings = useIzuki((s) => s.settings);
  const patch = useIzuki((s) => s.patchSettings);
  const [status, setStatus] = useState<CallStatus>({ state: "off", link: "", error: null });
  const [copied, setCopied] = useState(false);
  const [appQr, setAppQr] = useState(false);

  const refresh = useCallback(() => void api.callStatus().then(setStatus).catch(() => undefined), []);
  useEffect(() => {
    refresh();
    const off = on<void>(EV.callChanged, refresh);
    const tick = setInterval(refresh, 4000);
    return () => {
      void off.then((f) => f());
      clearInterval(tick);
    };
  }, [refresh]);

  return (
    <>
      <Row
        label="Call Izuki from your phone"
        hint="A link you open on your phone to talk hands-free, like a call. Free — your PC just needs to be on."
        icon={<PhoneCall size={14} strokeWidth={2.3} />}
      >
        <Toggle checked={settings.call_enabled} onChange={(v) => patch({ call_enabled: v })} />
      </Row>
      {settings.call_enabled && (
        <div className="mb-1 ml-[24px] text-[12px] leading-snug text-izk-muted">
          {status.state === "ready" ? (
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-3">
                <QrCode text={status.link} label="QR code for the Call Izuki link" />
                <span className="min-w-0 flex-1">
                  Point your phone's camera at this, then tap the link that pops up.
                </span>
              </div>
              <span className="break-all font-mono text-[11px] text-izk-ink">{status.link}</span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    void navigator.clipboard?.writeText(status.link).catch(() => undefined);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1500);
                  }}
                  className="izk-pill izk-no-drag h-[26px] px-2.5 text-[11px]"
                >
                  <Copy size={11} strokeWidth={2.4} /> {copied ? "Copied" : "Copy link"}
                </button>
                <button
                  type="button"
                  onClick={() => void openLink(status.link)}
                  className="izk-pill izk-no-drag h-[26px] px-2.5 text-[11px]"
                >
                  <ExternalLink size={11} strokeWidth={2.4} /> Try it here
                </button>
                <button
                  type="button"
                  onClick={() => setAppQr((v) => !v)}
                  className="izk-pill izk-no-drag h-[26px] px-2.5 text-[11px]"
                >
                  <Smartphone size={11} strokeWidth={2.4} /> Link the phone app
                </button>
              </div>
              {appQr && (
                <div className="flex items-center gap-3">
                  <QrCode text={`${PHONE_APP}#pc=${encodeURIComponent(status.link)}`} label="QR code that links the Izuki phone app to this PC" />
                  <span className="min-w-0 flex-1">
                    Scan this with your phone: the Izuki phone app opens already linked to this PC — your email, calendar
                    and “do it on my PC” work from it. Add it to your home screen from there.
                  </span>
                </div>
              )}
              <span>
                The link changes when Izuki restarts — a paired phone gets the new one by text, or send the bot /call.
              </span>
            </div>
          ) : status.state === "error" ? (
            <span className="text-izk-danger">{status.error ?? "The call line didn't start — Izuki will try again."}</span>
          ) : (
            <span className="flex items-center gap-1.5">
              <Loader2 size={11} className="animate-spin" /> {SAYS[status.state] ?? "Starting…"}
            </span>
          )}
        </div>
      )}
    </>
  );
}
