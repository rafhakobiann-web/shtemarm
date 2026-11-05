import { buildStudyPlan, type PlanMistake, type StudyPlanSubject, type StudyPlanTask } from "@/lib/studyPlan";
import type { Progress } from "@/lib/progress";
import { localDay } from "@/lib/gamification";

export type PlannerDay={day:string;tasks:StudyPlanTask[];completed:number;isRestDay:boolean};
export type PlannerSettings={subjects:StudyPlanSubject[];minutes:number;activeDays:number[]};
export function normalizePlannerDays(value:unknown):number[]{
  if(!Array.isArray(value))return [1,2,3,4,5,6,0];
  return [...new Set(value.filter((v):v is number=>Number.isInteger(v)&&v>=0&&v<=6))].sort((a,b)=>a-b);
}
export function weeklyPersonalPlan(
  progress:Pick<Progress,"answers">,mistakes:PlanMistake[],settings:PlannerSettings,
  done:Record<string,string[]>,now=new Date(),
):PlannerDay[]{
  const days=normalizePlannerDays(settings.activeDays);
  const today=new Date(now.getFullYear(),now.getMonth(),now.getDate(),12);
  const baseline=buildStudyPlan(progress,mistakes,settings.subjects,settings.minutes);
  return Array.from({length:7},(_,index)=>{
    const date=new Date(today);date.setDate(today.getDate()+index);
    const day=localDay(date);
    const isRestDay=!days.includes(date.getDay());
    // Rotate tasks on subsequent days so selected subjects share attention.
    const offset=baseline.length?index%baseline.length:0;
    const tasks=isRestDay?[]:[...baseline.slice(offset),...baseline.slice(0,offset)];
    return {day,tasks,completed:tasks.filter(t=>(done[day]??[]).includes(t.id)).length,isRestDay};
  });
}
