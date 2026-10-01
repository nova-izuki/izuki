# Izuki 1.0.16 — a real companion home and natural liquid

This release makes the phone companion feel like an app someone reaches for,
not a settings page in disguise.

## Phone companion

- **Home** is now always one tap away and keeps the active conversation safe.
- **New Chat** immediately clears the current conversation and returns to Home.
- Home includes a privacy/reminder/PC status glance and shortcuts for planning,
  learning, creating, reminders and connected accounts.
- Connected-app search no longer sends a fresh network request on every typed
  letter; it filters instantly and only checks connections when needed.
- The Living Liquid orb was rebuilt as an irregular, glassy pool with slow
  satellite drops that gather when Izuki speaks. The original Liquid Glass orb
  remains the default.

## Actual phone app delivery

- The Android companion APK is built on every tagged release and attached as
  **Izuki-Companion-Android-preview.apk**. It is free to download from the
  release page and is clearly labelled preview because it uses Android's debug
  signing for direct testing.
- The iPhone Capacitor project continues to be validated. A public iPhone IPA
  needs Apple signing and distribution credentials; until then, the free PWA
  installs from Safari's **Add to Home Screen** and supports the Siri handoff
  instructions in Settings.

## Checks

- Real-browser coverage now tests Home, Resume Chat and New Chat.
- Existing web, phone routing, account safety, and native bridge checks remain
  part of the release gate.
