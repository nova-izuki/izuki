// The live field: real-time graphics for Izuki, one shader for both surfaces.
//
// The PC app's panel draws it in a canvas behind the glass (LiveField.tsx),
// and the VR room draws the same fragment shader on a plane behind the orb
// (vr-scene.src.js), so "what Izuki is doing" looks the same in both places:
//
//   idle       slow, dim drift                  (almost free: 4 noise octaves)
//   listening  breathes with your voice         (uEnergy = mic level)
//   thinking   swirls, with a scan passing over (a violet current)
//   speaking   ripples, brightening with the voice
//   working    streams sideways, spiking on each step (uPulse)
//
// Nothing here touches the DOM until createLiveField() is called, and it
// never starts a frame loop of its own: the host owns the clock, so the same
// module cannot cost a frame when its host is idle, hidden or in a headset.
// No dependencies, plain ES module — the VR bundle inlines it, and the React
// panel imports it directly (as it already does for water-orb.js).

/** The four states the field knows, as the shader's uState values. */
export const LIVE_STATE = { idle: 0, listening: 1, thinking: 2, speaking: 3, working: 4 };

/** Full-screen triangle pair for a canvas (clip space, one attribute). */
export const LIVE_QUAD_VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

/** three.js's side of the same field: its plane geometry already has uv. */
export const LIVE_SCENE_VERT = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`;

/** The field itself. Shared verbatim by the canvas and by three.js. */
export const LIVE_FIELD_FRAG = `
precision highp float;
varying vec2 vUv;
uniform float uTime;
uniform float uEnergy;
uniform float uPulse;
uniform float uState;
uniform float uAspect;
uniform float uOpacity;
uniform vec3 uA;
uniform vec3 uB;
uniform vec3 uC;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.55;
  for (int i = 0; i < 4; i++) { v += a * noise(p); p = p * 2.03 + 11.7; a *= 0.5; }
  return v;
}

void main() {
  vec2 uv = vUv - 0.5;
  uv.x *= uAspect;
  float t = uTime;
  float listen  = step(0.5, uState) * (1.0 - step(1.5, uState));
  float think   = step(1.5, uState) * (1.0 - step(2.5, uState));
  float speak   = step(2.5, uState) * (1.0 - step(3.5, uState));
  float work    = step(3.5, uState);
  float r = length(uv);
  float ang = atan(uv.y, uv.x);
  float mic = uEnergy * (0.45 + listen * 0.75 + speak * 0.95);

  // Where the noise is sampled: a slow drift, a swirl while it thinks, a
  // sideways stream while it works. Everything else stays where it was.
  vec2 q = uv * 12.0 + vec2(cos(t * 0.11), sin(t * 0.13)) * 0.8;
  q += think * vec2(cos(t * 0.55 + ang), sin(t * 0.55 + ang)) * 1.6;
  q.y += work * t * 1.4;

  float warp = fbm(q * 0.3 + t * 0.06);
  float w = fbm(q + warp * 1.1);
  float fine = fbm(q * 2.1 - t * 0.18 + warp);
  // Filaments, not a wash: a narrow band of the noise, lit up.
  float veins = smoothstep(0.50, 0.70, w);
  float thread = smoothstep(0.55, 0.78, fine) * veins;
  float glow = pow(max(0.0, 1.0 - r * 0.98), 1.5);
  float breathe = 0.9 + 0.1 * sin(t * (1.1 + listen * 0.7));
  float pulse = 1.0 + uPulse * 0.9;

  vec3 col = mix(uA, uB, smoothstep(0.30, 0.85, w));
  col = mix(col, uC, smoothstep(0.72, 0.98, w) * (0.55 + 0.35 * sin(ang * 2.0 + t * 0.4)));
  // A scan crossing the field is what "thinking" looks like from the outside.
  float scan = 1.0 - smoothstep(0.0, 0.05, abs(fract(uv.y * 0.9 - t * 0.16) - 0.5));
  col += uC * (thread * 1.0 + scan * think * 0.4 + veins * 0.2);
  col *= breathe * pulse * (0.85 + 0.55 * mic);
  // Fine grain: keeps the gradients from banding on a cheap panel.
  col += (hash(vUv * 917.0) - 0.5) * 0.02;

  // A soft shoulder instead of a hard clip: the peaks glow without turning
  // into flat white, so the filaments stay readable.
  col = col / (1.0 + col);
  float alpha = glow * (0.16 + veins * 0.55 + thread * 0.5 + mic * 0.35) * uOpacity;
  gl_FragColor = vec4(col, clamp(alpha, 0.0, 0.95));
}`;

/** "#5eead4" or [r, g, b] (0..1) → an rgb triplet the shader can use. */
export function tintRgb(tint) {
  if (Array.isArray(tint)) return [tint[0] || 0, tint[1] || 0, tint[2] || 0];
  const hex = String(tint || "").replace("#", "");
  if (hex.length !== 6) return [0.37, 0.92, 0.83];
  return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
}

// IZUKI NOVA's own three, the same colours the orb carries.
const PALETTE = ["#5eead4", "#8b7cf6", "#f472b6"];

function compile(gl, type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error("live field: " + log);
  }
  return shader;
}

/**
 * A real-time field on a canvas. The host calls frame() from its own loop.
 *
 *   const field = createLiveField(canvas, { tint: "#5eead4" });
 *   field.resize(cssWidth, cssHeight, devicePixelRatio);
 *   field.frame("thinking", 0.4, dt);   // dt in seconds
 *   field.dispose();
 *
 * "state" is one of LIVE_STATE's names; "level" is 0..1 (mic or voice).
 * Returns null when there is no canvas to draw on.
 */
export function createLiveField(canvas, opts = {}) {
  if (!canvas || typeof canvas.getContext !== "function") return null;
  const colors = (opts.colors || PALETTE).slice(0, 3);
  while (colors.length < 3) colors.push(colors[colors.length - 1] || "#5eead4");

  const gl = canvas.getContext("webgl2", { alpha: true, antialias: false, depth: false, premultipliedAlpha: true, powerPreference: "low-power" })
    || canvas.getContext("webgl", { alpha: true, antialias: false, depth: false, premultipliedAlpha: true, powerPreference: "low-power" });
  if (!gl) return canvasField(canvas, colors);

  let program;
  try {
    program = gl.createProgram();
    gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, LIVE_QUAD_VERT));
    gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, LIVE_FIELD_FRAG));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error("live field: " + gl.getProgramInfoLog(program));
  } catch (err) {
    // An old driver that cannot compile it still gets a field, just a smooth one.
    console.warn(err?.message || err);
    return canvasField(canvas, colors);
  }

  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(program, "aPos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
  const u = {};
  for (const name of ["uTime", "uEnergy", "uPulse", "uState", "uAspect", "uOpacity", "uA", "uB", "uC"]) {
    u[name] = gl.getUniformLocation(program, name);
  }
  const setColors = (list) => {
    const rgb = [0, 1, 2].map((i) => tintRgb(list[i]));
    gl.uniform3f(u.uA, rgb[0][0], rgb[0][1], rgb[0][2]);
    gl.uniform3f(u.uB, rgb[1][0], rgb[1][1], rgb[1][2]);
    gl.uniform3f(u.uC, rgb[2][0], rgb[2][1], rgb[2][2]);
  };
  gl.useProgram(program);
  setColors(colors);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE);   // additive: light on the glass
  gl.uniform1f(u.uTime, 0);
  gl.uniform1f(u.uOpacity, opts.opacity ?? 1);

  let time = 0;
  let disposed = false;

  const draw = (state, level, dt) => {
    if (disposed || gl.isContextLost?.()) return;
    if (dt > 0) time += Math.min(0.1, dt);
    // Additive light must start from empty every frame, or the frames stack
    // up into white.
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);
    gl.uniform1f(u.uTime, time);
    gl.uniform1f(u.uState, LIVE_STATE[state] ?? 0);
    gl.uniform1f(u.uEnergy, Math.max(0, Math.min(1, level || 0)));
    gl.uniform1f(u.uAspect, canvas.width / Math.max(1, canvas.height));
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  return {
    /** True when the GPU path is live (false only for the fallback below). */
    gpu: true,
    get time() { return time; },
    frame(state, level, dt) { draw(state, level, dt); },
    /** A single still frame: what reduced motion draws. */
    still(state, level) { draw(state, level, 0); },
    pulse(at = 1) { if (!disposed) gl.uniform1f(u.uPulse, Math.max(0, Math.min(1, at))); },
    recolour(list) { if (!disposed && list) { gl.useProgram(program); setColors(list); } },
    resize(cssWidth, cssHeight, dpr = 1) {
      if (disposed) return;
      const scale = Math.min(opts.maxDpr ?? 2, Math.max(0.5, dpr || 1));
      let w = Math.max(1, Math.round(cssWidth * scale));
      let h = Math.max(1, Math.round(cssHeight * scale));
      // A big window at 2x is wasted fill rate for a soft field: cap it.
      const cap = opts.maxPixels ?? 1_400_000;
      const px = w * h;
      if (px > cap) { const k = Math.sqrt(cap / px); w = Math.max(1, Math.round(w * k)); h = Math.max(1, Math.round(h * k)); }
      if (w === canvas.width && h === canvas.height) return;
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      gl.deleteBuffer(buffer);
      gl.deleteProgram(program);
      // Never force the context lost here: a React StrictMode remount (or any
      // re-mount on the same canvas) would get a dead context back, and
      // createShader() would return null. Let the browser reclaim it when the
      // canvas itself is gone.
    },
  };
}

/**
 * No WebGL (a locked-down WebView, a very old driver): three soft blobs of
 * the same colours, moving slowly. Nothing to compile, nothing to lose.
 */
function canvasField(canvas, colors) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const rgb = colors.map((c) => tintRgb(c));
  let time = 0;
  let pulseAt = 1;
  const draw = (state, level, dt) => {
    if (dt > 0) time += Math.min(0.1, dt);
    const w = canvas.width, h = canvas.height;
    const busy = state === "thinking" || state === "working" ? 1 : 0;
    const mic = Math.max(0, Math.min(1, level || 0));
    ctx.clearRect(0, 0, w, h);
    ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < 3; i++) {
      const a = time * (0.12 + i * 0.05) + i * 2.1;
      const x = w * (0.5 + Math.cos(a) * (0.22 + busy * 0.05));
      const y = h * (0.5 + Math.sin(a * 1.3) * (0.2 + busy * 0.05));
      const r = Math.min(w, h) * (0.34 + mic * 0.14 + Math.sin(time * 1.3 + i) * 0.02);
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      const [cr, cg, cb] = rgb[i];
      g.addColorStop(0, `rgba(${Math.round(cr * 255)},${Math.round(cg * 255)},${Math.round(cb * 255)},${(0.16 + mic * 0.16) * pulseAt})`);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }
    ctx.globalCompositeOperation = "source-over";
  };
  return {
    gpu: false,
    get time() { return time; },
    frame(state, level, dt) { draw(state, level, dt); },
    still(state, level) { draw(state, level, 0); },
    pulse(at = 1) { pulseAt = 1 + Math.max(0, Math.min(1, at)) * 0.8; },
    recolour() {},
    resize(cssWidth, cssHeight, dpr = 1) {
      const scale = Math.min(1.5, Math.max(0.5, dpr || 1));
      const w = Math.max(1, Math.round(cssWidth * scale));
      const h = Math.max(1, Math.round(cssHeight * scale));
      if (w === canvas.width && h === canvas.height) return;
      canvas.width = w;
      canvas.height = h;
    },
    dispose() {},
  };
}
