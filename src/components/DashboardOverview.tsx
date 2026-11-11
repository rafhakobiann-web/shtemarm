import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowRight, BookOpen, RotateCcw, UserRound, Target, CheckCircle2 } from "lucide-react";
import type { Progress } from "@/lib/progress";
import { progressSummary } from "@/lib/dashboard-summary";
import { useLang } from "@/lib/lang";
import { ALL_BOOKS } from "@/lib/books";
import { readRecentStudy, RECENT_STUDY_EVENT, RECENT_STUDY_KEY, type RecentStudy } from "@/lib/recent-study";

type Props = { name?: string | null; progress: Progress };

const COPY = {
  hy: {
    heading:"Ի՞նչ ենք սովորում այսօր",
    greeting:"Բարի վերադարձ",
    subtitle:"Պարապմունքները սկսվում են առարկայից։ Գտիր գիրքը, թեստը կամ կրկնության թեման՝ մի քանի հպումով։",
    start:"Ընտրել առարկա",
    review:"Կրկնել սխալները",
    profile:"Իմ պրոֆիլը",
    answered:"պատասխանված հարց",
    pending:"կրկնելու հարց",
    empty:"Քո առաջին պարապմունքը սկսվում է մեկ հարցից։",
    answeredLabel:"Լուծված",reviewLabel:"Կրկնելու",next:"Քո հաջորդ քայլը",
    continue:"Շարունակել պարապմունքը",last:"Վերջին բացված բաժինը",
  },
  en: {
    heading:"What shall we study today?",
    greeting:"Welcome back",
    subtitle:"Pick a subject, find your workbook, and start learning in a few taps.",
    start:"Explore subjects",
    review:"Review mistakes",
    profile:"My Profile",
    answered:"questions answered",
    pending:"questions to review",
    empty:"Your first practice session starts with one question.",
    answeredLabel:"Answered",reviewLabel:"To review",next:"Your next step",
    continue:"Continue studying",last:"Last opened section",
  },
  ru: {
    heading:"Что будем изучать сегодня?",
    greeting:"С возвращением",
    subtitle:"Выбери предмет, найди сборник и начни заниматься за пару нажатий.",
    start:"Выбрать предмет",
    review:"Повторить ошибки",
    profile:"Мой профиль",
    answered:"ответов",
    pending:"вопросов для повторения",
    empty:"Первое занятие начинается с одного вопроса.",
    answeredLabel:"Решено",reviewLabel:"Повторить",next:"Следующий шаг",
    continue:"Продолжить занятие",last:"Последний открытый раздел",
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
  const details = summary.answered
    ? `${summary.answered} ${t.answered} · ${summary.review} ${t.pending}`
    : t.empty;
  return (
    <section className="dashboard-overview academy-bento min-w-0 rounded-2xl border bg-card p-4 sm:p-6"
      aria-label={t.heading}>
      <div className="sht-dashboard-overview-layout">
        <div className="min-w-0 space-y-2">
          <p className="text-xs font-bold text-primary">{t.greeting}{name ? `, ${name}` : ""}</p>
          <h1 className="text-balance text-xl font-black leading-tight text-foreground sm:text-3xl">{t.heading}</h1>
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">{t.subtitle}</p>
          <p className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            {summary.review > 0 ? <RotateCcw className="size-4 shrink-0 text-primary" aria-hidden="true" /> :
              <BookOpen className="size-4 shrink-0 text-primary" aria-hidden="true" />}
            {details}
          </p>
        </div>
        <div className="sht-dashboard-next">
          <p className="sht-dashboard-next-label"><Target className="size-4" aria-hidden="true"/>{t.next}</p>
          <div className="sht-dashboard-next-actions">
            {recent
              ? <Link to="/study/$bookId/$sectionId"
                  params={{ bookId: recent.bookId, sectionId: recent.sectionId }}
                  search={{ mode: recent.mode }}
                  className="sht-dashboard-primary-action">
                  <span className="sht-dashboard-action-caption">{t.last}</span>
                  <span className="sht-dashboard-action-title">{t.continue}<ArrowRight className="size-4 shrink-0" aria-hidden="true" /></span>
                  <span className="sht-dashboard-action-context">{recent.title}</span>
                </Link>
              : summary.review > 0
                ? <Link to="/mistakes" className="sht-dashboard-primary-action">
                    <span className="sht-dashboard-action-title">{t.review}<ArrowRight className="size-4 shrink-0" aria-hidden="true" /></span>
                    <span className="sht-dashboard-action-context">{summary.review} {t.pending}</span>
                  </Link>
                : <Link to="/explore" className="sht-dashboard-primary-action">
                    <span className="sht-dashboard-action-title">{t.start}<ArrowRight className="size-4 shrink-0" aria-hidden="true" /></span>
                    <span className="sht-dashboard-action-context">{t.empty}</span>
                  </Link>}
            {recent && summary.review > 0 && <Link to="/mistakes" className="sht-dashboard-secondary-action">
              <RotateCcw className="size-4" aria-hidden="true" />{t.review}<span className="sht-dashboard-review-count">{summary.review}</span>
            </Link>}
            {(recent || summary.review > 0) && <Link to="/explore" className="sht-dashboard-secondary-action">
              <BookOpen className="size-4" aria-hidden="true" />{t.start}
            </Link>}
            <Link to="/profile" className="sht-dashboard-profile-action">
              <UserRound className="size-4" aria-hidden="true" />{t.profile}
            </Link>
          </div>
        </div>
      </div>
      <div className="sht-dashboard-stats" aria-label={t.heading}>
        <div><CheckCircle2 className="size-4" aria-hidden="true"/><strong>{summary.answered}</strong><span>{t.answeredLabel}</span></div>
        <div><RotateCcw className="size-4" aria-hidden="true"/><strong>{summary.review}</strong><span>{t.reviewLabel}</span></div>
      </div>
    </section>
  );
}
