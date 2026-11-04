/** 
 * Protect admin-only explanation management even when the public route or
 * TanStack client navigation guard is bypassed.
 *
 * Supabase Auth verifies the bearer token server-side. The existing distinct
 * ADMIN_PASSWORD remains required as a second factor. Optional
 * ADMIN_ALLOWED_USER_IDS is an additional strict allowlist if configured.
 */
export async function requireVerifiedAdminSession(): Promise<string> {
  const { getRequest } = await import("@tanstack/react-start/server");
  let bearer = "";
  try { bearer = getRequest().headers.get("authorization") ?? ""; }
  catch { throw new Error("unauthorized"); }
  if (!/^Bearer\s+\S{20,8192}$/i.test(bearer)) throw new Error("unauthorized");

  const token = bearer.replace(/^Bearer\s+/i,"");
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user?.id) throw new Error("unauthorized");

  const allowedIds = process.env["ADMIN_ALLOWED_USER_IDS"]?.split(",")
    .map(id=>id.trim()).filter(Boolean) ?? [];
  if (allowedIds.length > 0 && !allowedIds.includes(data.user.id))
    throw new Error("unauthorized");

  return data.user.id;
}

