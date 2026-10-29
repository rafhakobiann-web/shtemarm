# Android 0.2.0 beta: safe update policy

The Android application code is 0.2.0-beta.1 (versionCode 5). The APK currently served by the website is still 0.1.1-beta.1 (versionCode 4). The website must not claim its downloadable APK is 0.2.0 until the artifact is actually published.

## Updating without uninstalling

Android accepts an in-place APK update only when the package ID is unchanged, the new versionCode is greater, and signing certificates are compatible. Both APKs use `am.shtemarm.app`, and the new code is 5.

**Important:** The website's old 0.1.1 APK was debug-signed in GitHub Actions. A fresh runner debug certificate is not the same as the old one. A new persistent release key will not match the old debug key either. In this case, it is technically impossible to install 0.2.0 over 0.1.1 without an Android signing-key migration supported by the device; the normal APK install flow will reject it. Do not tell users to uninstall before they have exported their progress.

## Release workflow

The manually approved `Publish Android 0.2.0 in-place update (certificate verified)` workflow:

1. Requires explicit redistribution-rights and APK-replacement approval.
2. Requires all four persistent Android signing secrets already documented in `docs/ANDROID_SIGNING.md`.
3. Runs Android tests, builds a signed 0.2.0 APK, and verifies its signature.
4. **Compares the SHA-256 signing certificate digest with the currently distributed APK** and verifies package ID and versionCode.
5. Publishes the APK and JSON manifest only if all upgrade conditions pass. On any mismatch it fails without replacing the existing download.

The old debug APK publishing workflow is intentionally disabled to prevent accidental data-loss-inducing upgrades.

## If signatures do not match

In the existing 0.1.1 app, open Settings and export the JSON progress backup to a safe location. Verify that it exists before making any changes. A fresh installation with a new signing identity may be necessary for a future stable release. After installing that version, import the backup via Settings. This is a **migration**, not an in-place update. Do not claim otherwise. Future updates signed with the same persistent key can be installed over that new version.

The owner must confirm content redistribution rights before making a new APK public.
