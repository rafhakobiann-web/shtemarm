import {createFileRoute,Link} from "@tanstack/react-router";
import {useEffect,useState} from "react";
import {useLang} from "@/lib/lang";
import {useProgress} from "@/lib/progress";
import {getQuestHistory,QUESTS_CHANGED,type QuestHistory} from "@/lib/gamification";
import {learningInsights} from "@/lib/learningInsights";
export const Route=createFileRoute("/learning-insights")({staticData:{sitemap:false},component:LearningInsightsPage});
function LearningInsightsPage(){
 const lang=useLang(),tr=(hy:string,en:string,ru:string)=>lang==="en"?en:lang==="ru"?ru:hy;
 const progress=useProgress(),[history,setHistory]=useState<QuestHistory>({});
 useEffect(()=>{const refresh=()=>setHistory(getQuestHistory());refresh();window.addEventListener(QUESTS_CHANGED,refresh);window.addEventListener("storage",refresh);return()=>{window.removeEventListener(QUESTS_CHANGED,refresh);window.removeEventListener("storage",refresh);};},[]);
 const data=learningInsights(progress,history);
 return <main className="mx-auto max-w-4xl space-y-5 px-4 py-8 sm:px-6">
  <h1 className="text-3xl font-black">{tr("Ուսման վերլուծություն","Learning insights","Аналитика обучения")}</h1>
  <p className="text-sm text-muted-foreground">{tr("Միայն պահպանված վերջին պատասխանները և այս սարքի ակտիվությունը։ Չկան հորինված արդյունքներ կամ քննության կանխատեսումներ։","Only saved latest answers and this device's activity. No invented results or exam predictions.","Только последние сохранённые ответы и активность устройства. Без вымышленных результатов и прогнозов.")}</p>
  <div className="grid grid-cols-3 gap-2">{[[tr("Պատասխաններ","Answers","Ответы"),data.answered],[tr("Ճշտություն","Accuracy","Точность"),data.accuracy===null?"—":data.accuracy+"%"],[tr("Ակտիվ օրեր","Active days","Активные дни"),data.activeDays]].map(([label,value])=><div key={label} className="rounded-xl border bg-card p-3 text-center"><strong className="block text-xl">{value}</strong><span className="text-xs text-muted-foreground">{label}</span></div>)}</div>
  <h2 className="font-bold">{tr("Առարկայական արդյունքներ","Subject results","Результаты по предметам")}</h2>
  <div className="space-y-3">{data.subjectResults.map(item=><div key={item.subject} className="rounded-xl border bg-card p-4"><div className="flex justify-between gap-2 text-sm"><span className="font-semibold">{item.subject}</span><span>{item.correct}/{item.answered}</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-muted" role="progressbar" aria-label={item.subject} aria-valuenow={Math.round(item.correct/item.answered*100)} aria-valuemin={0} aria-valuemax={100}><div className="h-full rounded-full bg-primary" style={{width:Math.round(item.correct/item.answered*100)+"%"}}/></div></div>)}</div>
  {data.unattributed>0&&<p className="text-xs text-muted-foreground">{tr("Առարկան չհաստատված հարցեր՝ ","Unattributed question IDs: ","Вопросы без подтверждённого предмета: ")}{data.unattributed}</p>}
  {!data.answered&&<p className="text-sm text-muted-foreground">{tr("Դեռ բավարար տվյալներ չկան։","No data yet.","Данных пока нет.")}</p>}
  <Link to="/study-plan" className="inline-flex min-h-11 items-center rounded-xl border px-4 text-sm font-bold text-primary">{tr("Իմ ուսումնական պլանը","My study plan","Мой учебный план")}</Link>
 </main>;
}
