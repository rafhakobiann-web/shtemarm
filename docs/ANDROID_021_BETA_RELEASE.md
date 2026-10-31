# Shtemarm Android 0.2.1 Beta — release candidate notes

> **Status: DRAFT. Not a published release.**
> Version name: `0.2.1-beta.1` · Version code: `6` · Package: `am.shtemarm.app`.

## Changes in this candidate

- Increment the Android beta version from `0.2.0-beta.1` (code 5) to `0.2.1-beta.1` (code 6).
- Extend Android CI to check the APK package name, version name, and version code while compiling debug and release variants.
- Carry forward the `main` branch Android launch fix from merged PR #124 (the full native study UI launches in release code instead of a holding screen).

## Not included / not yet verified

- Open Draft PR #123: repository dispatcher and question aggregation optimizations. **Not in this candidate until separately merged and retested.**
- Open Draft PR #125: book loading/saved questions cancellation and error handling. **Not in this candidate until separately merged and retested.**
- User-selected Hybrid Android architecture, full offline sync, fonts-on-device QA, and comprehensive question-book transcription are ongoing work, not completed features.

## Release gates (must pass before publication)

- [ ] GitHub Actions for the *final candidate commit* passes offline asset validation, math audit, Android unit tests, debug build, and unsigned release build.
- [ ] Inspect/install the final candidate APK on Android hardware; verify subject navigation, loading/cancellation, saved questions, and Armenian text.
- [ ] For upgrades, verify the existing installed APK and new signed APK share the **same signing certificate**, and confirm version code increases (5 → 6). Debug-signed artifacts must **not** be described as Play Store releases.
- [ ] Confirm rights to distribute all bundled exam/book assets.
- [ ] Confirm Preview remains accessible and Production is unchanged until owner approval.

No GitHub Release tag or public production deployment is created by this document.
