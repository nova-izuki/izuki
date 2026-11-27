# Izuki 1.0.211: an update you can actually trust

## ⬆️ The phone updater now proves it worked

The old in-app update could open Android's installer and still leave you staring at "not updated". This build replaces that guess with a real check:

- The update card says **Izuki 1.0.211 is ready**, shows the release notes, and has a direct **Install update** button.
- The APK downloads with real progress, then is checked against GitHub's file size and SHA-256, the package name, the newer `versionCode`, the APK's own `versionName`, and the installed app's signer before Android's installer opens.
- A half-finished download is kept in a unique `.part` file and never handed to Android.
- When you come back, Izuki asks Android which version is installed. It only says **Updated** when that version really changed. If the installer was cancelled or blocked, it says so, keeps the retry, and links the Download page.
- Update checks retry when the network comes back, and refresh when you return after six hours.

## 📱 More ways to reach Izuki

- **Ask Izuki** in Android Quick Settings: one swipe and a tap opens the companion ready to listen.
- A one-tap phone dock for Home, Back, Recents, Notifications, Quick Settings, Screenshot and Power.
- The update card is one tap from the reminder banner, and the banner scrolls straight to it.

## 🔐 A safer wake hand-off

The exported launcher activity no longer accepts a wake phrase from any other app. The wake service, floating orb, Quick Settings tile and notification each mint a one-use token first. A second app can open Izuki, but it cannot make the assistant listen or inject words.

## 🧊 The glass site

The site now uses self-hosted Sora, Manrope and JetBrains Mono, an Earth WebP hero, real lofi photography, a clearer floating Task Stage, and readable glass labels on phones. The download links and search/social cards point at the current build.

## Checked before release

- Android APK build, web checks, hand-overlay, Windows, iPhone project integrity, coordinate and CodeRabbit checks pass.
- The Update Center was exercised in a real headless browser with a mocked native bridge: update card, release notes, install arguments, pending version, successful return and cancelled-installer message all pass.
- No physical Android phone was attached here. The installer handoff, Quick Settings tile and post-install check are CI- and browser-verified, not device-tested.

## If you are updating the phone app

Install `Izuki-Companion-Android-preview.apk` from this release, or use **Settings → App updates → Install update** in 1.0.210. Android may warn that this is a preview build; that is expected for the sideloaded companion.
