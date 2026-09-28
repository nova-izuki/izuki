// Izuki's bug catcher for the website and the phone app.
//
// Errors on the page, and anything the page reports itself
// (izukiBugs.report("the voice never finished")), are sent to Izuki's bug
// tracker with the last few things that happened before them — so a bug can
// be fixed without anyone having to describe it. Where reports go is read
// from ../bugs.json (the same place the PC app reads). Keys, emails, phone
// numbers and link secrets are taken out first; never chats or recordings.
//
// The last problems are also kept on the device (izukiBugs.recent()), so the
// phone app can offer "Copy a bug report" even before reports are set up.
//
// <script src="../shared/bugs.js" data-app="phone" data-version="2"></script>
(() => {
  "use strict";
  const me = document.currentScript;
  const APP = (me && me.dataset.app) || "web";
  const VERSION = (me && me.dataset.version) || "";
  const CONFIG = new URL("../bugs.json", (me && me.src) || location.href).href;
  const STORE = "izuki.bugs.recent";
  const crumbs = [];
  let tracker = null;
  let sentThisVisit = 0;
  const sentKinds = new Set();
  const waiting = [];

  const scrub = (s) => String(s)
    .replace(/AIza[0-9A-Za-z_-]{20,}/g, "[key]")
    .replace(/\b(sk-or-v1|sk-ant|sk|gsk|nvapi|xai|hf|ghp)[-_][0-9A-Za-z_-]{12,}/g, "[key]")
    .replace(/Bearer\s+\S+/gi, "Bearer [key]")
    .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, "[email]")
    .replace(/\+?\d[\d\s().-]{8,}\d/g, (m) => (m.replace(/\D/g, "").length >= 10 ? "[number]" : m))
    .replace(/\b(?=[A-Za-z0-9_-]{24,}\b)(?=[^\s]*\d[^\s]*\d[^\s]*\d)[A-Za-z0-9_-]+/g, "[token]")
    .replace(/([?&#](key|token|q|pc)=)[^&\s]+/gi, "$1[…]");

  /** Something that happened, kept to go with a later report. */
  function crumb(message, category) {
    crumbs.push({ timestamp: Date.now() / 1000, category: category || "app", message: scrub(message).slice(0, 400) });
    if (crumbs.length > 50) crumbs.shift();
  }

  function keep(entry) {
    try {
      const list = JSON.parse(localStorage.getItem(STORE) || "[]");
      list.push(entry);
      localStorage.setItem(STORE, JSON.stringify(list.slice(-15)));
    } catch {}
  }

  const hex = () => Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) => b.toString(16).padStart(2, "0")).join("");

  function send(event) {
    if (!tracker) { waiting.push(event); return; }
    // Izuki's own backend (e.g. a Floot app), if bugs.json names one.
    if (tracker.backend) {
      fetch(tracker.backend, {
        method: "POST", keepalive: true, headers: { "Content-Type": "text/plain;charset=UTF-8" },
        body: JSON.stringify({
          app: APP, version: VERSION, level: event.level, kind: event.fingerprint[1],
          message: event.message.formatted, where: event.tags.where, agent: navigator.userAgent,
          log: event.breadcrumbs.values.map((c) => c.message).join("\n"), at: new Date().toISOString(),
        }),
      }).catch(() => {});
    }
    if (!tracker.endpoint) return;
    const envelope = [
      JSON.stringify({ event_id: event.event_id, sent_at: new Date().toISOString(), dsn: tracker.dsn }),
      JSON.stringify({ type: "event" }),
      JSON.stringify(event),
    ].join("\n");
    // text/plain and the key in the address: no pre-flight request.
    fetch(`${tracker.endpoint}?sentry_key=${tracker.key}&sentry_version=7&sentry_client=izuki-${APP}/${VERSION}`, {
      method: "POST", body: envelope, headers: { "Content-Type": "text/plain;charset=UTF-8" }, keepalive: true,
    }).catch(() => {});
  }

  /**
   * Report a problem. `level`: "error" (default), "warning", or "fatal".
   * The same problem is sent once per visit, and at most 10 per visit.
   */
  function report(message, extra, level) {
    const text = scrub(message instanceof Error ? (message.stack || message.message) : message).slice(0, 3000);
    const first = text.split("\n")[0];
    keep({ at: new Date().toISOString(), app: APP, message: first });
    crumb(first, "problem");
    const kind = first.replace(/\d+/g, "#").slice(0, 160);
    if (sentKinds.has(kind) || sentThisVisit >= 10) return;
    sentKinds.add(kind);
    sentThisVisit++;
    send({
      event_id: hex(),
      timestamp: Date.now() / 1000,
      platform: "javascript",
      level: level || "error",
      release: `izuki-${APP}@${VERSION || "web"}`,
      environment: location.hostname.endsWith("github.io") ? "production" : "development",
      message: { formatted: text },
      fingerprint: [APP, kind],
      tags: { app: APP, where: location.pathname, standalone: String(matchMedia("(display-mode: standalone)").matches) },
      request: { url: location.origin + location.pathname, headers: { "User-Agent": navigator.userAgent } },
      extra: Object.assign({}, extra ? JSON.parse(scrub(JSON.stringify(extra))) : {}),
      breadcrumbs: { values: crumbs.slice(-40) },
    });
  }

  window.addEventListener("error", (e) => {
    // A script or image that failed to load has no message; skip those.
    if (!e.message) return;
    report(`${e.message} @ ${(e.filename || "").split("/").pop()}:${e.lineno}:${e.colno}${e.error && e.error.stack ? "\n" + e.error.stack : ""}`);
  });
  window.addEventListener("unhandledrejection", (e) => {
    const r = e.reason;
    report("Unhandled: " + (r && (r.stack || r.message) ? r.stack || r.message : String(r)));
  });

  fetch(CONFIG, { cache: "no-store" })
    .then((r) => (r.ok ? r.json() : null))
    .then((c) => {
      if (!c) return;
      const m = typeof c.dsn === "string" && c.dsn.match(/^https:\/\/([^@]+)@([^/]+)\/(\d+)\/?$/);
      const backend = typeof c.endpoint === "string" && /^https:\/\//.test(c.endpoint) ? c.endpoint : "";
      if (!m && !backend) return;
      tracker = m
        ? { dsn: c.dsn, key: m[1], endpoint: `https://${m[2]}/api/${m[3]}/envelope/`, backend }
        : { backend };
      while (waiting.length) send(waiting.shift());
    })
    .catch(() => {});

  window.izukiBugs = {
    report,
    crumb,
    /** Problems kept on this device (newest last). */
    recent() {
      try { return JSON.parse(localStorage.getItem(STORE) || "[]"); } catch { return []; }
    },
    /** A report to copy and send by hand: recent problems + what happened before. */
    text() {
      const lines = [`Izuki ${APP} ${VERSION} · ${navigator.userAgent}`, "", "Problems:"];
      for (const p of this.recent()) lines.push(`${p.at} ${p.message}`);
      lines.push("", "Before that:");
      for (const c of crumbs) lines.push(`${new Date(c.timestamp * 1000).toISOString().slice(11, 19)} ${c.message}`);
      return lines.join("\n");
    },
    ready: () => !!tracker,
  };
})();
