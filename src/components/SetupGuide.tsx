import { useEffect, useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Brain, CheckCircle2, ExternalLink, Globe, HeartHandshake, Link2, Loader2, Mic, Palette, Plug, Smartphone, Sparkles, AudioLines, Tv, Workflow, X } from "lucide-react";
import { cx } from "./ui";
import { useIzuki } from "../lib/store";
import { applyKey, brainReady, getKey } from "../lib/setup";
import { api } from "../lib/ipc";

/**
 * "Get Izuki connected" — everything Izuki can hook into, on one screen,
 * each a big button. Getting a key is: tap, copy it on the page that opens,
 * come back — KeyCatcher.tsx picks it up and puts it in the right place.
 * Nothing to find, nothing to paste (though pasting works too).
 */
export function SetupGuide({ onClose }: { onClose: () => void }) {
  const settings = useIzuki((s) => s.settings);
  const setTab = useIzuki((s) => s.setTab);
  const [paste, setPaste] = useState("");
  const [pasting, setPasting] = useState(false);
  const [pasteMsg, setPasteMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const brain = brainReady(settings);
  const brainName = settings.providers.find((p) => p.id === settings.active_provider)?.label ?? "";
  const apps = !!settings.composio_api_key.trim();
  const flows = (settings.n8n_hooks ?? []).filter((h) => h.name && h.url).length;
  const patch = useIzuki((s) => s.patchSettings);
  const [ext, setExt] = useState(false);
  useEffect(() => {
    void api.extStatus().then(setExt).catch(() => undefined);
  }, []);
  // Esc (or the remote's Back) goes back, like everywhere else.
  useEffect(() => {
    const back = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", back);
    return () => window.removeEventListener("keydown", back);
  }, [onClose]);
  /** Open the right tab and land on the exact setting. */
  const go = (tab: Parameters<typeof setTab>[0], id?: string) => {
    setTab(tab);
    onClose();
    if (id) setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }), 350);
  };
  const handsFree = settings.voice_wake_enabled;
  const tv = !!settings.tv_host || settings.linked_devices.some((d) => d.kind === "tv");
  const linked = settings.linked_devices.length > 0;
  const steps = [brain, true, apps, handsFree, tv, linked, ext, settings.buddy_speaks, flows > 0];
  const doneCount = steps.filter(Boolean).length;

  // Pasted instead: the same recognising as the clipboard, via the backend.
  const usePasted = async () => {
    const text = paste.trim();
    if (!text) return;
    setPasting(true);
    setPasteMsg(null);
    try {
      const found = await api.recogniseKey(text);
      setPasteMsg(found ? await applyKey(found) : { ok: false, text: "That doesn't look like a key I know — copy the whole key and try again." });
      if (found) setPaste("");
    } finally {
      setPasting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      // The dim edge around the card still moves the window, like the title bar.
      data-tauri-drag-region
      className="absolute inset-0 z-[60] flex flex-col rounded-[inherit] bg-black/60 p-4 backdrop-blur-md"
    >
      <div className="izk-no-drag relative mx-auto flex min-h-0 max-h-full w-full max-w-[520px] flex-col overflow-hidden rounded-[22px] border border-white/12 bg-[#11131f]/95 shadow-[0_24px_70px_rgba(0,0,0,0.6)]">
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-1.5 px-4 pt-3 text-[12px] font-semibold text-izk-muted transition hover:text-izk-ink"
        >
          <ArrowLeft size={14} /> Back
        </button>
        <div className="flex items-start gap-3 border-b border-white/8 p-4 pt-2">
          <span className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[13px] bg-gradient-to-br from-izk-violet/60 to-izk-teal/50">
            <Sparkles size={18} className="text-white" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-[16px] font-bold text-izk-ink">Get Izuki connected</h2>
            <p className="mt-0.5 text-[11.5px] leading-snug text-izk-muted">
              All free. Tap a button, copy the key on the page that opens, and come back — Izuki picks it up by itself.
            </p>
            <div className="mt-2 flex items-center gap-2">
              <div className="h-[6px] flex-1 overflow-hidden rounded-full bg-white/8">
                <div className="h-full rounded-full bg-gradient-to-r from-izk-violet to-izk-teal transition-all" style={{ width: `${(doneCount / steps.length) * 100}%` }} />
              </div>
              <span className="shrink-0 text-[10.5px] font-semibold text-izk-muted">{doneCount} of {steps.length} ready</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/6 text-izk-muted hover:text-izk-ink"
          >
            <X size={14} />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto p-3">
          <Step
            icon={<Brain size={16} />}
            title="A brain"
            need
            done={brain}
            doneText={`Thinking with ${brainName}`}
            text="What Izuki thinks with. Google's Gemini is free — sign in with Google and press “Create API key”."
          >
            {brain ? (
              <button type="button" onClick={() => go("settings")} className="izk-pill h-[30px] px-3 text-[11.5px]">
                Change brain
              </button>
            ) : (
              <button type="button" onClick={() => getKey("gemini")} className="izk-btn-primary inline-flex h-[34px] items-center gap-1.5 px-4 text-[12.5px]">
                <ExternalLink size={13} /> Get my free brain
              </button>
            )}
          </Step>

          <Step
            icon={<AudioLines size={16} />}
            title="A voice"
            done
            doneText="A natural voice is on — nothing to do"
            text="Pick who Izuki is: 30+ characters and accents."
          >
            <button type="button" onClick={() => go("draw", "talk-card")} className="izk-pill h-[30px] px-3 text-[11.5px]">
              Pick a character
            </button>
          </Step>

          <Step
            icon={<Mic size={16} />}
            title="Talk hands-free"
            done={handsFree}
            doneText="On — just say “Hey Nova”"
            text="Say “Hey Nova” from across the room — or hold a key to talk if you prefer."
          >
            {handsFree ? (
              <button type="button" onClick={() => go("draw", "talk-card")} className="izk-pill h-[30px] px-3 text-[11.5px]">
                Change how I start
              </button>
            ) : (
              <button type="button" onClick={() => patch({ voice_wake_enabled: true })} className="izk-btn-primary inline-flex h-[34px] items-center gap-1.5 px-4 text-[12.5px]">
                <Mic size={13} /> Turn on “Hey Nova”
              </button>
            )}
          </Step>

          <Step
            icon={<Plug size={16} />}
            title="Your apps"
            done={apps}
            doneText="Connected — tap an app to sign in"
            text="Gmail, Calendar, Drive, Slack, Notion, socials and hundreds more. Sign up at Composio (free), open Settings → API Keys and copy yours."
          >
            {apps ? (
              <button type="button" onClick={() => go("apps")} className="izk-pill h-[30px] px-3 text-[11.5px]">
                Sign in to apps
              </button>
            ) : (
              <button type="button" onClick={() => getKey("composio")} className="izk-btn-primary inline-flex h-[34px] items-center gap-1.5 px-4 text-[12.5px]">
                <ExternalLink size={13} /> Connect my apps
              </button>
            )}
          </Step>

          <Step
            icon={<Smartphone size={16} />}
            title="Your phone"
            text="Call Izuki from your phone, or add the free phone app to your home screen."
          >
            <button type="button" onClick={() => go("settings", "settings-phone")} className="izk-pill h-[30px] px-3 text-[11.5px]">
              Set up my phone
            </button>
          </Step>

          <Step
            icon={<Tv size={16} />}
            title="Your TV"
            done={tv}
            doneText="Connected — “open Netflix on the TV”"
            text="Roku, Samsung and LG over your Wi-Fi with nothing to install — or the Izuki app on Android TV, Google TV and Fire TV for full control."
          >
            <button type="button" onClick={() => go("settings", "settings-tv")} className="izk-pill h-[30px] px-3 text-[11.5px]">
              Set up my TV
            </button>
          </Step>

          <Step
            icon={<Link2 size={16} />}
            title="One setup for phone & TV"
            done={linked}
            doneText={`${settings.linked_devices.length} device${settings.linked_devices.length === 1 ? "" : "s"} linked — they work even with this PC off`}
            text="Link your phone or TV once and it copies your AI, apps and memories."
          >
            {settings.lan_link ? (
              <button type="button" onClick={() => go("settings", "settings-tv")} className="izk-pill h-[30px] px-3 text-[11.5px]">
                See linked devices
              </button>
            ) : (
              <button type="button" onClick={() => { patch({ lan_link: true }); go("settings", "settings-tv"); }} className="izk-pill h-[30px] px-3 text-[11.5px]">
                Let them link
              </button>
            )}
          </Step>

          <Step
            icon={<Globe size={16} />}
            title="Browser extension"
            done={ext}
            doneText="Connected — clicks on web pages never miss"
            text="Lets Izuki see web pages exactly — every link and button — for Chrome and Edge."
          >
            <button type="button" onClick={() => go("settings", "settings-extension")} className="izk-pill h-[30px] px-3 text-[11.5px]">
              {ext ? "See it" : "Add it"}
            </button>
          </Step>

          <Step
            icon={<HeartHandshake size={16} />}
            title="Buddy mode"
            done={settings.buddy_speaks}
            doneText="On — I'll speak up about what matters"
            text="Izuki tells you about important emails, meetings, low battery and more — by itself."
          >
            <button type="button" onClick={() => patch({ buddy_speaks: !settings.buddy_speaks })} className="izk-pill h-[30px] px-3 text-[11.5px]">
              {settings.buddy_speaks ? "Turn off" : "Turn on"}
            </button>
          </Step>

          <Step icon={<Palette size={16} />} title="Make it yours" text="Pick the app's colours and your orb — water, stardust, a friendly face…">
            <button type="button" onClick={() => go("settings", "settings-theme")} className="izk-pill h-[30px] px-3 text-[11.5px]">
              Colours
            </button>
            <button type="button" onClick={() => go("settings", "settings-look")} className="izk-pill h-[30px] px-3 text-[11.5px]">
              Orb
            </button>
          </Step>

          <Step
            icon={<Workflow size={16} />}
            title="Automations (n8n)"
            done={flows > 0}
            doneText={`${flows} workflow${flows === 1 ? "" : "s"} ready — Izuki picks the right one`}
            text="Already use n8n? Import all your workflows at once — then just ask."
          >
            <button type="button" onClick={() => go("apps")} className="izk-pill h-[30px] px-3 text-[11.5px]">
              {flows ? "Manage" : "Import"}
            </button>
          </Step>

          <Step icon={<Sparkles size={16} />} title="Take the tour" text="A one-minute look at everything Izuki can do.">
            <button type="button" onClick={() => { onClose(); useIzuki.getState().setTourOpen?.(true); }} className="izk-pill h-[30px] px-3 text-[11.5px]">
              Show me around
            </button>
          </Step>

          <p className="px-1 pt-1 text-[11px] leading-snug text-izk-muted">
            Weather, web search, reading pages and your files work already — no keys needed.
          </p>

          <div className="mt-1 rounded-[14px] border border-white/8 bg-white/4 p-2.5">
            <span className="mb-1.5 block text-[11px] font-semibold text-izk-muted">Or paste any key here</span>
            <div className="flex gap-1.5">
              <input
                value={paste}
                onChange={(e) => setPaste(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && void usePasted()}
                type="password"
                placeholder="Gemini, Groq, Composio, OpenRouter, Grok…"
                spellCheck={false}
                autoComplete="off"
                className="izk-field h-[32px] min-w-0 flex-1 py-0 text-[12px]"
              />
              <button type="button" disabled={pasting || !paste.trim()} onClick={() => void usePasted()} className="izk-pill h-[32px] px-3 text-[11.5px] disabled:opacity-40">
                {pasting ? <Loader2 size={12} className="animate-spin" /> : "Use"}
              </button>
            </div>
            {pasteMsg && (
              <p className={cx("mt-1.5 text-[11px] leading-snug", pasteMsg.ok ? "text-izk-good" : "text-izk-danger")}>{pasteMsg.text}</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function Step({
  icon,
  title,
  text,
  need,
  done,
  doneText,
  children,
}: {
  icon: ReactNode;
  title: string;
  text: string;
  need?: boolean;
  done?: boolean;
  doneText?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cx(
        "rounded-[16px] border p-3 transition-colors",
        done ? "border-izk-good/25 bg-izk-good/6" : need ? "border-izk-violet/40 bg-izk-violet/10" : "border-white/8 bg-white/4"
      )}
    >
      <div className="flex items-start gap-2.5">
        <span
          className={cx(
            "flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[10px] border",
            done ? "border-izk-good/30 text-izk-good" : "border-white/10 text-izk-violet"
          )}
        >
          {done ? <CheckCircle2 size={16} /> : icon}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-[13px] font-semibold text-izk-ink">
            {title}
            {need && !done && <span className="rounded-full bg-izk-violet/25 px-1.5 py-[1px] text-[9.5px] font-bold uppercase tracking-wide text-izk-violet">needed</span>}
            {!need && !done && <span className="text-[10px] font-normal text-izk-muted">optional</span>}
          </div>
          <p className="mt-0.5 text-[11px] leading-snug text-izk-muted">{done && doneText ? doneText : text}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">{children}</div>
        </div>
      </div>
    </div>
  );
}
