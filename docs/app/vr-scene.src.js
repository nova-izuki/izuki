// Izuki in VR: the 3D room (three.js). vr.js loads it only when you go in;
// built into vr-scene.js by tools/build-vr.cjs.
//
//   start({ mode, session, api, tint }) → the room's controls (orb, heard,
//   said, line, level, showLook, pin, comeHere, pcOpen, pcClose, pcShown, stop)
//
// What's in it:
//   - The orb: liquid glass in the IZUKI NOVA colours (or the person's own
//     orb colour), breathing at rest, rippling with their voice while it
//     listens, swirling while it thinks, pulsing while Izuki talks.
//   - Under it, the words (what you said, what Izuki says) and a row of big
//     buttons: Talk, End call, Look, My PC, Pin, Leave.
//   - Pointing: a ray from each controller or hand. Trigger or pinch taps;
//     hold and move to carry the orb, a note or the PC screen; the thumbstick
//     scrolls the PC; A/X talks, B/Y brings the orb back.
//   - The photo Izuki looked at, with what it means circled, pen-style.
//   - Your PC's screen, 1.6 m wide, refreshed a few times a second: point
//     and click on it, and watch Izuki work there (with Stop).
//   - Pinned answers: cards you can carry anywhere; tap one to hear it.
// On a normal screen ("flat") the same room is a 3D preview you drive with
// the mouse: click to tap, drag to look around, the wheel scrolls the PC.
import {
  AdditiveBlending, BackSide, BoxGeometry, CatmullRomCurve3, ConeGeometry, CurvePath, LineCurve3, TubeGeometry, DirectionalLight, DodecahedronGeometry, HemisphereLight, MeshLambertMaterial, NormalBlending, OctahedronGeometry, BufferGeometry, CanvasTexture, CircleGeometry, Color, CylinderGeometry, DoubleSide,
  Float32BufferAttribute, Group, IcosahedronGeometry, Line, LineBasicMaterial, LineSegments, Mesh, MeshBasicMaterial,
  PerspectiveCamera, PlaneGeometry, Points, PointsMaterial, Quaternion, Raycaster, RingGeometry, Scene, ShaderMaterial,
  SphereGeometry, Sprite, SpriteMaterial, SRGBColorSpace, TorusGeometry, Vector2, Vector3, WebGLRenderer, WireframeGeometry,
} from "three";

// The room's type: IZUKI NOVA's own faces (the site's self-hosted Sora for
// labels, Manrope for words), loaded before the first card is drawn.
const DISPLAY = `"Sora", "Manrope", system-ui, sans-serif`;
const FONT = `"Manrope", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`;
// Calm precision: graphite panels, two steps of white, one accent (the orb's
// teal) for what's live or on, amber only for a warning.
const INK = "#F4F6FA", INK2 = "#A7B0C0", TEAL = "#5EEAD4", WARN = "#FBBF24";
const LABEL = { listening: "Listening", thinking: "Thinking" };
/** The sharpest texture filtering this headset offers (set once the renderer exists). */
let ANISO = 1;

async function loadFonts() {
  if (typeof FontFace === "undefined" || !document.fonts) return;
  const faces = [
    new FontFace("Sora", "url(../fonts/sora.woff2)", { weight: "300 800" }),
    new FontFace("Manrope", "url(../fonts/manrope.woff2)", { weight: "400 700" }),
  ];
  const load = Promise.all(faces.map(async (f) => { await f.load(); document.fonts.add(f); }));
  // Never hold the room up for long: the system face stands in if the fonts are slow.
  await Promise.race([load, new Promise((r) => setTimeout(r, 2500))]).catch(() => {});
}

const NOISE = `
float hash3(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float noise3(vec3 x) {
  vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash3(i), hash3(i + vec3(1.0, 0.0, 0.0)), f.x), mix(hash3(i + vec3(0.0, 1.0, 0.0)), hash3(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),
             mix(mix(hash3(i + vec3(0.0, 0.0, 1.0)), hash3(i + vec3(1.0, 0.0, 1.0)), f.x), mix(hash3(i + vec3(0.0, 1.0, 1.0)), hash3(i + vec3(1.0, 1.0, 1.0)), f.x), f.y), f.z);
}`;

const ORB_VERT = `
uniform float uTime; uniform float uEnergy;
varying vec3 vN; varying vec3 vV; varying vec3 vP;
${NOISE}
void main() {
  vec3 p = position;
  float d = noise3(p * 22.0 + vec3(0.0, uTime * 0.9, uTime * 0.6));
  p += normal * (d - 0.5) * (0.004 + uEnergy * 0.016);
  vP = p * 11.0;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vN = normalize(normalMatrix * normal);
  vV = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}`;

const ORB_FRAG = `
uniform float uTime; uniform float uEnergy; uniform float uThink;
uniform vec3 uA; uniform vec3 uB; uniform vec3 uC; uniform vec3 uGlow;
varying vec3 vN; varying vec3 vV; varying vec3 vP;
${NOISE}
void main() {
  vec3 n = normalize(vN); vec3 v = normalize(vV);
  float facing = max(dot(n, v), 0.0);
  float fres = pow(1.0 - facing, 2.4);
  float t = uTime * (0.22 + uThink * 0.9 + uEnergy * 0.4);
  vec3 q = vP * 0.9 + vec3(0.0, t, -t * 0.6);
  float w = noise3(q * 1.6 + vec3(t));
  float f1 = noise3(q + w * 1.8);
  float f2 = noise3(q * 1.4 - vec3(t * 0.7, -t * 0.4, 0.0) + w);
  vec3 col = mix(uA, uB, smoothstep(0.3, 0.7, f1));
  col = mix(col, uC, smoothstep(0.45, 0.85, f2) * 0.8);
  float core = pow(facing, 3.5);
  col *= 0.55 + 0.6 * core;
  col += uGlow * core * (0.16 + uEnergy * 0.8);
  col += fres * vec3(0.78, 0.92, 1.0) * (0.85 + uEnergy * 0.8);
  vec3 l = normalize(vec3(-0.4, 0.7, 0.6));
  col += pow(max(dot(reflect(-l, n), v), 0.0), 40.0) * 0.55;
  gl_FragColor = vec4(col, 0.9 + fres * 0.1);
}`;

// ---------------------------------------------------------------------------
// Cards: a canvas drawn in 2D, shown on a flat panel in the room.
function card(wM, hM, px = 2400) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(8, Math.round(wM * px));
  canvas.height = Math.max(8, Math.round(hM * px));
  const ctx = canvas.getContext("2d");
  const tex = new CanvasTexture(canvas);
  tex.colorSpace = SRGBColorSpace;
  // Text stays sharp when a panel is seen at an angle.
  tex.anisotropy = ANISO;
  const mat = new MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false });
  const mesh = new Mesh(new PlaneGeometry(wM, hM), mat);
  return { canvas, ctx, tex, mesh, w: canvas.width, h: canvas.height, update() { tex.needsUpdate = true; } };
}

function rr(ctx, x, y, w, h, r) {
  r = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/**
 * The panel every card shares: dark graphite, nearly opaque (it has to read
 * over a real room), a hairline edge, and its top edge catching the light.
 * hot: the accent edge (pointed at, or on).
 */
function glass(ctx, w, h, r, opts = {}) {
  ctx.clearRect(0, 0, w, h);
  const line = 3, pad = line;
  rr(ctx, pad, pad, w - pad * 2, h - pad * 2, r);
  const fill = ctx.createLinearGradient(0, 0, 0, h);
  fill.addColorStop(0, opts.fill0 || "rgba(24, 27, 36, 0.94)");
  fill.addColorStop(1, opts.fill1 || "rgba(13, 15, 21, 0.95)");
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.lineWidth = opts.hot ? line * 1.6 : line;
  ctx.strokeStyle = opts.hot ? "rgba(94, 234, 212, 0.9)" : "rgba(255, 255, 255, 0.13)";
  ctx.stroke();
  if (!opts.hot) {
    const lit = ctx.createLinearGradient(pad + r, 0, w - pad - r, 0);
    lit.addColorStop(0, "rgba(255,255,255,0)");
    lit.addColorStop(0.5, "rgba(255,255,255,0.34)");
    lit.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = lit;
    ctx.fillRect(pad + r, pad - line / 2, w - 2 * (pad + r), line);
  }
}

function write(ctx, s, x, y, size, color, weight = 500, align = "left", family = FONT, tracking = "0px") {
  ctx.font = `${weight} ${size}px ${family}`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = "alphabetic";
  if ("letterSpacing" in ctx) ctx.letterSpacing = tracking;
  ctx.fillText(s, x, y);
  if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";
}

function ellipsize(ctx, s, width) {
  s = String(s || "");
  if (ctx.measureText(s).width <= width) return s;
  while (s && ctx.measureText(s + "…").width > width) s = s.slice(0, -1);
  return s + "…";
}

function glowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const x = c.getContext("2d");
  const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, "rgba(255,255,255,0.9)");
  g.addColorStop(0.35, "rgba(255,255,255,0.32)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  x.fillStyle = g;
  x.fillRect(0, 0, 128, 128);
  const t = new CanvasTexture(c);
  t.colorSpace = SRGBColorSpace;
  return t;
}

// Icons: one family, outlines in a single stroke (set by the caller), drawn
// into a 100×100 box. No text glyphs stand in for icons.
const ICONS = {
  mic(x) { x.beginPath(); rr(x, 39, 16, 22, 42, 11); x.stroke(); x.beginPath(); x.arc(50, 48, 22, 0.12 * Math.PI, 0.88 * Math.PI); x.stroke(); x.beginPath(); x.moveTo(50, 70); x.lineTo(50, 84); x.stroke(); },
  done(x) { x.beginPath(); x.moveTo(27, 52); x.lineTo(43, 68); x.lineTo(74, 35); x.stroke(); },
  quiet(x) { x.beginPath(); rr(x, 32, 32, 36, 36, 7); x.stroke(); },
  end(x) { x.beginPath(); x.moveTo(20, 60); x.quadraticCurveTo(50, 32, 80, 60); x.lineTo(72, 69); x.lineTo(61, 61); x.lineTo(61, 53); x.quadraticCurveTo(50, 48, 39, 53); x.lineTo(39, 61); x.lineTo(28, 69); x.closePath(); x.stroke(); },
  eye(x) { x.beginPath(); x.moveTo(14, 50); x.quadraticCurveTo(50, 16, 86, 50); x.quadraticCurveTo(50, 84, 14, 50); x.stroke(); x.beginPath(); x.arc(50, 50, 11, 0, Math.PI * 2); x.stroke(); },
  pc(x) { x.beginPath(); rr(x, 16, 22, 68, 44, 6); x.stroke(); x.beginPath(); x.moveTo(36, 82); x.lineTo(64, 82); x.moveTo(50, 66); x.lineTo(50, 82); x.stroke(); },
  pin(x) { x.beginPath(); x.moveTo(50, 86); x.lineTo(50, 62); x.stroke(); x.beginPath(); x.moveTo(31, 62); x.lineTo(69, 62); x.lineTo(62, 46); x.lineTo(62, 20); x.lineTo(38, 20); x.lineTo(38, 46); x.closePath(); x.stroke(); },
  leave(x) { x.beginPath(); x.moveTo(32, 32); x.lineTo(68, 68); x.moveTo(68, 32); x.lineTo(32, 68); x.stroke(); },
  think(x) { for (let i = 0; i < 3; i++) { x.beginPath(); x.arc(30 + i * 20, 50, 4.5, 0, Math.PI * 2); x.stroke(); } },
  photos(x) { x.beginPath(); rr(x, 16, 24, 68, 52, 8); x.stroke(); x.beginPath(); x.moveTo(23, 69); x.lineTo(42, 49); x.lineTo(56, 62); x.lineTo(65, 54); x.lineTo(78, 69); x.stroke(); x.beginPath(); x.arc(64, 38, 5, 0, Math.PI * 2); x.stroke(); },
  style(x) {
    // Two four-point stars, outlined.
    const star = (cx, cy, r) => { x.beginPath(); x.moveTo(cx, cy - r); x.quadraticCurveTo(cx, cy, cx + r, cy); x.quadraticCurveTo(cx, cy, cx, cy + r); x.quadraticCurveTo(cx, cy, cx - r, cy); x.quadraticCurveTo(cx, cy, cx, cy - r); x.stroke(); };
    star(44, 56, 26); star(74, 28, 12);
  },
  folder(x) { x.beginPath(); x.moveTo(14, 30); x.lineTo(40, 30); x.lineTo(48, 38); x.lineTo(86, 38); x.lineTo(86, 78); x.lineTo(14, 78); x.closePath(); x.stroke(); },
  doc(x) { x.beginPath(); x.moveTo(28, 14); x.lineTo(60, 14); x.lineTo(76, 30); x.lineTo(76, 86); x.lineTo(28, 86); x.closePath(); x.stroke(); x.beginPath(); x.moveTo(38, 50); x.lineTo(66, 50); x.moveTo(38, 62); x.lineTo(66, 62); x.moveTo(38, 74); x.lineTo(56, 74); x.stroke(); },
  close(x) { x.beginPath(); x.moveTo(34, 34); x.lineTo(66, 66); x.moveTo(66, 34); x.lineTo(34, 66); x.stroke(); },
  back(x) { x.beginPath(); x.moveTo(58, 30); x.lineTo(38, 50); x.lineTo(58, 70); x.stroke(); },
  next(x) { x.beginPath(); x.moveTo(42, 30); x.lineTo(62, 50); x.lineTo(42, 70); x.stroke(); },
  up(x) { x.beginPath(); x.moveTo(30, 56); x.lineTo(50, 36); x.lineTo(70, 56); x.moveTo(50, 36); x.lineTo(50, 74); x.stroke(); },
  search(x) { x.beginPath(); x.arc(44, 44, 20, 0, Math.PI * 2); x.stroke(); x.beginPath(); x.moveTo(59, 59); x.lineTo(76, 76); x.stroke(); },
  pause(x) { x.beginPath(); x.moveTo(40, 32); x.lineTo(40, 68); x.moveTo(60, 32); x.lineTo(60, 68); x.stroke(); },
  // A small cube in three lines: something built in 3D.
  holo(x) {
    x.beginPath(); x.moveTo(50, 22); x.lineTo(76, 36); x.lineTo(76, 64); x.lineTo(50, 78); x.lineTo(24, 64); x.lineTo(24, 36); x.closePath(); x.stroke();
    x.beginPath(); x.moveTo(24, 36); x.lineTo(50, 50); x.lineTo(76, 36); x.moveTo(50, 50); x.lineTo(50, 78); x.stroke();
  },
};
/** A small round control on its own card: graphite, a hairline ring, one icon. */
function roundButton(c, name) {
  const { ctx, w, h } = c;
  ctx.clearRect(0, 0, w, h);
  ctx.beginPath(); ctx.arc(w / 2, h / 2, w / 2 - 4, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(20, 23, 31, 0.95)"; ctx.fill();
  ctx.lineWidth = 3; ctx.strokeStyle = "rgba(255,255,255,0.18)"; ctx.stroke();
  icon(ctx, name, w / 2, h / 2, w * 0.62, INK, 7);
  c.update();
}
/** An icon at (cx, cy), `size` pixels across, in one stroke. */
function icon(ctx, name, cx, cy, size, color = INK, weight = 6) {
  ctx.save();
  const s = size / 100;
  ctx.translate(cx - 50 * s, cy - 50 * s);
  ctx.scale(s, s);
  ctx.strokeStyle = color; ctx.fillStyle = color;
  ctx.lineWidth = weight; ctx.lineCap = "round"; ctx.lineJoin = "round";
  ICONS[name]?.(ctx);
  ctx.restore();
}

// ---------------------------------------------------------------------------
export async function start({ mode, session, api, tint }) {
  const flat = mode === "flat";
  const passthrough = mode === "immersive-ar";
  const util = api.util;
  // The brand faces first, so no card is drawn in a stand-in font.
  await loadFonts();

  const renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.setPixelRatio(flat ? Math.min(2, window.devicePixelRatio || 1) : 1);
  ANISO = Math.max(1, renderer.capabilities.getMaxAnisotropy?.() || 1);
  renderer.setSize(window.innerWidth, window.innerHeight);
  const canvas = renderer.domElement;
  Object.assign(canvas.style, { position: "fixed", inset: "0", width: "100vw", height: "100vh", zIndex: "2147483000", touchAction: "none", display: flat ? "block" : "none" });
  document.body.appendChild(canvas);

  const scene = new Scene();
  const camera = new PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 100);
  camera.position.set(0, 1.6, 0);
  scene.add(camera);

  const disposables = [];
  const track = (o) => { disposables.push(o); return o; };
  /** What fades in after the orb blooms (the words, the buttons, the suggestions). */
  const fadeIn = [];
  // The one authored moment: the orb blooms into being with a single ring of
  // light, then its words and buttons fade in. Reduced motion: no bloom.
  let born = 0;
  const calm = (() => { try { return matchMedia("(prefers-reduced-motion: reduce)").matches; } catch { return false; } })();
  const easeOut = (x) => 1 - Math.pow(1 - Math.min(1, Math.max(0, x)), 4);
  let faded = false;

  // ---- the palette: the room's look (THEMES); the first, IZUKI NOVA's own,
  // leans to the person's orb colour when they picked one ----------------------
  const base = { a: new Color(), b: new Color(), c: new Color() };
  let themeAt = 0, haloIdle = 0x7dd3fc;
  /** A light sky behind the buttons (Pearl, without passthrough): their labels go dark. */
  let lightRoom = false;
  try { themeAt = Math.max(0, THEMES.findIndex((t) => t.name === localStorage.getItem("izuki.vr.theme"))); } catch {}
  function applyTheme(i) {
    const t = THEMES[i];
    base.a.setRGB(...t.orb[0]); base.b.setRGB(...t.orb[1]); base.c.setRGB(...t.orb[2]);
    if (i === 0 && tint) {
      const h = parseInt(tint.slice(1), 16);
      const c = new Color(((h >> 16) & 255) / 255, ((h >> 8) & 255) / 255, (h & 255) / 255);
      base.a.lerp(c, 0.6); base.b.lerp(c, 0.35); base.c.lerp(c, 0.45);
    }
    haloIdle = t.halo;
    space?.set(t);
    const light = !!t.light && !!space;
    if (light !== lightRoom) { lightRoom = light; for (const b of buttons) b.draw(); }
  }
  function nextTheme() {
    themeAt = (themeAt + 1) % THEMES.length;
    applyTheme(themeAt);
    try { localStorage.setItem("izuki.vr.theme", THEMES[themeAt].name); } catch {}
    return "This is " + THEMES[themeAt].name + (passthrough ? "." : ", with its own sky.") + " Say “change your look” again for the next one.";
  }

  // ---- the orb, its words and its buttons: one group that stays with you ----
  const rig = new Group();
  rig.visible = false;
  scene.add(rig);

  const orbMat = track(new ShaderMaterial({
    uniforms: {
      uTime: { value: 0 }, uEnergy: { value: 0 }, uThink: { value: 0 },
      uA: { value: base.a }, uB: { value: base.b }, uC: { value: base.c }, uGlow: { value: new Color(0.82, 0.95, 1.0) },
    },
    vertexShader: ORB_VERT, fragmentShader: ORB_FRAG, transparent: true,
  }));
  const orb = new Mesh(track(new SphereGeometry(0.085, 64, 48)), orbMat);
  orb.renderOrder = 2;
  const haloMat = track(new SpriteMaterial({ map: track(glowTexture()), color: 0x5eead4, transparent: true, blending: AdditiveBlending, depthWrite: false, opacity: 0.3 }));
  const halo = new Sprite(haloMat);
  halo.scale.setScalar(0.42);
  halo.renderOrder = 1;
  const ringMat = track(new MeshBasicMaterial({ color: 0x5eead4, transparent: true, opacity: 0, blending: AdditiveBlending, depthWrite: false }));
  const ring = new Mesh(track(new TorusGeometry(0.118, 0.003, 8, 120, Math.PI * 1.4)), ringMat);
  // The entrance's own ring: whole and hairline thin, it opens once and is gone.
  const bloomMat = track(new MeshBasicMaterial({ color: 0x5eead4, transparent: true, opacity: 0, blending: AdditiveBlending, depthWrite: false }));
  const bloom = new Mesh(track(new TorusGeometry(0.1, 0.0016, 8, 160)), bloomMat);
  bloom.visible = false;
  rig.add(halo, orb, ring, bloom);

  const caption = card(0.56, 0.19);
  caption.mesh.position.set(0, -0.2, 0.01);
  rig.add(caption.mesh);
  track(caption.tex); track(caption.mesh.material); track(caption.mesh.geometry);
  fadeIn.push(caption.mesh.material);

  const view = {
    state: "", you: "", reply: "", stage: "", mic: 0, energy: 0, think: 0, hovered: false,
    hint: flat ? "Click the orb to talk. Drag to look around." : "Point at the orb and pull the trigger (or pinch) to talk.",
  };

  function drawCaption() {
    const { ctx, w, h } = caption;
    glass(ctx, w, h, 52);
    const padX = 56;
    let y = 30;
    // What's happening right now (listening, thinking, or the step it's on),
    // with a live dot. Nothing when there's nothing to say about it.
    const state = LABEL[view.state] || view.stage || "";
    if (state) {
      ctx.beginPath(); ctx.arc(padX + 9, y + 34, 9, 0, Math.PI * 2); ctx.fillStyle = TEAL; ctx.fill();
      ctx.font = `600 30px ${DISPLAY}`;
      write(ctx, ellipsize(ctx, state, w - padX * 2 - 40), padX + 34, y + 45, 30, TEAL, 600, "left", DISPLAY, "0.02em");
      y += 62;
    } else y += 14;
    if (view.you) {
      ctx.font = `500 34px ${FONT}`;
      write(ctx, ellipsize(ctx, view.you, w - padX * 2), padX, (y += 40), 34, INK2, 500);
      y += 10;
    }
    const body = view.reply || (!view.you ? view.hint : "");
    const measure = (s, size) => { ctx.font = `500 ${size}px ${FONT}`; return ctx.measureText(s).width; };
    // A note (why the voice is quiet: amber; a new look: quiet grey) sits at the bottom.
    const note = view.notice ? util.fitLines(view.notice, w - padX * 2, 2, 30, 26, measure) : null;
    const noteH = note ? note.lines.length * note.size * 1.3 + 22 : 0;
    if (body) {
      const room = h - y - 36 - noteH;
      const maxLines = Math.max(1, Math.floor(room / (32 * 1.32)));
      const fit = util.fitLines(body, w - padX * 2, Math.min(maxLines, 5), 50, 32, measure);
      const lh = fit.size * 1.32;
      y += 6;
      for (const line of fit.lines) write(ctx, line, padX, (y += lh), fit.size, view.reply ? INK : INK2, 500);
    }
    announce(view.notice || view.reply);
    if (note) {
      let ny = h - 32 - (note.lines.length - 1) * note.size * 1.3;
      for (const line of note.lines) { write(ctx, line, padX, ny, note.size, view.noticeWarn ? WARN : INK2, 500); ny += note.size * 1.3; }
    }
    caption.update();
  }
  /** The preview's screen-reader line (flat only), and whether it exists yet. */
  let spoken = null, spokenReady = false;
  const announce = (t) => { if (spokenReady && spoken && t && spoken.textContent !== t) spoken.textContent = t; };
  let noticeTimer = 0;
  /** A short note under the words for a while; `warn` for trouble (amber), else quiet grey. */
  function notice(text, ms = 12000, warn = false) {
    view.notice = String(text || "");
    view.noticeWarn = !!warn;
    clearTimeout(noticeTimer);
    noticeTimer = setTimeout(() => { view.notice = ""; drawCaption(); }, ms);
    drawCaption();
  }

  // Buttons along the bottom.
  const buttons = [];
  function button(iconName, label, onTap) {
    const c = card(0.088, 0.112, 2400);
    track(c.tex); track(c.mesh.material); track(c.mesh.geometry);
    fadeIn.push(c.mesh.material);
    // hot: pointed at; on: what it opens is open (Photos, My PC).
    const b = { c, icon: iconName, label, hot: false, on: false, shown: true };
    b.draw = () => {
      const { ctx, w, h } = c;
      ctx.clearRect(0, 0, w, h);
      const r = w * 0.38, cx = w / 2, cy = r + 10;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      const fill = ctx.createLinearGradient(0, cy - r, 0, cy + r);
      fill.addColorStop(0, b.hot ? "rgba(44, 50, 64, 0.97)" : "rgba(26, 29, 38, 0.95)");
      fill.addColorStop(1, b.hot ? "rgba(26, 30, 40, 0.97)" : "rgba(14, 16, 22, 0.95)");
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.lineWidth = b.hot || b.on ? 5 : 3;
      ctx.strokeStyle = b.on ? TEAL : b.hot ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.16)";
      ctx.stroke();
      icon(ctx, b.icon, cx, cy, r * 1.05, b.on ? TEAL : INK, 6.5);
      // The label sits on the room itself: ink that reads on this look's sky.
      const ink = lightRoom ? { on: "#0F766E", hot: "#11151C", rest: "#2A303B" } : { on: TEAL, hot: INK, rest: INK2 };
      write(ctx, b.label, cx, h - 12, 30, b.on ? ink.on : b.hot ? ink.hot : ink.rest, 600, "center", DISPLAY, "0.01em");
      c.update();
    };
    b.set = (name, label) => { if (name === b.icon && label === b.label) return; b.icon = name; b.label = label; b.draw(); };
    b.setOn = (on) => { if (!!on === b.on) return; b.on = !!on; b.draw(); };
    b.draw();
    // Pointed at: it brightens and comes 6 mm towards you (no jumpy scaling).
    ui(c.mesh, { tap: onTap, hover: (on) => { b.hot = on; b.draw(); c.mesh.position.z = on ? 0.026 : 0.02; } });
    rig.add(c.mesh);
    buttons.push(b);
    return b;
  }
  function layoutButtons() {
    const shown = buttons.filter((b) => b.shown);
    // Up to eight buttons in one row under the words.
    const gap = shown.length > 6 ? 0.088 : 0.1;
    shown.forEach((b, i) => { b.c.mesh.visible = true; b.c.mesh.position.set((i - (shown.length - 1) / 2) * gap, -0.375, 0.02); });
    for (const b of buttons) if (!b.shown) b.c.mesh.visible = false;
  }

  // ---- pointing -------------------------------------------------------------
  const targets = [];
  function ui(mesh, opts) { mesh.userData.ui = opts; targets.push(mesh); return mesh; }
  function unui(mesh) { const i = targets.indexOf(mesh); if (i >= 0) targets.splice(i, 1); }
  const shown = (o) => { for (let n = o; n; n = n.parent) if (!n.visible) return false; return true; };

  const rc = new Raycaster();
  rc.far = 10;
  const headPos = new Vector3(), headDir = new Vector3(), q = new Quaternion();
  let headYaw = 0;
  const pointers = [];
  const dotGeo = track(new CircleGeometry(0.006, 20));
  const lineGeo = track(new BufferGeometry().setAttribute("position", new Float32BufferAttribute([0, 0, 0, 0, 0, -1], 3)));
  function pointer(kind, ctrl) {
    const p = { kind, ctrl, source: null, hit: null, hover: null, press: null, origin: new Vector3(), dir: new Vector3(), buttons: [], scrollAt: 0 };
    p.dot = new Mesh(dotGeo, track(new MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9, depthTest: false })));
    p.dot.renderOrder = 999;
    p.dot.visible = false;
    scene.add(p.dot);
    if (ctrl) {
      p.line = new Line(lineGeo, track(new LineBasicMaterial({ color: 0x9ff3ea, transparent: true, opacity: 0.5 })));
      p.line.visible = false;
      ctrl.add(p.line);
    }
    pointers.push(p);
    return p;
  }
  const buzz = (p, v = 0.25, ms = 16) => { try { p.source?.gamepad?.hapticActuators?.[0]?.pulse?.(v, ms); } catch {} };

  function press(p, grabOnly = false) {
    if (!p.hit) return;
    const u = p.hit.object.userData.ui;
    const drag = u.drag ? u.drag() : null;
    p.press = { u, obj: p.hit.object, hit: p.hit, drag, grabOnly, dist: p.hit.distance, start: p.hit.point.clone(), offset: drag ? drag.position.clone().sub(p.hit.point) : null, moved: false, t0: performance.now() };
    buzz(p, 0.35, 20);
    if (!grabOnly) { try { u.down?.(p); } catch (e) { console.warn("vr down", e); } }
  }
  // ---- your hand on things --------------------------------------------------------
  // Reach out and pinch (or squeeze a controller's grip) right at the orb, a
  // card or a panel, and it comes with your hand; let go and it stays. From
  // further away the ray does the same.
  const grabAt = new Vector3(), grabTmp = new Vector3(), grabBox = new Vector3();
  function grabPoint(p, out) {
    const hand = p.source?.hand ? renderer.xr.getHand(p.index) : null;
    const tip = hand?.joints?.["index-finger-tip"], thumb = hand?.joints?.["thumb-tip"];
    if (tip && thumb) { tip.getWorldPosition(out); thumb.getWorldPosition(grabTmp); return out.add(grabTmp).multiplyScalar(0.5); }
    return p.ctrl.getWorldPosition(out);
  }
  function grabNear(p) {
    if (flat || !p.source) return false;
    grabPoint(p, grabAt);
    let best = null, bestD = Infinity;
    for (const m of targets) {
      const u = m.userData.ui;
      if (!(u.drag || u.grab) || !shown(m)) continue;
      const g = m.geometry;
      if (!g.boundingBox) g.computeBoundingBox();
      // The pinch, in the thing's own space: inside its box, or just off its face.
      m.updateWorldMatrix(true, false);
      grabBox.copy(grabAt);
      m.worldToLocal(grabBox);
      const b = g.boundingBox, sc = m.getWorldScale(grabTmp);
      const reach = (m === orb ? 0.07 : 0.03) / Math.max(1e-3, sc.x);
      const dx = Math.max(b.min.x - grabBox.x, 0, grabBox.x - b.max.x);
      const dy = Math.max(b.min.y - grabBox.y, 0, grabBox.y - b.max.y);
      const dz = Math.max(b.min.z - grabBox.z, 0, grabBox.z - b.max.z);
      if (dx > reach || dy > reach || dz > reach + 0.05 / Math.max(1e-3, sc.x)) continue;
      const d = Math.hypot(dx, dy, dz);
      if (d < bestD) { bestD = d; best = { m, u }; }
    }
    if (!best) return false;
    const obj = (best.u.drag || best.u.grab)();
    if (!obj) return false;
    p.press = { u: best.u, obj: best.m, hit: null, drag: obj, direct: true, grabOnly: false, offset: obj.position.clone().sub(grabAt), start: grabAt.clone(), moved: false, t0: performance.now() };
    buzz(p, 0.5, 28);
    return true;
  }
  /** completed: the press really finished (a headset can cancel one, e.g. when tracking drops). */
  function release(p, completed = true) {
    const pr = p.press;
    p.press = null;
    if (!pr) return;
    if (!pr.grabOnly) { try { pr.u.up?.(performance.now() - pr.t0, completed && !pr.moved); } catch (e) { console.warn("vr up", e); } }
    if (pr.moved) { pr.u.dropped?.(); return; }
    // A pinch right on something that didn't move it: a tap on the spot it touched.
    if (pr.direct) {
      if (!completed) return;
      let hit = null;
      const prm = pr.obj.geometry?.parameters;
      if (prm?.width && prm?.height) {
        grabPoint(p, grabAt);
        const local = pr.obj.worldToLocal(grabAt.clone());
        hit = { uv: { x: Math.max(0, Math.min(1, local.x / prm.width + 0.5)), y: Math.max(0, Math.min(1, local.y / prm.height + 0.5)) }, point: grabAt.clone() };
      }
      try { pr.u.tap?.(hit, p); } catch (e) { console.warn("vr tap", e); }
      return;
    }
    if (pr.grabOnly || !completed) return;
    // A tap counts only where it started: slide off a button to cancel it.
    if (!p.hit || p.hit.object !== pr.obj) return;
    try { pr.u.tap?.(p.hit, p); } catch (e) { console.warn("vr tap", e); }
  }

  function faceHead(obj) { obj.lookAt(headPos.x, obj.position.y, headPos.z); }

  // Controllers and hands (both come through as target-ray spaces).
  const cleanups = [];
  const on = (t, ev, fn, opts) => { t.addEventListener(ev, fn, opts); cleanups.push(() => t.removeEventListener(ev, fn, opts)); };
  let handDots = null;
  if (!flat) {
    for (let i = 0; i < 2; i++) {
      const ctrl = renderer.xr.getController(i);
      scene.add(ctrl);
      const p = pointer("xr", ctrl);
      p.index = i;
      on(ctrl, "connected", (e) => { p.source = e.data; p.line.visible = true; });
      on(ctrl, "disconnected", () => { p.source = null; p.line.visible = false; p.dot.visible = false; p.press = null; });
      // Aim again at each event: the hit from the last frame may be stale.
      on(ctrl, "selectstart", () => { p.selected = false; if (grabNear(p)) return; aim(p); press(p); });
      on(ctrl, "select", () => { p.selected = true; });
      on(ctrl, "selectend", () => { aim(p); release(p, p.selected); p.selected = false; });
      on(ctrl, "squeezestart", () => { if (grabNear(p)) return; aim(p); press(p, true); });
      on(ctrl, "squeezeend", () => release(p, false));
    }
    // Hands are always in the scene (where they pinch places a grab); in a
    // virtual space, where they'd be invisible, their joints show as dots.
    for (let i = 0; i < 2; i++) scene.add(renderer.xr.getHand(i));
    if (!passthrough) {
      const jointGeo = track(new SphereGeometry(0.006, 8, 6));
      const jointMat = track(new MeshBasicMaterial({ color: 0xcdeffd, transparent: true, opacity: 0.85 }));
      handDots = { jointGeo, jointMat };
    }
  }

  // Into the session only now, with nothing awaited before it: the controllers
  // above already listen, so one that connects the moment the session starts
  // is never missed.
  let floorY = 0;
  if (!flat) {
    try {
      renderer.xr.enabled = true;
      const feats = session.enabledFeatures;
      const ref = !feats || feats.includes("local-floor") ? "local-floor" : "local";
      if (ref === "local") floorY = -1.6;
      renderer.xr.setReferenceSpaceType(ref);
      // Crisp: a quarter more pixels than the headset's default (the room is
      // light to draw), and only light foveation, so text at the sides stays sharp.
      try { renderer.xr.setFramebufferScaleFactor(1.25); } catch {}
      await renderer.xr.setSession(session);
      try { renderer.xr.setFoveation(0.2); } catch {}
      // three.js learns about controllers and hands only from the session's
      // "inputsourceschange" event. One announced while this room was still
      // downloading (before three listened) would never get a pointer: hand
      // those over now. A repeat is harmless (connecting is idempotent).
      const missed = [...(session.inputSources || [])].filter((s) => !pointers.some((p) => p.source === s));
      if (missed.length) {
        const ev = new Event("inputsourceschange");
        Object.assign(ev, { session, added: missed, removed: [] });
        session.dispatchEvent(ev);
      }
    } catch (e) {
      // Couldn't go in: leave nothing behind (vr.js says why).
      for (const off of cleanups) { try { off(); } catch {} }
      canvas.remove();
      renderer.dispose();
      try { await session.end(); } catch {}
      throw e;
    }
  }
  const space = passthrough ? null : addSpace(scene, floorY);
  applyTheme(themeAt);

  // The mouse (and touch) on a normal screen.
  const mouse = new Vector2(), mouseP = flat ? pointer("mouse", null) : null;
  // The preview starts looking a little down, so the buttons under the orb are in view.
  let looking = null, pitch = -0.2, yaw = 0;
  if (flat) {
    mouseP.source = {};
    const toNdc = (e) => { mouse.set((e.clientX / window.innerWidth) * 2 - 1, -(e.clientY / window.innerHeight) * 2 + 1); };
    on(canvas, "pointermove", (e) => {
      toNdc(e);
      if (looking) {
        yaw -= (e.clientX - looking.x) * 0.004; pitch -= (e.clientY - looking.y) * 0.004;
        pitch = Math.max(-1.2, Math.min(1.2, pitch));
        looking = { x: e.clientX, y: e.clientY };
      }
    });
    on(canvas, "pointerdown", (e) => {
      toNdc(e);
      aim(mouseP);
      if (mouseP.hit) press(mouseP);
      else looking = { x: e.clientX, y: e.clientY };
      canvas.setPointerCapture?.(e.pointerId);
    });
    on(canvas, "pointerup", (e) => { toNdc(e); looking = null; aim(mouseP); release(mouseP); });
    // Cancelled (the browser took the gesture): nothing is tapped or dropped.
    on(canvas, "pointercancel", () => { looking = null; mouseP.press = null; });
    on(canvas, "wheel", (e) => { const u = mouseP.hit?.object.userData.ui; if (u?.scroll) { e.preventDefault(); u.scroll(Math.sign(e.deltaY) * Math.min(5, Math.ceil(Math.abs(e.deltaY) / 60))); } }, { passive: false });
    on(window, "keydown", (e) => {
      if (e.key === "Escape") stop();
      else if (e.key === " " && e.target === document.body) { e.preventDefault(); api.tapOrb(); }
    });
    on(window, "resize", () => { camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight); });
  }

  function aim(p) {
    if (p.kind === "mouse") {
      rc.setFromCamera(mouse, camera);
      p.origin.copy(rc.ray.origin); p.dir.copy(rc.ray.direction);
    } else {
      if (!p.source) return false;
      p.ctrl.getWorldPosition(p.origin);
      p.ctrl.getWorldQuaternion(q);
      p.dir.set(0, 0, -1).applyQuaternion(q);
    }
    rc.set(p.origin, p.dir);
    const hits = rc.intersectObjects(targets, false);
    p.hit = hits.find((h) => shown(h.object)) || null;
    return true;
  }

  /** Hold-to-talk, shared by the Talk button and A/X. who: what's held. */
  function holdDown(who) {
    who.holdAt = performance.now();
    who.holdListening = view.state === "listening";
    // Not listening yet: start now, so you can talk while you hold.
    if (!who.holdListening) api.tapOrb();
  }
  function holdUp(who, ms) {
    const was = who.holdListening;
    who.holdListening = false;
    // A tap while it listened finishes; a hold of more than a moment sends
    // what you said when you let go. A short tap that started it keeps listening.
    if (was || ms > 600) api.tapOrb();
  }

  // ---- the orb's own controls ---------------------------------------------------
  ui(orb, {
    tap: () => api.tapOrb(),
    drag: () => rig,
    dropped: () => { rig.userData.placed = true; },
    hover: (onIt) => { view.hovered = onIt; },
  });
  ui(caption.mesh, { drag: () => rig, dropped: () => { rig.userData.placed = true; } });

  const talkB = button("mic", "Talk", null);
  // Talk: a tap starts listening (or finishes, or cuts Izuki off); held, it's
  // hold-to-talk, like a walkie-talkie: it listens while held, sends on letting go.
  Object.assign(talkB.c.mesh.userData.ui, { tap: null, down: () => holdDown(talkB), up: (ms, ok) => { if (ok) holdUp(talkB, ms); } });
  // Pause: the microphone off (no "Hey Nova") until you tap Talk again.
  const endB = button("pause", "Pause", () => api.hangUp());
  const lookB = button("eye", "Look", () => { showLookWaiting(); api.look(); });
  const togglePc = () => { if (pcUi.open) pcClose(); else void pcOpen().then((why) => { if (why) api.speak(why); }); };
  const pinLast = () => { const t = api.lastReply(); if (t) pin(t); else api.speak("There's nothing to pin yet. Ask me something first."); };
  const togglePhotos = () => {
    if (filesUi.open) return filesClose();
    if (!api.pc.current()) return notice("Your photos are on your PC: pair this headset with it once (leave the room, Remote, Pair).", 12000, true);
    void filesOpen("Pictures").then((why) => { if (why) notice(why, 12000, true); });
  };
  const restyle = () => notice(nextTheme(), 5000);
  const photosB = button("photos", "Photos", togglePhotos);
  const pcB = button("pc", "My PC", togglePc);
  button("pin", "Pin", pinLast);
  button("style", "Style", restyle);
  button("leave", "Leave", () => stop());
  endB.shown = false;
  lookB.shown = false;
  layoutButtons();

  // ---- "try saying": three suggestions above the orb on a first visit ----------
  // Tap one and Izuki does it; they leave after the first conversation.
  const chips = [];
  function chip(iconName, words, phrase) {
    const c = card(0.205, 0.054, 2400);
    track(c.tex); track(c.mesh.material); track(c.mesh.geometry);
    if (!faded) fadeIn.push(c.mesh.material);
    const k = { c, hot: false };
    k.draw = () => {
      const { ctx, w, h } = c;
      glass(ctx, w, h, (h - 6) / 2, { hot: k.hot });
      icon(ctx, iconName, 58, h / 2, 50, TEAL, 7);
      ctx.font = `500 37px ${FONT}`;
      write(ctx, ellipsize(ctx, words, w - 124), 98, h / 2 + 13, 37, INK, 500);
      c.update();
    };
    k.draw();
    ui(c.mesh, { tap: () => { hideChips(); api.ask(phrase); }, hover: (on) => { k.hot = on; k.draw(); } });
    rig.add(c.mesh);
    chips.push(k);
    return k;
  }
  let firstVisit = false;
  try { firstVisit = localStorage.getItem("izuki.vr.tried") !== "1"; } catch {}
  function hideChips() {
    firstVisit = false;
    for (const k of chips) k.c.mesh.visible = false;
    try { localStorage.setItem("izuki.vr.tried", "1"); } catch {}
  }
  function layoutChips() {
    chips.forEach((k, i) => { k.c.mesh.position.set((i - (chips.length - 1) / 2) * 0.218, 0.17, 0.01); }); syncButtons();
  }
  void api.hasCamera().then((yes) => {
    lookB.shown = !!yes;
    layoutButtons();
    chip(yes ? "eye" : "mic", yes ? "“What's this?”" : "“What can you do?”", yes ? "What's this?" : "What can you do?");
    chip("photos", "“Show my photos”", "Show my photos");
    chip("style", "“Change your look”", "Change your look");
    layoutChips();
  });

  // ---- what Izuki looked at -----------------------------------------------------
  const lookUi = { group: new Group(), photo: null, text: card(0.5, 0.15), img: null, url: "", want: "", closed: "", seq: 0, marks: [], say: "", t0: 0, anim: false, close: card(0.05, 0.05) };
  // In the room, not on the orb: it opens in view, a little to your right, so
  // it doesn't cover the thing you're asking about. Carry it anywhere.
  lookUi.group.visible = false;
  scene.add(lookUi.group);
  ui(lookUi.text.mesh, { drag: () => lookUi.group });
  track(lookUi.text.tex); track(lookUi.close.tex);
  lookUi.group.add(lookUi.text.mesh, lookUi.close.mesh);
  roundButton(lookUi.close, "close");
  // Closed means closed: a photo still decoding, or this look's answer
  // arriving later, doesn't bring it back. A new look opens it again.
  ui(lookUi.close.mesh, { tap: () => { lookUi.seq++; lookUi.closed = lookUi.want; lookUi.group.visible = false; } });

  function drawLookText() {
    const { ctx, w, h } = lookUi.text;
    glass(ctx, w, h, 44);
    const measure = (s, size) => { ctx.font = `500 ${size}px ${FONT}`; return ctx.measureText(s).width; };
    const fit = util.fitLines(lookUi.say, w - 96, 4, 38, 26, measure);
    let y = 22;
    for (const line of fit.lines) write(ctx, line, 48, (y += fit.size * 1.32), fit.size, INK, 500);
    lookUi.text.update();
    announce(lookUi.say);
  }
  function drawLookPhoto(progress) {
    const ph = lookUi.photo;
    if (!ph || !lookUi.img) return;
    const { ctx, w, h } = ph;
    ctx.clearRect(0, 0, w, h);
    ctx.save();
    rr(ctx, 0, 0, w, h, 28);
    ctx.clip();
    ctx.drawImage(lookUi.img, 0, 0, w, h);
    ctx.restore();
    const n = lookUi.marks.length;
    // Steps point at buttons that sit close together on a screen: smaller rings,
    // labels beside them instead of below.
    const r = w * (lookUi.steps ? 0.03 : 0.065);
    const at = (m) => ({ x: (m.x / 1000) * w, y: (m.y / 1000) * h });
    lookUi.marks.forEach((m, i) => {
      const p = Math.max(0, Math.min(1, progress * n - i));
      if (p <= 0) return;
      const { x, y } = at(m);
      // "Show me where": a path from the last step to this one, then its number.
      if (lookUi.steps && i > 0) drawStepPath(ctx, at(lookUi.marks[i - 1]), { x, y }, r, Math.min(1, p * 2));
      // The pen: a teal circle drawn round it, lifted off any photo by a soft dark shadow.
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,0.55)"; ctx.shadowBlur = 10; ctx.shadowOffsetY = 3;
      ctx.strokeStyle = TEAL; ctx.lineWidth = 6; ctx.lineCap = "round";
      ctx.beginPath(); ctx.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * p); ctx.stroke();
      ctx.restore();
      if (lookUi.steps && n > 1 && p > 0.3) {
        const bx = Math.min(w - 26, Math.max(26, x - r * 0.75)), by = Math.min(h - 26, Math.max(26, y - r * 0.75));
        ctx.save();
        ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = 8;
        ctx.fillStyle = TEAL; ctx.beginPath(); ctx.arc(bx, by, 22, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
        ctx.font = `700 26px ${FONT}`;
        const num = String(i + 1);
        write(ctx, num, bx - ctx.measureText(num).width / 2, by + 9, 26, "#0b1016", 700);
      }
      if (p > 0.85 && m.label) {
        ctx.font = `600 28px ${FONT}`;
        const tw = ctx.measureText(m.label).width;
        let lx = Math.min(w - tw - 40, Math.max(10, x - tw / 2 - 16)), ly = y + r + 12 > h - 50 ? y - r - 56 : y + r + 12;
        if (lookUi.steps) {
          lx = x + r + 16 + tw + 32 <= w - 10 ? x + r + 16 : Math.max(10, x - r - 16 - tw - 32);
          ly = Math.min(h - 54, Math.max(10, y - 22));
        }
        rr(ctx, lx, ly, tw + 32, 44, 22); ctx.fillStyle = "rgba(14,16,22,0.88)"; ctx.fill();
        write(ctx, m.label, lx + 16, ly + 31, 28, INK, 600);
      }
    });
    ph.update();
  }
  /** A dashed teal line from one step's ring to the next, with an arrowhead once it arrives. */
  function drawStepPath(ctx, a, b, r, t) {
    const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy);
    if (len <= 2 * r + 12) return;
    const ux = dx / len, uy = dy / len;
    const sx = a.x + ux * (r + 6), sy = a.y + uy * (r + 6);
    const run = (len - 2 * r - 12) * t;
    const ex = sx + ux * run, ey = sy + uy * run;
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = 8;
    ctx.strokeStyle = TEAL; ctx.lineWidth = 5; ctx.lineCap = "round";
    ctx.setLineDash([16, 12]);
    ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(ex, ey); ctx.stroke();
    ctx.setLineDash([]);
    if (t >= 1) {
      const s = 18, px = -uy, py = ux;
      ctx.fillStyle = TEAL;
      ctx.beginPath();
      ctx.moveTo(ex + ux * 4, ey + uy * 4);
      ctx.lineTo(ex - ux * s + px * s * 0.6, ey - uy * s + py * s * 0.6);
      ctx.lineTo(ex - ux * s - px * s * 0.6, ey - uy * s - py * s * 0.6);
      ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }
  function showLookWaiting() {
    if (!lookUi.group.visible) return;
    lookUi.say = "Looking…"; drawLookText();
  }
  async function showLook({ url, w, h, marks, say, picked, steps }) {
    // A late answer for a photo you closed stays closed; one you pick again opens.
    if (picked) lookUi.closed = "";
    else if (url === lookUi.closed) return;
    const my = ++lookUi.seq;
    lookUi.want = url;
    if (url !== lookUi.url) {
      const img = new Image();
      img.src = url;
      try { await img.decode(); } catch { return; }
      if (my !== lookUi.seq) return;
      lookUi.img = img; lookUi.url = url;
      // At most 0.5 m wide and 0.42 m tall, keeping the photo's shape.
      const aspect = h / Math.max(1, w);
      const phH = Math.min(0.42, 0.5 * aspect), pw = phH / aspect;
      if (lookUi.photo) { unui(lookUi.photo.mesh); lookUi.group.remove(lookUi.photo.mesh); lookUi.photo.tex.dispose(); lookUi.photo.mesh.geometry.dispose(); lookUi.photo.mesh.material.dispose(); }
      lookUi.photo = card(pw, phH, 2048);
      lookUi.group.add(lookUi.photo.mesh);
      ui(lookUi.photo.mesh, { drag: () => lookUi.group });
      lookUi.photo.mesh.position.set(0, 0.1, 0);
      lookUi.text.mesh.position.set(0, 0.1 - phH / 2 - 0.09, 0);
      lookUi.close.mesh.position.set(pw / 2 - 0.01, 0.1 + phH / 2 - 0.01, 0.005);
    }
    lookUi.marks = Array.isArray(marks) ? marks : [];
    lookUi.steps = !!steps;
    lookUi.say = String(say || "");
    lookUi.t0 = performance.now();
    lookUi.anim = lookUi.marks.length > 0;
    if (!lookUi.group.visible) {
      const a = headYaw - 0.6, d = 0.85;
      lookUi.group.position.set(headPos.x - Math.sin(a) * d, headPos.y - 0.08, headPos.z - Math.cos(a) * d);
      faceHead(lookUi.group);
    }
    lookUi.group.visible = true;
    drawLookPhoto(lookUi.anim ? 0 : 1);
    drawLookText();
  }

  // ---- your PC, big -------------------------------------------------------------
  const pcUi = { group: new Group(), open: false, live: false, gen: 0, target: null, err: "", clicks: Promise.resolve(), doing: "", busy: false, screen: null, bar: card(1.6, 0.09), handle: card(0.32, 0.035), aspect: 9 / 16 };
  pcUi.group.visible = false;
  scene.add(pcUi.group);
  track(pcUi.bar.tex); track(pcUi.handle.tex);
  function makeScreen(w, h) {
    if (pcUi.screen) { unui(pcUi.screen.mesh); pcUi.group.remove(pcUi.screen.mesh); pcUi.screen.tex.dispose(); pcUi.screen.mesh.geometry.dispose(); pcUi.screen.mesh.material.dispose(); }
    // 1.6 m wide, or narrower for a tall (portrait) screen: never over 1.1 m high.
    const aspect = h / w, wM = Math.min(1.6, 1.1 / aspect);
    const s = card(wM, wM * aspect, w / wM);
    s.mesh.material.transparent = false;
    s.mesh.material.depthWrite = true;
    pcUi.screen = s;
    pcUi.aspect = aspect;
    pcUi.group.add(s.mesh);
    const half = (wM * aspect) / 2;
    pcUi.bar.mesh.position.set(0, -half - 0.06, 0);
    pcUi.handle.mesh.position.set(0, half + 0.04, 0);
    ui(s.mesh, {
      // Only on a real picture of the PC: never click blind through
      // "Connecting…" or an error message.
      tap: (hit) => {
        if (!hit?.uv || !pcUi.live) return;
        const { nx, ny } = util.pcPoint(hit.uv.x, hit.uv.y);
        const my = pcUi.gen;
        clickRing(hit.point);
        // One point-and-click at a time: a quick second tap never moves the
        // pointer between the first tap's point and its click.
        // Still the same open panel, still showing a real picture (not an error).
        const still = () => pcUi.open && my === pcUi.gen && pcUi.live;
        pcUi.clicks = pcUi.clicks.then(async () => {
          if (!still()) return;
          const r = await api.pc.send({ op: "point", nx, ny }, pcUi.target);
          if (r?.ok === false) { if (my === pcUi.gen) { pcUi.err = r.error || ""; drawBar(); } return; }
          // Closed, reopened or lost the picture while the pointer moved: no click.
          if (!still()) return;
          await api.pc.send({ op: "click", button: "left" }, pcUi.target);
        }).catch(() => {});
      },
      scroll: (n) => { if (pcUi.live) void api.pc.send({ op: "scroll", dy: n }, pcUi.target); },
    });
    return s;
  }
  makeScreen(1280, 720);
  pcUi.group.add(pcUi.bar.mesh, pcUi.handle.mesh);
  {
    const { ctx, w, h } = pcUi.handle;
    ctx.clearRect(0, 0, w, h);
    rr(ctx, 4, 4, w - 8, h - 8, (h - 8) / 2);
    ctx.fillStyle = "rgba(255,255,255,0.34)"; ctx.fill();
    pcUi.handle.update();
  }
  ui(pcUi.handle.mesh, { drag: () => pcUi.group });

  function drawScreenMessage(text) {
    pcUi.live = false;
    const s = pcUi.screen, { ctx, w, h } = s;
    glass(ctx, w, h, 24);
    ctx.font = `500 ${Math.round(h * 0.05)}px ${FONT}`;
    const lines = util.wrapLines(text, w * 0.7, (t) => ctx.measureText(t).width);
    lines.forEach((l, i) => write(ctx, l, w / 2, h / 2 + (i - (lines.length - 1) / 2) * h * 0.075, Math.round(h * 0.05), INK2, 500, "center"));
    s.update();
  }
  function drawScreen(bmp) {
    if (Math.abs(bmp.height / bmp.width - pcUi.aspect) > 0.01 || pcUi.screen.w !== bmp.width) makeScreen(bmp.width, bmp.height);
    const s = pcUi.screen;
    s.ctx.drawImage(bmp, 0, 0, s.w, s.h);
    s.update();
    pcUi.live = true;
  }
  function drawBar() {
    const { ctx, w, h } = pcUi.bar;
    glass(ctx, w, h, 48);
    // Live (teal) or in trouble (amber), then what Izuki is doing there.
    ctx.beginPath(); ctx.arc(72, h / 2, 13, 0, Math.PI * 2); ctx.fillStyle = pcUi.err ? WARN : TEAL; ctx.fill();
    const line = pcUi.err || (pcUi.doing ? "Izuki: " + pcUi.doing : (pcUi.target?.name || api.pc.name()) + " · point and click, thumbstick to scroll");
    ctx.font = `500 60px ${FONT}`;
    write(ctx, ellipsize(ctx, line, w - 800), 116, h / 2 + 21, 60, pcUi.err ? WARN : INK, 500);
    const pill = (x, label, danger) => {
      rr(ctx, x, 30, 280, h - 60, (h - 60) / 2);
      ctx.fillStyle = danger ? "rgba(220, 38, 38, 0.82)" : "rgba(255, 255, 255, 0.07)"; ctx.fill();
      if (!danger) { ctx.lineWidth = 3; ctx.strokeStyle = "rgba(255,255,255,0.16)"; ctx.stroke(); }
      write(ctx, label, x + 140, h / 2 + 19, 52, INK, 600, "center", DISPLAY, "0.02em");
    };
    if (pcUi.busy) pill(w - 620, "Stop", true);
    pill(w - 310, "Close", false);
    pcUi.bar.update();
  }
  ui(pcUi.bar.mesh, {
    tap: (hit) => {
      const x = (hit?.uv?.x ?? 0) * pcUi.bar.w;
      if (x > pcUi.bar.w - 320) pcClose();
      else if (pcUi.busy && x > pcUi.bar.w - 630) {
        const my = pcUi.gen;
        // Stop stays offered until the PC confirms it stopped.
        void api.pc.send({ op: "stop" }, pcUi.target).then((r) => {
          if (!pcUi.open || my !== pcUi.gen) return;
          if (r?.ok === false) pcUi.err = r.error || "Your PC didn't confirm it stopped.";
          else { pcUi.busy = false; pcUi.err = ""; }
          drawBar();
        });
      }
    },
    drag: () => pcUi.group,
  });

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  async function pcLoop(my) {
    while (pcUi.open && my === pcUi.gen) {
      const t0 = performance.now();
      const r = await api.pc.shot(1280, pcUi.target);
      if (!pcUi.open || my !== pcUi.gen) break;
      if (r.blob) {
        // The panel may have closed (or reopened) while the picture decoded.
        const current = () => pcUi.open && my === pcUi.gen;
        let bmp = null;
        try {
          bmp = await createImageBitmap(r.blob);
          if (current()) { drawScreen(bmp); if (pcUi.err) { pcUi.err = ""; drawBar(); } }
        } catch {
          if (current()) { pcUi.err = "A picture from your PC didn't come through."; drawScreenMessage(pcUi.err); drawBar(); }
        } finally { bmp?.close?.(); }
      } else {
        pcUi.err = r.error || "Your PC didn't answer.";
        drawScreenMessage(pcUi.err);
        drawBar();
      }
      await sleep(r.blob ? Math.max(120, 320 - (performance.now() - t0)) : 3000);
    }
  }
  async function statusLoop(my) {
    while (pcUi.open && my === pcUi.gen) {
      const s = await api.pc.status(pcUi.target);
      if (!pcUi.open || my !== pcUi.gen) break;
      if (!s.error) { pcUi.doing = s.doing; pcUi.busy = s.busy; drawBar(); }
      await sleep(3000);
    }
  }
  async function pcOpen() {
    if (!api.pc.current()) return "This headset isn't paired with your PC yet. Leave VR, open Remote in Izuki and pair your PC once.";
    const d = 1.55;
    pcUi.group.position.set(headPos.x - Math.sin(headYaw) * d, headPos.y - 0.02, headPos.z - Math.cos(headYaw) * d);
    faceHead(pcUi.group);
    pcUi.group.visible = true;
    pcUi.open = true;
    pcUi.err = "";
    // This panel is this PC: its pictures, clicks, scrolls, Stop and spoken
    // tasks all go to the PC it opened on, even if another is chosen meanwhile.
    pcUi.target = api.pc.current();
    stepAside("pc");
    const my = ++pcUi.gen;
    drawScreenMessage("Connecting to " + (pcUi.target?.name || api.pc.name()) + "…");
    drawBar();
    void pcLoop(my);
    void statusLoop(my);
    return "";
  }
  function pcClose() {
    pcUi.open = false; pcUi.gen++; pcUi.group.visible = false;
    if (rig.userData.placed === "pc") { if (filesUi?.open) rig.userData.placed = "files"; else if (webUi?.open) rig.userData.placed = "web"; else if (holoUi?.open) rig.userData.placed = "holo"; else comeHere(); }
  }
  /** The orb steps aside to your left (for the PC's screen or the gallery), unless you placed it yourself. */
  function stepAside(why) {
    if (rig.userData.placed === true) return;
    if (!rig.userData.placed) {
      // 40° to your left and a little low: its words clear the PC panel's lower-left corner
      // (the panel spans 27° each side at 1.55 m), and the orb stays in reach.
      const a = headYaw + 0.7;
      goal = { x: headPos.x - Math.sin(a) * 0.7, y: headPos.y - 0.17, z: headPos.z - Math.cos(a) * 0.7 };
    }
    rig.userData.placed = why;
  }

  // A small ring where you clicked on the PC.
  const rings = [];
  const ringGeo = track(new RingGeometry(0.012, 0.018, 32));
  function clickRing(point) {
    const m = new Mesh(ringGeo, new MeshBasicMaterial({ color: 0x5eead4, transparent: true, opacity: 0.9, depthTest: false }));
    m.position.copy(point);
    m.lookAt(headPos);
    m.renderOrder = 998;
    scene.add(m);
    rings.push({ m, t0: performance.now() });
  }

  // ---- your PC's folders and photos -----------------------------------------------
  // The phone Remote's read-only folder access (Desktop, Documents, Downloads,
  // Pictures, Music, Videos), as a gallery: four by three tiles a page, photos
  // as thumbnails, folders to open, "Up" and page arrows. A photo opens big.
  const FILES_W = 1.0, FILES_H = 0.74, COLS = 4, ROWS = 3, PAGE = COLS * ROWS, HEAD = 0.12;
  const filesUi = { group: new Group(), card: card(FILES_W, FILES_H), handle: card(0.3, 0.035), open: false, gen: 0, path: "", up: "", items: [], page: 0, title: "", err: "", loading: false, thumbs: new Map(), pending: new Set(), btns: [] };
  filesUi.group.visible = false;
  scene.add(filesUi.group);
  filesUi.group.add(filesUi.card.mesh, filesUi.handle.mesh);
  filesUi.handle.mesh.position.set(0, FILES_H / 2 + 0.035, 0);
  track(filesUi.card.tex); track(filesUi.handle.tex);
  {
    const { ctx, w, h } = filesUi.handle;
    rr(ctx, 4, 4, w - 8, h - 8, (h - 8) / 2);
    ctx.fillStyle = "rgba(255,255,255,0.34)"; ctx.fill();
    filesUi.handle.update();
  }
  ui(filesUi.handle.mesh, { drag: () => filesUi.group });
  const pageItems = () => filesUi.items.slice(filesUi.page * PAGE, filesUi.page * PAGE + PAGE);
  const pageCount = () => Math.max(1, Math.ceil(filesUi.items.length / PAGE));
  const thumbKey = (it) => filesUi.path + "|" + it.name;
  function tileRect(i) {
    const { w, h } = filesUi.card;
    const top = h * HEAD, pad = w * 0.018;
    const cw = (w - pad * (COLS + 1)) / COLS, ch = (h - top - pad * (ROWS + 1)) / ROWS;
    return { x: pad + (i % COLS) * (cw + pad), y: top + pad + Math.floor(i / COLS) * (ch + pad), w: cw, h: ch };
  }
  function drawFiles() {
    const { ctx, w, h } = filesUi.card;
    glass(ctx, w, h, 56);
    const hh = h * HEAD;
    // The header: where you are, then round icon buttons right to left.
    filesUi.btns = [];
    const d = hh * 0.62, cy = hh * 0.56;
    let bx = w - 44;
    const control = (name, act) => {
      const cx = bx - d / 2;
      ctx.beginPath(); ctx.arc(cx, cy, d / 2, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.06)"; ctx.fill();
      ctx.lineWidth = 3; ctx.strokeStyle = "rgba(255,255,255,0.16)"; ctx.stroke();
      icon(ctx, name, cx, cy, d * 0.62, INK, 7);
      filesUi.btns.push({ x0: bx - d, x1: bx, act });
      bx -= d + 20;
    };
    control("close", () => filesClose());
    if (filesUi.page + 1 < pageCount()) control("next", () => { filesUi.page++; drawFiles(); loadThumbs(filesUi.gen); });
    if (filesUi.page > 0) control("back", () => { filesUi.page--; drawFiles(); loadThumbs(filesUi.gen); });
    if (filesUi.path) control("up", () => { void filesGo(filesUi.up, ""); });
    ctx.font = `600 50px ${DISPLAY}`;
    const title = ellipsize(ctx, filesUi.title || "Your folders", bx - 220);
    write(ctx, title, 56, cy + 18, 50, INK, 600, "left", DISPLAY, "-0.01em");
    if (pageCount() > 1) {
      ctx.font = `600 50px ${DISPLAY}`;
      const tw = ctx.measureText(title).width;
      write(ctx, `${filesUi.page + 1} / ${pageCount()}`, 56 + tw + 28, cy + 16, 34, INK2, 500);
    }
    if (filesUi.loading || filesUi.err || !filesUi.items.length) {
      const say = filesUi.loading ? "Opening…" : filesUi.err || "This folder is empty.";
      ctx.font = `500 46px ${FONT}`;
      const lines = util.wrapLines(say, w * 0.7, (t) => ctx.measureText(t).width);
      lines.forEach((l, i) => write(ctx, l, w / 2, h * 0.55 + (i - (lines.length - 1) / 2) * 64, 46, filesUi.err ? WARN : INK2, 500, "center"));
      filesUi.card.update();
      return;
    }
    pageItems().forEach((it, i) => {
      const r = tileRect(i);
      ctx.save();
      rr(ctx, r.x, r.y, r.w, r.h, 26); ctx.fillStyle = "rgba(255,255,255,0.045)"; ctx.fill(); ctx.clip();
      const bmp = filesUi.thumbs.get(thumbKey(it));
      if (bmp) {
        // Cover the tile, keeping the photo's shape.
        const s = Math.max(r.w / bmp.width, r.h / bmp.height);
        ctx.drawImage(bmp, r.x + (r.w - bmp.width * s) / 2, r.y + (r.h - bmp.height * s) / 2, bmp.width * s, bmp.height * s);
      } else {
        icon(ctx, it.dir ? "folder" : api.isPicture(it.name) ? "photos" : "doc", r.x + r.w / 2, r.y + r.h * 0.42, Math.min(r.w, r.h) * 0.4, it.dir ? INK : INK2, 4);
      }
      // Its name, over a soft fade at the bottom.
      const fade = ctx.createLinearGradient(0, r.y + r.h - 92, 0, r.y + r.h);
      fade.addColorStop(0, "rgba(10,12,18,0)"); fade.addColorStop(1, "rgba(10,12,18,0.86)");
      ctx.fillStyle = fade; ctx.fillRect(r.x, r.y + r.h - 92, r.w, 92);
      ctx.font = `500 30px ${FONT}`;
      write(ctx, ellipsize(ctx, it.name, r.w - 36), r.x + 18, r.y + r.h - 20, 30, INK, 500);
      ctx.restore();
    });
    filesUi.card.update();
  }
  /** Small pictures for the photos on this page, one at a time. */
  async function loadThumbs(my) {
    for (const it of pageItems()) {
      if (my !== filesUi.gen || !filesUi.open) return;
      const key = thumbKey(it);
      // Already here, or already on its way (paging back and forth): never fetched twice.
      if (it.dir || !api.isPicture(it.name) || filesUi.thumbs.has(key) || filesUi.pending.has(key)) continue;
      filesUi.pending.add(key);
      let bmp = null;
      try { bmp = await api.thumb(filesUi.path, it); } finally { if (my === filesUi.gen) filesUi.pending.delete(key); }
      if (my !== filesUi.gen || !filesUi.open) { bmp?.close?.(); return; }
      // Another load got there first: keep that one, free this one.
      if (filesUi.thumbs.has(key)) { bmp?.close?.(); continue; }
      filesUi.thumbs.set(key, bmp || null);
      if (bmp) drawFiles();
    }
  }
  function dropThumbs() {
    for (const b of filesUi.thumbs.values()) b?.close?.();
    filesUi.thumbs.clear();
    filesUi.pending.clear();
  }
  /** Open a folder (or, with no path, the list of your folders). "" when it opened, else why not. */
  async function filesGo(path, title) {
    const my = ++filesUi.gen;
    dropThumbs();
    Object.assign(filesUi, { loading: true, err: "", items: [], page: 0, title: title || filesUi.title });
    drawFiles();
    let r;
    if (path) r = await api.pc.list(path);
    else {
      const roots = await api.pc.roots();
      r = roots.error ? roots : { path: "", up: "", items: roots.roots.map((x) => ({ name: x.name, dir: true, at: x.path })) };
    }
    if (my !== filesUi.gen || !filesUi.open) return "";
    filesUi.loading = false;
    if (r.error) { filesUi.err = r.error; drawFiles(); return r.error; }
    Object.assign(filesUi, { path: r.path, up: r.up, items: r.items });
    if (!title) filesUi.title = r.path ? String(r.path).split(/[\\/]/).filter(Boolean).slice(-2).join(" › ") : "Your folders";
    drawFiles();
    void loadThumbs(my);
    return "";
  }
  ui(filesUi.card.mesh, {
    tap: (hit) => {
      if (!hit?.uv) return;
      const { w, h } = filesUi.card;
      const x = hit.uv.x * w, y = (1 - hit.uv.y) * h;
      if (y < h * HEAD) { filesUi.btns.find((b) => x >= b.x0 && x <= b.x1)?.act(); return; }
      // While a folder is on its way the tiles still show the last one: a tap
      // there would interrupt the folder you asked for (the header still works).
      if (filesUi.loading) return;
      const i = pageItems().findIndex((_, k) => { const r = tileRect(k); return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h; });
      const it = pageItems()[i];
      if (!it) return;
      if (it.dir) void filesGo(it.at || api.joinPath(filesUi.path, it.name), it.name);
      else void api.openPhoto(filesUi.path, it).then((why) => { if (why) notice(why, 12000, true); });
    },
    // The wheel or thumbstick turns the pages.
    scroll: (n) => {
      const next = Math.max(0, Math.min(pageCount() - 1, filesUi.page + Math.sign(n)));
      if (next !== filesUi.page) { filesUi.page = next; drawFiles(); void loadThumbs(filesUi.gen); }
    },
  });
  /** Show the gallery: a folder by name ("Pictures"), or the list of your folders. */
  async function filesOpen(folder) {
    if (!filesUi.open) {
      // In front of you (to the right when the PC's screen has the middle),
      // and the orb steps aside to your left meanwhile, as it does for the PC.
      const a = headYaw - (pcUi.open ? 0.85 : 0.05), d = 1.15;
      filesUi.group.position.set(headPos.x - Math.sin(a) * d, headPos.y - 0.04, headPos.z - Math.cos(a) * d);
      faceHead(filesUi.group);
      stepAside("files");
    }
    filesUi.open = true;
    filesUi.group.visible = true;
    if (!folder) return filesGo("", "Your folders");
    // Closed, or you opened something else, while the list was on its way: it's
    // dropped. This open counts as the newest (an older named open can't win).
    const my = ++filesUi.gen;
    Object.assign(filesUi, { loading: true, err: "" });
    drawFiles();
    const roots = await api.pc.roots();
    if (!filesUi.open || my !== filesUi.gen) return "";
    if (roots.error) { filesUi.loading = false; filesUi.err = roots.error; drawFiles(); return roots.error; }
    const r = roots.roots.find((x) => String(x.name).toLowerCase() === folder.toLowerCase());
    if (!r) { await filesGo("", "Your folders"); return "I couldn't find a " + folder + " folder on your PC, so here are all your folders."; }
    return filesGo(r.path, r.name);
  }
  function filesClose() {
    filesUi.open = false;
    filesUi.gen++;
    filesUi.group.visible = false;
    dropThumbs();
    if (rig.userData.placed === "files") { if (pcUi.open) rig.userData.placed = "pc"; else if (webUi.open) rig.userData.placed = "web"; else if (holoUi.open) rig.userData.placed = "holo"; else comeHere(); }
  }

  // ---- the room's browser -----------------------------------------------------------
  // A real Google search, no PC needed. Izuki types what you asked into the bar
  // (the orb beside it, like a hand on the keys); the results are the pages
  // Google's search really returned; a tap reads one to you here. A website
  // itself can't be drawn inside VR, so your AI reads the page and the panel
  // shows its words.
  const WEB_W = 1.0, WEB_TOP = 0.1, WEB_BODY = 0.62, WEB_ROWS = 5;
  const webUi = { group: new Group(), head: card(WEB_W, WEB_TOP), body: card(WEB_W, WEB_BODY), handle: card(0.3, 0.035), open: false, gen: 0, q: "", typed: "", mode: "", results: [], page: null, title: "", paras: [], first: 0, more: false, err: "", btns: [], rows: [] };
  webUi.group.visible = false;
  scene.add(webUi.group);
  webUi.group.add(webUi.head.mesh, webUi.body.mesh, webUi.handle.mesh);
  webUi.head.mesh.position.set(0, WEB_BODY / 2 + 0.008 + WEB_TOP / 2, 0);
  webUi.handle.mesh.position.set(0, WEB_BODY / 2 + 0.016 + WEB_TOP + 0.02, 0);
  track(webUi.head.tex); track(webUi.body.tex); track(webUi.handle.tex);
  {
    const { ctx, w, h } = webUi.handle;
    rr(ctx, 4, 4, w - 8, h - 8, (h - 8) / 2);
    ctx.fillStyle = "rgba(255,255,255,0.34)"; ctx.fill();
    webUi.handle.update();
  }
  ui(webUi.handle.mesh, { drag: () => webUi.group });
  const reading = () => webUi.mode === "reading" || webUi.mode === "page-loading" || webUi.mode === "page-error";
  /** The bar: what's searched (typed by Izuki), or the page being read; then Back and Close. */
  function drawWebHead() {
    const { ctx, w, h } = webUi.head;
    glass(ctx, w, h, 48);
    const cy = h / 2, d = h * 0.6;
    webUi.btns = [];
    let bx = w - 36;
    const control = (name, act) => {
      const cx = bx - d / 2;
      ctx.beginPath(); ctx.arc(cx, cy, d / 2, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.06)"; ctx.fill();
      ctx.lineWidth = 3; ctx.strokeStyle = "rgba(255,255,255,0.16)"; ctx.stroke();
      icon(ctx, name, cx, cy, d * 0.62, INK, 7);
      webUi.btns.push({ x0: bx - d, x1: bx, act });
      bx -= d + 18;
    };
    control("close", () => webClose());
    if (reading()) control("back", () => { webUi.gen++; webUi.mode = "results"; drawWeb(); });
    const x0 = 30, bw = bx - 12 - x0, bh = h * 0.66;
    rr(ctx, x0, cy - bh / 2, bw, bh, bh / 2);
    ctx.fillStyle = "rgba(255,255,255,0.06)"; ctx.fill();
    ctx.lineWidth = 3; ctx.strokeStyle = webUi.mode === "typing" || webUi.mode === "searching" ? "rgba(94,234,212,0.75)" : "rgba(255,255,255,0.16)"; ctx.stroke();
    icon(ctx, "search", x0 + bh * 0.58, cy, bh * 0.6, INK2, 7);
    const words = reading() ? (webUi.page?.site || "") : webUi.typed;
    ctx.font = `500 40px ${FONT}`;
    const fit = ellipsize(ctx, words || "Search Google", bw - bh * 1.4 - 24);
    const tx = x0 + bh * 1.1;
    write(ctx, fit, tx, cy + 14, 40, words ? INK : INK2, 500);
    if (webUi.mode === "typing") {
      ctx.font = `500 40px ${FONT}`;
      ctx.fillStyle = TEAL;
      ctx.fillRect(tx + (words ? ctx.measureText(fit).width : 0) + 6, cy - 22, 4, 44);
    }
    webUi.head.update();
  }
  function drawWebBody() {
    const { ctx, w, h } = webUi.body;
    glass(ctx, w, h, 48);
    webUi.rows = [];
    const pad = 56;
    const message = (t, color = INK2) => {
      ctx.font = `500 44px ${FONT}`;
      const lines = util.wrapLines(t, w * 0.76, (s) => ctx.measureText(s).width);
      lines.forEach((l, i) => write(ctx, l, w / 2, h * 0.5 + (i - (lines.length - 1) / 2) * 62, 44, color, 500, "center"));
    };
    const m = webUi.mode;
    if (m === "") message("Say “search the web for…” and anything you want to know. I'll look it up right here.");
    else if (m === "typing") message("");
    else if (m === "searching") message("Searching Google…");
    else if (m === "error" || m === "page-error") message(webUi.err, WARN);
    else if (m === "page-loading") message("Reading " + (webUi.page?.site || "the page") + "…");
    else if (m === "results") {
      if (!webUi.results.length) message("Google didn't return any pages for that. Try other words.");
      const rowH = (h - 40) / WEB_ROWS;
      webUi.results.slice(0, WEB_ROWS).forEach((r, i) => {
        const y0 = 20 + i * rowH;
        if (i) { ctx.fillStyle = "rgba(255,255,255,0.08)"; ctx.fillRect(pad, y0, w - pad * 2, 2); }
        ctx.font = `600 40px ${DISPLAY}`;
        write(ctx, ellipsize(ctx, r.site, w - pad * 2), pad, y0 + 66, 40, TEAL, 600, "left", DISPLAY);
        ctx.font = `500 34px ${FONT}`;
        const lines = util.wrapLines(r.snippet || "Tap to read this page.", w - pad * 2, (s) => ctx.measureText(s).width).slice(0, 2);
        if (lines.length === 2 && (r.snippet || "").length > 0) {
          const all = util.wrapLines(r.snippet, w - pad * 2, (s) => ctx.measureText(s).width);
          if (all.length > 2) lines[1] = ellipsize(ctx, lines[1] + " …", w - pad * 2);
        }
        lines.forEach((l, k) => write(ctx, l, pad, y0 + 122 + k * 46, 34, INK2, 500));
        webUi.rows.push({ y0, y1: y0 + rowH, r });
      });
    } else if (m === "reading") {
      ctx.font = `600 46px ${DISPLAY}`;
      const title = util.wrapLines(webUi.title, w - pad * 2, (s) => ctx.measureText(s).width).slice(0, 2);
      let y = 30;
      for (const l of title) write(ctx, l, pad, (y += 60), 46, INK, 600, "left", DISPLAY);
      y += 30;
      ctx.font = `500 36px ${FONT}`;
      const room = h - 70;
      webUi.more = false;
      for (let i = webUi.first; i < webUi.paras.length; i++) {
        const lines = util.wrapLines(webUi.paras[i], w - pad * 2, (s) => ctx.measureText(s).width);
        if (y + lines.length * 50 > room && i > webUi.first) { webUi.more = true; break; }
        for (const l of lines) { if ((y += 50) > room) { webUi.more = true; break; } write(ctx, l, pad, y, 36, INK, 500); }
        y += 20;
      }
      const where = `${webUi.first + 1} / ${webUi.paras.length}` + (webUi.more ? "  ·  thumbstick or tap for more" : "");
      write(ctx, where, w - pad, h - 28, 26, INK2, 500, "right");
    }
    webUi.body.update();
  }
  function drawWeb() { drawWebHead(); drawWebBody(); }
  ui(webUi.head.mesh, {
    tap: (hit) => {
      if (!hit?.uv) return;
      const x = hit.uv.x * webUi.head.w;
      webUi.btns.find((b) => x >= b.x0 && x <= b.x1)?.act();
    },
    grab: () => webUi.group,
  });
  ui(webUi.body.mesh, {
    tap: (hit) => {
      if (!hit?.uv) return;
      const y = (1 - hit.uv.y) * webUi.body.h;
      if (webUi.mode === "results") {
        const row = webUi.rows.find((r) => y >= r.y0 && y < r.y1);
        if (row) void webOpen(row.r);
      } else if (webUi.mode === "reading") webScroll(1);
    },
    scroll: (n) => webScroll(n),
    grab: () => webUi.group,
  });
  function webScroll(n) {
    if (webUi.mode !== "reading") return;
    const next = Math.max(0, Math.min(webUi.paras.length - 1, webUi.first + Math.sign(n)));
    if (next === webUi.first || (n > 0 && !webUi.more)) return;
    webUi.first = next;
    drawWebBody();
  }
  /** The orb beside the bar while it types (it steps back out of the way after). */
  const besideBar = new Vector3();
  function orbToBar() {
    if (rig.userData.placed === true) return;
    webUi.group.updateWorldMatrix(true, false);
    besideBar.set(-WEB_W / 2 - 0.36, WEB_BODY / 2 - 0.02, 0.06);
    webUi.group.localToWorld(besideBar);
    goal = { x: besideBar.x, y: besideBar.y, z: besideBar.z };
    rig.userData.placed = "web";
  }
  function webShow() {
    if (!webUi.open) {
      // In front of you (to the right when your PC's screen or the photos have the middle).
      const a = headYaw - (pcUi.open || filesUi.open ? 0.85 : 0.08), d = 1.2;
      webUi.group.position.set(headPos.x - Math.sin(a) * d, headPos.y - 0.02, headPos.z - Math.cos(a) * d);
      faceHead(webUi.group);
    }
    webUi.open = true;
    webUi.group.visible = true;
  }
  function typeOut(q, my) {
    if (calm) { webUi.typed = q; drawWebHead(); return Promise.resolve(); }
    return new Promise((done) => {
      let i = 0;
      const step = () => {
        if (my !== webUi.gen || !webUi.open) return done();
        i = Math.min(q.length, i + (q.length > 36 ? 2 : 1));
        webUi.typed = q.slice(0, i);
        drawWebHead();
        if (i >= q.length) return setTimeout(done, 220);
        setTimeout(step, 45 + Math.random() * 35);
      };
      step();
    });
  }
  /** Search Google in the room's browser; resolves to what Izuki says. */
  async function webSearch(q) {
    q = String(q || "").trim();
    webShow();
    const my = ++webUi.gen;
    Object.assign(webUi, { q, typed: "", results: [], page: null, err: "", mode: q ? "typing" : "" });
    drawWeb();
    if (!q) return "What should I search for? Say search the web for, and what you want to know.";
    orbToBar();
    await typeOut(q, my);
    if (my !== webUi.gen || !webUi.open) return "";
    webUi.mode = "searching";
    drawWeb();
    let r;
    try { r = await api.search(q); } catch (e) { r = { error: String(e?.message || e) }; }
    if (my !== webUi.gen || !webUi.open) return "";
    if (!r || r.error) {
      Object.assign(webUi, { mode: "error", err: r?.error || "The search didn't work." });
      drawWeb();
      return webUi.err;
    }
    Object.assign(webUi, { mode: "results", results: Array.isArray(r.results) ? r.results : [] });
    drawWeb();
    return r.answer || (webUi.results.length ? "Here's what Google found. Point at one and I'll read it to you." : "Google didn't find anything for that.");
  }
  /** Read one result here: its words on the panel, the start read out loud. */
  async function webOpen(r) {
    const my = ++webUi.gen;
    Object.assign(webUi, { mode: "page-loading", page: r, paras: [], first: 0, title: "", err: "" });
    drawWeb();
    let p;
    try { p = await api.read(r, webUi.q); } catch (e) { p = { error: String(e?.message || e) }; }
    if (my !== webUi.gen || !webUi.open) return;
    if (!p || p.error) {
      Object.assign(webUi, { mode: "page-error", err: p?.error || "I couldn't read that page." });
      drawWeb();
      return;
    }
    Object.assign(webUi, { mode: "reading", title: p.title || r.site, paras: Array.isArray(p.paras) && p.paras.length ? p.paras : ["That page gave me nothing to read."] });
    drawWeb();
    api.speak?.(webUi.paras[0]);
  }
  function webClose() {
    webUi.open = false;
    webUi.gen++;
    webUi.group.visible = false;
    if (rig.userData.placed === "web") { if (pcUi.open) { rig.userData.placed = false; stepAside("pc"); } else if (holoUi.open) { rig.userData.placed = false; stepAside("holo"); } else comeHere(); }
  }

  // ---- holograms: Izuki teaching in 3D ------------------------------------------------
  // Ask for something to be shown, mapped or taught ("teach me how the heart
  // works", "show me the solar system", "visualise the French revolution") and
  // your AI designs a small hologram that Izuki builds beside you while it
  // explains: a model (things in space, one circling another), a map of ideas,
  // steps, a timeline or a chart. In a lesson, "next" walks through it, each
  // step lighting up its parts. Point at any part to hear more about it. It
  // floats in your real room (passthrough) or the calm space alike.
  const HOLO_COLORS = { teal: 0x5eead4, sky: 0x7dd3fc, violet: 0xc4b5fd, rose: 0xfda4af, amber: 0xfcd34d, lime: 0xbef264, white: 0xe9eef7 };
  const holoHex = (c) => "#" + (HOLO_COLORS[c] ?? HOLO_COLORS.teal).toString(16).padStart(6, "0");
  const holoUi = { group: new Group(), stage: new Group(), open: false, spec: null, nodes: [], links: [], bar: card(0.86, 0.1), t0: 0, focus: null, step: -1, building: null, btns: [] };
  holoUi.group.visible = false;
  holoUi.group.add(holoUi.stage, holoUi.bar.mesh);
  holoUi.bar.mesh.position.set(0, -0.42, 0.02);
  scene.add(holoUi.group);
  track(holoUi.bar.tex);
  const holoGlow = track(glowTexture());
  const holoSphere = track(new SphereGeometry(1, 32, 24));
  const holoBox = track(new BoxGeometry(1, 1, 1));
  // A wire cage that turns round each part: the "projected" look.
  const holoShell = (() => { const ico = new IcosahedronGeometry(1, 1); const w = track(new WireframeGeometry(ico)); ico.dispose(); return w; })();
  const holoTime = { value: 0 };
  /** A part's surface: brighter at its edges (fresnel), with faint scan lines drifting up. */
  function holoMaterial(color) {
    return new ShaderMaterial({
      uniforms: { color: { value: new Color(color) }, opacity: { value: 0.82 }, time: holoTime },
      vertexShader: "varying vec3 vN; varying vec3 vV; varying float vY;\n" +
        "void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz);\n" +
        "  vY = (modelMatrix * vec4(position, 1.0)).y; gl_Position = projectionMatrix * mv; }",
      fragmentShader: "uniform vec3 color; uniform float opacity; uniform float time; varying vec3 vN; varying vec3 vV; varying float vY;\n" +
        "void main(){ float rim = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.0);\n" +
        "  float lines = 0.8 + 0.2 * step(0.5, fract(vY * 150.0 - time * 0.9));\n" +
        "  gl_FragColor = vec4(color * (0.5 + rim * 1.5) * lines, opacity * (0.45 + rim * 0.55));\n" +
        "  #include <colorspace_fragment>\n}",
      transparent: true, depthWrite: false,
    });
  }

  // ---- the projector under a hologram: turning rings, a beam of light, rising specks, a scan line ----
  const proj = { group: new Group(), rings: [], beam: null, dots: null, scan: null, scanT0: -1, speed: [] };
  {
    const ringMat = (o) => new MeshBasicMaterial({ color: HOLO_COLORS.teal, transparent: true, opacity: o, blending: AdditiveBlending, depthWrite: false, side: DoubleSide });
    for (const [r0, r1, o, seg, spin] of [[0.985, 1, 0.32, 96, 0.25], [0.7, 0.71, 0.24, 96, -0.4], [0.4, 0.44, 0.14, 6, 0.6]]) {
      const m = new Mesh(track(new RingGeometry(r0, r1, seg)), track(ringMat(o)));
      m.rotation.x = -Math.PI / 2;
      proj.group.add(m); proj.rings.push(m); proj.speed.push(spin);
    }
    // An open cone of light: brightest at the base, gone by the top.
    proj.beam = new Mesh(track(new CylinderGeometry(0.85, 1, 1, 48, 1, true)), track(new ShaderMaterial({
      uniforms: { color: { value: new Color(HOLO_COLORS.teal) }, strength: { value: 0.14 } },
      vertexShader: "varying float vY; void main(){ vY = position.y + 0.5; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
      fragmentShader: "uniform vec3 color; uniform float strength; varying float vY;\nvoid main(){ float a = strength * pow(1.0 - vY, 2.2); gl_FragColor = vec4(color * a, a);\n  #include <colorspace_fragment>\n}",
      transparent: true, blending: AdditiveBlending, depthWrite: false, side: DoubleSide,
    })));
    proj.beam.position.y = 0.5;
    proj.group.add(proj.beam);
    // Specks of light rising through the beam.
    const N = 70, pos = new Float32Array(N * 3);
    proj.rise = [];
    for (let i = 0; i < N; i++) {
      const a = Math.random() * Math.PI * 2, rr = Math.sqrt(Math.random()) * 0.88;
      pos.set([Math.cos(a) * rr, Math.random(), Math.sin(a) * rr], i * 3);
      proj.rise.push(0.05 + Math.random() * 0.1);
    }
    proj.dots = new Points(track(new BufferGeometry().setAttribute("position", new Float32BufferAttribute(pos, 3))),
      track(new PointsMaterial({ color: HOLO_COLORS.teal, size: 0.006, transparent: true, opacity: 0.75, blending: AdditiveBlending, depthWrite: false })));
    proj.group.add(proj.dots);
    // The scan line: a ring of light that sweeps up through a hologram as it appears.
    proj.scan = new Mesh(track(new RingGeometry(0.95, 1, 96)), track(ringMat(0)));
    proj.scan.rotation.x = -Math.PI / 2;
    proj.group.add(proj.scan);
    proj.group.visible = false;
    holoUi.group.add(proj.group);
  }
  /** The projector, as wide as what it shows; scan: sweep a line up through it. */
  function projShow(width, scan) {
    const r = Math.max(0.24, Math.min(0.7, width));
    proj.group.scale.set(r, 0.68, r);
    proj.group.position.set(0, -0.34, 0);
    proj.group.visible = true;
    proj.scanT0 = scan && !calm ? performance.now() : -1;
    proj.scan.material.opacity = 0;
  }
  function projTick(dt, now) {
    if (!proj.group.visible || calm) return;
    proj.rings.forEach((m, i) => { m.rotation.z += dt * proj.speed[i]; });
    const p = proj.dots.geometry.attributes.position;
    for (let i = 0; i < p.count; i++) { let y = p.getY(i) + dt * proj.rise[i]; if (y > 1) y -= 1; p.setY(i, y); }
    p.needsUpdate = true;
    if (proj.scanT0 >= 0) {
      const k = (now - proj.scanT0) / 1100;
      if (k >= 1) { proj.scanT0 = -1; proj.scan.material.opacity = 0; }
      else { proj.scan.position.y = k; proj.scan.material.opacity = 0.9 * Math.sin(Math.PI * k); }
    }
  }
  /** Everything a hologram made for itself goes when it does. */
  function holoClear() {
    for (const n of holoUi.nodes) {
      for (const m of [n.mat, n.glow.material, n.label.mesh.material]) m.dispose();
      n.label.tex.dispose(); n.label.mesh.geometry.dispose();
      n.ring?.geometry.dispose(); n.ring?.material.dispose();
      n.shell?.material.dispose();
      unui(n.body); unui(n.label.mesh);
    }
    for (const l of holoUi.links) { l.line.geometry.dispose(); l.line.material.dispose(); l.pulse?.material.dispose(); }
    if (holoUi.building) { holoUi.building.geometry.dispose(); holoUi.building.material.dispose(); }
    sketchClear();
    holoUi.stage.clear();
    holoUi.nodes = []; holoUi.links = []; holoUi.building = null;
  }
  function placeHolo() {
    // In front of you, a little further than the orb; to the right when your PC's screen has the middle.
    const a = headYaw - (pcUi.open ? 0.9 : 0), d = 1.35;
    holoUi.group.position.set(headPos.x - Math.sin(a) * d, headPos.y + 0.02, headPos.z - Math.cos(a) * d);
    faceHead(holoUi.group);
  }
  function drawHoloBar(status) {
    const { ctx, w, h } = holoUi.bar;
    glass(ctx, w, h, 48);
    const cy = h / 2, d = h * 0.6;
    holoUi.btns = [];
    let bx = w - 36;
    const control = (name, act) => {
      const cx = bx - d / 2;
      ctx.beginPath(); ctx.arc(cx, cy, d / 2, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.06)"; ctx.fill();
      ctx.lineWidth = 3; ctx.strokeStyle = "rgba(255,255,255,0.16)"; ctx.stroke();
      icon(ctx, name, cx, cy, d * 0.62, INK, 7);
      holoUi.btns.push({ x0: bx - d, x1: bx, act });
      bx -= d + 18;
    };
    control("close", () => holoClose());
    const spec = holoUi.spec, steps = spec?.steps?.length || 0;
    if (spec && steps) {
      if (holoUi.step < steps - 1) control("next", () => api.holoStep?.(1));
      if (holoUi.step > 0) control("back", () => api.holoStep?.(-1));
    }
    icon(ctx, "holo", 30 + d / 2, cy, d * 0.7, TEAL, 6);
    const tx = 30 + d + 16;
    ctx.font = `600 38px ${DISPLAY}`;
    ctx.font = `600 44px ${DISPLAY}`;
    write(ctx, ellipsize(ctx, status || spec?.title || "", bx - tx - 190), tx, cy + 15, 44, INK, 600, "left", DISPLAY);
    if (spec && steps) {
      const what = holoUi.step < 0 ? `${steps} steps · say next` : `Step ${holoUi.step + 1} of ${steps}`;
      write(ctx, what, bx - 8, cy + 12, 32, INK2, 500, "right");
    }
    holoUi.bar.update();
  }
  ui(holoUi.bar.mesh, {
    tap: (hit) => {
      if (!hit?.uv) return;
      const x = hit.uv.x * holoUi.bar.w;
      holoUi.btns.find((b) => x >= b.x0 && x <= b.x1)?.act();
    },
    drag: () => holoUi.group,
  });
  /** While your AI designs it: a slow ring where it will appear. */
  function holoBuilding(what) {
    holoClear();
    holoUi.spec = null; holoUi.step = -1; holoUi.focus = null;
    if (!holoUi.open) placeHolo();
    holoUi.open = true;
    holoUi.group.visible = true;
    const ring = new Mesh(new TorusGeometry(0.16, 0.0025, 8, 96), new MeshBasicMaterial({ color: HOLO_COLORS.teal, transparent: true, opacity: 0.7, depthWrite: false }));
    holoUi.stage.add(ring);
    holoUi.building = ring;
    projShow(0.3, false);
    drawHoloBar("Building " + (what ? "“" + String(what).slice(0, 48) + "”" : "a hologram") + "…");
    stepAside("holo");
  }
  /** A part of the hologram: a glowing body, its light, and a label card. */
  function holoNode(it, i, kind, spec) {
    const color = HOLO_COLORS[it.color] ?? HOLO_COLORS.teal;
    const g = new Group();
    const mat = kind === "chart" ? new MeshBasicMaterial({ color, transparent: true, opacity: 0.82, depthWrite: true }) : holoMaterial(color);
    let body, r;
    if (kind === "chart") {
      body = new Mesh(holoBox, mat);
      r = 0.04;
    } else {
      r = kind === "model" ? 0.022 + it.size * 0.016 : kind === "map" && i === 0 ? 0.055 : 0.03;
      body = new Mesh(holoSphere, mat);
      body.scale.setScalar(r);
    }
    const glow = new Sprite(new SpriteMaterial({ map: holoGlow, color, transparent: true, opacity: 0.5, blending: AdditiveBlending, depthWrite: false }));
    glow.scale.setScalar(r * (kind === "chart" ? 3 : 5.5));
    const big = kind === "steps" || (kind === "map" && i === 0);
    const tag = kind === "model";
    const label = card(tag ? 0.15 : big ? 0.26 : 0.24, tag ? 0.05 : big ? 0.13 : 0.085);
    {
      const { ctx, w, h } = label;
      glass(ctx, w, h, 30, { fill0: "rgba(16,19,27,0.82)", fill1: "rgba(10,12,18,0.86)" });
      let y = tag ? -2 : 16;
      const head = tag ? "" : kind === "timeline" && it.when ? it.when : kind === "steps" ? String(i + 1) : kind === "chart" && Number.isFinite(it.value) ? String(it.value) + (spec.unit ? " " + spec.unit : "") : "";
      if (head) { write(ctx, head, 26, (y += 34), 30, holoHex(it.color), 700, "left", DISPLAY); y += 4; }
      ctx.font = `600 36px ${DISPLAY}`;
      write(ctx, ellipsize(ctx, it.label, w - 52), 26, (y += 40), 36, INK, 600, "left", DISPLAY);
      if (it.note && !tag) {
        ctx.font = `500 26px ${FONT}`;
        const lines = util.wrapLines(it.note, w - 52, (s) => ctx.measureText(s).width).slice(0, big ? 3 : 1);
        for (const l of lines) write(ctx, l, 26, (y += 34), 26, INK2, 500);
      }
      label.update();
    }
    label.mesh.material.opacity = 1;
    g.add(body, glow, label.mesh);
    let shell = null;
    if (kind !== "chart") {
      shell = new LineSegments(holoShell, new LineBasicMaterial({ color, transparent: true, opacity: 0.3, blending: AdditiveBlending, depthWrite: false }));
      shell.scale.setScalar(r * 1.45);
      shell.rotation.set(i * 0.7, i * 1.3, 0);
      g.add(shell);
    }
    const n = { it, i, g, body, mat, glow, label, shell, r, kind, base: new Vector3(), angle: 0, speed: 0, orbitR: 0, parent: null, shown: 0, emph: 1 };
    const more = () => api.ask?.(`Tell me more about ${it.label}` + (spec.title ? `, in ${spec.title}` : "") + ".");
    ui(body, { tap: more, hover: (on) => { n.hot = on; } });
    ui(label.mesh, { tap: more, hover: (on) => { n.hot = on; } });
    return n;
  }
  /** Where each part goes, by kind (positions in the hologram's own space; +z is towards you). */
  function holoLayout(spec, nodes) {
    const n = nodes.length;
    const spread = (k, width) => (n > 1 ? (k / (n - 1) - 0.5) * width : 0);
    if (spec.kind === "model") {
      const roots = nodes.filter((x) => x.it.orbit < 0);
      roots.forEach((x, k) => { x.base.set(roots.length > 1 ? (k / (roots.length - 1) - 0.5) * Math.min(0.95, 0.32 * roots.length) : 0, 0.02, 0); });
      const kids = new Map();
      for (const x of nodes) if (x.it.orbit >= 0) {
        const p = nodes[x.it.orbit];
        const order = (kids.get(p) || 0);
        kids.set(p, order + 1);
        x.parent = p;
        x.orbitR = p.r + x.r + 0.07 + order * 0.075;
        x.angle = order * 2.1 + 0.6;
        x.speed = 0.45 / (1 + order * 0.55);
        const pts = [];
        for (let a = 0; a <= 64; a++) { const t = (a / 64) * Math.PI * 2; pts.push(Math.cos(t) * x.orbitR, Math.sin(t) * x.orbitR * 0.22, Math.sin(t) * x.orbitR * 0.85); }
        x.ring = new Line(new BufferGeometry().setAttribute("position", new Float32BufferAttribute(pts, 3)), new LineBasicMaterial({ color: HOLO_COLORS[p.it.color] ?? HOLO_COLORS.teal, transparent: true, opacity: 0.28, depthWrite: false }));
        holoUi.stage.add(x.ring);
      }
      for (const x of nodes) x.label.mesh.position.set(0, -(x.r + 0.06), 0.01);
    } else if (spec.kind === "map") {
      nodes[0].base.set(0, 0.02, 0);
      nodes[0].label.mesh.position.set(0, -0.14, 0.01);
      const rest = nodes.slice(1);
      rest.forEach((x, k) => {
        const t = -Math.PI / 2 + ((k + 0.5) / rest.length) * Math.PI * 2;
        x.base.set(Math.cos(t) * 0.46, Math.sin(t) * 0.27 + 0.02, 0.03 + (k % 2) * 0.05);
        x.label.mesh.position.set(0, -0.075, 0.01);
      });
    } else if (spec.kind === "steps") {
      nodes.forEach((x, k) => {
        const px = spread(k, Math.min(1.1, 0.28 * n));
        x.base.set(px, 0.13, 0.16 * (1 - (px / 0.6) ** 2));
        x.label.mesh.position.set(0, -0.12, 0.01);
      });
    } else if (spec.kind === "timeline") {
      nodes.forEach((x, k) => {
        x.base.set(spread(k, Math.min(1.15, 0.27 * n)), 0, 0);
        x.label.mesh.position.set(0, k % 2 ? -0.1 : 0.1, 0.01);
      });
      const pts = [-0.62, 0, 0, 0.62, 0, 0];
      const line = new Line(new BufferGeometry().setAttribute("position", new Float32BufferAttribute(pts, 3)), new LineBasicMaterial({ color: HOLO_COLORS.white, transparent: true, opacity: 0.35, depthWrite: false }));
      holoUi.stage.add(line);
      holoUi.links.push({ line, a: null, b: null });
    } else if (spec.kind === "chart") {
      const top = Math.max(...nodes.map((x) => Math.abs(x.it.value) || 0), 1e-9);
      // All above zero: bars rise from a low line. Some below: the line sits in the middle.
      const mixed = nodes.some((x) => x.it.value < 0);
      const zero = mixed ? -0.02 : -0.26, span = mixed ? 0.24 : 0.46;
      nodes.forEach((x, k) => {
        const v = Number.isFinite(x.it.value) ? x.it.value : 0;
        const hgt = Math.max(0.01, span * Math.abs(v) / top), down = v < 0;
        x.body.scale.set(0.075, hgt, 0.075);
        x.base.set(spread(k, Math.min(1.05, 0.22 * n)), zero + (down ? -hgt / 2 : hgt / 2), 0);
        x.glow.position.set(0, down ? -hgt / 2 : hgt / 2, 0);
        x.label.mesh.position.set(0, down ? hgt / 2 + 0.06 : -hgt / 2 - 0.06, 0.05);
      });
    }
    // Lines between parts: the ones the AI named; a map joins all to the middle; steps run in order.
    const pairs = [];
    for (const x of nodes) for (const j of x.it.link) if (nodes[j] && j !== x.i) pairs.push([x, nodes[j]]);
    if (spec.kind === "map" && !pairs.length) for (const x of nodes.slice(1)) pairs.push([nodes[0], x]);
    if (spec.kind === "steps") for (let k = 1; k < n; k++) pairs.push([nodes[k - 1], nodes[k]]);
    for (const [a, b] of pairs) {
      const line = new Line(new BufferGeometry().setAttribute("position", new Float32BufferAttribute([0, 0, 0, 0, 0, 0], 3)), new LineBasicMaterial({ color: HOLO_COLORS.teal, transparent: true, opacity: 0, depthWrite: false }));
      holoUi.stage.add(line);
      // A pulse of light that travels the link: you see it flow from part to part.
      const pulse = new Sprite(new SpriteMaterial({ map: holoGlow, color: HOLO_COLORS[b.it.color] ?? HOLO_COLORS.teal, transparent: true, opacity: 0, blending: AdditiveBlending, depthWrite: false }));
      pulse.scale.setScalar(0.05);
      holoUi.stage.add(pulse);
      holoUi.links.push({ line, a, b, pulse, off: holoUi.links.length * 0.37 });
    }
  }
  /** Build a hologram from a checked spec (vr.js parseHolo). */
  function holoShow(spec) {
    holoClear();
    holoUi.spec = spec; holoUi.step = -1; holoUi.focus = null; holoUi.t0 = performance.now();
    if (!holoUi.open) placeHolo();
    holoUi.open = true;
    holoUi.group.visible = true;
    if (spec.kind === "sketch") {
      projShow(sketchShow(spec) + 0.06, true);
      drawHoloBar();
      stepAside("holo");
      return;
    }
    holoUi.nodes = spec.items.map((it, i) => holoNode(it, i, spec.kind, spec));
    for (const n of holoUi.nodes) holoUi.stage.add(n.g);
    holoLayout(spec, holoUi.nodes);
    for (const n of holoUi.nodes) { n.g.position.copy(n.base); n.g.scale.setScalar(calm ? 1 : 0.001); }
    // The projector reaches as wide as the hologram (orbits included).
    const reach = Math.max(0.2, ...holoUi.nodes.map((n) => Math.abs(n.base.x) + n.r + (n.parent ? n.orbitR + Math.abs(n.parent.base.x) : 0)));
    projShow(reach + 0.06, true);
    drawHoloBar();
    stepAside("holo");
  }

  // ---- "draw it": the real shape of a thing, in glowing lines and wire solids ----------
  // Shapes come in a box from -1 to 1 (vr.js parseSketch); here they are scaled
  // to about 64 cm, drawn in one after another, and things flow along the lines.
  const SK = 0.32;
  const sketchUi = { parts: [], made: [] };
  function sketchClear() {
    for (const o of sketchUi.made) { try { o.dispose(); } catch {} }
    sketchUi.parts = []; sketchUi.made = [];
  }
  function sketchShow(spec) {
    const keep = (o) => { sketchUi.made.push(o); return o; };
    const v = (p) => new Vector3(p[0] * SK, p[1] * SK + 0.04, p[2] * SK);
    const axisRot = (g, axis) => { if (axis === "x") g.rotation.z = -Math.PI / 2; else if (axis === "z") g.rotation.x = Math.PI / 2; };
    let reach = 0.2;
    spec.shapes.forEach((s, i) => {
      const color = HOLO_COLORS[s.color] ?? HOLO_COLORS.teal;
      const g = new Group();
      const lineMat = keep(new MeshBasicMaterial({ color, transparent: true, opacity: 0.95, blending: AdditiveBlending, depthWrite: false }));
      let path = null, tube = null, solid = null;
      const tubeOf = (curve, closed = false) => {
        const geo = keep(new TubeGeometry(curve, 96, 0.0045, 6, closed));
        tube = new Mesh(geo, lineMat);
        g.add(tube);
        path = curve;
      };
      const c = v(s.center);
      const ring = (center, r, axis, n = 48) => {
        const pts = [];
        for (let k = 0; k < n; k++) {
          const a = (k / n) * Math.PI * 2, x = Math.cos(a) * r, y = Math.sin(a) * r;
          pts.push(axis === "y" ? new Vector3(center.x + x, center.y, center.z + y) : axis === "x" ? new Vector3(center.x, center.y + x, center.z + y) : new Vector3(center.x + x, center.y + y, center.z));
        }
        return new CatmullRomCurve3(pts, true);
      };
      if (s.type === "line" || s.type === "arrow") {
        const cp = new CurvePath();
        for (let k = 1; k < s.points.length; k++) cp.add(new LineCurve3(v(s.points[k - 1]), v(s.points[k])));
        tubeOf(cp);
        if (s.type === "arrow") {
          const end = v(s.points[s.points.length - 1]), before = v(s.points[s.points.length - 2]);
          const tip = new Mesh(keep(new ConeGeometry(0.016, 0.04, 10)), lineMat);
          tip.position.copy(end);
          tip.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), end.clone().sub(before).normalize());
          g.add(tip);
        }
      } else if (s.type === "curve") {
        tubeOf(new CatmullRomCurve3(s.points.map(v)));
      } else if (s.type === "circle") {
        tubeOf(ring(c, s.radius * SK, s.axis), true);
      } else if (s.type === "spiral" || s.type === "wave") {
        const pts = [], n = 120;
        for (let k = 0; k <= n; k++) {
          const f = k / n;
          if (s.type === "spiral") {
            const a = f * s.turns * Math.PI * 2, h = (f - 0.5) * s.height * SK;
            const x = Math.cos(a) * s.radius * SK, z = Math.sin(a) * s.radius * SK;
            pts.push(s.axis === "x" ? new Vector3(c.x + h, c.y + x, c.z + z) : s.axis === "z" ? new Vector3(c.x + x, c.y + z, c.z + h) : new Vector3(c.x + x, c.y + h, c.z + z));
          } else {
            const x = (f - 0.5) * 2 * s.radius * SK * 2, y = Math.sin(f * Math.PI * 2 * s.turns) * s.height * SK * 0.25;
            pts.push(new Vector3(c.x + x, c.y + y, c.z));
          }
        }
        tubeOf(new CatmullRomCurve3(pts));
      } else {
        // Solids: a see-through glowing body and its wire edges.
        let geo;
        if (s.type === "sphere") geo = new SphereGeometry(s.radius * SK, 20, 14);
        else if (s.type === "cone") geo = new ConeGeometry(s.radius * SK, s.height * SK, 20, 1, true);
        else if (s.type === "cylinder") geo = new CylinderGeometry(s.radius * SK, s.radius * SK, s.height * SK, 20, 1, true);
        else geo = new BoxGeometry(s.size[0] * SK, s.size[1] * SK, s.size[2] * SK);
        keep(geo);
        const body = new Mesh(geo, keep(holoMaterial(color)));
        body.material.uniforms.opacity.value = 0.35;
        const wire = new LineSegments(keep(new WireframeGeometry(geo)), keep(new LineBasicMaterial({ color, transparent: true, opacity: 0.55, blending: AdditiveBlending, depthWrite: false })));
        const holder = new Group();
        holder.add(body, wire);
        solid = { body: body.material, wire: wire.material };
        axisRot(holder, s.axis);
        holder.position.copy(c);
        g.add(holder);
        // What flows round a solid: a ring at its middle, for "flow".
        if (s.flow) path = ring(c, (s.type === "box" ? Math.max(s.size[0], s.size[2]) / 2 : s.radius) * SK * 1.08, s.axis === "y" ? "y" : s.axis === "x" ? "x" : "z");
      }
      // Things moving along it: lava, blood, air, current.
      const flows = [];
      if (s.flow && path) {
        for (let k = 0; k < 6; k++) {
          const sp = new Sprite(keep(new SpriteMaterial({ map: holoGlow, color, transparent: true, opacity: 0, blending: AdditiveBlending, depthWrite: false })));
          sp.scale.setScalar(0.04);
          g.add(sp);
          flows.push({ sp, off: k / 6 });
        }
      }
      // A label beside it.
      let label = null;
      if (s.label) {
        label = card(0.16, 0.045);
        keep(label.tex); keep(label.mesh.geometry); keep(label.mesh.material);
        const { ctx, w, h } = label;
        glass(ctx, w, h, 26, { fill0: "rgba(16,19,27,0.82)", fill1: "rgba(10,12,18,0.86)" });
        ctx.font = `600 34px ${DISPLAY}`;
        write(ctx, ellipsize(ctx, s.label, w - 40), 20, h / 2 + 12, 34, INK, 600, "left", DISPLAY);
        label.update();
        // Beside the middle of its own line (lines often share an end), or beside a solid;
        // alternate sides so neighbours don't stack.
        const anchor = path && (s.type === "line" || s.type === "curve" || s.type === "arrow" || s.type === "spiral" || s.type === "wave")
          ? path.getPointAt(0.55, new Vector3())
          : c.clone().add(new Vector3((s.type === "box" ? s.size[0] / 2 : s.radius) * SK * 0.7, 0, 0));
        const side = i % 2 ? -1 : 1;
        label.mesh.position.set(anchor.x + side * 0.1, anchor.y, anchor.z + 0.03);
        g.add(label.mesh);
        ui(label.mesh, { tap: () => api.ask?.(`Tell me more about the ${s.label}` + (spec.title ? `, in ${spec.title}` : "") + ".") });
      }
      g.visible = calm;
      holoUi.stage.add(g);
      const count = tube ? tube.geometry.index.count : 0;
      if (tube && !calm) tube.geometry.setDrawRange(0, 0);
      sketchUi.parts.push({ s, i, g, tube, count, path, flows, label, lineMat, solid, emph: 1 });
      const pts = s.points.length ? s.points : [s.center];
      for (const p of pts) reach = Math.max(reach, Math.abs(p[0] * SK) + (s.type === "line" || s.type === "curve" || s.type === "arrow" ? 0 : s.radius * SK));
    });
    return reach;
  }
  const sketchTmp = new Vector3();
  function sketchTick(dt, now) {
    const age = now - holoUi.t0;
    const n = sketchUi.parts.length;
    sketchUi.parts.forEach((p) => {
      // Drawn in one after another, like a pen sketching it.
      const k = calm ? 1 : Math.max(0, Math.min(1, (age - 250 - p.i * (1600 / Math.max(1, n))) / 700));
      if (k > 0) p.g.visible = true;
      if (p.tube && p.count) p.tube.geometry.setDrawRange(0, Math.floor((p.count * k) / 3) * 3);
      if (!p.tube) p.g.scale.setScalar(Math.max(0.001, 1 - (1 - k) ** 3));
      const want = holoUi.focus ? (holoUi.focus.has(p.i) ? 1.15 : 0.25) : 1;
      p.emph += (want - p.emph) * Math.min(1, dt * 6);
      const pulse = p.s.pulse && !calm ? 0.75 + 0.25 * Math.sin(now / 380 + p.i) : 1;
      p.lineMat.opacity = 0.95 * Math.min(1, p.emph) * pulse;
      // A solid dims and pulses with the step too.
      if (p.solid) { p.solid.body.uniforms.opacity.value = 0.35 * Math.min(1, p.emph) * pulse; p.solid.wire.opacity = 0.55 * Math.min(1, p.emph) * pulse; }
      if (p.label) p.label.mesh.material.opacity = Math.max(0.3, Math.min(1, p.emph));
      if (p.s.spin && !calm) p.g.rotation.y += dt * 0.35;
      if (p.path && p.flows.length) {
        for (const f of p.flows) {
          const u = calm ? f.off : (now / 2400 + f.off) % 1;
          p.path.getPointAt(u, sketchTmp);
          f.sp.position.copy(sketchTmp);
          f.sp.material.opacity = k >= 1 ? 0.9 * Math.min(1, p.emph) * (calm ? 0.6 : Math.sin(Math.PI * u) * 0.6 + 0.4) : 0;
        }
      }
    });
  }

  /** A lesson's step: its parts light up, the rest dim. null: all lit. */
  function holoFocus(list, step) {
    holoUi.step = step ?? holoUi.step;
    holoUi.focus = Array.isArray(list) && list.length ? new Set(list) : null;
    drawHoloBar();
  }
  function holoClose() {
    holoClear();
    proj.group.visible = false;
    holoUi.open = false;
    holoUi.spec = null;
    holoUi.group.visible = false;
    api.holoClosed?.();
    if (rig.userData.placed === "holo") { if (pcUi.open) { rig.userData.placed = false; stepAside("pc"); } else comeHere(); }
  }
  // ---- dream mode: a whole world around you (vr.js parseDream designs it) -----------------
  // An opaque sky, a ground, low-poly shapes lit by their own light, and
  // particles, all centred where you stand. It replaces the room (passthrough
  // or space) until you wake up; the orb, cards and panels stay with you.
  const dreamUi = { group: null, sky: null, parts: null, dots: null, kind: "none", made: [], t0: 0, spec: null };
  function dreamClose() {
    if (!dreamUi.group) return false;
    scene.remove(dreamUi.group);
    for (const o of dreamUi.made) { try { o.dispose(); } catch {} }
    Object.assign(dreamUi, { group: null, sky: null, parts: null, dots: null, made: [], spec: null });
    return true;
  }
  function dreamShow(spec) {
    dreamClose();
    const keep = (o) => { dreamUi.made.push(o); return o; };
    const col = (hex) => new Color(hex);
    const G = new Group();
    G.position.set(headPos.x, floorY, headPos.z);
    G.rotation.y = headYaw; // angle 0 is straight ahead of you
    // The sky: three colours, top to horizon to below. Opaque, so it replaces the room.
    const sky = new Mesh(keep(new SphereGeometry(36, 48, 24)), keep(new ShaderMaterial({
      side: BackSide, transparent: true, depthWrite: true,
      uniforms: { top: { value: col(spec.sky.top) }, mid: { value: col(spec.sky.horizon) }, low: { value: col(spec.sky.bottom) }, fade: { value: calm ? 1 : 0 } },
      vertexShader: "varying vec3 vW; void main(){ vW = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
      fragmentShader: "uniform vec3 top; uniform vec3 mid; uniform vec3 low; uniform float fade; varying vec3 vW;\n" +
        "void main(){ float h = vW.y; vec3 c = h < 0.0 ? mix(mid, low, clamp(-h * 3.0, 0.0, 1.0)) : mix(mid, top, clamp(pow(h, 0.7) * 1.3, 0.0, 1.0));\n" +
        "  gl_FragColor = vec4(c, fade);\n  #include <colorspace_fragment>\n}",
    })));
    sky.renderOrder = -9;
    G.add(sky);
    // Its own light: a soft sky/ground fill and a sun in the world's colour.
    const hemi = new HemisphereLight(col(spec.sky.top), col(spec.ground.color), 1.1);
    const sun = new DirectionalLight(col(spec.light), 1.4);
    sun.position.set(6, 10, 4);
    G.add(hemi, sun);
    // The ground.
    const gk = spec.ground.kind;
    if (gk !== "none") {
      let geo;
      if (gk === "dunes" || gk === "rock" || gk === "snow") {
        geo = new PlaneGeometry(68, 68, 64, 64);
        const p = geo.attributes.position;
        for (let i = 0; i < p.count; i++) {
          const x = p.getX(i), y = p.getY(i), d = Math.hypot(x, y);
          const amp = gk === "dunes" ? 0.55 : gk === "rock" ? 0.35 : 0.2;
          // Flat where you stand, rolling further out.
          p.setZ(i, d < 3 ? 0 : amp * Math.min(1, (d - 3) / 6) * (Math.sin(x * 0.45) * Math.cos(y * 0.38) + 0.5 * Math.sin((x + y) * 0.9)));
        }
        geo.computeVertexNormals();
      } else geo = new CircleGeometry(34, 72);
      keep(geo);
      const mat = keep(gk === "water"
        ? new MeshLambertMaterial({ color: col(spec.ground.color), transparent: true, opacity: 0.92, emissive: col(spec.ground.color), emissiveIntensity: 0.25 })
        : gk === "clouds" ? new MeshLambertMaterial({ color: col(spec.ground.color), transparent: true, opacity: 0.85 })
        : new MeshLambertMaterial({ color: col(spec.ground.color), flatShading: gk !== "grass" && gk !== "grid" }));
      const ground = new Mesh(geo, mat);
      ground.rotation.x = -Math.PI / 2;
      ground.position.y = gk === "clouds" ? -0.4 : 0.002;
      ground.renderOrder = -8;
      G.add(ground);
      if (gk === "grid") {
        // Neon lines to the horizon, the light's colour.
        const pts = [];
        for (let k = -30; k <= 30; k += 1.5) { pts.push(k, 0.01, -30, k, 0.01, 30, -30, 0.01, k, 30, 0.01, k); }
        G.add(new LineSegments(keep(new BufferGeometry().setAttribute("position", new Float32BufferAttribute(pts, 3))),
          keep(new LineBasicMaterial({ color: col(spec.light), transparent: true, opacity: 0.55 }))));
      }
    }
    // Shapes: low-poly, shared geometry per kind, one material per group.
    const parts = new Group();
    const geos = {};
    const geoOf = (k, make) => geos[k] || (geos[k] = keep(make()));
    const ring = { near: [4, 9], mid: [9, 17], far: [18, 30] };
    for (const s of spec.shapes) {
      const lit = keep(new MeshLambertMaterial({ color: col(s.color), flatShading: true }));
      const glowy = keep(new MeshBasicMaterial({ color: col(s.color) }));
      const trunk = keep(new MeshLambertMaterial({ color: col(s.color).multiplyScalar(0.35), flatShading: true }));
      const spread = s.kind === "mountain" ? ring.far : s.kind === "planet" || s.kind === "moon" ? [22, 30] : ring[s.spread];
      for (let k = 0; k < s.count; k++) {
        const a = (k / s.count) * Math.PI * 2 + Math.random() * 0.9;
        let d = spread[0] + Math.random() * (spread[1] - spread[0]);
        // A clear view ahead: nothing big right in front of you, close up.
        const ahead = Math.abs(Math.atan2(Math.sin(a), Math.cos(a))) < 0.65;
        if (ahead && d < 12 && s.kind !== "lantern") d += 7;
        const sz = s.size * (0.75 + Math.random() * 0.5);
        const one = new Group();
        const add = (geo, mat, y = 0, sx = 1, sy = 1, sz2 = 1) => { const m = new Mesh(geo, mat); m.position.y = y; m.scale.set(sx, sy, sz2); one.add(m); return m; };
        if (s.kind === "tree") { add(geoOf("trunk", () => new CylinderGeometry(0.06, 0.09, 0.7, 6)), trunk, 0.35); add(geoOf("blob", () => new IcosahedronGeometry(0.45, 0)), lit, 0.95); }
        else if (s.kind === "pine") { add(geoOf("trunk", () => new CylinderGeometry(0.06, 0.09, 0.7, 6)), trunk, 0.3); add(geoOf("cone", () => new ConeGeometry(0.42, 1.3, 7)), lit, 1.05); }
        else if (s.kind === "palm") { add(geoOf("stem", () => new CylinderGeometry(0.04, 0.07, 1.9, 6)), trunk, 0.95); add(geoOf("blob", () => new IcosahedronGeometry(0.45, 0)), lit, 1.95, 1.4, 0.35, 1.4); }
        else if (s.kind === "rock") add(geoOf("rock", () => new DodecahedronGeometry(0.4, 0)), lit, 0.15, 1, 0.6, 1);
        else if (s.kind === "crystal") add(geoOf("crystal", () => new OctahedronGeometry(0.3, 0)), glowy, 0.7, 0.8, 2.3, 0.8);
        else if (s.kind === "pillar") add(geoOf("pillar", () => new CylinderGeometry(0.25, 0.3, 3, 10)), lit, 1.5);
        else if (s.kind === "tower") add(geoOf("tower", () => new BoxGeometry(1, 6, 1)), lit, 3);
        else if (s.kind === "mountain") add(geoOf("mountain", () => new ConeGeometry(6, 8, 7)), lit, 4);
        else if (s.kind === "arch") add(geoOf("arch", () => new TorusGeometry(1.2, 0.15, 8, 24, Math.PI)), lit, 0);
        else if (s.kind === "lantern") add(geoOf("lantern", () => new SphereGeometry(0.12, 12, 8)), glowy, 1.3);
        else if (s.kind === "cloud") { const b = geoOf("puff", () => new IcosahedronGeometry(0.7, 1)); add(b, lit, 0, 1.4, 0.8, 1); const m2 = add(b, lit, 0.15, 1, 0.7, 1); m2.position.x = 0.9; const m3 = add(b, lit, 0.1, 1.1, 0.75, 1); m3.position.x = -0.9; }
        else if (s.kind === "planet" || s.kind === "moon") add(geoOf(s.kind, () => new SphereGeometry(s.kind === "planet" ? 3 : 1.5, 32, 20)), s.kind === "moon" ? glowy : lit, 0);
        one.scale.setScalar(sz);
        const sky0 = s.kind === "planet" || s.kind === "moon" ? 10 + Math.random() * 10 : s.kind === "cloud" ? 6 + Math.random() * 5 : 0;
        const lift = s.float && sky0 === 0 ? 0.8 + Math.random() * 2.5 : 0;
        one.position.set(Math.sin(a) * d, sky0 + lift, -Math.cos(a) * d);
        one.rotation.y = Math.random() * Math.PI * 2;
        one.userData = { bob: s.float || s.kind === "cloud" || s.kind === "lantern" ? Math.random() * 6 : -1, y: one.position.y };
        parts.add(one);
      }
    }
    if (!calm) parts.scale.setScalar(0.001);
    G.add(parts);
    // Particles, moved in dreamTick.
    const pk = spec.particles.kind;
    let dots = null;
    if (pk !== "none") {
      const N = Math.round(pk === "stars" ? 500 + 700 * spec.particles.amount : 150 + 900 * spec.particles.amount);
      const pos = new Float32Array(N * 3), seed = new Float32Array(N);
      for (let i = 0; i < N; i++) {
        if (pk === "stars") {
          const u = Math.random() * Math.PI * 2, v = Math.random() * 0.9 + 0.08, r = 33;
          pos.set([Math.cos(u) * Math.sqrt(1 - v * v) * r, v * r, Math.sin(u) * Math.sqrt(1 - v * v) * r], i * 3);
        } else {
          const u = Math.random() * Math.PI * 2, r = 1.2 + Math.sqrt(Math.random()) * 13;
          pos.set([Math.cos(u) * r, Math.random() * 9, Math.sin(u) * r], i * 3);
        }
        seed[i] = Math.random() * 100;
      }
      const size = { stars: 0.09, snow: 0.05, rain: 0.03, fireflies: 0.07, embers: 0.05, bubbles: 0.08, petals: 0.06, dust: 0.03 }[pk];
      dots = new Points(keep(new BufferGeometry().setAttribute("position", new Float32BufferAttribute(pos, 3))),
        keep(new PointsMaterial({ color: col(spec.particles.color), size, transparent: true, opacity: pk === "dust" ? 0.5 : 0.9, depthWrite: false, blending: pk === "fireflies" || pk === "embers" || pk === "stars" ? AdditiveBlending : NormalBlending })));
      dots.userData.seed = seed;
      G.add(dots);
    }
    scene.add(G);
    Object.assign(dreamUi, { group: G, sky, parts, dots, kind: pk, t0: performance.now(), spec });
    // Out of the way of a world: the PC, the browser and a hologram stay where they are.
    notice(spec.title, 5000);
  }
  function dreamTick(dt, now) {
    if (!dreamUi.group) return;
    const age = (now - dreamUi.t0) / 1000;
    if (!calm) {
      // In over a second and a half: the sky first, then the world grows up out of the ground.
      dreamUi.sky.material.uniforms.fade.value = Math.min(1, age / 1.2);
      const k = Math.max(0, Math.min(1, (age - 0.5) / 1.4));
      dreamUi.parts.scale.setScalar(Math.max(0.001, 1 - (1 - k) ** 3));
      for (const o of dreamUi.parts.children) if (o.userData.bob >= 0) o.position.y = o.userData.y + Math.sin(now / 1600 + o.userData.bob) * 0.15;
    }
    const d = dreamUi.dots;
    if (!d || calm || dreamUi.kind === "stars") return;
    const p = d.geometry.attributes.position, seed = d.userData.seed, kind = dreamUi.kind, t = now / 1000;
    const vy = { snow: -0.5, rain: -7, fireflies: 0, embers: 0.7, bubbles: 0.45, petals: -0.35, dust: 0.03 }[kind] ?? 0;
    for (let i = 0; i < p.count; i++) {
      let y = p.getY(i) + vy * dt * (0.7 + (seed[i] % 1) * 0.6);
      if (y < 0) y += 9; else if (y > 9) y -= 9;
      p.setY(i, y);
      if (kind !== "rain") {
        const s = seed[i];
        p.setX(i, p.getX(i) + Math.sin(t * 0.6 + s) * dt * (kind === "fireflies" ? 0.35 : 0.12));
        p.setZ(i, p.getZ(i) + Math.cos(t * 0.5 + s * 1.3) * dt * (kind === "fireflies" ? 0.35 : 0.12));
      }
    }
    p.needsUpdate = true;
    if (kind === "fireflies") d.material.opacity = 0.6 + 0.35 * Math.sin(t * 2.1);
  }

  // ---- a timer by the orb ----------------------------------------------------------------
  const timerUi = { card: card(0.2, 0.09), until: 0, total: 0, words: "", shown: "", doneAt: 0 };
  timerUi.card.mesh.visible = false;
  timerUi.card.mesh.position.set(0.36, 0.1, 0.01);
  rig.add(timerUi.card.mesh);
  track(timerUi.card.tex);
  function drawTimer(left) {
    const { ctx, w, h } = timerUi.card;
    const done = left <= 0;
    glass(ctx, w, h, 40, done ? { hot: true } : {});
    const s = Math.max(0, Math.ceil(left / 1000)), hh = Math.floor(s / 3600), mm = Math.floor((s % 3600) / 60), ss = s % 60;
    const clock = done ? "Time's up" : (hh ? hh + ":" + String(mm).padStart(2, "0") : String(mm)) + ":" + String(ss).padStart(2, "0");
    write(ctx, "Timer · " + timerUi.words, 34, 56, 26, INK2, 600, "left", DISPLAY, "0.02em");
    write(ctx, clock, 34, h - 40, done ? 56 : 72, done ? TEAL : INK, 600, "left", DISPLAY);
    // How much is left, as a hairline along the bottom.
    const frac = timerUi.total ? Math.max(0, Math.min(1, left / timerUi.total)) : 0;
    ctx.fillStyle = "rgba(255,255,255,0.1)"; ctx.fillRect(34, h - 22, w - 68, 4);
    ctx.fillStyle = TEAL; ctx.fillRect(34, h - 22, (w - 68) * frac, 4);
    icon(ctx, "close", w - 52, 52, 40, INK2, 7);
    timerUi.card.update();
  }
  function timerStart(ms, words) {
    Object.assign(timerUi, { until: performance.now() + ms, total: ms, words: words || "", shown: "", doneAt: 0 });
    timerUi.card.mesh.visible = true;
    drawTimer(ms);
  }
  function timerStop() {
    const was = timerUi.until > 0;
    timerUi.until = 0; timerUi.doneAt = 0;
    timerUi.card.mesh.visible = false;
    return was;
  }
  ui(timerUi.card.mesh, { tap: () => timerStop(), drag: () => rig, dropped: () => { rig.userData.placed = true; } });
  function timerTick(now) {
    if (!timerUi.until) return;
    const left = timerUi.until - now;
    if (left > 0) {
      const key = String(Math.ceil(left / 1000));
      if (key !== timerUi.shown) { timerUi.shown = key; drawTimer(left); }
      return;
    }
    if (!timerUi.doneAt) {
      timerUi.doneAt = now;
      drawTimer(0);
      notice("Time's up: your " + timerUi.words + " timer.", 12000);
      api.speak?.("Time's up! Your " + timerUi.words + " timer is done.");
    } else if (now - timerUi.doneAt > 15000) timerStop();
  }

  // ---- breathing with the orb ------------------------------------------------------------
  // In for 4 seconds as the orb grows, hold for 4, out for 6 as it shrinks.
  const BREATH = [["Breathe in…", 4000], ["Hold…", 4000], ["Breathe out…", 6000]];
  const breath = { on: false, t0: 0, rounds: 0, phase: -1, grow: 0 };
  function breathe(rounds = 4) {
    Object.assign(breath, { on: true, t0: performance.now(), rounds, phase: -1 });
  }
  function breatheStop(said) {
    if (!breath.on) return;
    breath.on = false;
    view.reply = said || "";
    drawCaption();
  }
  function breathTick(now) {
    if (!breath.on) { breath.grow += (0 - breath.grow) * 0.08; return; }
    const cycle = 14000, t = now - breath.t0, round = Math.floor(t / cycle);
    if (round >= breath.rounds) { breatheStop("Nicely done. How do you feel?"); api.speak?.("Nicely done. How do you feel?"); return; }
    let at = t % cycle, phase = 0;
    while (at > BREATH[phase][1]) { at -= BREATH[phase][1]; phase++; }
    const k = at / BREATH[phase][1], ease = (x) => 0.5 - Math.cos(Math.PI * x) / 2;
    breath.grow = phase === 0 ? ease(k) : phase === 1 ? 1 : 1 - ease(k);
    const key = round * 3 + phase;
    if (key !== breath.phase) { breath.phase = key; view.reply = BREATH[phase][0] + "  " + (round + 1) + " of " + breath.rounds; view.stage = ""; drawCaption(); }
  }

  const holoTmp = new Vector3();
  function holoTick(dt, now) {
    if (!holoUi.open) return;
    projTick(dt, now);
    holoTime.value = now / 1000;
    if (holoUi.building) { holoUi.building.rotation.y += dt * 1.4; holoUi.building.rotation.x = 0.5; return; }
    if (holoUi.spec?.kind === "sketch") { sketchTick(dt, now); return; }
    const age = now - holoUi.t0;
    for (const n of holoUi.nodes) {
      // In one by one, then the parts that circle another go round it.
      const k = calm ? 1 : Math.max(0, Math.min(1, (age - n.i * 110) / 520));
      n.shown = calm ? 1 : 1 - (1 - k) ** 3;
      if (n.parent) {
        if (!calm) n.angle += dt * n.speed;
        holoTmp.set(Math.cos(n.angle) * n.orbitR, Math.sin(n.angle) * n.orbitR * 0.22, Math.sin(n.angle) * n.orbitR * 0.85);
        n.g.position.copy(n.parent.g.position).add(holoTmp);
        n.ring.position.copy(n.parent.g.position);
      } else if (!calm) {
        n.g.position.set(n.base.x, n.base.y + Math.sin(now / 1400 + n.i) * 0.004, n.base.z);
      }
      const want = holoUi.focus ? (holoUi.focus.has(n.i) ? 1.18 : 0.32) : n.hot ? 1.1 : 1;
      n.emph += (want - n.emph) * Math.min(1, dt * 6);
      const lit = Math.min(1, n.emph);
      n.g.scale.setScalar(Math.max(0.001, n.shown * (n.emph > 1 ? n.emph : 1)));
      if (n.mat.uniforms) n.mat.uniforms.opacity.value = 0.82 * lit;
      else n.mat.opacity = 0.82 * lit;
      if (n.shell) {
        n.shell.material.opacity = 0.3 * lit * (n.hot ? 1.6 : 1);
        if (!calm) { n.shell.rotation.y += dt * 0.5; n.shell.rotation.x += dt * 0.17; }
      }
      n.glow.material.opacity = 0.5 * lit * (n.hot ? 1.4 : 1);
      n.label.mesh.material.opacity = Math.max(0.25, lit);
    }
    const linkIn = calm ? 1 : Math.max(0, Math.min(1, (age - holoUi.nodes.length * 110) / 500));
    for (const l of holoUi.links) {
      if (!l.a) continue;
      const pos = l.line.geometry.attributes.position;
      pos.setXYZ(0, l.a.g.position.x, l.a.g.position.y, l.a.g.position.z);
      pos.setXYZ(1, l.b.g.position.x, l.b.g.position.y, l.b.g.position.z);
      pos.needsUpdate = true;
      const lit = holoUi.focus ? (holoUi.focus.has(l.a.i) && holoUi.focus.has(l.b.i) ? 0.7 : 0.12) : 0.45;
      l.line.material.opacity = lit * linkIn;
      if (l.pulse) {
        // Along the link, a pass every ~1.2 s: bright on the step being explained.
        const k = calm ? 0.5 : (now / 1200 + l.off) % 1;
        l.pulse.position.lerpVectors(l.a.g.position, l.b.g.position, k);
        const hot = holoUi.focus ? (lit > 0.5 ? 1 : 0.1) : 0.55;
        l.pulse.material.opacity = (calm ? 0.4 : Math.sin(Math.PI * k)) * hot * linkIn;
        l.pulse.scale.setScalar(holoUi.focus && lit > 0.5 ? 0.075 : 0.05);
      }
    }
  }

  /** A picture of the PC's screen as it shows now (for "what's on my screen?"), or null. */
  function pcFrame() {
    if (!pcUi.open || !pcUi.live) return null;
    const s = pcUi.screen;
    const scale = Math.min(1, 1600 / Math.max(s.w, s.h));
    const c = document.createElement("canvas");
    c.width = Math.max(1, Math.round(s.w * scale)); c.height = Math.max(1, Math.round(s.h * scale));
    c.getContext("2d").drawImage(s.canvas, 0, 0, c.width, c.height);
    const url = c.toDataURL("image/jpeg", 0.85);
    return { b64: url.slice(url.indexOf(",") + 1), url, w: c.width, h: c.height };
  }

  // ---- pinned answers -------------------------------------------------------------
  const pinned = [];
  function dropCard(item) {
    unui(item.c.mesh); unui(item.x.mesh);
    scene.remove(item.group);
    for (const k of [item.c, item.x]) { k.tex.dispose(); k.mesh.geometry.dispose(); k.mesh.material.dispose(); }
    const i = pinned.indexOf(item);
    if (i >= 0) pinned.splice(i, 1);
  }
  function pin(text, at, restoring = false, ask = "") {
    if (!restoring) {
      const list = api.notes.add(text, ask);
      at = list[list.length - 1]?.at ?? Date.now();
      // Only the newest eight are kept: the card of one that dropped out goes too.
      const kept = new Set(list.map((n) => n.at));
      for (const old of [...pinned]) if (!kept.has(old.at)) dropCard(old);
    }
    const group = new Group();
    const c = card(0.3, 0.19);
    const x = card(0.04, 0.04);
    {
      const { ctx, w, h } = c;
      glass(ctx, w, h, 44);
      icon(ctx, "pin", 62, 66, 34, INK2, 7);
      // What you asked, so you know which chat a tap takes you back to.
      ctx.font = `600 28px ${DISPLAY}`;
      write(ctx, ask ? ellipsize(ctx, "Pinned · " + ask, w - 140) : "Pinned", 88, 76, 28, INK2, 600, "left", DISPLAY, "0.02em");
      const measure = (s, size) => { ctx.font = `500 ${size}px ${FONT}`; return ctx.measureText(s).width; };
      const fit = util.fitLines(text, w - 96, 6, 34, 22, measure);
      let y = 92;
      for (const line of fit.lines) write(ctx, line, 48, (y += fit.size * 1.32), fit.size, INK, 500);
      c.update();
      roundButton(x, "close");
    }
    x.mesh.position.set(0.135, 0.08, 0.004);
    group.add(c.mesh, x.mesh);
    scene.add(group);
    // Its own place round you: the first free one, so a new note never lands on another.
    const used = new Set(pinned.map((n) => n.slot));
    let slot = 0;
    while (used.has(slot)) slot++;
    const item = { group, c, x, at, text, slot };
    pinned.push(item);
    // A tap goes back into that conversation (older pins without a question just read out).
    ui(c.mesh, { tap: () => (api.resume ? api.resume({ text, ask }) : api.speak(text)), drag: () => group });
    ui(x.mesh, { tap: () => { dropCard(item); api.notes.remove(at); } });
    if (placed) placeNote(item);
    else group.visible = false;
  }
  function placeNote(item) {
    const i = item.slot;
    // Round to your right (past where a photo opens), fanning round you.
    const a = headYaw - 1.1 - (i % 4) * 0.42, d = 0.95, row = Math.floor(i / 4);
    item.group.position.set(headPos.x - Math.sin(a) * d, headPos.y - 0.05 + row * 0.24 - (i % 2) * 0.05, headPos.z - Math.cos(a) * d);
    faceHead(item.group);
    item.group.visible = true;
  }

  // ---- placing and following ------------------------------------------------------
  let placed = false;
  function readHead() {
    const cam = flat ? camera : renderer.xr.getCamera();
    headPos.setFromMatrixPosition(cam.matrixWorld);
    q.setFromRotationMatrix(cam.matrixWorld);
    headDir.set(0, 0, -1).applyQuaternion(q);
    if (Math.hypot(headDir.x, headDir.z) > 0.15) headYaw = Math.atan2(-headDir.x, -headDir.z);
  }
  function placeRig() {
    const d = 0.75;
    rig.position.set(headPos.x - Math.sin(headYaw) * d, headPos.y - 0.1, headPos.z - Math.cos(headYaw) * d);
    faceHead(rig);
    rig.visible = true;
    placed = true;
    born = performance.now();
    pinned.forEach(placeNote);
  }
  // (born, calm, easeOut and faded are declared with fadeIn, near the top.)
  function entrance(now) {
    if (!born || faded) return;
    const e = calm ? 1 : easeOut((now - born) / 1100);
    const panels = calm ? 1 : easeOut((now - born - 350) / 600);
    orb.scale.multiplyScalar(0.3 + 0.7 * e);
    haloMat.opacity += (1 - e) * 0.45;
    const r = calm ? 1 : Math.min(1, (now - born) / 1500);
    bloom.visible = r < 1;
    if (r < 1) { bloomMat.opacity = 0.8 * (1 - r) * (1 - r); bloom.scale.setScalar(0.9 + easeOut(r) * 1.6); }
    for (const m of fadeIn) m.opacity = panels;
    if (e >= 1 && panels >= 1 && r >= 1) faded = true;
  }
  let goal = null;
  function follow(dt) {
    if (pointers.some((p) => p.press?.drag === rig)) { goal = null; return; }
    // Put somewhere (by you, or aside for the PC): it stays, but still finishes a move.
    if (!rig.userData.placed) {
      const want = util.followTarget({ x: headPos.x, y: headPos.y, z: headPos.z, yaw: headYaw }, rig.position);
      if (want) goal = want;
    }
    if (goal) {
      const k = 1 - Math.exp(-dt * 2.6);
      rig.position.x += (goal.x - rig.position.x) * k;
      rig.position.y += (goal.y - rig.position.y) * k;
      rig.position.z += (goal.z - rig.position.z) * k;
      if (Math.hypot(goal.x - rig.position.x, goal.y - rig.position.y, goal.z - rig.position.z) < 0.02) goal = null;
    }
    faceHead(rig);
  }
  function comeHere() { rig.userData.placed = false; goal = { x: headPos.x - Math.sin(headYaw) * 0.75, y: headPos.y - 0.1, z: headPos.z - Math.cos(headYaw) * 0.75 }; }

  // ---- the orb, alive ---------------------------------------------------------------
  const HALO = { listening: 0x5eead4, thinking: 0xa78bfa, speaking: 0xf472b6 };
  function orbTick(dt, t) {
    let target = 0.06 + Math.sin(t * 1.4) * 0.02;
    if (view.state === "listening") target = Math.max(0.12, view.mic);
    else if (view.state === "thinking") target = 0.28;
    else if (view.state === "speaking") target = 0.34 + 0.36 * Math.abs(Math.sin(t * 7.3) * Math.sin(t * 3.1 + 1));
    view.energy += (target - view.energy) * Math.min(1, dt * 8);
    view.think += ((view.state === "thinking" ? 1 : 0) - view.think) * Math.min(1, dt * 3);
    orbMat.uniforms.uTime.value = t;
    orbMat.uniforms.uEnergy.value = view.energy;
    orbMat.uniforms.uThink.value = view.think;
    const s = (1 + Math.sin(t * 1.7) * 0.012 + view.energy * 0.1) * (view.hovered ? 1.06 : 1) * (1 + breath.grow * 0.45);
    orb.scale.setScalar(s);
    // The orb's own light: quiet at rest, rising with a voice.
    haloMat.opacity = 0.1 + view.energy * 0.36;
    haloMat.color.setHex(HALO[view.state] || haloIdle);
    halo.scale.setScalar(0.4 + view.energy * 0.12);
    const ringOn = view.state === "listening" || view.state === "thinking";
    ringMat.opacity += ((ringOn ? 0.6 : 0) - ringMat.opacity) * Math.min(1, dt * 6);
    ringMat.color.setHex(HALO[view.state] || 0x5eead4);
    ring.rotation.z -= dt * (view.state === "thinking" ? 4 : 0.8);
    ring.scale.setScalar(1 + (view.state === "listening" ? view.mic * 0.25 : 0));
    voiceBarsTick(dt, t);
  }

  // Voice bars either side of the orb while it listens (the owner missed them
  // when talking by button): they jump with your voice, tallest nearest the orb.
  const voiceBars = (() => {
    const geo = track(new PlaneGeometry(0.008, 1));
    const mat = track(new MeshBasicMaterial({ color: 0x5eead4, transparent: true, opacity: 0, depthWrite: false, blending: AdditiveBlending }));
    const bars = [];
    for (const side of [-1, 1]) for (let k = 0; k < 4; k++) {
      const m = new Mesh(geo, mat);
      m.position.set(side * (0.142 + k * 0.016), 0, 0.01);
      m.userData = { k, phase: Math.random() * 6, h: 0.004 };
      m.scale.y = 0.004;
      rig.add(m);
      bars.push(m);
    }
    return { bars, mat };
  })();
  function voiceBarsTick(dt, t) {
    const on = view.state === "listening";
    voiceBars.mat.opacity += ((on ? 0.9 : 0) - voiceBars.mat.opacity) * Math.min(1, dt * 8);
    if (voiceBars.mat.opacity < 0.01) return;
    for (const m of voiceBars.bars) {
      const { k, phase } = m.userData;
      // Louder voice, taller bars; a little life of their own so they never sit flat.
      const wobble = calm ? 0.6 : 0.55 + 0.45 * Math.abs(Math.sin(t * (7 + k * 1.7) + phase));
      const want = on ? 0.006 + view.mic * 0.07 * (1 - k * 0.18) * wobble : 0.004;
      m.userData.h += (want - m.userData.h) * Math.min(1, dt * 14);
      m.scale.y = Math.max(0.004, m.userData.h);
    }
  }

  // The Talk button says what a tap does now; End call shows during a call.
  function syncButtons() {
    const st = view.state;
    if (st === "listening") talkB.set("done", "Done");
    else if (st === "speaking") talkB.set("quiet", "Quiet");
    else if (st === "thinking") talkB.set("think", "Working");
    else talkB.set("mic", "Talk");
    const calling = !!api.calling?.();
    if (calling !== endB.shown) { endB.shown = calling; layoutButtons(); }
    // What's open shows on its button.
    photosB.setOn(filesUi.open);
    pcB.setOn(pcUi.open);
    // The suggestions wait for a brain (a key) and step aside while Izuki thinks
    // or talks. A hands-free call listens all the time in the headset, so they
    // show while it listens too; the first conversation sends them away.
    const tips = firstVisit && (st === "" || st === "listening") && !!api.ready?.();
    for (const k of chips) k.c.mesh.visible = tips;
  }

  // ---- the loop -----------------------------------------------------------------------
  let last = performance.now(), clock = 0, frames = 0, stopped = false, buttonsAt = 0;
  const gp = new Map();
  renderer.setAnimationLoop(() => {
    const now = performance.now();
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now; clock += dt; frames++;
    if (flat) { camera.rotation.set(pitch, yaw, 0, "YXZ"); camera.updateMatrixWorld(); }
    readHead();
    if (!placed && frames > 3) placeRig();
    if (placed) follow(dt);
    orbTick(dt, clock);
    entrance(now);
    holoTick(dt, now);
    dreamTick(dt, now);
    timerTick(now);
    breathTick(now);

    for (const p of pointers) {
      if (!aim(p)) continue;
      const hit = p.hit;
      const u = hit?.object.userData.ui || null;
      if (u !== p.hover) {
        p.hover?.hover?.(false);
        u?.hover?.(true);
        if (u) buzz(p, 0.12, 10);
        p.hover = u;
      }
      p.dot.visible = !!hit;
      if (hit) { p.dot.position.copy(hit.point).addScaledVector(p.dir, -0.003); p.dot.lookAt(p.origin); }
      if (p.line) p.line.scale.z = hit ? hit.distance : 1.2;
      const pr = p.press;
      if (pr?.direct) {
        grabPoint(p, grabAt);
        if (!pr.moved && grabAt.distanceTo(pr.start) > 0.012) pr.moved = true;
        if (pr.moved) { pr.drag.position.copy(grabAt).add(pr.offset); faceHead(pr.drag); }
      } else if (pr?.drag) {
        const pt = p.origin.clone().addScaledVector(p.dir, pr.dist);
        if (!pr.moved && pt.distanceTo(pr.start) > 0.03) pr.moved = true;
        if (pr.moved) { pr.drag.position.copy(pt).add(pr.offset); faceHead(pr.drag); }
      }
      // Controllers: thumbstick scrolls what you point at; A/X talks; B/Y calls the orb back.
      const pad = p.source?.gamepad;
      if (pad) {
        const y = pad.axes[3] ?? 0;
        if (Math.abs(y) > 0.45 && u?.scroll && now - p.scrollAt > 140) { u.scroll(Math.sign(y) * (Math.abs(y) > 0.85 ? 3 : 1)); p.scrollAt = now; }
        const was = gp.get(p) || [];
        const a = !!pad.buttons[4]?.pressed, b = !!pad.buttons[5]?.pressed;
        // A/X: a tap talks (or finishes); held, it's hold-to-talk: listening
        // while you hold it, sent when you let go.
        if (a && !was[0]) holdDown(p);
        if (!a && was[0]) holdUp(p, now - (p.holdAt || now));
        if (b && !was[1]) comeHere();
        gp.set(p, [a, b]);
      }
    }

    if (handDots) {
      for (let i = 0; i < 2; i++) {
        const hand = renderer.xr.getHand(i);
        for (const j of Object.values(hand.joints || {})) {
          if (!j.userData.dot) { const m = new Mesh(handDots.jointGeo, handDots.jointMat); j.add(m); j.userData.dot = m; }
        }
      }
    }

    if (lookUi.anim) {
      const p = (now - lookUi.t0) / (650 * Math.max(1, lookUi.marks.length));
      drawLookPhoto(Math.min(1, p));
      if (p >= 1) lookUi.anim = false;
    }
    for (let i = rings.length - 1; i >= 0; i--) {
      const r = rings[i], k = (now - r.t0) / 350;
      r.m.scale.setScalar(1 + k * 1.6);
      r.m.material.opacity = Math.max(0, 0.9 * (1 - k));
      if (k >= 1) { scene.remove(r.m); r.m.material.dispose(); rings.splice(i, 1); }
    }
    if (now - buttonsAt > 200) { buttonsAt = now; syncButtons(); }
    renderer.render(scene, camera);
  });

  // ---- a normal screen: a few words on how to drive it ----------------------------
  let overlay = null;
  if (flat) {
    spokenReady = true;
    overlay = document.createElement("div");
    overlay.setAttribute("role", "status");
    // One row when it fits; on a narrow screen the buttons wrap under the words.
    Object.assign(overlay.style, { position: "fixed", top: "max(12px, env(safe-area-inset-top))", left: "50%", transform: "translateX(-50%)", zIndex: "2147483001", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "8px 10px", alignItems: "center", padding: "8px 8px 8px 16px", borderRadius: "24px", background: "rgba(18,20,27,.9)", color: INK, font: `500 14px ${FONT}`, border: "1px solid rgba(255,255,255,.14)", width: "max-content", maxWidth: "calc(100vw - 32px)", boxSizing: "border-box" });
    const words = document.createElement("span");
    words.textContent = "3D preview · click the orb to talk, drag to look";
    Object.assign(words.style, { color: INK2, textAlign: "center", flex: "1 1 auto" });
    // The same actions as the 3D buttons, reachable with the keyboard too.
    const domButton = (label, act) => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = label;
      Object.assign(b.style, { font: `600 14px ${FONT}`, color: INK, background: "rgba(255,255,255,.1)", border: "1px solid rgba(255,255,255,.12)", borderRadius: "999px", padding: "8px 14px", cursor: "pointer", whiteSpace: "nowrap" });
      b.onclick = act;
      return b;
    };
    overlay.append(words, domButton("Talk", () => api.tapOrb()), domButton("Photos", togglePhotos), domButton("My PC", togglePc), domButton("Pin", pinLast), domButton("Style", restyle), domButton("Leave", () => stop()));
    // What the canvas says (Izuki's words, a photo's answer), for screen readers.
    spoken = document.createElement("span");
    spoken.setAttribute("aria-live", "polite");
    Object.assign(spoken.style, { position: "absolute", width: "1px", height: "1px", overflow: "hidden", clip: "rect(0 0 0 0)", whiteSpace: "nowrap" });
    overlay.append(spoken);
    document.body.appendChild(overlay);
  } else {
    on(session, "end", () => stop());
  }

  function stop() {
    if (stopped) return;
    stopped = true;
    pcClose();
    filesClose();
    webClose();
    holoClose();
    dreamClose();
    clearTimeout(noticeTimer);
    renderer.setAnimationLoop(null);
    if (!flat) { try { session.end(); } catch {} }
    for (const off of cleanups) { try { off(); } catch {} }
    overlay?.remove();
    canvas.remove();
    scene.traverse((o) => { o.geometry?.dispose?.(); const m = o.material; if (m) for (const x of Array.isArray(m) ? m : [m]) { x.map?.dispose?.(); x.dispose?.(); } });
    for (const d of disposables) { try { d.dispose?.(); } catch {} }
    renderer.dispose();
    api.exited();
  }

  drawCaption();
  drawBar();

  // ---- what the app tells the room ------------------------------------------------------
  return {
    orb(m) {
      const st = m || "";
      if (st === view.state) return;
      view.state = st;
      if (st === "listening") { view.hint = ""; view.stage = ""; }
      if (st === "") view.stage = "";
      drawCaption();
      syncButtons();
    },
    heard(t) { const s = String(t || ""); if (s === view.you) return; view.you = s; if (s && s !== "…") view.reply = ""; view.hint = ""; drawCaption(); },
    said(t) { const s = String(t || ""); if (!s || s === view.reply) return; view.reply = s; view.stage = ""; drawCaption(); },
    line(who, t, opts) {
      const s = String(t || "");
      if (!s) return;
      if (who === "me") { view.you = s; view.reply = ""; view.hint = ""; if (firstVisit) hideChips(); }
      else if (who === "izuki") { if (opts?.thinking) view.stage = s; else { view.reply = s; view.stage = ""; } }
      drawCaption();
    },
    level(v) { view.mic = Math.max(0, Math.min(1, Number(v) || 0)); },
    showLook,
    lookShown: () => lookUi.group.visible,
    pin,
    comeHere,
    pcOpen,
    /** The PC the panel shows (null when it's closed). */
    pcTarget: () => (pcUi.open ? pcUi.target : null),
    pcClose,
    pcShown: () => pcUi.open,
    pcFrame,
    filesOpen,
    filesClose,
    webSearch,
    webClose,
    webShown: () => webUi.open,
    holoBuilding,
    holoShow,
    holoFocus,
    holoClose,
    holoShown: () => holoUi.open,
    dreamShow,
    dreamClose,
    dreamShown: () => !!dreamUi.group,
    timerStart,
    timerStop,
    breathe,
    breatheStop: () => breatheStop(""),
    nextTheme,
    notice,
    stop,
  };
}

// The space for headsets without passthrough (and the 3D preview), coloured by
// the theme (set): a dark sky with a soft glow along the horizon, a few faint
// stars, and fine rings on the floor around you (a quiet sense of space and
// scale, not decoration).
function addSpace(scene, floorY) {
  const skyU = {
    uLow: { value: new Color() }, uMid: { value: new Color() }, uTop: { value: new Color() },
    uBand: { value: new Color() }, uBandAmt: { value: 0 },
  };
  const sky = new Mesh(new SphereGeometry(40, 48, 24), new ShaderMaterial({
    side: BackSide, depthWrite: false, uniforms: skyU,
    vertexShader: "varying vec3 vW; void main(){ vW = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
    fragmentShader: `varying vec3 vW;
      uniform vec3 uLow; uniform vec3 uMid; uniform vec3 uTop; uniform vec3 uBand; uniform float uBandAmt;
      void main(){
        float h = vW.y;
        vec3 c = h < 0.0 ? mix(uMid, uLow, clamp(-h * 2.5, 0.0, 1.0)) : mix(uMid, uTop, clamp(h * 1.6, 0.0, 1.0));
        // The horizon glow: brightest at eye level, fading up and down.
        c += uBand * exp(-abs(h) * 7.0) * uBandAmt;
        gl_FragColor = vec4(c, 1.0);
      }`,
  }));
  sky.renderOrder = -10;
  scene.add(sky);

  const n = 320, pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const u = Math.random() * Math.PI * 2, v = Math.random() * 0.85 + 0.12;
    const r = 30;
    pos[i * 3] = Math.cos(u) * Math.sqrt(1 - v * v) * r;
    pos[i * 3 + 1] = v * r;
    pos[i * 3 + 2] = Math.sin(u) * Math.sqrt(1 - v * v) * r;
  }
  const stars = new Points(new BufferGeometry().setAttribute("position", new Float32BufferAttribute(pos, 3)), new PointsMaterial({ color: 0xdfe8f5, size: 0.05, transparent: true, opacity: 0.5, depthWrite: false }));
  scene.add(stars);

  // Rings every 40 cm out to 3.2 m, finer and fainter with distance, over a
  // faint pool of light under you. White; the theme tints them.
  const c = document.createElement("canvas");
  c.width = c.height = 2048;
  const x = c.getContext("2d");
  const mid = 1024, perM = 1024 / 3.2;
  const pool = x.createRadialGradient(mid, mid, 0, mid, mid, 1024);
  pool.addColorStop(0, "rgba(255,255,255,0.10)"); pool.addColorStop(0.5, "rgba(255,255,255,0.03)"); pool.addColorStop(1, "rgba(255,255,255,0)");
  x.fillStyle = pool; x.fillRect(0, 0, 2048, 2048);
  for (let m = 0.4; m <= 3.2 + 1e-6; m += 0.4) {
    const k = m / 3.2;
    x.beginPath(); x.arc(mid, mid, m * perM, 0, Math.PI * 2);
    x.lineWidth = 2.2 - k; x.strokeStyle = `rgba(255,255,255,${(0.34 * (1 - k) + 0.04).toFixed(3)})`; x.stroke();
  }
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  tex.anisotropy = ANISO;
  const floor = new Mesh(new CircleGeometry(3.2, 128), new MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = floorY;
  scene.add(floor);
  return {
    set(t) {
      skyU.uLow.value.setRGB(...t.low); skyU.uMid.value.setRGB(...t.mid); skyU.uTop.value.setRGB(...t.top);
      skyU.uBand.value.setRGB(...t.band); skyU.uBandAmt.value = t.bandAmt;
      stars.material.opacity = t.stars;
      stars.visible = t.stars > 0.02;
      floor.material.color.setRGB(...t.floor);
    },
  };
}

// Looks for the room, in order: the orb's three colours and, where you see a
// space rather than your room, its sky (low/mid/top), the horizon glow, stars
// and the floor's tint. Calm, dark and low in saturation: the orb carries the
// colour. Picked with the Style button or "change your look".
const THEMES = [
  { name: "Nova", orb: [[0.18, 0.83, 0.75], [0.55, 0.36, 0.96], [0.96, 0.45, 0.71]], halo: 0x7dd3fc,
    low: [0.008, 0.01, 0.014], mid: [0.03, 0.036, 0.05], top: [0.012, 0.014, 0.022], band: [0.08, 0.2, 0.2], bandAmt: 0.55, stars: 0.5, floor: [0.6, 1, 0.95] },
  { name: "Midnight", orb: [[0.25, 0.5, 1.0], [0.4, 0.75, 1.0], [0.75, 0.85, 1.0]], halo: 0x93c5fd,
    low: [0.006, 0.01, 0.02], mid: [0.02, 0.04, 0.08], top: [0.008, 0.014, 0.03], band: [0.1, 0.16, 0.32], bandAmt: 0.6, stars: 0.6, floor: [0.7, 0.82, 1] },
  { name: "Aurora", orb: [[0.25, 0.92, 0.6], [0.2, 0.75, 0.9], [0.55, 0.45, 0.95]], halo: 0x6ee7b7,
    low: [0.006, 0.012, 0.012], mid: [0.02, 0.045, 0.045], top: [0.01, 0.018, 0.022], band: [0.08, 0.3, 0.18], bandAmt: 0.7, stars: 0.5, floor: [0.6, 1, 0.8] },
  { name: "Dawn", orb: [[1.0, 0.7, 0.52], [0.92, 0.55, 0.62], [1.0, 0.86, 0.66]], halo: 0xfed7aa,
    low: [0.012, 0.009, 0.01], mid: [0.06, 0.04, 0.045], top: [0.02, 0.016, 0.026], band: [0.32, 0.16, 0.1], bandAmt: 0.55, stars: 0.2, floor: [1, 0.85, 0.75] },
  { name: "Pearl", light: true, orb: [[0.86, 0.88, 0.96], [0.7, 0.76, 0.92], [0.94, 0.88, 0.92]], halo: 0xe2e8f0,
    low: [0.42, 0.44, 0.48], mid: [0.66, 0.68, 0.73], top: [0.8, 0.81, 0.85], band: [0.06, 0.06, 0.07], bandAmt: 0.4, stars: 0, floor: [0.2, 0.22, 0.28] },
];
