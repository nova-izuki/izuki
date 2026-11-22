// Izuki VR for Meta Quest (quest/twa-manifest.json): the app's settings, the
// site's vouching (docs/.well-known/assetlinks.json) and the signing key on
// record (docs/ANDROID-SIGNING.md) must all agree, or the installed app
// opens with a URL bar (2D) or not at all (immersive).
//   node tools/quest-check.cjs
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const twa = JSON.parse(read("quest/twa-manifest.json"));
const links = JSON.parse(read("docs/.well-known/assetlinks.json"));
const web = JSON.parse(read("docs/app/manifest.webmanifest"));
const domain = read("docs/CNAME").trim();

let checks = 0;
const ok = (cond, what) => { assert.ok(cond, what); checks++; };

ok(twa.isMetaQuest === true, "built for Meta Quest");
ok(["2D", "immersive"].includes(twa.horizonOSAppMode), "a Horizon OS app mode Bubblewrap knows");
ok(twa.enableMicrophone === true, "the microphone permission (talking to Izuki)");
ok(twa.host === domain, `the app opens ${domain} (docs/CNAME), not ${twa.host}`);
ok(/^com\.novaizuki\.[a-z]+$/.test(twa.packageId) && twa.packageId !== "com.novaizuki.mobile", "its own package, not the phone app's");

// The start address sits inside the web app's scope and opens the VR card.
const manifestUrl = new URL(twa.webManifestUrl);
ok(manifestUrl.host === domain && manifestUrl.pathname === "/app/manifest.webmanifest", "the web manifest is the phone web app's");
const scope = new URL(web.scope || "./", manifestUrl);
const start = new URL(twa.startUrl, `https://${domain}/`);
ok(start.pathname.startsWith(scope.pathname), `start ${start.pathname} is inside the scope ${scope.pathname}`);
ok(start.searchParams.has("vr"), "the start address opens Izuki in VR");
const fullScope = new URL(twa.fullScopeUrl);
ok(fullScope.origin === scope.origin && fullScope.pathname === scope.pathname, "fullScopeUrl is the web app's scope, on the same site");

// Its icons are the site's own files.
for (const key of ["iconUrl", "maskableIconUrl"]) {
  const u = new URL(twa[key]);
  ok(u.host === domain && fs.existsSync(path.join(root, "docs", u.pathname)), `${key} is a real file on the site`);
}

// The site vouches for exactly this package, signed with the key on record.
const statement = links.find((s) => s.target?.package_name === twa.packageId);
ok(statement, "assetlinks.json names the package");
ok(statement.relation.includes("delegate_permission/common.handle_all_urls"), "it delegates the site to the app");
ok(statement.target.namespace === "android_app", "for an Android app");
const recorded = (read("docs/ANDROID-SIGNING.md").match(/Certificate SHA-256: `([0-9A-F:]{95})`/) || [])[1];
ok(recorded, "docs/ANDROID-SIGNING.md records the private preview key's fingerprint");
ok(statement.target.sha256_cert_fingerprints.length === 1 && statement.target.sha256_cert_fingerprints[0] === recorded,
  "the site vouches only for the private preview key (never the public one in the repo)");
ok(twa.signingKey?.alias === "izuki", "signed with the preview key's alias");

console.log(`quest: ${checks} checks passed`);
