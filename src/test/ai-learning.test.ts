import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { studyLabels, STUDY_MODE_DEFAULT, tutorModeInstructions } from "@/lib/ai-study-modes";

const read=(p:string)=>readFileSync(p,"utf8");

describe("Learning-first AI in Shtemarm",()=>{
  it("offers guiding hints, fully explained solutions, and adaptive quizzes",()=>{
    expect(STUDY_MODE_DEFAULT).toBe("hint");
    for(const lang of ["hy","en","ru"] as const){
      for(const mode of ["hint","explain","quiz"] as const){
        const t=tutorModeInstructions(mode,lang);
        expect(t.length).toBeGreaterThan(350);
        expect(t).toContain("Shtemarm tutor");
        expect(t).toContain("KaTeX");
        expect(studyLabels[lang][mode].length).toBeGreaterThan(2);
        expect(studyLabels[lang][`${mode}Description`].length).toBeGreaterThan(9);
      }
    }
    expect(tutorModeInstructions("hint","hy")).toContain("provide a complete explained solution instead");
    expect(tutorModeInstructions("explain","hy")).toContain("Give the answer");
    expect(tutorModeInstructions("quiz","en")).toContain("explicitly check it");
    expect(tutorModeInstructions("explain","en")).toContain("English");
    expect(tutorModeInstructions("hint","ru")).toContain("Russian");
  });

  it("keeps Armenian tutoring terminology natural and mathematical notation renderable", () => {
    const prompt = tutorModeInstructions("explain", "hy");
    expect(prompt).toContain("natural subject terminology");
    expect(prompt).toContain("կոորդինատ");
    expect(prompt).toContain("single correctly delimited formula");
    expect(prompt).toContain("Verify all numeric steps");
    expect(prompt).toContain("no more than one worked example");
  });

  it("accepts language, modes and genuine conversation context, not only user questions",()=>{
    const server=read("src/lib/chat.functions.ts");
    const page=read("src/routes/chat.tsx");
    expect(server).toContain('question: z.string().trim().min(1).max(2000)');
    expect(server).toContain('contextToken: z.string().max(56000).optional()');
    expect(server).toContain('readChatContext(data.contextToken)');
    expect(server).not.toContain('role: z.enum(["user","assistant"])');
    expect(server).toContain('mode: z.enum(["hint","explain","quiz"])');
    expect(server).toContain('locale: z.enum(["hy","en","ru"])');
    expect(server).toContain('tutorModeInstructions(data.mode,data.locale)');
    expect(server).toContain('promptForConversation(messages,mode,locale)');
    expect(server).not.toContain("պատասխանիր միայն ԳՐԱԿԱՆ ՀԱՅԵՐԵՆՈՎ");
    expect(page).toContain("const [mode,setMode] = useState<StudyMode>");
    expect(page).toContain("mode, locale:lang");
    expect(page).toContain('role="group" aria-label={labels.title}');
    expect(page).toContain("question:content");
    expect(page).toContain("contextToken:contextTokenRef.current");
    expect(page).not.toContain("messages: next.filter");
    expect(page).toContain("aria-pressed={mode===key}");
  });

  it("increases the useful individual budget without removing total provider protections",()=>{
    const budget=read("src/lib/ai-quota.server.ts");
    const env=read(".env.example");
    expect(budget).toContain('subject === "user" ? 60 : subject === "admin" ? 80 : 30');
    expect(budget).toContain('aiQuotaLimit(process.env["AI_GLOBAL_DAILY_LIMIT"], 800)');
    expect(budget).toContain('aiQuotaLimit(process.env["AI_GLOBAL_MINUTE_LIMIT"], 25, 10000)');
    expect(env).toContain("AI_USER_DAILY_LIMIT=60");
    expect(env).toContain("AI_GLOBAL_DAILY_LIMIT=800");
    expect(env).not.toContain("AI_GLOBAL_DAILY_LIMIT=0");
    expect(budget).toContain('supabaseAdmin.rpc("reserve_ai_request"');
  });

  it("makes saved answer-key explanations reusable across student answer choices",()=>{
    const subject=read("src/lib/explain.functions.ts");
    const math=read("src/lib/math-explain.functions.ts");
    expect(subject).toContain("shared-teaching-v1");
    expect(subject).toContain("chosen: null");
    expect(subject).toContain("getSavedExplanation(cacheKey)");
    expect(subject).not.toContain('Աշակերտի պատասխանը: ${data.chosen}');
    expect(math).toContain("math-shared-v5");
    expect(math).toContain("getSavedExplanation(cacheKey)");
    expect(math).not.toContain('data.correct, data.chosen ?? ""');
    expect(math).not.toContain('Աշակերտի պատասխանը: ${valueLabel(d.kind, d.chosen)}');
  });

  it("does not place private chat messages into any shared cached explanation",()=>{
    const chat=read("src/lib/chat.functions.ts");
    const cache=read("src/lib/explanation-cache.server.ts");
    expect(chat).not.toContain("saveExplanation(");
    expect(chat).not.toContain("getSavedExplanation(");
    expect(cache).not.toContain("chatReply");
  });
});
