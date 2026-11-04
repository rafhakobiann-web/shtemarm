import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
const read = (path:string)=>readFileSync(path,"utf8");

describe("approved Shtemarm dashboard and tutor choices",()=>{
  it("puts personalized daily plan, mistake review and tutor before the subject catalog",()=>{
    const page=read("src/routes/dashboard.tsx");
    expect(page).toContain('aria-label={tx("Իմ ուսումնական ուղին")}');
    const panel=page.indexOf('aria-label={tx("Իմ ուսումնական ուղին")}');
    const subjects=page.indexOf('id="subjects"');
    expect(panel).toBeGreaterThan(0);
    expect(panel).toBeLessThan(subjects);
    expect(page.slice(panel,subjects)).toContain('to="/study-plan"');
    expect(page.slice(panel,subjects)).toContain('to="/mistakes"');
    expect(page.slice(panel,subjects)).toContain('to="/chat"');
    expect(page).not.toContain('to="/auth" className="inline-flex shrink-0');
  });
  it("persists only tutor mode and not private chat messages or signed context",()=>{
    const page=read("src/routes/chat.tsx");
    expect(page).toContain('const MODE_KEY = "shtemarm:tutor-mode:v1"');
    expect(page).toContain('saved === "hint" || saved === "explain" || saved === "quiz"');
    expect(page).toContain("setMode(readPreferredMode())");
    expect(page).toContain("localStorage.setItem(MODE_KEY, next)");
    expect(page).not.toContain("localStorage.setItem(MODE_KEY, messages)");
    expect(page).not.toContain("localStorage.setItem(MODE_KEY, contextTokenRef");
    expect(page).toContain('"(prefers-reduced-motion: reduce)"');
  });
  it("keeps interactive learning and student privacy guardrails intact",()=>{
    const plan=read("src/routes/study-plan.tsx");
    const chat=read("src/lib/chat.functions.ts");
    const quota=read("src/lib/ai-quota.server.ts");
    expect(plan).toContain("buildStudyPlan(");
    expect(plan).toContain("getMistakes()");
    expect(chat).toContain("readChatContext(data.contextToken)");
    expect(quota).toContain('if (subject !== "user") return { allowed: false, reason: "signin" }');
  });
});
