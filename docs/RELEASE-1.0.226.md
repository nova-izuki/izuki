# Izuki 1.0.226

This release is about Izuki doing its quiet background work only when you have said yes to that particular thing.

Izuki can download an update by itself after five minutes with no keyboard or mouse. It is “Download updates while idle” in Settings → Updates, off until you turn it on, and installing still waits for your click.

A background helper left behind by an app that crashed — no window for ten minutes — can now be closed by itself with “Close helpers left behind” in Settings → PC Boost. It is off until you turn it on, it never touches a window or a system process, and it leaves a crash handler alone while its app is still running. That check now costs one process snapshot instead of a walk per helper (35 ms → 12 ms a look).

PC Care keeps a filling drive from getting worse: with “Keep my PC fast by itself” on, it clears old temp files when a drive drops under 8% free, once a day. Recycle Bin items older than 30 days are cleared the same way, but only by the switch that says so — “Clear old Recycle Bin items”, off by default — and Izuki tells you how many went.

The chat box grew up. It grows with a paragraph and keeps what you said, so a misheard word is a quick fix before you send, on a deeper lit surface. The Deep and Code pills get their room at narrow widths, Allow cards have an “Always allow” button so Izuki stops asking, and the task card can be dragged, resized from its corner and stays where you left it.

Spoken words land in the chat box so a misheard name is a quick edit, and “Send what I say straight away” in Settings → Talk keeps the old send-on-hearing flow for hands-free use. Autopilot takes a typed line or a held mic.

Izuki has skills now: a video-editing skill for content creators — trims, vertical for Reels and Shorts, burned captions, social loudness, thumbnails — that loads only when the ask is really about editing. “Play lofi” goes straight to the video on YouTube instead of a results page, and Izuki says one line when the song it started has finished.

Working from two PCs is written down and automated: `docs/HANDOFF.md` has the first-run steps, the pull and push discipline and what not to put in a synced folder, and `tools/two-machine/sync.ps1` keeps a PC up to date from a scheduled task. The Codex domain-setup note that had only ever existed as an unsaved edit on one disk is restored.

One thing here is for the release itself: a version bump that leaves the phone build numbers behind is now refused before anything is tagged, so a phone is never offered an update it cannot install.
