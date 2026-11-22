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
  AdditiveBlending, BackSide, BufferGeometry, CanvasTexture, CircleGeometry, Color, Float32BufferAttribute,
  Group, Line, LineBasicMaterial, Mesh, MeshBasicMaterial, PerspectiveCamera, PlaneGeometry, Points, PointsMaterial,
  Quaternion, Raycaster, RingGeometry, Scene, ShaderMaterial, SphereGeometry, Sprite, SpriteMaterial, SRGBColorSpace,
  TorusGeometry, Vector2, Vector3, WebGLRenderer,
} from "three";

const FONT = `"Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`;
const TEAL = "#5eead4", VIOLET = "#a78bfa", PINK = "#f472b6";
const LABEL = { listening: "Listening…", thinking: "Thinking…", speaking: "Izuki" };

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
function card(wM, hM, px = 2000) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(8, Math.round(wM * px));
  canvas.height = Math.max(8, Math.round(hM * px));
  const ctx = canvas.getContext("2d");
  const tex = new CanvasTexture(canvas);
  tex.colorSpace = SRGBColorSpace;
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

/** The glass every card shares: deep navy, a teal-violet-pink rim. */
function glass(ctx, w, h, r, opts = {}) {
  ctx.clearRect(0, 0, w, h);
  const pad = Math.max(2, h * 0.012);
  rr(ctx, pad, pad, w - pad * 2, h - pad * 2, r);
  ctx.fillStyle = opts.fill || "rgba(10, 13, 30, 0.86)";
  ctx.fill();
  if (opts.rim !== false) {
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, opts.hot ? "rgba(94,234,212,1)" : "rgba(94,234,212,.7)");
    g.addColorStop(0.55, opts.hot ? "rgba(167,139,250,1)" : "rgba(167,139,250,.55)");
    g.addColorStop(1, opts.hot ? "rgba(244,114,182,1)" : "rgba(244,114,182,.55)");
    ctx.strokeStyle = g;
    ctx.lineWidth = pad * (opts.hot ? 1.6 : 1);
    ctx.stroke();
  }
}

function write(ctx, s, x, y, size, color, weight = 500, align = "left") {
  ctx.font = `${weight} ${size}px ${FONT}`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = "alphabetic";
  ctx.fillText(s, x, y);
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

// Icons, drawn into a 100×100 box.
const ICONS = {
  mic(x) { x.beginPath(); x.roundRect ? x.roundRect(38, 18, 24, 42, 12) : rr(x, 38, 18, 24, 42, 12); x.stroke(); x.beginPath(); x.arc(50, 50, 22, 0.15 * Math.PI, 0.85 * Math.PI); x.stroke(); x.beginPath(); x.moveTo(50, 72); x.lineTo(50, 84); x.moveTo(38, 84); x.lineTo(62, 84); x.stroke(); },
  done(x) { x.beginPath(); x.moveTo(26, 52); x.lineTo(43, 69); x.lineTo(75, 34); x.stroke(); },
  quiet(x) { x.beginPath(); rr(x, 33, 33, 34, 34, 6); x.fill(); },
  end(x) { x.beginPath(); x.moveTo(18, 58); x.quadraticCurveTo(50, 30, 82, 58); x.lineTo(74, 68); x.lineTo(62, 60); x.lineTo(62, 52); x.quadraticCurveTo(50, 46, 38, 52); x.lineTo(38, 60); x.lineTo(26, 68); x.closePath(); x.fill(); },
  eye(x) { x.beginPath(); x.moveTo(14, 50); x.quadraticCurveTo(50, 14, 86, 50); x.quadraticCurveTo(50, 86, 14, 50); x.stroke(); x.beginPath(); x.arc(50, 50, 12, 0, Math.PI * 2); x.stroke(); },
  pc(x) { x.beginPath(); rr(x, 16, 22, 68, 44, 6); x.stroke(); x.beginPath(); x.moveTo(36, 82); x.lineTo(64, 82); x.moveTo(50, 66); x.lineTo(50, 82); x.stroke(); },
  pin(x) { x.beginPath(); x.moveTo(50, 86); x.lineTo(50, 60); x.stroke(); x.beginPath(); x.moveTo(30, 60); x.lineTo(70, 60); x.lineTo(62, 44); x.lineTo(62, 22); x.lineTo(38, 22); x.lineTo(38, 44); x.closePath(); x.stroke(); },
  leave(x) { x.beginPath(); x.moveTo(30, 30); x.lineTo(70, 70); x.moveTo(70, 30); x.lineTo(30, 70); x.stroke(); },
  think(x) { for (let i = 0; i < 3; i++) { x.beginPath(); x.arc(30 + i * 20, 50, 6, 0, Math.PI * 2); x.fill(); } },
};

// ---------------------------------------------------------------------------
export async function start({ mode, session, api, tint }) {
  const flat = mode === "flat";
  const passthrough = mode === "immersive-ar";
  const util = api.util;

  const renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.setPixelRatio(flat ? Math.min(2, window.devicePixelRatio || 1) : 1);
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

  // ---- the palette: IZUKI NOVA, leaning to the person's own orb colour --------
  const base = { a: new Color(0.18, 0.83, 0.75), b: new Color(0.55, 0.36, 0.96), c: new Color(0.96, 0.45, 0.71) };
  if (tint) {
    const h = parseInt(tint.slice(1), 16);
    const t = new Color(((h >> 16) & 255) / 255, ((h >> 8) & 255) / 255, (h & 255) / 255);
    base.a.lerp(t, 0.6); base.b.lerp(t, 0.35); base.c.lerp(t, 0.45);
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
  rig.add(halo, orb, ring);

  const caption = card(0.56, 0.19);
  caption.mesh.position.set(0, -0.2, 0.01);
  rig.add(caption.mesh);
  track(caption.tex); track(caption.mesh.material); track(caption.mesh.geometry);

  const view = {
    state: "", you: "", reply: "", stage: "", mic: 0, energy: 0, think: 0, hovered: false,
    hint: flat ? "Click the orb to talk. Drag to look around." : "Point at the orb and pull the trigger (or pinch) to talk.",
  };

  function drawCaption() {
    const { ctx, w, h } = caption;
    glass(ctx, w, h, 44);
    const padX = 40;
    const label = LABEL[view.state] || (view.stage ? view.stage : view.you || view.reply ? "Izuki" : "IZUKI NOVA");
    write(ctx, label, padX, 62, 32, TEAL, 650);
    let y = 62;
    if (view.you) {
      ctx.font = `400 32px ${FONT}`;
      write(ctx, ellipsize(ctx, "You: " + view.you, w - padX * 2), padX, (y += 50), 32, "#aab6d6", 400);
    }
    const body = view.reply || (!view.you ? view.hint : "");
    if (body) {
      const room = h - y - 30;
      const measure = (s, size) => { ctx.font = `500 ${size}px ${FONT}`; return ctx.measureText(s).width; };
      const maxLines = Math.max(1, Math.floor(room / (30 * 1.28)));
      const fit = util.fitLines(body, w - padX * 2, Math.min(maxLines, 5), 48, 30, measure);
      const lh = fit.size * 1.28;
      y += 14;
      for (const line of fit.lines) write(ctx, line, padX, (y += lh), fit.size, view.reply ? "#ffffff" : "#d6def5", 500);
    }
    caption.update();
  }

  // Buttons along the bottom.
  const buttons = [];
  function button(icon, label, onTap) {
    const c = card(0.088, 0.112, 2400);
    track(c.tex); track(c.mesh.material); track(c.mesh.geometry);
    const b = { c, icon, label, hot: false, shown: true };
    b.draw = () => {
      const { ctx, w, h } = c;
      ctx.clearRect(0, 0, w, h);
      const r = w * 0.4, cx = w / 2, cy = r + 8;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = b.hot ? "rgba(40, 52, 96, 0.95)" : "rgba(14, 18, 40, 0.9)";
      ctx.fill();
      const g = ctx.createLinearGradient(0, 0, w, w);
      g.addColorStop(0, TEAL); g.addColorStop(0.6, VIOLET); g.addColorStop(1, PINK);
      ctx.strokeStyle = g;
      ctx.lineWidth = b.hot ? 7 : 4;
      ctx.stroke();
      ctx.save();
      const s = (r * 1.15) / 100;
      ctx.translate(cx - 50 * s, cy - 50 * s);
      ctx.scale(s, s);
      ctx.strokeStyle = "#ffffff"; ctx.fillStyle = "#ffffff";
      ctx.lineWidth = 7; ctx.lineCap = "round"; ctx.lineJoin = "round";
      ICONS[b.icon]?.(ctx);
      ctx.restore();
      write(ctx, b.label, cx, h - 12, 34, "#e6ecff", 600, "center");
      c.update();
    };
    b.set = (icon, label) => { if (icon === b.icon && label === b.label) return; b.icon = icon; b.label = label; b.draw(); };
    b.draw();
    ui(c.mesh, { tap: onTap, hover: (on) => { b.hot = on; b.draw(); c.mesh.scale.setScalar(on ? 1.08 : 1); } });
    rig.add(c.mesh);
    buttons.push(b);
    return b;
  }
  function layoutButtons() {
    const shown = buttons.filter((b) => b.shown);
    shown.forEach((b, i) => { b.c.mesh.visible = true; b.c.mesh.position.set((i - (shown.length - 1) / 2) * 0.1, -0.375, 0.02); });
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
    p.press = { u, obj: p.hit.object, hit: p.hit, drag, grabOnly, dist: p.hit.distance, start: p.hit.point.clone(), offset: drag ? drag.position.clone().sub(p.hit.point) : null, moved: false };
    buzz(p, 0.35, 20);
  }
  /** completed: the press really finished (a headset can cancel one, e.g. when tracking drops). */
  function release(p, completed = true) {
    const pr = p.press;
    p.press = null;
    if (!pr) return;
    if (pr.moved) { pr.u.dropped?.(); return; }
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
      on(ctrl, "connected", (e) => { p.source = e.data; p.line.visible = true; });
      on(ctrl, "disconnected", () => { p.source = null; p.line.visible = false; p.dot.visible = false; p.press = null; });
      // Aim again at each event: the hit from the last frame may be stale.
      on(ctrl, "selectstart", () => { p.selected = false; aim(p); press(p); });
      on(ctrl, "select", () => { p.selected = true; });
      on(ctrl, "selectend", () => { aim(p); release(p, p.selected); p.selected = false; });
      on(ctrl, "squeezestart", () => { aim(p); press(p, true); });
      on(ctrl, "squeezeend", () => release(p, false));
    }
    if (!passthrough) {
      // In a virtual space your hands would be invisible: show their joints.
      const jointGeo = track(new SphereGeometry(0.006, 8, 6));
      const jointMat = track(new MeshBasicMaterial({ color: 0xcdeffd, transparent: true, opacity: 0.85 }));
      for (let i = 0; i < 2; i++) {
        const hand = renderer.xr.getHand(i);
        scene.add(hand);
        hand.userData.dots = true;
      }
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
      await renderer.xr.setSession(session);
      try { renderer.xr.setFoveation(1); } catch {}
    } catch (e) {
      // Couldn't go in: leave nothing behind (vr.js says why).
      for (const off of cleanups) { try { off(); } catch {} }
      canvas.remove();
      renderer.dispose();
      try { await session.end(); } catch {}
      throw e;
    }
  }
  if (!passthrough) addSpace(scene, floorY);

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

  // ---- the orb's own controls ---------------------------------------------------
  ui(orb, {
    tap: () => api.tapOrb(),
    drag: () => rig,
    dropped: () => { rig.userData.placed = true; },
    hover: (onIt) => { view.hovered = onIt; },
  });
  ui(caption.mesh, { drag: () => rig, dropped: () => { rig.userData.placed = true; } });

  const talkB = button("mic", "Talk", () => api.tapOrb());
  const endB = button("end", "End call", () => api.hangUp());
  const lookB = button("eye", "Look", () => { showLookWaiting(); api.look(); });
  const togglePc = () => { if (pcUi.open) pcClose(); else void pcOpen().then((why) => { if (why) api.speak(why); }); };
  const pinLast = () => { const t = api.lastReply(); if (t) pin(t); else api.speak("There's nothing to pin yet. Ask me something first."); };
  button("pc", "My PC", togglePc);
  button("pin", "Pin", pinLast);
  button("leave", "Leave", () => stop());
  endB.shown = false;
  lookB.shown = false;
  layoutButtons();
  void api.hasCamera().then((yes) => { lookB.shown = !!yes; layoutButtons(); });

  // ---- what Izuki looked at -----------------------------------------------------
  const lookUi = { group: new Group(), photo: null, text: card(0.5, 0.15), img: null, url: "", want: "", closed: "", seq: 0, marks: [], say: "", t0: 0, anim: false, close: card(0.05, 0.05) };
  // In the room, not on the orb: it opens in view, a little to your right, so
  // it doesn't cover the thing you're asking about. Carry it anywhere.
  lookUi.group.visible = false;
  scene.add(lookUi.group);
  ui(lookUi.text.mesh, { drag: () => lookUi.group });
  track(lookUi.text.tex); track(lookUi.close.tex);
  lookUi.group.add(lookUi.text.mesh, lookUi.close.mesh);
  {
    const { ctx, w, h } = lookUi.close;
    ctx.beginPath(); ctx.arc(w / 2, h / 2, w / 2 - 3, 0, Math.PI * 2); ctx.fillStyle = "rgba(14,18,40,.92)"; ctx.fill();
    ctx.strokeStyle = "#fff"; ctx.lineWidth = 7; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(w * 0.34, h * 0.34); ctx.lineTo(w * 0.66, h * 0.66); ctx.moveTo(w * 0.66, h * 0.34); ctx.lineTo(w * 0.34, h * 0.66); ctx.stroke();
    lookUi.close.update();
  }
  // Closed means closed: a photo still decoding, or this look's answer
  // arriving later, doesn't bring it back. A new look opens it again.
  ui(lookUi.close.mesh, { tap: () => { lookUi.seq++; lookUi.closed = lookUi.want; lookUi.group.visible = false; } });

  function drawLookText() {
    const { ctx, w, h } = lookUi.text;
    glass(ctx, w, h, 36);
    const measure = (s, size) => { ctx.font = `500 ${size}px ${FONT}`; return ctx.measureText(s).width; };
    const fit = util.fitLines(lookUi.say, w - 60, 4, 34, 22, measure);
    let y = 18;
    for (const line of fit.lines) write(ctx, line, 30, (y += fit.size * 1.28), fit.size, "#ffffff", 500);
    lookUi.text.update();
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
    lookUi.marks.forEach((m, i) => {
      const p = Math.max(0, Math.min(1, progress * n - i));
      if (p <= 0) return;
      const x = (m.x / 1000) * w, y = (m.y / 1000) * h, r = w * 0.065;
      ctx.save();
      ctx.shadowColor = TEAL; ctx.shadowBlur = 18;
      ctx.strokeStyle = TEAL; ctx.lineWidth = 7; ctx.lineCap = "round";
      ctx.beginPath(); ctx.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * p); ctx.stroke();
      ctx.restore();
      if (p > 0.85 && m.label) {
        ctx.font = `600 26px ${FONT}`;
        const tw = ctx.measureText(m.label).width;
        const lx = Math.min(w - tw - 36, Math.max(10, x - tw / 2 - 14)), ly = y + r + 12 > h - 46 ? y - r - 52 : y + r + 12;
        rr(ctx, lx, ly, tw + 28, 40, 20); ctx.fillStyle = "rgba(8,10,24,.82)"; ctx.fill();
        write(ctx, m.label, lx + 14, ly + 29, 26, "#ffffff", 600);
      }
    });
    ph.update();
  }
  function showLookWaiting() {
    if (!lookUi.group.visible) return;
    lookUi.say = "Looking…"; drawLookText();
  }
  async function showLook({ url, w, h, marks, say }) {
    if (url === lookUi.closed) return;
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
  const pcUi = { group: new Group(), open: false, live: false, gen: 0, err: "", clicks: Promise.resolve(), doing: "", busy: false, screen: null, bar: card(1.6, 0.09), handle: card(0.32, 0.035), aspect: 9 / 16 };
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
        pcUi.clicks = pcUi.clicks.then(async () => {
          if (!pcUi.open || my !== pcUi.gen) return;
          const r = await api.pc.send({ op: "point", nx, ny });
          if (r?.ok === false) { if (my === pcUi.gen) { pcUi.err = r.error || ""; drawBar(); } return; }
          await api.pc.send({ op: "click", button: "left" });
        }).catch(() => {});
      },
      scroll: (n) => { if (pcUi.live) void api.pc.send({ op: "scroll", dy: n }); },
    });
    return s;
  }
  makeScreen(1280, 720);
  pcUi.group.add(pcUi.bar.mesh, pcUi.handle.mesh);
  {
    const { ctx, w, h } = pcUi.handle;
    ctx.clearRect(0, 0, w, h);
    rr(ctx, 4, 4, w - 8, h - 8, (h - 8) / 2);
    ctx.fillStyle = "rgba(220,230,255,.55)"; ctx.fill();
    pcUi.handle.update();
  }
  ui(pcUi.handle.mesh, { drag: () => pcUi.group });

  function drawScreenMessage(text) {
    pcUi.live = false;
    const s = pcUi.screen, { ctx, w, h } = s;
    glass(ctx, w, h, 24);
    ctx.font = `500 ${Math.round(h * 0.05)}px ${FONT}`;
    const lines = util.wrapLines(text, w * 0.7, (t) => ctx.measureText(t).width);
    lines.forEach((l, i) => write(ctx, l, w / 2, h / 2 + (i - (lines.length - 1) / 2) * h * 0.075, Math.round(h * 0.05), "#e6ecff", 500, "center"));
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
    glass(ctx, w, h, 40);
    ctx.beginPath(); ctx.arc(60, h / 2, 14, 0, Math.PI * 2); ctx.fillStyle = pcUi.err ? "#fbbf24" : "#34d399"; ctx.fill();
    const line = pcUi.err || (pcUi.doing ? "Izuki: " + pcUi.doing : api.pc.name() + " · point and click, thumbstick to scroll");
    ctx.font = `500 64px ${FONT}`;
    write(ctx, ellipsize(ctx, line, w - 760), 100, h / 2 + 22, 64, "#ffffff", 500);
    const pill = (x, label, color) => { rr(ctx, x, 18, 280, h - 36, (h - 36) / 2); ctx.fillStyle = color; ctx.fill(); write(ctx, label, x + 140, h / 2 + 20, 58, "#fff", 650, "center"); };
    if (pcUi.busy) pill(w - 620, "Stop", "rgba(239,68,68,.9)");
    pill(w - 310, "Close", "rgba(255,255,255,.18)");
    pcUi.bar.update();
  }
  ui(pcUi.bar.mesh, {
    tap: (hit) => {
      const x = (hit?.uv?.x ?? 0) * pcUi.bar.w;
      if (x > pcUi.bar.w - 320) pcClose();
      else if (pcUi.busy && x > pcUi.bar.w - 630) {
        const my = pcUi.gen;
        // Stop stays offered until the PC confirms it stopped.
        void api.pc.send({ op: "stop" }).then((r) => {
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
      const r = await api.pc.shot(1280);
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
      const s = await api.pc.status();
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
    // Make room: the orb moves to your left, still in reach, until the PC closes.
    if (!rig.userData.placed) {
      const a = headYaw + 0.62;
      goal = { x: headPos.x - Math.sin(a) * 0.7, y: headPos.y - 0.12, z: headPos.z - Math.cos(a) * 0.7 };
      rig.userData.placed = "pc";
    }
    const my = ++pcUi.gen;
    drawScreenMessage("Connecting to " + api.pc.name() + "…");
    drawBar();
    void pcLoop(my);
    void statusLoop(my);
    return "";
  }
  function pcClose() {
    pcUi.open = false; pcUi.gen++; pcUi.group.visible = false;
    if (rig.userData.placed === "pc") comeHere();
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

  // ---- pinned answers -------------------------------------------------------------
  const pinned = [];
  function dropCard(item) {
    unui(item.c.mesh); unui(item.x.mesh);
    scene.remove(item.group);
    for (const k of [item.c, item.x]) { k.tex.dispose(); k.mesh.geometry.dispose(); k.mesh.material.dispose(); }
    const i = pinned.indexOf(item);
    if (i >= 0) pinned.splice(i, 1);
  }
  function pin(text, at, restoring = false) {
    if (!restoring) {
      const list = api.notes.add(text);
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
      glass(ctx, w, h, 36, { fill: "rgba(18, 16, 40, 0.9)" });
      write(ctx, "Pinned", 34, 58, 28, PINK, 650);
      const measure = (s, size) => { ctx.font = `500 ${size}px ${FONT}`; return ctx.measureText(s).width; };
      const fit = util.fitLines(text, w - 68, 6, 32, 20, measure);
      let y = 66;
      for (const line of fit.lines) write(ctx, line, 34, (y += fit.size * 1.3), fit.size, "#ffffff", 500);
      c.update();
      const xc = x.ctx;
      xc.beginPath(); xc.arc(x.w / 2, x.h / 2, x.w / 2 - 3, 0, Math.PI * 2); xc.fillStyle = "rgba(14,18,40,.92)"; xc.fill();
      xc.strokeStyle = "#fff"; xc.lineWidth = 6; xc.lineCap = "round";
      xc.beginPath(); xc.moveTo(x.w * 0.34, x.h * 0.34); xc.lineTo(x.w * 0.66, x.h * 0.66); xc.moveTo(x.w * 0.66, x.h * 0.34); xc.lineTo(x.w * 0.34, x.h * 0.66); xc.stroke();
      x.update();
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
    ui(c.mesh, { tap: () => api.speak(text), drag: () => group });
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
    pinned.forEach(placeNote);
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
    const s = (1 + Math.sin(t * 1.7) * 0.012 + view.energy * 0.1) * (view.hovered ? 1.06 : 1);
    orb.scale.setScalar(s);
    haloMat.opacity = 0.2 + view.energy * 0.45;
    haloMat.color.setHex(HALO[view.state] || 0x7dd3fc);
    halo.scale.setScalar(0.4 + view.energy * 0.12);
    const ringOn = view.state === "listening" || view.state === "thinking";
    ringMat.opacity += ((ringOn ? 0.6 : 0) - ringMat.opacity) * Math.min(1, dt * 6);
    ringMat.color.setHex(HALO[view.state] || 0x5eead4);
    ring.rotation.z -= dt * (view.state === "thinking" ? 4 : 0.8);
    ring.scale.setScalar(1 + (view.state === "listening" ? view.mic * 0.25 : 0));
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
      if (pr?.drag) {
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
        if (a && !was[0]) api.tapOrb();
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
    overlay = document.createElement("div");
    overlay.setAttribute("role", "status");
    Object.assign(overlay.style, { position: "fixed", top: "max(12px, env(safe-area-inset-top))", left: "50%", transform: "translateX(-50%)", zIndex: "2147483001", display: "flex", gap: "10px", alignItems: "center", padding: "8px 8px 8px 16px", borderRadius: "999px", background: "rgba(10,13,30,.82)", color: "#e6ecff", font: `500 14px ${FONT}`, border: "1px solid rgba(167,139,250,.45)", maxWidth: "calc(100vw - 32px)" });
    const words = document.createElement("span");
    words.textContent = "3D preview: click the orb to talk, drag to look around.";
    // The same actions as the 3D buttons, reachable with the keyboard too.
    const domButton = (label, act) => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = label;
      Object.assign(b.style, { font: `600 14px ${FONT}`, color: "#fff", background: "rgba(255,255,255,.14)", border: "0", borderRadius: "999px", padding: "8px 14px", cursor: "pointer" });
      b.onclick = act;
      return b;
    };
    overlay.append(words, domButton("Talk", () => api.tapOrb()), domButton("My PC", togglePc), domButton("Pin", pinLast), domButton("Leave", () => stop()));
    document.body.appendChild(overlay);
  } else {
    on(session, "end", () => stop());
  }

  function stop() {
    if (stopped) return;
    stopped = true;
    pcClose();
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
      if (who === "me") { view.you = s; view.reply = ""; view.hint = ""; }
      else if (who === "izuki") { if (opts?.thinking) view.stage = s; else { view.reply = s; view.stage = ""; } }
      drawCaption();
    },
    level(v) { view.mic = Math.max(0, Math.min(1, Number(v) || 0)); },
    showLook,
    pin,
    comeHere,
    pcOpen,
    pcClose,
    pcShown: () => pcUi.open,
    stop,
  };
}

// The calm space for headsets without passthrough (and the 3D preview).
function addSpace(scene, floorY) {
  const sky = new Mesh(new SphereGeometry(40, 32, 16), new ShaderMaterial({
    side: BackSide, depthWrite: false,
    vertexShader: "varying vec3 vW; void main(){ vW = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
    fragmentShader: `varying vec3 vW;
      void main(){
        float h = vW.y;
        vec3 low = vec3(0.02, 0.025, 0.06), mid = vec3(0.07, 0.08, 0.19), top = vec3(0.10, 0.06, 0.20);
        vec3 c = h < 0.0 ? mix(mid, low, clamp(-h * 3.0, 0.0, 1.0)) : mix(mid, top, clamp(h * 1.5, 0.0, 1.0));
        float band = exp(-pow((h - 0.18) * 7.0, 2.0)) * (0.5 + 0.5 * sin(atan(vW.z, vW.x) * 3.0));
        c += vec3(0.05, 0.18, 0.17) * band * 0.6;
        gl_FragColor = vec4(c, 1.0);
      }`,
  }));
  sky.renderOrder = -10;
  scene.add(sky);

  const n = 700, pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const u = Math.random() * Math.PI * 2, v = Math.random() * 0.9 + 0.05;
    const r = 30;
    pos[i * 3] = Math.cos(u) * Math.sqrt(1 - v * v) * r;
    pos[i * 3 + 1] = v * r;
    pos[i * 3 + 2] = Math.sin(u) * Math.sqrt(1 - v * v) * r;
  }
  const stars = new Points(new BufferGeometry().setAttribute("position", new Float32BufferAttribute(pos, 3)), new PointsMaterial({ color: 0xcfe8ff, size: 0.07, transparent: true, opacity: 0.8, depthWrite: false }));
  scene.add(stars);

  const c = document.createElement("canvas");
  c.width = c.height = 256;
  const x = c.getContext("2d");
  const g = x.createRadialGradient(128, 128, 0, 128, 128, 128);
  g.addColorStop(0, "rgba(94,234,212,0.35)");
  g.addColorStop(0.45, "rgba(167,139,250,0.14)");
  g.addColorStop(1, "rgba(0,0,0,0)");
  x.fillStyle = g;
  x.fillRect(0, 0, 256, 256);
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  const floor = new Mesh(new CircleGeometry(3.2, 64), new MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = floorY;
  scene.add(floor);
}
