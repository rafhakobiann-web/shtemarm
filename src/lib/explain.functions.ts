import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { explanationError, explanationKey, readGeminiStream, readGroqStream } from "./explanation";

const Input = z.object({
  instruction: z.string().max(500),
  passage: z.string().max(6000),
  question: z.string().max(2000),
  correct: z.string().max(500),
  chosen: z.string().max(500).nullable(),
});

export const explainAnswer = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const cacheKey = await explanationKey(data);
    const { data: cached } = await supabaseAdmin
      .from("explanation_cache")
      .select("explanation")
      .eq("cache_key", cacheKey)
      .maybeSingle();

    if (cached) return { text: cached.explanation, cached: true, error: false };

    const wrong = data.chosen && data.chosen !== data.correct;
    const prompt = `Դու անգլերենի փորձառու ուսուցիչ ես, որը հայ աշակերտներին պատրաստում է միասնական քննությանը։
Ճիշտ պատասխանը վերցված է շտեմարանի պաշտոնական պատասխաններից և ՃԻՇՏ Է․ մի վիճարկիր այն։
Գրիր ՀԱՅԵՐԵՆՈՎ, մանրամասն և ճշգրիտ (150–280 բառ)։ Անգլերեն բառերը, կանոնների անվանումներն ու օրինակները թող մնան անգլերեն։
Կառուցվածքը (առանց վերնագրերի, կարճ պարբերություններով).
1. Ինչու է ճիշտ պատասխանը ճիշտ՝ նշիր կոնկրետ քերականական կանոնը կամ բառի իմաստը, կամ մեջբերիր տեքստի այն հատվածը (տողը), որտեղ է պատասխանը։
${wrong ? "2. Ինչու է աշակերտի ընտրածը սխալ՝ կոնկրետ պատճառով։" : "2. Աշակերտը ճիշտ է պատասխանել․ հաստատիր դա։"}
3. Յուրաքանչյուր մյուս տարբերակի համար մեկ նախադասությամբ՝ ինչու այն չի համապատասխանում։ Եթե առաջադրանքը համարակալված նախադասություններով է, համառոտ գնահատիր յուրաքանչյուր համարը։ Եթե համապատասխանեցում կամ բացթողումների լրացում է, բացատրիր յուրաքանչյուր զույգը։
4. Մեկ կարճ «Հիշիր»՝ օգտակար խորհուրդ։
Ընդգծումների համար օգտագործիր **բառ**։ Մի կրկնիր հարցն ամբողջությամբ։

Առաջադրանք: ${data.instruction}
${data.passage ? `Տեքստ:\n${data.passage}\n` : ""}Հարց:\n${data.question}
Ճիշտ պատասխան: ${data.correct}
${data.chosen ? `Աշակերտի պատասխանը: ${data.chosen}` : "Աշակերտը չի պատասխանել։"}`;

    const groqKey = process.env["GROQ_API_KEY"];
    const geminiKey = process.env["GEMINI_API_KEY"];

    if (!groqKey && !geminiKey) {
      return { text: "Բացատրությունները միացնելու համար կայքի պատասխանատուն պետք է ավելացնի Groq-ի կամ Gemini-ի բանալին։", error: true };
    }

    try {
      let res: Response;
      let isGroq = false;

      if (groqKey) {
        isGroq = true;
        res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: { 
            "Authorization": `Bearer ${groqKey}`, 
            "Content-Type": "application/json" 
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
            stream: true,
          }),
        });
      }

      if ((!groqKey || !res!.ok) && geminiKey) {
        isGroq = false;
        const callGemini = (model: string) =>
          fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?key=${geminiKey}&alt=sse`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [{ role: "user", parts: [{ text: prompt }] }],
              }),
            }
          );

        // Flash-lite first for speed; the stronger model is only a fallback.
        res = await callGemini("gemini-3.5-flash-lite");
        if (!res.ok) {
          res = await callGemini("gemini-3.5-flash");
        }
      }

      if (!res! || !res.ok || !res.body) {
        return { text: explanationError(res!?.status ?? 500), error: true };
      }

      const result = isGroq ? await readGroqStream(res.body) : await readGeminiStream(res.body);
      
      if (result.blocked) return { text: "Ծառայությունը մերժեց այս բացատրության ստեղծումը։", error: true };
      if (!result.text) return { text: "Ծառայությունը դատարկ պատասխան վերադարձրեց։", error: true };

      // Store in the background so the learner gets the explanation without waiting for the write.
      supabaseAdmin
        .from("explanation_cache")
        .upsert({ cache_key: cacheKey, explanation: result.text }, { onConflict: "cache_key" })
        .then(() => undefined, () => undefined);

      return { text: result.text, cached: false, error: false };
    } catch {
      return { text: "Չհաջողվեց ստանալ բացատրությունը․ փորձեք ավելի ուշ։", error: true };
    }
  });
