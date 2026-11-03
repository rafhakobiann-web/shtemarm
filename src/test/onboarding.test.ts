import { describe, expect, it, beforeEach } from "vitest";
import { readOnboarding, saveOnboarding, ONBOARDING_KEY } from "@/lib/onboarding";
describe("onboarding and legacy progress preservation",()=>{
  beforeEach(()=>localStorage.clear());
  it("stores preferences separately for each account",()=>{
    expect(saveOnboarding("user-a",{subjects:["english","math"],goal:"exam",completedAt:"2026-11-03"})).toBe(true);
    expect(readOnboarding("user-a")?.subjects).toEqual(["english","math"]);
    expect(readOnboarding("user-b")).toBeNull();
  });
  it("does not overwrite legacy progress",()=>{
    const old='{"answers":{"old":0},"xp":180,"streak":2}';
    localStorage.setItem("shtemaran-progress-v1",old);
    saveOnboarding("u",{subjects:["armenian"],goal:"review",completedAt:"2026-11-03"});
    expect(localStorage.getItem("shtemaran-progress-v1")).toBe(old);
  });
  it("rejects invalid stored profiles",()=>{
    localStorage.setItem(ONBOARDING_KEY+":u",JSON.stringify({subjects:["not-a-subject"],goal:"exam",completedAt:"now"}));
    expect(readOnboarding("u")).toBeNull();
  });
});
