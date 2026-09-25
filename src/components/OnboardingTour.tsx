import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Brain, Check, ExternalLink, Heart, Mic, MousePointerClick, PenTool, X } from "lucide-react";
import { IzukiMark } from "./IzukiMark";
import { Kbd, cx } from "./ui";
import { useIzuki } from "../lib/store";
import { IS_TAURI } from "../lib/ipc";

interface Step {
  icon: ReactNode;
  title: string;
  body: ReactNode;
}

function IconTile({ tone, children }: { tone: string; children: ReactNode }) {
  return (
    <div
      className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-[20px] border"
      style={{ color: tone, borderColor: `${tone}44`, background: `${tone}1A` }}
    >
      {children}
    </div>
  );
}

async function openUrl(url: string) {
  if (!IS_TAURI) return void window.open(url, "_blank");
  const { openUrl: open } = await import("@tauri-apps/plugin-opener");
  await open(url);
}

/** Where a free key comes from — Google's, no card needed. */
const GEMINI_KEY_URL = "https://aistudio.google.com/apikey";

/**
 * "Give me a brain": paste a free Gemini key right here, so a first-time
 * user never has to find the settings page before anything works.
 */
function KeyStep() {
  const settings = useIzuki((s) => s.settings);
  const patch = useIzuki((s) => s.patchSettings);
  const gemini = settings.providers.find((p) => p.id === "gemini");
  const hasAnyKey = settings.providers.some((p) => p.api_key.trim() && p.id !== "ollama");
  const [key, setKey] = useState("");
  const [saved, setSaved] = useState(false);

  const save = () => {
    const k = key.trim();
    if (!k) return;
    const active = settings.providers.find((p) => p.id === settings.active_provider);
    patch({
      providers: settings.providers.map((p) => (p.id === "gemini" ? { ...p, api_key: k, enabled: true } : p)),
      // Use it straight away unless another brain is already set up.
      ...(!active?.api_key.trim() ? { active_provider: "gemini" as const } : {}),
    });
    setSaved(true);
  };

  return (
    <>
      Everything I do needs an AI "brain". Google's Gemini is free — no card needed.
      <span className="mt-3 flex flex-col gap-2 text-left">
        <button
          type="button"
          onClick={() => void openUrl(GEMINI_KEY_URL)}
          className="izk-pill izk-no-drag h-[32px] justify-center gap-1.5 text-[12px]"
        >
          <ExternalLink size={12} strokeWidth={2.4} /> 1. Get a free key (sign in → Create API key)
        </button>
        <span className="flex gap-1.5">
          <input
            value={key}
            onChange={(e) => {
              setKey(e.target.value);
              setSaved(false);
            }}
            onKeyDown={(e) => e.key === "Enter" && save()}
            placeholder={gemini?.api_key.trim() ? "Key saved ✓ — paste a new one to replace" : "2. Paste it here (starts with AIza…)"}
            className="izk-no-drag h-[32px] min-w-0 flex-1 rounded-[10px] border border-white/10 bg-white/6 px-2.5 text-[12px] text-izk-ink outline-none placeholder:text-izk-muted/70"
          />
          <button type="button" onClick={save} className="izk-btn-primary izk-no-drag h-[32px] px-3 text-[12px]">
            Save
          </button>
        </span>
        <span className="text-[11px] text-izk-muted/90">
          {saved || gemini?.api_key.trim()
            ? "Got it — I'm ready."
            : hasAnyKey
              ? "You already have a brain set up — this is optional."
              : "Other brains (NVIDIA, OpenRouter, a local Ollama…) are in Settings → Izuki's brain."}
        </span>
      </span>
    </>
  );
}

/** Hands-free needs a wake word of your own ("Hey Nova") — free to make. */
function HandsFreeStep({ hotkeyVoice }: { hotkeyVoice: string }) {
  const on = useIzuki((s) => s.settings.voice_wake_enabled);
  const patch = useIzuki((s) => s.patchSettings);
  return (
    <>
      Pick a wake word — like <b>“Hey Nova”</b> — free at openwakeword.com (Draw → Hey Izuki → Wake words shows
      how). Say it and I'll answer “Mhm?” — then just talk. Pause and I answer; <b>talk over me</b> to interrupt; say “that's all” when you're done. Or
      hold <Kbd combo={hotkeyVoice} /> to talk without the wake word.
      <span className="mt-3 flex justify-center">
        <button
          type="button"
          onClick={() => patch({ voice_wake_enabled: !on })}
          className={cx(
            "izk-no-drag flex h-[32px] items-center gap-1.5 rounded-full px-3.5 text-[12px]",
            on ? "izk-pill text-izk-teal" : "izk-btn-primary"
          )}
        >
          {on ? (
            <>
              <Check size={13} strokeWidth={2.6} /> Hands-free is on
            </>
          ) : (
            <>
              <Mic size={13} strokeWidth={2.4} /> Turn on hands-free
            </>
          )}
        </button>
      </span>
    </>
  );
}

function buildSteps(hotkeyDraw: string, hotkeyVoice: string, hotkeyQuick: string, hotkeyPanic: string): Step[] {
  return [
    {
      icon: (
        <IzukiMark size={72} className="rounded-[20px] shadow-[0_10px_30px_rgba(76,84,220,0.4)]" />
      ),
      title: "Hey, I'm Izuki.",
      body: "Your companion that lives on your screen. Talk to me like a friend — I can see your screen, answer questions about it, and use your mouse and keyboard to get things done for you.",
    },
    {
      icon: (
        <IconTile tone="#22D3EE">
          <Brain size={26} strokeWidth={2.1} />
        </IconTile>
      ),
      title: "First, give me a brain",
      body: <KeyStep />,
    },
    {
      icon: (
        <IconTile tone="#FFE66D">
          <Mic size={24} strokeWidth={2.1} />
        </IconTile>
      ),
      title: "Talk to me, hands-free",
      body: <HandsFreeStep hotkeyVoice={hotkeyVoice} />,
    },
    {
      icon: (
        <IconTile tone="#7C5CFF">
          <MousePointerClick size={24} strokeWidth={2.1} />
        </IconTile>
      ),
      title: "Ask for anything",
      body: (
        <>
          “Open Spotify and play something chill.” “What's on my screen?” “Point at the save button.” “Reply to
          this email.” I look, act, and look again until it's done — and <Kbd combo={hotkeyPanic} /> stops me
          instantly.
        </>
      ),
    },
    {
      icon: (
        <IconTile tone="#FF5F7A">
          <PenTool size={24} strokeWidth={2.1} />
        </IconTile>
      ),
      title: "Or show me",
      body: (
        <>
          Press <Kbd combo={hotkeyQuick} />, circle or point at something, then say or type what you mean and hit
          Enter. For bigger jobs, <Kbd combo={hotkeyDraw} /> opens the full drawing tools — a circle clicks, an arrow
          drags, a box watches.
        </>
      ),
    },
    {
      icon: (
        <IconTile tone="#4ECDC4">
          <Heart size={24} strokeWidth={2.1} />
        </IconTile>
      ),
      title: "I get to know you",
      body: "Tell me things — “remember I use my work Chrome profile” — and I'll keep them, along with the habits I notice. See or delete everything I remember any time under Draw → What Izuki remembers.",
    },
  ];
}

/**
 * The first-run welcome tour. Auto-opens once (gated by `onboarding_seen` in
 * settings) and is fully replayable from Settings, so trying it again is
 * never a "reinstall the app" kind of ordeal.
 */
export function OnboardingTour({ onDone }: { onDone: () => void }) {
  const settings = useIzuki((s) => s.settings);
  const [i, setI] = useState(0);
  const steps = buildSteps(settings.hotkey_draw, settings.hotkey_voice, settings.hotkey_quickdraw, settings.hotkey_panic);
  const last = i === steps.length - 1;
  const step = steps[i];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="izk-no-drag absolute inset-0 z-[60] flex flex-col items-center justify-center rounded-[inherit] bg-black/55 p-6 backdrop-blur-md"
    >
      <button
        type="button"
        onClick={onDone}
        aria-label="Skip tour"
        className="absolute right-4 top-4 flex h-[30px] w-[30px] items-center justify-center rounded-full border border-white/10 bg-white/6 text-izk-muted transition-colors hover:text-izk-ink"
      >
        <X size={14} strokeWidth={2.4} />
      </button>

      <AnimatePresence mode="wait">
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.98 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="izk-card izk-grain flex w-full max-w-[400px] flex-col items-center gap-4 rounded-[26px] p-6 text-center"
        >
          {step.icon}
          <div className="w-full">
            <h2 className="text-[16px] font-bold tracking-[-0.01em] text-izk-ink">{step.title}</h2>
            <div className="mt-1.5 text-[12.5px] leading-relaxed text-izk-muted">{step.body}</div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="mt-5 flex items-center gap-1.5">
        {steps.map((_, d) => (
          <span
            key={d}
            className={cx(
              "h-[6px] rounded-full transition-all duration-300",
              d === i ? "w-[18px] bg-izk-violet" : "w-[6px] bg-white/18"
            )}
          />
        ))}
      </div>

      <div className="mt-5 flex w-full max-w-[400px] items-center gap-2.5">
        {i > 0 ? (
          <button type="button" onClick={() => setI((v) => v - 1)} className="izk-pill h-[40px] flex-1 text-[12.5px]">
            Back
          </button>
        ) : (
          <button type="button" onClick={onDone} className="izk-pill h-[40px] flex-1 text-[12.5px]">
            Skip
          </button>
        )}
        <button
          type="button"
          onClick={() => (last ? onDone() : setI((v) => v + 1))}
          className="izk-btn-primary flex h-[40px] flex-1 items-center justify-center gap-1.5 text-[12.5px]"
        >
          {last ? (
            <>
              Let's go <Check size={14} strokeWidth={2.6} />
            </>
          ) : (
            <>
              Next <ArrowRight size={14} strokeWidth={2.6} />
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}
