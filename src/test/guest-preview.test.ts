import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import {
  GUEST_QUESTIONS, GUEST_SUBJECTS, GUEST_SUBJECT_NAMES,
  guestQuestionFor, isGuestSubject,
} from "@/lib/guest-preview";

describe("public guest practice content", () => {
  it("offers two original exercises for every supported subject", () => {
    expect(GUEST_SUBJECTS).toHaveLength(6);
    expect(new Set(GUEST_SUBJECTS).size).toBe(6);
    for (const subject of GUEST_SUBJECTS) {
      const questions = GUEST_QUESTIONS[subject];
      expect(questions, subject).toHaveLength(2);
      expect(guestQuestionFor(subject, 0)).toBe(questions[0]);
      expect(guestQuestionFor(subject, 2)).toBeUndefined();
    }
  });

  it("has valid options, feedback, and subject names in all UI languages", () => {
    for (const subject of GUEST_SUBJECTS) {
      for (const lang of ["hy", "en", "ru"] as const)
        expect(GUEST_SUBJECT_NAMES[subject][lang].trim().length).toBeGreaterThan(2);
      for (const question of GUEST_QUESTIONS[subject]) {
        expect(Number.isInteger(question.correct)).toBe(true);
        expect(question.correct).toBeGreaterThanOrEqual(0);
        for (const lang of ["hy", "en", "ru"] as const) {
          expect(question.options[lang]).toHaveLength(4);
          expect(new Set(question.options[lang]).size).toBe(4);
          expect(question.correct).toBeLessThan(question.options[lang].length);
          expect(question.prompt[lang].trim().length).toBeGreaterThan(9);
          expect(question.explanation[lang].trim().length).toBeGreaterThan(18);
        }
      }
    }
  });

  it("uses two independent original English reading passages", () => {
    const passages = GUEST_QUESTIONS.english.map(item => item.reading);
    expect(passages).toHaveLength(2);
    expect(passages[0]).not.toBe(passages[1]);
    passages.forEach(passage => expect(passage?.split(" ").length).toBeGreaterThan(12));
    for (const subject of GUEST_SUBJECTS.filter(s => s !== "english"))
      expect(GUEST_QUESTIONS[subject].every(q => !q.reading)).toBe(true);
  });

  it("validates guest subject slugs without granting access to protected routes", () => {
    expect(isGuestSubject("math")).toBe(true);
    expect(isGuestSubject("history")).toBe(true);
    expect(isGuestSubject("dashboard")).toBe(false);
    expect(isGuestSubject("../dashboard")).toBe(false);
    expect(isGuestSubject(undefined)).toBe(false);
  });
});

describe("public guest routing and privacy", () => {
  const text = (path: string) => readFileSync(path, "utf8");

  it("makes only the isolated guest route public and keeps the main auth boundary fail-closed", () => {
    const root = text("src/routes/__root.tsx");
    expect(root).toContain('"/guest"');
    expect(root).toContain('const publicView=location.pathname==="/" || location.pathname==="/guest"');
    expect(root).toContain('if(status==="signed-out"&&!isPublic)');
    expect(root).toContain('if(status!=="signed-in"||!userId)');
    expect(root).not.toContain('PUBLIC_PATHS.add("/dashboard")');
  });

  it("keeps guest answers ephemeral and separate from auth, progress and question banks", () => {
    const route = text("src/routes/guest.tsx");
    const data = text("src/lib/guest-preview.ts");
    expect(route).toContain('createFileRoute("/guest")');
    expect(route).toContain("setCorrectCount");
    expect(route).toContain("role=\"status\"");
    for (const file of [route, data]) {
      expect(file).not.toMatch(/\blocalStorage\b|\bsessionStorage\b|\bfetch\(|supabase\.|pullAndMerge/);
    }
  });

  it("links the guest demo from both the landing and the auth fallback", () => {
    const landing = text("src/routes/index.tsx");
    const auth = text("src/routes/auth.tsx");
    const tree = text("src/routeTree.gen.ts");
    expect(landing).toContain('to="/guest" search={{ subject: key }}');
    expect(landing).toContain('to="/guest" search={{ subject: "math" }}');
    expect(auth).toContain('to="/guest" search={{ subject: "math" }}');
    expect(tree).toContain('GuestRoute: GuestRoute');
  });
});
