import { defineTool } from "@lovable.dev/mcp-js";
import { CATALOG } from "../catalog";

export default defineTool({
  name: "list_books",
  title: "List question books",
  description:
    "List every playable question book on Shtemarm with its subject, title and section count. Use this to discover book IDs for the other tools.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => {
    const books = CATALOG.map((book) => ({
      id: book.id,
      subject: book.subject,
      title: book.title,
      sub: book.sub,
      sections: book.sections.length,
      questions: book.sections.reduce((sum, section) => sum + section.questions, 0),
    }));
    return {
      content: [{ type: "text", text: `${books.length} books across ${new Set(books.map((b) => b.subject)).size} subjects.` }],
      structuredContent: { books },
    };
  },
});
