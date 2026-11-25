// Exercise the real renderer and component with a deterministic display clock.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';
import { transformSync } from 'esbuild';
import { createLiveField } from '../docs/app/live-field.js';

function context2d() {
  return {
    clears: 0,
    clearRect() { this.clears++; },
    createRadialGradient() { return { addColorStop() {} }; },
    fillRect() {},
  };
}

function contextGl(failure) {
  return {
    VERTEX_SHADER: 1, FRAGMENT_SHADER: 2, COMPILE_STATUS: 3, LINK_STATUS: 4,
    SRC_ALPHA: 5, ONE: 6, BLEND: 7,
    deletedShaders: 0, deletedPrograms: 0,
    createShader: () => ({}), shaderSource() {}, compileShader() {}, deleteShader() { this.deletedShaders++; },
    getShaderParameter: () => failure !== 'compile', getShaderInfoLog: () => 'compile failed',
    createProgram: () => ({}), attachShader() {}, linkProgram() {}, deleteProgram() { this.deletedPrograms++; },
    getProgramParameter: () => failure !== 'link', getProgramInfoLog: () => 'link failed',
    createBuffer: () => ({}), bindBuffer() {}, bufferData() {},
    getAttribLocation: () => 0, enableVertexAttribArray() {}, vertexAttribPointer() {},
    getUniformLocation: () => ({}), uniform3f() {}, uniform1f() {}, useProgram() {}, enable() {},
    blendFuncSeparate(...factors) { this.factors = factors; },
    clearColor() {}, clear() {}, drawArrays() {}, viewport() {}, deleteBuffer() {},
  };
}

// Browsers permanently lock a canvas to its first successful context type.
function canvas(gl = null) {
  const ctx = context2d();
  let kind;
  return {
    width: 300, height: 150, clientWidth: 800, clientHeight: 600,
    parentElement: null, ctx,
    getContext(type) {
      const requested = type === '2d' ? '2d' : 'webgl';
      if (kind && requested !== kind) return null;
      if (requested === 'webgl' && !gl) return null;
      kind = requested;
      return requested === '2d' ? ctx : gl;
    },
    cloneNode() { return canvas(); },
    replaceWith(next) {
      const parent = this.parentElement;
      if (!parent) return;
      parent.child = next;
      next.parentElement = parent;
      this.parentElement = null;
    },
  };
}

for (const failure of ['compile', 'link']) {
  test(`${failure} failure draws on a fresh 2D canvas`, () => {
    const gl = contextGl(failure);
    const original = canvas(gl);
    const field = createLiveField(original, { maxPixels: 1_000_000 });
    assert.ok(field);
    assert.equal(field.gpu, false);
    assert.notEqual(field.canvas, original);
    field.resize(4000, 2000, 3);
    assert.ok(field.canvas.width * field.canvas.height <= 1_000_000);
    field.still('idle', 0);
    assert.equal(field.canvas.ctx.clears, 1);
    assert.equal(original.getContext('2d'), null);
    assert.equal(gl.deletedPrograms, 1);
    assert.equal(gl.deletedShaders, failure === 'compile' ? 1 : 2);
  });
}

test('unavailable WebGL keeps the original canvas and respects fallback size options', () => {
  const original = canvas();
  const field = createLiveField(original, { maxPixels: 1_000_000, maxDpr: 1 });
  assert.equal(field.canvas, original);
  field.resize(100, 50, 3);
  assert.deepEqual([original.width, original.height], [100, 50]);
  field.resize(4000, 2000, 3);
  assert.ok(original.width * original.height <= 1_000_000);
  assert.ok(Math.abs(original.width / original.height - 2) < 0.01);
});

test('fallback applies its default pixel budget before allocating a large surface', () => {
  const field = createLiveField(canvas());
  field.resize(8000, 8000, 2);
  assert.ok(field.canvas.width * field.canvas.height <= 1_400_000);
});

test('GPU additive color preserves source alpha instead of squaring it', () => {
  const gl = contextGl();
  const field = createLiveField(canvas(gl));
  assert.equal(field.gpu, true);
  assert.deepEqual(gl.factors, [gl.SRC_ALPHA, gl.ONE, gl.ONE, gl.ONE]);
  field.frame('thinking', 0.5, 0.04);
  assert.equal(field.time, 0.04);
  field.dispose();
  assert.equal(gl.deletedPrograms, 1);
  assert.equal(gl.deletedShaders, 2);
});

const componentCode = transformSync(readFileSync('src/components/LiveField.tsx', 'utf8'), {
  loader: 'tsx', format: 'cjs', jsx: 'automatic',
}).code;

function component({ reduced = false, hidden = false, away = false, state = 'idle', field: suppliedField } = {}) {
  const original = canvas();
  const box = { child: original, getBoundingClientRect: () => ({ width: 800, height: 600 }) };
  original.parentElement = box;
  const frames = [], stills = [];
  const field = suppliedField || {
    canvas: original, resize() {}, pulse() {}, dispose() {},
    frame(...args) { frames.push(args); }, still(...args) { stills.push(args); },
  };
  const refs = [];
  let refIndex = 0, setup, cleanup, now = 0, nextRaf = 0;
  const pending = new Map(), visibilityListeners = new Set(), motionListeners = new Set();
  const mutations = new Set(), resizes = new Set();
  const motion = { matches: reduced,
    addEventListener: (_, fn) => motionListeners.add(fn),
    removeEventListener: (_, fn) => motionListeners.delete(fn),
  };
  const document = { hidden,
    documentElement: { classList: { contains: () => away } },
    addEventListener: (_, fn) => visibilityListeners.add(fn),
    removeEventListener: (_, fn) => visibilityListeners.delete(fn),
  };
  const store = { voice: { busy: state === 'thinking', active: state === 'listening' },
    status: { kind: state === 'working' ? 'working' : 'idle' } };
  const module = { exports: {} };
  vm.runInNewContext(componentCode, {
    module, exports: module.exports,
    require(id) {
      if (id === 'react') return {
        useRef(value) { const i = refIndex++; return refs[i] ||= { current: value === null ? original : value }; },
        useEffect(fn) { setup = fn; },
      };
      if (id === 'react/jsx-runtime') return { jsx: () => ({}) };
      if (id.endsWith('live-field.js')) return { createLiveField: () => field };
      if (id.endsWith('/ipc')) return { EV: {}, on: () => Promise.resolve(() => {}) };
      if (id.endsWith('/store')) return { useIzuki: (select) => select(store) };
      throw new Error(`Unexpected import ${id}`);
    },
    window: { devicePixelRatio: 1, matchMedia: () => motion }, document,
    performance: { now: () => now },
    requestAnimationFrame(fn) { pending.set(++nextRaf, fn); return nextRaf; },
    cancelAnimationFrame(id) { pending.delete(id); },
    MutationObserver: class {
      constructor(fn) { this.fn = fn; }
      observe() { mutations.add(this.fn); }
      disconnect() { mutations.delete(this.fn); }
    },
    ResizeObserver: class {
      constructor(fn) { this.fn = fn; }
      observe() { resizes.add(this.fn); }
      disconnect() { resizes.delete(this.fn); }
    },
  });
  module.exports.LiveField();
  cleanup = setup();
  return {
    field, original, box, frames, stills, pending,
    advance(ms, hz = 60) {
      const end = now + ms;
      while (now + 1000 / hz <= end + 0.001) {
        now += 1000 / hz;
        const callbacks = [...pending.values()];
        pending.clear();
        callbacks.forEach((fn) => fn(now));
      }
    },
    reduced(value) { motion.matches = value; motionListeners.forEach((fn) => fn()); },
    hidden(value) { document.hidden = value; visibilityListeners.forEach((fn) => fn()); },
    away(value) { away = value; mutations.forEach((fn) => fn()); },
    resize() { resizes.forEach((fn) => fn()); },
    remount() { cleanup(); cleanup = setup(); },
    cleanup() { cleanup(); assert.equal(motionListeners.size + visibilityListeners.size + mutations.size + resizes.size + pending.size, 0); },
  };
}

for (const state of ['idle', 'thinking']) {
  for (const hz of [60, 120]) {
    test(`${state} draws at its capped rate on a ${hz} Hz display`, () => {
      const host = component({ state });
      host.advance(1000, hz);
      const target = state === 'idle' ? 8 : 30;
      assert.ok(host.frames.length >= target - 1 && host.frames.length <= target,
        `expected near ${target} frames, saw ${host.frames.length}`);
      assert.ok(host.frames.length > 0);
      assert.ok(host.frames.every(([, , dt]) => dt > 0 && dt <= 0.1));
      host.cleanup();
    });
  }
}

test('reduced motion renders once, stops scheduling, and resumes on preference change', () => {
  const host = component({ reduced: true });
  host.advance(1000);
  assert.equal(host.stills.length, 1);
  assert.equal(host.pending.size, 0);
  host.reduced(false);
  host.advance(1000);
  assert.ok(host.frames.length >= 7);
  host.reduced(true);
  host.advance(1000);
  assert.equal(host.stills.length, 2);
  assert.equal(host.pending.size, 0);
  host.cleanup();
});

test('resizing a reduced-motion panel redraws the still once and stops', () => {
  const host = component({ reduced: true });
  host.advance(1000);
  host.resize();
  host.advance(1000);
  assert.equal(host.stills.length, 2);
  assert.equal(host.pending.size, 0);
  host.cleanup();
});

for (const guard of ['hidden', 'away']) {
  test(`reduced motion waits for the ${guard} panel to become visible`, () => {
    const host = component({ reduced: true, [guard]: true });
    host.advance(1000);
    assert.equal(host.stills.length, 0);
    assert.equal(host.pending.size, 0);
    host[guard](false);
    host.advance(1000);
    assert.equal(host.stills.length, 1);
    assert.equal(host.pending.size, 0);
    host.cleanup();
  });
  test(`animation stops when ${guard} and resumes when visible`, () => {
    const host = component({ state: 'thinking' });
    host.advance(1000);
    const rendered = host.frames.length;
    host[guard](true);
    host.advance(1000);
    assert.equal(host.frames.length, rendered);
    assert.equal(host.pending.size, 0);
    host[guard](false);
    host.advance(1000);
    assert.ok(host.frames.length >= rendered + 29);
    host.cleanup();
  });
}

test('host displays the replacement surface and restores the React canvas on cleanup/remount', () => {
  const replacement = canvas();
  const host = component({ reduced: true, field: {
    canvas: replacement, resize() {}, still() {}, dispose() {},
  } });
  assert.equal(host.box.child, replacement);
  host.remount();
  assert.equal(host.box.child, replacement);
  host.cleanup();
  assert.equal(host.box.child, host.original);
});
