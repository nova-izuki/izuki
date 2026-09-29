// Tests the real clear-chat and account-routing rules taken out of the
// phone app's index.html, so a change there can't quietly break them.
const fs = require("fs");
const path = require("path");

const html = fs.readFileSync(path.join(__dirname, "..", "..", "docs", "app", "index.html"), "utf8");
const start = html.indexOf("  const CLEAR_RE");
const end = html.indexOf("Answer through the PC");
if (start < 0 || end < 0) throw new Error("could not find the rules in index.html");
// Keep only the two rule blocks: up to the "};" that closes wantsAccount.
const source = html.slice(start, html.lastIndexOf("};", end) + 2);

// eslint-disable-next-line no-new-func
const { wantsClear, wantsAccount } = new Function(source + "; return { wantsClear, wantsAccount };")();

let pass = 0;
let fail = 0;
function is(label, got, want) {
  if (got === want) { pass++; console.log("  ok   " + label); }
  else { fail++; console.log("  FAIL " + label + " -> got " + got + ", wanted " + want); }
}

console.log("clear chat (typed or spoken):");
for (const s of [
  "clear chat", "Clear chat", "clear the chat", "clear my chat", "start over",
  "reset", "wipe it", "new chat",
  "clear conversation",
  "clear chat.", "clear the messages", "empty",
]) is(JSON.stringify(s), wantsClear(s), true);

console.log("not a clear request:");
for (const s of [
  "clear the table", "clear my search", "what's in my inbox", "play music",
  "clear chat with sam about the project", "empty the fridge", "reset the page",
  "remind me to clear my inbox",
  // "forget everything" is the bigger wipe in Settings — kept off the
  // voice/typed shortcut on purpose, so a stray word can't do it.
  "forget everything",
]) is(JSON.stringify(s), wantsClear(s), false);

console.log("accounts and apps go to the PC:");
for (const s of [
  "what's in my inbox", "check my email", "read my emails", "send an email to Sam",
  "what's on my calendar", "add it to my calendar", "open my drive", "find my notes in notion",
  "what's in my slack", "check my github", "log into blackboard", "open canvas for my assignment",
  "what's my schedule today", "show my tasks", "check my notebooklm",
]) is(JSON.stringify(s), wantsAccount(s), true);

console.log("ordinary chat stays on the phone:");
for (const s of [
  "how are you", "what's the weather", "tell me a joke", "play some music",
  "what should I cook for dinner", "help me write an email", "who is the president",
  "what time is it", "remind me to buy milk", "help me draft a message to my boss",
]) is(JSON.stringify(s), wantsAccount(s), false);

console.log("edge cases:");
is("empty string", wantsAccount(""), false);
is("undefined", wantsClear(undefined), false);
is("uppercase email", wantsAccount("check my EMAIL"), true);
is("null", wantsAccount(null), false);

console.log("\n" + pass + " passed, " + fail + " failed");
process.exit(fail ? 1 : 0);
