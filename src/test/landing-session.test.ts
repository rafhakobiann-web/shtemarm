import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { landingActionLabel, landingDestination } from "@/lib/landing-session";

const source = (path: string) => readFileSync(path, "utf8");

describe("public landing is available for visitors and signed-in students", () => {
  it("sends signed-in students and signed-out visitors to the Dashboard, and waits on auth while loading", () => {
    expect(landingDestination("signed-in")).toBe("/dashboard");
    expect(landingDestination("signed-out")).toBe("/dashboard");
    expect(landingDestination("loading")).toBe("/auth");
    expect(landingDestination("unavailable")).toBe("/auth");
    expect(landingActionLabel("en", "signed-in")).toBe("Go to my dashboard");
    expect(landingActionLabel("hy", "signed-in")).toContain("վահանակ");
    expect(landingActionLabel("ru", "signed-in")).toContain("кабинет");
  });

  it("does not redirect a signed-in visitor away from /", () => {
    const landing = source("src/routes/index.tsx");
    const root = source("src/routes/__root.tsx");
    expect(landing).toContain("landingDestination(sessionStatus)");
    expect(landing).toContain("onAuthStateChange");
    expect(landing).not.toContain('navigate({ to: "/dashboard", replace: true })');
    expect(root).toContain('!onboarded&&!isPublic&&pathname!=="/onboarding"');
    expect(root).toContain('const PUBLIC_PATHS = new Set(["/",');
    // Guests may open only the trial paths; everything else still fails closed.
    expect(root).toContain('const GUEST_TRIAL_PATH = /^\\/(dashboard|book\\/\\d+|study\\/\\d+\\/\\d+)$/;');
    expect(root).toContain('if(status==="signed-out"&&!isPublic&&!isGuestTrial)');
  });

  it("changes all main landing actions but not the download destination", () => {
    const landing = source("src/routes/index.tsx");
    const demo = source("src/components/LandingLabV3.tsx");
    expect(landing).toContain('to={entryTo}');
    expect(landing).toContain('<LandingHeroLab lang={lang} entryTo={entryTo} />');
    expect(landing).toContain('<LandingExperiences lang={lang} entryTo={entryTo} />');
    expect(demo).toContain('to={entryTo}');
    expect(demo).toContain('to="/download"');
    expect(landing).toContain('to="/dashboard" search={{ subject: key');
    expect(landing).toContain('to="/subject/$subject" params={{ subject: "physics" }}');
  });
});
