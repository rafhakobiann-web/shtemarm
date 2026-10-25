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


/**
 * A no-key study fallback. It deliberately gives bounded, honest help instead of
 * pretending to be a full language model. This runs locally on the server.
 */
function localStudyReply(messages: Msg[]): string {
  const latest = messages.filter((m) => m.role === "user").at(-1)?.content.trim() ?? "";
  const q = latest.toLocaleLowerCase("hy-AM");
  if (!latest) return "Գրիր ուսումնական հարցը, և կփորձեմ օգնել հասանելի տեղային կանոններով։";
  if (/^(բարև|բարեւ|ողջույն|hello|hi)\b/i.test(q)) {
    return "Բարև։ Ես Shtemarm-ի ուսումնական օգնականն եմ։ Կարող եմ օգնել անգլերենի կանոնների, մաթեմատիկայի քայլերի և քննությանը պատրաստվելու կազմակերպման հարցում։ Գրիր կոնկրետ հարցը։";
  }
  if (/\b(present simple|ներկա անորոշ|present simple)\b/i.test(q)) {
    return "Present Simple-ը գործածվում է սովորությունների, կրկնվող գործողությունների և ընդհանուր փաստերի համար։ I/you/we/they-ի հետ օգտագործվում է բայի հիմնական ձևը, իսկ he/she/it-ի հետ՝ սովորաբար -s կամ -es։ Օրինակ՝ “She works every day.” Հարցական և ժխտական ձևերում սովորաբար օգտագործվում է do/does՝ “Does she work?” և “She doesn’t work.”";
  }
  if (/\b(present continuous|ներկա շարունակական)\b/i.test(q)) {
    return "Present Continuous-ը նկարագրում է խոսելու պահին ընթացող կամ ժամանակավոր գործողություն։ Կառուցվածքը՝ am/is/are + բայի -ing ձևը։ Օրինակ՝ “They are studying now.” Ժխտականում ավելացվում է not, իսկ հարցականում am/is/are-ը դրվում է ենթակայից առաջ։";
  }
  if (/\b(past simple|անցյալ անորոշ)\b/i.test(q)) {
    return "Past Simple-ը գործածվում է անցյալում ավարտված գործողությունների համար։ Կանոնավոր բայերը սովորաբար ստանում են -ed, իսկ անկանոն բայերի ձևերը պետք է սովորել առանձին։ Հարցականում և ժխտականում օգտագործվում է did, որից հետո բայը մնում է հիմնական ձևով՝ “Did you go?” / “I didn’t go.”";
  }
  if (/\b(conditionals?|պայմանական նախադաս)\b/i.test(q)) {
    return "Անգլերենի պայմանական նախադասությունների հիմնական ձևերը՝ Zero Conditional՝ if + Present Simple, Present Simple (ընդհանուր ճշմարտություն), First Conditional՝ if + Present Simple, will + բայի հիմնական ձև (իրատեսական ապագա), Second Conditional՝ if + Past Simple, would + բայի հիմնական ձև (երևակայական կամ քիչ հավանական իրավիճակ), Third Conditional՝ if + Past Perfect, would have + V3 (անցյալի չկայացած պայման)։ Սովորաբար if-մասում will չի օգտագործվում։";
  }
  if (/\b(articles?|a\/an|the|հոդեր|հոդը)\b/i.test(q)) {
    return "Անգլերենում a/an-ը գործածվում է եզակի հաշվելի գոյականի հետ, երբ խոսքը որևէ մեկի կամ առաջին անգամ հիշատակվող առարկայի մասին է։ An-ը դրվում է ձայնավոր հնչյունով սկսվող բառից առաջ։ The-ը գործածվում է, երբ խոսողն ու լսողը գիտեն՝ կոնկրետ որ անձի կամ առարկայի մասին է խոսքը։ Ընդհանուր իմաստով հոգնակի հաշվելի և անհաշվելի գոյականների առաջ հոդ հաճախ չի դրվում։";
  }
  if (/\b(factor|factorization|քառակուսի հավասարում|հավասարում|equation)\b/i.test(q)) {
    return "Հավասարում լուծելիս նախ պարզեցրու երկու կողմերը, ապա անհայտ պարունակող անդամները տեղափոխիր մի կողմ, իսկ հաստատունները՝ մյուս։ Կատարիր նույն գործողությունը հավասարման երկու կողմերում և վերջում ստուգիր ստացված արժեքը սկզբնական հավասարման մեջ։ Քառակուսի հավասարման համար կարող ես կիրառել արտադրիչների վերլուծությունը կամ դիսկրիմինանտի մեթոդը։ Եթե ուղարկես կոնկրետ հավասարումը, կփորձեմ ցույց տալ համապատասխան քայլերը։";
  }
  if (/\b(study plan|պլան|ինչպես սովորել|քննության պատրաստվել|պատրաստվել քննությանը)\b/i.test(q)) {
    return "Սկսիր կարճ ախտորոշիչ թեստից, ապա բաժանիր սխալները ըստ թեմաների։ Ամեն օր հերթափոխիր երեք աշխատանք՝ կանոնի կրկնություն, հարցերի լուծում և սխալների վերլուծություն։ Շաբաթվա վերջում կրկնիր միայն այն թեմաները, որոնցում դեռ սխալվում ես, և ժամանակաչափով փորձնական թեստ կատարիր։";
  }
  return "Այս պահին արտաքին ԱԲ ծառայությունները հասանելի չեն, ուստի կարող եմ պատասխանել միայն սահմանափակ տեղային ուսումնական կանոններով։ Չեմ ուզում հորինել պատասխանը։ Ուղարկիր կոնկրետ հարցը կամ առաջադրանքի տեքստը՝ նշելով առարկան ու թեման, և կփորձեմ օգնել հասանելի կանոններով։";
}

export const chatReply = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data }) => {
    const groqKey = process.env["GROQ_API_KEY"];
    const geminiKey = process.env["GEMINI_API_KEY"];
    if (!groqKey && !geminiKey) {
      return { text: localStudyReply(data.messages), error: false, offline: true };
    }
    try {
      let text = "";
      if (groqKey) {
        try {
          text = await callGroq(groqKey, data.messages);
        } catch {
          if (geminiKey) {
            try {
              text = await callGemini(geminiKey, data.messages);
            } catch {
              text = "";
            }
          }
        }
      } else if (geminiKey) {
        try {
          text = await callGemini(geminiKey, data.messages);
        } catch {
          text = "";
        }
      }
      if (text) return { text, error: false };
      return { text: localStudyReply(data.messages), error: false, offline: true };
    } catch {
      return { text: localStudyReply(data.messages), error: false, offline: true };
    }
  });
