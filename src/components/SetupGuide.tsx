import { useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { Brain, CheckCircle2, ExternalLink, Loader2, Plug, Smartphone, Sparkles, AudioLines, Workflow, X } from "lucide-react";
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
  const go = (tab: Parameters<typeof setTab>[0]) => {
    setTab(tab);
    onClose();
  };

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
      className="izk-no-drag absolute inset-0 z-[60] flex flex-col rounded-[inherit] bg-black/60 p-4 backdrop-blur-md"
    >
      <div className="relative mx-auto flex max-h-full w-full max-w-[520px] flex-col overflow-hidden rounded-[22px] border border-white/12 bg-[#11131f]/95 shadow-[0_24px_70px_rgba(0,0,0,0.6)]">
        <div className="flex items-start gap-3 border-b border-white/8 p-4">
          <span className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[13px] bg-gradient-to-br from-izk-violet/60 to-izk-teal/50">
            <Sparkles size={18} className="text-white" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-[16px] font-bold text-izk-ink">Get Izuki connected</h2>
            <p className="mt-0.5 text-[11.5px] leading-snug text-izk-muted">
              All free. Tap a button, copy the key on the page that opens, and come back — Izuki picks it up by itself.
            </p>
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

        <div className="flex flex-col gap-2 overflow-y-auto p-3">
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
            <button type="button" onClick={() => go("draw")} className="izk-pill h-[30px] px-3 text-[11.5px]">
              Pick a character
            </button>
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
            <button type="button" onClick={() => go("settings")} className="izk-pill h-[30px] px-3 text-[11.5px]">
              Set up my phone
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
