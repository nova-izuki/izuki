import { useEffect, useRef, useState } from "react";
import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";
import { api, emit, EV, on } from "../lib/ipc";
import { listCameras, openCamera, rankCameras, saveCamera, savedCamera } from "../lib/camera";
import { AirKeyboard } from "./AirKeyboard";
import type { Settings } from "../lib/types";

/**
 * Air control — the PC driven by your hand in the air, Meta-Quest style,
 * through the webcam (air.rs is the PC side):
 *
 *   ☝️  your hand moves the pointer (knuckles, so pinching doesn't jolt it)
 *   🤏  thumb + index: click — hold and move to drag and drop
 *   🤌  thumb + middle: right-click · thumb + ring: copy · thumb + pinky: paste
 *   ✌️  two fingers up, move up/down: scroll
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
  const last = useRef("");
  useEffect(() => {
    let alive = true;
    const refresh = () =>
      void api
        .getSettings()
        .then((s) => {
          if (!alive) return;
          setMode(s.air_mode in AIR_MODES ? s.air_mode : "balanced");
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
  return gestures ? <AirControl gestures={gestures} mode={mode} /> : null;
}

export function AirControl({ gestures, mode: airMode = "balanced" }: { gestures: Custom[]; mode?: AirMode }) {
  const tuning = useRef(AIR_MODES[airMode]);
  tuning.current = AIR_MODES[airMode] ?? AIR_MODES.balanced;
  const video = useRef<HTMLVideoElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState("Starting the camera…");
  const customs = useRef<Custom[]>(gestures);
  customs.current = gestures;
  const recording = useRef<{ name: string; action: string; frames: number[][]; until: number } | null>(null);
  /** What the guided test watches: the last hand, and what's been done. */
  const live = useRef<AirLive>({ lm: null, hand: false, moved: 0, scrolls: 0, pauses: 0, clicked: false, dragged: false, engine: "", camera: "", looks: 0, looksAt: 0, rate: 0, ms: 0, fps: 0, gesture: "", pinch: 1, tour: false, snap: null });
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
    /** How far the hand had moved when a drag began (the guide's drag step). */
    let dragFrom = 0;
    let other: "middle" | "ring" | "pinky" | null = null;
    let otherAt = 0;
    let scrollY: number | null = null;
    let scrollAcc = 0;
    let fistAt = 0;
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
        g.strokeStyle = "rgba(94,231,255,0.95)";
        g.lineWidth = 2;
        g.shadowColor = "rgba(94,231,255,0.8)";
        g.shadowBlur = 8;
        const r = Math.min(8, box.nw * W * 0.2, box.nh * H * 0.2);
        g.beginPath();
        g.roundRect(box.nx * W - 2, box.ny * H - 2, box.nw * W + 4, box.nh * H + 4, r);
        g.stroke();
        g.shadowBlur = 0;
      }
      const px = pointer.x * W;
      const py = pointer.y * H;
      g.beginPath();
      g.arc(px, py, pinchDown ? 9 : 14, 0, Math.PI * 2);
      g.strokeStyle = paused ? "rgba(255,255,255,0.35)" : pinchDown ? "rgba(255,92,170,0.95)" : "rgba(255,255,255,0.9)";
      g.lineWidth = 2.5;
      g.stroke();
      if (pinchDown) {
        g.fillStyle = "rgba(255,92,170,0.35)";
        g.fill();
      }
      const label = mode || (performance.now() < shown.until ? shown.text : "");
      if (label) {
        g.font = "600 12px system-ui";
        g.fillStyle = "rgba(255,255,255,0.92)";
        g.fillText(label, px + 18, py - 14);
      }
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
        void api.log(`[air] ${L.rate} looks/s, ${L.ms} ms per look, camera ${streaming ? `${L.fps} pictures/s (direct)` : "via video"}, ${frames} pictures so far, hand ${L.hand ? "seen" : "not seen yet"}`).catch(() => undefined);
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
        L.gesture = "";
        if (pinchDown) {
          void api.airButton(false, false);
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
      const up = (tip: number, pip: number) => dist(lm[0], lm[tip]) > dist(lm[0], lm[pip]) * 1.12;
      const ext = { index: up(8, 6), middle: up(12, 10), ring: up(16, 14), pinky: up(20, 18) };
      const pinch = (tip: number, on: boolean) => dist(lm[4], lm[tip]) / scale < (on ? 0.42 : 0.3);

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
      const fist = !ext.index && !ext.middle && !ext.ring && !ext.pinky && !pinch(8, false);
      if (fist) {
        if (!fistAt) fistAt = now;
        else if (now - fistAt > 800) {
          paused = !paused;
          live.current.pauses++;
          fistAt = Infinity;
          setStatus(paused ? "Paused — make a fist again to carry on" : "Air control on");
        }
      } else fistAt = 0;
      if (paused) {
        if (pinchDown) {
          pinchDown = false;
          void api.airButton(false, false).catch(() => undefined);
        }
        mode = "Paused";
        L.gesture = "fist";
        draw(true);
        return;
      }
      L.pinch = Math.min(1, dist(lm[4], lm[8]) / scale / 0.9);

      // The pointer: the index and middle knuckles (steady through pinches).
      const raw = { x: 1 - (lm[5].x + lm[9].x) / 2, y: (lm[5].y + lm[9].y) / 2 };
      const tune = tuning.current;
      const span = tune.region;
      const active = { x: (raw.x - (1 - span) / 2) / span, y: (raw.y - (0.9 - span) / 2) / span };
      const nx = Math.min(1, Math.max(0, sx.next(active.x, now, tune.minCut, tune.beta)));
      const ny = Math.min(1, Math.max(0, sy.next(active.y, now, tune.minCut, tune.beta)));
      // Your own gestures come first (a taught peace sign isn't a scroll):
      // hold the pose a moment. The pointer stays put while you show it.
      let taught: Custom | null = null;
      if (!pinchDown && customs.current.length) {
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
        draw(true);
        return;
      }
      customName = "";

      const twoUp = ext.index && ext.middle && !ext.ring && !ext.pinky && !pinch(8, false);
      // Scrolling holds the pointer still and turns hand movement into notches.
      if (twoUp) {
        mode = "Scroll";
        L.gesture = "scroll";
        if (scrollY === null) scrollY = ny;
        scrollAcc += (ny - scrollY) * 40;
        scrollY = ny;
        const notches = Math.trunc(scrollAcc);
        if (notches) {
          scrollAcc -= notches;
          live.current.scrolls += Math.abs(notches);
          void api.airScroll(notches).catch(() => undefined);
        }
        draw(true);
        return;
      }
      scrollY = null;
      scrollAcc = 0;
      // During a pinch's first moment, the pointer holds (no accidental drag).
      const settling = pinchDown && now - pinchAt < 140 && !dragging;
      if (!settling) {
        live.current.moved += Math.hypot(nx - pointer.x, ny - pointer.y);
        pointer = { x: nx, y: ny };
        void api.airPointer(nx, ny).catch(() => undefined);
      }

      // The box under the hand, eight times a second when it has moved.
      if (!boxBusy && now - boxAt > 125 && Math.hypot(pointer.x - boxFor.x, pointer.y - boxFor.y) > 0.004) {
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
      const p = pinch(8, pinchDown);
      if (p && !pinchDown) {
        pinchDown = true;
        pinchAt = now;
        dragging = false;
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
        void api.airButton(false, true).catch(() => undefined);
      } else if (!p && pinchDown) {
        pinchDown = false;
        void api.airButton(false, false).catch(() => undefined);
      } else if (pinchDown && now - pinchAt > 250) {
        if (dragging && L.moved - dragFrom > 0.08) L.dragged = true;
        if (!dragging) dragFrom = L.moved;
        dragging = true;
        mode = "Drag";
      }
      if (!pinchDown) mode = "";
      L.gesture = pinchDown ? (dragging ? "drag" : "pinch") : fist ? "fist" : "point";

      // Thumb + middle / ring / pinky: right-click, copy, paste.
      const which = !pinchDown ? (pinch(12, other === "middle") ? "middle" : pinch(16, other === "ring") ? "ring" : pinch(20, other === "pinky") ? "pinky" : null) : null;
      if (which && which !== other && now - otherAt > 600) {
        otherAt = now;
        if (which === "middle") {
          void api.airButton(true, true).then(() => api.airButton(true, false)).catch(() => undefined);
          flash("Right-click");
        } else if (which === "ring") {
          void api.airKeys("ctrl+c").catch(() => undefined);
          flash("Copied");
        } else {
          void api.airKeys("ctrl+v").catch(() => undefined);
          flash("Pasted");
        }
      }
      other = which;

      // Open palm, quick sideways swipe: back / forward.
      const palm = ext.index && ext.middle && ext.ring && ext.pinky;
      if (palm && now > swipeCool) {
        if (!swipeFrom) swipeFrom = { x: raw.x, y: raw.y, t: now };
        const dt = now - swipeFrom.t;
        const dx = raw.x - swipeFrom.x;
        // A real flick: half the screen in a third of a second, and level —
        // just moving the pointer with an open hand never counts.
        if (dt < 330 && Math.abs(dx) > 0.3 && Math.abs(raw.y - swipeFrom.y) < 0.08) {
          void api.airKeys(dx > 0 ? "alt+right" : "alt+left").catch(() => undefined);
          flash(dx > 0 ? "Forward" : "Back");
          swipeCool = now + 900;
          swipeFrom = null;
        } else if (dt > 330) swipeFrom = { x: raw.x, y: raw.y, t: now };
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
            minHandDetectionConfidence: 0.5,
            minHandPresenceConfidence: 0.5,
            minTrackingConfidence: 0.5,
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
      void reader?.cancel().catch(() => undefined);
      tracker?.postMessage({ type: "stop" });
      tracker?.terminate();
      starting?.terminate();
      if (pinchDown) void api.airButton(false, false);
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
type Base = { moved: number; scrolls: number; pauses: number; clicked: boolean; dragged: boolean };
const baseOf = (l: AirLive): Base => ({ moved: l.moved, scrolls: l.scrolls, pauses: l.pauses, clicked: l.clicked, dragged: l.dragged });

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
  done: (l: AirLive, b: Base) => boolean;
  /** 0..1 — how far along this step is. */
  progress: (l: AirLive, b: Base) => number;
  now: (l: AirLive) => string;
}> = [
  {
    title: "Show your hand",
    how: "Hold up one hand with your palm facing the camera, about an arm's length away. Keep it in the light.",
    demo: "✋",
    move: "bob",
    done: (l) => l.hand && !!l.lm,
    progress: (l) => (l.lm ? 1 : 0),
    now: (l) => (l.lm ? "I can see your hand ✓" : "Looking for your hand…"),
  },
  {
    title: "Move the ring",
    how: "Keep your hand open and move it slowly left, right, up and down. The white ring on your screen moves with it.",
    demo: "✋",
    move: "slide",
    done: (l, b) => l.moved - b.moved > 1.5,
    progress: (l, b) => Math.min(1, (l.moved - b.moved) / 1.5),
    now: (l) => (l.lm ? "Moving the ring — keep going" : "Show me your hand"),
  },
  {
    title: "Pinch to click",
    how: "Move the ring onto the pink “Pinch me” button below. Then touch the tip of your thumb to the tip of your pointing finger, and open them again — like picking up a grain of rice.",
    demo: "🤏",
    move: "pinch",
    done: (l, b) => l.clicked && !b.clicked,
    progress: (l) => (l.lm ? 1 - l.pinch : 0),
    now: (l) => (!l.lm ? "Show me your hand" : l.gesture === "pinch" || l.gesture === "drag" ? "Pinched! ✓" : l.pinch < 0.45 ? "Closer… almost touching" : "Thumb and pointing finger apart"),
  },
  {
    title: "Pinch and hold to drag",
    how: "Pinch your thumb and pointing finger together and keep them together. Move your hand a little — that drags. Open your fingers to let go.",
    demo: "🤏",
    move: "drag",
    done: (l, b) => l.dragged && !b.dragged,
    progress: (l) => (l.gesture === "drag" ? 0.6 : l.gesture === "pinch" ? 0.3 : 0),
    now: (l) => (!l.lm ? "Show me your hand" : l.gesture === "drag" ? "Dragging — move a little, then open your fingers" : l.gesture === "pinch" ? "Keep holding the pinch…" : "Pinch and hold"),
  },
  {
    title: "Scroll",
    how: "Hold up two fingers — your pointing and middle fingers, like a peace sign ✌️ — with the others folded down. Move your hand up or down to scroll.",
    demo: "✌️",
    move: "updown",
    done: (l, b) => l.scrolls - b.scrolls >= 3,
    progress: (l, b) => Math.min(1, (l.scrolls - b.scrolls) / 3),
    now: (l) => (!l.lm ? "Show me your hand" : l.gesture === "scroll" ? "Scrolling ✓ — move up or down" : "Show a peace sign ✌️"),
  },
  {
    title: "Pause",
    how: "Make a fist ✊ and hold it still for one second — Air control pauses. Make a fist again to carry on.",
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
        // The two fingertips that pinch, bigger.
        for (const i of [4, 8]) {
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
