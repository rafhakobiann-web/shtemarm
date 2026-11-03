import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, BookOpenText, CheckCircle2, ChevronRight, ListChecks, RotateCcw, Trash2 } from "lucide-react";
import { MathContent } from "@/components/MathText";
import { UnitCard, isAnswered, type UnitAnswer } from "@/components/UnitCard";
import { matchGrammarTopic } from "@/lib/grammarHandbook";
import { useLang } from "@/lib/lang";
import { getMistakes, markMistakeMastered, removeMistake, type Mistake } from "@/lib/mistakeNotebook";
import { getMathMistakes, markMathMistakeMastered, removeMathMistake, MATH_MISTAKES_CHANGED, type MathMistake } from "@/lib/mathMistakes";
import { getUnitMistakes, markUnitMistakeMastered, removeUnitMistake, UNIT_MISTAKES_CHANGED, type UnitMistake } from "@/lib/unitMistakes";

export const Route = createFileRoute("/mistakes")({
  staticData: { sitemap: false },
  component: MistakesPage,
});

type Entry =
  | { kind: "level"; key: string; subject: string; section: string; mastered: boolean; attempts: number; updatedAt: number; item: Mistake }
  | { kind: "math"; key: string; subject: string; section: string; mastered: boolean; attempts: number; updatedAt: number; item: MathMistake }
  | { kind: "unit"; key: string; subject: string; section: string; mastered: boolean; attempts: number; updatedAt: number; item: UnitMistake };

function subjectKey(value: string) {
  const s = value.toLowerCase();
  if (s === "english" || s === "անգլերեն") return "english";
  if (s === "math" || s === "mathematics" || s === "մաթեմատիկա") return "math";
  if (s === "armenian" || s.includes("հայոց լեզու")) return "armenian";
  if (s === "history" || s.includes("պատմություն")) return "history";
  if (s === "biology" || s.includes("կենսաբանություն")) return "biology";
  if (s === "physics" || s.includes("ֆիզիկա")) return "physics";
  return value;
}

function getAllEntries(): Entry[] {
  return [
    ...getMistakes().map((item): Entry => ({
      kind: "level", key: "level:" + item.subject + ":" + item.id,
      subject: subjectKey(item.subject), section: item.section,
      mastered: item.mastered, attempts: item.attempts, updatedAt: item.updatedAt, item,
    })),
    ...getMathMistakes().map((item): Entry => ({
      kind: "math", key: "math:" + item.id, subject: "math",
      section: (item.book.endsWith("1") ? "1" : "2") + " · " + item.chapter + "." + item.section,
      mastered: item.mastered, attempts: item.attempts, updatedAt: item.lastWrong, item,
    })),
    ...getUnitMistakes().map((item): Entry => ({
      kind: "unit", key: "unit:" + item.subject + ":" + item.id,
      subject: subjectKey(item.subject), section: item.section,
      mastered: item.mastered, attempts: item.attempts, updatedAt: item.updatedAt, item,
    })),
  ].sort((a, b) => a.updatedAt - b.updatedAt);
}

const WORDS = {
  hy: {
    title:"Իմ սխալները", subtitle:"Բոլոր պահպանված սխալները մեկ տեղում։ Կրկնիր դրանք հերթով՝ մինչև ճիշտ պատասխանելը։",
    all:"Բոլոր առարկաները", subject:"Առարկա", pending:"Կրկնելու", mastered:"Յուրացված", allStatus:"Բոլորը",
    status:"Ցուցադրել", start:"Սկսել հերթական կրկնությունը", continue:"Վերադառնալ ցանկին", empty:"Այս բաժնում սխալներ չկան։",
    emptyQueue:"Բոլոր պահպանված սխալները կրկնված են։", noHistory:"Պահպանված սխալներ դեռ չկան։",
    current:"Հաջորդ հարցը", check:"Ստուգել", retry:"Կրկնել", next:"Բաց թողնել և անցնել հաջորդին",
    wrong:"Դեռ սխալ է։ Փորձիր կրկին։", solved:"Ճիշտ է։ Հարցը նշվեց յուրացված։",
    attempts:"սխալ փորձ", remove:"Հեռացնել", removeConfirm:"Հեռացնե՞լ այս սխալը տետրից։",
    noText:"Հարցի տեքստը դեռ հասանելի չէ։ Բացիր համապատասխան շտեմարանի բաժինը։",
    type:"Գրիր պատասխանը", grammar:"Վերուսումնասիրել քերականական կանոնը", math:"Բացել մաթեմատիկայի բաժինը",
    local:"Այս էջը միավորում է այս սարքում արդեն պահպանված սխալները։ Նախկինում չգրանցված կամ այլ սարքի սխալները ինքնաբերաբար չեն հայտնվի։",
  },
  en: {
    title:"My mistakes",subtitle:"Review all saved mistakes in one place, one question at a time, until you get them right.",
    all:"All subjects",subject:"Subject",pending:"To review",mastered:"Mastered",allStatus:"All",
    status:"Show",start:"Start step-by-step review",continue:"Back to list",empty:"No mistakes in this filter.",
    emptyQueue:"All saved mistakes have been reviewed.",noHistory:"No saved mistakes yet.",
    current:"Current question",check:"Check answer",retry:"Review",next:"Skip to next",
    wrong:"Not quite. Try again.",solved:"Correct! Marked as mastered.",
    attempts:"wrong attempts",remove:"Remove",removeConfirm:"Remove this mistake from the notebook?",
    noText:"The question text is unavailable. Open the corresponding book section.",
    type:"Enter your answer",grammar:"Relearn grammar rule",math:"Open mathematics section",
    local:"This page combines mistakes already saved on this device. Older unrecorded mistakes or mistakes from another device cannot be recovered automatically.",
  },
  ru: {
    title:"Мои ошибки",subtitle:"Все сохранённые ошибки в одном месте. Исправляйте их по очереди до правильного ответа.",
    all:"Все предметы",subject:"Предмет",pending:"Повторить",mastered:"Усвоено",allStatus:"Все",
    status:"Показать",start:"Начать последовательное повторение",continue:"Вернуться к списку",empty:"В этой категории ошибок нет.",
    emptyQueue:"Все сохранённые ошибки повторены.",noHistory:"Сохранённых ошибок пока нет.",
    current:"Текущий вопрос",check:"Проверить",retry:"Повторить",next:"Пропустить и далее",
    wrong:"Пока неверно. Попробуйте снова.",solved:"Правильно! Вопрос отмечен как усвоенный.",
    attempts:"ошибочных попыток",remove:"Удалить",removeConfirm:"Удалить эту ошибку из тетради?",
    noText:"Текст задания недоступен. Откройте соответствующий раздел сборника.",
    type:"Введите ответ",grammar:"Повторить правило",math:"Открыть раздел математики",
    local:"Здесь собраны ошибки, уже сохранённые на этом устройстве. Старые незаписанные ошибки и ошибки с другого устройства автоматически не появятся.",
  },
} as const;

function labelSubject(subject: string, lang: "hy" | "en" | "ru") {
  const labels: Record<string, [string, string, string]> = {
    english:["Անգլերեն","English","Английский"],
    math:["Մաթեմատիկա","Mathematics","Математика"],
    armenian:["Հայոց լեզու","Armenian language","Армянский язык"],
    history:["Հայոց պատմություն","Armenian history","История Армении"],
    biology:["Կենսաբանություն","Biology","Биология"],
    physics:["Ֆիզիկա","Physics","Физика"],
    chemistry:["Քիմիա","Chemistry","Химия"],
    geography:["Աշխարհագրություն","Geography","География"],
    russian:["Ռուսերեն","Russian","Русский язык"],
  };
  return labels[subject]?.[lang === "hy" ? 0 : lang === "en" ? 1 : 2] ?? subject;
}

function preview(entry: Entry) {
  if (entry.kind === "level") return entry.item.prompt;
  if (entry.kind === "math") return entry.item.prompt || "";
  const unit = entry.item.unit;
  if (unit.kind === "mc" || unit.kind === "num") return unit.questions[0]?.stem ?? unit.passage;
  return unit.passage;
}

function removeEntry(entry: Entry) {
  if (entry.kind === "level") removeMistake(entry.item.id, entry.item.subject);
  else if (entry.kind === "math") removeMathMistake(entry.item.id);
  else removeUnitMistake(entry.item.id, entry.item.subject);
}

function ReviewQuestion({ entry, onSolved }: { entry: Entry; onSolved: () => void }) {
  const lang = useLang();
  const t = WORDS[lang];
  const [selected, setSelected] = useState<number | null>(null);
  const [answer, setAnswer] = useState("");
  const [unitAnswer, setUnitAnswer] = useState<UnitAnswer | undefined>(undefined);
  const [incorrect, setIncorrect] = useState(false);
  const topic = entry.kind === "level" && entry.subject === "english"
    ? matchGrammarTopic("grammar", entry.item.explanation) : undefined;

  const check = () => {
    let correct = false;
    if (entry.kind === "level") {
      if (selected === null) return;
      correct = selected === entry.item.correct;
      if (correct) markMistakeMastered(entry.item.id, entry.item.subject);
    } else if (entry.kind === "math") {
      if (!answer.trim()) return;
      correct = markMathMistakeMastered(entry.item.id, answer);
    } else {
      if (!isAnswered(entry.item.unit, unitAnswer)) return;
      correct = markUnitMistakeMastered(entry.item.id, entry.item.subject, unitAnswer!);
    }
    setIncorrect(!correct);
    if (correct) onSolved();
  };

  const mathChoices = entry.kind === "math" && entry.item.kind !== "open"
    ? entry.item.kind === "tf"
      ? [{ value: "T", label: lang === "en" ? "True" : lang === "ru" ? "Верно" : "Ճիշտ է" },
         { value: "F", label: lang === "en" ? "False" : lang === "ru" ? "Неверно" : "Սխալ է" }]
      : ["1", "2", "3", "4"].map((value, i) => ({ value, label: entry.item.options?.[i] ?? value }))
    : null;

  return <section className="space-y-4 rounded-3xl border bg-card p-4 shadow-sm sm:p-6">
    <div className="flex flex-wrap justify-between gap-2 text-sm">
      <span className="font-bold text-primary">{labelSubject(entry.subject,lang)} · {entry.section}</span>
      <span className="text-muted-foreground">{entry.attempts} {t.attempts}</span>
    </div>
    {entry.kind === "unit"
      ? <UnitCard key={entry.key} unit={entry.item.unit} instruction={labelSubject(entry.subject,lang)}
          value={unitAnswer} onChange={value => { setUnitAnswer(value); setIncorrect(false); }}
          revealed={() => false}/>
      : <>
        {preview(entry)
          ? <div className="whitespace-pre-line font-semibold leading-relaxed">
              {entry.kind === "math" ? <MathContent text={preview(entry)}/> : preview(entry)}
            </div>
          : <p className="text-sm text-muted-foreground">{t.noText}</p>}
        {entry.kind === "level" && <div className="grid gap-2 sm:grid-cols-2">
          {entry.item.options.map((option, i) =>
            <button key={i} type="button" aria-pressed={selected === i}
              onClick={() => { setSelected(i); setIncorrect(false); }}
              className={`min-h-11 rounded-xl border p-3 text-left text-sm ${selected === i ? "border-primary bg-primary/10" : "hover:bg-muted"}`}>
              {String.fromCharCode(65 + i)}. {option}
            </button>)}
        </div>}
        {entry.kind === "math" && (mathChoices
          ? <div className="grid gap-2 sm:grid-cols-2">
              {mathChoices.map(option => <button key={option.value} type="button" aria-pressed={answer === option.value}
                onClick={() => { setAnswer(option.value); setIncorrect(false); }}
                className={`min-h-11 rounded-xl border p-3 text-left text-sm ${answer === option.value ? "border-primary bg-primary/10" : "hover:bg-muted"}`}>
                {option.value}. <MathContent text={option.label}/>
              </button>)}
            </div>
          : <input aria-label={t.type} placeholder={t.type} value={answer}
              onChange={e => { setAnswer(e.target.value); setIncorrect(false); }}
              className="min-h-11 w-full rounded-xl border bg-background px-3" />)}
      </>}
    {topic && <Link to="/english-grammar" search={{book:1,section:topic.sections.includes(2)?2:3,topic:topic.id}}
      className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-primary/20 px-3 text-sm text-primary">
      <BookOpenText className="size-4"/>{t.grammar}: {topic.title}
    </Link>}
    {entry.kind === "math" && <Link to="/math-handbook"
      search={{book:entry.item.book,chapter:entry.item.chapter,section:entry.item.section,topic:undefined}}
      className="flex min-h-11 items-center gap-2 text-sm font-semibold text-primary">
      <BookOpenText className="size-4"/>{t.math}
    </Link>}
    <button type="button" onClick={check}
      disabled={entry.kind === "level" ? selected === null : entry.kind === "math" ? !answer.trim() : !isAnswered(entry.item.unit, unitAnswer)}
      className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 font-semibold text-primary-foreground disabled:opacity-40">
      <CheckCircle2 className="size-4"/>{t.check}
    </button>
    {incorrect && <p role="status" className="text-sm font-semibold text-destructive">{t.wrong}</p>}
  </section>;
}

function MistakesPage() {
  const lang = useLang();
  const t = WORDS[lang];
  const [entries, setEntries] = useState<Entry[]>([]);
  const [subject, setSubject] = useState("all");
  const [status, setStatus] = useState<"pending" | "all" | "mastered">("pending");
  const [reviewing, setReviewing] = useState(false);
  const [position, setPosition] = useState(0);
  const [solvedMessage, setSolvedMessage] = useState(false);
  useEffect(() => {
    const refresh = () => setEntries(getAllEntries());
    refresh();
    const events = ["shtemarm:mistakes-changed", MATH_MISTAKES_CHANGED, UNIT_MISTAKES_CHANGED, "storage"];
    events.forEach(event => window.addEventListener(event, refresh));
    return () => events.forEach(event => window.removeEventListener(event, refresh));
  }, []);

  const subjects = useMemo(() => [...new Set(entries.map(entry => entry.subject))].sort(), [entries]);
  const inSubject = useMemo(() => entries.filter(entry => subject === "all" || entry.subject === subject), [entries, subject]);
  const pending = useMemo(() => inSubject.filter(entry => !entry.mastered), [inSubject]);
  const visible = useMemo(() => inSubject.filter(entry => status === "all" ||
    (status === "mastered" ? entry.mastered : !entry.mastered)), [inSubject, status]);
  const current = pending.length ? pending[position % pending.length] : undefined;
  const totalPending = entries.filter(entry => !entry.mastered).length;
  const totalMastered = entries.length - totalPending;

  return <main className="mx-auto max-w-4xl space-y-5 pb-24">
    <Link to="/study-tools" className="inline-flex min-h-11 items-center gap-2 text-sm text-primary"><ArrowLeft className="size-4"/>{lang === "hy" ? "Ուսումնական կենտրոն" : lang === "en" ? "Learning center" : "Учебный центр"}</Link>
    <header className="space-y-4 rounded-3xl border bg-card p-5 sm:p-7">
      <div className="flex items-center gap-3"><span className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary"><ListChecks className="size-6"/></span><h1 className="text-2xl font-black sm:text-3xl">{t.title}</h1></div>
      <p className="text-sm leading-relaxed text-muted-foreground">{t.subtitle}</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-muted/50 p-3"><span className="block text-xs text-muted-foreground">{t.pending}</span><strong className="text-2xl tabular-nums">{totalPending}</strong></div>
        <div className="rounded-xl bg-muted/50 p-3"><span className="block text-xs text-muted-foreground">{t.mastered}</span><strong className="text-2xl tabular-nums">{totalMastered}</strong></div>
      </div>
    </header>
    <label className="flex flex-wrap items-center gap-3 text-sm font-semibold">{t.subject}
      <select value={subject} onChange={e => { setSubject(e.target.value); setPosition(0); setSolvedMessage(false); }}
        className="min-h-11 min-w-48 rounded-xl border bg-background px-3">
        <option value="all">{t.all}</option>
        {subjects.map(s => <option key={s} value={s}>{labelSubject(s,lang)}</option>)}
      </select>
    </label>
    {reviewing ? <>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border bg-card p-4">
        <div><p className="text-sm font-bold">{t.current}</p>
          <p className="text-xs text-muted-foreground">{pending.length} {t.pending.toLowerCase()}</p></div>
        <button type="button" className="min-h-11 rounded-xl border px-4 text-sm font-semibold"
          onClick={() => { setReviewing(false); setSolvedMessage(false); }}>{t.continue}</button>
      </div>
      {current ? <ReviewQuestion key={current.key} entry={current} onSolved={() => { setSolvedMessage(true); }}/>
        : <p role="status" className="rounded-2xl border bg-card p-6 font-semibold">{t.emptyQueue}</p>}
      {current && <div className="flex flex-wrap items-center gap-3">
        <button type="button" className="inline-flex min-h-11 items-center gap-2 rounded-xl border px-4 text-sm font-semibold"
          onClick={() => { setPosition(i => (i + 1) % pending.length); setSolvedMessage(false); }}>
          {t.next}<ChevronRight className="size-4"/>
        </button>
        {solvedMessage && <p role="status" className="text-sm font-semibold text-success">{t.solved}</p>}
      </div>}
    </> : <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-sm">{t.status}
          <select value={status} onChange={e => setStatus(e.target.value as typeof status)}
            className="min-h-11 rounded-xl border bg-background px-3">
            <option value="pending">{t.pending}</option><option value="mastered">{t.mastered}</option><option value="all">{t.allStatus}</option>
          </select>
        </label>
        <button type="button" disabled={pending.length === 0}
          onClick={() => { setPosition(0); setReviewing(true); setSolvedMessage(false); }}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground disabled:opacity-40">
          <RotateCcw className="size-4"/>{t.start}
        </button>
      </div>
      {visible.length === 0 && <p className="rounded-2xl border bg-card p-6 text-sm text-muted-foreground">{entries.length ? t.empty : t.noHistory}</p>}
      <div className="space-y-3">
        {visible.map(entry => <article key={entry.key} className="space-y-2 rounded-2xl border bg-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <span className="font-bold text-primary">{labelSubject(entry.subject,lang)} · {entry.section}</span>
            <span className={entry.mastered ? "text-success" : "text-muted-foreground"}>
              {entry.mastered ? t.mastered : t.pending} · {entry.attempts} {t.attempts}
            </span>
          </div>
          <p className="line-clamp-3 whitespace-pre-line text-sm font-medium">{preview(entry) || t.noText}</p>
          <div className="flex flex-wrap items-center justify-between gap-2">
            {!entry.mastered && <button type="button" className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-primary/30 px-3 text-sm font-semibold text-primary"
              onClick={() => { setPosition(pending.findIndex(p => p.key === entry.key)); setReviewing(true); setSolvedMessage(false); }}>
              {t.retry}<ChevronRight className="size-4"/>
            </button>}
            <button type="button" className="ml-auto inline-flex min-h-10 items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive"
              onClick={() => { if (window.confirm(t.removeConfirm)) removeEntry(entry); }}>
              <Trash2 className="size-4"/>{t.remove}
            </button>
          </div>
        </article>)}
      </div>
    </>}
    <p className="text-xs leading-relaxed text-muted-foreground">{t.local}</p>
  </main>;
}
