import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { explanationError, explanationKey, offlineEnglishExplanation, readGeminiStream, readGroqStream } from "./explanation";

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
    try {
      const { data: cached } = await supabaseAdmin
        .from("explanation_cache")
        .select("explanation")
        .eq("cache_key", cacheKey)
        .maybeSingle();
      if (cached) return { text: cached.explanation, cached: true, error: false };
    } catch {
      // Keep the explanation flow available even if the optional cache is offline.
    }

    const wrong = data.chosen && data.chosen !== data.correct;
    const prompt = `Դու փորձառու ուսուցիչ ես, որը հայ աշակերտներին օգնում է անգլերենից, կենսաբանությունից, հայոց պատմությունից, հայոց լեզվից և այլ առարկաներից։ Որոշիր հարցի առարկան և բացատրիր հենց այդ առարկայի կանոններով։
Տրված ճիշտ պատասխանը վերցված է հարցաշարի բանալուց։ Հիմնավորիր այն՝ ոչ թե պարզապես կրկնիր բանալին։ Եթե պայմանը հակասական է, նշիր դա։
Գրիր ԳՐԱԿԱՆ ՀԱՅԵՐԵՆՈՎ՝ 120–260 բառ։ Օգտագործիր կարճ, համարակալված քայլեր՝ 1. Հարցի իմաստը, 2. Կանոնը կամ փաստը, 3. Լուծման հիմնավորումը, 4. Եզրակացություն և տարածված սխալ։
Եթե հարցը անգլերենի քերականության մասին է, բեր կանոն և օրինակ։ Եթե բնագիտական կամ պատմական է, բացատրիր ստուգելի փաստերով՝ առանց երևակայական մանրամասների։ Մաթեմատիկական բանաձևերը գրիր LaTeX-ով՝ $...$ կամ $$...$$։ 
Եթե ֆունկցիայի կամ երկրաչափական պատկերի տվյալները բավարար են, կարող ես ավելացնել մեկ diagram JSON code block՝ {"type":"function","shape":"linear","a":2,"b":1,"c":0} կամ {"type":"triangle","labels":["A","B","C"]}։ Անհիմն գծագրեր մի հորինիր։
Երբ կան տարբերակներ, բացատրիր նաև այլ պատասխանների սխալը՝ ըստ հարցի իմաստի։

Առաջադրանք: ${data.instruction}
${data.passage ? `Տեքստ:\n${data.passage}\n` : ""}Հարց:\n${data.question}
Ճիշտ պատասխան: ${data.correct}
${data.chosen ? `Աշակերտի պատասխանը: ${data.chosen}` : "Աշակերտը չի պատասխանել։"}`;

    const groqKey = process.env["GROQ_API_KEY"];
    const geminiKey = process.env["GEMINI_API_KEY"];

    if (!groqKey && !geminiKey) {
      return {
        text: offlineEnglishExplanation(data),
        cached: false,
        error: false,
        offline: true,
      };
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
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:streamGenerateContent?alt=sse`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json", "x-goog-api-key": geminiKey },
              body: JSON.stringify({
                contents: [{ role: "user", parts: [{ text: prompt }] }],
              }),
            }
          );

        // Flash-lite first for speed; the stronger model is only a fallback.
        res = await callGemini("gemini-3.5-flash-lite");
        if (!res.ok) {
          res = await callGemini("gemini-3.8-flash");
        }
      }

      if (!res! || !res.ok || !res.body) {
        return { text: offlineEnglishExplanation(data), cached: false, error: false, offline: true };
      }

      const result = isGroq ? await readGroqStream(res.body) : await readGeminiStream(res.body);
      
      if (result.blocked) return { text: offlineEnglishExplanation(data), cached: false, error: false, offline: true };
      if (!result.text) return { text: offlineEnglishExplanation(data), cached: false, error: false, offline: true };

      // Store in the background so the learner gets the explanation without waiting for the write.
      supabaseAdmin
        .from("explanation_cache")
        .upsert({ cache_key: cacheKey, explanation: result.text }, { onConflict: "cache_key" })
        .then(() => undefined, () => undefined);

      return { text: result.text, cached: false, error: false };
    } catch {
      return { text: offlineEnglishExplanation(data), cached: false, error: false, offline: true };
    }
  });
