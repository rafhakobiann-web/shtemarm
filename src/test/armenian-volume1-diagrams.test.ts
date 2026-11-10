import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  applyArmenianDiagramCorrections,
  buildArmenianOriginalBook,
  type ArmenianDiagramCorrections,
  type ArmenianOriginalSection,
} from "@/lib/armenian-original";

const sources: ArmenianOriginalSection[] = Array.from({ length: 8 }, (_, i) =>
  JSON.parse(readFileSync(`public/data/armenian-official-1-section${i + 1}.json`, "utf8")),
);
const corrections: ArmenianDiagramCorrections = JSON.parse(
  readFileSync("public/data/armenian-official-1-diagrams.json", "utf8"),
);
const expectedAnswers = {
  "89": "4", "90": "3", "91": "3", "92": "2", "93": "1",
  "94": "2", "95": "4", "97": "2", "98": "3",
};

describe("Armenian Volume I, nine reconstructed sentence diagrams", () => {
  it("releases exactly nine verified-page questions while preserving their printed keys", () => {
    const corrected = applyArmenianDiagramCorrections(sources, corrections);
    const syntax = corrected[3];
    expect(syntax.reviewRequiredMC).toEqual([]);
    expect(syntax.mc.filter(q => q.reviewRequired)).toHaveLength(0);
    for (const [n, answer] of Object.entries(expectedAnswers)) {
      const q = syntax.mc.find(q => q.n === n);
      expect(q).toBeDefined();
      expect(q?.answer).toBe(answer);
      expect(q?.stem?.length).toBeGreaterThan(60);
      expect(Object.keys(q?.diagramOptions ?? {})).toEqual(["1", "2", "3", "4"]);
      for (const diagram of Object.values(q?.diagramOptions ?? {})) {
        const ids = diagram.nodes.map(node => node[0]);
        expect(new Set(ids).size).toBe(ids.length);
        for (const [from, to] of [...diagram.branches, ...diagram.equals]) {
          expect(ids).toContain(from);
          expect(ids).toContain(to);
        }
      }
    }
    const book = buildArmenianOriginalBook(corrected);
    const multipleChoice = book.sections.flatMap(s => s.units)
      .filter(u => u.kind === "mc")
      .reduce((total, u) => total + u.questions.length, 0);
    const shortAnswer = book.sections.flatMap(s => s.units)
      .filter(u => u.kind === "num")
      .reduce((total, u) => total + u.questions.length, 0);
    expect(multipleChoice).toBe(883);
    expect(shortAnswer).toBe(511);
  });

  it("rejects answer-key changes instead of silently revealing a wrong diagram", () => {
    const bad = structuredClone(corrections);
    bad.items["89"].answer = "1";
    expect(() => applyArmenianDiagramCorrections(sources, bad)).toThrow();
  });

  it("rejects a missing diagram option", () => {
    const bad = structuredClone(corrections);
    delete bad.items["98"].diagramOptions["4"];
    expect(() => applyArmenianDiagramCorrections(sources, bad)).toThrow();
  });
});
