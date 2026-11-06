import type { Progress } from "@/lib/progress";
import { subjectForProgressId, type StudyPlanSubject } from "@/lib/studyPlan";
export type PracticeEntry={id:string;subject:StudyPlanSubject|null;correct:boolean;day:string|null;source:"latest-answer"|"daily-activity"};
export function practiceHistory(progress:Pick<Progress,"answers">,activity:Record<string,{answered:string[]}>):PracticeEntry[]{
  const byDay=new Map<string,string>();
  for(const [day,entry] of Object.entries(activity).sort(([a],[b])=>a.localeCompare(b))){
    if(!/^\d{4}-\d{2}-\d{2}$/.test(day)||!Array.isArray(entry?.answered))continue;
    for(const id of entry.answered)if(typeof id==="string")byDay.set(id,day);
  }
  return Object.entries(progress.answers).filter(([,value])=>value===0||value===1).slice(-500).map(([id,value])=>({
    id,subject:subjectForProgressId(id)??null,correct:value===1,day:byDay.get(id)??null,
    source:byDay.has(id)?"daily-activity" as const:"latest-answer" as const,
  })).sort((a,b)=>(b.day??"").localeCompare(a.day??"")||a.id.localeCompare(b.id));
}
export function filterPracticeHistory(entries:readonly PracticeEntry[],query:string,subject:string,result:"all"|"correct"|"wrong"):PracticeEntry[]{
  const q=query.trim().toLocaleLowerCase();
  return entries.filter(e=>(!subject||e.subject===subject)&&(!q||e.id.toLocaleLowerCase().includes(q))&&(result==="all"||(result==="correct"&&e.correct)||(result==="wrong"&&!e.correct)));
}
