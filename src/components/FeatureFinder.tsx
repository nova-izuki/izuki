import { matchScore, searchTerms } from "../lib/search";
import { requestStyleSection } from "../lib/styleNav";
import { useEffect, useRef, useState } from "react";
import { Search, ArrowUpRight, X } from "lucide-react";
import { useIzuki, type TabId } from "../lib/store";

export type Feature = { label: string; hint: string; tab: TabId; id?: string };
export const FEATURES: Feature[] = [
  { label: "2D characters", hint: "character, cartoon, comic, spider-verse, flat vector, full body, half body, voice character, dre, nia, avatar", tab: "settings", id: "settings-look" },
  { label: "Voice & accent", hint: "voice, accent, character voice, male, female, dre, nia, british, nigerian, speak responses", tab: "draw", id: "draw-voice" },
  { label: "Chat with Izuki", hint: "Conversation, files and voice", tab: "chat" },
  { label: "Connected apps", hint: "Search accounts, email, socials and integrations", tab: "apps" },
  { label: "Draw on your screen", hint: "Point, annotate and give a screen task", tab: "draw" },
  { label: "Saved flows", hint: "Find, run and organise your workflows", tab: "flows" },
  { label: "Watchers", hint: "Screen changes and background checks", tab: "watchers" },
  { label: "On its own", hint: "skip youtube ads, reject cookie banners automatically", tab: "settings", id: "settings-autonomous" },
  { label: "Brain & AI keys", hint: "Models, providers and local Ollama", tab: "settings", id: "settings-brain" },
  { label: "Screen control", hint: "Jarvis precision, mouse, approval and clicking", tab: "settings", id: "settings-execution" },
  { label: "Why it asks before some buttons", hint: "why does it keep asking me, confirm, are you sure, it won't click submit, send, pay, delete, share, invite, password, it won't type my password, final buttons, approval, permission", tab: "settings", id: "settings-execution" },
  { label: "It clicked the wrong thing / didn't click", hint: "wrong button, misclick, clicked nothing, it does nothing, stuck, keeps looking again, goes in circles, repeating itself, slow to click, scroll not working, cant click the x, close button", tab: "settings", id: "settings-execution" },
  { label: "Looks", hint: "amber, aurora, deep sea, deepsea, lavender, obsidian, synthwave, sunset, ocean, matrix, arctic, galaxy, dune, theme, wallpaper, accent colour, color, dark mode, light mode, taskbar colour, title bar colour, nova, midnight, ember, forest, sakura, paper, focus, translucenttb, transparency, undo look", tab: "style", id: "style-looks" },
  { label: "Auto looks (day & night, shuffle)", hint: "auto change theme, wallpaper changes by itself, day night, dark at night, light in the day, shuffle looks, rotate wallpaper, every hour", tab: "style", id: "style-auto" },
  { label: "Windows tweaks", hint: "windhawk, taskbar left, hide taskbar, seconds on clock, end task, classic right-click menu, file extensions, hidden files, dark mode, transparency, task view, search box, widgets, app names, never combine, desktop icons, this pc, recycle bin, cursor, black cursor, big cursor, animations, gamer, game dvr, sticky keys, menus, startup delay, ads, tips, privacy, advertising id, open to this pc, checkboxes, full path, shortcut", tab: "style", id: "style-tweaks" },
  { label: "Island look", hint: "windhawk, island style, glass, bubble, squircle, neon outline, aero, classic", tab: "draw", id: "draw-talk" },
  { label: "Glowing screen edges", hint: "edge glow, screen glow, border light, apple intelligence, siri glow, glow only, hide orb, hide character", tab: "settings", id: "settings-look" },
  { label: "Orb & appearance", hint: "Orb Studio, clear water, star crystal, tidal pearl, liquid, motion, captions and colours", tab: "settings", id: "settings-look" },
  { label: "Window & battery", hint: "Glass backdrop, background and power", tab: "settings", id: "settings-system" },
  { label: "Keyboard shortcuts", hint: "Hotkeys and voice commands", tab: "settings", id: "settings-shortcuts" },
  { label: "Phone companion", hint: "Android, iPhone, Siri and PC pairing", tab: "settings", id: "settings-phone" },
  { label: "Discord & reminders", hint: "Notifications and alerts", tab: "settings", id: "settings-discord" },
  { label: "App updates", hint: "Download the newest installer", tab: "settings", id: "settings-updates" },
  { label: "Control my TV", hint: "Roku, Netflix, volume, the Izuki TV channel, Android TV", tab: "settings", id: "settings-tv" },
  { label: "Read it to me", hint: "Read aloud, read this page, read the selected text, keep reading", tab: "draw", id: "talk-card" },
  { label: "Talk to type (dictation)", hint: "Type what I say, dictate, voice typing, stop typing", tab: "draw", id: "talk-card" },
  { label: "Screen time & weather", hint: "How long on YouTube, time spent, weather, your town or city, learn my city from chat, remember my city, my location, where I am, wrong city, it thinks I'm in london, change my city", tab: "draw", id: "talk-card" },
  { label: "Timers", hint: "Set a timer, pasta timer, countdown, cancel the timer, how long left", tab: "draw", id: "talk-card" },
  { label: "Focus mode", hint: "Focus for 25 minutes, pomodoro, countdown, do not disturb", tab: "draw", id: "talk-card" },
  { label: "Recall: what was on my screen", hint: "What was that site, what was I doing, history, timeline, privacy", tab: "draw", id: "talk-card" },
  { label: "Later list", hint: "Remind me later, shopping list, don't let me forget, tick off", tab: "chat" },
  { label: "Link phone & TV to this PC", hint: "One setup for everything — copy keys, apps and memories; Izuki TV; talk from the TV; TV orb", tab: "settings", id: "settings-tv" },
  { label: "Buddy mode: speak up by itself", hint: "Important emails, meetings, low battery, internet down, welcome back, break reminders, battery saver", tab: "draw", id: "talk-card" },
  { label: "Talk: Hey Nova or hold a key", hint: "Wake word, hold-to-talk, strictness, voice, language, Island, music mode, keep answer", tab: "draw", id: "talk-card" },
  { label: "Answer with ChatGPT, Gemini or any AI", hint: "side panel, chatgpt, gemini, claude, copilot, perplexity, grok, deepseek, le chat, mistral, comet, browser assistant, connect, ask the page, use my own ai, my subscription, tab on the side, beside the page", tab: "settings", id: "settings-browser" },
  { label: "Follow the questions on a page", hint: "auto question, follow questions, it sees the question, quiz help, homework help, sends it for me, side panel, without retyping", tab: "settings", id: "settings-browser" },
  { label: "Run a task from the browser", hint: "run with izuki, hand it to my pc, download the project, open word, lab assignment, do it on my pc, review and run, task from the panel", tab: "settings", id: "settings-browser" },
  { label: "Browser extension", hint: "Chrome, Edge, exact clicks on web pages, links", tab: "settings", id: "settings-extension" },
  { label: "Missions (Rest mode)", hint: "Things to do while I'm away, start them when I'm away, every morning, try again, save the result to notes", tab: "draw", id: "draw-missions" },
  { label: "Hold a key and talk to type anywhere", hint: "dictate, dictation, wispr, wispr flow, voice typing, talk to type, type what I say, speech to text, write for me, Ctrl+Alt+Space, Ctrl+Shift+Space, type into any app, email, whatsapp, word", tab: "settings", id: "settings-shortcuts" },
  { label: "Only answer my voice (Hey Nova)", hint: "voice match, voice recognition, speaker, enroll my voice, teach it my voice, siri voice training, hey google voice match, only me, multiple people, stop the TV waking it", tab: "draw", id: "talk-card" },
  { label: "Izuki writes code for you", hint: "coding agent, devin, write code, fix a bug in my project, build it for me, claude code, cursor, apply, discard, undo, worktree, run my tests", tab: "chat" },
  { label: "Write down a Zoom call or class", hint: "record a call, zoom, teams, google meet, webinar, online class, transcribe a meeting, take notes on a call, I don't want to pay attention, lecture recording", tab: "notes", id: "notes-capture" },
  { label: "Notes from a lecture video", hint: "youtube lecture, take notes on this video, professor's video, captions, transcript, timestamps", tab: "notes", id: "notes-capture" },
  { label: "Link notes to each other", hint: "notion, backlinks, linked notes, [[chapter 5]], see also, related notes, same chapter, wiki links, second brain", tab: "notes" },
  { label: "What should I revise today?", hint: "spaced repetition, flashcards due, review, anki, leitner, cards gone cold, revise, practise my cards, what do I keep forgetting", tab: "notes" },
  { label: "Catch me up on a subject", hint: "what chapters am I missing, gaps in my notes, where am I up to, how far am I, chapter 1 to now", tab: "notes" },
  { label: "Your notes on your phone", hint: "notes on my phone, read notes away from my PC, quiz me on my phone, phone notes, study on the bus", tab: "settings", id: "settings-phone" },
  { label: "Drive mode (in the car)", hint: "car, carplay, android auto, driving, navigate, take me to, gas near me, hands free in the car, jarvis, tesla, road trip, speed", tab: "settings", id: "settings-phone" },
  { label: "Cancel a reminder", hint: "cancel reminder, stop reminding me, turn off my alarm, delete a reminder, cancel check in with, remove alarm", tab: "chat" },
  { label: "A spare free brain (stop the waiting)", hint: "slow, waiting, rate limit, too many requests, busy, free tier, second key, groq, add another key, why is it slow", tab: "settings", id: "settings-brain" },
  { label: "Izuki Notes", hint: "My notes, Nova notes, study notes from your screen, flashcards, quiz me, summarise", tab: "notes" },
  { label: "Study log", hint: "Save every question and answer to my notes, explain so I can learn later, study diary", tab: "notes", id: "notes-capture" },
  { label: "Textbooks", hint: "PDF textbook, explain chapter 4, page 87, quiz me on section, where does the book talk about", tab: "notes", id: "notes-campus" },
  { label: "Blackboard grades & announcements", hint: "My grades, grade in biology, announcements, course materials, syllabus, slides", tab: "notes", id: "notes-campus" },
  { label: "Study progress & mistakes", hint: "What have I studied this week, what do I keep getting wrong, practise my mistakes, flashcards", tab: "notes", id: "notes-campus" },
  { label: "Empire: your business", hint: "Business, website check, is my site down, what needs my attention, briefing", tab: "apps", id: "apps-empire" },
  { label: "Money: bank statement, spending, subscriptions", hint: "How much did I spend, unusual spending, double charge, subscriptions, budget, CSV, bank, watchlist, stocks, Stripe, Shopify, sales, orders, low stock", tab: "apps", id: "apps-money" },
  { label: "Your writing style", hint: "Write like me, tone of my emails, casual, professional, no emojis, sign off", tab: "apps", id: "apps-style" },
  { label: "Quiet hours", hint: "Do not disturb at night, silence notifications, sleep, hold heads-ups", tab: "apps", id: "apps-headsups" },
  { label: "App colours", hint: "Theme, background colour, auto by time of day, your own colour", tab: "settings", id: "settings-theme" },
  { label: "New orbs", hint: "Stardust, ferrofluid, hologram face, pure water, music, orb style", tab: "settings", id: "settings-look" },
  { label: "3D faces", hint: "3D face, hologram woman, hologram man, avatar, my face, avaturn, glb, upload face, character, skin, glow", tab: "settings", id: "settings-look" },
  { label: "Update the TV channel", hint: "Roku, update TV, install on my TV, developer password, channel version", tab: "settings", id: "settings-tv" },
];

/** Features matching what's typed, best first.
 *
 *  `loose` is for the search box, where nothing at all is the worst answer:
 *  it falls back to the closest matches instead of an empty list. The command
 *  box leaves it off, so a command like "open spotify" doesn't pull up
 *  half-related settings while someone is typing it. */
export function findFeatures(query: string, max = 8, loose = false): Feature[] {
  const terms = searchTerms(query);
  if (!terms.length) return [];
  const scored = FEATURES.map((f) => ({
    f,
    hits: matchScore(terms, `${f.label} ${f.hint}`),
    // A match in the feature's own name beats one buried in its keywords.
    named: Number(f.label.toLowerCase().includes(terms[0])),
  }))
    .filter((s) => s.hits > 0);
  const best = Math.max(...scored.map((s) => s.hits), 1);
  return scored.filter((s) => {
      // Loosely: the closest matches, and anything within one word of them —
      // "change the theme" should list Looks as well as Auto looks.
      return s.hits >= (loose ? Math.max(best - 1, 1) : terms.length);
    })
    .sort((a, b) => b.hits - a.hits || b.named - a.named)
    .slice(0, max)
    .map((s) => s.f);
}

/** Open a feature: its tab, then scroll to it once it's drawn. */
export function openFeature(feature: Feature, setTab: (t: TabId) => void) {
  setTab(feature.tab);
  requestStyleSection(feature.id);
  if (!feature.id) return;
  let tries = 0;
  const look = () => {
    const target = document.getElementById(feature.id!);
    if (target) { target.scrollIntoView({ block: "start", behavior: "smooth" }); return; }
    if (tries++ < 30) setTimeout(look, 60);
  };
  setTimeout(look, 30);
}

/** Local navigation only: searching never calls an AI or spends credits. */
export function FeatureFinder() {
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const setTab = useIzuki(s => s.setTab);
  const pending = useRef<MutationObserver | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const open = () => { setQuery(""); dialog.current?.showModal(); input.current?.focus(); };
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k" && !e.altKey && !e.shiftKey) {
        e.preventDefault(); open();
      }
    };
    window.addEventListener("keydown", key);
    return () => { window.removeEventListener("keydown", key); pending.current?.disconnect(); clearTimeout(timer.current); };
  }, []);
  const go = (feature: typeof FEATURES[number]) => {
    dialog.current?.close();
    pending.current?.disconnect(); clearTimeout(timer.current);
    setTab(feature.tab);
    if (!feature.id) return;
    const focus = () => {
      const target = document.getElementById(feature.id!);
      if (!target) return false;
      target.scrollIntoView({ block: "start", behavior: "instant" });
      target.setAttribute("tabindex", "-1"); target.focus({ preventScroll: true });
      pending.current?.disconnect(); clearTimeout(timer.current);
      return true;
    };
    if (focus()) return;
    // Tab transitions mount asynchronously. Observe that mount, don't poll.
    pending.current = new MutationObserver(focus);
    pending.current.observe(document.body, { childList: true, subtree: true });
    timer.current = setTimeout(() => pending.current?.disconnect(), 2000);
  };
  const results = findFeatures(query, 10, true);
  return <>
    <button type="button" className="izk-finder-trigger" onClick={open} aria-label="Find a feature (Ctrl+K)">
      <Search size={14} /><span>Find anything in Izuki</span><kbd>Ctrl K</kbd>
    </button>
    <dialog ref={dialog} className="izk-finder" aria-label="Find a feature" onClick={e => { if (e.target === dialog.current) dialog.current.close(); }}>
      <div className="izk-finder-heading"><Search size={18} />
        <input ref={input} aria-label="Search features" placeholder="Apps, screen control, phone, orb…" value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && results[0]) { e.preventDefault(); go(results[0]); } }} />
        <button type="button" aria-label="Close feature search" onClick={() => dialog.current?.close()}><X size={18} /></button>
      </div>
      <div className="izk-finder-results">
        {results.map(f => <button type="button" key={f.label} onClick={() => go(f)}><span><strong>{f.label}</strong><small>{f.hint}</small></span><ArrowUpRight size={15} /></button>)}
        {!results.length && <p>No feature matches. Try “phone”, “apps” or “screen”.</p>}
      </div>
      <p className="izk-finder-foot">Search stays on your device · Tab to browse · Enter to open</p>
    </dialog>
  </>;
}
