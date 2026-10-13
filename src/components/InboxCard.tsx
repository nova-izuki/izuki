import { useEffect, useState } from "react";
import { api, emit, EV, type InboxDigest, type InboxItem, type SentItem } from "../lib/ipc";
import { Row, Section } from "./ui";

const KIND: Record<string, string> = {
  reply: "💬", money: "💳", delivery: "📦", school: "🎓", work: "💼", meeting: "📅", security: "🔐", personal: "🙂",
};

/**
 * The inbox, gone through: what matters in your Gmail (urgent first), and
 * for each one "Draft a reply" (the draft is shown — nothing is sent without
 * your yes) or "Follow up in 3 days" (a reminder). Plus what Izuki really
 * sent for you. Reading uses your linked Gmail (Apps); nothing here sends.
 */
export function InboxCard() {
  const [digest, setDigest] = useState<InboxDigest | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState<SentItem[]>([]);
  const [note, setNote] = useState("");

  useEffect(() => {
    void api.sentHistory().then(setSent).catch(() => undefined);
  }, []);

  const look = (fresh: boolean) => {
    setBusy(true);
    setError("");
    void api
      .inboxDigest(fresh)
      .then((d) => setDigest(d))
      .catch((e) => setError(/composio|key|not connected|link/i.test(String(e)) ? "Link your Gmail first (Connect, above)." : `Couldn't read your inbox: ${e}`))
      .finally(() => {
        setBusy(false);
        void api.sentHistory().then(setSent).catch(() => undefined);
      });
  };

  const draft = (m: InboxItem) => {
    void emit(EV.runChat, {
      id: Date.now(),
      text: `Draft a reply to my email from ${m.from}${m.subject ? ` about “${m.subject}”` : ""}. Show me the draft first — don't send it.`,
    });
    setNote(`Drafting a reply to ${m.from} — it shows up in the chat for you to check. Nothing is sent until you say yes.`);
  };

  const followUp = (m: InboxItem) => {
    void api
      .followUp(`Follow up with ${m.from}${m.subject ? ` about “${m.subject}”` : ""} if they haven't replied.`, 3)
      .then(() => setNote(`I'll remind you to follow up with ${m.from} in 3 days.`))
      .catch(() => setNote("Couldn't set that reminder."));
  };

  const items = [...(digest?.items ?? [])].sort((a, b) => Number(b.urgent) - Number(a.urgent));

  return (
    <Section
      id="apps-inbox"
      title="Inbox"
      hint="What matters in your Gmail, urgent first — with a reply drafted for you to check, or a reminder to follow up. Nothing is ever sent without your yes."
    >
      <Row label="Go through my inbox" hint="Reads the last few days (not promotions or social) and picks out what needs you. Uses your linked Gmail.">
        <button type="button" disabled={busy} onClick={() => look(!!digest)} className="izk-btn-primary izk-no-drag h-[28px] px-3 text-[11.5px]">
          {busy ? "Reading…" : digest ? "Check again" : "Check my inbox"}
        </button>
      </Row>
      {error && <p className="text-[11.5px] text-izk-danger">{error}</p>}
      {digest && (
        <div className="mt-1 space-y-1.5">
          {digest.summary && <p className="text-[12px] leading-snug text-izk-ink">{digest.summary}</p>}
          {items.length === 0 && <p className="text-[11.5px] text-izk-muted">Nothing that needs you — {digest.looked_at} emails looked at.</p>}
          {items.map((m, i) => (
            <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-[11.5px]">
              <div className="flex items-center gap-1.5">
                <span aria-hidden>{KIND[m.kind] ?? "📧"}</span>
                <b className="min-w-0 flex-1 truncate text-izk-ink">{m.from}</b>
                {m.urgent && <span className="rounded-full bg-izk-danger/25 px-1.5 text-[10px] font-semibold text-white">Urgent</span>}
              </div>
              {m.subject && <div className="mt-0.5 truncate text-izk-muted">{m.subject}</div>}
              {m.action && <div className="mt-1 text-izk-ink">→ {m.action}</div>}
              <div className="mt-1.5 flex gap-1.5">
                <button type="button" onClick={() => draft(m)} className="izk-pill izk-no-drag px-2.5 py-0.5 text-[11px]">✍️ Draft a reply</button>
                <button type="button" onClick={() => followUp(m)} className="izk-pill izk-no-drag px-2.5 py-0.5 text-[11px]">⏰ Follow up in 3 days</button>
              </div>
            </div>
          ))}
          {digest.skipped > 0 && <p className="text-[10.5px] text-izk-muted">{digest.skipped} newsletters and notifications skipped.</p>}
        </div>
      )}
      {note && <p className="mt-1.5 text-[11.5px] text-izk-teal">{note}</p>}
      {sent.length > 0 && (
        <div className="mt-2">
          <div className="text-[12px] font-medium text-izk-ink">Done in your apps (this session)</div>
          <ul className="mt-1 space-y-0.5 text-[11px] text-izk-muted">
            {sent.map((s, i) => (
              <li key={i}>
                {new Date(s.at).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} · {s.app}: {s.what}
                {s.to ? ` → ${s.to}` : ""}
                {s.subject ? ` (“${s.subject}”)` : ""}
              </li>
            ))}
          </ul>
        </div>
      )}
    </Section>
  );
}
