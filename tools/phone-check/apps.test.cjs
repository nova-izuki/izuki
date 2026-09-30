// Tests the phone apps lane (docs/app/apps.js) without a network or a browser:
// the real module is loaded with a fake localStorage, and every rule that
// keeps Izuki honest is checked.
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const src = fs.readFileSync(path.join(__dirname, "..", "..", "docs", "app", "apps.js"), "utf8");

// The module closes over window/localStorage/crypto/fetch, so give it a box.
const store = new Map();
const sandbox = {
  localStorage: {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
  },
  crypto: { randomUUID: () => "11111111-2222-3333-4444-555555555555" },
  fetch: async () => ({ ok: false, status: 0, json: async () => ({}) }),
  console,
  Date,
  JSON,
  Math,
  Map,
  Set,
  Error,
  Promise,
  encodeURIComponent,
};
sandbox.window = sandbox;
vm.createContext(sandbox);
vm.runInContext(src, sandbox);

const A = sandbox.window.izukiApps;
const T = A._test;
if (!A || !T) throw new Error("apps.js did not expose window.izukiApps");

let pass = 0;
let fail = 0;
function is(label, got, want) {
  if (got === want) { pass++; console.log("  ok   " + label); }
  else { fail++; console.log(`  FAIL ${label} -> got ${JSON.stringify(got)}, wanted ${JSON.stringify(want)}`); }
}

console.log("a reply in prose or fenced json still parses:");
is("fenced", T.parseStep('```json\n{"search":"unread email"}\n```').search, "unread email");
is("prose around it", T.parseStep('Sure! {"search":"my calendar"} hope that helps').search, "my calendar");
is("no json", T.parseStep("just talking"), null);
is("an array is not a step", T.parseStep("[1,2,3]"), null);

console.log("apps are recognised from what they said:");
is("inbox", T.askedApp("what's new in my inbox"), "gmail");
is("email", T.askedApp("check my email"), "gmail");
is("calendar", T.askedApp("what's on my calendar"), "googlecalendar");
is("drive", T.askedApp("open my drive"), "googledrive");
is("joke", T.askedApp("tell me a joke"), null);

console.log("only reading can come from a snapshot:");
is("new mail", T.isReadQuestion("what's new in my inbox"), true);
is("how many", T.isReadQuestion("how many emails"), true);
is("send is never cached", T.isReadQuestion("send an email to Sam"), false);
is("delete is never cached", T.isReadQuestion("delete the last email"), false);
is("delete-last trap", T.isReadQuestion("delete the last email"), false);
is("check again means fresh", T.isReadQuestion("check again"), false);
is("refresh means fresh", T.isReadQuestion("refresh my inbox"), false);
is("summarise goes to the brain", T.isReadQuestion("read and summarise for me"), false);

console.log("a repeat read is answered free, and ages out:");
is("nothing cached yet", T.snapAnswer("what's new in my inbox"), null);
T.snapPut("gmail", "1 unread from Sam.");
const a = T.snapAnswer("what's new in my inbox");
is("answers from the cache", /1 unread from Sam/.test(String(a)), true);
is("says how old it is", /just now/.test(String(a)), true);
is("other apps unaffected", T.snapAnswer("what's on my calendar"), null);
is("a send is not served from it", T.snapAnswer("send the last email"), null);

console.log("unconnected apps are spotted from a search:");
is("finds it", T.unconnected({ toolkit_connection_statuses: [{ toolkit: "gmail", has_active_connection: true }, { toolkit: "notion", has_active_connection: false }] }), "notion");
is("all connected", T.unconnected({ toolkit_connection_statuses: [{ toolkit: "gmail", has_active_connection: true }] }), null);
is("empty", T.unconnected({}), null);

console.log("app names read properly:");
is("gmail", T.pretty("gmail"), "Gmail");
is("calendar", T.pretty("googlecalendar"), "Google Calendar");
is("unknown", T.pretty("discord"), "Discord");

console.log("\n" + pass + " passed, " + fail + " failed");
process.exit(fail ? 1 : 0);
