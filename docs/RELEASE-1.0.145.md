# Izuki 1.0.145: understands any wording for its own abilities, keeps a to-do list, and a tidier shortcut bar

## 🧩 Izuki's own abilities, whatever words you use
**The problem:** Izuki's built-in abilities (what's due, your grades, class announcements, your textbooks, APA references, your money summary, study progress, screen time, "what was I on this morning") were only reached when your words matched phrases it knew. "chrck my assignments on blackboard and tell me the due dates" matched none. So the AI guessed it was one of your linked apps, and the linked-apps service has no Blackboard, so it gave up.

**What changed:** the AI now has a tool for Izuki's own abilities in every place you can ask: the Chat tab, voice, the phone, Discord and Missions. It names the ability and fills in the details, for example *grades | biology* or *due | week*, and Izuki runs that ability directly. No phrase has to match.

**What else it helps:** any new way of asking for any of those abilities, including slang, typos, short forms and indirect questions. Examples: "anything i gotta turn in b4 friday?", "did my chem prof post anything new", "yo whats my grade lookin like in bio", "how much did i spend on food". If no ability fits, Izuki says so plainly and tries another way, such as a web search or the screen. It never makes up an answer.

**How it was checked:** with your own Groq AI on 16 different requests:
- Every request for one of Izuki's abilities picked the right one.
- Weather, sports scores, maths, jokes and emails still went where they belong.
- Two other misses came from the test setup itself, not from this change: it left out Izuki's reminder instructions, and in the app "open blackboard" is caught earlier by the site opener.
- Automated tests cover running each ability by name, and "no ability" for things that aren't one.

**Limits:** the abilities still need their data. Blackboard needs the browser extension (1.4.2, with Blackboard open the first time). Money needs your bank CSV.

## ✅ Izuki keeps a to-do list, like a coding agent does
For anything with more than one step, Izuki now writes a short **to-do list** at the start (for example "Open Blackboard → Open Assignments → Read every due date") and **ticks items off** as it really finishes them on screen.
- **You can watch it work through the list on the Island** while it's busy: what's done, what's left, "2 of 3".
- **It checks its own list before saying it's finished.** If it says "done" with something still unticked, it goes back once to do what's left, or tells you which item it couldn't do and why. No more stopping halfway without saying so.
- The list is shown back to it on every look, so it doesn't lose its place on long tasks.

## 🧭 The shortcut bar no longer covers the page
The section shortcuts at the top of a long tab (Settings has eighteen) follow you as you scroll. Wrapped onto three rows, they covered a big part of what you'd scrolled to. Now:
- once you've scrolled down they fold to **one row**, with an **All ▾** button for the rest;
- picking a section folds them again;
- the bar is more solid, so the page scrolling underneath doesn't show through.
