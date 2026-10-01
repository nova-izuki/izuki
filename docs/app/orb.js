// The liquid orb — the same one as Izuki on the PC (src/components/VoiceSphere.tsx):
// wave-blobs of flowing colour screened together, drifting all the time and
// rippling with sound. Cool blue listening, violet thinking, warm
// pink-cyan-green talking.
//
//   IzukiOrb.add(canvas)      draw an orb in this canvas (any number of them)
//   IzukiOrb.mode("listening") idle | listening | thinking | speaking
//   IzukiOrb.level(0.4)       a live sound level (the mic), 0..1
//   IzukiOrb.kick(0.6)        a burst of sound (a word heard)
//
// All orbs share one animation loop, which only runs while one is on screen
// and the page is visible — and slows down when nothing is happening.
(() => {
  "use strict";
  const PALETTES = {
    idle:      { colors: ["99,102,241", "34,211,238", "139,92,246", "56,189,248"], glow: "99,102,241", spin: 0.25 },
    listening: { colors: ["6,182,212", "10,132,255", "99,102,241", "34,211,238"], glow: "14,165,233", spin: 0.45 },
    thinking:  { colors: ["147,51,234", "79,70,229", "219,39,119", "124,58,237"], glow: "139,92,246", spin: 1.3 },
    speaking:  { colors: ["236,72,153", "6,182,212", "16,185,129", "139,92,246"], glow: "217,70,239", spin: 0.7 },
  };
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const orbs = new Set();
  let style = "liquid";
  try { style = localStorage.getItem("izuki.orbStyle") || "liquid"; } catch {}
  let mode = "idle", target = 0, level = 0, t = 0, turn = 0, last = performance.now(), raf = 0, frame = 0;
  const parse = (col) => col.split(",").map(Number);
  let mix = PALETTES.idle.colors.map(parse), glowMix = parse(PALETTES.idle.glow);
  const rgba = (rgb, a) => `rgba(${rgb.map(Math.round).join(",")},${a})`;

  function fit(o) {
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const size = Math.round(o.canvas.clientWidth || o.canvas.width || 100);
    if (size === o.size && o.dpr === dpr) return;
    o.size = size; o.dpr = dpr;
    for (const c of [o.canvas, o.scratch]) { c.width = size * dpr; c.height = size * dpr; }
    o.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    o.lx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  const visible = (o) => o.canvas.isConnected && o.canvas.getClientRects().length > 0;

  function paint(o, now) {
    fit(o);
    const { ctx, lx, size: SIZE } = o;
    if (!SIZE) return;
    // Small orbs (the talk button) get fewer points — they're tiny anyway.
    const small = SIZE < 90;
    const c = SIZE / 2;
    const R = SIZE * (small ? 0.4 : 0.3) * (1 + level * 0.16 + 0.015 * Math.sin(now / 900));
    ctx.globalCompositeOperation = "source-over";
    ctx.clearRect(0, 0, SIZE, SIZE);

    if (!small) {
      const halo = ctx.createRadialGradient(c, c, R * 0.4, c, c, SIZE / 2);
      halo.addColorStop(0, rgba(glowMix, 0.42 + level * 0.38));
      halo.addColorStop(0.55, rgba(mix[Math.abs(Math.floor(turn / 1.5)) % 4] || mix[0], 0.1 + level * 0.12));
      halo.addColorStop(1, rgba(glowMix, 0));
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, SIZE, SIZE);
    }

    if (style === "ferrofluid") {
      // A glassy liquid pool with deliberately uneven satellite drops. The
      // quiet state barely moves; thinking pulls water outward, then speaking
      // gathers it home. That rhythm feels much closer to poured liquid than
      // a clockwork ring of particles.
      const merge = mode === "speaking" ? 0.92 : mode === "thinking" ? 0.18 + level * 0.2 : Math.min(0.42, level * 0.5);
      const coreR = R * (0.92 + level * 0.11);
      const shadow = ctx.createRadialGradient(c, c + coreR * 1.06, 0, c, c + coreR * 1.06, coreR * 1.55);
      shadow.addColorStop(0, "rgba(0,0,0,0.28)"); shadow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = shadow; ctx.beginPath(); ctx.ellipse(c, c + coreR * 1.02, coreR * 1.45, coreR * 0.33, 0, 0, Math.PI * 2); ctx.fill();
      const body = ctx.createRadialGradient(c - coreR * 0.38, c - coreR * 0.42, coreR * 0.025, c, c, coreR * 1.18);
      body.addColorStop(0, "rgba(255,255,255,0.94)");
      body.addColorStop(0.08, "rgba(205,246,255,0.76)");
      body.addColorStop(0.33, rgba(mix[1], 0.64));
      body.addColorStop(0.68, "rgba(10,28,55,0.72)");
      body.addColorStop(1, "rgba(1,5,16,0.94)");
      ctx.fillStyle = body; ctx.beginPath();
      for (let i = 0; i <= 96; i++) {
        const a = i / 96 * Math.PI * 2;
        const surface = Math.sin(a * 2 + t * 0.7) * (0.012 + level * 0.035) + Math.sin(a * 5 - t * 1.3) * level * 0.02;
        const rr = coreR * (1 + surface);
        const x = c + Math.cos(a) * rr, y = c + Math.sin(a) * rr * (0.96 + level * 0.035);
        if (!i) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath(); ctx.fill();
      const rim = ctx.createRadialGradient(c, c, coreR * 0.72, c, c, coreR * 1.03);
      rim.addColorStop(0, "rgba(105,231,255,0)"); rim.addColorStop(0.82, "rgba(117,229,255,0.12)"); rim.addColorStop(1, "rgba(226,252,255,0.6)");
      ctx.strokeStyle = rim; ctx.lineWidth = Math.max(1, coreR * 0.03); ctx.stroke();
      const count = small ? 3 : 7;
      for (let i = 0; i < count; i++) {
        const phase = i * 2.399 + Math.sin(i * 7.1) * 0.45;
        const drift = t * (0.22 + (i % 3) * 0.035) + Math.sin(t * 0.32 + i) * 0.18;
        const angle = phase + drift;
        const baseDistance = coreR * (1.55 + (i % 4) * 0.19 - merge * 0.88);
        const distance = baseDistance + coreR * 0.09 * Math.sin(t * 0.75 + i * 3.7);
        const x = c + Math.cos(angle) * distance;
        const y = c + Math.sin(angle) * distance * 0.82;
        const dropR = coreR * (0.085 + (i % 3) * 0.024 + level * 0.045) * (i === 0 ? 1.45 : 1);
        if (merge > 0.08) {
          const neck = ctx.createLinearGradient(c, c, x, y);
          neck.addColorStop(0, "rgba(127,237,255,0.30)"); neck.addColorStop(0.72, rgba(mix[i % 4], 0.12 + merge * 0.22)); neck.addColorStop(1, "rgba(255,255,255,0)");
          ctx.strokeStyle = neck; ctx.lineWidth = Math.max(1, dropR * (0.55 + merge * 0.75)); ctx.lineCap = "round";
          ctx.beginPath(); ctx.moveTo(c + Math.cos(angle) * coreR * 0.72, c + Math.sin(angle) * coreR * 0.68); ctx.lineTo(x, y); ctx.stroke();
        }
        const drop = ctx.createRadialGradient(x - dropR * 0.42, y - dropR * 0.48, 0, x, y, dropR * 1.18);
        drop.addColorStop(0, "rgba(255,255,255,0.98)"); drop.addColorStop(0.14, "rgba(224,251,255,0.86)");
        drop.addColorStop(0.42, rgba(mix[(i + 1) % 4], 0.66)); drop.addColorStop(1, "rgba(4,13,30,0.72)");
        ctx.fillStyle = drop; ctx.beginPath(); ctx.arc(x, y, dropR, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "rgba(236,255,255,0.48)"; ctx.lineWidth = Math.max(.7, dropR * .12); ctx.stroke();
      }
      ctx.lineCap = "butt";
      return;
    }
    if (["ripple", "constellation"].includes(style)) {
      ctx.lineWidth = 1.5;
      if (style === "ripple") {
        for (let ring = 0; ring < 5; ring++) {
          const radius = R * (0.3 + ring * 0.16 + 0.04 * Math.sin(t * 2 - ring));
          ctx.beginPath(); ctx.ellipse(c, c, radius, radius * (0.8 + level * 0.15), turn * 0.15, 0, Math.PI * 2);
          ctx.strokeStyle = rgba(mix[ring % 4], 0.85 - ring * 0.1); ctx.stroke();
        }
      } else {
        for (let dot = 0; dot < 64; dot++) {
          const angle = dot * 2.39996 + turn * 0.2, radius = R * Math.sqrt((dot + 1) / 64);
          ctx.beginPath(); ctx.arc(c + Math.cos(angle) * radius, c + Math.sin(angle) * radius, 1.2 + level * 2 + 0.7 * Math.sin(t + dot), 0, Math.PI * 2);
          ctx.fillStyle = rgba(mix[dot % 4], 0.85); ctx.fill();
        }
      }
      return;
    }
    const body = ctx.createRadialGradient(c, c + R * 0.2, R * 0.1, c, c, R * 1.05);
    body.addColorStop(0, rgba(mix[1], 0.16));
    body.addColorStop(1, "rgba(4,8,22,0.78)");
    ctx.fillStyle = body;
    ctx.beginPath(); ctx.arc(c, c, R * 0.97, 0, Math.PI * 2); ctx.fill();

    ctx.globalCompositeOperation = "screen";
    const points = small ? 48 : 120;
    for (let layer = 0; layer < 3; layer++) {
      const phase = layer * 2.1, amp = 0.05 + level * 0.2, scale = 0.86 + layer * 0.08;
      lx.globalCompositeOperation = "source-over";
      lx.clearRect(0, 0, SIZE, SIZE);
      lx.beginPath();
      for (let i = 0; i <= points; i++) {
        const a = (i / points) * Math.PI * 2;
        const wave = Math.sin(a * 2 + t * 1.3 + phase) * 0.5 + Math.sin(a * 3 - t * 1.9 + phase * 1.7) * 0.35
          + Math.sin(a * 5 + t * 2.7 - phase) * 0.25 * (0.3 + level * 1.4) + Math.sin(a * 8 - t * 3.4 + phase) * 0.12 * level;
        const r = R * scale * (1 + amp * wave);
        const x = c + Math.cos(a) * r, y = c + Math.sin(a) * r;
        if (i === 0) lx.moveTo(x, y); else lx.lineTo(x, y);
      }
      lx.closePath();
      const ox = Math.cos(t * 0.7 + phase) * R * 0.16, oy = Math.sin(t * 0.9 + phase) * R * 0.16;
      const dir = layer === 1 ? -1 : 1;
      let flow;
      if (lx.createConicGradient) {
        flow = lx.createConicGradient(turn * dir * (0.8 + layer * 0.25) + phase, c + ox, c + oy);
        for (let k = 0; k <= 4; k++) flow.addColorStop(k / 4, rgba(mix[(k + layer) % 4], 0.78));
      } else {
        flow = lx.createLinearGradient(c - R, c - R, c + R, c + R);
        for (let k = 0; k <= 3; k++) flow.addColorStop(k / 3, rgba(mix[(k + layer) % 4], 0.78));
      }
      lx.fillStyle = flow; lx.fill();
      lx.strokeStyle = rgba(mix[(layer + 2) % 4], 0.35 + level * 0.5); lx.lineWidth = 1.3; lx.stroke();
      lx.globalCompositeOperation = "destination-out";
      const clear = lx.createRadialGradient(c + ox, c + oy, 0, c + ox, c + oy, R * scale * 1.1);
      clear.addColorStop(0, "rgba(0,0,0,0.97)"); clear.addColorStop(0.6, "rgba(0,0,0,0.85)");
      clear.addColorStop(0.88, "rgba(0,0,0,0.3)"); clear.addColorStop(1, "rgba(0,0,0,0)");
      lx.fillStyle = clear; lx.fillRect(0, 0, SIZE, SIZE);
      ctx.drawImage(o.scratch, 0, 0, SIZE, SIZE);
    }
    if (!small) {
      for (let k = 0; k < 3; k++) {
        const rr = R * (0.35 + k * 0.18 + 0.05 * Math.sin(t * 0.8 + k));
        ctx.beginPath();
        for (let i = 0; i <= 72; i++) {
          const a = (i / 72) * Math.PI * 2;
          const r = rr * (1 + (0.08 + level * 0.12) * Math.sin(a * (3 + k) + t * (1.2 + k * 0.5)));
          const x = c + Math.cos(a) * r, y = c + Math.sin(a) * r * 0.92;
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(255,255,255,${0.06 + level * 0.12})`; ctx.lineWidth = 1; ctx.stroke();
      }
    }
    const core = ctx.createRadialGradient(c, c, 0, c, c, R * (0.45 + level * 0.35));
    core.addColorStop(0, `rgba(255,255,255,${0.03 + level * 0.22})`);
    core.addColorStop(0.5, rgba(mix[0], 0.1 + level * 0.22));
    core.addColorStop(1, rgba(mix[0], 0));
    ctx.fillStyle = core; ctx.beginPath(); ctx.arc(c, c, R, 0, Math.PI * 2); ctx.fill();
    ctx.globalCompositeOperation = "source-over";
    const hl = ctx.createRadialGradient(c - R * 0.38, c - R * 0.42, 0, c - R * 0.38, c - R * 0.42, R * 0.55);
    hl.addColorStop(0, "rgba(255,255,255,0.3)"); hl.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = hl; ctx.beginPath(); ctx.arc(c, c, R * 0.98, 0, Math.PI * 2); ctx.fill();
    if (ctx.createConicGradient) {
      const rim = ctx.createConicGradient(-turn * 1.4, c, c);
      for (let k = 0; k <= 4; k++) rim.addColorStop(k / 4, rgba(mix[k % 4], 0.35 + level * 0.45));
      ctx.strokeStyle = rim; ctx.lineWidth = 1.4 + level * 1.6; ctx.stroke();
    }
  }

  function tick(now) {
    raf = 0;
    // An orb whose screen was taken away (the home screen redraws) is dropped.
    for (const o of orbs) {
      if (o.canvas.isConnected) o.seen = true;
      else if (o.seen) orbs.delete(o);
    }
    const shown = [...orbs].filter(visible);
    if (!shown.length || document.hidden) return; // woken again by add/mode/visibility
    raf = requestAnimationFrame(tick);
    // Resting: half the frames are plenty (and kinder to the battery).
    if (now - last < (reduced ? 150 : mode === "idle" ? 80 : 33)) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const pal = PALETTES[mode] || PALETTES.idle;
    // Izuki's voice plays as a file, which can't be measured: a
    // syllable-like rhythm stands in for it.
    if (mode === "speaking") kick(0.35 + 0.55 * Math.abs(Math.sin(now / 150) * Math.sin(now / 470)));
    if (mode === "listening") kick(0.08 + 0.05 * Math.sin(now / 600));
    const goal = mode === "thinking" ? 0.22 + 0.08 * Math.sin(now / 380) : mode === "idle" ? 0.05 : target;
    level += (goal - level) * (goal > level ? 0.45 : 0.08);
    target *= 0.9;
    const pace = reduced ? 0.25 : 1;
    t += dt * pace * (mode === "thinking" ? 1.6 : 1 + level * 2.2);
    turn += dt * pace * (pal.spin + level * 1.2);
    const ease = (from, to) => from.map((v, i) => v + (Number(to.split(",")[i]) - v) * 0.06);
    mix = mix.map((col, i) => ease(col, pal.colors[i]));
    glowMix = ease(glowMix, pal.glow);
    for (const o of shown) paint(o, now);
  }

  function wake() {
    if (!raf) { last = performance.now(); raf = requestAnimationFrame(tick); }
  }
  function kick(v) { target = Math.min(1, Math.max(target, v)); wake(); }

  document.addEventListener("visibilitychange", wake);
  addEventListener("resize", wake);

  window.IzukiOrb = {
    style(value) {
      style = ["liquid", "ferrofluid", "ripple", "constellation"].includes(value) ? value : "liquid";
      try { localStorage.setItem("izuki.orbStyle", style); } catch {}
      wake();
    },
    add(canvas) {
      const scratch = document.createElement("canvas");
      const o = { canvas, scratch, ctx: canvas.getContext("2d"), lx: scratch.getContext("2d"), size: 0, dpr: 0 };
      orbs.add(o);
      wake();
      // A canvas that just appeared (a screen opening) starts the loop too.
      if (window.ResizeObserver) new ResizeObserver(wake).observe(canvas);
      return canvas;
    },
    mode(m) { mode = PALETTES[m] ? m : "idle"; wake(); },
    level(v) { if (Number.isFinite(v)) kick(Math.max(0, Math.min(1, v))); },
    kick,
    wake,
  };
})();
