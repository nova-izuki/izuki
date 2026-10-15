// Keeps Izuki's phone app opening instantly, even on a bad connection.
// Only the app itself is cached — never a conversation or an AI reply.
const CACHE = "izuki-phone-v61";
const SHELL = ["./", "index.html", "native.js", "pairing.js", "orb.js", "edge-glow.js", "apps.js", "drive.js", "remote.js", "touchgrass.js", "../shared/bugs.js", "water-orb.js", "orb-motion.js", "orb-materials.js", "glass-orb.js", "toon.js", "speech.js", "tv.js", "tv.css", "companion.css", "manifest.webmanifest", "icon-192.png", "icon-512.png", "apple-touch-icon.png"];

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

// 🔔 Notifications from your PC (webpush.rs), even with Izuki closed:
// a draft waiting for your yes, missions finished, heads-ups. The message is
// encrypted for this phone only; the browser decrypts it before we see it.
self.addEventListener("push", (e) => {
  let m = { title: "Izuki", body: "Something on your PC needs you.", tag: "izuki" };
  try { if (e.data) m = { ...m, ...e.data.json() }; } catch { try { m.body = e.data.text(); } catch {} }
  e.waitUntil(self.registration.showNotification(m.title, {
    body: m.body,
    tag: m.tag,
    renotify: m.tag === "approval",
    icon: "icon-192.png",
    badge: "icon-192.png",
    data: { open: "./#touch" },
  }));
});

// Tapping it opens Touch Grass (or brings the open app forward).
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const target = new URL(e.notification.data?.open || "./#touch", self.location.href).href;
  e.waitUntil((async () => {
    const wins = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const w of wins) {
      if (new URL(w.url).pathname === new URL(target).pathname) {
        await w.focus();
        w.postMessage({ type: "open-touch" });
        return;
      }
    }
    await self.clients.openWindow(target);
  })());
});
