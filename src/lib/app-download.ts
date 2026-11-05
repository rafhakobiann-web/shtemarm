/**
 * Public Android download configuration. Never read a private GitHub token or
 * a signed URL with credentials from VITE_* variables: these are browser-visible.
 */
export const PRIVATE_BETA_URL =
  "https://github.com/rafhakobiann-web/shtemarm/actions/workflows/android-020-verify.yml";

// Public, published GitHub Release, confirmed on 2026-11-05.
// Debug-signed beta: do not present it as a production or Play Store release.
export const GITHUB_ANDROID_BETA_VERSION = "0.3.0-beta.4";
export const GITHUB_ANDROID_RELEASE_URL =
  "https://github.com/rafhakobiann-web/shtemarm/releases/tag/v0.3.0-beta.4";
export const GITHUB_ANDROID_APK_URL =
  "https://github.com/rafhakobiann-web/shtemarm/releases/download/v0.3.0-beta.4/Shtemarm-Android-0.3.0-beta.4-Debug-Test.apk";

// Bundled site asset is distributable to ordinary website visitors even while
// the source GitHub repository and its releases are private.
export const SITE_ANDROID_APK_URL = "/downloads/shtemarm-android.apk";
export const SITE_ANDROID_BETA_VERSION = "0.1.1-beta.1";

export const LATEST_ANDROID_VERSION = "0.2.0-beta.1";
export const PUBLIC_ANDROID_VERSION = "0.1.1-beta.1";
export const LATEST_ANDROID_VERSION_CODE = 5;

/** Only HTTPS public APKs or same-origin /downloads/*.apk files are valid. */
export function safePublicApkUrl(raw: string | undefined): string | null {
  const value = raw?.trim();
  if (!value || value.startsWith("//")) return null;
  try {
    const isLocal = value.startsWith("/");
    const url = new URL(value, "https://shtemarm.am");
    if (!isLocal && url.protocol !== "https:") return null;
    if (!url.pathname.toLowerCase().endsWith(".apk")) return null;
    if (url.username || url.password || url.search || url.hash) return null;
    return isLocal ? url.pathname : url.href;
  } catch {
    return null;
  }
}



// A released tag is not necessarily accessible to the public if the GitHub
// repository is private. Ignore legacy VITE_ANDROID_APK_URL configuration
// pointing to this private repo, even if it otherwise looks like a valid APK.
export function publiclyAccessibleApkUrl(raw: string | undefined): string | null {
  const url = safePublicApkUrl(raw);
  if (!url) return null;
  if (/^https:\/\/github\.com\/rafhakobiann-web\/shtemarm(?:\/|$)/i.test(url)) return null;
  return url;
}
