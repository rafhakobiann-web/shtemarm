/**
 * Best-effort server-only explanation cache.
 * Missing Supabase credentials, unavailable DB, and cache permission errors
 * must never prevent AI generation or its no-key fallback.
 */
export async function getSavedExplanation(cacheKey: string): Promise<string | null> {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin.from("explanation_cache")
      .select("explanation").eq("cache_key", cacheKey).maybeSingle();
    return error ? null : data?.explanation ?? null;
  } catch {
    return null;
  }
}
export async function saveExplanation(cacheKey: string, explanation: string): Promise<void> {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("explanation_cache")
      .upsert({ cache_key: cacheKey, explanation }, { onConflict: "cache_key" });
  } catch {
    // Optional cache should not change the successful response.
  }
}
