import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { ARMENIAN_BOOKS } from "@/lib/books";

describe("Four Armenian language study volumes", () => {
  it("lists four separately navigable volumes", () => {
    expect(ARMENIAN_BOOKS.map(book => book.id)).toEqual([41, 42, 43, 44]);
  });
  for (let part = 1; part <= 4; part++) {
    it(`validates part ${part} questions and answer keys`, () => {
      const bank = JSON.parse(readFileSync(`public/data/armenian-book${part}.json`, "utf8"));
      expect(bank.id).toBe(40 + part);
      expect(bank.sections.length).toBeGreaterThan(0);
      let count = 0;
      for (const section of bank.sections) for (const unit of section.units) {
        for (const question of unit.questions) {
          expect(question.stem.length).toBeGreaterThan(8);
          expect(Object.keys(question.options).length).toBeGreaterThanOrEqual(4);
          expect(question.options[question.answer]).toBeTruthy();
          count++;
        }
      }
      expect(count).toBeGreaterThanOrEqual(10);
    });
  }
  it("matches the supplied four-volume PDF tables of contents, without inventing headings", () => {
    const index = JSON.parse(readFileSync("public/data/armenian-source-index.json", "utf8"));
    const titles = [
      "Հնչյունաբանություն", "Բառագիտություն", "Ձևաբանություն", "Շարահյուսություն",
      "Կապակցված խոսք", "Ընդհանուր գիտելիքներ հայոց լեզվի մասին", "Ոճագիտություն", "Գրականություն",
    ];
    const pages = [
      [5, 27, 49, 98, 173, 187, 189, 194],
      [5, 30, 52, 74, 170, 184, 188, 202],
      [5, 35, 61, 97, 169, 176, 182, 190],
      [6, 38, 69, 111, 186, 198, 203, 210],
    ];
    expect(index.volumes).toHaveLength(4);
    for (const [i, volume] of index.volumes.entries()) {
      expect(volume.volume).toBe(i + 1);
      expect(volume.totalPages).toBe(256);
      expect(volume.sections.map((section: { title: string }) => section.title)).toEqual(titles);
      expect(volume.sections.map((section: { pdfPage: number }) => section.pdfPage)).toEqual(pages[i]);
      expect(volume.sections.every((section: { verifiedTitle: boolean }) => section.verifiedTitle)).toBe(true);
    }
  });

  it("does not misrepresent Shtemarm-authored practice as official PDF transcriptions", () => {
    expect(ARMENIAN_BOOKS.every(book => book.sub.includes("ուսումնական վարժանքներ"))).toBe(true);
  });

});
