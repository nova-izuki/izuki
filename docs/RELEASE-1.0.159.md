# Izuki 1.0.159: Izuki never tries to connect FL Studio by clicking

## 🔌 "I'm finna click that Enable button…" in FL's MIDI settings, again
**The problem:** on 1.0.158 you asked Izuki (in your own words) to get FL connected. The chat handed it to the screen helper, which went into FL's Options → MIDI settings and tried to click "Port" and "Enable". Your words didn't say "yes" or "FL", so the earlier guards didn't recognise it as being about connecting FL. And clicking there can never work: Izuki's MIDI port doesn't exist until the setup makes it. Every click was blocked (nothing in FL changed), but the setup never ran.

The earlier fixes each caught particular wordings. This one is a rule: **while FL isn't linked, Izuki never tries to connect it by clicking FL's MIDI window, whatever was said.**

**What changed:**
- **It knows what it just said.** If Izuki's last words were about connecting FL ("I'm not connected to it…", "…Options → MIDI settings…"), a short push from you runs the real setup. That covers "make it", "do it bro", "enable it", "connect it", "make it work" or "yea bro", even after Izuki restarts. The push has to be made of just those words, so "turn it up", "make it louder" and "open YouTube" don't count. Neither do questions, a "no", or your own gear ("enable my MIDI keyboard").
- **A backstop in the screen helper itself.** If it ever ends up in FL's MIDI settings window while FL isn't linked, it stops and offers the real setup ("Want me to connect it now? Say yes"). It checks this before every single click or keypress, so a run that opens the window and would click "Enable" straight after is stopped too. So is the quick "click X" shortcut. The window is matched by both its title and its owner (FL Studio's own process). Replays of saved flows are checked too. Helping with your own gear there (a keyboard, a controller) still works. Once FL is linked, the helper can also click in that window normally.

**How it was checked:** tests cover the pushes and not-pushes above, plus the earlier setup, yes and gear cases. Your log from 07:44 showed the exact path: the chat handed off, the helper opened FL's MIDI settings, and no guard caught it.

**Limits:** the setup still needs one switch in FL itself afterwards (Options → MIDI settings → Izuki), since FL doesn't let other apps change its settings.
