# Izuki 1.0.19 — clearer glass, grounded controls, better listening

## Desktop

- Layered glass cards and a local feature finder: **Ctrl+K** opens settings, apps, flows and phone pairing without an AI request.
- Apps search is now above the connector grid, with a clear button, result count, connected-only filter and consistent emoji icons.
- Optional **Clear water** orb: transparent centre, silver-blue reflections and merging droplets. The default Liquid orb is unchanged.
- Stops speaking internal mood markers such as `[calm]` and removes repetitive canned thinking acknowledgements. Your selected voice stays the same.
- Precision mode uses Windows accessibility element identities, fresh screen parsing, target boxes and a final recheck before a click. Changed or covered targets trigger a fresh look instead of a guessed click. Saved grounded flows replan from their request instead of replaying expired element IDs.
- Screen tasks verify the result after actions and don't record unexecuted steps as successes. This is accessibility grounding, **not a bundled OmniParser model**. Canvas-only controls may still need Mouse mode; no system can promise mistake-free automation.
- External media and Izuki-browser video are lowered during listening/speech, with separate ownership and recovery timeouts. Restore respects changes you made to the volume.
- Video lessons use visible captions, playback time and the video's actual screen bounds. Pause/resume targets the same video, avoiding accidental playback of a replacement video. The existing bounded follow mode checks roughly every 30 seconds, not continuous audio transcription. Works with supported HTML5 players in the Izuki browser; some embedded/protected players aren't accessible.

## Phone companion

- Glass header, composer and settings panels; small-phone navigation wraps instead of squeezing off-screen. Home and New chat remain easy to find.
- Actual Izuki icons for installed Android and iPhone apps.
- Native haptic test and a ten-second reminder test, with honest permission feedback. Notification sound/vibration follows your OS settings; this is not a phone call or a remote push service.
- iPhone-specific settings instead of misleading Android controls. An iPhone Shortcut can open `izuki://ask?q=URL-encoded-question` in the installed app as a draft for review. Use **Dictate Text → URL Encode → Text (prefix the link) → Open URLs** in Shortcuts.
- Android accessibility navigation remains opt-in: Home, Back, recent apps, notifications and Quick Settings. iOS does not allow general cross-app screen control; account access still needs a supported integration and your login/permission.

## Download and test

Use [the Izuki website](https://nova-izuki.github.io/izuki/) for the Windows installer, Android preview APK, iPhone sideload test IPA or web companion. The Android link now matches the release asset name. Downloads are free; AI/connector providers may impose limits or charges.

The iPhone IPA is unsigned for personal testing with AltStore Classic or Sideloadly, not an App Store/TestFlight release. Free Apple signing normally needs refreshing weekly. Android is still a debug preview; changing signing keys between preview builds may require reinstalling, which can clear local data. Back up anything important before replacing a preview.

Regression coverage includes speech sanitation, parser target identity, media restoration, same-video resume, phone navigation, native bridge behavior and responsive layouts. Real-device haptics, notification delivery and each connected account still need testing on your device. Nothing has been installed or launched on your PC as part of this update.
