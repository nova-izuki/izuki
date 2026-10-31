// The notes box must not hand a rename to a brain (which can't edit a note and
// once answered "renamed" anyway). This runs the real parser in
// src/lib/notes.ts, transpiled as-is, so the check can't drift from the app.
const fs = require("fs");
const path = require("path");
const assert = require("assert/strict");
const ts = require("typescript");

const file = path.join(__dirname, "..", "src", "lib", "notes.ts");
const source = fs.readFileSync(file, "utf8");
const js = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText;
const module_ = { exports: {} };
new Function("module", "exports", js)(module_, module_.exports);
const { renameRequest } = module_.exports;

const cases = [
  // What people actually type, including the owner's own words.
  ["rename this note to Lab 9.3.1", "Lab 9.3.1"],
  ["Rename Lab 1 to Lab 9.3.1.", "Lab 9.3.1"],
  ["please rename this note to Lab 9.3.1", "Lab 9.3.1"],
  ["can you rename this note to Module 4: Backup", "Module 4: Backup"],
  ["change the name of this note to 'Backups'", "Backups"],
  ["change the title of this note to “Lab 9.3.1 — Backups”", "Lab 9.3.1 — Backups"],
  ["retitle this note as Backups, please", "Backups"],
  ["rename this note to a lab about backups", "a lab about backups"],
  ["rename this note to Toast", "Toast"],
  ["rename this note to the one with the pictures", "the one with the pictures"],
  // A rename with no name is a question back, not a guess.
  ["rename this note", ""],
  ["rename it", ""],
  // Everything else stays a normal question for the AI.
  ["what does page 4 say?", null],
  ["summarise these notes", null],
  ["rename the file to notes.txt", null],
  ["rename the folder to 9.3.1", null],
  ["how do I rename a file in Word?", null],
  ["", null],
];

let failed = 0;
for (const [said, want] of cases) {
  const got = renameRequest(said);
  if (got !== want) {
    failed++;
    console.error(`✗ ${JSON.stringify(said)} → ${JSON.stringify(got)}, wanted ${JSON.stringify(want)}`);
  }
}
assert.equal(failed, 0, `${failed} of ${cases.length} rename cases failed`);
console.log(`notes rename: ok (${cases.length} cases, including no false positives)`);
