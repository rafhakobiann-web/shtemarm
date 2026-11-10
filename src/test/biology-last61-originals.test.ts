import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { mergeBiologyExtended } from "@/lib/biology-extended";
import { scoreUnit } from "@/components/UnitCard";
import type { Book, Unit } from "@/lib/books";

const load = (name: string): Book => JSON.parse(readFileSync(`public/data/${name}.json`, "utf8")) as Book;
const allUnits = (book: Book): Unit[] => book.sections.flatMap((s) => s.units);

describe("last 61 original Biology III/IV tasks", () => {
  for (const { volume, expectedLast, expectedTotal, sourceHash } of [
    { volume: 3, expectedLast: 28, expectedTotal: 1837, sourceHash: "adc0ddf59fa1008d6dd50f8d41583e44aa7161d2e23bc83f62b4c482e0722b93" },
    { volume: 4, expectedLast: 33, expectedTotal: 1688, sourceHash: "9e0ec096451705d5a5b80da9c0c4ca405f888a7a39c6572b5f63aac180ce597e" },
  ]) {
    const original = load(`bio-book${volume}`);
    const supplemental = load(`biology-extended-book${volume}`);
    const pending = load(`biology-pending-book${volume}`);
    const last = load(`biology-last61-book${volume}`);
    const merged = mergeBiologyExtended(
      mergeBiologyExtended(mergeBiologyExtended(original, supplemental), pending),
      last,
    );
    const restored = allUnits(last);
    const combined = allUnits(merged);

    it(`volume ${volume} has every source-numbered task exactly once`, () => {
      expect(restored).toHaveLength(expectedLast);
      expect(combined).toHaveLength(expectedTotal);
      expect(new Set(combined.map((u) => u.id)).size).toBe(expectedTotal);
      expect(last.id).toBe(30 + volume);
      expect((last as Book & { source?: { sha256?: string } }).source?.sha256).toBe(sourceHash);
      for (const [sectionIdx, section] of merged.sections.entries()) {
        const max = (volume === 3 ? [305, 310, 347, 337, 166, 372] : [232, 300, 301, 338, 214, 303])[section.n - 1];
        const ids = new Set(section.units.map((u) => Number(u.label)));
        expect(ids.size, `volume ${volume} section ${section.n} index ${sectionIdx}`).toBe(max);
        for (let n = 1; n <= max; n++) expect(ids.has(n), `bio${volume}-s${section.n}-q${n}`).toBe(true);
      }
    });

    it(`volume ${volume} preserves actual task content and printed answer keys`, () => {
      for (const section of last.sections) for (const unit of section.units) {
        expect(unit.id).toBe(`bio${volume}-s${section.n}-q${unit.label}`);
        expect(JSON.stringify(unit), unit.id).not.toMatch(/\ufffd|www\.atc\.am/);
        const source = unit as Unit & { sourcePage: number; sourceAnswerPage: number };
        expect(source.sourcePage, unit.id).toBeGreaterThan(0);
        expect(source.sourceAnswerPage, unit.id).toBeGreaterThan(source.sourcePage);
        const response =
          unit.kind === "mc" || unit.kind === "num"
            ? { mc: Object.fromEntries(unit.questions.map((q) => [q.n, q.answer])) }
            : unit.kind === "match" ? { match: unit.answer } : { nums: unit.answer };
        const score = scoreUnit(unit, response);
        expect(score.got, unit.id).toBe(score.total);
        expect(scoreUnit(unit, undefined).got, unit.id).toBe(0);
        if (unit.kind === "mc") {
          expect(unit.questions.every((q) => q.stem.trim().length > 8), unit.id).toBe(true);
          expect(unit.questions.every((q) => q.options[q.answer]?.length > 0), unit.id).toBe(true);
          if (unit.questions.length === 6) {
            expect(unit.questions.every((q) => q.options["1"] === "Ճիշտ է" && q.options["2"] === "Սխալ է"), unit.id).toBe(true);
          }
        } else {
          expect(unit.passage.length, unit.id).toBeGreaterThan(40);
        }
      }
    });
  }

  it("retains the repeating printed sequence and the original two-part problem", () => {
    const b4 = load("biology-last61-book4");
    const q188 = allUnits(b4).find((u) => u.id === "bio4-s1-q188");
    expect(q188?.kind).toBe("seq");
    if (q188?.kind === "seq") expect(q188.answer).toEqual([4, 3, 2, 1, 2]);
    const b3 = load("biology-last61-book3");
    const q24 = allUnits(b3).find((u) => u.id === "bio3-s6-q24");
    expect(q24?.kind).toBe("mc");
    if (q24?.kind === "mc") {
      expect(q24.questions.map((q) => q.n)).toEqual(["24.1", "24.2"]);
      expect(q24.questions.map((q) => q.answer)).toEqual(["1", "3"]);
    }
  });
});
