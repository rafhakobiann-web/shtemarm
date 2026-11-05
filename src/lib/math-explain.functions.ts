import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { reliableMathFallback } from "./reliableMathFallback";
import { buildMathTeachingPrompt, mathTeachingCacheParts } from "./teaching-prompts";

// Page images are sent as JPEG data URLs by the browser; each is ~50–70 KB on disk.
const PageImage = z.string().regex(/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/).max(400_000);

const Input = z.object({
  item: z.string().regex(/^matem-[12]:\d+:\d+:\d+:\d+$/),
  kind: z.enum(["choice", "tf", "open"]),
  task: z.string().max(200),
  correct: z.string().max(40),
  chosen: z.string().max(40).nullable(),
  pages: z.array(PageImage).max(3),
  question: z.string().max(3500),
  options: z.array(z.string().max(450)).max(6),
  locale: z.enum(["hy","en","ru"]).optional(),
});

type Input = z.infer<typeof Input>;

function sha256Hex(parts: string[]) {
  const bytes = new TextEncoder().encode(JSON.stringify(parts));
  return crypto.subtle.digest("SHA-256", bytes).then((hash) =>
    [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, "0")).join(""),
  );
}

function offlineMathExplanation(data: Input) {
  return {
    text: reliableMathFallback(data,data.locale??"hy"),
    cached:false,error:false,offline:true
  };
}

export const explainMathAnswer = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data }) => {
    const { getSavedExplanation, saveExplanation } = await import("./explanation-cache.server");
    const { generateExplanation } = await import("./explanation-providers.server");
    if (!data.pages.length && !data.question.trim())
      return { text: data.locale === "en" ? "The question is missing. Please try another question."
        : data.locale === "ru" ? "Условие задания отсутствует. Попробуй другое задание."
        : "Առաջադրանքի պայմանը բացակայում է․ խնդրում ենք փորձել մեկ այլ հարց։", cached: false, error: true, offline: true };

    const cacheKey = await sha256Hex(mathTeachingCacheParts(data));
    const cached = await getSavedExplanation(cacheKey);
    if (cached) return { text: cached, cached: true, error: false, offline: false };

    const geminiKey = process.env["GEMINI_API_KEY"];
    const groqKey = process.env["GROQ_API_KEY"];
    const usingImages = data.pages.length > 0 && !!geminiKey;
    const textAvailable = !!data.question.trim();
    // A text-only Groq model must not be asked to hallucinate from unseen scans.
    const { reserveAiRequest } = await import("./ai-quota.server");
    const canCall = (usingImages || textAvailable) && !!(geminiKey || groqKey);
    const budget = canCall ? await reserveAiRequest() : null;
    if (budget && !budget.allowed) {
      return { ...offlineMathExplanation(data), aiUnavailable: budget.reason };
    }
    const ai = usingImages || textAvailable
      ? await generateExplanation(
        buildMathTeachingPrompt({ ...data, pages: usingImages ? data.pages : [] }),
        { gemini: geminiKey, groq: groqKey },
        usingImages ? data.pages : [],
      )
      : { ok: false as const, reason: "requires_vision" as const };

    if (ai.ok) {
      await saveExplanation(cacheKey, ai.text);
      return { text: ai.text, cached: false, error: false, offline: false };
    }
    const offline = offlineMathExplanation(data);
    return {
      ...offline,
      error: false,
      text: offline.text,
    };
  });
