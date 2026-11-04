import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { GUEST_DEMO, guestCardSwipe } from "@/lib/guest-demo";

const read = (path:string)=>readFileSync(path,"utf8");

describe("Try-before-sign-up guest demo",()=>{
  it("provides original, answerable sample questions in all three UI languages",()=>{
    for(const lang of ["hy","en","ru"] as const){
      const {words,questions,cards}=GUEST_DEMO[lang];
      expect(words.title.length).toBeGreaterThan(12);
      expect(words.noSignup.length).toBeGreaterThan(5);
      expect(words.note.length).toBeGreaterThan(20);
      expect(words.create.length).toBeGreaterThan(5);
      expect(questions).toHaveLength(3);
      expect(cards).toHaveLength(3);
      for(const question of questions){
        expect(question.stem.length).toBeGreaterThan(10);
        expect(question.options).toHaveLength(4);
        expect(question.correct).toBeGreaterThanOrEqual(0);
        expect(question.correct).toBeLessThan(question.options.length);
        expect(question.why.length).toBeGreaterThan(12);
      }
      for(const card of cards){
        expect(card.front.trim()).not.toBe("");
        expect(card.back.trim()).not.toBe("");
        expect(card.context.trim()).not.toBe("");
      }
    }
  });

  it("maps touch gestures left to known, right to review and preserves vertical scroll",()=>{
    expect(guestCardSwipe(-125,10)).toBe("known");
    expect(guestCardSwipe(100,-5)).toBe("review");
    expect(guestCardSwipe(-30,2)).toBe(null);
    expect(guestCardSwipe(90,100)).toBe(null);
    expect(guestCardSwipe(70,70)).toBe(null);
    expect(guestCardSwipe(Number.NaN,0)).toBe(null);
  });

  it("allows only the isolated demo publicly, not real books or account study areas",()=>{
    const root=read("src/routes/__root.tsx");
    expect(root).toContain('const PUBLIC_PATHS = new Set(["/", "/try", "/auth", "/about", "/privacy", "/terms", "/download"])');
    expect(root).toContain('const publicView=location.pathname==="/" || location.pathname==="/try"');
    expect(root).toContain('href: guestExperienceCss');
    expect(root).toContain('if(isPublic)return <>{children}</>');
    expect(root).not.toContain('"/dashboard", "/try"');
  });

  it("links to the public demo before asking visitors to create an account",()=>{
    const landing=read("src/routes/index.tsx");
    const route=read("src/routes/try.tsx");
    expect(landing.split('to="/try"').length-1).toBeGreaterThanOrEqual(3);
    expect(landing).toContain('tryNow: "Try without signing up"');
    expect(landing).toContain('tryNow: "Փորձել առանց գրանցվելու"');
    expect(landing).toContain('tryNow: "Попробовать без регистрации"');
    expect(route).toContain('createFileRoute("/try")');
    expect(route).toContain('to="/auth"');
    expect(route).toContain('to="/"');
    expect(route).toContain('GUEST_DEMO[lang]');
    expect(route).toContain("setChallengeStarted(true)");
    expect(route).toContain("onPointerCancel");
  });

  it("keeps guest answers session-only and does not reach protected resources",()=>{
    const source=read("src/routes/try.tsx");
    const examples=read("src/lib/guest-demo.ts");
    for(const disallowed of ["loadBook(","supabase.auth","localStorage","sessionStorage","fetch(","pullAndMerge(","questionBank","realQuestions"]) {
      expect(source).not.toContain(disallowed);
      expect(examples).not.toContain(disallowed);
    }
    expect(source).toContain('aria-pressed={revealed}');
    expect(source).toContain("guestCardSwipe(");
    expect(examples).toContain("not copied question-bank content");
  });

  it("keeps phone targets reachable and motion optional",()=>{
    const css=read("src/guest-experience-2026.css");
    expect(css).toContain("touch-action:pan-y");
    expect(css).toContain("@media (max-width:640px)");
    expect(css).toContain("@media (max-width:350px)");
    expect(css).toContain("@media (prefers-reduced-motion:reduce)");
    expect(css).toContain("html.user-reduced-motion");
    expect(css).toContain(":focus-visible");
  });
});
