// Rasterises the Izuki brand mark into every icon size Tauri's bundler needs.
// Run with: npm run icons
import sharp from "sharp";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const iconsDir = resolve(root, "src-tauri/icons");
const svg = readFileSync(resolve(iconsDir, "icon.svg"));

mkdirSync(iconsDir, { recursive: true });

const png = (size) => sharp(svg, { density: 512 }).resize(size, size).png({ compressionLevel: 9 });

const targets = [
  ["32x32.png", 32],
  ["128x128.png", 128],
  ["128x128@2x.png", 256],
  ["icon.png", 1024],
  ["Square30x30Logo.png", 30],
  ["Square44x44Logo.png", 44],
  ["Square71x71Logo.png", 71],
  ["Square89x89Logo.png", 89],
  ["Square107x107Logo.png", 107],
  ["Square142x142Logo.png", 142],
  ["Square150x150Logo.png", 150],
  ["Square284x284Logo.png", 284],
  ["Square310x310Logo.png", 310],
  ["StoreLogo.png", 50],
  ["tray.png", 64],
];

for (const [name, size] of targets) {
  await png(size).toFile(resolve(iconsDir, name));
  console.log("  icon:", name, `${size}x${size}`);
}

// Minimal multi-resolution .ico writer (PNG-compressed entries, valid on Windows Vista+).
const icoSizes = [16, 24, 32, 48, 64, 128, 256];
const buffers = await Promise.all(
  icoSizes.map((s) => sharp(svg, { density: 512 }).resize(s, s).png({ compressionLevel: 9 }).toBuffer())
);

const header = Buffer.alloc(6);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(icoSizes.length, 4);

let offset = 6 + icoSizes.length * 16;
const entries = [];
for (let i = 0; i < icoSizes.length; i++) {
  const size = icoSizes[i];
  const data = buffers[i];
  const e = Buffer.alloc(16);
  e.writeUInt8(size >= 256 ? 0 : size, 0);
  e.writeUInt8(size >= 256 ? 0 : size, 1);
  e.writeUInt8(0, 2);
  e.writeUInt8(0, 3);
  e.writeUInt16LE(1, 4);
  e.writeUInt16LE(32, 6);
  e.writeUInt32LE(data.length, 8);
  e.writeUInt32LE(offset, 12);
  entries.push(e);
  offset += data.length;
}

writeFileSync(resolve(iconsDir, "icon.ico"), Buffer.concat([header, ...entries, ...buffers]));
console.log("  icon: icon.ico", icoSizes.join("/"));
console.log("Izuki icons generated.");

// The phone app (docs/app/): home-screen icons for iPhone and Android.
const mobileDir = resolve(root, "docs/app");
mkdirSync(mobileDir, { recursive: true });
for (const [name, size] of [["icon-192.png", 192], ["icon-512.png", 512], ["apple-touch-icon.png", 180]]) {
  await png(size).toFile(resolve(mobileDir, name));
  console.log("  mobile icon:", name, `${size}x${size}`);
}

// Native launcher assets are separate from the PWA icons. Keep them on the
// same brand source so Capacitor's template icon never ships in an APK/IPA.
const iosIcon = resolve(root, "ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png");
await png(1024).flatten({ background: "#181733" }).removeAlpha().toFile(iosIcon);
for (const [density, size, adaptive] of [["mdpi", 48, 108], ["hdpi", 72, 162], ["xhdpi", 96, 216], ["xxhdpi", 144, 324], ["xxxhdpi", 192, 432]]) {
  const dir = resolve(root, `android/app/src/main/res/mipmap-${density}`);
  const opaque = await png(size).flatten({ background: "#181733" }).toBuffer();
  writeFileSync(resolve(dir, "ic_launcher.png"), opaque);
  await sharp(opaque).composite([{ input: Buffer.from(`<svg width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="white"/></svg>`), blend: "dest-in" }]).png().toFile(resolve(dir, "ic_launcher_round.png"));
  // Adaptive icons reserve an outer zone for launcher masks and parallax.
  const inner = Math.round(adaptive * 0.61);
  const mark = await png(inner).toBuffer();
  await sharp({ create: { width: adaptive, height: adaptive, channels: 4, background: "#181733" } })
    .composite([{ input: mark, gravity: "center" }]).png().toFile(resolve(dir, "ic_launcher_foreground.png"));
}
console.log("Native Android and iPhone launcher icons generated.");
