import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { BIO_BOOKS } from "@/lib/books";

const read = (path: string) => readFileSync(path, "utf8");

describe("Biology I–IV cover artwork is consistent", () => {
  it("points all four book metadata entries at available SVG covers", () => {
    expect(BIO_BOOKS.map((b) => b.cover)).toEqual([
      "/covers/bio-1.svg", "/covers/bio-2.svg",
      "/covers/bio-3.svg", "/covers/bio-4.svg",
    ]);
    for (const book of BIO_BOOKS) {
      expect(existsSync(`public${book.cover}`), book.cover).toBe(true);
    }
    const catalog = read("src/routes/dashboard.tsx");
    expect(catalog).toContain('cover: "/covers/bio-3.svg"');
    expect(catalog).toContain('cover: "/covers/bio-4.svg"');
    expect(catalog).not.toMatch(/bio-[34]\.webp/);
  });

  it("uses the identical visual template, dimensions and typography for every volume", () => {
    const covers = [1,2,3,4].map(n => read(`public/covers/bio-${n}.svg`));
    for (const [i, svg] of covers.entries()) {
      const part = i + 1;
      expect(svg).toContain('width="720" height="960" viewBox="0 0 720 960"');
      expect(svg).toContain(`aria-label="ԿԵՆՍԱԲԱՆՈՒԹՅՈՒՆ · ՄԱՍ ${part}"`);
      expect(svg).toContain(`>ՄԱՍ ${part}</text>`);
      expect(svg).toContain('font-size="56" font-weight="900">ԿԵՆՍԱԲԱՆՈՒԹՅՈՒՆ');
      expect(svg).toContain('font-size="60" font-weight="900"');
      expect(svg).toContain('letter-spacing="5">SHTEMARM');
      expect(svg).toContain('<circle cx="570" cy="255" r="250"/>');
      expect(svg).toContain('<circle cx="570" cy="255" r="180"/>');
      expect(svg).toContain('LEARN · PRACTICE · SUCCEED');
      expect(svg).toContain('linearGradient id="g"');
    }
  });

  it("keeps picture-free Biology question rendering unchanged", () => {
    const reader = read("src/components/BiologyQuestionFromPdf.tsx");
    expect(reader).not.toContain("<img");
    expect(reader).not.toContain("<canvas");
    expect(read("src/routes/book.$bookId.tsx")).toContain("<BookCover src={meta.cover}");
  });
});
