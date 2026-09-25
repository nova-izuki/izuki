// onnxruntime-web ships types, but its package.json "exports" hides them
// from TypeScript's module resolution. The wake-word worker only uses a
// handful of calls (see src/lib/wakeEngine.ts), so it's declared loosely.
declare module "onnxruntime-web" {
  export const env: { wasm: { wasmPaths?: string; numThreads?: number } };
  export const InferenceSession: { create(model: Uint8Array, options?: object): Promise<unknown> };
  export const Tensor: new (type: string, data: Float32Array, dims: number[]) => unknown;
}
