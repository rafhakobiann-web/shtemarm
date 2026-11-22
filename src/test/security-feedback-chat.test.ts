import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { readChatContext, sealChatContext, type VerifiedChatTurn } from "@/lib/chat-context.server";

const read = (path:string)=>readFileSync(path,"utf8");
const originalKey=process.env["CHAT_CONTEXT_SIGNING_KEY"];
beforeEach(()=>{process.env["CHAT_CONTEXT_SIGNING_KEY"]="test-only-chat-signing-secret-long-enough-for-hmac-2026";});
afterEach(()=>{
  vi.restoreAllMocks();
  if(originalKey===undefined)delete process.env["CHAT_CONTEXT_SIGNING_KEY"];
  else process.env["CHAT_CONTEXT_SIGNING_KEY"]=originalKey;
});

describe("Shtemarm private feedback and non-forgeable AI context",()=>{
  it("authenticates the assistant's previous answer via HMAC",async()=>{
    const history:VerifiedChatTurn[]=[
      {role:"user",content:"Solve 2x = 10"},
      {role:"assistant",content:"Divide both sides by 2: x = 5."},
    ];
    const token=await sealChatContext(history);
    expect(token).toBeTypeOf("string");
    expect((await readChatContext(token))).toEqual(history);
    const [payload,signature]=token!.split(".");
    const tamperedSignature=(signature![0]==="A"?"B":"A")+signature!.slice(1);
    expect(await readChatContext(payload+"."+tamperedSignature)).toEqual([]);
    expect(await readChatContext("forged_assistant_reply")).toEqual([]);
    expect(await readChatContext("a".repeat(60000))).toEqual([]);
  });

  it("rejects expired, malformed or changed-signing-key history",async()=>{
    const now=Date.now();
    const clock=vi.spyOn(Date,"now");
    clock.mockReturnValue(now);
    const token=await sealChatContext([{role:"assistant",content:"Verified tutor response"}]);
    clock.mockReturnValue(now+3*60*60*1000+1);
    expect(await readChatContext(token)).toEqual([]);
    clock.mockReturnValue(now);
    process.env["CHAT_CONTEXT_SIGNING_KEY"]="second-different-secret-for-security-regression-2026";
    expect(await readChatContext(token)).toEqual([]);
  });

  it("accepts only a student's question over the wire, not client-chosen roles",()=>{
    const server=read("src/lib/chat.functions.ts");
    const ui=read("src/routes/chat.tsx");
    expect(server).toContain('question: z.string().trim().min(1).max(2000)');
    expect(server).toContain('contextToken: z.string().max(56000).optional()');
    expect(server).toContain("}).strict();");
    expect(server).toContain("readChatContext(data.contextToken)");
    expect(server).toContain("sealChatContext([");
    expect(server).not.toContain('role: z.enum(["user","assistant"])');
    expect(server).not.toContain("data.messages");
    expect(ui).toContain("question:content");
    expect(ui).toContain("contextToken:contextTokenRef.current");
    expect(ui).not.toContain("messages: next.filter");
    expect(ui).not.toContain("localStorage.setItem(MODE_KEY, messages)");
    expect(ui).not.toContain("localStorage.setItem(MODE_KEY, contextTokenRef");
  });

  it("keeps private feedback inaccessible via anonymous browser grants",()=>{
    const revocation=read("supabase/migrations/20261104113500_private_feedback_grants.sql");
    const quota=read("supabase/migrations/20261104114500_feedback_owner_and_limits.sql");
    expect(revocation).toContain("revoke all privileges on table public.feedback from public, anon, authenticated");
    expect(quota).toContain("alter table public.feedback add column if not exists user_id uuid");
    expect(quota).toContain("enable row level security");
    expect(quota).toContain("revoke all privileges on table public.feedback");
    expect(quota).toContain("security definer");
    expect(quota).toContain("pg_advisory_xact_lock");
    expect(quota).toContain("from public, anon, authenticated");
    expect(quota).toContain("to service_role");
  });

  it("allows only verified signed-in owners to read their own messages",()=>{
    const api=read("src/lib/feedback.functions.ts");
    const ui=read("src/routes/feedback.tsx");
    const types=read("src/integrations/supabase/types.ts");
    expect(api).toContain("getVerifiedFeedbackUserId()");
    expect(api).toContain("supabaseAdmin.auth.getUser(token)");
    expect(api).toContain('.eq("user_id", userId)');
    expect(api).toContain("user_id: userId");
    expect(api).toContain("if (!userId) return []");
    expect(api).toContain("await requireVerifiedFeedbackAdminSession();");
    expect(api).toContain('checkAdmin(data.password)');
    expect(api).toContain('reserve_feedback_submission');
    expect(api.indexOf('reserve_feedback_submission')).toBeLessThan(api.indexOf('.from("feedback").insert('));
    expect(ui).toContain("getMyFeedback({ data: {} })");
    expect(types).toContain("user_id?: string | null");
    expect(api).not.toContain("return rows ?? [];\n  });\n\nfunction checkAdmin");
  });

  it("retains write-only guest feedback while limiting anonymous abuse globally",()=>{
    const sql=read("supabase/migrations/20261104114500_feedback_owner_and_limits.sql");
    const api=read("src/lib/feedback.functions.ts");
    expect(sql).toContain("v_client >= 5 or v_total >= 250 or v_per_minute >= 12");
    expect(sql).toContain("revoke all on function public.reserve_feedback_submission(text)");
    expect(api).toContain('userId ? "user:" + userId : "guest:" + data.clientId');
    expect(api).toContain('crypto.subtle.digest("SHA-256"');
    expect(api).toContain('if (reserved !== true) throw new Error("rate_limited")');
  });
});
