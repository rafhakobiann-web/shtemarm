import { Link } from "@tanstack/react-router";
import { BookOpen, ChevronDown, CheckCircle2, Clock3 } from "lucide-react";
import type { Book } from "@/lib/books";
import { armenianSourceChapters, ARMENIAN_SOURCE_PAGES, type ArmenianVolume } from "@/lib/armenian-source-outline";
import { useLang } from "@/lib/lang";

/**
 * Source-based navigation; indexed PDF chapters are NOT presented as imported tasks.
 * The source PDFs and their copyrighted text are not embedded in this UI.
 */
export function ArmenianSourceChapters({ volume, book }: { volume: ArmenianVolume; book?: Book }) {
  const lang = useLang();
  const chapters = armenianSourceChapters(volume);
  const words = {
    hy: { title: "Բնօրինակի բաժինները", subtitle: "8 բաժին՝ ստուգված էջերով", pages: "Էջեր",
      verified: "Բնօրինակից թվայնացված վարժանքներ", authored: "Shtemarm-ի ուսումնական վարժանքներ",
      waiting: "Առաջադրանքները դեռ ստուգվում են", open: "Բացել վարժանքները",
      note: "Էջերն ու բաժինների անունները ստուգված են PDF-ի բովանդակությամբ։ Դրանք չեն նշանակում, որ բոլոր հարցերը թվայնացված են։" },
    en: { title: "Original workbook chapters", subtitle: "8 chapters with verified pages", pages: "Pages",
      verified: "Source-transcribed practice", authored: "Shtemarm-created practice",
      waiting: "Questions await verification", open: "Open practice",
      note: "Chapter titles and page ranges come from the PDF contents. Source indexing does not mean every question has been imported." },
    ru: { title: "Разделы оригинального сборника", subtitle: "8 разделов с проверенными страницами", pages: "Страницы",
      verified: "Задания из источника", authored: "Авторские задания Shtemarm",
      waiting: "Задания ожидают проверки", open: "Открыть задания",
      note: "Названия и страницы сверены с оглавлением PDF. Это не означает, что все вопросы уже оцифрованы." },
  }[lang];

  return (
    <details className="sht-source-outline group overflow-hidden rounded-3xl border border-border bg-card/85 shadow-sm">
      <summary className="flex min-h-16 cursor-pointer list-none items-center gap-3 px-4 py-4 focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-primary sm:px-6 [&::-webkit-details-marker]:hidden">
        <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary"><BookOpen className="size-5" aria-hidden="true" /></span>
        <span className="min-w-0 flex-1">
          <strong className="block text-base font-black sm:text-lg">{words.title}</strong>
          <span className="block text-xs text-muted-foreground">{words.subtitle} · {ARMENIAN_SOURCE_PAGES[volume].appendix}–{ARMENIAN_SOURCE_PAGES[volume].answers}</span>
        </span>
        <ChevronDown className="size-5 shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-180" aria-hidden="true" />
      </summary>
      <div className="border-t border-border/70 px-4 pb-5 pt-4 sm:px-6">
        <p className="mb-4 max-w-3xl text-xs leading-relaxed text-muted-foreground">{words.note}</p>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {chapters.map(chapter => {
            // Do not link a generic starter exercise to an unrelated official chapter.
            const sourceSection = book?.sections.find(section =>
              section.n === chapter.number && section.title === chapter.title);
            const units = sourceSection?.units ?? [];
            const playable = units.length > 0;
            return (
              <article key={chapter.number} className="flex min-w-0 flex-col gap-2 rounded-2xl border border-border/70 bg-background p-4">
                <span className="text-xs font-extrabold text-primary">{chapter.number.toString().padStart(2, "0")} · {words.pages} {chapter.page}–{chapter.endPage}</span>
                <h3 className="min-h-10 break-words text-sm font-bold leading-snug">{chapter.title}</h3>
                <span className="mt-auto flex items-center gap-1.5 text-xs text-muted-foreground">
                  {playable ? <CheckCircle2 className="size-3.5 text-primary" aria-hidden="true" /> : <Clock3 className="size-3.5" aria-hidden="true" />}
                  {playable ? volume === 1 ? words.verified : words.authored : words.waiting}
                </span>
                {playable && (
                  <Link to="/study/$bookId/$sectionId" params={{bookId:String(40+volume),sectionId:String(chapter.number)}}
                    search={{mode:"classic"}} className="mt-1 inline-flex min-h-11 items-center justify-center rounded-xl bg-primary/10 px-3 text-xs font-bold text-primary hover:bg-primary/15 focus-visible:outline-2 focus-visible:outline-primary">
                    {words.open}
                  </Link>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </details>
  );
}
