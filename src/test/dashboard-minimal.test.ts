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
    expect(profile).toContain("<DashboardFocus name={name} progress={progress} subjects={subjects} />");
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

  it("does not expand any question-book category by default", () => {
    expect(dashboard).toContain('defaultOpen={libraryFilter !== "all"}');
    expect(dashboard).not.toContain('title={tx("Անգլերեն")} defaultOpen>');
    expect(dashboard).not.toContain('title={tx("Մաթեմատիկա")} defaultOpen>');
    expect(dashboard).toContain('libraryFilter === "other" && <SubjectRow');
    expect(dashboard).toContain('id="subjects"');
    expect(dashboard).toContain('id="exams"');
    expect(dashboard).toContain('data-dashboard-more-exams');
  });

  it("retains access to every study route through optional tools and catalogues", () => {
    for (const destination of [
      "/study-plan", "/mistakes", "/chat", "/flashcards", "/mini-games",
      "/calc", "/feedback", "/download", "/math", "/history", "/biology",
    ]) {
      expect(dashboard).toContain(destination);
    }
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
