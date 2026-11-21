// Every IZUKI NOVA icon from one drawing: docs/brand/izuki-nova-mark.svg.
// The website's favicons, the phone web app, the Windows app and installer,
// the Android launcher and the iPhone app all show the same glass orb.
//
//   node tools/brand-icons.cjs        (rewrites the icon files listed below)
//
// Shapes: "tile" (rounded, see-through corners: favicons, Windows),
// "full" (square, opaque: iOS and Apple touch icons, which the system rounds),
// "orb" (the orb alone on clear ground: Android's adaptive foreground) and
// "maskable" (full ground, the orb inside the safe circle: the web app).
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const root = path.resolve(__dirname, "..");
const mark = fs.readFileSync(path.join(root, "docs/brand/izuki-nova-mark.svg"), "utf8");
const GROUND = "#0a0d22";

function variant(shape) {
  let svg = mark;
  const scaled = (k) => svg.replace('<g id="orb">', `<g id="orb" transform="translate(256 256) scale(${k}) translate(-256 -256)">`);
  if (shape === "full" || shape === "maskable") svg = svg.replace('rx="112"', 'rx="0"');
  if (shape === "maskable") svg = scaled(0.8);
  if (shape === "orb") {
    svg = svg.replace('<rect width="512" height="512" fill="url(#ground)"/>', "");
    // Android keeps the middle 66 of 108 units in every mask shape: the ring
    // (356 of 512 across) at 0.72 is 50 of 108, with room to spare.
    svg = scaled(0.72);
  }
  return Buffer.from(svg);
}

async function png(shape, size, opts = {}) {
  let img = sharp(variant(shape), { density: Math.max(72, Math.ceil((size / 512) * 72 * 4)) }).resize(size, size);
  if (opts.circle) {
    const circle = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}"/></svg>`);
    img = sharp(await img.png().toBuffer()).composite([{ input: circle, blend: "dest-in" }]);
  }
  if (opts.opaque) img = img.flatten({ background: GROUND });
  return img.png({ compressionLevel: 9 }).toBuffer();
}

/** A .ico holding PNG images (Windows Vista and later, every browser). */
function ico(images) {
  const head = Buffer.alloc(6 + 16 * images.length);
  head.writeUInt16LE(0, 0);
  head.writeUInt16LE(1, 2);
  head.writeUInt16LE(images.length, 4);
  let offset = head.length;
  images.forEach(({ size, data }, i) => {
    const e = 6 + 16 * i;
    head.writeUInt8(size >= 256 ? 0 : size, e);
    head.writeUInt8(size >= 256 ? 0 : size, e + 1);
    head.writeUInt8(0, e + 2);
    head.writeUInt8(0, e + 3);
    head.writeUInt16LE(1, e + 4);
    head.writeUInt16LE(32, e + 6);
    head.writeUInt32LE(data.length, e + 8);
    head.writeUInt32LE(offset, e + 12);
    offset += data.length;
  });
  return Buffer.concat([head, ...images.map((i) => i.data)]);
}

async function write(rel, data) {
  fs.writeFileSync(path.join(root, rel), data);
  console.log("wrote", rel);
}

(async () => {
  const icoOf = async (sizes) => ico(await Promise.all(sizes.map(async (size) => ({ size, data: await png("tile", size) }))));

  // The website (izukinova.ai): what Google and browsers show beside the name.
  await write("docs/favicon.ico", await icoOf([16, 32, 48, 64]));
  for (const s of [48, 96, 192, 512]) await write(`docs/icon-${s}.png`, await png("tile", s));
  await write("docs/apple-touch-icon.png", await png("full", 180, { opaque: true }));
  await write("docs/icon.svg", mark);
  await write("docs/brand/izuki-nova-icon-1024.png", await png("tile", 1024));

  // The phone web app (docs/app) and its install icons.
  await write("docs/app/icon-192.png", await png("tile", 192));
  await write("docs/app/icon-512.png", await png("tile", 512));
  await write("docs/app/icon-512-maskable.png", await png("maskable", 512, { opaque: true }));
  await write("docs/app/apple-touch-icon.png", await png("full", 180, { opaque: true }));

  // Windows: the app, the taskbar, the installer.
  await write("src-tauri/icons/icon.ico", await icoOf([16, 24, 32, 48, 64, 128, 256]));
  await write("src-tauri/icons/icon.png", await png("tile", 1024));
  await write("src-tauri/icons/icon.svg", mark);
  await write("src-tauri/icons/32x32.png", await png("tile", 32));
  await write("src-tauri/icons/128x128.png", await png("tile", 128));
  await write("src-tauri/icons/128x128@2x.png", await png("tile", 256));
  for (const s of [30, 44, 71, 89, 107, 142, 150, 284, 310]) await write(`src-tauri/icons/Square${s}x${s}Logo.png`, await png("tile", s));
  await write("src-tauri/icons/StoreLogo.png", await png("tile", 50));

  // Android: the launcher icon on every screen density.
  const dens = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };
  for (const [d, k] of Object.entries(dens)) {
    const dir = `android/app/src/main/res/mipmap-${d}`;
    await write(`${dir}/ic_launcher.png`, await png("full", Math.round(48 * k), { opaque: true }));
    await write(`${dir}/ic_launcher_round.png`, await png("full", Math.round(48 * k), { circle: true }));
    await write(`${dir}/ic_launcher_foreground.png`, await png("orb", Math.round(108 * k)));
  }

  // iPhone: one 1024 icon, no transparency (App Store rule).
  await write("ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png", await png("full", 1024, { opaque: true }));
})().catch((e) => { console.error(e); process.exit(1); });
