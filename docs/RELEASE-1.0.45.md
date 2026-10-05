# Izuki 1.0.45

A full bug sweep — including the one that sent TV requests to your PC — plus Focus mode, a smart clipboard and Recall.

## Fixed
- **"… on the TV" now really goes to the TV.** A hidden character in the voice engine meant the rule that sends TV requests to the TV never matched (since 1.0.34) — "open Netflix on the TV" was done on the PC instead. Fixed, and a new check stops this kind of bug from ever shipping again. The phone app's TV detection had the same problem and is fixed too.
- **The Island follows the window you're in.** Its suggestions only refreshed when the music changed, so they stayed stuck on the first app. Now they change as you switch windows.
- **Big answers no longer freeze.** A background check with a lot to print (like the list of installed apps behind "which apps take space?") stalled for 90 seconds and came back half-finished. Now it's instant.
- **No false "done".** Izuki's own actions (like switching on battery saver) only say they worked when Windows really did it.
- **Offline? It says so at once** instead of "thinking" for 22 seconds first.
- **The Later list doesn't hijack chat** — "I got an email from my boss…" now goes to the AI, not the list.

## New: Focus mode
"Hey Nova, focus for 25 minutes" (or "for an hour", "pomodoro"). A 🎯 countdown sits on the Island, buddy mode holds everything that isn't urgent, and when time's up Izuki says so and tells you what came in meanwhile. "Stop focus" ends it early.

## New: smart clipboard
Copy something and the Island offers the right thing to do with it — Translate (another language), Sum up the link, Directions (an address), Write an email (an email address), Explain this code, Fix this error, Sum it up (long text) or Remind me later. Nothing is sent anywhere unless you tap it, and passwords or codes never get suggestions.

## New: Recall (off until you turn it on)
"What was that site I was on this morning?", "what was I doing at 3?" — with Recall on (Talk to Izuki → Recall), Izuki notes the titles of the windows you had in front (never what's in them, never private or sign-in windows), keeps a week, on this PC only, and answers from it. One tap forgets it all.
