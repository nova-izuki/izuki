# Izuki 1.0.131: FL Studio co-producer, phases 2–5

The drums came first in 1.0.86. Now Izuki can add an 808 and melodies, fix timing, balance levels, and make an intro or fill. It still works through FL's own scripting, not the mouse, so it's exact, and every change is one Ctrl+Z.

**Where FL's scripting stops, Izuki says so** rather than pretending:
- Controller scripts can write **one note per step** in the Channel rack. They can't write chords or long notes into the Piano roll.
- They can't **add effects**.
- They can't **place patterns in the Playlist**.

## 🎹 "Add an 808" · "Add a melody"
- **Where it goes:** the channel you've selected in the Channel rack, if it plays notes. Otherwise a channel named for the job: 808 / bass / sub, or keys / lead / pluck / synth / FLEX / Sytrus… It never puts notes on a drum sound. With no instrument, Izuki tells you to add one.
- **In key:** the genre's usual key (trap F minor, afrobeats A minor, amapiano D minor…), or say **"in C minor"** / **"in G major"**.
- **The 808 follows the kick** on the root; its last note moves up to the 5th, and the one before it drops to the minor 7th below (the major 6th in a major key).
- **The melody** uses the genre's rhythm and the scale, starts and ends on the root, and is new each time you ask.
- **Your notes are safe:** if that channel already has notes in this pattern, Izuki asks first ("say 'replace the 808'"). Ctrl+Z brings the old ones back.
- It reads the notes back from FL before saying they're there, then plays.

## ⏱️ "Fix the timing on the hats"
Uses FL's own **Quick quantize** on the sound you name ("the hats", "the 808") or the one you've selected.

## 🎚️ "Balance the mix"
Sets channel levels and a little panning by role:
- Kick and 808 up front.
- Claps and snares just under.
- Hats and percussion softer and slightly to the sides.
- Melodies in the middle.

It goes by channel names, so channels it can't identify are left alone. EQ and compression are still yours.

## 🎬 "Make an intro" · "Make a fill"
Izuki reads your current drums from FL and makes a new pattern:
- **Intro:** no kick, lighter hats, to build up.
- **Fill:** the same bar with a snare roll on the last beat.

Drag it into the Playlist where you want it.

## Updating the FL script
These need a newer Izuki script in FL. The first time you ask, Izuki puts it in place and asks you to **close and reopen FL Studio once**.

## Tested
Unit tests check that every melody stays in key, in the bar and in range, starting on the root; the 808 starts on the root; and the requests, keys and channel names are understood. **Not tested live in FL Studio on this PC.** That needs FL open with the cable set up, and I didn't want to edit your open projects. Try "add an 808" on a beat and tell me how it sounds.
