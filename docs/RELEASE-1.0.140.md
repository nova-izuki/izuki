# Izuki 1.0.140: smarter in general, not one fix at a time

Most of the problems lately came from the same few weaknesses in how Izuki works. This release fixes those at the root, so things you haven't run into yet get better too, in every app and on every site.

## 🏃 It keeps going while it's getting somewhere
Every task used to stop after 16 steps, however well it was going, which cut long jobs off halfway. Now there's no fixed limit:
- It carries on while it's making real progress, checking every 12 steps.
- It stops only when it's stuck: no new progress, the same steps over and over, or a safety cap of 60 steps. Then it tells you what's in the way.
- "Keep going" picks it up from there.

## 🔁 When a click doesn't work, it tries another way
It used to click the same spot again and again (four times on your lab link) and then give up. Now, when a button has moved or redrawn, Izuki presses that same button another way:
1. inside the web page, through the browser extension;
2. through Windows' accessibility tools, without the mouse;
3. by reading the words on screen and clicking them.

It only does this when exactly one thing matches. It never presses a button that's hidden under a pop-up; the pop-up gets dealt with first.

## 🧠 It learns what works in each app and site
When something tripped Izuki up (a page that loads slowly, buttons that move, a task that stalled), it keeps a short tip for that app or site. Next time it's there, the tip goes into its instructions. Tips that are seen often and recently come first; old ones fade.

## 🤔 It thinks harder when it matters
The screen brain normally answers in its fastest mode. Now, after a failed or repeated step, the next look gets a real thinking budget, then it's back to fast.

For everyday chat, "why / how / explain / compare / plan / write" questions now go to the strongest AI you've set up (Gemini 2.5 Flash, or better if you add it). Quick chat still gets the fastest one.

---
The quiz and test rules don't change. Izuki still never answers or submits graded work for you.
