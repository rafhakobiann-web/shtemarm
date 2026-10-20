export type ExplanationInput = { instruction: string; passage: string; question: string; correct: string; chosen: string | null };

export async function explanationKey(input: ExplanationInput) {
  const bytes = new TextEncoder().encode(JSON.stringify(["gemini-v1", input.instruction, input.passage, input.question, input.correct, input.chosen]));
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