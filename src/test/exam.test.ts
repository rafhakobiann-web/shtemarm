import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { buildExam, buildCustom, unitPoints, type Book } from "@/lib/books";

const load = (n: number) => JSON.parse(readFileSync(`public/data/book${n}.json`, "utf8")) as Book;

describe("exam", () => {
  it.each([1, 2, 3])("book %i exam has 80 questions (random builds)", (n) => {
    const book = load(n);
    for (let k = 0; k < 200; k++) {
      const items = buildExam(book);
      expect(items.reduce((a, i) => a + unitPoints(i.unit), 0)).toBe(80);
    }
  });
  it("custom test respects chosen sections", () => {
    const items = buildCustom(load(1), [3], 20);
    expect(items.every((i) => i.section === 3)).toBe(true);
    expect(items.length).toBe(20);
  });
});
