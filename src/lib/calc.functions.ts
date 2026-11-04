import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z
  .object({
    text: z.string().max(2000).optional(),
    image: z
      .object({
        mime: z.enum(["image/jpeg", "image/png", "image/webp"]),
        // base64 without the data: prefix; the client shrinks photos before sending
        data: z.string().max(4_000_000),
      })
      .optional(),
  })
  .refine((v) => Boolean(v.image) || Boolean(v.text && v.text.trim()), { message: "empty" });

const SYSTEM = `Դու Shtemarm կայքի հաշվիչն ես։ Լուծիր տրված խնդիրը (մաթեմատիկա, ֆիզիկա, քիմիա կամ այլ առարկա)՝ տրված տեքստով կամ նկարով։
Պատասխանիր ԳՐԱԿԱՆ ՀԱՅԵՐԵՆՈՎ՝ ճիշտ քերականությամբ։ Անգլերեն բառերը և օրինակները թող մնան անգլերեն։
Կանոններ, որոնք պարտադիր են.
- Չօգտագործես աստղանիշ (*), դիեզ (#), շեղ գծիկ-հետևող (\`), աղյուսակներ կամ markdown նշաններ։
- Քայլերը գրիր «1.», «2.» համարակալումով, յուրաքանչյուր քայլ առանձին տողով։
- Բոլոր մաթեմատիկական արտահայտությունները գրիր LaTeX-ով՝ միայն դոլարի նշաններով՝ $...$ (տողում) կամ $$...$$ (առանձին տողով)։ Օրինակ՝ $x^2 - 5x + 6 = 0$, $$x = \\frac{-b \\pm \\sqrt{b^2-4ac}}{2a}$$։
- Եթե նկարում խնդիր չկա կամ պատկերը անընթեռնելի է, ասա դա ու խնդրիր ավելի հստակ նկար կամ տեքստ։
- Վերջում մեկ տողով գրիր վերջնական պատասխանը՝ «Պատասխան․» բառից հետո։`;

type Part = { text: string } | { inlineData: { mimeType: string; data: string } };

const clean = (t: string) => t.replace(/\*+/g, "").replace(/^#+\s*/gm, "").replace(/`+/g, "").trim();

async function callGemini(key: string, parts: Part[]) {
  const res = await fetch(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent",
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      signal: AbortSignal.timeout(16000),
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM }] },
        contents: [{ role: "user", parts }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 1500 },
      }),
    },
  );
  if (!res.ok) throw new Error(`gemini ${res.status}`);
  const json = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
  return clean(json.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "");
}

export const solveProblem = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data }) => {
    const key = process.env["GEMINI_API_KEY"];
    const groqKey = process.env["GROQ_API_KEY"];
    const { generateExplanation, errorToUser } = await import("./explanation-providers.server");
    if (!key && !groqKey) {
      return { text: "Հաշվիչը միացնելու համար սերվերում անհրաժեշտ է GEMINI_API_KEY կամ GROQ_API_KEY։", error: true };
    }
    // Groq is text-only in this app: do not present made-up answers for images.
    if (data.image && !key) {
      return { text: errorToUser("requires_vision"), error: true };
    }
    const { reserveAiRequest, quotaMessage } = await import("./ai-quota.server");
    const budget = await reserveAiRequest();
    if (!budget.allowed) return { text: quotaMessage(budget.reason), error: true, limited: budget.reason === "quota" };
    const parts: Part[] = [];
    if (data.image) parts.push({ inlineData: { mimeType: data.image.mime, data: data.image.data } });
    parts.push({ text: data.text?.trim() ? "Խնդիրը՝\n" + data.text.trim() : "Լուծիր նկարում պատկերված խնդիրը։" });
    if (key) {
      try {
        const text = await callGemini(key, parts);
        if (text) return { text, error: false };
      } catch { /* Only try a text-only provider if the problem has text. */ }
    }
    if (groqKey && !data.image && data.text?.trim()) {
      const result = await generateExplanation(
        SYSTEM + "\n\nԽնդիր՝\n" + data.text.trim(),
        { groq: groqKey }, [], { preferGroq: true },
      );
      if (result.ok) return { text: result.text, error: false };
      return { text: errorToUser(result.reason), error: true };
    }
    return {
      text: data.image ? "Նկարի լուծումը այս պահին հասանելի չէ․ կրկին փորձիր կամ գրիր հարցի տեքստը։" :
        "ԱԲ հաշվիչը չի արձագանքել․ փորձիր կրկին։", error: true,
    };
  });
