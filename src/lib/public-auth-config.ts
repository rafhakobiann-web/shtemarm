/**
 * The Supabase publishable (or legacy anon) key is designed for browser use.
 * NEVER expose a service-role key, sb_secret_* key or unchecked JWT to clients.
 *
 * Environment-backed deployment configuration can be returned through a
 * same-origin server route if it was not bundled into VITE_* at build time.
 */
export type PublicAuthConfig = { url: string; key: string };

export function isPublicSupabaseKey(key: unknown): key is string {
  if (typeof key !== "string") return false;
  if (/^sb_publishable_[A-Za-z0-9_-]{12,}$/.test(key)) return true;
  if (!/^eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(key)) return false;
  try {
    const body = key.split(".")[1]!;
    const decoded = atob(body.replace(/-/g, "+").replace(/_/g, "/"));
    const claims: unknown = JSON.parse(decoded);
    return !!claims && typeof claims === "object" && "role" in claims &&
      claims.role === "anon";
  } catch {
    return false;
  }
}

export function isPublicAuthConfig(value: unknown): value is PublicAuthConfig {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<PublicAuthConfig>;
  if (typeof item.url !== "string" || !isPublicSupabaseKey(item.key)) return false;
  try {
    const url = new URL(item.url);
    return url.protocol === "https:" && url.username === "" && url.password === "" &&
      url.pathname === "/" && !url.search && !url.hash;
  } catch {
    return false;
  }
}
