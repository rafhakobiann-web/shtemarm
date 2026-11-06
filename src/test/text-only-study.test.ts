import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
const read = (path: string) => readFileSync(path, "utf8");

describe("Shtemarm text-only books and question UX", () => {
  it("restores book covers with a fallback, while keeping exam questions image-free", () => {
    expect(read("src/routes/dashboard.tsx")).toContain("function TileBody");
    expect(read("src/routes/dashboard.tsx")).not.toContain("cover-frame");
    expect(read("src/routes/dashboard.tsx")).toContain("<BookCover src={cover}");
    expect(read("src/routes/book.$bookId.tsx")).toContain("<BookCover src={meta.cover}");
    expect(read("src/components/BookCover.tsx")).toContain("onError={() => setFailed(true)}");
    expect(read("src/components/PhysicsWorkspace.tsx")).not.toContain("<img src={b.cover}");
  });

  it("renders original Biology questions once, with one answer list and no image display", () => {
    const study = read("src/components/BiologyOriginalPractice.tsx");
    const question = read("src/components/BiologyQuestionFromPdf.tsx");
    expect(question).toContain("Պատասխանների տարբերակներ");
    expect(question).toContain('onTextReady(extract.sourceVerified && extract.hasFourChoices');
    expect(study).toContain("onTextReady={setCanGrade}");
    expect(study).toContain("recordAnswer(key, selected === answer)");
    expect(study).toContain("Հաջորդ հարցը");
    expect(study).not.toContain("<iframe");
    expect(study).not.toContain('["1","2","3","4"].map');
    expect(question).not.toContain("<canvas");
    expect(question).not.toContain("<img");
    expect(question).not.toContain("renderBiologyQuestionCrop");
    expect(read("src/lib/biology-pdf-text.ts")).not.toContain("destination: HTMLCanvasElement");
  });

  it("does not permit scoring a guessed stem or missing options", () => {
    const question = read("src/components/BiologyQuestionFromPdf.tsx");
    const study = read("src/components/BiologyOriginalPractice.tsx");
    expect(question).toContain('onTextReady(false)');
    expect(question).toContain('extract.sourceVerified && extract.hasFourChoices');
    expect(study).toContain('if (!answer || !selected || !canGrade || !localFile || revealed) return');
    expect(study).toContain('disabled={!selected || !localFile || !canGrade || revealed}');
  });

  it("removes only retired music and placeholder features, not study progress or mini-games", () => {
    for (const file of [
      "src/components/StudyMusicDock.tsx",
      "src/lib/study-music.ts",
      "src/lib/study-ambience.ts",
      "src/test/study-music.test.tsx",
      ".github/workflows/verify-study-music.yml",
    ]) expect(existsSync(file)).toBe(false);
    expect(read("src/routes/dashboard.tsx")).not.toContain("function ComingSoon(");
    expect(read("src/routes/explore.tsx")).toContain('to="/mini-games"');
    expect(read("src/components/BiologyOriginalPractice.tsx")).toContain("recordAnswer");
  });
});
