import type { Book, MCQuestion, Section, Unit } from "./books";
import { fetchBookResponse } from "./fetch-book-response";

type OfficialMc = {
  n: string;
  pdfPage?: number;
  stem?: string;
  options?: Record<string, string>;
  answer: string;
  raw?: string;
  reviewRequired?: boolean;
};
type OfficialShort = { n: string; pdfPage?: number; stem: string; answer: string };
export type ArmenianOriginalSection = {
  volume: number;
  section: number;
  title: string;
  original: boolean;
  answerKeyPage: number;
  mc: OfficialMc[];
  short: OfficialShort[];
  reviewRequiredMC: string[];
};

const sectionNames = [
  "Հնչյունաբանություն",
  "Բառագիտություն",
  "Ձևաբանություն",
  "Շարահյուսություն",
  "Կապակցված խոսք",
  "Ընդհանուր գիտելիքներ հայոց լեզվի մասին",
  "Ոճագիտություն",
  "Գրականություն",
] as const;

/** Strip only recurring PDF watermarks, not source punctuation or Armenian spelling. */
export function cleanPdfArtifacts(value: string): string {
  return value
    .replace(/(^|\n)[ \t]*(?:www\.atc\.am|tc|\.a|w|m)[ \t]*(?=\n|$)/g, "$1")
    .replace(/[ \t]+(?:tc|\.a)(?=\s*$)/gm, "")
    .replace(/[ \t]+(?=\n)/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function validateQuestionNumbers(questions: Array<{ n: string }>, section: number, kind: string): void {
  questions.forEach((q, i) => {
    if (q.n !== String(i + 1)) throw new Error(
      `Հայոց լեզվի I մասի ${section}-րդ բաժնի ${kind} առաջադրանքների համարակալման սխալ՝ ${q.n}`,
    );
  });
}

function isPlayableMc(q: OfficialMc): q is OfficialMc & { stem: string; options: Record<string,string> } {
  if (q.reviewRequired || typeof q.stem !== "string" || !q.stem.trim() || !q.options) return false;
  const keys = Object.keys(q.options);
  return keys.length === 4 && ["1", "2", "3", "4"].every(k =>
    typeof q.options?.[k] === "string" && Boolean(q.options[k].trim()),
  ) && ["1", "2", "3", "4"].includes(q.answer);
}

/**
 * Fail closed on malformed imports; questions needing visual inspection stay
 * in the source JSON but do not become incorrectly answerable exercises.
 */
export function buildArmenianOriginalBook(sources: ArmenianOriginalSection[]): Book {
  if (sources.length !== 8) throw new Error("Հայոց լեզվի I մասի 8 բաժիններից մեկը բացակայում է։");
  const sections: Section[] = sources.map((source, index) => {
    const section = index + 1;
    if (source.volume !== 1 || source.section !== section || !source.original ||
        source.title !== sectionNames[index] ||
        !Array.isArray(source.mc) || !Array.isArray(source.short) ||
        !Array.isArray(source.reviewRequiredMC)) {
      throw new Error(`Հայոց լեզվի I մասի ${section}-րդ բնօրինակ բաժինը սխալ է։`);
    }
    validateQuestionNumbers(source.mc, section, "ընտրովի");
    validateQuestionNumbers(source.short, section, "կարճ պատասխանով");
    const mc: MCQuestion[] = source.mc.filter(isPlayableMc).map(q => ({
      n: q.n,
      stem: cleanPdfArtifacts(q.stem),
      options: Object.fromEntries(Object.entries(q.options).map(([k, v]) => [k, cleanPdfArtifacts(v)])),
      answer: q.answer,
    }));
    const skipped = source.mc.length - mc.length;
    const short: Extract<Unit, {kind: "num"}>["questions"] = source.short.map(q => ({
      n: q.n,
      stem: cleanPdfArtifacts(q.stem),
      answer: q.answer.trim(),
    }));
    if (short.some(q => !q.stem || !q.answer)) throw new Error(
      `Հայոց լեզվի I մասի ${section}-րդ բաժնում կարճ պատասխանի տվյալներ են բացակայում։`,
    );
    const units: Unit[] = [];
    // 20–25 questions per unit keeps the existing mobile study navigation fast.
    for (let i = 0; i < mc.length; i += 20) {
      units.push({
        id: `ar1-s${section}-mc-${Math.floor(i / 20) + 1}`,
        label: `Ընտրովի · ${i + 1}–${Math.min(i + 20, mc.length)}`,
        kind: "mc",
        passage: "",
        questions: mc.slice(i, i + 20),
      });
    }
    for (let i = 0; i < short.length; i += 20) {
      units.push({
        id: `ar1-s${section}-short-${Math.floor(i / 20) + 1}`,
        label: `Կարճ պատասխանով · ${i + 1}–${Math.min(i + 20, short.length)}`,
        kind: "num",
        passage: "",
        questions: short.slice(i, i + 20),
      });
    }
    return {
      n: section,
      title: source.title,
      instr_en: source.title,
      instr_hy: `Բնօրինակ շտեմարան · ընտրովի՝ ${mc.length}, կարճ պատասխանով՝ ${short.length}։ ${skipped > 0 ? `${skipped} ընտրովի առաջադրանք պահանջում է PDF-ի տեսողական ստուգում և դեռ հասանելի չէ։` : ""} Կարճ պատասխաններում համարները գրիր բնօրինակի հերթականությամբ։`,
      units,
    };
  });
  return { id: 41, sections };
}

export async function loadArmenianOriginalBook(): Promise<Book> {
  const sources = await Promise.all(sectionNames.map(async (_, i) =>
    fetchBookResponse(`/data/armenian-official-1-section${i + 1}.json`, async response => {
      if (!response.ok) throw new Error(`Հայոց լեզվի բնօրինակ բաժինը չի բեռնվել՝ HTTP ${response.status}`);
      const mime = response.headers.get("content-type") ?? "";
      if (mime && !/json|text\/plain|octet-stream/i.test(mime)) {
        throw new Error("Բնօրինակի փոխարեն սերվերը վերադարձրել է ոչ JSON բովանդակություն։");
      }
      return await response.json() as ArmenianOriginalSection;
    })
  ));
  return buildArmenianOriginalBook(sources);
}
