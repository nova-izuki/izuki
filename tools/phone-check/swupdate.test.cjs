// The phone app must reach a new build without being closed, and its offline
// shell must stay installable: one missing file makes cache.addAll reject, so
// the service worker never takes over at all (no offline app, no cached shell).
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "../..");
const appDir = path.join(root, "docs/app");
const html = fs.readFileSync(path.join(appDir, "index.html"), "utf8");
const sw = fs.readFileSync(path.join(appDir, "sw.js"), "utf8");

let pass = 0;
let fail = 0;
function is(label, got, want) {
  if (JSON.stringify(got) === JSON.stringify(want)) { pass++; console.log("  ok   " + label); }
  else { fail++; console.log("  FAIL " + label + " -> got " + JSON.stringify(got) + ", wanted " + JSON.stringify(want)); }
}

// ---- a new build takes over: ask once, and never reload by itself ----
const start = html.indexOf("  function watchForNewBuild(sw, onNew) {");
assert.ok(start > 0, "watchForNewBuild must be in the page");
const end = html.indexOf("\n  }", start) + 4;
const ctx = vm.createContext({});
vm.runInContext(html.slice(start, end) + "\nglobalThis.watchForNewBuild = watchForNewBuild;", ctx);

const events = {};
const fake = { controller: null, addEventListener: (t, f) => { events[t] = f; } };
let asked = 0;
ctx.watchForNewBuild(fake, () => { asked++; });
events.controllerchange();
is("the first install is not an update (nothing to reload)", asked, 0);
fake.controller = {};
events.controllerchange();
is("a new build taking over asks for one reload", asked, 1);
events.controllerchange();
is("...and never more than one bar", asked, 2);

is("the page watches for a new build", /watchForNewBuild\(navigator\.serviceWorker, showReloadBar\)/.test(html), true);
is(
  "the Android app is left out (its updates arrive as an APK)",
  /!window\.IzukiNative\?\.installed\(\)\) \{\s*watchForNewBuild\(navigator\.serviceWorker, showReloadBar\)/.test(html),
  true,
);
is("the reload waits for the person's tap", /go\.onclick = \(\) => location\.reload\(\);/.test(html), true);
is("a takeover never reloads the page by itself", /controllerchange", \(\) => \{\s*location\.reload/.test(html), false);

// ---- the offline shell is complete, and every file in it exists ----
const shellSrc = sw.match(/const SHELL = \[([\s\S]*?)\];/);
assert.ok(shellSrc, "SHELL must be in sw.js");
const shell = [...shellSrc[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);
const missing = shell.filter((p) => !fs.existsSync(path.join(appDir, p)));
is("every cached file is really there (one missing stops the whole install)", missing, []);
const scripts = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)]
  .map((m) => m[1])
  .filter((u) => !/^(?:https?:|data:)/.test(u));
const uncached = [...new Set(scripts.map((u) => u.replace(/^\.\//, "")))].filter((u) => !shell.includes(u));
is("every script the page loads is cached for offline", uncached, []);
is("the open page asks the browser for a new worker", /reg.update()/.test(html), true);
is("...every few hours, not on a loop", html.includes("setInterval(look, 6 * 60 * 60 * 1000)"), true);
is("...and when the app comes back to the front", html.includes("if (!document.hidden) look();"), true);
is("the shell cache is versioned", /const CACHE = "izuki-phone-v\d+";/.test(sw), true);

console.log("");
console.log(`${pass} passed, ${fail} failed`);
if (fail) process.exit(1);
