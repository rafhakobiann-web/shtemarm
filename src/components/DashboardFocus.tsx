import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { getUnitMistakes, UNIT_MISTAKES_CHANGED } from "@/lib/unitMistakes";
import { achievements, dailyQuests, getQuestHistory, getWeeklySelections, localDay, QUESTS_CHANGED, setWeeklySelections, weeklyChallenges } from "@/lib/gamification";
import { summarizeRevision } from "@/lib/revisionSchedule";
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
  const [unitMistakes, setUnitMistakes] = useState(() => getUnitMistakes());
  useEffect(() => {
    const refresh = () => setUnitMistakes(getUnitMistakes());
    window.addEventListener(UNIT_MISTAKES_CHANGED, refresh);
    window.addEventListener("storage", refresh);
    return () => { window.removeEventListener(UNIT_MISTAKES_CHANGED, refresh); window.removeEventListener("storage", refresh); };
  }, []);
  const revision = useMemo(() => summarizeRevision(unitMistakes, Date.now()), [unitMistakes]);
  const [questHistory, setQuestHistory] = useState(() => getQuestHistory());
  useEffect(() => {
    const refresh = () => setQuestHistory(getQuestHistory());
    window.addEventListener(QUESTS_CHANGED, refresh);
    window.addEventListener("storage", refresh);
    return () => { window.removeEventListener(QUESTS_CHANGED, refresh); window.removeEventListener("storage", refresh); };
  }, []);
  const quests = dailyQuests(questHistory);
  const [weeklySelection, setWeeklySelection] = useState<string[]>(() => getWeeklySelections());
  const weekly = weeklyChallenges(questHistory, weeklySelection);
  const toggleWeekly = (id: string) => {
    const next = weeklySelection.includes(id) ? weeklySelection.filter(value => value !== id) : [...weeklySelection, id];
    setWeeklySelection(next);
    setWeeklySelections(next);
  };
  const unlocked = achievements(progress).filter(item => item.unlocked);
  const calendarDays = Array.from({ length: 28 }, (_, i) => {
    const day = new Date(); day.setHours(12, 0, 0, 0); day.setDate(day.getDate() - (27 - i));
    const date = localDay(day);
    const activity = questHistory[date];
    return { date, count: (activity?.answered.length ?? 0) + (activity?.reviewed.length ?? 0) };
  });
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
      <section className="academy-bento space-y-3 p-4 sm:p-5" aria-label={lang === "hy" ? "Այսօրվա ուսումնական առաջարկներ" : lang === "ru" ? "Рекомендации на сегодня" : "Today’s learning suggestions"}>
        <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="font-black">{lang === "hy" ? "Այսօրվա կրկնությունը" : lang === "ru" ? "Повторение на сегодня" : "Today’s revision"}</h2><Link to="/mistakes" className="inline-flex min-h-10 items-center gap-1 text-xs font-bold text-primary">{t.retry}<ArrowRight className="size-4" /></Link></div>
        <p className="text-sm text-muted-foreground">{revision.due} {lang === "hy" ? "հարց՝ առաջարկվող կրկնության համար" : lang === "ru" ? "вопросов к повторению" : "questions suggested for review"} · {revision.pending} {lang === "hy" ? "չյուրացված գրառում" : lang === "ru" ? "неосвоенных записей" : "unmastered records"}</p>
        {revision.bySubject.length > 0 && <p className="text-xs text-muted-foreground">{lang === "hy" ? "Առավել շատ սխալներ՝" : lang === "ru" ? "Больше всего ошибок:" : "Most saved mistakes:"} {revision.bySubject.slice(0, 3).map(([subject, count]) => `${SUBJECT_NAMES[subject as OnboardingSubject]?.[i] ?? subject} (${count})`).join(" · ")}</p>}
        <p className="text-xs text-muted-foreground">{lang === "hy" ? "Հաշվարկված է այս սարքում պահված շտեմարանային սխալներով․ սա ամբողջական գնահատական չէ։" : lang === "ru" ? "На основе ошибок, сохранённых на этом устройстве; не полная оценка знаний." : "Based on question-bank mistakes saved on this device; not a complete mastery assessment."}</p>
      </section>
      <section className="academy-bento space-y-4 p-4 sm:p-5" aria-label={lang==="hy"?"Ուսումնական ակտիվության օրացույց":lang==="ru"?"Календарь занятий":"Learning activity calendar"}>
        <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="font-black">{lang==="hy"?"Իմ ուսումնական ակտիվությունը":lang==="ru"?"Моя учебная активность":"My learning activity"}</h2><span className="text-xs font-bold text-primary">{progress.xp} XP · {unlocked.length} {lang==="hy"?"նվաճում":lang==="ru"?"достижений":"achievements"}</span></div>
        <div className="grid grid-cols-7 gap-2" role="img" aria-label={lang==="hy"?"Վերջին 28 օրվա պահպանված ակտիվություն":lang==="ru"?"Сохранённая активность за 28 дней":"Saved activity for the last 28 days"}>
          {calendarDays.map(day => <span key={day.date} title={day.date+": "+day.count} className={`aspect-square rounded-lg border ${day.count>=15?"bg-primary":day.count>=5?"bg-primary/60":day.count>0?"bg-primary/25":"bg-muted/50"}`} />)}
        </div>
        <div className="grid gap-2 sm:grid-cols-3">{quests.map(quest => <div key={quest.id} className="rounded-xl border bg-card p-3"><p className="text-xs font-semibold">{quest.id==="review-3"?(lang==="hy"?"Կրկնել 3 սխալ":lang==="ru"?"Повторить 3 ошибки":"Review 3 mistakes"):quest.id==="answer-15"?(lang==="hy"?"Պատասխանել 15 հարցի":lang==="ru"?"Ответить на 15 вопросов":"Answer 15 questions"):(lang==="hy"?"Պատասխանել 5 հարցի":lang==="ru"?"Ответить на 5 вопросов":"Answer 5 questions")}</p><p className="mt-1 text-sm font-bold tabular-nums">{quest.count}/{quest.goal}</p><div className="mt-2 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{width:`${Math.min(100,quest.count/quest.goal*100)}%`}} /></div></div>)}</div>
        <div className="space-y-2">
          <h3 className="text-sm font-black">{lang==="hy"?"Շաբաթական ընտրովի մարտահրավերներ":lang==="ru"?"Необязательные задания недели":"Optional weekly challenges"}</h3>
          <div className="grid gap-2 sm:grid-cols-3">{weekly.map(item => <label key={item.id} className="flex cursor-pointer flex-col gap-2 rounded-xl border bg-card p-3 text-xs">
            <span className="flex items-center gap-2"><input type="checkbox" checked={item.selected} onChange={() => toggleWeekly(item.id)} className="size-4 accent-primary" /><strong>{item.id==="review-10"?(lang==="hy"?"Կրկնել 10 սխալ":lang==="ru"?"Повторить 10 ошибок":"Review 10 mistakes"):item.id==="answer-50"?(lang==="hy"?"Պատասխանել 50 հարցի":lang==="ru"?"Ответить на 50 вопросов":"Answer 50 questions"):(lang==="hy"?"Պատասխանել 20 հարցի":lang==="ru"?"Ответить на 20 вопросов":"Answer 20 questions")}</strong></span>
            {item.selected && <><span className="font-semibold tabular-nums">{item.count}/{item.goal}</span><span className="h-2 overflow-hidden rounded-full bg-muted"><span className="block h-full rounded-full bg-primary" style={{width:`${Math.min(100,item.count/item.goal*100)}%`}} /></span></>}
          </label>)}</div>
          <p className="text-xs text-muted-foreground">{lang==="hy"?"Մարտահրավերները կամավոր են։ Կարող ես փոխել ընտրությունը ցանկացած պահի։ Բաց թողնելու համար տուգանք չկա։":lang==="ru"?"Задания добровольные, выбор можно изменить без штрафов.":"Challenges are optional; change your selection anytime without penalties."}</p>
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-black">{lang==="hy"?"Իմ նվաճումները":lang==="ru"?"Мои достижения":"My achievements"}</h3>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {achievements(progress).map(item => {
              const names: Record<string, [string,string,string]> = {
                "first-steps":["Առաջին քայլ","First step","Первый шаг"],
                "fifty-questions":["50 հարց","50 questions","50 вопросов"],
                "hundred-questions":["100 հարց","100 questions","100 вопросов"],
                "five-hundred-xp":["500 XP","500 XP","500 XP"],
                "week-streak":["7-օրյա շարք","7-day streak","Серия 7 дней"],
              };
              return <div key={item.id} data-achievement={item.id} data-unlocked={item.unlocked ? "true" : "false"} className={`flex min-h-12 items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold transition-colors motion-safe:duration-300 motion-reduce:transition-none ${item.unlocked?"border-primary/30 bg-primary/10 text-foreground motion-safe:animate-[achievement-reveal_450ms_ease-out_both]":"bg-muted/30 text-muted-foreground"}`}>
                <Trophy aria-hidden="true" className={`size-4 shrink-0 ${item.unlocked?"text-primary":"opacity-40"}`}/>
                <span>{names[item.id]?.[i] ?? item.id}</span>
                <span className="ml-auto text-[10px]">{item.unlocked?(lang==="hy"?"Ստացված":lang==="ru"?"Получено":"Earned"):(lang==="hy"?"Դեռ փակ":lang==="ru"?"Закрыто":"Locked")}</span>
              </div>;
            })}
          </div>
          <p className="text-xs text-muted-foreground">{lang==="hy"?"Նվաճումները հիմնված են իրական պահպանված արդյունքների վրա։ Շաբաթական մարտահրավերները կամ նոր պարգևները դեռ մշակման փուլում են։":lang==="ru"?"Награды основаны на сохранённых результатах. Недельные испытания ещё в разработке.":"Achievements use saved results. Weekly challenges and new rewards are still in development."}</p>
        </div>
        <p className="text-xs text-muted-foreground">{lang==="hy"?"Օրացույցում երևում է միայն այս սարքում պահպանված վերջին 31 օրվա ակտիվությունը։ Բաց թողած օրերը չեն նվազեցնում միավորները։":lang==="ru"?"Показаны только последние 31 день активности, сохранённой на устройстве. Пропуски не отнимают баллы.":"Only the last 31 days saved on this device are available. Missed days do not deduct points."}</p>
      </section>
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
