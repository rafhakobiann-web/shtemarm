import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { googleAuthRedirect } from "@/lib/google-auth";

describe("Shtemarm Google OAuth safeguards", () => {
  it("returns only the same-site /auth callback", () => {
    expect(googleAuthRedirect("https://shtemarm.am")).toBe("https://shtemarm.am/auth");
    expect(googleAuthRedirect("https://shtemarm.lovable.app/anything?next=https://attacker.test")).toBe(
      "https://shtemarm.lovable.app/auth",
    );
    expect(googleAuthRedirect("http://localhost:5173")).toBe("http://localhost:5173/auth");
  });

  it("rejects insecure or credential-bearing origins", () => {
    for (const origin of [
      "http://example.com", "javascript:alert(1)", "https://user:pass@example.com",
      "file:///data/test", "http://example.com@other.test",
    ]) expect(() => googleAuthRedirect(origin)).toThrow();
  });

  it("keeps Google optional, handles offline state, and preserves existing login", () => {
    const source = readFileSync("src/routes/auth.tsx", "utf8");
    expect(source).toContain('lovable.auth.signInWithOAuth("google"');
    expect(source).toContain('provider: "google"');
    expect(source).toContain("googleAuthRedirect(window.location.origin)");
    expect(source).toContain("hasSupabaseConfig()");
    expect(source).toContain("signInWithPassword");
    expect(source).toContain("signUp");
    expect(source).toContain("disabled={busy}");
    expect(source).not.toContain("client_secret");
  });
});
