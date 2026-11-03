import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, BookOpen, CheckCircle2, Flame, ListChecks, Medal, Sparkles, Star, Target, Trophy } from "lucide-react";
import { useProgress, level, levelFloor } from "@/lib/progress";
import { achievements, dailyQuests, getQuestHistory, QUESTS_CHANGED, type QuestHistory } from "@/lib/gamification";
import { useLang } from "@/lib/lang";

export const Route = createFileRoute("/achievements")({ component: AchievementsPage });
const QUEST_LABELS = {
  "answer-5": ["Լուծիր 5 հարց","Answer 5 questions","Ответь на 5 вопросов"],
  "answer-15": ["Լուծիր 15 հարց","Answer 15 questions","Ответь на 15 вопросов"],
  "review-3": ["Ուղղիր 3 սխալ","Correct 3 mistakes","Исправь 3 ошибки"],
} as const;
const BADGES = {
  "first-steps": ["Առաջին քայլ","First step","Первый шаг"],
  "fifty-questions": ["50 հարց","50 questions","50 вопросов"],
  "hundred-questions": ["100 հարց","100 questions","100 вопросов"],
  "five-hundred-xp": ["500 XP","500 XP","500 XP"],
  "week-streak": ["7-օրյա շարք","7-day streak","Серия 7 дней"],
} as const;
function AchievementsPage() {
  const lang = useLang();
  const i = lang === "en" ? 1 : lang === "ru" ? 2 : 0;
  const tr = (hy:string,en:string,ru:string) => [hy,en,ru][i]!;
  const p = useProgress();
  const [history,setHistory] = useState<QuestHistory>({});
  useEffect(() => {
    const refresh = () => setHistory(getQuestHistory());
    refresh();
    window.addEventListener(QUESTS_CHANGED,refresh);
    window.addEventListener("storage",refresh);
    return () => { window.removeEventListener(QUESTS_CHANGED,refresh); window.removeEventListener("storage",refresh); };
  },[]);
  const quests = dailyQuests(history);
  const badges = achievements(p);
  const currentLevel = level(p.xp);
  const base = levelFloor(currentLevel);
  const next = levelFloor(currentLevel+1);
  const percent = Math.max(0,Math.min(100,Math.round((p.xp-base)/(next-base)*100)));
  return <main className="mx-auto max-w-5xl space-y-7 px-4 pb-16 pt-6 sm:px-6">
    <Link to="/" className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-muted-foreground hover:text-primary"><ArrowLeft className="size-4"/>{tr("Գլխավոր էջ","Home","Главная")}</Link>
    <header className="space-y-3">
      <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary"><Sparkles className="size-4"/>{tr("Սովորիր խաղալով","Learn by playing","Учись играя")}</span>
      <h1 className="text-3xl font-black sm:text-4xl">{tr("Նվաճումներ և նպատակներ","Achievements & goals","Достижения и цели")}</h1>
      <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{tr("Փոքր նպատակներ՝ ամենօրյա առաջընթացի համար։ Բաց թողած օրը չի խանգարում նորից սկսել։","Small goals for daily progress. Missing a day never stops you from starting again.","Небольшие цели на каждый день. Пропущенный день не мешает начать снова.")}</p>
    </header>
    <section className="grid gap-3 sm:grid-cols-3" aria-label={tr("Առաջընթաց","Progress","Прогресс")}>
      <div className="rounded-2xl border bg-card p-5"><Star className="mb-2 size-6 text-primary"/><p className="text-2xl font-black tabular-nums">{p.xp} XP</p><p className="text-xs text-muted-foreground">{tr("Վաստակած միավորներ","Earned points","Заработанные очки")}</p></div>
      <div className="rounded-2xl border bg-card p-5"><Trophy className="mb-2 size-6 text-primary"/><p className="text-2xl font-black tabular-nums">{currentLevel}</p><p className="text-xs text-muted-foreground">{tr("Մակարդակ","Level","Уровень")}</p><div className="mt-3 h-2 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}><div className="h-full rounded-full bg-primary transition-[width] duration-300" style={{width:percent+"%"}}/></div></div>
      <div className="rounded-2xl border bg-card p-5"><Flame className="mb-2 size-6 text-primary"/><p className="text-2xl font-black tabular-nums">{p.streak}</p><p className="text-xs text-muted-foreground">{tr("Ուսման օրերի շարք","Study-day streak","Дни занятий подряд")}</p></div>
    </section>
    <section className="space-y-4">
      <h2 className="flex items-center gap-2 text-xl font-black"><Target className="size-5 text-primary"/>{tr("Այսօրվա առաջադրանքները","Today's quests","Задания на сегодня")}</h2>
      <div className="grid gap-3 md:grid-cols-3">{quests.map(quest => {
        const complete = quest.count >= quest.goal;
        return <article key={quest.id} className="rounded-2xl border bg-card p-5">
          <div className="flex items-center justify-between gap-2"><h3 className="font-bold">{QUEST_LABELS[quest.id][i]}</h3>{complete && <CheckCircle2 className="size-5 text-primary" aria-label={tr("Ավարտված","Completed","Выполнено")}/>}</div>
          <p className="mt-2 text-sm font-bold tabular-nums">{quest.count}/{quest.goal}</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted" role="progressbar" aria-label={QUEST_LABELS[quest.id][i]} aria-valuenow={quest.count} aria-valuemin={0} aria-valuemax={quest.goal}><div className="h-full rounded-full bg-primary transition-[width] duration-300" style={{width:(quest.count/quest.goal*100)+"%"}}/></div>
        </article>;
      })}</div>
      <div className="flex flex-wrap gap-3">
        <Link to="/" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground"><BookOpen className="size-4"/>{tr("Լուծել հարցեր","Practice questions","Решать вопросы")}</Link>
        <Link to="/mistakes" className="inline-flex min-h-11 items-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold hover:bg-muted"><ListChecks className="size-4"/>{tr("Կրկնել սխալները","Review mistakes","Повторить ошибки")}</Link>
      </div>
    </section>
    <section className="space-y-4">
      <h2 className="flex items-center gap-2 text-xl font-black"><Medal className="size-5 text-primary"/>{tr("Նվաճումներ","Achievements","Достижения")}</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{badges.map(badge => <div key={badge.id} className={"flex items-center gap-3 rounded-2xl border bg-card p-4 "+(!badge.unlocked?"opacity-60":"")}>
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/10"><Medal className="size-5 text-primary"/></span>
        <div><p className="font-bold">{BADGES[badge.id][i]}</p><p className="text-xs text-muted-foreground">{badge.unlocked ? tr("Ստացված է","Unlocked","Получено") : tr("Դեռ չի բացվել","Not yet unlocked","Пока не получено")}</p></div>
      </div>)}</div>
    </section>
    <p className="text-xs leading-relaxed text-muted-foreground">{tr("Օրվա առաջադրանքները հաշվում են այս դիտարկչում թարմացումից հետո լուծված տարբեր հարցերն ու հաջողությամբ ուղղված սխալները։ Նախկին XP-ն և առաջընթացը պահպանվում են։ Միավորները ֆինանսական արժեք չունեն։","Daily quests count distinct questions answered and mistakes successfully corrected in this browser since this update. Existing XP and progress remain intact. Points have no monetary value.","Ежедневные задания учитывают уникальные вопросы и исправленные ошибки в этом браузере после обновления. Старые XP и прогресс сохраняются. Очки не имеют денежной стоимости.")}</p>
  </main>;
}
