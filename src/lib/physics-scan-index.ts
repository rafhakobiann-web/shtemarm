import type { PhysicsVolume } from "@/lib/physics-source";

/**
 * SOURCE-IMAGE EXERCISE INDEX (not text transcription).
 *
 * A real printed MC question is displayed inside the learner's PRIVATE, local
 * source PDF. The key below was independently checked against the first
 * printed answer-table page of the user-supplied 2017 source scans:
 *  Part I  : physical PDF page 406, printed tasks 1–125
 *  Part II : physical PDF page 409, printed tasks 1–125.
 * Each row maps the PRINTED question number to the physical source PDF page
 * on which it starts. Continuations may run onto the next page.
 *
 * Question wording, drawings, answer options and pages are NOT copied to
 * this website. Do not describe these entries as textual transcriptions.
 */
export type PhysicsIndexedQuestion = {
  id: string; volume: PhysicsVolume; number: number;
  page: number; keyPage: number; answer: "1"|"2"|"3"|"4";
  source: "original-scan"; type: "choice";
};
const PART1_ANSWER_COLUMNS = [
  "2 1 1 2 4 2 3 1 3 2 3 4 2 4 2 3 3 2 1 2 4 2 4 1 1 3 3 2 3 1 2 4 2 4 1 1 2",
  "3 4 2 3 4 4 2 4 4 3 3 2 1 2 4 3 2 3 2 2 3 2 2 1 4 4 1 3 2 2 2 1 1 1 3 4 2",
  "2 1 4 3 2 2 2 4 4 4 3 4 3 3 1 3 3 3 3 3 1 3 3 1 3 4 3 2 1 4 1 2 4 2 3 1 3",
  "1 4 4 1 4 2 3 2 4 2 3 2 1 3",
] as const;
const PART2_ANSWER_COLUMNS = [
  "2 3 1 3 4 2 2 4 2 4 1 2 1 3 3 4 2 2 1 1 3 4 3 3 4 2 2 1 3 1 1 2 2 3 1 4 2",
  "2 1 2 2 3 1 1 1 1 1 1 2 2 3 3 4 3 4 4 3 3 3 3 1 1 3 3 3 3 1 4 1 4 3 2 2 2",
  "2 2 2 2 3 1 4 3 4 4 4 1 3 1 2 4 2 1 3 1 3 2 3 3 2 2 3 1 3 3 1 3 4 1 2 3 2",
  "4 4 4 1 2 2 3 4 3 4 3 2 3 4",
] as const;
type SourceRange = readonly [page:number, first:number, last:number];
const PART1_PAGE_STARTS:readonly SourceRange[]=[
  [5,1,5],[6,6,10],[7,11,15],[8,16,20],[9,21,25],
  [10,26,30],[11,31,35],[12,36,39],[13,40,44],[14,45,49],
  [15,50,53],[16,54,58],[17,59,62],[18,63,68],[19,69,70],
  [20,71,74],[21,75,78],[22,79,81],[23,82,86],[24,87,91],
  [25,92,93],[26,94,98],[27,99,103],[28,104,107],[29,108,112],
  [30,113,118],[31,119,124],[32,125,125],
];
const PART2_PAGE_STARTS:readonly SourceRange[]=[
  [5,1,4],[6,5,9],[7,10,14],[8,15,20],[9,21,24],
  [10,25,28],[11,29,32],[12,33,36],[13,37,40],[14,41,46],
  [15,47,51],[16,52,55],[17,56,60],[18,61,66],[19,67,70],
  [20,71,73],[21,74,79],[22,80,83],[23,84,88],[24,89,93],
  [25,94,99],[26,100,105],[27,106,110],[28,111,115],[29,116,121],
  [30,122,124],[31,125,125],
];
function buildSourceIndex(volume:PhysicsVolume, columns:readonly string[], ranges:readonly SourceRange[]){
  const answers=columns.flatMap(column=>column.trim().split(/\s+/));
  if(answers.length!==125 || answers.some(answer=>!/^[1-4]$/.test(answer)))
    throw new Error("Ֆիզիկայի սկանավորված գրքի առաջին 125 պատասխանները ամբողջական չեն։");
  const pageByQuestion=new Map<number,number>();
  for(const [page,first,last] of ranges){
    for(let n=first;n<=last;n++){
      if(pageByQuestion.has(n)||n<1||n>125)throw new Error("Ֆիզիկայի առաջադրանքների էջերի համարները կրկնվում են։");
      pageByQuestion.set(n,page);
    }
  }
  if(pageByQuestion.size!==125)throw new Error("Ֆիզիկայի էջերի և առաջադրանքների կապը թերի է։");
  return answers.map((answer,i)=>({
    id:"physics-scan-"+volume+"-"+(i+1),
    volume,number:i+1,page:pageByQuestion.get(i+1)!,
    keyPage:volume===61?406:409,
    answer:answer as PhysicsIndexedQuestion["answer"],
    source:"original-scan" as const,type:"choice" as const,
  }));
}
const BOOK1=buildSourceIndex(61,PART1_ANSWER_COLUMNS,PART1_PAGE_STARTS);
const BOOK2=buildSourceIndex(62,PART2_ANSWER_COLUMNS,PART2_PAGE_STARTS);
export const PHYSICS_SCAN_INDEX:readonly PhysicsIndexedQuestion[]=[...BOOK1,...BOOK2];
export function physicsIndexedQuestions(volume:PhysicsVolume):PhysicsIndexedQuestion[]{
  return [...(volume===61?BOOK1:BOOK2)];
}
export function lookupPhysicsIndexedQuestion(volume:PhysicsVolume,number:number){
  if(!Number.isInteger(number)||number<1||number>125)return null;
  return (volume===61?BOOK1:BOOK2)[number-1]??null;
}
export function scorePhysicsScan(
  questions:readonly PhysicsIndexedQuestion[],answers:Readonly<Record<string,string>>,
){
  let correct=0,answered=0;
  for(const q of questions){
    const chosen=answers[q.id];
    if(chosen && /^[1-4]$/.test(chosen)){
      answered++;
      if(chosen===q.answer)correct++;
    }
  }
  return {correct,answered,total:questions.length};
}
export function physicsScanRound(
  volume:PhysicsVolume,from:number,count:number,random=false,
  rng:()=>number=Math.random,
):PhysicsIndexedQuestion[]{
  if(!Number.isInteger(from)||!Number.isInteger(count)||from<1||from>125||
     count<1||count>125)throw new Error("Սկզբնական համարը կամ քանակը սխալ է։");
  const available=physicsIndexedQuestions(volume).filter(item=>item.number>=from);
  const result=[...available];
  if(random){
    for(let i=result.length-1;i>0;i--){
      const value=rng();
      const j=Math.max(0,Math.min(i,Math.floor((Number.isFinite(value)?value:0)*(i+1))));
      [result[i],result[j]]=[result[j]!,result[i]!];
    }
  }
  return result.slice(0,count);
}
