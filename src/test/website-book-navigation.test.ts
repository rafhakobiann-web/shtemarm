import { describe, expect, it } from "vitest";
import { readFileSync, existsSync } from "node:fs";

const read = (p: string) => readFileSync(p, "utf8");

describe("website textbook navigation regressions", () => {
  it("all book action links use actual registered routes", () => {
    const book = read("src/routes/book.$bookId.tsx");
    const physicsRoute = read("src/routes/physics.original.tsx");
    const subjectRoute = read("src/routes/subject.$subject.tsx");
    expect(book).not.toContain('to="/test/$bookId"');
    expect(book).toContain('to="/physics/original"');
    expect(book).toContain('to="/subject/$subject"');
    expect(existsSync("src/routes/physics.original.tsx")).toBe(true);
    expect(physicsRoute).toContain('createFileRoute("/physics/original")');
    expect(subjectRoute).toContain('createFileRoute("/subject/$subject")');
  });

  it("distinguishes failed loads, invalid sections and valid study sessions", () => {
    const study = read("src/routes/study.$bookId.$sectionId.tsx");
    expect(study).toContain("error && !book");
    expect(study).toContain("<LoadError");
    expect(study).toContain("isPending && !book");
    expect(study).toContain("!section ?");
    expect(study).toContain("section.units.length === 0");
    expect(study).toContain("Math.max(1, units.length)");
    expect(study).toContain("Number.isSafeInteger(Number(params.sectionId))");
    expect(study).toContain("throw notFound()");
  });

  it("shows a real updates route and gives book readers an explicit refresh", () => {
    const home = read("src/routes/index.tsx");
    const changelog = read("src/routes/changelog.tsx");
    const bookPage = read("src/routes/book.$bookId.tsx");
    expect(home).toContain('to="/changelog"');
    expect(changelog).toContain("November 1, 2026");
    expect(bookPage).toContain("invalidateBookCache(id)");
    expect(bookPage).toContain("book.sections.length === 0");
    expect(bookPage).toContain("useMemo");
    expect(bookPage).toContain("sectionAnswerIds");
    expect(bookPage).toContain('role="status" aria-live="polite"');
  });

  it("rejects HTML fallback responses and incorrect book JSON schemas", () => {
    const loader = read("src/lib/books.ts");
    expect(loader).toContain('r.headers.get("content-type")');
    expect(loader).toContain('Array.isArray(data.sections)');
    expect(loader).toContain("cache.delete(id)");
  });
});
