import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, CalendarCheck, ListChecks, Sparkles, Target } from "lucide-react";
import { useProgress } from "@/lib/progress";
import { getMistakes } from "@/lib/mistakeNotebook";
import { getMathMistakes } from "@/lib/mathMistakes";
import { getUnitMistakes } from "@/lib/unitMistakes";
import { buildStudyPlan, STUDY_PLAN_SUBJECTS, type PlanMistake, type StudyPlanSubject } from "@/lib/studyPlan";
import { useLang } from "@/lib/lang";

export const Route = createFileRoute("/study-plan")({
  staticData: { sitemap: false },
  head: () => ({ meta: [
    { title: "Իմ ուսումնական պլանը · Shtemarm" },
    { name: "description", content: "Անհատական ուսումնական պլան՝ պահպանված սխալների և առաջընթացի հիման վրա։" },
    { property: "og:title", content: "Իմ ուսումնական պլանը · Shtemarm" },
    { property: "og:description", content: "Քո ամենօրյա վարժանքներն ու կրկնության առաջադրանքները։" },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: StudyPlanPage,
});
const KEY = "shtemarm:study-plan-settings:v1";
const DONE_KEY = "shtemarm:study-plan-completed:v1";
const NAMES: Record<StudyPlanSubject, [string,string,string]> = {
  english: ["Անգլերեն","English","Английский"],
  math: ["Մաթեմատիկա","Mathematics","Математика"],
  armenian: ["Հայոց լեզու","Armenian","Армянский язык"],
  history: ["Հայոց պատմություն","Armenian history","История Армении"],
  biology: ["Կենսաբանություն","Biology","Биология"],
  physics: ["Ֆիզիկա","Physics","Физика"],
  chemistry: ["Քիմիա","Chemistry","Химия"],
  geography: ["Աշխարհագրություն","Geography","География"],
  russian: ["Ռուսաց լեզու","Russian","Русский язык"],
};
type Settings = { subjects: StudyPlanSubject[]; minutes: number };
const defaults: Settings = { subjects: ["english","math","armenian","history","biology"], minutes: 25 };
function readSettings(): Settings {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(KEY) ?? "null");
    if (!parsed || typeof parsed !== "object") return defaults;
    const s = parsed as Partial<Settings>;
    const subjects = Array.isArray(s.subjects)
      ? s.subjects.filter((item): item is StudyPlanSubject => STUDY_PLAN_SUBJECTS.includes(item as StudyPlanSubject))
      : defaults.subjects;
    return { subjects: [...new Set(subjects)], minutes: [15,25,45,60].includes(s.minutes ?? 0) ? s.minutes! : 25 };
  } catch { return defaults; }
}
function readDone(): Record<string, string[]> {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(DONE_KEY) ?? "{}");
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return Object.fromEntries(Object.entries(parsed).filter(([day, value]) =>
      /^\d{4}-\d{2}-\d{2}$/.test(day) && Array.isArray(value) &&
      value.every(item => typeof item === "string")).slice(-14)) as Record<string, string[]>;
  } catch { return {}; }
}
function todayLocal() {
  const d = new Date();
  return [d.getFullYear(), String(d.getMonth()+1).padStart(2,"0"), String(d.getDate()).padStart(2,"0")].join("-");
}
function StudyPlanPage() {
  const lang = useLang();
  const idx = lang === "en" ? 1 : lang === "ru" ? 2 : 0;
  const tr = (hy: string, en: string, ru: string) => [hy,en,ru][idx]!;
  const progress = useProgress();
  const [settings, setSettings] = useState<Settings>(defaults);
  const [mistakes, setMistakes] = useState<PlanMistake[]>([]);
  const [done, setDone] = useState<Record<string,string[]>>({});
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    setSettings(readSettings()); setDone(readDone()); setHydrated(true);
    const refresh = () => {
      setMistakes([
        ...getMistakes().map(m => ({ id: "level:"+m.subject+":"+m.id, subject: m.subject, section: m.section, mastered: m.mastered })),
        ...getMathMistakes().map(m => ({ id: "math:"+m.id, subject: "math", section: String(m.section), mastered: m.mastered })),
        ...getUnitMistakes().map(m => ({ id: "unit:"+m.subject+":"+m.id, subject: m.subject, section: m.section, mastered: m.mastered })),
      ]);
    };
    refresh();
    const events = ["shtemarm:mistakes-changed", "shtemarm:math-mistakes-changed", "shtemarm:unit-mistakes-changed", "storage"];
    events.forEach(e => window.addEventListener(e, refresh));
    return () => events.forEach(e => window.removeEventListener(e, refresh));
  }, []);
  function changeSettings(next: Settings) {
    setSettings(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* no storage */ }
  }
  const tasks = useMemo(() => buildStudyPlan(progress, mistakes, settings.subjects, settings.minutes), [progress,mistakes,settings]);
  const day = todayLocal();
  const completed = done[day] ?? [];
  function toggleDone(id: string) {
    const nextIds = completed.includes(id) ? completed.filter(x => x !== id) : [...completed,id];
    const next = { ...done, [day]: nextIds };
    setDone(next);
    try { localStorage.setItem(DONE_KEY, JSON.stringify(next)); } catch { /* no storage */ }
  }
  const finished = tasks.filter(task => completed.includes(task.id)).length;
  return <main className="mx-auto max-w-5xl space-y-6 px-4 pb-16 pt-6 sm:px-6">
    <Link to="/" className="inline-flex min-h-10 items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary"><ArrowLeft className="size-4"/>{tr("Գլխավոր էջ","Home","Главная")}</Link>
    <header className="space-y-3">
      <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary"><Sparkles className="size-4"/>{tr("Անհատական ուսուցում","Personalized learning","Персональное обучение")}</span>
      <h1 className="text-3xl font-black tracking-tight sm:text-4xl">{tr("Իմ ուսումնական պլանը","My study plan","Мой учебный план")}</h1>
      <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{tr("Ամեն օր առաջարկում ենք ինչ կրկնել՝ հիմնվելով այս սարքում պահպանված սխալների և առաջընթացի վրա։ Առաջարկությունները գնահատական կամ քննության կանխատեսում չեն։","Daily suggestions based on your saved mistakes and progress on this device. These are not exam score predictions.","Ежедневные рекомендации по сохранённым ошибкам и прогрессу на этом устройстве. Это не прогноз результатов экзамена.")}</p>
    </header>
    <section className="rounded-3xl border bg-card p-5 shadow-sm sm:p-6">
      <div className="mb-4 flex items-center gap-2 font-black"><Target className="size-5 text-primary"/>{tr("Իմ նպատակները","My goals","Мои цели")}</div>
      <p className="mb-3 text-sm text-muted-foreground">{tr("Ընտրիր պատրաստվող առարկաները","Choose subjects to focus on","Выберите предметы")}</p>
      <div className="flex flex-wrap gap-2">{STUDY_PLAN_SUBJECTS.map(subject => {
        const selected = settings.subjects.includes(subject);
        return <button key={subject} type="button" aria-pressed={selected} onClick={() => changeSettings({
          ...settings, subjects: selected ? settings.subjects.filter(s => s !== subject) : [...settings.subjects,subject],
        })} className={`min-h-11 rounded-xl border px-3 py-2 text-sm font-bold transition-colors ${selected ? "border-primary bg-primary/10 text-primary" : "bg-background text-muted-foreground hover:bg-muted"}`}>{NAMES[subject][idx]}</button>;
      })}</div>
      <label className="mt-5 block text-sm font-bold" htmlFor="daily-minutes">{tr("Օրական ուսման ժամանակ","Daily study time","Время занятий в день")}</label>
      <select id="daily-minutes" value={settings.minutes} onChange={e => changeSettings({ ...settings, minutes: Number(e.target.value) })} className="mt-2 min-h-11 w-full max-w-xs rounded-xl border bg-background px-3 text-sm font-semibold">
        {[15,25,45,60].map(minutes => <option key={minutes} value={minutes}>{minutes} {tr("րոպե","minutes","минут")}</option>)}
      </select>
    </section>
    <section className="space-y-4" aria-label={tr("Այսօրվա պլան","Today's plan","План на сегодня")}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-xl font-black"><CalendarCheck className="size-5 text-primary"/>{tr("Այսօրվա պլանը","Today's plan","План на сегодня")}</h2>
        <span className="rounded-full bg-muted px-3 py-1.5 text-sm font-bold">{finished}/{tasks.length}</span>
      </div>
      {!hydrated ? <p role="status">{tr("Բեռնվում է…","Loading…","Загрузка…")}</p> : tasks.length === 0
        ? <div className="rounded-2xl border bg-card p-6 text-sm text-muted-foreground">{tr("Ընտրիր առնվազն մեկ առարկա՝ պլանը կազմելու համար։","Select at least one subject to create your plan.","Выберите хотя бы один предмет.")}</div>
        : <div className="grid gap-3 md:grid-cols-2">{tasks.map((task,i) => {
          const checked = completed.includes(task.id);
          const mistakeTask = task.kind === "mistakes";
          return <article key={task.id} className="flex flex-col gap-3 rounded-2xl border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between gap-2"><span className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{tr("Առաջադրանք","Task","Задание")} {i+1}</span><span className="text-xs font-bold text-primary">{NAMES[task.subject][idx]}</span></div>
            <h3 className="text-lg font-black">{mistakeTask
              ? tr("Կրկնիր սխալ հարցերը","Review missed questions","Повтори ошибки")
              : tr("Լուծիր նոր առաջադրանքներ","Practice more questions","Реши новые задания")}</h3>
            <p className="text-sm text-muted-foreground">{mistakeTask
              ? tr(`Ունես առնվազն ${task.count} կրկնելու հարց։`,`You have at least ${task.count} questions to review.`,`У тебя есть минимум ${task.count} вопросов для повторения.`)
              : tr(`Առաջարկվում է մոտ ${task.count} հարց։`,`Try about ${task.count} questions.`,`Попробуй около ${task.count} вопросов.`)}</p>
            <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2">
              {mistakeTask ? <Link to="/mistakes" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"><ListChecks className="size-4"/>{tr("Կրկնել","Review","Повторить")}<ArrowRight className="size-4"/></Link>
                : <Link to="/" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"><BookOpen className="size-4"/>{tr("Ընտրել վարժանք","Choose practice","Выбрать задания")}<ArrowRight className="size-4"/></Link>}
              <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={checked} onChange={() => toggleDone(task.id)} className="size-4 accent-primary"/>{tr("Արված է","Done","Готово")}</label>
            </div>
          </article>;
        })}</div>}
    </section>
    <p className="text-xs leading-relaxed text-muted-foreground">{tr("Պլանը փոխվում է քո սխալների և առաջընթացի հետ։ «Արված է» նշումը պահվում է այս դիտարկչում, և հաջորդ օրը սկսվում է նոր պլան։","The plan adapts to your mistakes and progress. Completed tasks are saved in this browser; a new plan starts each day.","План меняется вместе с прогрессом. Выполнение сохраняется в браузере, а на следующий день создаётся новый план.")}</p>
  </main>;
}
