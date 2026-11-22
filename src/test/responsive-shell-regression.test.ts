import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = (path: string) => readFileSync(path, "utf8");

describe("Responsive Shtemarm layout and navigation regressions", () => {
  const header = source("src/components/AppHeader.tsx");
  const landing = source("src/routes/index.tsx");
  const dock = source("src/components/MobileNav.tsx");
  const css = source("src/adaptive-design-2026.css");
  const dashboard = source("src/routes/dashboard.tsx");
  const settings = source("src/components/PersonalizationControls.tsx");

  it("routes every subject menu item to the signed-in dashboard", () => {
    expect(header).toContain('to="/explore"');
    expect(header).toContain('to="/profile"');
    expect(header).not.toContain('to="/" search={{ subject:');
    expect(header).toContain("max-w-6xl");
    expect(header).toContain("lg:flex");
  });

  it("keeps mobile navigation simple, stable, and opaque", () => {
    expect(dock).toContain("MOBILE_TAB_TARGETS");
    expect(dock).toContain("grid-cols-4");
    expect(dock).toContain("sht-quiet-mobile-nav");
    expect(dock).not.toContain("mobile-liquid-dock");
    expect(dock).toContain("studyFocus");
  });

  it("keeps appearance and accessibility controls without a glass option", () => {
    const quiet = source("src/quiet-learning-2026.css");
    expect(settings).toContain('["classic", "soft", "atlas"]');
    expect(settings).not.toContain('["adaptive", "subtle", "balanced", "vivid"]');
    expect(settings).toContain("Larger text");
    expect(settings).toContain("High contrast");
    expect(quiet).toContain("backdrop-filter: none");
  });

  it("provides phone, tablet and desktop layouts with keyboard accessible sign-in", () => {
    expect(css).toContain("@media (max-width: 360px)");
    expect(css).toContain("@media (max-width: 767px)");
    expect(css).toContain("@media (min-width: 768px) and (max-width: 1180px)");
    expect(css).toContain("@media (min-width: 1024px)");
    expect(css).toContain("safe-area-inset-bottom");
    expect(landing).toContain('aria-label={ui.signIn} className="sht-nav-login"');
    expect(dashboard).toContain("sht-quiet-shortcuts");
    expect(css).toContain(".sht-dashboard-bento > :first-child");
  });

  it("restores meaningful home page search and social metadata", () => {
    expect(landing).toContain('property: "og:title"');
    expect(landing).toContain('property: "og:description"');
    expect(landing).toContain('name: "twitter:title"');
    expect(landing).toContain('name: "twitter:description"');
    expect(landing).toContain("Շտեմարաններ և միասնական քննությունների պատրաստում");
  });
});

