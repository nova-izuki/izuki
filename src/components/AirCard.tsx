import { useEffect, useRef, useState, type ReactNode } from "react";
import { Eye, Hand, Trash2 } from "lucide-react";
import { Row, Section, Toggle } from "./ui";
import { AIR_ACTIONS, AIR_SLOTS, airBindings } from "../lib/airActions";
import { useIzuki } from "../lib/store";
import { api, emit, EV, on } from "../lib/ipc";
import { listCameras, rankCameras, saveCamera, savedCamera } from "../lib/camera";
import { EYE_SENSITIVITIES, type EyeStatusPayload } from "../lib/eyeControl";
import type { AirSafety } from "../lib/types";

const MOVES: Array<[string, string]> = [
  ["✋ Move your hand", "moves the pointer"],
  ["🤏 Thumb + index", "click — hold and move to drag and drop"],
  ["🤌 Thumb + middle", "right-click"],
  ["💍 Thumb + ring", "copy"],
  ["🤙 Thumb + pinky", "paste"],
  ["✌️ Two fingers up", "move up/down to scroll, left/right to scroll sideways"],
  ["🖐️ Open palm, quick swipe", "back / forward"],
  ["👉 Point at a text box, hold still", "clicks it — then say what goes in it"],
  ["✋→✊ Open hand, then a fist, held", "pause / resume"],
];

const EYE_MOVES: Array<[string, string]> = [
  ["👀 Look around", "moves the pointer after calibration"],
  ["😉 Blink once", "never clicks — no calibration action"],
  ["😉😉 Double blink", "clicks only if you turn it on and your gaze is settled"],
  ["👁️ Look at an edge", "keeps going to that screen edge"],
  ["⏹ Air button", "turns the camera and Eye Control off immediately"],
];

/**
 * Eye Control's emergency stop, in Settings: the keys, a Stop button, and
 * the pause state from Rust (airsafe.rs), with Resume.
 */
function EyeStopPanel({ stopKey }: { stopKey: string }) {
  const [safety, setSafety] = useState<AirSafety | null>(null);
  const [stopFailed, setStopFailed] = useState(false);
  useEffect(() => {
    let alive = true;
    void api.airSafety().then((s) => alive && setSafety(s)).catch(() => undefined);
    const off = on<AirSafety>(EV.airSafety, (s) => {
      if (alive) setSafety(s);
    });
    return () => {
      alive = false;
      void off.then((f) => f()).catch(() => undefined);
    };
  }, []);
  return (
    <div className="mt-2 rounded-xl border border-rose-400/40 bg-rose-500/10 px-2.5 py-2 text-[10.5px] leading-snug text-rose-50">
      <div className="flex items-center justify-between gap-2">
        <span>
          <b>Emergency stop:</b> {stopKey} · the Stop button on screen · say “stop eye control”. Moving the mouse or typing pauses the eye
          pointer.
        </span>
        <button
          type="button"
          onClick={() => {
            setStopFailed(false);
            // A Stop that didn't get through must say so, with the keyboard fallback.
            void api.airStop().catch(() => setStopFailed(true));
          }}
          className="shrink-0 rounded-full bg-rose-600 px-2.5 py-1 text-[10.5px] font-bold text-white hover:bg-rose-500"
        >
          ■ Stop
        </button>
      </div>
      {stopFailed && (
        <div className="mt-1.5 font-bold text-rose-200">The Stop button didn't get through. Press {stopKey} or Ctrl+Shift+Q now.</div>
      )}
      {safety?.paused && !safety.stopped && (
        <div className="mt-1.5 flex items-center justify-between gap-2 text-amber-200">
          <span>Paused: {safety.paused}.</span>
          <button
            type="button"
            onClick={() => void api.airResume().catch(() => undefined)}
            className="shrink-0 rounded-full bg-white/15 px-2.5 py-0.5 font-semibold text-white hover:bg-white/25"
          >
            Resume
          </button>
        </div>
      )}
      {safety && !safety.eye_mouse && (
        <div className="mt-1.5 text-sky-200">
          This version shows the eye cursor only. Moving the mouse with your eyes comes after a supervised accuracy test.
        </div>
      )}
      {safety?.stopped && <div className="mt-1.5 text-amber-200">Stopped. Turn Air control on again when you're ready.</div>}
      {safety && !safety.ready && <div className="mt-1.5 text-amber-200">The emergency stop isn't running, so the eye pointer won't move.</div>}
    </div>
  );
}

/** Air control (AirControl.tsx / EyeControl.tsx / air.rs): one lane at a time. */
export function AirCard() {
  const settings = useIzuki((s) => s.settings);
  const patch = useIzuki((s) => s.patchSettings);
  /** A mode switch is letting go of Eye's input: a second tap waits for it. */
  const switching = useRef(false);
  const select = "izk-field izk-no-drag max-w-[190px] py-1 text-[11.5px]";
  const [cams, setCams] = useState<MediaDeviceInfo[]>([]);
  const [cam, setCam] = useState<string>(savedCamera() ?? "");
  const [name, setName] = useState("");
  const [kind, setKind] = useState<"keys" | "type" | "say">("keys");
  const [value, setValue] = useState("");
  const [note, setNote] = useState("");
  const [camNote, setCamNote] = useState("");
  const [eyeStatus, setEyeStatus] = useState<EyeStatusPayload | null>(null);
  const mode = settings.air_control_mode === "eye" ? "eye" : "hand";

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

  // The overlay owns the live face/calibration state. Settings only shows it.
  useEffect(() => {
    let alive = true;
    const off = on<EyeStatusPayload>(EV.airEyeStatus, (s) => {
      if (alive) setEyeStatus(s);
    });
    return () => {
      alive = false;
      void off.then((f) => f()).catch(() => undefined);
    };
  }, []);

  const teach = () => {
    const n = name.trim();
    const v = value.trim();
    if (!n || !v) return setNote("Give it a name and what it should do.");
    if (!settings.air_enabled) return setNote("Turn Air control on first — it learns through the camera.");
    if (mode !== "hand") return setNote("Hand Control must be selected to teach a hand pose.");
    void emit(EV.airRecord, { name: n, action: `${kind}:${v}` });
    setNote(`Now show “${n}” to the camera and hold it still for a moment.`);
    setName("");
    setValue("");
  };

  const eyeMessage = !settings.air_enabled
    ? "Air control is off. Turn it on above to start the eye camera."
    : eyeStatus?.message ?? "Starting Eye Control…";
  const eyeTone =
    (eyeStatus?.state === "ready" && eyeStatus.calibrated) || (eyeStatus?.state === "tracking" && eyeStatus.calibrated)
      ? "bg-emerald-400"
      : eyeStatus?.state === "error" || eyeStatus?.state === "failed"
        ? "bg-amber-400"
        : "bg-sky-400";

  const modeButton = (key: "hand" | "eye" | "both", label: string, icon: ReactNode, hint: string, disabled = false) => (
    <button
      key={key}
      type="button"
      disabled={disabled}
      aria-pressed={key === mode}
      title={disabled ? "Available only after Hand and Eye have each been verified on your camera." : hint}
      onClick={async () => {
        if ((key !== "hand" && key !== "eye") || switching.current) return;
        switching.current = true;
        try {
        // Leaving Eye lets go of anything it holds first, then Hand takes
        // over. Not the emergency stop: that saves Air as off, and the person
        // only changed mode.
        if (mode === "eye" && key === "hand") await api.airRelease().catch(() => undefined);
        patch({ air_control_mode: key });
        } finally {
          switching.current = false;
        }
      }}
      className={`izk-no-drag flex min-h-[58px] flex-col items-center justify-center gap-0.5 rounded-xl border px-2 py-1.5 text-center transition-colors ${
        key === mode
          ? "border-izk-teal/70 bg-izk-teal/15 text-izk-ink"
          : disabled
            ? "cursor-not-allowed border-white/5 bg-black/10 text-izk-muted/40"
            : "border-white/10 bg-white/[0.03] text-izk-muted hover:bg-white/[0.07] hover:text-izk-ink"
      }`}
    >
      <span className="flex items-center gap-1 text-[12px] font-semibold">
        {icon} {label}
      </span>
      <span className="text-[9.5px] leading-tight">{disabled ? "after both are verified" : key === mode ? "Selected" : hint}</span>
    </button>
  );

  return (
    <Section
      id="settings-air"
      title="Air control"
      hint="One home for Hand Control and Eye Control. Pick one lane; the camera runs only while Air control is on, and the Air button in the floating chat, Island and Chat tab turns the same switch on and off. Full hand gestures are unchanged; Eye Control uses the existing face/eye model."
    >
      <Row label="Air control" hint="Your camera turns on only while this is on. Hand Control is selected by default." icon={mode === "eye" ? <Eye size={14} strokeWidth={2.3} /> : <Hand size={14} strokeWidth={2.3} />}>
        <Toggle
          checked={settings.air_enabled}
          onChange={(v) => {
            // Turning it on is the explicit re-arm after an emergency stop.
            if (v) void api.airArm().catch(() => undefined).finally(() => patch({ air_enabled: true }));
            else patch({ air_enabled: false });
          }}
        />
      </Row>

      <div className="mb-3 rounded-2xl border border-white/10 bg-white/[0.035] p-2.5">
        <div className="mb-2 flex items-baseline justify-between gap-2">
          <div className="text-[13px] font-medium text-izk-ink">Control mode</div>
          <span className="text-[10px] text-izk-muted">One lane at a time</span>
        </div>
        <div role="group" aria-label="Air control mode" className="grid grid-cols-3 gap-1.5">
          {modeButton("hand", "Hand", <Hand size={13} />, "Default")}
          {modeButton("eye", "Eye", <Eye size={13} />, "Gaze + blink")}
          {modeButton("both", "Both", <span aria-hidden>👐</span>, "Not enabled", true)}
        </div>
        <p className="mt-2 text-[10.5px] leading-snug text-izk-muted">
          {mode === "hand"
            ? "Hand Control uses the existing hand tracker. All gestures, game controls and taught poses below are unchanged."
            : "Eye Control looks where you look. Calibrate first; single blinks never click. Both is deliberately unavailable until Hand and Eye have each passed on this camera."}
        </p>
        {mode === "eye" && <EyeStopPanel stopKey={settings.eye_stop_hotkey} />}
        {mode === "eye" && (
          <div className="mt-2 flex items-start gap-2 rounded-xl bg-sky-400/10 px-2.5 py-2 text-[10.5px] leading-snug text-sky-100">
            <span aria-hidden className="mt-0.5">🔒</span>
            <span>
              Eye tracking is a session opt-in: it starts only while Air control is on and Eye is selected, and the camera is released the moment you turn Air off,
              switch to Hand, or close Izuki.
            </span>
          </div>
        )}
      </div>

      {mode === "hand" ? (
        <>
          <div className="py-2">
            <div className="text-[13px] font-medium text-izk-ink">What your quick gestures do</div>
            <div className="mt-0.5 text-[11px] text-izk-muted">Or just say it: “Hey Nova, make my pinky pinch take a screenshot.” Thumb + pointing finger is always click and drag — pinch twice quickly to double-click (opens desktop icons and files); a peace sign scrolls; an open hand closed into a fist pauses; the 🤙 “call me” hand starts talking to Izuki.</div>
            <div className="mt-2 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {AIR_SLOTS.map((s) => (
                <label key={s.id} className="flex items-center justify-between gap-2 rounded-xl bg-white/5 px-2.5 py-1.5 text-[11.5px]">
                  <span className="text-izk-ink">{s.label}</span>
                  <select
                    aria-label={s.label}
                    className="rounded-lg border border-white/15 bg-black/40 px-1.5 py-0.5 text-[11.5px] text-white"
                    value={airBindings(settings.air_bindings)[s.id]}
                    onChange={(e) => patch({ air_bindings: { ...(settings.air_bindings ?? {}), [s.id]: e.target.value } })}
                  >
                    {AIR_ACTIONS.map((a) => (
                      <option key={a.id} value={a.id}>{a.label}</option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
          </div>
          <Row label="Game controls" hint="Play games with your hand: lean it left, right, up or down from the middle of the camera to hold the arrow keys (or W A S D); pinch to hold Space (jump / fire); thumb + ring finger is Enter. Fist still pauses. Or say “turn on game controls”.">
            <div className="flex items-center gap-2">
              {settings.air_game && (
                <select
                  aria-label="Game keys"
                  className="rounded-lg border border-white/15 bg-black/40 px-1.5 py-0.5 text-[11.5px] text-white"
                  value={settings.air_game_keys ?? "arrows"}
                  onChange={(e) => patch({ air_game_keys: e.target.value as "arrows" | "wasd" })}
                >
                  <option value="arrows">Arrow keys</option>
                  <option value="wasd">W A S D</option>
                </select>
              )}
              <Toggle checked={!!settings.air_game} onChange={(v) => patch({ air_game: v })} />
            </div>
          </Row>
          <Row
            label="Show the camera"
            hint="A small window with you and your hand as the camera sees them, the tracked hand drawn on, and a red warning on the edge your hand is about to leave — so you always know if it's in view. Drag it anywhere; S/M/L sizes it."
          >
            <Toggle checked={!!settings.air_mirror} onChange={(v) => patch({ air_mirror: v })} />
          </Row>
          <Row
            label="3D apps: turn models with your hand"
            hint="In Blender, SketchUp, Fusion 360, Unity, Maya, 3ds Max, Cinema 4D, FreeCAD, 3D Viewer and Paint 3D: pinch and move to turn the model (the right buttons and keys for each app); a quick pinch still clicks; ✌️ up and down zooms. Nothing changes in other apps. Off by default: while it's on, dragging a slider in those apps turns the model instead."
          >
            <Toggle checked={!!settings.air_3d} onChange={(v) => patch({ air_3d: v })} />
          </Row>
          <Row label="How it follows your hand" hint="Fast: the ring keeps right up with quick moves. Balanced: quick and steady. Precision: slower, finer moves for small buttons — your hand covers more of the camera's view per screen.">
            <div className="flex flex-wrap justify-end gap-1">
              {([["fast", "Fast"], ["balanced", "Balanced"], ["precision", "Precision"]] as const).map(([k, l]) => (
                <button
                  key={k}
                  type="button"
                  aria-pressed={(settings.air_mode ?? "balanced") === k}
                  onClick={() => patch({ air_mode: k })}
                  className={`izk-pill izk-no-drag px-2.5 py-0.5 text-[11px] ${(settings.air_mode ?? "balanced") === k ? "border-izk-teal/70 bg-izk-teal/15" : ""}`}
                >
                  {l}
                </button>
              ))}
            </div>
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
                  void api.airArm().catch(() => undefined).finally(() => patch({ air_enabled: true }));
                }
              }}
            >
              Start the test
            </button>
          </Row>
          <div className="mb-3 rounded-xl border border-amber-300/20 bg-amber-300/[0.06] px-2.5 py-2 text-[10.5px] leading-snug text-amber-100/90">
            <b className="text-amber-200">Low light:</b> Air asks the camera for continuous exposure and focus automatically, and warns you when the picture is too dark. A normal webcam cannot see a hand in complete darkness — turn on a lamp, face a window, or move your hand closer. The hand model and every gesture stay exactly as they are.
          </div>
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
        </>
      ) : (
        <>
          <div className="mb-3 rounded-2xl border border-white/10 bg-white/[0.035] p-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-[12.5px] font-semibold text-izk-ink">
                <span aria-hidden className={`h-2 w-2 rounded-full ${eyeTone}`} />
                Eye tracking
              </div>
              <span className="text-[10px] text-izk-muted">{settings.air_enabled ? "camera on" : "camera off"}</span>
            </div>
            <p className="mt-1 text-[10.5px] leading-snug text-izk-muted" aria-live="polite">{eyeMessage}</p>
            {eyeStatus?.state === "calibrating" && eyeStatus.total !== undefined && (
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-cyan-400 transition-[width] duration-150" style={{ width: `${Math.min(100, ((eyeStatus.step ?? 1) / Math.max(1, eyeStatus.total)) * 100)}%` }} />
              </div>
            )}
            {eyeStatus?.quality !== undefined && eyeStatus.calibrated && (
              <p className="mt-1 text-[10px] text-izk-muted">
                Map fit: about {Math.max(0.1, Math.round(eyeStatus.quality * 1000) / 10)}% average screen error. Recalibrate if the cursor drifts.
              </p>
            )}
            {eyeStatus?.accuracy !== undefined && (
              <p className={`mt-1 text-[10.5px] leading-snug ${eyeStatus.mode === "pointer" ? "text-emerald-300" : "text-amber-300"}`}>
                Accuracy check: about {Math.round(eyeStatus.accuracy * 1000) / 10}% average error
                {eyeStatus.jitter !== undefined ? `, wobble ${Math.round(eyeStatus.jitter * 1000) / 10}%` : ""} ·{" "}
                {eyeStatus.mode === "pointer" ? "the mouse follows steady looks" : "preview only: the mouse doesn't move"}
              </p>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {eyeStatus?.state === "calibrating" ? (
                <button
                  type="button"
                  className="izk-pill izk-no-drag h-[28px] px-3 text-[11.5px]"
                  disabled={!settings.air_enabled}
                  onClick={() => void emit(EV.airEyeCancel)}
                >
                  Cancel calibration
                </button>
              ) : (
                <button
                  type="button"
                  className="izk-btn-primary izk-no-drag h-[28px] px-3 text-[11.5px] disabled:opacity-40"
                  disabled={!settings.air_enabled}
                  onClick={() => void emit(EV.airEyeCalibrate)}
                >
                  {eyeStatus?.calibrated ? "Recalibrate eyes" : "Calibrate eyes"}
                </button>
              )}
              {eyeStatus?.state === "error" && (
                <button
                  type="button"
                  className="izk-pill izk-no-drag px-2.5 py-1 text-[11px]"
                  onClick={() => void emit(EV.airCamera)}
                >
                  Retry camera
                </button>
              )}
              <button
                type="button"
                className="izk-pill izk-no-drag px-2.5 py-1 text-[11px]"
                onClick={() => patch({ air_enabled: false })}
              >
                Stop Eye Control
              </button>
              <span className="text-[10px] text-izk-muted">or use the Air button anywhere</span>
            </div>
            {!settings.air_enabled && (
              <p className="mt-1.5 text-[10.5px] text-amber-300">Turn Air control on above first. The camera will not start from this page on its own.</p>
            )}
          </div>

          <p className="mb-2 text-[10.5px] leading-snug text-izk-muted">
            A live camera preview appears at the <b className="text-izk-ink">top-left of the screen</b> while Eye Control is on.
            Check that it says <b className="text-izk-ink">Eyes readable</b> and your face is centred before calibrating.
            It hides while the dots are showing so a target is never covered.
          </p>

          <div className="mb-3 rounded-xl border border-white/8 bg-white/[0.03] p-2.5 text-[11px] leading-snug">
            <div className="mb-1 text-[11.5px] font-semibold text-izk-ink">Calibration</div>
            <p className="text-izk-muted">
              Press <b className="text-izk-ink">Calibrate eyes</b>, then look at each of the nine dots. Keep your head near the starting
              position; small natural movement is okay. Move your eyes to each dot; the preview shows <b className="text-izk-ink">Head steady</b> or asks you to ease back
              if you drift too far. The ring fills while the look is steady, the next dot appears by itself, and no blink is needed. A map
              is fitted and checked against held-out error; if it is not accurate enough, the pointer stays still and you can retry just the
              inconsistent dot or all nine. Calibration is per session and is never written to disk.
            </p>
          </div>

          <Row label="Eye sensitivity" hint="Calm adds more smoothing and a larger still-point hold for precise work. Standard is balanced. Quick responds faster to small looks and is more prone to jitter.">
            <div className="flex flex-wrap justify-end gap-1">
              {(Object.entries(EYE_SENSITIVITIES) as Array<["calm" | "standard" | "quick", { label: string }]>).map(([k, v]) => (
                <button
                  key={k}
                  type="button"
                  aria-pressed={(settings.air_eye_sensitivity ?? "standard") === k}
                  onClick={() => patch({ air_eye_sensitivity: k })}
                  className={`izk-pill izk-no-drag px-2.5 py-0.5 text-[11px] ${(settings.air_eye_sensitivity ?? "standard") === k ? "border-izk-teal/70 bg-izk-teal/15" : ""}`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </Row>

          <Row
            label="Double blink to click"
            hint="Off by default. When on, two quick deliberate blinks click only after your gaze has been settled for half a second. A single blink never clicks. Leave this off when reading or watching video."
          >
            <Toggle checked={!!settings.air_eye_clicks} onChange={(v) => patch({ air_eye_clicks: v })} />
          </Row>
          {settings.air_eye_clicks && (
            <p className="-mt-1 mb-2 text-[10.5px] leading-snug text-amber-300">
              Double-blink clicks are on. Only use them when you intend to click; turn this off for reading, video and long conversations.
            </p>
          )}

          <div className="mb-3 rounded-xl border border-amber-300/20 bg-amber-300/[0.06] px-2.5 py-2 text-[10.5px] leading-snug text-amber-100/90">
            <b className="text-amber-200">Low light:</b> Eye tracking needs a lit face. The camera preview shows the measured light and says <b>too dark</b> when the picture is not usable. Air boosts exposure automatically, but a normal RGB webcam cannot see eyes in complete darkness — turn on a lamp, face a window, or move closer. Good even lighting is better than a bright screen behind you.
          </div>

          <div className="mb-3 grid grid-cols-1 gap-1 rounded-xl border border-white/8 bg-white/[0.03] p-2.5 text-[11px] leading-snug">
            {EYE_MOVES.map(([g, d]) => (
              <div key={g} className="flex justify-between gap-3">
                <span className="text-izk-ink">{g}</span>
                <span className="text-right text-izk-muted">{d}</span>
              </div>
            ))}
          </div>
          <p className="mb-3 text-[10.5px] leading-snug text-izk-muted">
            Both mode is intentionally not selectable yet. Hand and Eye each have to be verified separately on your camera first; running them together would fight over the camera and the pointer.
          </p>
        </>
      )}

      <Row label="Camera" hint="Picked for you (an external camera first). Changing it switches at once for either mode.">
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
    </Section>
  );
}
