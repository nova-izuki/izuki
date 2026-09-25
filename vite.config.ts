import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "node:path";

// Izuki runs two windows off one dev server:
//   index.html   -> glass config panel
//   overlay.html -> fullscreen transparent drawing overlay
export default defineConfig({
  plugins: [react(), tailwindcss()],
  clearScreen: false,
  server: {
    port: 1420,
    strictPort: true,
    host: "127.0.0.1",
    watch: { ignored: ["**/src-tauri/**"] },
    // Vite's red error box can't be dismissed on the overlay window — it
    // covers the whole desktop and clicks pass straight through it. Errors
    // still reach the terminal.
    hmr: { overlay: false },
  },
  envPrefix: ["VITE_", "TAURI_"],
  // The speech worker (src/lib/sttWorker.ts) loads transformers.js with a
  // dynamic import, which only ES-module workers can do.
  worker: { format: "es" },
  build: {
    target: "chrome120",
    sourcemap: false,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        overlay: resolve(__dirname, "overlay.html"),
      },
    },
  },
  resolve: {
    alias: { "@": resolve(__dirname, "src") },
  },
});
