import { useEffect, useRef, useState } from "react";
import { Plus, Trash2, Upload, X } from "lucide-react";
import { useIzuki } from "../lib/store";
import { faceGender, faceId, faceLooks, isFace, withLook } from "../lib/faces";
import { api } from "../lib/ipc";
import { Toggle } from "./ui";
import type { Settings } from "../lib/types";
import type { FaceLook, SavedFace } from "../../docs/app/model-orb.js";

type FaceModule = typeof import("../../docs/app/model-orb.js");

const ORBS: [Settings["orb_style"], string][] = [
  ["liquid", "Liquid glass"], ["ferrofluid", "Clear water"], ["dew", "Pure water"], ["ripple", "Tidal pearl"],
  ["constellation", "Star crystal"], ["particles", "Stardust"], ["face", "Hologram face"], ["ferro", "Ferrofluid"],
];

/** The face code (three.js + models) loads only when this panel opens. */
function useFaceModule() {
  const [mod, setMod] = useState<FaceModule | null>(null);
  const [saved, setSaved] = useState<SavedFace[]>([]);
  useEffect(() => {
    let alive = true;
    void import("../../docs/app/model-orb.js").then((m) => {
      if (!alive) return;
      setMod(m);
      void m.savedFaces().then((f) => alive && setSaved(f));
    });
    return () => { alive = false; };
  }, []);
  return { mod, saved, refresh: async () => mod && setSaved(await mod.savedFaces()) };
}

function Tile({ on, label, img, onClick, children }: { on: boolean; label: string; img?: string; onClick: () => void; children?: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      title={label}
      onClick={onClick}
      className={`group relative flex flex-col items-center gap-1 rounded-[14px] border p-1.5 text-[10.5px] transition-colors ${on ? "border-izk-teal/70 bg-izk-teal/12" : "border-white/10 bg-white/5 hover:bg-white/10"}`}
    >
      <span className="grid aspect-square w-full place-items-center overflow-hidden rounded-[10px] bg-[radial-gradient(circle_at_50%_40%,#2a2f55,#0b0d1c)]">
        {img ? <img src={img} alt="" className="h-full w-full object-contain" draggable={false} /> : children}
      </span>
      <span className="w-full truncate text-center leading-tight">{label}</span>
    </button>
  );
}

/** Pick Izuki's look: an orb, one of the 3D faces, one you added, or your own. */
export function LookPicker() {
  const style = useIzuki((s) => s.settings.orb_style);
  const patch = useIzuki((s) => s.patchSettings);
  const { mod, saved, refresh } = useFaceModule();
  const [busy, setBusy] = useState("");
  const [note, setNote] = useState("");
  const [howTo, setHowTo] = useState(false);
  const addRef = useRef<HTMLInputElement>(null);
  const meRef = useRef<HTMLInputElement>(null);

  const match = useIzuki((s) => s.settings.match_voice_face);
  const pick = (s: Settings["orb_style"]) => {
    patch({ orb_style: s });
    if (isFace(s)) void mod?.preloadFace(faceId(s)).catch(() => {});
    // "Match voice and character": a woman's face speaks with a woman's voice.
    const g = faceGender(s);
    if (g && match) {
      void api
        .voiceForFace(g === "male")
        .then((p) => {
          if (!p) return;
          patch({ persona: p.id, persona_name: "", persona_voice: "", cloud_voice: "", voice_rate: 0, voice_pitch: 0, voice_name: p.kokoro });
          setNote(`Voice switched to ${p.name} to match. (Turn off "Match voice and character" to choose your own.)`);
        })
        .catch(() => undefined);
    }
  };
  const add = async (file: File | undefined, kind: "face" | "me") => {
    if (!file || !mod) return;
    setNote("");
    setBusy(kind === "me" ? "Setting up your face…" : "Adding the face…");
    try {
      const card = await mod.addFace(file, kind);
      await refresh();
      pick(`model:${card.id}`);
      setHowTo(false);
      setNote(card.talks ? "Ready — its mouth, eyes and head move for real." : "Ready. This model has no face rig, so it talks with a shader jaw (like the defaults).");
    } catch (e) {
      setNote(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy("");
    }
  };
  const remove = async (id: string) => {
    if (!mod) return;
    await mod.removeFace(id);
    await refresh();
    if (style === `model:${id}`) pick("model:holo-female");
  };
  const me = saved.find((f) => f.kind === "me");
  const mine = saved.filter((f) => f.kind !== "me");

  return (
    <div className="space-y-3">
      <section>
        <h4 className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-izk-muted">Orbs</h4>
        <div className="flex flex-wrap gap-1.5">
          {ORBS.map(([id, label]) => (
            <button key={id} type="button" aria-pressed={style === id} onClick={() => pick(id)} className={`izk-pill px-2.5 py-1 text-[11px] ${style === id ? "border-izk-teal/70 bg-izk-teal/15" : ""}`}>{label}</button>
          ))}
        </div>
      </section>

      <section>
        <h4 className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-izk-muted">3D faces</h4>
        <div className="grid grid-cols-4 gap-1.5">
          {(mod?.FACES ?? []).map((f) => (
            <Tile key={f.id} on={style === `model:${f.id}`} label={f.name} img={f.thumb} onClick={() => pick(`model:${f.id}`)} />
          ))}
          {mine.map((f) => (
            <div key={f.id} className="relative">
              <Tile on={style === `model:${f.id}`} label={f.name} img={f.thumb} onClick={() => pick(`model:${f.id}`)} />
              <button type="button" aria-label={`Remove ${f.name}`} title="Remove" onClick={() => void remove(f.id)} className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white/80 hover:text-white"><Trash2 size={11} /></button>
            </div>
          ))}
          <Tile on={false} label="Add a face" onClick={() => addRef.current?.click()}><Plus size={22} className="text-izk-muted" /></Tile>
        </div>
        <input ref={addRef} type="file" accept=".glb,model/gltf-binary" hidden onChange={(e) => { void add(e.target.files?.[0], "face"); e.target.value = ""; }} />
        <p className="mt-1 text-[10.5px] text-izk-muted">Add any .glb model (Tencent Hunyuan3D, Meshy, Sketchfab…). It stays on this PC.</p>
      </section>

      <label className="flex items-center justify-between gap-2 rounded-[12px] border border-white/10 bg-white/5 px-3 py-2 text-[11.5px]">
        <span>
          <b className="text-izk-ink">Match voice and character</b>
          <span className="block text-[10.5px] text-izk-muted">A woman's face speaks with a woman's voice; picking a man's voice brings up a man's face. Off = my own choice.</span>
        </span>
        <Toggle checked={match} onChange={(v) => patch({ match_voice_face: v })} />
      </label>

      <section>
        <h4 className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-izk-muted">My face</h4>
        <div className="grid grid-cols-4 gap-1.5">
          {me ? (
            <div className="relative">
              <Tile on={style === "model:me"} label="My face" img={me.thumb} onClick={() => pick("model:me")} />
              <button type="button" aria-label="Remove my face" title="Remove" onClick={() => void remove("me")} className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white/80 hover:text-white"><Trash2 size={11} /></button>
            </div>
          ) : null}
          <Tile on={false} label={me ? "Replace" : "Make my face"} onClick={() => setHowTo(true)}><Upload size={20} className="text-izk-muted" /></Tile>
        </div>
        <input ref={meRef} type="file" accept=".glb,model/gltf-binary" hidden onChange={(e) => { void add(e.target.files?.[0], "me"); e.target.value = ""; }} />
      </section>

      {busy && <p className="text-[11px] text-izk-teal">{busy}</p>}
      {note && !busy && <p className="text-[11px] text-izk-muted">{note}</p>}

      {howTo && (
        <div role="dialog" aria-label="Make your own 3D face" className="rounded-[14px] border border-white/15 bg-black/40 p-3 text-[11.5px]">
          <div className="mb-2 flex items-center justify-between"><strong>Your face, in 3D (free, about 3 minutes)</strong><button type="button" aria-label="Close" onClick={() => setHowTo(false)}><X size={14} /></button></div>
          <ol className="list-decimal space-y-1 pl-4 text-izk-muted">
            <li>Open <a className="text-izk-teal underline" href="https://avaturn.me" target="_blank" rel="noreferrer">avaturn.me</a> and sign in (free).</li>
            <li>Take or upload a front photo of your face (and the side ones if it asks).</li>
            <li>Pick your hair and clothes, then <b>Export → Download .glb</b>.</li>
            <li>Come back here and choose that file:</li>
          </ol>
          <button type="button" className="izk-pill mt-2 px-3 py-1.5 text-[11.5px]" onClick={() => meRef.current?.click()}><Upload size={12} className="mr-1 inline" />Choose my .glb</button>
          <p className="mt-2 text-[10.5px] text-izk-muted">An Avaturn (or Ready Player Me) model has a real face rig: your mouth moves with Izuki's voice, your eyes blink and look around. It's kept only on this PC.</p>
        </div>
      )}

      {isFace(style) && mod && <FaceTuner id={faceId(style)} mod={mod} rigged={faceId(style) === "me" || !!saved.find((f) => f.id === faceId(style))?.rigged} />}
    </div>
  );
}

/** Change how the chosen face looks. */
function FaceTuner({ id, mod, rigged }: { id: string; mod: FaceModule; rigged: boolean }) {
  const raw = useIzuki((s) => s.settings.avatar);
  const patch = useIzuki((s) => s.patchSettings);
  const info = mod.faceInfo(id);
  const saved = faceLooks(raw)[id] ?? {};
  const look: FaceLook = { ...mod.DEFAULT_LOOK, glow: info?.glow ?? 0, accent: info?.accent ?? "#a78bfa", ...saved };
  const set = (change: Partial<FaceLook>) => patch({ avatar: withLook(raw, id, change) });
  const slider = (key: "gloss" | "glow" | "scale" | "y" | "rot", label: string, min: number, max: number, step: number) => (
    <label className="block text-[11px] text-izk-muted">
      {label}
      <input aria-label={label} type="range" min={min} max={max} step={step} value={look[key]} onChange={(e) => set({ [key]: Number(e.target.value) })} className="mt-1 block w-full accent-izk-teal" />
    </label>
  );
  const colour = (key: "tint" | "hair" | "accent", label: string, fallback: string) => (
    <label className="flex items-center gap-2 text-[11px] text-izk-muted">
      <input aria-label={label} type="color" value={look[key] || fallback} onChange={(e) => set({ [key]: e.target.value })} className="h-6 w-8 cursor-pointer rounded border border-white/15 bg-transparent" />
      {label}
    </label>
  );
  return (
    <section className="rounded-[14px] border border-white/10 bg-white/5 p-3">
      <div className="mb-2 flex items-center justify-between">
        <h4 className="text-[11px] font-semibold uppercase tracking-wide text-izk-muted">Customise</h4>
        <button type="button" className="izk-pill px-2 py-0.5 text-[10.5px]" onClick={() => patch({ avatar: withLook(raw, id, null) })}>Reset</button>
      </div>
      <div className="mb-2">
        <div className="mb-1 text-[11px] text-izk-muted">Skin tone</div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Swatch on={look.tint === "#ffffff"} colour="#ffffff" label="As made" onClick={() => set({ tint: "#ffffff" })} />
          {mod.SKIN_TONES.map(([name, hex]) => (
            <Swatch key={hex} on={look.tint === hex} colour={hex} label={name} onClick={() => set({ tint: hex })} />
          ))}
          {colour("tint", "Custom", "#ffffff")}
        </div>
      </div>
      <div className="mb-2">
        <Choice label="Haircut" value={look.cut ?? ""} options={mod.haircutsFor(id, rigged)} onChange={(v) => set({ cut: v })} />
      </div>
      {(rigged || !!look.cut) && (
        <div className="mb-2">
          <div className="mb-1 text-[11px] text-izk-muted">Hair colour</div>
          <div className="flex flex-wrap items-center gap-1.5">
            {mod.HAIR_COLOURS.map(([name, hex]) => (
              <Swatch key={hex} on={look.hair === hex} colour={hex} label={name} onClick={() => set({ hair: hex })} />
            ))}
            {colour("hair", "Custom", "#2b1d16")}
          </div>
        </div>
      )}
      <div className="mb-2 grid grid-cols-2 gap-2">
        <Choice label="Style" value={look.style ?? "real"} options={[["real", "Real"], ["comic", "Comic"], ["flat", "Flat vector"]]} onChange={(v) => set({ style: v as FaceLook["style"] })} />
        {rigged && (
          <Choice
            label="Show"
            value={look.headOnly ? "head" : look.frame ?? "shoulders"}
            options={[["head", "Head"], ["shoulders", "Head & shoulders"], ["half", "Half body"], ["full", "Full body"]]}
            onChange={(v) => set({ frame: v as FaceLook["frame"], headOnly: false })}
          />
        )}
      </div>
      <label className="mb-2 flex items-center gap-2 text-[11px] text-izk-muted">
        <input type="checkbox" checked={!!look.bare} onChange={(e) => set({ bare: e.target.checked })} className="accent-izk-teal" />
        Without the orb (just the character)
      </label>
      <div className="grid grid-cols-3 gap-2">
        {colour("accent", "Glow colour", "#a78bfa")}
      </div>
      <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5">
        {slider("glow", "Hologram glow", 0, 1, 0.05)}
        {slider("gloss", "Shine", 0, 1, 0.05)}
        {slider("scale", "Size", 0.6, 1.8, 0.05)}
        {slider("y", "Height", -0.6, 0.6, 0.02)}
        {slider("rot", "Turn", -40, 40, 1)}
      </div>
    </section>
  );
}

function Swatch({ on, colour, label, onClick }: { on: boolean; colour: string; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`h-6 w-6 rounded-full border transition-transform hover:scale-110 ${on ? "border-izk-teal ring-2 ring-izk-teal/60" : "border-white/25"}`}
      style={{ background: colour }}
    />
  );
}

function Choice({ label, value, options, onChange }: { label: string; value: string; options: Array<[string, string]>; onChange: (v: string) => void }) {
  return (
    <label className="block text-[11px] text-izk-muted">
      {label}
      <select value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 block h-[28px] w-full rounded-[8px] border border-white/10 bg-white/6 px-1.5 text-[11.5px] text-izk-ink outline-none">
        {options.map(([v, l]) => (
          <option key={v} value={v} className="bg-[#1b2230]">
            {l}
          </option>
        ))}
      </select>
    </label>
  );
}
