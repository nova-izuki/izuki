import { useState } from "react";
import { Check, Loader2, Smartphone } from "lucide-react";
import { Badge, Row, Section, Toggle } from "./ui";
import { useIzuki } from "../lib/store";
import { api } from "../lib/ipc";

/**
 * Let Izuki control an Android phone over Wi-Fi (free, no app installed on the
 * phone — Android's built-in Wireless debugging). Off until the user turns it
 * on and pairs a phone. Then "… on my phone" from chat, voice, Discord,
 * Telegram or a call does it on the phone.
 */
export function AndroidCard() {
  const settings = useIzuki((s) => s.settings);
  const patch = useIzuki((s) => s.patchSettings);
  const flush = useIzuki((s) => s.flushSettings);
  const [state, setState] = useState<"idle" | "connecting" | string>("idle");

  const on = settings.android_enabled;
  const addr = settings.android_addr;

  const connect = async () => {
    setState("connecting");
    await flush();
    try {
      setState(await api.androidConnect());
    } catch (e) {
      setState(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <Section
      title="Control my Android"
      hint="Izuki taps, types and swipes on your phone over Wi-Fi — hands-free, nothing installed on the phone. Then just say “… on my phone”. Free."
      right={on ? <Badge tone={addr ? "good" : "warn"}>on</Badge> : undefined}
    >
      <Row
        label="Let Izuki control my Android phone"
        icon={<Smartphone size={14} strokeWidth={2.3} />}
      >
        <Toggle checked={on} onChange={(v) => patch({ android_enabled: v })} />
      </Row>

      {on && (
        <div className="mt-1.5 flex flex-col gap-2 rounded-[14px] border border-white/10 bg-white/5 p-2.5 text-[12px] leading-relaxed text-izk-muted">
          <div>
            <b className="text-izk-ink">On the phone (once):</b> Settings → About phone → tap
            <b className="text-izk-ink"> Build number</b> 7 times to turn on Developer options. Then
            Settings → System → <b className="text-izk-ink">Developer options</b> → turn on
            <b className="text-izk-ink"> Wireless debugging</b> → tap it → note the
            <b className="text-izk-ink"> IP address &amp; Port</b> (like 192.168.1.24:37000). The phone
            and PC must be on the same Wi-Fi.
          </div>
          <input
            type="text"
            value={addr}
            onChange={(e) => patch({ android_addr: e.target.value })}
            onKeyDown={(e) => {
              if (e.key === "Enter") void connect();
            }}
            placeholder="192.168.1.24:37000"
            className="izk-field izk-no-drag h-[32px] py-0 font-mono text-[12px]"
            spellCheck={false}
            autoComplete="off"
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void connect()}
              disabled={!addr.trim() || state === "connecting"}
              className="izk-btn-primary izk-no-drag flex h-[30px] items-center gap-1.5 rounded-full px-3 text-[12px] disabled:opacity-50"
            >
              {state === "connecting" ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} strokeWidth={2.6} />}
              Connect &amp; test
            </button>
            {state !== "idle" && state !== "connecting" && (
              <span className={state.toLowerCase().startsWith("connected") ? "text-izk-teal text-[11.5px]" : "text-izk-danger text-[11.5px]"}>
                {state}
              </span>
            )}
          </div>
          <div className="text-[11px] text-izk-muted/80">
            First connect downloads Google’s phone tools (about 15 MB) and your phone asks you to
            <b className="text-izk-ink"> Allow</b> this computer — tick “Always allow”. Then try
            “open YouTube and play lofi <b className="text-izk-ink">on my phone</b>”.
          </div>
        </div>
      )}
    </Section>
  );
}
