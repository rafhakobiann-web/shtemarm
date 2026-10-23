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
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
    if (!key) {
      return { text: "Հաշվիչը միացնելու համար կայքի պատասխանատուն պետք է ավելացնի Gemini-ի բանալին։", error: true };
    }
    const parts: Part[] = [];
    if (data.image) parts.push({ inlineData: { mimeType: data.image.mime, data: data.image.data } });
    parts.push({ text: data.text?.trim() ? `Խնդիրը՝\n${data.text.trim()}` : "Լուծիր նկարում պատկերված խնդիրը։" });
    try {
      const text = await callGemini(key, parts);
      if (!text) return { text: "Ծառայությունը դատարկ պատասխան վերադարձրեց։ Փորձեք կրկին։", error: true };
      return { text, error: false };
    } catch {
      return { text: "Չհաջողվեց լուծել։ Փորձեք ավելի ուշ կամ ավելի հստակ նկար։", error: true };
    }
  });
