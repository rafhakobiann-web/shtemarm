export type ExplanationInput = { instruction: string; passage: string; question: string; correct: string; chosen: string | null };

export async function explanationKey(input: ExplanationInput) {
  const bytes = new TextEncoder().encode(JSON.stringify(["rich-explanation-v3", input.instruction, input.passage, input.question, input.correct, input.chosen]));
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(hash)].map(b => b.toString(16).padStart(2, "0")).join("");
}

export function explanationError(status: number) {
  if (status === 429) return "Արհեստական բանականության սահմանաչափը ժամանակավորապես սպառվել է․ փորձեք ավելի ուշ։ Պահված բացատրությունները հասանելի են։";
  if (status === 400 || status === 401 || status === 403) return "ԱԲ բանալին կամ հասանելիությունը պետք է ստուգի կայքի պատասխանատուն։";
  if (status === 404) return "Բացատրությունների ընտրված ծառայությունը հասանելի չէ կամ բացատրությունը դեռևս ավելացված չէ բազայում։";
  return "Չհաջողվեց ստանալ բացատրությունը․ փորձեք ավելի ուշ։";
}

export async function readGeminiStream(body: ReadableStream<Uint8Array>) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let text = "";
  let blocked = false;
  
  const consume = (line: string) => {
    if (!line.startsWith("data:")) return;
    const payload = line.slice(5).trim();
    if (!payload || payload === "[DONE]") return;
    
    try {
      const event = JSON.parse(payload) as { 
        promptFeedback?: { blockReason?: string }; 
        candidates?: { finishReason?: string; content?: { parts?: { text?: string; thought?: boolean }[] } }[]; 
        error?: unknown 
      };
      
      if (event.error) throw new Error("Gemini stream failed");
      if (event.promptFeedback?.blockReason) blocked = true;
      
      for (const candidate of event.candidates ?? []) {
        if (["SAFETY", "RECITATION", "BLOCKLIST", "PROHIBITED_CONTENT"].includes(candidate.finishReason ?? "")) {
          blocked = true;
        }
        for (const part of candidate.content?.parts ?? []) {
          if (!part.thought && part.text) text += part.text;
        }
      }
    } catch {}
  };

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      lines.forEach(consume);
    }
    buffer += decoder.decode();
    if (buffer.trim()) consume(buffer);
  } finally { 
    reader.releaseLock(); 
  }
  
  return { text: text.trim(), blocked };
}

export async function readGroqStream(body: ReadableStream<Uint8Array>) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let text = "";
  
  const consume = (line: string) => {
    if (!line.startsWith("data:")) return;
    const payload = line.slice(5).trim();
    if (!payload || payload === "[DONE]") return;
    
    try {
      const event = JSON.parse(payload) as { choices?: { delta?: { content?: string } }[] };
      for (const choice of event.choices ?? []) {
        if (choice.delta?.content) text += choice.delta.content;
      }
    } catch {}
  };

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      lines.forEach(consume);
    }
    buffer += decoder.decode();
    if (buffer.trim()) consume(buffer);
  } finally {
    reader.releaseLock();
  }

  return { text: text.trim(), blocked: false };
}
/**
 * No-key fallback: deterministic and always available. This is intentionally
 * transparent about its limits instead of inventing grammar rules or reasoning.
 */
export function offlineEnglishExplanation(input: ExplanationInput) {
  const lines = [
    `Պաշտոնական ճիշտ պատասխանը՝ ${input.correct}։`,
  ];
  if (input.chosen) {
    lines.push(input.chosen === input.correct
      ? "Քո ընտրությունը համընկնում է պատասխանների բանալու հետ։"
      : `Քո ընտրած պատասխանը՝ ${input.chosen}, չի համընկնում պաշտոնական պատասխանի հետ։`);
  }
  const text = `${input.question} ${input.passage}`.toLowerCase();
  const rules: Array<[RegExp, string]> = [
    [/\b(if|unless)\b.*\b(would have|could have|might have)\b|\bwould have\b.*\bif\b/, "Ստուգիր երրորդ պայմանական նախադասության կառուցվածքը՝ If + Past Perfect, would have + past participle։"],
    [/\b(since|for)\b/, "Since-ը սովորաբար նշում է սկզբնակետը, իսկ for-ը՝ ժամանակահատվածը։ Ընտրիր ժամանակաձևը՝ ըստ ամբողջ նախադասության իմաստի։"],
    [/\b(than|the most|more)\b/, "Համեմատության դեպքում ուշադրություն դարձրու comparative/superlative ձևին և than/the most նշաններին։"],
    [/\b(by the time|already|yet|just|ever|never)\b/, "Ժամանակային հուշող բառերը կարող են օգնել ընտրել ճիշտ ժամանակաձևը, բայց ստուգիր նաև նախադասության ամբողջ համատեքստը։"],
    [/\b(passive|was built|is made|were written)\b/, "Կրավորական սեռում օգտագործվում է համապատասխան ժամանակաձևով be + past participle (V3) կառուցվածքը։"],
    [/\b(a|an|the)\b/, "Հոդ ընտրելիս ստուգիր՝ խոսքը որևէ բանի մասին առաջին անգամ է, ընդհանուր իմաստով, թե կոնկրետ ու արդեն հայտնի առարկայի մասին։"],
  ];
  const rule = rules.find(([pattern]) => pattern.test(text));
  if (rule) lines.push(rule[1]);
  lines.push("Սա տեղային՝ առանց ԱԲ ծառայության աշխատող օգնություն է․ այն չի կարող բոլոր հարցերի համար վստահորեն վերականգնել մանրամասն հիմնավորումը։ Ամբողջական բացատրության համար անհրաժեշտ է նախապես պահպանված բացատրություն կամ միացված ԱԲ ծառայություն։");
  return lines.join("\n\n");
}
