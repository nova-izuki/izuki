# Waiting for the next release

Codex and Freebuff: add one line per change you pushed. Write it in plain
words for the owner, and put your name in brackets. Claude moves these lines
into the next `docs/RELEASE-x.y.z.md` when it releases, then clears this list.

- The phone app now notices a new build while it is open — it checks for one every few hours and when the app comes back to the front — and offers a Reload bar instead of silently running the code it started with for days. The offline file list is checked too, so a renamed file can't quietly break the phone app's offline install. [Freebuff]
- The phone app has its own look now — Izuki OS: a deep night sky behind everything, one glass bar across the top, the home screen laid out as widgets and app tiles, rounded bubbles in the chat and a floating capsule to type in, with a soft glowing rim on anything you can touch. Same buttons and same behaviour underneath; only what you see and how the home screen is arranged changed. [Freebuff]
- The phone app looks deeper and starts faster on Android: the bar, the home widgets, the bubbles and the Settings rows have more light and shape (still one skin, same buttons underneath), the heavy phone tools and the headset code now load after the first screen instead of in front of it, and a plain chat answer that has said nothing for 8 seconds is retried on the quick model instead of waiting 12. [Freebuff]
- The phone app's Settings now keeps its title and Done button at the top while you scroll, closed cards are just their title again (a leftover "How it works" link used to sit alone inside them, sometimes twice), the companions sit in a neat 3 x 3 grid instead of running off the right edge, every card title lines up with its dot, the update notice stops covering the sheet's buttons, and the small misalignments around the home and the tools tiles are fixed. [Freebuff]
