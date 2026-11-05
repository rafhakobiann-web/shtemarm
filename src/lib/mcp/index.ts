import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listBooksTool from "./tools/list-books";
import listSectionsTool from "./tools/list-sections";
import getQuestionsTool from "./tools/get-questions";
import getExamStructureTool from "./tools/get-exam-structure";
import getMyProgressTool from "./tools/get-my-progress";

// Vite inlines the stable ref; the published SUPABASE_URL may be a proxy.
const projectRef = import.meta.env["VITE_SUPABASE_PROJECT_ID"] ?? "project-ref-unset";

export default defineMcp({
  name: "shtemarm",
  title: "Shtemarm",
  version: "0.1.0",
  instructions:
    "Tools for Shtemarm, an Armenian exam-preparation app. Use list_books to discover question books, list_sections and get_questions to read public question banks, get_exam_structure for the official 80-task exam layout, and get_my_progress for the signed-in user's own study progress.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
    requireOAuthClientClaim: true,
  }),
  tools: [listBooksTool, listSectionsTool, getQuestionsTool, getExamStructureTool, getMyProgressTool],
});
