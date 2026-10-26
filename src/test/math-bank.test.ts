import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

type Prompt = { prompt: string; options: string[]; adapted?: boolean; expected?: string } | null;
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
  it("contains 196 original practice variants with answer-compatible labels and preserved source tasks", () => {
    const batch = overlays[1];
    for (const [bookId, sectionId, expectedCount] of [
      ["matem-1", "2-2", 76],
      ["matem-2", "1-10", 120],
    ] as const) {
      const [chapter, sectionNo] = sectionId.split("-").map(Number);
      const section = index.books[bookId].sections.find((s) => s.chapter === chapter && s.section === sectionNo);
      expect(section).toBeDefined();
      const tasks = batch[bookId]?.[sectionId] ?? {};
      expect(Object.values(tasks).reduce((n, questions) => n + questions.length, 0)).toBe(expectedCount);
      for (const [taskId, questions] of Object.entries(tasks)) {
        const task = section?.tasks.find((t) => t.task === Number(taskId));
        expect(task).toBeDefined();
        expect(questions).toHaveLength(task?.sub_count);
        for (const [i, question] of questions.entries()) {
          expect(question?.adapted).toBe(true);
          expect(question?.expected).toBeDefined();
          expect(question?.options).toHaveLength(4);
          expect(new Set(question?.options).size).toBe(4);
          if (bookId === "matem-1") {
            expect(question?.expected).toBe(task?.answers?.[i]);
            // Some tasks use numeric text input; the others must place the answer at its label index.
            const correct = Number(task?.answers?.[i]);
            if (correct >= 1 && correct <= 4) expect(question?.options[correct - 1]).toBe(String(correct));
          } else {
            const correct = Number(task?.answers?.[i]);
            expect(correct).toBeGreaterThanOrEqual(1);
            expect(correct).toBeLessThanOrEqual(4);
            expect(question?.options[correct - 1]).toBe(question?.expected);
          }
        }
      }
    }
  });

});
