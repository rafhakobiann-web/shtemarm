import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  buildArmenianOriginalBook,
  cleanPdfArtifacts,
  type ArmenianOriginalSection,
  type ArmenianOriginalAssertions,
} from "@/lib/armenian-original";
import { sectionAnswerIds } from "@/lib/books";

const counts = [
  [103, 97, 1],
  [111, 70, 3],
  [212, 110, 2],
  [200, 194, 13],
  [27, 8, 1],
  [10, 2, 0],
  [16, 6, 0],
  [204, 24, 11],
] as const;
const originals: ArmenianOriginalSection[] = counts.map((_, i) =>
  JSON.parse(readFileSync(`public/data/armenian-official-1-section${i + 1}.json`, "utf8")),
);

const assertions: ArmenianOriginalAssertions = JSON.parse(readFileSync("public/data/armenian-official-1-assertions.json", "utf8"));

describe("2018 GTC Armenian Volume I original transcription", () => {
  it("has all eight sections and the original printed question and key indices", () => {
    expect(originals).toHaveLength(8);
    originals.forEach((source, i) => {
      const [mc, short, review] = counts[i];
      expect(source.section).toBe(i + 1);
      expect(source.volume).toBe(1);
      expect(source.original).toBe(true);
      expect(source.mc).toHaveLength(mc);
      expect(source.short).toHaveLength(short);
      expect(source.reviewRequiredMC).toHaveLength(review);
      expect(source.mc.map(q => q.n)).toEqual(
        Array.from({ length: mc }, (_, n) => String(n + 1)),
      );
      expect(source.short.map(q => q.n)).toEqual(
        Array.from({ length: short }, (_, n) => String(n + 1)),
      );
      expect(source.mc.every(q => ["1", "2", "3", "4"].includes(q.answer))).toBe(true);
      expect(source.short.every(q => q.answer.trim().length > 0)).toBe(true);
    });
    const totals = counts.reduce(
      (n, [mc, short, flagged]) => [n[0] + mc, n[1] + short, n[2] + flagged],
      [0, 0, 0],
    );
    expect(totals).toEqual([883, 511, 31]);
  });

  it("converts 1,363 source tasks and 288 assertions into playable exercises", () => {
    const book = buildArmenianOriginalBook(originals, assertions);
    expect(book.id).toBe(41);
    expect(book.sections).toHaveLength(9);
    let playableMC = 0;
    let playableShort = 0;
    for (const section of book.sections) {
      expect(section.units.length).toBeGreaterThan(0);
      expect(new Set(section.units.map(u => u.id)).size).toBe(section.units.length);
      expect(new Set(sectionAnswerIds(section)).size).toBe(sectionAnswerIds(section).length);
      for (const unit of section.units) {
        if (unit.kind === "mc") {
          expect(unit.questions.length).toBeGreaterThan(0);
          expect(unit.questions.length).toBeLessThanOrEqual(20);
          playableMC += unit.questions.length;
          for (const q of unit.questions) {
            expect(q.options[q.answer]).toBeTruthy();
            expect(Object.keys(q.options)).toHaveLength(section.n === 9 ? 3 : 4);
          }
        } else if (unit.kind === "num") {
          expect(unit.questions.length).toBeGreaterThan(0);
          expect(unit.questions.length).toBeLessThanOrEqual(20);
          playableShort += unit.questions.length;
          expect(unit.questions.every(q => q.answer.length > 0)).toBe(true);
        } else {
          throw new Error("Unexpected original exercise kind");
        }
      }
    }
    expect(playableMC).toBe(1140);
    expect(playableShort).toBe(511);
  });

  it("retains the printed keys for the opening exercises and strips only PDF watermarks", () => {
    expect(originals[0].mc.slice(0, 6).map(q => q.answer)).toEqual(["4","4","3","4","4","3"]);
    expect(cleanPdfArtifacts("Տեքստ\nm\n\ntc\nՀարց")).not.toContain("tc");
  });

  it("contains all 48 PDF appendix bundles with six truth judgments each", () => {
    expect(assertions.groups).toHaveLength(48);
    expect(assertions.groups.map(g => g.n)).toEqual(
      Array.from({ length: 48 }, (_, n) => String(n + 1)),
    );
    for (const group of assertions.groups) {
      expect(group.questions).toHaveLength(6);
      expect(group.questions.every(q => q.stem.length > 8)).toBe(true);
      expect(group.questions.every(q => ["1", "2"].includes(q.answer))).toBe(true);
      expect(group.questions.every(q => q.options["3"] === "Չգիտեմ")).toBe(true);
    }
  });

  it("does not accept a missing chapter or a malformed source as a playable bank", () => {
    expect(() => buildArmenianOriginalBook(originals.slice(0, 7))).toThrow();
    expect(() => buildArmenianOriginalBook([
      { ...originals[0], mc: originals[0].mc.slice(1) },
      ...originals.slice(1),
    ])).toThrow();
  });
});
