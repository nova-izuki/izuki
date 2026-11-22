// Bundles docs/app/vr-scene.src.js (three.js + the VR room) into
// docs/app/vr-scene.js, which vr.js loads only when someone goes into VR.
//   node tools/build-vr.cjs
// tools/phone-check/vr.test.cjs builds with the same options() and checks the
// committed file matches.
const fs = require("fs");
const path = require("path");
const root = path.resolve(__dirname, "..");

function options() {
  // three.js is MIT: its full notice travels with the bundle.
  const license = fs.readFileSync(path.join(root, "node_modules/three/LICENSE"), "utf8").replace(/\*\//g, "* /").trim();
  return {
    entryPoints: [path.join(root, "docs/app/vr-scene.src.js")],
    outfile: path.join(root, "docs/app/vr-scene.js"),
    bundle: true,
    format: "esm",
    minify: true,
    target: ["es2020", "safari15"],
    legalComments: "eof",
    banner: { js: "// Izuki in VR, the 3D room: built from vr-scene.src.js by tools/build-vr.cjs. Includes three.js (MIT, notice at the end)." },
    footer: { js: "/* three.js\n" + license + "\n*/" },
    logLevel: "warning",
  };
}

module.exports = { options };

if (require.main === module) {
  require("esbuild").buildSync(options());
  console.log("built docs/app/vr-scene.js");
}
