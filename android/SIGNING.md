# Android beta signing and safe updates

Android only accepts an in-place APK update when **applicationId**, **signing certificate**, and a non-decreasing **versionCode** are compatible. Shtemarm uses `am.shtemarm.app`.

## One-time setup (repository owner)

1. Recover the keystore that signed the **currently installed** app, if it exists. A new keystore cannot update an installation signed by a different key.
2. Store the original keystore as a single-line base64 GitHub Actions secret `ANDROID_BETA_KEYSTORE_BASE64` (for example, locally run `base64 -w 0 beta.jks` on Linux; never paste it into issues, chats, commits, or logs).
3. Set repository Actions secrets `ANDROID_SIGNING_STORE_PASSWORD`, `ANDROID_SIGNING_KEY_ALIAS`, and `ANDROID_SIGNING_KEY_PASSWORD`.
4. Obtain the SHA-256 fingerprint of the certificate in that keystore with `keytool -list -v -keystore beta.jks -alias YOUR_ALIAS`. Store the fingerprint as repository Actions **variable** `ANDROID_BETA_CERT_SHA256` (not a secret).
5. Merge the PR, then use Actions → **Build update-compatible signed Android beta** → Run workflow. Download `Shtemarm-signed-beta-APK` from the successful run.

**Do not distribute** APKs from `android-debug-apk.yml` or `android-020-verify.yml` as updates: those are CI verification builds and may have different runner-generated debug signatures.

## Existing installations

If the installed APK was signed with an ephemeral GitHub Actions debug key and that private key is lost, Android will not accept an in-place update signed with a new key. First back up any locally stored progress and settings using a supported export method, then uninstall and install the newly signed beta. **Do not uninstall before checking whether progress can be backed up.**

A debug APK retains the app's debug-only behavior and is **not** a Play Store release. The release variant currently displays a holding screen; do not substitute a release APK until that behavior is intentionally changed and tested.

Keep the original keystore and passwords securely backed up. Losing them can permanently prevent future in-place updates. Increment `versionCode` for each public beta update; Android rejects downgrades.
