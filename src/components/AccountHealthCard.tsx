import { useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { api, IS_TAURI, type AccountHealth } from "../lib/ipc";
import { Section, cx } from "./ui";

async function openLink(url: string) {
  if (IS_TAURI) {
    const { openUrl } = await import("@tauri-apps/plugin-opener");
    await openUrl(url);
  } else {
    window.open(url, "_blank");
  }
}

const BADGE: Record<string, [string, string]> = {
  working: ["Working", "bg-emerald-400/15 text-emerald-300"],
  linked: ["Linked", "bg-sky-400/15 text-sky-300"],
  needs_sign_in: ["Sign in again", "bg-amber-300/15 text-amber-200"],
  error: ["Couldn't check", "bg-rose-400/15 text-rose-300"],
};

/**
 * Account health (accounts.rs): every app linked to Izuki, every account
 * behind it, and whether it really works — checked with one read-only call
 * each (10 s at most), never just "a link exists". Problems come with their
 * one-tap fix.
 */
export function AccountHealthCard() {
  const [h, setH] = useState<AccountHealth | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [opening, setOpening] = useState<string | null>(null);

  const check = (fresh: boolean) => {
    setBusy(true);
    setError("");
    void api
      .accountsHealth(fresh)
      .then(setH)
      .catch((e) => {
        console.error("account check failed", e);
        setError("Couldn't reach your connected apps — check your Composio key in Apps and your internet, then try again.");
      })
      .finally(() => setBusy(false));
  };
  const connect = (app: string) => {
    setOpening(app);
    void api
      .appsConnect(app)
      .then(openLink)
      .catch((e) => {
        console.error("connect failed", e);
        setError("Couldn't open the sign-in page — try again in a moment.");
      })
      .finally(() => setOpening(null));
  };

  return (
    <Section
      id="apps-health"
      title="Account health"
      hint="Which accounts Izuki can really use right now — each one checked with a quick read-only call, not just “a link exists”."
      right={
        <button type="button" disabled={busy} onClick={() => check(!!h)} className="izk-btn-primary izk-no-drag flex h-[28px] items-center gap-1.5 px-3 text-[11.5px]">
          {busy ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
          {h ? "Check again" : "Check my accounts"}
        </button>
      }
    >
      {error && <p className="text-[11.5px] text-izk-danger">{error}</p>}
      {!h && !busy && !error && <p className="text-[11.5px] text-izk-muted">Or ask in chat: “check my connected accounts”.</p>}
      {h && (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {h.apps.map((a) => {
            const problem = a.accounts.some((c) => c.state === "needs_sign_in") || (a.unfinished > 0 && !a.accounts.some((c) => c.state === "working" || c.state === "linked"));
            return (
              <div key={a.app} className={cx("rounded-[12px] border p-2.5", problem ? "border-amber-300/30 bg-amber-300/[0.05]" : "border-white/10 bg-white/[0.03]")}>
                <div className="flex items-center gap-2">
                  <span className="text-[12.5px] font-semibold text-izk-ink">{a.name}</span>
                  {problem && (
                    <button
                      type="button"
                      disabled={opening === a.app}
                      onClick={() => connect(a.app)}
                      className="izk-no-drag ml-auto rounded-full border border-amber-300/40 px-2 py-[1px] text-[10.5px] text-amber-100 hover:bg-amber-300/15"
                    >
                      {opening === a.app ? "Opening…" : a.accounts.length ? "Reconnect" : "Connect"}
                    </button>
                  )}
                </div>
                <ul className="mt-1.5 space-y-1">
                  {a.accounts.map((c) => {
                    const [label, cls] = BADGE[c.state] ?? ["?", "bg-white/10 text-izk-muted"];
                    return (
                      <li key={c.id} className="flex items-center gap-2 text-[11px]">
                        <span className={cx("shrink-0 rounded-full px-1.5 py-[1px] text-[9.5px] font-semibold", cls)}>{label}</span>
                        <span className="truncate text-izk-ink">{c.who || (c.state === "linked" ? "active link" : "an account")}</span>
                        {c.note && <span className="truncate text-izk-muted">— {c.note}</span>}
                      </li>
                    );
                  })}
                  {a.duplicates > 0 && <li className="text-[10.5px] text-izk-muted">+{a.duplicates} extra link{a.duplicates === 1 ? "" : "s"} to the same account (counted once)</li>}
                  {a.unfinished > 0 && (
                    <li className="text-[10.5px] text-izk-muted">
                      ⏳ {a.unfinished} sign-in{a.unfinished === 1 ? "" : "s"} started and never finished
                      {!problem && (
                        <button type="button" onClick={() => connect(a.app)} className="izk-no-drag ml-1.5 underline hover:text-izk-ink">
                          add an account
                        </button>
                      )}
                    </li>
                  )}
                </ul>
              </div>
            );
          })}
          {h.not_linked.length > 0 && (
            <div className="rounded-[12px] border border-dashed border-white/10 p-2.5 text-[11px] text-izk-muted sm:col-span-2">
              Not linked: {h.not_linked.join(", ")} — connect them in the list above when you want Izuki to use them.
            </div>
          )}
          <p className="text-[10.5px] text-izk-muted sm:col-span-2">Checked {h.at}. Read only — nothing was sent or changed.</p>
        </div>
      )}
    </Section>
  );
}
