# Izuki 1.0.153: your 808 in tune, by ear

## 🎚️ "Tune the 808": heard, fixed and checked
**The problem:** an 808 that's on time can still not flow with the beat, because its **sound** is out of tune. A sample recorded a little sharp or flat makes every note sit between notes, fighting the beat's key. No amount of quantizing or nudging fixes that. A producer hears it and turns the channel's pitch knob.

**What changed:** say "tune the 808", "my 808 is out of tune with the sample" or "the 808 sounds off key", and Izuki:
1. **Plays your 808 on its own.** It uses the pattern, or Song mode if the pattern is silent. Your mutes and mode go back as they were.
2. **Measures the real pitch of every hit.** It listens on the sustain, after the first moments where an 808 "drops" into its note.
3. **Decides like a producer:**
   - **Every hit off its note by the same amount** (say +28 cents): that's the sample's own tuning. Izuki sets the channel's pitch knob to cancel it.
   - **Notes off by different amounts:** that's slides or a deliberate choice, not the sample. It **leaves it alone** and says so.
   - **Within 8 cents on average:** already in tune, so nothing is changed. It tells you the average and how far the furthest note was.
   - **No clear notes** (too short, heavily distorted, nothing playing): it says it couldn't tell, and changes nothing.
4. **Checks its own fix.** It plays the 808 again and measures again. It keeps the new setting only if the shared offset is gone (within 8 cents on average, with no note further out than the ±15 cents detection allows). Otherwise it puts the knob back exactly as it was. It tells you the old setting so you can return to it.

**Lining up also notices tuning:** when "line my 808 up with the beat" hears the same offset on every hit, it says so and offers "tune the 808".

**How it was checked:** made-up 808s with known pitch (G1, 28 cents sharp):
- clean, distorted, dropping into the note, and dropping plus distorted: each read within 4 cents;
- a pattern of five different notes from the same detuned sample: the shared +28 found;
- notes off by different amounts: left alone;
- offsets either side of the halfway point between notes (+48 and −49): handled;
- noise and silence: no pitch claimed.

The request wording is in the tests too: "pitch the 808 up an octave" isn't taken as tuning, and "fix the timing" still lines it up.

**Limits:**
- FL's pitch knob only reaches as far as the channel's pitch range (usually ±2 semitones), plenty for tuning.
- If a plugin on the 808's mixer track changes its pitch, the check after shows that, and the knob is put back.
- Restart FL once after this update (Izuki updates its FL script).
- Not yet tried inside FL itself.
