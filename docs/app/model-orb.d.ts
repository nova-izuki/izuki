export interface FaceLook {
  /** Skin / whole-model tint, "#rrggbb" ("#ffffff" = as made). */
  tint: string;
  /** Hair colour for models with separate hair ("" = as made). */
  hair: string;
  /** 0 matte … 1 glossy. */
  gloss: number;
  /** Hologram glow 0…1. */
  glow: number;
  /** Rim light / orb colour ("" = the face's own). */
  accent: string;
  scale: number;
  /** Move up/down, -1…1. */
  y: number;
  /** Turn, degrees. */
  rot: number;
  /** Rigged models: hide the body, just the head. */
  headOnly: boolean;
}

export interface FaceInfo {
  id: string;
  name: string;
  gender: "male" | "female";
  url: string;
  thumb: string;
  glow: number;
  accent: string;
}

export interface SavedFace {
  id: string;
  name: string;
  kind: "face" | "me";
  thumb: string;
  rigged: boolean;
  talks: boolean;
  added: number;
}

export const FACES: FaceInfo[];
export const DEFAULT_LOOK: FaceLook;
export function faceInfo(id: string): FaceInfo | null;
export function savedFaces(): Promise<SavedFace[]>;
export function addFace(file: File, kind?: "face" | "me"): Promise<SavedFace>;
export function removeFace(id: string): Promise<void>;
export function preloadFace(id: string): Promise<unknown>;
export function thumbFor(id: string, px?: number, opts?: { jaw?: number; mood?: number; type?: string; custom?: Partial<FaceLook> }): Promise<string>;
export function drawModelOrb(
  ctx: CanvasRenderingContext2D,
  size: number,
  opts: { id: string; time: number; energy: number; thinking?: number | boolean; mood?: number; look?: { x: number; y: number } | null; poke?: number; custom?: Partial<FaceLook> | null },
): boolean;
