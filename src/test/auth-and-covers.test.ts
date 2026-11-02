import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { authFeedback } from "@/lib/auth-feedback";
import { BIO_BOOKS, BOOKS, HISTORY_BOOKS, ARMENIAN_BOOKS } from "@/lib/books";

const file = (path: string) => readFileSync(path, "utf8");

describe("Authentication recovery and book covers", () => {
  it("keeps the auth page usable without backend configuration and handles OAuth exceptions", () => {
    const auth = file("src/routes/auth.tsx");
    expect(auth).toContain("hasSupabaseConfig()");
    expect(auth).toContain('if (!configured) return (');
    expect(auth).toContain('lovable.auth.signInWithOAuth("google"');
    expect(auth).toContain("result.redirected");
    expect(auth).toContain("supabase.auth.signInWithPassword");
    expect(auth).toContain("supabase.auth.signUp");
    expect(auth).toContain("supabase.auth.resetPasswordForEmail");
    expect(auth).toContain("supabase.auth.updateUser");
    expect(auth).toContain("supabase.auth.signOut");
    expect(auth).toContain('event === "PASSWORD_RECOVERY"');
    expect(auth).toContain("finally {");
    expect(auth).toContain('role="alert"');
    expect(auth).toContain("onAuthStateChange");
    expect(auth).toContain("subscription.unsubscribe()");
    expect(auth).not.toMatch(/SUPABASE_SERVICE_ROLE_KEY|sb_secret_/);
  });

  it("uses actionable, non-sensitive auth failure messages", () => {
    expect(authFeedback(new Error("Invalid login credentials"))).toContain("Սխալ էլ. փոստ");
    expect(authFeedback(new Error("Email not confirmed"))).toContain("Հաստատիր");
    expect(authFeedback(new Error("Failed to fetch"))).toContain("կապ");
    expect(authFeedback(new Error("redirect_uri_mismatch"))).toContain("Google");
    expect(authFeedback(new Error("arbitrary opaque provider traceback"))).not.toContain("traceback");
  });

  it("uses actual existing cover assets, with fallback and no images in question cards", () => {
    const coverComponent = file("src/components/BookCover.tsx");
    expect(coverComponent).toContain("onError={() => setFailed(true)}");
    expect(coverComponent).toContain("setFailed(false)");
    expect(file("src/routes/index.tsx")).toContain("<BookCover src={cover}");
    expect(file("src/routes/book.$bookId.tsx")).toContain('<BookCover src={meta.cover}');
    for (const book of [...BOOKS, ...HISTORY_BOOKS, ...BIO_BOOKS, ...ARMENIAN_BOOKS]) {
      expect(existsSync("public" + book.cover), book.cover).toBe(true);
    }
    const sourcePractice = file("src/components/BiologyQuestionFromPdf.tsx");
    expect(sourcePractice).not.toContain("<img");
    expect(sourcePractice).not.toContain("<canvas");
  });
});
