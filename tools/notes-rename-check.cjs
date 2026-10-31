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
  ["rename this note to Intro to Biology", "Intro to Biology"],
  ["rename this note to Backups as a Service", "Backups as a Service"],
  ["rename this note to Into the Wild", "Into the Wild"],
  ['rename "Intro to Biology" to Cell structures', 'Cell structures'],
  ['rename Intro to Biology to Cell structures', 'Cell structures', 'Intro to Biology'],
  ['rename Chapter 5 to Biology', 'Biology', 'Chapter 5'],
  ['rename Chapter 5 to Biology', null],
  ['rename "Other note" to Biology', null, 'Current note'],
  ['rename Other note to Biology', null, 'Current note'],
  ['rename "Current note" to Biology', 'Biology', 'Current note'],
  ['rename Current note to Biology', 'Biology', 'Current note'],
  ["rename this note to 'How to restore?'", "How to restore?"],
  ["rename this note to \"Bob's lab\", please!", "Bob's lab"],
  ["please can you rename this note to Intro to Biology", "Intro to Biology"],
  ["hey Izuki, please rename this note to Photos", "Photos"],
  ["rename this note to the one with the pictures", "the one with the pictures"],
  // A rename with no name is a question back, not a guess.
  ["rename this note", ""],
  ["rename it", ""],
  // Everything else stays a normal question for the AI.
  ["what does page 4 say?", null],
  ["summarise these notes", null],
  ["rename the file to notes.txt", null],
  ["rename the folder to 9.3.1", null],
  ["can you rename the file to notes.txt", null],
  ["please could you rename this folder to backups", null],
  ["change the title of this file to Backup", null],
  ["retitle my project as New name", null],
  ["Izuki, rename the attachment to Lab 1", null],
  ["rename this chapter to Photos", null],
  ["please rename the section to Photos", null],
  ["can you rename this heading to Overview", null],
  ["rename my variable to total", null],
  ["rename the function to sum", null],
  ["rename these cards to Backups", null],
  ["how do I rename a file in Word?", null],
  ["", null],
];

let failed = 0;
for (const [said, want, current] of cases) {
  const got = renameRequest(said, current);
  if (got !== want) {
    failed++;
    console.error(`✗ ${JSON.stringify(said)} → ${JSON.stringify(got)}, wanted ${JSON.stringify(want)}`);
  }
}
assert.equal(failed, 0, `${failed} of ${cases.length} rename cases failed`);
console.log(`notes rename: ok (${cases.length} cases, including no false positives)`);
