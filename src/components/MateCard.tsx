import { PawPrint } from "lucide-react";
import { Row, Section, Toggle } from "./ui";
import { useIzuki } from "../lib/store";

/** The desktop mate (mate.rs / Mate.tsx): your character living on the desktop. */
export function MateCard() {
  const settings = useIzuki((s) => s.settings);
  const patch = useIzuki((s) => s.patchSettings);
  const select = "izk-field izk-no-drag max-w-[150px] py-1 text-[11.5px]";
  return (
    <Section
      id="settings-mate"
      title="Desktop mate"
      hint="Your character lives on your desktop with its pet: it walks along the taskbar, dances to your music, dozes off when you're away, and reacts to what you do — switching apps, builds finishing, downloads — in its own voice. Double-click it to talk (Izuki's whole brain answers), drag it anywhere, right-click for its menu. It hides during fullscreen games and videos."
    >
      <Row label="Show my mate" hint="Off by default: it stays on your desktop all the time, which can slow a PC down." icon={<PawPrint size={14} strokeWidth={2.3} />}>
        <Toggle checked={settings.mate_enabled} onChange={(v) => patch({ mate_enabled: v })} />
      </Row>
      <Row label="Its pet" hint="Trots behind it on a lead.">
        <select aria-label="Pet" className={select} value={settings.mate_pet} onChange={(e) => patch({ mate_pet: e.target.value })}>
          <option value="cat">Cat</option>
          <option value="dog">Puppy</option>
          <option value="none">No pet</option>
        </select>
      </Row>
      <Row label="How chatty" hint="How often it speaks up on its own. It always tells you when a build or download finishes.">
        <select aria-label="How chatty" className={select} value={settings.mate_chatty} onChange={(e) => patch({ mate_chatty: e.target.value })}>
          <option value="quiet">Quiet</option>
          <option value="normal">Normal</option>
          <option value="chatty">Chatty</option>
        </select>
      </Row>
      <Row label="Wander around" hint="A little walk along the taskbar now and then.">
        <Toggle checked={settings.mate_wander} onChange={(v) => patch({ mate_wander: v })} />
      </Row>
      <Row label="Say it out loud" hint="Its reactions in its voice, not just speech bubbles.">
        <Toggle checked={settings.mate_voice} onChange={(v) => patch({ mate_voice: v })} />
      </Row>
      <p className="text-[10.5px] leading-snug text-izk-muted">Its memory of your chats stays on this PC — right-click it → Clear memory to wipe it.</p>
    </Section>
  );
}
