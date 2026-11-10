import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { api, type AccountHealth, type ActionEntry, type MyDataSummary } from "../lib/ipc";
import { useIzuki, type TabId } from "../lib/store";
import { jumpTo } from "./JumpBar";
import { Badge, Section, Toggle, cx } from "./ui";
import type { Settings } from "../lib/types";

/** Jump to a card elsewhere in the app (switching tab first when needed). */
function useGoTo() {
  const setTab = useIzuki((s) => s.setTab);
  return (id: string, tab?: TabId) => {
    if (tab) setTab(tab);
    // The tab draws first; then the card is there to scroll to.
    window.setTimeout(() => jumpTo(id), tab ? 120 : 0);
  };
}

type AccessRow = {
  icon: string;
  label: string;
  /** What it means, plainly: what's used, where it goes. */
  detail: string;
  /** A switch for it… */
  on?: boolean;
  set?: (v: boolean) => void;
  /** …or a state to read, and where to change it. */
  status?: ReactNode;
  manage?: { id: string; tab?: TabId };
};

/** How many keys are saved, by name (never the keys themselves). */
function savedKeys(s: Settings): string[] {
  const names: string[] = s.providers.filter((p) => p.api_key.trim()).map((p) => p.label || p.id);
  const more: Array<[string, string]> = [
    ["Groq voice", s.groq_api_key],
    ["Azure voice", s.azure_speech_key],
    ["ElevenLabs", s.elevenlabs_key],
    ["Composio (connected apps)", s.composio_api_key],
    ["Telegram", s.telegram_token],
    ["Discord", s.discord_token],
    ["Stripe", s.stripe_key],
    ["Shopify", s.shopify_token],
    ["n8n", s.n8n_api_key],
  ];
  for (const [name, v] of more) if (v?.trim()) names.push(name);
  return names;
}

/**
 * "What Izuki can access": every way Izuki reaches your PC, your accounts
 * and the internet, in one list, each with its switch (or where to change
 * it). Nothing here is new access: it's the same settings, gathered.
 */
export function AccessCard() {
  const settings = useIzuki((s) => s.settings);
  const patch = useIzuki((s) => s.patchSettings);
  const goTo = useGoTo();
  const [accounts, setAccounts] = useState<AccountHealth | null>(null);
  const [ext, setExt] = useState<{ connected: boolean } | null>(null);

  useEffect(() => {
    let alive = true;
    void api.accountsHealth(false).then((a) => alive && setAccounts(a)).catch(() => undefined);
    void api.extInfo().then((e) => alive && setExt(e)).catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);

  const keys = useMemo(() => savedKeys(settings), [settings]);
  const linked = accounts?.apps.flatMap((a) => a.accounts.map((x) => `${a.name}${x.who ? ` (${x.who})` : ""}`)) ?? [];

  const groups: Array<{ title: string; rows: AccessRow[] }> = [
    {
      title: "Hears and sees",
      rows: [
        { icon: "🎙️", label: "Listens for “Hey Izuki”", detail: "The wake word is heard on this PC. Nothing leaves it until you talk to Izuki; the talk key works either way.", on: settings.voice_wake_enabled, set: (v) => patch({ voice_wake_enabled: v }) },
        { icon: "☁️", label: "Sharper hearing", detail: "Sends what you say to Google Gemini or Groq to turn it into text. Off: understood on this PC only.", on: settings.cloud_ears, set: (v) => patch({ cloud_ears: v }) },
        { icon: "🖥️", label: "Your screen", detail: "A picture of your screen goes to the AI you chose, only when you ask Izuki to look or do something on it.", status: <Badge tone="good">Only when you ask</Badge>, manage: { id: "settings-brain" } },
        { icon: "🕘", label: "Recall", detail: "Notes the titles of windows you had open, on this PC for a week, so “what was that site this morning?” works. Never private or sign-in windows.", on: settings.recall_enabled, set: (v) => patch({ recall_enabled: v }) },
        { icon: "⏱️", label: "Screen time", detail: "Counts minutes per app and big site (names only, this PC, two weeks).", on: settings.screen_time_enabled, set: (v) => patch({ screen_time_enabled: v }) },
        { icon: "📷", label: "Camera (Hand and Eye control)", detail: "Your camera, on this PC only, while Hand or Eye control is on. No picture is saved or sent.", on: settings.air_enabled, set: (v) => (v ? void api.airArm().catch(() => undefined).finally(() => patch({ air_enabled: true })) : patch({ air_enabled: false })), manage: { id: "settings-air" } },
      ],
    },
    {
      title: "Your phone",
      rows: [
        { icon: "📱", label: "Phone controls this PC", detail: "Your linked phone can move the mouse and type here. Each action is logged; Izuki shows a badge while it's in use.", on: settings.phone_remote, set: (v) => patch({ phone_remote: v }), manage: { id: "settings-phone" } },
        { icon: "⌨️", label: "Phone terminal", detail: "Your linked phone can run commands on this PC.", on: settings.phone_terminal, set: (v) => patch({ phone_terminal: v }), manage: { id: "settings-phone" } },
        { icon: "📞", label: "Call Izuki", detail: "Opens a private link (through Cloudflare) so your phone can talk to Izuki on this PC.", on: settings.call_enabled, set: (v) => patch({ call_enabled: v }), manage: { id: "settings-phone" } },
      ],
    },
    {
      title: "Accounts and keys",
      rows: [
        {
          icon: "📧",
          label: "Connected accounts",
          detail: linked.length ? `Linked through Composio: ${linked.join(", ")}. Izuki only reads them when you ask, and sends nothing without your yes.` : "None linked. Gmail, Calendar and the rest link through Composio, and only when you add them.",
          status: <Badge tone={linked.length ? "accent" : "neutral"}>{accounts ? `${linked.length} linked` : "Checking…"}</Badge>,
          manage: { id: "apps-health", tab: "apps" },
        },
        { icon: "🔔", label: "Email heads-ups", detail: "Reads new email in your linked Gmail to tell you what needs you.", on: settings.heads_up_email, set: (v) => patch({ heads_up_email: v }) },
        { icon: "📅", label: "Calendar heads-ups", detail: "Reads your linked calendar to remind you before things start.", on: settings.heads_up_calendar, set: (v) => patch({ heads_up_calendar: v }) },
        { icon: "🧩", label: "Browser extension", detail: "Lets Izuki read and act inside the web page you're on, in your own browser.", status: <Badge tone={ext?.connected ? "good" : "neutral"}>{ext ? (ext.connected ? "Connected" : "Not connected") : "Checking…"}</Badge>, manage: { id: "settings-browser" } },
        { icon: "🔑", label: "Saved keys", detail: keys.length ? `${keys.join(", ")}. Kept in your Izuki folder on this PC, sent only to their own service (always encrypted, or to this PC).` : "No keys saved.", status: <Badge tone="neutral">{keys.length}</Badge>, manage: { id: "settings-brain" } },
      ],
    },
    {
      title: "Shares",
      rows: [
        { icon: "🐞", label: "Bug reports", detail: "When something breaks, a report with keys, emails, numbers and your name removed. Off: nothing is reported.", on: settings.send_bug_reports, set: (v) => patch({ send_bug_reports: v }) },
        { icon: "📝", label: "Keep a list of what Izuki does", detail: "“What Izuki did”, below: on this PC for two weeks, never what was typed.", on: settings.keep_activity, set: (v) => patch({ keep_activity: v }) },
      ],
    },
  ];

  return (
    <Section id="settings-access" title="What Izuki can access" group="Privacy" foldable hint="Every way Izuki reaches your PC, your accounts and the internet, in one place. Switch anything off here.">
      <div className="flex flex-col gap-3">
        {groups.map((g) => (
          <div key={g.title}>
            <p className="mb-1.5 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-izk-muted">{g.title}</p>
            <ul className="flex flex-col divide-y divide-white/[0.06] overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025]">
              {g.rows.map((r) => (
                <li key={r.label} className="flex items-start gap-2.5 px-3 py-2.5">
                  <span aria-hidden className="mt-[1px] text-[15px] leading-none">{r.icon}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[12.5px] font-semibold text-izk-ink">{r.label}</span>
                    <span className="mt-0.5 block text-[11px] leading-snug text-izk-muted">{r.detail}</span>
                    {r.manage && (
                      <button type="button" onClick={() => goTo(r.manage!.id, r.manage!.tab)} className="izk-no-drag mt-1 text-[10.5px] font-medium text-izk-teal hover:underline">
                        Change it →
                      </button>
                    )}
                  </span>
                  <span className="shrink-0 pt-0.5">{r.set ? <Toggle checked={!!r.on} onChange={r.set} /> : r.status}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}

const KIND_ICON: Record<string, string> = { screen: "🖱️", apps: "🚀", style: "🎨", files: "🗂️", messages: "✉️", phone: "📱", system: "⚙️" };

/** "Today", "Yesterday", or "Mon 9 Nov" for a day like "2026-11-09". */
function dayName(day: string): string {
  const [y, m, d] = day.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const today = new Date();
  const start = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diff = Math.round((start(today) - start(date)) / 86_400_000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return date.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
}

/**
 * "What Izuki did": everything Izuki did or changed on this PC, newest
 * first, day by day (actlog.rs). Kept two weeks on this PC; never what was
 * typed. "Clear the list" empties it.
 */
export function ActivityCard() {
  const keep = useIzuki((s) => s.settings.keep_activity);
  const [days, setDays] = useState<string[]>([]);
  const [day, setDay] = useState("");
  const [list, setList] = useState<ActionEntry[] | null>(null);
  const [kind, setKind] = useState("all");
  const [confirmClear, setConfirmClear] = useState(false);
  const [error, setError] = useState("");
  const asked = useRef(0);

  const load = (which?: string) => {
    const n = ++asked.current;
    setError("");
    void api
      .actionsDays()
      .then(async (all) => {
        if (n !== asked.current) return;
        setDays(all);
        const d = which && all.includes(which) ? which : all[0] ?? "";
        setDay(d);
        const items = d ? await api.actionsDay(d) : [];
        if (n === asked.current) setList(items);
      })
      .catch((e) => n === asked.current && setError(String(e).replace(/^Error:\s*/, "")));
  };

  useEffect(() => load(), []);

  const shown = (list ?? []).filter((e) => kind === "all" || e.kind === kind);
  const kinds = Array.from(new Set((list ?? []).map((e) => e.kind)));

  const clear = () => {
    if (!confirmClear) return setConfirmClear(true);
    setConfirmClear(false);
    void api.actionsClear().then(() => load()).catch((e) => setError(String(e)));
  };

  return (
    <Section
      id="settings-activity"
      title="What Izuki did"
      group="Privacy"
      foldable
      hint="Every click, app, change and message Izuki made on this PC, newest first. Kept here for two weeks; never what was typed. Or ask “what did you do today?”."
      right={
        <button type="button" onClick={() => load(day)} className="izk-pill izk-no-drag px-3 py-1 text-[11px]">
          Refresh
        </button>
      }
    >
      {!keep && <p className="mb-2 rounded-xl border border-izk-hand/25 bg-izk-hand/10 px-3 py-2 text-[11.5px] text-izk-ink">The list is off, so nothing new is noted. Turn on “Keep a list of what Izuki does” above.</p>}
      {days.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5" role="tablist" aria-label="Day">
          {days.slice(0, 7).map((d) => (
            <button
              key={d}
              type="button"
              role="tab"
              aria-selected={d === day}
              onClick={() => load(d)}
              className={cx("izk-no-drag rounded-full border px-2.5 py-1 text-[11px] transition-colors", d === day ? "border-izk-teal/50 bg-izk-teal/15 text-izk-ink" : "border-white/10 text-izk-muted hover:text-izk-ink")}
            >
              {dayName(d)}
            </button>
          ))}
        </div>
      )}
      {kinds.length > 1 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {["all", ...kinds].map((k) => (
            <button key={k} type="button" aria-pressed={kind === k} onClick={() => setKind(k)} className={cx("izk-no-drag rounded-full px-2 py-0.5 text-[10.5px]", kind === k ? "bg-white/12 text-izk-ink" : "text-izk-muted hover:text-izk-ink")}>
              {k === "all" ? "Everything" : `${KIND_ICON[k] ?? "•"} ${k}`}
            </button>
          ))}
        </div>
      )}
      {error && <p role="alert" className="text-[11.5px] text-izk-danger">{error}</p>}
      {list === null && !error && <p className="text-[11.5px] text-izk-muted">Reading the list…</p>}
      {list !== null && shown.length === 0 && <p className="text-[11.5px] text-izk-muted">{days.length ? "Nothing of that kind that day." : "Nothing yet. When Izuki clicks, opens, changes or sends something for you, it shows up here."}</p>}
      {shown.length > 0 && (
        <ol className="max-h-[320px] overflow-y-auto rounded-2xl border border-white/10 bg-white/[0.025]">
          {shown.map((e, i) => (
            <li key={`${e.at}-${i}`} className="flex items-start gap-2.5 border-b border-white/[0.05] px-3 py-1.5 last:border-b-0">
              <span className="w-[54px] shrink-0 pt-[1px] text-[10.5px] tabular-nums text-izk-muted">{new Date(e.at).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}</span>
              <span aria-hidden className="text-[12px] leading-[1.35]">{KIND_ICON[e.kind] ?? "•"}</span>
              <span className="min-w-0 flex-1 break-words text-[11.5px] leading-[1.35] text-izk-ink">{e.text}</span>
            </li>
          ))}
        </ol>
      )}
      {days.length > 0 && (
        <div className="mt-2 flex justify-end">
          <button type="button" onClick={clear} onBlur={() => setConfirmClear(false)} className={cx("izk-no-drag rounded-full px-3 py-1 text-[11px]", confirmClear ? "bg-izk-danger/20 text-izk-danger" : "text-izk-muted hover:text-izk-ink")}>
            {confirmClear ? "Press again to clear the whole list" : "Clear the list"}
          </button>
        </div>
      )}
    </Section>
  );
}

/** The window's own storage worth copying (chat history and the like), without anything secret. */
function windowData(): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k || !/^(izuki|izk)[.-]/.test(k) || /(pass|token|secret|key)$/i.test(k)) continue;
      const raw = localStorage.getItem(k) ?? "";
      try {
        out[k] = JSON.parse(raw);
      } catch {
        out[k] = raw;
      }
    }
  } catch {
    // Storage can be unavailable; the copy still has everything on disk.
  }
  return out;
}

function size(bytes: number): string {
  if (bytes >= 1024 * 1024 * 1024) return `${(bytes / 1024 / 1024 / 1024).toFixed(1)} GB`;
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

/**
 * "Your data": take a copy of everything Izuki keeps about you (one .zip,
 * keys removed), or erase it all. Erase needs two steps and says exactly
 * what happens; Izuki closes, restarts and erases before loading anything.
 */
export function MyDataCard() {
  // undefined: still counting; null: couldn't be counted.
  const [sum, setSum] = useState<MyDataSummary | null | undefined>(undefined);
  const [busy, setBusy] = useState<"" | "copy" | "erase">("");
  const [copied, setCopied] = useState("");
  const [error, setError] = useState("");
  const [erasing, setErasing] = useState(false);
  const [keepKeys, setKeepKeys] = useState(true);
  const [typed, setTyped] = useState("");

  useEffect(() => {
    void api.myDataSummary().then(setSum).catch(() => setSum(null));
  }, []);

  const copy = async () => {
    if (busy) return;
    setBusy("copy");
    setError("");
    setCopied("");
    try {
      setCopied(await api.myDataExport(windowData()));
    } catch (e) {
      setError(String(e).replace(/^Error:\s*/, ""));
    } finally {
      setBusy("");
    }
  };

  const erase = async () => {
    if (busy || typed.trim().toLowerCase() !== "erase") return;
    setBusy("erase");
    setError("");
    try {
      await api.eraseEverything(keepKeys);
    } catch (e) {
      setError(String(e).replace(/^Error:\s*/, ""));
      setBusy("");
    }
  };

  return (
    <Section id="settings-mydata" title="Your data" group="Privacy" foldable hint="Everything Izuki knows about you lives on this PC, in your Izuki folder. Take a copy of it, or erase it, any time.">
      <p className="text-[11.5px] leading-relaxed text-izk-muted">
        {sum ? (
          <>
            <b className="text-izk-ink">{sum.files} files, {size(sum.bytes)}</b>: memories, notes, chats, routines, reminders, research, “What Izuki did”, settings and logs. Nothing about you is kept on a server.
          </>
        ) : sum === undefined ? (
          "Counting what's kept…"
        ) : (
          "Memories, notes, chats, routines, reminders, research, “What Izuki did”, settings and logs. Nothing about you is kept on a server."
        )}
      </p>
      <div className="mt-2.5 flex flex-wrap items-center gap-2">
        <button type="button" disabled={!!busy} onClick={() => void copy()} className="izk-btn-primary izk-no-drag h-[30px] px-3.5 text-[12px] disabled:opacity-60">
          {busy === "copy" ? "Making the copy…" : "Take a copy of my data"}
        </button>
        {!erasing && (
          <button type="button" disabled={!!busy} onClick={() => setErasing(true)} className="izk-no-drag rounded-full border border-izk-danger/40 px-3.5 py-1.5 text-[12px] text-izk-danger hover:bg-izk-danger/10">
            Erase everything…
          </button>
        )}
      </div>
      {copied && (
        <p role="status" className="mt-2 flex flex-wrap items-center gap-2 text-[11.5px] text-izk-teal">
          Saved: {copied.split(/[\\/]/).pop()} (in Downloads; keys and passwords left out).
          <button type="button" onClick={() => void api.myDataShow(copied).catch((e) => setError(String(e)))} className="izk-pill izk-no-drag px-2.5 py-0.5 text-[11px]">
            Show it
          </button>
        </p>
      )}
      {erasing && (
        <div className="mt-3 rounded-2xl border border-izk-danger/35 bg-izk-danger/[0.07] p-3">
          <p className="text-[12px] font-semibold text-izk-ink">Erase everything Izuki keeps about you?</p>
          <ul className="mt-1.5 list-disc pl-4 text-[11px] leading-relaxed text-izk-muted">
            <li>Gone for good: memories, notes, chats, routines, reminders, research, saved layouts, “What Izuki did”, logs and settings.</li>
            <li>Izuki closes, starts again by itself and erases before loading anything, then opens like new.</li>
            <li>Kept: downloaded AI models and tools, Code mode's working copies of your projects (close those in Code mode), and what lets you undo Windows changes (looks and tweaks).</li>
            <li>Accounts linked through Composio (like Gmail) stay linked there; remove them first in Apps → Inbox if you want.</li>
          </ul>
          <label className="mt-2 flex items-center gap-2 text-[11.5px] text-izk-ink">
            <Toggle checked={keepKeys} onChange={setKeepKeys} /> Keep my AI and app keys
          </label>
          <form
            className="mt-2.5 flex flex-wrap items-center gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              void erase();
            }}
          >
            <input
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder="Type erase to confirm"
              aria-label="Type erase to confirm"
              autoComplete="off"
              className="izk-field izk-no-drag h-[30px] w-[170px] px-2.5 text-[12px]"
            />
            <button type="submit" disabled={!!busy || typed.trim().toLowerCase() !== "erase"} className="izk-no-drag rounded-full bg-izk-danger px-3.5 py-1.5 text-[12px] font-semibold text-white disabled:opacity-40">
              {busy === "erase" ? "Closing to erase…" : "Erase and restart"}
            </button>
            <button type="button" disabled={busy === "erase"} onClick={() => { setErasing(false); setTyped(""); }} className="izk-no-drag px-2 text-[12px] text-izk-muted hover:text-izk-ink">
              Cancel
            </button>
          </form>
        </div>
      )}
      {error && <p role="alert" className="mt-2 text-[11.5px] text-izk-danger">{error}</p>}
    </Section>
  );
}
