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

const STYLES = { ferrofluid: 0, ripple: 1, constellation: 2, dew: 3 };
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
  const prog = gl.createProgram();
  gl.attachShader(prog, shader(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog) || "link");
  gl.useProgram(prog);
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const at = gl.getAttribLocation(prog, "p");
  gl.enableVertexAttribArray(at);
  gl.vertexAttribPointer(at, 2, gl.FLOAT, false, 0, 0);
  const u = (n) => gl.getUniformLocation(prog, n);
  return { canvas, gl, px, uTime: u("uTime"), uLevel: u("uLevel"), uThink: u("uThink"), uPx: u("uPx"), uStyle: u("uStyle"), lost: false };
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
export function drawGlassOrb(ctx, size, style, time, energy, thinking) {
  if (unsupported || !(style in STYLES)) return false;
  try {
    const scale = typeof ctx.getTransform === "function" ? ctx.getTransform().a || 1 : 1;
    const px = Math.max(48, Math.min(640, Math.round(size * scale / 8) * 8));
    const r = renderer(px);
    if (!r) { unsupported = true; return false; }
    const { gl } = r;
    gl.viewport(0, 0, px, px);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform1f(r.uTime, Number.isFinite(time) ? time % 1000 : 0);
    gl.uniform1f(r.uLevel, Math.max(0, Math.min(1, energy || 0)));
    gl.uniform1f(r.uThink, Math.max(0, Math.min(1, Number(thinking) || 0)));
    gl.uniform1f(r.uPx, px);
    gl.uniform1i(r.uStyle, STYLES[style]);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    ctx.drawImage(r.canvas, 0, 0, size, size);
    return true;
  } catch (e) {
    unsupported = true;
    console.warn("[orb] realistic orb unavailable, using the 2D look:", e);
    return false;
  }
}
