export const TRANSLATION_LANGUAGES = [
  { code: "hy", label: "Հայերեն" },
  { code: "ru", label: "Русский" },
  { code: "de", label: "Deutsch" },
  { code: "fr", label: "Français" },
  { code: "es", label: "Español" },
  { code: "it", label: "Italiano" },
  { code: "pt", label: "Português" },
  { code: "en", label: "English (definition)" },
] as const;

export type TranslationLanguage = (typeof TRANSLATION_LANGUAGES)[number]["code"];
export type TranslationInput = { text: string; kind: "word" | "passage"; context: string; language?: TranslationLanguage };

export function englishTokens(text: string) {
  return text.split(/([A-Za-z]+(?:['’-][A-Za-z]+)*)/g);
}

export async function translationKey(input: TranslationInput) {
  const bytes = new TextEncoder().encode(JSON.stringify(["translation-v2", input.language ?? "hy", input.kind, input.text.trim(), input.context.trim()]));
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return `translation:${[...new Uint8Array(hash)].map(b => b.toString(16).padStart(2, "0")).join("")}`;
}
