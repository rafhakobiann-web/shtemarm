import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { aiQuotaLimit, quotaMessage } from "@/lib/ai-quota-policy";

const read=(p:string)=>readFileSync(p,"utf8");

describe("Shtemarm shared AI safeguards",()=>{
  it("bounds and validates server-controlled configuration (never unlimited or zero)",()=>{
    expect(aiQuotaLimit(undefined,15)).toBe(15);
    expect(aiQuotaLimit("",15)).toBe(15);
    expect(aiQuotaLimit("16",15)).toBe(16);
    for(const bad of ["0","-1","NaN","1e20","2.5","99999999999999999999"," unlimited","01"]){
      expect(aiQuotaLimit(bad,15)).toBe(15);
    }
    expect(aiQuotaLimit("101",15,100)).toBe(15);
    expect(aiQuotaLimit("100",15,100)).toBe(100);
  });

  it("provides honest and localized quota/unavailable messaging",()=>{
    for(const lang of ["hy","en","ru"] as const){
      expect(quotaMessage("signin",lang).length).toBeGreaterThan(35);
      expect(quotaMessage("quota",lang).length).toBeGreaterThan(25);
      expect(quotaMessage("unavailable",lang).length).toBeGreaterThan(25);
      expect(quotaMessage("unavailable",lang)).not.toBe(quotaMessage("quota",lang));
    }
  });

  it("uses a service-role-only, atomic PostgreSQL reservation under the configured global caps",()=>{
    const sql=read("supabase/migrations/20261104000000_ai_request_quotas.sql");
    expect(sql).toContain("pg_advisory_xact_lock");
    expect(sql).toContain("returns boolean");
    expect(sql).toContain("security definer");
    expect(sql).toContain("enable row level security");
    expect(sql).toContain("revoke all on function");
    expect(sql).toContain("from public, anon, authenticated");
    expect(sql).toContain("to service_role");
    expect(sql).toContain("v_used_subject >= p_subject_daily_limit");
    expect(sql).toContain("v_used_daily >= p_global_daily_limit");
    expect(sql).toContain("v_used_minute >= p_global_minute_limit");
    expect(sql).not.toContain("raise notice '%', p_subject");
  });

  it("verifies signed-in identity on the server and fails closed without quota storage",()=>{
    const src=read("src/lib/ai-quota.server.ts");
    expect(src).toContain('getRequest().headers.get("authorization")');
    expect(src).toContain("supabaseAdmin.auth.getUser(token)");
    expect(src).toContain('crypto.subtle.digest("SHA-256", bytes)');
    expect(src).toContain('subjectKey = "user:"');
    expect(src).toContain('subject = "user"');
    expect(src).toContain('= admin ? "admin" : "guest"');
    expect(src).toContain('reason: "unavailable"');
    expect(src).toContain('reason: "quota"');
    expect(src).toContain('if (subject !== "user") return { allowed: false, reason: "signin" }');
    expect(src.indexOf('supabaseAdmin.auth.getUser(token)')).toBeLessThan(src.indexOf('if (subject !== "user")'));
    expect(src.indexOf('if (subject !== "user")')).toBeLessThan(src.indexOf('supabaseAdmin.rpc("reserve_ai_request"'));
    expect(src).not.toContain("x-forwarded-for");
    expect(src).not.toContain("localStorage");
  });

  it("reserves once before each remote AI operation, after answer cache lookups",()=>{
    const subject=read("src/lib/explain.functions.ts");
    const math=read("src/lib/math-explain.functions.ts");
    const chat=read("src/lib/chat.functions.ts");
    const calc=read("src/lib/calc.functions.ts");
    const translation=read("src/lib/translate.functions.ts");
    const admin=read("src/lib/question-explanations.functions.ts");
    expect(subject.indexOf("getSavedExplanation(cacheKey)")).toBeLessThan(subject.indexOf("reserveAiRequest()"));
    expect(math.indexOf("getSavedExplanation(cacheKey)")).toBeLessThan(math.indexOf("reserveAiRequest()"));
    expect(chat.indexOf("reserveAiRequest()")).toBeLessThan(chat.indexOf("for (const provider of providers)"));
    expect(calc.indexOf("reserveAiRequest()")).toBeLessThan(calc.indexOf("const parts: Part[]"));
    expect(translation).toContain("let reservation:");
    expect(translation).toContain("if (!reservation) reservation =");
    expect(translation).toContain("const budget = await ensureBudget()");
    expect(admin).toContain("reserveAiRequest({ admin: true })");
    expect(subject).toContain("if (!quota.allowed)");
    expect(chat).toContain("if (!budget.allowed)");
  });

  it("keeps all metered AI providers behind a verified account but allows free cached content",()=>{
    const translation=read("src/lib/translate.functions.ts");
    const english=read("src/lib/explain.functions.ts");
    const math=read("src/lib/math-explain.functions.ts");
    const calculator=read("src/lib/calc.functions.ts");
    const chat=read("src/lib/chat.functions.ts");
    const budget=read("src/lib/ai-quota.server.ts");
    expect(budget).toContain('if (subject !== "user") return { allowed: false, reason: "signin" }');
    expect(translation.indexOf("getDictionaryTranslation(")).toBeLessThan(translation.indexOf("reserveAiRequest()"));
    expect(translation.indexOf("getSavedExplanation(key)")).toBeLessThan(translation.indexOf("reserveAiRequest()"));
    expect(english.indexOf("getSavedExplanation(cacheKey)")).toBeLessThan(english.indexOf("reserveAiRequest()"));
    expect(math.indexOf("getSavedExplanation(cacheKey)")).toBeLessThan(math.indexOf("reserveAiRequest()"));
    expect(calculator.indexOf("reserveAiRequest()")).toBeLessThan(calculator.indexOf("callGemini(key, parts)"));
    expect(chat.indexOf("reserveAiRequest()")).toBeLessThan(chat.indexOf("for (const provider of providers)"));
    expect(translation).toContain("if (!budget.allowed)");
    expect(math).toContain("if (budget && !budget.allowed)");
    expect(calculator).toContain("if (!budget.allowed)");
    expect(chat).toContain("if (!budget.allowed)");
  });

  it("labels offline fallbacks instead of passing them off as AI responses",()=>{
    expect(read("src/components/UnitCard.tsx")).toContain("Տեղային բացատրություն (առանց AI-ի)");
    expect(read("src/components/MathExplain.tsx")).toContain("Local explanation (no AI)");
    expect(read("src/routes/chat.tsx")).toContain("Տեղային պատասխան (առանց AI-ի)");
    expect(read("src/components/MathExplain.tsx")).toContain("if (!r.error && !r.offline)");
  });

  it("keeps keys out of VITE/browser code and documents the required migration",()=>{
    const env=read(".env.example");
    const doc=read("docs/AI_SETUP.md");
    expect(env).toContain("AI_USER_DAILY_LIMIT=60");
    expect(env).toContain("AI_GLOBAL_DAILY_LIMIT=800");
    expect(doc).toContain("20261104000000_ai_request_quotas.sql");
    expect(doc).toContain("Fail-closed");
    expect(doc).toContain("zero anonymous metered calls");
    expect(env).not.toContain("VITE_GEMINI_API_KEY");
    expect(env).not.toContain("VITE_GROQ_API_KEY");
  });
});
