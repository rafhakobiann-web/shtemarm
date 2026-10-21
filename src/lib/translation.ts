export type TranslationInput = { text: string; kind: "word" | "passage"; context: string };

export function englishTokens(text: string) {
  return text.split(/([A-Za-z]+(?:['’-][A-Za-z]+)*)/g);
}

export async function translationKey(input: TranslationInput) {
  const bytes = new TextEncoder().encode(JSON.stringify(["translation-hy-v1", input.kind, input.text.trim(), input.context.trim()]));
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return `translation:${[...new Uint8Array(hash)].map(b => b.toString(16).padStart(2, "0")).join("")}`;
}