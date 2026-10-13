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
        <Row
          label="Let my phone control this PC"
          hint="Your phone becomes a remote: a trackpad, clicks, scrolling, typing, keys and music buttons, and a live look at your screen — in the Izuki phone app (Remote). Only your linked phone, never while the PC is locked."
        >
          <Toggle checked={!!settings.phone_remote} onChange={(v) => patch({ phone_remote: v })} />
        </Row>
      )}
      {settings.call_enabled && settings.phone_remote && (
        <Row
          label="Let my phone use the terminal"
          hint="Run PowerShell commands on this PC from the phone's Remote. Commands that only look run at once; anything that could change something is shown on the phone and runs only after you confirm it. Every command is logged."
        >
          <Toggle checked={!!settings.phone_terminal} onChange={(v) => patch({ phone_terminal: v })} />
        </Row>
      )}
      {settings.call_enabled && settings.phone_remote && (
        <div className="mb-1 ml-[24px] text-[11.5px] leading-snug text-izk-muted">
          Only phones you allowed here can use it (in the phone app: Remote → Pair this phone — a box with a code pops up here).
          {settings.linked_devices.filter((d) => d.kind === "phone").length > 0 ? (
            <ul className="mt-1.5 flex flex-col gap-1">
              {settings.linked_devices.filter((d) => d.kind === "phone").map((d) => (
                <li key={d.name + d.added} className="flex items-center gap-2 text-izk-ink">
                  <span>📱</span>
                  <span className="min-w-0 flex-1 truncate">{d.name}</span>
                  <button type="button" className="izk-pill px-2 py-0.5 text-[10.5px]" onClick={() => void api.linkForget(d.name)}>Remove</button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="mt-1">No phone allowed yet.</div>
          )}
          <div className="mt-1">Every action is written to {"%APPDATA%\\Izuki\\logs\\remote-audit.log"} (never what you type).</div>
        </div>
      )}
      {settings.call_enabled && (
        <div className="mb-1 ml-[24px] text-[12px] leading-snug text-izk-muted">
          {status.state === "ready" ? (
            <div className="flex flex-col gap-1.5">
              <div className="flex flex-col items-start gap-3">
                <QrCode text={status.link} label="QR code for the Call Izuki link" />
                <span className="min-w-0 flex-1">
                  Point your phone's camera at this, then tap the link that pops up.
                </span>
              </div>
              <span className="break-all font-mono text-[11px] text-izk-ink">{status.link}</span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={async () => {
                    try { await navigator.clipboard.writeText(status.link); setCopied(true); setTimeout(() => setCopied(false), 1500); }
                    catch { setCopied(false); }
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
                <div className="flex flex-col items-start gap-3">
                  <QrCode text={`${PHONE_APP}#pc=${encodeURIComponent(status.link)}`} label="QR code that links the Izuki phone app to this PC" />
                  <span className="min-w-0 flex-1">
                    Scan to open the web companion and check its connection to this PC. “Do it on my PC” uses your
                    PC’s configured accounts and permissions; signing into an account is still required.
                  </span>
                </div>
              )}
              <span>
                Keep this link private: it grants access to your PC. It changes when the call tunnel restarts. If an older scan fails, scan the current code; a connected messaging bot can also send the new /call link.
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
