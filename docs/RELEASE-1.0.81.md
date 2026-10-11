# Izuki 1.0.81: lighter on your PC, steadier answers

A full recheck for bugs and lag before the next features. Everything found is fixed here.

## Less CPU, all the time
- **The Island pill is still again.** The compact pill's waveform was redrawing the whole screen 60 times a second while music played, even when nothing changed on it. Now the pill holds still. The waveform moves only when the Island is open, at a smooth 30 frames a second.
- **The music meter only listens while the Island is open.**
- **The background glow in the Izuki window pauses** when the window is hidden or in the background.

## Fewer waits for an AI that isn't there
- **9Router and other AIs on this PC:** if one isn't running, it's skipped straight away. Before, only Ollama was checked, and a port that was open but never answered still counted as running. Now it has to actually reply.  When you are offline, Izuki still uses them.
- **A model your key can't use at all** ("denied access to model") rests for a day instead of ten minutes, so it stops slowing every request.
- **The sharp-eye second look** now runs once, on the plan Izuki is actually going to use, instead of on every AI's answer in the race. It also skips clicks that are already tied to a known button.

## Smaller fixes
- **Auto skip ads** looks every 5 seconds instead of 2, and rests 15 seconds after a skip.
- **A camera picture never pushes out** a picture you already attached in Chat. Four is the limit.
- **What's New:** the Ink entry now says "make your style ink".

## Reviewed
CodeRabbit reviewed everything since 1.0.80: 8 findings fixed.
