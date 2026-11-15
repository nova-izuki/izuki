# Izuki 1.0.215: learn it, do it together, or have it done

## 🧑‍🏫 Practical Mode

- **"Teach me", "do it with me" and "just do it"** run through the same real task engine. In a lesson Izuki points at the next control, says what to do and why, waits while you do it, then checks the result on the next look and explains what came back. "Do it with me" takes turns; "just do it" is the usual agent.
- Mid-task, say **"you do this one"**, **"let me do this one"** or **"do the rest"**, or press **I did it / Do it for me** on the Task Stage. On your turn nothing is clicked for you, and Esc belongs to the app you're in.
- A job asked without saying how ("help me investigate…", "help me set up…") gets one question first: do it, do it with you, or teach you step by step, with those three as chips.

## 🔐 "Help me investigate suspicious login activity"

- Reads Windows' own Security log (sign-ins 4624, failed tries 4625) or, on Linux, the journal or auth log. It only reads: no setting is changed and auditing is never turned on for you.
- Every finding carries the events it rests on: bursts of failed tries, many user names from one place, a sign-in right after failures, sign-ins from outside your network, lockouts, unusual hours. What looks normal is said too, and a log that couldn't be read (or was cut off) is reported as such.
- Windows keeps that log for administrators. Izuki asks before Windows' prompt appears, and the word "admin" alone is never taken as a yes.

## 🌐 Sites you're signed into

- Izuki works inside sites you're already signed into, through the browser extension, and you decide where. Ordinary sites just work; bank, payment, health, government and sign-in pages wait until you say **"let Izuki use chase.com"**; **"never let Izuki use reddit.com"** keeps it out; **"forget chase.com"** resets it. Settings → Privacy → **Sites Izuki can use** shows and changes the list.
- The rule is checked at the moment of every click and typed word, against the page the browser shows right then. An element is used only while it is still the one Izuki read (same site, name, question and form), so a quiz that moved on or a page that changed is never clicked blindly.
- Passwords, card numbers, security codes and one-time codes are never typed, on any site.

## 🧩 Browser extension 1.6.3

- Four plain views (Ask IZUKI, Current Page, Tasks, Settings) and a run bar above the message box with **Stop always in sight**.
- Starting a new question run while one is still going asks first; a stuck run is cleared and says so; an assistant that never answers stops with the reason instead of "Asking Gemini…" forever.
- "Ready" only when it really is; a page you clicked through on the same site is followed (with a note) instead of "This tab moved to another page"; **Side by side** works again.

## Under the hood

- Fixes from the review of the practical code: sign-in reads run off the app's async workers; results a stopped task's direct step finished late never reach the next task; a reply to "I did it" after Stop is never spoken; "take turns" starts turns fresh; IPv4 addresses written as IPv6 are judged correctly.
- Developer builds keep a much smaller cache (line numbers for Izuki's own code, no debug info for libraries), and `npm run trim:cache` reports or removes old Izuki build outputs. The cache had filled the drive more than once.
- `docs/DESKTOP-TEST-CHECKLIST.md`: the checks only a real PC can prove, for this release.
- Android `versionCode` is 215, so this installs over 1.0.214.

## Checked before release

- CI (Windows build + Rust tests, web, hand overlay, coordinate) on #99, #102 and this release.
- `tsc --noEmit`, `test:conversation`, `test:panel`, `test:workspace`, `bubble-check` (real headless Edge: reused or changed elements are never acted on), `asset-check` (packed extension current).
- Practical Mode and the sign-in investigation unit tests (18) against sample Windows events and Linux auth logs.
- On this PC, a normal read of the Security log is refused with "Access is denied" (exit 5), the case Izuki turns into its question before the administrator prompt.

**Not yet verified on the installed app:** a full Teach me lesson on a real PC, the administrator read through Windows' prompt, and the extension's run bar and Side by side in a real browser. Those need a pass on the owner's PC after this update installs.
