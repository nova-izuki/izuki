// The Chat tab's storage card parser. Bundled with esbuild (like the other
// checks) so it runs on Node 20 too, with no type-stripping flag.
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { build } from "esbuild";

const require = createRequire(import.meta.url);
const { outputFiles } = await build({ entryPoints: ["src/lib/storageReport.ts"], bundle: true, write: false, platform: "node", format: "cjs" });
const mod = { exports: {} };
new Function("require", "module", "exports", outputFiles[0].text)(require, mod, mod.exports);
const { parseStorageReport } = mod.exports;

const raw = "C: has 18.4 GB free of 476 GB. D: has 1.2 TB free of 2 TB. Biggest installed apps: Adobe Premiere (8.4 GB), Steam (4.1 GB). Biggest folders: Downloads 12.3 GB, AppData 5.1 GB. Biggest inside Downloads: setup.exe 2.1 GB, clip.mp4 1.4 GB. Biggest single files: C:\\Users\\me\\huge.iso 7.2 GB. Safe to clear: old temporary files, about 1.2 GB — say “clear the safe stuff” and I'll do it; the Recycle Bin, 400 MB (3 items) — say “empty the Recycle Bin” if you're sure. Your own files I only show, never delete — say “open Downloads” to go through it yourself.";

const report = parseStorageReport(raw);
assert.ok(report, "parses a native storage report");
assert.equal(report.drives.length, 2);
assert.equal(report.drives[0].name, "C:");
assert.equal(report.drives[0].freeGb, 18.4);
assert.equal(report.drives[0].usedLabel, "458 GB");
assert.ok(report.drives[0].usedPercent > 96 && report.drives[0].usedPercent < 97);
assert.equal(report.drives[1].freeGb, 1228.8);
assert.equal(report.drives[1].totalGb, 2048);
assert.equal(report.apps[0], "Adobe Premiere (8.4 GB)");
assert.equal(report.folders.length, 2);
assert.deepEqual(report.inside, [{ name: "Downloads", items: ["setup.exe 2.1 GB", "clip.mp4 1.4 GB"] }]);
assert.equal(report.files[0], "C:\\Users\\me\\huge.iso 7.2 GB");
assert.equal(report.safe.length, 2);
assert.match(report.safe[0], /clear the safe stuff/);
assert.equal(report.raw, raw, "keeps the exact scan text for details");

assert.equal(parseStorageReport("C: has lots of space"), null);
assert.equal(parseStorageReport("C: has 20 GB free of 100 GB."), null, "ordinary drive sentence is not a scan");
assert.equal(parseStorageReport("Here is a normal chat answer."), null);

// Only the native scan becomes a card: it starts with a drive line and ends
// with the scan's own closing note.
const tail = " Your own files I only show, never delete — say “open Downloads” to go through it yourself.";
assert.equal(parseStorageReport("Sure! C: has 40 GB free of 200 GB, so I'd clear Downloads." + tail), null, "a model's reply that quotes a drive line");
assert.equal(parseStorageReport("C: has 0 GB free of 0 GB." + tail), null, "a zero-size drive is skipped");
const mb = parseStorageReport("C: has 512 MB free of 64 GB." + tail);
assert.ok(mb, "MB units parse");
assert.equal(mb.drives[0].freeGb, 0.5, "512 MB is half a GB");

console.log("storage report: ok (drives, units, sections, exact fallback)");
