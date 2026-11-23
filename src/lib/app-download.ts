/**
 * Public Android download configuration. Never read a private GitHub token or
 * a signed URL with credentials from VITE_* variables: these are browser-visible.
 */
export const PRIVATE_BETA_URL =
  "https://github.com/rafhakobiann-web/shtemarm/actions/workflows/android-020-verify.yml";

export const LATEST_ANDROID_VERSION = "0.4.0";
export const PUBLIC_ANDROID_VERSION = "0.1.1-beta.1";
export const LATEST_ANDROID_VERSION_CODE = 13;

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
