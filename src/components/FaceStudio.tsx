import { useEffect, useRef, useState } from "react";
import { Plus, Trash2, Upload, X } from "lucide-react";
import { useIzuki } from "../lib/store";
import { faceId, faceLooks, isFace, withLook } from "../lib/faces";
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

  const pick = (s: Settings["orb_style"]) => {
    patch({ orb_style: s });
    if (isFace(s)) void mod?.preloadFace(faceId(s)).catch(() => {});
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
      <div className="grid grid-cols-3 gap-2">
        {colour("tint", "Skin tone", "#ffffff")}
        {rigged && colour("hair", "Hair", "#2b1d16")}
        {colour("accent", "Glow colour", "#a78bfa")}
      </div>
      <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5">
        {slider("glow", "Hologram glow", 0, 1, 0.05)}
        {slider("gloss", "Shine", 0, 1, 0.05)}
        {slider("scale", "Size", 0.6, 1.8, 0.05)}
        {slider("y", "Height", -0.6, 0.6, 0.02)}
        {slider("rot", "Turn", -40, 40, 1)}
        {rigged && (
          <label className="flex items-center gap-2 self-end text-[11px] text-izk-muted">
            <input type="checkbox" checked={look.headOnly} onChange={(e) => set({ headOnly: e.target.checked })} className="accent-izk-teal" />
            Head only
          </label>
        )}
      </div>
    </section>
  );
}
