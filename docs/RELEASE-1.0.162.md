# Izuki 1.0.162: Izuki reads your FL project, not just its sound

## 📂 "Not only listening: knowing the backend, so it's precise even when something's muted"
**The problem:** Izuki only knew your beat by ear. It played the project and listened, so a muted channel, a quiet speaker, other sound on the PC or a long 808 tail could all throw it off. FL's scripting doesn't help much either: it can't see Playlist clips or which audio files your channels play.

**What changed:** Izuki now reads the FL project file itself (`.flp`), which holds all of it exactly:
- **Every channel's name and its sample file** ("NM - Baby 808" → `…\Favorite 808s\NM - Baby 808.wav`).
- **Every pattern's notes,** to the tick, and where they play in the song.
- **Every Playlist clip:** where it starts, how long it is, its track, and its trim (milliseconds into the audio file).

Izuki finds the open project from FL's window title and FL's recent files. When you ask what's in it, Izuki first saves the project through its link to FL, the same as pressing Ctrl+S, so what it reads is what you have now. (The 808 check never saves mid-job; it only needs the 808's sound file.) FL keeps its own backups in the project's Backup folder.

**What you can do with it now:**
- **"What's in my FL project?"** (or "read my beat", "go through my FL project"; a plain "my project" needs FL or your beat named, so a school project isn't mistaken for it). You get what's really in it: the audio clips and their tracks, every part with notes and how many, and what isn't used in the song yet. Muted or not makes no difference.
- **The 808 check uses your 808's real sample.** When the listening can't tell how late your 808's own punch lands, Izuki reads it from the 808's WAV file exactly.

**How it was checked:**
- On a copy of your real project (Venzyyy.flp), Izuki's reader found FL 25.2.5.5319, 96 ticks a beat, all 26 channels with their sample files, 12 patterns (your NM - Baby 808's notes are in 7, 8 and 9) and 83 Playlist clips with their trims.
- Your NM - Baby 808 WAV: 4.86 s, and its punch lands 2 ms after the note starts. So the sample itself isn't what sounds late; the earlier "rushes/drags" are about where the notes sit.
- The trims were checked against the real stems: your vocals clip ends at 153,182 ms, and the vocals WAV is 153.18 s long.
- Byte-by-byte tests built the way FL writes projects, plus WAV tests for 16-bit, 24-bit and float files and a 808 attack measurement.

**Limits:**
- **The first time, FL needs restarting once.** Izuki's FL script gains the "save" command, and FL only loads scripts when it starts. Until then Izuki reads your last save and says so.
- **Your sample's hits from its file** (instead of by ear) come next: that also needs FL to report where your loop starts.
- **Factory sounds** (paths like `%FLStudioFactoryData%…`) are listed but not opened yet.
