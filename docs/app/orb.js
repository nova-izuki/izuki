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
  let material, motionModule, physics;
  Promise.all([import('./water-orb.js'), import('./orb-materials.js'), import('./orb-motion.js'), import('./glass-orb.js')]).then(([water, looks, motion, glass]) => {
    material = { ...water, ...looks, ...glass }; motionModule=motion; physics=motion.createOrbMotion(); wake();
  }).catch(() => {});
  let response = 1, audioTrack = null, audioGeneration = 0;
  try { const value=Number(localStorage.getItem('izuki.orbResponse') || 1); if(Number.isFinite(value)) response=Math.max(.5,Math.min(1.5,value)); } catch {}
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

  const visible = (o) => { const r=o.canvas.getBoundingClientRect();return o.canvas.isConnected && r.width>0 && r.height>0 && r.bottom>0 && r.top<innerHeight; };

  function visualState(o) {
    if (!o.preview || !o.physics) return { level, t, turn, mix, glowMix };
    const pal=PALETTES[o.preview.mode] || PALETTES.idle;
    return { level:o.physics.energy, t:reduced?0:o.physics.time, turn:reduced?0:o.physics.time*pal.spin,
      mix:pal.colors.map(parse), glowMix:parse(pal.glow) };
  }

  function paint(o, now) {
    fit(o);
    const { ctx, lx, size: SIZE } = o;
    const { level, t, turn, mix, glowMix } = visualState(o);
    if (!SIZE) return;
    // Small orbs (the talk button) get fewer points — they're tiny anyway.
    const small = SIZE < 90;
    const c = SIZE / 2;
    const R = SIZE * (small ? 0.4 : 0.3) * (1 + level * 0.16 + 0.015 * Math.sin(now / 900));
    ctx.globalCompositeOperation = "source-over";
    ctx.clearRect(0, 0, SIZE, SIZE);

    const selectedStyle = o.preview ? o.preview.style : style;
    const state = o.preview ? o.physics : physics;
    if (selectedStyle !== 'liquid' && material && state) {
      // The realistic GPU look first; the 2D drawers if this phone can't.
      if (material.drawGlassOrb && material.drawGlassOrb(ctx, SIZE, selectedStyle, reduced ? 0 : state.time, state.energy, state.waiting || 0)) return;
      if (selectedStyle === 'ferrofluid' || selectedStyle === 'dew') material.drawWaterOrb(ctx,SIZE,state.time,state.energy,0,(o.preview?.mode || mode)==='thinking',state);
      else (selectedStyle === 'ripple' ? material.drawRippleOrb : material.drawConstellationOrb)(ctx,SIZE,reduced?0:state.time,state.energy);
      return;
    }

    if (!small) {
      const halo = ctx.createRadialGradient(c, c, R * 0.4, c, c, SIZE / 2);
      halo.addColorStop(0, rgba(glowMix, 0.42 + level * 0.38));
      halo.addColorStop(0.55, rgba(mix[Math.abs(Math.floor(turn / 1.5)) % 4] || mix[0], 0.1 + level * 0.12));
      halo.addColorStop(1, rgba(glowMix, 0));
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, SIZE, SIZE);
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
      else if (o.seen) { o.observer?.disconnect(); orbs.delete(o); }
    }
    const shown = [...orbs].filter(visible);
    if (!shown.length || document.hidden) return; // woken again by add/mode/visibility
    raf = requestAnimationFrame(tick);
    // Resting: half the frames are plenty (and kinder to the battery).
    if (now - last < (reduced ? 150 : mode === "idle" && !shown.some(o=>o.preview) ? 80 : 33)) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const pal = PALETTES[mode] || PALETTES.idle;
    const measured = audioTrack && !audioTrack.player.paused && !audioTrack.player.ended ? (audioTrack.envelope.levels[Math.floor(audioTrack.player.currentTime*audioTrack.envelope.rate)] || 0) : 0;
    // Keep the original default's fallback. Optional materials only react
    // to measured sound; no pretend syllable sync when OS speech is opaque.
    if (mode === "speaking" && style === 'liquid') kick(0.35 + 0.55 * Math.abs(Math.sin(now / 150) * Math.sin(now / 470)));
    if (mode === "listening") kick(0.08 + 0.05 * Math.sin(now / 600));
    const goal = mode === "thinking" ? 0.22 + 0.08 * Math.sin(now / 380) : mode === "idle" ? 0.05 : target;
    if(physics) motionModule.stepOrbMotion(physics,dt,reduced?0:mode==='speaking'?measured:mode==='listening'?target:0,reduced?'idle':mode,response);
    for(const o of shown) if(o.preview && motionModule) {
      o.physics ||= motionModule.createOrbMotion();
      const m=o.preview.mode, simulated=m==='speaking'?Math.abs(Math.sin(now/170)*Math.sin(now/530)):0;
      motionModule.stepOrbMotion(o.physics,dt,reduced?0:simulated,reduced?'idle':m,response);
    }
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
  document.addEventListener('scroll', wake, { capture:true, passive:true });

  window.IzukiOrb = {
    response(value) { response=Number.isFinite(value)?Math.max(.5,Math.min(1.5,value)):1; try{localStorage.setItem('izuki.orbResponse',String(response));}catch{} wake(); },
    preview(canvas, selectedStyle, selectedMode) { const o=[...orbs].find(o=>o.canvas===canvas); if(o) o.preview={style:selectedStyle,mode:selectedMode}; wake(); },
    trackAudio(player,url) {
      const generation=++audioGeneration; audioTrack=null;
      // Only the local WAV already generated for this reply; no extra API call.
      if(!String(url).startsWith('blob:'))return;
      fetch(url).then(r=>r.arrayBuffer()).then(buffer=>{const envelope=motionModule?.waveEnvelope(buffer);if(generation===audioGeneration&&envelope)audioTrack={player,envelope};}).catch(()=>{});
    },
    style(value) {
      style = ["liquid", "ferrofluid", "dew", "ripple", "constellation", "particles", "face"].includes(value) ? value : "liquid";
      try { localStorage.setItem("izuki.orbStyle", style); } catch {}
      wake();
    },
    add(canvas) {
      const scratch = document.createElement("canvas");
      const o = { canvas, scratch, ctx: canvas.getContext("2d"), lx: scratch.getContext("2d"), size: 0, dpr: 0 };
      orbs.add(o);
      wake();
      // A canvas that just appeared (a screen opening) starts the loop too.
      if (window.ResizeObserver) { o.observer=new ResizeObserver(wake);o.observer.observe(canvas); }
      return canvas;
    },
    mode(m) { mode = PALETTES[m] ? m : "idle"; wake(); },
    level(v) { if (Number.isFinite(v)) kick(Math.max(0, Math.min(1, v))); },
    kick,
    wake,
  };
})();
