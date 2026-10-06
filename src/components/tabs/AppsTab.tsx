import { JumpBar } from "../JumpBar";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Bell, CheckCircle2, Copy, Download, ExternalLink, Loader2, Plus, RefreshCw, Search, Sparkles, Trash2, Workflow, X } from "lucide-react";
import { AppsCard } from "../AppsCard";
import { Row, Section, Toggle, cx } from "../ui";
import { useIzuki } from "../../lib/store";
import { api, IS_TAURI } from "../../lib/ipc";
import { getKey } from "../../lib/setup";

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
  category?: string;
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

// Curated, common services whose current Composio toolkit supports managed
// OAuth. The server still generates the connection link, so an unavailable
// account or provider is reported honestly instead of faking a connection.
const APP_CATALOG: App[] = [
  ...APPS.filter((app) => app.slug !== "tiktok").map((app) => ({ ...app, category: app.slug === "gmail" || app.slug.startsWith("google") ? "Google" : "Popular" })),
  { slug: "googleslides", name: "Google Slides", emoji: "📽️", what: "presentations", category: "Google" },
  { slug: "googletasks", name: "Google Tasks", emoji: "✅", what: "to-do lists", category: "Google" },
  { slug: "google_classroom", name: "Google Classroom", emoji: "🏫", what: "classes & work", category: "Google" },
  { slug: "googlephotos", name: "Google Photos", emoji: "🖼️", what: "photo library", category: "Google" },
  { slug: "one_drive", name: "OneDrive", emoji: "☁️", what: "files & sharing", category: "Microsoft" },
  { slug: "microsoft_teams", name: "Microsoft Teams", emoji: "👥", what: "chats & meetings", category: "Microsoft" },
  { slug: "share_point", name: "SharePoint", emoji: "🗄️", what: "team files", category: "Microsoft" },
  { slug: "excel", name: "Excel", emoji: "📊", what: "workbooks", category: "Microsoft" },
  { slug: "linear", name: "Linear", emoji: "📐", what: "issues & projects", category: "Work" },
  { slug: "jira", name: "Jira", emoji: "🎯", what: "issues & sprints", category: "Work" },
  { slug: "clickup", name: "ClickUp", emoji: "✅", what: "tasks & docs", category: "Work" },
  { slug: "asana", name: "Asana", emoji: "🧩", what: "projects & tasks", category: "Work" },
  { slug: "monday", name: "Monday", emoji: "📅", what: "work boards", category: "Work" },
  { slug: "airtable", name: "Airtable", emoji: "🗃️", what: "bases & records", category: "Work" },
  { slug: "calendly", name: "Calendly", emoji: "🗓️", what: "scheduling", category: "Work" },
  { slug: "gitlab", name: "GitLab", emoji: "🦊", what: "code & CI", category: "Build" },
  { slug: "bitbucket", name: "Bitbucket", emoji: "🪣", what: "code & PRs", category: "Build" },
  { slug: "figma", name: "Figma", emoji: "🎨", what: "design files", category: "Create" },
  { slug: "miro", name: "Miro", emoji: "🧠", what: "whiteboards", category: "Create" },
  { slug: "googlemeet", name: "Google Meet", emoji: "🎥", what: "meetings", category: "Messages" },
  { slug: "webex", name: "Webex", emoji: "🎦", what: "meetings", category: "Messages" },
  { slug: "box", name: "Box", emoji: "📦", what: "work files", category: "Files" },
  { slug: "pinterest", name: "Pinterest", emoji: "📌", what: "pins & boards", category: "Social" },
  { slug: "tiktok_ads", name: "TikTok Ads", emoji: "🎵", what: "campaigns & reports", category: "Social" },
  { slug: "twitch", name: "Twitch", emoji: "🎮", what: "stream tools", category: "Social" },
  { slug: "hubspot", name: "HubSpot", emoji: "🧲", what: "contacts & CRM", category: "Business" },
  { slug: "mailchimp", name: "Mailchimp", emoji: "🐵", what: "campaigns", category: "Business" },
  { slug: "salesforce", name: "Salesforce", emoji: "☁️", what: "CRM", category: "Business" },
  { slug: "shopify", name: "Shopify", emoji: "🛍️", what: "store & orders", category: "Business" },
  { slug: "stripe", name: "Stripe", emoji: "💳", what: "payments", category: "Business" },
];

/**
 * Apps whose owners only let approved business apps sign in for you — the
 * free Composio link can't reach them. Izuki does them on screen instead.
 */
const STRICT_APPS: Record<string, string> = {
  tiktok:
    "TikTok only lets approved business apps sign in for you, so it can't be linked here. It works on your screen instead: I've opened TikTok in the Izuki browser — sign in once, then just ask (\"post my video\", \"check my stats\").",
  instagram:
    "Instagram only links business or creator accounts here. It works on your screen instead: I've opened Instagram in the Izuki browser — sign in once, then just ask.",
  whatsapp:
    "WhatsApp only links WhatsApp Business here. It works on your screen instead: I've opened WhatsApp Web — scan the code with your phone once, then just ask.",
};
const STRICT_URL: Record<string, string> = {
  tiktok: "https://www.tiktok.com/login",
  instagram: "https://www.instagram.com/accounts/login/",
  whatsapp: "https://web.whatsapp.com/",
};

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
  const [appSearch, setAppSearch] = useState("");
  const [connectedOnly, setConnectedOnly] = useState(false);
  const appResults = useMemo(() => {
    const query = appSearch.trim().toLowerCase();
    return APP_CATALOG.filter((app) => (!connectedOnly || linked.includes(app.slug)) &&
      `${app.name} ${app.what} ${app.category ?? ""}`.toLowerCase().includes(query));
  }, [appSearch, connectedOnly, linked]);

  const refresh = useCallback(async () => {
    if (!hasKey) { setLinked([]); return; }
    setLoading(true);
    setLinkErr(null);
    try {
      await useIzuki.getState().flushSettings();
      setLinked(await api.appsConnected());
    } catch (e) {
      setLinkErr(String(e));
    } finally {
      setLoading(false);
    }
  }, [hasKey, settings.composio_api_key]);

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

  // Tapped an app with no key yet: get the (free) key first, then carry on
  // to that app's sign-in the moment the key is copied — no second tap.
  const [waitingFor, setWaitingFor] = useState<App | null>(null);
  useEffect(() => {
    const onKey = (e: Event) => {
      if ((e as CustomEvent).detail !== "composio" || !waitingFor) return;
      const app = waitingFor;
      setWaitingFor(null);
      setTimeout(() => void connect(app), 400);
    };
    window.addEventListener("izuki:key", onKey);
    return () => window.removeEventListener("izuki:key", onKey);
  });

  const connect = async (app: App) => {
    if (!useIzuki.getState().settings.composio_api_key.trim()) {
      setWaitingFor(app);
      getKey("composio");
      return;
    }
    setOpening(app.slug);
    setLinkErr(null);
    try {
      await useIzuki.getState().flushSettings();
      await openLink(await api.appsConnect(app.slug));
    } catch (e) {
      // TikTok, Instagram and WhatsApp don't hand out sign-ins to apps like
      // this without their own approval — say so plainly, and offer the way
      // that works: Izuki using the site on screen.
      if (STRICT_APPS[app.slug]) {
        setLinkErr(STRICT_APPS[app.slug]);
        void api.browserShow(STRICT_URL[app.slug]);
      } else {
        setLinkErr(`${app.name}: ${String(e)}`);
      }
    } finally {
      setOpening(null);
    }
  };

  const [asking, setAsking] = useState<string | null>(null);
  const [school, setSchool] = useState("");
  const openScreenApp = (a: ScreenApp) => {
    const url = a.url ?? schoolUrl(a.key);
    if (url) {
      void api.browserShow(url);
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
    void api.browserShow(url);
  };

  const hooks = settings.n8n_hooks ?? [];
  const openSetup = useIzuki((s) => s.setSetupOpen);
  const feeds = settings.school_feeds ?? [];
  const setHook = (i: number, part: Partial<{ name: string; url: string }>) =>
    patch({ n8n_hooks: hooks.map((h, j) => (j === i ? { ...h, ...part } : h)) });

  return (
    <>
      <JumpBar topId="apps-top" jumps={[
        { label: "🔌 Connect", id: "apps-connect" },
        { label: "🌐 Websites", id: "apps-browser" },
        { label: "🔔 Heads-ups", id: "apps-headsups" },
        { label: "⚡ Automations", id: "apps-n8n" },
      ]} />
      <button
        type="button"
        onClick={() => openSetup(true)}
        className="izk-no-drag flex items-center gap-3 rounded-[18px] border border-izk-violet/35 bg-izk-violet/10 p-3 text-left transition-colors hover:bg-izk-violet/16"
      >
        <Sparkles size={18} className="shrink-0 text-izk-violet" />
        <span className="min-w-0 flex-1">
          <span className="block text-[13px] font-semibold text-izk-ink">Quick setup</span>
          <span className="block text-[11px] leading-snug text-izk-muted">See what's connected and add the rest in a tap or two.</span>
        </span>
      </button>

      {/* ------------------------------------------------ connect */}
      <Section
        id="apps-connect"
        title="Connect your apps"
        hint={
          hasKey
            ? "Tap one to sign in (it opens in your browser, once). Then just ask — in the chat, by voice or from your phone."
            : "Tap any app — Izuki walks you through the free key, then opens its sign-in."
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
        <div className="relative mb-1.5">
          <Search aria-hidden="true" size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-izk-muted" />
          <input
            aria-label="Search all apps to connect"
            value={appSearch}
            onChange={(e) => setAppSearch(e.target.value)}
            placeholder="Search all apps — Teams, TikTok, Google Tasks…"
            className="izk-field izk-no-drag w-full py-2 pl-9 pr-16 text-[12px]"
          />
          {appSearch && (
            <button
              type="button"
              aria-label="Clear app search"
              onClick={() => setAppSearch("")}
              className="izk-no-drag absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded-md px-1.5 py-1 text-[10px] text-izk-muted transition-colors hover:bg-white/8 hover:text-izk-ink"
            >
              <X size={13} /> Clear
            </button>
          )}
        </div>
        <div className="mb-2 flex items-center justify-between gap-2">
          <p role="status" className="text-[10.5px] text-izk-muted">{appResults.length} app{appResults.length === 1 ? "" : "s"}{appSearch.trim() ? " found" : " available"}</p>
          <button type="button" aria-pressed={connectedOnly} onClick={() => setConnectedOnly((v) => !v)} className={cx("izk-pill izk-no-drag px-2 py-1 text-[10.5px]", connectedOnly && "border-izk-teal/40 text-izk-teal")}>
            <CheckCircle2 size={11} /> Connected only
          </button>
        </div>
        <div className="grid grid-cols-2 gap-1.5 min-[420px]:grid-cols-3">
          {appResults.map((a) => {
            const on = linked.includes(a.slug);
            return (
              <button
                key={a.slug}
                type="button"
                disabled={opening !== null}
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
        {appResults.length === 0 && <p className="mt-2 text-[11px] text-izk-muted">{connectedOnly ? "No connected apps match. Turn off Connected only to browse apps you can add." : "No matching app in this catalog. Try a different name or open its website in the Izuki browser."}</p>}
        {waitingFor && (
          <div className="mt-2 rounded-[14px] border border-izk-violet/35 bg-izk-violet/10 p-2.5 text-[11.5px] leading-snug text-izk-ink">
            <b>One free key first, then {waitingFor.name}.</b> On the Composio page that just opened: sign up (free), go to{" "}
            <b>Settings → API Keys</b> and copy your key. Come back here — Izuki picks it up and opens {waitingFor.name}'s
            sign-in by itself.
            <div className="mt-2 flex gap-1.5">
              <button type="button" onClick={() => getKey("composio")} className="izk-pill izk-no-drag h-[26px] px-2.5 text-[11px]">
                <ExternalLink size={11} /> Open it again
              </button>
              <button type="button" onClick={() => setWaitingFor(null)} className="izk-pill izk-no-drag h-[26px] px-2.5 text-[11px]">
                Cancel
              </button>
            </div>
          </div>
        )}
        {linkErr && <div className="mt-2 text-[11px] leading-snug text-izk-danger">{linkErr}</div>}
        <p className="mt-2 text-[10.5px] leading-snug text-izk-muted">
          Hundreds more work too — just ask for them by name. Some apps (TikTok, Instagram, WhatsApp) only allow business
          or creator accounts. Izuki always shows a draft and asks before sending, posting or deleting.
        </p>
      </Section>

      {/* ------------------------------------------------ on your screen */}
      <AppsCard />
      <Section
        id="apps-browser"
        title="School, notes & any website — the Izuki browser"
        hint="Tap one and sign in once in the Izuki browser (it's built into Windows — nothing to install). Close it, and from then on just ask in the chat or from your phone: Izuki opens it in the background, reads it and clicks through."
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
        <button
          type="button"
          onClick={() => void api.browserShow()}
          className="izk-pill izk-no-drag mt-2 h-[28px] px-3 text-[11.5px]"
        >
          🌐 Open the Izuki browser (sign in to any site)
        </button>
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
        id="apps-headsups"
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
        id="apps-n8n"
        title="Your automations (n8n)"
        hint="Bring in all your n8n workflows at once — Izuki picks the right one when you ask (“send the weekly report”)."
        right={<Workflow size={14} className="text-izk-muted" />}
      >
        <N8nImporter />
        <div className="mb-1 mt-3 text-[11px] font-semibold text-izk-muted">
          {hooks.length ? "Your workflows" : "Or add one by hand"}
        </div>
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

/**
 * n8n, imported: the user's n8n address and an API key, once — every active
 * workflow that starts with a (POST) Webhook becomes one Izuki can run.
 */
function N8nImporter() {
  const settings = useIzuki((s) => s.settings);
  const patch = useIzuki((s) => s.patchSettings);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string; skipped?: string[] } | null>(null);

  const run = async () => {
    setBusy(true);
    setMsg(null);
    try {
      const got = await api.n8nImport(settings.n8n_url, settings.n8n_api_key);
      // Imported ones replace hand-made ones of the same name.
      const names = new Set(got.hooks.map((h) => h.name.toLowerCase()));
      const kept = (useIzuki.getState().settings.n8n_hooks ?? []).filter((h) => !names.has(h.name.toLowerCase()));
      patch({ n8n_hooks: [...kept, ...got.hooks] });
      setMsg({
        ok: got.hooks.length > 0,
        text: got.hooks.length
          ? `Imported ${got.hooks.length} workflow${got.hooks.length === 1 ? "" : "s"} — just ask for one by what it does.`
          : "No workflows could be imported yet.",
        skipped: got.skipped,
      });
    } catch (e) {
      setMsg({ ok: false, text: String(e) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-1.5 rounded-[14px] border border-white/8 bg-white/4 p-2.5">
      <input
        value={settings.n8n_url}
        onChange={(e) => patch({ n8n_url: e.target.value })}
        placeholder="Your n8n address — e.g. https://you.app.n8n.cloud"
        spellCheck={false}
        className="izk-field izk-no-drag h-[32px] py-0 text-[12px]"
      />
      <div className="flex gap-1.5">
        <input
          type="password"
          value={settings.n8n_api_key}
          onChange={(e) => patch({ n8n_api_key: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === "Enter" && settings.n8n_url.trim() && settings.n8n_api_key.trim()) void run();
          }}
          placeholder="n8n API key (Settings → n8n API → Create)"
          spellCheck={false}
          autoComplete="off"
          className="izk-field izk-no-drag h-[32px] min-w-0 flex-1 py-0 text-[12px]"
        />
        <button
          type="button"
          disabled={busy || !settings.n8n_url.trim() || !settings.n8n_api_key.trim()}
          onClick={() => void run()}
          className="izk-btn-primary izk-no-drag h-[32px] shrink-0 px-3 text-[11.5px] disabled:opacity-40"
        >
          {busy ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />} Import
        </button>
      </div>
      {msg && (
        <div className={cx("text-[11px] leading-snug", msg.ok ? "text-izk-good" : "text-izk-danger")}>
          {msg.text}
          {msg.skipped && msg.skipped.length > 0 && (
            <ul className="mt-1 list-disc pl-4 text-izk-muted">
              {msg.skipped.slice(0, 6).map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          )}
        </div>
      )}
      <p className="text-[10.5px] leading-snug text-izk-muted">
        Workflows need to start with a <b className="text-izk-ink">Webhook</b> node set to <b className="text-izk-ink">POST</b> and be switched on.
        Izuki sends them what you asked for as <code>request</code>.
      </p>
    </div>
  );
}
