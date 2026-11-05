import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { findBook } from "../catalog";

export default defineTool({
  name: "list_sections",
  title: "List book sections",
  description:
    "List the sections of one question book with unit and question counts. Use list_books first to find a valid book ID.",
  inputSchema: {
    book_id: z.number().int().describe("Book ID from list_books, e.g. 1 for English Շտեմարան 1."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: ({ book_id }) => {
    const book = findBook(book_id);
    if (!book) throw new ToolError(`Unknown book_id ${book_id}. Call list_books to see valid IDs.`);
    return {
      content: [
        {
          type: "text",
          text: `${book.title} (${book.sub}) has ${book.sections.length} sections.`,
        },
      ],
      structuredContent: {
        book: { id: book.id, subject: book.subject, title: book.title, sub: book.sub },
        sections: book.sections.map((section) => ({
          n: section.n,
          title: section.title,
          units: section.units,
          questions: section.questions,
        })),
      },
    };
  },
});
