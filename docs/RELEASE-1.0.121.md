# Izuki 1.0.121: control any DAW by voice

FL Studio already had deep control. Now **Ableton Live, REAPER, Cubase, Studio One, Reason, Cakewalk, Pro Tools, Ardour, Bitwig, LMMS, Waveform and MPC** answer to:
- **"Record in Ableton"**, "start recording"
- **"Play the beat"** / "play the project" (play or pause)
- **"Stop the beat"**, **"stop recording"**
- **"Metronome on"**, **"loop it"**, **"go to the start"**
- **"Save the project"**, **"undo that"**

**How it works:** Izuki brings your DAW to the front, checks it really is in front (otherwise it presses nothing), and presses that DAW's **own default shortcut**.
- **Never a guess.** Where a DAW has no default key for something, Izuki says so instead of pressing a random key.
- **"Stop" never starts playback.** It uses a stop-only key where the DAW has one (numpad 0 in Cubase, Studio One and Reason). In DAWs where only Space plays and stops, Izuki tells you, rather than risk starting the beat.
- **"Stop recording" can never start a recording.**
- **A plain "play" or "pause"** still controls your music, as before. These studio commands only apply when a DAW is open or named.
- **Works from voice, the Chat tab, the phone and Discord.**
