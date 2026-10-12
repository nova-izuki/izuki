export interface Puppet {
  id: string;
  rig: { head: [number, number]; frames: Record<string, [number, number]>; size: [number, number] };
  pics: { base: HTMLImageElement; body: HTMLImageElement; mouth: HTMLImageElement; eyes: HTMLImageElement };
  width: number;
  height: number;
}
export interface Actor {
  t: number;
  prop: string | null;
  reaction: string | null;
}
export interface ActorInput {
  mode?: "idle" | "listening" | "thinking" | "working" | "speaking";
  energy?: number;
  walk?: number;
  music?: boolean;
  look?: number;
  point?: { side: "L" | "R"; up: number } | null;
  cheer?: boolean;
  shrug?: boolean;
  wave?: boolean;
}
export interface Drawn {
  hands: [number, number][];
  head: [number, number];
  box: [number, number, number, number];
}
export function loadPuppet(id: string): Promise<Puppet | null>;
export function createActor(): Actor;
export function stepActor(a: Actor, dt: number, input?: ActorInput): Actor;
export function react(a: Actor, name: "wave" | "bye" | "cheer" | "shrug" | "thumbs" | "nod" | "shake" | "facepalm" | "clap" | "laugh" | "sassy"): void;
export function drawPuppet(
  ctx: CanvasRenderingContext2D,
  p: Puppet | null,
  a: Actor,
  opts: { x: number; y: number; height: number; facing?: number; laptopOn?: boolean; shadow?: boolean },
): Drawn | false;
export function puppetIds(): Promise<string[]>;
