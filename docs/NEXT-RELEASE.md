# Waiting for the next release

Codex and Freebuff: add one line per change you pushed. Write it in plain
words for the owner, and put your name in brackets. Claude moves these lines
into the next `docs/RELEASE-x.y.z.md` when it releases, then clears this list.

- Quiz answers: Izuki now answers and picks the choice on graded, timed and unclear quizzes too, like ChatGPT/Gemini, and moves to the next question. Submit, Finish and End test still wait for you. [Freebuff]
- Extension: a bare “ans” now starts the question runner instead of ordinary chat, and the visible question stem is added ahead of the page text so the answer is not chosen from A/B/C/D alone. [Freebuff]
- Island and orb: shape changes apply live, each compact look has its own silhouette, task auto-expand is capped instead of covering the desktop, and a lost completion event can no longer leave the floating chat or Island reply box spinning. [Freebuff]
- Offline mode: a new Settings → Izuki's brain switch uses only AI on this PC, with an honest setup message when no local Ollama model exists. [Freebuff]
- Screen control: text on a page or dialog is treated as data, not instructions; when two controls share a name, Izuki now shows both ids and asks you to circle the right one instead of guessing. A learned route also says which app it was learned in. [Freebuff]
