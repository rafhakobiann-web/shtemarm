import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { explanationError } from "./explanation";

// Page images are sent as JPEG data URLs by the browser; each is ~50–70 KB on disk.
const PageImage = z.string().regex(/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/).max(400_000);

const Input = z.object({
  item: z.string().regex(/^matem-[12]:\d+:\d+:\d+:\d+$/),
  kind: z.enum(["choice", "tf", "open"]),
  task: z.string().max(200),
  correct: z.string().max(40),
  chosen: z.string().max(40).nullable(),
  pages: z.array(PageImage).max(3),
  question: z.string().max(3500),
  options: z.array(z.string().max(450)).max(6),
});

type Input = z.infer<typeof Input>;

function sha256Hex(parts: string[]) {
  const bytes = new TextEncoder().encode(JSON.stringify(parts));
  return crypto.subtle.digest("SHA-256", bytes).then((hash) =>
    [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, "0")).join(""),
  );
}

function valueLabel(kind: Input["kind"], v: string) {
  if (kind === "tf") return v === "T" ? "Ճիշտ է" : "Սխալ է";
  if (kind === "choice") return `${v})-րդ տարբերակը`;
  return `«${v}»`;
}

function buildPrompt(d: Input) {
  const wrong = d.chosen !== null && d.chosen !== d.correct;
  const optionNote =
    d.kind === "choice"
      ? "Տարբերակները համարակալված են 1)-ից 4)։ Ճիշտ պատասխանը վերցված է պաշտոնական պատասխաններից և ՃԻՇՏ Է․ մի վիճարկիր այն։"
      : d.kind === "tf"
        ? "Յուրաքանչյուր ենթահարց գնահատվում է որպես «Ճիշտ է» կամ «Սխալ է»։ Ճիշտ պատասխանը պաշտոնական է և ՃԻՇՏ Է։"
        : "Սա բաց պատասխանով հարց է։ Ճիշտ պատասխանը պաշտոնական է և ՃԻՇՏ Է․ մի վիճարկիր այն։";

  return `Դու մաթեմատիկայի փորձառու ուսուցիչ ես, որը հայ աշակերտներին պատրաստում է միասնական քննությանը։
Պայման․ ${d.question || "Պայմանի տեքստը բացակայում է․ օգտագործիր կցված նկարները։"}\nՏարբերակներ․ ${d.options.map((o,i) => (i+1)+") "+o).join("; ")}\n${d.pages.length ? "Բնօրինակ էջերի նկարներն էլ կցված են․ գտիր նշված ենթահարցը։" : "Օգտագործիր տրված պայմանը․ մի հորինիր տվյալներ։"}\nԱռաջադրանք՝ ${d.task}։
${optionNote}
Գրիր ԳՐԱԿԱՆ ՀԱՅԵՐԵՆՈՎ, հասկանալի և մանրամասն (150–320 բառ)։ Պատասխանի բանալին մի օգտագործիր որպես միակ հիմնավորում․ լուծիր հարցն ու ստուգիր արդյունքը։ Եթե հարցը նկարի կամ տվյալների պակասի պատճառով չի լուծվում, մի հորինիր քայլեր։
Բոլոր մաթեմատիկական արտահայտությունները գրիր LaTeX-ով՝ $...$ կամ $$...$$։ Օգտագործիր \\frac, \\sqrt, \\pi, \\sin, \\cos, \\lim և անհրաժեշտության դեպքում \\begin{aligned}։ Գրիր ձևափոխությունները առանձին տողերով ու ճիշտ փակիր LaTeX հրամանները։ ASCII գծագիր մի ավելացրու։
Բացատրությունը բաժանիր համարակալված պարբերությունների․ 1. Տրված է, 2. Քայլ առ քայլ լուծում, 3. Ստուգում և ճիշտ տարբերակ, 4. Սխալի պատճառը, 5. Հիշիր՝ օգտակար կանոն։
Եթե հիմնավորված գծագիրն օգտակար է, ավարտին ավելացրու մեկ code fence, որի լեզուն diagram է, իսկ ներսում միայն վավեր JSON՝ առանց մեկնաբանությունների։
Ֆունկցիայի գրաֆիկի JSON՝ {"type":"function","shape":"linear","a":2,"b":1,"c":0,"xmin":-5,"xmax":5,"title":"y=2x+1"}։ shape=linear նշանակում է y=ax+b, quadratic՝ y=ax^2+bx+c, sine՝ y=a*sin(bx)+c։
Եռանկյան JSON՝ {"type":"triangle","labels":["A","B","C"],"sides":["c","a","b"],"title":"ABC եռանկյուն"}։
Շրջանագծի JSON՝ {"type":"circle","radius":"r","title":"Շրջանագիծ"}։
Մի ավելացրու գծագիր, եթե խնդրի տվյալներից այն ճշգրիտ չի բխում։ Այլ ձևաչափերով HTML, SVG կամ կատարվող կոդ մի գրիր։

Ճիշտ պատասխան: ${valueLabel(d.kind, d.correct)}
${d.chosen !== null ? `Աշակերտի պատասխանը: ${valueLabel(d.kind, d.chosen)}` : "Աշակերտը չի պատասխանել։"}`;
}

function offlineMathExplanation(data: Input) {
  const answer = valueLabel(data.kind, data.correct);
  const selected = data.chosen === null ? "" : data.chosen === data.correct
    ? "\\nՔո պատասխանը համընկնում է պաշտոնական պատասխանի հետ։"
    : `\\nՔո պատասխանը՝ ${valueLabel(data.kind, data.chosen)}, չի համընկնում պաշտոնական պատասխանի հետ։`;
  return {
    text: `Պաշտոնական ճիշտ պատասխանը՝ ${answer}։${selected}\\n\\nՏեղային պահուստային ռեժիմում հնարավոր չէ վստահորեն վերականգնել խնդրի ամբողջական քայլային լուծումը։ Մի հորինիր միջանկյալ քայլեր․ համեմատիր խնդրի պայմանը և պատասխանի բանալին։`,
    cached: false,
    error: false,
    offline: true,
  };
}

async function callGemini(key: string, prompt: string, pages: string[]) {
  const parts = [
    { text: prompt },
    ...pages.map((p) => ({ inline_data: { mime_type: "image/jpeg", data: p.split(",")[1] } })),
  ];
  for (const model of ["gemini-3.8-flash", "gemini-3.5-flash-lite"]) {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        body: JSON.stringify({ contents: [{ role: "user", parts }] }),
      },
    );
    if (r.ok) {
      const j = (await r.json()) as {
        promptFeedback?: { blockReason?: string };
        candidates?: { finishReason?: string; content?: { parts?: { text?: string; thought?: boolean }[] } }[];
      };
      if (j.promptFeedback?.blockReason) return { status: 403, text: "" };
      const text = (j.candidates?.[0]?.content?.parts ?? [])
        .filter((p) => !p.thought)
        .map((p) => p.text ?? "")
        .join("");
      return { status: 200, text: text.trim() };
    }
    if (![400, 404, 429, 503].includes(r.status)) return { status: r.status, text: "" };
  }
  return { status: 429, text: "" };
}

async function callGroq(key: string, prompt: string, pages: string[]) {
  const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            ...pages.map((p) => ({ type: "image_url", image_url: { url: p } })),
          ],
        },
      ],
    }),
  });
  if (!r.ok) return { status: r.status, text: "" };
  const j = (await r.json()) as { choices?: { message?: { content?: string } }[] };
  return { status: 200, text: (j.choices?.[0]?.message?.content ?? "").trim() };
}

export const explainMathAnswer = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (!data.pages.length && !data.question.trim()) return { text: "Առաջադրանքի պայմանը չի բեռնվել։", cached: false, error: true };

    // The key covers the item, the answers and the exact page images. Changing any of them
    // produces a new key, so a request with other images can never overwrite the real explanation.
    const cacheKey = await sha256Hex(["math-v2", data.item, data.kind, data.correct, data.chosen ?? "", data.question, ...data.options, ...data.pages]);
    let cached: { explanation: string } | null = null;
    try {
      const result = await supabaseAdmin
        .from("explanation_cache")
        .select("explanation")
        .eq("cache_key", cacheKey)
        .maybeSingle();
      cached = result.data;
    } catch {
      // Cache is optional; do not let it disable the explanation feature.
    }
    if (cached) return { text: cached.explanation, cached: true, error: false };

    const geminiKey = process.env["GEMINI_API_KEY"];
    const groqKey = process.env["GROQ_API_KEY"];
    if (!geminiKey && !groqKey) return offlineMathExplanation(data);

    const prompt = buildPrompt(data);
    try {
      const res = geminiKey
        ? await callGemini(geminiKey, prompt, data.pages)
        : await callGroq(groqKey!, prompt, data.pages);

      if (res.status !== 200) return offlineMathExplanation(data);
      if (!res.text) return offlineMathExplanation(data);

      await supabaseAdmin
        .from("explanation_cache")
        .upsert({ cache_key: cacheKey, explanation: res.text }, { onConflict: "cache_key" });

      return { text: res.text, cached: false, error: false };
    } catch {
      return offlineMathExplanation(data);
    }
  });
