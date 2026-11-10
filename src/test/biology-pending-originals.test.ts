import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { mergeBiologyExtended } from "@/lib/biology-extended";
import { scoreUnit } from "@/components/UnitCard";
import type { Book, Unit } from "@/lib/books";

const read = (name: string): Book => JSON.parse(readFileSync(`public/data/${name}.json`, "utf8")) as Book;
const unitsOf = (book: Book): Unit[] => book.sections.flatMap((section) => section.units);

describe("Biology III/IV missing original task imports", () => {
  const scenarios = [
    { volume: 3, added: 587, playable: 1809, indexed: 1837, sourceHash: "adc0ddf59fa1008d6dd50f8d41583e44aa7161d2e23bc83f62b4c482e0722b93" },
    { volume: 4, added: 620, playable: 1655, indexed: 1688, sourceHash: "9e0ec096451705d5a5b80da9c0c4ca405f888a7a39c6572b5f63aac180ce597e" },
  ] as const;

  for (const { volume, added, playable, indexed, sourceHash } of scenarios) {
    const base = read(`bio-book${volume}`);
    const earlier = read(`biology-extended-book${volume}`);
    const pending = read(`biology-pending-book${volume}`);
    const imported = unitsOf(pending);
    const merged = mergeBiologyExtended(mergeBiologyExtended(base, earlier), pending);

    it(`volume ${volume}: includes all new source-numbered tasks without losing existing progress IDs`, () => {
      const beforeIds = new Set([...unitsOf(base), ...unitsOf(earlier)].map((u) => u.id));
      const afterIds = unitsOf(merged).map((u) => u.id);
      expect(pending.id).toBe(30 + volume);
      expect((pending as Book & { source?: { sha256?: string } }).source?.sha256).toBe(sourceHash);
      expect(imported).toHaveLength(added);
      expect(afterIds).toHaveLength(playable);
      expect(new Set(afterIds).size).toBe(playable);
      for (const id of beforeIds) expect(afterIds).toContain(id);
      expect(indexed - playable).toBe(volume === 3 ? 28 : 33);
      for (const section of pending.sections) {
        for (const unit of section.units) {
          expect(unit.id).toBe(`bio${volume}-s${section.n}-q${unit.label}`);
          expect(beforeIds.has(unit.id), unit.id).toBe(false);
        }
      }
    });

    it(`volume ${volume}: every added task has a keyed, scoreable answer and visible source text`, () => {
      for (const unit of imported) {
        expect(unit.passage.length, unit.id).toBeGreaterThan(20);
        if (unit.kind === "mc" && unit.questions.length === 6) {
          expect(unit.questions.every((q) => q.stem.length > 8 && !/^Պնդում \d+$/.test(q.stem)), unit.id).toBe(true);
          expect(unit.questions.every((q) => q.options["1"] === "Ճիշտ է" && q.options["2"] === "Սխալ է"), unit.id).toBe(true);
        }
        expect(JSON.stringify(unit), unit.id).not.toContain("\\ufffd");
        const response = unit.kind === "mc" || unit.kind === "num"
          ? { mc: Object.fromEntries(unit.questions.map((q) => [q.n, q.answer])) }
          : unit.kind === "match"
            ? { match: unit.answer }
            : { nums: unit.answer };
        const score = scoreUnit(unit, response);
        expect(score.got, unit.id).toBe(score.total);
        expect(scoreUnit(unit, undefined).got, unit.id).toBe(0);
      }
    });
  }

  it("restores 1,207 printed exercises; only 61 of the 3,525 indexed exercises remain unimported", () => {
    expect(scenarios.reduce((n, x) => n + x.added, 0)).toBe(1207);
    expect(scenarios.reduce((n, x) => n + x.playable, 0)).toBe(3464);
    expect(scenarios.reduce((n, x) => n + x.indexed - x.playable, 0)).toBe(61);
  });
});
