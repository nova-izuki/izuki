import { useEffect, useRef, useState } from "react";
import { Search, ArrowUpRight, X } from "lucide-react";
import { useIzuki, type TabId } from "../lib/store";

const FEATURES: { label: string; hint: string; tab: TabId; id?: string }[] = [
  { label: "Chat with Izuki", hint: "Conversation, files and voice", tab: "chat" },
  { label: "Connected apps", hint: "Search accounts, email, socials and integrations", tab: "apps" },
  { label: "Draw on your screen", hint: "Point, annotate and give a screen task", tab: "draw" },
  { label: "Saved flows", hint: "Find, run and organise your workflows", tab: "flows" },
  { label: "Watchers", hint: "Screen changes and background checks", tab: "watchers" },
  { label: "Brain & AI keys", hint: "Models, providers and local Ollama", tab: "settings", id: "settings-brain" },
  { label: "Screen control", hint: "Jarvis precision, mouse, approval and clicking", tab: "settings", id: "settings-execution" },
  { label: "Orb & appearance", hint: "Orb Studio, clear water, star crystal, tidal pearl, liquid, motion, captions and colours", tab: "settings", id: "settings-look" },
  { label: "Window & battery", hint: "Glass backdrop, background and power", tab: "settings", id: "settings-system" },
  { label: "Keyboard shortcuts", hint: "Hotkeys and voice commands", tab: "settings", id: "settings-shortcuts" },
  { label: "Phone companion", hint: "Android, iPhone, Siri and PC pairing", tab: "settings", id: "settings-phone" },
  { label: "Discord & reminders", hint: "Notifications and alerts", tab: "settings", id: "settings-discord" },
  { label: "App updates", hint: "Download the newest installer", tab: "settings", id: "settings-updates" },
];

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
