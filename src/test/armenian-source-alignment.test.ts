import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { ARMENIAN_BOOKS } from "@/lib/books";
import { WORKBOOK_SOURCES, workbookEntries, makeWorkbookExam } from "@/lib/workbook-exams";

const read = (path: string) => JSON.parse(readFileSync(path, "utf8"));
const index = read("public/data/armenian-source-index.json");
const summary = read("public/data/armenian-books-index.json");
const banks = [1, 2, 3, 4].map(n => read(`public/data/armenian-book${n}.json`));
const headings = [
  "Հնչյունաբանություն", "Բառագիտություն", "Ձևաբանություն",
  "Շարահյուսություն", "Կապակցված խոսք",
  "Ընդհանուր գիտելիքներ հայոց լեզվի մասին",
  "Ոճագիտություն", "Գրականություն",
];
const pages = [
  [5, 27, 49, 98, 173, 187, 189, 194],
  [5, 30, 52, 74, 170, 184, 188, 202],
  [5, 35, 61, 97, 169, 176, 182, 190],
  [6, 38, 69, 111, 186, 198, 203, 210],
];
const bundle = [240, 243, 241, 242];
const answer = [249, 250, 249, 251];
const fingerprints = [
  "5894d996c336a5837c7ce4e7b77eca59bb0cec0ae6c5ab55d468e05cd9356e35",
  "e8b9f7e59326ad3938f9c27f4ff618ed7058bf7bd92844072cdcb1961210034d",
  "c237c82c6ab4bfb93f786e777e013d9bccc697d51701b8895da30c899f02e3c8",
  "910266f221729f7b310c8656e1a65caaecca26536f9cfee78419c76286ad38bd",
];

type Question = { n: string; stem: string; options: Record<string, string>; answer: string };
type Unit = { id: string; kind: string; questions: Question[] };
type Section = { n: number; title: string; label: string; instr_hy: string; units: Unit[] };

describe("2018 Armenian language and literature source-aligned coverage", () => {
  it("matches all 32 original TOC headings and non-overlapping printed page ranges", () => {
    expect(index.volumes).toHaveLength(4);
    for (const [i, source] of index.volumes.entries()) {
      expect(source.volume).toBe(i + 1);
      expect(source.pdf).toBe(`hayoc-${i + 1}.pdf`);
      expect(source.totalPages).toBe(256);
      expect(source.sourceSha256).toBe(fingerprints[i]);
      expect(source.tocPage).toBe(3);
      expect(source.sections.map((s: { title: string }) => s.title)).toEqual(headings);
      expect(source.sections.map((s: { pdfPage: number }) => s.pdfPage)).toEqual(pages[i]);
      for (let j = 0; j < 8; j++) {
        expect(source.sections[j].number).toBe(j + 1);
        expect(source.sections[j].verifiedTitle).toBe(true);
        expect(source.sections[j].lastPdfPage + 1).toBe(
          j === 7 ? bundle[i] : pages[i][j + 1],
        );
      }
      expect(source.statementBundle.title).toBe("Պնդումների փունջ");
      expect(source.statementBundle.pdfPage).toBe(bundle[i]);
      expect(source.statementBundle.lastPdfPage).toBe(answer[i] - 1);
      expect(source.answerKeyStartPdfPage).toBe(answer[i]);
      expect(source.answerKeyEndPdfPage).toBe(256);
    }
  });

  it("shows four independent books with correct sections rather than misleading topic names", () => {
    expect(ARMENIAN_BOOKS.map(b => b.id)).toEqual([41, 42, 43, 44]);
    expect(WORKBOOK_SOURCES.armenian).toEqual([41, 42, 43, 44]);
    const expectedByVolume = [
      [3, 11, 18, 16, 8, 8, 8, 24],
      [8, 3, 3, 5, 3, 3, 3, 3],
      [0, 3, 11, 5, 3, 3, 3, 3],
      [0, 12, 3, 3, 3, 3, 4, 3],
    ];
    for (let i = 0; i < 4; i++) {
      const bank = banks[i];
      expect(bank.id).toBe(41 + i);
      expect(bank.sourceRelation).toContain("NOT an official");
      expect(bank.officialSourceVerifiedQuestions).toBe(0);
      expect(bank.sections).toHaveLength(8);
      expect(bank.sections.map((s: Section) => s.n)).toEqual([1,2,3,4,5,6,7,8]);
      expect(bank.sections.map((s: Section) => s.title)).toEqual(headings);
      expect(bank.sections.map((s: Section) => s.label)).toEqual(headings);
      expect(bank.sections.map((s: Section) =>
        s.units.reduce((n,unit)=>n+unit.questions.length,0))).toEqual(expectedByVolume[i]);
    }
    // The original PDF contains a phonetics section, but authored questions
    // for that topic have not yet been prepared in volumes III and IV.
    expect(banks[2].sections[0].units).toHaveLength(0);
    expect(banks[3].sections[0].units).toHaveLength(0);
  });

  it("checks all 189 authored prompts, answer keys, option sets and internal IDs", () => {
    const perVolume: number[] = [];
    const across = new Map<string, number>();
    let repeated = 0;
    for (const [vol, bank] of banks.entries()) {
      const unitIds = new Set<string>();
      const responseIds = new Set<string>();
      const fingerprintsInBook = new Set<string>();
      let count = 0;
      for (const section of bank.sections as Section[]) {
        expect(section.instr_hy).toContain("հեղինակային");
        for (const unit of section.units) {
          expect(unit.kind).toBe("mc");
          expect(unitIds.has(unit.id),unit.id).toBe(false);
          unitIds.add(unit.id);
          expect(unit.questions.length).toBeGreaterThan(0);
          const numbers=new Set<string>();
          for (const q of unit.questions) {
            expect(q.stem.trim().length).toBeGreaterThan(7);
            expect(numbers.has(q.n),q.n).toBe(false);
            numbers.add(q.n);
            const responseId = unit.id + ":" + q.n;
            expect(responseIds.has(responseId),responseId).toBe(false);
            responseIds.add(responseId);
            expect(Object.keys(q.options).sort()).toEqual(["1","2","3","4"]);
            for (const option of Object.values(q.options))
              expect(option.trim().length).toBeGreaterThan(0);
            expect(["1","2","3","4"]).toContain(q.answer);
            expect(q.options[q.answer]).toBeTruthy();
            const contentKey = q.stem.trim().toLowerCase() + "|" + ["1","2","3","4"].map(n=>q.options[n]).join("|");
            expect(fingerprintsInBook.has(contentKey),"Duplicate in volume "+(vol+1)).toBe(false);
            fingerprintsInBook.add(contentKey);
            if(across.has(contentKey)) repeated++;
            else across.set(contentKey,vol+1);
            count++;
          }
        }
      }
      perVolume.push(count);
    }
    expect(perVolume).toEqual([96,31,31,31]);
    expect(perVolume.reduce((a,b)=>a+b,0)).toBe(189);
    // Pre-existing identical authored practice repeated in different volumes.
    // Report instead of claiming 189 distinct original GTC questions.
    expect(repeated).toBe(42);
    expect(summary.authorPracticeTotal).toBe(189);
    expect(summary.crossVolumeRepeatedPracticeQuestions).toBe(repeated);
    expect(summary.officialDigitizedBooks).toBe(0);
    expect(summary.sourceVerifiedOfficialQuestions).toBe(0);
  });

  it("separates correctly titled practice topics and preserves original answer values", () => {
    const stems=(volume:number, section:number) =>
      banks[volume-1].sections[section-1].units.flatMap((unit:Unit)=>unit.questions.map(q=>q.stem));
    expect(stems(1,3)).toContain("Ո՞ր բառն է գոյական։");
    expect(stems(1,8)).toContain("Ո՞վ է «Անուշ» պոեմի հեղինակը։");
    expect(stems(2,4)).toContain("Ո՞ր նախադասությունն ունի ուղիղ խոսք։");
    expect(stems(3,3)).toContain("Ո՞ր բառն է բայ։");
    expect(stems(4,2)).toContain("Ո՞ր զույգն է հոմանիշ։");
    expect(stems(4,7)).toContain("Ո՞ր արտահայտությունն է փոխաբերական։");
  });

  it("builds 70 practice tasks from all four parts but rejects a 31-task part as a full exam", () => {
    const entries=workbookEntries(banks);
    expect(entries).toHaveLength(189);
    const full=makeWorkbookExam(banks, "armenian", "all", "full", entries, 70, false);
    expect(full.units).toHaveLength(70);
    const origins = new Set(full.units.map(u => Number(u.id.split(":")[0].replace("book-",""))));
    expect(origins).toEqual(new Set([41,42,43,44]));
    expect(() => makeWorkbookExam(banks, "armenian", "42", "full",
      workbookEntries([banks[1]]), 70, false)).toThrow(/70/);
    const custom=makeWorkbookExam(banks, "armenian", "43", "custom",
      workbookEntries([banks[2]]), 10, false);
    expect(custom.bookId).toBe(43);
    expect(custom.units).toHaveLength(10);
  });

  it("does not send Books II–IV to the Physics exam or enable empty section controls", () => {
    const page=readFileSync("src/routes/book.$bookId.tsx","utf8");
    expect(page).toContain("(id >= 41 && id <= 44)");
    expect(page).toContain('id >= 41 && id <= 44 ? "armenian" : "english"');
    expect(page).toContain("{hasQuestions && <div");
    expect(page).toContain("Այս բաժինը կա բնօրինակ շտեմարանում");
  });
});
