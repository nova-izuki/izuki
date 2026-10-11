export interface ToonCharacter { name: string; g: "m" | "f"; skin: string; hair: string[]; top: string[]; pants: string; shoes: string; eyes: string; extras?: string[]; build?: string }
export const CHARACTERS: Record<string, ToonCharacter>;
export const SKIN: Record<string, string>;
export function characterFor(persona: string): ToonCharacter;
export function drawToon(ctx: CanvasRenderingContext2D, size: number, opts: Record<string, unknown>): boolean;
export function toonThumb(persona: string, render?: "flat" | "comic" | "ink" | "painted" | "concept", px?: number, framing?: string): string;
export const PAINTED: string[];
export function paintedReady(): Promise<void>;
