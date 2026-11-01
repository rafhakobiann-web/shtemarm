/** Redirect only to this site's own account route after Google OAuth.
 * No untrusted next/returnTo query parameter may become an OAuth redirect.
 */
export function googleAuthRedirect(origin: string): string {
  const url = new URL(origin);
  const local = url.hostname === "localhost" || url.hostname === "127.0.0.1";
  if ((url.protocol !== "https:" && !(local && url.protocol === "http:")) ||
      url.username || url.password) {
    throw new Error("Unsupported Google sign-in origin");
  }
  return new URL("/auth", url.origin).toString();
}
