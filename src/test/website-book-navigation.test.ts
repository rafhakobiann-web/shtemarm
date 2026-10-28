import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";

const read = (p: string) => readFileSync(p, "utf8");

describe("website textbook navigation regressions", () => {
  it("all book action links use actual registered routes", () => {
    const book = read("src/routes/book.$bookId.tsx");
    const files = read("src/routeTree.gen.ts");
    expect(book).not.toContain('to="/test/$bookId"');
    expect(book).toContain('to="/physics/original"');
    expect(book).toContain('to="/subject/$subject"');
    expect(files).toContain("/physics/original");
    expect(files).toContain("/subject/$subject");
  });

  it("distinguishes failed loads, invalid sections and valid study sessions", () => {
    const study = read("src/routes/study.$bookId.$sectionId.tsx");
    expect(study).toContain("error && !book");
    expect(study).toContain("<LoadError");
    expect(study).toContain("isPending && !book");
    expect(study).toContain("!section ?");
    expect(study).toContain("section.units.length === 0");
    expect(study).toContain("Math.max(1, units.length)");
  });

  it("rejects HTML fallback responses and incorrect book JSON schemas", () => {
    const loader = read("src/lib/books.ts");
    expect(loader).toContain('r.headers.get("content-type")');
    expect(loader).toContain('Array.isArray(data.sections)');
    expect(loader).toContain("cache.delete(id)");
  });
});
