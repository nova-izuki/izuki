// Syntax-checks every <script> block in an HTML file, one at a time.
const fs = require("fs");
const vm = require("vm");

const file = process.argv[2];
const html = fs.readFileSync(file, "utf8");
const re = /<script([^>]*)>([\s\S]*?)<\/script>/gi;

let n = 0;
let bad = 0;
let skipped = 0;
let m;
while ((m = re.exec(html)) !== null) {
  const attrs = m[1];
  // Not JavaScript: external files, or JSON-LD / JSON data blocks.
  if (/\bsrc=/.test(attrs) || /type\s*=\s*["'](?!text\/javascript|application\/javascript|module)/i.test(attrs)) {
    skipped++;
    continue;
  }
  n++;
  let code = m[2];
  if (!code.trim()) continue;
  // A module: its import lines can't be checked here (no other files are
  // loaded), so set them aside and check the rest — as an async body, since
  // modules may use top-level await.
  if (/type\s*=\s*["']module["']/i.test(attrs)) {
    code = "(async () => {\n" + code.replace(/^\s*import\s[^;]*;?\s*$/gm, "") + "\n})";
  }
  try {
    new vm.Script(code, { filename: `${file}#script${n}` });
    console.log(`  ok   script block ${n} (${code.length} chars)`);
  } catch (e) {
    bad++;
    console.log(`  FAIL script block ${n}: ${e.message}`);
  }
}
console.log(bad ? `\n${bad} of ${n} script blocks failed` : `\nall ${n} script blocks parse` + (skipped ? ` (${skipped} non-JS block(s) skipped)` : ""));
process.exit(bad ? 1 : 0);
