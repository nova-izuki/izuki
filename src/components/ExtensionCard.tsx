import { useEffect, useState } from "react";
import { Globe } from "lucide-react";
import { api } from "../lib/ipc";
import { Badge, Section } from "./ui";

/**
 * The Izuki browser extension: lets Izuki see web pages exactly — every
 * real link and button — and click or type inside them (in Jarvis mode, with
 * no mouse at all). Free, works in Chrome and Edge.
 */
export function ExtensionCard() {
  const [on, setOn] = useState(false);
  const [old, setOld] = useState<{ version: string | null; latest: string } | null>(null);
  const [browsers, setBrowsers] = useState<Array<{ id: string; name: string }>>([]);
  const [browser, setBrowser] = useState("");
  const [prepared, setPrepared] = useState<{ folder: string; version: string; opened: boolean } | null>(null);
  const [preparing, setPreparing] = useState(false);
  const [setupError, setSetupError] = useState("");
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    let alive = true;
    void api.extensionBrowsers().then((list) => { if (alive) { setBrowsers(list); setBrowser(list[0]?.id ?? ""); } }).catch(() => {});
    return () => { alive = false; };
  }, []);
  const prepare = async () => {
    if (preparing || !browser) return;
    setPreparing(true); setSetupError(""); setPrepared(null); setCopied(false);
    try { setPrepared(await api.prepareBrowserExtension(browser)); }
    catch (e) { setSetupError(String(e).replace(/^Error:\s*/, "")); }
    finally { setPreparing(false); }
  };
  useEffect(() => {
    const look = () =>
      void api
        .extInfo()
        .then((i) => {
          setOn(i.connected);
          setOld(i.outdated ? { version: i.version, latest: i.latest } : null);
        })
        .catch(() => undefined);
    look();
    const t = setInterval(look, 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <Section
      id="settings-extension"
      title="Browser extension"
      hint="Izuki in your browser: right-click any text to Explain, Translate, Sum up, Read aloud, Save to Izuki Notes or Remind me later; Alt+Shift+I asks about the page; a Focus guard during Focus mode. It also lets Izuki see pages exactly, so clicks never miss."
      right={<Badge tone={on && !old ? "good" : "warn"}>{on ? (old ? "update it" : "connected") : "not added"}</Badge>}
    >
      <div className="mb-3 space-y-2 text-[12px]">
        <p>{on && !old ? "Connected. Click Izuki's extension icon to open its chat panel." : "Izuki can unpack the extension and open your browser's extension page. Finish adding it in the browser."}</p>
        {browsers.length > 0 && <div className="flex flex-wrap items-center gap-2">
          <select aria-label="Browser for the extension" value={browser} disabled={preparing} onChange={(e) => { setBrowser(e.target.value); setPrepared(null); }} className="izk-field izk-no-drag max-w-full py-1 text-[12px]">{browsers.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}</select>
          <button type="button" disabled={preparing || !browser} onClick={() => void prepare()} className="izk-btn-primary izk-no-drag px-3 py-2 text-[12px]">{preparing ? "Preparing…" : "Set up in this browser"}</button>
        </div>}
        {prepared && <div role="status" className="space-y-2 rounded-xl border border-izk-teal/30 bg-izk-teal/5 p-3">
          <p>Version {prepared.version} is unpacked and ready. {prepared.opened ? "The extension page is open in your chosen browser." : "Open your browser's Extensions page."}</p>
          <ol className="list-decimal space-y-1 pl-5"><li>Turn on <b>Developer mode</b>.</li><li>Choose <b>Load unpacked</b> and paste this folder location:</li></ol>
          <input aria-label="Prepared extension folder" value={prepared.folder} readOnly onFocus={(e) => e.target.select()} className="izk-field izk-no-drag w-full text-[11px]" />
          <button type="button" className="izk-pill izk-no-drag px-2.5 py-1" onClick={() => void navigator.clipboard.writeText(prepared.folder).then(() => setCopied(true)).catch(() => setSetupError("Select the folder location above and press Ctrl+C to copy it."))}>{copied ? "Copied" : "Copy folder location"}</button>
          <p className="text-[11px] text-izk-muted">Already loaded from this folder? Press Reload on Izuki instead. This card shows connected after the browser connects.</p>
        </div>}
        {setupError && <p role="alert" className="text-izk-danger">{setupError}</p>}
        <p className="text-[11px] text-izk-muted">Chrome, Edge, Brave, Vivaldi and Opera desktop setup. Browser confirmation is required. Firefox and Safari need a separate extension build.</p>
      </div>
      <details className="text-[11.5px]"><summary className="izk-no-drag mb-2 cursor-pointer text-izk-muted">Manual download and setup</summary>
      {on ? (
        <div className="flex flex-col gap-1.5 text-[12.5px] text-izk-ink">
          {old ? (
            <p role="status">
              ⚠️ Your extension is an older version{old.version ? ` (${old.version})` : ""} — version {old.latest} is out, and Blackboard and some clicks need it.
            </p>
          ) : (
            <p>✅ Connected. Try it: select some text on any page, right-click → <b>Izuki</b>.</p>
          )}
          <p className="text-[11.5px] text-izk-muted">
            To update:{" "}
            <button
              type="button"
              onClick={() => void api.openUrl("https://nova-izuki.github.io/izuki/extension/izuki-extension.zip")}
              className="underline decoration-izk-muted/50 underline-offset-2 hover:text-izk-ink"
            >
              download it again
            </button>
            , unzip it over the old folder, then press the ↻ reload button on Izuki in <b>chrome://extensions</b> (or edge://extensions).
          </p>
        </div>
      ) : (
        <ol className="list-decimal space-y-2 pl-5 text-[12.5px] leading-relaxed text-izk-ink">
          <li>
            <button
              type="button"
              onClick={() => void api.openUrl("https://nova-izuki.github.io/izuki/extension/izuki-extension.zip")}
              className="izk-pill inline-flex items-center gap-1.5 px-2.5 py-1 text-[11.5px]"
            >
              <Globe size={12} /> Download the extension
            </button>{" "}
            and unzip it (right-click → <b>Extract All</b>).
          </li>
          <li>
            In Chrome go to <b>chrome://extensions</b> (in Edge: <b>edge://extensions</b>) and turn on <b>Developer mode</b>.
          </li>
          <li>
            Click <b>Load unpacked</b> and pick the <b>izuki-extension</b> folder. This card turns green by itself.
          </li>
        </ol>
      )}
      </details>
    </Section>
  );
}
