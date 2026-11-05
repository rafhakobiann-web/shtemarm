import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Brain, Layers3, RotateCcw, Sparkles, GraduationCap, Target, CheckCircle2 } from "lucide-react";
import { useLang } from "@/lib/lang";

export const Route = createFileRoute("/learn")({
  staticData: { sitemap: false },
  head: () => ({ meta: [{ title: "Ուսումնական կենտրոն · Shtemarm" }] }),
  component: LearningHub,
});

const COPY = {
  hy: { eyebrow:"Քո ուսումնական տարածքը", title:"Սովորիր քեզ հարմար ձևով", intro:"Ընտրիր ուսուցման ձևը։ Շտեմարանի բնօրինակ հարցերն ու AI-ի ստեղծած բացատրությունները մնում են հստակ առանձնացված։", learn:"Սովորել", learnSub:"Ընտրիր առարկան և բացիր շտեմարանի բաժինը", practice:"Թեստավորվել", practiceSub:"Լուծիր բնօրինակ առաջադրանքները", review:"Կրկնել սխալները", reviewSub:"Վերադարձիր դժվարություն առաջացրած հարցերին", tutor:"AI ուսուցիչ", tutorSub:"Ստացիր հուշում, բացատրություն կամ ինքնաստուգում", note:"AI-ի բացատրությունները կարող են սխալվել․ բնօրինակ առաջադրանքի ճիշտ պատասխանը ստուգիր շտեմարանի բանալիով։", open:"Բացել" },
  en: { eyebrow:"Your learning space",title:"Learn your way",intro:"Choose how to study. Original question-bank tasks remain distinct from AI-generated explanations.",learn:"Learn",learnSub:"Choose a subject and open a book section",practice:"Practice",practiceSub:"Work through original question-bank tasks",review:"Review mistakes",reviewSub:"Revisit questions you found difficult",tutor:"AI tutor",tutorSub:"Get a hint, explanation or quick quiz",note:"AI explanations can be mistaken. Verify original answers against the question-bank key.",open:"Open" },
  ru: { eyebrow:"Твоё учебное пространство",title:"Учись так, как удобно",intro:"Выбери способ обучения. Оригинальные задания отделены от объяснений, созданных ИИ.",learn:"Учиться",learnSub:"Выбери предмет и раздел сборника",practice:"Практика",practiceSub:"Решай оригинальные задания",review:"Повторить ошибки",reviewSub:"Вернись к сложным вопросам",tutor:"ИИ-учитель",tutorSub:"Получай подсказки, объяснения и мини-тесты",note:"ИИ может ошибаться. Сверяй правильные ответы с ключами сборника.",open:"Открыть" },
} as const;

function LearningHub() {
  const lang = useLang();
  const t = COPY[lang];
  const cards = [
    { label:t.learn, description:t.learnSub, to:"/dashboard" as const, icon:BookOpen },
    { label:t.practice, description:t.practiceSub, to:"/dashboard" as const, icon:Layers3 },
    { label:t.review, description:t.reviewSub, to:"/mistakes" as const, icon:RotateCcw },
    { label:t.tutor, description:t.tutorSub, to:"/chat" as const, icon:Brain },
  ];
  return <main className="mx-auto w-full max-w-6xl space-y-8 px-4 py-8 sm:px-6 sm:py-12">
    <header className="relative isolate overflow-hidden rounded-[2rem] border border-primary/15 bg-gradient-to-br from-primary/10 via-card to-teal-500/10 p-6 shadow-sm sm:p-10 lg:p-12">\n      <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-20 size-64 rounded-full bg-teal-400/10 blur-3xl" />\n      <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 right-16 size-56 rounded-full bg-primary/10 blur-3xl" />\n      <div className="relative z-10 space-y-4">
      <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1.5 text-xs font-bold text-primary"><Sparkles className="size-4" />{t.eyebrow}</span>
      <h1 className="max-w-3xl text-balance text-3xl font-black tracking-tight sm:text-5xl">{t.title}</h1>
      <p className="max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg">{t.intro}</p>
    </header>
    <div className="grid gap-4 sm:grid-cols-2">
      {cards.map(({label,description,to,icon:Icon}) => <Link key={label} to={to} className="group relative flex min-h-52 flex-col justify-between gap-5 overflow-hidden rounded-[1.75rem] border border-primary/10 bg-gradient-to-br from-card via-card to-primary/5 p-5 shadow-sm transition-[border-color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary motion-reduce:transform-none sm:p-6">
        <span className="grid size-12 place-items-center rounded-2xl border border-primary/10 bg-primary/10 text-primary shadow-sm transition-transform duration-200 group-hover:scale-105 motion-reduce:transform-none"><Icon className="size-6" aria-hidden="true" /></span>
        <div className="space-y-2"><h2 className="text-xl font-black tracking-tight">{label}</h2><p className="text-sm leading-6 text-muted-foreground">{description}</p></div>
        <span className="inline-flex items-center gap-2 text-sm font-bold text-primary">{t.open}<ArrowRight className="size-4 transition-transform group-hover:translate-x-1 motion-reduce:transform-none" aria-hidden="true"/></span>
      </Link>)}
    </div>
    <p className="rounded-2xl border border-border/70 bg-muted/40 p-4 text-sm leading-6 text-muted-foreground">{t.note}</p>
  </main>;
}
