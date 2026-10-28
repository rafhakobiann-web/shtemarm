# Shtemarm Android 0.1.1-beta.1 — stability update

**Private beta. Not a Play Store production release.**

## Changes since 0.1.0-beta.1

- Smoother native screen transitions, answer feedback and book-section animations.
- Android versionName `0.1.1-beta.1`, versionCode `4`.
- Fixed duplicate score/session recording if the results action is tapped twice.
- Faster saved-question review: only books referenced by bookmarks are read.
- Cached loaded questions and protected answer taps against accidental double scoring.
- Corrected the default subject in test/game/tool screens to one with a supported question format.
- Improved handling when a question book cannot be read.
- Added **Settings → Save / Restore progress** to export and import a JSON backup
  of local progress, bookmarks, and appearance preferences. Import overwrites
  the current device's local progress; the file stays wherever you save it.
- Added regression unit tests and required them in CI.
- Added an Android emulator startup smoke test to the private beta release workflow.

## Important installation warning

The previous 0.1.0-beta.1 and this 0.1.1-beta.1 test APK can be **debug-signed
by different GitHub Actions runners**, even with the higher versionCode.
If the Android package manager reports an incompatible signature, **do not
uninstall the old app without understanding that locally saved progress will
be deleted**. The old 0.1.0-beta.1 did not yet include the JSON backup feature.
There is no supported guaranteed in-place upgrade path between these
runner-generated debug-signed APKs.

For stable, data-preserving updates going forward, the project must use the
**same persistent signing certificate** for every subsequent APK. The
`Build signed Shtemarm Android release` workflow already requires four
protected GitHub Actions signing secrets; do not put the key in the repo or chat.
A new production certificate will not retroactively match the old debug APK.

## Testing before wider distribution

- **Passed:** Source secret scan, Git-history scan, question-bank validation,
  Kotlin regression tests, APK compilation, versionCode=4/versionName=0.1.1-beta.1
  checks, and APK signature verification.
- **Not verified at publication:** Automated emulator launch and screen
  accessibility. The emulator runner ran out of disk space while creating its
  virtual-device data partition. This is a CI infrastructure issue, **not**
  evidence that the app has passed a real-device launch test. Emulator testing
  will continue independently.
- **Required next:** Install and test on a physical Android phone, including
  startup, study sessions, saved questions, progress backup and navigation.

This release promotes the exact APK from successful Android CI run #93.
The release is intentionally **private and debug-signed**.

## Limitations

Full GԹԿ exam blueprints, some biology and other incomplete source question
banks, cloud synchronization, and all advanced AI features are not yet
finished. This beta is **not** a claim of complete feature parity with the web
platform. Check book licensing before any public APK distribution.
