import { useCallback, useEffect, useState } from "react";
import { Bell, CheckCircle2, Copy, Loader2, Plus, RefreshCw, Sparkles, Trash2, Workflow } from "lucide-react";
import { AppsCard } from "../AppsCard";
import { Row, Section, Toggle, cx } from "../ui";
import { useIzuki } from "../../lib/store";
import { api, IS_TAURI } from "../../lib/ipc";

/**
 * Everything Izuki can reach beyond this PC, in one place:
 * 1. the free Composio key (what makes the rest work),
 * 2. a tap-to-connect grid of apps — each opens that app's own sign-in,
 * 3. heads-ups: Izuki telling you about new email, meetings and a morning
 *    brief without being asked, on this PC and/or your phone,
 * 4. your own n8n automations, started by name and able to notify you.
 */

interface App {
  slug: string;
  name: string;
  emoji: string;
  what: string;
}

const APPS: App[] = [
  { slug: "gmail", name: "Gmail", emoji: "📧", what: "read, draft, new-mail alerts" },
  { slug: "googlecalendar", name: "Calendar", emoji: "📅", what: "events, meeting alerts" },
  { slug: "googledrive", name: "Drive", emoji: "🗂️", what: "find & share files" },
  { slug: "googledocs", name: "Docs", emoji: "📝", what: "write & edit docs" },
  { slug: "googlesheets", name: "Sheets", emoji: "📊", what: "read & update sheets" },
  { slug: "outlook", name: "Outlook", emoji: "📨", what: "email & calendar" },
  { slug: "slack", name: "Slack", emoji: "💬", what: "messages & channels" },
  { slug: "discord", name: "Discord", emoji: "🎮", what: "servers & messages" },
  { slug: "whatsapp", name: "WhatsApp", emoji: "🟢", what: "business messages" },
  { slug: "notion", name: "Notion", emoji: "📓", what: "notes & databases" },
  { slug: "github", name: "GitHub", emoji: "🐙", what: "issues, PRs, repos" },
  { slug: "linkedin", name: "LinkedIn", emoji: "💼", what: "posts & profile" },
  { slug: "twitter", name: "X", emoji: "✖️", what: "posts & timeline" },
  { slug: "instagram", name: "Instagram", emoji: "📸", what: "posts & insights" },
  { slug: "facebook", name: "Facebook", emoji: "👍", what: "pages & posts" },
  { slug: "tiktok", name: "TikTok", emoji: "🎵", what: "videos & stats" },
  { slug: "youtube", name: "YouTube", emoji: "▶️", what: "your channel & playlists" },
  { slug: "spotify", name: "Spotify", emoji: "🎧", what: "play & playlists" },
  { slug: "reddit", name: "Reddit", emoji: "👽", what: "posts & inbox" },
  { slug: "todoist", name: "Todoist", emoji: "✅", what: "tasks" },
  { slug: "trello", name: "Trello", emoji: "📋", what: "boards & cards" },
  { slug: "dropbox", name: "Dropbox", emoji: "📦", what: "files" },
  { slug: "zoom", name: "Zoom", emoji: "🎥", what: "meetings" },
  { slug: "canva", name: "Canva", emoji: "🎨", what: "designs" },
];

/**
 * Sites with no sign-in API for personal accounts (NotebookLM's is for
 * paid Google Cloud only; Blackboard's has to be registered by the school).
 * Izuki uses them the way you do — on your screen: it opens them, reads
 * your notes or what's due, and clicks through.
 */
interface ScreenApp {
  key: string;
  name: string;
  emoji: string;
  what: string;
  /** Fixed address, or null when it's your school's own. */
  url: string | null;
  example: string;
}

const SCREEN_APPS: ScreenApp[] = [
  { key: "notebooklm", name: "NotebookLM", emoji: "📒", what: "your notebooks & sources", url: "https://notebooklm.google.com/", example: "“Summarise my biology notebook”" },
  { key: "blackboard", name: "Blackboard", emoji: "🎓", what: "courses, what's due", url: null, example: "“What's due on Blackboard this week?”" },
  { key: "classroom", name: "Classroom", emoji: "🏫", what: "classes & assignments", url: "https://classroom.google.com/", example: "“Any new assignments in Classroom?”" },
  { key: "canvas", name: "Canvas", emoji: "🖌️", what: "courses & grades", url: null, example: "“Open my Canvas grades”" },
];

const SCHOOL_KEY = "izuki.school.";

function schoolUrl(key: string): string {
  try {
    return localStorage.getItem(SCHOOL_KEY + key) ?? "";
  } catch {
    return "";
  }
}

async function openLink(url: string) {
  if (IS_TAURI) {
    const { openUrl } = await import("@tauri-apps/plugin-opener");
    await openUrl(url);
  } else {
    window.open(url, "_blank");
  }
}

export function AppsTab() {
  const settings = useIzuki((s) => s.settings);
  const patch = useIzuki((s) => s.patchSettings);
  const hasKey = settings.composio_api_key.trim().length > 0;

  const [linked, setLinked] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [linkErr, setLinkErr] = useState<string | null>(null);
  const [opening, setOpening] = useState<string | null>(null);
  const [notifyUrl, setNotifyUrl] = useState("");
  const [tested, setTested] = useState(false);

  const refresh = useCallback(async () => {
    if (!hasKey) return;
    setLoading(true);
    setLinkErr(null);
    try {
      setLinked(await api.appsConnected());
    } catch (e) {
      setLinkErr(String(e));
    } finally {
      setLoading(false);
    }
  }, [hasKey]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  // Coming back from a sign-in page in the browser: look again.
  useEffect(() => {
    const again = () => void refresh();
    window.addEventListener("focus", again);
    return () => window.removeEventListener("focus", again);
  }, [refresh]);

  useEffect(() => {
    void api.callStatus().then((s) => setNotifyUrl(s.state === "ready" && s.link ? `${s.link}notify` : ""));
  }, [settings.call_enabled]);

  const connect = async (app: App) => {
    setOpening(app.slug);
    setLinkErr(null);
    try {
      await openLink(await api.appsConnect(app.slug));
    } catch (e) {
      setLinkErr(`${app.name}: ${String(e)}`);
    } finally {
      setOpening(null);
    }
  };

  const [asking, setAsking] = useState<string | null>(null);
  const [school, setSchool] = useState("");
  const openScreenApp = (a: ScreenApp) => {
    const url = a.url ?? schoolUrl(a.key);
    if (url) {
      void openLink(url);
      return;
    }
    setAsking(a.key);
    setSchool("");
  };
  const saveSchool = () => {
    let url = school.trim();
    if (!url || !asking) return;
    if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
    try {
      localStorage.setItem(SCHOOL_KEY + asking, url);
    } catch {
      /* not kept — it still opens now */
    }
    setAsking(null);
    void openLink(url);
  };

  const hooks = settings.n8n_hooks ?? [];
  const feeds = settings.school_feeds ?? [];
  const setHook = (i: number, part: Partial<{ name: string; url: string }>) =>
    patch({ n8n_hooks: hooks.map((h, j) => (j === i ? { ...h, ...part } : h)) });

  return (
    <>
      <AppsCard />

      {/* ------------------------------------------------ connect */}
      <Section
        title="Connect your apps"
        hint={
          hasKey
            ? "Tap one to sign in (it opens in your browser, once). Then just ask — in the chat, by voice or from your phone."
            : "Add your free Composio key above first — then connect with one tap."
        }
        right={
          hasKey ? (
            <button
              type="button"
              onClick={() => void refresh()}
              title="Check again"
              className="izk-pill izk-no-drag h-[26px] px-2 text-[11px]"
            >
              {loading ? <Loader2 size={11} className="animate-spin" /> : <RefreshCw size={11} strokeWidth={2.4} />}
            </button>
          ) : undefined
        }
      >
        <div className="grid grid-cols-2 gap-1.5 min-[420px]:grid-cols-3">
          {APPS.map((a) => {
            const on = linked.includes(a.slug);
            return (
              <button
                key={a.slug}
                type="button"
                disabled={!hasKey || opening !== null}
                onClick={() => void connect(a)}
                title={on ? `${a.name} is connected — tap to connect another account` : `Connect ${a.name}`}
                className={cx(
                  "izk-no-drag group relative flex items-center gap-2 rounded-[14px] border px-2.5 py-2 text-left transition-all",
                  "disabled:cursor-not-allowed disabled:opacity-45",
                  on
                    ? "border-izk-teal/40 bg-izk-teal/10"
                    : "border-white/8 bg-white/4 hover:-translate-y-[1px] hover:border-white/18 hover:bg-white/8"
                )}
              >
                <span className="text-[18px] leading-none">{a.emoji}</span>
                <span className="min-w-0">
                  <span className="block truncate text-[12px] font-semibold text-izk-ink">{a.name}</span>
                  <span className="block truncate text-[10px] text-izk-muted">{on ? "connected" : a.what}</span>
                </span>
                {on && <CheckCircle2 size={12} strokeWidth={2.6} className="absolute right-2 top-2 text-izk-teal" />}
                {opening === a.slug && <Loader2 size={12} className="absolute right-2 top-2 animate-spin text-izk-muted" />}
              </button>
            );
          })}
        </div>
        {linkErr && <div className="mt-2 text-[11px] leading-snug text-izk-danger">{linkErr}</div>}
        <p className="mt-2 text-[10.5px] leading-snug text-izk-muted">
          Hundreds more work too — just ask for them by name. Some apps (TikTok, Instagram, WhatsApp) only allow business
          or creator accounts. Izuki always shows a draft and asks before sending, posting or deleting.
        </p>
      </Section>

      {/* ------------------------------------------------ on your screen */}
      <Section
        title="School & notes — on your screen"
        hint="These don't let apps sign in for you, so Izuki uses them like you do: open one, then just ask. It reads it and clicks through."
      >
        <div className="grid grid-cols-2 gap-1.5">
          {SCREEN_APPS.map((a) => (
            <button
              key={a.key}
              type="button"
              onClick={() => openScreenApp(a)}
              title={a.example}
              className="izk-no-drag flex items-center gap-2 rounded-[14px] border border-white/8 bg-white/4 px-2.5 py-2 text-left transition-all hover:-translate-y-[1px] hover:border-white/18 hover:bg-white/8"
            >
              <span className="text-[18px] leading-none">{a.emoji}</span>
              <span className="min-w-0">
                <span className="block truncate text-[12px] font-semibold text-izk-ink">{a.name}</span>
                <span className="block truncate text-[10px] text-izk-muted">{a.what}</span>
              </span>
            </button>
          ))}
        </div>
        {asking && (
          <div className="mt-2 flex items-center gap-1.5">
            <input
              autoFocus
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && saveSchool()}
              placeholder={`Your school's ${asking === "canvas" ? "Canvas" : "Blackboard"} address, e.g. learn.myschool.edu`}
              spellCheck={false}
              className="izk-field izk-no-drag h-[32px] flex-1 py-0 text-[12px]"
            />
            <button type="button" onClick={saveSchool} className="izk-pill izk-no-drag h-[32px] px-3 text-[11.5px]">
              Open
            </button>
          </div>
        )}
        <p className="mt-2 text-[10.5px] leading-snug text-izk-muted">
          Try: {SCREEN_APPS.map((a) => a.example).join(" · ")}
        </p>

        <div className="izk-divider my-3" />
        <Row
          label="Remind me about school work"
          hint="Every assignment and due date, a day before and two hours before — on this PC and your phone. Works in the background, no key needed."
        >
          <Toggle checked={settings.heads_up_school} onChange={(v) => patch({ heads_up_school: v })} />
        </Row>
        <div className="flex flex-col gap-1.5">
          {feeds.map((f, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <input
                value={f}
                onChange={(e) => patch({ school_feeds: feeds.map((x, j) => (j === i ? e.target.value : x)) })}
                placeholder="Paste your calendar link (…ics)"
                spellCheck={false}
                className="izk-field izk-no-drag h-[32px] flex-1 py-0 text-[12px]"
              />
              <button
                type="button"
                aria-label="Remove"
                onClick={() => patch({ school_feeds: feeds.filter((_, j) => j !== i) })}
                className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-full text-izk-muted hover:text-izk-danger"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => patch({ school_feeds: [...feeds, ""] })}
            className="izk-pill izk-no-drag h-[28px] w-fit px-3 text-[11.5px]"
          >
            <Plus size={12} strokeWidth={2.4} /> Add a school calendar link
          </button>
        </div>
        <details className="mt-2 text-[10.5px] leading-snug text-izk-muted">
          <summary className="cursor-pointer text-izk-ink">Where do I find that link?</summary>
          <ul className="mt-1 list-disc pl-4">
            <li><b>Blackboard:</b> Calendar → ⋯ (or the gear) → “Share calendar” / “Get external calendar link” → Copy.</li>
            <li><b>Canvas:</b> Calendar → “Calendar Feed” (bottom right) → copy the link.</li>
            <li><b>Moodle:</b> Calendar → “Export calendar” → “Get calendar URL”.</li>
            <li><b>Google Classroom:</b> due dates are already in Google Calendar — connect Calendar above.</li>
          </ul>
          It's a private link to your own deadlines — keep it to yourself.
        </details>
      </Section>

      {/* ------------------------------------------------ heads-ups */}
      <Section
        title="Heads-ups"
        hint="Izuki tells you things before you ask — no AI quota used for these."
        right={<Bell size={14} className="text-izk-muted" />}
      >
        <Row label="New emails" hint="The moment something lands in your Gmail inbox (checked every few minutes).">
          <Toggle checked={settings.heads_up_email} onChange={(v) => patch({ heads_up_email: v })} />
        </Row>
        <div className="izk-divider" />
        <Row label="Meetings coming up" hint="A few minutes before anything on your Google Calendar.">
          <Toggle checked={settings.heads_up_calendar} onChange={(v) => patch({ heads_up_calendar: v })} />
        </Row>
        <div className="izk-divider" />
        <Row label="Morning brief" hint="Today's events, new mail and reminders, once a day.">
          <div className="flex items-center gap-2">
            <input
              type="time"
              value={settings.morning_brief_at}
              disabled={!settings.morning_brief}
              onChange={(e) => patch({ morning_brief_at: e.target.value || "08:00" })}
              className="izk-field izk-no-drag h-[30px] w-[96px] py-0 text-[12px] disabled:opacity-40"
            />
            <Toggle checked={settings.morning_brief} onChange={(v) => patch({ morning_brief: v })} />
          </div>
        </Row>
        <div className="izk-divider" />
        <Row label="On this PC" hint="A Windows notification.">
          <Toggle checked={settings.heads_up_pc} onChange={(v) => patch({ heads_up_pc: v })} />
        </Row>
        <div className="izk-divider" />
        <Row label="On my phone" hint="Through Telegram or Discord (Settings → Izuki on your phone).">
          <Toggle checked={settings.heads_up_phone} onChange={(v) => patch({ heads_up_phone: v })} />
        </Row>
        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              void api.headsupTest();
              setTested(true);
              setTimeout(() => setTested(false), 4000);
            }}
            className="izk-pill izk-no-drag h-[28px] px-3 text-[11.5px]"
          >
            <Sparkles size={12} strokeWidth={2.4} /> Send a test
          </button>
          {tested && <span className="text-[11px] text-izk-teal">Sent — check your notifications.</span>}
        </div>
        {hasKey && !linked.includes("gmail") && !linked.includes("googlecalendar") && (
          <p className="mt-2 text-[10.5px] leading-snug text-izk-muted">
            Connect Gmail and Calendar above for email and meeting alerts.
          </p>
        )}
      </Section>

      {/* ------------------------------------------------ n8n */}
      <Section
        title="Your automations (n8n)"
        hint="Give each n8n workflow a name and its webhook address — then say “run my invoice flow”."
        right={<Workflow size={14} className="text-izk-muted" />}
      >
        <div className="flex flex-col gap-1.5">
          {hooks.map((h, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <input
                value={h.name}
                onChange={(e) => setHook(i, { name: e.target.value })}
                placeholder="Name"
                className="izk-field izk-no-drag h-[32px] w-[34%] py-0 text-[12px]"
              />
              <input
                value={h.url}
                onChange={(e) => setHook(i, { url: e.target.value })}
                placeholder="https://…/webhook/…"
                spellCheck={false}
                className="izk-field izk-no-drag h-[32px] flex-1 py-0 text-[12px]"
              />
              <button
                type="button"
                aria-label="Remove"
                onClick={() => patch({ n8n_hooks: hooks.filter((_, j) => j !== i) })}
                className="flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-full text-izk-muted hover:text-izk-danger"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => patch({ n8n_hooks: [...hooks, { name: "", url: "" }] })}
            className="izk-pill izk-no-drag h-[28px] w-fit px-3 text-[11.5px]"
          >
            <Plus size={12} strokeWidth={2.4} /> Add a workflow
          </button>
        </div>
        <div className="mt-3 text-[11px] leading-snug text-izk-muted">
          <b className="text-izk-ink">Let n8n (or Zapier, IFTTT, a script) notify you:</b>{" "}
          {notifyUrl ? (
            <>
              send a POST with <code className="text-izk-ink">{'{"title": "…", "text": "…"}'}</code> to
              <div className="mt-1 flex items-center gap-1.5">
                <code className="izk-inset min-w-0 flex-1 truncate rounded-[8px] px-2 py-1 text-[10.5px] text-izk-ink">
                  {notifyUrl}
                </code>
                <button
                  type="button"
                  title="Copy"
                  onClick={() => void navigator.clipboard.writeText(notifyUrl)}
                  className="izk-pill izk-no-drag h-[24px] px-2 text-[10.5px]"
                >
                  <Copy size={11} />
                </button>
              </div>
            </>
          ) : (
            "turn on Call Izuki (Settings → Izuki on your phone) and its address shows up here."
          )}
        </div>
      </Section>
    </>
  );
}
