import { useState } from "react";
import { Bug, FolderOpen, Send } from "lucide-react";
import { Row, Section, Toggle } from "./ui";
import { useIzuki } from "../lib/store";
import { api } from "../lib/ipc";

/**
 * "Something wrong?" — tell Izuki's maker in one tap. Your words and Izuki's
 * recent log go to the bug tracker, cleaned of keys, emails and numbers
 * first (bugs.rs). Crashes and errors are reported by themselves while the
 * switch is on.
 */
export function BugCard() {
  const settings = useIzuki((s) => s.settings);
  const patch = useIzuki((s) => s.patchSettings);
  const [what, setWhat] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "saved">("idle");

  const send = async () => {
    setState("sending");
    const sent = await api.reportBug(what).catch(() => false);
    setState(sent ? "sent" : "saved");
    if (sent) setWhat("");
  };

  return (
    <Section title="Something wrong?" hint="Describe the problem. Reports stay in your local log unless a reporting server is configured. You can also review and submit an issue on GitHub.">
      <textarea
        value={what}
        onChange={(e) => {
          setWhat(e.target.value);
          if (state !== "sending") setState("idle");
        }}
        rows={2}
        placeholder="e.g. I said “play lofi” and it didn't click the video"
        className="izk-no-drag w-full resize-none rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-[12.5px] text-izk-ink outline-none placeholder:text-izk-muted/70 focus:border-white/25"
      />
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={state === "sending"}
          onClick={() => void send()}
          className="izk-btn-primary izk-no-drag flex h-[34px] items-center gap-1.5 px-4 text-[12px]"
        >
          <Send size={13} strokeWidth={2.4} />
          {state === "sending" ? "Sending…" : "Send report"}
        </button>
        <button
          type="button"
          onClick={() => void api.openLogFolder()}
          className="izk-pill izk-no-drag flex h-[34px] items-center gap-1.5 px-3.5 text-[11.5px]"
        >
          <FolderOpen size={13} strokeWidth={2.3} />
          Open my log
        </button>
        <span className="text-[11.5px] text-izk-muted" aria-live="polite">
          {state === "sent" && "Thanks — sent! 🙏"}
          {state === "saved" && "Saved in your log. Reports aren't switched on yet — tap “Open my log” to share the file."}
        </span>
        <button type="button" onClick={() => void api.openUrl("https://github.com/nova-izuki/izuki/issues/new")} className="izk-pill izk-no-drag h-[34px] px-3 text-[11.5px]">Report on GitHub</button>
      </div>

      <div className="izk-divider mt-3" />

      <Row
        label="Send error reports automatically"
        hint="When a reporting server is configured, send scrubbed diagnostics automatically. Otherwise errors stay in your local log. Review any log before sharing it publicly."
        icon={<Bug size={14} strokeWidth={2.3} />}
      >
        <Toggle checked={settings.send_bug_reports} onChange={(v) => patch({ send_bug_reports: v })} />
      </Row>
    </Section>
  );
}
