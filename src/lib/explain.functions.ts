import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { explanationKey } from "./explanation";
import { reliableEnglishFallback } from "./reliableEnglishFallback";

/**
 * API-key-free explanation entry point.
 * Existing verified explanations are read from the shared cache. If none exists,
 * provide transparent deterministic study guidance, never invented AI reasoning.
 * The optional on-device model is a separate, future enhancement.
 */
const Input = z.object({
  instruction: z.string().max(500),
  passage: z.string().max(6000),
  question: z.string().max(2000),
  correct: z.string().max(500),
  chosen: z.string().max(500).nullable(),
  locale: z.enum(["hy", "en", "ru"]).optional(),
});

export const explainAnswer = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data }) => {
    const { getSavedExplanation } = await import("./explanation-cache.server");
    // Preserve legacy cache keys for existing explanations.
    const cacheKey = await explanationKey({
      ...data,
      instruction: `${data.locale ?? "hy"}|${data.instruction}`,
    });
    const cached = await getSavedExplanation(cacheKey);
    if (cached) return { text: cached, cached: true, error: false, offline: false };
    return {
      text: reliableEnglishFallback(data, data.locale ?? "hy"),
      cached: false,
      error: false,
      offline: true,
    };
  });
