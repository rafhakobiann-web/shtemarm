import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { buildExam, unitPoints, type Book } from "@/lib/books";

const loadBiology = (part: 1 | 2) =>
  JSON.parse(readFileSync(resolve(process.cwd(), `public/data/bio-book${part}.json`), "utf8")) as Book;

describe("biology exam builder", () => {
  it.each([1, 2] as const)("builds an 80-question exam from Biology Book %i", (part) => {
    const book = loadBiology(part);
    const items = buildExam(book, 30 + part);
    expect(items.reduce((total, item) => total + unitPoints(item.unit), 0)).toBe(80);
    expect(items).toHaveLength(80);
    expect(new Set(items.map((item) => item.unit.id)).size).toBe(80);
    expect(items.every((item) => book.sections.some((section) =>
      section.n === item.section && section.units.some((unit) => item.unit.id === unit.id || item.unit.id.startsWith(`${unit.id}-q`)),
    ))).toBe(true);
  });

  it("uses the actual topic names for Biology Book 2 and removes stray OCR marks", () => {
    const book = loadBiology(2);
    expect(book.sections.map((section) => section.label)).toEqual([
      "Կենդանի օրգանիզմների բազմազանությունը",
      "Մարդ",
      "Կենդանի նյութի քիմիական կազմավորվածությունը",
      "Բջջի կենսական փուլերը",
      "Էվոլյուցիոն տեսություն",
    ]);
    const allStrings: string[] = [];
    const visit = (value: unknown): void => {
      if (typeof value === "string") allStrings.push(value);
      else if (Array.isArray(value)) value.forEach(visit);
      else if (value && typeof value === "object") Object.values(value).forEach(visit);
    };
    visit(book);
    expect(allStrings.some((value) => /\.a\b|\btc\b/i.test(value))).toBe(false);
  });
});
