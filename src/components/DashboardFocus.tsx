import { Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, CheckCircle2, ClipboardCheck, Home, RotateCcw, Sparkles, Target, Trophy } from "lucide-react";
import { useLang } from "@/lib/lang";
import { level, type Progress } from "@/lib/progress";
import type { OnboardingSubject } from "@/lib/onboarding";

const SUBJECT_NAMES: Record<OnboardingSubject, [string,string,string]> = {
  english: ["Անգլերեն", "English", "Английский"],
  math: ["Մաթեմատիկա", "Mathematics", "Математика"],
  armenian: ["Հայոց լեզու", "Armenian", "Армянский"],
  history: ["Հայոց պատմություն", "Armenian history", "История Армении"],
  biology: ["Կենսաբանություն", "Biology", "Биология"],
  physics: ["Ֆիզիկա", "Physics", "Физика"],
  chemistry: ["Քիմիա", "Chemistry", "Химия"],
  geography: ["Աշխարհագրություն", "Geography", "География"],
  russian: ["Ռուսաց լեզու", "Russian", "Русский"],
};
const WORDS = {
  hy: { title:"Իմ ուսումնական տարածքը", hello:"Շարունակիր այնտեղից, որտեղ կանգ էիր առել", welcome:"Բարի վերադարձ, {name}",
    intro:"Առաջընթաց, սխալների կրկնություն և քեզ հետաքրքրող առարկաներ՝ մեկ էջում։", start:"Շարունակել ուսուցումը",
    retry:"Կրկնել սխալները", choose:"Ընտրել առարկա", selected:"Քո ընտրած առարկաները", selectedHint:"Անմիջապես բացիր գրքերն ու թեստերը։", noSubjects:"Ընտրված առարկաներ դեռ չկան։ Բացիր գրադարանը և ընտրիր քեզ անհրաժեշտը։",
    home:"Դիտել գլխավոր էջը", answered:"Պատասխանված", correct:"Ճիշտ", review:"Սխալ", rate:"Ճշտություն",
    recent:"Վերջին քննությունը", noRecent:"Քննության արդյունք դեռ չկա", first:"Դեռ պատասխաններ չկան․ սկսիր առաջին պարապմունքից։", level:"Մակարդակ" },
  en: { title:"My learning space", hello:"Pick up where you left off", welcome:"Welcome back, {name}",
    intro:"Progress, mistake reviews and your chosen subjects in one place.", start:"Continue learning",
    retry:"Review mistakes", choose:"Choose a subject", selected:"Your subjects", selectedHint:"Open books and practice tests directly.", noSubjects:"No subjects selected yet. Browse the library and pick one to begin.",
    home:"View landing page", answered:"Answered", correct:"Correct", review:"To review", rate:"Accuracy",
    recent:"Latest exam", noRecent:"No exam results yet", first:"No answers recorded yet. Try your first practice session.", level:"Level" },
  ru: { title:"Моё учебное пространство", hello:"Продолжай с того места, где остановился", welcome:"С возвращением, {name}",
    intro:"Прогресс, работа над ошибками и выбранные предметы на одной странице.", start:"Продолжить обучение",
    retry:"Повторить ошибки", choose:"Выбрать предмет", selected:"Твои предметы", selectedHint:"Открой сборники и тесты сразу.", noSubjects:"Предметы пока не выбраны. Открой библиотеку и начни обучение.",
    home:"Главная страница", answered:"Ответов", correct:"Верно", review:"Повторить", rate:"Точность",
    recent:"Последний экзамен", noRecent:"Результатов пока нет", first:"Ответов ещё нет. Начни первую тренировку.", level:"Уровень" },
} as const;

export function progressSummary(progress: Progress) {
  const answers = Object.values(progress.answers);
  const correct = answers.filter(value => value === 1).length;
  const review = answers.filter(value => value === 0).length;
  return {
    answered: answers.length, correct, review,
    accuracy: answers.length ? Math.round(correct * 100 / answers.length) : null,
    recentExam: progress.exams.at(-1) ?? null,
  };
}

export function DashboardFocus({ name, progress, subjects }: {
  name?: string | null;
  progress: Progress;
  subjects: readonly OnboardingSubject[];
}) {
  const lang = useLang();
  const t = WORDS[lang];
  const i = lang === "en" ? 1 : lang === "ru" ? 2 : 0;
  const summary = progressSummary(progress);
  const selected = [...new Set(subjects)].slice(0, 6);
  const nextTo = summary.review > 0 ? "/mistakes" : "/study-plan";
  const nextText = summary.review > 0 ? t.retry : t.start;
  const greeting = name ? t.welcome.replace("{name}", name) : t.hello;
  const exam = summary.recentExam;
  const stats = [
    { label:t.answered, value:String(summary.answered), Icon:BookOpen },
    { label:t.correct, value:String(summary.correct), Icon:CheckCircle2 },
    { label:t.review, value:String(summary.review), Icon:RotateCcw },
    { label:t.rate, value:summary.accuracy === null ? "—" : String(summary.accuracy) + "%", Icon:Trophy },
  ];
  return (
    <section className="dashboard-focus space-y-4" aria-label={t.title}>
      <div className="academy-bento relative overflow-hidden p-5 sm:p-7">
        <div aria-hidden="true" className="dashboard-focus-glow" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 max-w-2xl space-y-2">
            <p className="flex items-center gap-2 text-xs font-black text-primary"><Sparkles className="size-4" />{t.title}</p>
            <h1 className="break-words text-pretty text-2xl font-black leading-tight text-foreground sm:text-3xl">{greeting}</h1>
            <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">{t.intro}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to={nextTo} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-extrabold text-primary-foreground">
              {summary.review ? <RotateCcw className="size-4" /> : <Target className="size-4" />}{nextText}<ArrowRight className="size-4" />
            </Link>
            <Link to="/" className="inline-flex min-h-11 items-center gap-2 rounded-xl border bg-card px-4 py-2 text-sm font-bold text-foreground hover:bg-muted">
              <Home className="size-4" />{t.home}
            </Link>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map(({ label, value, Icon }) => (
          <div className="academy-bento min-w-0 p-4" key={label}>
            <p className="flex items-center gap-2 text-xs font-bold text-muted-foreground"><Icon className="size-4 text-primary" />{label}</p>
            <p className="mt-2 text-2xl font-black tabular-nums text-foreground">{value}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,.8fr)]">
        <div className="academy-bento min-w-0 space-y-3 p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div><h2 className="font-black">{t.selected}</h2><p className="mt-1 text-xs text-muted-foreground">{t.selectedHint}</p></div>
            <Link to="/dashboard" hash="subjects" className="inline-flex min-h-10 items-center gap-1 text-xs font-extrabold text-primary">{t.choose}<ArrowRight className="size-4" /></Link>
          </div>
          <div className="flex flex-wrap gap-2">
            {selected.map(subject => ["english","math","armenian","history","biology"].includes(subject)
              ? <Link key={subject} to="/dashboard" search={{ subject: subject as "english"|"math"|"armenian"|"history"|"biology" }}
                  className="inline-flex min-h-10 items-center rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-xs font-bold hover:border-primary/60 hover:bg-primary/10">
                  {SUBJECT_NAMES[subject][i]}<ArrowRight className="ml-2 size-3.5 text-primary" />
                </Link>
              : <Link key={subject} to="/subject/$subject" params={{ subject }}
                  className="inline-flex min-h-10 items-center rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-xs font-bold hover:border-primary/60 hover:bg-primary/10">
                  {SUBJECT_NAMES[subject][i]}<ArrowRight className="ml-2 size-3.5 text-primary" />
                </Link>)}
          </div>
          {selected.length === 0 && <p className="text-xs text-muted-foreground">{t.noSubjects}</p>}
          {summary.answered === 0 && <p className="text-xs text-muted-foreground">{t.first}</p>}
        </div>
        <div className="academy-bento flex min-w-0 items-center gap-4 p-4 sm:p-5">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary"><ClipboardCheck className="size-6" /></span>
          <div className="min-w-0">
            <p className="text-xs font-bold text-muted-foreground">{t.recent}</p>
            <p className="mt-1 break-words text-base font-black">{exam ? String(exam.score) + " / " + String(exam.total) : t.noRecent}</p>
            <p className="mt-1 text-xs text-muted-foreground">{exam ? exam.date.slice(0,10) : t.level + " " + level(progress.xp) + " · " + progress.xp + " XP"}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
