import { useEffect, useRef, useState } from "react";
import { FilesetResolver, HandLandmarker } from "@mediapipe/tasks-vision";
import { api, emit, EV, on } from "../lib/ipc";
import { openCamera } from "../lib/camera";
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
class Smooth {
  private x: number | null = null;
  private dx = 0;
  private t = 0;
  constructor(private minCut = 1.4, private beta = 0.03) {}
  next(v: number, now: number) {
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
    const cut = this.minCut + this.beta * Math.abs(this.dx);
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

export function AirControl({ gestures }: { gestures: Custom[] }) {
  const video = useRef<HTMLVideoElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [status, setStatus] = useState("Starting the camera…");
  const customs = useRef<Custom[]>(gestures);
  customs.current = gestures;
  const recording = useRef<{ name: string; action: string; frames: number[][]; until: number } | null>(null);

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
    let raf = 0;
    let lastLook = 0;
    let lastHand = performance.now();
    const sx = new Smooth();
    const sy = new Smooth();
    // Gesture state.
    let pinchDown = false;
    let pinchAt = 0;
    let dragging = false;
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
      const v = video.current;
      const now = performance.now();
      const handRecently = now - lastHand < 2000;
      if (!landmarker || !v || v.readyState < 2) return;
      // Full speed with a hand in view; four looks a second without.
      if (now - lastLook < (handRecently ? 0 : 250)) return;
      lastLook = now;
      if (now - lastHand > IDLE_OFF_MS) {
        // Nobody's here: switch off (once) — the overlay unmounts this.
        if (!switchedOff) {
          switchedOff = true;
          void emit(EV.patchSettings, { air_enabled: false });
        }
        return;
      }
      const res = landmarker.detectForVideo(v, now);
      const lm = res.landmarks?.[0] as Pt[] | undefined;
      if (!lm) {
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
        draw(true);
        return;
      }

      // The pointer: the index and middle knuckles (steady through pinches).
      const raw = { x: 1 - (lm[5].x + lm[9].x) / 2, y: (lm[5].y + lm[9].y) / 2 };
      const active = { x: (raw.x - 0.2) / 0.6, y: (raw.y - 0.15) / 0.6 };
      const nx = Math.min(1, Math.max(0, sx.next(active.x, now)));
      const ny = Math.min(1, Math.max(0, sy.next(active.y, now)));
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
        if (scrollY === null) scrollY = ny;
        scrollAcc += (ny - scrollY) * 40;
        scrollY = ny;
        const notches = Math.trunc(scrollAcc);
        if (notches) {
          scrollAcc -= notches;
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
        dragging = true;
        mode = "Drag";
      }
      if (!pinchDown) mode = "";

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
        const cam = await openCamera(null, { width: 320, height: 240 });
        if (!alive) {
          cam.stream.getTracks().forEach((t) => t.stop());
          return;
        }
        stream = cam.stream;
        const v = video.current!;
        v.srcObject = stream;
        await v.play();
        const files = await FilesetResolver.forVisionTasks(new URL("/air", window.location.href).href);
        const make = (delegate: "GPU" | "CPU") =>
          HandLandmarker.createFromOptions(files, {
            baseOptions: { modelAssetPath: new URL("/air/hand_landmarker.task", window.location.href).href, delegate },
            runningMode: "VIDEO",
            numHands: 1,
            minHandDetectionConfidence: 0.6,
            minTrackingConfidence: 0.5,
          });
        // The graphics chip is easiest on the battery; the processor if it can't.
        const made = await make("GPU").catch(() => make("CPU"));
        if (!alive) {
          made.close();
          return;
        }
        landmarker = made;
        setStatus(`Air control on — ${cam.label || "camera"}`);
        raf = requestAnimationFrame(frame);
      } catch (e) {
        void api.log(`[air] couldn't start: ${e instanceof Error ? e.message : String(e)}`).catch(() => undefined);
        setStatus("Air control couldn't start — pick another camera in Settings → Air control, or close apps using it.");
      }
    })();
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      if (pinchDown) void api.airButton(false, false);
      stream?.getTracks().forEach((t) => t.stop());
      landmarker?.close();
    };
  }, []);

  return (
    <>
      <video ref={video} muted playsInline className="hidden" />
      <canvas ref={canvas} className="pointer-events-none fixed inset-0 z-[70]" />
      <div className="pointer-events-none fixed bottom-3 left-1/2 z-[70] -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-[11.5px] text-white/85 shadow-lg">
        🖐️ {status}
      </div>
    </>
  );
}
