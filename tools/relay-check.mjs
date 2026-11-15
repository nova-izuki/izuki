// The AI-tab relay (extension/provider-relay.js): one question per tab, a
// busy tab says what it's busy with, Stop frees it, a stale lock clears
// itself, and a frozen tab can't hold "Asking Gemini…" for ever.
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";

const src = fs.readFileSync(new URL("../extension/provider-relay.js", import.meta.url), "utf8");
let frozen = false;
let replies = [];
const calls = [];
const readAssistant = () => {};
const typeIntoComposer = () => {};
const root = {
  __izukiRelayLimits: { deadline: 3500, call: 300, staleMargin: 200 },
  IzukiProviderSpecs: [{ id: "gemini", name: "Gemini", hosts: ["gemini.google.com"], responses: "x", users: "y", composer: "c", send: "s" }],
  IzukiProviderDOM: { readAssistant, typeIntoComposer },
  chrome: {
    tabs: { get: async (id) => ({ id, url: "https://gemini.google.com/app", windowId: 1 }) },
    scripting: {
      executeScript: ({ func }) => {
        calls.push(func === readAssistant ? "read" : func === typeIntoComposer ? "type" : "other");
        if (frozen && func === readAssistant) return new Promise(() => {}); // a tab that never answers
        if (func === typeIntoComposer) return Promise.resolve([{ result: { ok: true, sent: true } }]);
        if (func === readAssistant) return Promise.resolve([{ result: replies.length > 1 ? replies.shift() : replies[0] }]);
        return Promise.resolve([{}]);
      },
    },
  },
  DOMException,
  setTimeout,
  clearTimeout,
  Date,
  Promise,
  Error,
  Map,
  Set,
  URL,
  AbortController,
  String,
  Math,
};
root.globalThis = root;
vm.runInNewContext(src, root);
const R = root.IzukiProviderRelay;
const link = { providerId: "gemini", ready: true, tabId: 7, origin: "https://gemini.google.com" };
const idle = { ok: true, count: 1, text: "old answer", busy: false };

// A normal answer: sent, then a stable new reply.
replies = [idle, { ok: true, count: 2, text: "new answer", busy: false }];
const done = await R.ask(link, "Sum up this page\n[page text…]", "r1");
assert.equal(done.text, "new answer");
assert.equal(R.status().length, 0, "the tab is free again");

// While one question runs, another on the same tab is refused with who and since when.
replies = [idle, { ok: true, count: 1, text: "old answer", busy: true }];
const first = R.ask(link, "Sum up this page\n[page]", "r2").catch((e) => e);
await new Promise((r) => setTimeout(r, 50));
const running = R.status();
assert.equal(running.length, 1);
assert.equal(running[0].label, "Sum up this page", "the label is the question's first line, never the page text");
const busy = await R.ask(link, "Another question", "r3").catch((e) => e);
assert.equal(busy.code, "busy");
assert.equal(busy.state.tabId, 7);
assert.match(busy.message, /still answering “Sum up this page”/);

// "Stop that one" names the question it saw: a different (newer) one is left alone.
assert.equal(R.cancelTab(7, "some-newer-request"), false);
assert.equal(R.status().length, 1);
// The one it saw: the tab is free at once and that question ends as stopped.
assert.equal(R.cancelTab(7, busy.state.requestId), true);
assert.equal(R.status().length, 0);
const stopped = await first;
assert.equal(stopped.name, "AbortError");
assert.equal(R.cancelTab(7), false, "nothing left to stop");

// A tab that stops responding can't hold the question: the call limit ends it.
frozen = true;
replies = [idle];
const t0 = Date.now();
const hung = await R.ask(link, "Hello", "r4").catch((e) => e);
assert.match(hung.message, /stopped responding/);
assert.ok(Date.now() - t0 < 1200, "ended by the per-call limit, not left hanging");
assert.equal(R.status().length, 0, "and the lock went with it");
frozen = false;

// An answer that never settles ends at the deadline with a plain reason.
replies = [idle, { ok: true, count: 1, text: "old answer", busy: true }];
const slow = await R.ask(link, "Explain", "r5").catch((e) => e);
assert.match(slow.message, /didn't finish an answer within/);
assert.equal(R.status().length, 0);

console.log("relay: busy tab named, Stop frees it, frozen tab and deadline end cleanly");
