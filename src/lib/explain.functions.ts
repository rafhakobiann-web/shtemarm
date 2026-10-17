import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

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
    const key = process.env.LOVABLE_API_KEY;
    if (!key) return { text: "Բացատրությունը հիմա հասանելի չէ։" };
    const wrong = data.chosen && data.chosen !== data.correct;
    const prompt = `Դու անգլերենի փորձառու ուսուցիչ ես, որը պատրաստում է հայ աշակերտներին միասնական քննությանը։
Բացատրիր ՀԱՅԵՐԵՆՈՎ, պարզ և կարճ (առավելագույնը 120 բառ), թե ինչու է ճիշտ պատասխանը ճիշտ՝ նշելով քերականական կանոնը կամ տեքստի համապատասխան հատվածը։ Անգլերեն բառերն ու օրինակները թող մնան անգլերեն։
${wrong ? "Ապա առանձին բացատրիր, թե ինչու է աշակերտի ընտրած պատասխանը սխալ։" : "Աշակերտը ճիշտ է պատասխանել․ հակիրճ հաստատիր և նշիր մյուս տարբերակների սխալը։"}
Մի կրկնիր հարցը։ Մի օգտագործիր վերնագրեր։

Առաջադրանք: ${data.instruction}
${data.passage ? `Տեքստ:\n${data.passage}\n` : ""}Հարց:\n${data.question}
Ճիշտ պատասխան: ${data.correct}
${data.chosen ? `Աշակերտի պատասխանը: ${data.chosen}` : "Աշակերտը չի պատասխանել։"}`;
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "google/gemini-3-flash-preview", messages: [{ role: "user", content: prompt }] }),
    });
    if (res.status === 429) return { text: "Շատ հարցումներ․ փորձեք մի փոքր ուշ։" };
    if (res.status === 402) return { text: "Բացատրությունների սահմանաչափը սպառվել է։" };
    if (!res.ok) return { text: "Չհաջողվեց ստանալ բացատրությունը։" };
    const j = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    return { text: j.choices?.[0]?.message?.content?.trim() || "Բացատրություն չկա։" };
  });
