#!/usr/bin/env bash
# The preview key rotation (docs/ANDROID-SIGNING.md, path A), proven on a real
# Android system image instead of assumed:
#   1. Today's app, signed only with the old public key, installs, and holds
#      some data (as a paired phone does).
#   2. The rotated update installs over it, and the data is still there:
#      phones keep updating without a reinstall.
#   3. After that, an APK signed only with the old public key is refused.
#      Anyone can sign with that key, so it must stop passing as an update.
# Usage: android-rotation-check.sh <public-key-only.apk> <rotated.apk>
set -u
old="$1"
rotated="$2"
package=com.novaizuki.mobile
fail() { echo "ROTATION CHECK FAILED: $*" >&2; exit 1; }

adb uninstall "$package" >/dev/null 2>&1 || true
adb install "$old" || fail "today's app (public key only) did not install"
# The preview APK is a debug build, so run-as can write into its data.
adb shell run-as "$package" sh -c 'mkdir -p files && echo kept > files/izuki-rotation-marker' || fail "could not write the app's data"

adb install -r "$rotated" || fail "the rotated update did not install over today's app"
kept=$(adb shell run-as "$package" cat files/izuki-rotation-marker | tr -d '\r')
[ "$kept" = "kept" ] || fail "the app's data did not survive the update (got '$kept')"
echo "OK: the rotated update installed over today's app and kept its data."

if out=$(adb install -r "$old" 2>&1); then
  fail "an APK signed only with the public key still installs over the rotated app"
fi
echo "$out" | grep -q "INSTALL_FAILED_UPDATE_INCOMPATIBLE" || fail "refused for an unexpected reason: $out"
echo "OK: an APK signed only with the public key is refused after the rotation."
