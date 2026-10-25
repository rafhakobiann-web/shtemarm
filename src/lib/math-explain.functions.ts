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
  pages: z.array(PageImage).min(1).max(3),
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
Կցված են շտեմարանի էջերի նկարները։ Գտիր հարցը «${d.task}» առաջադրանքում՝ նշված ենթահարցի համարով, և բացատրիր լուծումը։
${optionNote}
Գրիր ՀԱՅԵՐԵՆՈՎ, ճշգրիտ և հասկանալի (120–250 բառ)։ Բանաձևերը գրիր պարզ տեքստով (օրինակ՝ x^2, sqrt(5), 3/4)։ Եթե խնդիրը պահանջում է գծագիր, երկրաչափական պատկեր, կոորդինատային հարթություն, ֆունկցիայի գրաֆիկ կամ կառուցվածքային սխեմա, ավելացրու համապատասխան ASCII գծագիրը առանձին \`\`\`text բլոկում։ Գծագիրը պետք է համապատասխանի հենց տվյալ խնդրին․ մի հորինիր կետեր, չափեր կամ գրաֆիկի ձև։ Եթե ճշգրիտ գծագիր հնարավոր չէ կազմել միայն տրված տվյալներից, բացատրիր՝ ինչն է պետք նշել գծագրի վրա։
Կառուցվածքը (առանց վերնագրերի, կարճ պարբերություններով).
1. Ինչու է ճիշտ պատասխանը ճիշտ՝ լուծման քայլերով։
${wrong ? "2. Ինչու է աշակերտի ընտրածը սխալ՝ կոնկրետ պատճառով։" : "2. Աշակերտը ճիշտ է պատասխանել․ հաստատիր դա և համառոտ նշիր ամենակարևոր քայլը։"}
3. ${d.kind === "open" ? "Եթե աշակերտի պատասխանը ճիշտ չէ, նշիր հաճախակի սխալը։" : "Յուրաքանչյուր մյուս տարբերակի համար մեկ նախադասությամբ՝ ինչու այն սխալ է։"}
4. Մեկ կարճ «Հիշիր»՝ օգտակար խորհուրդ։
Ընդգծումների համար օգտագործիր **բառ**։ Մի կրկնիր հարցի տեքստն ամբողջությամբ։

Ճիշտ պատասխան: ${valueLabel(d.kind, d.correct)}
${d.chosen !== null ? `Աշակերտի պատասխանը: ${valueLabel(d.kind, d.chosen)}` : "Աշակերտը չի պատասխանել։"}`;
}

async function callGemini(key: string, prompt: string, pages: string[]) {
  const parts = [
    { text: prompt },
    ...pages.map((p) => ({ inline_data: { mime_type: "image/jpeg", data: p.split(",")[1] } })),
  ];
  for (const model of ["gemini-3.5-flash", "gemini-3.5-flash-lite"]) {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
    if (r.status !== 503 && r.status !== 429) return { status: r.status, text: "" };
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

    // The key covers the item, the answers and the exact page images. Changing any of them
    // produces a new key, so a request with other images can never overwrite the real explanation.
    const cacheKey = await sha256Hex(["math-v1", data.item, data.kind, data.correct, data.chosen ?? "", ...data.pages]);
    const { data: cached } = await supabaseAdmin
      .from("explanation_cache")
      .select("explanation")
      .eq("cache_key", cacheKey)
      .maybeSingle();
    if (cached) return { text: cached.explanation, cached: true, error: false };

    const geminiKey = process.env["GEMINI_API_KEY"];
    const groqKey = process.env["GROQ_API_KEY"];
    if (!geminiKey && !groqKey) {
      return { text: "Բացատրությունները միացնելու համար կայքի պատասխանատուն պետք է ավելացնի Groq-ի կամ Gemini-ի բանալին։", error: true };
    }

    const prompt = buildPrompt(data);
    try {
      const res = geminiKey
        ? await callGemini(geminiKey, prompt, data.pages)
        : await callGroq(groqKey!, prompt, data.pages);

      if (res.status !== 200) return { text: explanationError(res.status), error: true };
      if (!res.text) return { text: "Ծառայությունը դատարկ պատասխան վերադարձրեց։", error: true };

      await supabaseAdmin
        .from("explanation_cache")
        .upsert({ cache_key: cacheKey, explanation: res.text }, { onConflict: "cache_key" });

      return { text: res.text, cached: false, error: false };
    } catch {
      return { text: "Չհաջողվեց ստանալ բացատրությունը․ փորձեք ավելի ուշ։", error: true };
    }
  });
