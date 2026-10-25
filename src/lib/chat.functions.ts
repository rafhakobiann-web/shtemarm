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
Բոլոր մաթեմատիկական արտահայտությունները, թվային բանաձևերը, հավասարումները, կոտորակները, աստիճանները, արմատները, եռանկյունաչափական ու երկրաչափական ֆունկցիաները գրիր միայն KaTeX-ով՝ $...$ տողամիջյան կամ $$...$$ առանձին տողում։
Օգնիր հասկանալ թեման և կանոնները, բայց մի տուր պատրաստի պատասխաններ առանց բացատրության։
Եթե որևէ փաստ վստահ չես, ասա դա և մի հորինիր։ Հարցերի համար, որոնք կապ չունեն կրթության հետ, քաղաքավարի հիշեցրու, որ օգնում ես միայն ուսման հարցերում։`;

const clean = (t: string) => t.replace(/\*+/g, "").replace(/^#+\s*/gm, "").replace(/`+/g, "").trim();
type Msg = { role: "user" | "assistant"; content: string };

async function callOpenAICompatible(url: string, key: string, model: string, messages: Msg[], provider: string) {
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...(provider === "openrouter" ? { "HTTP-Referer": "https://shtemarm.lovable.app/", "X-Title": "Shtemarm" } : {}),
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "system", content: SYSTEM }, ...messages],
      temperature: 0.3,
      max_tokens: 700,
    }),
  });
  if (!res.ok) throw new Error(`${provider} ${res.status}`);
  const json = (await res.json()) as { choices?: { message?: { content?: string | { text?: string }[] } }[] };
  const raw = json.choices?.[0]?.message?.content;
  const answer = typeof raw === "string" ? raw : raw?.map((part) => part.text ?? "").join("") ?? "";
  const result = clean(answer);
  if (!result) throw new Error(`${provider} returned an empty response`);
  return result;
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
  const answer = clean(json.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "");
  if (!answer) throw new Error("gemini returned an empty response");
  return answer;
}

/** Bounded offline helper: useful for common study intents, honest about its limits. */
function offlineStudyReply(messages: Msg[]) {
  const question = messages[messages.length - 1]?.content.trim() ?? "";
  const q = question.toLowerCase();
  if (/^(hi|hello|hey|բարև|բարեւ|ողջույն)[!.? ]*$/i.test(question)) {
    return "Բարև։ Ես Shtemarm-ի ուսումնական օգնականն եմ։ Կարող եմ օգնել անգլերենի, մաթեմատիկայի և քննություններին պատրաստվելու հարցերում։ Գրիր կոնկրետ հարցդ։";
  }
  if (/\b(since|for)\b/.test(q) && /tense|ժամանակ|grammar|քերական/.test(q)) {
    return "Անգլերենում since-ը սովորաբար ցույց է տալիս գործողության սկզբնակետը, իսկ for-ը՝ տևողությունը։ Օրինակ՝ I have lived here since 2020 և I have lived here for three years։ Սա ընդհանուր կանոն է․ ուղարկիր ամբողջ նախադասությունը՝ համատեքստով ստուգելու համար։";
  }
  if (/\b(a\s*\+\s*b|equation|հավասարում|solve|լուծել)\b/.test(q)) {
    return "Կօգնեմ քայլ առ քայլ, բայց այս պահին հասանելի է միայն սահմանափակ տեղային ռեժիմը։ Ուղարկիր հավասարումը պարզ տեսքով, և նախ կփորձենք նույնականացնել անհայտը, ապա կատարել հակադարձ գործողությունները։ Այս ռեժիմը չի կարող երաշխավորել բոլոր խնդիրների լուծումը։";
  }
  return "Այս պահին ԱԲ մոդելները հասանելի չեն, ուստի չեմ ուզում հորինել պատասխան։ Փորձիր հարցը ձևակերպել որպես կոնկրետ ուսումնական խնդիր կամ օգտվիր Shtemarm-ի շտեմարաններից և պատասխանների բանալիներից։ Տեղային ռեժիմը սահմանափակ է և չի փոխարինում լիարժեք ԱԲ ուսուցչին։";
}

export const chatReply = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data }) => {
    const groqKey = process.env["GROQ_API_KEY"];
    const geminiKey = process.env["GEMINI_API_KEY"];
    const openRouterKey = process.env["OPENROUTER_API_KEY"];

    // Try configured providers in sequence. One exhausted quota should not break the chat.
    const providers: (() => Promise<string>)[] = [];
    if (groqKey) providers.push(() => callOpenAICompatible(
      "https://api.groq.com/openai/v1/chat/completions", groqKey, "llama-3.3-70b-versatile", data.messages, "groq",
    ));
    if (geminiKey) providers.push(() => callGemini(geminiKey, data.messages));
    if (openRouterKey) providers.push(() => callOpenAICompatible(
      "https://openrouter.ai/api/v1/chat/completions", openRouterKey, "openrouter/free", data.messages, "openrouter",
    ));

    for (const provider of providers) {
      try {
        const text = await provider();
        return { text, error: false, offline: false };
      } catch {
        // Continue to the next configured provider on quota, network, or model errors.
      }
    }

    return {
      text: offlineStudyReply(data.messages),
      error: false,
      offline: true,
    };
  });
