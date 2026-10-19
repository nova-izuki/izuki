# Izuki 1.0.147: "what's taking up my space?" works from anywhere, and clears what's safe

**The problem:** Izuki warned that your drive was nearly full and offered to find what's taking the space, but asking it to look kept failing. Two causes:
- **Only one route led to the storage report.** It worked only when your words matched certain phrases on the PC's fast path. The chat AI, which picked up your request, had no way to call it, so it tried clicking around the screen instead.
- **Slow background checks looked like failures.** When the AI checked the PC itself, a command that adds up a whole drive could run for 90 seconds, but Izuki calls a request stalled after 61. So it died with no answer. Also, nothing handled "clear it".

**What changed:**
- **The storage report works from anywhere and in any words:** voice, the Chat tab, the Island, your phone, Discord and Missions. The AI can call it directly.
- **It shows more:** each drive's free space, the biggest apps, the biggest folders, what's inside the two biggest folders, the biggest single files, and what's safe to clear: old temporary files, the Recycle Bin, Windows Update leftovers, and build folders that rebuild themselves.
- **"Clear the safe stuff" / "free up some space"** clears old temporary files and tells you how much space you have now.
- **"Empty the Recycle Bin"** empties it, but only when you ask by name.
- **Your own files are shown, never deleted.** Say "open Downloads" to go through them yourself.
- **Background checks are capped at 40 seconds,** under the stall limit, so a slow check gives a clear answer instead of failing. The AI is also told to use the storage report rather than add up a drive itself.
- **One shared list of abilities:** the PC's fast path now also checks the list the phone, Discord and Missions use, so a new ability reaches every place you can ask.
- The low-storage warning says "less than 1 GB" instead of "about 0 GB", and tells you exactly what to say.

**What else it helps:** every way of asking about disk space ("why is my C drive full", "what's eating my storage", "make room on my drive"), and any slow PC check the chat runs in the background.

**How it was checked:** a real run on this PC took 18 seconds. It found Downloads (at least 105 GB, mostly "SPFL msin" 54 GB and "Faces" 37 GB), the biggest files (an Ubuntu ISO and three 4.7 GB .rar parts), 576 MB of old temp files, and a 15.8 GB build folder. Automated tests cover your exact wording (typos included), "free up space", "empty the Recycle Bin", and things that aren't about disk space ("free up memory", "space bar", "Google Drive").

**Limits:** very big folders are reported as "at least" when the half-minute look runs out. Deleting your own files is always your call.
