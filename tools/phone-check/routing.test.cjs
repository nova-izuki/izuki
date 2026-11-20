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
const { wantsClear, wantsAccount, wantsPc, requestLane } = new Function(source + "; return { wantsClear, wantsAccount, wantsPc, requestLane };")();

let pass = 0;
let fail = 0;
function is(label, got, want) {
  if (got === want) { pass++; console.log("  ok   " + label); }
  else { fail++; console.log("  FAIL " + label + " -> got " + got + ", wanted " + want); }
}

console.log("windows, looks and tweaks go to the PC (when there is one):");
for (const s of [
  "put my windows side by side", "Set up my Work layout", "save my windows as coding", "make my PC look cozy",
  "undo the tweaks", "undo the gamer pack", "what did you do today?", "What have you changed on my computer?",
  "move Spotify to my other screen", "put chrome on the left half", "put discord in the top right corner",
  "put Chrome on the left", "center Notepad", "make VS Code full screen", "maximize Discord", "snap the spotify window to the right",
  "put this window on the left", "move the window to my other screen", "put the GIMP window on the left", "center this window", "maximize the notion window",
  "dim the rest", "Dim everything except this window", "undim", "stop dimming", "keep Spotify on top", "pin this window on top", "always on top",
  "unpin Spotify", "make Discord see-through", "make this window 50% transparent", "make discord solid again", "make Notepad a little transparent",
  "hide everything except this", "minimise everything else", "clear the clutter",
]) is(JSON.stringify(s), requestLane(s, false, true), "pc");
for (const s of ["maximize Discord", "send Spotify to the other screen", "put this window on the left"]) {
  is(JSON.stringify(s) + " with apps linked still goes to the PC", requestLane(s, true, true), "pc");
}
is("a Discord message with apps linked stays with the apps", requestLane("send a message on discord to sam", true, true), "apps");
for (const s of ["compare these phones side by side", "what did you do last summer", "make my essay look nicer", "fix my website layout", "my windows are dirty", "how do I clean my windows", "change my blog layout", "put the chicken in the middle", "move the couch to the left", "center the title", "make the text full screen", "put the window cleaner on the left", "center the window frame on the wall", "dim the lights", "put the cheese on top", "keep your head on top of things", "make the background transparent", "make it transparent", "keep spotify on top of the charts", "hide my feelings", "clear the table", "dim the rest of the lights", "dim the restaurant sign"]) {
  is(JSON.stringify(s) + " stays a chat", requestLane(s, false, true), "chat");
}
is("no PC linked: a layout request is just a chat", requestLane("put my windows side by side", false, false), "chat");

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

console.log("PC work goes to the PC:");
for (const s of [
  "play lofi on my pc", "open spotify", "close chrome", "scroll down",
  "search youtube for burna boy", "turn on the lights", "take a screenshot",
  "what's on my screen", "look at this page", "open this tab", "play the next song",
  "louder", "install notepad", "go to my downloads", "put on some jazz",
]) is(JSON.stringify(s), wantsPc(s), true);

console.log("talking stays on the phone:");
for (const s of [
  "how are you", "tell me a joke", "what's the weather in Lagos",
  "explain photosynthesis", "what should I cook", "who won the match",
  "i had a long day", "clear chat", "remind me to call mum",
]) is(JSON.stringify(s), wantsPc(s), false);

is("ambiguous screen action asks which device", requestLane("open spotify", true, true), "clarify");
is("explicit PC task is not hijacked by phone Composio", requestLane("open spotify on my PC", true, true), "pc");
for (const request of ["open my phone", "open Gmail on my phone", "click this on my iPhone", "scroll on my Android", "open phone", "read my phone screen"]) {
  for (const connected of [true, false]) is(request + " paired=" + connected, requestLane(request, true, connected), "phone");
}
is("two named devices ask before acting", requestLane("open my phone from my PC", true, true), "clarify");
is("word fragments aren't device names", requestLane("tell me about my phonetic alphabet", false, true), "chat");
is("Gmail uses phone connections when configured", requestLane("read Gmail", true, true), "apps");
is("Gmail uses PC connections without phone key", requestLane("read Gmail", false, true), "pc");
is("ordinary conversation needs neither bridge", requestLane("hello", true, true), "chat");
is("PC reminders take precedence over email keywords", requestLane("remind me to email Sam in 20 minutes", true, true), "pc");
is("standalone phone reminder stays local", requestLane("remind me to email Sam", true, false), "chat");
is("web scraping uses backend without a device-choice question", requestLane("scrape https://example.com", false, true), "pc");
is("link extraction uses backend even with phone apps configured", requestLane("extract the table from https://example.com", true, true), "pc");
is("unpaired phone never pretends it read a website", requestLane("summarize https://example.com", true, false), "web-unavailable");

console.log("the Android app does phone jobs itself (the phone agent):");
// eslint-disable-next-line no-new-func
const agent = new Function("window", source + "; return { phoneAgentLane, requestLane };")({
  IzukiNative: { installed: () => true, platform: () => "android" }, IzukiAgent: {},
});
const onPhone = (s, apps = false, pc = true) => agent.phoneAgentLane(s, agent.requestLane(s, apps, pc));
for (const s of [
  "check what's taking space on my phone", "what's taking up so much storage", "free up space", "how much battery do I have",
  "turn on dark mode", "turn off wifi", "open YouTube", "play some music", "take a screenshot", "open settings on my phone",
  "check up what is taking lotta storage on my phone", "connect to my bluetooth speaker",
]) is(JSON.stringify(s) + " → phone agent", onPhone(s), true);
for (const s of [
  "open YouTube on my PC", "free up space on my computer", "hello", "tell me a joke", "what's the weather today",
  "remind me to call mum at 6", "set an alarm for 7", "read my Gmail", "put my windows side by side",
  "summarize https://example.com", "who won the game last night",
]) is(JSON.stringify(s) + " is not a phone job", onPhone(s), false);
// eslint-disable-next-line no-new-func
const web = new Function("window", source + "; return { phoneAgentLane, requestLane };")({});
is("a browser (no Android app) never runs the agent", web.phoneAgentLane("open YouTube", web.requestLane("open YouTube", false, true)), false);

console.log("Google Search only when the question needs it (it slows every answer):");
const webStart = html.indexOf("  const WEB_WORDS = ");
const webEnd = html.indexOf("  const usesGemini = ", webStart);
if (webStart < 0 || webEnd < 0) throw new Error("could not find needsWeb in index.html");
// eslint-disable-next-line no-new-func
const searchFor = (lang) => new Function("speechLanguage", html.slice(webStart, webEnd) + "; return needsWeb;")(lang);
const needsWeb = searchFor("auto");
const asked = (...lines) => lines.map((text) => ({ role: "user", parts: [{ text }] }));
for (const q of ["what's the weather today", "Is it raining in London?", "who won the match last night", "news about the election", "¿Va a llover mañana?", "quel temps fait-il demain", "what's the top event in Houston today", "anything happening in Houston this weekend", "top headlines right now", "any concerts in Houston tonight", "what are the pharmacy's opening hours", "is the shop closed today"]) {
  is(JSON.stringify(q) + " searches", needsWeb(asked(q)), true);
}
// Everyday phrasing used to drag Google Search (and its extra seconds) into
// plain chat: "what's", and any "hours" at all.
for (const q of ["hi", "tell me a joke", "make that shorter", "write me a poem about the sea", "what's up", "what's your favourite colour", "it took me two hours to get here"]) {
  is(JSON.stringify(q) + " answers without search", needsWeb(asked(q)), false);
}
is("a follow-up keeps the search (“and in Paris?”)", needsWeb(asked("what's the weather in London", "and in Paris?")), true);
is("a language the lists don't cover leaves it to Gemini", searchFor("yoruba")(asked("bawo ni")), true);

console.log("the screen assistant: what's on the screen, explained:");
const screenStart = html.indexOf("  const SCREEN_HELP = ");
const screenEnd = html.indexOf("  const SCREEN_SYSTEM = ", screenStart);
if (screenStart < 0 || screenEnd < 0) throw new Error("could not find SCREEN_HELP in index.html");
// eslint-disable-next-line no-new-func
const wantsScreenHelp = new Function(html.slice(screenStart, screenEnd) + "; return wantsScreenHelp;")();
for (const q of ["explain this", "what does this mean", "what's this?", "what is this error", "help me with this page", "summarize this article", "translate this", "what's on my screen", "what am I looking at", "read this for me", "check this message"]) {
  is(JSON.stringify(q) + " is about the screen", wantsScreenHelp(q), true);
}
for (const q of ["what's the weather", "open YouTube", "tell me a joke", "what is love", "explain quantum physics", "what's this week's news"]) {
  is(JSON.stringify(q) + " is not", wantsScreenHelp(q), false);
}
console.log("\n" + pass + " passed, " + fail + " failed");
process.exit(fail ? 1 : 0);
