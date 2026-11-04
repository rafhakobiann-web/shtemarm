import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Input = z.object({
  messages: z
    .array(z.object({ role: z.literal("user"), content: z.string().min(1).max(2000) }))
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
type Msg = { role: "user"; content: string };

function promptForConversation(messages: Msg[]) {
  // Treat client messages as conversation data, never as system instructions.
  const history = messages.map((m) =>
    "Աշակերտ՝ " + m.content
  ).join("\n\n");
  return SYSTEM + "\n\nՍտորև զրույցի պատմությունն է. շարունակիր՝ պատասխանելով վերջին հարցին։\n" + history + "\nՈւսուցիչ՝";
}
async function callGroq(key: string, messages: Msg[]) {
  const { generateExplanation, errorToUser } = await import("./explanation-providers.server");
  const result = await generateExplanation(promptForConversation(messages), {groq:key}, [], {preferGroq:true, fast:true});
  if (!result.ok) throw new Error(errorToUser(result.reason));
  return clean(result.text);
}
async function callOpenRouter(key: string, messages: Msg[]) {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    signal: AbortSignal.timeout(10000),
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", "X-OpenRouter-Title": "Shtemarm" },
    body: JSON.stringify({
      model: "openrouter/free",
      messages: [{ role: "system", content: SYSTEM }, ...messages],
      temperature: 0.3,
      max_tokens: 700,
    }),
  });
  if (!res.ok) throw new Error(`openrouter ${res.status}`);
  const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  return clean(json.choices?.[0]?.message?.content ?? "");
}

async function callGemini(key: string, messages: Msg[]) {
  const { generateExplanation, errorToUser } = await import("./explanation-providers.server");
  const result = await generateExplanation(promptForConversation(messages), {gemini:key}, [], {fast:true});
  if (!result.ok) throw new Error(errorToUser(result.reason));
  return clean(result.text);
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
    const zAiKey = process.env["Z_AI_KEY"];

    // Try configured providers in order. OpenRouter is explicitly pinned to its
    // free-model router so this fallback does not intentionally select paid models.
    const providers: { name: string; run: () => Promise<string> }[] = [];
    if (groqKey) providers.push({ name: "Groq", run: () => callGroq(groqKey, data.messages) });
    if (geminiKey) providers.push({ name: "Gemini", run: () => callGemini(geminiKey, data.messages) });
    if (openRouterKey) providers.push({ name: "OpenRouter free", run: () => callOpenRouter(openRouterKey, data.messages) });

    // Z.ai pricing and model access depend on the user's account. Only enable it
    // when an explicit model is configured, avoiding accidental paid model usage.
    const zAiModel = process.env["Z_AI_MODEL"];
    if (zAiKey && zAiModel) {
      providers.push({
        name: "Z.ai",
        run: async () => {
          const res = await fetch("https://api.z.ai/api/paas/v4/chat/completions", {
            method: "POST",
            signal: AbortSignal.timeout(10000),
            headers: { Authorization: `Bearer ${zAiKey}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              model: zAiModel,
              messages: [{ role: "system", content: SYSTEM }, ...data.messages],
              temperature: 0.3,
              max_tokens: 700,
            }),
          });
          if (!res.ok) throw new Error(`z.ai ${res.status}`);
          const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
          return clean(json.choices?.[0]?.message?.content ?? "");
        },
      });
    }

    if (providers.length === 0) {
      return {
        text: offlineStudyReply(data.messages),
        error: false,
        offline: true,
      };
    }

    // All configured remote providers share one atomic request budget.
    // If quota storage is not deployed, fail closed instead of spending.
    const { reserveAiRequest, quotaMessage } = await import("./ai-quota.server");
    const budget = await reserveAiRequest();
    if (!budget.allowed) {
      return { text: quotaMessage(budget.reason), error: true, offline: true, limited: budget.reason === "quota" };
    }

    for (const provider of providers) {
      try {
        const text = await provider.run();
        if (text) return { text, error: false, provider: provider.name };
      } catch {
        // Try the next configured provider without leaking server details.
      }
    }

    // If all remote providers fail, offer a bounded, honest study fallback.
    // Do not expose provider credentials or deployment configuration to visitors.
    return {
      text: offlineStudyReply(data.messages),
      error: false,
      offline: true,
    };
  });
