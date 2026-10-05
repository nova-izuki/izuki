import type { AvatarOptions, Gender } from "./face3d.js";

export interface FaceOptions {
  gender: Gender;
  look?: { x: number; y: number } | null;
  avatar: AvatarOptions;
  /** Tapped (a new value each time): the 3D face reacts. */
  poke?: number;
}

export function drawGlassOrb(
  ctx: CanvasRenderingContext2D,
  size: number,
  style: string,
  time: number,
  energy: number,
  thinking: number | boolean,
  /** -1 sad … 0 calm … 1 happy (the face's mouth and brows). */
  mood?: number,
  /** For the 3D faces ("holo3d", "avatar"): who, and how they look. */
  face?: FaceOptions | null,
): boolean;

export function avatarFromStorage(): FaceOptions;
