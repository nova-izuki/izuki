# Bumping the version

Every release starts with one commit on `main` that moves the version in every
file a build reads it from, and adds that version's release notes. Miss one and
the pipeline stops before it tags anything; miss the phone build numbers and it
tags a release no installed phone can accept.

AGENTS.md leaves the version files and the release notes to Claude. Nothing here
is done by Freebuff or Codex.

## One command does it

```
node tools/bump-version.mjs 1.0.227 --dry-run   # show every file it would write
node tools/bump-version.mjs 1.0.227             # write them all
```

It writes every row of the table below, moves the phone build numbers with the
version, turns the pending `NEXT-RELEASE` lines into `docs/RELEASE-1.0.NNN.md`
and clears the list. It refuses, and writes nothing, when a line it expects has
moved, when the version is not newer than the one in the tree, or when the
pending list is empty, and it finishes by running the same agreement check as
CI. `tools/bump-version-check.mjs` pins that, including that a row added to the
table below without the script writing it fails the test. Rewrite the generated
notes into prose if the release body should read like the earlier ones.

## The bump commit touches

| File | What changes |
|---|---|
| `package.json` | `"version": "1.0.NNN"` |
| `src-tauri/tauri.conf.json` | `"version": "1.0.NNN"` (the updater compares this one) |
| `src-tauri/Cargo.toml` | `[package]` `version = "1.0.NNN"` |
| `src-tauri/Cargo.lock` | the `izuki` package's `version = "1.0.NNN"` (by hand, or let `cargo` rewrite it) |
| `android/app/build.gradle` | `versionName "1.0.NNN"` and `versionCode NNN` |
| `ios/App/App.xcodeproj/project.pbxproj` | both `MARKETING_VERSION = 1.0.NNN;` lines and both `CURRENT_PROJECT_VERSION = NNN;` lines |
| `docs/RELEASE-1.0.NNN.md` | the release notes: at least 40 characters, and the gate refuses a missing or empty file |
| `docs/NEXT-RELEASE.md` | fold the pending `[Freebuff]` and Codex lines into the release notes above; nothing in CI reads this file |

## The build numbers are the easy miss

`versionCode` and `CURRENT_PROJECT_VERSION` must move with the version:
`1.0.226` gives `226` (minor and patch as `minor*1000 + patch`, so `1.1.0`
gives `1000`, still growing). Leaving them at the old number passes every other
check, but Android and iOS refuse to install a package whose build number they
already have, so the update never reaches an installed phone.
`tools/check-versions-check.mjs` pins that rule.

## Before pushing the bump

```
node tools/check-versions.mjs                                        # files agree, build numbers moved
npm run test:versions                                                # the rule itself, pinned
node tools/check-versions.mjs --release --after <latest published>   # notes exist, number is newer
```

All three must pass. Then merge and let `auto-release.yml` tag it and start the
Windows and phone builds; `release.yml` keeps the release a draft until the APK
and IPA clear their size floors and `tools/verify-updater.mjs` accepts the
signed installers.
