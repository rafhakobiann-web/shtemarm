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
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) return { text: "Բացատրությունը հիմա հասանելի չէ։" };
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
    const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: { "Lovable-API-Key": key, "Content-Type": "application/json", "X-Lovable-AIG-SDK": "fetch" },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        input: [{ role: "user", content: prompt }],
        reasoning: { effort: "medium" },
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
