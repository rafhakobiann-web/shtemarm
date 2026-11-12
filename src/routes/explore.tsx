import { createFileRoute, Link, useLocation } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRight, Atom, BookOpen, BookText, Brain, Calculator, CheckCircle2,
  Compass, Dna, FlaskConical, GraduationCap, Languages, LibraryBig, RotateCcw,
  Search, Sparkles, Trophy, UserRound, Wrench, X,
} from "lucide-react";
import { useLang } from "@/lib/lang";

export const Route = createFileRoute("/explore")({
  staticData: { sitemap: false },
  head: () => ({ meta: [
    { title: "Explore subjects, exams and study tools | Shtemarm" },
    { name: "description", content: "Find Shtemarm question books, practice exams and learning tools in one searchable place." },
  ] }),
  component: ExplorePage,
});

type Language = "hy" | "en" | "ru";
type Copy = Record<Language, string>;
type SubjectEntry =
  | { id: "english" | "math" | "armenian" | "history" | "biology"; kind: "dashboard"; title: Copy; detail: Copy; marker: string }
  | { id: "physics" | "chemistry" | "geography" | "russian"; kind: "other"; title: Copy; detail: Copy; marker: string };
const l = (hy: string, en: string, ru: string): Copy => ({ hy, en, ru });

export const EXPLORE_SUBJECTS: readonly SubjectEntry[] = [
  {id:"english",kind:"dashboard",title:l("Անգլերեն","English","Английский"),detail:l("3 շտեմարան և մակարդակի թեստեր","3 workbooks and level tests","3 сборника и тесты уровня"),marker:"EN"},
  {id:"math",kind:"dashboard",title:l("Մաթեմատիկա","Mathematics","Математика"),detail:l("2 շտեմարան, բանաձևեր և վարժանքներ","2 workbooks, formulas and practice","2 сборника, формулы и практика"),marker:"ƒx"},
  {id:"armenian",kind:"dashboard",title:l("Հայոց լեզու","Armenian language","Армянский язык"),detail:l("Շտեմարաններ, լեզու և գրականություն","Question banks, language and literature","Сборники, язык и литература"),marker:"Ա"},
  {id:"history",kind:"dashboard",title:l("Հայոց պատմություն","Armenian history","История Армении"),detail:l("Շտեմարաններ և պատմության թեստեր","Workbooks and history practice","Сборники и задания по истории"),marker:"Հ"},
  {id:"biology",kind:"dashboard",title:l("Կենսաբանություն","Biology","Биология"),detail:l("4 մաս և փորձնական թեստեր","4 volumes and practice tests","4 части и пробные тесты"),marker:"DNA"},
  {id:"physics",kind:"other",title:l("Ֆիզիկա","Physics","Физика"),detail:l("Խնդիրներ, շտեմարաններ և թեստեր","Problems, workbooks and practice","Задачи, сборники и тесты"),marker:"Φ"},
  {id:"chemistry",kind:"other",title:l("Քիմիա","Chemistry","Химия"),detail:l("Ուսումնական առաջադրանքներ","Starter practice questions","Учебные задания"),marker:"H₂O"},
  {id:"geography",kind:"other",title:l("Աշխարհագրություն","Geography","География"),detail:l("Ուսումնական առաջադրանքներ","Starter practice questions","Учебные задания"),marker:"🌍"},
  {id:"russian",kind:"other",title:l("Ռուսաց լեզու","Russian language","Русский язык"),detail:l("Ուսումնական առաջադրանքներ","Starter practice questions","Учебные задания"),marker:"РУ"},
];

const UI = {
  hy: {
    kicker:"Առարկաներ · քննություններ · գործիքներ",title:"Ընտրիր առարկա կամ քննություն",
    intro:"Որոնիր առարկաներ, քննություններ և ուսումնական գործիքներ՝ ըստ անվան։",
    back:"Վահանակ", search:"Որոնել առարկա կամ գործիք", clear:"Մաքրել որոնումը",
    all:"Բոլորը", subjects:"Առարկաներ", exams:"Քննություններ", tools:"Գործիքներ",
    subjectHeading:"Ընտրիր առարկան", subjectHint:"Սկզբում ընտրիր առարկան․ հաջորդ էջում՝ գիրքը կամ թեստը։",
    openSubject:"Բացել առարկան", noResults:"Ոչինչ չգտնվեց։ Փորձիր այլ բառ կամ մաքրիր որոնումը։",
    clearFilters:"Ցույց տալ բոլորը", examHeading:"Փորձնական քննություններ",
    examHint:"Սկսիր քննության ռեժիմը համապատասխան առարկայից։",
    toolsHeading:"Գործիքներ՝ երբ պետք են", toolsHint:"Բացատրություններ, կրկնություն և կանոններ՝ առանց լրացուցիչ էջերի խառնաշփոթի։",
    yourSpace:"Քո անձնական տարածքը", profile:"Իմ պրոֆիլը", profileHint:"Առաջընթաց, նպատակներ և նվաճումներ",
    results:"Գտնված արդյունքներ", examSearch:"Քննություն",
    priority:"Սկսելու ամենահեշտ ճանապարհը", step1:"1. Ընտրիր առարկան",step2:"2. Բացիր գիրքը",step3:"3. Պատասխանիր հարցերին",
  },
  en: {
    kicker:"Subjects · exams · tools",title:"Find a subject, exam, or tool",
    intro:"Search available subjects and go directly to practice, exams, or review.",
    back:"Dashboard", search:"Search subjects and tools", clear:"Clear search",
    all:"All", subjects:"Subjects", exams:"Exams", tools:"Tools",
    subjectHeading:"Choose a subject", subjectHint:"Pick a subject first, then its workbook or practice test.",
    openSubject:"Explore subject", noResults:"No matches found. Try another word or clear your search.",
    clearFilters:"Show all", examHeading:"Practice exams",
    examHint:"Choose a subject to enter its exam and practice options.",
    toolsHeading:"Helpful tools, when you need them",toolsHint:"Rules, explanations, and revision in one easy-to-find place.",
    yourSpace:"Your personal space", profile:"My Profile", profileHint:"Progress, goals, and achievements",
    results:"Search results", examSearch:"Practice exam",
    priority:"The simplest way to begin",step1:"1. Pick a subject",step2:"2. Open a workbook",step3:"3. Answer questions",
  },
  ru: {
    kicker:"Предметы · экзамены · инструменты",title:"Найди предмет, экзамен или инструмент",
    intro:"Ищи предметы, экзамены и учебные инструменты по названию.",
    back:"Кабинет", search:"Поиск предметов и инструментов", clear:"Очистить поиск",
    all:"Все",subjects:"Предметы",exams:"Экзамены",tools:"Инструменты",
    subjectHeading:"Выбери предмет",subjectHint:"Сначала предмет, потом сборник или тест.",
    openSubject:"Открыть предмет",noResults:"Ничего не найдено. Попробуй другой запрос.",
    clearFilters:"Показать всё",examHeading:"Пробные экзамены",
    examHint:"Выбери предмет, чтобы начать тренировку.",
    toolsHeading:"Полезные инструменты",toolsHint:"Правила, объяснения и повторение без лишнего шума.",
    yourSpace:"Личное пространство", profile:"Мой профиль",profileHint:"Прогресс, цели и достижения",
    results:"Результаты поиска", examSearch:"Пробный экзамен",
    priority:"Простой путь к началу",step1:"1. Выбери предмет",step2:"2. Открой сборник",step3:"3. Ответь на вопросы",
  },
} satisfies Record<Language, Record<string,string>>;

function SubjectLink({ item, lang, label }: {item:SubjectEntry;lang:Language;label:string}) {
  const body = (
    <>
      <div className="explore-subject-mark" aria-hidden="true">{item.marker}</div>
      <div className="min-w-0 flex-1 space-y-1.5">
        <h3 className="break-words text-base font-black leading-tight text-foreground">{item.title[lang]}</h3>
        <p className="text-xs leading-5 text-muted-foreground">{item.detail[lang]}</p>
      </div>
      <span className="explore-subject-arrow" aria-hidden="true"><ArrowRight className="size-5" /></span>
      <span className="sr-only">{label}</span>
    </>
  );
  const cls = "explore-subject-card group flex min-h-[116px] min-w-0 items-start gap-3 rounded-[1.15rem] border bg-card p-4 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary";
  if (item.kind === "dashboard") return (
    <Link to="/dashboard" search={{subject:item.id}} className={cls}>
      {body}
    </Link>
  );
  return <Link to="/subject/$subject" params={{subject:item.id}} className={cls}>{body}</Link>;
}

export function ExplorePage() {
  const lang = useLang();
  const t = UI[lang];
  const { hash } = useLocation();
  const [query,setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const onShortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onShortcut);
    return () => window.removeEventListener("keydown", onShortcut);
  }, []);
  const [filter,setFilter] = useState<"all"|"subjects"|"exams"|"tools">("all");
  useEffect(() => {
    const section=hash?.replace(/^#/,"");
    if (section!=="subjects" && section!=="exams" && section!=="tools") return;
    setFilter(section);
    const frame=window.requestAnimationFrame(() => {
      document.getElementById(section)?.scrollIntoView({
        behavior:window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches?"auto":"smooth",
        block:"start",
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [hash]);
  const clean = query.trim().toLocaleLowerCase();
  const matches = useMemo(() => EXPLORE_SUBJECTS.filter(subject =>
    !clean || Object.values(subject.title).some(text => text.toLocaleLowerCase().includes(clean)) ||
    Object.values(subject.detail).some(text => text.toLocaleLowerCase().includes(clean)) ||
    subject.id.includes(clean)
  ), [clean]);
  const studyTools = [
    { to:"/study-plan", label:l("Ուսումնական պլան","Study plan","План занятий"), Icon:GraduationCap },
    { to:"/mistakes", label:l("Իմ սխալները","Review mistakes","Повторение ошибок"), Icon:RotateCcw },
    { to:"/solutions", label:l("Սովորել՝ կանոններ և լուծումներ","Learn: rules and solutions","Обучение: правила и решения"), Icon:BookOpen },
    { to:"/chat", label:l("AI ուսուցիչ","AI tutor","ИИ-учитель"), Icon:Brain },
    { to:"/flashcards", label:l("Հիշողության քարտեր","Flashcards","Карточки"), Icon:BookText },
    { to:"/mini-games", label:l("Ուսումնական խաղեր","Learning games","Учебные игры"), Icon:Sparkles },
  ] as const;
  const matchesTool = (index:number) => !clean || Object.values(studyTools[index].label)
    .some(label => label.toLocaleLowerCase().includes(clean));
  const matchingToolCount = studyTools.filter((_,index) => matchesTool(index)).length;
  const hasMatchingTools = matchingToolCount > 0;
  const includeSubjects = (filter === "all" || filter === "subjects") && (!clean || matches.length > 0);
  const examMatch = !clean || [t.exams, t.examHeading, t.examHint, t.examSearch, ...EXPLORE_SUBJECTS.slice(0,6).flatMap(subject => Object.values(subject.title))]
      .some(label => label.toLocaleLowerCase().includes(clean));
  const examSubjectMatches = (index:number) => !clean || [t.exams,t.examHeading,t.examHint,t.examSearch,...Object.values(EXPLORE_SUBJECTS[index].title)].some(label => label.toLocaleLowerCase().includes(clean));
  const matchingExamCount = EXPLORE_SUBJECTS.slice(0,6).filter((_,index)=>examSubjectMatches(index)).length;
  const includeExams = (filter === "all" || filter === "exams") && examMatch && matchingExamCount > 0;
  const includeTools = (filter === "all" || filter === "tools") && (!clean || hasMatchingTools);
  const filterOptions = [
    {id:"all" as const,label:t.all,count:matches.length + matchingExamCount + matchingToolCount},
    {id:"subjects" as const,label:t.subjects,count:matches.length},
    {id:"exams" as const,label:t.exams,count:matchingExamCount},
    {id:"tools" as const,label:t.tools,count:matchingToolCount},
  ];

  return (
    <div className="explore-page mx-auto max-w-6xl space-y-8 pb-12 pt-3 sm:space-y-10 sm:pt-6">
      <div className="explore-hero min-w-0 rounded-[1.5rem] border p-5 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="explore-kicker inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest">
            <Compass className="size-4" aria-hidden="true"/>{t.kicker}
          </span>
          <Link to="/dashboard" className="inline-flex min-h-11 items-center gap-2 rounded-xl border bg-card/75 px-4 text-sm font-bold hover:bg-card">
            <ArrowRight className="size-4 rotate-180" aria-hidden="true"/>{t.back}
          </Link>
        </div>
        <h1 className="mt-6 max-w-3xl text-balance text-3xl font-black leading-tight tracking-tight text-foreground sm:text-5xl">{t.title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">{t.intro}</p>
        <div className="relative mt-6 max-w-3xl">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input ref={searchRef} type="search" autoComplete="off" aria-label={t.search} aria-describedby="explore-search-shortcuts" placeholder={t.search} value={query}
            onKeyDown={e=>{if(e.key==="Escape"){setQuery("");e.currentTarget.blur();}}}
            onChange={e=>{setQuery(e.target.value);if(e.target.value.trim())setFilter("all");}}
            className="explore-search min-h-14 w-full rounded-2xl border bg-background pl-12 pr-14 text-sm font-semibold text-foreground outline-none placeholder:font-normal placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary" />
          {query && <button type="button" onClick={()=>setQuery("")} aria-label={t.clear}
            className="absolute right-2 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-xl text-muted-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary">
            <X className="size-5" />
          </button>}
        </div>
        <p id="explore-search-shortcuts" className="mt-2 text-xs text-muted-foreground">{lang==="hy"?"Արագ որոնում՝ Ctrl + K · Մաքրել՝ Esc":lang==="ru"?"Быстрый поиск: Ctrl + K · Очистить: Esc":"Quick search: Ctrl + K · Clear: Esc"}</p>
      </div>

      <nav aria-label={t.all} className="explore-filters flex flex-wrap gap-2">
        {filterOptions.map(({id,label,count})=><button type="button" key={id}
          aria-label={label} aria-pressed={filter===id} onClick={()=>setFilter(id)}
          className="explore-filter-tab inline-flex min-h-11 items-center gap-2 border px-4 text-sm font-bold focus-visible:outline-2 focus-visible:outline-primary">
          <span>{label}</span>
          {id !== "all" && <span aria-hidden="true" className="explore-filter-count tabular-nums">{count}</span>}
        </button>)}
      </nav>

      {clean && <p aria-live="polite" className="text-sm font-semibold text-muted-foreground">{t.results}: {(includeSubjects ? matches.length : 0) + (includeExams ? matchingExamCount : 0) + (includeTools ? studyTools.filter((_,index) => matchesTool(index)).length : 0)}</p>}

      {clean && ((filter === "subjects" && matches.length === 0) || (filter === "exams" && !includeExams) || (filter === "tools" && !hasMatchingTools) || (filter === "all" && !includeSubjects && !includeExams && !includeTools)) && <div role="status" className="rounded-2xl border bg-card p-5">
        <p className="text-sm text-muted-foreground">{t.noResults}</p>
        <button type="button" onClick={()=>{setQuery("");setFilter("all");}} className="mt-3 min-h-11 rounded-xl border px-4 text-sm font-bold text-primary">{t.clearFilters}</button>
      </div>}

      {includeSubjects && <section id="subjects" aria-labelledby="explore-subjects" className="scroll-mt-24 space-y-4">
        <div className="space-y-1">
          <h2 id="explore-subjects" className="text-xl font-black text-foreground sm:text-2xl">{t.subjectHeading}</h2>
          <p className="text-sm text-muted-foreground">{t.subjectHint}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {matches.map(item=><SubjectLink key={item.id} item={item} lang={lang} label={t.openSubject}/>)}
        </div>
      </section>}

      {includeExams && <section id="exams" aria-labelledby="explore-exams" className="scroll-mt-24 space-y-4">
        <div className="space-y-1"><h2 id="explore-exams" className="text-xl font-black sm:text-2xl">{t.examHeading}</h2>
          <p className="text-sm text-muted-foreground">{t.examHint}</p></div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {examSubjectMatches(0) && <Link to="/exam/$subject" params={{subject:"english"}} className="explore-quick-link"><BookOpen className="size-5 text-primary"/>{EXPLORE_SUBJECTS[0].title[lang]}<ArrowRight className="ml-auto size-4"/></Link>}
          {examSubjectMatches(1) && <Link to="/math" search={{mode:"exam"}} className="explore-quick-link"><Calculator className="size-5 text-primary"/>{EXPLORE_SUBJECTS[1].title[lang]}<ArrowRight className="ml-auto size-4"/></Link>}
          {examSubjectMatches(2) && <Link to="/exam/$subject" params={{subject:"armenian"}} className="explore-quick-link"><BookText className="size-5 text-primary"/>{EXPLORE_SUBJECTS[2].title[lang]}<ArrowRight className="ml-auto size-4"/></Link>}
          {examSubjectMatches(3) && <Link to="/history" className="explore-quick-link"><LibraryBig className="size-5 text-primary"/>{EXPLORE_SUBJECTS[3].title[lang]}<ArrowRight className="ml-auto size-4"/></Link>}
          {examSubjectMatches(4) && <Link to="/biology" className="explore-quick-link"><Dna className="size-5 text-primary"/>{EXPLORE_SUBJECTS[4].title[lang]}<ArrowRight className="ml-auto size-4"/></Link>}
          {examSubjectMatches(5) && <Link to="/subject/$subject" params={{subject:"physics"}} className="explore-quick-link"><Atom className="size-5 text-primary"/>{EXPLORE_SUBJECTS[5].title[lang]}<ArrowRight className="ml-auto size-4"/></Link>}
        </div>
      </section>}

      {includeTools && <section id="tools" aria-labelledby="explore-tools" className="scroll-mt-24 space-y-4">
        <div className="space-y-1"><h2 id="explore-tools" className="text-xl font-black sm:text-2xl">{t.toolsHeading}</h2>
          <p className="text-sm text-muted-foreground">{t.toolsHint}</p></div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {matchesTool(0) && <Link to="/study-plan" className="explore-quick-link"><GraduationCap className="size-5 text-primary"/>{studyTools[0].label[lang]}<ArrowRight className="ml-auto size-4"/></Link>}
          {matchesTool(1) && <Link to="/mistakes" className="explore-quick-link"><RotateCcw className="size-5 text-primary"/>{studyTools[1].label[lang]}<ArrowRight className="ml-auto size-4"/></Link>}
          {matchesTool(2) && <Link to="/math-handbook" search={{book:"matem-1",chapter:1,section:1,topic:undefined}} className="explore-quick-link"><Calculator className="size-5 text-primary"/>{studyTools[2].label[lang]}<ArrowRight className="ml-auto size-4"/></Link>}
          {matchesTool(3) && <Link to="/english-grammar" search={{book:1,section:2,topic:undefined}} className="explore-quick-link"><Languages className="size-5 text-primary"/>{studyTools[3].label[lang]}<ArrowRight className="ml-auto size-4"/></Link>}
          {matchesTool(4) && <Link to="/chat" className="explore-quick-link"><Brain className="size-5 text-primary"/>{studyTools[4].label[lang]}<ArrowRight className="ml-auto size-4"/></Link>}
          {matchesTool(5) && <Link to="/flashcards" className="explore-quick-link"><BookText className="size-5 text-primary"/>{studyTools[5].label[lang]}<ArrowRight className="ml-auto size-4"/></Link>}
          {matchesTool(6) && <Link to="/mini-games" className="explore-quick-link"><Sparkles className="size-5 text-primary"/>{studyTools[6].label[lang]}<ArrowRight className="ml-auto size-4"/></Link>}
        </div>
      </section>}

      <Link to="/profile" className="explore-profile-link flex flex-wrap items-center gap-4 rounded-2xl border bg-card p-5 focus-visible:outline-2 focus-visible:outline-primary">
        <span aria-hidden="true" className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary"><UserRound className="size-6"/></span>
        <span className="min-w-0 flex-1"><strong className="block text-base font-black">{t.profile}</strong>
          <span className="mt-1 block text-sm text-muted-foreground">{t.profileHint}</span></span>
        <ArrowRight className="size-5 shrink-0 text-primary" aria-hidden="true"/>
      </Link>
    </div>
  );
}
