# “Hey Nova” on Android — real-phone checklist

This is the check that cannot be done from CI. The APK build proves the Java
compiles and the manifest is valid; it does not prove Android grants the
microphone, keeps the foreground service alive, or hands audio to a call.

Use a debug or preview APK from the same commit you are testing. Keep the phone
unlocked for the first run, then repeat the lock-screen cases.

## 1. Permissions and first turn-on

- [ ] Install the APK and open Izuki. Go to **Settings → Phone**.
- [ ] With microphone permission denied, the wake row says **Microphone
      permission is off**, **Turn on** is disabled, and **Allow microphone** is
      shown. Toggle it: Android asks for the microphone, and after Allow the row
      refreshes.
- [ ] Deny the microphone once. The page says to allow it in Android settings
      and opens the Izuki app settings page. Allow it there, return to Izuki,
      and the row refreshes without restarting the app.
- [ ] With notifications denied, the row says **Notifications are off** and the
      button opens app settings. Allow notifications there and return.
- [ ] With both allowed, **Turn on** starts the listener. A persistent
      notification with a **Turn off** action is visible.
- [ ] Force-stop Izuki from Android settings. The listener stops and the
      notification disappears.
- [ ] Reopen Izuki, turn the wake word on, reboot the phone, and unlock it. The
      listener returns **only because it was left on**. Turn it off, reboot, and
      confirm it stays off.

## 2. Wake and lock screen

- [ ] Unlocked, say **“Hey Nova”** from a normal distance. The screen wakes (if
      dim), Izuki comes forward, and the microphone opens for the next command.
- [ ] Lock the phone, wait for the screen to turn off, and say **“Hey Nova”**.
      The screen wakes and the notification appears. The app must **not** open a
      task, tap, type or send anything over the lock screen.
- [ ] Unlock normally. Izuki should continue listening once, then return to the
      background. It must not replay the wake phrase or act twice.
- [ ] Say a complete command in one breath (“Hey Nova, open YouTube”). Confirm
      it does not lose the first word or run the command twice.
- [ ] Try a wrong phrase (“Hey Nore”) and normal conversation. It should not
      wake. The wake word is phrase recognition, **not a voiceprint** — another
      person saying “Hey Nova” can wake it. That is a known limit.
- [ ] On a phone that blocks background activity launches, confirm the
      notification is still posted and the app explains that unlock + tap is
      the fallback. Do not describe this as a failure of the lock bypass; it is
      Android's restriction.

## 3. Microphone hand-off during a live call

- [ ] Turn the wake word on. Start a live Izuki call from the app. The wake
      service pauses; the live call gets the microphone immediately.
- [ ] End the call. The wake listener resumes, and the persistent notification
      returns without a second toggle.
- [ ] Start a live call and background the app during it. The wake service must
      stay paused for the whole call.
- [ ] If pause fails (for example Android refuses the background start), the
      app stops the service and shows a message. The call still gets the
      microphone; ending the call turns the wake word back on. Verify this by
      revoking the microphone while a call is active, or on a phone that
      aggressively restricts background starts.
- [ ] While the wake word is on, play music and say “Hey Nova”. The listener
      should not permanently duck or stop the music; the phone sound panel's
      optional ducking is a separate setting.
- [ ] Start a call, then toggle the wake word off before ending the call.
      Ending the call must not silently turn it back on. (Current fallback
      restores it if the app stopped it for the call; report if that feels
      surprising.)

## 4. Sound panel and other phone features

- [ ] **Settings → Phone → Sound** shows Media, Ring and Alarm. Move each slider
      and confirm Android's volume panel agrees.
- [ ] Enable audio-focus ducking; play music, then have Izuki speak. Music
      lowers and recovers. Disable it and confirm music no longer ducks.
- [ ] Run **Autopilot → self-test** with the phone unlocked. It should complete
      without touching a real app. Lock the phone mid-test; it waits, then
      resumes after unlock.
- [ ] Open a real app and ask for a harmless action (for example “open
      Settings”). Watch it ask before anything final and stop on **Esc** / the
      on-screen stop.
- [ ] Turn on airplane mode. Wake should still wake the screen and show the
      notification; cloud answers should fail with a readable message, not a
      crash.

## 5. What to attach to a bug report

- Phone model, Android version, and whether the OEM is aggressive about
  background apps (Xiaomi, Samsung, Oppo, vivo, etc.).
- The exact row text in **Settings → Phone** and whether Android showed a
  permission dialog.
- `adb logcat -s IzukiWakeService IzukiControl` around the failure, if adb is
  available. Remove anything personal first.
- Whether the app was locked, backgrounded, force-stopped or freshly booted.

## Follow-up ideas (not built yet)

These are deliberately small and safe; none should bypass the lock screen.

1. **Voiceprint opt-in** — verify the enrolled speaker before acting, using an
   on-device embedding. Keep phrase-only mode as the default for accessibility.
2. **Headset and Bluetooth button** — treat a headset media button as a
   push-to-talk trigger, with the same lock-screen rules.
3. **Battery-adaptive listening** — pause the hotword on battery saver or below
   a chosen percentage, and say so in the notification.
4. **Notification quick actions** — “Talk”, “Stop listening”, and “Open
   settings” directly on the persistent notification.
5. **Per-app hand-off rules** — let the owner choose which apps may take the
   microphone, and always release it for phone/video calls.
6. **Wake phrase picker** — a short list of phrases with a test button, instead
   of a fixed string.
7. **Offline-only mode** — use Android's on-device recognition where available,
   and label clearly when audio leaves the phone.
8. **Wear OS / earbuds later** — a separate surface, not a reason to weaken the
   phone lock-screen rule.

## Current limits

- The wake phrase is not speaker-verified.
- Android may block an app from opening over the lock screen; the notification
  is the intended fallback.
- The preview APK is not on an app store; updates come from GitHub releases.
- CI builds and packages the APK, but only a physical phone proves microphone,
  notification, lock-screen and call hand-off behavior.
