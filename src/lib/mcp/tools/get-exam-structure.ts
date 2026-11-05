import { defineTool } from "@lovable.dev/mcp-js";
import { EXAM_BLUEPRINT } from "@/lib/books";

export default defineTool({
  name: "get_exam_structure",
  title: "Get exam structure",
  description:
    "Get the official 80-question Armenian unified exam structure used by Shtemarm's exam mode: how many tasks come from each section.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => {
    const sections = EXAM_BLUEPRINT.map(([section, count]) => ({ section, tasks: count }));
    const total = sections.reduce((sum, entry) => sum + entry.tasks, 0);
    return {
      content: [{ type: "text", text: `The exam has ${total} tasks across ${sections.length} sections.` }],
      structuredContent: { total_tasks: total, sections },
    };
  },
});
