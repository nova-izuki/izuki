import { MousePointer2, Zap } from "lucide-react";
import { Row, Section, Toggle } from "./ui";
import { useIzuki } from "../lib/store";

/** Small things Izuki does on its own in the browser in front of you. Each
 * presses one clearly-named button — never typing, buying or signing in —
 * and waits while Izuki is busy with something you asked for. */
export function AutonomousCard() {
  const settings = useIzuki((s) => s.settings);
  const patch = useIzuki((s) => s.patchSettings);
  return (
    <Section id="settings-autonomous" title="On its own" hint="Little chores Izuki handles in your browser without asking. Off until you turn them on.">
      <Row label="Skip YouTube ads" hint="Presses “Skip” the moment it shows up." icon={<Zap size={15} />}>
        <Toggle checked={settings.auto_skip_ads} onChange={(v) => patch({ auto_skip_ads: v })} />
      </Row>
      <Row label="Say no to cookie banners" hint="Presses “Reject all” or “Only necessary” when a site asks." icon={<MousePointer2 size={15} />}>
        <Toggle checked={settings.auto_reject_cookies} onChange={(v) => patch({ auto_reject_cookies: v })} />
      </Row>
    </Section>
  );
}
