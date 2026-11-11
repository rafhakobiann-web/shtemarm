import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { biologyBookTitle, biologyBookSubtitle, biologySectionPageTitle } from "@/lib/biology-headings";
import { secTitle } from "@/lib/books";

const read = (path: string) => readFileSync(path, "utf8");

describe("Biology titles and chapter headings", () => {
  it("uses a distinct part label for each of the four Biology books in all UI languages", () => {
    expect([31, 32, 33, 34].map(id => biologyBookTitle(id, "hy")))
      .toEqual(["Կենսաբանություն · Մաս I", "Կենսաբանություն · Մաս II", "Կենսաբանություն · Մաս III", "Կենսաբանություն · Մաս IV"]);
    expect(biologyBookTitle(33, "en")).toBe("Biology · Part III");
    expect(biologyBookTitle(34, "ru")).toBe("Биология · Часть IV");
    expect(biologyBookTitle(999)).toBeNull();
  });

  it("describes full imported coverage without claiming complete source proofreading", () => {
    expect(biologyBookSubtitle(33, "hy")?.replace(/\D/g, "")).toBe("1837");
    expect(biologyBookSubtitle(34, "en")).toContain("1,688");
    expect(biologyBookSubtitle(33, "en")).toContain("proofreading in progress");
    expect(biologyBookSubtitle(31, "hy")).toBeNull();
    expect(biologySectionPageTitle(33, 1)).toBe("Կենսաբանություն · Մաս III · Բաժին 1 | Shtemarm");
    expect(biologySectionPageTitle(34, 6)).toBe("Կենսաբանություն · Մաս IV · Բաժին 6 | Shtemarm");
    expect(biologySectionPageTitle(99, 2)).toBeNull();
    expect(biologySectionPageTitle(33, 0)).toBeNull();
  });

  it("keeps original printed chapter headings, not generic numbered substitutes", () => {
    const source = JSON.parse(read("public/data/biology-original-volume3-index.json"));
    const third = JSON.parse(read("public/data/bio-book3.json"));
    for (const section of third.sections) {
      expect(secTitle(section)).toBe(source.chapters.find((chapter: { id: number }) => chapter.id === section.n).title);
    }
    expect(source.chapters.find((chapter: { id: number }) => chapter.id === 6).title).toBe("Խնդիրներ");
  });

  it("keeps the same book routes and displays real titles in the header and browser tab", () => {
    const bookPage = read("src/routes/book.$bookId.tsx");
    const studyPage = read("src/routes/study.$bookId.$sectionId.tsx");
    expect(bookPage).toContain("biologyBookTitle(id, lang)");
    expect(bookPage).toContain("{displayTitle}</h1>");
    expect(bookPage).toContain("const title =");
    expect(studyPage).toContain("biologySectionPageTitle(id, Number(params.sectionId))");
    expect(studyPage).toContain("section ? secTitle(section)");
    expect(studyPage).toContain("{bookTitle}");
    expect(studyPage).toContain("saveRecentStudy");
  });

  it("removes outdated III-IV counts from the public Biology page and exam header", () => {
    const subject = read("src/routes/dashboard.tsx");
    const exam = read("src/components/BiologyWorkspace.tsx");
    expect(subject).toContain("biologyBookSubtitle(30 + b.volume, lang)");
    expect(subject).not.toContain("3-րդ մասում հասանելի է 911");
    expect(exam).toContain("III և IV մասերում առկա է 3 525 առաջադրանք");
    expect(exam).not.toContain("1,688 տեքստային առաջադրանք");
  });
});
