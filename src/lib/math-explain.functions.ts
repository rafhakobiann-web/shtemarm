import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { reliableMathFallback } from "./reliableMathFallback";

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
  locale: z.enum(["hy","en","ru"]).optional(),
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
  return {
    text: reliableMathFallback(data,data.locale??"hy"),
    cached:false,error:false,offline:true
  };
}

export const explainMathAnswer = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data }) => {
    const { getSavedExplanation, saveExplanation } = await import("./explanation-cache.server");
    const { generateExplanation } = await import("./explanation-providers.server");
    if (!data.pages.length && !data.question.trim())
      return { text: "Առաջադրանքի պայմանը բացակայում է․ խնդրում ենք փորձել մեկ այլ հարց։", cached: false, error: true, offline: true };

    const cacheKey = await sha256Hex([
      "math-v4", data.locale??"hy", data.item, data.kind, data.correct, data.chosen ?? "",
      data.question, ...data.options, ...data.pages,
    ]);
    const cached = await getSavedExplanation(cacheKey);
    if (cached) return { text: cached, cached: true, error: false, offline: false };

    const geminiKey = process.env["GEMINI_API_KEY"];
    const groqKey = process.env["GROQ_API_KEY"];
    const usingImages = data.pages.length > 0 && !!geminiKey;
    const textAvailable = !!data.question.trim();
    // A text-only Groq model must not be asked to hallucinate from unseen scans.
    const ai = usingImages || textAvailable
      ? await generateExplanation(
        buildPrompt({ ...data, pages: usingImages ? data.pages : [] }),
        { gemini: geminiKey, groq: groqKey },
        usingImages ? data.pages : [],
      )
      : { ok: false as const, reason: "requires_vision" as const };

    if (ai.ok) {
      await saveExplanation(cacheKey, ai.text);
      return { text: ai.text, cached: false, error: false, offline: false };
    }
    const offline = offlineMathExplanation(data);
    return {
      ...offline,
      error: false,
      text: offline.text,
    };
  });
