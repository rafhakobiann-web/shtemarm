import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { buildExam, buildCustom, unitPoints, type Book } from "@/lib/books";

const load = (n: number) => {
  const filePath = resolve(process.cwd(), `public/data/book${n}.json`);
  return JSON.parse(readFileSync(filePath, "utf8")) as Book;
};

describe("exam structure and points", () => {
  it("book exam has 80 questions totaling 20 points (0.25 each)", () => {
    const items = buildExam(load(1));
    
    expect(items.length).toBe(80);
    
    const firstTen = items.slice(0, 10);
    expect(firstTen.every((i) => i.section === 1)).toBe(true);
    
    const totalPoints = items.reduce((a, i) => a + unitPoints(i.unit), 0);
    expect(totalPoints).toBe(20);
  });

  it("custom test respects chosen sections and limits", () => {
    const items = buildCustom(load(1), [3], 20);
    expect(items.every((i) => i.section === 3)).toBe(true);
    expect(items.length).toBe(20);
  });
});
