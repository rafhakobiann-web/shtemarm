import { useEffect, useMemo, useState } from "react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { ArrowLeft, BookOpenText, Search, CheckCircle2, AlertTriangle, GraduationCap, Calculator, ExternalLink } from "lucide-react";
import {
  MATH_HANDBOOK_SECTIONS, MATH_HANDBOOK_TOPICS, findMathSection,
  findMathTopic, mathTopicsForSection, mathBookUrl, mathGameUrl, categoriesForMathSection,
} from "@/lib/mathHandbook";
import type { MathLocale, MathCategory, MathTopic, MathText } from "@/lib/mathHandbookTypes";
import type { MathHandbookSection } from "@/lib/mathHandbookSections";
import { MathContent } from "@/components/MathText";
import { useLang } from "@/lib/lang";
import { getMathMistakes, MATH_MISTAKES_CHANGED } from "@/lib/mathMistakes";

const schema = z.object({
  book: z.enum(["matem-1", "matem-2"]).catch("matem-1"),
  chapter: z.coerce.number().int().min(1).max(3).catch(1),
  section: z.coerce.number().int().min(1).max(10).catch(1),
  topic: z.string().optional().catch(undefined),
});
export const Route = createFileRoute("/math-handbook")({
  staticData: { sitemap: true },
  validateSearch: schema,
  head: () => ({ meta: [
      { property: "og:title", content: "Մաթեմատիկայի կանոնների և բանաձևերի ձեռնարկ · Shtemarm" },
      { property: "og:description", content: "Մաթեմատիկայի երկու շտեմարանի բաժինների կանոնները՝ հայերեն, անգլերեն և ռուսերեն։ Քայլ առ քայլ լուծումներ՝ առանց AI-ի։" },
    { title: "Մաթեմատիկայի կանոնների և բանաձևերի ձեռնարկ · Shtemarm" },
    { name: "description", content: "Մաթեմատիկայի երկու շտեմարանի բաժինների կանոնները՝ հայերեն, անգլերեն և ռուսերեն։ Քայլ առ քայլ լուծումներ՝ առանց AI-ի։" }
  ] }),
  component: MathHandbookPage,
});

const LABELS = {
  hy: {
    home:"Գլխավոր էջ", title:"Մաթեմատիկայի ուսումնական ձեռնարկ", subtitle:"2 շտեմարան · բանաձևեր և քայլ առ քայլ լուծումներ",
    chooseBook:"Շտեմարան", part:"Մաս", chapter:"Գլուխ", section:"Բաժին", pages:"Էջեր", tasks:"Առաջադրանք", search:"Փնտրել թեմա կամ բանաձև…",
    all:"Բոլոր թեմաները", formula:"Բանաձև", problem:"Լուծված օրինակ", steps:"Լուծման քայլերը", result:"Պատասխան", mistake:"Տարածված սխալ",
    goBook:"Բացել բաժնի բոլոր առաջադրանքները", practice:"Լուծել խաղային ռեժիմով", test:"Անցնել բաժնի թեստը",
    tip:"Թեմաները կապված են բաժնի բովանդակության հետ։ Օրինակները ձեռնարկի հեղինակային օրինակներ են, ոչ թե բնօրինակ շտեմարանի յուրաքանչյուր հարցի անհատական լուծումներ։",
    notFound:"Համապատասխան թեմա չգտնվեց։ Փորձիր այլ որոնում։", topics:"Կանոններ և մեթոդներ", review:"Սխալների տետր",
  },
  en: {
    home:"Home", title:"Mathematics learning handbook", subtitle:"2 question books · formulas and worked examples",
    chooseBook:"Question book", part:"Part", chapter:"Chapter", section:"Section", pages:"Pages", tasks:"Tasks", search:"Search topic or formula…",
    all:"All topics", formula:"Formula", problem:"Worked example", steps:"Solution steps", result:"Answer", mistake:"Common mistake",
    goBook:"Open this section's exercises", practice:"Practise in game mode", test:"Take a section test",
    tip:"Topics are related to each section. Worked examples are original teaching examples, not individual solutions to every source question.",
    notFound:"No matching lesson. Try another search.", topics:"Rules and methods", review:"Mistake notebook",
  },
  ru: {
    home:"Главная", title:"Справочник по математике", subtitle:"2 сборника · формулы и решения по шагам",
    chooseBook:"Сборник", part:"Часть", chapter:"Глава", section:"Раздел", pages:"Страницы", tasks:"Задания", search:"Поиск темы или формулы…",
    all:"Все темы", formula:"Формула", problem:"Разобранный пример", steps:"Шаги решения", result:"Ответ", mistake:"Типичная ошибка",
    goBook:"Открыть задания раздела", practice:"Практика в игровом режиме", test:"Пройти тест раздела",
    tip:"Темы привязаны к разделам. Разобранные примеры — авторские учебные задачи, а не решения каждого задания сборника.",
    notFound:"Тема не найдена. Попробуйте другой запрос.", topics:"Правила и методы", review:"Тетрадь ошибок",
  },
} as const;
const CATEGORIES: Record<MathCategory, MathText> = {
  arithmetic:{hy:"Թվաբանություն",en:"Arithmetic",ru:"Арифметика"},
  expressions:{hy:"Արտահայտություններ",en:"Expressions",ru:"Выражения"},
  equations:{hy:"Հավասարումներ",en:"Equations",ru:"Уравнения"},
  inequalities:{hy:"Անհավասարումներ",en:"Inequalities",ru:"Неравенства"},
  "word-problems":{hy:"Տեքստային խնդիրներ",en:"Word problems",ru:"Текстовые задачи"},
  sequences:{hy:"Պրոգրեսիաներ",en:"Progressions",ru:"Прогрессии"},
  functions:{hy:"Ֆունկցիաներ",en:"Functions",ru:"Функции"},
  "plane-geometry":{hy:"Հարթաչափություն",en:"Plane geometry",ru:"Планиметрия"},
  "solid-geometry":{hy:"Տարածաչափություն",en:"Solid geometry",ru:"Стереометрия"},
  coordinates:{hy:"Կոորդինատներ և վեկտորներ",en:"Coordinates and vectors",ru:"Координаты и векторы"},
  combinatorics:{hy:"Միացություններ",en:"Combinatorics",ru:"Комбинаторика"},
};
function sectionTitle(section:MathHandbookSection,lang:MathLocale) {
  if (lang==="hy") return section.title;
  const categories=categoriesForMathSection(section.title);
  return categories.length ? categories.map(cat=>CATEGORIES[cat][lang]).join(" & ") : section.title;
}

function MathTopicCard({topic,lang,selected}:{topic:MathTopic;lang:MathLocale;selected:boolean}) {
  const t=LABELS[lang];
  return <details id={`math-topic-${topic.id}`} key={topic.id} open={selected ? true : undefined}
    className="group scroll-mt-28 overflow-hidden rounded-2xl border bg-card shadow-sm open:border-primary/35">
    <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 focus-visible:outline-2 focus-visible:outline-primary sm:px-5">
      <div className="min-w-0"><span className="text-xs font-bold text-primary">{CATEGORIES[topic.category][lang]}</span>
        <h3 className="mt-1 font-bold leading-relaxed">{topic.title[lang]}</h3>
      </div><span aria-hidden className="text-primary group-open:rotate-180">⌄</span>
    </summary>
    <div className="space-y-4 border-t px-4 py-4 sm:px-5">
      <p className="leading-relaxed"><MathContent text={topic.summary[lang]}/></p>
      <section className="space-y-2 rounded-xl bg-muted/60 p-3">
        <h4 className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{t.formula}</h4>
        <div className="overflow-x-auto text-base font-semibold"><MathContent text={topic.formula}/></div>
      </section>
      <section className="space-y-3 rounded-xl border border-primary/20 bg-primary/5 p-4">
        <h4 className="flex items-center gap-2 text-sm font-bold"><Calculator className="size-4 text-primary"/>{t.problem}</h4>
        <p className="font-semibold"><MathContent text={topic.problem[lang]}/></p>
        <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{t.steps}</p>
        <ol className="list-decimal space-y-2 pl-5 text-sm leading-relaxed">
          {topic.steps[lang].map((step,i)=><li key={i}><MathContent text={step}/></li>)}
        </ol>
        <p className="rounded-lg bg-card px-3 py-2 font-bold"><span className="mr-2 text-xs text-muted-foreground">{t.result}:</span><MathContent text={topic.answer}/></p>
      </section>
      <div className="flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3 text-sm leading-relaxed">
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600"/><p><strong>{t.mistake}:</strong> <MathContent text={topic.mistake[lang]}/></p>
      </div>
    </div>
  </details>;
}

function MathHandbookPage() {
  const lang=useLang();
  const t=LABELS[lang];
  const {book,chapter,section,topic:topicId}=Route.useSearch();
  const [query,setQuery]=useState("");
  const [showAll,setShowAll]=useState(false);
  const [pendingCount,setPendingCount]=useState(0);
  useEffect(()=>{
    const refresh=()=>setPendingCount(getMathMistakes().filter(m=>!m.mastered).length);
    refresh();
    window.addEventListener(MATH_MISTAKES_CHANGED,refresh);
    return ()=>window.removeEventListener(MATH_MISTAKES_CHANGED,refresh);
  },[]);
  const sections=MATH_HANDBOOK_SECTIONS.filter(s=>s.book===book);
  const grouped=useMemo(()=>{
    const groups=new Map<number,MathHandbookSection[]>();
    for(const s of sections) groups.set(s.chapter,[...(groups.get(s.chapter)??[]),s]);
    return [...groups];
  },[sections]);
  const current=findMathSection(book,chapter,section)??sections[0];
  const selected=topicId?findMathTopic(topicId):undefined;
  const lessons=useMemo(()=>{
    const base=showAll||query.trim()?MATH_HANDBOOK_TOPICS:mathTopicsForSection(current);
    const withSelected=selected&&!base.some(x=>x.id===selected.id)?[selected,...base]:base;
    const q=query.trim().toLocaleLowerCase();
    return !q?withSelected:withSelected.filter(x=>
      [x.id,x.title[lang],x.title.en,x.title.hy,x.formula,x.summary[lang],x.mistake[lang]]
        .some(v=>v.toLocaleLowerCase().includes(q)));
  },[showAll,query,current,selected,lang]);
  return <main className="mx-auto max-w-6xl space-y-6 pb-28">
    <Link to="/" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground">
      <ArrowLeft className="size-4"/>{t.home}
    </Link>
    <header className="space-y-3 rounded-3xl border border-primary/20 bg-card p-5 shadow-card sm:p-7">
      <div className="flex items-center gap-3">
        <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary"><BookOpenText className="size-6"/></span>
        <div><h1 className="text-2xl font-black sm:text-3xl">{t.title}</h1><p className="text-sm text-muted-foreground">{t.subtitle}</p></div>
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">{t.tip}</p>
      <Link to="/math-review" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-bold text-primary hover:bg-primary/10">
        <CheckCircle2 className="size-4"/>{t.review}{pendingCount>0?` · ${pendingCount}`:""}
      </Link>
    </header>
    <div className="grid gap-4 md:grid-cols-[18rem_minmax(0,1fr)] md:items-start">
      <aside className="space-y-4 rounded-3xl border bg-card p-4 md:sticky md:top-24">
        <h2 className="text-sm font-bold">{t.chooseBook}</h2>
        <div className="grid grid-cols-2 gap-2">
          {(["matem-1","matem-2"] as const).map(id=><Link key={id} to="/math-handbook"
            search={{book:id,chapter:1,section:1,topic:undefined}} aria-current={book===id?"page":undefined}
            className={`grid min-h-11 place-items-center rounded-xl border px-3 text-sm font-bold ${book===id?"border-primary bg-primary text-primary-foreground":"hover:border-primary/40"}`}>
            {t.part} {id.endsWith("1")?"1":"2"}
          </Link>)}
        </div>
        <nav aria-label={t.section} className="max-h-[24rem] space-y-3 overflow-y-auto pr-1">
          {grouped.map(([num,items])=><div key={num} className="space-y-1">
            <p className="px-2 text-xs font-black uppercase tracking-wide text-muted-foreground">{t.chapter} {num}</p>
            {items.map(item=><Link key={item.chapter+"-"+item.section} to="/math-handbook"
              search={{book,chapter:item.chapter,section:item.section,topic:undefined}}
              aria-current={item.chapter===current.chapter&&item.section===current.section?"page":undefined}
              className={`flex min-h-11 items-start gap-2 rounded-xl px-3 py-2 text-left text-sm transition-colors ${item.chapter===current.chapter&&item.section===current.section?"bg-primary/10 font-bold text-primary":"hover:bg-muted"}`}>
                <span className="shrink-0 font-bold tabular-nums">{item.section}.</span><span>{sectionTitle(item,lang)}</span>
            </Link>)}
          </div>)}
        </nav>
      </aside>
      <div className="min-w-0 space-y-5">
        <section className="space-y-4 rounded-3xl border bg-card p-5">
          <div>
            <p className="text-xs font-bold text-primary">{t.part} {book.endsWith("1")?"1":"2"} · {t.chapter} {current.chapter} · {t.section} {current.section}</p>
            <h2 className="mt-1 text-xl font-black leading-snug">{sectionTitle(current,lang)}</h2>
            <p className="mt-2 text-xs text-muted-foreground">{t.pages}: {current.pages[0]}–{current.pages[1]} · {t.tasks}: {current.tasks}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href={mathBookUrl(current)} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:bg-primary/90">
              <BookOpenText className="size-4"/>{t.goBook}
            </a>
            <a href={mathGameUrl(current)} className="inline-flex min-h-11 items-center gap-2 rounded-xl border px-3 text-sm font-semibold hover:bg-muted">
              <GraduationCap className="size-4"/>{t.practice}
            </a>
            <a href={mathGameUrl(current,"test")} className="inline-flex min-h-11 items-center gap-2 rounded-xl border px-3 text-sm font-semibold hover:bg-muted">
              <ExternalLink className="size-4"/>{t.test}
            </a>
          </div>
        </section>
        <section className="space-y-3" aria-label={t.topics}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-black">{t.topics} · {lessons.length}</h2>
            <label className="flex min-h-11 cursor-pointer items-center gap-2 text-sm">
              <input type="checkbox" checked={showAll} onChange={e=>setShowAll(e.target.checked)} className="size-4 accent-primary"/>{t.all}
            </label>
          </div>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-3.5 size-4 text-muted-foreground"/>
            <input type="search" value={query} onChange={e=>setQuery(e.target.value)} placeholder={t.search}
              aria-label={t.search} className="min-h-11 w-full rounded-xl border bg-card py-2 pl-10 pr-3 text-sm focus-visible:outline-2 focus-visible:outline-primary"/>
          </div>
          {lessons.length?lessons.map(item=><MathTopicCard key={item.id} topic={item} lang={lang} selected={topicId===item.id}/>):
            <p role="status" className="rounded-xl border bg-card p-5 text-sm text-muted-foreground">{t.notFound}</p>}
        </section>
      </div>
    </div>
  </main>;
}
