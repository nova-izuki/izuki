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
  ACESFilmicToneMapping, Euler, SphereGeometry, TorusGeometry, TubeGeometry, CatmullRomCurve3,
  MeshStandardMaterial, Mesh, CanvasTexture, RepeatWrapping, BufferGeometry, Float32BufferAttribute, LineSegments,
  LineBasicMaterial,
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { MeshoptDecoder } from "three/examples/jsm/libs/meshopt_decoder.module.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

// ------------------------------------------------------------------ the faces

/** The faces that come with Izuki. */
export const FACES = [
  { id: "holo-female", name: "Hologram woman", gender: "female", url: new URL("./faces/holo-female.glb", import.meta.url).href, thumb: new URL("./faces/holo-female.webp", import.meta.url).href, glow: 0.55, accent: "#5ee7ff", bald: true },
  { id: "holo-male", name: "Hologram man", gender: "male", url: new URL("./faces/holo-male.glb", import.meta.url).href, thumb: new URL("./faces/holo-male.webp", import.meta.url).href, glow: 0.55, accent: "#5ee7ff", bald: true },
  { id: "lightskin-female", name: "Woman", gender: "female", url: new URL("./faces/lightskin-female.glb", import.meta.url).href, thumb: new URL("./faces/lightskin-female.webp", import.meta.url).href, glow: 0, accent: "#a78bfa" },
  { id: "black-male", name: "Man", gender: "male", url: new URL("./faces/black-male.glb", import.meta.url).href, thumb: new URL("./faces/black-male.webp", import.meta.url).href, glow: 0, accent: "#a78bfa", shortHair: true },
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
  // A haircut built onto the head ("" keeps the character's own hair).
  cut: "",
};

/**
 * One-tap haircuts, made in 3D on the head (they turn and breathe with it).
 * `adds`: sits on top of a sculpt's own hair, so the four built-in faces can
 * wear it too; the rest replace the hair of a rigged face (your own).
 */
export const HAIRCUTS = [
  ["", "Their own", true], ["afro", "Afro", true], ["puffs", "Afro puffs", true], ["bun", "Bun", true],
  ["topknot", "Top knot", true], ["ponytail", "Ponytail", true], ["beanie", "Beanie", true], ["locs", "Dreads (locs)", false], ["boxbraids", "Box braids", false],
  ["braids", "Braids", false], ["long", "Long", false], ["bob", "Bob", false], ["buzz", "Buzz cut", false],
  ["quiff", "Quiff", false], ["sidepart", "Side part", false], ["slick", "Slicked back", false],
  ["undercut", "Undercut", false], ["crew", "Crew cut", false], ["pixie", "Pixie", false], ["curtains", "Curtains", false],
  ["mullet", "Mullet", false], ["edgar", "Edgar cut", false], ["curlytop", "Curly top fade", false],
  ["mohawk", "Fohawk", false], ["bald", "Bald", false],
];

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

/** The haircuts a face can wear: [key, name]. */
export function haircutsFor(id, rigged) {
  const info = faceInfo(id) || {};
  // Bald heads and rigs take any cut; a short fade sits under one too (just
  // not "Bald" — that hair is part of the sculpt).
  const full = rigged || !!info.bald || !!info.shortHair;
  return HAIRCUTS.filter(([k, , adds]) => (full || adds) && !(k === "bald" && info.shortHair)).map(([k, n]) => [k, n]);
}

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
    // The skull, for haircuts: a ball over the head bone, in the bone's space.
    bones.Head.updateWorldMatrix(true, false);
    const c = head.clone().add(new Vector3(0, headH * 0.44, headH * 0.03));
    frame.skull = { c, r: new Vector3(headH * 0.43, headH * 0.45, headH * 0.48), bone: bones.Head };
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
    frame.skull = skullOf(meshes, lm, box);
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

/** A sculpt's skull (with its own hair): measured across the forehead. */
function skullOf(meshes, lm, box) {
  const y0 = lm.nose.y + lm.tn * 0.45, band = lm.tn * 0.06;
  let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
  for (const m of meshes) {
    const p = m.geometry.getAttribute("position");
    for (let i = 0; i < p.count; i++) {
      if (Math.abs(p.getY(i) - y0) > band) continue;
      const x = p.getX(i), z = p.getZ(i);
      if (x < x0) x0 = x; if (x > x1) x1 = x; if (z < z0) z0 = z; if (z > z1) z1 = z;
    }
  }
  if (!Number.isFinite(x0)) return { c: new Vector3(lm.nose.x, box.max.y - lm.tn * 0.8, lm.nose.z - lm.tn * 0.8), r: new Vector3(lm.tn * 0.8, lm.tn * 0.8, lm.tn * 0.8) };
  // An oval, not a ball: heads are longer front to back than side to side.
  const rx = Math.max((x1 - x0) / 2, lm.tn * 0.4);
  const rz = Math.max((z1 - z0) / 2, lm.tn * 0.4);
  const ry = (rx + rz) / 2;
  return { c: new Vector3((x0 + x1) / 2, box.max.y - ry, (z0 + z1) / 2), r: new Vector3(rx, ry, rz) };
}

// ------------------------------------------------------------------ haircuts
//
// Built the way real-time hair is: short and textured hair (buzz, fades,
// afros, curls) as fur shells — many see-through layers that rise off the
// scalp, each keeping fewer strands, so it has real fuzzy volume. Straight
// and long hair as thousands of combed strands. Dreads and braids as rope
// strands following the same combing. All on a unit skull (radius 1, Y up,
// facing +Z), turning and breathing with the head.

/** A seeded random, so a haircut looks the same every time. */
function seeded(seed) {
  let s = seed % 2147483647 || 1;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}

/** Random strand roots, as a texture: each texel one hair (curly: clumped). */
const furTextures = {};
function furTexture(curly) {
  const k = curly ? "curly" : "straight";
  if (furTextures[k]) return furTextures[k];
  const n = 256, c = document.createElement("canvas");
  c.width = c.height = n;
  const g = c.getContext("2d"), img = g.createImageData(n, n), rnd = seeded(curly ? 91 : 17);
  for (let i = 0; i < n * n; i++) {
    const v = Math.floor(rnd() * 255);
    img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = v;
    img.data[i * 4 + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  if (curly) {
    // Coils clump: soft blobs over the noise.
    for (let i = 0; i < 700; i++) {
      const x = rnd() * n, y = rnd() * n, r = 2 + rnd() * 5;
      g.fillStyle = `rgba(255,255,255,${0.25 + rnd() * 0.35})`;
      g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
    }
  }
  const t = new CanvasTexture(c);
  t.wrapS = t.wrapT = RepeatWrapping;
  return (furTextures[k] = t);
}

/** Lumps on a ball (an afro's outline). */
function lumpy(geo, amount) {
  const p = geo.getAttribute("position"), v = new Vector3();
  for (let i = 0; i < p.count; i++) {
    v.fromBufferAttribute(p, i);
    const n = Math.sin(v.x * 23.1 + v.y * 7.7) * Math.sin(v.y * 19.3 + v.z * 5.3) * Math.sin(v.z * 17.9 + v.x * 3.1);
    v.multiplyScalar(1 + n * amount);
    p.setXYZ(i, v.x, v.y, v.z);
  }
  geo.computeVertexNormals();
  return geo;
}

/**
 * Fur shells over `geo`: `layers` copies pushed out along the normals up to
 * `len`, each dropping more strands. `curl` twists them (coils), `droop`
 * combs them down; `repeat` is how fine the hairs are.
 */
function furShells(group, geo, colour, { len = 0.05, layers = 14, curl = 0, droop = 0, repeat = [60, 30], glow = 0, accent = "#5ee7ff" } = {}) {
  const tex = furTexture(curl > 0);
  // The scalp under it, in the hair's darkest shade, so nothing shows through.
  const base = new MeshStandardMaterial({ color: new Color(colour).multiplyScalar(0.55), roughness: 0.9 });
  group.add(new Mesh(geo, base));
  const mats = [base];
  for (let i = 1; i <= layers; i++) {
    const h = i / layers;
    const m = new MeshStandardMaterial({ color: new Color(colour), roughness: 0.75, metalness: 0 });
    if (glow) { m.emissive = new Color(accent); m.emissiveIntensity = glow * 0.3; }
    m.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, { uH: { value: h }, uLen: { value: len }, uCurl: { value: curl }, uDroop: { value: droop }, uFur: { value: tex }, uRep: { value: new Vector3(repeat[0], repeat[1], 0) } });
      sh.vertexShader = sh.vertexShader
        .replace("#include <common>", "#include <common>\nuniform float uH, uLen, uCurl, uDroop;\nvarying vec2 vFurUv;")
        .replace("#include <begin_vertex>", `#include <begin_vertex>
          vFurUv = uv;
          vec3 t1 = normalize(cross(normal, vec3(0.0, 1.0, 0.001)));
          vec3 t2 = cross(normal, t1);
          float ph = uH * 7.0 + dot(position, vec3(13.1, 7.3, 11.7));
          transformed += normal * uLen * uH
            + (t1 * sin(ph) + t2 * cos(ph)) * uCurl * uLen * uH
            + vec3(0.0, -1.0, 0.0) * uDroop * uLen * uH * uH;`);
      sh.fragmentShader = sh.fragmentShader
        .replace("#include <common>", "#include <common>\nuniform float uH;\nuniform sampler2D uFur;\nuniform vec3 uRep;\nvarying vec2 vFurUv;")
        .replace("#include <color_fragment>", `#include <color_fragment>
          float strand = texture2D(uFur, vFurUv * uRep.xy).r;
          if (strand < uH * 0.92 + 0.04) discard;
          diffuseColor.rgb *= mix(0.55, 1.15, uH);`);
    };
    m.customProgramCacheKey = () => "izk-fur";
    const o = new Mesh(geo, m);
    o.renderOrder = i;
    group.add(o);
    mats.push(m);
  }
  return mats;
}

/** The scalp: where hair grows on a unit skull (hairline high at the front, low at the nape). */
const SCALP_TILT = 0.34;
const SCALP_UP = new Vector3(0, Math.cos(SCALP_TILT), -Math.sin(SCALP_TILT));
function onScalp(p, reach = 0.44) {
  return p.dot(SCALP_UP) > Math.cos(Math.PI * reach);
}
/** A scalp-shaped cap (the shells' base). */
function scalpCap(grow = 1.0, reach = 0.44) {
  const g = new SphereGeometry(grow, 64, 32, 0, Math.PI * 2, 0, Math.PI * reach);
  g.rotateX(-SCALP_TILT);
  return g;
}

/**
 * Comb strands from the scalp. `style(p, pos, k)` gives the direction a hair
 * goes from root `p` at point `pos`; it hugs the head until `falls(pos, p)`,
 * then hangs, staying outside the head, until `ends(pos, p, travelled)`.
 */
function comb(n, rnd, { reach = 0.44, lift = 0.02, step = 0.04, style, falls = () => false, ends, root = () => true }) {
  const paths = [];
  const p = new Vector3(), pos = new Vector3(), d = new Vector3(), nrm = new Vector3();
  for (let i = 0, tries = 0; i < n && tries < n * 40; tries++) {
    p.set(rnd() * 2 - 1, rnd() * 2 - 1, rnd() * 2 - 1);
    if (p.lengthSq() > 1 || p.lengthSq() < 0.01) continue;
    p.normalize();
    if (!onScalp(p, reach) || !root(p)) continue;
    i++;
    const path = [p.clone().multiplyScalar(1.0)];
    const up = typeof lift === "function" ? lift(p) : lift;
    pos.copy(p).multiplyScalar(1 + up);
    let travelled = 0, hanging = false;
    const jitter = (rnd() - 0.5) * 0.25;
    for (let k = 0; k < 90; k++) {
      if (!hanging && falls(pos, p)) hanging = true;
      if (hanging) {
        d.set(pos.x * 0.04 + jitter * 0.05, -1, pos.z * 0.02);
        // Hair falls beside the face, never over it: drift back and out.
        if (pos.z > 0.05 && Math.abs(pos.x) < 1.05) { d.z -= 0.9; d.x += Math.sign(pos.x || 1) * 0.35; }
      } else {
        d.copy(style(p, pos, k));
        nrm.copy(pos).normalize();
        d.addScaledVector(nrm, -d.dot(nrm)); // along the head
      }
      if (d.lengthSq() < 1e-6) break;
      d.normalize().multiplyScalar(step);
      pos.add(d);
      // Never inside the head (or the face and neck under it).
      const r = Math.hypot(pos.x, pos.z);
      const minR = pos.y > 0 ? Math.sqrt(Math.max(0, (1 + up) ** 2 - pos.y * pos.y)) : 0.92 + up;
      if (!hanging) { if (pos.length() < 1 + up) pos.setLength(1 + up); }
      else if (r < minR && r > 1e-4) { pos.x *= minR / r; pos.z *= minR / r; }
      travelled += step;
      path.push(pos.clone());
      if (ends(pos, p, travelled)) break;
    }
    paths.push(path);
  }
  return paths;
}

/** Strands as fine lines, shaded like hair (darker roots, a soft sheen band). */
function strandLines(paths, colour, rnd, glow = 0, accent = "#5ee7ff") {
  const pos = [], col = [], base = new Color(colour).lerp(new Color(accent), glow * 0.6), c = new Color(), light = new Vector3(0.3, 0.8, 0.55).normalize();
  for (const path of paths) {
    const tone = 0.8 + rnd() * 0.35;
    for (let k = 0; k + 1 < path.length; k++) {
      for (const q of [path[k], path[k + 1]]) {
        pos.push(q.x, q.y, q.z);
        const along = Math.min(1, k / 8);
        const lit = Math.max(0, q.clone().normalize().dot(light));
        const sheen = Math.pow(lit, 6) * 0.6;
        c.copy(base).multiplyScalar(tone * (0.6 + 0.35 * along + 0.55 * lit)).addScalar(sheen * 0.25);
        col.push(c.r, c.g, c.b);
      }
    }
  }
  const g = new BufferGeometry();
  g.setAttribute("position", new Float32BufferAttribute(pos, 3));
  g.setAttribute("color", new Float32BufferAttribute(col, 3));
  return new LineSegments(g, new LineBasicMaterial({ vertexColors: true }));
}

/** Rope strands (dreads, box braids) along combed paths, fuzzy. */
function ropes(group, paths, colour, rnd, { thick = 0.06, braided = false } = {}) {
  const mats = [];
  for (const path of paths) {
    if (path.length < 3) continue;
    const r = thick * (0.75 + rnd() * 0.5);
    const geo = new TubeGeometry(new CatmullRomCurve3(path), Math.max(8, path.length), r, 7, false);
    mats.push(...furShells(group, geo, colour, { len: r * 0.6, layers: 5, curl: braided ? 0 : 0.8, repeat: braided ? [6, 40] : [10, 60] }));
  }
  return mats;
}

/** A haircut on a unit skull. On a sculpt (its own hair kept) only the extra volume is added. */
function haircut(cut, colour, hat, sculpt, glow, accent) {
  const g = new Group(), mats = [], rnd = seeded(cut.length * 977 + 13);
  const fur = (geo, o) => mats.push(...furShells(g, geo, colour, { glow, accent, ...o }));
  // The short hair that hugs the head (a fade at the sides, under longer styles).
  const short = (len = 0.03, reach = 0.42) => { if (!sculpt) fur(scalpCap(1.0, reach), { len, layers: 10, repeat: [90, 45] }); };
  const lines = (paths) => { const l = strandLines(paths, colour, rnd, glow, accent); g.add(l); mats.push(l.material); };
  const sideOf = (p) => (p.x >= 0 ? 1 : -1);
  const ball = (r, x, y, z, sx = 1, sy = 1, sz = 1, bump = 0.04) => {
    const geo = lumpy(new SphereGeometry(r, 48, 32), bump);
    geo.scale(sx, sy, sz);
    geo.translate(x, y, z);
    return geo;
  };
  switch (cut) {
    case "buzz": short(0.025); break;
    case "crew":
      short(0.025);
      fur(scalpCap(1.01, 0.3), { len: 0.09, layers: 14, droop: 0.4, repeat: [80, 40] });
      break;
    case "undercut":
      short(0.012);
      lines(comb(2600, rnd, { reach: 0.3, lift: 0.08, style: () => new Vector3(0, -0.2, -1), ends: (q, p, t) => t > 0.75 }));
      fur(scalpCap(1.0, 0.3), { len: 0.03, layers: 6 });
      break;
    case "edgar":
      short(0.012);
      fur(scalpCap(1.01, 0.32), { len: 0.1, layers: 14, droop: 0.5, repeat: [90, 45] });
      // The straight-cut fringe across the forehead.
      lines(comb(1600, rnd, { reach: 0.32, lift: 0.07, root: (p) => p.z > 0.2, style: () => new Vector3(0, -0.4, 1), ends: (q) => q.y < 0.56 }));
      break;
    case "curlytop":
      short(0.012);
      fur(ball(0.8, 0, 0.62, 0.08, 1, 0.55, 1.1, 0.06), { len: 0.14, layers: 16, curl: 1.2, repeat: [26, 14] });
      break;
    case "mohawk":
      short(0.012);
      fur(ball(0.3, 0, 0.78, 0.0, 1, 1.5, 3.2, 0.04), { len: 0.12, layers: 14, curl: 0.6, repeat: [20, 30] });
      break;
    case "afro":
      short(0.02);
      fur(ball(1.28, 0, 0.42, -0.6, 1, 1, 1, 0.05), { len: 0.16, layers: 18, curl: 1.4, repeat: [30, 16] });
      break;
    case "puffs":
      short(0.02);
      for (const s of [-1, 1]) fur(ball(0.52, s * 0.74, 0.86, -0.3, 1, 1, 1, 0.06), { len: 0.12, layers: 16, curl: 1.4, repeat: [18, 10] });
      break;
    case "bun":
    case "topknot": {
      const G = cut === "bun" ? new Vector3(0, 0.95, -0.62) : new Vector3(0, 1.12, -0.18);
      if (!sculpt) lines(comb(3200, rnd, { lift: 0.02, style: (p, q) => G.clone().sub(q), ends: (q) => q.distanceTo(G) < 0.3 }));
      short(0.015);
      fur(ball(cut === "bun" ? 0.4 : 0.32, G.x, G.y, G.z, 1, 0.85, 1, 0.08), { len: 0.06, layers: 12, droop: 0.2, repeat: [30, 20] });
      break;
    }
    case "ponytail": {
      const G = new Vector3(0, 0.38, -1.02);
      if (!sculpt) lines(comb(3200, rnd, { lift: 0.02, style: (p, q) => G.clone().sub(q), ends: (q) => q.distanceTo(G) < 0.12 }));
      short(0.015);
      // The tail: strands gathered at the tie and falling down the back.
      const tail = [];
      for (let i = 0; i < 900; i++) {
        const a = rnd() * Math.PI * 2, rr = Math.sqrt(rnd()) * 0.14, path = [];
        for (let k = 0; k <= 26; k++) {
          const t = k / 26, spread = rr * (1 + t * 1.6);
          path.push(new Vector3(G.x + Math.cos(a) * spread, G.y - t * 1.75, G.z - 0.12 - Math.sin(t * Math.PI) * 0.2 + Math.sin(a) * spread * 0.6));
        }
        tail.push(path);
      }
      lines(tail);
      fur(ball(0.11, G.x, G.y, G.z - 0.04), { len: 0.03, layers: 5 });
      break;
    }
    case "long":
    case "bob":
    case "curtains": {
      const bottom = cut === "long" ? -2.3 : cut === "bob" ? -0.82 : -0.25;
      short(0.015);
      lines(comb(cut === "curtains" ? 3200 : 4800, rnd, {
        lift: cut === "curtains" ? 0.06 : 0.03,
        style: (p) => new Vector3(sideOf(p) * (p.z > 0.35 ? 1.3 : 0.5), -1, p.z > 0.35 ? -0.5 : -0.15),
        falls: (q) => q.y < 0.3 && (Math.abs(q.x) > 0.8 || q.z < -0.1),
        ends: (q) => q.y < bottom,
      }));
      break;
    }
    case "pixie":
      short(0.015);
      lines(comb(3000, rnd, { lift: 0.05, style: (p) => new Vector3(0.5, -0.4, 0.9), ends: (q, p, t) => t > 0.55 || q.y < 0.45 }));
      break;
    case "sidepart":
      short(0.012);
      lines(comb(6000, rnd, {
        lift: (p) => 0.06 + Math.max(0, p.y) * 0.1,
        style: (p) => (p.x > -0.32 ? new Vector3(1, -0.15, -0.35) : new Vector3(-1, -0.6, -0.2)),
        ends: (q, p, t) => t > 0.85 || q.y < 0.15,
      }));
      break;
    case "slick":
      short(0.012);
      lines(comb(6000, rnd, { lift: (p) => 0.05 + Math.max(0, p.y) * 0.06, style: () => new Vector3(0, 0.05, -1), ends: (q) => q.z < -0.55 && q.y < 0.35 }));
      break;
    case "quiff":
      short(0.012);
      lines(comb(6000, rnd, {
        lift: (p) => 0.05 + Math.max(0, p.z) * 0.22,
        // The front sweeps up and back with volume; the rest is combed back.
        style: (p, q, k) => (p.z > 0.35 && k < 6 ? new Vector3(0, 1, 0.15) : new Vector3(0, 0.1, -1)),
        ends: (q, p, t) => t > (p.z > 0.35 ? 0.85 : 0.6),
      }));
      break;
    case "mullet":
      short(0.03, 0.42);
      lines(comb(2600, rnd, {
        lift: 0.03,
        root: (p) => p.z < -0.15,
        style: () => new Vector3(0, -1, -0.2),
        falls: (q) => q.y < 0.1,
        ends: (q) => q.y < -1.3,
      }));
      break;
    case "locs":
    case "boxbraids": {
      short(0.015);
      const paths = comb(cut === "locs" ? 120 : 170, rnd, {
        lift: 0.05,
        step: 0.07,
        style: (p) => new Vector3(sideOf(p) * (p.z > 0.35 ? 1.3 : 0.45), -1, p.z > 0.35 ? -0.5 : -0.2),
        falls: (q) => q.y < 0.35 && (Math.abs(q.x) > 0.8 || q.z < -0.1),
        ends: (q, p, t) => q.y < -1.3 - (p.x * 7.3 % 0.4),
      });
      mats.push(...ropes(g, paths, colour, rnd, { thick: cut === "locs" ? 0.06 : 0.04, braided: cut === "boxbraids" }));
      break;
    }
    case "braids": {
      // Cornrows: tight rows from the hairline back to the nape.
      short(0.008);
      const rows = [];
      for (let i = -4; i <= 4; i++) {
        const path = [];
        for (let k = 0; k <= 16; k++) {
          const a = 0.95 - (k / 16) * 2.1; // forehead to nape
          const x = i * 0.17 * Math.cos(a * 0.35);
          const yz = Math.sqrt(Math.max(0, 1 - x * x)) * 1.03;
          path.push(new Vector3(x, Math.cos(a - 0.5) * yz, Math.sin(a - 0.5) * yz));
        }
        rows.push(path);
      }
      mats.push(...ropes(g, rows, colour, rnd, { thick: 0.055, braided: true }));
      break;
    }
    case "beanie": {
      const knit = scalpCap(1.12, 0.42);
      g.add(new Mesh(knit, hat));
      const brim = new Mesh(new TorusGeometry(1.0, 0.13, 12, 48), hat);
      brim.rotation.x = Math.PI / 2 - 0.5;
      brim.position.set(0, 0.36, -0.2);
      g.add(brim);
      break;
    }
    default: break;
  }
  return { group: g, mats };
}

/** Put the chosen haircut on (or take it off): rebuilt only when it changes. */
function wearHaircut(model, L) {
  // Rigged faces and the smooth-headed holograms wear any cut; the other
  // sculpts keep their own hair, so only cuts that add to it.
  const info = faceInfo(model.id) || {};
  const full = model.rigged || !!info.bald || (!!info.shortHair && L.cut !== "bald");
  const want = full || (HAIRCUTS.find(([k]) => k === L.cut) || [])[2] ? L.cut || "" : "";
  const colour = L.hair || "#1a1412";
  const key = `${want}|${colour}|${L.accent}|${L.glow}`;
  if (model.cutKey === key) return;
  model.cutKey = key;
  if (model.cut) {
    model.cut.parent?.remove(model.cut);
    model.cut.traverse((o) => { o.geometry?.dispose(); });
    for (const m of model.cutMats || []) m.dispose();
    model.cut = null;
  }
  // A rigged face's own hair goes away under a new cut (brows and lashes stay).
  for (const m of model.hairMeshes) if (/hair/i.test(m.name)) m.visible = !want;
  if (!want || want === "bald") return;
  const knit = new Color(L.accent || "#a78bfa").lerp(new Color("#ffffff"), 0.15);
  const hat = new MeshStandardMaterial({ color: knit, roughness: 0.95, bumpMap: furTexture(false), bumpScale: 2 });
  const { group: cut, mats } = haircut(want, colour, hat, !full, clamp(L.glow || 0, 0, 1), L.accent);
  model.cutMats = [...mats, hat];
  const sk = model.frame.skull;
  if (sk.bone) {
    // Ride on the head bone: placed in its space, upright at rest.
    const b = sk.bone;
    b.updateWorldMatrix(true, false);
    const wq = b.getWorldQuaternion(new Quaternion());
    const ws = b.getWorldScale(new Vector3());
    cut.position.copy(b.worldToLocal(sk.c.clone()));
    cut.quaternion.copy(wq.invert());
    cut.scale.copy(sk.r).divideScalar(ws.x || 1);
    b.add(cut);
  } else {
    cut.position.copy(sk.c);
    cut.scale.copy(sk.r);
    model.root.add(cut);
  }
  model.cut = cut;
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
  wearHaircut(model, L);
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
