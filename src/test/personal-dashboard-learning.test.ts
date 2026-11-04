import { beforeEach, describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { parseStudyResume, readStudyResume, saveStudyResume } from "@/lib/study-resume";

const alice="2e8d7792-1c11-4a12-9fa3-aaaaabbbbcdd";
const bob="3e8d7792-1c11-4a12-9fa3-aaaaabbbbcdd";
const now=Date.now();
const resume={bookId:1,sectionId:2,mode:"classic" as const,visitedAt:now};

describe("Personal dashboard, feedback and adaptive learning",()=>{
  beforeEach(()=>window.localStorage.clear());

  it("saves the last study section for one verified account on this device",()=>{
    expect(saveStudyResume(alice,resume)).toBe(true);
    expect(readStudyResume(alice)).toEqual(resume);
    expect(readStudyResume(bob)).toBe(null);
    expect(saveStudyResume("",resume)).toBe(false);
    expect(saveStudyResume("spoofed/account",resume)).toBe(false);
  });
  it("rejects unsafe, stale, future or invalid study destinations",()=>{
    expect(parseStudyResume({...resume,bookId:999999})).toBe(null);
    expect(parseStudyResume({...resume,sectionId:0})).toBe(null);
    expect(parseStudyResume({...resume,sectionId:NaN})).toBe(null);
    expect(parseStudyResume({...resume,mode:"admin"})).toBe(null);
    expect(parseStudyResume({...resume,visitedAt:now-181*24*60*60_000},now)).toBe(null);
    expect(parseStudyResume({...resume,visitedAt:now+100000},now)).toBe(null);
    expect(parseStudyResume({...resume,secret:"ignore"})).toEqual(resume);
    window.localStorage.setItem("shtemarm:resume:v1:"+alice,"not-json");
    expect(readStudyResume(alice)).toBe(null);
  });
  it("renders a true account-scoped Continue Learning link on the dashboard",()=>{
    const dash=readFileSync("src/routes/dashboard.tsx","utf8");
    const study=readFileSync("src/routes/study.$bookId.$sectionId.tsx","utf8");
    expect(dash).toContain("readStudyResume(data.user.id)");
    expect(dash).toContain('to="/study/$bookId/$sectionId"');
    expect(dash).toContain("search={{mode:resume.mode}}");
    expect(dash).toContain('to="/study-tools"');
    expect(study).toContain("saveStudyResume(data.user.id");
    expect(study).toContain("supabase.auth.getUser()");
    expect(study).not.toContain("saveStudyResume(data.user?.id");
  });
  it("keeps immediate feedback accessible without expensive animation requirements",()=>{
    const source=readFileSync("src/components/UnitCard.tsx","utf8");
    expect(source.split('aria-live="polite"').length-1).toBeGreaterThanOrEqual(2);
    expect(source).toContain("role=\"status\"");
    expect(source).toContain("motion-reduce:transition-none");
    expect(source).toContain("{text && <RichExplanation text={text} error={failed}/>}"); // build regression
  });
});
