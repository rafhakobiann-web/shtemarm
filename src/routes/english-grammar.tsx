import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";
import { ArrowLeft, BookOpenText, CheckCircle2, Search, XCircle, GraduationCap } from "lucide-react";
import { GRAMMAR_TOPICS, GRAMMAR_SECTION_GUIDES, getGrammarTopic, getSectionGuide, getSectionTopics } from "@/lib/grammarHandbook";
import type { GrammarLanguage, GrammarTopic } from "@/lib/grammarHandbookTypes";
import { useLang } from "@/lib/lang";

const searchSchema = z.object({
  book: z.coerce.number().int().min(1).max(3).catch(1),
  section: z.coerce.number().int().min(1).max(13).catch(2),
  topic: z.string().optional().catch(undefined),
});
export const Route = createFileRoute("/english-grammar")({
  validateSearch: searchSchema,
  head: () => ({ meta: [
    { title: "English Grammar Handbook · Shtemarm" },
    { name: "description", content: "Հայերեն, անգլերեն և ռուսերեն կանոններ ու բացատրություններ՝ անգլերենի երեք շտեմարանների 13 բաժինների համար։" },
  ] }),
  component: EnglishGrammarHandbook,
});

const TEXT = {
  hy: { home: "Գլխավոր էջ", title: "Անգլերենի կանոնների ձեռնարկ", subtitle: "3 գիրք · 13 բաժին · առանց ԱԲ-ի", selectBook: "Գիրք", selectSection: "Բաժին", search: "Փնտրել կանոն կամ թեմա…", all: "Ցույց տալ բոլոր թեմաները", practice: "Անցնել այս բաժնի առաջադրանքներին", topics: "Թեմաներ", formula: "Կառուցվածք", good: "Ճիշտ օրինակ", bad: "Տարածված սխալ", why: "Ինչու է սխալ", notFound: "Համապատասխան կանոն չգտնվեց։ Փորձիր այլ բառով որոնել։", notice: "Յուրաքանչյուր բաժնում ներկայացված են առավել օգտակար թեմաները։ Ոչ բոլոր առաջադրանքներն ունեն մեկ հստակ քերականական կանոն․ ընթերցանության և բառապաշարի համար կան առանձին ռազմավարություններ։", categories: { grammar: "Քերականություն", reading: "Ընթերցանություն", vocabulary: "Բառապաշար", strategy: "Մեթոդաբանություն" }, level: "Մակարդակ" },
  en: { home: "Home", title: "English Grammar Handbook", subtitle: "3 books · 13 sections · no AI required", selectBook: "Book", selectSection: "Section", search: "Search rules or topics…", all: "Show all topics", practice: "Practice this section", topics: "Topics", formula: "Pattern", good: "Correct example", bad: "Common mistake", why: "Why it's wrong", notFound: "No matching topic. Try another search.", notice: "Each section highlights useful topics, not a claimed rule for every individual question. Reading and vocabulary sections include separate strategies.", categories: { grammar: "Grammar", reading: "Reading", vocabulary: "Vocabulary", strategy: "Study strategy" }, level: "Level" },
  ru: { home: "Главная", title: "Справочник по английской грамматике", subtitle: "3 книги · 13 разделов · без ИИ", selectBook: "Книга", selectSection: "Раздел", search: "Поиск правила или темы…", all: "Показать все темы", practice: "Упражнения этого раздела", topics: "Темы", formula: "Схема", good: "Правильный пример", bad: "Типичная ошибка", why: "Почему это ошибка", notFound: "Тема не найдена. Попробуйте другой запрос.", notice: "Для каждого раздела предложены полезные темы, но не каждому заданию соответствует только одно правило. Для чтения и лексики есть отдельные стратегии.", categories: { grammar: "Грамматика", reading: "Чтение", vocabulary: "Лексика", strategy: "Методика" }, level: "Уровень" },
} as const;

function GrammarCard({ item, lang, selected }: { item: GrammarTopic; lang: GrammarLanguage; selected: boolean }) {
  const t = TEXT[lang];
  const info = item.content[lang];
  return (
    <details id={`rule-${item.id}`} key={item.id + "-" + (selected ? "selected" : "normal")} defaultOpen={selected}
      className="group scroll-mt-32 overflow-hidden rounded-2xl border bg-card shadow-sm transition-colors open:border-primary/35">
      <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-3 p-4 focus-visible:outline-2 focus-visible:outline-primary sm:p-5">
        <span className="min-w-0">
          <span className="flex flex-wrap items-center gap-2 text-xs font-semibold text-muted-foreground">
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary">{item.level}</span>
            <span>{t.categories[item.category]}</span>
          </span>
          <span className="mt-2 block font-bold leading-relaxed">{item.title}</span>
        </span>
        <span aria-hidden="true" className="shrink-0 text-primary transition-transform group-open:rotate-180">⌄</span>
      </summary>
      <div className="space-y-4 border-t p-4 sm:p-5">
        <p className="leading-relaxed">{info.summary}</p>
        <section className="space-y-1.5 rounded-xl bg-muted/70 p-3">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{t.formula}</p>
          <p className="font-mono text-sm leading-relaxed">{item.formula}</p>
        </section>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-3">
            <h3 className="mb-1 flex items-center gap-2 text-sm font-bold"><CheckCircle2 className="size-4 text-emerald-600" />{t.good}</h3>
            <p className="text-sm leading-relaxed">{item.correct}</p>
          </div>
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-3">
            <h3 className="mb-1 flex items-center gap-2 text-sm font-bold"><XCircle className="size-4 text-destructive" />{t.bad}</h3>
            <p className="text-sm leading-relaxed">{item.incorrect}</p>
          </div>
        </div>
        <div className="rounded-xl border border-primary/15 bg-primary/5 p-3">
          <p className="mb-1 text-sm font-bold">{t.why}</p>
          <p className="text-sm leading-relaxed">{info.why}</p>
        </div>
      </div>
    </details>
  );
}

function EnglishGrammarHandbook() {
  const lang = useLang();
  const t = TEXT[lang];
  const { book, section, topic: selectedTopicId } = Route.useSearch();
  const [query, setQuery] = useState("");
  const [all, setAll] = useState(false);
  const guide = getSectionGuide(section) ?? GRAMMAR_SECTION_GUIDES[0];
  const focused = getSectionTopics(section);
  const selected = selectedTopicId ? getGrammarTopic(selectedTopicId) : undefined;
  const shown = useMemo(() => {
    const base = query.trim() || all ? GRAMMAR_TOPICS : focused;
    const withSelected = selected && !base.some(item => item.id === selected.id) ? [selected, ...base] : base;
    const q = query.trim().toLocaleLowerCase();
    return !q ? withSelected : withSelected.filter(item =>
      [item.id, item.title, item.level, item.formula, item.content[lang].summary, item.content[lang].why]
      .some(part => part.toLocaleLowerCase().includes(q)));
  }, [query, all, focused, selected, lang]);
  return <main className="mx-auto max-w-6xl space-y-6 pb-28">
    <Link to="/" className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground">
      <ArrowLeft className="size-4" />{t.home}
    </Link>
    <section className="space-y-3 rounded-3xl border border-primary/20 bg-card p-5 shadow-card sm:p-7">
      <div className="flex items-center gap-3">
        <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary"><BookOpenText className="size-6"/></div>
        <div><h1 className="text-2xl font-black sm:text-3xl">{t.title}</h1><p className="text-sm text-muted-foreground">{t.subtitle}</p></div>
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">{t.notice}</p>
    </section>
    <div className="grid gap-4 md:grid-cols-[17rem_minmax(0,1fr)] md:items-start">
      <aside className="space-y-4 rounded-3xl border bg-card p-4 md:sticky md:top-24" aria-label={t.selectSection}>
        <div className="space-y-2">
          <p className="text-sm font-bold">{t.selectBook}</p>
          <div className="grid grid-cols-3 gap-2">
            {[1,2,3].map(n => <Link key={n} to="/english-grammar" search={{book:n,section,topic:undefined}}
              aria-current={n===book?"page":undefined}
              className={`grid min-h-11 place-items-center rounded-xl border px-2 text-sm font-bold transition-colors ${n===book?"border-primary bg-primary text-primary-foreground":"border-border bg-muted/20 hover:border-primary/35"}`}>{n}</Link>)}
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-bold">{t.selectSection}</p>
          <nav className="grid max-h-[23rem] gap-1 overflow-y-auto pr-1" aria-label={t.selectSection}>
            {GRAMMAR_SECTION_GUIDES.map(s => <Link key={s.section} to="/english-grammar" search={{book,section:s.section,topic:undefined}}
              aria-current={section === s.section ? "page" : undefined}
              className={`flex min-h-11 items-center gap-2 rounded-xl px-3 py-2 text-left text-sm transition-colors ${section===s.section?"bg-primary/10 font-bold text-primary":"hover:bg-muted"}`}>
              <span className="w-6 shrink-0 text-center font-bold tabular-nums">{s.section}</span>
              <span className="min-w-0">{s.title[lang]}</span>
            </Link>)}
          </nav>
        </div>
      </aside>
      <div className="min-w-0 space-y-5">
        <section className="space-y-4 rounded-3xl border bg-card p-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-primary">{t.selectBook} {book} · {t.selectSection} {section}</p>
            <h2 className="mt-1 text-xl font-black">{guide?.title[lang]}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{guide?.description[lang]}</p>
          </div>
          <Link to="/study/$bookId/$sectionId" params={{bookId:String(book),sectionId:String(section)}} search={{mode:"classic"}}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:bg-primary/90">
            <GraduationCap className="size-4"/>{t.practice}
          </Link>
        </section>
        <section className="space-y-3" aria-label={t.topics}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-black">{t.topics} · {shown.length}</h2>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input type="checkbox" className="size-4 accent-primary" checked={all} onChange={e=>setAll(e.target.checked)}/>
              {t.all}
            </label>
          </div>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-3.5 size-4 text-muted-foreground" aria-hidden/>
            <input type="search" value={query} onChange={e=>setQuery(e.target.value)}
              aria-label={t.search} placeholder={t.search}
              className="min-h-11 w-full rounded-xl border bg-card py-2 pl-10 pr-3 text-sm focus-visible:outline-2 focus-visible:outline-primary" />
          </div>
          {shown.length ? shown.map(item=><GrammarCard key={item.id} item={item} lang={lang} selected={item.id===selectedTopicId}/>) :
            <p role="status" className="rounded-2xl border bg-card p-5 text-sm text-muted-foreground">{t.notFound}</p>}
        </section>
      </div>
    </div>
  </main>;
}
