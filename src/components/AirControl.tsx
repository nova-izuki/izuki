import { useEffect, useRef, useState } from "react";
import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";
import { api, emit, EV, on } from "../lib/ipc";
import { listCameras, openCamera, rankCameras, saveCamera, savedCamera } from "../lib/camera";
import { AIR_KEYBOARD_OPEN, AirKeyboard } from "./AirKeyboard";
import { actionLabel, airBindings, type AirSlot } from "../lib/airActions";
import { newScroll, scrollStep, type ScrollState } from "../lib/airScroll";
import type { Settings } from "../lib/types";

/**
 * Air control — the PC driven by your hand in the air, Meta-Quest style,
 * through the webcam (air.rs is the PC side):
 *
 *   ☝️  your hand moves the pointer (knuckles, so pinching doesn't jolt it)
 *   🤏  thumb + index: click — hold and move to drag and drop
 *   🤌  thumb + middle: right-click · thumb + ring: copy · thumb + pinky: paste
 *   ✌️  two fingers up, move up/down: scroll (left/right: scroll sideways)
 *   🖐️  open palm, quick swipe: back / forward
 *   👉  point and hold still on a box: it's clicked, and what you say next is
 *       typed into it (or written for you: "reply that I'll be there at 6")
 *   ✊  fist, held: pause / resume
 *   ✨  your own gestures: a pose you taught it, bound to keys, words or a command
 *
 * A box hugs whatever is under your hand — sized to it, from a whole window
 * to one tiny step button — and a pinch lands on its centre.
 *
 * Battery: 320×240 frames on the GPU; full speed only while a hand is in
 * view, four looks a second otherwise, and it switches itself off after ten
 * minutes with no hand.
 */

type Pt = { x: number; y: number; z: number };
type Box = { nx: number; ny: number; nw: number; nh: number; kind: string; field: boolean };
type Custom = Settings["air_gestures"][number];

const IDLE_OFF_MS = 10 * 60_000;

/**
 * Izuki's own control under the ring (the guide's "Pinch me" button, the
 * floating keyboard…), or null. The overlay spans the same screen area as
 * the ring's coordinates. These are pressed right here: a Windows mouse
 * press went through the see-through overlay to the app behind it, and the
 * highlight box (found from the apps behind, with the overlay left out on
 * purpose) moved the pinch onto whatever was behind the panel.
 */
function ownAt(nx: number, ny: number): HTMLElement | null {
  const el = document.elementFromPoint(nx * window.innerWidth, ny * window.innerHeight) as HTMLElement | null;
  const panel = el?.closest<HTMLElement>("[data-izk-hit]");
  if (!el || !panel) return null;
  return el.closest<HTMLElement>("button, a, select, input, textarea, [role=button]") ?? panel;
}

/** One-euro filter: steady when still, quick when moving. */
/**
 * How the pointer follows your hand. Measured on the old setting (beta 0.03)
 * a quick move was smoothed as hard as a still hand, so the ring trailed
 * behind and only caught up when you stopped. A one-euro filter should smooth
 * a still hand (jitter) and let a moving one through — beta is how much speed
 * opens it up. region: how much of the camera's view spans the whole screen.
 */
export const AIR_MODES = {
  fast: { minCut: 2.2, beta: 9, region: 0.5 },
  balanced: { minCut: 1.2, beta: 4, region: 0.6 },
  precision: { minCut: 0.6, beta: 1.2, region: 0.8 },
} as const;
export type AirMode = keyof typeof AIR_MODES;

class Smooth {
  private x: number | null = null;
  private dx = 0;
  private t = 0;
  next(v: number, now: number, minCut: number, beta: number) {
    if (this.x === null) {
      this.x = v;
      this.t = now;
      return v;
    }
    const dt = Math.max(1e-3, (now - this.t) / 1000);
    this.t = now;
    const a = (cut: number) => 1 / (1 + 1 / (2 * Math.PI * cut * dt));
    const d = (v - this.x) / dt;
    this.dx += a(1) * (d - this.dx);
    const cut = minCut + beta * Math.abs(this.dx);
    this.x += a(cut) * (v - this.x);
    return this.x;
  }
  reset() {
    this.x = null;
  }
}

const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y);

/** Landmarks → a pose that doesn't care where the hand is or how big it looks. */
function poseOf(lm: Pt[]): number[] {
  const w = lm[0];
  const s = Math.max(1e-3, dist(lm[0], lm[9]));
  return lm.flatMap((p) => [(p.x - w.x) / s, (p.y - w.y) / s]);
}

function poseDistance(a: number[], b: number[]) {
  let d = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i++) d += (a[i] - b[i]) ** 2;
  return Math.sqrt(d / Math.max(1, a.length));
}

/** A promise, or an error saying `what` once `ms` pass — never a silent wait. */
function within<T>(p: Promise<T>, ms: number, what: string): Promise<T> {
  let t: ReturnType<typeof setTimeout> | undefined;
  return Promise.race([p, new Promise<never>((_, fail) => (t = setTimeout(() => fail(new Error(`${what} (${Math.round(ms / 1000)} s)`)), ms)))]).finally(() => clearTimeout(t));
}

/**
 * Air control whenever the setting is on — in every overlay mode. It lives at
 * the overlay's root, outside OverlayCanvas: it used to be drawn only in the
 * drawing mode, so in the usual follow mode turning it on did nothing at all
 * (no camera, no tracking, no log line).
 */
export function AirHost() {
  const [gestures, setGestures] = useState<Custom[] | null>(null);
  const [mode, setMode] = useState<AirMode>("balanced");
  const [bindings, setBindings] = useState<Record<AirSlot, string>>(() => airBindings(undefined));
  const [game, setGame] = useState<{ on: boolean; keys: "arrows" | "wasd" }>({ on: false, keys: "arrows" });
  const last = useRef("");
  useEffect(() => {
    let alive = true;
    const refresh = () =>
      void api
        .getSettings()
        .then((s) => {
          if (!alive) return;
          setMode(s.air_mode in AIR_MODES ? s.air_mode : "balanced");
          setBindings(airBindings(s.air_bindings));
          setGame({ on: !!s.air_game, keys: s.air_game_keys === "wasd" ? "wasd" : "arrows" });
          const next = s.air_enabled ? s.air_gestures ?? [] : null;
          const key = JSON.stringify(next);
          if (key === last.current) return; // same as before: don't restart the camera
          const wasOn = last.current !== "" && last.current !== "null";
          last.current = key;
          if (next && !wasOn) void api.log("[air] on — starting").catch(() => undefined);
          setGestures(next);
        })
        .catch(() => undefined);
    refresh();
    const offs = [on<void>(EV.settingsChanged, refresh), on(EV.overlayOpen, refresh)];
    return () => {
      alive = false;
      offs.forEach((off) => void off.then((f) => f()).catch(() => undefined));
    };
  }, []);
  return gestures ? <AirControl gestures={gestures} mode={mode} bindings={bindings} game={game} /> : null;
}

export function AirControl({
  gestures,
  mode: airMode = "balanced",
  bindings,
  game,
}: {
  gestures: Custom[];
  mode?: AirMode;
  bindings?: Record<AirSlot, string>;
  /** Game controls: the hand leaning holds direction keys, a pinch holds Space. */
  game?: { on: boolean; keys: "arrows" | "wasd" };
}) {
  const gameRef = useRef(game ?? { on: false, keys: "arrows" as const });
  gameRef.current = game ?? { on: false, keys: "arrows" };
  /** What the quick gestures do (changing them never restarts the camera). */
  const binds = useRef(airBindings(undefined));
  if (bindings) binds.current = bindings;
  const tuning = useRef(AIR_MODES[airMode]);
  tuning.current = AIR_MODES[airMode] ?? AIR_MODES.balanced;
  const video = useRef<HTMLVideoElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState("Starting the camera…");
  const customs = useRef<Custom[]>(gestures);
  customs.current = gestures;
  const recording = useRef<{ name: string; action: string; frames: number[][]; until: number } | null>(null);
  /** What the guided test watches: the last hand, and what's been done. */
  const live = useRef<AirLive>({ lm: null, hand: false, moved: 0, scrolls: 0, pauses: 0, clicked: false, dragged: false, pinches: 0, calls: 0, engine: "", camera: "", looks: 0, looksAt: 0, rate: 0, ms: 0, fps: 0, gesture: "", pinch: 1, tour: false, snap: null });
  const [tour, setTour] = useState(false);
  /** Bumped to reopen the camera: another one picked, or one plugged in / out. */
  const [camKey, setCamKey] = useState(0);
  useEffect(() => {
    const reopen = () => setCamKey((k) => k + 1);
    const off = on<void>(EV.airCamera, reopen);
    // A webcam plugged in (or pulled out): start again with the best one.
    // (Only cameras — a headset or mic switching doesn't restart it.)
    let t: ReturnType<typeof setTimeout> | undefined;
    let seen = "";
    void listCameras().then((c) => (seen = c.map((d) => d.deviceId).join("|"))).catch(() => undefined);
    const changed = () => {
      clearTimeout(t);
      t = setTimeout(() => {
        void listCameras()
          .then((c) => {
            const now = c.map((d) => d.deviceId).join("|");
            if (now !== seen) {
              seen = now;
              reopen();
            }
          })
          .catch(() => undefined);
      }, 1200);
    };
    navigator.mediaDevices?.addEventListener?.("devicechange", changed);
    return () => {
      clearTimeout(t);
      navigator.mediaDevices?.removeEventListener?.("devicechange", changed);
      void off.then((f) => f());
    };
  }, []);
  // The guided test: the first time Air control is on, or when Settings asks.
  useEffect(() => {
    let first = false;
    try {
      first = localStorage.getItem("izuki.air.tour") === "1" || !localStorage.getItem("izuki.air.toured");
      localStorage.removeItem("izuki.air.tour");
      localStorage.setItem("izuki.air.toured", "1");
    } catch {
      /* no storage: no automatic tour */
    }
    if (first) setTour(true);
    const off = on<void>(EV.airTour, () => {
      // A fresh test: every step starts undone (the camera and hand stay known).
      Object.assign(live.current, { moved: 0, clicked: false, scrolls: 0, pauses: 0 });
      setTour(true);
    });
    return () => void off.then((f) => f());
  }, []);

  // Teaching a gesture: Settings asks, this window records the pose for 1.5 s
  // (from the moment a hand is seen).
  useEffect(() => {
    const off = on<{ name: string; action: string }>(EV.airRecord, (r) => {
      if (!r?.name?.trim() || !r.action?.trim()) return;
      recording.current = { name: r.name.trim(), action: r.action.trim(), frames: [], until: 0 };
      setStatus(`Show your “${r.name.trim()}” pose and hold it…`);
    });
    return () => void off.then((f) => f());
  }, []);

  useEffect(() => {
    let alive = true;
    let stream: MediaStream | null = null;
    let landmarker: HandLandmarker | null = null;
    /** The hand tracker on its own thread (airWorker.ts) — the overlay never waits on it. */
    let tracker: Worker | null = null;
    /** The tracker thread while it's still getting ready (closed if Air is turned off meanwhile). */
    let starting: Worker | null = null;
    /** A picture is with the tracker: newer ones wait (the latest one goes next). */
    let trackerBusy = false;
    /** The picture now being looked at, shown in the guide once its hand comes back. */
    let snapNext: HTMLCanvasElement | null = null;
    let readyAt = 0;
    let lastVideoTime = -1;
    let frames = 0;
    let lastReport = 0;
    let raf = 0;
    let lastRaf = 0;
    /** Reading the camera directly: every new picture as it arrives. */
    let streaming = false;
    let reader: ReadableStreamDefaultReader<VideoFrame> | null = null;
    let camFrames = 0;
    let camAt = performance.now();
    let timer: ReturnType<typeof setInterval> | undefined;
    let timerSaid = false;
    let detectSaid = false;
    let blankSaid = false;
    let lastLook = 0;
    let lastHand = performance.now();
    const sx = new Smooth();
    const sy = new Smooth();
    // Gesture state.
    let pinchDown = false;
    let pinchAt = 0;
    let dragging = false;
    /** This pinch has clearly moved: from now on it's a drag. Until then the
     * pointer holds still, so a click stays a click. */
    let dragOut = false;
    /** A pinch that began on Izuki's own control: pressed here on release, no Windows click. */
    let ownDown: HTMLElement | null = null;
    /** Where the hand was when the pinch began (the drag step measures the hand itself). */
    let pinchFrom: { x: number; y: number } | null = null;
    let other: "middle" | "ring" | "pinky" | null = null;
    let otherAt = 0;
    /** The 3D app in front (Blender, Unity…), checked every 1.5 s while the
     * hand drives — there a pinch dragged turns the model. */
    let app3d: string | null = null;
    let app3dAt = 0;
    /** This pinch is in a 3D app: a quick one clicks, a dragged one turns. */
    let pend3d = false;
    let grip3d = false;
    let app3dBusy = false;
    /** The grip being started, so a "let go" always comes after it. */
    let gripStart: Promise<unknown> | null = null;
    const letGo3d = () => {
      const after = gripStart ?? Promise.resolve();
      gripStart = null;
      void after.finally(() => api.airGrip3d(false).catch(() => undefined));
    };
    /** Whatever a pinch was doing, it's over: let go of exactly that. */
    const endPinch3d = () => {
      if (grip3d) letGo3d();
      const pressed = !pend3d || grip3d;
      pend3d = false;
      grip3d = false;
      dragOut = false;
      return pressed;
    };
    /** The peace-sign scroll in progress (up/down or sideways), or null. */
    let scroll: ScrollState | null = null;
    /** When the peace sign was last seen (scrolling holds through a flicker). */
    let peaceAt = 0;
    let fistAt = 0;
    /** Looks with a hand in them, and why any weren't used (logged every 30 s). */
    let why = { used: 0, low: 0, flat: 0, turned: 0 };
    /** When the hand was last seen open (3+ fingers out): a fist only counts
     * right after an open hand — a hand resting curled on a cheek or the desk
     * never pauses or un-pauses Air control. */
    let openAt = 0;
    /** Where the hand settled, and since when — a hand resting still for a
     * while stops clicking until it moves again. */
    let restFrom: { x: number; y: number; at: number } | null = null;
    let resting = false;
    /** The hand is raised and driving Air control (and since when it's been up / down). */
    let engaged = false;
    let upSince = 0;
    let downSince = 0;
    /** When the fingers first came together: a pinch counts once held a moment. */
    let pinchSeen = 0;
    /** Keys the game controls are holding down right now. */
    const held = new Set<string>();
    const hold = (key: string, down: boolean) => {
      if (down === held.has(key)) return;
      if (down) held.add(key);
      else held.delete(key);
      // (In order: the PC runs these one after another.) A let-go that
      // fails is tried once more — a key must never stay held down.
      void api.airHold(key, down).catch(() => {
        if (!down) setTimeout(() => void api.airHold(key, false).catch(() => undefined), 120);
      });
    };
    let gameKeys = "";
    /** Let go of every held key (hand gone, paused, game controls off, Air off). */
    const releaseKeys = () => [...held].forEach((k) => hold(k, false));
    let gameEnter = false;
    /** A pinch that picked up one of Izuki's own things (the character, the orb) to drag it. */
    let grabbing = false;
    const at = (p: { x: number; y: number }) => ({ clientX: p.x * window.innerWidth, clientY: p.y * window.innerHeight });
    const fake = (type: string, p: { x: number; y: number }, target: EventTarget = window) =>
      target.dispatchEvent(new PointerEvent(type, { bubbles: true, cancelable: true, button: 0, buttons: type === "pointerup" ? 0 : 1, pointerId: 77, pointerType: "mouse", isPrimary: true, ...at(p) }));
    /** The 🤙 call gesture: when it began, and when it may fire again. */
    let callAt = 0;
    let callCool = 0;
    /** Where the hand was when it last moved (taught gestures need it held still). */
    let stillFrom: { x: number; y: number } | null = null;
    /** "Hold to pause…" by the ring while a fist is held (so a pause is never a surprise). */
    let holdLabel = "";
    let paused = false;
    let pointAt = 0;
    let pointFrom: { x: number; y: number } | null = null;
    let swipeFrom: { x: number; y: number; t: number } | null = null;
    let swipeCool = 0;
    let customAt = 0;
    let customName = "";
    let box: Box | null = null;
    let boxAt = 0;
    let boxFor = { x: -1, y: -1 };
    let pointer = { x: 0.5, y: 0.5 };
    let mode = "";
    let switchedOff = false;
    /** What a gesture just did ("Copied"), shown by the pointer for a moment. */
    const shown = { text: "", until: 0 };
    const flash = (text: string) => {
      shown.text = text;
      shown.until = performance.now() + 900;
    };
    /** Box replies can arrive out of order: only the newest counts. */
    let boxSeq = 0;
    /** One box lookup at a time — the PC side never queues up. */
    let boxBusy = false;

    const draw = (hand: boolean) => {
      const c = canvas.current;
      if (!c) return;
      const W = window.innerWidth;
      const H = window.innerHeight;
      if (c.width !== W || c.height !== H) {
        c.width = W;
        c.height = H;
      }
      const g = c.getContext("2d")!;
      g.clearRect(0, 0, W, H);
      if (!hand) return;
      if (box && !paused) {
        const r = Math.min(8, box.nw * W * 0.2, box.nh * H * 0.2);
        g.beginPath();
        g.roundRect(box.nx * W - 2, box.ny * H - 2, box.nw * W + 4, box.nh * H + 4, r);
        // A dark edge under the glow: it shows on white pages too.
        g.strokeStyle = "rgba(0,0,0,0.6)";
        g.lineWidth = 4.5;
        g.stroke();
        g.strokeStyle = "rgba(94,231,255,0.98)";
        g.lineWidth = 2;
        g.shadowColor = "rgba(94,231,255,0.8)";
        g.shadowBlur = 8;
        g.stroke();
        g.shadowBlur = 0;
      }
      const px = pointer.x * W;
      const py = pointer.y * H;
      // Seen on any screen, bright or dark: a dark edge under the white (or
      // pink) ring. (The overlay can't read the colours behind it, so the
      // ring carries its own contrast.)
      g.beginPath();
      g.arc(px, py, pinchDown ? 9 : 14, 0, Math.PI * 2);
      g.strokeStyle = paused ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.78)";
      g.lineWidth = 6;
      g.stroke();
      g.strokeStyle = paused ? "rgba(255,255,255,0.45)" : pinchDown ? "rgba(255,92,170,1)" : "rgba(255,255,255,0.97)";
      g.lineWidth = 2.5;
      g.stroke();
      if (pinchDown) {
        g.fillStyle = "rgba(255,92,170,0.35)";
        g.fill();
      }
      const label = mode || (performance.now() < shown.until ? shown.text : "");
      if (label) {
        g.font = "600 12px system-ui";
        g.lineWidth = 3.5;
        g.strokeStyle = "rgba(0,0,0,0.75)";
        g.strokeText(label, px + 18, py - 14);
        g.fillStyle = "rgba(255,255,255,0.97)";
        g.fillText(label, px + 18, py - 14);
      }
    };

    /** A quick gesture's action (yours to choose: Settings → Air control, or by voice). */
    const quick = (action: string) => {
      if (!action || action === "none") return;
      if (action === "click:right") void api.airButton(true, true).then(() => api.airButton(true, false)).catch(() => undefined);
      else if (action.startsWith("keys:")) void api.airKeys(action.slice(5)).catch(() => undefined);
      flash(actionLabel(action));
    };

    const act = (action: string) => {
      const [kind, ...rest] = action.split(":");
      const value = rest.join(":");
      if (kind === "keys") void api.airKeys(value).catch(() => undefined);
      else if (kind === "type") void api.typeHere(value).catch(() => undefined);
      else if (kind === "say") void emit(EV.runChat, { id: Date.now(), text: value });
    };

    const frame = () => {
      raf = requestAnimationFrame(frame);
      lastRaf = performance.now();
      if (!streaming) look();
    };
    // Screen refreshes stop when Windows thinks the overlay isn't showing —
    // then a plain timer keeps the hand tracked (the loop never just stops).
    const backup = () => {
      if (streaming || performance.now() - lastRaf < 400) return;
      if (!timerSaid) {
        timerSaid = true;
        void api.log("[air] screen refresh paused — looking on a timer instead").catch(() => undefined);
      }
      look();
    };

    const look = (pic?: VideoFrame) => {
      const v = video.current;
      const now = performance.now();
      const handRecently = now - lastHand < 2000;
      if ((!landmarker && !tracker) || !v) return;
      if (pic) {
        camFrames++;
        if (now - camAt > 1000) {
          live.current.fps = Math.round((camFrames * 1000) / (now - camAt));
          camFrames = 0;
          camAt = now;
        }
      }
      if (!pic && v.readyState < 2) {
        // A camera that opened but never sends a picture: say so, once.
        if (!blankSaid && now - readyAt > 10_000) {
          blankSaid = true;
          void api.log(`[air] the camera sent no picture in 10 s (state ${v.readyState}, ${v.paused ? "paused" : "playing"})`).catch(() => undefined);
          setStatus("The camera isn't sending a picture — pick another one in Settings → Air control.");
          void v.play().catch(() => undefined);
        }
        return;
      }
      // Full speed with a hand in view; about seven looks a second without, so
      // a hand that comes back (or was lost in a fast move) is found again
      // quickly. (Never the same moment twice — the model moves forward.)
      if (now <= lastLook || now - lastLook < (handRecently ? 0 : 150)) return;
      lastLook = now;
      if (now - lastHand > IDLE_OFF_MS) {
        // Nobody's here: switch off (once) — the overlay unmounts this.
        if (!switchedOff) {
          switchedOff = true;
          void api.log(`[air] no hand for 10 min${live.current.hand ? "" : " (never saw one)"} — switching off`).catch(() => undefined);
          void emit(EV.patchSettings, { air_enabled: false });
        }
        return;
      }
      // Frames arriving at all? (A camera that's "on" but sends nothing.)
      if (pic) frames++;
      else if (v.currentTime !== lastVideoTime) {
        lastVideoTime = v.currentTime;
        frames++;
      } else return; // the same picture again: nothing new to look at
      // What it's doing, in the log — every 30 s for the first few minutes.
      if (now - lastReport > 30_000 && now - readyAt < 4 * 60_000) {
        lastReport = now;
        const L = live.current;
        const seen = why.used + why.low + why.flat + why.turned;
        const usage = seen ? `; of ${seen} looks with a hand: used ${Math.round((why.used / seen) * 100)}%, too low ${why.low}, not raised ${why.flat}, turned sideways ${why.turned}` : "";
        void api.log(`[air] ${L.rate} looks/s, ${L.ms} ms per look, camera ${streaming ? `${L.fps} pictures/s (direct)` : "via video"}, ${frames} pictures so far, hand ${L.hand ? "seen" : "not seen yet"}${usage}`).catch(() => undefined);
        why = { used: 0, low: 0, flat: 0, turned: 0 };
      }
      // The guide shows the very picture the hand was found in, so the dots
      // sit on the fingers (the live video ran ahead of the dots).
      if (live.current.tour && !(tracker && trackerBusy)) {
        const c = tracker
          ? (snapNext ??= Object.assign(document.createElement("canvas"), { width: 320, height: 240 }))
          : (live.current.snap ??= Object.assign(document.createElement("canvas"), { width: 320, height: 240 }));
        const g = c.getContext("2d");
        if (g) {
          g.save();
          g.translate(c.width, 0);
          g.scale(-1, 1);
          g.drawImage(pic ?? v, 0, 0, c.width, c.height);
          g.restore();
        }
      }
      if (tracker) {
        // One picture at a time; while it's busy, newer pictures are skipped
        // (the next one after it's free is the newest — never a backlog).
        if (trackerBusy) return;
        trackerBusy = true;
        const t = tracker;
        const send = (frame: VideoFrame | ImageBitmap) => t.postMessage({ type: "look", frame, t: now }, [frame]);
        if (pic) send(pic.clone());
        else void createImageBitmap(v).then(send).catch(() => (trackerBusy = false));
        return;
      }
      if (!landmarker) return;
      const lookStart = performance.now();
      let res: ReturnType<HandLandmarker["detectForVideo"]>;
      try {
        res = landmarker.detectForVideo(pic ?? v, now);
        const took = performance.now() - lookStart;
        live.current.ms = Math.round(live.current.ms ? live.current.ms * 0.8 + took * 0.2 : took);
      } catch (e) {
        if (!detectSaid) {
          detectSaid = true;
          void api.log(`[air] hand model error: ${e instanceof Error ? e.message : e}`).catch(() => undefined);
          setStatus("Hand tracking hit a problem — turn Air control off and on to try again.");
        }
        return;
      }
      use(res.landmarks?.[0] as Pt[] | undefined, now);
    };

    /** A hand came back from a look (or none did): move, click, scroll… */
    const use = (lm: Pt[] | undefined, now: number) => {
      const L = live.current;
      L.lm = lm ?? null;
      L.looks++;
      if (now - L.looksAt > 1000) {
        L.rate = Math.round((L.looks * 1000) / (now - L.looksAt));
        L.looks = 0;
        L.looksAt = now;
      }
      if (lm && !L.hand) {
        L.hand = true;
        void api.log("[air] first hand seen").catch(() => undefined);
      }
      if (!lm) {
        // A look or two without the hand (a fast move blurs it): hold
        // everything — the pinch, the drag, the scroll, the pointer — for a
        // moment. Letting go on one missed look cut drags off half-way.
        if (lastHand && now - lastHand < 400) {
          draw(true);
          return;
        }
        L.gesture = "";
        releaseKeys();
        if (grabbing) {
          grabbing = false;
          fake("pointerup", pointer);
        }
        // Hand gone: the 🤙 call is ready again.
        callAt = 0;
        if (callCool === Infinity) callCool = now + 1200;
        scroll = null;
        swipeFrom = null;
        customName = "";
        restFrom = null;
        resting = false;
        if (pinchDown) {
          if (!ownDown && endPinch3d()) void api.airButton(false, false);
          ownDown = null;
          pinchFrom = null;
          pinchDown = false;
        }
        sx.reset();
        sy.reset();
        mode = "";
        draw(false);
        return;
      }
      lastHand = now;
      const scale = Math.max(1e-3, dist(lm[0], lm[9]));
      // Only a raised hand drives Air control: up in front of the camera,
      // fingers pointing up. Hands resting on the keyboard — low in the
      // picture, lying flat — used to move the mouse while you typed.
      // Judged by the fingers pointing up, not by how low the hand is — a hand
      // reaching down for the taskbar is still raised (it vanished there);
      // typing hands point down at the keys and never count.
      const upright = (lm[0].y - lm[9].y) / scale;
      // Facing the camera: the knuckles spread across the picture. A hand on
      // its side — on your chin or cheek, or resting on its edge — shows
      // them stacked, and doesn't drive anything.
      const facing = dist(lm[5], lm[17]) / scale;
      // Looser (1.0.122: "it isn't registering my hand"): a hand tilted well
      // forward still counts, and only a hand truly edge-on is turned away.
      const raised = lm[9].y < 0.95 && upright > (engaged ? 0.15 : 0.3) && facing > (engaged ? 0.1 : 0.18);
      // Why a hand isn't used, counted for the 30-second log line.
      if (!raised) {
        if (lm[9].y >= 0.95) why.low++;
        else if (upright <= (engaged ? 0.15 : 0.3)) why.flat++;
        else why.turned++;
      }
      if (raised) {
        if (!upSince) upSince = now;
        downSince = 0;
      } else {
        if (!downSince) downSince = now;
        upSince = 0;
      }
      if (!engaged && raised && now - upSince > 120) engaged = true;
      if (engaged && !raised && now - downSince > 600) engaged = false;
      if (engaged) why.used++;
      if (!engaged) {
        L.lm = null;
        L.gesture = "";
        releaseKeys();
        // Whatever was under way stops cleanly (a pick-up ends once, here).
        if (grabbing) fake("pointerup", pointer);
        else if (pinchDown && !ownDown && endPinch3d()) void api.airButton(false, false).catch(() => undefined);
        grabbing = false;
        ownDown = null;
        pinchFrom = null;
        pinchDown = false;
        pinchSeen = 0;
        scroll = null;
        swipeFrom = null;
        customName = "";
        restFrom = null;
        resting = false;
        callAt = 0;
        stillFrom = null;
        sx.reset();
        sy.reset();
        mode = "";
        draw(false);
        return;
      }
      const up = (tip: number, pip: number) => dist(lm[0], lm[tip]) > dist(lm[0], lm[pip]) * 1.12;
      const ext = { index: up(8, 6), middle: up(12, 10), ring: up(16, 14), pinky: up(20, 18) };
      // Closing counts at 0.3; once pinched it holds until 0.42 (0.5 while
      // dragging, where the fingers loosen as the hand moves).
      // Measured as fingertip gap ÷ palm length. Your fingertips don't have
      // to touch exactly (0.3 was too strict on a webcam — "it's hard"):
      // closing counts at 0.38; once pinched it holds until 0.5 (0.58 while
      // dragging, where the fingers loosen as the hand moves).
      const near = (tip: number) => dist(lm[4], lm[tip]) / scale;
      const folded = (tip: number, knuckle: number) => dist(lm[0], lm[tip]) < dist(lm[0], lm[knuckle]) * 1.02;
      const upBy = (tip: number, pip: number, k: number) => dist(lm[0], lm[tip]) > dist(lm[0], lm[pip]) * k;
      // Which fingertip the thumb is nearest: that's the pinch (thumb + middle
      // for a right-click often had the pointing finger close too, and turned
      // into a left click).
      const nearest = [8, 12, 16, 20].reduce((a, b) => (near(b) < near(a) ? b : a));
      const pinch = (tip: number, on: boolean) => near(tip) < (on ? (dragging ? 0.58 : 0.5) : 0.38) && (on || nearest === tip);

      // Teaching: average the pose over a moment.
      const rec = recording.current;
      if (rec) {
        if (!rec.until) rec.until = now + 1500;
        rec.frames.push(poseOf(lm));
        if (now > rec.until) {
          recording.current = null;
          const n = rec.frames.length;
          const pose = rec.frames[0].map((_, i) => rec.frames.reduce((s, f) => s + f[i], 0) / n);
          void emit(EV.patchSettings, { air_gestures: [...customs.current.filter((c) => c.name !== rec.name), { name: rec.name, pose, action: rec.action }] });
          setStatus(`Learned “${rec.name}” ✓`);
        }
        // Nothing else happens while it's learning.
        mode = "Learning…";
        draw(true);
        return;
      }

      // Fist, held: pause / resume.
      // Only a real fist: every fingertip folded right into the palm (nearer
      // the wrist than its knuckle). A relaxed, half-curled hand used to
      // count and paused Air control by surprise.
      const fist = folded(8, 5) && folded(12, 9) && folded(16, 13) && folded(20, 17) && !pinchDown;
      const openNow = [ext.index, ext.middle, ext.ring, ext.pinky].filter(Boolean).length >= 3;
      if (openNow) openAt = now;
      if (fist) {
        // Open hand → fist is a choice; a fist with no open hand just before
        // is a resting hand, and is ignored until it opens again.
        if (!fistAt) fistAt = now - openAt < 2500 ? now : -1;
        else if (fistAt > 0 && fistAt !== Infinity && now - fistAt > 250) holdLabel = paused ? "Hold to carry on…" : "Hold to pause…";
        if (fistAt > 0 && fistAt !== Infinity && now - fistAt > 1000) {
          paused = !paused;
          live.current.pauses++;
          fistAt = Infinity;
          setStatus(paused ? "Paused — open your hand, then make a fist, to carry on" : "Air control on");
        }
      } else {
        fistAt = 0;
        holdLabel = "";
      }
      if (fistAt === Infinity) holdLabel = "";
      if (paused) {
        releaseKeys();
        if (pinchDown) {
          pinchDown = false;
          if (!ownDown && endPinch3d()) void api.airButton(false, false).catch(() => undefined);
          ownDown = null;
          pinchFrom = null;
        }
        mode = holdLabel || "Paused — open hand, then a fist, to carry on";
        L.gesture = "fist";
        draw(true);
        return;
      }
      L.pinch = Math.min(1, dist(lm[4], lm[8]) / scale / 0.9);
      if (now - app3dAt > 1500 && !app3dBusy) {
        app3dAt = now;
        app3dBusy = true;
        void api
          .air3dApp()
          .then((a) => { app3d = a; })
          .catch(() => { app3d = null; })
          .finally(() => { app3dBusy = false; });
      }

      // Resting: a hand held still for 4 s (leaning on it, thinking) stops
      // clicking until it moves again — a drag in progress is left alone.
      {
        const here = { x: (lm[5].x + lm[9].x) / 2, y: (lm[5].y + lm[9].y) / 2 };
        if (!restFrom || Math.hypot(here.x - restFrom.x, here.y - restFrom.y) > 0.035) {
          restFrom = { ...here, at: now };
          if (resting) setStatus("Air control on");
          resting = false;
        } else if (!resting && !pinchDown && now - restFrom.at > 7000) {
          resting = true;
          setStatus("Resting — move your hand to carry on");
        }
      }
      if (resting && !pinchDown) {
        mode = "Resting — move to carry on";
        L.gesture = "rest";
        draw(true);
        return;
      }

      // The pointer: the index and middle knuckles (steady through pinches).
      const raw = { x: 1 - (lm[5].x + lm[9].x) / 2, y: (lm[5].y + lm[9].y) / 2 };
      const tune = tuning.current;
      const span = tune.region;
      // The screen's area in the camera's view sits a little high, so the
      // bottom of the screen (the taskbar) is in easy reach without
      // dropping the hand to the edge of the picture.
      const spanY = span * 0.85;
      const active = { x: (raw.x - (1 - span) / 2) / span, y: (raw.y - 0.1) / spanY };
      const nx = Math.min(1, Math.max(0, sx.next(active.x, now, tune.minCut, tune.beta)));
      const ny = Math.min(1, Math.max(0, sy.next(active.y, now, tune.minCut, tune.beta)));
      // 🎮 Game controls: lean the hand from the middle of the camera to hold
      // the direction keys; pinch holds Space; thumb + ring taps Enter. The
      // pointer stays put (the ring shows where the hand leans).
      if (gameRef.current.on) {
        const g = gameRef.current;
        // Switched to game controls mid-press or mid-drag: finish that first.
        if (pinchDown && !held.has("space")) {
          if (grabbing) fake("pointerup", pointer);
          else if (!ownDown && endPinch3d()) void api.airButton(false, false).catch(() => undefined);
          grabbing = false;
          ownDown = null;
          pinchDown = false;
        }
        // Arrows ↔ W A S D changed: let go of the old keys first.
        if (g.keys !== gameKeys) {
          releaseKeys();
          gameKeys = g.keys;
        }
        const k = g.keys === "wasd" ? { l: "a", r: "d", u: "w", d: "s" } : { l: "left", r: "right", u: "up", d: "down" };
        const cx = raw.x - 0.5;
        const cy = raw.y - 0.45;
        // Past 0.09 from the middle presses; it lets go nearer the middle (0.06), so it doesn't flicker.
        const past = (v: number, key: string) => v > (held.has(key) ? 0.06 : 0.09);
        hold(k.l, past(-cx, k.l));
        hold(k.r, past(cx, k.r));
        hold(k.u, past(-cy, k.u));
        hold(k.d, past(cy, k.d));
        hold("space", pinch(8, held.has("space")));
        const enter = pinch(16, gameEnter);
        if (enter && !gameEnter) void api.airKeys("enter").catch(() => undefined);
        gameEnter = enter;
        const lean = { x: Math.min(1, Math.max(0, 0.5 + cx * 1.6)), y: Math.min(1, Math.max(0, 0.5 + cy * 1.6)) };
        L.moved += Math.hypot(lean.x - pointer.x, lean.y - pointer.y);
        pointer = lean;
        const arrows: Record<string, string> = { left: "←", right: "→", up: "↑", down: "↓", a: "A", d: "D", w: "W", s: "S", space: "Space" };
        mode = "🎮 " + ([...held].map((h) => arrows[h] ?? h).join(" ") || "middle");
        L.gesture = "game";
        draw(true);
        return;
      }
      releaseKeys();

      // Your own gestures come first (a taught peace sign isn't a scroll):
      // hold the pose a moment. The pointer stays put while you show it.
      let taught: Custom | null = null;
      const still = !!stillFrom && Math.hypot(raw.x - stillFrom.x, raw.y - stillFrom.y) < 0.03;
      if (!still) stillFrom = { x: raw.x, y: raw.y };
      if (!pinchDown && still && customs.current.length) {
        const pose = poseOf(lm);
        let bd = Infinity;
        for (const c of customs.current) {
          const d = poseDistance(pose, c.pose);
          if (d < bd) {
            bd = d;
            taught = c;
          }
        }
        if (bd >= 0.16) taught = null;
      }
      if (taught) {
        if (customName !== taught.name) {
          customName = taught.name;
          customAt = now;
        } else if (now - customAt > 600) {
          customAt = Infinity;
          flash(`✨ ${taught.name}`);
          act(taught.action);
        }
      } else customName = "";

      // The peace sign ✌️: pointing and middle fingers up, the other two down.
      // Forgiving: up a little counts (1.04), and a half-bent ring or little
      // finger doesn't spoil it (only clearly up, 1.3, does). Once scrolling,
      // it holds through a flickery look or two (200 ms).
      const peace = upBy(8, 6, 1.04) && upBy(12, 10, 1.04) && !upBy(16, 14, 1.3) && !upBy(20, 18, 1.3) && !pinch(8, false) && !pinch(12, false);
      if (peace) peaceAt = now;
      const twoUp = !pinchDown && !taught && (peace || (scroll !== null && now - peaceAt < 200));
      // Scrolling holds the pointer still and turns hand movement into notches.
      if (twoUp) {
        mode = "Scroll";
        L.gesture = "scroll";
        // Up/down or sideways — whichever way the hand clearly moves (airScroll.ts).
        scroll ??= newScroll();
        const { down, right } = scrollStep(scroll, nx, ny);
        if (down) {
          live.current.scrolls += Math.abs(down);
          void api.airScroll(down).catch(() => undefined);
        }
        if (right) {
          live.current.scrolls += Math.abs(right);
          void api.airScrollSide(right).catch(() => undefined);
        }
        draw(true);
        return;
      }
      scroll = null;
      // A click stays a click: while pinched, the pointer holds still until
      // the hand clearly moves (3.5% of the view), like a real mouse's drag
      // threshold. Closing the fingers nudges the whole hand, and that used
      // to turn clicks into little drags.
      if (pinchDown && !dragOut && pinchFrom && Math.hypot(raw.x - pinchFrom.x, raw.y - pinchFrom.y) > 0.035) dragOut = true;
      const settling = pinchDown && !dragOut;
      if (!settling) {
        // On a small button the ring goes half speed (like aim assist), so a
        // little wobble doesn't slip off it before the pinch.
        let tx = nx;
        let ty = ny;
        const small = box && !paused && box.nw * window.innerWidth < 140 && box.nh * window.innerHeight < 90;
        if (small && box && pointer.x >= box.nx && pointer.x <= box.nx + box.nw && pointer.y >= box.ny && pointer.y <= box.ny + box.nh) {
          tx = pointer.x + (nx - pointer.x) * 0.45;
          ty = pointer.y + (ny - pointer.y) * 0.45;
        }
        live.current.moved += Math.hypot(tx - pointer.x, ty - pointer.y);
        pointer = { x: tx, y: ty };
        void api.airPointer(pointer.x, pointer.y).catch(() => undefined);
        if (grabbing) fake("pointermove", pointer);
      }

      // Over Izuki's own panel: the box is that control, exactly.
      const own = ownAt(pointer.x, pointer.y);
      if (own) {
        const r = own.getBoundingClientRect();
        box = { nx: r.left / window.innerWidth, ny: r.top / window.innerHeight, nw: r.width / window.innerWidth, nh: r.height / window.innerHeight, kind: "own", field: false };
        boxSeq++; // a lookup still on its way is about the app behind
        boxFor = { x: -1, y: -1 };
      }
      // The box under the hand, eight times a second when it has moved.
      else if (!boxBusy && now - boxAt > 125 && Math.hypot(pointer.x - boxFor.x, pointer.y - boxFor.y) > 0.004) {
        boxAt = now;
        boxFor = { ...pointer };
        const seq = ++boxSeq;
        boxBusy = true;
        void api
          .airTarget(pointer.x, pointer.y)
          .then((b) => {
            if (seq === boxSeq) box = b;
          })
          .catch(() => undefined)
          .finally(() => (boxBusy = false));
      }

      // Thumb + index: press (and hold to drag).
      const touching = !taught && pinch(8, pinchDown);
      if (!touching) pinchSeen = 0;
      else if (!pinchSeen) pinchSeen = now;
      const p = touching && (pinchDown || now - pinchSeen >= 80);
      if (p && !pinchDown) {
        pinchDown = true;
        pinchAt = now;
        dragging = false;
        L.pinches++;
        pinchFrom = { x: raw.x, y: raw.y };
        dragOut = false;
        ownDown = own;
        // Not a button: it's the character or the orb — pick it up (it
        // drags like a mouse would, through its own drag handling).
        if (own && !own.matches("button, a, select, input, textarea, [role=button]")) {
          const el = document.elementFromPoint(at(pointer).clientX, at(pointer).clientY);
          if (el) {
            grabbing = true;
            ownDown = null;
            fake("pointerdown", pointer, el);
          }
        }
        // A pinch lands on the middle of what's boxed.
        if (box) {
          const cx = box.nx + box.nw / 2;
          const cy = box.ny + box.nh / 2;
          // Only when the hand really is on it (a hair of slack for tiny ones).
          const m = 0.004;
          if (pointer.x >= box.nx - m && pointer.x <= box.nx + box.nw + m && pointer.y >= box.ny - m && pointer.y <= box.ny + box.nh + m) {
            pointer = { x: cx, y: cy };
            void api.airPointer(cx, cy).catch(() => undefined);
          }
        }
        pend3d = !ownDown && !grabbing && !!app3d;
        grip3d = false;
        if (!ownDown && !grabbing && !pend3d) void api.airButton(false, true).catch(() => undefined);
        // A box you can type in: the air keyboard comes up by itself.
        if (!ownDown && !grabbing && box?.field && pointer.x >= box.nx && pointer.x <= box.nx + box.nw && pointer.y >= box.ny && pointer.y <= box.ny + box.nh) {
          window.dispatchEvent(new Event(AIR_KEYBOARD_OPEN));
        }
      } else if (!p && pinchDown) {
        pinchDown = false;
        if (grabbing) {
          grabbing = false;
          fake("pointerup", pointer);
        } else if (ownDown) {
          // Pressed where it began (a drag off it cancels, like a real button).
          const now2 = ownAt(pointer.x, pointer.y);
          if (now2 && (now2 === ownDown || ownDown.contains(now2))) ownDown.click();
          ownDown = null;
        } else if (grip3d) {
          letGo3d();
        } else if (pend3d) {
          // A quick pinch in a 3D app is still a click.
          void api.airButton(false, true).then(() => api.airButton(false, false)).catch(() => undefined);
        } else void api.airButton(false, false).catch(() => undefined);
        pend3d = false;
        grip3d = false;
        dragOut = false;
        pinchFrom = null;
      } else if (pinchDown && now - pinchAt > 250) {
        // A drag: the pinch held while the hand itself moves (measured from
        // the hand, not the ring, which holds still for a moment at first).
        if (pinchFrom && Math.hypot(raw.x - pinchFrom.x, raw.y - pinchFrom.y) > 0.05) L.dragged = true;
        dragging = true;
        mode = dragOut ? "Drag" : "Pinch — move to drag";
        if (pend3d && !grip3d && dragOut) {
          grip3d = true;
          gripStart = api
            .airGrip3d(true)
            .then((ok) => { if (!ok) grip3d = false; })
            .catch(() => { grip3d = false; });
        }
        if (grip3d) mode = `🧊 Turning · ${app3d ?? "3D"}`;
      }
      if (!pinchDown) mode = holdLabel;
      L.gesture = pinchDown ? (dragOut ? "drag" : "pinch") : fist ? "fist" : "point";

      // Thumb + middle / ring / pinky: right-click, copy, paste.
      // 🤙 "Call me": thumb and little finger out, the other three folded,
      // held half a second — Izuki starts listening right away (like Meta's
      // hand gesture for its assistant); just say what you want.
      const thumbOut = near(5) > 0.75 && dist(lm[4], lm[9]) / scale > 0.75;
      const callMe = !taught && thumbOut && upBy(20, 18, 1.08) && folded(8, 5) && folded(12, 9) && folded(16, 13) && !pinchDown;
      if (callMe && now > callCool) {
        if (!callAt) callAt = now;
        else if (now - callAt > 250 && now - callAt <= 500) mode = "🤙 Keep holding to talk…";
        if (now - callAt > 500) {
          callAt = 0;
          // Once per gesture: lower the hand (or change it) to call again.
          callCool = Infinity;
          L.calls++;
          void api.log("[air] 🤙 call gesture — listening").catch(() => undefined);
          flash("🤙 Listening — say it");
          void emit(EV.airCall);
        }
      } else if (!callMe) {
        callAt = 0;
        if (callCool === Infinity) callCool = now + 1200;
      }

      const which = !pinchDown && !callMe ? (pinch(12, other === "middle") ? "middle" : pinch(16, other === "ring") ? "ring" : pinch(20, other === "pinky") ? "pinky" : null) : null;
      if (which && which !== other && now - otherAt > 600) {
        otherAt = now;
        quick(binds.current[which]);
      }
      other = which;

      // Open palm, quick sideways swipe: back / forward.
      const palm = ext.index && ext.middle && ext.ring && ext.pinky;
      if (palm && !taught && now > swipeCool) {
        if (!swipeFrom) swipeFrom = { x: raw.x, y: raw.y, t: now };
        const dt = now - swipeFrom.t;
        const dx = raw.x - swipeFrom.x;
        // A real flick: most of the camera's width in under 0.28 s, dead level,
        // fingers open the whole way. Now that tracking keeps up with fast
        // moves, an ordinary quick move across the screen mustn't go Back.
        if (dt < 280 && Math.abs(dx) > 0.42 && Math.abs(raw.y - swipeFrom.y) < 0.06) {
          quick(binds.current[dx > 0 ? "flick_right" : "flick_left"]);
          swipeCool = now + 900;
          swipeFrom = null;
        } else if (dt > 280) swipeFrom = { x: raw.x, y: raw.y, t: now };
      } else swipeFrom = null;

      // Point at a text box and hold still: it's clicked, then what you say
      // goes in it. (Only on boxes you can type into, so a resting pointing
      // hand doesn't click things.)
      const pointing = ext.index && !ext.middle && !ext.ring && !ext.pinky && !pinchDown && !!box?.field;
      if (pointing) {
        if (!pointFrom || Math.hypot(pointer.x - pointFrom.x, pointer.y - pointFrom.y) > 0.012) {
          pointFrom = { ...pointer };
          pointAt = now;
        } else if (now - pointAt > 900) {
          pointAt = Infinity;
          flash("Say it…");
          window.dispatchEvent(new Event(AIR_KEYBOARD_OPEN));
          void api.airButton(false, true).then(() => api.airButton(false, false)).then(() => emit(EV.airSay)).catch(() => undefined);
        }
      } else {
        pointFrom = null;
      }

      draw(true);
    };

    (async () => {
      try {
        // A camera that never answers (a hidden "allow camera?" box, a driver
        // stuck) shouldn't leave Air control silently waiting forever.
        let late: ReturnType<typeof setTimeout> | undefined;
        let gaveUp = false;
        const opening = openCamera(null, { width: 640, height: 480 });
        // One that answers after we gave up is closed, not left running.
        void opening.then((c) => {
          if (gaveUp) c.stream.getTracks().forEach((t) => t.stop());
        }).catch(() => undefined);
        const cam = await Promise.race([
          opening,
          new Promise<never>((_, fail) => (late = setTimeout(() => {
            gaveUp = true;
            fail(new Error("the camera didn't answer in 12 s"));
          }, 12_000))),
        ]).finally(() => clearTimeout(late));
        live.current.camera = cam.label || "camera";
        void api.log(`[air] camera: ${cam.label || "camera"}`).catch(() => undefined);
        if (!alive) {
          cam.stream.getTracks().forEach((t) => t.stop());
          return;
        }
        stream = cam.stream;
        const v = video.current!;
        v.srcObject = stream;
        const t0 = performance.now();
        const took = () => `${Math.round(performance.now() - t0)} ms`;
        // Every stage gets a time limit and a log line: on a slow PC the hand
        // model sometimes never finished loading, with nothing to say why.
        await within(v.play(), 8000, "the camera picture didn't start");
        setStatus("Getting hand tracking ready…");
        void api.log("[air] loading hand tracking…").catch(() => undefined);
        const base = new URL("/air", window.location.href).href;
        // The graphics chip on its own thread: ~37 ms a look here (the
        // processor took ~300), and its slow first-time setup freezes nothing.
        const fromWorker = await new Promise<string | null>((resolve) => {
          let w: Worker;
          try {
            w = new Worker(new URL("../lib/airWorker.ts", import.meta.url), { type: "module" });
            starting = w;
          } catch (e) {
            void api.log(`[air] no tracker thread (${e instanceof Error ? e.message : e})`).catch(() => undefined);
            return resolve(null);
          }
          const late = setTimeout(() => {
            void api.log("[air] the tracker thread took over 60 s to get ready — using the page instead").catch(() => undefined);
            w.terminate();
            resolve(null);
          }, 60_000);
          w.onmessage = (e: MessageEvent) => {
            const m = e.data as { type: string; engine?: string; ms?: number; lm?: Pt[] | null; message?: string };
            if (m.type === "ready") {
              clearTimeout(late);
              tracker = w;
              resolve(`${m.engine} (on its own thread, ready in ${m.ms} ms)`);
            } else if (m.type === "hand") {
              trackerBusy = false;
              if (!alive) return;
              live.current.ms = Math.round(live.current.ms ? live.current.ms * 0.8 + (m.ms ?? 0) * 0.2 : m.ms ?? 0);
              if (snapNext && live.current.tour) {
                const shown = live.current.snap;
                live.current.snap = snapNext;
                snapNext = shown;
              }
              use(m.lm ?? undefined, performance.now());
            } else if (m.type === "note") {
              void api.log(`[air] ${m.message}`).catch(() => undefined);
            } else if (m.type === "error") {
              trackerBusy = false;
              if (!tracker) {
                clearTimeout(late);
                void api.log(`[air] tracker thread couldn't start: ${m.message}`).catch(() => undefined);
                w.terminate();
                resolve(null);
              } else if (!detectSaid) {
                detectSaid = true;
                void api.log(`[air] hand model error: ${m.message}`).catch(() => undefined);
              }
            }
          };
          w.onerror = (e) => {
            clearTimeout(late);
            void api.log(`[air] tracker thread failed: ${e.message}`).catch(() => undefined);
            w.terminate();
            if (tracker === w) tracker = null;
            trackerBusy = false;
            resolve(null);
          };
          w.postMessage({ type: "start", base });
        });
        if (!alive) {
          // (Set from the worker's reply, which TypeScript can't follow.)
          (tracker as Worker | null)?.terminate();
          return;
        }
        if (fromWorker) {
          live.current.engine = fromWorker.split(" (")[0];
          void api.log(`[air] hand tracking ready on the ${fromWorker}, ${took()} in all`).catch(() => undefined);
        } else {
          // No worker: the processor, right here (slower, but it always works).
          const files = await within(FilesetResolver.forVisionTasks(base), 45_000, "the hand-tracking engine didn't load");
          const making = HandLandmarker.createFromOptions(files, {
            baseOptions: { modelAssetPath: `${base}/hand_landmarker.task`, delegate: "CPU" },
            runningMode: "VIDEO",
            numHands: 1,
            // Finding a new hand stays strict; keeping hold of one already
            // found is looser, so a hand moving fast isn't dropped.
            minHandDetectionConfidence: 0.5,
            minHandPresenceConfidence: 0.4,
            minTrackingConfidence: 0.35,
          });
          let gaveUpModel = false;
          void making.then((l) => gaveUpModel && l.close()).catch(() => undefined);
          const made = await within(making, 60_000, "the hand model didn't load").catch((e) => {
            gaveUpModel = true;
            throw e;
          });
          live.current.engine = "processor";
          void api.log(`[air] hand tracking ready on the processor (in the page), ${took()}`).catch(() => undefined);
          if (!alive) {
            made.close();
            return;
          }
          landmarker = made;
        }
        readyAt = performance.now();
        setStatus(`Air control on — ${cam.label || "camera"}`);
        // Read the camera directly when the webview can: every new picture as
        // it arrives, never an old one twice, and no waiting on the screen to
        // refresh (Windows throttled the overlay's refresh to about once a
        // second — the hand dots lagged and only caught up when you stopped).
        const Processor = (window as unknown as { MediaStreamTrackProcessor?: new (o: { track: MediaStreamTrack; maxBufferSize?: number }) => { readable: ReadableStream<VideoFrame> } }).MediaStreamTrackProcessor;
        const track = stream.getVideoTracks()[0];
        if (Processor && track) {
          try {
            const r = new Processor({ track, maxBufferSize: 1 }).readable.getReader();
            reader = r;
            streaming = true;
            void api.log("[air] reading the camera directly").catch(() => undefined);
            void (async () => {
              while (alive) {
                const { value, done } = await r.read();
                if (done || !value) break;
                try {
                  look(value);
                } finally {
                  value.close();
                }
              }
            })().catch((e) => {
              streaming = false;
              void api.log(`[air] direct camera stopped (${e instanceof Error ? e.message : e}) — using the video instead`).catch(() => undefined);
            });
          } catch {
            streaming = false;
          }
        }
        raf = requestAnimationFrame(frame);
        lastRaf = performance.now();
        timer = setInterval(backup, 100);
      } catch (e) {
        const why = e instanceof Error ? e.message : String(e);
        void api.log(`[air] couldn't start: ${why}`).catch(() => undefined);
        setStatus(
          /camera/i.test(why)
            ? "Air control couldn't start — pick another camera in Settings → Air control, or close apps using it."
            : "Hand tracking couldn't load — turn Air control off and on to try again.",
        );
      }
    })();
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      clearInterval(timer);
      releaseKeys();
      // A pick-up in progress ends here (a drag of Izuki's own things, not a Windows mouse press).
      if (grabbing) fake("pointerup", pointer);
      void reader?.cancel().catch(() => undefined);
      tracker?.postMessage({ type: "stop" });
      tracker?.terminate();
      starting?.terminate();
      if (pinchDown && endPinch3d()) void api.airButton(false, false);
      stream?.getTracks().forEach((t) => t.stop());
      landmarker?.close();
    };
  }, [camKey]);

  return (
    <>
      {tour && <AirTour video={video} live={live} onClose={() => setTour(false)} onCamera={() => setCamKey((k) => k + 1)} />}
      <AirKeyboard />
      <video ref={video} muted playsInline style={{ position: "fixed", left: -4, top: -4, width: 2, height: 2, opacity: 0, pointerEvents: "none" }} />
      <canvas ref={canvas} className="pointer-events-none fixed inset-0 z-[70]" />
      <div className="pointer-events-none fixed bottom-3 left-1/2 z-[70] -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-[11.5px] text-white/85 shadow-lg">
        🖐️ {status}
      </div>
    </>
  );
}

/** The steps of the guided test, and how each is seen to be done. */
type AirLive = {
  lm: Pt[] | null;
  hand: boolean;
  moved: number;
  scrolls: number;
  pauses: number;
  clicked: boolean;
  /** Pinched, held and moved (a drag). */
  dragged: boolean;
  /** Pinches so far. */
  pinches: number;
  /** 🤙 calls so far. */
  calls: number;
  engine: string;
  camera: string;
  looks: number;
  looksAt: number;
  /** Hand looks per second. */
  rate: number;
  /** Milliseconds one look takes. */
  ms: number;
  /** Camera pictures per second. */
  fps: number;
  /** What the hand is doing now, in words, for the guide. */
  gesture: string;
  /** How far apart thumb and index tips are (0 = touching, 1 = wide open). */
  pinch: number;
  /** The guide is open: keep the picture the hand was found in. */
  tour: boolean;
  /** That picture (mirrored), so the dots sit exactly on the fingers. */
  snap: HTMLCanvasElement | null;
};
const BONES = [[0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [5, 6], [6, 7], [7, 8], [5, 9], [9, 10], [10, 11], [11, 12], [9, 13], [13, 14], [14, 15], [15, 16], [13, 17], [17, 18], [18, 19], [19, 20], [0, 17]];

/** Counters a step is measured from (so "Try again" starts it fresh). */
type Base = { moved: number; scrolls: number; pauses: number; clicked: boolean; dragged: boolean; pinches: number };
const baseOf = (l: AirLive): Base => ({ moved: l.moved, scrolls: l.scrolls, pauses: l.pauses, clicked: l.clicked, dragged: l.dragged, pinches: l.pinches });

/**
 * The guided test's steps, in plain words. Each: what to do, with which
 * fingers, a little picture of it, when it counts as done, and what Izuki
 * sees your hand doing right now (so you know if you're doing it right).
 */
const STEPS: Array<{
  title: string;
  how: string;
  demo: string;
  /** The picture's movement: "bob", "slide", "pinch", "drag", "updown", "squeeze". */
  move: string;
  /** The fingertips this step uses, circled on the camera view. */
  tips: number[];
  done: (l: AirLive, b: Base) => boolean;
  /** 0..1 — how far along this step is. */
  progress: (l: AirLive, b: Base) => number;
  now: (l: AirLive) => string;
}> = [
  {
    title: "Show your hand",
    tips: [4, 8, 12, 16, 20],
    how: "Hold up one hand with your palm facing the camera, about an arm's length away. Keep it in the light.",
    demo: "✋",
    move: "bob",
    done: (l) => l.hand && !!l.lm,
    progress: (l) => (l.lm ? 1 : 0),
    now: (l) => (l.lm ? "I can see your hand ✓" : "Looking for your hand…"),
  },
  {
    title: "Move the ring",
    tips: [5, 9],
    how: "Keep your hand open and move it slowly left, right, up and down. The white ring on your screen moves with it.",
    demo: "✋",
    move: "slide",
    done: (l, b) => l.moved - b.moved > 1.5,
    progress: (l, b) => Math.min(1, (l.moved - b.moved) / 1.5),
    now: (l) => (l.lm ? "Moving the ring — keep going" : "Show me your hand"),
  },
  {
    title: "Pinch to click",
    tips: [4, 8],
    how: "Touch the tip of your thumb to the tip of your pointing finger, then open them again — like picking up a grain of rice. Try it on the pink “Pinch me” button below.",
    demo: "🤏",
    move: "pinch",
    done: (l, b) => (l.clicked && !b.clicked) || l.pinches > b.pinches,
    progress: (l) => (l.lm ? 1 - l.pinch : 0),
    now: (l) => (!l.lm ? "Show me your hand" : l.gesture === "pinch" || l.gesture === "drag" ? "Pinched! ✓" : l.pinch < 0.45 ? "Closer… almost touching" : "Thumb and pointing finger apart"),
  },
  {
    title: "Pinch and hold to drag",
    tips: [4, 8],
    how: "Pinch your thumb and pointing finger together and keep them together. Move your hand a little — that drags. Open your fingers to let go.",
    demo: "🤏",
    move: "drag",
    done: (l, b) => l.dragged && !b.dragged,
    progress: (l) => (l.gesture === "drag" ? 0.6 : l.gesture === "pinch" ? 0.3 : 0),
    now: (l) => (!l.lm ? "Show me your hand" : l.gesture === "drag" ? "Dragging — move a little, then open your fingers" : l.gesture === "pinch" ? "Pinched — now move your hand to drag" : "Pinch and hold"),
  },
  {
    title: "Scroll",
    tips: [8, 12],
    how: "Make a peace sign ✌️ — pointing and middle fingers up, the other two folded down (your thumb can rest on them). Hold it, and move your whole hand slowly up or down to scroll — or left and right to scroll sideways.",
    demo: "✌️",
    move: "updown",
    done: (l, b) => l.scrolls - b.scrolls >= 3,
    progress: (l, b) => Math.min(1, (l.scrolls - b.scrolls) / 3),
    now: (l) => (!l.lm ? "Show me your hand" : l.gesture === "scroll" ? "Scrolling ✓ — move up or down" : "Show a peace sign ✌️"),
  },
  {
    title: "Pause",
    tips: [4, 8, 12, 16, 20],
    how: "Show an open hand ✋, then close it into a fist ✊ and hold it for one second — Air control pauses. Open your hand and make a fist again to carry on. (A hand just resting curled never counts.)",
    demo: "✊",
    move: "squeeze",
    done: (l, b) => l.pauses - b.pauses >= 1,
    progress: (l, b) => (l.pauses - b.pauses >= 1 ? 1 : l.gesture === "fist" ? 0.5 : 0),
    now: (l) => (!l.lm ? "Show me your hand" : l.gesture === "fist" ? "Hold the fist…" : "Make a fist ✊"),
  },
];

/**
 * The guided test, one step at a time: what to do and with which fingers, a
 * little moving picture of it, what Izuki sees your hand doing right now,
 * and Back / Try again / Skip. The camera view shows the very picture your
 * hand was found in, with the dots on it — so they sit on your fingers.
 */
function AirTour({ video, live, onClose, onCamera }: { video: React.RefObject<HTMLVideoElement | null>; live: React.MutableRefObject<AirLive>; onClose: () => void; onCamera: () => void }) {
  const preview = useRef<HTMLCanvasElement>(null);
  const [, tick] = useState(0);
  const [at, setAt] = useState(0);
  const tipsRef = useRef<number[]>([4, 8]);
  const base = useRef<Base>(baseOf(live.current));
  const [cheer, setCheer] = useState(false);
  // Every camera, by name (this window already has camera permission).
  const [cams, setCams] = useState<MediaDeviceInfo[]>([]);
  useEffect(() => {
    const read = () => void listCameras().then((c) => setCams(rankCameras(c, savedCamera()))).catch(() => undefined);
    read();
    navigator.mediaDevices?.addEventListener?.("devicechange", read);
    return () => navigator.mediaDevices?.removeEventListener?.("devicechange", read);
  }, []);
  // While the guide is open, the loop keeps the picture each look used.
  useEffect(() => {
    live.current.tour = true;
    return () => {
      live.current.tour = false;
      live.current.snap = null;
    };
  }, [live]);
  useEffect(() => {
    let raf = 0;
    let last = 0;
    let lastWords = 0;
    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      if (now - last < 33) return;
      last = now;
      // The words and the progress bar: five times a second is plenty (the
      // picture itself redraws every frame).
      if (now - lastWords > 200) {
        lastWords = now;
        tick((n) => n + 1);
      }
      const c = preview.current;
      const v = video.current;
      if (!c) return;
      const g = c.getContext("2d");
      if (!g) return;
      const W = c.width, H = c.height;
      const snap = live.current.snap;
      if (snap) g.drawImage(snap, 0, 0, W, H);
      else if (v && v.readyState >= 2) {
        // Mirrored, like a mirror: your right hand on the right.
        g.save();
        g.translate(W, 0);
        g.scale(-1, 1);
        g.drawImage(v, 0, 0, W, H);
        g.restore();
      } else return;
      const lm = live.current.lm;
      if (lm) {
        const P = (p: Pt) => [W - p.x * W, p.y * H] as const;
        g.strokeStyle = "rgba(94,231,255,0.95)";
        g.lineWidth = 2.5;
        for (const [a, b] of BONES) {
          const [x1, y1] = P(lm[a]);
          const [x2, y2] = P(lm[b]);
          g.beginPath();
          g.moveTo(x1, y1);
          g.lineTo(x2, y2);
          g.stroke();
        }
        g.fillStyle = "#ff5caa";
        for (const p of lm) {
          const [x, y] = P(p);
          g.beginPath();
          g.arc(x, y, 3, 0, Math.PI * 2);
          g.fill();
        }
        // The fingertips this step uses, circled.
        for (const i of tipsRef.current) {
          const [x, y] = P(lm[i]);
          g.beginPath();
          g.arc(x, y, 6, 0, Math.PI * 2);
          g.strokeStyle = "#fff";
          g.stroke();
        }
      } else {
        g.fillStyle = "rgba(0,0,0,0.45)";
        g.fillRect(0, H - 26, W, 26);
        g.fillStyle = "#fff";
        g.font = "600 12px system-ui";
        g.fillText("No hand seen yet", 10, H - 9);
      }
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [video, live]);

  const l = live.current;
  const finished = at >= STEPS.length;
  const step = STEPS[Math.min(at, STEPS.length - 1)];
  tipsRef.current = step.tips;
  const done = !finished && step.done(l, base.current);
  // Done: a moment to see the tick, then the next step.
  // (Two effects: one that also cleared its own timer when `cheer` changed
  // left the guide stuck on "that worked".)
  useEffect(() => {
    if (done && !cheer) setCheer(true);
  }, [done, cheer]);
  useEffect(() => {
    if (!cheer) return;
    const t = setTimeout(() => {
      setCheer(false);
      base.current = baseOf(live.current);
      setAt((a) => a + 1);
    }, 900);
    return () => clearTimeout(t);
  }, [cheer, live]);
  const go = (to: number) => {
    base.current = baseOf(live.current);
    setCheer(false);
    setAt(Math.max(0, Math.min(STEPS.length, to)));
  };
  const progress = finished ? 1 : Math.max(0, Math.min(1, step.progress(l, base.current)));

  return (
    <div data-izk-hit className="fixed right-6 top-1/2 z-[75] w-[360px] -translate-y-1/2 rounded-2xl border border-white/15 bg-[#12141f]/95 p-3 text-white shadow-2xl">
      <div className="mb-2 flex items-center justify-between">
        <b className="text-[13px]">🖐️ Air control — guided test</b>
        <button type="button" onClick={onClose} aria-label="Close the guide" className="rounded-full px-2 text-[12px] text-white/60 hover:bg-white/10 hover:text-white">✕</button>
      </div>
      <canvas ref={preview} width={320} height={240} className="w-full rounded-xl bg-black" />
      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 text-[10.5px] text-white/60">
        <span className="max-w-[170px] truncate">📷 {l.camera || "starting…"}</span>
        {l.rate ? <span>{l.rate} looks/s</span> : null}
        {l.ms ? <span>{l.ms} ms each</span> : null}
      </div>
      {cams.length > 1 && (
        <select
          aria-label="Camera"
          value={cams.find((c) => c.label === l.camera)?.deviceId ?? ""}
          onChange={(e) => {
            saveCamera(e.target.value);
            onCamera();
          }}
          className="mt-1.5 w-full rounded-lg border border-white/15 bg-black/40 px-2 py-1 text-[11.5px] text-white"
        >
          {cams.map((c, i) => (
            <option key={c.deviceId || i} value={c.deviceId}>
              📷 {c.label || `Camera ${i + 1}`}
            </option>
          ))}
        </select>
      )}

      {/* Where you are */}
      <div className="mt-2.5 flex items-center gap-2 text-[11px] text-white/70">
        <span>{finished ? "All done" : `Step ${at + 1} of ${STEPS.length}`}</span>
        <div className="flex flex-1 gap-1" aria-hidden>
          {STEPS.map((_, i) => (
            <span key={i} className={"h-1.5 flex-1 rounded-full " + (i < at ? "bg-emerald-400" : i === at ? "bg-cyan-400" : "bg-white/15")} />
          ))}
        </div>
      </div>

      {!finished ? (
        <div className={"mt-2 rounded-xl p-3 " + (cheer ? "bg-emerald-500/20" : "bg-white/5")}>
          <div className="flex items-start gap-3">
            <span aria-hidden className={`izk-demo izk-demo-${step.move} flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-black/30 text-[28px]`}>
              {cheer ? "✅" : step.demo}
            </span>
            <div className="min-w-0">
              <b className="block text-[14px]">{step.title}</b>
              <p className="mt-0.5 text-[12px] leading-snug text-white/80">{step.how}</p>
            </div>
          </div>
          {/* What it sees your hand doing right now */}
          <div className="mt-2.5 rounded-lg bg-black/30 px-2.5 py-1.5" aria-live="polite">
            <div className="text-[11.5px] font-semibold">{cheer ? "Nice — that worked ✓" : step.now(l)}</div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-cyan-400 transition-[width] duration-150" style={{ width: `${Math.round(progress * 100)}%` }} />
            </div>
          </div>
          {at === 2 && (
            <button
              type="button"
              onClick={() => (live.current.clicked = true)}
              className="mt-2 w-full rounded-xl bg-fuchsia-500 py-3 text-[13px] font-bold text-white shadow-lg hover:bg-fuchsia-400"
            >
              Pinch me
            </button>
          )}
          <div className="mt-2 flex gap-1.5 text-[11.5px]">
            <button type="button" disabled={at === 0} onClick={() => go(at - 1)} className="rounded-lg bg-white/10 px-2.5 py-1 disabled:opacity-30">← Back</button>
            <button type="button" onClick={() => go(at)} className="rounded-lg bg-white/10 px-2.5 py-1">Try again</button>
            <button type="button" onClick={() => go(at + 1)} className="ml-auto rounded-lg bg-white/10 px-2.5 py-1">Skip →</button>
          </div>
        </div>
      ) : (
        <div className="mt-2 rounded-xl bg-emerald-500/15 p-3 text-[12px] leading-relaxed text-emerald-100">
          <b className="block text-[13px]">All working! 🎉</b>
          <ul className="mt-1 space-y-0.5">
            <li>✋ Open hand — move the ring</li>
            <li>🤏 Thumb + pointing finger — click (hold to drag)</li>
            <li>🤌 Thumb + middle finger — right-click</li>
            <li>✌️ Peace sign — scroll</li>
            <li>✊ Fist for a second — pause / carry on</li>
            <li>🤙 “Call me” hand (thumb and little finger out) — talk to Izuki</li>
            <li>👋 Quick flick of your open hand — back</li>
          </ul>
          <p className="mt-1.5 text-emerald-100/80">The ring too jumpy or too slow? Settings → Air control → How it follows your hand.</p>
          <div className="mt-2 flex gap-1.5">
            <button type="button" onClick={() => go(0)} className="flex-1 rounded-lg bg-white/10 py-1.5 font-semibold">Do it again</button>
            <button type="button" onClick={onClose} className="flex-1 rounded-lg bg-emerald-500 py-1.5 font-semibold text-white">Done</button>
          </div>
        </div>
      )}
      {!l.hand && (
        <p className="mt-2 text-[10.5px] leading-snug text-amber-300/90">
          Not seeing your hand? Check the picture above is your camera, there's light on your hand, and it's not too far away. Wrong camera? Pick it above.
        </p>
      )}
    </div>
  );
}
