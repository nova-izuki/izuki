# Izuki 1.0.99: beats for any producer app

Izuki already made beats as MIDI files, but it only knew FL Studio. Now it works with whichever producer app (DAW) you use.

## It knows your producer app
Say "make a trap beat", "make an afrobeats loop in Ableton" or "drill beat on REAPER". Izuki uses the app you named or, if you didn't name one, the one that's open. It knows these:
- Ableton Live
- FL Studio
- REAPER
- Studio One
- Cubase / Nuendo
- Bitwig Studio
- Cakewalk
- Pro Tools
- Reason
- LMMS
- Waveform
- Ardour
- MPC

## Ready to drag in
- **How to import:** Izuki tells you exactly how to bring the beat into that app. For example, in Ableton you drag the .mid file into Arrangement View; in Cubase it's File, then Import, then MIDI File.
- **The file, ready:** it opens the folder with the new file already selected, so you just drag it in.
- **Your project is safe:** Izuki never opens the file in your producer app itself, because that could replace the project you have open.

## Reviewed
- **Tests:** 4 new tests, 257 Rust tests in all, all passing.
- **CodeRabbit:** 2 findings fixed (punctuation after the app's name, and each request now shows its own file).
