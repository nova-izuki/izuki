// Izuki's 3D faces — a real head, sculpted in code, drawn with WebGL.
//
// One head shape (male or female), made from smooth 3D shapes blended
// together: a skull, a face, cheekbones, a jaw, a chin, eyes in their
// sockets, a nose, lips, ears, a neck and shoulders. Two ways to show it:
//
//  • "holo"   — a hologram bust in glowing contour lines (like a projected
//               scan), hidden lines removed, with a bright rim and a scan sweep.
//  • "avatar" — a game-style 3D character: lit skin, eyes with irises that
//               look around, brows, lips, and hair you can choose (style and
//               colour) that swings when the head turns.
//
// It talks (the jaw drops with the voice and the mouth opens), blinks, smiles
// with the mood, looks at your pointer when it's given one, and nods. No
// photos, no model files, nothing downloaded: about 0.1 s to build, once.

const TAU = Math.PI * 2;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

// ---- the shape --------------------------------------------------------------

function ell(x, y, z, cx, cy, cz, rx, ry, rz) {
  const px = (x - cx) / rx, py = (y - cy) / ry, pz = (z - cz) / rz;
  const k0 = Math.sqrt(px * px + py * py + pz * pz);
  const qx = px / rx, qy = py / ry, qz = pz / rz;
  const k1 = Math.sqrt(qx * qx + qy * qy + qz * qz);
  return k1 < 1e-9 ? -Math.min(rx, ry, rz) : (k0 * (k0 - 1)) / k1;
}
const sph = (x, y, z, cx, cy, cz, r) => Math.hypot(x - cx, y - cy, z - cz) - r;
function cone(x, y, z, ax, ay, az, bx, by, bz, ra, rb) {
  const bax = bx - ax, bay = by - ay, baz = bz - az, pax = x - ax, pay = y - ay, paz = z - az;
  const h = clamp((pax * bax + pay * bay + paz * baz) / (bax * bax + bay * bay + baz * baz), 0, 1);
  return Math.hypot(pax - bax * h, pay - bay * h, paz - baz * h) - (ra + (rb - ra) * h);
}
function smin(a, b, k) { const h = Math.max(k - Math.abs(a - b), 0) / k; return Math.min(a, b) - h * h * k * 0.25; }
const smax = (a, b, k) => -smin(-a, -b, k);

// A handsome man: a strong square jaw, a defined chin, a straight nose, a
// firm brow and broad shoulders. A beautiful woman: a soft oval, high
// cheekbones, large eyes, a small lifted nose, full lips, a slender neck.
const BODY = {
  male: {
    cr: [0.69, 0.8, 0.84], fw: 0.5, jawX: 0.35, jawY: -0.6, jawR: [0.17, 0.19, 0.3], chin: [0.19, 0.13, 0.16], chinZ: 0.42,
    brow: 0.075, browZ: 0.575, eyeR: 0.102, noseZ: 0.92, noseR: 0.044, tipR: 0.066, lipW: 0.17, ulip: 0.028, llip: 0.036,
    cheek: [0.15, 0.1, 0.14], cheekY: -0.02, ear: [0.05, 0.2, 0.12], neck: [0.31, 0.75, 0.3], sh: [1.34, 0.46, 0.55], arch: 0.012,
  },
  female: {
    cr: [0.66, 0.79, 0.82], fw: 0.46, jawX: 0.26, jawY: -0.56, jawR: [0.14, 0.17, 0.26], chin: [0.13, 0.11, 0.14], chinZ: 0.39,
    brow: 0.05, browZ: 0.555, eyeR: 0.108, noseZ: 0.86, noseR: 0.033, tipR: 0.052, lipW: 0.155, ulip: 0.036, llip: 0.046,
    cheek: [0.16, 0.11, 0.15], cheekY: 0.01, ear: [0.045, 0.18, 0.11], neck: [0.245, 0.75, 0.24], sh: [1.06, 0.4, 0.44], arch: 0.03,
  },
};
const EYE = [0.24, 0.105, 0.53]; // the right eye's centre (the left mirrors it)
const MOUTH = -0.47;

function bodySDF(x, y, z, B) {
  const ax = Math.abs(x);
  let d = y > -1.25 ? ell(x, y, z, 0, 0.32, -0.08, B.cr[0], B.cr[1], B.cr[2]) : 9;
  if (y < 0.75 && y > -1.3) {
    // The face tapers from the cheekbones down to the chin — a V, not a box.
    d = smin(d, ell(x, y, z, 0, -0.16, 0.12, B.fw * (1 - 0.1 * clamp((-0.1 - y) / 0.7, 0, 1)), 0.72, 0.6), 0.22);
    if (y < -0.1) {
      // The jawline: from the angle of the jaw (under the ear) forward to the chin.
      d = smin(d, cone(ax, y, z, B.jawX + 0.05, B.jawY + 0.06, -0.2, 0.1, -0.8, B.chinZ - 0.07, B.jawR[0] * 0.42, B.chin[0] * 0.5), 0.22);
      d = smin(d, ell(x, y, z, 0, -0.79, B.chinZ, B.chin[0], B.chin[1], B.chin[2]), 0.14);
    }
    if (z > 0.15) {
      if (y > -0.25 && y < 0.25) d = smin(d, ell(ax, y, z, 0.35, B.cheekY, 0.4, B.cheek[0], B.cheek[1], B.cheek[2]), 0.12);
      // The soft fullness of the cheek between the cheekbone and the jaw.
      if (y > -0.7 && y < 0.0) d = smin(d, ell(ax, y, z, 0.29, -0.34, 0.3, 0.17, 0.2, 0.22), 0.16);
      if (y > 0.0 && y < 0.45) {
        d = smin(d, ell(x, y, z, 0, 0.25, B.browZ, 0.46, B.brow, 0.13), 0.1);
        d = smax(d, -ell(ax, y, z, EYE[0], 0.11, 0.7, 0.16, 0.1, 0.16), 0.07);
      }
      if (y > -0.05 && y < 0.25) d = smin(d, sph(ax, y, z, EYE[0], EYE[1], EYE[2], B.eyeR), 0.015);
      if (ax < 0.25 && y > -0.36 && y < 0.25) {
        d = smin(d, cone(x, y, z, 0, 0.12, 0.66, 0, -0.19, B.noseZ - 0.03, B.noseR * 0.8, B.noseR), 0.06);
        d = smin(d, ell(x, y, z, 0, -0.22, B.noseZ - 0.035, B.tipR, 0.062, 0.068), 0.04);
        d = smin(d, ell(ax, y, z, 0.07, -0.262, 0.75, B.tipR * 0.72, 0.042, 0.055), 0.03);
      }
      if (ax < 0.3 && y > -0.62 && y < -0.33) {
        d = smin(d, ell(x, y, z, 0, -0.435, 0.645, B.lipW, B.ulip, 0.07), 0.04);
        d = smin(d, ell(x, y, z, 0, -0.51, 0.625, B.lipW * 0.88, B.llip, 0.07), 0.04);
        d = smax(d, -ell(x, y, z, 0, MOUTH, 0.75, B.lipW * 0.95, 0.007, 0.08), 0.008);
      }
    }
    if (ax > 0.5 && y > -0.3 && y < 0.35 && z < 0.2) d = smin(d, ell(ax, y, z, 0.655, 0.03, -0.1, B.ear[0], B.ear[1], B.ear[2]), 0.05);
  }
  if (y < -0.25) {
    const torso = smin(ell(x, y, z, 0, -1.05, -0.1, B.neck[0], B.neck[1], B.neck[2]), y < -1.1 ? ell(x, y, z, 0, -1.82, -0.08, B.sh[0], B.sh[1], B.sh[2]) : 9, 0.35);
    d = smin(d, torso, 0.12);
  }
  return d;
}

const NA = 128;
const AXIS_Z = -0.08;
const BOTTOM = -1.78;

/** Where a ray out from the middle of the head at height y, angle th, leaves the skin. */
function hit(sdf, y, th, guess) {
  const dx = Math.sin(th), dz = Math.cos(th);
  const at = (t) => sdf(dx * t, y, AXIS_Z + dz * t);
  let t = guess + 0.1;
  while (at(t) < 0 && t < 2.5) t += 0.08;
  let hi = t, d = at(t);
  for (let n = 0; n < 40 && d > 0.0015 && t > 0.002; n++) {
    hi = t;
    t -= Math.max(d * 0.9, 0.003);
    d = at(t);
  }
  if (d > 0) return t;
  let lo = Math.max(0, t); // lo inside, hi outside
  for (let k = 0; k < 4; k++) { const m = (lo + hi) / 2; if (at(m) < 0) lo = m; else hi = m; }
  return (lo + hi) / 2;
}

function grad(sdf, x, y, z) {
  const e = 0.002;
  const a = sdf(x + e, y - e, z - e), b = sdf(x - e, y - e, z + e), c = sdf(x - e, y + e, z - e), d = sdf(x + e, y + e, z + e);
  const nx = a - b - c + d, ny = -a - b + c + d, nz = -a + b - c + d;
  const l = Math.hypot(nx, ny, nz) || 1;
  return [nx / l, ny / l, nz / l];
}

/** Floats per vertex: pos 3, normal 3, flags 4 (jaw, eye, lip|hang, kind), occlusion 1. */
const STRIDE = 11;

function buildBody(gender) {
  const B = BODY[gender];
  const sdf = (x, y, z) => bodySDF(x, y, z, B);
  // The crown: straight up from the middle.
  let top = 0.5;
  while (sdf(0, top, AXIS_Z) < 0) top += 0.01;
  top -= 0.012;
  const NY = 132;
  const rows = [];
  for (let j = 0; j < NY; j++) rows.push(top - ((top - BOTTOM) * j) / (NY - 1));
  // The rows either side of the line between the lips: everything below it
  // moves with the jaw, and the strip between them is the mouth.
  const below = rows.findIndex((y) => y < MOUTH);
  const mouthY = (rows[below - 1] + rows[below]) / 2, band = (rows[below - 1] - rows[below]) / 2;
  const v = new Float32Array((NY * NA + 1) * STRIDE);
  const R = new Float32Array(NY * NA);
  let k = 0;
  for (let j = 0; j < NY; j++) {
    const y = rows[j];
    let guess = j > 0 ? R[(j - 1) * NA] : 0.1;
    for (let i = 0; i < NA; i++) {
      const th = (i / NA) * TAU;
      const r = hit(sdf, y, th, i > 0 ? R[j * NA + i - 1] : guess);
      R[j * NA + i] = r;
      const x = Math.sin(th) * r, z = AXIS_Z + Math.cos(th) * r;
      const n = grad(sdf, x, y, z);
      const ax = Math.abs(x);
      const jaw = y < mouthY ? smooth(0.62, 0.22, ax) * smooth(-0.25, 0.25, z) * (1 - smooth(-0.86, -1.12, y)) : 0;
      const eye = Math.exp(-(((ax - EYE[0]) / 0.13) ** 2) - (((y - EYE[1]) / 0.075) ** 2)) * (z > 0.4 ? 1 : 0);
      const lip = Math.exp(-((x / (B.lipW * 1.15)) ** 2) - (((y - MOUTH) / 0.09) ** 2)) * (z > 0.45 ? 1 : 0);
      // Cavities (eye sockets, nostrils, under the jaw) catch less light.
      const ao = clamp(0.3 + 0.7 * Math.min(1, sdf(x + n[0] * 0.09, y + n[1] * 0.09, z + n[2] * 0.09) / 0.09), 0.25, 1);
      v.set([x, y, z, n[0], n[1], n[2], jaw, eye, lip, 0, ao], k);
      k += STRIDE;
    }
  }
  v.set([0, top + 0.012, AXIS_Z, 0, 1, 0, 0, 0, 0, 0, 1], k);
  const capIndex = NY * NA;
  const tris = [];
  for (let j = 0; j < NY - 1; j++) for (let i = 0; i < NA; i++) {
    const a = j * NA + i, b = j * NA + ((i + 1) % NA), c = a + NA, d = b + NA;
    tris.push(a, c, b, b, c, d);
  }
  for (let i = 0; i < NA; i++) tris.push(capIndex, i, (i + 1) % NA);
  const lines = (every) => {
    const out = [];
    for (let j = 1; j < NY; j += every) for (let i = 0; i < NA; i++) out.push(j * NA + i, j * NA + ((i + 1) % NA));
    return new Uint16Array(out);
  };
  return { B, sdf, rows, R, NY, top, mouthY, band, verts: v, tris: new Uint16Array(tris), lines2: lines(2), lines3: lines(3) };
}

// ---- hair -------------------------------------------------------------------

export const HAIR_STYLES = {
  none: "Bald",
  buzz: "Buzz cut",
  fade: "Fade",
  short: "Short",
  hightop: "High-top",
  mohawk: "Mohawk",
  curly: "Curly",
  afro: "Afro",
  locs: "Dreads",
  longlocs: "Long dreads",
  braids: "Box braids",
  ponytail: "Ponytail",
  bun: "Bun",
  pixie: "Pixie",
  bob: "Bob",
  long: "Long",
  wavy: "Long waves",
};

// t: thickness on the head; top: extra on the crown; front: hairline height
// at the forehead; end/open: long hair falling from the sides and back;
// tubes: locks of their own (dreads, braids); pony: a ponytail.
const HAIR = {
  buzz: { t: 0.016, top: 0.0, front: 0.7 },
  fade: { t: 0.012, top: 0.09, front: 0.71, fadeSides: true },
  short: { t: 0.04, top: 0.08, front: 0.72, quiff: 0.05 },
  hightop: { t: 0.014, top: 0.3, front: 0.7, fadeSides: true, flat: true },
  mohawk: { t: 0.01, top: 0.0, front: 0.7, ridge: 0.2 },
  curly: { t: 0.15, top: 0.12, front: 0.68, bumps: 0.035, coily: true },
  afro: { t: 0.06, top: 0.0, front: 0.67, sideY: 0.02, nape: -0.4, bumps: 0.03, round: true, coily: true },
  locs: { t: 0.03, top: 0.02, front: 0.7, tubes: { n: 70, r: 0.034, end: -1.05, knots: 1 } },
  longlocs: { t: 0.03, top: 0.02, front: 0.7, tubes: { n: 80, r: 0.034, end: -1.62, knots: 1 } },
  braids: { t: 0.022, top: 0.0, front: 0.72, tubes: { n: 120, r: 0.023, end: -1.5, braid: 1 } },
  ponytail: { t: 0.022, top: 0.0, front: 0.73, pony: true },
  bun: { t: 0.022, top: 0.0, front: 0.72, bun: true },
  pixie: { t: 0.05, top: 0.06, front: 0.74, quiff: 0.07, side: true },
  bob: { t: 0.05, top: 0.05, front: 0.74, end: -0.8, open: 0.95 },
  long: { t: 0.05, top: 0.05, front: 0.74, end: -1.36, open: 0.95 },
  wavy: { t: 0.06, top: 0.06, front: 0.74, end: -1.3, open: 0.95, wave: 0.03 },
};

/** How low the hair comes at angle a (0 = the forehead, π = the nape). */
function hairline(H, a) {
  const half = Math.PI / 2;
  const side = H.sideY ?? 0.3, nape = H.nape ?? -0.35;
  if (a < half) return H.front - (H.front - side) * Math.pow(a / half, 1.3);
  return side - (side - nape) * Math.pow((a - half) / half, 0.8);
}

/** A lock of hair as a tube: from `root`, out a little, then down under gravity, around the head. */
function tube(out, tris, lines, sdf, root, n, opts, seed) {
  const SEG = 16, RING = 6, base = out.k / STRIDE;
  const pts = [];
  let p = [root[0], root[1], root[2]];
  // Locks from the front sweep to the sides, so the face stays clear.
  const side = Math.sign(root[0]) || 1;
  const fwd = smooth(0.0, 0.6, root[2]);
  let dir = [n[0] + side * fwd * 0.8, n[1] * 0.4, n[2] - fwd * 0.9];
  const step = opts.len / SEG;
  for (let s = 0; s <= SEG; s++) {
    pts.push([p[0], p[1], p[2]]);
    dir = [dir[0] * 0.75, dir[1] * 0.75 - 0.32, dir[2] * 0.75 + 0.02];
    const l = Math.hypot(dir[0], dir[1], dir[2]) || 1;
    dir = dir.map((x) => x / l);
    p = [p[0] + dir[0] * step, p[1] + dir[1] * step, p[2] + dir[2] * step];
    // Never across the face.
    if (p[2] > 0.05 && Math.abs(p[0]) < 0.66 && p[1] < 0.45 && p[1] > -1.0) p[0] = side * Math.max(Math.abs(p[0]), 0.66);
    // Rest on the head and shoulders instead of passing through them.
    for (let k = 0; k < 3; k++) {
      const d = sdf(p[0], p[1], p[2]) - opts.r * 1.6;
      if (d >= 0) break;
      const g = grad(sdf, p[0], p[1], p[2]);
      p = [p[0] - g[0] * d, p[1] - g[1] * d, p[2] - g[2] * d];
    }
  }
  for (let s = 0; s <= SEG; s++) {
    const c = pts[s], nx = pts[Math.min(SEG, s + 1)], pv = pts[Math.max(0, s - 1)];
    let T = [nx[0] - pv[0], nx[1] - pv[1], nx[2] - pv[2]];
    const tl = Math.hypot(T[0], T[1], T[2]) || 1;
    T = T.map((x) => x / tl);
    let U = [-T[2], 0, T[0]];
    let ul = Math.hypot(U[0], U[1], U[2]);
    if (ul < 1e-4) { U = [1, 0, 0]; ul = 1; }
    U = U.map((x) => x / ul);
    const W = [T[1] * U[2] - T[2] * U[1], T[2] * U[0] - T[0] * U[2], T[0] * U[1] - T[1] * U[0]];
    const v = s / SEG;
    const r = opts.r * (1 - 0.35 * v * v) * (opts.knots ? 1 + 0.12 * Math.sin(v * 40 + seed * 7) : 1);
    for (let q = 0; q < RING; q++) {
      const ang = (q / RING) * TAU;
      const nn = [U[0] * Math.cos(ang) + W[0] * Math.sin(ang), U[1] * Math.cos(ang) + W[1] * Math.sin(ang), U[2] * Math.cos(ang) + W[2] * Math.sin(ang)];
      out.v.set([c[0] + nn[0] * r, c[1] + nn[1] * r, c[2] + nn[2] * r, nn[0], nn[1], nn[2], v, seed + (opts.braid ? 2 : 0), clamp(v * 0.9 + 0.1, 0, 1), 2, 0.7 + 0.3 * v], out.k);
      out.k += STRIDE;
    }
  }
  for (let s = 0; s < SEG; s++) for (let q = 0; q < RING; q++) {
    const a0 = base + s * RING + q, a1 = base + s * RING + ((q + 1) % RING), b0 = a0 + RING, b1 = a1 + RING;
    tris.push(a0, b0, a1, a1, b0, b1);
    if (q % 3 === 0) lines.push(a0, b0);
  }
}

function buildHair(body, style) {
  const H = HAIR[style];
  if (!H) return null;
  const { rows, NY, R, sdf } = body;
  const mask = new Uint8Array(NY * NA);
  const T = H.tubes;
  const extra = (H.bun ? 17 * 13 : 0) + (T ? T.n * 17 * 6 : 0) + (H.pony ? 3 * 17 * 6 : 0);
  const v = new Float32Array((NY * NA + 1 + extra) * STRIDE);
  const P = new Float32Array(NY * NA * 3);
  for (let i = 0; i < NA; i++) {
    const th = (i / NA) * TAU;
    const a = Math.min(th, TAU - th);
    const dx = Math.sin(th), dz = Math.cos(th);
    const jitter = 0.05 * Math.sin(i * 1.7) + 0.035 * Math.sin(i * 4.3 + 1.1);
    let widest = 0;
    for (let j = 0; j < NY; j++) {
      const y = rows[j], idx = j * NA + i;
      const r0 = R[idx];
      const bx = dx * r0, bz = AXIS_Z + dz * r0;
      const bo = idx * STRIDE;
      const n = [body.verts[bo + 3], body.verts[bo + 4], body.verts[bo + 5]];
      const hl = hairline(H, a);
      let t = H.t * (0.45 + 0.55 * smooth(0.0, 0.7, y)) + H.top * smooth(0.55, 1.05, y);
      if (H.fadeSides) t = H.t * smooth(0.0, 0.5, y) + H.top * smooth(0.5, 0.85, y);
      if (H.flat) t = H.t + H.top * smooth(0.4, 0.75, y) * (1 - 0.5 * smooth(0.95, 1.12, y));
      if (H.ridge) t += H.ridge * smooth(0.16, 0.04, Math.abs(bx)) * smooth(0.25, 0.7, y);
      if (H.quiff) t += H.quiff * smooth(0.6, 0.0, a) * smooth(0.5, 0.95, y);
      if (H.side) t += 0.04 * smooth(0.2, 0.8, -bx) * smooth(0.3, 0.8, y);
      if (H.bumps) t += H.bumps * (0.5 + 0.5 * Math.sin(th * 11 + y * 13) * Math.sin(th * 7 - y * 17));
      t = Math.max(t, 0.012);
      let px = bx + n[0] * t, py = y + n[1] * t, pz = bz + n[2] * t;
      if (H.round) {
        const cx = 0, cy = 0.36, cz = -0.14;
        const vx = px - cx, vy = py - cy, vz = pz - cz, L = Math.hypot(vx, vy, vz) || 1;
        const want = L + (0.88 + (H.bumps || 0) * Math.sin(th * 9 + y * 11) - L) * smooth(hl - 0.04, hl + 0.16, y) * (L < 0.88 ? 1 : 0);
        px = cx + (vx / L) * want; py = cy + (vy / L) * want; pz = cz + (vz / L) * want;
      }
      // One row past the hairline: the shader trims it smooth.
      let on = y > hl - 0.12;
      const curtain = H.end != null && a > H.open && y <= hl && y > H.end + jitter + (a < 1.6 ? 0.22 * smooth(1.6, 1.0, a) : 0);
      if (on) widest = Math.max(widest, Math.hypot(px, pz - AXIS_Z));
      if (curtain) {
        // Falls straight down from the widest point, resting on the shoulders.
        let rr = Math.max(widest, r0 + H.t);
        if (H.wave) rr += H.wave * Math.sin(y * 13 + th * 2);
        rr += 0.01 * Math.sin(th * 23 + y * 3);
        px = dx * rr; pz = AXIS_Z + dz * rr; py = y;
        on = true;
      }
      mask[idx] = on ? 1 : 0;
      P.set([px, py, pz], idx * 3);
    }
  }
  // Normals from the hair's own surface.
  let k = 0;
  for (let j = 0; j < NY; j++) for (let i = 0; i < NA; i++) {
    const idx = j * NA + i;
    const p = (jj, ii) => { const q = (clamp(jj, 0, NY - 1) * NA + ((ii + NA) % NA)) * 3; return [P[q], P[q + 1], P[q + 2]]; };
    const a = p(j, i - 1), b = p(j, i + 1), c = p(j - 1, i), d = p(j + 1, i);
    const tx = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], ty = [d[0] - c[0], d[1] - c[1], d[2] - c[2]];
    let n = [ty[1] * tx[2] - ty[2] * tx[1], ty[2] * tx[0] - ty[0] * tx[2], ty[0] * tx[1] - ty[1] * tx[0]];
    const self = p(j, i);
    const out = [self[0], 0, self[2] - AXIS_Z];
    if (n[0] * out[0] + n[2] * out[2] + n[1] * (self[1] > body.top - 0.2 ? 1 : 0) < 0) n = n.map((x) => -x);
    const l = Math.hypot(n[0], n[1], n[2]) || 1;
    const y = rows[j];
    const hang = clamp((0.35 - y) / 1.7, 0, 1);
    v.set([P[idx * 3], P[idx * 3 + 1], P[idx * 3 + 2], n[0] / l, n[1] / l, n[2] / l, 0, 0, hang, 1, 0.75 + 0.25 * smooth(-0.6, 0.9, y)], k);
    k += STRIDE;
  }
  const cap = NY * NA;
  v.set([0, body.top + 0.012 + H.t + H.top + (H.round ? 0.12 : 0), AXIS_Z, 0, 1, 0, 0, 0, 0, 1, 1], k);
  k += STRIDE;
  const tris = [], lines = [];
  for (let j = 0; j < NY - 1; j++) for (let i = 0; i < NA; i++) {
    const a = j * NA + i, b = j * NA + ((i + 1) % NA), c = a + NA, d = b + NA;
    if (mask[a] && mask[b] && mask[c] && mask[d]) tris.push(a, c, b, b, c, d);
    if (i % 2 === 0 && mask[a] && mask[c]) lines.push(a, c);
  }
  for (let i = 0; i < NA; i++) if (mask[i] && mask[(i + 1) % NA]) tris.push(cap, i, (i + 1) % NA);
  const out = { v, k };
  if (T) {
    // Locks rooted all over the scalp, shorter at the front so the face shows.
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let q = 0; q < T.n; q++) {
      const yy = 1 - (q + 0.5) / T.n;
      const th = q * golden;
      const wrapped = ((th % TAU) + TAU) % TAU;
      const ang = Math.min(wrapped, TAU - wrapped); // 0 = front
      const y = 0.2 + yy * 0.92;
      if (y < hairline(H, ang) - 0.02 || y > body.top - 0.02) continue;
      const r0 = hit(sdf, y, wrapped, 0.6);
      const root = [Math.sin(wrapped) * r0, y, AXIS_Z + Math.cos(wrapped) * r0];
      const n = grad(sdf, root[0], root[1], root[2]);
      const front = smooth(1.2, 0.2, ang);
      const end = T.end + (q % 5) * 0.04 + front * (T.end < -1.2 ? 0.75 : 0.55);
      const len = Math.max(0.25, y - end) * 1.15;
      tube(out, tris, lines, sdf, root, n, { r: T.r, len, knots: T.knots, braid: T.braid }, (q * 0.6180339) % 1);
    }
  }
  if (H.pony) {
    for (let q = 0; q < 3; q++) tube(out, tris, lines, sdf, [(q - 1) * 0.05, 0.62, -0.95], [0, 0.2, -1], { r: 0.075, len: 1.2 }, q / 3);
  }
  k = out.k;
  if (H.bun) {
    // A bun at the back of the head.
    const base = k / STRIDE, c = [0, 0.66, -0.92], r = 0.21;
    for (let a = 0; a <= 12; a++) for (let b = 0; b <= 16; b++) {
      const phi = (a / 12) * Math.PI, th = (b / 16) * TAU;
      const n = [Math.sin(phi) * Math.sin(th), Math.cos(phi), Math.sin(phi) * Math.cos(th)];
      const rr = r * (1 + 0.06 * Math.sin(th * 5 + phi * 3));
      v.set([c[0] + n[0] * rr, c[1] + n[1] * rr, c[2] + n[2] * rr, n[0], n[1], n[2], 0, 0, 0.05, 1, 0.9], k);
      k += STRIDE;
    }
    for (let a = 0; a < 12; a++) for (let b = 0; b < 16; b++) {
      const p0 = base + a * 17 + b, p1 = p0 + 1, p2 = p0 + 17, p3 = p2 + 1;
      tris.push(p0, p2, p1, p1, p2, p3);
      if (b % 2 === 0) lines.push(p0, p2);
    }
  }
  return { verts: v.subarray(0, k), tris: new Uint16Array(tris), lines: new Uint16Array(lines), front: H.front, side: H.sideY ?? 0.3, nape: H.nape ?? -0.35, open: H.end != null ? H.open : 9, coily: !!H.coily };
}

// ---- beards and glasses -------------------------------------------------------

export const BEARDS = { none: "None", stubble: "Stubble", mustache: "Mustache", goatee: "Goatee", short: "Short beard", full: "Full beard" };
export const GLASSES = { none: "None", round: "Round glasses", visor: "Visor" };

/** How much beard grows here (0…1) for a style. */
function beardAt(style, x, y, z) {
  const ax = Math.abs(x);
  if (z < -0.25 || y > 0.2 || y < -1.08) return 0;
  const must = smooth(0.23, 0.17, ax) * smooth(-0.415, -0.395, y) * smooth(-0.3, -0.34, y) * smooth(0.45, 0.55, z);
  const goat = smooth(0.2, 0.14, ax) * smooth(-0.555, -0.575, y) * smooth(-0.98, -0.9, y) * smooth(0.1, 0.25, z);
  if (style === "mustache") return must;
  if (style === "goatee") return Math.max(must, goat);
  // Short and full: everything below the cheek line, down under the jaw;
  // the lips stay clear.
  const cheek = -0.33 + 0.45 * smooth(0.22, 0.62, ax);
  let b = smooth(cheek + 0.07, cheek - 0.08, y) * smooth(-1.08, -0.86, y) * smooth(-0.28, -0.1, z);
  if (ax > 0.64 && y > -0.3) b *= smooth(0.72, 0.64, ax);
  const lips = smooth(0.2, 0.16, ax) * smooth(-0.41, -0.425, y) * smooth(-0.575, -0.555, y) * smooth(0.4, 0.5, z);
  b = Math.max(b * (1 - lips), must);
  return b;
}

const BEARD_T = { stubble: 0.008, mustache: 0.03, goatee: 0.045, short: 0.035, full: 0.075 };

function buildBeard(body, style) {
  if (!BEARD_T[style]) return null;
  const { NY } = body;
  const bv = body.verts;
  const v = new Float32Array(NY * NA * STRIDE);
  const on = new Uint8Array(NY * NA);
  let k = 0;
  for (let idx = 0; idx < NY * NA; idx++) {
    const o = idx * STRIDE;
    const x = bv[o], y = bv[o + 1], z = bv[o + 2];
    const b = beardAt(style, x, y, z);
    on[idx] = b > 0.02 ? 1 : 0;
    let t = BEARD_T[style] * Math.sqrt(b);
    if (style === "full") t += 0.05 * smooth(-0.6, -0.85, y) * smooth(0.35, 0.1, Math.abs(x)) * b;
    v.set([x + bv[o + 3] * t, y + bv[o + 4] * t, z + bv[o + 5] * t, bv[o + 3], bv[o + 4], bv[o + 5], bv[o + 6], b, 0, 3, bv[o + 10]], k);
    k += STRIDE;
  }
  const tris = [], lines = [];
  for (let j = 0; j < NY - 1; j++) for (let i = 0; i < NA; i++) {
    const a = j * NA + i, b = j * NA + ((i + 1) % NA), c = a + NA, d = b + NA;
    if (on[a] && on[b] && on[c] && on[d]) tris.push(a, c, b, b, c, d);
    if (j % 2 === 1 && on[a] && on[b]) lines.push(a, b);
  }
  if (!tris.length) return null;
  return { verts: v, tris: new Uint16Array(tris), lines: new Uint16Array(lines) };
}

/** A tube along a fixed path (glasses frames). */
function pathTube(out, tris, lines, pts, r, code, closed) {
  const RING = 6, base = out.k / STRIDE, n = pts.length;
  for (let s = 0; s < n; s++) {
    const nx = pts[closed ? (s + 1) % n : Math.min(n - 1, s + 1)], pv = pts[closed ? (s - 1 + n) % n : Math.max(0, s - 1)];
    let T = [nx[0] - pv[0], nx[1] - pv[1], nx[2] - pv[2]];
    const tl = Math.hypot(T[0], T[1], T[2]) || 1;
    T = T.map((x) => x / tl);
    let U = Math.abs(T[2]) < 0.9 ? [T[1] * 1 - T[2] * 0, T[2] * 0 - T[0] * 1, 0] : [0, -T[2], T[1]];
    U = [T[1] * 0 - T[2] * 1, T[2] * 0 - T[0] * 0, T[0] * 1 - T[1] * 0]; // T × z
    let ul = Math.hypot(U[0], U[1], U[2]);
    if (ul < 0.2) { U = [0, 1, 0]; ul = 1; }
    U = U.map((x) => x / ul);
    const W = [T[1] * U[2] - T[2] * U[1], T[2] * U[0] - T[0] * U[2], T[0] * U[1] - T[1] * U[0]];
    for (let q = 0; q < RING; q++) {
      const a = (q / RING) * TAU;
      const nn = [U[0] * Math.cos(a) + W[0] * Math.sin(a), U[1] * Math.cos(a) + W[1] * Math.sin(a), U[2] * Math.cos(a) + W[2] * Math.sin(a)];
      const c = pts[s];
      out.v.set([c[0] + nn[0] * r, c[1] + nn[1] * r, c[2] + nn[2] * r, nn[0], nn[1], nn[2], 0, code, 0, 4, 1], out.k);
      out.k += STRIDE;
    }
  }
  const segs = closed ? n : n - 1;
  for (let s = 0; s < segs; s++) for (let q = 0; q < RING; q++) {
    const s1 = (s + 1) % n;
    const a0 = base + s * RING + q, a1 = base + s * RING + ((q + 1) % RING), b0 = base + s1 * RING + q, b1 = base + s1 * RING + ((q + 1) % RING);
    tris.push(a0, b0, a1, a1, b0, b1);
    if (q === 0) lines.push(a0, b0);
  }
}

/** Glasses: frames (solid) and glass (see-through), as two meshes. */
function buildGlasses(body, style) {
  if (style === "round") {
    const out = { v: new Float32Array(4000 * STRIDE), k: 0 }, tris = [], lines = [];
    const z0 = body.B.noseZ - 0.14;
    for (const sx of [-1, 1]) {
      const ring = [];
      for (let q = 0; q < 28; q++) { const a = (q / 28) * TAU; ring.push([sx * 0.245 + Math.cos(a) * 0.135, 0.1 + Math.sin(a) * 0.115, z0 - 0.02 * Math.abs(Math.cos(a))]); }
      pathTube(out, tris, lines, ring, 0.011, 0, true);
      pathTube(out, tris, lines, [[sx * 0.38, 0.13, z0 - 0.03], [sx * 0.6, 0.13, 0.42], [sx * 0.67, 0.11, 0.1], [sx * 0.68, 0.06, -0.08], [sx * 0.66, -0.02, -0.16]], 0.009, 0, false);
    }
    pathTube(out, tris, lines, [[-0.11, 0.13, z0 + 0.01], [-0.05, 0.16, z0 + 0.05], [0.05, 0.16, z0 + 0.05], [0.11, 0.13, z0 + 0.01]], 0.009, 0, false);
    // The lenses: flat discs, drawn see-through.
    const glass = { v: new Float32Array(80 * STRIDE), k: 0 }, gtris = [];
    for (const sx of [-1, 1]) {
      const c = glass.k / STRIDE;
      glass.v.set([sx * 0.245, 0.1, z0 - 0.005, 0, 0, 1, 0, 1, 0, 4, 1], glass.k); glass.k += STRIDE;
      for (let q = 0; q <= 28; q++) { const a = (q / 28) * TAU; glass.v.set([sx * 0.245 + Math.cos(a) * 0.13, 0.1 + Math.sin(a) * 0.11, z0 - 0.02 * Math.abs(Math.cos(a)), 0, 0, 1, 0, 1, 0, 4, 1], glass.k); glass.k += STRIDE; }
      for (let q = 0; q < 28; q++) gtris.push(c, c + 1 + q, c + 2 + q);
    }
    return {
      frame: { verts: out.v.subarray(0, out.k), tris: new Uint16Array(tris), lines: new Uint16Array(lines) },
      glass: { verts: glass.v.subarray(0, glass.k), tris: new Uint16Array(gtris), lines: new Uint16Array(0) },
    };
  }
  if (style === "visor") {
    // A curved band of glass across the eyes, standing off the face.
    const { NY, rows } = body;
    const bv = body.verts;
    const v = new Float32Array(NY * NA * STRIDE), on = new Uint8Array(NY * NA);
    let k = 0;
    for (let j = 0; j < NY; j++) for (let i = 0; i < NA; i++) {
      const idx = j * NA + i, o = idx * STRIDE;
      const x = bv[o], y = rows[j], z = bv[o + 2];
      const inBand = y > -0.03 && y < 0.25 && Math.abs(x) < 0.67 && z > -0.1;
      on[idx] = inBand ? 1 : 0;
      // Out from the middle of the head, clearing the brow and nose bridge.
      const ang = (i / NA) * TAU;
      const rr = 0.9 + 0.03 * Math.cos(ang);
      const vx = Math.sin(ang) * rr, vz = AXIS_Z + Math.cos(ang) * rr;
      v.set([vx, y, vz, Math.sin(ang), 0, Math.cos(ang), 0, 2, 0, 4, 1], k);
      k += STRIDE;
    }
    const tris = [], lines = [];
    for (let j = 0; j < NY - 1; j++) for (let i = 0; i < NA; i++) {
      const a = j * NA + i, b = j * NA + ((i + 1) % NA), c = a + NA, d = b + NA;
      if (on[a] && on[b] && on[c] && on[d]) tris.push(a, c, b, b, c, d);
      if (j % 3 === 0 && on[a] && on[b]) lines.push(a, b);
    }
    return { frame: null, glass: { verts: v, tris: new Uint16Array(tris), lines: new Uint16Array(lines) } };
  }
  return null;
}

// ---- drawing ----------------------------------------------------------------

const VERT = `
attribute vec3 aPos; attribute vec3 aNrm; attribute vec4 aF; attribute float aAO;
uniform float uYaw, uPitch, uRoll, uOpen, uBlink, uSmile, uHairLag, uTime, uSquash;
varying vec3 vO; varying vec3 vN; varying float vKind; varying float vAO; varying vec2 vS;
mat3 rx(float a){ float c = cos(a), s = sin(a); return mat3(1., 0., 0., 0., c, s, 0., -s, c); }
mat3 ry(float a){ float c = cos(a), s = sin(a); return mat3(c, 0., -s, 0., 1., 0., s, 0., c); }
mat3 rz(float a){ float c = cos(a), s = sin(a); return mat3(c, s, 0., -s, c, 0., 0., 0., 1.); }
void main(){
  vec3 p = aPos;
  float kind = aF.w, hair = step(.5, kind), skin = 1. - hair;
  float hang = hair * aF.z, lip = skin * aF.z;
  // Talking: the jaw drops, the lip corners lift with a smile.
  float jawOn = skin + step(2.5, kind) * step(kind, 3.5);
  p.y -= jawOn * aF.x * uOpen * .12; p.z -= jawOn * aF.x * uOpen * .025;
  float c = clamp(abs(p.x) / .17, 0., 1.);
  p.y += lip * uSmile * .03 * c * c;
  p.x *= 1. + lip * uSmile * .04 * (1. - uOpen);
  // The hologram blinks by squeezing the eye's lines shut.
  p.y = mix(p.y, .105 + (p.y - .105) * (1. - .85 * uBlink), skin * aF.y * uSquash);
  // Hair moves in the air a little, more at the ends.
  p.x += hang * hang * .03 * sin(uTime * 1.3 + aPos.y * 2.);
  p.z += hang * hang * .02 * sin(uTime * .9 + aPos.x * 3.);
  // The head turns on the neck; the shoulders stay put; long hair lags behind.
  float w = smoothstep(-1.45, -.72, aPos.y);
  if (kind > .5 && kind < 2.5) w = max(w, .85);
  vec3 pivot = vec3(0., -.95, -.1);
  mat3 R = ry(uYaw * w - uHairLag * hang) * rx(uPitch * w) * rz(uRoll * w);
  vec3 q = R * (p - pivot) + pivot;
  vN = R * aNrm; vO = aPos; vKind = kind; vAO = aAO; vS = aF.xy;
  gl_Position = vec4(q.x * .62, (q.y + .3) * .62, -q.z * .3, 1. - q.z * .07);
}`;

const FRAG = `
precision highp float;
varying vec3 vO; varying vec3 vN; varying float vKind; varying float vAO; varying vec2 vS;
uniform int uMode; // 0 holo lines, 1 holo glass, 2 skin, 3 hair
uniform vec3 uSkin, uLip, uHair, uEye, uAccent, uHolo;
uniform float uTime, uEnergy, uBlink, uOpen, uFemale, uTech, uMouthY, uBand, uLipW, uEyeR, uArch, uFront, uHairOpen, uStubble, uSide, uNape, uCoily;
uniform vec2 uGaze;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float hairline(float a){
  float hq = 1.5708;
  if (a < hq) return uFront - (uFront - uSide) * pow(a / hq, 1.3);
  return uSide - (uSide - uNape) * pow((a - hq) / hq, .8);
}
vec3 toScreen(vec3 c){ return pow(max(c, 0.), vec3(1. / 2.2)); }
void main(){
  vec3 N = normalize(vN), V = vec3(0., 0., 1.);
  if (dot(N, V) < -.2 && uMode == 3) N = -N; // the inside of hair
  vec3 o = vO; float ax = abs(o.x);
  float facing = max(dot(N, V), 0.);
  float fres = pow(1. - facing, 3.);
  // The bust fades out at the bottom, into specks of light.
  float base = 1. - smoothstep(-1.42, -1.76, o.y);
  // Hair that's part of the cap stops at a soft hairline (curtains frame the face).
  if (vKind > .5 && vKind < 1.5) {
    float th = atan(o.x, o.z + .08);
    float a = abs(th);
    float hl = hairline(a) + (hash(vec2(floor(th * 260.), 1.)) - .5) * .014 + .006 * sin(th * 40.);
    if (o.y < hl && a < uHairOpen) discard;
  }
  // The eye under this point, if any.
  vec3 ec = vec3(sign(o.x) * .24, .105, .53);
  vec3 le = o - ec;
  float onEye = step(length(le), uEyeR + .012) * step(0., le.z) * step(vKind, .5);
  vec3 g = normalize(vec3(uGaze, 1.));
  float ca = dot(normalize(le), g);
  float iris = smoothstep(.75, .78, ca), pupil = smoothstep(.948, .956, ca);
  float lidTop = (.42 - 1.4 * uBlink) * uEyeR, lidLow = -.4 * uEyeR;
  if (uMode < 2) {
    if (hash(gl_FragCoord.xy + floor(uTime * 20.)) > base) discard;
    float scan = .86 + .14 * sin(o.y * 140. - uTime * 5.);
    float sweepY = 1.35 - mod(uTime * .5, 3.4);
    float sweep = exp(-pow((o.y - sweepY) * 8., 2.));
    float eyeLit = onEye * step(le.y, lidTop) * (iris * (1. - pupil) * 1.5 - pupil * .6);
    if (uMode == 0) {
      // Lit like a sculpture from the upper left, so the features read.
      vec3 Lh = normalize(vec3(-.35, .4, .85));
      float lam = clamp(dot(N, Lh), 0., 1.);
      float I = (.12 + .95 * pow(lam, 1.3)) * (.45 + .55 * vAO);
      vec3 c = uHolo * (I * scan * 1.55 + fres * .9 + sweep * .7 + eyeLit) * (.9 + uEnergy * .35);
      c *= mix(1., .8, step(.5, vKind));
      float lips = smoothstep(.12, .0, abs(o.y - uMouthY) - .03) * step(ax, uLipW) * step(.5, o.z);
      c = mix(c, c * vec3(1.2, .85, 1.25), lips * uEnergy);
      gl_FragColor = vec4(c, 1.);
    } else {
      gl_FragColor = vec4(uHolo * (.03 + fres * .32 + sweep * .05) * base, 1.);
    }
    return;
  }
  if (hash(gl_FragCoord.xy) > base * 1.02) discard;
  vec3 L1 = normalize(vec3(-.5, .55, .75)), L2 = normalize(vec3(.75, .05, .45)), L3 = normalize(vec3(.3, .35, -.9));
  vec3 H1 = normalize(L1 + V);
  float d1 = dot(N, L1), d2 = dot(N, L2);
  vec3 col;
  if (uMode == 4) {
    // Glasses: dark frames; see-through lenses; a glowing visor.
    float code = vS.y;
    vec3 Hs = normalize(L1 + V);
    float sp = pow(max(dot(N, Hs), 0.), 80.);
    if (code < .5) {
      gl_FragColor = vec4(toScreen(vec3(.012) + sp * .9 + uAccent * fres * .4), 1.);
    } else if (code < 1.5) {
      float streak = smoothstep(.02, .0, abs(o.x * .7 + o.y - .15 - sign(o.x) * .1)) * .5;
      float a = .12 + streak + fres * .2;
      gl_FragColor = vec4(toScreen(vec3(.6, .75, .9) * (.3 + streak)) * a, a);
    } else {
      float scan = .8 + .2 * sin(o.y * 300. + uTime * 4.);
      float edge = smoothstep(.2, .245, abs(o.y - .11)) + smoothstep(.55, .66, abs(o.x));
      vec3 c = uAccent * 2.2 * (.35 + .65 * fres) * scan + edge * uAccent * 3. + sp * .8;
      float a = clamp(.42 + edge * .5 + sp, 0., 1.);
      gl_FragColor = vec4(toScreen(c) * a, a);
    }
    return;
  }
  if (uMode == 3 && vKind > 2.5) {
    // A beard: soft at the edges, made of short dark hairs; stubble is a shadow of dots.
    float dens = vS.y;
    float h = hash(floor(o.xy * vec2(420., 300.)) + floor(o.z * 300.));
    if (dens * (uStubble > .5 ? .62 : 1.3) < h) discard;
    float st = hash(floor(o.xy * vec2(700., 140.)));
    vec3 bc = uHair * (.6 + .6 * st);
    if (uStubble > .5) bc = mix(uSkin * .45, uHair, .75);
    float diff = clamp(d1 * .5 + .5, 0., 1.);
    col = bc * (diff * .95 + .14) * vAO + uAccent * fres * .2;
    gl_FragColor = vec4(toScreen(col), 1.);
    return;
  }
  if (uMode == 3) {
    float th = atan(o.x, o.z + .08);
    vec3 hc;
    vec3 T = normalize(vec3(0., 1., 0.) - N * N.y);
    float s = 1.;
    if (vKind > 1.5) {
      // A lock: dreads are knotty and matte; braids zig-zag.
      float along = vS.x, seed = fract(vS.y);
      float around = atan(N.z, N.x);
      float braid = step(1.5, vS.y);
      float knot = .55 + .45 * sin(along * 70. + around * 2. + seed * 20.) * sin(along * 23. + seed * 9.);
      float zig = .5 + .5 * sin(along * 140. + abs(fract(around / 3.1416) - .5) * 14.);
      s = mix(knot, zig, braid);
      hc = uHair * (.55 + .55 * s) * (.85 + .3 * seed);
    } else {
      // Fine strands, two soft shines across them.
      float st = .5 + .5 * sin(th * 150. + sin(th * 23. + o.y * 4.) * 4. + o.y * 3.);
      float s2 = .5 + .5 * sin(th * 61. - o.y * 9.);
      s = st * (.7 + .3 * s2);
      if (uCoily > .5) {
        // Tight coils: a bumpy, matte texture instead of long strands.
        float c1 = sin(o.x * 130. + sin(o.y * 150.) * 2.) * sin(o.y * 140. + sin(o.z * 120.) * 2.) * sin(o.z * 125. + sin(o.x * 110.) * 2.);
        s = .5 + .5 * c1;
      }
      hc = uHair * (.62 + .5 * s);
    }
    float tH = dot(T, normalize(H1 + N * .12));
    float spec1 = pow(sqrt(max(0., 1. - tH * tH)), 90.);
    float tH2 = dot(T, normalize(H1 - N * .18));
    float spec2 = pow(sqrt(max(0., 1. - tH2 * tH2)), 30.);
    float diff = clamp(d1 * .5 + .5, 0., 1.);
    float shine = vKind > 1.5 || uCoily > .5 ? .3 : 1.;
    vec3 shineCol = mix(uHair * 2.2 + .03, vec3(1., .96, .9), .35);
    col = hc * (diff * .95 + .16) * vAO + shine * (spec1 * .22 * (.4 + .6 * s) * shineCol + spec2 * .3 * uHair * (.6 + .4 * s));
    col += uAccent * fres * .3;
    gl_FragColor = vec4(toScreen(col), 1.);
    return;
  }
  // Skin, with a little colour where blood is close: cheeks, nose, ears, lips.
  vec3 skin = uSkin;
  float flush = exp(-pow((ax - .36) / .14, 2.) - pow((o.y + .08) / .12, 2.)) * (.35 + .35 * uFemale)
              + exp(-pow(o.x / .07, 2.) - pow((o.y + .2) / .08, 2.)) * .3
              + smoothstep(.6, .7, ax) * step(-.25, o.y) * step(o.y, .3) * .3;
  skin = mix(skin, skin * vec3(1.05, .72, .66), clamp(flush, 0., 1.) * .4);
  // Brows.
  float by = .235 + uArch * (1. - pow((ax - .25) / .15, 2.));
  float bth = mix(.032, .018, uFemale) * mix(1., .45, smoothstep(.13, .4, ax));
  float brow = smoothstep(bth, bth * .45, abs(o.y - by)) * step(.1, ax) * step(ax, .41) * step(.5, o.z);
  brow *= .7 + .3 * hash(vec2(floor(o.x * 220.), floor(o.y * 60.)));
  skin = mix(skin, uHair * .7 + skin * .08, brow * .9);
  // Lips.
  float ul = pow(o.x / (uLipW * .98), 2.) + pow((o.y + .43) / (uLipW * .28 + .012 * uFemale), 2.);
  float ll = pow(o.x / (uLipW * .9), 2.) + pow((o.y + .515) / (uLipW * .33 + .015 * uFemale), 2.);
  float lipm = (1. - smoothstep(.7, 1., min(ul, ll))) * step(.55, o.z);
  skin = mix(skin, uLip, lipm * .85);
  // Mouth: the strip between the lips — a line when closed, open when talking.
  float mouth = step(abs(o.y - uMouthY), uBand) * smoothstep(uLipW * .95, uLipW * .7, ax) * step(.5, o.z);
  float sTop = (o.y - (uMouthY - uBand)) / (2. * uBand);
  vec3 inside = mix(vec3(.05, .01, .01), vec3(.62, .58, .5), step(.62, sTop) * step(.25, uOpen) * step(ax, uLipW * .6));
  float d = clamp((d1 + .4) / 1.4, 0., 1.);
  float sss = smoothstep(0., .35, d) - smoothstep(.35, .8, d);
  col = skin * (d * vec3(1.08, 1., .92) * 1.25 + clamp((d2 + .3) / 1.3, 0., 1.) * vec3(.45, .55, .8) * .35 + .07) * vAO;
  col += skin * vec3(.8, .18, .1) * sss * .35;
  float oil = .05 + .05 * exp(-pow(o.x / .08, 2.)) * step(-.25, o.y) + lipm * .08;
  col += pow(max(dot(N, H1), 0.), 40.) * oil;
  col = mix(col, inside * (.4 + .6 * d), mouth * clamp(.55 + uOpen * 4., 0., 1.));
  // Eyes: white, an iris with fine fibres, a pupil, a catchlight, and lids.
  if (onEye > .5) {
    vec3 t = normalize(le) - g * ca;
    float ang = atan(t.y, t.x);
    float fib = .7 + .3 * sin(ang * 46. + sin(ang * 7.) * 2.);
    vec3 ir = uEye * fib * mix(1.4, .6, smoothstep(.83, .9, ca) * (1. - smoothstep(.93, .955, ca)));
    ir = mix(ir * .3, ir, smoothstep(.75, .81, ca));
    vec3 sclera = mix(vec3(.82, .8, .78), vec3(.75, .5, .48), smoothstep(.5, .85, 1. - le.z / uEyeR));
    vec3 e = mix(sclera, ir, iris);
    e = mix(e, vec3(.003), pupil);
    e *= .5 + .5 * smoothstep(lidTop, lidTop - .035, le.y);
    e += pow(max(dot(N, H1), 0.), 260.) * 1.6 + uEye * iris * uTech * .7;
    float open = smoothstep(lidTop + .004, lidTop - .004, le.y) * step(lidLow, le.y);
    col = mix(col * .85, e, open);
    float lash = smoothstep(.014, .0, abs(le.y - lidTop)) * step(abs(le.x), uEyeR * 1.05);
    col = mix(col, vec3(.004), lash * (.5 + .45 * uFemale));
  }
  // A cool rim of light, and (if on) glowing seams like a cyborg's.
  col += uAccent * fres * .5 * (.5 + .5 * clamp(dot(N, L3) + .5, 0., 1.));
  if (uTech > .5) {
    float side = smoothstep(.42, .55, ax) * step(-1.1, o.y) * step(o.y, .55) * step(o.z, .45);
    float f = o.y * 7. + sin(o.z * 9.) * .5;
    float k = fract(f);
    float line = smoothstep(.035, .0, min(k, 1. - k)) * step(.5, fract(o.z * 3. + floor(f) * .37));
    float pulse = .55 + .45 * sin(uTime * 2.4 - o.y * 6.);
    col += uAccent * line * side * pulse * 1.6;
  }
  col += uAccent * smoothstep(-1.5, -1.72, o.y) * .6;
  gl_FragColor = vec4(toScreen(col), 1.);
}`;

const hex = (h, fallback) => {
  const m = /^#?([0-9a-f]{6})$/i.exec(String(h || "").trim());
  const s = m ? m[1] : fallback;
  return [parseInt(s.slice(0, 2), 16) / 255, parseInt(s.slice(2, 4), 16) / 255, parseInt(s.slice(4, 6), 16) / 255];
};

export const SKIN_TONES = { porcelain: "f3d9c8", fair: "eabb9b", light: "d9a07c", tan: "b77b55", brown: "8c5a3c", deep: "5c3a27", chrome: "b9c6d4", android: "e9eef3" };
export const HAIR_COLOURS = { black: "1d1716", darkbrown: "3b261a", brown: "6b4429", auburn: "8a3b1e", blonde: "d6b06c", platinum: "e9dfca", silver: "b9bdc6", pink: "ff4fb8", blue: "3fa0ff", mint: "5fe0c0" };
export const EYE_COLOURS = { brown: "5c3a1f", hazel: "8a6a30", green: "4b8a52", blue: "3b78c8", grey: "8a98a8", cyan: "3ff0ff", violet: "9a5aff" };

const cache = new Map();
const states = new WeakMap();
let unsupported = false;

function setup(px) {
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = px;
  const gl = canvas.getContext("webgl", { alpha: true, premultipliedAlpha: true, antialias: true, depth: true, preserveDrawingBuffer: true });
  if (!gl) return null;
  const sh = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || "shader");
    return s;
  };
  const prog = gl.createProgram();
  gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog) || "link");
  const u = {};
  for (const n of ["uYaw", "uPitch", "uRoll", "uOpen", "uBlink", "uSmile", "uHairLag", "uTime", "uSquash", "uMode", "uSkin", "uLip", "uHair", "uEye", "uAccent", "uHolo", "uEnergy", "uFemale", "uTech", "uMouthY", "uBand", "uLipW", "uEyeR", "uArch", "uGaze", "uFront", "uHairOpen", "uStubble", "uSide", "uNape", "uCoily"]) u[n] = gl.getUniformLocation(prog, n);
  const a = { pos: gl.getAttribLocation(prog, "aPos"), nrm: gl.getAttribLocation(prog, "aNrm"), f: gl.getAttribLocation(prog, "aF"), ao: gl.getAttribLocation(prog, "aAO") };
  return { canvas, gl, prog, u, a, meshes: new Map() };
}

const bodies = new Map();
function body(gender) {
  if (!bodies.has(gender)) bodies.set(gender, buildBody(gender));
  return bodies.get(gender);
}
const beards = new Map();
function beardFor(gender, style) {
  const key = gender + "/" + style;
  if (!beards.has(key)) beards.set(key, buildBeard(body(gender), style));
  return beards.get(key);
}
const glasses = new Map();
function glassesFor(gender, style) {
  const key = gender + "/" + style;
  if (!glasses.has(key)) glasses.set(key, buildGlasses(body(gender), style));
  return glasses.get(key);
}
const hairs = new Map();
function hairFor(gender, style) {
  const key = gender + "/" + style;
  if (!hairs.has(key)) hairs.set(key, buildHair(body(gender), style));
  return hairs.get(key);
}

function upload(r, key, mesh) {
  if (!mesh) return null;
  let m = r.meshes.get(key);
  if (m) return m;
  const { gl } = r;
  const vb = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vb);
  gl.bufferData(gl.ARRAY_BUFFER, mesh.verts, gl.STATIC_DRAW);
  const ib = (arr) => { if (!arr) return null; const b = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, b); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, arr, gl.STATIC_DRAW); return { b, n: arr.length }; };
  m = { vb, tris: ib(mesh.tris), lines2: ib(mesh.lines2 || mesh.lines), lines3: ib(mesh.lines3 || mesh.lines) };
  r.meshes.set(key, m);
  return m;
}

function bind(r, m) {
  const { gl, a } = r;
  gl.bindBuffer(gl.ARRAY_BUFFER, m.vb);
  for (let i = 0; i < 8; i++) gl.disableVertexAttribArray(i);
  const S = STRIDE * 4;
  for (const [at, n, off] of [[a.pos, 3, 0], [a.nrm, 3, 12], [a.f, 4, 24], [a.ao, 1, 40]]) {
    if (at < 0) continue;
    gl.enableVertexAttribArray(at);
    gl.vertexAttribPointer(at, n, gl.FLOAT, false, S, off);
  }
}

function draw(r, m, which, mode) {
  const { gl } = r;
  const part = m[which];
  if (!part) return;
  gl.uniform1i(r.u.uMode, mode);
  bind(r, m);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, part.b);
  gl.drawElements(which === "tris" ? gl.TRIANGLES : gl.LINES, part.n, gl.UNSIGNED_SHORT, 0);
}

/** Head, eyes, hair and mouth: where they are now, eased like a living thing. */
function animate(key, o) {
  const t = Number.isFinite(o.time) ? o.time : 0;
  let s = states.get(key);
  if (!s) {
    s = { t, yaw: 0, yv: 0, pitch: 0, pv: 0, roll: 0, hair: 0, hv: 0, open: 0, smile: 0, blinkAt: t + 1.5, blinkT: -9, gaze: [0, 0], dartAt: t, dart: [0, 0] };
    states.set(key, s);
  }
  const dt = clamp(t - s.t, 0, 0.1);
  s.t = t;
  const energy = clamp(o.energy || 0, 0, 1), think = clamp(o.thinking || 0, 0, 1);
  let ty, tp, tr = 0;
  if (o.look) {
    ty = clamp(o.look.x, -1, 1) * 0.55;
    tp = clamp(o.look.y, -1, 1) * 0.3;
  } else {
    ty = 0.2 * Math.sin(t * 0.37) + 0.07 * Math.sin(t * 0.91 + 1);
    tp = 0.035 * Math.sin(t * 0.5);
  }
  if (think > 0) { ty = ty * (1 - think) + 0.28 * think; tp = tp * (1 - think) - 0.13 * think; tr = 0.07 * think; }
  tp += energy * 0.05 * Math.sin(t * 4.2);
  // Springs: the head settles smoothly; the hair follows a beat later and sways past.
  s.yv += ((ty - s.yaw) * 30 - s.yv * 9) * dt;
  s.yaw += s.yv * dt;
  s.pv += ((tp - s.pitch) * 30 - s.pv * 9) * dt;
  s.pitch += s.pv * dt;
  s.roll += (tr - s.roll) * Math.min(1, dt * 3);
  s.hv += ((s.yaw - s.hair) * 22 - s.hv * 3.2) * dt;
  s.hair += s.hv * dt;
  // The mouth: syllables while it talks.
  const syll = clamp(0.55 + 0.45 * Math.sin(t * 11) * Math.sin(t * 3.7 + 0.6), 0, 1);
  const targetOpen = energy * syll;
  s.open += (targetOpen - s.open) * Math.min(1, dt * (targetOpen > s.open ? 28 : 16));
  s.smile += (clamp(o.mood || 0, -1, 1) - s.smile) * Math.min(1, dt * 3);
  // Blinks at uneven moments, now and then twice.
  if (t > s.blinkAt) { s.blinkT = t; s.blinkAt = t + 2 + Math.random() * 4; if (Math.random() < 0.2) s.blinkAt = t + 0.32; }
  const bt = t - s.blinkT;
  const blink = bt < 0.16 ? Math.sin((bt / 0.16) * Math.PI) : 0;
  // The eyes lead the head, with small darts.
  if (t > s.dartAt) { s.dartAt = t + 0.8 + Math.random() * 1.6; s.dart = [(Math.random() - 0.5) * 0.12, (Math.random() - 0.5) * 0.06]; }
  const gx = (ty - s.yaw) * 0.9 + s.dart[0], gy = -(tp - s.pitch) * 0.7 + s.dart[1] + think * 0.12;
  s.gaze[0] += (gx - s.gaze[0]) * Math.min(1, dt * 18);
  s.gaze[1] += (gy - s.gaze[1]) * Math.min(1, dt * 18);
  // A fixed pose (for pictures of the face, like the TV's frames).
  if (o.pose) return { ...s, yaw: o.pose.yaw ?? 0, pitch: o.pose.pitch ?? 0, roll: 0, hair: o.pose.yaw ?? 0, open: o.pose.open ?? 0, smile: o.pose.smile ?? 0.3, gaze: [0, 0], blink: o.pose.blink ?? 0, energy };
  return { ...s, blink, energy };
}

/**
 * Draw a 3D face onto `ctx` filling size×size. Options:
 *   mode: "holo" | "avatar"; gender: "male" | "female";
 *   time, energy (voice 0…1), thinking (0…1), mood (-1…1);
 *   look: {x, y} in -1…1 (where to look; omit to idle);
 *   avatar: { skin, hair, hairColor, eyes, accent, tech } — names or hex.
 * False if WebGL isn't available.
 */
export function drawFace3D(ctx, size, o = {}) {
  if (unsupported) return false;
  try {
    const scale = typeof ctx.getTransform === "function" ? ctx.getTransform().a || 1 : 1;
    const px = Math.max(64, Math.min(768, Math.round((size * scale) / 16) * 16));
    let r = cache.get(px);
    if (!r || r.gl.isContextLost()) {
      if (cache.size >= 2) {
        const [oldKey, old] = cache.entries().next().value;
        old.gl.getExtension("WEBGL_lose_context")?.loseContext();
        cache.delete(oldKey);
      }
      r = setup(px);
      if (!r) { unsupported = true; return false; }
      cache.set(px, r);
    }
    const gender = o.gender === "male" ? "male" : "female";
    const holo = o.mode !== "avatar";
    const av = o.avatar || {};
    const style = av.hair in HAIR_STYLES ? av.hair : holo ? "none" : gender === "female" ? "wavy" : "short";
    const beardStyle = gender === "male" && av.beard in BEARDS ? av.beard : "none";
    const glassStyle = av.glasses in GLASSES ? av.glasses : "none";
    const b = body(gender);
    const bm = upload(r, "body/" + gender, b);
    const hm = upload(r, "hair/" + gender + "/" + style, hairFor(gender, style));
    const dm = upload(r, "beard/" + beardStyle, beardFor(gender, beardStyle));
    const gset = glassesFor(gender, glassStyle);
    const fm = gset && upload(r, "frame/" + gender + "/" + glassStyle, gset.frame);
    const lm = gset && upload(r, "glass/" + gender + "/" + glassStyle, gset.glass);
    const s = animate(ctx.canvas || px, o);
    const { gl, u } = r;
    gl.viewport(0, 0, px, px);
    gl.useProgram(r.prog);
    gl.clearColor(0, 0, 0, 0);
    gl.clearDepth(1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.uniform1f(u.uYaw, s.yaw);
    gl.uniform1f(u.uPitch, s.pitch);
    gl.uniform1f(u.uRoll, s.roll);
    gl.uniform1f(u.uOpen, s.open);
    gl.uniform1f(u.uBlink, s.blink);
    gl.uniform1f(u.uSmile, s.smile);
    gl.uniform1f(u.uHairLag, clamp(s.yaw - s.hair, -0.5, 0.5));
    gl.uniform1f(u.uTime, (o.time || 0) % 1000);
    gl.uniform1f(u.uEnergy, s.energy);
    gl.uniform1f(u.uSquash, holo ? 1 : 0);
    gl.uniform1f(u.uFemale, gender === "female" ? 1 : 0);
    gl.uniform1f(u.uMouthY, b.mouthY);
    gl.uniform1f(u.uBand, b.band);
    gl.uniform1f(u.uLipW, b.B.lipW);
    gl.uniform1f(u.uEyeR, b.B.eyeR);
    gl.uniform1f(u.uArch, b.B.arch);
    gl.uniform2f(u.uGaze, s.gaze[0], s.gaze[1]);
    const skin = hex(SKIN_TONES[av.skin] || av.skin, "d9a07c");
    const hairC = hex(HAIR_COLOURS[av.hairColor] || av.hairColor, gender === "female" ? "3b261a" : "1d1716");
    const accent = hex(av.accent, "40c8ff");
    const lin = (c) => c.map((x) => Math.pow(x, 2.2));
    gl.uniform3fv(u.uSkin, lin(skin)); // lit in linear light, shown in screen light
    gl.uniform3fv(u.uLip, lin(gender === "female" ? [skin[0] * 0.86, skin[1] * 0.5, skin[2] * 0.54] : [skin[0] * 0.84, skin[1] * 0.6, skin[2] * 0.58]));
    gl.uniform3fv(u.uHair, lin(hairC));
    const hmesh = hairFor(gender, style);
    gl.uniform1f(u.uFront, hmesh ? hmesh.front : 0.7);
    gl.uniform1f(u.uHairOpen, hmesh ? hmesh.open : 9);
    gl.uniform1f(u.uSide, hmesh ? hmesh.side : 0.3);
    gl.uniform1f(u.uNape, hmesh ? hmesh.nape : -0.35);
    gl.uniform1f(u.uCoily, hmesh && hmesh.coily ? 1 : 0);
    gl.uniform3fv(u.uEye, lin(hex(EYE_COLOURS[av.eyes] || av.eyes, "5c3a1f")));
    gl.uniform3fv(u.uAccent, lin(accent).map((c) => c * 0.6));
    gl.uniform3fv(u.uHolo, holo ? accent.map((c) => c * 0.62 + 0.06) : [0, 0, 0]);
    gl.uniform1f(u.uTech, av.tech ? 1 : 0);
    gl.uniform1f(u.uStubble, beardStyle === "stubble" ? 1 : 0);
    gl.enable(gl.DEPTH_TEST);
    if (holo) {
      // 1) The solid shape into the depth buffer only (pushed back a hair),
      //    so lines on the far side are hidden like on a real object.
      gl.colorMask(false, false, false, false);
      gl.enable(gl.POLYGON_OFFSET_FILL);
      gl.polygonOffset(1.5, 2);
      gl.depthMask(true);
      gl.depthFunc(gl.LESS);
      gl.disable(gl.BLEND);
      draw(r, bm, "tris", 1);
      if (hm) draw(r, hm, "tris", 1);
      if (dm) draw(r, dm, "tris", 1);
      if (fm) draw(r, fm, "tris", 1);
      gl.disable(gl.POLYGON_OFFSET_FILL);
      gl.colorMask(true, true, true, true);
      // 2) A faint glassy body with a glowing edge, then the contour lines.
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE);
      gl.depthMask(false);
      gl.depthFunc(gl.LEQUAL);
      gl.polygonOffset(0, 0);
      gl.enable(gl.POLYGON_OFFSET_FILL);
      gl.polygonOffset(1.5, 2);
      draw(r, bm, "tris", 1);
      gl.disable(gl.POLYGON_OFFSET_FILL);
      draw(r, bm, px < 220 ? "lines3" : "lines2", 0);
      if (hm) draw(r, hm, "lines2", 0);
      if (dm) draw(r, dm, "lines2", 0);
      if (fm) draw(r, fm, "lines2", 0);
      if (lm) draw(r, lm, "lines2", 0);
      gl.depthMask(true);
    } else {
      gl.disable(gl.BLEND);
      gl.depthMask(true);
      gl.depthFunc(gl.LESS);
      draw(r, bm, "tris", 2);
      if (hm) draw(r, hm, "tris", 3);
      if (dm) draw(r, dm, "tris", 3);
      if (fm) draw(r, fm, "tris", 4);
      if (lm) {
        // Glass last, see-through.
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.depthMask(false);
        draw(r, lm, "tris", 4);
        gl.depthMask(true);
        gl.disable(gl.BLEND);
      }
    }
    const c = size / 2;
    if (holo) {
      // A dark projector field behind, so the light shows on any screen.
      const field = ctx.createRadialGradient(c, c, 0, c, c, size * 0.5);
      field.addColorStop(0, "rgba(2, 6, 16, 0.78)");
      field.addColorStop(0.65, "rgba(2, 6, 16, 0.55)");
      field.addColorStop(1, "rgba(2, 6, 16, 0)");
      ctx.fillStyle = field;
      ctx.fillRect(0, 0, size, size);
    } else {
      const halo = ctx.createRadialGradient(c, c * 0.8, 0, c, c * 0.8, size * 0.5);
      halo.addColorStop(0, `rgba(${accent.map((x) => Math.round(x * 255)).join(",")}, 0.22)`);
      halo.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, size, size);
    }
    ctx.drawImage(r.canvas, 0, 0, size, size);
    if (holo && "filter" in ctx && size >= 96) {
      // Bloom: a soft blurred copy added on top, like light in the air.
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = 0.55;
      ctx.filter = `blur(${Math.max(2, size / 90)}px)`;
      ctx.drawImage(r.canvas, 0, 0, size, size);
      ctx.restore();
    }
    return true;
  } catch (e) {
    unsupported = true;
    console.warn("[face3d] 3D face unavailable:", e);
    return false;
  }
}

/** Male or female for a voice id ("am_adam", "bf_emma") or a label with "(male)". */
export function genderOfVoice(voice, label = "") {
  const l = String(label).toLowerCase();
  if (/\(male\)|\bmale\b/.test(l) && !/female/.test(l)) return "male";
  if (/female/.test(l)) return "female";
  const m = /^[a-z]([fm])_/i.exec(String(voice || ""));
  if (m) return m[1].toLowerCase() === "m" ? "male" : "female";
  return "female";
}

export const __test = { buildBody, buildHair, buildBeard, buildGlasses, BODY, HAIR };
