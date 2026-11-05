import type {Progress} from "@/lib/progress";
import type {QuestHistory} from "@/lib/gamification";
import {practiceHistory} from "@/lib/practiceHistory";
import {subjectForProgressId,type StudyPlanSubject} from "@/lib/studyPlan";
export type LearningInsight={answered:number;correct:number;accuracy:number|null;activeDays:number;subjectResults:{subject:StudyPlanSubject;answered:number;correct:number}[];unattributed:number};
export function learningInsights(progress:Pick<Progress,"answers">,history:QuestHistory):LearningInsight{
 const entries=practiceHistory(progress,history);
 const subjects=new Map<StudyPlanSubject,{answered:number;correct:number}>();
 let unattributed=0;
 for(const entry of entries){
  const subject=subjectForProgressId(entry.id);
  if(!subject){unattributed++;continue;}
  const old=subjects.get(subject)??{answered:0,correct:0};
  old.answered++;if(entry.correct)old.correct++;
  subjects.set(subject,old);
 }
 const correct=entries.filter(e=>e.correct).length;
 return {answered:entries.length,correct,accuracy:entries.length?Math.round(100*correct/entries.length):null,
  activeDays:Object.values(history).filter(e=>e.answered.length>0||e.reviewed.length>0).length,
  subjectResults:[...subjects].map(([subject,v])=>({subject,...v})).sort((a,b)=>b.answered-a.answered),unattributed};
}
