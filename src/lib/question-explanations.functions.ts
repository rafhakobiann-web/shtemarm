import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { timingSafeEqual } from "node:crypto";

const BANKS = [
  "book1.json", "book2.json", "book3.json",
  "bio-book1.json", "bio-book2.json", "bio-book3.json", "bio-book4.json",
  "history-book1.json", "history-book2.json", "history-book3.json",
] as const;

const Bank = z.enum(BANKS);
const Question = z.object({
  id: z.string().min(3).max(200),
  label: z.string().max(300).optional(),
  passage: z.string().max(6000).optional(),
  stem: z.string().min(1).max(2000),
  options: z.record(z.string(), z.string().max(500)).nullable().optional(),
  correct: z.string().min(1).max(20),
});

const PROMPT_HEAD = `Դու փորձառու ուսուցիչ ես, որը հայ աշակերտներին օգնում է պատրաստվել քննությանը։
Տրված ճիշտ պատասխանը վերցված է պաշտոնական բանալուց։ Հիմնավորիր այն՝ ոչ թե պարզապես կրկնիր բանալին։
Գրիր ԳՐԱԿԱՆ ՀԱՅԵՐԵՆՈՎ՝ 120–260 բառ։ Օգտագործիր կարճ, համարակալված քայլեր՝
1. Հարցի իմաստը, 2. Ինչն է պահանջվում, 3. Ինչու է ճիշտը ճիշտ, 4. Ինչու մյուս տարբերակները սխալ են։
Եթե հարցը անգլերենի քերականության մասին է, բեր կանոն և մեկ օրինակ։
Մի հորինիր փաստեր և մի փոխիր տրված ճիշտ պատասխանը։`;

function buildPrompt(q: z.infer<typeof Question>) {
  const opts = Object.entries(q.options ?? {}).map(([k, v]) => `${k}) ${v}`).join("\n");
  return [
    PROMPT_HEAD,
    q.label ? `Բաժին՝ ${q.label}` : "",
    q.passage ? `Տեքստ՝\n${q.passage}` : "",
    `Հարց՝ ${q.stem}`,
    opts ? `Տարբերակներ՝\n${opts}` : "",
    `Ճիշտ պատասխան (պաշտոնական բանալի)՝ ${q.correct}`,
  ].filter(Boolean).join("\n\n");
}

function checkAdmin(password: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) throw new Error("admin not configured");
  const supplied = Buffer.from(password, "utf8");
  const secret = Buffer.from(expected, "utf8");
  if (supplied.length !== secret.length || !timingSafeEqual(supplied, secret)) {
    throw new Error("unauthorized");
  }
}

async function askGemini(prompt: string): Promise<{ text: string; provider: string } | null> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return null;
  for (const model of ["gemini-3.5-flash-lite", "gemini-3.8-flash"]) {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      signal: AbortSignal.timeout(20000),
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig: { maxOutputTokens: 1300 } }),
    });
    if (!res.ok) continue;
    const json = (await res.json()) as { candidates?: { content?: { parts?: { text?: string; thought?: boolean }[] } }[] };
    const text = (json.candidates?.[0]?.content?.parts ?? []).filter((p) => !p.thought).map((p) => p.text ?? "").join("").trim();
    if (text) return { text, provider: `Gemini ${model}` };
  }
  return null;
}

async function askGroq(prompt: string): Promise<{ text: string; provider: string } | null> {
  const key = process.env.GROQ_API_KEY;
  if (!key) return null;
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    signal: AbortSignal.timeout(30000),
    headers: { Authorization: "Bearer " + key, "Content-Type": "application/json" },
    body: JSON.stringify({ model: "openai/gpt-oss-120b", messages: [{ role: "user", content: prompt }], max_completion_tokens: 1600, stream: false }),
  });
  if (!res.ok) return null;
  const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const text = String(json.choices?.[0]?.message?.content ?? "").trim();
  return text ? { text, provider: "Groq gpt-oss-120b" } : null;
}

/** Admin: stored question ids for one bank, so the page can skip finished work. */
export const adminStoredExplanationIds = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ password: z.string().min(1).max(200), bank: Bank }).parse(input))
  .handler(async ({ data }) => {
    const { requireVerifiedAdminSession } = await import("./admin-session.server");
    await requireVerifiedAdminSession();
    checkAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("question_explanations")
      .select("question_id")
      .eq("bank", data.bank);
    if (error) { console.error("[explanations] list failed", error.code); throw new Error("service_unavailable"); }
    return (rows ?? []).map((r) => r.question_id as string);
  });

/** Admin: generate and store one explanation. Call once per question from the page. */
export const adminGenerateExplanation = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ password: z.string().min(1).max(200), bank: Bank, question: Question }).parse(input))
  .handler(async ({ data }) => {
    const { requireVerifiedAdminSession } = await import("./admin-session.server");
    await requireVerifiedAdminSession();
    checkAdmin(data.password);
    const { reserveAiRequest } = await import("./ai-quota.server");
    const budget = await reserveAiRequest({ admin: true });
    if (!budget.allowed) throw new Error("ai_quota_unavailable");
    const prompt = buildPrompt(data.question);
    const result = (await askGemini(prompt)) ?? (await askGroq(prompt));
    if (!result) throw new Error("no_provider_available");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("question_explanations").upsert({
      bank: data.bank,
      question_id: data.question.id,
      explanation: result.text.slice(0, 6000),
      correct: data.question.correct,
      provider: result.provider,
      reviewed: false,
    });
    if (error) { console.error("[explanations] save failed", error.code); throw new Error("service_unavailable"); }
    return { ok: true as const, id: data.question.id, provider: result.provider };
  });

/** Admin: mark a stored explanation as reviewed so students can see it. */
export const adminSetExplanationReviewed = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ password: z.string().min(1).max(200), bank: Bank, id: z.string().min(3).max(200), reviewed: z.boolean() }).parse(input))
  .handler(async ({ data }) => {
    const { requireVerifiedAdminSession } = await import("./admin-session.server");
    await requireVerifiedAdminSession();
    checkAdmin(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("question_explanations")
      .update({ reviewed: data.reviewed }).eq("bank", data.bank).eq("question_id", data.id);
    if (error) { console.error("[explanations] review failed", error.code); throw new Error("service_unavailable"); }
    return { ok: true as const };
  });

/** Public: a reviewed explanation for one question, or null if none is available. */
export const getReviewedExplanation = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ bank: Bank, id: z.string().min(3).max(200) }).parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin.from("question_explanations")
      .select("explanation, correct")
      .eq("bank", data.bank).eq("question_id", data.id).eq("reviewed", true).maybeSingle();
    if (error) { console.error("[explanations] read failed", error.code); return null; }
    return row ? { text: row.explanation as string, correct: row.correct as string } : null;
  });

