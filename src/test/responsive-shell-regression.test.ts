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

  it("does not capture native tab taps before horizontal drag intent", () => {
    expect(dock).toContain("Only a proven horizontal drag takes pointer ownership");
    expect(dock).toContain("dx > 12 && dx > dy * 1.2");
    expect(dock).toContain("dy > 9 && dy > dx");
    const pointerDown = dock.split("const dockDown = ")[1]!.split("const dockMove = ")[0]!;
    expect(pointerDown).not.toContain("setPointerCapture");
    const pointerMove = dock.split("const dockMove = ")[1]!.split("const dockEnd = ")[0]!;
    expect(pointerMove).toContain("setPointerCapture");
    expect(css).toContain("touch-action: pan-y");
  });

  it("keeps appearance controls usable in classic, academic and glass themes", () => {
    expect(css).toContain(".sht-palette-picker > summary");
    expect(css).toContain(".sht-palette-colors button");
    expect(css).toContain("data-glass-quality=\"lite\"");
    expect(css).toContain('data-glass-blur="off"');
    expect(settings).toContain("sm:grid-cols-4");
    expect(settings).toContain('(["adaptive", "subtle", "balanced", "vivid"]');
  });

  it("provides phone, tablet and desktop layouts with keyboard accessible sign-in", () => {
    expect(css).toContain("@media (max-width: 360px)");
    expect(css).toContain("@media (max-width: 767px)");
    expect(css).toContain("@media (min-width: 768px) and (max-width: 1180px)");
    expect(css).toContain("@media (min-width: 1024px)");
    expect(css).toContain("safe-area-inset-bottom");
    expect(landing).toContain('aria-label={ui.signIn} className="sht-nav-login"');
    expect(dashboard).toContain("sht-dashboard-shortcuts sht-home-action-grid");
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
