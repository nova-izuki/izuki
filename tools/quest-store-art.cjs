// Izuki VR's Meta Horizon Store pictures, made from the app itself:
//   - the branded art (hero, covers, mini, logo, icon, spatialized icon) with
//     the room's real orb shader and the exact title, IZUKI NOVA;
//   - five screenshots of the real 3D room (docs/app, the flat preview), with a
//     pretend PC on this machine for the PC scenes (it shows izukinova.ai).
// Sizes and rules: docs/QUEST-STORE.md. Uses the installed Edge; no downloads,
// no AI calls, no keys (the room only needs to think one is set).
//   node tools/quest-store-art.cjs          everything, into quest/store-art/
//   node tools/quest-store-art.cjs art      only the branded art
//   node tools/quest-store-art.cjs shots    only the screenshots
const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const http = require("node:http");
const zlib = require("node:zlib");
const { spawn } = require("node:child_process");
const { closeTestBrowser } = require("./browser-cleanup.cjs");

const root = path.resolve(__dirname, "..");
const docs = path.join(root, "docs");
const out = path.join(root, "quest", "store-art");
const edge = process.env.IZUKI_TEST_BROWSER || "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const only = process.argv[2] || "all";
const pause = (ms) => new Promise((r) => setTimeout(r, ms));
// The pretend PC's pairing pass: it exists only inside this run's local server.
const PASS = "store-art-" + Math.random().toString(36).slice(2);

// ---- the orb's own code, from the room --------------------------------------
function orbBundle() {
  const src = fs.readFileSync(path.join(docs, "app", "vr-scene.src.js"), "utf8");
  const grab = (name) => {
    const m = src.match(new RegExp("^const " + name + " = (?:`[^`]*`|\\[[\\s\\S]*?\\n\\]);", "m"));
    if (!m) throw new Error("vr-scene.src.js no longer has " + name + ": update tools/quest-store-art.cjs");
    return m[0];
  };
  const entry = [fs.readFileSync(path.join(__dirname, "quest-store", "orb.js"), "utf8"), grab("NOISE"), grab("ORB_VERT"), grab("ORB_FRAG"), grab("THEMES")].join("\n");
  return require("esbuild").buildSync({ stdin: { contents: entry, resolveDir: root, loader: "js" }, bundle: true, format: "esm", write: false, logLevel: "warning" }).outputFiles[0].text;
}

// ---- PNG: Meta wants 24-bit (RGB) for everything but the logo and the spatial foreground
const CRC = new Int32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c; });
const crc32 = (b) => { let c = -1; for (const x of b) c = CRC[(c ^ x) & 255] ^ (c >>> 8); return (c ^ -1) >>> 0; };
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}
function pngInfo(b) {
  if (b.readUInt32BE(0) !== 0x89504e47) throw new Error("not a PNG");
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20), depth: b[24], type: b[25], interlace: b[28] };
}
/** RGBA → RGB, laid over black (the pictures are opaque anyway). */
function toRgb(b) {
  const info = pngInfo(b);
  if (info.type === 2) return b;
  if (info.type !== 6 || info.depth !== 8 || info.interlace) throw new Error("unexpected PNG kind " + JSON.stringify(info));
  const idat = [];
  for (let off = 8; off < b.length;) {
    const len = b.readUInt32BE(off), type = b.toString("ascii", off + 4, off + 8);
    if (type === "IDAT") idat.push(b.subarray(off + 8, off + 8 + len));
    off += 12 + len;
  }
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const { w, h } = info, bpp = 4, stride = w * bpp;
  const px = Buffer.alloc(h * stride);
  let prev = Buffer.alloc(stride);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)], line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1)), cur = px.subarray(y * stride, (y + 1) * stride);
    for (let i = 0; i < stride; i++) {
      const a = i >= bpp ? cur[i - bpp] : 0, up = prev[i], c = i >= bpp ? prev[i - bpp] : 0;
      let v = line[i];
      if (f === 1) v += a;
      else if (f === 2) v += up;
      else if (f === 3) v += (a + up) >> 1;
      else if (f === 4) { const p = a + up - c, pa = Math.abs(p - a), pb = Math.abs(p - up), pc = Math.abs(p - c); v += pa <= pb && pa <= pc ? a : pb <= pc ? up : c; }
      else if (f !== 0) throw new Error("bad PNG filter " + f);
      cur[i] = v & 255;
    }
    prev = cur;
  }
  const rs = w * 3, rgb = Buffer.alloc(h * (rs + 1));
  for (let y = 0; y < h; y++) {
    const o = y * (rs + 1);
    rgb[o] = 1; // "sub": each byte minus the one to its left (smaller files)
    let pr = 0, pg = 0, pb = 0;
    for (let x = 0; x < w; x++) {
      const s = y * stride + x * 4, al = px[s + 3];
      const r = (px[s] * al + 127) / 255 | 0, g = (px[s + 1] * al + 127) / 255 | 0, bl = (px[s + 2] * al + 127) / 255 | 0;
      rgb[o + 1 + x * 3] = (r - pr) & 255; rgb[o + 2 + x * 3] = (g - pg) & 255; rgb[o + 3 + x * 3] = (bl - pb) & 255;
      pr = r; pg = g; pb = bl;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 2;
  return Buffer.concat([b.subarray(0, 8), chunk("IHDR", ihdr), chunk("IDAT", zlib.deflateSync(rgb, { level: 9 })), chunk("IEND", Buffer.alloc(0))]);
}
function save(name, png, { w, h, alpha }) {
  const data = alpha ? png : toRgb(png);
  const info = pngInfo(data);
  if (info.w !== w || info.h !== h) throw new Error(`${name} is ${info.w}x${info.h}, Meta wants ${w}x${h}`);
  if (!alpha && info.type !== 2) throw new Error(name + " must be a 24-bit PNG");
  fs.writeFileSync(path.join(out, name), data);
  console.log(`  ${name}  ${w}x${h} ${alpha ? "32-bit (transparent)" : "24-bit"}  ${(data.length / 1024).toFixed(0)} KB`);
}

// ---- a local server: the site, the art page, and a pretend PC ---------------
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript", ".css": "text/css", ".json": "application/json", ".webmanifest": "application/manifest+json", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".gif": "image/gif", ".ico": "image/x-icon", ".woff2": "font/woff2", ".mp4": "video/mp4", ".webm": "video/webm", ".mp3": "audio/mpeg", ".wav": "audio/wav", ".txt": "text/plain" };
const pcScreen = { image: null };
function server(bundle) {
  return http.createServer((req, res) => {
    const url = new URL(req.url, "http://localhost");
    const p = decodeURIComponent(url.pathname);
    const send = (code, type, body) => { res.writeHead(code, { "Content-Type": type, "Cache-Control": "no-store" }); res.end(body); };
    if (p === "/store/orb.js") return send(200, "text/javascript", bundle);
    if (p === "/store/art.html") return send(200, "text/html", fs.readFileSync(path.join(__dirname, "quest-store", "art.html")));
    // The PC's picture as a look shows it (the room's look panel takes an address).
    if (p === "/pc-shot.jpg" && pcScreen.image) return send(200, "image/jpeg", pcScreen.image);
    if (p.startsWith("/pc/")) {
      // The same endpoints a paired PC answers (docs/app/vr.js `pc`), for the PC scenes.
      if (req.headers.authorization !== "Bearer " + PASS) return send(401, "text/plain", "pair");
      if (p === "/pc/remote/screen" && pcScreen.image) return send(200, "image/jpeg", pcScreen.image);
      if (p === "/pc/remote/status") return send(200, "application/json", JSON.stringify({ ok: true, doing: "", busy: false }));
      if (p === "/pc/remote/files/roots") return send(200, "application/json", JSON.stringify({ roots: [] }));
      if (p === "/pc/remote" && req.method === "POST") { req.resume(); return send(200, "application/json", '{"ok":true}'); }
      return send(404, "text/plain", "not found");
    }
    let file = path.resolve(docs, "." + p);
    if (file !== docs && !file.startsWith(docs + path.sep)) return send(403, "text/plain", "no");
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, "index.html");
    if (!fs.existsSync(file)) return send(404, "text/plain", "not found");
    send(200, TYPES[path.extname(file).toLowerCase()] || "application/octet-stream", fs.readFileSync(file));
  });
}

// ---- the browser (Chrome DevTools Protocol, as tools/browser-check.cjs) -----
async function openBrowser() {
  if (!fs.existsSync(edge)) throw new Error("Set IZUKI_TEST_BROWSER to an installed Chromium browser.");
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), "izuki-store-art-"));
  const browser = spawn(edge, ["--headless=new", "--hide-scrollbars", "--mute-audio", "--ignore-gpu-blocklist", "--enable-unsafe-swiftshader", "--disable-background-networking", "--no-first-run", "--no-default-browser-check", "--window-size=2560,1440", "--remote-debugging-port=0", "--user-data-dir=" + profile, "about:blank"], { windowsHide: true, stdio: "ignore" });
  let ws;
  // Whatever happens, the browser and its throwaway profile go.
  const close = async () => { try { ws?.close(); } catch {} await closeTestBrowser(browser, profile); try { fs.rmSync(profile, { recursive: true, force: true }); } catch {} };
  try {
    const portFile = path.join(profile, "DevToolsActivePort");
    for (let i = 0; i < 240 && !fs.existsSync(portFile); i++) await pause(250);
    if (!fs.existsSync(portFile)) throw new Error("the browser did not start within 60 s");
    const port = fs.readFileSync(portFile, "utf8").split("\n")[0].trim();
    const target = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: "PUT" })).json();
    ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((r, reject) => { ws.onopen = r; ws.onerror = reject; });
  } catch (e) {
    await close();
    throw e;
  }
  let seq = 0;
  const pending = new Map(), errors = [];
  /** The documents the main frame has committed (by loader id): a navigation is only done once its own one is here. */
  const navigated = new Set();
  ws.onmessage = (e) => {
    const m = JSON.parse(String(e.data));
    if (m.method === "Runtime.exceptionThrown") errors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
    if (m.method === "Page.frameNavigated" && !m.params.frame.parentId) navigated.add(m.params.frame.loaderId);
    if (pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
  };
  const call = (method, params = {}, ms = 60000) => new Promise((resolve, reject) => {
    const id = ++seq, t = setTimeout(() => { pending.delete(id); reject(Error(method + " timed out")); }, ms);
    pending.set(id, (m) => { clearTimeout(t); m.error ? reject(Error(method + ": " + m.error.message)) : resolve(m.result); });
    ws.send(JSON.stringify({ id, method, params }));
  });
  const evaluate = async (expression, ms) => {
    const r = await call("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true }, ms);
    if (r.exceptionDetails) throw Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
    return r.result.value;
  };
  try { await call("Runtime.enable"); await call("Page.enable"); } catch (e) { await close(); throw e; }
  return { call, evaluate, errors, navigated, close };
}

async function main() {
  fs.mkdirSync(out, { recursive: true });
  const srv = server(orbBundle());
  await new Promise((r) => srv.listen(0, "127.0.0.1", r));
  const origin = `http://127.0.0.1:${srv.address().port}`;
  let b;
  try { b = await openBrowser(); } catch (e) { srv.close(); throw e; }
  const size = (w, h) => b.call("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 1, mobile: false });
  const go = async (route, ready, tries = 100) => {
    const nav = await b.call("Page.navigate", { url: origin + route });
    if (nav.errorText) throw Error(nav.errorText);
    // The answer to navigate can come before the new page replaces the old one:
    // wait for this navigation's own document, so "ready" is asked of the new page.
    if (nav.loaderId) {
      for (let i = 0; i < 300 && !b.navigated.has(nav.loaderId); i++) await pause(50);
      if (!b.navigated.has(nav.loaderId)) throw Error("the page never arrived: " + route);
    }
    for (let i = 0; i < tries; i++) { if (await b.evaluate(ready).catch(() => false)) return; await pause(200); }
    throw Error("not ready: " + route + " " + b.errors.slice(-3).join(" | "));
  };
  const shoot = async (format = "png") => Buffer.from((await b.call("Page.captureScreenshot", { format, quality: format === "jpeg" ? 90 : undefined, captureBeyondViewport: false })).data, "base64");
  try {
    if (only === "all" || only === "art") {
      console.log("Branded art (title IZUKI NOVA):");
      await size(1200, 800);
      await go("/store/art.html", "!!window.__artReady");
      const ART = [
        ["hero", "hero-3000x900.png", 3000, 900],
        ["landscape", "cover-landscape-2560x1440.png", 2560, 1440],
        ["landscape", "trailer-cover-2560x1440.png", 2560, 1440],
        ["square", "cover-square-1440x1440.png", 1440, 1440],
        ["portrait", "cover-portrait-1008x1440.png", 1008, 1440],
        ["mini", "mini-landscape-1080x360.png", 1080, 360],
        ["icon", "icon-512x512.png", 512, 512],
        ["tile-bg", "spatial-tile-background-512x512.png", 512, 512],
        ["tile-fg", "spatial-tile-foreground-512x512.png", 512, 512, true],
        ["spatial-bg", "spatial-icon-background-180x180.png", 180, 180],
        ["spatial-fg", "spatial-icon-foreground-180x180.png", 180, 180, true],
        ["logo", "logo-transparent-3600x720.png", 3600, 720, true],
      ];
      for (const [layout, name, w, h, alpha] of ART) {
        const url = await b.evaluate(`window.__art.paint(${JSON.stringify(layout)})`, 120000);
        save(name, Buffer.from(url.split(",")[1], "base64"), { w, h, alpha: !!alpha });
      }
    }
    if (only === "all" || only === "shots") await shots(b, size, go, shoot, origin);
    if (b.errors.length) console.log("Page errors seen:\n  " + b.errors.join("\n  "));
  } finally {
    await b.close();
    srv.close();
  }
  console.log("Done: " + path.relative(root, out));
}

// ---- five screenshots of the real room --------------------------------------
async function shots(b, size, go, shoot, origin) {
  // What the pretend PC shows: the site's own pages, at a laptop's size.
  await size(1920, 1080);
  await go("/help/", "document.readyState === 'complete'");
  await pause(1500);
  const helpPage = await shoot("jpeg");
  await go("/", "document.readyState === 'complete'");
  await pause(2500);
  const homePage = await shoot("jpeg");
  // Where things are on the home page, for the pen circles (0-1000 across and down).
  const spots = await b.evaluate(`(() => {
    const at = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); if (!r.width || r.bottom < 0 || r.top > innerHeight) return null; return { x: Math.round((r.left + r.width / 2) / innerWidth * 1000), y: Math.round((r.top + r.height / 2) / innerHeight * 1000) }; };
    const h1 = document.querySelector("h1");
    const cta = [...document.querySelectorAll("a, button")].find((e) => /download/i.test(e.textContent) && e.getBoundingClientRect().top < innerHeight && e.getBoundingClientRect().width > 0);
    return { title: at(h1), cta: at(cta), ctaText: cta ? cta.textContent.trim().replace(/\\s+/g, " ").slice(0, 40) : "" };
  })()`);

  console.log("Screenshots (the real room, 3D preview):");
  // zoom: the room is drawn bigger and the middle 2560x1440 kept (a closer view,
  // same sharpness); yaw/pitch: a look around (a drag, as a person would);
  // settle: time for the room to move (the orb drifts after you when you turn away).
  const SHOTS = [
    { name: "screenshot-1-what-can-you-do.png", theme: "Nova", zoom: 1.45, pitch: 40, async act() {
      const r = await b.evaluate(`IzukiVr.gate("What can you do?")`);
      await b.evaluate(`(() => { IzukiVr.scene.line("me", ${JSON.stringify(r.said)}); IzukiVr.said(${JSON.stringify(r.say)}); })()`);
    } },
    { name: "screenshot-2-ask-anything.png", theme: "Aurora", zoom: 1.35, yaw: -70, pitch: 40, async act() {
      await b.evaluate(`(() => {
        IzukiVr.scene.line("me", "Hey Nova, what should I cook with salmon tonight?");
        IzukiVr.said("Roast it with lemon, dill and a little butter, with asparagus on the same tray. Twelve minutes at 200 degrees and dinner's done.");
      })()`);
    } },
    { name: "screenshot-3-your-pc-big.png", theme: "Midnight", zoom: 1, yaw: -110, pitch: 10, screen: "help", async act() {
      const r = await b.evaluate(`IzukiVr.gate("show my PC")`, 30000);
      await b.evaluate(`(() => { IzukiVr.scene.line("me", "Show my PC"); IzukiVr.said(${JSON.stringify(r.say)}); })()`);
      await pause(3500);
    } },
    { name: "screenshot-4-whats-on-my-screen.png", theme: "Nova", zoom: 1, yaw: 80, pitch: 10, screen: "home", async act() {
      await b.evaluate(`IzukiVr.gate("show my PC")`, 30000);
      await pause(2500);
      const marks = [spots.title && { ...spots.title, label: "What it is" }, spots.cta && { ...spots.cta, label: "Get it free" }].filter(Boolean);
      const say = "That's the IZUKI NOVA website. The big line says what it is, an AI that lives on your screen" + (spots.cta ? ", and the " + (spots.ctaText || "Download") + " button gets you the free app." : ".");
      await b.evaluate(`(async () => {
        IzukiVr.scene.line("me", "What's on my screen?");
        await IzukiVr.scene.showLook({ url: ${JSON.stringify(origin + "/pc-shot.jpg")}, w: 1920, h: 1080, marks: ${JSON.stringify(marks)}, say: ${JSON.stringify(say)}, picked: true });
      })()`);
      await pause(2500);
    } },
    { name: "screenshot-5-notes-in-your-room.png", theme: "Dawn", zoom: 1, yaw: 175, pitch: 25, async act(drag) {
      // Notes are pinned round to your right; pinned while looking a little left,
      // they land beside the orb rather than behind you.
      await drag(-75, 0);
      await b.evaluate(`(() => {
        IzukiVr.scene.pin("Soft-boiled eggs: 6½ minutes from the boil, then cold water.");
        IzukiVr.scene.pin("Train to the city: 8:12, platform 3.");
        IzukiVr.scene.pin("Basil likes the sunny window. Water it every two days.");
        IzukiVr.scene.line("me", "Pin that");
        IzukiVr.said("Pinned. Drag it anywhere you like.");
      })()`);
    } },
  ];
  for (const s of SHOTS) {
    pcScreen.image = s.screen === "help" ? helpPage : homePage;
    const W = Math.round(2560 * (s.zoom || 1)), H = Math.round(1440 * (s.zoom || 1));
    await size(W, H);
    // A clean profile each time: set up (a placeholder key, no AI is asked), paired with the pretend PC.
    await go("/app/", "document.readyState === 'complete'");
    await b.evaluate(`(() => {
      localStorage.clear();
      localStorage.setItem("izuki.key", JSON.stringify("store-art-placeholder"));
      localStorage.setItem("izuki.remotePcs", JSON.stringify([{ link: location.origin + "/pc/", pass: ${JSON.stringify(PASS)}, name: "Studio PC" }]));
      localStorage.setItem("izuki.vr.tried", "1");
      localStorage.setItem("izuki.vr.theme", ${JSON.stringify(s.theme)});
      return true;
    })()`);
    await go("/app/?vr", "[...document.querySelectorAll('button')].some((x) => /3D preview/i.test(x.textContent))");
    await b.evaluate("[...document.querySelectorAll('button')].find((x) => /3D preview/i.test(x.textContent)).click()");
    let open = false;
    for (let i = 0; i < 150 && !open; i++) { open = await b.evaluate("!!(window.IzukiVr && IzukiVr.scene)"); if (!open) await pause(200); }
    if (!open) throw Error("the room didn't open: " + b.errors.slice(-3).join(" | "));
    await pause(2600); // past the entrance
    // Hide the preview's own toolbar (a normal-screen helper the headset never shows).
    await b.evaluate("document.querySelectorAll('body > div[role=status]').forEach((e) => (e.style.display = 'none'))");
    // Look around: a drag that starts in empty sky (one starting on a panel would carry it).
    const drag = async (dx, dy) => {
      const x0 = Math.round(W / 2), y0 = 30;
      await b.call("Input.dispatchMouseEvent", { type: "mouseMoved", x: x0, y: y0 });
      await b.call("Input.dispatchMouseEvent", { type: "mousePressed", x: x0, y: y0, button: "left", clickCount: 1 });
      for (let i = 1; i <= 10; i++) await b.call("Input.dispatchMouseEvent", { type: "mouseMoved", x: x0 + (dx * i) / 10, y: y0 + (dy * i) / 10, button: "left" });
      await b.call("Input.dispatchMouseEvent", { type: "mouseReleased", x: x0 + dx, y: y0 + dy, button: "left", clickCount: 1 });
    };
    await s.act(drag);
    if (s.yaw || s.pitch) await drag(s.yaw || 0, s.pitch || 0);
    // The pointer off into the sky, so no aim dot sits on the scene.
    await b.call("Input.dispatchMouseEvent", { type: "mouseMoved", x: 2, y: 2 });
    await pause(s.settle || 1500);
    const clip = { x: (W - 2560) / 2, y: (H - 1440) / 2, width: 2560, height: 1440, scale: 1 };
    const png = Buffer.from((await b.call("Page.captureScreenshot", { format: "png", clip, captureBeyondViewport: false })).data, "base64");
    save(s.name, png, { w: 2560, h: 1440 });
  }
}

main().catch((e) => { console.error(e.stack || e.message); process.exit(1); });
