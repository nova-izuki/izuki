# Izuki 1.0.20 — marked clicks, reliable stopping and fluid motion

## Fixed

- Ctrl+D's local click path now identifies a real accessible control inside the mark and retains its identity for the final pre-click check. Overlapping or ambiguous targets are refused instead of snapping to a nearby answer. An explicit single-mark “click here” skips unnecessary OCR/model work. Page text under a pen mark is no longer treated as a user instruction.
- Escape immediately raises the stop flag, has a focused-window fallback, and remains effective across draw preparation and model handoff. Queued clicks retain their original task ID, so a new request cannot revive a cancelled task. The click loop checks stop again after its timing delay.
- Calling/pairing QR codes have fixed, integer-sized pixels and cannot shrink in their layout. Both actual rendered codes are decoded in the regression suite. The phone validates copied/scanned links and makes a read-only connection check with an eight-second timeout and useful error feedback.
- Turning off Call Izuki rejects new requests to its local endpoint. Keep private links secret: they grant PC access. Temporary tunnel addresses change on restart, so scan the current QR when an old link stops working.
- Updated vulnerable transitive image/UUID dependencies. `npm audit` reports zero known vulnerabilities at release preparation; this is not a guarantee against undiscovered security issues.

## Appearance and phone

- The default **Liquid** orb is unchanged.
- Optional **Clear water** now uses a connected spring/metaball surface: sound deforms it, thinking separates droplets, and it settles/merges afterward. This is an original visual approximation, not a physical ferrofluid simulation.
- Optional **Star crystal** and **Tidal pearl** replace the old constellation/ripple looks while preserving saved preference identifiers.
- **Orb Studio** previews resting, thinking and voice motion on light/dark surfaces without using a microphone or AI credits. Optional-style motion intensity is adjustable. On PC, Ctrl+K → Orb & appearance; on phone, Settings → orb settings.
- Phone generated PCM WAV replies drive optional orb motion from their actual amplitude. OS speech without an exposed waveform does not pretend to provide accurate audio synchronization.
- Offscreen/hidden orb rendering pauses; reduced-motion preferences are respected. Phone sheets/messages use short glass-panel transitions, not continuous background effects. No claim of zero battery usage or universal frame rates.

## Download and test

Get Windows, Android preview APK, iPhone sideload test IPA, or the web companion from [the website](https://nova-izuki.github.io/izuki/). No Izuki application was installed or launched on the developer's PC for this update.

1. Update the PC, enable **Call Izuki from your phone**, and scan its newly displayed QR. **Link the phone app** opens the web companion and checks reachability; it does not install or automatically pair a separate native app. In the native app, paste the full private link in PC settings and save/check it.
2. Try Ctrl+D with a small circle around one harmless button and “click here.” Test Escape during planning and action. When accessibility cannot identify the target, the new local path intentionally declines the click; it cannot fix every canvas-only or restricted application.
3. Try optional orb styles and their silent previews. The original default remains available.

The iPhone IPA still needs personal signing/sideloading and periodic renewal; it is not a TestFlight/App Store release. Android remains a debug preview, and changing preview signing keys may require reinstalling; back up important local data first. Downloads are free, while AI/connector services can impose charges or limits. iOS does not permit unrestricted cross-app control.

Verification includes Rust regression tests, production web build, phone routing/native-bridge tests, voice sanitation, rendered QR decoding, pairing failures, waveform parsing, fluid stability, and real-browser layout/media tests. Actual phone cameras, haptics, notifications and the user's specific Chrome training page still need device testing. This release does not claim every bug is fixed; remaining companion work is tracked in [COMPANION-DIRECTION.md](COMPANION-DIRECTION.md).
