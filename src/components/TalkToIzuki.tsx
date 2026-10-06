import { findFeatures, openFeature } from "./FeatureFinder";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  AudioLines,
  Captions,
  Ear,
  Hand,
  Keyboard,
  Mic,
  MicOff,
  MousePointer2,
  RotateCcw,
  Send,
  Sparkles,
  Timer,
  Volume1,
  Volume2,
  PanelTop,
} from "lucide-react";
import { Row, Segmented, Slider, Toggle, cx } from "./ui";
import { useIzuki } from "../lib/store";
import { api, EV, emit } from "../lib/ipc";
import { sendChatCommand } from "./VoiceEngine";
import { VoicePicker } from "./VoicePicker";
import { MicPicker } from "./MicPicker";
import { WakeWords } from "./WakeWords";
import { hasNaturalVoice, openVoiceSettings } from "../lib/speak";

/**
 * The "Talk to Izuki" card on the Draw tab.
 *
 * Purely a view: the actual wake-word microphone session lives in
 * `<VoiceEngine />`, mounted once at the top of the app so it survives tab
 * switches and the window being hidden to the tray. This component only
 * flips settings and reads the engine's broadcast state back out of the store.
 */
export function DrawCommandBar() {
  const busy=useIzuki(s=>s.voice.busy);
  const [text,setText]=useState('');
  const input=useRef<HTMLInputElement>(null);
  const setTab=useIzuki(s=>s.setTab);
  const submit=()=>{const value=text.trim();if(!value||busy)return;setText('');void sendChatCommand(value);};
  // Find anything in Izuki as you type (the same as Ctrl+K) — Enter still sends it as a command.
  const found=text.trim().length>=2?findFeatures(text,3):[];
  // Lives in the panel's header (under the tabs), so it never scrolls away.
  return <section id="draw-command" className="relative" aria-label="Type a command">
    <label htmlFor="draw-command-input" className="sr-only">Or type it</label>
    <form className="izk-inset flex items-center gap-2 rounded-[16px] p-1.5" onSubmit={e=>{e.preventDefault();submit();}}>
      <input ref={input} id="draw-command-input" value={text} onChange={e=>{setText(e.target.value);api.prefetchWhileTyping();}} onKeyDown={e=>{if(e.key==='Enter'&&e.nativeEvent.isComposing)e.preventDefault();}} disabled={busy} placeholder="Type a command or find anything in Izuki… (Enter to send)" className="h-[38px] min-w-0 flex-1 bg-transparent px-2 text-[12.5px] text-izk-ink outline-none placeholder:text-izk-muted/55"/>
      <button type="submit" aria-label="Send command" disabled={busy||!text.trim()} className="izk-btn-primary flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[12px] disabled:opacity-40"><Send size={15}/></button>
    </form>
    {found.length>0&&<div className="mt-2 flex flex-wrap items-center gap-1.5 text-[10.5px]" aria-label="Found in Izuki">
      <span className="text-izk-muted">In Izuki:</span>
      {found.map(f=><button key={f.label} type="button" title={f.hint} onClick={()=>{setText('');openFeature(f,setTab);}} className="izk-pill izk-no-drag px-2.5 py-1">{f.label} →</button>)}
    </div>}
  </section>;
}

export function TalkToIzuki() {
  const settings = useIzuki((s) => s.settings);
  const patch = useIzuki((s) => s.patchSettings);
  const voice = useIzuki((s) => s.voice);
  // Optimistic default so the nudge doesn't flash in before voices load.
  const [naturalVoice, setNaturalVoice] = useState(true);

  useEffect(() => {
    const check = () => setNaturalVoice(hasNaturalVoice());
    check();
    const synth = typeof window !== "undefined" ? window.speechSynthesis : undefined;
    synth?.addEventListener("voiceschanged", check);
    return () => synth?.removeEventListener("voiceschanged", check);
  }, []);


  return (
    <div id="talk-card" className="izk-card izk-grain relative overflow-hidden p-[16px]">
      <div
        className="pointer-events-none absolute -left-10 -top-16 h-40 w-40 rounded-full blur-[46px]"
        style={{ background: "radial-gradient(circle,rgba(255,230,109,0.35),transparent 70%)" }}
      />

      <div className="relative flex items-center gap-3">
        <div
          className={cx(
            "relative flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-[15px] border transition-colors duration-300",
            voice.active
              ? "border-izk-hand/40 bg-izk-hand/14 text-izk-hand"
              : "border-white/10 bg-white/6 text-izk-muted"
          )}
        >
          {voice.active ? (
            <Mic size={19} strokeWidth={2} className={voice.heard ? "izk-breathe" : undefined} />
          ) : (
            <MicOff size={19} strokeWidth={2} />
          )}
          {voice.active && (
            <span className="absolute -right-1 -top-1 h-[10px] w-[10px] rounded-full bg-izk-hand shadow-[0_0_10px_rgba(255,230,109,0.8)] izk-breathe" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="text-[14px] font-bold tracking-[-0.015em] text-izk-ink">
            Talk to Izuki
          </h2>
          <p className="mt-0.5 text-[11px] leading-snug text-izk-muted">
            {settings.voice_wake_enabled
              ? voice.error === "no-wake-word"
                ? "Hands-free needs a wake word — add one below. Until then, hold the talk key."
                : voice.active
                  ? "Listening for your wake word — just say it, no key needed."
                  : "Starting the microphone…"
              : "Hands-free is off. Hold the talk key, type in the chat, or turn it on below."}
          </p>
        </div>
      </div>

      <div className="relative mt-3.5">
        <Row
          label="How do you start talking?"
          hint={
            settings.voice_wake_enabled
              ? 'Say your wake word (like "Hey Nova") from anywhere — the orb pops up and you just talk. The talk key works too.'
              : `Hold ${prettyKeys(settings.hotkey_voice)}, talk while the orb moves with your voice, and let go — it sends. Nothing listens until you press it.`
          }
          icon={<Sparkles size={14} strokeWidth={2.3} />}
        >
          <Segmented
            value={settings.voice_wake_enabled ? "wake" : "key"}
            onChange={(v) => patch({ voice_wake_enabled: v === "wake" })}
            size="sm"
            options={[
              { value: "wake", label: "Say “Hey Nova”" },
              { value: "key", label: "Hold a key" },
            ]}
          />
        </Row>

        {settings.voice_wake_enabled && <WakeWords />}
        {settings.voice_wake_enabled && (
          <Row
            label="Wake-up strictness"
            hint="Waking up on words that only sound like your wake word? Pick Strict. Not hearing you? Pick Relaxed."
          >
            <Segmented
              value={settings.wake_sensitivity ?? "normal"}
              onChange={(v) => patch({ wake_sensitivity: v })}
              size="sm"
              options={[
                { value: "relaxed", label: "Relaxed" },
                { value: "normal", label: "Normal" },
                { value: "strict", label: "Strict" },
              ]}
            />
          </Row>
        )}
        <MicPicker />

        <div className="izk-divider" />

        <Row
          label="Island at the top of the screen"
          hint="A little pill that shows what I'm doing, what's playing and your next reminder. Push your mouse to the top of the screen to open it."
          icon={<PanelTop size={14} strokeWidth={2.3} />}
        >
          <Toggle checked={settings.island_enabled} onChange={(v) => patch({ island_enabled: v })} />
        </Row>
        <Row
          label="Screen time"
          hint="Ask “how long was I on YouTube today?” — Izuki counts minutes per app and big site (only names and minutes, never what was on screen), on this PC, for two weeks. It's on the status screen too."
        >
          <Toggle checked={settings.screen_time_enabled} onChange={(v) => patch({ screen_time_enabled: v })} />
        </Row>
        <Row label="Your town or city" hint="For the weather on the Island and the status screen. Leave empty and I'll use what I remember about where you live.">
          <input
            value={settings.home_city}
            onChange={(e) => patch({ home_city: e.target.value })}
            placeholder="e.g. Lagos"
            className="izk-field izk-no-drag w-[140px] py-1 text-[12px]"
          />
        </Row>
        <Row
          label="Recall (what was on my screen)"
          hint="Ask “what was that site I was on this morning?” or “what was I doing at 3?”. Izuki notes only the titles of the windows you had open — never what's in them, never private or sign-in windows — keeps a week, on this PC only. Off until you turn it on."
        >
          <Toggle checked={settings.recall_enabled} onChange={(v) => patch({ recall_enabled: v })} />
        </Row>
        {settings.recall_enabled && (
          <div className="-mt-1 flex justify-end">
            <button type="button" className="izk-pill izk-no-drag px-2.5 py-1 text-[11px]" onClick={() => void api.recallForget()}>
              Forget everything Recall noted
            </button>
          </div>
        )}
        <Row
          label="Speak up by itself (buddy mode)"
          hint="Like a friend at your desk: I'll tell you about an important email (a job, money, a deadline), a meeting coming up, the battery getting low, the internet dropping — and say “welcome back” with what you missed. Never over a film or game unless it's urgent, and quiet at night. While you're away, important things go to your phone too."
        >
          <Toggle checked={settings.buddy_speaks} onChange={(v) => patch({ buddy_speaks: v })} />
        </Row>
        {settings.buddy_speaks && (
          <>
            <Row
              label="Handle small things on my own"
              hint="Undoable things only, and I'll always say what I did — like switching on battery saver when the battery's nearly empty (it switches back when you plug in)."
            >
              <Toggle checked={settings.buddy_acts} onChange={(v) => patch({ buddy_acts: v })} />
            </Row>
            <Row label="Remind me to take breaks" hint="A friendly nudge after about two and a half hours without a break.">
              <Toggle checked={settings.buddy_breaks} onChange={(v) => patch({ buddy_breaks: v })} />
            </Row>
          </>
        )}
        <Row
          label="Dance with my music"
          hint="When music plays on this PC, the orb comes up and flows with it. Close it any time with ×. (Only the volume is read — nothing is recorded.)"
        >
          <Toggle checked={settings.music_visuals} onChange={(v) => patch({ music_visuals: v })} />
        </Row>
        {settings.island_enabled && (
          <Row
            label="Suggest help by itself"
            hint='When an error pops up, or you are on a question or a video, the Island briefly offers help ("Explain this video?"). Never more than once per page.'
          >
            <Toggle checked={settings.island_suggestions} onChange={(v) => patch({ island_suggestions: v })} />
          </Row>
        )}

        <Row
          label="Always show the hand"
          hint="Keeps the glowing hand on your screen, tracking your cursor — close this window and it keeps going."
          icon={<Hand size={14} strokeWidth={2.3} />}
        >
          <Toggle
            checked={settings.follow_mode_enabled}
            onChange={(v) => patch({ follow_mode_enabled: v })}
          />
        </Row>

        <AnimatePresence initial={false}>
          {settings.follow_mode_enabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <Row label="Hand size" hint="How big the hand riding your cursor is.">
                <Slider
                  value={settings.follow_hand_size}
                  min={10}
                  max={48}
                  suffix="px"
                  onChange={(v) => patch({ follow_hand_size: v })}
                />
              </Row>
              <Row
                label="Lost the chat bubble?"
                hint='Puts it back in the corner — or just say "bring back the chat".'
              >
                <button
                  type="button"
                  onClick={() => void emit(EV.resetFloating)}
                  className="izk-pill izk-no-drag h-[30px] px-3 text-[11.5px]"
                >
                  <RotateCcw size={12} strokeWidth={2.4} />
                  Reset
                </button>
              </Row>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="izk-divider" />

        <Row
          label="Chat instead of speaking"
          hint="Keep a text box here — type a command, press Enter, watch it run."
          icon={<Keyboard size={14} strokeWidth={2.3} />}
        >
          <Toggle checked={settings.chat_mode} onChange={(v) => patch({ chat_mode: v })} />
        </Row>

        <div className="izk-divider" />

        <Row
          label="While it works"
          icon={<MousePointer2 size={14} strokeWidth={2.3} />}
          hint={
            settings.execution_mode === "focus"
              ? "Focus — the hand points at each step on your live screen. Your mouse stays yours while it thinks."
              : "Background — no freeze, Izuki only takes the cursor for the instant it needs it."
          }
        >
          <Segmented<"background" | "focus">
            size="sm"
            value={settings.execution_mode}
            onChange={(v) => patch({ execution_mode: v })}
            options={[
              { value: "focus", label: "Focus" },
              { value: "background", label: "Background" },
            ]}
          />
        </Row>

        <div className="izk-divider" />

        <Row
          label="Show live captions"
          hint="A caption of what Izuki says, right next to the hand while it works."
          icon={<Captions size={14} strokeWidth={2.3} />}
        >
          <Toggle checked={settings.show_captions} onChange={(v) => patch({ show_captions: v })} />
        </Row>
        {settings.show_captions && (
          <Row
            label="Keep my last answer on screen"
            hint="Izuki's answer stays up after the orb goes, so you can read it again (or copy it). Close it with ×."
          >
            <Toggle checked={settings.keep_reply} onChange={(v) => patch({ keep_reply: v })} />
          </Row>
        )}

        <div className="izk-divider" />

        <Row
          label="Show my words as I talk"
          hint="Your words appear live while you speak — so you can see Izuki is really hearing you."
          icon={<AudioLines size={14} strokeWidth={2.3} />}
        >
          <Toggle
            checked={settings.show_transcript}
            onChange={(v) => patch({ show_transcript: v })}
          />
        </Row>

        <div className="izk-divider" />

        <Row
          label="Interrupt by talking"
          hint="Just start talking while Izuki answers and it stops to listen, like ChatGPT. On Bluetooth headphones its voice sounds like a phone call while this is on."
          icon={<Hand size={14} strokeWidth={2.3} />}
        >
          <Toggle checked={settings.barge_in} onChange={(v) => patch({ barge_in: v })} />
        </Row>

        <div className="izk-divider" />

        <Row
          label="Lower media while we talk"
          hint="Music and videos get quieter while you or Izuki speaks, then return to their previous volume."
          icon={<Volume1 size={14} strokeWidth={2.3} />}
        >
          <Toggle
            checked={settings.duck_while_listening}
            onChange={(v) => patch({ duck_while_listening: v })}
          />
        </Row>

        <div className="izk-divider" />

        <Row
          label="Sharper hearing"
          hint="Also checks your words with a big cloud model using your Gemini (or Groq) key — gets song and artist names right and ignores background music. Falls back to this PC instantly if it's slow or offline."
          icon={<Ear size={14} strokeWidth={2.3} />}
        >
          <Toggle checked={settings.cloud_ears} onChange={(v) => patch({ cloud_ears: v })} />
        </Row>

        <div className="izk-divider" />

        <Row
          label="Language I speak"
          hint="Auto detects it. Pick Nigerian English, Pidgin or a language when Izuki keeps mishearing your accent or words."
          icon={<AudioLines size={14} strokeWidth={2.3} />}
        >
          <select
            value={settings.speech_language}
            onChange={(e) => patch({ speech_language: e.target.value })}
            className="izk-field izk-no-drag h-[32px] max-w-[142px] py-0 text-[11.5px]"
            aria-label="Language Izuki should hear"
          >
            <option value="auto">Auto</option>
            <option value="nigerian">Nigerian English</option>
            <option value="pidgin">Nigerian Pidgin</option>
            <option value="english">English</option>
            <option value="yoruba">Yoruba</option>
            <option value="igbo">Igbo</option>
            <option value="hausa">Hausa</option>
            <option value="french">French</option>
            <option value="spanish">Spanish</option>
            <option value="arabic">Arabic</option>
            <option value="hindi">Hindi</option>
            <option value="swahili">Swahili</option>
            <option value="german">German</option>
            <option value="japanese">Japanese</option>
          </select>
        </Row>

        <div className="izk-divider" />

        <FollowUpPicker />

        <div className="izk-divider" />

        <Row
          label="Speak responses"
          hint="Off for captions with no voice at all."
          icon={<Volume2 size={14} strokeWidth={2.3} />}
        >
          <Toggle
            checked={settings.speak_responses}
            onChange={(v) => patch({ speak_responses: v })}
          />
        </Row>

        <div id="draw-voice">{settings.speak_responses && <VoicePicker />}</div>


        <AnimatePresence>
          {(voice.lastHeard || voice.error) && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className={cx(
                "mt-2.5 truncate rounded-[12px] border px-3 py-2 text-[11.5px]",
                voice.error
                  ? "border-izk-danger/25 bg-izk-danger/8 text-izk-danger"
                  : "border-izk-teal/25 bg-izk-teal/8 text-izk-teal"
              )}
            >
              {voice.error ?? `Heard: “${voice.lastHeard}”`}
            </motion.div>
          )}
        </AnimatePresence>

        <p className="mt-2.5 text-[10px] leading-relaxed text-izk-muted/70">
          Say <b className="text-izk-muted">hide</b>, <b className="text-izk-muted">show
          yourself</b>, <b className="text-izk-muted">stop</b> or <b className="text-izk-muted">
          chat</b> any time — those run instantly, no thinking required. Say <b className="text-izk-muted">
          remember that…</b> and Izuki keeps it for next time.
        </p>

        {settings.voice_engine === "system" && settings.voice_wake_enabled && !naturalVoice && (
          <button
            type="button"
            onClick={openVoiceSettings}
            className="izk-no-drag mt-2.5 flex w-full items-center gap-2.5 rounded-[14px] border border-izk-teal/20 bg-izk-teal/8 p-2.5 text-left transition-colors duration-200 hover:bg-izk-teal/12"
          >
            <AudioLines size={15} strokeWidth={2.2} className="shrink-0 text-izk-teal" />
            <span className="min-w-0 flex-1 text-[10.5px] leading-relaxed text-izk-muted">
              <span className="font-semibold text-izk-teal">Sounds a bit robotic?</span> Windows
              has free natural voices — two clicks in Settings, no download by Izuki.
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

/** 5 seconds … 30 minutes. */
const MIN_SECS = 5;
const MAX_SECS = 30 * 60;
const PRESETS: Array<[string, number]> = [
  ["10 s", 10],
  ["30 s", 30],
  ["1 min", 60],
  ["5 min", 300],
  ["30 min", MAX_SECS],
];

/**
 * How long a "Hey Nova" conversation keeps listening for you before it
 * closes by itself — so you don't have to call it again every time you
 * pause to think. "That's all" / "bye" still closes it straight away.
 */
function FollowUpPicker() {
  const secs = useIzuki((s) => s.settings.follow_up_secs) || MAX_SECS;
  const patch = useIzuki((s) => s.patchSettings);
  const inMinutes = secs >= 60 && secs % 60 === 0;
  const [unit, setUnit] = useState<"s" | "min">(inMinutes ? "min" : "s");
  const shown = unit === "min" ? secs / 60 : secs;
  /** What's being typed — only while the box is being edited. */
  const [draft, setDraft] = useState<string | null>(null);
  const set = (value: number, u = unit) => {
    if (!Number.isFinite(value) || value <= 0) return;
    const next = Math.round(u === "min" ? value * 60 : value);
    patch({ follow_up_secs: Math.min(MAX_SECS, Math.max(MIN_SECS, next)) });
  };
  const label = secs >= 60 ? `${Math.round((secs / 60) * 10) / 10} min` : `${secs} s`;

  return (
    <div className="py-1">
      <Row
        label="Keep listening after I stop talking"
        hint={`The conversation stays open ${label} after Izuki answers, waiting for you — say “that's all” to close it sooner. Up to 30 minutes.`}
        icon={<Timer size={14} strokeWidth={2.3} />}
      >
        <div className="flex items-center gap-1">
          <input
            type="number"
            min={1}
            value={draft ?? (Number.isInteger(shown) ? shown : Number(shown.toFixed(1)))}
            onChange={(e) => {
              setDraft(e.target.value);
              set(Number(e.target.value));
            }}
            onBlur={() => setDraft(null)}
            className="izk-no-drag h-[30px] w-[58px] rounded-[10px] border border-white/10 bg-white/6 px-2 text-right text-[12px] text-izk-ink outline-none"
          />
          <select
            value={unit}
            onChange={(e) => {
              const u = e.target.value as "s" | "min";
              setUnit(u);
              set(shown, u);
            }}
            className="izk-no-drag h-[30px] rounded-[10px] border border-white/10 bg-white/6 px-1.5 text-[12px] text-izk-ink outline-none"
          >
            <option value="s" className="bg-[#1b2230]">sec</option>
            <option value="min" className="bg-[#1b2230]">min</option>
          </select>
        </div>
      </Row>
      <div className="mt-1 flex flex-wrap gap-1.5 pl-[30px]">
        {PRESETS.map(([name, value]) => (
          <button
            key={name}
            type="button"
            onClick={() => {
              setUnit(value >= 60 ? "min" : "s");
              patch({ follow_up_secs: value });
            }}
            className={
              "izk-pill izk-no-drag h-[24px] px-2.5 text-[11px]" + (secs === value ? " text-izk-teal" : "")
            }
          >
            {name}
          </button>
        ))}
      </div>
    </div>
  );
}

/** "Ctrl+Super+Space" → "Ctrl + Windows + Space", in words people know. */
function prettyKeys(combo: string): string {
  return (combo || "Ctrl+Super+Space")
    .split("+")
    .map((k) => (/^(super|meta|win|cmd)$/i.test(k.trim()) ? "Windows" : k.trim()))
    .join(" + ");
}
