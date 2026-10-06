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
  { icon: "🤝", title: "Works beside you", how: "Use your mouse or keyboard while Izuki is working and it waits for you, then takes a fresh look and carries on. If a click does nothing, it presses the button straight through Windows or the web page itself. The pointer is checked to be exactly on target before every click." },
  { icon: "🚀", title: "PC Boost", how: "Notices when your PC is struggling and offers to speed it up: old temp files cleared, hogging background updaters closed, the heavy app named. Never closes a window you're using. Switch on “Fix it by itself” if you like.", try: { label: "Open PC Boost", tab: "settings", id: "settings-boost" } },
  { icon: "⏰", title: "Alarms and day planning", how: "“Wake me at 6:30 every weekday.” A real ringing alarm with Stop and Snooze on your PC, and one tap sets it in your phone's clock. “Plan my day” books the reminders.", try: { label: "Try it", say: "set an alarm for 7am tomorrow" } },
  { icon: "🖼️", title: "Send it a picture", how: "Attach, paste or drop a picture in Chat — or send one on Discord or Telegram — and Izuki looks at it with you.", try: { label: "Open Chat", tab: "chat" } },
  { icon: "📋", title: "Paste another AI's steps", how: "Got step-by-step directions from another AI? Paste them into the chat and Izuki carries them out on your screen." },
  { icon: "✅", title: "“Answer it for me” on the Island", how: "When a question is on your screen, the Island offers Explain, Answer it for me (the answer straight up with a one-line why — it never submits), or Teach me." },
  { icon: "🦸", title: "Comic and flat-art characters", how: "Under Voice orb: skin tone and hair colour in one tap, Comic or Flat art style, head-to-full-body framing, a no-orb mode, and the voice switches to match the character (or keep your own choice).", try: { label: "Pick a look", tab: "settings", id: "settings-look" } },
  { icon: "🛰️", title: "Status screen with Autopilot", how: "A live processor trace, the heaviest apps, and Autopilot: low space, battery, a slow PC, a meeting soon or urgent mail, each with a one-tap fix — or Handle it all.", try: { label: "Show me", say: "wake up" } },
  { icon: "📜", title: "Every answer, kept", how: "With “Keep my last answer on screen”, scroll back through today's answers; the bin icon clears them." },
  { icon: "🦙", title: "Meta Llama, free", how: "Under Brain & AI keys, Groq and NVIDIA have a one-tap “Use Meta Llama 4” — Meta's model, free, and it can see your screen.", try: { label: "Open it", tab: "settings", id: "settings-brain" } },
  { icon: "🔋", title: "Easier on your battery", how: "While Izuki waits for “Hey Nova” in a quiet room, it rests instead of listening hard — and it stops talking the moment you talk over it." },
  { icon: "🛡️", title: "Android TV: Izuki sees the screen", how: "On Google TV, Fire TV or Android TV with the Izuki app: ask “what's on my screen?” or “is this free?”. The Paywall guard tells you when an app wants a subscription — and which apps on your TV are free. It all stays on the TV." },
  { icon: "🟢", title: "Clear command results", how: "In Chat, each command's card is green ✓ when it worked, amber ⚠ when it finished but skipped a few things, and red ✕ only when it really failed. Collapse it, copy the command or the output, or open it full screen.", try: { label: "Open Chat", tab: "chat" } },
  { icon: "📺", title: "Smarter TV", how: "“What apps are on my TV?”, “show me free movie apps”, “is Netflix free?”, and “open YouTube on the TV and search for MrBeast” — straight into the app's search.", try: { label: "Try it", say: "what apps are on my tv" } },
  { icon: "📞", title: "Phone calls that flow", how: "On a phone call Izuki now listens by itself after every reply (no tapping the orb), starts talking as soon as its first sentence is ready, and the words on screen light up in step with its voice." },
  { icon: "🧑‍🚀", title: "Real 3D faces", how: "Four new faces under Voice orb — a hologram woman and man, a woman and a man — made as real 3D models. They breathe, turn to look at your mouse, talk with the voice and react when tapped. Customise skin tone, glow colour, hologram glow, shine, size, height and turn.", try: { label: "Pick one", tab: "settings", id: "settings-look" } },
  { icon: "🪞", title: "Your own face, talking", how: "My face: make a 3D you on avaturn.me (free, a few minutes), then pick the .glb. Your mouth moves with Izuki's voice, your eyes blink and look around. It stays on your device.", try: { label: "Set it up", tab: "settings", id: "settings-look" } },
  { icon: "➕", title: "Add any 3D face", how: "Got a .glb from Tencent Hunyuan3D, Meshy or Sketchfab? Add it under 3D faces — as many as you like." },
  { icon: "📺", title: "Your TV on the status screen", how: "“Wake up” shows what's on your Roku with play/pause, volume, home and What should I watch? Or just ask “what's on my TV?”.", try: { label: "Show me", say: "wake up" } },
  { icon: "🗣️", title: "Change it by asking", how: "“Switch to the hologram woman”, “use my face”, “make your glow pink”, “just your head”, “make your face bigger” — it changes at once.", try: { label: "Try it", say: "switch to the hologram woman" } },
  { icon: "📺", title: "A new Roku screen", how: "A home screen with the time, weather, a greeting and things to try; while Izuki works, the orb moves to the corner and your words and its answer show big. The 3D faces talk on the TV too." },
  { icon: "⬆️", title: "Update the TV from here", how: "Settings → Control my TV: type your Roku's developer password once and press Install on my TV. After that the TV channel updates itself whenever Izuki does.", try: { label: "Set it up", tab: "settings", id: "settings-tv" } },
  { icon: "🧘", title: "Patient, like a person", how: "Izuki opens each app or page once and waits for it — as long as your PC needs (it learns how fast yours is). No more piles of the same window. In a browser it stays in the same tab: it searches right there instead of opening new ones." },
  { icon: "🧰", title: "See every tool it uses", how: "In the Chat tab, each command, search or file it touches shows as a card — what it ran (IN) and what came back (OUT), like a real coding agent. “Show all” opens long output.", try: { label: "Open chat", tab: "chat" } },
  { icon: "📬", title: "It really goes through your email", how: "“What's important in my email?” — Izuki reads the last few days, skips the noise, and tells you the real to-dos: bills with amounts, replies people are waiting on, deliveries, deadlines. Also on the status screen.", try: { label: "Go through it", say: "What's important in my email?" } },
  { icon: "📺", title: "Ask your TV like a person", how: "“Put on something funny for the kids” or “a dinosaur cartoon” — Izuki picks a real title from the apps on your Roku. If it's on more than one, it asks “Disney Plus or Prime Video?” and you just say “Disney”. Misspelled app names work too." },
  { icon: "🏝️", title: "A fuller Island", how: "One-tap tiles: 5-minute timer, Focus, Read this, Explain my screen, your Later list and email. Been reading one page for a few minutes? It offers to sum it up." },
  { icon: "🎛️", title: "A smarter status screen", how: "“Wake up” now shows INBOX — WHAT MATTERS (tap one for help with it) and more one-tap buttons; apps you haven't signed in to are left out.", try: { label: "Show me", say: "wake up" } },
  { icon: "🧩", title: "The browser extension got smart", how: "Right-click any text → Izuki: Explain, Translate, Sum up, Read aloud, Save to Notes, Remind me later. Alt+Shift+I asks about the page. And a Focus guard during Focus mode.", try: { label: "Get it", tab: "settings", id: "settings-extension" } },
  { icon: "🔊", title: "Read it to me", how: "Select text anywhere and say “read this to me” — or just ask with a page open. “Keep reading” carries on.", try: { label: "Read this", say: "read this to me" } },
  { icon: "🎙️", title: "Talk to type, anywhere", how: "Say “type what I say”, click into any text box and talk — commas, full stops and new lines included. “Stop typing” ends it." },
  { icon: "📊", title: "Screen time", how: "“How long was I on YouTube today?” — minutes per app and site, names only, on this PC.", try: { label: "My screen time", say: "what's my screen time today" } },
  { icon: "🌤️", title: "The weather, everywhere", how: "On the Island, the status screen, the phone and the TV — set your town under Talk to Izuki.", try: { label: "Set my town", tab: "draw", id: "talk-card" } },
  { icon: "⏱️", title: "Timers on the Island", how: "“Set a pasta timer for 12 minutes” — it counts down on the Island and tells you when it's done. Several at once.", try: { label: "5-minute timer", say: "set a timer for 5 minutes" } },
  { icon: "⬇️", title: "Downloads, screenshots & charging", how: "Finished downloads get Open, Sum it up (documents), Install (apps) or Unzip. Screenshots get Copy the text — and Fix, Explain or Translate when that fits. Plus a glance at the battery when you plug in." },
  { icon: "📋", title: "Recent copies", how: "Open the Island to copy any of your last few copies again." },
  { icon: "💬", title: "The chat shows its work", how: "Type “allow” to approve, Auto really skips asking, and it can't say “On it” and do nothing anymore." },
  { icon: "🗿", title: "A more lifelike hologram face", how: "A real face's oval, a neck, finer detail, a glowing outline and a scan sweep.", try: { label: "Pick it", tab: "settings", id: "settings-look" } },
  { icon: "🎯", title: "Focus mode", how: "Say “focus for 25 minutes”: a countdown on the Island, nothing but urgent things get through, and a catch-up when time's up.", try: { label: "Focus 25 min", say: "focus for 25 minutes" } },
  { icon: "📋", title: "Smart clipboard", how: "Copy a foreign sentence, a link, an address, code or an error — the Island offers Translate, Sum up, Directions, Explain or Fix. Nothing's sent unless you tap." },
  { icon: "🕰️", title: "Recall", how: "Turn it on and ask “what was that site I was on this morning?”. Only window titles, a week, this PC only — never private windows.", try: { label: "Turn on", tab: "draw", id: "talk-card" } },
  { icon: "📺", title: "TV requests go to the TV", how: "A hidden bug sent “open Netflix on the TV” to your PC since 1.0.34 — fixed for good, with a check so it can't come back." },
  { icon: "🧹", title: "Smoother on websites", how: "Pop-ups are closed once and then ignored, so tasks don't get stuck on them; the browser extension reconnects by itself after an update." },
  { icon: "✍️", title: "Writes like a person", how: "Notes, messages and posts come out in plain everyday words and short sentences — ask for formal when you want it." },
  { icon: "🎯", title: "Fewer wrong taps", how: "Izuki asks “Did you mean…?” when it isn't sure what you said, closes anything it opened by mistake, and sticks to the task." },
  { icon: "⬆️", title: "Phone & TV apps update themselves", how: "The Android phone and TV apps now show “Update Izuki” when there's a new version — one press. (If you installed an older one, uninstall it once first.)" },
  { icon: "🛡️", title: "Ask or Auto in the chat", how: "The Chat tab has the Ask / Auto switch now: Ask waits for your Allow; Auto runs it and still shows each step.", try: { label: "Open chat", tab: "chat" } },
  { icon: "⚡", title: "Faster replies", how: "Brains that are out of credits are skipped for hours, stuck apps give up sooner, and the status screen's buttons react the moment you tap them." },
  { icon: "🔎", title: "Apps read what their connections can't", how: "LinkedIn notifications, an Instagram feed and more: Izuki opens the page in its signed-in browser and reads it for you." },
  { icon: "🧭", title: "A fuller Quick setup", how: "A Back button, a progress bar, and TV, phone & TV link, the extension, buddy mode and colours — all from one place." },
  { icon: "🎛️", title: "A status screen you can use", how: "Say “wake up”: live CPU, memory, battery and network; tap a gauge, an email, a meeting or an app to ask about it; music controls; your Later list; and an Ask bar with one-tap actions.", try: { label: "Show me", say: "wake up" } },
  { icon: "🎯", title: "Catches its own misclicks", how: "If a click slips onto the taskbar and opens Search or Start by mistake, Izuki closes it and aims again." },
  { icon: "📺", title: "Izuki TV — full control of your TV", how: "On Android TV, Google TV and Fire TV: a big-screen Izuki that opens any app, plays and pauses, changes the volume, and reads what's on the TV to press, search and pick shows for you. Say “Hey Nova” or hold OK on the remote. A small orb floats over Netflix while it listens.", try: { label: "Set up my TV", tab: "settings", id: "settings-tv" } },
  { icon: "🔗", title: "One setup for everything", how: "Link your phone or TV to this PC (Settings → Control my TV → “Let my phone and TV link”). Press Allow here and it copies your AI keys, connected apps and memories — then it works on its own, even when this PC is off.", try: { label: "Turn it on", tab: "settings", id: "settings-tv" } },
  { icon: "🗒️", title: "Later list", how: "“Remind me later I'm buying Scrubbing Bubbles and Sensodyne.” No time needed — it lands on your Later list (in the Chat tab), and Izuki brings it up when you're back, in the morning and before the shops close. “I got the toothpaste” ticks it off.", try: { label: "Try it", say: "what's on my list?" } },
  { icon: "🔊", title: "Izuki talks from the TV", how: "With the Izuki screen open on a Roku, Izuki's voice comes from the TV speakers — and the TV orb has its own looks, including Aurora and Nebula.", try: { label: "Choose", tab: "settings", id: "settings-tv" } },
  { icon: "🫶", title: "Izuki speaks up by itself", how: "Buddy mode: an important email (a job, money, a deadline), a meeting soon, low battery, the internet dropping — said out loud, and “welcome back” with what you missed. Important things reach your phone while you're away.", try: { label: "Choose", tab: "draw", id: "talk-card" } },
  { icon: "🧠", title: "Answers in the background", how: "Ask “how many GB is Zoom?” or “which apps don't I use?” and Izuki checks quietly and just tells you — no windows opened. Say “while I watch” to see it done on screen.", try: { label: "Try it", say: "how much free space is on my PC?" } },
  { icon: "✅", title: "Proof check", how: "After every change (uninstall, install, delete, close an app) Izuki looks again and shows “✓ Checked: Zoom is no longer installed” before saying it's done. It also catches itself if it ever claims something it didn't do." },
  { icon: "💬", title: "One clean reply in the chat", how: "Each job is one message: the steps it took, then the answer — with a live status line, Copy, Read aloud and Again, tidy lists and code boxes. Quick checks run without asking." },
  { icon: "📺", title: "Samsung & LG TVs too", how: "“Open Netflix on the TV”, “turn the TV up”, “pause the TV” — Roku, Samsung and LG over your Wi-Fi. Press Allow on the TV the first time.", try: { label: "Set up my TV", tab: "settings", id: "settings-tv" } },
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
      data-tauri-drag-region
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
