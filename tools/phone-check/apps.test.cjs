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
  AbortController,
  setTimeout,
  clearTimeout,
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
async function integration() {
  A.saveKey("ak_example_test_only");
  let executed = [], calls = 0, toolResult = { data: { messages: [{ subject: "Team update" }] }, error: null };
  sandbox.fetch = async (url, options) => {
    const body = JSON.parse(options.body || "{}");
    if (url.endsWith("/execute")) executed.push(body);
    return { ok: true, json: async () => url.endsWith("/session") ? { session_id: "trs_test" }
      : url.endsWith("/search") ? { results: [{ primary_tool_slugs: ["GMAIL_FETCH_EMAILS"] }], toolkit_connection_statuses: [{ toolkit: "gmail", has_active_connection: true }] }
      : toolResult };
  };
  let answer = await A.ask([{ role: "user", text: "Read my Gmail" }, { role: "model", text: "Which messages?" }, { role: "user", text: "The latest five" }], async (messages) => {
    if (calls++ === 0) {
      is("phone text reaches the apps model", messages.some((m) => m.content === "Read my Gmail"), true);
      is("model history retains assistant role", messages.some((m) => m.role === "assistant" && m.content === "Which messages?"), true);
      return JSON.stringify({ run: { tool: "GMAIL_FETCH_EMAILS", arguments: { max_results: 5 }, account: "ca_selected" } });
    }
    return JSON.stringify({ reply: "Team update is your latest message." });
  });
  is("verified read returns the answer", answer.text.includes("Team update"), true);
  is("selected account reaches Composio", executed[0].account, "ca_selected");

  calls = 0;
  answer = await A.ask([{ role: "user", text: "How many emails from Sam?" }], async () => { calls++; return "I have read 100 emails."; });
  is("another Gmail question does not reuse inbox snapshot", calls, 1);
  is("unverified prose is not displayed as fact", answer.text.includes("100 emails"), false);

  toolResult = { data: { successful: false, error: "Connection expired" } }; calls = 0;
  answer = await A.ask([{ role: "user", content: "Check Gmail again" }], async () => calls++ === 0
    ? JSON.stringify({ run: { tool: "GMAIL_FETCH_EMAILS", arguments: {} } })
    : JSON.stringify({ reply: "Everything was read successfully." }));
  is("HTTP 200 tool failure cannot license a success claim", answer.text.includes("Everything was read"), false);

  for (const v of [{ error: { message: "denied" } }, { data: { success: false } }, {}]) is("failure envelope rejected", !!T.toolError(v), true);
  answer = await A.ask([{ role: "user", text: "Check my Gmail accounts" }], async () => JSON.stringify({ ask: "Work or personal Gmail?" }));
  is("clarification is allowed without fabricating account data", answer.text, "Work or personal Gmail?");
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exitCode = fail ? 1 : 0;
}
integration().catch((e) => { console.error(e); process.exitCode = 1; });
