import { useEffect, useState } from "react";
import { Hand, Trash2 } from "lucide-react";
import { Row, Section, Toggle } from "./ui";
import { useIzuki } from "../lib/store";
import { emit, EV } from "../lib/ipc";
import { listCameras, rankCameras, saveCamera, savedCamera } from "../lib/camera";

const MOVES: Array<[string, string]> = [
  ["✋ Move your hand", "moves the pointer"],
  ["🤏 Thumb + index", "click — hold and move to drag and drop"],
  ["🤌 Thumb + middle", "right-click"],
  ["💍 Thumb + ring", "copy"],
  ["🤙 Thumb + pinky", "paste"],
  ["✌️ Two fingers up", "move up/down to scroll"],
  ["🖐️ Open palm, quick swipe", "back / forward"],
  ["👉 Point at a text box, hold still", "clicks it — then say what goes in it"],
  ["✊ Fist, held", "pause / resume"],
];

/** Air control (AirControl.tsx / air.rs): your hand in the air drives the PC. */
export function AirCard() {
  const settings = useIzuki((s) => s.settings);
  const patch = useIzuki((s) => s.patchSettings);
  const select = "izk-field izk-no-drag max-w-[170px] py-1 text-[11.5px]";
  const [cams, setCams] = useState<MediaDeviceInfo[]>([]);
  const [cam, setCam] = useState<string>(savedCamera() ?? "");
  const [name, setName] = useState("");
  const [kind, setKind] = useState<"keys" | "type" | "say">("keys");
  const [value, setValue] = useState("");
  const [note, setNote] = useState("");
  const [camNote, setCamNote] = useState("");

  // The names (and the external ones) only show once this window has asked
  // for the camera — so ask, briefly, then let it go.
  const readCams = async (askFirst: boolean) => {
    try {
      let all = await listCameras();
      if (askFirst && (all.length === 0 || all.every((c) => !c.label))) {
        const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        s.getTracks().forEach((t) => t.stop());
        all = await listCameras();
      }
      setCams(rankCameras(all, savedCamera()));
      setCamNote(all.length ? "" : "No camera found — plug one in, or check Windows Settings → Privacy → Camera.");
    } catch (e) {
      setCamNote(`Couldn't open the cameras (${e instanceof Error ? e.message : String(e)}). Check Windows Settings → Privacy → Camera.`);
    }
  };
  useEffect(() => {
    // Only turn the camera on to read names when Air control is on (or ↻ is tapped).
    void readCams(settings.air_enabled);
    const changed = () => void readCams(false);
    navigator.mediaDevices?.addEventListener?.("devicechange", changed);
    return () => navigator.mediaDevices?.removeEventListener?.("devicechange", changed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const teach = () => {
    const n = name.trim();
    const v = value.trim();
    if (!n || !v) return setNote("Give it a name and what it should do.");
    if (!settings.air_enabled) return setNote("Turn Air control on first — it learns through the camera.");
    void emit(EV.airRecord, { name: n, action: `${kind}:${v}` });
    setNote(`Now show “${n}” to the camera and hold it still for a moment.`);
    setName("");
    setValue("");
  };

  return (
    <Section
      id="settings-air"
      title="Air control"
      hint="Control your PC with your hand in the air, through any camera — built-in, USB or virtual. A glowing box hugs whatever is under your hand, sized to it (a whole button or one tiny FL Studio step), and a pinch lands right on it. Full speed only while it sees a hand; it switches itself off after 10 minutes without one."
    >
      <Row label="Air control" hint="Your camera turns on while this is on." icon={<Hand size={14} strokeWidth={2.3} />}>
        <Toggle checked={settings.air_enabled} onChange={(v) => patch({ air_enabled: v })} />
      </Row>
      <Row label="Test it, step by step" hint="Shows what the camera sees and your hand's outline, then walks you through moving, clicking, scrolling and pausing.">
        <button
          type="button"
          className="izk-btn-primary izk-no-drag h-[28px] px-3 text-[11.5px]"
          onClick={() => {
            if (settings.air_enabled) {
              void emit(EV.airTour);
            } else {
              try { localStorage.setItem("izuki.air.tour", "1"); } catch { /* tour opens from the button next time */ }
              patch({ air_enabled: true });
            }
          }}
        >
          Start the test
        </button>
      </Row>
      <Row label="Camera" hint="Picked for you (an external camera first). Changing it switches at once.">
        <select
          aria-label="Camera"
          className={select}
          value={cam}
          onChange={(e) => {
            setCam(e.target.value);
            saveCamera(e.target.value);
            // Running? Switch to it now.
            if (settings.air_enabled) void emit(EV.airCamera);
          }}
        >
          <option value="">Automatic</option>
          {cams.map((c, i) => (
            <option key={c.deviceId || i} value={c.deviceId}>
              {c.label || `Camera ${i + 1}`}
            </option>
          ))}
        </select>
        <button type="button" title="Look for cameras again" aria-label="Look for cameras again" onClick={() => void readCams(true)} className="izk-no-drag ml-1 rounded-full px-2 py-1 text-[12px] text-izk-muted hover:bg-white/10">
          ↻
        </button>
      </Row>
      {camNote && <p className="-mt-1 mb-2 text-[10.5px] text-amber-300">{camNote}</p>}
      <div className="mb-3 grid grid-cols-1 gap-1 rounded-xl border border-white/8 bg-white/[0.03] p-2.5 text-[11px] leading-snug">
        {MOVES.map(([g, d]) => (
          <div key={g} className="flex justify-between gap-3">
            <span className="text-izk-ink">{g}</span>
            <span className="text-right text-izk-muted">{d}</span>
          </div>
        ))}
      </div>

      <div className="mb-1 text-[11.5px] font-semibold text-izk-ink">Your own gestures</div>
      <p className="mb-2 text-[10.5px] leading-snug text-izk-muted">Teach it a hand pose (a peace sign, rock on, three fingers…) and what it does. Hold the pose for a moment to use it.</p>
      <div className="mb-2 flex flex-wrap items-center gap-1.5">
        <input className="izk-field izk-no-drag w-[110px] py-1 text-[11.5px]" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <select aria-label="Does" className="izk-field izk-no-drag py-1 text-[11.5px]" value={kind} onChange={(e) => setKind(e.target.value as typeof kind)}>
          <option value="keys">Presses keys</option>
          <option value="type">Types words</option>
          <option value="say">Asks Izuki</option>
        </select>
        <input
          className="izk-field izk-no-drag min-w-[140px] flex-1 py-1 text-[11.5px]"
          placeholder={kind === "keys" ? "ctrl+s" : kind === "type" ? "On my way!" : "play my afrobeats playlist"}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && teach()}
        />
        <button type="button" className="izk-btn-primary izk-no-drag h-[28px] px-3 text-[11.5px]" onClick={teach}>
          Teach
        </button>
      </div>
      {note && <p className="mb-2 text-[10.5px] text-izk-accent">{note}</p>}
      {settings.air_gestures.map((g) => (
        <div key={g.name} className="flex items-center justify-between gap-2 py-1 text-[11.5px]">
          <span className="text-izk-ink">✨ {g.name}</span>
          <span className="flex-1 truncate text-right text-izk-muted">{g.action.replace(/^keys:/, "keys ").replace(/^type:/, "types ").replace(/^say:/, "asks ")}</span>
          <button
            type="button"
            aria-label={`Forget ${g.name}`}
            className="izk-no-drag rounded p-1 text-izk-muted hover:text-izk-danger"
            onClick={() => patch({ air_gestures: settings.air_gestures.filter((x) => x.name !== g.name) })}
          >
            <Trash2 size={13} />
          </button>
        </div>
      ))}
    </Section>
  );
}
