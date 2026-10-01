# Izuki 1.0.18 - native iPhone testing, without pretending it is the App Store

## iPhone testing IPA

- The release pipeline now builds an **unsigned iPhone test IPA** from the
  actual Capacitor iOS project and attaches it to the GitHub release.
- Testers can sign that IPA with their own Apple ID using AltStore Classic or
  Sideloadly. A free Apple ID signing profile expires after seven days and
  needs a refresh; this is a testing route, not a replacement for TestFlight.
- The native iPhone companion uses system reminder notifications with the
  device's selected default alert sound and haptic behavior. It never presents
  a fake phone call.

## Downloads

- Android remains a direct free APK download.
- Windows remains a direct free installer download.
- The website exposes the iPhone test IPA only for people who choose the
  sideload testing route and accept its Apple-imposed refresh limits.
