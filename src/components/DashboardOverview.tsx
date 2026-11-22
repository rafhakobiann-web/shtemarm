import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, BookOpen, RotateCcw } from "lucide-react";
import type { Progress } from "@/lib/progress";
import { progressSummary } from "@/lib/dashboard-summary";
import { useLang } from "@/lib/lang";
import { ALL_BOOKS } from "@/lib/books";
import { readRecentStudy, RECENT_STUDY_EVENT, RECENT_STUDY_KEY, type RecentStudy } from "@/lib/recent-study";

type Props = { name?: string | null; progress: Progress };

const COPY = {
  hy: {
    greeting:"Բարի վերադարձ", heading:"Սովորիր քո տեմպով։",
    subtitle:"Շարունակիր վերջին բաժնից կամ ընտրիր առարկա՝ սկսելու համար։",
    start:"Ընտրել առարկա", review:"Կրկնել սխալները", answered:"լուծված հարց",
    pending:"հարց՝ կրկնելու", next:"Շարունակել ուսումը", last:"Վերջին բացված բաժինը",
  },
  en: {
    greeting:"Welcome back", heading:"Learn at your own pace.",
    subtitle:"Continue where you left off, or choose a subject to get started.",
    start:"Choose a subject", review:"Review mistakes", answered:"questions answered",
    pending:"questions to review", next:"Continue studying", last:"Last opened section",
  },
  ru: {
    greeting:"С возвращением", heading:"Учись в своём темпе.",
    subtitle:"Продолжи с последнего раздела или выбери предмет.",
    start:"Выбрать предмет", review:"Повторить ошибки", answered:"решено вопросов",
    pending:"вопросов для повторения", next:"Продолжить занятие", last:"Последний открытый раздел",
  },
} as const;

export function DashboardOverview({ name, progress }: Props) {
  const t = COPY[useLang()];
  const [recent, setRecent] = useState<RecentStudy | null>(null);
  useEffect(() => {
    const refresh = () => {
      const saved = readRecentStudy();
      setRecent(saved && ALL_BOOKS.some(book => String(book.id) === saved.bookId) ? saved : null);
    };
    refresh();
    const onStorage = (event: StorageEvent) => {
      if (event.key === RECENT_STUDY_KEY || event.key === null) refresh();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener(RECENT_STUDY_EVENT, refresh);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(RECENT_STUDY_EVENT, refresh);
    };
  }, []);

  const summary = progressSummary(progress);
  const destination = recent
    ? { to: "/study/$bookId/$sectionId" as const, params: { bookId: recent.bookId, sectionId: recent.sectionId }, search: { mode: recent.mode }, title: recent.title }
    : null;

  return (
    <section className="sht-quiet-overview min-w-0 rounded-3xl border bg-card p-5 sm:p-7"
      aria-label={t.heading}>
      <div className="max-w-2xl space-y-2">
        <p className="text-sm font-semibold text-primary">{t.greeting}{name ? `, ${name}` : ""}</p>
        <h1 className="text-balance text-2xl font-black leading-tight tracking-tight text-foreground sm:text-4xl">{t.heading}</h1>
        <p className="max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">{t.subtitle}</p>
      </div>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center">
        {destination ? (
          <Link to={destination.to} params={destination.params} search={destination.search}
            className="inline-flex min-h-12 items-center justify-between gap-4 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:min-w-64">
            <span className="min-w-0">
              <span className="block text-xs font-medium opacity-80">{t.last}</span>
              <span className="block truncate">{t.next} · {destination.title}</span>
            </span>
            <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
          </Link>
        ) : summary.review > 0 ? (
          <Link to="/mistakes" className="inline-flex min-h-12 items-center justify-between gap-4 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:min-w-64">
            <span>{t.review}</span><ArrowRight className="size-4 shrink-0" aria-hidden="true" />
          </Link>
        ) : (
          <Link to="/explore" className="inline-flex min-h-12 items-center justify-between gap-4 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary sm:min-w-64">
            <span>{t.start}</span><BookOpen className="size-4 shrink-0" aria-hidden="true" />
          </Link>
        )}
        {summary.review > 0 && destination && (
          <Link to="/mistakes" className="inline-flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary">
            <RotateCcw className="size-4" aria-hidden="true" />{t.review}
          </Link>
        )}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 border-t pt-4 text-xs font-medium text-muted-foreground">
        <span>{summary.answered} {t.answered}</span>
        <Link to="/mistakes" className="inline-flex items-center gap-1.5 transition-colors hover:text-primary">
          <RotateCcw className="size-3.5" aria-hidden="true" />{summary.review} {t.pending}
        </Link>
      </div>
    </section>
  );
}
