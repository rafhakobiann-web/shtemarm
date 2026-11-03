import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (path: string) => JSON.parse(readFileSync(path, "utf8"));
const source = read("public/data/armenian-source-index.json");

const headings = [
  "Հնչյունաբանություն",
  "Բառագիտություն",
  "Ձևաբանություն",
  "Շարահյուսություն",
  "Կապակցված խոսք",
  "Ընդհանուր գիտելիքներ հայոց լեզվի մասին",
  "Ոճագիտություն",
  "Գրականություն",
];
const starts = [
  [5, 27, 49, 98, 173, 187, 189, 194, 240, 249],
  [5, 30, 52, 74, 170, 184, 188, 202, 243, 250],
  [5, 35, 61, 97, 169, 176, 182, 190, 241, 249],
  [6, 38, 69, 111, 186, 198, 203, 210, 242, 251],
];
const verifiedHashes = [
  "5894d996c336a5837c7ce4e7b77eca59bb0cec0ae6c5ab55d468e05cd9356e35",
  "e8b9f7e59326ad3938f9c27f4ff618ed7058bf7bd92844072cdcb1961210034d",
  "c237c82c6ab4bfb93f786e777e013d9bccc697d51701b8895da30c899f02e3c8",
  "910266f221729f7b310c8656e1a65caaecca26536f9cfee78419c76286ad38bd",
];

describe("Four official Armenian language and literature source PDFs", () => {
  it("indexes all four 256-page originals without pretending they are digitized", () => {
    expect(source.schemaVersion).toBe(2);
    expect(source.volumes.map((v: { volume: number }) => v.volume)).toEqual([1, 2, 3, 4]);
    expect(source.volumes.every((v: { totalPages: number }) => v.totalPages === 256)).toBe(true);
    const catalog = read("public/data/armenian-books-index.json");
    expect(catalog.officialDigitizedBooks).toBe(0);
    expect(source.practiceStatus).toContain("հեղինակային");
  });

  for (let i = 0; i < 4; i++) {
    it(`verifies volume ${i + 1} titles, numbered chapters, source pages and answer appendices`, () => {
      const book = source.volumes[i];
      const boundaries = starts[i];
      expect(book.pdf).toBe(`hayoc-${i + 1}.pdf`);
      expect(book.tocPdfPage).toBe(3);
      expect(book.sourceSha256).toBe(verifiedHashes[i]);
      expect(book.year).toBe(i === 3 ? 2018 : 2017);
      expect(book.sections).toHaveLength(8);
      expect(book.appendices).toHaveLength(2);
      expect(book.sections.map((s: { title: string }) => s.title)).toEqual(headings);
      expect(book.sections.map((s: { number: number }) => s.number)).toEqual([1,2,3,4,5,6,7,8]);
      expect([...book.sections,...book.appendices].map((s: {pdfPage: number}) => s.pdfPage))
        .toEqual(boundaries);
      const spans = [...book.sections,...book.appendices];
      for (let j=0;j<spans.length;j++) {
        expect(spans[j].endPdfPage).toBe((j+1<spans.length ? spans[j+1].pdfPage : 257)-1);
        expect(spans[j].verifiedTitle).toBe(true);
        expect(spans[j].verifiedPage).toBe(true);
      }
      expect(book.appendices.map((a:{title:string})=>a.title)).toEqual(["Պնդումների փունջ","Պատասխաններ"]);
      expect(book.appendices[1].endPdfPage).toBe(256);
    });
  }

  it("documents the running-heading error in volume III without changing its real start page", () => {
    expect(source.volumes[2].sections[6].pdfPage).toBe(182);
    expect(source.volumes[2].sourceNote).toContain("181");
    expect(source.volumes[2].sourceNote).toContain("6-րդ");
  });

  it("keeps the source contents separate from the author's practice sections", () => {
    const ui = readFileSync("src/components/ArmenianOriginalContents.tsx","utf8");
    const page = readFileSync("src/routes/book.$bookId.tsx","utf8");
    expect(ui).toContain('fetch("/data/armenian-source-index.json"');
    expect(ui).toContain("not a fully digitized question bank");
    expect(ui).not.toMatch(/type="file"|<input|PDFUpload/);
    expect(page).toContain("ArmenianOriginalContents");
    expect(page).toContain("Shtemarm-ի հեղինակային վարժանքների թեմաները");
  });
});
