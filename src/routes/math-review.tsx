import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, BookOpenText, CheckCircle2, RotateCcw, Trash2 } from "lucide-react";
import { MathContent } from "@/components/MathText";
import { useLang } from "@/lib/lang";
import {
  getMathMistakes, markMathMistakeMastered, removeMathMistake,
  MATH_MISTAKES_CHANGED, type MathMistake,
} from "@/lib/mathMistakes";
import { findMathSection, mathBookUrl } from "@/lib/mathHandbook";

export const Route=createFileRoute("/math-review")({
  staticData: { sitemap: true },
  head:()=>({meta:[{title:"Սխալների վերանայում · Մաթեմատիկա · Shtemarm"}]}),
  component:MathReviewPage,
});
const TEXT={
  hy:{back:"Մաթեմատիկայի ձեռնարկ",title:"Մաթեմատիկայի սխալների տետր",sub:"Սխալ պատասխանները պահվում են այս սարքում։ Ճիշտ կրկնությունից հետո վարժությունը նշվում է յուրացված։",book:"Մաս",all:"Բոլորը",pending:"Կրկնելու համար",mastered:"Յուրացված",exercise:"Առաջադրանք",subquestion:"Հարց",source:"Տեսնել բնօրինակ վարժությունը",guide:"Վերուսումնասիրել թեման",retry:"Կրկնել",check:"Ստուգել",tryAgain:"Սխալ է, փորձիր կրկին։",success:"Ճիշտ է, վարժությունը յուրացված է։",remove:"Հեռացնել",empty:"Սխալներ դեռ չեն պահպանվել։",missing:"Հարցի տեքստը դեռ թվայնացված չէ․ նախ բացիր բնօրինակ վարժությունը։",placeholder:"Գրիր պատասխանը",count:"Վերանայման ենթակա",note:"Մինչև այս գործառույթի ավելացումն արված սխալները հետադարձաբար չեն ներմուծվում։"},
  en:{back:"Math handbook",title:"Mathematics Mistake Notebook",sub:"Wrong answers are saved on this device. A correct retry marks the question mastered.",book:"Part",all:"All",pending:"To review",mastered:"Mastered",exercise:"Task",subquestion:"Question",source:"Open original exercise",guide:"Relearn topic",retry:"Retry",check:"Check",tryAgain:"Not quite. Try again.",success:"Correct — now mastered.",remove:"Remove",empty:"No saved mistakes yet.",missing:"This question is not yet transcribed. Open the source exercise first.",placeholder:"Type your answer",count:"Need review",note:"Mistakes recorded before this feature was installed are not imported retroactively."},
  ru:{back:"Справочник по математике",title:"Тетрадь ошибок по математике",sub:"Ошибки сохраняются на этом устройстве. После правильного повторения вопрос отмечается как усвоенный.",book:"Часть",all:"Все",pending:"Повторить",mastered:"Усвоено",exercise:"Задание",subquestion:"Вопрос",source:"Открыть исходное задание",guide:"Повторить тему",retry:"Повторить",check:"Проверить",tryAgain:"Пока неверно. Попробуйте ещё раз.",success:"Правильно — усвоено.",remove:"Удалить",empty:"Пока нет сохранённых ошибок.",missing:"Текст этого задания ещё не оцифрован. Сначала откройте оригинал.",placeholder:"Введите ответ",count:"На повторении",note:"Ошибки, сделанные до установки этой функции, автоматически не импортируются."}
} as const;

function ReviewCard({item,lang}:{item:MathMistake;lang:"hy"|"en"|"ru"}) {
  const t=TEXT[lang];
  const [answer,setAnswer]=useState("");
  const [active,setActive]=useState(false);
  const [feedback,setFeedback]=useState(false);
  const section=findMathSection(item.book,item.chapter,item.section);
  const choices=item.kind==="tf"
    ? [{value:"T",label:lang==="en"?"True":lang==="ru"?"Верно":"Ճիշտ է"},{value:"F",label:lang==="en"?"False":lang==="ru"?"Неверно":"Սխալ է"}]
    :item.kind==="choice"?["1","2","3","4"].map((value,i)=>({value,label:item.options?.[i]??value})):null;
  const check=()=>{
    if(!answer.trim())return;
    if(markMathMistakeMastered(item.id,answer)) {setActive(false);setAnswer("");setFeedback(false);}
    else setFeedback(true);
  };
  return <article className="space-y-3 rounded-2xl border bg-card p-4 shadow-sm">
    <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-muted-foreground">
      <span>{t.book} {item.book.endsWith("1")?"1":"2"} · {item.chapter}.{item.section} · {t.exercise} {item.task} · {t.subquestion} {item.sub}</span>
      <span className={item.mastered?"text-emerald-600":"text-amber-600"}>{item.mastered?t.mastered:t.pending} · ×{item.attempts}</span>
    </div>
    {item.prompt ? <p className="font-semibold leading-relaxed"><MathContent text={item.prompt}/></p>:
      <p className="text-sm text-muted-foreground">{t.missing}</p>}
    <div className="flex flex-wrap gap-2">
      {section && <a href={mathBookUrl(section)} className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border px-3 text-sm font-semibold hover:bg-muted"><BookOpenText className="size-4"/>{t.source}</a>}
      <Link to="/math-handbook" search={{book:item.book,chapter:item.chapter,section:item.section,topic:undefined}}
        className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-primary/25 bg-primary/5 px-3 text-sm font-semibold text-primary hover:bg-primary/10">
        <RotateCcw className="size-4"/>{t.guide}
      </Link>
    </div>
    {!item.mastered && (active ? <div className="space-y-3 rounded-xl border p-3">
      {choices ? <div className="grid gap-2 sm:grid-cols-2">{choices.map(opt=><button key={opt.value} type="button" onClick={()=>{setAnswer(opt.value);setFeedback(false);}}
        aria-pressed={answer===opt.value} className={`min-h-11 rounded-xl border p-2 text-left text-sm ${answer===opt.value?"border-primary bg-primary/10":"hover:bg-muted"}`}>
        {opt.value}. <MathContent text={opt.label}/>
      </button>)}</div>:
        <input type="text" inputMode="decimal" value={answer} onChange={e=>{setAnswer(e.target.value);setFeedback(false);}}
          placeholder={t.placeholder} aria-label={t.placeholder} className="min-h-11 w-full rounded-xl border bg-background px-3 text-sm"/>}
      <button type="button" disabled={!answer.trim()} onClick={check}
        className="min-h-11 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground disabled:opacity-40">{t.check}</button>
      {feedback && <p role="status" className="text-sm font-medium text-destructive">{t.tryAgain}</p>}
    </div>:
      <button className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground"
        onClick={()=>{setActive(true);setAnswer("");setFeedback(false);}}><RotateCcw className="size-4"/>{t.retry}</button>)}
    {item.mastered && <p className="flex items-center gap-2 text-sm font-semibold text-emerald-600"><CheckCircle2 className="size-4"/>{t.success}</p>}
    <button onClick={()=>removeMathMistake(item.id)} className="flex min-h-10 items-center gap-1.5 text-xs text-muted-foreground hover:text-destructive">
      <Trash2 className="size-4"/>{t.remove}
    </button>
  </article>;
}
function MathReviewPage(){
  const lang=useLang();const t=TEXT[lang];
  const [items,setItems]=useState<MathMistake[]>([]);
  const [filter,setFilter]=useState<"all"|"matem-1"|"matem-2">("all");
  const [showMastered,setShowMastered]=useState(false);
  useEffect(()=>{
    const update=()=>setItems(getMathMistakes());
    update();
    window.addEventListener(MATH_MISTAKES_CHANGED,update);
    return ()=>window.removeEventListener(MATH_MISTAKES_CHANGED,update);
  },[]);
  const filtered=useMemo(()=>items.filter(m=>(filter==="all"||m.book===filter)&&(showMastered||!m.mastered)),[items,filter,showMastered]);
  return <main className="mx-auto max-w-3xl space-y-5 pb-24">
    <Link to="/math-handbook" search={{book:"matem-1",chapter:1,section:1,topic:undefined}}
      className="inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground"><ArrowLeft className="size-4"/>{t.back}</Link>
    <header className="rounded-3xl border bg-card p-5 sm:p-7"><h1 className="text-2xl font-black sm:text-3xl">{t.title}</h1>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t.sub}</p>
      <p className="mt-3 font-bold">{t.count}: {items.filter(m=>!m.mastered).length} · {t.mastered}: {items.filter(m=>m.mastered).length}</p>
    </header>
    <div className="flex flex-wrap items-center gap-3 text-sm">
      <label className="inline-flex items-center gap-2">{t.book}
        <select value={filter} onChange={e=>setFilter(e.target.value as typeof filter)} className="min-h-11 rounded-xl border bg-card px-3">
          <option value="all">{t.all}</option><option value="matem-1">{t.book} 1</option><option value="matem-2">{t.book} 2</option>
        </select>
      </label>
      <label className="inline-flex min-h-11 items-center gap-2"><input type="checkbox" checked={showMastered}
        onChange={e=>setShowMastered(e.target.checked)} className="size-4 accent-primary"/>{t.mastered}</label>
    </div>
    {filtered.length===0?<p className="rounded-2xl border bg-card p-6 text-sm text-muted-foreground">{t.empty}</p>:
      filtered.map(item=><ReviewCard key={item.id} item={item} lang={lang}/>)}
    <p className="text-xs text-muted-foreground">{t.note}</p>
  </main>;
}
