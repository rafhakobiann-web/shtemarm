import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const read = (path: string) => readFileSync(path, "utf8");

describe("cohesive learning workspace 2026", () => {
  it("loads the modern shared shell after legacy layout styles", () => {
    const root = read("src/routes/__root.tsx");
    expect(root).toContain('modernWorkspaceCss from "../modern-workspace-2026.css?url"');
    expect(root.indexOf("href: modernWorkspaceCss")).toBeGreaterThan(root.indexOf("href: minimalLayoutCss"));
    const css = read("src/modern-workspace-2026.css");
    expect(css).toContain(".site-mobile-nav.mobile-liquid-dock");
    expect(css).toContain(".sht-explore-header");
    expect(css).toContain("prefers-reduced-motion: reduce");
  });

  it("provides meaningful study mode, progress and response review controls", () => {
    const study = read("src/routes/study.$bookId.$sectionId.tsx");
    const questions = read("src/components/UnitCard.tsx");
    expect(study).toContain("sht-study-workspace");
    expect(study).toContain("sht-study-mode-switch");
    expect(study).toContain('aria-current={mode === m ? "page" : undefined}');
    expect(study).toContain("recordUnitMistakes");
    expect(questions).toContain("sht-study-unit-meter");
    expect(questions).toContain("aria-valuenow={checkedCount}");
    expect(questions).toContain('type="radio"');
    expect(questions).toContain("disabled={show}");
    expect(read("src/study-comfort.css")).toContain(".answer-option:has(input:checked:not(:disabled))");
  });

  it("keeps book search linked to the original section index for progress", () => {
    const source = read("src/routes/book.$bookId.tsx");
    expect(source).toContain('type="search"');
    expect(source).toContain("matchingSections.map(({ section: s, index: sectionIndex })");
    expect(source).toContain("sectionIds[sectionIndex]");
    expect(source).toContain("secTitle(section)");
    expect(source).toContain('to="/study/$bookId/$sectionId"');
  });

  it("offers localized study tools with a direct mistakes destination", () => {
    const source = read("src/routes/study-tools.tsx");
    const summary = read("src/components/StudyTools.tsx");
    expect(source).toContain("sht-tools-grid");
    expect(source).toContain('"Flashcards"');
    expect(source).toContain('"Карточки"');
    expect(summary).toContain('Link to="/mistakes"');
    expect(summary).not.toContain('Link to="/auth"');
  });
});
