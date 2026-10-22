# Izuki 1.0.156: your sample matched to FL's metronome, and no more empty promises

## 🎚️ "My sample isn't flowing with the metronome"
**The problem:** you found the real reason your 808 never felt right. The **sample itself** didn't sit on FL's metronome, so snapping the 808 to FL's grid put it against a grid the sample wasn't on. You were trimming the start and stretching the clip by hand until it matched the click. A producer checks for two things:
- **A different tempo:** the sample plays at, say, 141.3 BPM while FL is at 140, so it drifts further off the click every bar.
- **A late start:** a little silence or a pickup at the start of the clip, so every hit lands, say, 35 ms after FL's grid.

**What changed:** say "my sample isn't flowing with the metronome", "make the loop match the tempo" or "my sample is drifting off the grid", and Izuki:
1. **Plays your highlighted loop** in Song mode with FL's metronome on (both put back afterwards), and hears where the sample's hits land against the click.
2. **Finds the sample's own tempo.** It tries tempos within 12% of FL's and finds the one whose 16th-note grid fits the sample's hits best.
3. **Fixes the tempo if needed.** It sets FL's tempo to the sample's, then **listens again**. It keeps the change only if the sample now sits on the click; otherwise it puts the tempo back and says why (usually the clip is set to stretch with FL's tempo).
4. **Tells you about a late start.** It gives the exact amount to trim off the clip's start, or to slide it by. FL doesn't let scripts move clips, so that part is yours, but you'll know the number instead of guessing.
5. **Leaves loose loops alone.** If the hits don't fit any steady grid (heavy swing, several loops at once), it says so and changes nothing.

Once the sample sits on the metronome, snapping your 808 to the grid lines up with it, or "line my 808 up with the sample" does it by ear.

**How it was checked:** made-up trap patterns:
- at 141.3 BPM starting 35 ms late, against FL at 140: the tempo was found within 0.05 BPM and the late start within 3 ms;
- on FL's tempo but late: the tempo was left alone and the late start measured;
- random hits: refused.

Your wording is in the tests too. "The sample isn't flowing with the metronome" goes to this, and "line my 808 up with the sample" still lines up the 808.

**Limits:**
- Needs the one-time FL link: say "set up FL Studio", then switch Izuki on in FL's MIDI settings.
- Highlight the loop so it plays.
- The metronome must be audible.
- Not yet tried inside FL itself.

## 🤝 "It never does anything, it just repeats what it's about to do"
**The problem:** you said "yes" to clearing space, and Izuki answered "I'm finna run the Disk Cleanup utility…" over and over without running it. Two things went wrong together:
- **A promise in casual words wasn't seen as a promise.** Izuki already rejects "I'll do it now" with nothing behind it, but "finna", "gonna", "about to" and verbs like *running*, *clearing* or *deleting* weren't on its list, so the promise was accepted as a finished answer.
- **A held-back step was hidden.** Izuki only types terminal commands you spell out exactly, so it held back typing `cleanmgr`. It told the AI why, but you only ever heard the AI's next promise.

**What changed:**
- **Promises in any words count as promises:** casual ones ("finna", "gonna", "about to", "bout to", "imma", "fixing to") and more action verbs. A promise with no action behind it can't be the last word.
- **"Couldn't", "didn't" and "wasn't" count as refusals,** so an honest "I couldn't run that" is never mistaken for a promise.
- **A held-back step is said plainly.** If the last thing Izuki held back was never done, its final words say exactly what it didn't do and what to say instead. For example: "I didn't type that command into your terminal — I only run commands you spell out exactly. Tell me the exact command, or say what you want done (like “clear the safe stuff”)…". Final buttons and quizzes get their own plain lines.
- **Promising round after round without acting stops with the truth** ("I kept meaning to do it but couldn't find a way on this screen…") instead of "it's still loading".

**Where it applies:** every screen task from voice, chat, the Island, your phone and Discord, since they all go through the same agent loop.

**How it was checked:**
- Your exact reply ("since you said yes, I'm finna run the Disk Cleanup utility…") is now caught as a promise.
- "I couldn't run that" and "Done — cleared 1.8 GB" are not.
- The terminal hold-back is said in plain words, with no "finna".
- All 41 agent tests pass.

**Limits:** Izuki still won't type terminal commands you didn't spell out; that safety rule stays. For space, "clear the safe stuff" uses Izuki's own cleaner, which never touches your own files.

## 🔌 "It was doing something, then it stopped" — FL Studio setup that really happens
**The problem:** Izuki told you FL wasn't linked and to say "set up FL Studio". When you answered ("yes", or asked it to hook Izuki up in your own words), the request went to the screen helper instead of the built-in setup. The helper clicked into FL's Options → MIDI settings, found the list empty and stopped. The list was empty because the "Izuki" virtual MIDI port has to exist first, and no clicking inside FL can create it.

**What changed:**
- **"Yes" works.** When Izuki says FL isn't linked, it now offers the setup ("Want me to connect it now? Say yes"), and a plain "yes" runs it.
- **Asked for in any words:** "set Izuki up in FL", "hook it up in FL", "connect to FL Studio", "enable Izuki in FL's MIDI settings", "do the setup for FL", "pair Izuki with Fruity Loops", or a short "set it up" right after. Phrases about something *inside* FL ("link my sample to the grid", "connect the 808 to a mixer track") are left alone.
- **The screen helper never tries to wire FL up by clicking.** Before it touches FL, it checks the link, the same way TV requests always go to the TV. A setup request runs the real setup. An FL job (or a "yes"/"keep going" that would resume one) while FL isn't linked gets the honest answer and the offer.
- **The setup does the part clicking can't:** it puts Izuki's script into FL and makes the "Izuki" MIDI port with Windows' own MIDI tools. If those aren't installed, it installs them first (Windows may ask permission); this PC has the Windows MIDI service running but not the tools yet. Both installers were confirmed on winget. Then it tells you the one switch to flip in FL.

**Also fixed:** the cleanup line "Chrome and Edge was open, so I left its cache" now reads "Chrome and Edge were open, so I left their caches — close them and ask again to clear those too."

**How it was checked:**
- 10 different ways of asking for the link are recognised.
- Phrases that aren't asking for it are not: "link my sample to the grid in FL", "set the tempo up in FL", "disconnect Izuki from FL", "don't set up FL", "my studio setup in FL is messy".

**Limits:** after the setup, you still turn Izuki on once in FL (Options → MIDI settings); FL doesn't let other apps change its own settings.
