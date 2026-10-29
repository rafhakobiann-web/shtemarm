import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { timingSafeEqual } from "node:crypto";

const SubmitInput = z.object({
  message: z.string().trim().min(1).max(2000),
  contact: z.string().trim().max(200).optional(),
  clientId: z.string().uuid(),
});

export const submitFeedback = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => SubmitInput.parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const cutoff = new Date(Date.now() - 60_000).toISOString();
    const { data: recent, error: lookupError } = await supabaseAdmin.from("feedback")
      .select("id").eq("client_id", data.clientId).gte("created_at", cutoff).limit(1);
    if (lookupError) { console.error("[feedback] rate-limit lookup failed", lookupError.code); throw new Error("service_unavailable"); }
    if (recent?.length) throw new Error("rate_limited");
    const { error } = await supabaseAdmin.from("feedback").insert({
      message: data.message,
      contact: data.contact ? data.contact : null,
      client_id: data.clientId,
    });
    if (error) { console.error("[feedback] write failed", error.code); throw new Error("service_unavailable"); }
    return { ok: true };
  });

export const getMyFeedback = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ clientId: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("feedback")
      .select("id, message, reply, created_at, replied_at")
      .eq("client_id", data.clientId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) { console.error("[feedback] read failed", error.code); throw new Error("service_unavailable"); }
    return rows ?? [];
  });

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
    z.object({ password: z.string().min(1).max(200), id: z.string().uuid(), reply: z.string().trim().min(1).max(4000) }).parse(input),
  )
  .handler(async ({ data }) => {
    checkAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("feedback")
      .update({ reply: data.reply, replied_at: new Date().toISOString() })
      .eq("id", data.id);
    if (error) throw new Error("save failed");
    return { ok: true };
  });
