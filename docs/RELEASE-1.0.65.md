# Izuki 1.0.65

## Reliability

- Opening Izuki again activates the existing app. The Windows single-instance guard runs before microphone engines, background services and windows are initialized.
- Interrupted screen tasks are marked incomplete. Initial success claims require another screen observation; a promise such as “Opening it” does not qualify. This remains model-based screen verification, not a guarantee of error-free autonomy.
- Only completed runs can become saved flows. Learned recipes are still guidance, not verified replay.
- Groq action requests use a smaller output allowance. An oversized-output rejection can retry once at a reduced size; truncated plans are rejected. Model access errors no longer incorrectly claim the API key is bad, and exhausted screen models are not immediately resurrected.

## Updates

Automatic checks run shortly after startup and every six hours when enabled. They notify you without installing or closing Izuki. In **Settings → Updates**, choose **Check now**, download the signature-verified package, then install that exact version. Installation is blocked while a task is busy.

## Music drafts

Say or type **“make a 32 bar trap arrangement at 100 bpm in A minor”**. A fresh folder under **Music / Izuki Beats** contains `arrangement.mid`, its parameter/section plan and import instructions. Five MIDI tracks contain tempo/section markers, drums, bass, chords and melody. Choose 32 or 64 bars; drum loops support 1–32 bars. Files use unique names and are read back before success is reported. No existing project is opened or replaced.

Import the MIDI into a saved copy of your project and choose instruments. These are generated MIDI sketches, not sample arrangements or finished audio. Tempo and key are chosen settings, not measured from a recording. Live DAW listening and automatic timeline insertion are not implemented.

## Phone and TV

The paired phone can request a draft on the PC by adding **“on my PC”**; its PC-link help includes an example. TV pairing help points to PC update settings, and Roku's rotating suggestions include a PC draft request. Android and phone-cache versions advance with this release.

Character redesign, body collision/IK, static-face auto-rigging, verified recipe replay and broader task compilers remain future work.
