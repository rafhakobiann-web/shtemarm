/**
 * Server-only authenticated learner identity. A client-supplied user ID is not
 * proof of authentication; validate the bearer token with Supabase Auth.
 *
 * Returns null on missing, malformed or expired credentials. Never leak the
 * service role key or user data into browser bundles.
 */
export async function verifiedStudentId(): Promise<string | null> {
  const { getRequest } = await import("@tanstack/react-start/server");
  let bearer = "";
  try {
    bearer = getRequest().headers.get("authorization") ?? "";
  } catch {
    return null;
  }
  if (!/^Bearer\s+\S{20,8192}$/i.test(bearer)) return null;

  const token = bearer.replace(/^Bearer\s+/i, "");
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !data.user?.id) return null;
    return data.user.id;
  } catch {
    return null;
  }
}
