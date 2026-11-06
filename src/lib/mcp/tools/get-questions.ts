import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { findBook } from "../catalog";

/**
 * Question banks are large static JSON files served publicly by the app.
 * The worker bundle cannot embed them, so fetch them from the app's own
 * published origin and cache per file for the lifetime of the isolate.
 */
const APP_ORIGIN = "https://shtemarm.lovable.app";
const MAX_QUESTIONS = 100;

type RawUnit = {
  id: string;
  label?: string;
  kind: "mc" | "set" | "seq" | "match" | "num";
  passage?: string;
  questions?: { n: string; stem: string; options?: Record<string, string>; answer?: string }[];
  answer?: string | number | number[] | Record<string, number> | null;
};

type RawBook = { sections: { n: number; title?: string; label?: string; units: RawUnit[] }[] };

const bookCache = new Map<string, Promise<RawBook>>();

function loadBook(dataFile: string): Promise<RawBook> {
  let cached = bookCache.get(dataFile);
  if (!cached) {
    cached = fetch(`${APP_ORIGIN}${dataFile}`, { signal: AbortSignal.timeout(15_000) }).then(
      async (response) => {
        if (!response.ok) throw new ToolError(`Question bank returned HTTP ${response.status}.`);
        return (await response.json()) as RawBook;
      },
    );
    cached.catch(() => bookCache.delete(dataFile));
    bookCache.set(dataFile, cached);
  }
  return cached;
}

export default defineTool({
  name: "get_questions",
  title: "Get section questions",
  description:
    "Get the questions of one section of a question book, including passages, options and official answer keys. Use list_books and list_sections to find valid IDs. Large sections are truncated to the first 100 questions.",
  inputSchema: {
    book_id: z.number().int().describe("Book ID from list_books."),
    section: z.number().int().describe("Section number from list_sections."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ book_id, section }) => {
    const book = findBook(book_id);
    if (!book) throw new ToolError(`Unknown book_id ${book_id}. Call list_books to see valid IDs.`);
    const data = await loadBook(book.dataFile);
    const found = data.sections.find((entry) => entry.n === section);
    if (!found) {
      throw new ToolError(
        `Book ${book_id} has no section ${section}. Call list_sections to see valid section numbers.`,
      );
    }

    let remaining = MAX_QUESTIONS;
    let truncated = false;
    const units: Array<{
      id: string;
      kind: RawUnit["kind"];
      passage: string;
      questions: Array<{ n: string; stem: string; options: Record<string, string> | null; answer: string | null }>;
      answer: RawUnit["answer"];
    }> = [];
    for (const unit of found.units) {
      if (remaining <= 0) {
        truncated = true;
        break;
      }
      const questions = (unit.questions ?? []).slice(0, remaining).map((question) => ({
        n: question.n,
        stem: question.stem,
        options: question.options ?? null,
        answer: question.answer ?? null,
      }));
      if ((unit.questions ?? []).length > questions.length) truncated = true;
      remaining -= questions.length;
      units.push({
        id: unit.id,
        kind: unit.kind,
        passage: unit.passage ?? "",
        questions,
        answer: unit.questions ? null : (unit.answer ?? null),
      });
    }

    const total = found.units.reduce(
      (sum, unit) => sum + (unit.questions ? unit.questions.length : 1),
      0,
    );
    return {
      content: [
        {
          type: "text",
          text: `Section ${section} of ${book.title}: ${units.length} units returned${truncated ? ` (truncated; section has about ${total} questions)` : ""}.`,
        },
      ],
      structuredContent: {
        book: { id: book.id, subject: book.subject, title: book.title },
        section: { n: found.n, title: found.title ?? found.label ?? "" },
        truncated,
        units,
      },
    };
  },
});
