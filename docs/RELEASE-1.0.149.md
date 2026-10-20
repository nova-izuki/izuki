# Izuki 1.0.149: the 808 lined up by ear, and Notes only when you ask

## 🎧 The 808, lined up by ear like a producer would
**The problem:** you asked Izuki to quantize your 808 because it wasn't sitting with the beat. Two things went wrong:
- Your words weren't recognised. "quNITRIZW" was a typo, and "not aligning with the beat" matched none of the phrases Izuki knew, so it tried clicking FL Studio's screen. FL draws its own interface, so that can't work.
- Quantizing wouldn't have fixed it anyway. When an 808 is exactly on the grid and still sounds off, the notes aren't the problem: the sound itself is late (a slow attack, or a plugin delaying it), or the kick isn't on the grid. A producer fixes that by ear.

**What changed:** ask in any words ("line the 808 up with the beat", "my 808 sounds off", "quantize the 808, it's not aligning") and Izuki does what a producer would:
1. **It listens against FL's metronome.** It plays your kick alone, then your 808 alone, and records what comes out of your speakers. The click is the clock, so your sound card's delay doesn't throw it off. Your mutes and metronome setting go back exactly as they were.
2. **It tells you what it hears.** For example: "your 808 sounds about 28 ms late on every hit even where the notes are on time. That's the sound itself, which is why quantizing didn't fix it." Or: "beat 2.50 rushes by 35 ms".
3. **It fixes the timing, not your idea.** It opens the 808 in the Piano roll; you run Tools → Scripting → **Izuki align** → Accept.
   - 808 notes right by a kick (closer than a 32nd) land with the kick as it really sounds, off the grid where the kick is.
   - A sound that's always late gets started earlier by exactly that much.
   - 16ths between kicks get the beat's own feel.
   - Your rhythm stays as you wrote it: a note you placed a 16th or a 32nd from the kick stays there, and triplets and rolls aren't touched. Note lengths and slides stay too. Ctrl+Z takes it back.
4. Plain "quantize the 808" still uses FL's own Quick quantize when that's all you want.

**It reaches all of Izuki's FL abilities, in any words:** quantize, line up, balance the mix, add an 808, a melody or chords, mix the vocals, add an intro or a fill, tempo.

**How it was checked:**
- Automated tests on simulated recordings: kick-like thumps and metronome ticks at known times are found within a few milliseconds.
- A late kick stays late, an always-late 808 is recognised as the sound's own delay, and single notes that rush or drag are named.
- The FL script's logic, run on sample 808 notes, moves exactly the notes it should and leaves lengths and slides alone.

**Limits:**
- Name your kick channel "Kick".
- Keep other sound on the PC quiet while Izuki listens.
- Restart FL once after this update (Izuki updates its FL script).
- The very first note of a pattern can't start before the pattern itself.
- It hasn't been tried inside FL Studio itself yet, so say how it sounds.

## 📝 Izuki saves to your Notes only when you ask
**The problem:** Izuki saved notes on its own, including a "Review — FL Studio" note when you mentioned your "808 notes". That's music, not a request to save anything. Study guides, teacher-mode lessons and APA references were also saved without asking.

**What changed:** Izuki now saves to Notes only when you clearly ask ("save it to my notes", "put it in my notes", "take notes"), or while you have the Study log switched on. Study guides and APA references now ask first ("Want it kept in your Notes? Just say yes."). Musical notes never count.
