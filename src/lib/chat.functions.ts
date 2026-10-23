import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({
  messages: z
    .array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().min(1).max(2000) }))
    .min(1)
    .max(20),
});

const SYSTEM = `Դու Shtemarm կայքի օգնականն ես։ Shtemarm-ը շտեմարաններ և թեստեր է հայ աշակերտների համար՝ անգլերենի, մաթեմատիկայի, Հայոց պատմության և կենսաբանության միասնական քննություններին պատրաստվելու համար։
Պատասխանիր միայն ԳՐԱԿԱՆ ՀԱՅԵՐԵՆՈՎ՝ ճիշտ քերականությամբ և կետադրությամբ։ Անգլերեն բառերը և օրինակները թող մնան անգլերեն։
Մի օգտագործիր markdown նշաններ՝ աստղանիշ (*), դիեզ (#), ստորակետ-գիծ ցուցակների համար, ընդգծում, թեք կամ թավ տառատեսակ։ Ցուցակ գրելու համար օգտագործիր «1.», «2.» համարակալումը։
Եթե պետք է բառ ընդգծել, գրիր այն KaTeX-ով՝ $\\textbf{բառ}$։
Բոլոր մաթեմատիկական արտահայտությունները, թվային բանաձևերը, հավասարումները, կոտորակները, աստիճանները, արմատները, եռանկյունաչափական ու երկրաչափական ֆունկցիաները գրիր միայն KaTeX-ով՝ $...$ տողամիջյան կամ $$...$$ առանձին տողում։ Օրինակ՝ $x^2 + 3x - 4 = 0$, $\\sin\\alpha$, $\\frac{a}{b}$, $\\sqrt{x}$, $\\log_2 8 = 3$։
Օգնիր հասկանալ թեման և կանոնները, բայց մի տուր պատրաստի պատասխաններ առանց բացատրության։
Եթե որևէ փաստ վստահ չես, ասա դա և մի հորինիր։ Հարցերի համար, որոնք կապ չունեն կրթության հետ, քաղաքավարի հիշեցրու, որ օգնում ես միայն ուսման հարցերում։`;

/** Safety net: remove markdown symbols the model may still produce. */
const clean = (t: string) => t.replace(/\*+/g, "").replace(/^#+\s*/gm, "").replace(/`+/g, "").trim();

type Msg = { role: "user" | "assistant"; content: string };

async function callGroq(key: string, messages: Msg[]) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "system", content: SYSTEM }, ...messages],
      temperature: 0.3,
      max_tokens: 700,
    }),
  });
  if (!res.ok) throw new Error(`groq ${res.status}`);
  const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  return clean(json.choices?.[0]?.message?.content ?? "");
}

async function callGemini(key: string, messages: Msg[]) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM }] },
        contents: messages.map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] })),
        generationConfig: { temperature: 0.3, maxOutputTokens: 700 },
      }),
    },
  );
  if (!res.ok) throw new Error(`gemini ${res.status}`);
  const json = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
  return clean(json.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "");
}

export const chatReply = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data }) => {
    const groqKey = process.env["GROQ_API_KEY"];
    const geminiKey = process.env["GEMINI_API_KEY"];
    if (!groqKey && !geminiKey) {
      return { text: "Չատբոտը միացնելու համար կայքի պատասխանատուն պետք է ավելացնի Groq-ի կամ Gemini-ի բանալին։", error: true };
    }
    try {
      let text = "";
      if (groqKey) {
        try {
          text = await callGroq(groqKey, data.messages);
        } catch {
          if (geminiKey) text = await callGemini(geminiKey, data.messages);
          else throw new Error("groq failed");
        }
      } else if (geminiKey) {
        text = await callGemini(geminiKey, data.messages);
      }
      if (!text) return { text: "Ծառայությունը դատարկ պատասխան վերադարձրեց։ Փորձեք կրկին։", error: true };
      return { text, error: false };
    } catch {
      return { text: "Չհաջողվեց պատասխանել։ Փորձեք ավելի ուշ։", error: true };
    }
  });
