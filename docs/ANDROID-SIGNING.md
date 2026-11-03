# Android signing: preview and production

## Where things stand

- **Preview builds**: the APK on the website and in each GitHub release. They are signed with `android/app/izuki-preview.p12`.
  - That key and its password are **public** (they're in `android/app/build.gradle`).
  - Anyone can sign an APK as the Izuki Companion. Android would accept it as an *update* over a user's installed preview app, and it would inherit that app's data, including the PC pairing.
  - The key was kept in the repo on purpose: one fixed key lets every new preview install over the old one. Changing it needs care (below).
- **Production builds** (a store release) are signed only with a key from the environment, never from the repo. Without one, the release build stays unsigned. No production key exists yet.

## What the build does now (no change until a secret is added)

| Build | Signed with |
| --- | --- |
| Preview (`assembleDebug`, CI and website) | **Path A (chosen 2026-11-03):** the public key in the repo, then re-signed so it vouches for the private key in the GitHub secret `IZUKI_PREVIEW_KEYSTORE_B64` (repository variable `IZUKI_PREVIEW_ROTATION=yes`). Without the secret, the public key alone, as before. |
| Release (`assembleRelease`) | Only `IZUKI_RELEASE_KEYSTORE` (+ password, alias and key password variables). Otherwise unsigned. |

`mobile.yml` decodes the secret into the runner's temp folder, outside the checkout, and the log says which key signed.

## Moving previews to a private key

Android only installs an update signed by the same key as the installed app, so the switch needs one of two paths. The app supports Android 7.0+ (`minSdkVersion` 24, see `android/variables.gradle`).

**Adding the key secret alone does nothing harmful:** CI refuses to build with a new key unless one of the paths below is chosen, with the repository variable `IZUKI_PREVIEW_ROTATION=yes` (path A) or `IZUKI_PREVIEW_NEW_KEY_OUTRIGHT=yes` (path B). Without that check, one secret would have silently stopped every installed phone from updating.

### A. Key rotation: no reinstall on Android 9+ (chosen by the owner, 2026-11-03)

APK Signature Scheme v3 lets the old key vouch for a new one (a "lineage").

**Done:**
1. The new key was made on the owner's PC (RSA 4096, valid until 2054) and kept in the git-ignored `.private/android/` folder, with a note on backing it up. Certificate SHA-256: `B9:FC:1E:3D:FB:AF:B9:39:92:69:B8:A7:A8:BA:01:36:4A:4E:51:B6:95:E7:0A:6D:99:B0:79:F3:C4:DD:9F:3E`.
2. **Waiting on the owner:** CI's copies go in the secrets `IZUKI_PREVIEW_KEYSTORE_B64` and `IZUKI_PREVIEW_KEYSTORE_PASSWORD`, with the variable `IZUKI_PREVIEW_ROTATION=yes`. Writing GitHub secrets needs the owner's own action: run `.private/android/add-key-to-github.ps1` (right-click → Run with PowerShell). Until then nothing changes: the public key signs, as before.
3. `mobile.yml` signs with the old public key as before, then re-signs:
   - `apksigner rotate --out izuki-lineage --old-signer --ks izuki-preview.p12 … --new-signer --ks izuki-preview-2.p12 …` makes the lineage. Both keys are at hand in CI, and the lineage holds no secret, so it's made fresh each build.
   - `apksigner sign --ks izuki-preview.p12 … --next-signer --ks izuki-preview-2.p12 … --lineage izuki-lineage --rotation-min-sdk-version 28 app-debug.apk`. The old key comes first. Without `--rotation-min-sdk-version 28`, apksigner would use the new key only on Android 13+.
   - The old key keeps no rollback right (apksigner's default), so once a phone has the new key it refuses updates signed only with the public one.
4. **Proven before any phone gets it:** the job `android-rotation-check` runs `tools/android-rotation-check.sh` on an Android 11 emulator. Today's app installs and holds data, the rotated update installs over it and keeps that data, and then an APK signed only with the public key is refused (`INSTALL_FAILED_UPDATE_INCOMPATIBLE`). The APK is attached to a release only after that check passes, so a failure leaves the release a draft.

**What phones see:**
- Android 9+ phones move to the new key on their next update, and from then on refuse APKs signed only with the public key.
- Android 7–8 phones keep validating the old signature: they still update, but stay exposed until they reinstall.

### B. New key outright: everyone reinstalls once

1. A new key in the two secrets above, plus the repository variable `IZUKI_PREVIEW_NEW_KEY_OUTRIGHT` = `yes` (GitHub → Settings → Secrets and variables → Actions → Variables), instead of `IZUKI_PREVIEW_ROTATION`.
2. Every user must **uninstall** the preview app and install the new one. Android refuses the update otherwise. Uninstalling clears the app's data, so they pair their PC again.
3. Say so in that release's notes and on the website's download section.

### Either way

- The public `izuki-preview.p12` stays in the repo while path A runs: CI needs it to vouch for the new key. It's public in git history anyway, which is why the old key has no rollback right.
- Never commit the new key or its password (`.private/` is git-ignored).

## Production (store) signing, when there is a store build

- Use a **separate** key from the preview one, created and kept only by the owner (or Play App Signing).
- CI gets it as secrets: `IZUKI_RELEASE_KEYSTORE` (a decoded file path), `IZUKI_RELEASE_KEYSTORE_PASSWORD`, `IZUKI_RELEASE_KEY_ALIAS` and `IZUKI_RELEASE_KEY_PASSWORD`.
- `build.gradle` signs `release` only when these are present.
