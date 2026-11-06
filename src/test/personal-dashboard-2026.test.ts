import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
const read = (path:string)=>readFileSync(path,"utf8");

describe("approved Shtemarm dashboard and tutor choices",()=>{
  it("keeps the dashboard focused while preserving personalized tools",()=>{
    const page=read("src/routes/dashboard.tsx");
    const explore=read("src/routes/explore.tsx");
    const profile=read("src/routes/profile.tsx");
    expect(page).toContain('sht-home-subject-grid');
    expect(page).toContain('id="subjects"');
    expect(page).toContain('to="/explore"');
    expect(page).toContain("DashboardOverview");
    expect(explore).toContain('to="/study-plan"');
    expect(explore).toContain('to="/mistakes"');
    expect(explore).toContain('to="/chat"');
    expect(profile).toContain("DashboardFocus");
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
