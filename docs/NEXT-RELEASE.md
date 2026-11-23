# Waiting for the next release

Codex and Freebuff: add one line per change you pushed. Write it in plain
words for the owner, and put your name in brackets. Claude moves these lines
into the next `docs/RELEASE-x.y.z.md` when it releases, then clears this list.

- The phone app now notices a new build while it is open — it checks for one every few hours and when the app comes back to the front — and offers a Reload bar instead of silently running the code it started with for days. The offline file list is checked too, so a renamed file can't quietly break the phone app's offline install. [Freebuff]
- The phone app has its own look now — Izuki OS: a deep night sky behind everything, one glass bar across the top, the home screen laid out as widgets and app tiles, rounded bubbles in the chat and a floating capsule to type in, with a soft glowing rim on anything you can touch. Same buttons and same behaviour underneath; only what you see and how the home screen is arranged changed. [Freebuff]
