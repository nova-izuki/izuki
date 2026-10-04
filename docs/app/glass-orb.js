// Realistic orbs, drawn on the graphics card and shared by the PC app, the
// website and the phone. Light really behaves here: the glass bends what's
// behind it (refraction, with a little rainbow fringing), the rim brightens
// at a glancing angle (Fresnel), two studio lights leave sharp highlights,
// and the surface ripples with the voice.
//
// Three materials:
//   ferrofluid  "Water"  — a clear water droplet with moving caustics
//   ripple      "Pearl"  — iridescent nacre; voice rings run across it
//   constellation "Galaxy" — dark glass holding a nebula and twinkling stars
//   dew         "Pure water" — truly see-through water: your screen shows
//               through the middle, the world bends only near the rim
//   face        "Hologram face" — a head of light points: the jaw moves
//               with the voice, it blinks, smiles or frowns with the mood
//   particles   "Stardust" — thousands of glowing dots in a sphere that
//               pulse out with the voice and, while thinking, stream into
//               a looping infinity sign
//
// One hidden WebGL canvas per size renders a frame, then it's copied onto
// the caller's ordinary 2D canvas — a drop-in for the old 2D drawers.
// `drawGlassOrb` returns false when WebGL isn't available; the caller then
// keeps its 2D look.

const VERT = `attribute vec2 p; varying vec2 v; void main(){ v = p * .5 + .5; gl_Position = vec4(p, 0., 1.); }`;

const FRAG = `
precision highp float;
varying vec2 v;
uniform float uTime, uLevel, uThink, uPx;
uniform int uStyle;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f);
  return mix(mix(hash(i), hash(i + vec2(1., 0.)), f.x), mix(hash(i + vec2(0., 1.)), hash(i + vec2(1., 1.)), f.x), f.y);
}
// Smooth currents for surfaces and caustics: rotated waves, no grid, so no
// square-looking lines (value noise's grid showed through on the water).
float flow(vec2 p){
  float s = 0., a = .5;
  for (int i = 0; i < 4; i++) {
    s += a * sin(p.x) * sin(p.y);
    p = mat2(1.6, 1.2, -1.2, 1.6) * p + vec2(1.3, .7);
    a *= .5;
  }
  return s * .5 + .5;
}
float fbm(vec2 p){
  float s = 0., a = .5;
  for (int i = 0; i < 5; i++) { s += a * noise(p); p = p * 2.03 + vec2(1.7, 9.2); a *= .5; }
  return s;
}

// A dark studio: a cool sky, a big soft key light top-left, a thin strip
// light on the right, a violet bounce from below.
vec3 env(vec3 d){
  float up = smoothstep(-.3, 1., d.y);
  vec3 c = mix(vec3(.015, .02, .045), vec3(.09, .13, .21), up);
  float az = atan(d.x, d.z);
  float key = smoothstep(.42, .30, abs(az + .85)) * smoothstep(.30, .18, abs(d.y - .52));
  float strip = smoothstep(.09, .05, abs(az - 1.25)) * smoothstep(.55, .42, abs(d.y - .08));
  c += vec3(1., .98, .95) * key * 1.7 + vec3(.55, .82, 1.) * strip * .9;
  c += vec3(.28, .1, .45) * smoothstep(0., -.9, d.y) * .7;
  // A bright horizon: what makes a water drop look like water is the
  // world seen upside-down inside it, and a clear line sells that.
  c += vec3(.38, .55, .78) * smoothstep(.16, 0., abs(d.y + .04)) * .75;
  return c;
}

void main(){
  vec2 p = v * 2. - 1.;
  float ang = atan(p.y, p.x);
  // The outline breathes, swirls while thinking and shivers with the voice.
  float w = sin(ang * 3. + uTime * 1.7) * .009 + sin(ang * 5. - uTime * 2.3) * .006;
  w += uLevel * (sin(ang * 3. + uTime * 5.) * .018 + sin(ang * 5. - uTime * 7.) * .011 + sin(ang * 8. + uTime * 9.) * .006);
  w += uThink * sin(ang * 2. - uTime * 3.2) * .022;
  float r = .6 * (1. + uLevel * .07) * (1. + w);
  float d = length(p);

  vec3 glowCol = uStyle == 0 ? vec3(.35, .75, 1.) : (uStyle == 1 ? vec3(1., .78, .95) : (uStyle == 2 ? vec3(.55, .42, 1.) : vec3(.62, .86, 1.)));
  float glow = exp(-max(d - r, 0.) * 8.) * (.28 + uLevel * .55 + uThink * .15) * (uStyle == 3 ? .6 : 1.);

  vec2 q = p / r;
  float z = sqrt(max(0., 1. - dot(q, q)));
  vec3 N = normalize(vec3(q, z));
  // Surface detail: slow currents, plus rings that run outward as it talks.
  vec2 rp = q * 2.6 + vec2(uTime * .18, -uTime * .12);
  float h = flow(rp);
  vec2 grad = vec2(flow(rp + vec2(.04, 0.)) - h, flow(rp + vec2(0., .04)) - h) * (.7 + uLevel * 2.);
  float rings = sin(length(q) * 16. - uTime * 7.) * uLevel * (uStyle == 1 ? .1 : .06);
  // Water's surface is glassy-smooth; pearl and galaxy can be more textured.
  bool water = uStyle == 0 || uStyle == 3;
  N = normalize(N + vec3(grad * (water ? .5 : 1.3) + q * rings, 0.));
  vec3 V = vec3(0., 0., 1.);
  float ndv = max(dot(N, V), 0.);
  float F = .04 + .96 * pow(1. - ndv, 5.);
  vec3 refl = env(reflect(-V, N));

  vec3 inside;
  if (uStyle == 0) {
    // Water: the world seen through it, flipped and magnified, a little
    // rainbow at the edges, deeper water bluer, light dancing inside.
    vec3 flip = vec3(-1., -1., 1.);
    vec3 rr = refract(-V, N, .74), rg = refract(-V, N, .752), rb = refract(-V, N, .764);
    inside = vec3(env(rr * flip).r, env(rg * flip).g, env(rb * flip).b) * 1.6;
    inside *= exp(-vec3(.9, .35, .15) * z * .8);
    inside += vec3(.03, .16, .30) * z * .4;
    // Light gathered at the bottom, the way a real drop focuses it.
    vec2 fq = q - vec2(.18, -.52);
    inside += vec3(.7, .95, 1.) * exp(-dot(fq, fq) * 9.) * .55;
    // Soft caustic light drifting inside.
    float ca = flow(q * 3. + vec2(uTime * .4, -uTime * .3));
    inside += vec3(.5, .85, 1.) * pow(ca, 6.) * (.25 + uLevel * .6) * z;
  } else if (uStyle == 1) {
    // Pearl: thin-film colour that shifts with the angle you see it at.
    vec3 irid = .5 + .5 * cos(6.2832 * (vec3(0., .33, .67) + ndv * 1.7 + flow(q * 2. + uTime * .1) * 1.1 + uTime * .04));
    inside = mix(vec3(.95, .92, .96), irid, .2) * (.55 + .45 * z);
    inside += vec3(.06, .02, .05) * (1. - z);
    inside += irid * (sin(length(q) * 20. - uTime * 5.) * .5 + .5) * uLevel * .18;
  } else if (uStyle == 3) {
    // Pure water: what's behind shows straight through the middle (see the
    // alpha below); near the rim the world bends upside-down, with a
    // rainbow fringe, and light gathers at the bottom.
    vec3 flip = vec3(-1., -1., 1.);
    vec3 rr = refract(-V, N, .74), rg = refract(-V, N, .755), rb = refract(-V, N, .77);
    inside = vec3(env(rr * flip).r, env(rg * flip).g, env(rb * flip).b) * 1.5;
    inside += vec3(.05, .14, .22) * (1. - z);
    vec2 fq = q - vec2(.14, -.62);
    inside += vec3(.85, .97, 1.) * exp(-dot(fq, fq) * 14.) * .7;
    float ca = flow(q * 3.4 + vec2(-uTime * .35, uTime * .25));
    inside += vec3(.7, .92, 1.) * pow(ca, 7.) * (.3 + uLevel * .7);
  } else {
    // Galaxy: a nebula far inside the glass, stars that twinkle with the voice.
    vec3 rd = refract(-V, N, .69);
    vec2 sp = rd.xy * 2.2 + vec2(uTime * .025, uTime * .01);
    float neb = fbm(sp * 1.5 + fbm(sp * 3. + uTime * .05));
    inside = mix(vec3(.02, .01, .07), vec3(.33, .14, .72), neb) + vec3(.95, .3, .62) * pow(neb, 3.) * .9;
    vec2 cell = sp * 26.;
    float s = hash(floor(cell));
    float star = step(.955, s) * smoothstep(.16, 0., length(fract(cell) - .5)) * (.55 + .45 * sin(uTime * 3. + s * 40.)) * (1. + uLevel * 2.5);
    inside += vec3(.9, .95, 1.) * star;
    inside *= .55 + .45 * z;
  }

  vec3 L1 = normalize(vec3(-.5, .62, .7)), L2 = normalize(vec3(.72, -.22, .6));
  float s1 = pow(max(dot(reflect(-L1, N), V), 0.), 140.);
  float s2 = pow(max(dot(reflect(-L2, N), V), 0.), 55.);
  vec3 col = mix(inside, refl, F) + vec3(1.) * s1 * 1.5 + vec3(.7, .9, 1.) * s2 * .35;
  col += glowCol * pow(1. - z, 3.) * (.22 + uLevel * .5);

  float edge = smoothstep(r + 1.5 / uPx, r - 1.5 / uPx, d);
  // Pure water is clear in the middle and solid only where light bends or
  // glints: the rim, the Fresnel edge and the highlights.
  float clear = mix(.08, .9, smoothstep(.3, 1., length(q)));
  clear = max(clear, max(F * .85, min(1., s1 * 1.6 + s2 * .6)));
  float body = uStyle == 0 ? .88 : (uStyle == 3 ? clear : 1.);
  vec3 outCol = col * edge * body + glowCol * glow * (1. - edge);
  float outA = edge * body + glow * (1. - edge);
  gl_FragColor = vec4(outCol, clamp(outA, 0., 1.));
}`;

// ---- Stardust: points, not a surface -----------------------------------
const DOTS = 3600;
const DOT_VERT = `
attribute vec2 a;
uniform float uTime, uLevel, uThink, uPx;
varying float vB;
varying vec3 vC;
void main(){
  float i = a.x * ${DOTS}.;
  float y = 1. - 2. * (i + .5) / ${DOTS}.;
  float rr = sqrt(max(0., 1. - y * y));
  float th = i * 2.399963;
  vec3 s = vec3(cos(th) * rr, y, sin(th) * rr);
  // A wave runs round the sphere as it talks; it breathes when quiet.
  float wave = sin(y * 7. + uTime * 5. + a.y * 6.2832) * .5 + .5;
  s *= 1. + uLevel * (.2 * wave + .12 * a.y) + .018 * sin(uTime * 1.3 + a.y * 20.);
  float ry = uTime * .3;
  s.xz = mat2(cos(ry), -sin(ry), sin(ry), cos(ry)) * s.xz;
  s.yz = mat2(cos(.35), -sin(.35), sin(.35), cos(.35)) * s.yz;
  // Thinking: every dot streams along an infinity loop, like loading.
  float t = a.x * 18.85 + uTime * 1.6;
  float den = 1. + sin(t) * sin(t);
  vec3 inf = vec3(cos(t) / den * 1.25, sin(t) * cos(t) / den * 1.25, (a.y - .5) * .3);
  inf.xy += vec2(sin(a.y * 40. + uTime), cos(a.y * 33. - uTime)) * .045;
  vec3 p = mix(s, inf, smoothstep(0., 1., uThink));
  float depth = p.z * .5 + .5;
  gl_Position = vec4(p.xy * .6, 0., 1.);
  gl_PointSize = (1.1 + depth * 2.3 + uLevel * 1.3) * uPx / 260.;
  vB = (.32 + .78 * depth) * (.8 + uLevel * .6);
  vC = mix(vec3(.35, .82, 1.), vec3(.96, .45, 1.), clamp(a.y * .6 + (1. - depth) * .45 + uThink * .3, 0., 1.));
}`;
const DOT_FRAG = `
precision mediump float;
varying float vB;
varying vec3 vC;
void main(){
  vec2 c = gl_PointCoord * 2. - 1.;
  float d = dot(c, c);
  if (d > 1.) discard;
  float k = exp(-d * 3.2) * vB;
  gl_FragColor = vec4(vC * k, k);
}`;


// ---- Hologram face: a head of light points that talks ---------------------
// A face shape made from points (no photo, no 3D model file): an egg-shaped
// head with eye sockets, a nose, lips and a jaw. The jaw drops with the
// voice, the eyes blink, the mouth curves with the mood and the head turns.
function facePoints() {
  const pts = [], STEP = 0.016;
  const A = 0.6, B = 0.8;
  const g = (x, y, cx, cy, sx, sy) => Math.exp(-(((x - cx) / sx) ** 2 + ((y - cy) / sy) ** 2));
  for (let y = -B; y <= B; y += STEP) {
    for (let x = -A; x <= A; x += STEP) {
      // An egg: a little narrower at the chin.
      const w = A * (y < 0 ? 1 - 0.28 * (y / -B) ** 2 : 1);
      const e = (x / w) ** 2 + (y / B) ** 2;
      if (e >= 1) continue;
      const shell = 0.55 * Math.sqrt(1 - e);
      let z = shell;
      z -= 0.07 * (g(x, y, -0.22, 0.14, 0.11, 0.07) + g(x, y, 0.22, 0.14, 0.11, 0.07)); // eye sockets
      z += 0.13 * g(x, y, 0, -0.06, 0.05, 0.17); // nose
      z += 0.05 * g(x, y, 0, -0.36, 0.17, 0.05); // lips
      z += 0.03 * (g(x, y, -0.3, -0.1, 0.12, 0.1) + g(x, y, 0.3, -0.1, 0.12, 0.1)); // cheeks
      const eye = Math.max(g(x, y, -0.22, 0.14, 0.075, 0.035), g(x, y, 0.22, 0.14, 0.075, 0.035));
      const brow = Math.max(g(x, y, -0.22, 0.27, 0.1, 0.03), g(x, y, 0.22, 0.27, 0.1, 0.03));
      // Everything below the lips moves with the jaw, more toward the chin.
      const jaw = y < -0.37 ? Math.min(1, (-0.37 - y) / 0.06) * Math.max(0, 1 - Math.abs(x) / 0.48) : 0;
      const lip = g(x, y, 0, -0.37, 0.2, 0.05);
      // Leave the line between the lips open, so the mouth reads.
      if (Math.abs(y + 0.37) < 0.008 && Math.abs(x) < 0.17) continue;
      // How far the features stand out from a plain egg: lit by it below.
      pts.push(x, y, z, eye, jaw, brow, lip, z - shell);
    }
  }
  return new Float32Array(pts);
}
const FACE_VERT = `
attribute vec3 pos;
attribute vec4 f; // eye, jaw, brow, lip
attribute float seed; // here: relief, how far this point stands out
uniform float uTime, uLevel, uThink, uPx, uMood;
varying float vB;
varying vec3 vC;
void main(){
  vec3 p = pos;
  // Talking: the jaw opens with the voice; the lips widen and narrow a little.
  float talk = uLevel * (0.75 + 0.25 * sin(uTime * 17.0));
  p.y -= f.y * talk * 0.16;
  p.x *= 1.0 + f.w * (sin(uTime * 9.0) * 0.06 * uLevel);
  // Mood: corners of the mouth up (happy) or down (sad); brows rise when curious.
  p.y += f.w * uMood * 0.035 * (p.x / 0.18) * (p.x / 0.18);
  p.y += f.z * (0.02 * abs(uMood) + 0.015 * uThink);
  // Blink every few seconds.
  float blink = smoothstep(0.0, 0.06, abs(mod(uTime, 4.3) - 4.15));
  p.y = mix(0.14 + (p.y - 0.14) * blink, p.y, 1.0 - f.x);
  // The head turns slowly, looks up a touch while thinking, breathes.
  float yaw = sin(uTime * 0.45) * 0.28 + uThink * sin(uTime * 1.3) * 0.15;
  float pitch = -0.08 + uThink * 0.12 + sin(uTime * 0.6) * 0.04;
  p.xz = mat2(cos(yaw), -sin(yaw), sin(yaw), cos(yaw)) * p.xz;
  p.yz = mat2(cos(pitch), -sin(pitch), sin(pitch), cos(pitch)) * p.yz;
  p *= 1.0 + 0.012 * sin(uTime * 1.4);
  float depth = clamp(p.z / 0.6 + 0.5, 0.0, 1.0);
  gl_Position = vec4(p.x * 0.92, p.y * 0.92 + 0.02, 0.0, 1.0);
  float scan = 0.82 + 0.18 * sin(p.y * 90.0 - uTime * 6.0);
  gl_PointSize = (0.9 + depth * 1.7) * uPx / 260.0;
  // Lit from the front-left: raised features (nose, cheeks, lips) glow,
  // sockets fall into shadow — that's what makes it read as a face.
  float light = clamp(0.35 + seed * 7.0 + (0.5 - pos.x) * 0.25, 0.08, 1.4);
  vB = 1.75 * (0.12 + 0.6 * depth) * light * scan * (0.85 + uLevel * 0.4) + f.x * 0.9 + f.w * uLevel * 0.5;
  vC = mix(vec3(0.3, 0.75, 1.0), vec3(0.85, 0.95, 1.0), f.x);
  vC = mix(vC, vec3(1.0, 0.55, 0.85), f.w * 0.35);
}`;

const STYLES = { ferrofluid: 0, ripple: 1, constellation: 2, dew: 3, particles: 4, face: 5 };
const renderers = new Map();
let unsupported = false;

function make(px) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = px;
  const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: false, preserveDrawingBuffer: true });
  if (!gl) return null;
  const shader = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || "shader");
    return s;
  };
  const link = (vs, fs) => {
    const prog = gl.createProgram();
    gl.attachShader(prog, shader(gl.VERTEX_SHADER, vs));
    gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog) || "link");
    return prog;
  };
  const glass = link(VERT, FRAG);
  const quad = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const dots = link(DOT_VERT, DOT_FRAG);
  const seeds = new Float32Array(DOTS * 2);
  for (let i = 0; i < DOTS; i++) {
    seeds[i * 2] = i / DOTS;
    seeds[i * 2 + 1] = (Math.sin(i * 12.9898) * 43758.5453) % 1 + (Math.sin(i * 12.9898) < 0 ? 1 : 0);
  }
  const points = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, points);
  gl.bufferData(gl.ARRAY_BUFFER, seeds, gl.STATIC_DRAW);
  const uniforms = (prog) => {
    const u = (n) => gl.getUniformLocation(prog, n);
    return { uTime: u("uTime"), uLevel: u("uLevel"), uThink: u("uThink"), uPx: u("uPx"), uStyle: u("uStyle"), uMood: u("uMood") };
  };
  const headProg = link(FACE_VERT, DOT_FRAG);
  const head = facePoints();
  const headBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, headBuf);
  gl.bufferData(gl.ARRAY_BUFFER, head, gl.STATIC_DRAW);
  return {
    canvas, gl, px, lost: false,
    glass: { prog: glass, buf: quad, attr: gl.getAttribLocation(glass, "p"), mode: gl.TRIANGLE_STRIP, count: 4, ...uniforms(glass) },
    dots: { prog: dots, buf: points, attr: gl.getAttribLocation(dots, "a"), mode: gl.POINTS, count: DOTS, ...uniforms(dots) },
    face: {
      prog: headProg, buf: headBuf, mode: gl.POINTS, count: head.length / 8, ...uniforms(headProg),
      // Interleaved: pos (3), flags (4), seed (1).
      layout: [[gl.getAttribLocation(headProg, "pos"), 3, 0], [gl.getAttribLocation(headProg, "f"), 4, 12], [gl.getAttribLocation(headProg, "seed"), 1, 28]],
    },
  };
}

function renderer(px) {
  let r = renderers.get(px);
  if (r && !r.lost && !r.gl.isContextLost()) return r;
  // Only a few sizes are ever live at once (the big orb, a preview, a
  // button); drop the oldest rather than pile up graphics contexts.
  if (renderers.size >= 3) {
    const oldest = renderers.keys().next().value;
    const old = renderers.get(oldest);
    old?.gl.getExtension("WEBGL_lose_context")?.loseContext();
    renderers.delete(oldest);
  }
  r = make(px);
  if (r) renderers.set(px, r);
  return r;
}

/**
 * Draw a realistic orb onto `ctx` (a 2D context, possibly scaled for the
 * screen's pixel density) filling `size`×`size`. `energy` 0…1 is the voice,
 * `thinking` 0…1 how much it's thinking. False if WebGL isn't available.
 */
export function drawGlassOrb(ctx, size, style, time, energy, thinking, mood = 0) {
  if (unsupported || !(style in STYLES)) return false;
  try {
    const scale = typeof ctx.getTransform === "function" ? ctx.getTransform().a || 1 : 1;
    const px = Math.max(48, Math.min(640, Math.round(size * scale / 8) * 8));
    const r = renderer(px);
    if (!r) { unsupported = true; return false; }
    const { gl } = r;
    const pass = style === "particles" ? r.dots : style === "face" ? r.face : r.glass;
    gl.useProgram(pass.prog);
    gl.bindBuffer(gl.ARRAY_BUFFER, pass.buf);
    for (let i = 0; i < 8; i++) gl.disableVertexAttribArray(i);
    if (pass.layout) {
      for (const [at, n, off] of pass.layout) {
        if (at < 0) continue;
        gl.enableVertexAttribArray(at);
        gl.vertexAttribPointer(at, n, gl.FLOAT, false, 32, off);
      }
    } else {
      gl.enableVertexAttribArray(pass.attr);
      gl.vertexAttribPointer(pass.attr, 2, gl.FLOAT, false, 0, 0);
    }
    gl.viewport(0, 0, px, px);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    if (pass === r.dots || pass === r.face) {
      // Light adds up where dots overlap, like real glowing specks.
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE);
    } else {
      gl.disable(gl.BLEND);
    }
    gl.uniform1f(pass.uTime, Number.isFinite(time) ? time % 1000 : 0);
    gl.uniform1f(pass.uLevel, Math.max(0, Math.min(1, energy || 0)));
    gl.uniform1f(pass.uThink, Math.max(0, Math.min(1, Number(thinking) || 0)));
    gl.uniform1f(pass.uPx, px);
    if (pass.uStyle) gl.uniform1i(pass.uStyle, STYLES[style]);
    if (pass.uMood) gl.uniform1f(pass.uMood, Math.max(-1, Math.min(1, Number(mood) || 0)));
    gl.drawArrays(pass.mode, 0, pass.count);
    ctx.drawImage(r.canvas, 0, 0, size, size);
    return true;
  } catch (e) {
    unsupported = true;
    console.warn("[orb] realistic orb unavailable, using the 2D look:", e);
    return false;
  }
}
