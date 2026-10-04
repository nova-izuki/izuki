import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Sparkles, X } from "lucide-react";
import pkg from "../../package.json";
import { useIzuki, type TabId } from "../lib/store";
import { sendChatCommand } from "./VoiceEngine";

/**
 * "What's new" — shown once after each update (and any time from the ✨
 * button): every new thing with one tap to try it or jump to where it
 * lives. Nothing new should ever be hidden.
 */

const SEEN_KEY = "izk.whatsNewSeen";

interface Item {
  icon: string;
  title: string;
  how: string;
  /** One tap: ask Izuki something, or open where it lives. */
  try?: { label: string; say?: string; tab?: TabId; id?: string };
}

const ITEMS: Item[] = [
  { icon: "🫶", title: "Izuki speaks up by itself", how: "Buddy mode: an important email (a job, money, a deadline), a meeting soon, low battery, the internet dropping — said out loud, and “welcome back” with what you missed. Important things reach your phone while you're away.", try: { label: "Choose", tab: "draw", id: "talk-card" } },
  { icon: "🧠", title: "Answers in the background", how: "Ask “how many GB is Zoom?” or “which apps don't I use?” and Izuki checks quietly and just tells you — no windows opened. Say “while I watch” to see it done on screen.", try: { label: "Try it", say: "how much free space is on my PC?" } },
  { icon: "✅", title: "Proof check", how: "After every change (uninstall, install, delete, close an app) Izuki looks again and shows “✓ Checked: Zoom is no longer installed” before saying it's done. It also catches itself if it ever claims something it didn't do." },
  { icon: "💬", title: "One clean reply in the chat", how: "Each job is one message: the steps it took, then the answer — with a live status line, Copy, Read aloud and Again, tidy lists and code boxes. Quick checks run without asking." },
  { icon: "📺", title: "Samsung & LG TVs too", how: "“Open Netflix on the TV”, “turn the TV up”, “pause the TV” — Roku, Samsung and LG over your Wi-Fi. Press Allow on the TV the first time.", try: { label: "Set up my TV", tab: "settings", id: "settings-tv" } },
  { icon: "🎛️", title: "Status screen", how: "Say “wake up” or “status report”: time, battery, inbox, calendar, reminders, music and apps on a holographic screen.", try: { label: "Show me", say: "wake up" } },
  { icon: "🏝️", title: "The Island", how: "Push your mouse to the very top-middle of the screen. It shows what Izuki's doing, what's playing, reminders and smart suggestions." },
  { icon: "🧩", title: "Browser extension", how: "Add it to Chrome or Edge and Izuki sees web pages exactly — every link and button — so clicks never miss. In Jarvis mode it clicks inside the page itself.", try: { label: "Add it", tab: "settings", id: "settings-extension" } },
  { icon: "📝", title: "Nova Notes", how: "Say “take notes on this” on any page, PDF or quiz — or open the Notes tab. Then flashcards, quiz me, summarise or ask about them. Teacher mode saves lessons by itself.", try: { label: "Open Notes", tab: "notes" } },
  { icon: "🎨", title: "App colours", how: "Pick a colour theme for the app — or Auto, which changes with the time of day.", try: { label: "Pick colours", tab: "settings", id: "settings-theme" } },
  { icon: "🛡️", title: "Ask first or Auto-run — in the chat bar too", how: "The orb's chat bar has an Ask / Auto button. On Ask, Izuki says what it wants to run and waits for you to say or type “allow”." },
  { icon: "🫧", title: "Real 3D orbs & a hologram face", how: "Clear water, Pure water, Ferrofluid, Stardust, Hologram face… or just say “change your orb to stardust”.", try: { label: "Pick one", tab: "settings", id: "settings-look" } },
  { icon: "⚡", title: "Jarvis mode (no mouse)", how: "Izuki presses buttons and types straight through Windows — no pointer, nothing flashing. Tap the mode name at the top of Chat to switch.", try: { label: "Open Chat", tab: "chat" } },
  { icon: "🎩", title: "Jarvis voice", how: "Atlas — a calm, witty British AI assistant voice. Say “Jarvis voice” any time.", try: { label: "Switch to it", say: "switch to jarvis" } },
  { icon: "👩‍🏫", title: "Teacher mode", how: "On any quiz, say “teacher mode”: it explains each question with the pen, checks your answer, and clicks Next when you're ready." },
  { icon: "🎵", title: "Music mode", how: "While music plays, open the Island and tap ✨ Flow with it — the orb moves with the music." },
  { icon: "⌨️", title: "Say it, or hold a key", how: "Choose “Hey Nova” or hold Ctrl + Windows + Space to talk — plus wake-up strictness.", try: { label: "Choose", tab: "draw", id: "talk-card" } },
  { icon: "✨", title: "Smart suggestions", how: "The Island and the Chat tab offer the right help for what's on screen — a quiz, an email, an error, a video." },
];

/** Open a tab, then scroll to (and focus) a section in it once it's there. */
function goTo(setTab: (t: TabId) => void, tab: TabId, id?: string) {
  setTab(tab);
  if (!id) return;
  let tries = 0;
  const look = () => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ block: "start", behavior: "smooth" });
      return;
    }
    if (tries++ < 20) setTimeout(look, 100);
  };
  setTimeout(look, 80);
}

export function WhatsNewButton({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      title="What's new"
      className="izk-pill izk-no-drag flex h-[26px] items-center gap-1.5 px-2.5 text-[11px] font-semibold"
    >
      <Sparkles size={12} /> What's new
    </button>
  );
}

/** Shown once per version; `open` forces it from the button. */
export function useWhatsNew(blocked: boolean) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (blocked) return;
    try {
      if (localStorage.getItem(SEEN_KEY) !== pkg.version) setOpen(true);
    } catch {
      /* no storage — just don't auto-open */
    }
  }, [blocked]);
  const close = () => {
    setOpen(false);
    try {
      localStorage.setItem(SEEN_KEY, pkg.version);
    } catch {
      /* fine */
    }
  };
  return { open, show: () => setOpen(true), close };
}

export function WhatsNew({ onClose }: { onClose: () => void }) {
  const setTab = useIzuki((s) => s.setTab);
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="izk-no-drag absolute inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/55 p-4 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ y: 16, scale: 0.97, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        className="izk-card izk-grain relative w-full max-w-[560px] p-5"
        role="dialog"
        aria-label="What's new in Izuki"
      >
        <button type="button" onClick={onClose} aria-label="Close" className="absolute right-3 top-3 rounded-full p-1.5 text-izk-muted hover:bg-white/10 hover:text-izk-ink">
          <X size={16} />
        </button>
        <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-izk-teal">Izuki {pkg.version}</div>
        <h2 className="mt-1 text-[22px] font-bold tracking-[-0.02em] text-izk-ink">What's new — try it now</h2>
        <div className="mt-4 flex flex-col gap-2">
          {ITEMS.map((it) => (
            <div key={it.title} className="flex items-start gap-3 rounded-[16px] border border-white/10 bg-white/[0.04] p-3">
              <div className="text-[22px] leading-none">{it.icon}</div>
              <div className="min-w-0 flex-1">
                <div className="text-[13.5px] font-semibold text-izk-ink">{it.title}</div>
                <div className="mt-0.5 text-[12px] leading-snug text-izk-muted">{it.how}</div>
              </div>
              {it.try && (
                <button
                  type="button"
                  className="izk-btn-primary shrink-0 px-3 py-1.5 text-[11.5px]"
                  onClick={() => {
                    onClose();
                    if (it.try?.say) void sendChatCommand(it.try.say);
                    else if (it.try?.tab) goTo(setTab, it.try.tab, it.try.id);
                  }}
                >
                  {it.try.label}
                </button>
              )}
            </div>
          ))}
        </div>
        <button type="button" onClick={onClose} className="izk-btn-primary mt-4 w-full py-2.5 text-[13px]">
          Got it
        </button>
      </motion.div>
    </motion.div>
  );
}
