// The orb for the store art: the room's own shader (NOISE, ORB_VERT, ORB_FRAG
// and THEMES are copied in from docs/app/vr-scene.src.js by
// tools/quest-store-art.cjs, so the art always shows today's orb).
import { Color, Mesh, PerspectiveCamera, Scene, ShaderMaterial, SphereGeometry, SRGBColorSpace, WebGLRenderer } from "three";

/**
 * Draws the orb, filling a size×size canvas edge to edge (transparent around it).
 * theme: a THEMES name; time and energy pick the moment of its swirl.
 */
export function orb(size, { theme = "Nova", time = 9, energy = 0.04 } = {}) {
  const t = THEMES.find((x) => x.name === theme) || THEMES[0];
  // The room's sphere, at the room's size: the swirl's scale depends on it.
  const r = 0.085, fov = 20;
  const d = r / Math.sin((fov / 2) * Math.PI / 180);
  const renderer = new WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.setPixelRatio(1);
  renderer.setSize(size, size, false);
  const scene = new Scene();
  // The silhouette's half-angle is asin(r / d) = fov / 2: the orb fills the frame.
  const camera = new PerspectiveCamera(2 * Math.atan(Math.tan(Math.asin(r / d)) * 1.004) * 180 / Math.PI, 1, 0.01, 10);
  camera.position.set(0, 0, d);
  const mat = new ShaderMaterial({
    uniforms: {
      uTime: { value: time }, uEnergy: { value: energy }, uThink: { value: 0 },
      uA: { value: new Color().setRGB(...t.orb[0]) }, uB: { value: new Color().setRGB(...t.orb[1]) }, uC: { value: new Color().setRGB(...t.orb[2]) },
      uGlow: { value: new Color(0.82, 0.95, 1.0) },
    },
    vertexShader: ORB_VERT, fragmentShader: ORB_FRAG, transparent: true,
  });
  scene.add(new Mesh(new SphereGeometry(r, 128, 96), mat));
  renderer.render(scene, camera);
  // A plain copy, so the WebGL context can go (a page only gets a few).
  const copy = document.createElement("canvas");
  copy.width = copy.height = size;
  copy.getContext("2d").drawImage(renderer.domElement, 0, 0);
  mat.dispose();
  renderer.dispose();
  renderer.forceContextLoss();
  return copy;
}

/** The theme's halo colour, as CSS. */
export function halo(theme = "Nova") {
  const t = THEMES.find((x) => x.name === theme) || THEMES[0];
  return "#" + t.halo.toString(16).padStart(6, "0");
}
