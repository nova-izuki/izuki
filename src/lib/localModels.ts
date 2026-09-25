/**
 * transformers.js, set up to run fully on this PC — the one loader both
 * on-device models (the natural voice and the speech-to-text) go through.
 *
 * Nothing here reaches the internet from the webview itself:
 *  - model files come from `http://izukimodel.localhost/`, Izuki's own
 *    handler in Rust (models.rs), which downloads each file once into
 *    %APPDATA%\Izuki\models and serves it from disk after that. WebView2's
 *    own fetch to Hugging Face was failing outright ("Failed to fetch").
 *  - the ONNX runtime (.mjs + .wasm) is compiled into the app and served
 *    from the same place, instead of coming from a CDN.
 *
 * Loaded lazily — it's several MB of JS the panel shouldn't pay for at boot.
 */
import { api } from "./ipc";

type Transformers = typeof import("@huggingface/transformers");

/** Log whether the webview can reach the model server and the runtime. */
async function probe(host: string) {
  // A page CSP missing the model server (index.html's connect-src) shows
  // up here as an instant "Failed to fetch" — it never reaches Rust.
  // A page CSP missing the model server shows up here as an instant
  // "Failed to fetch" that never reaches Rust.
  const urls = [
    `${host}onnx-community/Kokoro-82M-v1.0-ONNX/resolve/main/config.json`,
    `${host}ort/ort-wasm-simd-threaded.jsep.mjs`,
  ];
  for (const url of urls) {
    const began = performance.now();
    try {
      const r = await fetch(url, { cache: "no-store" });
      void api.log(`models: probe ${url} -> ${r.status} (${Math.round(performance.now() - began)}ms)`);
    } catch (e) {
      void api.log(
        `models: probe ${url} -> ${e instanceof Error ? `${e.name}: ${e.message}` : String(e)} (${Math.round(performance.now() - began)}ms)`
      );
    }
  }
}

/** models.rs — Izuki's own model server (index.html's CSP must allow it). */
const MODEL_HOST = "http://izukimodel.localhost/";

let loaded: Promise<Transformers> | null = null;

export function transformers(): Promise<Transformers> {
  if (!loaded) {
    loaded = import("@huggingface/transformers").then((t) => {
      t.env.remoteHost = MODEL_HOST;
      t.env.allowLocalModels = false;
      // The files already live on disk; a second copy in CacheStorage
      // would just double the space for nothing.
      t.env.useBrowserCache = false;
      const wasm = t.env.backends.onnx.wasm;
      if (wasm) wasm.wasmPaths = `${MODEL_HOST}ort/`;
      void probe(t.env.remoteHost);
      return t;
    });
    loaded.catch(() => {
      loaded = null;
    });
  }
  return loaded;
}
