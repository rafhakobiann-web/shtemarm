import type { Progress } from "@/lib/progress";
import type { OnboardingSubject } from "@/lib/onboarding";
import type { UnitMistake } from "@/lib/unitMistakes";
import { ALL_BOOKS } from "@/lib/books";

export type ExamReadiness = {
  answered:number; correct:number; accuracy:number|null;
  validExams:number; examAverage:number|null;
  pendingMistakes:number; subjectPriorities:{subject:OnboardingSubject;pending:number}[];
  evidence:"insufficient"|"partial"|"available";
  nextSteps:("practice"|"exam"|"review")[];
};

/** Readiness is evidence, not a predicted official exam score or pass probability. */
export function examReadiness(
  progress:Pick<Progress,"answers"|"exams">,
  mistakes:readonly Pick<UnitMistake,"subject"|"mastered">[],
  selected:readonly OnboardingSubject[],
):ExamReadiness{
  const answers=Object.values(progress.answers).filter(v=>v===0||v===1);
  const answered=answers.length,correct=answers.filter(v=>v===1).length;
  const valid=progress.exams.filter(e=>e.total>0&&e.score>=0&&e.score<=e.total&&ALL_BOOKS.some(b=>b.id===e.book));
  const examAverage=valid.length?Math.round(valid.reduce((sum,e)=>sum+100*e.score/e.total,0)/valid.length):null;
  const subjects=[...new Set(selected)];
  const subjectPriorities=subjects.map(subject=>({subject,pending:mistakes.filter(m=>m.subject===subject&&!m.mastered).length})).sort((a,b)=>b.pending-a.pending);
  const pendingMistakes=mistakes.filter(m=>!m.mastered).length;
  const evidence=valid.length>=2&&answered>=20?"available":valid.length>0||answered>0?"partial":"insufficient";
  const nextSteps:ExamReadiness["nextSteps"]=[];
  if(pendingMistakes>0)nextSteps.push("review");
  if(answered<20||subjectPriorities.some(s=>s.pending>0))nextSteps.push("practice");
  if(valid.length<2)nextSteps.push("exam");
  return {answered,correct,accuracy:answered?Math.round(100*correct/answered):null,
    validExams:valid.length,examAverage,pendingMistakes,subjectPriorities,evidence,nextSteps};
}
