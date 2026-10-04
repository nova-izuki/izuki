import { Fragment, useState, type ReactNode } from "react";
import { Check, Copy } from "lucide-react";
import { api } from "../lib/ipc";

/**
 * A reply, written the way the chat apps people know show it: **bold**,
 * `code`, lists, headings, links you can click, and code/command blocks with
 * a Copy button. Built from plain React elements — nothing the AI writes is
 * ever run as HTML.
 */
export function ChatText({ text }: { text: string }) {
  const parts = text.split(/```/);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? <CodeBlock key={i} raw={part} /> : <Prose key={i} text={part} />
      )}
    </>
  );
}

function CodeBlock({ raw }: { raw: string }) {
  // ```powershell\nGet-ChildItem\n``` — the first line may name the language.
  const nl = raw.indexOf("\n");
  const first = nl >= 0 ? raw.slice(0, nl).trim() : "";
  const lang = /^[\w+#.-]{1,20}$/.test(first) ? first : "";
  const code = (lang ? raw.slice(nl + 1) : raw).replace(/\n$/, "");
  const [copied, setCopied] = useState(false);
  return (
    <div className="my-1.5 overflow-hidden rounded-[10px] border border-white/10 bg-black/35">
      <div className="flex items-center justify-between px-2 py-1 text-[10px] text-izk-muted">
        <span>{lang || "code"}</span>
        <button
          type="button"
          onClick={() => {
            void navigator.clipboard.writeText(code).then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 1400);
            });
          }}
          className="flex items-center gap-1 rounded-full px-1.5 py-0.5 hover:bg-white/10 hover:text-izk-ink"
        >
          {copied ? <Check size={11} /> : <Copy size={11} />} {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="max-h-[260px] overflow-auto whitespace-pre px-2 pb-2 font-mono text-[11px] leading-snug text-izk-ink">{code}</pre>
    </div>
  );
}

function Prose({ text }: { text: string }) {
  const lines = text.split("\n");
  const out: ReactNode[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;
  const flush = () => {
    if (!list) return;
    const items = list.items.map((it, j) => <li key={j}>{inline(it)}</li>);
    out.push(
      list.ordered ? (
        <ol key={out.length} className="my-1 list-decimal space-y-0.5 pl-5">{items}</ol>
      ) : (
        <ul key={out.length} className="my-1 list-disc space-y-0.5 pl-5">{items}</ul>
      )
    );
    list = null;
  };
  lines.forEach((line, i) => {
    const bullet = /^\s*[-*•]\s+(.*)$/.exec(line);
    const num = /^\s*\d+[.)]\s+(.*)$/.exec(line);
    if (bullet || num) {
      const ordered = !!num;
      if (list && list.ordered !== ordered) flush();
      if (!list) list = { ordered, items: [] };
      list.items.push((bullet ?? num)![1]);
      return;
    }
    flush();
    const head = /^\s*#{1,4}\s+(.*)$/.exec(line);
    if (head) {
      out.push(<div key={out.length} className="mt-1.5 font-semibold text-izk-ink">{inline(head[1])}</div>);
      return;
    }
    out.push(
      <Fragment key={out.length}>
        {inline(line)}
        {i < lines.length - 1 && <br />}
      </Fragment>
    );
  });
  flush();
  return <>{out}</>;
}

/** **bold**, *italic*, `code` and links inside one line. */
function inline(s: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\(https?:\/\/[^)\s]+\)|https?:\/\/[^\s)]+|\*[^*\s][^*]*\*)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(s))) {
    if (m.index > last) out.push(s.slice(last, m.index));
    const t = m[0];
    const k = out.length;
    if (t.startsWith("**")) out.push(<b key={k} className="font-semibold">{t.slice(2, -2)}</b>);
    else if (t.startsWith("`")) out.push(<code key={k} className="rounded bg-black/30 px-1 font-mono text-[11.5px]">{t.slice(1, -1)}</code>);
    else if (t.startsWith("[")) {
      const label = t.slice(1, t.indexOf("]("));
      const url = t.slice(t.indexOf("](") + 2, -1);
      out.push(<Link key={k} url={url} label={label} />);
    } else if (t.startsWith("http")) {
      // A full stop or comma right after a bare link isn't part of it.
      const url = t.replace(/[.,;:!?]+$/, "");
      out.push(<Link key={k} url={url} label={url.replace(/^https?:\/\/(www\.)?/, "").slice(0, 48)} />);
      if (url.length < t.length) out.push(t.slice(url.length));
    } else out.push(<i key={k}>{t.slice(1, -1)}</i>);
    last = m.index + t.length;
  }
  if (last < s.length) out.push(s.slice(last));
  return out;
}

function Link({ url, label }: { url: string; label: string }) {
  return (
    <button
      type="button"
      onClick={() => void api.openUrl(url)}
      className="inline text-left text-izk-teal underline decoration-izk-teal/40 underline-offset-2 hover:decoration-izk-teal"
      title={url}
    >
      {label}
    </button>
  );
}
