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
  { label: "Orb & appearance", hint: "Orb Studio, clear water, star crystal, tidal pearl, liquid, motion, captions and colours", tab: "settings", id: "settings-look" },
  { label: "Window & battery", hint: "Glass backdrop, background and power", tab: "settings", id: "settings-system" },
  { label: "Keyboard shortcuts", hint: "Hotkeys and voice commands", tab: "settings", id: "settings-shortcuts" },
  { label: "Phone companion", hint: "Android, iPhone, Siri and PC pairing", tab: "settings", id: "settings-phone" },
  { label: "Discord & reminders", hint: "Notifications and alerts", tab: "settings", id: "settings-discord" },
  { label: "App updates", hint: "Download the newest installer", tab: "settings", id: "settings-updates" },
  { label: "Control my TV", hint: "Roku, Netflix, volume, the Izuki TV channel, Android TV", tab: "settings", id: "settings-tv" },
  { label: "Read it to me", hint: "Read aloud, read this page, read the selected text, keep reading", tab: "draw", id: "talk-card" },
  { label: "Talk to type (dictation)", hint: "Type what I say, dictate, voice typing, stop typing", tab: "draw", id: "talk-card" },
  { label: "Screen time & weather", hint: "How long on YouTube, time spent, weather, your town or city", tab: "draw", id: "talk-card" },
  { label: "Timers", hint: "Set a timer, pasta timer, countdown, cancel the timer, how long left", tab: "draw", id: "talk-card" },
  { label: "Focus mode", hint: "Focus for 25 minutes, pomodoro, countdown, do not disturb", tab: "draw", id: "talk-card" },
  { label: "Recall: what was on my screen", hint: "What was that site, what was I doing, history, timeline, privacy", tab: "draw", id: "talk-card" },
  { label: "Later list", hint: "Remind me later, shopping list, don't let me forget, tick off", tab: "chat" },
  { label: "Link phone & TV to this PC", hint: "One setup for everything — copy keys, apps and memories; Izuki TV; talk from the TV; TV orb", tab: "settings", id: "settings-tv" },
  { label: "Buddy mode: speak up by itself", hint: "Important emails, meetings, low battery, internet down, welcome back, break reminders, battery saver", tab: "draw", id: "talk-card" },
  { label: "Talk: Hey Nova or hold a key", hint: "Wake word, hold-to-talk, strictness, voice, language, Island, music mode, keep answer", tab: "draw", id: "talk-card" },
  { label: "Browser extension", hint: "Chrome, Edge, exact clicks on web pages, links", tab: "settings", id: "settings-extension" },
  { label: "Nova Notes", hint: "Study notes from your screen, flashcards, quiz me, summarise", tab: "notes" },
  { label: "App colours", hint: "Theme, background colour, auto by time of day, your own colour", tab: "settings", id: "settings-theme" },
  { label: "New orbs", hint: "Stardust, ferrofluid, hologram face, pure water, music, orb style", tab: "settings", id: "settings-look" },
  { label: "3D faces", hint: "3D face, hologram woman, hologram man, avatar, my face, avaturn, glb, upload face, character, skin, glow", tab: "settings", id: "settings-look" },
  { label: "Update the TV channel", hint: "Roku, update TV, install on my TV, developer password, channel version", tab: "settings", id: "settings-tv" },
];

/** Features matching what's typed (every word must appear), best first. */
export function findFeatures(query: string, max = 8): Feature[] {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  return FEATURES.filter((f) => terms.every((t) => `${f.label} ${f.hint}`.toLowerCase().includes(t)))
    .sort((a, b) => Number(b.label.toLowerCase().includes(terms[0])) - Number(a.label.toLowerCase().includes(terms[0])))
    .slice(0, max);
}

/** Open a feature: its tab, then scroll to it once it's drawn. */
export function openFeature(feature: Feature, setTab: (t: TabId) => void) {
  setTab(feature.tab);
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
  const terms = query.trim().toLowerCase().split(/\s+/);
  const results = FEATURES.filter(f => terms.every(t => `${f.label} ${f.hint}`.toLowerCase().includes(t)));
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
