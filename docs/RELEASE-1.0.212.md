# Izuki 1.0.212: Eye Control settles where you look

## 👁️ Eye Control, steadier

- A look at a toolbar's empty space now settles on the nearest real button, never on the toolbar itself. Only controls you press, pick or type into can be chosen.
- A look that drifts slowly is a new look. Movement is measured from where the gaze actually settled, so a lock cannot ride along to another control.
- Only one control walk runs at a time. A look that lands during a walk uses the last list instead of starting a second one.

## 🧊 The site opens its eyes

- The homepage opens with the eye-blink: a closed eye, a line of light, then the page. It waits for the page, plays once, and is skipped for deep links and reduced motion.
- Chat demos answer in Nova's recorded voice and can return a draft, a shaped week, worked math steps, a due list or a reminder card.
- The floating quiz answers explain themselves; choosing and submitting stay with you.
- Six new posters, updated screenshots, richer search metadata and the “Izuki Nova” name are live at [izukinova.ai](https://izukinova.ai/).
- The Android over-apps orb now draws the same liquid glass orb as the phone app, site and PC, instead of a flat glowing dot.

## 📱 Phone updater from 1.0.211

This build keeps the verified updater: APK size, SHA-256, package, version, signer, real progress, release notes and a post-install version check. It installs over 1.0.211 because the Android `versionCode` is now 212.

## Checked before release

- Browser, phone, Eye Control, HTML, TypeScript and production build checks pass on main.
- The Android APK, iPhone project, web, Windows, coordinate and CodeRabbit checks passed on the merged PRs.
- No physical Android phone was attached here. The installer handoff, Quick Settings tile and post-install check remain CI-verified, not device-tested.

## If you are updating the phone app

Use **Settings → Phone → App updates → Install update** on 1.0.211, or install `Izuki-Companion-Android-preview.apk` from this release. Android may warn that this is a preview build; that is expected for the sideloaded companion.
