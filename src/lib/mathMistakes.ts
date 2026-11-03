import { isRight } from "./math-progress";
import { recordQuestActivity } from "@/lib/gamification";
const KEY = "shtemarm:math-mistakes:v1";
export type MathMistakeKind = "choice" | "tf" | "open";
export type MathMistake = {
  id:string; book:"matem-1"|"matem-2"; chapter:number; section:number;
  task:number; sub:number; prompt?:string; options?:string[];
  kind:MathMistakeKind; chosen:string; correct:string;
  attempts:number; lastWrong:number; mastered:boolean;
};
type NewMistake = Omit<MathMistake,"attempts"|"lastWrong"|"mastered">;
export const MATH_MISTAKES_CHANGED = "shtemarm:math-mistakes-changed";

export function getMathMistakes():MathMistake[]{
  if (typeof window==="undefined") return [];
  try {
    const parsed:unknown=JSON.parse(localStorage.getItem(KEY)??"[]");
    if(!Array.isArray(parsed))return [];
    return parsed.filter((x):x is MathMistake=>
      !!x&&typeof x==="object"&&typeof x.id==="string" &&
      (x.book==="matem-1"||x.book==="matem-2") &&
      Number.isInteger(x.chapter)&&Number.isInteger(x.section)&&
      typeof x.correct==="string"&&typeof x.chosen==="string"&&
      (x.kind==="choice"||x.kind==="tf"||x.kind==="open")
    );
  } catch { return []; }
}
function save(items:MathMistake[]){
  try {
    localStorage.setItem(KEY,JSON.stringify(items.slice(0,1200)));
    window.dispatchEvent(new Event(MATH_MISTAKES_CHANGED));
  } catch { /* blocked storage: do not interrupt studying */ }
}
export function recordMathMistake(item:NewMistake){
  if (typeof window==="undefined" || !item.correct || isRight(item.correct,item.chosen)) return;
  const items=getMathMistakes();
  const index=items.findIndex(x=>x.id===item.id);
  const old=index<0?undefined:items[index];
  if(old && old.chosen===item.chosen && Date.now()-old.lastWrong<800) return; // ignore double taps
  const next:MathMistake={...item,attempts:(old?.attempts??0)+1,lastWrong:Date.now(),mastered:false};
  if(index>=0)items.splice(index,1);
  save([next,...items]);
}
export function markMathMistakeMastered(id:string,value:string):boolean{
  const items=getMathMistakes();
  const mistake=items.find(m=>m.id===id);
  if (!mistake || !isRight(mistake.correct,value))return false;
  save(items.map(m=>m.id===id?{...m,mastered:true}:m));
  if (!mistake.mastered) recordQuestActivity("math:" + id, "reviewed");
  return true;
}
export function removeMathMistake(id:string) {
  save(getMathMistakes().filter(m=>m.id!==id));
}
