# Izuki phone checklist (1.0.212)

This is the acceptance pass for the Android companion. CI proves the APK
compiles and that the JavaScript tests pass; it does not prove Android grants
permissions, keeps a service alive, draws the over-apps orb, or installs an
update. Run this on a real phone before calling a phone release verified.

Record the APK's SHA-256 first. A debug build from a different commit is not
the build being tested.

- Build: `1.0.212` / versionCode `212`
- APK:
- SHA-256:
- Phone / Android / OEM:
- Tester / date:

## Pass rules

- A section passes only when every required box is checked, or is marked N/A
  with a reason. A CI run, emulator, or screenshot from another build is not a
  phone pass.
- Do not uninstall the app to make an update work unless you accept losing its
  data and pairing. Capture the failure first.
- If a step fails, stop and attach the evidence listed at the end. Do not
  describe the feature as working because the code built.

## 10-minute smoke

- [ ] Install 1.0.212 over the existing app. It opens without a crash and
      **Settings → Phone** shows `1.0.212`.
- [ ] The existing PC pairing still works; no re-pair was needed.
- [ ] Enable Android control, then say “go home” and “go back”.
- [ ] Enable the over-apps orb. It appears over one other app and tapping it
      returns to Izuki.
- [ ] Add **Ask Izuki** to Quick Settings and wake it once from another app.
- [ ] Run **Autopilot → self-test**; it finishes with its Stop control present.
- [ ] Ask Nova to speak; sound starts, and Mute/Stop stops it immediately.

If any smoke item fails, the full pass does not start.

## 1. Update from 1.0.211 (the important one)

Use the installed 1.0.211 build. Do not download the new APK by hand for this
section.

- [ ] **Settings → Phone → App updates** finds 1.0.212 and shows the APK size,
      version and release notes.
- [ ] The displayed file size is about 46 MB and the SHA-256 shown (if shown)
      matches the published release.
- [ ] Download starts and real progress is visible. Backgrounding the app does
      not make it claim success instantly.
- [ ] Cancelling the install prompt leaves the app on 1.0.211 and usable. The
      app does **not** say the update was installed.
- [ ] Start again and complete the install. Android's installer opens; the
      preview-build warning is expected.
- [ ] Return to Izuki. The installed version is now `1.0.212`; it is not still
      reporting `1.0.211`.
- [ ] No data was lost: chats, reminders, settings, face/orb choice and PC
      pairing are still there.
- [ ] The updater now says the installed version is up to date.
- [ ] Reboot the phone and confirm it still opens on 1.0.212.

Repeat at least once from 1.0.210 if that build is available. If only 1.0.211
is available, record that 1.0.210 was not tested.

### Direct APK path

- [ ] Download the APK from izukinova.ai or the GitHub release in the phone's
      browser. The file is complete (no 0-byte or HTML error page).
- [ ] Android accepts it over the installed preview only when the signer is the
      same. A signature-mismatch error is a release blocker.
- [ ] The installed version changes to 1.0.212 and the app opens.

## 2. Permissions and service health

Open **Settings → Phone** once per row.

- [ ] Android control off: the row explains what is off and opens the correct
      Android Accessibility settings page.
- [ ] Enable it; the service stays enabled after leaving and returning to the
      app.
- [ ] Overlay permission off: the orb row explains it and opens the correct
      app-level “display over other apps” page.
- [ ] Microphone denied: voice and wake rows explain it and offer the right
      settings page. Allow it there; the row refreshes without a restart.
- [ ] Notifications denied: the wake row explains it and opens app settings.
      Allow it and return; the row refreshes.
- [ ] Battery optimization / background restriction: the app explains what
      Android may do and links to the right setting. Change it, force-stop the
      app, reopen, and confirm the UI reflects the current state.
- [ ] TTS: Nova speaks through the phone's selected engine. Changing the
      system TTS engine does not crash the app.
- [ ] Revoke the microphone while Izuki is in the background. Reopen it; the
      UI says voice is unavailable rather than silently doing nothing.

## 3. Over-apps liquid orb

- [ ] Turn the orb on in **Settings → Phone**. A system overlay permission is
      requested if needed.
- [ ] Open Photos, Maps and one other app. The orb stays visible above them
      and is not clipped by the status or navigation bar.
- [ ] The orb is the liquid-glass orb, not a flat glowing dot. It animates
      smoothly and does not flicker or leave a trail.
- [ ] Tap the orb from another app; Izuki comes forward and the orb does not
      swallow the tap.
- [ ] “Take me to …” opens Google Maps turn-by-turn directly when Maps is
      installed; with no Maps, it gives a readable fallback.
- [ ] The orb is not shown over the lock screen, password fields, the Android
      permission dialog, or another app's secure screen.
- [ ] Turn the orb off; it disappears immediately. Reboot; it stays off.
- [ ] Leave it on for 10 minutes over a normal app. Check battery use and
      whether Android killed it. Record the OEM's behavior.

## 4. Quick Settings tile

- [ ] Swipe down twice, edit the tiles, and add **Ask Izuki**. The label and
      icon are readable.
- [ ] With Izuki closed, tap the tile from the home screen. Izuki opens and is
      ready to listen.
- [ ] Tap it from inside another app. It returns to Izuki without losing the
      other app's state.
- [ ] Lock the phone, wake it, and tap the tile. It must not perform a task,
      tap, type or send anything over the lock screen.
- [ ] Disable Android control. The tile says control is off instead of opening
      a dead microphone.
- [ ] Long-press the tile (if Android offers it) and confirm it opens the
      relevant Izuki setting, not a blank page.

## 5. Wake word, voice and calls

Run the full [“Hey Nova” real-phone checklist](PHONE-WAKE-CHECK.md) for the
wake word, lock screen and microphone hand-off. At minimum:

- [ ] “Hey Nova” wakes from another app and does not trigger on a similar
      phrase.
- [ ] A locked wake shows the notification and never performs an action.
- [ ] A live call gets the microphone; the wake listener resumes after the
      call without a second toggle.
- [ ] Music ducks only when the optional ducking setting is on, and recovers
      afterward.
- [ ] Bluetooth/headset audio still plays Nova's reply through the expected
      route.
- [ ] Mute and Stop stop audio immediately; a second tap does not restart it.

## 6. Autopilot and drive mode

- [ ] **Autopilot → self-test** taps only Izuki's own test targets and finishes
      without opening a real app.
- [ ] Lock the phone during the self-test. It pauses visibly, then resumes
      after unlock; it does not tap through the lock screen.
- [ ] Ask for a harmless action in a real app (“open Settings”). It shows each
      step and has one clear Stop.
- [ ] Ask for a Send/Pay/Delete-style action. It refuses or asks before the
      final control; it does not silently complete it.
- [ ] Press Stop (and Esc if a keyboard is attached). The current step stops
      and no later step runs.
- [ ] A password field is never read aloud, logged or typed into by the screen
      reader.
- [ ] Drive mode opens with large controls and readable contrast. “Take me
      home” / “take me to …” opens Maps navigation without sending a message
      or buying anything.
- [ ] Rotate the phone and increase the system font size. No control is cut
      off or unreachable.

## 7. PC pairing and cross-device state

- [ ] Pair with the PC using the current on-screen flow. The code expires and
      cannot be reused.
- [ ] Send a simple command from the phone; the PC receives it once, not twice.
- [ ] Put the phone on a different network from the PC. The app gives a clear
      “can't reach the PC” message instead of a fake success.
- [ ] Update one side only. The app warns about a version/protocol mismatch
      rather than sending commands the other side cannot understand.
- [ ] Revoke the pairing from the PC. The phone loses access after reconnect.

## 8. Failure and edge cases

- [ ] Airplane mode: opening the app, reading cached conversations and using
      local controls do not crash. Cloud actions fail with readable text.
- [ ] Poor network during an update: the download does not report a completed
      file; retry works.
- [ ] Low storage: the updater refuses before downloading and explains how
      much is needed.
- [ ] Battery saver / low battery: the wake listener and orb behave as the
      settings promise. Record anything Android kills.
- [ ] Force-stop Izuki, then reopen. Services return only if they were left
      enabled.
- [ ] Reboot, unlock, and reopen. No duplicate persistent notifications, no
      duplicate orb, and no automatic task.
- [ ] Change dark/light mode, display size and font scale. Text remains
      readable and buttons remain reachable.
- [ ] Grant, deny and re-grant permissions in different orders. No permission
      loop or dead-end screen.

## 9. Evidence to attach to a failure

- Phone model, Android version and OEM skin (Xiaomi/HyperOS, Samsung One UI,
  Oppo/ColorOS, vivo, etc.).
- Installed version and versionCode before and after the failure, plus the
  APK SHA-256.
- The exact **Settings → Phone** row text and which permission dialog
  appeared.
- Screen recording of the update or orb failure, starting before the tap.
- `adb logcat -s IzukiControl IzukiWakeService` around the failure, with
  personal data removed.
- Whether the phone was unlocked, locked, backgrounded, force-stopped or
  freshly booted.
- Whether the app was installed over an older build, and its previous version.

## Sign-off

| Section | Result | Evidence / notes |
| --- | --- | --- |
| 1. Update |  |  |
| 2. Permissions |  |  |
| 3. Orb |  |  |
| 4. Quick Settings |  |  |
| 5. Wake / voice / calls |  |  |
| 6. Autopilot / drive |  |  |
| 7. PC pairing |  |  |
| 8. Edge cases |  |  |

Do not mark the phone release verified until every required row is checked
and the APK hash matches the published release.
