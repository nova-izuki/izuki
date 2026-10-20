# Izuki 1.0.155: honest about FL Studio, and "set up FL Studio" from the chat

## 🎛️ No more fake fixes in FL
**The problem:** you asked Izuki, more than once, to make your 808 notes flow with the beat, and said snapping to the grid makes it sound more off. Izuki said it would, then either pressed FL's **quantize** (snapping to the grid anyway) or did nothing. The log and your PC showed why: **Izuki had never been connected to your FL Studio.** Its controller script wasn't in FL's folder and the virtual MIDI cable didn't exist. Without that link, none of the by-ear jobs could run (lining up with your sample, tuning the 808). Requests fell back to the screen-clicking helper, whose only tool in FL is quantize.

**What changed:**
- **FL open but not connected:** any FL job (line up, tune, quantize, mix, add a part) now gets an honest answer instead of a fake attempt. Izuki says it isn't connected yet, explains that clicking FL's screen would only snap to the grid, and gives the one-time setup.
- **"Set up FL Studio"** (or "connect Izuki to FL") now works from the chat or by voice. It installs Izuki's FL script and the virtual cable, the same as Settings → FL Studio → Set up, and tells you the last step in FL's MIDI settings.

**How it was checked:** on your PC, FL's controller-script folder (in OneDrive Documents) had no Izuki entry and there was no virtual MIDI cable, which matches the log. Tests cover the setup wording ("set up FL Studio", "connect Izuki to FL") and things that aren't FL ("set up my flight").

**What you do once:**
1. Say "set up FL Studio", or use Settings → FL Studio → Set up.
2. Restart FL Studio.
3. In **Options → MIDI settings**:
   - under **Input**, pick **Izuki**, switch **Enable** on, set Controller type to **Izuki** and **Port 236**;
   - under **Output**, pick **Izuki** and set **Port 236**.
