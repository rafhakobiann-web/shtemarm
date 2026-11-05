import {createFileRoute,Link} from "@tanstack/react-router";
import {useEffect,useMemo,useState} from "react";
import {useLang} from "@/lib/lang";
import {useProgress} from "@/lib/progress";
import {getQuestHistory,QUESTS_CHANGED,type QuestHistory} from "@/lib/gamification";
import {filterPracticeHistory,practiceHistory} from "@/lib/practiceHistory";
export const Route=createFileRoute("/practice-history")({staticData:{sitemap:false},component:PracticeHistoryPage});
function PracticeHistoryPage(){
 const lang=useLang(),tr=(hy:string,en:string,ru:string)=>lang==="en"?en:lang==="ru"?ru:hy;
 const progress=useProgress();
 const [history,setHistory]=useState<QuestHistory>({});
 const [query,setQuery]=useState(""),[subject,setSubject]=useState(""),[result,setResult]=useState<"all"|"correct"|"wrong">("all");
 useEffect(()=>{const refresh=()=>setHistory(getQuestHistory());refresh();window.addEventListener(QUESTS_CHANGED,refresh);window.addEventListener("storage",refresh);return()=>{window.removeEventListener(QUESTS_CHANGED,refresh);window.removeEventListener("storage",refresh);};},[]);
 const entries=useMemo(()=>practiceHistory(progress,history),[progress,history]);
 const filtered=filterPracticeHistory(entries,query,subject,result);
 const subjects=[...new Set(entries.map(e=>e.subject).filter((v):v is NonNullable<typeof v>=>v!==null))];
 return <main className="mx-auto max-w-4xl space-y-5 px-4 py-8 sm:px-6">
  <h1 className="text-3xl font-black">{tr("Լուծումների պատմություն","Practice history","История заданий")}</h1>
  <p className="text-sm text-muted-foreground">{tr("Ցուցադրվում է յուրաքանչյուր հարցի վերջին պահպանված արդյունքը, ոչ թե բոլոր փորձերը։ Ամսաթիվը ցուցադրվում է միայն այն դեպքում, երբ առկա է այս սարքի ակտիվության գրառում։","Shows the latest saved result per question, not every attempt. Dates appear only when this device has activity records.","Показан последний сохранённый результат вопроса, не все попытки. Даты доступны только при наличии локальной записи активности.")}</p>
  <div className="grid gap-2 sm:grid-cols-3">
   <input className="min-h-11 rounded-xl border bg-background px-3" aria-label={tr("Որոնել հարցի ID-ով","Search question ID","Поиск по ID")} placeholder={tr("Հարցի ID","Question ID","ID вопроса")} value={query} onChange={e=>setQuery(e.target.value)}/>
   <select className="min-h-11 rounded-xl border bg-background px-3" aria-label={tr("Առարկա","Subject","Предмет")} value={subject} onChange={e=>setSubject(e.target.value)}><option value="">{tr("Բոլոր առարկաները","All subjects","Все предметы")}</option>{subjects.map(s=><option key={s} value={s}>{s}</option>)}</select>
   <select className="min-h-11 rounded-xl border bg-background px-3" aria-label={tr("Արդյունք","Result","Результат")} value={result} onChange={e=>setResult(e.target.value as typeof result)}><option value="all">{tr("Բոլոր արդյունքները","All results","Все результаты")}</option><option value="correct">{tr("Ճիշտ","Correct","Верно")}</option><option value="wrong">{tr("Սխալ","Incorrect","Неверно")}</option></select>
  </div>
  <p className="text-sm">{tr("Գտնվել է","Found","Найдено")}: {filtered.length}</p>
  <div className="space-y-2">{filtered.slice(0,100).map(item=><article key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-3 text-sm"><div className="min-w-0"><p className="break-all font-semibold">{item.id}</p><p className="text-xs text-muted-foreground">{item.subject??tr("Անհայտ առարկա","Unknown subject","Неизвестный предмет")} · {item.day??tr("Ամսաթիվը անհայտ է","Date unavailable","Дата неизвестна")}</p></div><span className={item.correct?"text-emerald-600 dark:text-emerald-400":"text-amber-700 dark:text-amber-400"}>{item.correct?tr("Ճիշտ","Correct","Верно"):tr("Կրկնել","Review","Повторить")}</span></article>)}</div>
  {filtered.length>100&&<p className="text-xs text-muted-foreground">{tr("Ցուցադրվում են առաջին 100 արդյունքները։","Showing the first 100 results.","Показаны первые 100 результатов.")}</p>}
  {!filtered.length&&<p className="text-sm text-muted-foreground">{tr("Պահպանված արդյունքներ չկան։","No saved results.","Нет сохранённых результатов.")}</p>}
  <Link to="/mistakes" className="inline-flex min-h-11 items-center rounded-xl border px-4 text-sm font-bold text-primary">{tr("Կրկնել սխալները","Review mistakes","Повторить ошибки")}</Link>
 </main>;
}
