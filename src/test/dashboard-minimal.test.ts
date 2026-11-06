import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const source = (path: string) => readFileSync(path, "utf8");

describe("focused student dashboard and protected profile", () => {
  const dashboard = source("src/routes/dashboard.tsx");
  const profile = source("src/routes/profile.tsx");
  const focus = source("src/components/DashboardFocus.tsx");
  const root = source("src/routes/__root.tsx");
  const header = source("src/components/AppHeader.tsx");

  it("keeps detailed report widgets off the dashboard but exposes them in My Profile", () => {
    expect(dashboard).toContain("<DashboardOverview name={name} progress={progress} />");
    expect(dashboard).not.toContain("<DashboardFocus");
    expect(profile).toContain("<DashboardFocus name={name} progress={progress} subjects={subjects} showGreeting={false} />");
    expect(source("src/components/DashboardOverview.tsx")).toContain('to="/profile"');
  });

  it("makes all seven detailed report sections optional in profile", () => {
    expect(focus.match(/<details className="group\/profile-detail/g)).toHaveLength(7);
    expect(focus).toContain("Օրվա ուսումնական նպատակ");
    expect(focus).toContain("Քննության պատրաստվածություն");
    expect(focus).toContain("Շաբաթական հաշվետվություն");
    expect(focus).toContain("Իմ ուսումնական ակտիվությունը");
    expect(focus).toContain("Իմ նվաճումները");
    expect(focus).toContain('grid grid-cols-2 gap-3 md:grid-cols-4');
  });

  it("replaces the old full catalogue with six subject cards and three useful next steps", () => {
    expect(dashboard).toContain("sht-home-subject-grid");
    expect(dashboard).toContain('id="subjects"');
    expect(dashboard).toContain('id="exams"');
    expect(dashboard).not.toContain('LIBRARY_FILTERS.map');
    expect(dashboard).toContain('to="/explore"');
    expect(dashboard).toContain('to="/study-tools"');
    expect(dashboard).toContain('to="/profile"');
    expect(dashboard).toContain('ARMENIAN_BOOKS.map');
  });

  it("keeps all study and exam destinations in the dedicated explorer", () => {
    const explore = source("src/routes/explore.tsx");
    for (const route of [
      "/study-plan","/mistakes","/chat","/flashcards","/mini-games",
      "/math","/history","/biology","/study-tools",
    ]) {
      expect(explore+dashboard).toContain(route);
    }
    expect(explore).toContain("EXPLORE_SUBJECTS");
    expect(explore).toContain("type=\"search\"");
  });

  it("protects the profile route and makes it available from the account menu", () => {
    expect(profile).toContain('createFileRoute("/profile")');
    expect(profile).toContain('noindex, nofollow');
    expect(root).not.toContain('PUBLIC_PATHS.add("/profile")');
    expect(root).not.toMatch(/PUBLIC_PATHS = new Set\(\[[^\]]*"\/profile"/);
    expect(root).toContain('if(status==="signed-out"&&!isPublic)');
    expect(header).toContain('email && <Link to="/profile"');
    expect(source("src/routeTree.gen.ts")).toContain("ProfileRoute: ProfileRoute");
  });
});
