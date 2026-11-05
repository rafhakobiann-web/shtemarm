import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { ToolContext } from "@lovable.dev/mcp-js";

/**
 * Shared Supabase factory for MCP tools. All reads are lazy so the module is
 * safe to import during manifest extraction (no env reads or I/O at top level).
 */

function supabaseProjectUrl(): string {
  const url = import.meta.env["VITE_SUPABASE_URL"] as string | undefined;
  if (!url) throw new Error("Supabase URL is not configured");
  return url.replace(/\/+$/, "");
}

function supabasePublishableKey(): string {
  const key = import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] as string | undefined;
  if (!key) throw new Error("Supabase publishable key is not configured");
  return key;
}

/**
 * Caller-scoped client for authenticated tools. The verified OAuth bearer is
 * forwarded so RLS applies exactly as it does for the signed-in app user.
 */
export function supabaseForUser(ctx: ToolContext): SupabaseClient {
  const token = ctx.getToken();
  if (!token) throw new Error("supabaseForUser requires a verified OAuth token");
  return createClient(supabaseProjectUrl(), supabasePublishableKey(), {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
