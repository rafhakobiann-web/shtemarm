import { Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, RotateCcw, UserRound } from "lucide-react";
import type { Progress } from "@/lib/progress";
import { progressSummary } from "@/lib/dashboard-summary";
import { useLang } from "@/lib/lang";

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
  },
} as const;

export function DashboardOverview({ name, progress }: Props) {
  const t = COPY[useLang()];
  const summary = progressSummary(progress);
  const details = summary.answered
    ? `${summary.answered} ${t.answered} · ${summary.review} ${t.pending}`
    : t.empty;
  return (
    <section className="dashboard-overview academy-bento min-w-0 rounded-2xl border bg-card p-4 sm:p-6"
      aria-label={t.heading}>
      <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
        <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:shrink-0 sm:flex-col">
          {summary.review > 0
            ? <Link to="/mistakes" className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground hover:bg-primary/90 sm:flex-none">
                {t.review}<ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            : <Link to="/explore" className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground hover:bg-primary/90 sm:flex-none">
                {t.start}<ArrowRight className="size-4" aria-hidden="true" />
              </Link>}
          <Link to="/profile" className="inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-bold text-foreground hover:bg-muted sm:flex-none">
            <UserRound className="size-4 text-primary" aria-hidden="true" />{t.profile}
          </Link>
        </div>
      </div>
    </section>
  );
}
