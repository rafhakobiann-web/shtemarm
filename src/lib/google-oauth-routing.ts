/**
 * OAuth on Shtemarm uses different providers for Lovable-hosted and standard
 * deployments. Never trust a user-provided return URL for an OAuth callback.
 */
const lovableHosts = [
  "lovable.app",
  "lovableproject.com",
  "lovableproject-dev.com",
  "gpt-eng.com",
  "gptengineer.run",
] as const;

export type GoogleOAuthMethod = "lovable" | "supabase";

/** Only genuine Lovable hosting domains use the Lovable Cloud OAuth broker. */
export function googleOAuthMethod(hostname: string): GoogleOAuthMethod {
  const host = hostname.trim().toLowerCase().replace(/\.$/, "");
  return lovableHosts.some(zone => host === zone || host.endsWith("." + zone))
    ? "lovable" : "supabase";
}

/** Redirect back to this site's own account route, not an arbitrary URL. */
export function googleOAuthRedirect(origin: string): string {
  const url = new URL(origin);
  const local = url.hostname === "localhost" || url.hostname === "127.0.0.1" ||
    url.hostname === "[::1]";
  if ((url.protocol !== "https:" && !(local && url.protocol === "http:")) ||
      url.username !== "" || url.password !== "" || url.origin === "null") {
    throw new Error("Unsupported OAuth origin");
  }
  return new URL("/auth", url.origin).toString();
}

/** A broker returning without a redirect is successful only with a real session. */
export function hasAuthenticatedSession(session: { access_token?: string } | null | undefined): boolean {
  return typeof session?.access_token === "string" && session.access_token.length > 0;
}
