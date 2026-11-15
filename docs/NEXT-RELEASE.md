# Waiting for the next release

Codex and Freebuff: add one line per change you pushed. Write it in plain
words for the owner, and put your name in brackets. Claude moves these lines
into the next `docs/RELEASE-x.y.z.md` when it releases, then clears this list.

- [Freebuff] Nova Notch + Shape Studio: a glass notch that attaches to the top of the screen with two curved side scoops, a compact live status card, and a real step ring, expanding into the existing Island when you need it. Classic stays the default. Shape Studio adds live opacity, blur, accent, shadow and calm-motion controls, an optional brighter Light glass finish, and an opt-in “Expand while a task runs”. The open panel now caps its height on short screens.
- [Freebuff] Chat: “answer it”, “give ans”, “answer question 5” and “answer all of them” now answer the question on screen instead of replying with a Study-log refusal. The answer replaces the waiting assistant bubble instead of adding a duplicate.
- [Claude] New PowerPoint decks: asking Izuki to write a new .pptx now makes a real deck (one slide per "# " title, "- " bullets under it; long slides shrink their text to fit) instead of "I can't make a slide deck yet". The storage report names a folder you can clear the way you'd find it ("Downloads › project › target") instead of a full C:\Users path. Two small review fixes from 1.0.215: a replaced task's direct-step results stay with their own task, and `npm run trim:cache` also trims builds made for an explicit target. Plus docs/IPHONE-ROADMAP.md: what an iPhone companion can and can't do, in order. (The decks were checked by Izuki's own validator and opened with python-pptx; opening one in PowerPoint itself is still to be tried on a PC that has it.)
