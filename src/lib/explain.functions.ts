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
  teachingStyle: z.enum(["explain","hint","practice"]).default("explain"),
});

export const explainAnswer = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data }) => {
    const { getSavedExplanation, saveExplanation } = await import("./explanation-cache.server");
    const { generateExplanation } = await import("./explanation-providers.server");
    const cacheKey = await explanationKey({ ...data, chosen: null, instruction: `shared-teaching-v2|${data.locale??"hy"}|${data.teachingStyle}|${data.instruction}` });
    const cached = await getSavedExplanation(cacheKey);
    if (cached) return { text: cached, cached: true, error: false, offline: false };

    const styleGuide = data.teachingStyle === "hint" ? "Տուր հստակ առաջին հուշումը և մեկ ուղղորդող հարց, ապա անհրաժեշտության դեպքում բացատրիր քայլը։" : data.teachingStyle === "practice" ? "Բացատրիր հիմնական կանոնը և տուր մեկ նոր, ոչ պաշտոնական, համանման փոքր վարժություն՝ ինքնաստուգման համար։ Նշիր, որ այն ստեղծված է AI-ի կողմից։" : "Բացատրիր լուծումը քայլ առ քայլ՝ առանց բաց թողնելու հիմնավորումները։";
    const languageGuide = data.locale === "en" ? "Respond in English." : data.locale === "ru" ? "Отвечай на русском языке." : "Պատասխանիր գրական արևելահայերենով։";
    const prompt = `Դու փորձառու ուսուցիչ ես, որը հայ աշակերտներին օգնում է անգլերենից, կենսաբանությունից, հայոց պատմությունից, հայոց լեզվից և այլ առարկաներից։ Որոշիր հարցի առարկան և բացատրիր հենց այդ առարկայի կանոններով։
Տրված ճիշտ պատասխանը վերցված է հարցաշարի բանալուց։ Հիմնավորիր այն՝ ոչ թե պարզապես կրկնիր բանալին։ Եթե պայմանը հակասական է, նշիր դա։
${languageGuide} ${styleGuide} Գրի՛ր հակիրճ և հասկանալի։ Օգտագործիր կարճ, համարակալված քայլեր՝ 1. Հարցի իմաստը, 2. Կանոնը կամ փաստը, 3. Լուծման հիմնավորումը, 4. Եզրակացություն և տարածված սխալ։
Եթե հարցը անգլերենի քերականության մասին է, բեր կանոն և օրինակ։ Եթե բնագիտական կամ պատմական է, բացատրիր ստուգելի փաստերով՝ առանց երևակայական մանրամասների։ Մաթեմատիկական բանաձևերը գրիր LaTeX-ով՝ $...$ կամ $$...$$։ 
Եթե ֆունկցիայի կամ երկրաչափական պատկերի տվյալները բավարար են, կարող ես ավելացնել մեկ diagram JSON code block՝ {"type":"function","shape":"linear","a":2,"b":1,"c":0} կամ {"type":"triangle","labels":["A","B","C"]}։ Անհիմն գծագրեր մի հորինիր։
Երբ կան տարբերակներ, բացատրիր նաև այլ պատասխանների սխալը՝ ըստ հարցի իմաստի։

Առաջադրանք: ${data.instruction}
${data.passage ? `Տեքստ:\n${data.passage}\n` : ""}Հարց:\n${data.question}
Ճիշտ պատասխան: ${data.correct}
Այս բացատրությունը կիրառվելու է նույն հարցը լուծող տարբեր սովորողների համար։ Ներկայացրու ընդհանուր լուծման հիմնավորումը՝ առանց անհատական ընտրությունը հիշատակելու։`;

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
