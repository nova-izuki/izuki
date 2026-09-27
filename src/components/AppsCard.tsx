import { useState } from "react";
import { CheckCircle2, ExternalLink, Loader2, Plug } from "lucide-react";
import { Badge, Section } from "./ui";
import { useIzuki } from "../lib/store";
import { api, IS_TAURI } from "../lib/ipc";

async function openLink(url: string) {
  if (IS_TAURI) {
    const { openUrl } = await import("@tauri-apps/plugin-opener");
    await openUrl(url);
  } else {
    window.open(url, "_blank");
  }
}

const EXAMPLES = [
  "What's in my inbox today?",
  "Draft a reply to Sam saying Friday works",
  "What's on my calendar tomorrow?",
  "Find my resume in Drive",
  "Post in #general that I'm running late",
];

/**
 * Izuki in your apps — Gmail, Calendar, Drive, Slack, Notion, GitHub,
 * socials — through your own free Composio key. Each app is linked the
 * first time you ask for it (Izuki opens the sign-in page).
 */
export function AppsCard() {
  const settings = useIzuki((s) => s.settings);
  const patch = useIzuki((s) => s.patchSettings);
  const flush = useIzuki((s) => s.flushSettings);
  const [test, setTest] = useState<"idle" | "testing" | "ok" | string>("idle");
  const hasKey = settings.composio_api_key.trim().length > 0;

  const check = async () => {
    const k = settings.composio_api_key.trim();
    // Composio's "Getting started" page puts a setup command for coding tools
    // (npx skills add …) right under the key, and it's easy to copy that instead.
    if (/\s/.test(k) || /^npx\b/i.test(k)) {
      setTest("That's Composio's setup command for coding tools — Izuki doesn't need it. Copy the API key itself instead (Settings → API Keys, it starts with ak_).");
      return;
    }
    setTest("testing");
    await flush();
    try {
      await api.appsTest(settings.composio_api_key);
      setTest("ok");
    } catch (e) {
      setTest(String(e));
    }
  };

  return (
    <Section
      title="Izuki in your apps"
      hint="Email, calendar, Drive, Slack, Notion, GitHub, socials and hundreds more — from chat, voice or your phone. Free with your own Composio key (20,000 actions a month)."
      right={hasKey ? <Badge tone="good">on</Badge> : undefined}
    >
      <div className="flex flex-col gap-2 text-[12px] leading-snug text-izk-muted">
        <div>
          1. Make a free account, then copy your key from <b className="text-izk-ink">Settings → API Keys</b>.
          <div className="mt-1.5">
            <button
              type="button"
              onClick={() => void openLink("https://dashboard.composio.dev/")}
              className="izk-pill izk-no-drag h-[26px] px-2.5 text-[11px]"
            >
              <ExternalLink size={11} strokeWidth={2.4} /> Open Composio
            </button>
          </div>
        </div>
        <div>
          2. Paste it here:
          <div className="mt-1.5 flex items-center gap-1.5">
            <input
              type="password"
              value={settings.composio_api_key}
              onChange={(e) => {
                patch({ composio_api_key: e.target.value });
                setTest("idle");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && hasKey) void check();
              }}
              placeholder="ak_… then Enter"
              spellCheck={false}
              autoComplete="off"
              className="izk-field izk-no-drag h-[34px] flex-1 py-0 text-[12px]"
            />
            <button
              type="button"
              disabled={!hasKey || test === "testing"}
              onClick={() => void check()}
              className="izk-pill izk-no-drag h-[34px] shrink-0 px-3 text-[11.5px] disabled:opacity-40"
            >
              {test === "testing" ? <Loader2 size={12} className="animate-spin" /> : <Plug size={12} strokeWidth={2.4} />} Test
            </button>
          </div>
          {test === "ok" && (
            <div className="mt-1 flex items-center gap-1.5 text-[11px] text-izk-teal">
              <CheckCircle2 size={11} strokeWidth={2.4} /> Works! Ask for something below.
            </div>
          )}
          {test !== "idle" && test !== "ok" && test !== "testing" && (
            <div className="mt-1 text-[11px] text-izk-danger">{test}</div>
          )}
        </div>
        <div>
          3. Just ask — the first time you use an app, Izuki opens its sign-in page once. It always shows you a
          draft and asks before sending, posting or deleting anything.
        </div>
        <div className="flex flex-wrap gap-1">
          {EXAMPLES.map((e) => (
            <span key={e} className="izk-inset rounded-full px-2.5 py-1 text-[11px] text-izk-ink">
              “{e}”
            </span>
          ))}
        </div>
      </div>
    </Section>
  );
}
