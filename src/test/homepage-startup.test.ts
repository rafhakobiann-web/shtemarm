import { readFileSync } from "node:fs";
import { describe, expect, it, vi } from "vitest";
import { normalizeProgress } from "@/lib/progress";
import { hasSupabaseConfig } from "@/integrations/supabase/client";

const read = (p: string) => readFileSync(p, "utf8");

describe("Shtemarm public home resilient to cloud/auth issues", () => {
  it("does not require Supabase keys for unauthenticated study access", () => {
    const oldUrl = process.env.SUPABASE_URL;
    const oldKey = process.env.SUPABASE_PUBLISHABLE_KEY;
    vi.stubEnv("VITE_SUPABASE_URL", "");
    vi.stubEnv("VITE_SUPABASE_PUBLISHABLE_KEY", "");
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_PUBLISHABLE_KEY;
    try {
      expect(hasSupabaseConfig()).toBe(false);
    } finally {
      if (oldUrl !== undefined) process.env.SUPABASE_URL = oldUrl;
      if (oldKey !== undefined) process.env.SUPABASE_PUBLISHABLE_KEY = oldKey;
      vi.unstubAllEnvs();
    }
  });
  it("guards cloud sync on every global entry path", () => {
    expect(read("src/routes/__root.tsx")).toContain("if (!hasSupabaseConfig()) return;");
    expect(read("src/components/AppHeader.tsx")).toContain("if (!hasSupabaseConfig())");
    expect(read("src/routes/index.tsx")).toContain("ensureBrowserSupabaseConfig");
    expect(read("src/lib/progress.ts")).toContain("if (!hasSupabaseConfig()) return;");
  });
  it("handles older or corrupted local progress instead of crashing render", () => {
    expect(normalizeProgress(null).answers).toEqual({});
    expect(normalizeProgress({ answers: null, xp: "oops" }).answers).toEqual({});
    expect(normalizeProgress({ answers: null, xp: "oops" }).xp).toBe(0);
    expect(normalizeProgress({ answers: { good: 1, wrong: 0, invalid: null }, exams: "broken" })).toMatchObject({
      answers: { good: 1, wrong: 0 },
      exams: [],
    });
    expect(normalizeProgress({ answers: ["wrong shape"], streak: -4 }).streak).toBe(0);
  });
});
