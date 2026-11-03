import { useEffect, useState } from "react";
import { BookOpenCheck, AlertCircle } from "lucide-react";
import { useLang } from "@/lib/lang";

type Part = { number: number; title: string; pdfPage: number; endPdfPage: number;
  verifiedTitle: boolean; verifiedPage: boolean };
type Appendix = { title: string; pdfPage: number; endPdfPage: number;
  verifiedTitle: boolean; verifiedPage: boolean };
type SourceVolume = { volume: number; pdf: string; totalPages: number; year: number;
  sourceSha256: string; sections: Part[]; appendices: Appendix[]; sourceNote?: string };
type SourceIndex = { schemaVersion: number; volumes: SourceVolume[] };

const localized = {
  hy: {
    title: "Բնօրինակ շտեմարանի բաժինները",
    intro: "Վերնագրերն ու էջերը համեմատված են ԳԹԿ-ի բնօրինակ գրքի բովանդակության հետ։ Սա գրքի կառուցվածքն է, ոչ ամբողջությամբ թվայնացված հարցաշար։",
    practice: "Այս էջի գործնական հարցերը Shtemarm-ի առանձին հեղինակային վարժանքներն են, ոչ բնօրինակի ամբողջական արտագրությունը։",
    page: "Էջ",
    appendices: "Հավելվածներ և պատասխանների բանալի",
    loading: "Բնօրինակ գրքի բովանդակությունը բեռնվում է…",
    unavailable: "Բնօրինակի բովանդակության տվյալները չեն բեռնվել։ Հեղինակային վարժանքները դեռ կարող ես բացել ներքևում։",
    noSource: "Բաժինների տվյալները դեռ ստուգման կարիք ունեն։",
  },
  en: {
    title: "Original question book contents",
    intro: "Section titles and pages are checked against the original exam board PDF. This is the book's outline, not a fully digitized question bank.",
    practice: "The exercises available on this page are separate Shtemarm-authored practice questions, not a complete transcription of the original book.",
    page: "Page",
    appendices: "Appendices and answer key",
    loading: "Loading original book contents…",
    unavailable: "Could not load the original contents. Authored practice exercises remain available below.",
    noSource: "Source section data still needs verification.",
  },
  ru: {
    title: "Содержание оригинального сборника",
    intro: "Названия разделов и страницы сверены с оригинальным PDF экзаменационного центра. Это структура книги, а не полностью оцифрованный сборник заданий.",
    practice: "Доступные на этой странице упражнения созданы Shtemarm отдельно и не являются полной расшифровкой оригинального сборника.",
    page: "Страница",
    appendices: "Приложения и ответы",
    loading: "Загрузка содержания оригинального сборника…",
    unavailable: "Не удалось загрузить содержание оригинала. Учебные упражнения доступны ниже.",
    noSource: "Информация о разделах ещё требует проверки.",
  },
} as const;

function isTrustedVolume(value: unknown, volume: number): value is SourceVolume {
  if (!value || typeof value !== "object") return false;
  const v = value as Partial<SourceVolume>;
  if (v.volume !== volume || v.totalPages !== 256 ||
      !Array.isArray(v.sections) || v.sections.length !== 8 ||
      !Array.isArray(v.appendices) || v.appendices.length !== 2 ||
      !v.sections.every((s,i) =>
        s.number === i+1 && s.verifiedTitle === true && s.verifiedPage === true &&
        Number.isInteger(s.pdfPage) && Number.isInteger(s.endPdfPage) &&
        s.pdfPage >= 5 && s.endPdfPage >= s.pdfPage && s.endPdfPage <= 256) ||
      !v.appendices.every(a => a.verifiedTitle && a.verifiedPage &&
        Number.isInteger(a.pdfPage) && Number.isInteger(a.endPdfPage))) return false;
  const bounds = [...v.sections, ...v.appendices];
  return bounds.every((entry,i) => i===0 || bounds[i-1]!.endPdfPage + 1 === entry.pdfPage)
    && bounds.at(-1)!.endPdfPage === 256;
}

export function ArmenianOriginalContents({ volume }: { volume: 1 | 2 | 3 | 4 }) {
  const lang = useLang();
  const l = localized[lang];
  const [source, setSource] = useState<SourceVolume | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    const controller = new AbortController();
    setSource(null);
    setState("loading");
    void fetch("/data/armenian-source-index.json", { signal: controller.signal })
      .then(async response => {
        if (!response.ok) throw new Error("Missing original source index");
        const index: unknown = await response.json();
        if (!index || typeof index !== "object" ||
            (index as SourceIndex).schemaVersion !== 2 ||
            !Array.isArray((index as SourceIndex).volumes)) throw new Error("Invalid index");
        const candidate = (index as SourceIndex).volumes.find(v => v.volume === volume);
        if (!isTrustedVolume(candidate, volume)) throw new Error("Unverified source sections");
        return candidate;
      })
      .then(result => {
        if (!controller.signal.aborted) { setSource(result); setState("ready"); }
      }).catch(() => {
        if (!controller.signal.aborted) setState("error");
      });
    return () => controller.abort();
  }, [volume]);

  return (
    <section className="space-y-4 rounded-3xl border bg-card p-5 sm:p-7"
      aria-label={l.title}>
      <div className="space-y-2">
        <h2 className="flex items-center gap-2 text-xl font-black sm:text-2xl">
          <BookOpenCheck className="size-6 text-primary" aria-hidden="true" />
          {l.title} · {volume === 1 ? "I" : volume === 2 ? "II" : volume === 3 ? "III" : "IV"}
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground">{l.intro}</p>
        <p className="text-sm font-medium">{l.practice}</p>
      </div>
      {state === "loading" && <p role="status" className="text-sm text-muted-foreground">{l.loading}</p>}
      {state === "error" && <p role="alert" className="flex gap-2 text-sm text-muted-foreground">
        <AlertCircle className="size-4 shrink-0" />{l.unavailable}</p>}
      {source && state === "ready" && <>
        <ol className="grid gap-2 sm:grid-cols-2">
          {source.sections.map(section => (
            <li key={section.number} className="flex items-start justify-between gap-3 rounded-xl border bg-background p-3">
              <span className="flex items-start gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-sm font-extrabold text-primary">{section.number}</span>
                <strong className="pt-1 text-sm leading-snug">{section.title}</strong>
              </span>
              <span className="shrink-0 pt-1 text-xs tabular-nums text-muted-foreground">
                {l.page} {section.pdfPage}–{section.endPdfPage}
              </span>
            </li>
          ))}
        </ol>
        <div className="space-y-2 border-t pt-4">
          <h3 className="text-sm font-bold">{l.appendices}</h3>
          <div className="flex flex-wrap gap-3">
            {source.appendices.map(a => (
              <p key={a.title} className="rounded-lg border px-3 py-2 text-sm">
                {a.title} <span className="text-muted-foreground">· {l.page} {a.pdfPage}–{a.endPdfPage}</span>
              </p>
            ))}
          </div>
        </div>
        {source.sourceNote && <p className="text-xs text-muted-foreground">{source.sourceNote}</p>}
      </>}
    </section>
  );
}
