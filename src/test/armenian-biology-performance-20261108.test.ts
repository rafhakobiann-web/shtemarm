import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { ARMENIAN_ORIGINAL_CHAPTERS, ARMENIAN_SOURCE_PAGES, armenianSourceChapters } from "@/lib/armenian-source-outline";
import { BIOLOGY_SOURCE_PROGRESS } from "@/lib/biology-source-progress";

const read = (path: string) => readFileSync(path, "utf8");
const json = (path: string) => JSON.parse(read(path));

describe("2026-11-08 source-based books and responsive UX", () => {
  it("the four Armenian source outlines exactly match the verified PDF metadata", () => {
    const source = json("public/data/armenian-source-index.json");
    expect(source.volumes).toHaveLength(4);
    for (const volume of source.volumes) {
      const n = volume.volume as 1 | 2 | 3 | 4;
      const displayed = armenianSourceChapters(n);
      expect(displayed.map(ch => ch.title)).toEqual([...ARMENIAN_ORIGINAL_CHAPTERS]);
      expect(displayed.map(ch => ch.page)).toEqual(volume.sections.map((s: {pdfPage:number}) => s.pdfPage));
      expect(displayed.map(ch => ch.endPage)).toEqual(volume.sections.map((s: {endPdfPage:number}) => s.endPdfPage));
      expect(ARMENIAN_SOURCE_PAGES[n].answers).toBe(volume.answerKeyStartPage);
      expect(ARMENIAN_SOURCE_PAGES[n].appendix).toBe(volume.appendixStartPage);
      expect(volume.sourcePdfSha256).toMatch(/^[0-9a-f]{64}$/);
      expect(volume.totalPages).toBe(256);
    }
    expect(armenianSourceChapters(3)[6].page).toBe(182);
  });

  it("the Armenian navigator never marks untouched chapters as imported", () => {
    const ui = read("src/components/ArmenianSourceChapters.tsx");
    const bookRoute = read("src/routes/book.$bookId.tsx");
    expect(ui).toContain("book?.sections.find");
    expect(ui).toContain("units.length > 0");
    expect(ui).toContain("volume === 1 ? words.verified : words.authored");
    expect(ui).toContain("words.waiting");
    expect(bookRoute).toContain("<ArmenianSourceChapters");
  });

  it("current Biology numbers match the actual main banks, not review-only source drafts", () => {
    for (const volume of BIOLOGY_SOURCE_PROGRESS) {
      const source = json(`public/data/biology-original-volume${volume.volume}-index.json`);
      const core = json(`public/data/bio-book${volume.volume}.json`);
      const total = source.chapters.reduce((sum: number, c: {questionCount:number}) => sum + c.questionCount, 0);
      const current = core.sections.reduce((sum: number, s: {units:unknown[]}) => sum + s.units.length, 0);
      expect(total).toBe(volume.originalTasks);
      expect(current).toBe(volume.availableOnMain);
      expect(source.sourceSha256).toBe(volume.sourceSha256);
      expect(volume.availableOnMain + volume.stagedInReviewBranch + volume.sourceReviewOnly).toBe(total);
    }
    const transition = json("docs/biology-main-draft-transition-20261108.json");
    for (const volume of BIOLOGY_SOURCE_PROGRESS) {
      const row = transition.books.find((b: {volume:number})=>b.volume===volume.volume);
      expect(row?.totals).toMatchObject({
        source:volume.originalTasks,
        main:volume.availableOnMain,
        stagedOnly:volume.stagedInReviewBranch,
        sourceReviewOnly:volume.sourceReviewOnly,
      });
      expect(row.pending).toHaveLength(volume.stagedInReviewBranch + volume.sourceReviewOnly);
      expect(new Set(row.pending.map((x: number[])=>x[0]+":"+x[1])).size).toBe(row.pending.length);
    }
    const dashboard = read("src/routes/dashboard.tsx");
    expect(dashboard).toContain("<BiologySourceProgress />");
    expect(dashboard).toContain("Լրացուցիչ թվայնացված հարցերը նախնական ստուգման փուլում են");
  });

  it("public landing does not automatically download all three English banks", () => {
    const landing = read("src/components/LandingLabV3.tsx");
    expect(landing).toContain('useState<Subject>("math")');
    expect(landing).toContain('if (subject !== "english" || bookStatus === "ready") return');
    expect(landing).toContain("Promise.all([1, 2, 3].map(id => loadBook(id)))");
    expect(landing).toContain("const question = realEnglish ? undefined : QUESTIONS[subject][index]");
    expect(landing).toContain('bookStatus === "error"');
  });

  it("keeps animations light on touch hardware and respects reduced motion", () => {
    const css = read("src/landing-v3.css");
    expect(css).toContain("content-visibility: auto");
    expect(css).toContain("contain-intrinsic-size: auto 680px");
    expect(css).toContain("@media (hover:none), (pointer:coarse)");
    expect(css).toContain("@media (prefers-reduced-motion:reduce)");
    const app = read("src/styles.css");
    expect(app).toContain(".sht-source-outline");
    expect(app).toContain(".sht-home-2026 .sht-home-subject-card");
  });
});
