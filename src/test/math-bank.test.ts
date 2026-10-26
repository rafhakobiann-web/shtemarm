import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

type Prompt = { prompt: string; options: string[] } | null;
type Task = {
  task: number;
  sub_count: number;
  answers: string[] | null;
  segments: { page: number; y0: number; y1: number }[];
};
type Section = { chapter: number; section: number; title: string; tasks: Task[] };
type Bank = { books: Record<string, { sections: Section[] }> };
type Overlay = Record<string, Record<string, Record<string, Prompt[]>>>;

const root = process.cwd();
const index = JSON.parse(readFileSync(resolve(root, "public/data/math-books-index.json"), "utf8")) as Bank;
const overlays = [
  JSON.parse(readFileSync(resolve(root, "public/data/math-text-questions.json"), "utf8")) as Overlay,
  JSON.parse(readFileSync(resolve(root, "public/data/math-text-questions-extra.json"), "utf8")) as Overlay,
];

describe("math source bank integrity", () => {
  it.each(["matem-1", "matem-2"])("%s has unique sections, tasks, and complete answer arrays", (bookId) => {
    const book = index.books[bookId];
    expect(book).toBeDefined();
    const sectionIds = new Set<string>();
    for (const section of book.sections) {
      const sectionId = `${section.chapter}-${section.section}`;
      expect(sectionIds.has(sectionId), `duplicate section ${bookId} ${sectionId}`).toBe(false);
      sectionIds.add(sectionId);
      const taskIds = new Set<number>();
      for (const task of section.tasks) {
        expect(taskIds.has(task.task), `duplicate task ${bookId} ${sectionId} #${task.task}`).toBe(false);
        taskIds.add(task.task);
        expect(task.answers, `missing answers ${bookId} ${sectionId} #${task.task}`).toHaveLength(task.sub_count);
        expect(task.segments.length, `missing source crop ${bookId} ${sectionId} #${task.task}`).toBeGreaterThan(0);
        for (const segment of task.segments) {
          expect(segment.page).toBeGreaterThan(0);
          expect(segment.y1).toBeGreaterThan(segment.y0);
          const pagePath = resolve(root, "public/math/books", bookId, `p-${String(segment.page).padStart(3, "0")}.jpg`);
          expect(existsSync(pagePath), `missing page image ${pagePath}`).toBe(true);
        }
      }
    }
  });

  it("both transcription overlays reference existing source tasks and subquestions", () => {
    for (const overlay of overlays) {
      for (const [bookId, sections] of Object.entries(overlay)) {
        expect(index.books[bookId], `unknown book in overlay: ${bookId}`).toBeDefined();
        for (const [sectionId, tasks] of Object.entries(sections)) {
          const [chapter, sectionNo] = sectionId.split("-").map(Number);
          const section = index.books[bookId]?.sections.find((item) => item.chapter === chapter && item.section === sectionNo);
          expect(section, `unknown section in overlay: ${bookId} ${sectionId}`).toBeDefined();
          for (const [taskId, prompts] of Object.entries(tasks)) {
            const task = section?.tasks.find((item) => item.task === Number(taskId));
            expect(task, `unknown task in overlay: ${bookId} ${sectionId} #${taskId}`).toBeDefined();
            expect(prompts.length).toBeLessThanOrEqual(task?.sub_count ?? 0);
            for (const prompt of prompts) {
              if (prompt === null) continue;
              expect(prompt.prompt.trim().length).toBeGreaterThan(0);
              expect(Array.isArray(prompt.options)).toBe(true);
              expect(prompt.options.length).toBeGreaterThanOrEqual(4);
            }
          }
        }
      }
    }
  });
});
