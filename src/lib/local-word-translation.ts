import { BOOK_VOCABULARY_HY } from "./book-vocabulary-hy";
import { getDictionaryTranslation as lookup } from "./word-dictionary";
import type { TranslationLanguage } from "./translation";
export function getDictionaryTranslation(word: string, language: TranslationLanguage): string | null {
  const key = word.trim().toLocaleLowerCase("en").replaceAll("’", "'");
  return (language === "hy" ? BOOK_VOCABULARY_HY[key] : null) ?? lookup(key, language);
}
