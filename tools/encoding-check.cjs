// Fails if any source file holds invisible control characters.
//
// A shell or script mangling an edit can turn the "\b" in a regex into a real
// backspace character. The code still compiles — the pattern just never
// matches. That silently broke "… on the TV" routing for ten releases. This
// check makes it impossible to ship again.
const fs = require("fs");
const path = require("path");

const ROOTS = ["src", "src-tauri/src", "docs/app", "docs/index.html", "docs/links", "extension", "tools", "tv", "android/app/src/main"];
const EXTS = /\.(ts|tsx|js|cjs|mjs|rs|html|css|py|brs|xml|json|md|java)$/;
// Backspace, bell, vertical tab, form feed, and the other C0 controls that
// never belong in source (tab, newline and carriage return are fine).
const BAD = /[\x00-\x08\x0B\x0C\x0E-\x1F]/;

const files = [];
const walk = (p) => {
  if (!fs.existsSync(p)) return;
  const st = fs.statSync(p);
  if (st.isDirectory()) {
    if (/node_modules|target|build|\.gradle/.test(p)) return;
    for (const f of fs.readdirSync(p)) walk(path.join(p, f));
  } else if (EXTS.test(p)) {
    files.push(p);
  }
};
ROOTS.forEach(walk);

let bad = 0;
for (const f of files) {
  const lines = fs.readFileSync(f, "utf8").split("\n");
  lines.forEach((line, i) => {
    const m = BAD.exec(line);
    if (m) {
      bad++;
      const code = m[0].charCodeAt(0).toString(16).padStart(2, "0");
      console.log(`  BAD  ${f}:${i + 1} has an invisible control character (0x${code}) — was a "\\b" or "\\f" mangled?`);
    }
  });
}
console.log(bad ? `\n${bad} line(s) with invisible characters` : `no invisible characters in ${files.length} source files`);
process.exit(bad ? 1 : 0);
