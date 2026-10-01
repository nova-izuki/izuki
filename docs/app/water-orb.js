/** Clear-water material shared by desktop, web and the native phone bundle. */
export function drawWaterOrb(
  ctx, size, time, level, merge, thinking,
) {
  const c = size / 2;
  const radius = size * 0.285;
  const tau = Math.PI * 2;
  const droplet = (x, y, r, energy) => {
    ctx.save();
    const surface = new Path2D();
    for (let i = 0; i <= 96; i++) {
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
  // Orbit only while waiting/listening. Droplets smoothly tuck into the
  // silhouette on speech, transferring their movement to the main surface.
  for (let i = 0; i < 5; i++) {
    const a = time * (thinking ? 1.1 : 0.22) + i * tau / 5;
    const orbit = radius * (1.43 - merge * 0.56);
    const r = radius * (0.07 + (i % 3) * 0.026) * (1 - merge * 0.65);
    ctx.globalAlpha = 1 - merge * 0.8;
    droplet(c + Math.cos(a) * orbit, c + Math.sin(a) * orbit * 0.95, r, level * 0.8);
  }
  ctx.globalAlpha = 1;
  droplet(c, c, radius * (1 + level * 0.07), 0.16 + level * 0.9);
}
