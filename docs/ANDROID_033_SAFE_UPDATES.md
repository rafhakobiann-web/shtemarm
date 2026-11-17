# Android 0.3.3 — safe update candidate

Status: draft, not released. Version: `0.3.3` / `versionCode 12`. Package ID remains `am.shtemarm.app`.

## Compatibility requirements
Android can install an APK over an existing app only when the package name matches, the new version code is higher, and the signing certificate is compatible (including any Android-supported signing lineage). Version 12 is newer than known codes 4–11, but does **not** solve a signing-key mismatch.

Do not ask students to uninstall the app as the first troubleshooting step: uninstalling can delete local progress.

## Release checklist
1. Configure the four GitHub Actions signing secrets from the **same long-lived signing key** used for the existing installed production APKs. Never put the key in source control, logs or chat.
2. Build using `.github/workflows/android-signed-release.yml` after review/merge. Verify package `am.shtemarm.app`, version `0.3.3`, code `12`, APK signature and SHA-256 artifact.
3. Compare the signing certificate SHA-256 with APKs users already installed. The first debug-signed beta may have a different certificate; an ordinary APK cannot update those installs in place.
4. Test update **without uninstalling** from each known distributed APK on Android 7 (API 24), Android 10, Android 13 and Android 17 where test devices/emulators are available. Verify launch, offline books, account sign-in, answers and retained local progress.
5. For incompatible signing certificates, first build and test a backup/export + restore migration path for local progress, or provide a supported signing lineage if genuinely available. Do not advertise a seamless update until this is proven.
6. Publish only a signed, verified artifact through the approved Lovable download flow. Do not replace the public APK with a debug build.

The Android 0.3.3 branch currently contains release versioning and verification improvements, **not** a proven universal update or a finished APK.

## Product direction: fast, focused learning (17 Nov 2026)
- No Liquid Glass theme in the new Android variant. Offer only opaque Classic and Academy surfaces; map saved Liquid preferences to Academy at runtime without deleting progress.
- Disable live Haze capture for the new variant; prioritize scroll and tap responsiveness over optical effects.
- Signature learning feature: offline adaptive revision based on real chapter performance, with deterministic ordering and no invented AI answers.
- Next milestone: integrate revision route into the study UI, add accessible motion/reduced-motion behavior, benchmark navigation and scrolling on low/mid-range devices, and test persistence and signed updates.
- The code is a draft; these changes do not establish measured frame rates or a released APK.
