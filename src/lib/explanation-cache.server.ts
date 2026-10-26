/** Optional cache never blocks live AI when storage is unavailable or slow. */
const limitCacheTime = <T>(operation: PromiseLike<T>, ms: number): Promise<T | null> =>
  Promise.race([
    Promise.resolve(operation).catch(() => null),
    new Promise<null>(resolve => setTimeout(() => resolve(null), ms)),
  ]);
export async function getSavedExplanation(cacheKey: string): Promise<string | null> {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const query = supabaseAdmin.from("explanation_cache")
      .select("explanation").eq("cache_key", cacheKey).maybeSingle();
    const result = await limitCacheTime(query, 1300);
    return result?.error ? null : result?.data?.explanation ?? null;
  } catch {
    return null;
  }
}
export async function saveExplanation(cacheKey: string, explanation: string): Promise<void> {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const query = supabaseAdmin.from("explanation_cache")
      .upsert({ cache_key: cacheKey, explanation }, { onConflict: "cache_key" });
    await limitCacheTime(query, 1000);
  } catch {
    // Optional cache failures never disable generation.
  }
}
