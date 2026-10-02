import { createOrbMotion, stepOrbMotion, fluidOutline } from './orb-motion.js';
/** Clear-water material shared by desktop, web and the native phone bundle. */
export function drawWaterOrb(
  ctx, size, time, level, merge, thinking, motion,
) {
  const c = size / 2;
  const radius = size * 0.285;
  const tau = Math.PI * 2;
  const droplet = (x, y, r, energy, outline) => {
    ctx.save();
    const surface = new Path2D();
    if (outline) {
      for (const points of outline) {
        const last = points[points.length - 1], first = points[0];
        surface.moveTo((last[0]+first[0])*size/2, (last[1]+first[1])*size/2);
        for (let i = 0; i < points.length; i++) {
          const p = points[i], next = points[(i+1)%points.length];
          surface.quadraticCurveTo(p[0]*size, p[1]*size, (p[0]+next[0])*size/2, (p[1]+next[1])*size/2);
        }
        surface.closePath();
      }
    } else for (let i = 0; i <= 96; i++) {
      const a = i / 96 * tau;
      const wave = 1 + energy * (0.045 * Math.sin(a * 3 + time * 2.3) + 0.021 * Math.sin(a * 5 - time * 1.7));
      const px = x + Math.cos(a) * r * wave, py = y + Math.sin(a) * r * wave;
      if (i === 0) surface.moveTo(px, py); else surface.lineTo(px, py);
    }
    surface.closePath();
    // Almost transparent at the centre; refraction collects at the edge.
    const body = ctx.createRadialGradient(x - r * 0.14, y - r * 0.18, r * 0.04, x, y, r * 1.08);
    body.addColorStop(0, "rgba(238,250,255,0.025)");
    body.addColorStop(0.63, "rgba(169,217,232,0.065)");
    body.addColorStop(0.84, "rgba(93,145,168,0.18)");
    body.addColorStop(0.93, "rgba(10,37,49,0.48)");
    body.addColorStop(0.975, "rgba(222,247,255,0.78)");
    body.addColorStop(1, "rgba(80,133,151,0.16)");
    ctx.fillStyle = body; ctx.fill(surface);
    const edge = ctx.createLinearGradient(0, 0, size, size);
    edge.addColorStop(0, 'rgba(251,255,255,.92)'); edge.addColorStop(.38, 'rgba(145,195,211,.24)'); edge.addColorStop(.65, 'rgba(14,39,52,.7)'); edge.addColorStop(1, 'rgba(234,251,255,.85)');
    ctx.strokeStyle = edge; ctx.lineWidth = Math.max(.8, size * .005); ctx.stroke(surface);
    ctx.clip(surface);
    // A soft reflected window above and a focused caustic beneath it.
    const reflection = ctx.createLinearGradient(x, y - r, x, y + r);
    reflection.addColorStop(0, "rgba(255,255,255,0.9)");
    reflection.addColorStop(0.17, "rgba(239,252,255,0.18)");
    reflection.addColorStop(0.42, "rgba(230,247,255,0)");
    reflection.addColorStop(0.81, "rgba(207,241,250,0.03)");
    reflection.addColorStop(0.96, "rgba(224,250,255,0.65)");
    reflection.addColorStop(1, "rgba(255,255,255,0.2)");
    ctx.fillStyle = reflection;
    ctx.fillRect(x - r * 1.1, y - r * 1.1, r * 2.2, r * 2.2);
    ctx.lineCap = "round";
    ctx.strokeStyle = "rgba(250,255,255,0.78)"; ctx.lineWidth = Math.max(0.7, r * 0.023);
    ctx.beginPath(); ctx.ellipse(x - r * 0.1, y - r * 0.06, r * 0.82, r * 0.86, -0.25, 3.55, 4.78); ctx.stroke();
    ctx.strokeStyle = "rgba(195,236,249,0.42)"; ctx.lineWidth = Math.max(0.6, r * 0.014);
    ctx.beginPath(); ctx.ellipse(x + r * 0.08, y + r * 0.13, r * 0.78, r * 0.67, 0.18 + energy * 0.08 * Math.sin(time), 0.2, 2.1); ctx.stroke();
    const glint = ctx.createRadialGradient(x - r * 0.38, y - r * 0.52, 0, x - r * 0.38, y - r * 0.52, r * 0.24);
    glint.addColorStop(0, "rgba(255,255,255,0.6)"); glint.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = glint; ctx.fillRect(x - r, y - r, r * 2, r * 2);
    ctx.restore();
  };
  // Legacy callers get a deterministic settled snapshot. Live callers share
  // one spring update per frame, independent of the number of canvases.
  if (!motion) {
    motion = createOrbMotion(); motion.time = time;
    for (let i = 0; i < 45; i++) stepOrbMotion(motion, 1/60, level, thinking ? 'thinking' : 'speaking');
  }
  const outline = fluidOutline(motion.blobs, size < 100 ? 32 : 72);
  droplet(c, c, radius, motion.energy, outline);
}
