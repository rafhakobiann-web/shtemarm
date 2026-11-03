import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import {
  googleOAuthMethod, googleOAuthRedirect, hasAuthenticatedSession,
} from "@/lib/google-oauth-routing";

const read = (path: string) => readFileSync(path, "utf8");

describe("Shtemarm Google sign-in and session recovery", () => {
  it("routes Lovable-hosted pages through their OAuth broker", () => {
    expect(googleOAuthMethod("shtemarm.lovable.app")).toBe("lovable");
    expect(googleOAuthMethod("id-preview--7a80cdef.lovableproject.com")).toBe("lovable");
    expect(googleOAuthMethod("project--example.lovableproject-dev.com")).toBe("lovable");
    expect(googleOAuthMethod("SHTEMARM.LOVABLE.APP")).toBe("lovable");
  });

  it("uses normal Supabase OAuth on Vercel, custom domains and development hosts", () => {
    for (const host of ["shtemarm.vercel.app", "shtemarm.am", "study.example.org", "localhost", "127.0.0.1",
      "shtemarm.lovable.app.evil.example"]) {
      expect(googleOAuthMethod(host), host).toBe("supabase");
    }
  });

  it("restricts return URLs to this origin's /auth route", () => {
    expect(googleOAuthRedirect("https://shtemarm.vercel.app")).toBe("https://shtemarm.vercel.app/auth");
    expect(googleOAuthRedirect("https://shtemarm.lovable.app/")).toBe("https://shtemarm.lovable.app/auth");
    expect(googleOAuthRedirect("http://localhost:3000")).toBe("http://localhost:3000/auth");
    expect(() => googleOAuthRedirect("http://shtemarm.vercel.app")).toThrow();
    expect(() => googleOAuthRedirect("file:///android_asset/index.html")).toThrow();
    expect(() => googleOAuthRedirect("javascript:alert(1)")).toThrow();
    expect(() => googleOAuthRedirect("https://user:secret@shtemarm.am")).toThrow();
  });

  it("requires a real access token before declaring that sign-in succeeded", () => {
    expect(hasAuthenticatedSession(null)).toBe(false);
    expect(hasAuthenticatedSession({})).toBe(false);
    expect(hasAuthenticatedSession({ access_token: "" })).toBe(false);
    expect(hasAuthenticatedSession({ access_token: "example-access-token" })).toBe(true);
  });

  it("does not navigate to home after an empty password or brokered session", () => {
    const page = read("src/routes/auth.tsx");
    expect(page).toContain('googleOAuthMethod(window.location.hostname)');
    expect(page).toContain('googleOAuthRedirect(window.location.origin)');
    expect(page).toContain('provider: "google"');
    expect(page).toContain('skipBrowserRedirect: true');
    expect(page).toContain('window.location.assign(data.url)');
    expect(page).toContain('if (!hasAuthenticatedSession(data.session))');
    expect(page).toContain('redirect_uri: redirect');
    expect(page).toContain('if (result.redirected) return;');
    expect(page).toContain('supabase.auth.getSession()');
    expect(page).not.toMatch(/SUPABASE_SERVICE_ROLE_KEY|sb_secret_/);
  });

  it("preserves normal email, registration, recovery and no-login flows", () => {
    const page = read("src/routes/auth.tsx");
    for (const method of [
      "signInWithPassword", "signUp", "resetPasswordForEmail",
      "updateUser", "signOut",
    ]) expect(page).toContain("supabase.auth." + method);
    expect(page).toContain('event === "PASSWORD_RECOVERY"');
    expect(page).toContain('tx("Շարունակել առանց մուտքի")');
    expect(page).toContain("subscription.unsubscribe()");
  });
});
