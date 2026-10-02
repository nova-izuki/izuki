export interface OrbMotion { time: number; phase: number; energy: number; onset: number; waiting: number; blobs: { x: number; y: number; vx: number; vy: number; r: number }[]; }
export function createOrbMotion(): OrbMotion;
export function stepOrbMotion(state: OrbMotion, dt: number, input: number, mode: string, response?: number): OrbMotion;
export function fluidOutline(blobs: OrbMotion['blobs'], resolution?: number): number[][][];
export function waveEnvelope(buffer: ArrayBuffer): { levels: Float32Array; rate: number } | null;
