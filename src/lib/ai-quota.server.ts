import { createHash } from "node:crypto";
import { getRequest } from "@tanstack/react-start/server";

/**
 * Fail-closed shared AI budget. No client-provided IDs or IP addresses can
 * choose a higher quota. User identity is verified by Supabase Auth and only
 * a one-way digest is written to the service-role-only usage table.
 *
 * The SQL migration must be deployed BEFORE model provider keys are enabled.
 * Unavailable databases/quotas cause safe non-generative fallbacks.
 */
export type AiQuotaResult =
  | { allowed: true; subject: "user" | "guest" | "admin" }
  | { allowed: false; reason: "quota" | "unavailable" };

export function aiQuotaLimit(input: string | undefined, defaultValue: number, maximum = 100000): number {
  if (!input || !/^[1-9]\d*$/.test(input)) return defaultValue;
  const n = Number(input);
  return Number.isSafeInteger(n) && n <= maximum ? n : defaultValue;
}

export function quotaMessage(reason: "quota" | "unavailable", lang: "hy" | "en" | "ru" = "hy"): string {
  const labels = {
    hy: {
      quota: "ԱԲ հարցումների սահմանաչափը լրացել է։ Օգտվիր պատրաստի բացատրություններից կամ փորձիր ավելի ուշ։",
      unavailable: "ԱԲ հարցումների անվտանգ սահմանափակման ծառայությունը ժամանակավորապես հասանելի չէ։ Փորձիր ավելի ուշ։",
    },
    en: {
      quota: "The AI usage limit has been reached. Try saved explanations or come back later.",
      unavailable: "The AI usage protection service is temporarily unavailable. Please try later.",
    },
    ru: {
      quota: "Лимит запросов к ИИ исчерпан. Используй сохранённые объяснения или попробуй позже.",
      unavailable: "Сервис контроля запросов к ИИ временно недоступен. Попробуй позже.",
    },
  } as const;
  return labels[lang][reason];
}

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
          subjectKey = "user:" + createHash("sha256")
            .update(data.user.id + ":" + (process.env["AI_QUOTA_SALT"] || "shtemarm-ai-v1"))
            .digest("hex");
        }
      }
    }

    const perDay = aiQuotaLimit(
      process.env[subject === "user" ? "AI_USER_DAILY_LIMIT" :
        subject === "admin" ? "AI_ADMIN_DAILY_LIMIT" : "AI_GUEST_SHARED_DAILY_LIMIT"],
      subject === "user" ? 15 : subject === "admin" ? 80 : 20, 10000,
    );
    const globalDay = aiQuotaLimit(process.env["AI_GLOBAL_DAILY_LIMIT"], 200);
    const globalMinute = aiQuotaLimit(process.env["AI_GLOBAL_MINUTE_LIMIT"], 15, 10000);

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
