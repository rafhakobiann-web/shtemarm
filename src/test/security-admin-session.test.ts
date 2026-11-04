import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
const read=(p:string)=>readFileSync(p,"utf8");

describe("Shtemarm admin and privacy regression",()=>{
  it("verifies identity server side before granting admin explanations access",()=>{
    const session=read("src/lib/admin-session.server.ts");
    expect(session).toContain('getRequest().headers.get("authorization")');
    expect(session).toContain("supabaseAdmin.auth.getUser(token)");
    expect(session).toContain('ADMIN_ALLOWED_USER_IDS');
    expect(session).not.toContain("localStorage");
    const api=read("src/lib/question-explanations.functions.ts");
    expect(api.split("await requireVerifiedAdminSession()").length-1).toBe(3);
    expect(api.split("checkAdmin(data.password)").length-1).toBe(3);
    for(const method of ["adminStoredExplanationIds","adminGenerateExplanation","adminSetExplanationReviewed"]){
      const block=api.slice(api.indexOf("export const "+method),api.indexOf("export const",api.indexOf("export const "+method)+9));
      expect(block.indexOf("requireVerifiedAdminSession()")).toBeLessThan(block.indexOf("checkAdmin(data.password)"));
    }
  });
  it("preserves public read-only reviewed answers with no admin session requirement",()=>{
    const api=read("src/lib/question-explanations.functions.ts");
    const pub=api.slice(api.indexOf("export const getReviewedExplanation"));
    expect(pub).toContain(".eq(\"reviewed\", true)");
    expect(pub).not.toContain("checkAdmin");
    expect(pub).not.toContain("requireVerifiedAdminSession");
  });
  it("keeps private feedback and model usage guarded",()=>{
    const feedback=read("src/lib/feedback.functions.ts");
    const quota=read("src/lib/ai-quota.server.ts");
    expect(feedback).toContain('.eq("user_id", userId)');
    expect(feedback).toContain("await requireVerifiedFeedbackAdminSession()");
    expect(quota).toContain('if (subject !== "user") return { allowed: false, reason: "signin" }');
  });
});
