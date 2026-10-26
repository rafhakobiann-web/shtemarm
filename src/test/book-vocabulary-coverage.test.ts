import { describe, expect, it } from "vitest";
import fs from "node:fs";
import { englishTokens } from "@/lib/translation";
import { getDictionaryTranslation } from "@/lib/local-word-translation";
import { BOOK_VOCABULARY_COMPLETION_HY } from "@/lib/book-vocabulary-completion-hy";

function wordsIn(value: unknown, words: Set<string>) {
  if (typeof value === "string") {
    for (const token of englishTokens(value)) {
      if (/^[A-Za-z]+(?:['’-][A-Za-z]+)*$/.test(token)) words.add(token.toLowerCase().replaceAll("’", "'"));
    }
  } else if (Array.isArray(value)) value.forEach(v => wordsIn(v, words));
  else if (value && typeof value === "object") for (const [key, v] of Object.entries(value)) {
    if (!["id", "kind", "answer", "instr_hy"].includes(key)) wordsIn(v, words);
  }
}

describe("Armenian lookup for all three English books", () => {
  it("has a translation or source-form explanation for every clickable English token", () => {
    const words = new Set<string>();
    for (const n of [1, 2, 3]) wordsIn(JSON.parse(fs.readFileSync(`public/data/book${n}.json`, "utf8")), words);
    const missing = [...words].filter(word => !getDictionaryTranslation(word, "hy"));
    expect(words.size).toBeGreaterThan(10000);
    expect(missing).toEqual([]);
    for (const [word, meaning] of Object.entries(BOOK_VOCABULARY_COMPLETION_HY)) {
      expect(words.has(word), `Entry absent from books: ${word}`).toBe(true);
      expect(meaning).toMatch(/[Ա-Ֆա-ֆև]/);
    }
  });
  it("preserves original tokens and explains malformed forms without changing questions", () => {
    expect(getDictionaryTranslation("theinformation", "hy")).toContain("the information");
    expect(getDictionaryTranslation("perceiveing", "hy")).toContain("ոչ ստանդարտ");
    expect(getDictionaryTranslation("MYSELVES", "hy")).toContain("myself");
    expect(englishTokens("theinformation perceiveing").join("")).toBe("theinformation perceiveing");
  });
  it("supports case and apostrophes, keeps other languages and unknown terms intact", () => {
    expect(getDictionaryTranslation(" Jim’s ", "hy")).toContain("Ջիմ");
    expect(getDictionaryTranslation("theme", "hy")).toBe("թեմատիկ");
    expect(getDictionaryTranslation("book", "ru")).toBe("книга");
    expect(getDictionaryTranslation("definitelyunknownwordxyz", "hy")).toBeNull();
  });
});
