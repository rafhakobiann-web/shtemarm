import { useMemo, useState } from "react";
import { z } from "zod";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, BookOpenCheck, Search, Calculator, LibraryBig, Languages, ChevronRight } from "lucide-react";
import { MathSourceSolutions } from "@/components/MathSourceSolutions";
import { useLang } from "@/lib/lang";
import { MATH_HANDBOOK_TOPICS } from "@/lib/mathHandbook";
import type { MathCategory } from "@/lib/mathHandbookTypes";
import { getSectionGuide, getSectionTopics } from "@/lib/grammarHandbook";
import { MathDiagram } from "@/components/MathDiagram";
import { diagramForWorkedExample } from "@/lib/math-worked-diagrams";
import { MathContent } from "@/components/MathText";

const navigationSchema = z.object({
  view: z.enum(["math", "source", "english"]).optional(),
  book: z.enum(["matem-1", "matem-2"]).optional(),
  chapter: z.coerce.number().int().min(1).max(3).optional(),
  section: z.coerce.number().int().min(1).max(13).optional(),
  englishBook: z.coerce.number().int().min(1).max(3).optional(),
});
export const Route = createFileRoute("/solutions")({
  staticData: { sitemap: true },
  validateSearch: navigationSchema,
  head: () => ({ meta: [
    { title: "Լուծումների գրադարան · Shtemarm" },
    { name: "description", content: "Մաթեմատիկայի լուծված օրինակներ՝ քայլերով և գծագրերով, անգլերենի կանոններ՝ նախքան վարժությունները։" },
  ] }),
  component: SolutionsPage,
});

const CATEGORIES: readonly { id: MathCategory; hy: string; en: string; ru: string }[] = [
  { id: "arithmetic", hy: "Թվաբանություն", en: "Arithmetic", ru: "Арифметика" },
  { id: "expressions", hy: "Արտահայտություններ", en: "Expressions", ru: "Выражения" },
  { id: "equations", hy: "Հավասարումներ", en: "Equations", ru: "Уравнения" },
  { id: "inequalities", hy: "Անհավասարումներ", en: "Inequalities", ru: "Неравенства" },
  { id: "word-problems", hy: "Տեքստային խնդիրներ", en: "Word problems", ru: "Текстовые задачи" },
  { id: "sequences", hy: "Պրոգրեսիաներ", en: "Sequences", ru: "Последовательности" },
  { id: "functions", hy: "Ֆունկցիաներ", en: "Functions", ru: "Функции" },
  { id: "plane-geometry", hy: "Հարթաչափություն", en: "Plane geometry", ru: "Планиметрия" },
  { id: "solid-geometry", hy: "Տարածաչափություն", en: "Solid geometry", ru: "Стереометрия" },
  { id: "coordinates", hy: "Վեկտորներ և կոորդինատներ", en: "Vectors and coordinates", ru: "Векторы и координаты" },
  { id: "combinatorics", hy: "Կոմբինատորիկա", en: "Combinatorics", ru: "Комбинаторика" },
];
const COPY = {
  hy: { back:"Գլխավոր էջ",title:"Լուծումների գրադարան",lead:"Նախ սովորիր լուծման մեթոդը, հետո փորձիր առաջադրանքները։",
    math:"Մաթեմատիկայի լուծված օրինակներ",source:"Շտեմարանի հարցերի լուծումներ",english:"Անգլերենի կանոններ",search:"Փնտրել թեմա…",all:"Բոլոր թեմաները",
    worked:"Լուծված օրինակ",steps:"Լուծման քայլերը",answer:"Պատասխան",pitfall:"Ուշադրություն",
    more:"Բացել ամբողջական ձեռնարկը",practice:"Անցնել շտեմարաններին",noResults:"Նման թեմա չգտնվեց։",
    disclaimer:"Այս էջում ներկայացված են ձեռնարկի ուսուցողական օրինակները։ Դրանք դեռ բոլոր տպագիր առաջադրանքների անհատական լուծումները չեն․ գծագրերը վերաբերում են միայն նշված օրինակներին։",
    englishNote:"Ստորև թեմաները կապված են բաժնի ուսուցման նպատակների հետ։ Ոչ բոլոր առանձին առաջադրանքների համար է կանոնը միարժեք որոշված։",
    pattern:"Կառուցվածք",correct:"Ճիշտ օրինակ",wrong:"Տիպիկ սխալ",why:"Բացատրություն",section:"Բաժին",seeRules:"Բացել բաժնի կանոնները",start:"Սկսել վարժությունները" },
  en: { back:"Home",title:"Solutions library",lead:"Study a method first. Then practise on your own.",
    math:"Math worked examples",source:"Workbook question solutions",english:"English rules",search:"Find a topic…",all:"All topics",
    worked:"Worked example",steps:"Solution steps",answer:"Answer",pitfall:"Watch out",
    more:"Open the complete handbook",practice:"Open the workbooks",noResults:"No matching topics.",
    disclaimer:"These are curated handbook examples, not individual solutions to every printed question. Diagrams illustrate only the stated examples.",
    englishNote:"Topics are associated with each section's learning goals; they are not verified one-to-one rules for every question.",
    pattern:"Pattern",correct:"Correct example",wrong:"Common mistake",why:"Explanation",section:"Section",seeRules:"Open section rules",start:"Practise this section" },
  ru: { back:"Главная",title:"Библиотека решений",lead:"Сначала изучи метод, затем решай самостоятельно.",
    math:"Решённые примеры по математике",source:"Решения задач сборника",english:"Правила английского",search:"Поиск темы…",all:"Все темы",
    worked:"Разобранный пример",steps:"Шаги решения",answer:"Ответ",pitfall:"Обрати внимание",
    more:"Открыть полный справочник",practice:"Перейти к сборникам",noResults:"Таких тем нет.",
    disclaimer:"Здесь собраны учебные примеры из справочника, а не решения каждого печатного задания. Чертежи относятся только к указанным примерам.",
    englishNote:"Темы соответствуют целям разделов; это не подтверждённые правила к каждому вопросу по отдельности.",
    pattern:"Структура",correct:"Правильный пример",wrong:"Типичная ошибка",why:"Объяснение",section:"Раздел",seeRules:"Открыть правила",start:"Практика раздела" },
} as const;


const HUB_COPY = {
  hy: {
    home:"Ընդհանուր", intro:"Ընտրիր՝ ինչ ես ուզում անել", introNote:"Մի էջում միաժամանակ չենք ցուցադրում բոլոր կանոնները, օրինակներն ու հարցերը։ Յուրաքանչյուր ուղղություն ունի իր առանձին միջավայրը։",
    examples:"Սովորել օրինակներով", examplesDesc:"Մաթեմատիկայի բանաձևեր, լուծման քայլեր և համապատասխան գծագրեր։",
    source:"Դիտել շտեմարանի լուծումները", sourceDesc:"Ընտրիր իրական առաջադրանքը, բացիր պատասխանը և անհրաժեշտության դեպքում՝ բացատրությունը։",
    rules:"Սովորել անգլերենի կանոնները", rulesDesc:"Ընտրիր բաժինը, սովորիր կանոնը և հետո անցիր վարժություններին։",
    open:"Բացել բաժինը", next:"Հետո կարող ես ինքնուրույն լուծել",
    mathPractice:"Մաթեմատիկայի շտեմարաններ", englishPractice:"Անգլերենի առաջադրանքներ",
    book:"Գիրք", moreTopics:"Ցույց տալ հաջորդ թեմաները", showing:"Ցուցադրված",
    library:"Սովորելու ուղղություններ", shared:"Կանոնները բաժինների ուղեցույցներ են, ոչ յուրաքանչյուր հարցի ստուգված անհատական լուծում։",
  },
  en: {
    home:"Overview", intro:"Choose what you want to do", introNote:"Rules, examples and questions are kept separate. Each path has its own focused workspace.",
    examples:"Learn with worked examples", examplesDesc:"Math methods, clear steps and diagrams matched to each example.",
    source:"Browse workbook solutions", sourceDesc:"Choose a real task, reveal its key and request an explanation when needed.",
    rules:"Study English rules", rulesDesc:"Pick a section, learn the rule, then practise.",
    open:"Open workspace", next:"Ready to practise independently?",
    mathPractice:"Math workbooks", englishPractice:"English questions",
    book:"Book", moreTopics:"Show more topics", showing:"Showing",
    library:"Learning paths", shared:"Section guides are not verified individual solutions for every question.",
  },
  ru: {
    home:"Обзор", intro:"Выбери, что хочешь сделать", introNote:"Правила, примеры и задачи не смешиваются на одном экране: у каждого режима своё пространство.",
    examples:"Разобрать примеры", examplesDesc:"Математические методы, шаги решений и подходящие чертежи.",
    source:"Решения из сборника", sourceDesc:"Найди задачу, открой ключ и при необходимости объяснение.",
    rules:"Выучить правила английского", rulesDesc:"Выбери раздел, изучи правило, затем решай самостоятельно.",
    open:"Открыть раздел", next:"Теперь можно решать самостоятельно",
    mathPractice:"Сборники математики", englishPractice:"Задания английского",
    book:"Книга", moreTopics:"Показать ещё темы", showing:"Показано",
    library:"Направления обучения", shared:"Рекомендованные правила не являются проверенным решением к каждому заданию.",
  },
} as const;

function SolutionsPage() {
  const lang = useLang();
  const t = COPY[lang];
  const { view, book: sourceBook, chapter: sourceChapter, section: linkedSection, englishBook: linkedEnglishBook } = Route.useSearch();
  const subject = view ?? "home";
  const hub = HUB_COPY[lang];
  const [category, setCategory] = useState<MathCategory | "all">("all");
  const [section, setSection] = useState(linkedSection ?? 3);
  const [englishBook, setEnglishBook] = useState(linkedEnglishBook ?? 1);
  const [visibleLimit, setVisibleLimit] = useState(8);
  const [query, setQuery] = useState("");
  const q=query.trim().toLocaleLowerCase();
  const mathTopics = useMemo(() => MATH_HANDBOOK_TOPICS.filter(topic =>
    (category === "all" || category === topic.category) &&
    (!q || [topic.title[lang],topic.title.en,topic.title.hy,topic.summary[lang],topic.problem[lang],topic.id].some(text=>text.toLocaleLowerCase().includes(q)))
  ), [category,lang,q]);
  const englishTopics = useMemo(() => getSectionTopics(section).filter(topic =>
    !q || [topic.title,topic.formula,topic.content[lang].summary,topic.id].some(text=>text.toLocaleLowerCase().includes(q))
  ),[section,lang,q]);
  const visibleMathTopics=mathTopics.slice(0,visibleLimit);
  const visibleEnglishTopics=englishTopics.slice(0,visibleLimit);
  const sectionGuide = getSectionGuide(section);

  return <main className="sht-solutions mx-auto max-w-6xl space-y-6 pb-28">
    <Link to="/explore" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" />{t.back}</Link>
    <header className="sht-solutions-header rounded-2xl border bg-card p-5 sm:p-8">
      <div className="flex items-center gap-3"><BookOpenCheck className="size-7 text-primary" aria-hidden="true" />
        <h1 className="text-2xl font-black tracking-tight sm:text-4xl">{t.title}</h1></div>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">{t.lead}</p>
      <nav aria-label={hub.library} className="sht-solutions-tabs mt-6 flex flex-wrap gap-2">
        <Link to="/solutions" search={{view:undefined}} aria-current={subject==="home"?"page":undefined}
          className="inline-flex min-h-11 items-center rounded-lg border px-4 py-2 text-sm font-bold">{hub.home}</Link>
        {(["math","source","english"] as const).map(key=><Link key={key} to="/solutions" search={{view:key}}
          aria-current={subject===key?"page":undefined}
          className="inline-flex min-h-11 items-center rounded-lg border px-4 py-2 text-sm font-bold">
          {key==="math"?t.math:key==="source"?t.source:t.english}</Link>)}
      </nav>
    </header>
    {subject==="home" ? <section className="space-y-5" aria-labelledby="sht-learning-paths-title">
      <div>
        <h2 id="sht-learning-paths-title" className="text-balance text-xl font-black tracking-tight sm:text-2xl">{hub.intro}</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">{hub.introNote}</p>
      </div>
      <div className="sht-solutions-overview grid gap-3 md:grid-cols-3">
        {([
          {view:"math" as const,title:hub.examples,detail:hub.examplesDesc,Icon:Calculator,number:"01"},
          {view:"source" as const,title:hub.source,detail:hub.sourceDesc,Icon:LibraryBig,number:"02"},
          {view:"english" as const,title:hub.rules,detail:hub.rulesDesc,Icon:Languages,number:"03"},
        ]).map(item=><Link key={item.view} to="/solutions" search={{view:item.view}}
          className="sht-solutions-overview-card group flex min-h-56 flex-col justify-between rounded-xl border bg-card p-5 focus-visible:outline-2 focus-visible:outline-primary">
          <div>
            <div className="mb-5 flex items-center justify-between gap-2">
              <item.Icon aria-hidden="true" className="size-6 text-primary"/>
              <span className="font-mono text-xs text-muted-foreground">{item.number}</span>
            </div>
            <h3 className="text-balance text-lg font-extrabold tracking-tight">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.detail}</p>
          </div>
          <span className="mt-5 inline-flex items-center gap-1 text-sm font-bold text-primary">{hub.open}<ChevronRight className="size-4" aria-hidden="true"/></span>
        </Link>)}
      </div>
      <div className="sht-solutions-practice rounded-xl border bg-card p-5">
        <h2 className="text-base font-bold">{hub.next}</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {mathTopics.length>visibleLimit && <button type="button" onClick={()=>setVisibleLimit(n=>n+8)}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-lg border px-4 py-2 text-sm font-bold hover:bg-muted">
            {hub.moreTopics} ({visibleMathTopics.length}/{mathTopics.length})
          </button>}
          <Link to="/math/books" className="inline-flex min-h-11 items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-muted">{hub.mathPractice}<ArrowRight className="size-4"/></Link>
          <Link to="/book/$bookId" params={{bookId:"1"}} className="inline-flex min-h-11 items-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-muted">{hub.englishPractice}<ArrowRight className="size-4"/></Link>
        </div>
      </div>
    </section> : subject==="source" ? <MathSourceSolutions initialBookId={sourceBook} initialChapter={sourceChapter} initialSection={linkedSection}/> : <>
    <p className="sht-solutions-note rounded-lg border bg-muted/30 p-4 text-sm leading-relaxed text-muted-foreground" role="note">{subject==="math"?t.disclaimer:t.englishNote}</p>
    <div className="grid gap-4 lg:grid-cols-[15rem_minmax(0,1fr)] lg:items-start">
      <aside className="space-y-4 rounded-xl border bg-card p-4 lg:sticky lg:top-24">
        <label htmlFor="solutions-search" className="text-sm font-bold">{t.search}</label>
        <div className="relative">
          <Search className="absolute left-3 top-3.5 size-4 text-muted-foreground" aria-hidden="true" />
          <input id="solutions-search" type="search" value={query} onChange={e=>{setQuery(e.target.value);setVisibleLimit(8);}}
            placeholder={t.search} className="min-h-11 w-full rounded-lg border bg-background pl-9 pr-3 text-sm focus-visible:outline-2 focus-visible:outline-primary"/>
        </div>
        {subject==="math" ? <div className="space-y-2">
          <label htmlFor="solutions-category" className="text-sm font-bold">{hub.library}</label>
          <select id="solutions-category" value={category}
            onChange={e=>{setCategory(e.target.value as MathCategory | "all");setVisibleLimit(8);}}
            className="min-h-11 w-full rounded-lg border bg-background px-3 py-2 lg:hidden">
            <option value="all">{t.all}</option>
            {CATEGORIES.map(c=><option value={c.id} key={c.id}>{c[lang]}</option>)}
          </select>
          <nav aria-label={t.all} className="hidden max-h-96 gap-1 overflow-y-auto lg:grid">
            <button type="button" aria-pressed={category==="all"} onClick={()=>{setCategory("all");setVisibleLimit(8);}} className="sht-solutions-filter">{t.all}</button>
            {CATEGORIES.map(c=><button type="button" key={c.id} aria-pressed={category===c.id}
              onClick={()=>{setCategory(c.id);setVisibleLimit(8);}} className="sht-solutions-filter">{c[lang]}</button>)}
          </nav>
        </div> : <div className="space-y-3">
          <label className="grid gap-1 text-sm font-bold">{hub.book}
            <select value={englishBook} onChange={e=>setEnglishBook(Number(e.target.value))}
              className="min-h-11 w-full rounded-lg border bg-background px-3">
              {[1,2,3].map(n=><option key={n} value={n}>{hub.book} {n}</option>)}
            </select>
          </label>
          <label htmlFor="solution-section" className="block text-sm font-bold">{t.section}</label>
          <select id="solution-section" className="min-h-11 w-full rounded-lg border bg-background p-2"
            value={section} onChange={e=>{setSection(Number(e.target.value));setVisibleLimit(8);}}>
            {Array.from({length:13},(_,i)=>i+1).map(n=><option key={n} value={n}>{t.section} {n}</option>)}
          </select>
          <p className="text-sm leading-relaxed text-muted-foreground">{sectionGuide?.title[lang]}</p>
          <p className="border-t pt-3 text-xs leading-relaxed text-muted-foreground">{hub.shared}</p>
        </div>}
      </aside>
      <div className="min-w-0 space-y-4">
        {subject==="math" ? <>
          <h2 className="text-lg font-black">{t.math} · {mathTopics.length}</h2>
          {visibleMathTopics.map(topic=>{
            const diagram=diagramForWorkedExample(topic.id);
            return <details key={topic.id} id={`solution-${topic.id}`} className="sht-solutions-card group rounded-xl border bg-card">
              <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 font-bold focus-visible:outline-2 focus-visible:outline-primary">
                <span>{topic.title[lang]}</span><span aria-hidden="true" className="text-primary">⌄</span>
              </summary>
              <div className="space-y-4 border-t px-5 py-5">
                <p className="text-sm leading-relaxed">{topic.summary[lang]}</p>
                <div className="rounded-lg bg-muted/40 p-3"><MathContent text={topic.formula}/></div>
                <section aria-label={t.worked} className="space-y-3">
                  <h3 className="font-bold">{t.worked}</h3>
                  <p className="font-semibold"><MathContent text={topic.problem[lang]}/></p>
                  {diagram && <MathDiagram spec={diagram}/>}
                  <h4 className="text-sm font-bold">{t.steps}</h4>
                  <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed">{topic.steps[lang].map((line,i)=><li key={i}><MathContent text={line}/></li>)}</ol>
                  <p className="rounded-lg border px-3 py-2"><strong>{t.answer}: </strong><MathContent text={topic.answer}/></p>
                </section>
                <p className="text-sm text-muted-foreground"><strong>{t.pitfall}: </strong>{topic.mistake[lang]}</p>
                <Link to="/math-handbook" search={{book:"matem-1",chapter:1,section:1,topic:topic.id}}
                  className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-primary">{t.more}<ArrowRight className="size-4"/></Link>
              </div>
            </details>;
          })}
          <Link to="/math/books" className="inline-flex min-h-11 items-center gap-2 rounded-lg border px-4 font-bold">{t.practice}<ArrowRight className="size-4"/></Link>
          {!mathTopics.length && <p role="status" className="p-6 text-muted-foreground">{t.noResults}</p>}
        </> : <>
          <h2 className="text-lg font-black">{sectionGuide?.title[lang]} · {englishTopics.length}</h2>
          {visibleEnglishTopics.map(topic=>{
            const info=topic.content[lang];
            return <details key={topic.id} className="sht-solutions-card rounded-xl border bg-card">
              <summary className="min-h-16 cursor-pointer list-none px-5 py-4 font-bold focus-visible:outline-2 focus-visible:outline-primary">{topic.title} · {topic.level}</summary>
              <div className="space-y-3 border-t px-5 py-5 text-sm leading-relaxed">
                <p>{info.summary}</p><p><strong>{t.pattern}: </strong>{topic.formula}</p>
                <p><strong>{t.correct}: </strong>{topic.correct}</p>
                <p><strong>{t.wrong}: </strong>{topic.incorrect}</p>
                <p className="text-muted-foreground"><strong>{t.why}: </strong>{info.why}</p>
                <Link to="/english-grammar" search={{book:englishBook,section,topic:topic.id}}
                  className="inline-flex min-h-11 items-center gap-2 font-semibold text-primary">{t.seeRules}<ArrowRight className="size-4"/></Link>
              </div>
            </details>;
          })}
          {englishTopics.length>visibleLimit && <button type="button" onClick={()=>setVisibleLimit(n=>n+8)}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-lg border px-4 py-2 text-sm font-bold hover:bg-muted">
            {hub.moreTopics} ({visibleEnglishTopics.length}/{englishTopics.length})
          </button>}
          <Link to="/study/$bookId/$sectionId" params={{bookId:String(englishBook),sectionId:String(section)}} search={{mode:"classic"}}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border px-4 font-semibold">{t.start}<ArrowRight className="size-4"/></Link>
          {!englishTopics.length && <p role="status" className="p-6 text-muted-foreground">{t.noResults}</p>}
        </>}
      </div>
    </div>
    </>}
  </main>;
}
