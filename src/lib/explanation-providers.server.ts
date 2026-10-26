/**
 * Stable explanation provider selection shared by all subjects.
 * Secrets never enter the client bundle. No unsolicited paid providers are used.
 * The caller explicitly supplies configured API keys from server environment.
 */
export type ProviderKeys = { gemini?: string | undefined; groq?: string | undefined };
export type ExplanationResult =
  | { ok: true; text: string; provider: "Gemini" | "Groq" }
  | { ok: false; reason: "no_key" | "invalid_key" | "rate_limit" | "unavailable" | "requires_vision" };
type Part = { text?: string; inline_data?: { mime_type: "image/jpeg"; data: string } };
function statusReason(status: number): Exclude<ExplanationResult,{ok:true}>["reason"] {
  if (status === 401 || status === 403) return "invalid_key";
  if (status === 429) return "rate_limit";
  return "unavailable";
}
export function errorToUser(reason: Exclude<ExplanationResult,{ok:true}>["reason"]) {
  switch (reason) {
    case "no_key": return "ԱԲ բացատրությունները միացված չեն․ սերվերում պետք է կարգավորել GEMINI_API_KEY կամ GROQ_API_KEY։";
    case "invalid_key": return "ԱԲ ծառայությունը մերժեց բանալին կամ հասանելիությունը։ Ստուգիր սերվերի API կարգավորումները։";
    case "rate_limit": return "ԱԲ ծառայության հարցումների սահմանաչափը լրացել է։ Փորձիր ավելի ուշ։";
    case "requires_vision": return "Այս խնդրի պայմանը նկարում է․ անհրաժեշտ է պատկերներ կարդացող ԱԲ ծառայություն (Gemini), կամ խնդրի թվայնացված ամբողջական տեքստը։";
    default: return "ԱԲ ծառայությունն այս պահին հասանելի չէ։ Փորձիր կրկին կամ ստուգիր սերվերի կարգավորումները։";
  }
}

async function gemini(prompt: string, key: string, images: string[], fastOnly = false): Promise<ExplanationResult> {
  const parts: Part[] = [{ text: prompt }, ...images.map(image => ({
    inline_data: { mime_type: "image/jpeg" as const, data: image.slice(image.indexOf(",") + 1) },
  }))];
  let reason: Exclude<ExplanationResult,{ok:true}>["reason"] = "unavailable";
  for (const model of fastOnly ? ["gemini-3.5-flash-lite"] : ["gemini-3.5-flash-lite", "gemini-3.8-flash"]) {
    try {
      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent",
        { method: "POST", signal: AbortSignal.timeout(model === "gemini-3.5-flash-lite" ? 10000 : 12000),
          headers: { "Content-Type": "application/json", "x-goog-api-key": key },
          body: JSON.stringify({ contents: [{ role: "user", parts }],
            generationConfig: { maxOutputTokens: 1300 } }) },
      );
      if (!response.ok) {
        reason = statusReason(response.status);
        if (reason === "invalid_key") return { ok:false, reason };
        continue;
      }
      const json = await response.json() as {
        promptFeedback?: { blockReason?: string };
        candidates?: { content?: { parts?: { text?: string; thought?: boolean }[] } }[];
      };
      if (json.promptFeedback?.blockReason) return { ok:false, reason:"unavailable" };
      const text = (json.candidates?.[0]?.content?.parts ?? [])
        .filter(part => !part.thought).map(part => part.text ?? "").join("").trim();
      if (text) return { ok:true, text, provider:"Gemini" };
    } catch { /* Model may be unavailable or the request may time out. */ }
  }
  return { ok:false, reason };
}
async function groq(prompt: string, key: string, fast = false): Promise<ExplanationResult> {
  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method:"POST", signal:AbortSignal.timeout(11000),
      headers: { Authorization: "Bearer " + key, "Content-Type":"application/json" },
      body: JSON.stringify({
        model:fast ? "openai/gpt-oss-20b" : "openai/gpt-oss-120b",
        messages:[{role:"user",content:prompt}],
        max_completion_tokens:fast ? 800 : 1600,
        stream:false,
      }),
    });
    if (!response.ok) return { ok:false, reason:statusReason(response.status) };
    const json = await response.json() as {
      choices?: { message?: { content?: string | { text?: string }[] } }[];
    };
    const content = json.choices?.[0]?.message?.content;
    const text = typeof content === "string" ? content.trim() :
      Array.isArray(content) ? content.map(p => p.text ?? "").join("").trim() : "";
    return text ? { ok:true, text, provider:"Groq" } : { ok:false, reason:"unavailable" };
  } catch { return { ok:false, reason:"unavailable" }; }
}
/**
 * Only Gemini currently supports source page images in this implementation.
 * For plain text, prefer Gemini Flash-Lite, then Groq as fallback.
 */
export type GenerationOptions = { preferGroq?: boolean; fast?: boolean };
/** Prefer a working configured provider instead of trying every model before fallback.
 * For image questions Gemini alone is used; Groq doesn't process page images here.
 */
export async function generateExplanation(
  prompt: string, keys: ProviderKeys, images: string[] = [],
  options: GenerationOptions = {},
): Promise<ExplanationResult> {
  if (!keys.gemini && !keys.groq) return { ok: false, reason: "no_key" };
  if (images.length && !keys.gemini) return { ok: false, reason: "requires_vision" };
  let failure: Extract<ExplanationResult, {ok: false}>["reason"] = "unavailable";
  if (options.preferGroq && keys.groq && images.length === 0) {
    const answer = await groq(prompt, keys.groq, options.fast);
    if (answer.ok) return answer;
    failure = answer.reason;
  }
  if (keys.gemini) {
    // On text, one fast Gemini request is enough before trying Groq;
    // on visual math, try the more capable Flash only if the lite model fails.
    const result = await gemini(prompt, keys.gemini, images, !!keys.groq && images.length === 0);
    if (result.ok) return result;
    if (failure === "unavailable") failure = result.reason;
  }
  if (!options.preferGroq && keys.groq && images.length === 0) {
    const answer = await groq(prompt, keys.groq, options.fast);
    if (answer.ok) return answer;
    if (failure === "unavailable") failure = answer.reason;
  }
  return {ok: false, reason: failure};
}
