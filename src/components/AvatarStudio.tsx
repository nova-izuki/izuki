import { useIzuki } from "../lib/store";
import { parseAvatar, type AvatarOptions } from "../lib/avatar";
import { BEARDS, EYE_COLOURS, GLASSES, HAIR_COLOURS, HAIR_STYLES, SKIN_TONES } from "../../docs/app/face3d.js";

/**
 * Style the 3D face like a game character: who it is (or "auto", which
 * follows the voice), hair and its colour, skin, eyes, a beard, glasses,
 * glowing seams and the light colour. Changes show live in the preview.
 */
const ACCENTS: Record<string, string> = { cyan: "40c8ff", violet: "9a6bff", pink: "ff5fb8", gold: "ffc44d", green: "45e39a", white: "e8f0ff" };

function pick<T extends string>(o: Record<string, string>): T {
  const k = Object.keys(o);
  return k[Math.floor(Math.random() * k.length)] as T;
}

export function AvatarStudio() {
  const settings = useIzuki((s) => s.settings);
  const patch = useIzuki((s) => s.patchSettings);
  const look = parseAvatar(settings.avatar);
  const set = (p: Partial<AvatarOptions>) => patch({ avatar: JSON.stringify({ ...look, ...p }) });
  const holo = settings.orb_style === "holo3d";
  const man = look.gender === "male";

  return (
    <div className="space-y-3 border-t border-white/10 p-3" id="avatar-studio">
      <div className="flex items-center justify-between gap-2">
        <strong className="text-xs">{holo ? "Hologram studio" : "Avatar studio"}</strong>
        <button
          type="button"
          className="izk-pill px-2 py-1 text-[11px]"
          onClick={() =>
            set({
              hair: pick(HAIR_STYLES),
              hairColor: pick(HAIR_COLOURS),
              skin: pick(SKIN_TONES),
              eyes: pick(EYE_COLOURS),
              beard: Math.random() < 0.5 ? "none" : pick(BEARDS),
              glasses: Math.random() < 0.7 ? "none" : pick(GLASSES),
              accent: "#" + ACCENTS[pick(ACCENTS)],
            })
          }
        >
          🎲 Surprise me
        </button>
      </div>
      <Chips
        label="Face"
        value={look.gender ?? "auto"}
        options={{ auto: "Auto · follows the voice", female: "Woman", male: "Man" }}
        onPick={(v) => set({ gender: v as AvatarOptions["gender"] })}
      />
      <Chips label="Hair" value={look.hair ?? (holo ? "none" : "")} options={HAIR_STYLES} onPick={(v) => set({ hair: v })} />
      {!holo && <Swatches label="Hair colour" value={look.hairColor} options={HAIR_COLOURS} onPick={(v) => set({ hairColor: v })} />}
      {!holo && <Swatches label="Skin" value={look.skin} options={SKIN_TONES} onPick={(v) => set({ skin: v })} />}
      {!holo && <Swatches label="Eyes" value={look.eyes} options={EYE_COLOURS} onPick={(v) => set({ eyes: v })} />}
      {(man || look.gender !== "female") && <Chips label="Beard (men)" value={look.beard ?? "none"} options={BEARDS} onPick={(v) => set({ beard: v })} />}
      <Chips label="Glasses" value={look.glasses ?? "none"} options={GLASSES} onPick={(v) => set({ glasses: v })} />
      <Swatches
        label={holo ? "Hologram colour" : "Light colour"}
        value={(look.accent ?? "").replace("#", "")}
        options={ACCENTS}
        raw
        onPick={(v) => set({ accent: "#" + v })}
      />
      {!holo && (
        <label className="flex items-center justify-between gap-2 text-[11.5px]">
          <span>Glowing cyber seams &amp; eyes</span>
          <input type="checkbox" className="accent-izk-teal" checked={!!look.tech} onChange={(e) => set({ tech: e.target.checked })} />
        </label>
      )}
    </div>
  );
}

function Chips({ label, value, options, onPick }: { label: string; value: string; options: Record<string, string>; onPick: (v: string) => void }) {
  return (
    <div>
      <div className="mb-1 text-[11px] text-izk-muted">{label}</div>
      <div className="flex flex-wrap gap-1">
        {Object.entries(options).map(([k, name]) => (
          <button
            key={k}
            type="button"
            aria-pressed={value === k}
            onClick={() => onPick(k)}
            className={"rounded-full px-2 py-[3px] text-[11px] transition " + (value === k ? "bg-izk-teal/80 text-black" : "bg-white/[0.07] hover:bg-white/[0.14]")}
          >
            {name}
          </button>
        ))}
      </div>
    </div>
  );
}

function Swatches({ label, value, options, onPick, raw }: { label: string; value?: string; options: Record<string, string>; onPick: (v: string) => void; raw?: boolean }) {
  return (
    <div>
      <div className="mb-1 text-[11px] text-izk-muted">{label}</div>
      <div className="flex flex-wrap gap-1.5">
        {Object.entries(options).map(([k, hex]) => {
          const id = raw ? hex : k;
          return (
            <button
              key={k}
              type="button"
              title={k}
              aria-label={k}
              aria-pressed={value === id}
              onClick={() => onPick(id)}
              className={"h-6 w-6 rounded-full border transition " + (value === id ? "border-white ring-2 ring-izk-teal" : "border-white/20 hover:scale-110")}
              style={{ background: "#" + hex }}
            />
          );
        })}
      </div>
    </div>
  );
}
