# Shtemarm Android — permanent signing and safe upgrades

This project uses one long-lived signing certificate for every **future signed release**.
A new signing key cannot replace an already-installed APK signed with a different
debug key. Android checks applicationId, certificate identity, and versionCode.

## Owner-only setup

1. Store the previously generated `Shtemarm-permanent-android-signing.p12`
   and its password in **two secure private locations**. Never commit the
   keystore, passwords, or the base64 file. A lost key cannot be recreated.
2. In GitHub → **Settings → Secrets and variables → Actions → Secrets**, set:
   - `ANDROID_KEYSTORE_BASE64`: contents of the locally saved base64 file
   - `ANDROID_KEYSTORE_PASSWORD`: the keystore password
   - `ANDROID_KEY_ALIAS`: `shtemarm`
   - `ANDROID_KEY_PASSWORD`: key password (same as store password for PKCS12)
3. Under **Actions → Variables**, set `ANDROID_SIGNING_CERT_SHA256` to the
   fingerprint in the private credential file. This is a public fingerprint,
   **not** a private key. The workflow will fail closed on a mismatch.
4. Merge the reviewed workflow PR after checks pass. Run Actions →
   **Build permanently signed Shtemarm Android update** on `main`, using a
   versionCode higher than the last distributed code (Beta 4 used **10**).
   The default next version is `0.3.0-beta.5`, code `11`.
5. The workflow tests, builds, checks package identity and certificate, then
   makes a downloadable GitHub Actions artifact. The workflow does **not**
   automatically deploy Lovable, change the website, publish to Play Store,
   or expose signing secrets.

## Moving from debug APKs to this certificate

Existing Shtemarm debug APKs might be signed by a different (ephemeral) key.
**Before uninstalling:** launch the old app, open Settings (Կարգավորումներ),
use the export/backup action (Պահպանել) and verify that the JSON file can be
found in Downloads or your chosen private storage.

If the certificate differs, Android will reject an in-place upgrade. After
you have a valid backup, uninstall the incompatible version and install the
first newly signed APK. Then use Settings → Վերականգնել to import the backup.
Check restored progress before deleting the backup. Subsequent updates with
this same certificate and a larger versionCode should install in place.

If you still have the private key that signed the *already installed* app,
using that original certificate is preferable. Do not assume versionCode alone
solves signature conflicts. Never attempt to extract signing keys from an APK.

## Google account sign-in

The website has a Google OAuth option via Lovable Cloud and an optional
fallback via Supabase. The Google provider must be enabled and its authorized
redirect URLs configured in the matching cloud project's dashboard. Add your
actual site's `https://<site>/auth` to the Auth redirect allow list.

Do not place a Google OAuth **client secret** in web or Android app code.
The native Android app does not yet exchange OAuth tokens into its own secure
session; signing in to the website in Chrome is **not** equivalent to
signing in to the native app. Device-specific OAuth integration requires a
separately verified deep-link/PKCE login and secure token storage.
