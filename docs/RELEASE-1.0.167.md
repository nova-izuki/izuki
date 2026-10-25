# Izuki 1.0.167: your notes become a web, the way Notion works

Your notes already knew their subject, chapter and topic. What they couldn't do was point at each other. Now they can — and every note knows who points back at it.

## 🔗 Link one note to another
- **Write `[[Chapter 5 - Networks]]` in any note** and it becomes a link you can click. It opens that note.
- **Say it instead:** "link this to chapter 4", "connect this note to botnets", "see also chapter 2". Done on the spot, no AI call.
- **If the name is ambiguous, nothing happens by accident.** Izuki tells you which notes you have rather than opening a guess.

## 🪢 Every note knows what points at it
Open any note and you'll see three groups underneath:
- **Links to** — what this note points at.
- **Linked from** — what points *here*. Open Chapter 5 and you'll see that Chapter 4 leads into it, even though you only wrote the link once, in the other note.
- **Same chapter** — notes filed under the same subject and chapter, found together without anyone writing a link at all. This is where the automatic filing pays off: study Chapter 5 twice and both notes find each other.

## 🧭 It never opens the wrong note
A link is written as the note's title, so Izuki only follows it when the title means exactly one note:
- the exact title wins;
- otherwise a name that matches only one note;
- **two notes with the same title, or a name that could mean several — it opens neither.** Opening the wrong note would quietly teach you that links don't work.
- Linking to a title you've used twice is refused outright, and says which to rename.

## 🗃️ Where the links live
In the note's own text, as `[[the title]]` — not in a separate index that can drift out of step with your notes. Copy a note out, back it up, read it in any text editor: the links are right there in the words.

**How it was checked:** tests for finding links in text (repeats, empty brackets, a paragraph mistaken for a link), for resolving names (exact, unique partial, ambiguous, same title twice), and for the spoken forms ("link this to chapter 4" yes, "link my bank account" no). Plus the full core suite, the type check of every screen, and a review pass that caught the same-title bug before it shipped.
