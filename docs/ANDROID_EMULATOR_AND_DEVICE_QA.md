# Android native app: emulator and physical-device verification

**Scope:** This is a testing checklist, not evidence that a physical device has passed. The emulator smoke test in this PR can check native launch and supported English asset parsing. A real Android phone remains required for responsiveness, accessibility and upgrade-signature verification.

## Automated test

Run locally with an Android emulator started:

```sh
cd android
gradle --no-daemon testDebugUnitTest connectedDebugAndroidTest
```

CI: `.github/workflows/android-emulator-book-smoke.yml` uses API 35 and uploads instrumentation results. It **does not distribute any APK**, install onto a user's phone, or modify main/Production.

## Manual checklist — perform using a test copy / backed-up study progress

- [ ] Record device model, Android version, APK versionCode, package name and signing fingerprint. Keep private account information out of logs.
- [ ] Before trying an in-place APK update, verify the **existing** and **new** signing-certificate SHA-256 digests match and the new versionCode is higher. Do not uninstall before backing up progress. A GitHub runner's debug key may change.
- [ ] Cold-launch the native app; Home and bottom navigation render without blank screens, crashes or visible UI freezes.
- [ ] Check Armenian glyphs and line wrapping in Home, Settings, Book catalogue, section titles, study questions and explanation screens, in both dark/light mode and large-text mode.
- [ ] Open English Books 1, 2 and 3; navigate between books rapidly. No stuck spinner, duplicate result screens or stale questions from the previous book.
- [ ] Repeat with Armenian History Book 1 and Biology Book 2. Check section counts/answerability against the corresponding data audit; neither emulator nor device coverage certifies the printed edition.
- [ ] Finish a study session; tap Finish rapidly twice. Verify one saved result and no frozen UI while progress is being written.
- [ ] Check practice after toggling airplane mode. Bundled question books must still open; online-dependent features should display a meaningful recoverable message.
- [ ] Rotate the screen or background/reopen the app during book loading; verify cancellation, scrolling and progress restoration.
- [ ] Verify repeated question numbers are individually answerable (English II, Section 2), and the visible printed numbers/answers have not been silently renumbered.
- [ ] Review touch hit targets, frame stutters, accessibility labels, TalkBack/focus order and motion-reduction preference on an actual device.

## Results to report before release

For each scenario record **Pass / Fail / Not tested**, exact APK build identity, evidence (non-sensitive screenshot/log snippet), and the reproducing steps for any issue. Do not claim a successful physical test based solely on CI.

**Out of scope:** complete independent PDF transcription review, legal redistribution clearance, Play Store signing and production publication.
