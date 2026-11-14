# Waiting for the next release

Codex and Freebuff: add one line per change you pushed. Write it in plain
words for the owner, and put your name in brackets. Claude moves these lines
into the next `docs/RELEASE-x.y.z.md` when it releases, then clears this list.

- [Freebuff] Android: an optional “Hey Nova” wake word. It shows a persistent listening notification, wakes the screen when it hears you, never unlocks the phone, and hands a locked wake back to you after unlock. (Native service + Android “user present” signal.) The toggle now checks microphone and notification permission first and stays off with a clear way to fix each one.
- [Freebuff] Android: a live call pauses the wake listener; if the pause fails, Izuki stops the listener for the call and turns it back on afterwards, so the call always gets the microphone.
- [Freebuff] Docs: a real-phone checklist for the wake word, lock screen, call hand-off and sound panel, plus follow-up ideas. CI builds the APK, but only a physical phone can prove those Android behaviors.
- [Freebuff] Website: canonical home is now **izukinova.ai** (with `izukinova.com` and `www.izukinova.ai` redirecting there), plus a safe interactive Android wake-word preview, refreshed SEO URLs and a 404 page.
- [Freebuff] Android: a Phone sound panel for media, ring and alarm, plus an optional “duck other audio while Izuki talks” switch that uses Android audio focus — it never mutes another app permanently.
- [Freebuff] Phone: Autopilot now opens from Home, Settings or a typed “autopilot …”, pauses visibly when the phone locks and continues after unlock. Added a safe self-test that only taps its own on-screen targets, so real gestures can be tried without touching another app.
- [Freebuff] Website: the cinematic Earth/glass hero is back, centred and rebuilt for phones; the orb is the centrepiece again, the pearl-glass buttons and card system replace the flat grey pass, and a new interactive Task Stage section shows the real stage shape. The page still checks updates automatically and links only signed installs.
- [Freebuff] Desktop: a compact Task Stage now floats below the Island while a real screen task is running. It shows the live step, Pause after step, Resume, Take over and Stop, and says plainly that it is a view of the real desktop — not a sandbox. It is hidden when no task is running.
