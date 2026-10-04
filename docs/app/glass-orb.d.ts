export function drawGlassOrb(
  ctx: CanvasRenderingContext2D,
  size: number,
  style: string,
  time: number,
  energy: number,
  thinking: number | boolean,
  /** -1 sad … 0 calm … 1 happy (the face's mouth and brows). */
  mood?: number,
): boolean;
