import { getRequest } from "@tanstack/react-start/server";
import { aiQuotaLimit } from "./ai-quota-policy";
export { quotaMessage } from "./ai-quota-policy";

/**
 * Fail-closed authenticated AI budget. No client-provided IDs or IP addresses can
 * choose a higher quota. User identity is verified by Supabase Auth and only
 * a one-way digest is written to the service-role-only usage table.
 *
 * The SQL migration must be deployed BEFORE model provider keys are enabled.
 * Unavailable databases/quotas cause safe non-generative fallbacks.
 */
export type AiQuotaResult =
  | { allowed: true; subject: "user" | "guest" | "admin" }
  | { allowed: false; reason: "signin" | "quota" | "unavailable" };

/** Use only on the server, immediately before a remote model request. */
export async function reserveAiRequest({ admin = false }: { admin?: boolean } = {}): Promise<AiQuotaResult> {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    let subject: "user" | "guest" | "admin" = admin ? "admin" : "guest";
    let subjectKey = admin ? "admin" : "guest";

    if (!admin) {
      let authorization = "";
      try { authorization = getRequest().headers.get("authorization") ?? ""; }
      catch { /* No request context: treat conservatively as guest. */ }
      if (/^Bearer\s+\S{20,8192}$/i.test(authorization)) {
        const token = authorization.replace(/^Bearer\s+/i, "");
        // getUser() validates the actual bearer token against Supabase Auth;
        // never accept a user ID claimed by the client.
        const { data, error } = await supabaseAdmin.auth.getUser(token);
        if (!error && data.user?.id) {
          subject = "user";
          const bytes = new TextEncoder().encode(
            data.user.id + ":" + (process.env["AI_QUOTA_SALT"] || "shtemarm-ai-v1"),
          );
          const digest = await crypto.subtle.digest("SHA-256", bytes);
          subjectKey = "user:" + [...new Uint8Array(digest)]
            .map(b=>b.toString(16).padStart(2,"0")).join("");
        }
      }
      // The visitor-controlled browser cannot decide that they are signed in.
      // In the absence of a valid Supabase Auth user, never reserve a model
      // request or allow a paid API call. Local/cached explanations remain free.
      if (subject !== "user") return { allowed: false, reason: "signin" };
    }

    const perDay = aiQuotaLimit(
      process.env[subject === "user" ? "AI_USER_DAILY_LIMIT" :
        subject === "admin" ? "AI_ADMIN_DAILY_LIMIT" : "AI_GUEST_SHARED_DAILY_LIMIT"],
      subject === "user" ? 60 : subject === "admin" ? 80 : 30, 10000,
    );
    const globalDay = aiQuotaLimit(process.env["AI_GLOBAL_DAILY_LIMIT"], 800);
    const globalMinute = aiQuotaLimit(process.env["AI_GLOBAL_MINUTE_LIMIT"], 25, 10000);

    // The generated database types intentionally don't include migrations
    // until they are applied and regenerated. Both arguments and return type
    // are fully validated here; no client can invoke this privileged RPC.
    const { data, error } = await supabaseAdmin.rpc("reserve_ai_request" as never, {
      p_subject: subjectKey,
      p_subject_daily_limit: perDay,
      p_global_daily_limit: globalDay,
      p_global_minute_limit: globalMinute,
    } as never);
    if (error) {
      console.error("[AI quota] Reservation backend unavailable:", error.code || "rpc_error");
      return { allowed: false, reason: "unavailable" };
    }
    return data === true ? { allowed: true, subject } : { allowed: false, reason: "quota" };
  } catch {
    return { allowed: false, reason: "unavailable" };
  }
}
