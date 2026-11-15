# Waiting for the next release

Codex and Freebuff: add one line per change you pushed. Write it in plain
words for the owner, and put your name in brackets. Claude moves these lines
into the next `docs/RELEASE-x.y.z.md` when it releases, then clears this list.

- [Claude] New PowerPoint decks: asking Izuki to write a new .pptx now makes a real deck (one slide per "# " title, "- " bullets under it; long slides shrink their text to fit) instead of "I can't make a slide deck yet". The storage report names a folder you can clear the way you'd find it ("Downloads › project › target") instead of a full C:\Users path. Two small review fixes from 1.0.215: a replaced task's direct-step results stay with their own task, and `npm run trim:cache` also trims builds made for an explicit target. Plus docs/IPHONE-ROADMAP.md: what an iPhone companion can and can't do, in order. (The decks were checked by Izuki's own validator and opened with python-pptx; opening one in PowerPoint itself is still to be tried on a PC that has it.)
