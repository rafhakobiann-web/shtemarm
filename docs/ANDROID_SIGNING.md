# Production Android signing (not used for the first debug beta)

The first Shtemarm APK is a private beta signed by the Android CI debug key.
A production release needs a **persistent** signing key so updates keep the
same certificate. Do not add that key to source control or share it in chat.

## Secure setup

1. Generate a long-lived Android upload signing keystore on a trusted device
   using Android Studio's **Generate Signed Bundle / APK** workflow, or the JDK
   `keytool`. Keep an encrypted offline backup and preserve both passwords.
2. Encode the keystore file as a *single-line base64 string locally* (do not
   upload the file to the repository, an issue, or an APK artifact).
3. In GitHub repository **Settings → Secrets and variables → Actions** create
   four repository secrets:
   - `ANDROID_KEYSTORE_BASE64` — base64-encoded keystore bytes.
   - `ANDROID_KEYSTORE_PASSWORD` — the keystore password.
   - `ANDROID_KEY_ALIAS` — the alias for the signing key.
   - `ANDROID_KEY_PASSWORD` — the signing key's password.
4. Open **Actions → Build signed Shtemarm Android release → Run workflow**,
   select `main`, and choose a version name and an increasing version code.
5. The workflow validates tracked files and Git history, validates bundled
   question banks, builds a signed APK and AAB, and verifies the APK signature.
   The output is stored as a private Actions artifact.
6. Install the signed APK on test devices, verify updating without data loss,
   test every supported Android version, and inspect data/privacy rules before
   publishing a store release.

The build will **fail safely** when any signing secret is missing. The workflow
never prints or publishes the signing key. Do not delete or rotate a production
signing key without a documented migration plan.

## API key separation

GitHub **Actions Secrets** are for build-related secret material, not a
replacement for production website secrets. Keep Gemini, Groq, OpenRouter,
Supabase service-role and administrator credentials in the **hosting
provider's server environment**. Publishable Supabase browser keys and
endpoint URLs may be distributed to clients, but must be restricted by RLS.

## Release types

- `v0.1.0-beta.1` — first **debug-signed** GitHub pre-release, for private testing.
- Signed workflow outputs — installable release APK and App Bundle, available
  only after the owner configures persistent signing secrets.
- A public Play Store release requires further device/privacy/content-rights
  checks and applicable publisher eligibility.
