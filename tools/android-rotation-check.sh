#!/usr/bin/env bash
# The preview key rotation (docs/ANDROID-SIGNING.md, path A), proven on a real
# Android system image instead of assumed:
#   1. Today's app, signed only with the old public key, installs, and holds
#      some data (as a paired phone does).
#   2. The rotated update installs over it, and the data is still there:
#      phones keep updating without a reinstall.
#   3. After that, an APK signed only with the old public key is refused.
#      Anyone can sign with that key, so it must stop passing as an update.
# With a third APK (the one actually published), the update is also tried
# from that one first: once phones hold a rotated key, that's what they run.
# Usage: android-rotation-check.sh <public-key-only.apk> <rotated.apk> [published.apk]
set -u
old="$1"
rotated="$2"
published="${3:-}"
package=com.novaizuki.mobile
fail() { echo "ROTATION CHECK FAILED: $*" >&2; exit 1; }
# (adb shell joins its words into one command line on the phone, so the
# whole run-as command goes as one string, inner quotes and all.)

if [ -n "$published" ]; then
  adb uninstall "$package" >/dev/null 2>&1 || true
  adb install "$published" || fail "the published app did not install"
  adb shell "run-as $package sh -c 'mkdir -p files && echo kept > files/izuki-rotation-marker'" || fail "could not write the published app's data"
  # -d: a test build may carry the same or a lower version than the release.
  adb install -r -d "$rotated" || fail "the new build did not install over the published app"
  kept=$(adb shell run-as "$package" cat files/izuki-rotation-marker | tr -d '\r')
  [ "$kept" = "kept" ] || fail "the published app's data did not survive the update (got '$kept')"
  echo "OK: the new build installed over the published app and kept its data."
fi

adb uninstall "$package" >/dev/null 2>&1 || true
adb install "$old" || fail "today's app (public key only) did not install"
# The preview APK is a debug build, so run-as can write into its data.
adb shell "run-as $package sh -c 'mkdir -p files && echo kept > files/izuki-rotation-marker'" || fail "could not write the app's data"

adb install -r "$rotated" || fail "the rotated update did not install over today's app"
kept=$(adb shell run-as "$package" cat files/izuki-rotation-marker | tr -d '\r')
[ "$kept" = "kept" ] || fail "the app's data did not survive the update (got '$kept')"
echo "OK: the rotated update installed over today's app and kept its data."

if out=$(adb install -r "$old" 2>&1); then
  fail "an APK signed only with the public key still installs over the rotated app"
fi
echo "$out" | grep -q "INSTALL_FAILED_UPDATE_INCOMPATIBLE" || fail "refused for an unexpected reason: $out"
echo "OK: an APK signed only with the public key is refused after the rotation."
