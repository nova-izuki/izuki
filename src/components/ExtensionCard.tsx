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
  useEffect(() => {
    const look = () => void api.extStatus().then(setOn).catch(() => undefined);
    look();
    const t = setInterval(look, 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <Section
      id="settings-extension"
      title="Browser extension"
      hint="Izuki in your browser: right-click any text to Explain, Translate, Sum up, Read aloud, Save to Nova Notes or Remind me later; Alt+Shift+I asks about the page; a Focus guard during Focus mode. It also lets Izuki see pages exactly, so clicks never miss."
      right={<Badge tone={on ? "good" : "warn"}>{on ? "connected" : "not added"}</Badge>}
    >
      {on ? (
        <div className="flex flex-col gap-1.5 text-[12.5px] text-izk-ink">
          <p>✅ Connected. Try it: select some text on any page, right-click → <b>Izuki</b>.</p>
          <p className="text-[11.5px] text-izk-muted">
            Added it before version 1.1? To get the new right-click menu:{" "}
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
    </Section>
  );
}
