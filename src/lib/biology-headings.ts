import type { Lang } from "./lang";

const BIOLOGY_PARTS = {
  31: { number: 1, hy: "Մաս I", en: "Part I", ru: "Часть I" },
  32: { number: 2, hy: "Մաս II", en: "Part II", ru: "Часть II" },
  33: { number: 3, hy: "Մաս III", en: "Part III", ru: "Часть III" },
  34: { number: 4, hy: "Մաս IV", en: "Part IV", ru: "Часть IV" },
} as const;

/** Human-readable book headings; IDs are never student-facing book titles. */
export function biologyBookTitle(bookId: number, lang: Lang = "hy"): string | null {
  const part = BIOLOGY_PARTS[bookId as keyof typeof BIOLOGY_PARTS];
  if (!part) return null;
  const subject = lang === "en" ? "Biology" : lang === "ru" ? "Биология" : "Կենսաբանություն";
  return `${subject} · ${part[lang]}`;
}

/** A short status line only; final proofreading remains explicitly pending. */
export function biologyBookSubtitle(bookId: number, lang: Lang = "hy"): string | null {
  if (bookId !== 33 && bookId !== 34) return null;
  const total = bookId === 33 ? 1837 : 1688;
  const number = new Intl.NumberFormat(lang === "hy" ? "hy-AM" : lang === "ru" ? "ru-RU" : "en-US").format(total);
  if (lang === "en") return `${number} indexed exercises · Source proofreading in progress`;
  if (lang === "ru") return `${number} заданий · Проверка по оригиналу продолжается`;
  return `${number} առաջադրանք · բնօրինակի հետ ստուգումը շարունակվում է`;
}

export function biologySectionPageTitle(bookId: number, sectionNumber: number): string | null {
  const book = biologyBookTitle(bookId);
  if (!book || !Number.isSafeInteger(sectionNumber) || sectionNumber < 1) return null;
  return `${book} · Բաժին ${sectionNumber} | Shtemarm`;
}
