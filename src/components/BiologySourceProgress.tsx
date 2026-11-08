import { Link } from "@tanstack/react-router";
import { ArrowRight, Dna, ShieldCheck } from "lucide-react";
import { useLang } from "@/lib/lang";
import { BIOLOGY_SOURCE_PROGRESS } from "@/lib/biology-source-progress";

/** Current-main tasks are differentiated from source-identified draft work. */
export function BiologySourceProgress() {
  const lang = useLang();
  const t = {
    hy: { title: "Կենսաբանության շտեմարանների վիճակը", available: "Հասանելի հարցեր",
      review: "Նախնական թվայնացում", note: "Նախնական թվայնացված հարցերը դեռ չեն հրապարակվել․ անհրաժեշտ է ստուգել բնօրինակի տեքստը, պատասխանները և պատկերները։",
      open: "Բացել հարցաշարը", original: "Բնօրինակ հարց" },
    en: { title: "Biology workbook coverage", available: "Available now",
      review: "Review-only transcription", note: "Draft questions are not published: original wording, keys and diagrams must be checked.",
      open: "Open practice", original: "Original tasks" },
    ru: { title: "Готовность сборников по биологии", available: "Доступно сейчас",
      review: "Черновик на проверке", note: "Черновые задания не опубликованы: требуется проверка текстов, ответов и иллюстраций.",
      open: "Открыть задания", original: "Задания в оригинале" },
  }[lang];
  return (
    <section className="rounded-3xl border border-primary/15 bg-card p-4 sm:p-6" aria-labelledby="biology-progress-heading">
      <div className="mb-4 flex items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><Dna className="size-5" aria-hidden="true"/></span>
        <div className="min-w-0">
          <h2 id="biology-progress-heading" className="text-base font-black sm:text-lg">{t.title}</h2>
          <p className="text-xs text-muted-foreground">{t.note}</p>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {BIOLOGY_SOURCE_PROGRESS.map(row => {
          const percentage = Math.round(row.availableOnMain / row.originalTasks * 100);
          return <article key={row.volume} className="rounded-2xl border border-border/70 bg-background p-4">
            <div className="flex items-center justify-between gap-2">
              <strong className="text-sm font-extrabold">{lang === "en" ? "Volume" : lang === "ru" ? "Часть" : "Մաս"} {row.volume===3?"III":"IV"}</strong>
              <span className="text-xs font-semibold text-muted-foreground">{percentage}%</span>
            </div>
            <p className="mt-2 text-2xl font-black tabular-nums text-foreground">{row.availableOnMain.toLocaleString("en-US")} <span className="text-xs font-normal text-muted-foreground">/ {row.originalTasks.toLocaleString("en-US")} {t.original}</span></p>
            <div role="progressbar" aria-valuemin={0} aria-valuemax={row.originalTasks} aria-valuenow={row.availableOnMain} aria-label={t.available + " " + row.volume} className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary" style={{width:percentage+"%"}}/>
            </div>
            <p className="mt-3 flex items-center gap-2 text-xs text-muted-foreground"><ShieldCheck className="size-3.5 text-primary" aria-hidden="true"/>{t.review}: {row.reviewBranchCandidates.toLocaleString("en-US")} / {row.originalTasks.toLocaleString("en-US")}</p>
            <Link to="/book/$bookId" params={{bookId:String(row.bookId)}} className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-xl text-sm font-bold text-primary focus-visible:outline-2 focus-visible:outline-primary">{t.open}<ArrowRight className="size-4" aria-hidden="true"/></Link>
          </article>;
        })}
      </div>
    </section>
  );
}
