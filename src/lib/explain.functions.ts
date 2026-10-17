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
    const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: { "Lovable-API-Key": key, "Content-Type": "application/json", "X-Lovable-AIG-SDK": "fetch" },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        input: [{ role: "user", content: prompt }],
        reasoning: { effort: "low" },
        store: false,
        stream: true,
      }),
    });
    if (res.status === 429) return { text: "Շատ հարցումներ․ փորձեք մի փոքր ուշ։" };
    if (res.status === 402) return { text: "Բացատրությունների սահմանաչափը սպառվել է։" };
    if (!res.ok || !res.body) return { text: "Չհաջողվեց ստանալ բացատրությունը։" };
    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = "";
    let text = "";
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (!payload || payload === "[DONE]") continue;
        try {
          const ev = JSON.parse(payload) as { type?: string; delta?: string };
          if (ev.type === "response.output_text.delta" && ev.delta) text += ev.delta;
        } catch {
          /* partial */
        }
      }
    }
    return { text: text.trim() || "Բացատրություն չկա։" };
  });
    if (res.status === 429) return { text: "Շատ հարցումներ․ փորձեք մի փոքր ուշ։" };
    if (res.status === 402) return { text: "Բացատրությունների սահմանաչափը սպառվել է։" };
    if (!res.ok) return { text: "Չհաջողվեց ստանալ բացատրությունը։" };
    const j = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    return { text: j.choices?.[0]?.message?.content?.trim() || "Բացատրություն չկա։" };
  });
