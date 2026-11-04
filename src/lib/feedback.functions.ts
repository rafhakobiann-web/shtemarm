import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { timingSafeEqual } from "node:crypto";

const SubmitInput = z.object({
  message: z.string().trim().min(1).max(2000),
  contact: z.string().trim().max(200).optional(),
  clientId: z.string().min(8).max(100).regex(/^[a-zA-Z0-9-]+$/),
});

export const submitFeedback = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => SubmitInput.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const userId = await getVerifiedFeedbackUserId();

    // Never trust a user-controlled clientId as sole anti-abuse protection.
    // Signed-in accounts share their own quota even if the browser ID changes.
    const quotaSource = (userId ? "user:" + userId : "guest:" + data.clientId) +
      ":" + (process.env["FEEDBACK_QUOTA_SALT"] || "shtemarm-feedback-v1");
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(quotaSource));
    const clientHash = [...new Uint8Array(digest)]
      .map(byte=>byte.toString(16).padStart(2,"0")).join("");
    const { data: reserved, error: quotaError } = await supabaseAdmin.rpc(
      "reserve_feedback_submission" as never, {p_client_hash:clientHash} as never,
    );
    if (quotaError) {
      console.error("[feedback] quota service unavailable", quotaError.code);
      throw new Error("service_unavailable");
    }
    if (reserved !== true) throw new Error("rate_limited");

    const cutoff = new Date(Date.now() - 60_000).toISOString();
    const { data: recent, error: lookupError } = await supabaseAdmin.from("feedback")
      .select("id").eq("client_id", data.clientId).gte("created_at", cutoff).limit(1);
    if (lookupError) { console.error("[feedback] rate-limit lookup failed", lookupError.code); throw new Error("service_unavailable"); }
    if (recent?.length) throw new Error("rate_limited");
    const { error } = await supabaseAdmin.from("feedback").insert({
      message: data.message,
      contact: data.contact ? data.contact : null,
      client_id: data.clientId,
      user_id: userId,
    });
    if (error) { console.error("[feedback] write failed", error.code); throw new Error("service_unavailable"); }
    return { ok: true };
  });

/**
 * Feedback authorship is tied ONLY to a verified Supabase identity.
 * Guest feedback remains write-only. A browser clientId never authorizes
 * reading another visitor's message or reply.
 */
async function getVerifiedFeedbackUserId():Promise<string|null> {
  const { getRequest } = await import("@tanstack/react-start/server");
  let token:string;
  try {
    const authorization = getRequest().headers.get("authorization") ?? "";
    if (!/^Bearer\\s+\\S{20,8192}$/i.test(authorization)) return null;
    token = authorization.replace(/^Bearer\\s+/i,"");
  } catch { return null; }
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  return error ? null : data.user?.id ?? null;
}

export const getMyFeedback = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({}).strict().parse(input))
  .handler(async () => {
    const userId = await getVerifiedFeedbackUserId();
    if (!userId) return [] as {
      id:string; message:string; reply:string|null;
      created_at:string; replied_at:string|null;
    }[];
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin.from("feedback")
      .select("id, message, reply, created_at, replied_at")
      .eq("user_id", userId).order("created_at",{ascending:false}).limit(100);
    if (error) throw new Error("load failed");
    return rows ?? [];
  });

/** The administrative password is not an unauthenticated API token. */
async function requireVerifiedFeedbackAdminSession() {
  if (!await getVerifiedFeedbackUserId()) throw new Error("unauthorized");
}

function checkAdmin(password: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) throw new Error("admin not configured");
  const supplied = Buffer.from(password, "utf8");
  const secret = Buffer.from(expected, "utf8");
  if (supplied.length !== secret.length || !timingSafeEqual(supplied, secret)) {
    throw new Error("unauthorized");
  }
}

export const adminListFeedback = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ password: z.string().min(1).max(200) }).parse(input))
  .handler(async ({ data }) => {
    await requireVerifiedFeedbackAdminSession();
    checkAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("feedback")
      .select("id, message, contact, reply, created_at, replied_at")
      .order("created_at", { ascending: false })
      .limit(300);
    if (error) throw new Error("load failed");
    return rows ?? [];
  });

export const adminReplyFeedback = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z.object({ password: z.string().min(1).max(200), id: z.string().min(8).max(100).regex(/^[a-zA-Z0-9-]+$/), reply: z.string().trim().min(1).max(4000) }).parse(input),
  )
  .handler(async ({ data }) => {
    await requireVerifiedFeedbackAdminSession();
    checkAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("feedback")
      .update({ reply: data.reply, replied_at: new Date().toISOString() })
      .eq("id", data.id);
    if (error) throw new Error("save failed");
    return { ok: true };
  });
