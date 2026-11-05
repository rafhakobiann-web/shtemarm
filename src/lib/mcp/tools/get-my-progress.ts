import { defineTool, ToolError } from "@lovable.dev/mcp-js";
import { supabaseForUser } from "../supabase";

type ProgressData = {
  answers?: Record<string, 0 | 1>;
  xp?: number;
  streak?: number;
  exams?: { date: string; book: number; score: number; total: number }[];
};

export default defineTool({
  name: "get_my_progress",
  title: "Get my study progress",
  description:
    "Get the signed-in user's Shtemarm study progress: XP, streak, correct/incorrect answer counts and recent exam results. Requires sign-in; acts only on the caller's own data.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    const userId = ctx.getUserId();
    if (!userId) throw new ToolError("Sign in to read your study progress.");
    const supabase = supabaseForUser(ctx);
    const { data, error } = await supabase
      .from("user_progress")
      .select("data, updated_at")
      .eq("user_id", userId)
      .maybeSingle();
    if (error) throw new ToolError(`Could not read progress: ${error.message}`);

    const progress = (data?.data ?? {}) as ProgressData;
    const answers = progress.answers ?? {};
    const answered = Object.keys(answers).length;
    const correct = Object.values(answers).filter((value) => value === 1).length;
    const exams = (progress.exams ?? []).slice(-10).map((exam) => ({
      date: exam.date,
      book: exam.book,
      score: exam.score,
      total: exam.total,
    }));

    return {
      content: [
        {
          type: "text",
          text: answered === 0
            ? "No saved progress yet."
            : `XP ${progress.xp ?? 0}, streak ${progress.streak ?? 0} days, ${correct}/${answered} answers correct, ${exams.length} recent exams.`,
        },
      ],
      structuredContent: {
        xp: progress.xp ?? 0,
        streak_days: progress.streak ?? 0,
        answered,
        correct,
        incorrect: answered - correct,
        recent_exams: exams,
        updated_at: data?.updated_at ?? null,
      },
    };
  },
});
