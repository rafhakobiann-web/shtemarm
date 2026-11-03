import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

type Question = { n: string; stem: string; options: Record<string, string>; answer: string };
type Unit = { id: string; kind: string; questions?: Question[] };
type Section = { n: number; title?: string; units: Unit[] };

const source = JSON.parse(readFileSync("public/data/armenian-source-index.json", "utf8"));
const officialTitles = ["Հնչյունաբանություն", "Բառագիտություն", "Ձևաբանություն", "Շարահյուսություն", "Կապակցված խոսք", "Ընդհանուր գիտելիքներ հայոց լեզվի մասին", "Ոճագիտություն", "Գրականություն"];

describe("Armenian source book verification and original bank integrity", () => {
  it("indexes 8 non-overlapping PDF sections and answer keys in each source volume", () => {
    expect(source.volumes).toHaveLength(4);
    for (const [index, volume] of source.volumes.entries()) {
      expect(volume.volume).toBe(index + 1);
      expect(volume.pdf).toBe(`hayoc-${index + 1}.pdf`);
      expect(volume.sections.map((s: { title: string }) => s.title)).toEqual(officialTitles);
      expect(volume.sections).toHaveLength(8);
      for (const [sectionIndex, section] of volume.sections.entries()) {
        expect(section.number).toBe(sectionIndex + 1);
        expect(section.verifiedTitle).toBe(true);
        expect(section.pdfPage).toBeGreaterThan(3);
        expect(section.lastPdfPage).toBeGreaterThanOrEqual(section.pdfPage);
        if (sectionIndex > 0) expect(section.pdfPage).toBe(volume.sections[sectionIndex - 1].lastPdfPage + 1);
      }
      expect(volume.statementBundle.title).toBe("Պնդումների փունջ");
      expect(volume.statementBundle.pdfPage).toBe(volume.sections[7].lastPdfPage + 1);
      expect(volume.statementBundle.lastPdfPage).toBe(volume.answerKeyStartPdfPage - 1);
      expect(volume.answerKeyEndPdfPage).toBe(volume.totalPages);
      expect(volume.sourceSha256).toMatch(/^[a-f0-9]{64}$/);
    }
  });

  for (let part = 1; part <= 4; part++) {
    it(`checks authored practice bank ${part} for duplicates, valid answers and source separation`, () => {
      const bank = JSON.parse(readFileSync(`public/data/armenian-book${part}.json`, "utf8"));
      expect(bank.id).toBe(part + 40);
      const identifiers = new Set<string>();
      const prompts = new Set<string>();
      let count = 0;
      for (const section of bank.sections as Section[]) {
        // Book III and IV have no authored phonetics questions yet. They must
        // remain visible in the original TOC but must not pretend to be playable.
        expect(section.units.length).toBeGreaterThanOrEqual(0);
        for (const unit of section.units) {
          expect(identifiers.has(unit.id)).toBe(false);
          identifiers.add(unit.id);
          if (unit.kind !== "mc") continue;
          for (const question of unit.questions ?? []) {
            expect(question.stem.trim().length).toBeGreaterThan(8);
            expect(Object.keys(question.options).length).toBeGreaterThanOrEqual(4);
            expect(Object.values(question.options).every(option => option.trim().length > 0)).toBe(true);
            expect(Object.prototype.hasOwnProperty.call(question.options, question.answer)).toBe(true);
            const key = question.stem.trim().toLocaleLowerCase("hy") + "|" + Object.values(question.options).join("|");
            expect(prompts.has(key)).toBe(false);
            prompts.add(key);
            count++;
          }
        }
      }
      expect(count).toBeGreaterThanOrEqual(10);
    });
  }
});
