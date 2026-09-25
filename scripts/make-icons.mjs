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
