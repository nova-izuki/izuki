// Izuki's 3D faces: real GLB models drawn into the orb, alive.
// Built into model-orb.js (tools/build-model-orb.cjs) so the phone, the TV
// page and the PC all load the same file. Shared through glass-orb.js:
// orb styles "model:<id>" end up here.
//
//   Default faces   the four in faces/: static sculpts (one solid mesh). They
//                   get a "fake" rig in the shader: the jaw drops and the
//                   mouth darkens open with the voice; the head breathes,
//                   sways and turns to look at you.
//   Your faces      any GLB you add, kept on this device (IndexedDB).
//   My face         an Avaturn (or Ready Player Me) avatar: a real rig with
//                   ARKit face shapes and visemes, so the mouth really talks,
//                   the eyes blink and look around, the body idles.
//
// drawModelOrb(ctx, size, opts) paints one frame into a 2D canvas (the orb).

import {
  AnimationMixer, Box3, BufferAttribute, Color, DirectionalLight, Group, HemisphereLight,
  MathUtils, PerspectiveCamera, PMREMGenerator, Quaternion, Scene, SRGBColorSpace, Vector3, WebGLRenderer,
  ACESFilmicToneMapping, Euler,
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

// ------------------------------------------------------------------ the faces

/** The faces that come with Izuki. */
export const FACES = [
  { id: "holo-female", name: "Hologram woman", gender: "female", url: new URL("./faces/holo-female.glb", import.meta.url).href, thumb: new URL("./faces/holo-female.webp", import.meta.url).href, glow: 0.55, accent: "#5ee7ff" },
  { id: "holo-male", name: "Hologram man", gender: "male", url: new URL("./faces/holo-male.glb", import.meta.url).href, thumb: new URL("./faces/holo-male.webp", import.meta.url).href, glow: 0.55, accent: "#5ee7ff" },
  { id: "lightskin-female", name: "Woman", gender: "female", url: new URL("./faces/lightskin-female.glb", import.meta.url).href, thumb: new URL("./faces/lightskin-female.webp", import.meta.url).href, glow: 0, accent: "#a78bfa" },
  { id: "black-male", name: "Man", gender: "male", url: new URL("./faces/black-male.glb", import.meta.url).href, thumb: new URL("./faces/black-male.webp", import.meta.url).href, glow: 0, accent: "#a78bfa" },
];

/** What each face can be changed with, and where it starts. */
export const DEFAULT_LOOK = {
  tint: "#ffffff", hair: "", gloss: 0.5, glow: 0, accent: "", scale: 1, y: 0, rot: 0, headOnly: false,
  // How much of a rigged character shows: "head", "shoulders", "half" (waist
  // up) or "full" (head to toe). Sculpts are busts: always head and shoulders.
  frame: "shoulders",
  // Without the orb: just the character, floating free.
  bare: false,
  // "real", "comic" (cel bands, ink edges, halftone dots, animated on twos)
  // or "flat" (flat vector shapes and clean outlines).
  style: "real",
};

/** One-tap skin tones (multiplied into the model's own colours). */
export const SKIN_TONES = [
  ["Porcelain", "#fff1ea"], ["Fair", "#f6d9c4"], ["Tan", "#d9a77e"], ["Olive", "#c09468"],
  ["Brown", "#9a6845"], ["Deep", "#6e4630"], ["Ebony", "#4a2f22"],
];
/** One-tap hair colours. */
export const HAIR_COLOURS = [
  ["Black", "#1a1412"], ["Dark brown", "#3b2a20"], ["Brown", "#6a4a32"], ["Auburn", "#8a3b22"],
  ["Blonde", "#d8b26e"], ["Platinum", "#e8e2d4"], ["Grey", "#9a9a9a"], ["Pink", "#e27bb0"], ["Blue", "#4a78d8"],
];

export function faceInfo(id) {
  return FACES.find((f) => f.id === id) || null;
}

// ------------------------------------------------------------------ this device's faces (IndexedDB)

const DB_NAME = "izuki-faces", STORE = "faces";
const MAX_BYTES = 120 * 1024 * 1024;
function openDb() {
  return new Promise((resolve, reject) => {
    const r = indexedDB.open(DB_NAME, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(STORE, { keyPath: "id" });
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
  });
}
async function inStore(mode, work) {
  const db = await openDb();
  try {
    return await new Promise((resolve, reject) => {
      const t = db.transaction(STORE, mode);
      const req = work(t.objectStore(STORE));
      t.oncomplete = () => resolve(req && req.result);
      t.onerror = () => reject(t.error);
      t.onabort = () => reject(t.error);
    });
  } finally { db.close(); }
}

/** Faces added on this device, newest first (no model bytes, just the cards). */
export async function savedFaces() {
  try {
    const all = (await inStore("readonly", (s) => s.getAll())) || [];
    return all.map(({ blob, ...card }) => card).sort((a, b) => (b.added || 0) - (a.added || 0));
  } catch { return []; }
}

/**
 * Add a GLB from a file picker. kind "me" is the user's own face (Avaturn);
 * there's one of those — a new one replaces it. Returns the saved card.
 */
export async function addFace(file, kind = "face") {
  if (!file) throw new Error("No file chosen.");
  if (file.size > MAX_BYTES) throw new Error("That model is over 120 MB — too big for a phone. Export it smaller and try again.");
  const head = new Uint8Array(await file.slice(0, 4).arrayBuffer());
  if (String.fromCharCode(...head) !== "glTF") throw new Error("That isn't a .glb model. Pick the .glb file you downloaded.");
  const id = kind === "me" ? "me" : "u-" + Math.random().toString(36).slice(2, 10);
  const name = kind === "me" ? "My face" : (file.name || "Face").replace(/\.glb$/i, "").slice(0, 40);
  const blob = new Blob([await file.arrayBuffer()], { type: "model/gltf-binary" });
  // Load it once now: a broken file is caught here, and the card gets a picture.
  forget(id);
  const model = await loadModel(id, blob);
  const thumb = renderThumb(model);
  const card = { id, name, kind, thumb, rigged: model.rigged, talks: model.realLips, added: Date.now() };
  await inStore("readwrite", (s) => s.put({ ...card, blob }));
  return card;
}

export async function removeFace(id) {
  forget(id);
  await inStore("readwrite", (s) => s.delete(id));
}

async function blobFor(id) {
  const row = await inStore("readonly", (s) => s.get(id));
  return row ? row.blob : null;
}

// ------------------------------------------------------------------ loading

const models = new Map(); // id → { promise, model, failed }
let loader = null;
function gltfLoader() {
  if (!loader) {
    loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
  }
  return loader;
}

function forget(id) {
  const m = models.get(id);
  models.delete(id);
  if (m && m.model) m.model.dispose();
}

function want(id) {
  let m = models.get(id);
  if (!m) {
    m = { promise: null, model: null, failed: false };
    models.set(id, m);
    m.promise = (async () => {
      const info = faceInfo(id);
      const src = info ? info.url : await blobFor(id);
      if (!src) throw new Error("face not on this device");
      return loadModel(id, src);
    })().then((model) => { m.model = model; return model; }, (e) => { m.failed = true; console.warn("Izuki face", id, e); throw e; });
    m.promise.catch(() => {});
  }
  return m;
}

/** Start loading a face now (e.g. when it's picked), so it's ready to show. */
export function preloadFace(id) {
  return want(id).promise;
}

async function loadModel(id, src) {
  const L = gltfLoader();
  let gltf;
  if (typeof src === "string") gltf = await L.loadAsync(src);
  else gltf = await L.parseAsync(await src.arrayBuffer(), "");
  return prepare(id, gltf);
}

const RIG_SHAPES = ["jawOpen", "mouthOpen", "viseme_aa"];
const plain = (n) => String(n || "").replace(/^mixamorig[:_]?/i, "").replace(/^Armature[:_]?/i, "");

function prepare(id, gltf) {
  const root = new Group();
  const scene = gltf.scene;
  scene.updateMatrixWorld(true);
  const meshes = [];
  scene.traverse((o) => { if (o.isMesh) meshes.push(o); });
  const skinned = meshes.some((m) => m.isSkinnedMesh);
  const morphed = meshes.filter((m) => m.morphTargetDictionary);
  const realLips = morphed.some((m) => RIG_SHAPES.some((k) => k in m.morphTargetDictionary));
  const rigged = skinned || realLips;
  const uniforms = {
    uJaw: { value: 0 }, uMouth: { value: new Vector3() }, uMouthW: { value: 0.03 }, uJawR: { value: 0.08 },
    uGlow: { value: 0 }, uAccent: { value: new Color("#5ee7ff") }, uTime: { value: 0 }, uScan: { value: 400 }, uTrim: { value: 0 },
  };

  if (rigged) {
    root.add(scene);
  } else {
    // A sculpt: bake every mesh into plain world space (Y up, facing +Z), so
    // the shader's jaw can be placed in real units.
    for (const m of meshes) {
      bake(m);
      dropIslands(m);
      root.add(m);
    }
  }

  const bones = {};
  scene.traverse((o) => { if (o.isBone) bones[plain(o.name)] = o; });
  const box = new Box3().setFromObject(root);
  const size = box.getSize(new Vector3());
  const center = box.getCenter(new Vector3());

  // Where the face is: the head bone, or for a sculpt, its nose tip and mouth.
  let frame;
  if (rigged && bones.Head) {
    const head = bones.Head.getWorldPosition(new Vector3());
    const tall = Math.max(0.2, Math.min(size.y, 2.2));
    const headH = tall > 1.2 ? tall * 0.13 : tall * 0.35; // a full body vs a bust
    frame = { head, headH, front: box.max.z, top: box.max.y, bottom: box.min.y, full: tall > 1.2 };
  } else {
    const lm = landmarks(meshes, box);
    uniforms.uMouth.value.copy(lm.mouth);
    uniforms.uMouthW.value = lm.tn * 0.15;
    uniforms.uJawR.value = lm.tn * 0.55;
    uniforms.uScan.value = (Math.PI * 2 * 70) / Math.max(0.01, lm.tn * 2);
    // Stray bits beside the bust (a sculpt's floating hands): cut off.
    const trim = (faceInfo(id) || {}).trim;
    if (trim) uniforms.uTrim.value = lm.tn * trim;
    frame = { head: new Vector3(lm.nose.x, lm.nose.y, center.z), headH: lm.tn, front: lm.nose.z, sculpt: true };
  }

  // The materials: shared uniforms for the glow (and a sculpt's jaw).
  const materials = new Set();
  for (const m of meshes) for (const mat of [].concat(m.material)) if (mat) materials.add(mat);
  const base = new Map();
  for (const mat of materials) {
    base.set(mat, { color: mat.color ? mat.color.clone() : null, roughness: mat.roughness ?? 1 });
    patch(mat, uniforms, !rigged);
  }
  for (const m of meshes) if (m.isSkinnedMesh) m.frustumCulled = false;

  const hairMeshes = meshes.filter((m) => /hair|beard|brow|lash/i.test(m.name) && !/head_mesh/i.test(m.name));
  const keepForHead = /head|eye|teeth|tongue|hair|lash|brow|beard|glass|hat|cap/i;
  const bodyMeshes = rigged ? meshes.filter((m) => !keepForHead.test(m.name)) : [];

  // Motion: the model's own idle, if it has one.
  let mixer = null;
  const animated = new Set();
  if (gltf.animations && gltf.animations.length) {
    mixer = new AnimationMixer(scene);
    const clip = gltf.animations.find((c) => /idle|breath|stand/i.test(c.name)) || gltf.animations[0];
    mixer.clipAction(clip).play();
    for (const tr of clip.tracks) animated.add(plain(tr.name.split(".")[0]));
  } else if (rigged) {
    armsDown(bones);
  }
  // The head's resting turn in the world (facing +Z), to undo an idle's glance.
  const headRest = bones.Head ? bones.Head.getWorldQuaternion(new Quaternion()).invert() : null;
  const rest = new Map();
  for (const name of ["Head", "Neck", "Spine1", "Spine2", "LeftEye", "RightEye"]) if (bones[name]) rest.set(name, bones[name].quaternion.clone());

  const setMorph = (name, v) => {
    for (const m of morphed) {
      const i = m.morphTargetDictionary[name];
      if (i !== undefined) m.morphTargetInfluences[i] = v;
    }
  };
  const has = (name) => morphed.some((m) => name in m.morphTargetDictionary);

  return {
    id, root, rigged, realLips, uniforms, headRest, materials, base, bones, frame, mixer, animated, rest,
    hairMeshes, bodyMeshes, setMorph, hasBlink: has("eyeBlinkLeft"), hasSmile: has("mouthSmileLeft"),
    pivot: rigged ? null : new Vector3(frame.head.x, frame.head.y - frame.headH * 0.75, center.z),
    dispose() {
      root.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        for (const mat of [].concat(o.material || [])) {
          for (const k of ["map", "normalMap", "roughnessMap", "metalnessMap", "emissiveMap", "aoMap"]) mat[k]?.dispose?.();
          mat.dispose?.();
        }
      });
    },
  };
}

/** A mesh's vertices in world space, as plain floats (undoing quantization). */
function bake(mesh) {
  mesh.updateWorldMatrix(true, false);
  const g = mesh.geometry;
  for (const name of ["position", "normal"]) {
    const a = g.getAttribute(name);
    if (!a) continue;
    const f = new Float32Array(a.count * 3);
    for (let i = 0; i < a.count; i++) { f[i * 3] = a.getX(i); f[i * 3 + 1] = a.getY(i); f[i * 3 + 2] = a.getZ(i); }
    g.setAttribute(name, new BufferAttribute(f, 3));
  }
  g.applyMatrix4(mesh.matrixWorld);
  const n = g.getAttribute("normal");
  if (n) { for (let i = 0; i < n.count; i++) { const x = n.getX(i), y = n.getY(i), z = n.getZ(i), l = Math.hypot(x, y, z) || 1; n.setXYZ(i, x / l, y / l, z / l); } }
  g.computeBoundingBox();
  g.computeBoundingSphere();
  mesh.position.set(0, 0, 0);
  mesh.quaternion.identity();
  mesh.scale.set(1, 1, 1);
  mesh.updateMatrix();
}

/**
 * Generated sculpts often come with floating bits (stray hands, specks):
 * keep the main piece, and any other that's at least a fifth of its size.
 * Pieces are found by shared corners (by position, so UV seams don't split them).
 */
function dropIslands(mesh) {
  const g = mesh.geometry, pos = g.getAttribute("position"), idx = g.getIndex();
  if (!idx || pos.count < 100) return;
  const n = pos.count, parent = new Int32Array(n);
  for (let i = 0; i < n; i++) parent[i] = i;
  const find = (a) => { while (parent[a] !== a) { parent[a] = parent[parent[a]]; a = parent[a]; } return a; };
  const join = (a, b) => { a = find(a); b = find(b); if (a !== b) parent[a] = b; };
  // Same spot, same corner (meshes are split along their texture seams).
  const at = new Map(), q = 1e5;
  for (let i = 0; i < n; i++) {
    const k = Math.round(pos.getX(i) * q) + "," + Math.round(pos.getY(i) * q) + "," + Math.round(pos.getZ(i) * q);
    const j = at.get(k);
    if (j === undefined) at.set(k, i); else join(i, j);
  }
  const ix = idx.array;
  for (let t = 0; t < ix.length; t += 3) { join(ix[t], ix[t + 1]); join(ix[t], ix[t + 2]); }
  const size = new Map();
  for (let i = 0; i < n; i++) { const r = find(i); size.set(r, (size.get(r) || 0) + 1); }
  const biggest = Math.max(...size.values());
  const keep = (r) => size.get(r) >= biggest * 0.2;
  if ([...size.keys()].every(keep)) return;
  const out = [];
  for (let t = 0; t < ix.length; t += 3) if (keep(find(ix[t]))) out.push(ix[t], ix[t + 1], ix[t + 2]);
  g.setIndex(out);
  g.computeBoundingBox();
  g.computeBoundingSphere();
}

/** A sculpt's nose tip and mouth, found from its shape (it faces +Z, Y up). */
function landmarks(meshes, box) {
  const H = box.max.y - box.min.y, W = box.max.x - box.min.x, cx = (box.min.x + box.max.x) / 2;
  const top = box.max.y;
  let nose = null, best = -Infinity;
  const each = (fn) => {
    for (const m of meshes) {
      const p = m.geometry.getAttribute("position");
      for (let i = 0; i < p.count; i++) fn(p.getX(i), p.getY(i), p.getZ(i));
    }
  };
  // The nose: the frontmost point near the middle, in the upper part (a bust's
  // chest can stick out further, so it's left out).
  each((x, y, z) => {
    if (y < top - 0.06 * H && y > top - 0.5 * H && Math.abs(x - cx) < 0.06 * W && z > best) { best = z; nose = new Vector3(x, y, z); }
  });
  if (!nose) nose = new Vector3(cx, top - 0.3 * H, box.max.z);
  const tn = Math.max(0.02, top - nose.y);
  const mouthY = nose.y - tn * 0.225;
  let mz = -Infinity;
  each((x, y, z) => { if (Math.abs(x - nose.x) < tn * 0.05 && Math.abs(y - mouthY) < tn * 0.03 && z > mz) mz = z; });
  if (!Number.isFinite(mz)) mz = nose.z - tn * 0.1;
  return { nose, tn, mouth: new Vector3(nose.x, mouthY, mz) };
}

/** A T-posed rig with no idle: bring its arms down by its sides. */
function armsDown(bones) {
  for (const [arm, fore, side] of [["LeftArm", "LeftForeArm", 1], ["RightArm", "RightForeArm", -1]]) {
    const a = bones[arm], f = bones[fore];
    if (!a || !f) continue;
    a.updateWorldMatrix(true, true);
    const from = f.getWorldPosition(new Vector3()).sub(a.getWorldPosition(new Vector3())).normalize();
    const to = new Vector3(0.18 * side, -1, 0).normalize();
    rotateWorld(a, new Quaternion().setFromUnitVectors(from, to));
  }
}

/** Turn a bone by a rotation given in world space. */
const _pq = new Quaternion(), _iq = new Quaternion();
function rotateWorld(bone, worldQ) {
  bone.parent.getWorldQuaternion(_pq);
  _iq.copy(_pq).invert();
  bone.quaternion.premultiply(_pq).premultiply(worldQ).premultiply(_iq);
}

// ------------------------------------------------------------------ the shader additions

function patch(mat, U, sculpt) {
  if (!mat.isMeshStandardMaterial) return;
  mat.customProgramCacheKey = () => "izuki-face-" + (sculpt ? "s" : "r");
  mat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, U);
    sh.vertexShader = sh.vertexShader
      .replace("#include <common>", "#include <common>\nuniform float uJaw, uMouthW, uJawR; uniform vec3 uMouth; varying float vMouth; varying vec3 vObj;")
      .replace("#include <begin_vertex>", `#include <begin_vertex>
        vObj = transformed;
        vMouth = 0.;
        ${sculpt ? `
        if (uJaw > .001) {
          // The jaw: below the lips, at the front, it drops; the lips part.
          vec3 d = transformed - uMouth;
          float below = smoothstep(.0, -uJawR * .12, d.y);
          float side = 1. - smoothstep(uMouthW * 1.4, uMouthW * 3.2, abs(d.x));
          float front = smoothstep(-uJawR * 1.5, -uJawR * .35, d.z);
          float reach = 1. - smoothstep(uJawR * .9, uJawR * 1.9, -d.y);
          float w = below * side * front * reach;
          transformed.y -= uJaw * uJawR * .11 * w;
          transformed.z -= uJaw * uJawR * .025 * w;
          // The opening between the lips: an almond, widest in the middle.
          vec2 q = vec2(d.x / uMouthW, (d.y + uJaw * uJawR * .012) / (uJawR * .036 * (.3 + uJaw)));
          float almond = length(vec2(q.x, q.y / max(.15, 1. - q.x * q.x * .8)));
          vMouth = (1. - smoothstep(.55, 1., almond)) * step(-uJawR * .5, d.z);
        }` : ""}`);
    sh.fragmentShader = sh.fragmentShader
      .replace("#include <common>", "#include <common>\nuniform float uJaw, uGlow, uTime, uScan, uTrim; uniform vec3 uAccent, uMouth; varying float vMouth; varying vec3 vObj;")
      .replace("#include <clipping_planes_fragment>", "#include <clipping_planes_fragment>\n if (uTrim > 0. && abs(vObj.x - uMouth.x) > uTrim) discard;")
      .replace("#include <color_fragment>", "#include <color_fragment>\n diffuseColor.rgb = mix(diffuseColor.rgb, mix(vec3(.09, .03, .035), uAccent * .08, uGlow), clamp(min(1., uJaw * 2.) * vMouth, 0., .85));")
      .replace("#include <opaque_fragment>", `
        if (uGlow > .001) {
          // Hologram: a bright rim where the surface turns away, faint moving scan lines.
          float fres = pow(1. - abs(dot(normalize(normal), normalize(vViewPosition))), 2.4);
          float scan = .5 + .5 * sin(vObj.y * uScan - uTime * 5.);
          outgoingLight = mix(outgoingLight, outgoingLight * .55 + uAccent * .18, uGlow * .35);
          outgoingLight += uAccent * uGlow * (fres * 1.5 + scan * .07);
        }
        #include <opaque_fragment>`);
  };
  mat.needsUpdate = true;
}

// ------------------------------------------------------------------ drawing

let renderer = null, scene = null, camera = null, envTex = null, broken = false;
let key, rim, fill;
function stage() {
  if (renderer || broken) return !broken;
  try {
    const canvas = document.createElement("canvas");
    renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true, premultipliedAlpha: false, powerPreference: "high-performance" });
    renderer.outputColorSpace = SRGBColorSpace;
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(1);
    scene = new Scene();
    const pm = new PMREMGenerator(renderer);
    envTex = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    pm.dispose();
    scene.environment = envTex;
    scene.environmentIntensity = 0.55;
    scene.add(new HemisphereLight(0xdfe8ff, 0x1a1530, 0.5));
    key = new DirectionalLight(0xffffff, 1.6);
    key.position.set(-1.2, 1.6, 2.2);
    fill = new DirectionalLight(0xbfd4ff, 0.45);
    fill.position.set(1.6, 0.3, 1.4);
    rim = new DirectionalLight(0x8b7bff, 1.4);
    rim.position.set(0.4, 1.2, -2.2);
    scene.add(key, fill, rim);
    camera = new PerspectiveCamera(22, 1, 0.01, 50);
    canvas.addEventListener("webglcontextlost", (e) => { e.preventDefault(); });
    return true;
  } catch (e) {
    console.warn("Izuki face: no WebGL", e);
    broken = true;
    return false;
  }
}

let stageSize = 0;
function renderAt(px) {
  if (px > stageSize) {
    stageSize = Math.min(1024, Math.max(px, 256));
    renderer.setSize(stageSize, stageSize, false);
  }
  renderer.setViewport(0, 0, px, px);
  renderer.setScissor(0, 0, px, px);
  renderer.setScissorTest(true);
  renderer.clear();
  renderer.render(scene, camera);
}

/** Per orb on screen: its springs, blinks and glances. */
const states = new WeakMap();
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const _q = new Quaternion(), _e = new Euler(), _v = new Vector3();
const _hq = new Quaternion(), _f = new Vector3(), _fwd = new Vector3(0, 0, 1), _id = new Quaternion();

function look(model, c) {
  const L = { ...DEFAULT_LOOK, ...(c || {}) };
  const info = faceInfo(model.id);
  if (!c || c.glow == null) L.glow = info ? info.glow : model.rigged ? 0 : 0;
  if (!L.accent) L.accent = info ? info.accent : "#a78bfa";
  return L;
}

function applyLook(model, L) {
  const tint = new Color(L.tint || "#ffffff");
  for (const mat of model.materials) {
    const b = model.base.get(mat);
    if (!b) continue;
    const isHair = model.hairMeshes.some((m) => [].concat(m.material).includes(mat));
    if (mat.color && b.color) {
      mat.color.copy(b.color);
      if (isHair && L.hair) mat.color.multiply(new Color(L.hair)).multiplyScalar(1.6);
      else if (!isHair) mat.color.multiply(tint);
    }
    if ("roughness" in mat) mat.roughness = clamp(b.roughness * (1.5 - L.gloss), 0.05, 1);
  }
  for (const m of model.bodyMeshes) m.visible = !(L.headOnly || L.frame === "head");
  model.uniforms.uGlow.value = clamp(L.glow, 0, 1);
  model.uniforms.uAccent.value.set(L.accent);
}

function springTo(s, k, target, dt, stiff = 30, damp = 9) {
  const v = (s[k + "v"] || 0) + ((target - s[k]) * stiff - (s[k + "v"] || 0) * damp) * dt;
  s[k + "v"] = v;
  s[k] += v * dt;
}

function animate(model, s, o, dt) {
  const t = o.time;
  // Voice: quick to open, slower to close.
  const e = clamp(o.energy || 0, 0, 1);
  s.e += (e - s.e) * (e > s.e ? 0.55 : 0.18);
  const thinking = typeof o.thinking === "number" ? o.thinking : o.thinking ? 1 : 0;

  // Poked: a jolt back, a blink and a grin.
  if (o.poke && o.poke !== s.pokeSeen) {
    s.pokeSeen = o.poke;
    s.pitchv -= 2.4;
    s.yawv += (Math.random() - 0.5) * 3;
    s.blinkAt = t;
    s.grinUntil = t + 1.6;
  }
  const grin = s.grinUntil && t < s.grinUntil;

  // Where to look: at the pointer, else drifting; up and aside while thinking.
  const lk = o.look || null;
  const tYaw = (lk ? lk.x * 0.34 : 0.07 * Math.sin(t * 0.31) + 0.04 * Math.sin(t * 0.83)) + thinking * 0.12;
  const tPitch = (lk ? lk.y * 0.2 : 0.03 * Math.sin(t * 0.27)) - thinking * 0.08 - s.e * 0.04;
  springTo(s, "yaw", tYaw, dt, 22, 8);
  springTo(s, "pitch", tPitch, dt, 22, 8);
  // A still (the TV's pictures): exactly this pose.
  if (o.still) { s.yaw = o.still.yaw || 0; s.pitch = o.still.pitch || 0; s.e = o.still.jaw || 0; }
  const roll = 0.025 * Math.sin(t * 0.43) + (grin ? 0.04 * Math.sin((s.grinUntil - t) * 9) : 0);

  // Blinks every 2–5 s (now and then a double).
  if (t > s.nextBlink) { s.blinkAt = t; s.nextBlink = t + 2 + Math.random() * 3; if (Math.random() < 0.15) s.nextBlink = t + 0.35; }
  const bt = (t - s.blinkAt) / 0.17;
  const blink = bt >= 0 && bt < 1 ? Math.sin(bt * Math.PI) : 0;
  // Little eye darts.
  if (t > s.saccAt) { s.sx = (Math.random() - 0.5) * 0.12; s.sy = (Math.random() - 0.5) * 0.06; s.saccAt = t + 0.6 + Math.random() * 2.2; }

  const breathe = Math.sin(t * 1.25);
  if (model.rigged) {
    if (model.mixer) model.mixer.update(dt);
    const B = model.bones;
    for (const [name, q] of model.rest) if (!model.animated.has(name)) B[name].quaternion.copy(q);
    if (B.Spine2) rotateWorld(B.Spine2, _q.setFromEuler(_e.set(breathe * 0.012, 0, 0)));
    if (B.Neck) rotateWorld(B.Neck, _q.setFromEuler(_e.set(s.pitch * 0.4, s.yaw * 0.4, roll * 0.4)));
    if (B.Head) {
      // An idle animation may look off to the side: bring the face round to the viewer.
      if (model.headRest) {
        B.Head.getWorldQuaternion(_hq);
        _f.set(0, 0, 1).applyQuaternion(_hq.multiply(model.headRest));
        _f.y *= 0.5;
        _f.normalize();
        _q.setFromUnitVectors(_f, _fwd);
        _q.slerp(_id, 0.15);
        rotateWorld(B.Head, _q);
      }
      rotateWorld(B.Head, _q.setFromEuler(_e.set(s.pitch * 0.6, s.yaw * 0.6, roll * 0.6)));
    }
    for (const eye of ["LeftEye", "RightEye"]) {
      if (!B[eye]) continue;
      rotateWorld(B[eye], _q.setFromEuler(_e.set((lk ? lk.y * 0.3 : 0) + s.sy - thinking * 0.15, (lk ? lk.x * 0.45 : 0) + s.sx + thinking * 0.2, 0)));
    }
    // The mouth: open with the voice, its shape wandering through the vowels.
    const open = clamp(s.e * 1.15, 0, 1);
    const ph = t * 8.3;
    const vow = [0.5 + 0.5 * Math.sin(ph), 0.5 + 0.5 * Math.sin(ph * 0.71 + 2), 0.5 + 0.5 * Math.sin(ph * 1.37 + 4), 0.5 + 0.5 * Math.sin(ph * 0.53 + 1)];
    const sum = vow.reduce((a, b) => a + b, 0) || 1;
    model.setMorph("jawOpen", open * 0.42);
    model.setMorph("mouthOpen", open * 0.25);
    model.setMorph("viseme_aa", (open * vow[0]) / sum * 1.4);
    model.setMorph("viseme_O", (open * vow[1]) / sum * 1.2);
    model.setMorph("viseme_E", (open * vow[2]) / sum * 1.2);
    model.setMorph("viseme_I", (open * vow[3]) / sum * 0.9);
    model.setMorph("viseme_sil", 1 - open);
    const smile = grin ? 0.8 : clamp(o.mood || 0, -1, 1) * 0.45 + 0.12;
    model.setMorph("mouthSmileLeft", Math.max(0, smile));
    model.setMorph("mouthSmileRight", Math.max(0, smile));
    model.setMorph("mouthSmile", Math.max(0, smile));
    model.setMorph("mouthFrownLeft", Math.max(0, -smile) * 0.6);
    model.setMorph("mouthFrownRight", Math.max(0, -smile) * 0.6);
    model.setMorph("browInnerUp", thinking * 0.35 + (grin ? 0.2 : 0));
    if (model.hasBlink) { model.setMorph("eyeBlinkLeft", blink); model.setMorph("eyeBlinkRight", blink); }
    else model.setMorph("eyesClosed", blink);
    model.root.position.y = 0;
    model.root.rotation.set(0, 0, 0);
  } else {
    // A sculpt: the whole bust turns and breathes about its neck; the jaw talks.
    model.uniforms.uJaw.value = o.still ? clamp(s.e, 0, 1) : clamp(s.e * 1.2, 0, 1) * (0.75 + 0.25 * Math.sin(t * 17.3) * Math.sin(t * 6.1));
    const P = model.pivot;
    model.root.position.set(0, 0, 0);
    model.root.rotation.set(0, 0, 0);
    model.root.updateMatrix();
    // rotate about the pivot: move it to the origin, turn, move back
    _q.setFromEuler(_e.set(s.pitch, s.yaw, roll));
    _v.copy(P).applyQuaternion(_q);
    model.root.quaternion.copy(_q);
    model.root.position.copy(P).sub(_v);
    model.root.position.y += breathe * model.frame.headH * 0.006;
  }
  model.uniforms.uTime.value = t;
}

function placeCamera(model, L, aspect = 1) {
  const f = model.frame;
  // A sculpt is framed on its nose (headH = top of head to nose); a rig on its
  // head bone: head and shoulders, or closer for head only.
  let viewH, cy;
  const framing = L.headOnly ? "head" : L.frame || "shoulders";
  if (f.sculpt) { viewH = f.headH * 3.1; cy = f.head.y - f.headH * 0.12; }
  else if (framing === "head") { viewH = f.headH * 1.6; cy = f.head.y + f.headH * 0.4; }
  else if (framing === "full" && f.full) { viewH = (f.top - f.bottom) * 1.06; cy = (f.top + f.bottom) / 2; }
  else if (framing === "half" && f.full) {
    // Waist up: about three heads below the head's centre.
    const waist = Math.max(f.bottom, f.head.y - f.headH * 3.3);
    viewH = (f.top - waist) * 1.08;
    cy = (f.top + waist) / 2;
  } else { viewH = f.headH * 2.6; cy = f.head.y + f.headH * 0.02; }
  viewH /= clamp(L.scale || 1, 0.4, 2.5);
  const target = new Vector3(f.head.x, cy - (L.y || 0) * viewH * 0.5, f.head.z);
  const dist = viewH / 2 / Math.tan(MathUtils.degToRad(camera.fov / 2));
  const turn = MathUtils.degToRad(L.rot || 0);
  camera.aspect = aspect;
  camera.position.set(target.x + Math.sin(turn) * dist, target.y + viewH * 0.04, target.z + Math.cos(turn) * dist);
  camera.near = dist * 0.1;
  camera.far = dist * 10;
  camera.updateProjectionMatrix();
  camera.lookAt(target);
}

function newState(t) {
  return { last: 0, e: 0, yaw: 0, yawv: 0, pitch: 0, pitchv: 0, blinkAt: -9, nextBlink: t + 1.5, saccAt: 0, sx: 0, sy: 0, pokeSeen: 0, grinUntil: 0 };
}

/**
 * One frame of a face in the orb. opts: { id, time, energy (voice 0…1),
 * thinking (0…1), mood (-1…1), look ({x,y} -1…1 or null), poke, custom }.
 * True when drawn (or loading); false if it can't be (no WebGL / bad file).
 */
export function drawModelOrb(ctx, size, opts) {
  if (!stage()) return false;
  const entry = want(opts.id);
  // A face added on another device (or removed) isn't here: show a default one.
  if (entry.failed) return faceInfo(opts.id) ? false : drawModelOrb(ctx, size, { ...opts, id: "holo-female", custom: null });
  const scale = typeof ctx.getTransform === "function" ? ctx.getTransform().a || 1 : 1;
  const c = size / 2, R = size * 0.46;
  const model = entry.model;
  const L = model ? look(model, opts.custom) : { ...DEFAULT_LOOK, accent: (faceInfo(opts.id) || {}).accent || "#a78bfa" };
  const accent = new Color(L.accent);
  const rgb = `${Math.round(accent.r * 255)},${Math.round(accent.g * 255)},${Math.round(accent.b * 255)}`;
  const e = clamp(opts.energy || 0, 0, 1);
  const bare = !!L.bare;

  if (bare) {
    // No orb: only the character (a faint glow at its feet while it talks).
    if (!model) return true;
    let s = states.get(ctx.canvas);
    const t = opts.time || 0;
    if (!s || s.id !== model.id) { s = newState(t); s.id = model.id; states.set(ctx.canvas, s); }
    const dt = clamp(t - (s.last || t), 0, 0.1) || 1 / 30;
    s.last = t;
    applyLook(model, L);
    animate(model, s, opts, dt);
    rim.color.copy(accent);
    placeCamera(model, L);
    scene.add(model.root);
    const px = Math.max(64, Math.min(1024, Math.round(size * scale)));
    renderAt(px);
    scene.remove(model.root);
    paintStyled(ctx, size, px, L.style, s, t);
    return true;
  }

  // The orb behind the face: a soft glow that swells with the voice.
  const halo = ctx.createRadialGradient(c, c, R * 0.55, c, c, size / 2);
  halo.addColorStop(0, `rgba(${rgb},${0.28 + e * 0.35})`);
  halo.addColorStop(1, `rgba(${rgb},0)`);
  ctx.fillStyle = halo;
  ctx.fillRect(0, 0, size, size);
  ctx.save();
  ctx.beginPath();
  ctx.arc(c, c, R, 0, Math.PI * 2);
  ctx.clip();
  const glass = ctx.createRadialGradient(c, c * 0.8, R * 0.1, c, c, R);
  glass.addColorStop(0, `rgba(${rgb},0.22)`);
  glass.addColorStop(1, "rgba(6,8,20,0.92)");
  ctx.fillStyle = glass;
  ctx.fillRect(0, 0, size, size);

  if (!model) {
    // Loading: a slow shimmer.
    const a = 0.25 + 0.2 * Math.sin((opts.time || 0) * 3);
    ctx.fillStyle = `rgba(${rgb},${a})`;
    ctx.beginPath();
    ctx.ellipse(c, c * 0.92, R * 0.32, R * 0.42, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    ring(ctx, c, R, rgb, e);
    return true;
  }

  let s = states.get(ctx.canvas);
  const t = opts.time || 0;
  if (!s || s.id !== model.id) { s = newState(t); s.id = model.id; states.set(ctx.canvas, s); }
  const dt = clamp(t - (s.last || t), 0, 0.1) || 1 / 30;
  s.last = t;
  applyLook(model, L);
  animate(model, s, opts, dt);
  rim.color.copy(accent);
  placeCamera(model, L);
  scene.add(model.root);
  const px = Math.max(64, Math.min(1024, Math.round(size * scale)));
  renderAt(px);
  scene.remove(model.root);
  paintStyled(ctx, size, px, L.style, s, t);
  // Glass on top: a highlight and an inner shadow at the edge.
  const edge = ctx.createRadialGradient(c, c, R * 0.72, c, c, R);
  edge.addColorStop(0, "rgba(0,0,0,0)");
  edge.addColorStop(1, "rgba(4,6,16,0.55)");
  ctx.fillStyle = edge;
  ctx.fillRect(0, 0, size, size);
  const hl = ctx.createRadialGradient(c - R * 0.4, c - R * 0.45, 0, c - R * 0.4, c - R * 0.45, R * 0.6);
  hl.addColorStop(0, "rgba(255,255,255,0.16)");
  hl.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = hl;
  ctx.fillRect(0, 0, size, size);
  ctx.restore();
  ring(ctx, c, R, rgb, e);
  return true;
}

// ------------------------------------------------------------------ 2D looks

let work = null;
/**
 * Copy the rendered character onto the orb — as it is ("real"), or drawn:
 * "comic" (Spider-Verse-like cel bands, ink edges, halftone dots in the
 * shadows, a touch of print misregistration, posed on twos) or "flat"
 * (flat vector colours and clean outlines). A quick pass over a few
 * hundred pixels square — no extra models, works with every character.
 */
function paintStyled(ctx, size, px, style, s, t) {
  const src = renderer.domElement;
  if (style !== "comic" && style !== "flat") {
    ctx.drawImage(src, 0, src.height - px, px, px, 0, 0, size, size);
    return;
  }
  // On twos: a fresh drawing 12 times a second; the frames between hold it.
  const fresh = !s.held || s.held.width !== px || s.held.height !== px || s.heldStyle !== style || t - (s.heldAt || 0) >= 1 / 12;
  if (fresh) {
    if (!work) work = document.createElement("canvas");
    if (work.width !== px || work.height !== px) { work.width = px; work.height = px; }
    const w = work.getContext("2d", { willReadFrequently: true });
    w.clearRect(0, 0, px, px);
    w.drawImage(src, 0, src.height - px, px, px, 0, 0, px, px);
    const img = w.getImageData(0, 0, px, px);
    if (style === "comic") comicPass(img.data, px); else flatPass(img.data, px);
    w.putImageData(img, 0, 0);
    if (!s.held || s.held.width !== px || s.held.height !== px) { s.held = document.createElement("canvas"); s.held.width = s.held.height = px; }
    const h = s.held.getContext("2d");
    h.clearRect(0, 0, px, px);
    h.drawImage(work, 0, 0);
    s.heldAt = t;
    s.heldStyle = style;
  }
  ctx.drawImage(s.held, 0, 0, px, px, 0, 0, size, size);
}

const lum = (d, i) => (0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]) / 255;

/** Ink where the shape ends or the light changes sharply. */
function edges(d, px, alphaCut, lumaCut) {
  const out = new Uint8Array(px * px);
  for (let y = 1; y < px - 1; y++) {
    for (let x = 1; x < px - 1; x++) {
      const i = (y * px + x) * 4;
      if (d[i + 3] < 8) continue;
      const r = i + 4, b = i + px * 4, l = i - 4, u = i - px * 4;
      const da = Math.max(Math.abs(d[i + 3] - d[r + 3]), Math.abs(d[i + 3] - d[b + 3]), Math.abs(d[i + 3] - d[l + 3]), Math.abs(d[i + 3] - d[u + 3]));
      const dl = Math.abs(lum(d, r) - lum(d, l)) + Math.abs(lum(d, b) - lum(d, u));
      if (da > alphaCut || dl > lumaCut) out[y * px + x] = 1;
    }
  }
  return out;
}

/** The character's own average brightness (for where the shadows start). */
function meanLum(d) {
  let sum = 0, n = 0;
  for (let i = 0; i < d.length; i += 16) if (d[i + 3] > 200) { sum += lum(d, i); n++; }
  return n ? Math.max(0.08, sum / n) : 0.5;
}

/** Brightness snapped to even steps — cel shading that keeps every skin
 *  tone its own (a step is never more than half a band from the real shade). */
const step = (L, n) => Math.min(1, (Math.floor(L * n) + 0.62) / n);
const sat = (d, i, k, amt) => {
  let r = d[i] * k, g = d[i + 1] * k, b = d[i + 2] * k;
  const a = (r + g + b) / 3;
  return [a + (r - a) * amt, a + (g - a) * amt, a + (b - a) * amt];
};

export function comicPass(d, px) {
  const ink = edges(d, px, 90, 0.36);
  const m = meanLum(d);
  const cell = Math.max(5, Math.round(px / 46));
  // Misregistration: the red plate sits a pixel to the right.
  const red = new Uint8ClampedArray(px * px);
  for (let i = 0, p = 0; p < px * px; p++, i += 4) red[p] = d[i];
  for (let y = 0; y < px; y++) {
    for (let x = 0; x < px; x++) {
      const p = y * px + x, i = p * 4;
      if (d[i + 3] < 8) continue;
      if (ink[p]) { d[i] = 18; d[i + 1] = 14; d[i + 2] = 26; continue; }
      const L = lum(d, i);
      const k = step(L, 4) / Math.max(0.02, L);
      const [r, g, b] = sat(d, i, k, 1.22);
      const rr = x > 0 ? red[p - 1] * k : r;
      d[i] = Math.min(255, rr * 0.25 + r * 0.75);
      d[i + 1] = Math.min(255, g);
      d[i + 2] = Math.min(255, b);
      // Halftone dots in the shadows (darker than the character's own tone).
      if (L < m * 0.82) {
        const cx = (Math.floor(x / cell) + 0.5) * cell, cy = (Math.floor(y / cell) + 0.5) * cell;
        const rad = cell * 0.46 * Math.min(1, (m * 0.82 - L) / (m * 0.5) + 0.35);
        if ((x - cx) ** 2 + (y - cy) ** 2 < rad * rad) { d[i] *= 0.7; d[i + 1] *= 0.7; d[i + 2] *= 0.78; }
      }
    }
  }
}

export function flatPass(d, px) {
  const ink = edges(d, px, 70, 0.5);
  for (let p = 0, i = 0; p < px * px; p++, i += 4) {
    if (d[i + 3] < 8) continue;
    if (ink[p]) { d[i] = 22; d[i + 1] = 18; d[i + 2] = 30; d[i + 3] = 255; continue; }
    // Flat colour: three brightness steps, cleaner colour, solid edges.
    const L = lum(d, i);
    const k = step(L, 3) / Math.max(0.02, L);
    const [r, g, b] = sat(d, i, k, 1.06);
    const q = (v) => Math.min(255, Math.max(0, Math.round(v / 20) * 20));
    d[i] = q(r); d[i + 1] = q(g); d[i + 2] = q(b);
    d[i + 3] = d[i + 3] > 120 ? 255 : 0;
  }
}

function ring(ctx, c, R, rgb, e) {
  ctx.beginPath();
  ctx.arc(c, c, R, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(${rgb},${0.45 + e * 0.5})`;
  ctx.lineWidth = 1.4 + e * 2.2;
  ctx.stroke();
}

/** A still picture of a face (for its card), as a data URL. */
export function renderThumb(model, px = 256, opts = {}) {
  if (!stage()) return "";
  const L = look(model, opts.custom);
  applyLook(model, L);
  const s = newState(0);
  animate(model, s, { time: 0, energy: opts.energy || 0, mood: opts.mood ?? 0.3 }, 1 / 30);
  if (!model.rigged && opts.jaw != null) model.uniforms.uJaw.value = opts.jaw;
  if (model.rigged && opts.jaw != null) { model.setMorph("jawOpen", opts.jaw * 0.42); model.setMorph("viseme_aa", opts.jaw * 0.7); }
  rim.color.set(L.accent);
  placeCamera(model, L);
  scene.add(model.root);
  renderAt(px);
  scene.remove(model.root);
  const out = document.createElement("canvas");
  out.width = out.height = px;
  const src = renderer.domElement;
  out.getContext("2d").drawImage(src, 0, src.height - px, px, px, 0, 0, px, px);
  return out.toDataURL(opts.type || "image/webp", 0.86);
}

/** Load a face and draw its card picture (for tools and settings). */
export async function thumbFor(id, px = 256, opts = {}) {
  const model = await want(id).promise;
  return renderThumb(model, px, opts);
}
