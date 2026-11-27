#!/usr/bin/env bash
# Runs one iOS command that may have to clone the Capacitor Swift package, and
# retries it when the clone fails.
#
# `npx cap sync ios` and `xcodebuild` both resolve the package
# https://github.com/ionic-team/capacitor-swift-pm.git through Swift Package
# Manager. A network blip there fails the command with exit 74 ("Failed to
# clone"), which on 1.0.226 failed the IPA, and because release.yml keeps a
# release a draft until the IPA is attached, one blip stranded the whole
# release. A retry is enough; the clone is cached and nothing is published by
# resolving it.
#
#   bash tools/ios-package-retry.sh npx cap sync ios
#   bash tools/ios-package-retry.sh xcodebuild -project ios/App/App.xcodeproj ... build
#
# IZUKI_IOS_TRIES (default 3) sets how many attempts one command gets.
set -uo pipefail

if [ "$#" -eq 0 ]; then
  echo "usage: $0 <command> [args...]" >&2
  exit 2
fi

tries="${IZUKI_IOS_TRIES:-3}"
attempt=1

while [ "$attempt" -le "$tries" ]; do
  # Not `if "$@"`: the exit status of an `if` compound with no true branch is
  # 0, so the failure a retry has to report would be lost.
  "$@"
  status=$?
  if [ "$status" -eq 0 ]; then
    exit 0
  fi
  if [ "$attempt" -ge "$tries" ]; then
    echo "ios-package-retry: still failing after $tries attempts (exit $status)." >&2
    exit "$status"
  fi
  echo "ios-package-retry: attempt $attempt of $tries failed (exit $status); clearing the partial clone and trying again." >&2
  # A half-finished clone is what a retry has to remove, or SPM reuses it:
  # the package cache, the checked-out CapApp-SPM build, and this project's
  # resolved packages in DerivedData. All of it is downloaded again.
  if [ -n "${HOME:-}" ]; then
    rm -rf "${HOME}/Library/Caches/org.swift.swiftpm/repositories"/*capacitor-swift-pm* 2>/dev/null || true
    rm -rf "${HOME}/Library/Developer/Xcode/DerivedData"/*/SourcePackages 2>/dev/null || true
  fi
  rm -rf ios/App/CapApp-SPM/.build 2>/dev/null || true
  sleep $((attempt * 15))
  attempt=$((attempt + 1))
done
