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
| Preview (`assembleDebug`, CI and website) | The private preview key from the GitHub secret `IZUKI_PREVIEW_KEYSTORE_B64` if it's set. Otherwise the public key in the repo, as before. |
| Release (`assembleRelease`) | Only `IZUKI_RELEASE_KEYSTORE` (+ password, alias and key password variables). Otherwise unsigned. |

`mobile.yml` decodes the secret into the runner's temp folder, outside the checkout, and the log says which key signed.

## Moving previews to a private key

Android only installs an update signed by the same key as the installed app, so the switch needs one of two paths. The app supports Android 7.0+ (`minSdkVersion` 24, see `android/variables.gradle`).

**Adding the key secret alone does nothing harmful:** CI refuses to build with a new key unless one of the paths below is chosen. Path A needs a lineage and its re-signing step, and path B needs the repository variable `IZUKI_PREVIEW_NEW_KEY_OUTRIGHT=yes`. Without that check, one secret would have silently stopped every installed phone from updating.

### A. Key rotation: no reinstall on Android 9+ (recommended)

APK Signature Scheme v3 lets the old key vouch for a new one (a "lineage").

1. Make the new key (keep the file and password private, never in the repo):
   `keytool -genkeypair -keystore izuki-preview-2.p12 -storetype pkcs12 -alias izuki -keyalg RSA -keysize 4096 -validity 10000`
2. Make the lineage, with the old key signing for the new one:
   `apksigner rotate --out izuki-lineage --old-signer --ks izuki-preview.p12 --new-signer --ks izuki-preview-2.p12`
   Remove the old key's rollback rights, so updates signed only by the old (public) key are refused: `--set-rollback false` on the old signer.
3. **CI needs one more step** (Claude adds it once you choose A): after `assembleDebug`, re-sign with `apksigner sign --lineage izuki-lineage --rotation-min-sdk-version 28 --signer` (old key) `--next-signer` (new key). Without `--rotation-min-sdk-version 28`, apksigner uses the new key only on Android 13+.
   - Android 9+ phones move to the new key on their next update, and from then on refuse APKs signed only with the public key.
   - Android 7–8 phones keep validating the old signature: they still update, but stay exposed until they reinstall.
4. Add the secrets in GitHub → Settings → Secrets and variables → Actions:
   - `IZUKI_PREVIEW_KEYSTORE_B64`: `base64 -w0 izuki-preview-2.p12`
   - `IZUKI_PREVIEW_KEYSTORE_PASSWORD`
   - the lineage file, base64, as `IZUKI_PREVIEW_LINEAGE_B64`

### B. New key outright: everyone reinstalls once

1. Steps 1 and 4 of path A, without the lineage, plus the repository variable `IZUKI_PREVIEW_NEW_KEY_OUTRIGHT` = `yes` (GitHub → Settings → Secrets and variables → Actions → Variables).
2. Every user must **uninstall** the preview app and install the new one. Android refuses the update otherwise. Uninstalling clears the app's data, so they pair their PC again.
3. Say so in that release's notes and on the website's download section.

### Either way

- Remove the public `izuki-preview.p12` and its password from the repo after the switch. The old key stays public in git history, which is why path A's "rollback false" matters.
- Never commit the new key, its password or the lineage's private parts.

## Production (store) signing, when there is a store build

- Use a **separate** key from the preview one, created and kept only by the owner (or Play App Signing).
- CI gets it as secrets: `IZUKI_RELEASE_KEYSTORE` (a decoded file path), `IZUKI_RELEASE_KEYSTORE_PASSWORD`, `IZUKI_RELEASE_KEY_ALIAS` and `IZUKI_RELEASE_KEY_PASSWORD`.
- `build.gradle` signs `release` only when these are present.
