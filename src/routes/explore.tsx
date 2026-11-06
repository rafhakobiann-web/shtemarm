import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
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
    kicker:"Ամեն ինչ՝ իր տեղում",title:"Բացահայտիր ուսումնական աշխարհդ",
    intro:"Գտիր առարկան, բացիր շտեմարանը կամ սկսիր քննությունը։ Այստեղ այլևս հարկավոր չէ փնտրել երկար վահանակներում։",
    back:"Վահանակ", search:"Որոնել առարկա կամ թեմա", clear:"Մաքրել որոնումը",
    all:"Բոլորը", subjects:"Առարկաներ", exams:"Քննություններ", tools:"Գործիքներ",
    subjectHeading:"Ընտրիր առարկան", subjectHint:"Սկզբում ընտրիր առարկան․ հաջորդ էջում՝ գիրքը կամ թեստը։",
    openSubject:"Բացել առարկան", noResults:"Ոչինչ չգտնվեց։ Փորձիր այլ բառ կամ մաքրիր որոնումը։",
    clearFilters:"Ցույց տալ բոլորը", examHeading:"Փորձնական քննություններ",
    examHint:"Սկսիր քննության ռեժիմը համապատասխան առարկայից։",
    toolsHeading:"Գործիքներ՝ երբ պետք են", toolsHint:"Բացատրություններ, կրկնություն և կանոններ՝ առանց լրացուցիչ էջերի խառնաշփոթի։",
    yourSpace:"Քո անձնական տարածքը", profile:"Իմ պրոֆիլը", profileHint:"Առաջընթաց, նպատակներ և նվաճումներ",
    priority:"Սկսելու ամենահեշտ ճանապարհը", step1:"1. Ընտրիր առարկան",step2:"2. Բացիր գիրքը",step3:"3. Պատասխանիր հարցերին",
  },
  en: {
    kicker:"Everything in its place",title:"Find your next learning step",
    intro:"Explore subjects, open a workbook, or start a practice exam. No more hunting through long dashboards.",
    back:"Dashboard", search:"Search subjects and topics", clear:"Clear search",
    all:"All", subjects:"Subjects", exams:"Exams", tools:"Tools",
    subjectHeading:"Choose a subject", subjectHint:"Pick a subject first, then its workbook or practice test.",
    openSubject:"Explore subject", noResults:"No matches found. Try another word or clear your search.",
    clearFilters:"Show all", examHeading:"Practice exams",
    examHint:"Choose a subject to enter its exam and practice options.",
    toolsHeading:"Helpful tools, when you need them",toolsHint:"Rules, explanations, and revision in one easy-to-find place.",
    yourSpace:"Your personal space", profile:"My Profile", profileHint:"Progress, goals, and achievements",
    priority:"The simplest way to begin",step1:"1. Pick a subject",step2:"2. Open a workbook",step3:"3. Answer questions",
  },
  ru: {
    kicker:"Всё на своих местах",title:"Найди следующий шаг в учёбе",
    intro:"Выбирай предмет, открывай сборник или начинай пробный экзамен. Больше не нужно искать нужное в длинном кабинете.",
    back:"Кабинет", search:"Поиск предметов и тем", clear:"Очистить поиск",
    all:"Все",subjects:"Предметы",exams:"Экзамены",tools:"Инструменты",
    subjectHeading:"Выбери предмет",subjectHint:"Сначала предмет, потом сборник или тест.",
    openSubject:"Открыть предмет",noResults:"Ничего не найдено. Попробуй другой запрос.",
    clearFilters:"Показать всё",examHeading:"Пробные экзамены",
    examHint:"Выбери предмет, чтобы начать тренировку.",
    toolsHeading:"Полезные инструменты",toolsHint:"Правила, объяснения и повторение без лишнего шума.",
    yourSpace:"Личное пространство", profile:"Мой профиль",profileHint:"Прогресс, цели и достижения",
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

function ExplorePage() {
  const lang = useLang();
  const t = UI[lang];
  const [query,setQuery] = useState("");
  const [filter,setFilter] = useState<"all"|"subjects"|"exams"|"tools">("all");
  const clean = query.trim().toLocaleLowerCase();
  const matches = useMemo(() => EXPLORE_SUBJECTS.filter(subject =>
    !clean || Object.values(subject.title).some(text => text.toLocaleLowerCase().includes(clean)) ||
    Object.values(subject.detail).some(text => text.toLocaleLowerCase().includes(clean)) ||
    subject.id.includes(clean)
  ), [clean]);
  const includeSubjects = filter === "all" || filter === "subjects";
  const includeExams = (filter === "all" || filter === "exams") && !clean;
  const includeTools = (filter === "all" || filter === "tools") && !clean;

  const filterOptions = [
    {id:"all" as const, label:t.all,icon:Compass},
    {id:"subjects" as const,label:t.subjects,icon:LibraryBig},
    {id:"exams" as const,label:t.exams,icon:Trophy},
    {id:"tools" as const,label:t.tools,icon:Wrench},
  ];
  const studyTools = [
    { to:"/study-plan", label:l("Ուսումնական պլան","Study plan","План занятий"), Icon:GraduationCap },
    { to:"/mistakes", label:l("Իմ սխալները","Review mistakes","Повторение ошибок"), Icon:RotateCcw },
    { to:"/math-handbook", label:l("Մաթեմատիկայի կանոններ","Math formulas and rules","Правила математики"), Icon:Calculator },
    { to:"/english-grammar", label:l("Անգլերենի կանոններ","English grammar","Английская грамматика"), Icon:Languages },
    { to:"/chat", label:l("AI ուսուցիչ","AI tutor","ИИ-учитель"), Icon:Brain },
    { to:"/flashcards", label:l("Հիշողության քարտեր","Flashcards","Карточки"), Icon:BookText },
    { to:"/mini-games", label:l("Ուսումնական խաղեր","Learning games","Учебные игры"), Icon:Sparkles },
  ] as const;

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
        <div className="mt-5 flex flex-wrap gap-2 text-xs font-semibold text-muted-foreground" aria-label={t.priority}>
          {[t.step1,t.step2,t.step3].map((label,i)=><span key={i} className="rounded-full border bg-card/80 px-3 py-2">{label}</span>)}
        </div>
        <div className="relative mt-6 max-w-3xl">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input type="search" autoComplete="off" aria-label={t.search} placeholder={t.search} value={query}
            onChange={e=>{setQuery(e.target.value);if(e.target.value.trim())setFilter("subjects");}}
            className="explore-search min-h-14 w-full rounded-2xl border bg-background pl-12 pr-14 text-sm font-semibold text-foreground outline-none placeholder:font-normal placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-primary" />
          {query && <button type="button" onClick={()=>setQuery("")} aria-label={t.clear}
            className="absolute right-2 top-1/2 grid size-10 -translate-y-1/2 place-items-center rounded-xl text-muted-foreground hover:bg-muted focus-visible:outline-2 focus-visible:outline-primary">
            <X className="size-5" />
          </button>}
        </div>
      </div>

      <nav aria-label={t.all} className="explore-filters flex flex-wrap gap-2">
        {filterOptions.map(({id,label,icon:Icon})=><button type="button" key={id}
          aria-pressed={filter===id} onClick={()=>{setFilter(id);if(id!=="subjects")setQuery("");}}
          className={"inline-flex min-h-11 items-center gap-2 rounded-xl border px-4 text-sm font-bold focus-visible:outline-2 focus-visible:outline-primary "+
            (filter===id?"border-primary bg-primary text-primary-foreground":"bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground")}>
          <Icon className="size-4" aria-hidden="true" />{label}
        </button>)}
      </nav>

      {includeSubjects && <section id="subjects" aria-labelledby="explore-subjects" className="scroll-mt-24 space-y-4">
        <div className="space-y-1">
          <h2 id="explore-subjects" className="text-xl font-black text-foreground sm:text-2xl">{t.subjectHeading}</h2>
          <p className="text-sm text-muted-foreground">{t.subjectHint}</p>
        </div>
        {matches.length ? <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {matches.map(item=><SubjectLink key={item.id} item={item} lang={lang} label={t.openSubject}/>)}
        </div> : <div role="status" className="rounded-2xl border bg-card p-5">
          <p className="text-sm text-muted-foreground">{t.noResults}</p>
          <button type="button" onClick={()=>{setQuery("");setFilter("all");}} className="mt-3 min-h-11 rounded-xl border px-4 text-sm font-bold text-primary">{t.clearFilters}</button>
        </div>}
      </section>}

      {includeExams && <section id="exams" aria-labelledby="explore-exams" className="scroll-mt-24 space-y-4">
        <div className="space-y-1"><h2 id="explore-exams" className="text-xl font-black sm:text-2xl">{t.examHeading}</h2>
          <p className="text-sm text-muted-foreground">{t.examHint}</p></div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Link to="/exam/$subject" params={{subject:"english"}} className="explore-quick-link"><BookOpen className="size-5 text-primary"/>{EXPLORE_SUBJECTS[0].title[lang]}<ArrowRight className="ml-auto size-4"/></Link>
          <Link to="/math" search={{mode:"exam"}} className="explore-quick-link"><Calculator className="size-5 text-primary"/>{EXPLORE_SUBJECTS[1].title[lang]}<ArrowRight className="ml-auto size-4"/></Link>
          <Link to="/exam/$subject" params={{subject:"armenian"}} className="explore-quick-link"><BookText className="size-5 text-primary"/>{EXPLORE_SUBJECTS[2].title[lang]}<ArrowRight className="ml-auto size-4"/></Link>
          <Link to="/history" className="explore-quick-link"><LibraryBig className="size-5 text-primary"/>{EXPLORE_SUBJECTS[3].title[lang]}<ArrowRight className="ml-auto size-4"/></Link>
          <Link to="/biology" className="explore-quick-link"><Dna className="size-5 text-primary"/>{EXPLORE_SUBJECTS[4].title[lang]}<ArrowRight className="ml-auto size-4"/></Link>
          <Link to="/subject/$subject" params={{subject:"physics"}} className="explore-quick-link"><Atom className="size-5 text-primary"/>{EXPLORE_SUBJECTS[5].title[lang]}<ArrowRight className="ml-auto size-4"/></Link>
        </div>
      </section>}

      {includeTools && <section id="tools" aria-labelledby="explore-tools" className="scroll-mt-24 space-y-4">
        <div className="space-y-1"><h2 id="explore-tools" className="text-xl font-black sm:text-2xl">{t.toolsHeading}</h2>
          <p className="text-sm text-muted-foreground">{t.toolsHint}</p></div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Link to="/study-plan" className="explore-quick-link"><GraduationCap className="size-5 text-primary"/>{studyTools[0].label[lang]}<ArrowRight className="ml-auto size-4"/></Link>
          <Link to="/mistakes" className="explore-quick-link"><RotateCcw className="size-5 text-primary"/>{studyTools[1].label[lang]}<ArrowRight className="ml-auto size-4"/></Link>
          <Link to="/math-handbook" search={{book:"matem-1",chapter:1,section:1,topic:undefined}} className="explore-quick-link"><Calculator className="size-5 text-primary"/>{studyTools[2].label[lang]}<ArrowRight className="ml-auto size-4"/></Link>
          <Link to="/english-grammar" search={{book:1,section:2,topic:undefined}} className="explore-quick-link"><Languages className="size-5 text-primary"/>{studyTools[3].label[lang]}<ArrowRight className="ml-auto size-4"/></Link>
          <Link to="/chat" className="explore-quick-link"><Brain className="size-5 text-primary"/>{studyTools[4].label[lang]}<ArrowRight className="ml-auto size-4"/></Link>
          <Link to="/flashcards" className="explore-quick-link"><BookText className="size-5 text-primary"/>{studyTools[5].label[lang]}<ArrowRight className="ml-auto size-4"/></Link>
          <Link to="/mini-games" className="explore-quick-link"><Sparkles className="size-5 text-primary"/>{studyTools[6].label[lang]}<ArrowRight className="ml-auto size-4"/></Link>
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
