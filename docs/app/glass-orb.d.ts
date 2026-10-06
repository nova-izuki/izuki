import type { FaceLook } from "./model-orb.js";

export interface FaceOptions {
  /** Where the face looks (-1…1), or null to let it wander. */
  look?: { x: number; y: number } | null;
  /** Tapped (a new value each time): the face reacts. */
  poke?: number;
  /** How this face is set up (tint, glow, size…; for 2D characters render, framing, orb). */
  custom?: (Partial<FaceLook> & { render?: "flat" | "comic"; framing?: "full" | "half" | "bust" | "head"; orb?: boolean }) | null;
  /** 2D characters: whose character (the voice in use). */
  persona?: string;
  /** What's being said right now — the character's mouth and gestures follow it. */
  say?: { text: string } | null;
}

export function isToon(style: string): boolean;

export function drawGlassOrb(
  ctx: CanvasRenderingContext2D,
  size: number,
  style: string,
  time: number,
  energy: number,
  thinking: number | boolean,
  /** -1 sad … 0 calm … 1 happy (the face's mouth). */
  mood?: number,
  /** For the 3D faces ("model:<id>"): where it looks, pokes, its look. */
  face?: FaceOptions | null,
): boolean;

export function faceFromStorage(style: string): FaceOptions;
