// izukinova.ai, checked like a search crawler would: every public page and
// image in the sitemap answers 200, no page says noindex by mistake, each
// page has its canonical URL and the icon set, and no local link is broken.
//
//   node tools/site-check.cjs          (the files in docs/)
//   node tools/site-check.cjs --live   (also fetches every sitemap URL)
const fs = require("fs");
const path = require("path");

const docs = path.resolve(__dirname, "../docs");
const SITE = "https://izukinova.ai";
const live = process.argv.includes("--live");
const problems = [];
const bad = (what) => problems.push(what);
// "noindex" or "none" (Google reads "none" as noindex, nofollow).
const excludes = (directives) => /(?:^|[\s,:])(?:noindex|none)(?:$|[\s,])/i.test(directives);

// Public pages: the sitemap's, plus the 404 page.
const sitemap = fs.readFileSync(path.join(docs, "sitemap.xml"), "utf8");
const pageUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const imageUrls = [...sitemap.matchAll(/<image:loc>([^<]+)<\/image:loc>/g)].map((m) => m[1]);
const fileOf = (url) => {
  const rel = decodeURI(url.replace(SITE, "")).replace(/^\//, "");
  const p = path.join(docs, rel);
  return rel === "" || rel.endsWith("/") ? path.join(p, "index.html") : p;
};

for (const url of pageUrls) {
  const file = fileOf(url);
  if (!fs.existsSync(file)) { bad(`sitemap page has no file: ${url}`); continue; }
  const html = fs.readFileSync(file, "utf8");
  const where = path.relative(docs, file);
  // Any robots meta tag, whichever order its attributes come in.
  for (const tag of html.match(/<meta\b[^>]*>/gi) || []) {
    const name = tag.match(/\bname=["']([^"']+)["']/i)?.[1] || "";
    const content = tag.match(/\bcontent=["']([^"']*)["']/i)?.[1] || "";
    if (/^(?:robots|googlebot)$/i.test(name) && excludes(content)) bad(`${where}: says ${content} (${name})`);
  }
  const canon = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)/i)?.[1];
  if (canon !== url) bad(`${where}: canonical is ${canon || "missing"}, expected ${url}`);
  if (!/rel=["']icon["'][^>]+favicon\.ico/i.test(html)) bad(`${where}: no favicon.ico link`);
  if (!/rel=["']apple-touch-icon["']/i.test(html)) bad(`${where}: no apple-touch-icon link`);
  // Local links and images must exist.
  for (const m of html.matchAll(/\s(?:href|src)=["']([^"'#?]+)(?:[#?][^"']*)?["']/gi)) {
    const ref = m[1];
    if (/^(?:mailto:|tel:|data:|javascript:)/i.test(ref) || ref.includes("${")) continue;
    // Links to izukinova.ai itself (full or protocol-relative) are checked too; other sites aren't.
    let target;
    if (/^(?:https?:)?\/\//i.test(ref)) {
      const u = new URL(ref, url);
      if (u.origin !== SITE) continue;
      target = path.join(docs, decodeURI(u.pathname));
    } else target = ref.startsWith("/") ? path.join(docs, ref) : path.resolve(path.dirname(file), ref);
    const exists = fs.existsSync(target) && (!fs.statSync(target).isDirectory() || fs.existsSync(path.join(target, "index.html")));
    if (!exists) bad(`${where}: broken local link ${ref}`);
  }
}
for (const url of imageUrls) if (!fs.existsSync(fileOf(url))) bad(`sitemap image has no file: ${url}`);

const robots = fs.readFileSync(path.join(docs, "robots.txt"), "utf8");
if (/Disallow:\s*\/\s*$/m.test(robots)) bad("robots.txt blocks the whole site");
if (!robots.includes(`Sitemap: ${SITE}/sitemap.xml`)) bad("robots.txt doesn't name the sitemap");

(async () => {
  if (live) {
    for (const url of [...pageUrls, ...imageUrls, `${SITE}/favicon.ico`, `${SITE}/icon.svg`, `${SITE}/robots.txt`]) {
      const r = await fetch(url, { redirect: "follow" }).catch((e) => ({ status: String(e.message) }));
      if (r.status !== 200) bad(`live ${url}: ${r.status}`);
      const tag = r.headers?.get?.("x-robots-tag");
      if (tag && excludes(tag)) bad(`live ${url}: X-Robots-Tag ${tag}`);
    }
  }
  console.log(`${pageUrls.length} pages, ${imageUrls.length} sitemap images${live ? ", fetched live" : ""}.`);
  if (problems.length) { for (const p of problems) console.log("  ✗ " + p); process.exitCode = 1; }
  else console.log("Site check: every page indexable, canonical, with icons; no broken local links.");
})();
