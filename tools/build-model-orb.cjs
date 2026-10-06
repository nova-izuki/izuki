// Bundles docs/app/model-orb.src.js (three.js + the face code) into
// docs/app/model-orb.js — one file the phone, the TV page and the PC load.
//   node tools/build-model-orb.cjs
const path = require("path");
const root = path.resolve(__dirname, "..");
require("esbuild").buildSync({
  entryPoints: [path.join(root, "docs/app/model-orb.src.js")],
  outfile: path.join(root, "docs/app/model-orb.js"),
  bundle: true,
  format: "esm",
  minify: true,
  target: ["es2020", "safari15"],
  legalComments: "eof",
  banner: { js: "// Izuki 3D faces — built from model-orb.src.js by tools/build-model-orb.cjs. Includes three.js (MIT)." },
  logLevel: "warning",
});
console.log("built docs/app/model-orb.js");
