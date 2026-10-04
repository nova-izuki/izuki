// Keeps Izuki's phone app opening instantly, even on a bad connection.
// Only the app itself is cached — never a conversation or an AI reply.
const CACHE = "izuki-phone-v14";
const SHELL = ["./", "index.html", "native.js", "pairing.js", "orb.js", "apps.js", "../shared/bugs.js", "water-orb.js", "orb-motion.js", "orb-materials.js", "glass-orb.js", "companion.css", "manifest.webmanifest", "icon-192.png", "icon-512.png", "apple-touch-icon.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k.startsWith("izuki-phone-") && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});

// The app's own files: the network first (so updates arrive), the cache
// when offline. Everything else (Gemini, your PC) goes straight through.
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.origin !== self.location.origin) return;
  const allowed = SHELL.some((path) => new URL(path, self.location.href).pathname === url.pathname);
  if (!allowed) return;
  // Query strings can contain a Siri prompt. Cache only the app shell URL.
  const key = new URL(url.pathname, url.origin).href;
  e.respondWith(
    fetch(e.request)
      .then((r) => {
        if (r.ok && !r.redirected) {
          const copy = r.clone();
          e.waitUntil(caches.open(CACHE).then((c) => c.put(key, copy)));
        }
        return r;
      })
      .catch(() => caches.match(key).then(async (r) => r || (e.request.mode === "navigate" ? await caches.match("index.html") : null) || Response.error()))
  );
});
