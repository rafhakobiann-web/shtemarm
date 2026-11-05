import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { explanationKey } from "./explanation";
import { reliableEnglishFallback } from "./reliableEnglishFallback";
import { buildSubjectTeachingPrompt } from "./teaching-prompts";

const Input = z.object({
  instruction: z.string().max(500),
  passage: z.string().max(6000),
  question: z.string().max(2000),
  correct: z.string().max(500),
  chosen: z.string().max(500).nullable(),
  locale: z.enum(["hy","en","ru"]).optional(),
});

export const explainAnswer = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data }) => {
    const { getSavedExplanation, saveExplanation } = await import("./explanation-cache.server");
    const { generateExplanation } = await import("./explanation-providers.server");
    const cacheKey = await explanationKey({ ...data, chosen: null, instruction: `shared-teaching-v2|${data.locale??"hy"}|${data.instruction}` });
    const cached = await getSavedExplanation(cacheKey);
    if (cached) return { text: cached, cached: true, error: false, offline: false };

    const prompt = buildSubjectTeachingPrompt(data);

    const keys = {
      gemini: process.env["GEMINI_API_KEY"],
      groq: process.env["GROQ_API_KEY"],
    };
    if (!keys.gemini && !keys.groq) {
      return { text: reliableEnglishFallback(data, data.locale ?? "hy"),
        cached: false, error: false, offline: true, aiUnavailable: "no_provider" };
    }
    const { reserveAiRequest } = await import("./ai-quota.server");
    const quota = await reserveAiRequest();
    if (!quota.allowed) {
      return { text: reliableEnglishFallback(data, data.locale ?? "hy"),
        cached: false, error: false, offline: true, aiUnavailable: quota.reason };
    }
    const ai = await generateExplanation(prompt, keys);
    if (ai.ok) {
      await saveExplanation(cacheKey, ai.text);
      return { text: ai.text, cached: false, error: false, offline: false };
    }
    return {
      text: reliableEnglishFallback(data,data.locale??"hy"),
      cached: false, error: false, offline: true,
    };
  });
