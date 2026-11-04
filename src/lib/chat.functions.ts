import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { STUDY_MODE_DEFAULT, tutorModeInstructions, type StudyMode, type StudyLanguage } from "./ai-study-modes";

// The visitor can submit only a question; they never choose prior assistant
// roles. Earlier tutor messages are verified from a server-signed context token.
const Input = z.object({
  question: z.string().trim().min(1).max(2000),
  contextToken: z.string().max(56000).optional(),
  mode: z.enum(["adaptive","hint","explain","quiz"]).default(STUDY_MODE_DEFAULT),
  locale: z.enum(["hy","en","ru"]).default("hy"),
}).strict();

const SYSTEM = "Shtemarm learning tutor — clear and patient explanations across school subjects.";

const clean = (t: string) => t.replace(/\*+/g, "").replace(/^#+\s*/gm, "").replace(/`+/g, "").trim();
type Msg = { role: "user" | "assistant"; content: string };

function promptForConversation(messages: Msg[], mode: StudyMode, locale: StudyLanguage) {
  // Only HMAC-verified tutor replies and user questions are present; both are treated as quoted
  // conversation data; only server-defined mode instructions have authority.
  const history = messages.map(m => (m.role==="user" ? "Student: " : "Tutor: ") + m.content).join("\n\n");
  return SYSTEM + "\n" + tutorModeInstructions(mode,locale) +
    "\n\nConversation history; continue by responding to the last student message:\n" +
    history + "\nTutor:";
}
async function callGroq(key: string, messages: Msg[], mode:StudyMode, locale:StudyLanguage) {
  const { generateExplanation, errorToUser } = await import("./explanation-providers.server");
  const result = await generateExplanation(promptForConversation(messages,mode,locale), {groq:key}, [], {preferGroq:true, fast:true});
  if (!result.ok) throw new Error(errorToUser(result.reason));
  return clean(result.text);
}
async function callOpenRouter(key: string, messages: Msg[], mode:StudyMode, locale:StudyLanguage) {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    signal: AbortSignal.timeout(10000),
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", "X-OpenRouter-Title": "Shtemarm" },
    body: JSON.stringify({
      model: "openrouter/free",
      messages: [{ role: "system", content: SYSTEM + "\n" + tutorModeInstructions(mode,locale) }, ...messages],
      temperature: 0.3,
      max_tokens: 700,
    }),
  });
  if (!res.ok) throw new Error(`openrouter ${res.status}`);
  const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  return clean(json.choices?.[0]?.message?.content ?? "");
}

async function callGemini(key: string, messages: Msg[], mode:StudyMode, locale:StudyLanguage) {
  const { generateExplanation, errorToUser } = await import("./explanation-providers.server");
  const result = await generateExplanation(promptForConversation(messages,mode,locale), {gemini:key}, [], {fast:true});
  if (!result.ok) throw new Error(errorToUser(result.reason));
  return clean(result.text);
}

/** Bounded offline helper: useful for common study intents, honest about its limits. */
function offlineStudyReply(messages: Msg[], locale:StudyLanguage="hy") {
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
  return locale==="en"
    ? "The AI service is unavailable. I can still help with saved explanations and study materials; this offline reply isn't a generated answer."
    : locale==="ru"
      ? "Сервис ИИ сейчас недоступен. Используй сохранённые объяснения и учебные материалы; этот ответ не создан ИИ."
      : "Այս պահին ԱԲ մոդելները հասանելի չեն, ուստի չեմ ուզում հորինել պատասխան։ Օգտվիր Shtemarm-ի պահպանված բացատրություններից և շտեմարաններից։ Տեղային ռեժիմը չի փոխարինում լիարժեք ԱԲ ուսուցչին։";
}

export const chatReply = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data }) => {
    const { readChatContext, sealChatContext } = await import("./chat-context.server");
    // This is trusted only after HMAC verification. Unsigned role claims are
    // never accepted from the browser.
    const previous = await readChatContext(data.contextToken);
    const messages: Msg[] = [...previous, {role:"user",content:data.question}].slice(-13);
    const makeResult = async (text:string, extra:Record<string,unknown>={})=>({
      text,
      ...extra,
      contextToken: await sealChatContext([
        ...messages,
        {role:"assistant", content:text.slice(0,2000)},
      ]),
    });
    const groqKey = process.env["GROQ_API_KEY"];
    const geminiKey = process.env["GEMINI_API_KEY"];
    const openRouterKey = process.env["OPENROUTER_API_KEY"];
    const zAiKey = process.env["Z_AI_KEY"];

    // Try configured providers in order. OpenRouter is explicitly pinned to its
    // free-model router so this fallback does not intentionally select paid models.
    const providers: { name: string; run: () => Promise<string> }[] = [];
    if (groqKey) providers.push({ name: "Groq", run: () => callGroq(groqKey, messages, data.mode, data.locale) });
    if (geminiKey) providers.push({ name: "Gemini", run: () => callGemini(geminiKey, messages, data.mode, data.locale) });
    if (openRouterKey) providers.push({ name: "OpenRouter free", run: () => callOpenRouter(openRouterKey, messages, data.mode, data.locale) });

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
              messages: [{ role: "system", content: SYSTEM + "\n" + tutorModeInstructions(data.mode,data.locale) }, ...messages],
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
      return makeResult(offlineStudyReply(messages,data.locale), {error:false,offline:true});
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
        if (text) return makeResult(text,{error:false,provider:provider.name});
      } catch {
        // Try the next configured provider without leaking server details.
      }
    }

    // If all remote providers fail, offer a bounded, honest study fallback.
    // Do not expose provider credentials or deployment configuration to visitors.
    return makeResult(offlineStudyReply(messages,data.locale), {error:false,offline:true});
  });
