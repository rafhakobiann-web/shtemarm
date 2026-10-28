import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { explanationKey } from "./explanation";
import { reliableEnglishFallback } from "./reliableEnglishFallback";

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
    const cacheKey = await explanationKey({ ...data, instruction: `${data.locale??"hy"}|${data.instruction}` });
    const cached = await getSavedExplanation(cacheKey);
    if (cached) return { text: cached, cached: true, error: false, offline: false };

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

    const ai = await generateExplanation(prompt, {
      gemini: process.env["GEMINI_API_KEY"],
      groq: process.env["GROQ_API_KEY"],
    });
    if (ai.ok) {
      await saveExplanation(cacheKey, ai.text);
      return { text: ai.text, cached: false, error: false, offline: false };
    }
    return {
      text: reliableEnglishFallback(data,data.locale??"hy"),
      cached: false, error: false, offline: true,
    };
  });
