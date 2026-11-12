import { useEffect, useMemo, useState } from "react";
import { useMathBookIndex } from "@/lib/math-bank";
import { isShortAnswer, isOpenTask } from "@/lib/math-progress";
import { useLang } from "@/lib/lang";
import { MathQuestionText } from "@/components/MathQuestionText";
import { MathDemandReference } from "@/components/MathDemandReference";
import { MathExplain, taskPages } from "@/components/MathExplain";
import { Link } from "@tanstack/react-router";
import { useSignedIn } from "@/lib/guest-trial";
import { ArrowRight, Loader2 } from "lucide-react";

const PAGE_SIZE=3;
const COPY={
  hy:{title:"Շտեմարանային առաջադրանքների լուծումներ",book:"Գիրք",chapter:"Գլուխ",section:"Բաժին",
    tasks:"Առաջադրանքներ",question:"Ենթահարց",show:"Բացել պատասխանը և բացատրությունը",
    answer:"Բնօրինակի պատասխանի բանալին",noKey:"Այս ենթահարցի ստուգված պատասխանը դեռ հասանելի չէ։",
    noText:"Առաջադրանքի ամբողջական տեքստը դեռ թվայնացված չէ։ Ստուգիր բնօրինակի հատվածը։",
    next:"Հաջորդ էջը",prev:"Նախորդ էջը",loading:"Շտեմարանները բեռնվում են…",error:"Չհաջողվեց բեռնել գրքերը։",
    note:"Ընտրիր գիրքը, գլուխը և բաժինը։ Ստորև կարող ես բացել պատասխանը՝ առանց փորձնական պատասխան գրելու։ Մանրամասն լուծումը ստեղծվում է ըստ հասանելի նյութերի և կարող է պահանջել լրացուցիչ ստուգում։",
    practice:"Անցնել ինքնուրույն լուծմանը",signIn:"Մուտք գործել՝ բոլոր լուծումները տեսնելու համար",
    guest:"Հյուրերին հասանելի են այս բաժնի առաջին երկու ենթահարցերը։",
    jump:"Գտնել առաջադրանքը",taskNumber:"Առաջադրանքի համարը",notFound:"Այս համարով առաջադրանք չկա ընտրված բաժնում։",
    guestLimit:"Մնացած առաջադրանքները տեսնելու համար անհրաժեշտ է մուտք գործել։",count:"Այս բաժնում"},
  en:{title:"Solutions by workbook question",book:"Book",chapter:"Chapter",section:"Section",
    tasks:"Tasks",question:"Sub-question",show:"View answer and explanation",answer:"Printed answer key",
    noKey:"A verified answer is not available for this sub-question.",noText:"This question has not been fully transcribed yet. Compare the source excerpt.",
    next:"Next page",prev:"Previous page",loading:"Loading workbooks…",error:"Could not load workbooks.",
    note:"Select a book, chapter and section. View the answer without submitting a guess. Detailed explanations depend on available source material and may require verification.",
    practice:"Try independently",signIn:"Sign in to view the full question library",
    guest:"Guests can preview only the first two sub-questions in a section.",
    jump:"Find task",taskNumber:"Task number",notFound:"No task with this number in the selected section.",
    guestLimit:"Sign in to browse the remaining tasks.",count:"In this section"},
  ru:{title:"Решения заданий из сборников",book:"Сборник",chapter:"Глава",section:"Раздел",
    tasks:"Задания",question:"Подвопрос",show:"Показать ответ и объяснение",answer:"Ключ из сборника",
    noKey:"Проверенного ответа пока нет.",noText:"Текст задания ещё не полностью оцифрован. Сверьтесь с оригиналом.",
    next:"Следующая страница",prev:"Предыдущая страница",loading:"Загрузка сборников…",error:"Не удалось загрузить сборники.",
    note:"Выбери сборник, главу и раздел. Ответ можно посмотреть без случайной попытки. Подробные объяснения могут требовать дополнительной проверки.",
    practice:"Решать самостоятельно",signIn:"Войти для доступа ко всем решениям",
    guest:"Гостям доступны первые два подвопроса раздела.",
    jump:"Найти задание",taskNumber:"Номер задания",notFound:"Задания с таким номером нет в выбранном разделе.",
    guestLimit:"Войдите, чтобы просмотреть остальные задания.",count:"В этом разделе"},
} as const;

type SourceEntry = {
  initialBookId?: "matem-1" | "matem-2";
  initialChapter?: number;
  initialSection?: number;
};
/** Entry context is passed from a book's current section, never inferred from answers. */
export function MathSourceSolutions({
  initialBookId="matem-1", initialChapter=1, initialSection=1,
}: SourceEntry) {
  const lang=useLang(),t=COPY[lang];
  const signedIn=useSignedIn();
  const isGuest=signedIn!==true;
  const data=useMathBookIndex();
  const [bookId,setBookId]=useState<"matem-1"|"matem-2">(initialBookId);
  const [chapter,setChapter]=useState(initialChapter);
  const [section,setSection]=useState(initialSection);
  const [page,setPage]=useState(0);
  const [taskNumber,setTaskNumber]=useState("");
  const [findStatus,setFindStatus]=useState<"missing"|"guest"|null>(null);
  useEffect(()=>{
    setBookId(initialBookId);
    setChapter(initialChapter);
    setSection(initialSection);
    setPage(0);
    setTaskNumber("");
    setFindStatus(null);
  },[initialBookId,initialChapter,initialSection]);
  const sections=data.data?.books[bookId]?.sections ?? [];
  const chapters=useMemo(()=>[...new Set(sections.map(s=>s.chapter))].sort((a,b)=>a-b),[sections]);
  const activeChapter=chapters.includes(chapter)?chapter:chapters[0];
  const sectionOptions=sections.filter(s=>s.chapter===activeChapter);
  const activeSection=sectionOptions.some(s=>s.section===section)?section:sectionOptions[0]?.section;
  const target=sections.find(s=>s.chapter===activeChapter&&s.section===activeSection);
  const lastPage=target?Math.max(0,Math.ceil(target.tasks.length/PAGE_SIZE)-1):0;
  const visiblePage=isGuest?0:Math.min(page,lastPage);
  const visibleTasks=isGuest ? (target?.tasks.slice(0,2) ?? []) : (target?.tasks.slice(visiblePage*PAGE_SIZE,(visiblePage+1)*PAGE_SIZE) ?? []);
  const jumpToTask = () => {
    const requested=Number(taskNumber.trim());
    const index=Number.isSafeInteger(requested) && requested>0 ? target?.tasks.findIndex(task=>task.task===requested) ?? -1 : -1;
    if(index<0){setFindStatus("missing");return;}
    const earlier=target!.tasks.slice(0,index).reduce((count,task)=>count+(task.answers?.length??task.sub_count),0);
    if(isGuest && earlier>=2){setFindStatus("guest");return;}
    setFindStatus(null);
    setPage(Math.floor(index/PAGE_SIZE));
    document.getElementById("math-source-task-results")?.scrollIntoView({block:"start",behavior:"smooth"});
  };

  if(data.isLoading)return <p role="status" className="flex items-center gap-2 py-5 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin"/>{t.loading}</p>;
  if(data.isError||!data.data)return <p role="alert" className="rounded-lg border p-4 text-destructive">{t.error}</p>;
  return <section className="space-y-5">
    <div className="rounded-xl border bg-card p-4 sm:p-6">
      <h2 className="text-xl font-black">{t.title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t.note}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <label className="grid gap-1 text-sm font-semibold">{t.book}
          <select value={bookId} onChange={e=>{setBookId(e.target.value as "matem-1"|"matem-2");setChapter(1);setSection(1);setPage(0);setFindStatus(null);setTaskNumber("");}}
            className="min-h-11 rounded-lg border bg-background px-3">
            <option value="matem-1">{t.book} I</option><option value="matem-2">{t.book} II</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm font-semibold">{t.chapter}
          <select value={activeChapter} onChange={e=>{setChapter(Number(e.target.value));setSection(1);setPage(0);setTaskNumber("");setFindStatus(null);}}
            className="min-h-11 rounded-lg border bg-background px-3">
            {chapters.map(n=><option key={n} value={n}>{t.chapter} {n}</option>)}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-semibold">{t.section}
          <select value={activeSection} onChange={e=>{setSection(Number(e.target.value));setPage(0);setTaskNumber("");setFindStatus(null);}}
            className="min-h-11 rounded-lg border bg-background px-3">
            {sectionOptions.map(s=><option key={s.section} value={s.section}>{t.section} {s.section}</option>)}
          </select>
        </label>
      </div>
      {target&&<div className="mt-4 space-y-3 border-t pt-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-bold">{target.title}</h3>
          <span className="text-xs tabular-nums text-muted-foreground">{t.count}: {target.tasks.length} {t.tasks.toLocaleLowerCase()}</span>
        </div>
        <div className="flex flex-wrap items-end gap-2">
          <label className="grid min-w-36 flex-1 gap-1 text-sm font-semibold">
            {t.taskNumber}
            <input type="number" min={1} step={1} inputMode="numeric" value={taskNumber}
              onChange={e=>{setTaskNumber(e.target.value);setFindStatus(null);}}
              onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();jumpToTask();}}}
              placeholder="#" className="min-h-11 rounded-lg border bg-background px-3 text-sm"/>
          </label>
          <button type="button" onClick={jumpToTask} disabled={!taskNumber.trim()}
            className="inline-flex min-h-11 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:opacity-50">
            {t.jump}
          </button>
        </div>
        {findStatus&&<p role="status" className="text-sm text-muted-foreground">{findStatus==="guest"?t.guestLimit:t.notFound}</p>}
        <a href={`/math/books?book=${bookId}&sec=${activeChapter}-${activeSection}`}
          className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-primary">{t.practice}<ArrowRight className="size-4"/></a>
      </div>}
    </div>
    <div id="math-source-task-results" className="scroll-mt-24" />
    {visibleTasks.map((task,taskIndex)=>{
      const subs=task.answers?.length ?? task.sub_count;
      const previous=visibleTasks.slice(0,taskIndex).reduce((n,t)=>n+(t.answers?.length??t.sub_count),0);
      const shownSubs=isGuest?Math.max(0,Math.min(subs,2-previous)):subs;
      if(!shownSubs)return null;
      return <article key={`${bookId}:${activeChapter}:${activeSection}:${task.task}`} className="space-y-3 rounded-xl border bg-card p-4 sm:p-6">
        <h3 className="font-bold">{t.tasks} {task.task}</h3>
        <MathDemandReference bookId={bookId} segments={task.segments}/>
        {Array.from({length:shownSubs},(_,i)=>{
          const q=task.questions?.[i];
          const answer=task.answers?.[i];
          const segments=task.sub_segments?.[i]??task.segments;
          const id=`${bookId}:${activeChapter}:${activeSection}:${task.task}:${i+1}`;
          const kind: "choice"|"tf"|"open"=answer==="T"||answer==="F"?"tf":isOpenTask(task)||!answer||isShortAnswer(answer)?"open":"choice";
          return <div key={id} className="space-y-2 border-t pt-4">
            <h4 className="text-sm font-bold">{t.question} {i+1}</h4>
            {q?.prompt ? <MathQuestionText question={q}/> : <p className="text-sm text-muted-foreground">{t.noText}</p>}
            <details className="rounded-lg border bg-muted/20">
              <summary className="min-h-11 cursor-pointer p-3 text-sm font-semibold text-primary focus-visible:outline-2 focus-visible:outline-primary">{t.show}</summary>
              <div className="space-y-2 border-t p-3">
                {answer===undefined?<p className="text-sm text-muted-foreground">{t.noKey}</p>:<>
                  <p className="text-sm font-bold">{t.answer}: {answer}</p>
                  <MathExplain item={id} bookId={bookId} pages={taskPages(segments)} kind={kind}
                    task={`${t.tasks} ${task.task}, ${t.question} ${i+1}`}
                    correct={answer} chosen={null} question={q?.prompt}
                    options={q?.options} nativeSource={!!q?.transcription} showRelatedLinks={false}/>
                </>}
              </div>
            </details>
          </div>;
        })}
      </article>;
    })}
    {isGuest&&target&&<div className="space-y-2 rounded-xl border bg-card p-4 text-sm" role="note">
      <p className="text-muted-foreground">{t.guest}</p>
      <Link to="/auth" className="inline-flex min-h-11 items-center gap-2 font-bold text-primary">{t.signIn}<ArrowRight className="size-4"/></Link>
    </div>}
    {!isGuest&&target&&lastPage>0&&<nav aria-label={t.tasks} className="flex items-center justify-between gap-3">
      <button type="button" disabled={visiblePage===0} onClick={()=>setPage(n=>Math.max(0,n-1))}
        className="min-h-11 rounded-lg border px-4 text-sm font-bold disabled:opacity-45">{t.prev}</button>
      <span className="text-sm tabular-nums">{visiblePage+1} / {lastPage+1}</span>
      <button type="button" disabled={visiblePage===lastPage} onClick={()=>setPage(n=>Math.min(lastPage,n+1))}
        className="min-h-11 rounded-lg border px-4 text-sm font-bold disabled:opacity-45">{t.next}</button>
    </nav>}
  </section>;
}
