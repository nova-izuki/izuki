import type { FaceLook } from "./model-orb.js";

export interface FaceOptions {
  /** Where the face looks (-1…1), or null to let it wander. */
  look?: { x: number; y: number } | null;
  /** Tapped (a new value each time): the face reacts. */
  poke?: number;
  /** How this face is set up (tint, glow, size…). */
  custom?: Partial<FaceLook> | null;
}

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
