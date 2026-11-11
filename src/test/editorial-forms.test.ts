import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
const read = (path: string) => readFileSync(path, "utf8");

describe("video-led editorial forms", () => {
  it("loads its styles after the existing site theme", () => {
    const root = read("src/routes/__root.tsx");
    expect(root).toContain('editorialFormsCss from "../editorial-forms-2026.css?url"');
    expect(root.indexOf("href: editorialFormsCss")).toBeGreaterThan(root.indexOf("href: modernWorkspaceCss"));
  });

  it("keeps account operations while providing labeled fields and explicit states", () => {
    const auth = read("src/routes/auth.tsx");
    for (const name of ["signInWithPassword", "signUp", "resetPasswordForEmail", "updateUser", "signOut", "getSession"]) {
      expect(auth).toContain(name);
    }
    expect(auth).toContain('onSubmit={e => { void submit(e); }}');
    expect(auth).toContain('role="alert"');
    expect(auth).toContain('sht-auth-mode-tabs');
    expect(auth).toContain('aria-pressed={mode === "in"}');
    expect(auth).toContain('aria-pressed={mode === "up"}');
    expect(auth).toContain('htmlFor="sht-auth-email"');
    expect(auth).toContain('htmlFor="sht-auth-password"');
    expect(auth).toContain('type={showPassword ? "text" : "password"}');
    expect(auth).toContain('disabled={busy}');
    expect(auth).toContain("oauthReturnPath(next)");
    expect(auth).not.toContain('<main className="sht-auth-form-panel">');
  });

  it("keeps onboarding data and progress while adding clear selections", () => {
    const onboarding = read("src/routes/onboarding.tsx");
    expect(onboarding).toContain("saveOnboarding(userId,{subjects,goal,completedAt:new Date().toISOString()})");
    expect(onboarding).toContain('disabled={!userId || !complete}');
    expect(onboarding).toContain('ONBOARDING_SUBJECTS.map');
    expect(onboarding).toContain('aria-pressed={active}');
    expect(onboarding).toContain('aria-pressed={goal === id}');
    expect(onboarding).toContain('role="progressbar"');
    expect(onboarding).toContain('aria-valuenow={complete ? 2 : 1}');
    expect(onboarding).not.toContain('<main className="sht-onboard-form">');
  });

  it("uses typography, contrast and restrained state transitions rather than faux glass", () => {
    const css = read("src/editorial-forms-2026.css");
    expect(css).toContain(".sht-auth-story-content h2");
    expect(css).toContain(".sht-onboard-subject[aria-pressed=\"true\"]");
    expect(css).toContain(".sht-auth-field input:focus-visible");
    expect(css).toContain(".sht-auth-form-heading");
    expect(css).toContain("@media (max-width: 767px)");
    expect(css).toContain("@media (prefers-reduced-motion: reduce)");
    expect(css).toContain("@media (forced-colors: active)");
    expect(css).not.toContain("backdrop-filter:");
    expect(css).not.toContain("linear-gradient(");
  });
});
