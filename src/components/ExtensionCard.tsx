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
      hint="Lets Izuki see web pages exactly — every link and button, and where links go — so clicks never miss. In Jarvis mode it clicks and types right inside the page."
      right={<Badge tone={on ? "good" : "warn"}>{on ? "connected" : "not added"}</Badge>}
    >
      {on ? (
        <p className="text-[12.5px] text-izk-ink">
          ✅ Connected. When a browser is in front, Izuki uses the page's real buttons and links.
        </p>
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
