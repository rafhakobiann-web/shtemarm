# Permanent Android signing — Shtemarm

## One signing identity for future versions

The permanent release keystore is created **once** by the owner on a trusted device, backed up securely offline, and reused for every future signed APK/AAB. Never commit a keystore, password, base64 key, or private key to Git. Never share the passwords in issues, PRs, screenshots, or chat.

**Important:** a new signing key cannot update an app installed under an unrelated GitHub Actions debug key. A one-time uninstall/reinstall may be necessary. Export and verify the Shtemarm progress backup first; preserve the backup outside the app before uninstalling.

## Create the keystore privately

On a trusted machine with JDK 17+ (or Termux with Java/keytool), run locally:

```sh
keytool -genkeypair -v -keystore shtemarm-release.jks -alias shtemarm -keyalg RSA -keysize 3072 -validity 10000 -storetype PKCS12
```

Use strong, unique passwords. Keep at least two secure offline backups of `shtemarm-release.jks`. Do not generate it in a disposable CI runner. Record its public certificate fingerprint:

```sh
keytool -list -v -keystore shtemarm-release.jks -alias shtemarm
```

Find the SHA256 fingerprint. This is public information, unlike the private keystore and passwords.

## Configure GitHub (repository Settings → Secrets and variables → Actions)

Add these four **repository secrets** (do not paste values into PRs or source files):

- `ANDROID_KEYSTORE_BASE64`: base64 of the entire keystore file (single line).
- `ANDROID_KEYSTORE_PASSWORD`: keystore password.
- `ANDROID_KEY_ALIAS`: `shtemarm` (or the alias you actually chose).
- `ANDROID_KEY_PASSWORD`: key password.

On Linux, `base64 -w 0 shtemarm-release.jks` produces a single-line value; on systems without `-w`, use `base64 < shtemarm-release.jks | tr -d '\n'`.

Add one **repository variable**: `ANDROID_RELEASE_CERT_SHA256`, the SHA-256 certificate fingerprint shown by keytool. The signed-release workflow fails closed when this fingerprint is missing or differs from the APK certificate.

## Release procedure

1. Ensure the previous version's signing certificate matches the pinned fingerprint for **in-place updates**.
2. Increase `versionCode` monotonically (0.3.2 is code 11; later releases must be greater).
3. Run `Build signed Shtemarm Android release` manually from `main` with the new version and code.
4. Wait for all tests and signing checks to pass. Download `shtemarm-signed-android-release` only from the successful run.
5. Test installation, backup import, and key screens on a spare/test device. Do not publish the APK automatically.
6. Confirm distribution rights for bundled educational material before making a public download available.

**Do not** distribute GitHub Actions debug APKs as production updates. Do not rotate the release key casually. If a key is lost, Google Play App Signing has separate key-reset mechanisms for Play-distributed apps; this does not automatically solve sideloaded APK updates.

## Migration of existing debug installs

A debug-signed installation cannot be upgraded with the new release key unless the signing lineage is valid (which requires control of the old signing key). If that key is unavailable:

1. In the installed app, export progress to a JSON backup and confirm the file exists in a safe location.
2. Keep a copy outside app storage.
3. After testing the new signed APK, uninstall the old app, install the permanently signed APK, and import the progress JSON.
4. Verify bookmarks, history, and preferences before deleting any backup.

If the app cannot export or import correctly, **stop**; do not uninstall until data recovery is resolved.
