# Waiting for the next release

Codex and Freebuff: add one line per change you pushed. Write it in plain
words for the owner, and put your name in brackets. Claude moves these lines
into the next `docs/RELEASE-x.y.z.md` when it releases, then clears this list.
- Two-machine handoff: the repo is the only sync between the two PCs — first-run steps, pull/push discipline, what not to put in a synced folder, and the checks to run, all in `docs/HANDOFF.md`. [Freebuff]
- Two-machine auto-sync: `tools/two-machine/sync.ps1` plus a scheduled task (sign-in + every 10 min) that fast-forwards this PC and pushes its commits, so the laptop that was off catches up by itself. [Freebuff]
- Restored the Codex domain-setup note that had only ever existed as an unsaved edit on one disk, and brought this checkout 162 commits up to date so the two PCs finally started from the same place. [Freebuff]
- "Play lofi" now goes straight to the video on YouTube instead of opening a results page and clicking, and Izuki says one line when the song it started has finished. [Freebuff]
- Izuki has skills now: a video-editing skill for content creators (trims, vertical for Reels/Shorts, burned captions, social loudness, thumbnails) that loads only when the ask is actually about editing; the task card can be dragged, resized from its corner and stays where you left it; Autopilot takes a typed line or a held mic. [Freebuff]
- The chat composer grows with a paragraph and keeps what you said so you can fix a misheard word before sending, on a deeper lit surface; and PC Care now clears old temp files by itself when a drive drops under 8% free (with "Keep my PC fast by itself" on), once a day. [Freebuff]
- Spoken words land in the chat box so a misheard name is a quick edit, and a new “Send what I say straight away” switch in Settings → Talk keeps the old send-on-hearing flow for hands-free use. [Freebuff]
- Izuki clears Recycle Bin items older than 30 days by itself (with “Keep my PC fast by itself” on, once a day) and tells you how many went. [Freebuff]
- Clearing old Recycle Bin items is now only the Switch that says so (“Clear old Recycle Bin items”, off by default) — not part of “Keep my PC fast by itself” — and it tells you how many went. [Freebuff]
- The chat composer gives the Deep/Code pills room at narrow widths, and Allow cards have an “Always allow” button so Izuki stops asking. [Freebuff]
- A background helper left behind by an app that crashed (no window for ten minutes) can now be closed by itself — “Close helpers left behind” in Settings → PC Boost, off until you turn it on, never touching a window or a system process. [Freebuff]
- “Close helpers left behind” now costs one process snapshot instead of a walk per helper (35 ms → 12 ms a look) and leaves a crash handler alone while its app is still running. [Freebuff]
- Izuki can download an update by itself after five minutes with no keyboard or mouse — “Download updates while idle” in Settings → Updates, off until you turn it on; installing still waits for your click. [Freebuff]
- The release gate now refuses a version bump that leaves the phone build numbers behind (Android and iOS won't install an update with the same build number), pinned by a test, and docs/BUMP-CHECKLIST.md lists every file a bump must touch. [Freebuff]
