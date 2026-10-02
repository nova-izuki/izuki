# Izuki 1.0.21 — voice recovery, device intent and easier updates

## Changed

- Phone companion and PC-hosted call pages recover from blocked audio with a visible **Tap to hear reply** button. Speech that never starts has a three-second start watchdog. The first replay utterance starts directly in the tap handler; unlocking sound no longer overwrites an existing reply. Saved mute settings are visible in calls. These fixes do not bypass iOS autoplay or background restrictions.
- Siri drafts in the native iPhone app retain spoken-reply intent when submitted. A draft still requires review and Send before an action runs.
- Explicit phone requests are checked before desktop shortcuts, named clicks, screen automation and remote account routing. An unavailable phone action cannot fall back to Windows. Ambiguous remote screen actions ask which device; repeat the full action with “on my PC” or “on my Android.” Paired Android actions require explicit Android intent. iPhone requests explain supported Siri boundaries instead of claiming PC actions fulfilled them.
- **Or type it** is always available at the top of Draw, ahead of the voice configuration cards. Existing glass styling and the default Liquid orb are preserved.
- Optional Clear water has steadier core motion and a continuous droplet phase when thinking finishes. It remains a lightweight visual approximation, not a physical ferrofluid simulation.
- Desktop Settings → Updates can check, download and signature-verify an update, then install only after explicit confirmation. Automatic checks run after startup and every six hours, can be disabled, and never install on a timer. Active screen work blocks installation. Izuki closes when the installer starts, so save drafts first. Updater signatures do not mean the Windows application is Authenticode-signed.
- The phone service worker caches only app-shell files, omits Siri query strings from cache keys, and no longer deletes unrelated caches. Native companions use bundled assets rather than registering a web service worker.

## Get and test

Download from [the website](https://nova-izuki.github.io/izuki/#download). Existing 1.0.20 users need this website update once; 1.0.21 includes the new in-app update controls for future releases. No application was installed or launched on the developer's PC.

1. On PC, find the input immediately under Draw. Try “open my phone”: Windows should not act. “Open Chrome on my Android” requires configured Android pairing.
2. On phone, start a call with media volume audible. Check Unmute if the call says voice is muted. If audio is blocked, **Tap to hear reply** appears inside the call, not behind it. On the PC-hosted call page, replay pauses the call; tap the orb afterward to continue.
3. Try Siri with Izuki both foregrounded and after switching apps. Browser audio can require a tap; reliable locked/background web calling is not guaranteed. Actual iPhone/Android audio hardware and Siri behavior still need device testing.
4. In Orb Studio, compare the optional water style during thinking and after it settles. The original default has not changed.
5. In desktop Settings → Updates, use Check now. On this release it should report current until a newer signed release is published. Installation is not exercised on the developer's PC.

Windows, Android preview APK and iPhone sideload test IPA are distributed through the same release. Android previews may require reinstalling if their debug signing key changes; preserve local data first. iPhone still requires signing/sideload renewal, not unrestricted free App Store distribution. Neither iOS nor Android offers unrestricted universal control here. Third-party AI/connectors can have quotas or fees.

Verification covers production build, phone/account/device routing, mocked browser audio refusals and stalled synthesis, voice text, Rust unit tests, HTML syntax, QR/pairing, fluid stability and installed headless-browser layout/media checks. This does not certify every requested feature or every physical device; the remaining roadmap stays in [COMPANION-DIRECTION.md](COMPANION-DIRECTION.md).
