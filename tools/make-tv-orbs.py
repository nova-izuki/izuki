"""Draw the Roku channel's neutral glass orb (tinted on the TV per look) and
its halo. Run: python tools/make-tv-orbs.py"""
import os
import numpy as np
from PIL import Image

out = os.path.join(os.path.dirname(__file__), "..", "tv", "roku", "images")
N = 560
y, x = np.mgrid[0:N, 0:N].astype(np.float32)
c = (N - 1) / 2
r = np.hypot(x - c, y - c) / (N / 2 * 0.96)  # 0 centre .. 1 rim

# A glass sphere: dim core, bright fresnel rim, a soft key light top-left,
# a small specular glint and a faint caustic at the bottom.
inside = r < 1
z = np.sqrt(np.clip(1 - r**2, 0, 1))
fresnel = (1 - z) ** 2.2
lx, ly = (x - c) / (N / 2), (y - c) / (N / 2)
key = np.exp(-(((lx + 0.32) ** 2) / 0.10 + ((ly + 0.38) ** 2) / 0.06))
glint = np.exp(-(((lx + 0.36) ** 2) + ((ly + 0.44) ** 2)) / 0.004)
caustic = np.exp(-(((lx - 0.05) ** 2) / 0.12 + ((ly - 0.62) ** 2) / 0.012))
swirl = (0.5 + 0.5 * np.sin(3 * np.arctan2(ly, lx) + 6 * r)) * r**3
lum = 0.35 + 0.65 * fresnel + 0.5 * key + 1.2 * glint + 0.45 * caustic + 0.25 * swirl
alpha = np.where(inside, np.clip(0.18 + 0.85 * fresnel + 0.45 * key + glint + 0.3 * caustic + 0.25 * swirl, 0, 1), 0)
# soft antialiased edge
edge = np.clip((1 - r) * N / 6, 0, 1)
alpha = alpha * edge
v = np.clip(lum, 0, 1) * 255
img = np.dstack([v, v, v, alpha * 255]).astype(np.uint8)
Image.fromarray(img, "RGBA").save(os.path.join(out, "orb_glass.png"), optimize=True)

# The halo: a wide soft glow ring behind the orb.
M = 900
y, x = np.mgrid[0:M, 0:M].astype(np.float32)
c = (M - 1) / 2
r = np.hypot(x - c, y - c) / (M / 2)
glow = np.exp(-((r - 0.58) ** 2) / 0.035) * 0.75 + np.exp(-(r**2) / 0.25) * 0.25
glow = np.where(r < 1, glow, 0)
img = np.dstack([np.full_like(glow, 255)] * 3 + [np.clip(glow, 0, 1) * 255]).astype(np.uint8)
Image.fromarray(img, "RGBA").save(os.path.join(out, "orb_halo.png"), optimize=True)
print("ok", os.path.getsize(os.path.join(out, "orb_glass.png")) // 1024, "KB")
