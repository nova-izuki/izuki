export const LIVE_STATE: { idle: number; listening: number; thinking: number; speaking: number; working: number };
export const LIVE_QUAD_VERT: string;
export const LIVE_SCENE_VERT: string;
export const LIVE_FIELD_FRAG: string;
export function tintRgb(tint: string | number[]): number[];
export interface LiveField {
  /** True when the GPU shader is live; false for the plain 2D fallback. */
  gpu: boolean;
  readonly time: number;
  frame(state: string, level: number, dt: number): void;
  still(state: string, level: number): void;
  pulse(at?: number): void;
  recolour(colours?: string[]): void;
  resize(cssWidth: number, cssHeight: number, dpr?: number): void;
  dispose(): void;
}
export function createLiveField(
  canvas: HTMLCanvasElement,
  opts?: { colors?: string[]; opacity?: number; maxDpr?: number; maxPixels?: number }
): LiveField | null;
