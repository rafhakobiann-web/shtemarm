import { readFileSync } from "node:fs";
import assert from "node:assert/strict";

const workflow = readFileSync(".github/workflows/android-signed-release.yml", "utf8");
const gradle = readFileSync("android/app/build.gradle.kts", "utf8");
const ignore = readFileSync(".gitignore", "utf8");

// The release must use one persistent, owner-controlled keystore, and verify
// both the input keystore fingerprint and the generated APK's certificate.
for (const name of [
  "ANDROID_KEYSTORE_BASE64",
  "ANDROID_KEYSTORE_PASSWORD",
  "ANDROID_KEY_ALIAS",
  "ANDROID_KEY_PASSWORD",
  "ANDROID_SIGNING_CERT_SHA256",
]) assert.ok(workflow.includes(name), `Missing signing input: ${name}`);

for (const guard of [
  "workflow_dispatch:",
  "refs/heads/main",
  "versionCode higher",
  "keytool -list -v",
  "apksigner",
  "SHA-256 digest",
  "normalize \"$PINNED_CERT\"",
  "testDebugUnitTest assembleRelease bundleRelease",
  "rm -f \"$RUNNER_TEMP/shtemarm-release.p12\"",
]) assert.ok(workflow.includes(guard), `Missing release safeguard: ${guard}`);

assert.ok(workflow.includes("contents: read"), "Signed workflow requires only read permissions");
assert.ok(gradle.includes('applicationId = "am.shtemarm.app"'));
assert.ok(gradle.includes('System.getenv("ANDROID_SIGNING_STORE_FILE")'));
for (const pattern of ["*.p12", "*.jks", "*.keystore", ".env"]) {
  assert.ok(ignore.includes(pattern), `Sensitive signing file not gitignored: ${pattern}`);
}
console.log("Permanent signing workflow's declared safety checks are present.");
