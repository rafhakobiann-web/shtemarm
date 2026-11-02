import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const source = (path: string) => readFileSync(path, "utf8");

describe("SEO and accessible page headings", () => {
  it("uses an informative home document title and distinct social sharing metadata", () => {
    const home = source("src/routes/index.tsx");
    expect(home).toContain('title: "Shtemarm | Շտեմարաններ և միասնական քննությունների պատրաստում"');
    expect(home).toContain('property: "og:title"');
    expect(home).toContain('property: "og:description"');
    expect(home).toContain('name: "twitter:title"');
    expect(home).toContain('name: "twitter:description"');
    expect(home).not.toContain('property: "og:title", content: "Shtemarm"');
    expect(home).toContain("<h1");
  });

  it("renders a page heading during math practice, loading, and errors", () => {
    const math = source("src/routes/math.play.tsx");
    expect(math).toContain('const pageHeading = <h1');
    expect(math).toContain('role="status"');
    expect(math).toContain('role="alert"');
    expect(math).toContain('<div className="w-full">{pageHeading}</div>');
    expect(math.match(/<h1\b/g)?.length).toBe(1);
  });

  it("uses an accessible H1 for a study section even before book data loads", () => {
    const study = source("src/routes/study.$bookId.$sectionId.tsx");
    expect(study).toContain("<h1");
    expect(study).toContain('secTitle(section)');
    expect(study).toContain('tx("Շտեմարան {book} · Բաժին {n}"');
    expect(study.match(/<h1\b/g)?.length).toBe(1);
  });

  it("reuses existing semantic H1 headings instead of introducing duplicates", () => {
    const examHero = source("src/components/ExamDesign.tsx");
    const historySession = source("src/components/HistorySession.tsx");
    expect(examHero).toContain("<h1");
    expect(historySession).toContain("<h1");
    for (const name of ["BiologyWorkspace", "HistoryWorkspace", "WorkbookExamWorkspace", "PhysicsWorkspace"]) {
      const content = source(`src/components/${name}.tsx`);
      expect(content).toContain("<ExamHero");
      expect(content).not.toContain("<h1");
    }
    for (const name of ["PhysicsSourceReader", "PhysicsOriginalWorkspace", "PhysicsScanPractice"]) {
      expect(source(`src/components/${name}.tsx`)).toContain("<h1");
    }
  });

  it("keeps the existing Search Console verification tag, without making an ownership claim", () => {
    const root = source("src/routes/__root.tsx");
    expect(root).toContain('name: "google-site-verification"');
    expect(root).toContain("<HeadContent />");
    expect(root).toContain("<head>");
  });
});
