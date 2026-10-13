export interface MovesPack {
  id: string;
  data: { height: number; states: Record<string, { x: number; y: number; w: number; h: number; fx: number; fy: number }[]> };
  img: HTMLImageElement;
}
export interface Mover {
  state: string;
  t: number;
  /** Seconds since it was made (breathing). */
  clock?: number;
}
export function loadMoves(id: string): Promise<MovesPack | null>;
export function movesIds(): string[];
export function createMover(): Mover;
export function stepMover(m: Mover, dt: number, want?: string): Mover;
export function drawMover(ctx: CanvasRenderingContext2D, pack: MovesPack | null, m: Mover, opts: { x: number; y: number; height: number; facing?: number; shadow?: boolean; retro?: boolean }): boolean;
