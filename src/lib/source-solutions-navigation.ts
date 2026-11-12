import type { MathBookTask } from "./math-bank";

export const SOURCE_TASK_PAGE_SIZE = 3;
type IndexedTask = Pick<MathBookTask, "task" | "sub_count" | "answers">;

/** Safe numeric navigation: printed numbers need not be consecutive. */
export function findSourceTaskIndex(tasks: readonly IndexedTask[], raw: string): number {
  const input=raw.trim();
  if(!/^[1-9]\d*$/.test(input))return -1;
  const printedNumber=Number(input);
  if(!Number.isSafeInteger(printedNumber))return -1;
  return tasks.findIndex(task=>task.task===printedNumber);
}
export function sourceTaskPage(taskIndex: number): number {
  return Math.floor(taskIndex / SOURCE_TASK_PAGE_SIZE);
}

/** Preview a fixed number of sub-questions without exposing later task keys. */
export function guestSubQuestionLimit(tasks: readonly IndexedTask[], taskIndex: number, max=2): number {
  if(taskIndex<0||taskIndex>=tasks.length)return 0;
  const previous=tasks.slice(0,taskIndex).reduce((total,task)=>
    total+(task.answers?.length??task.sub_count),0);
  const task=tasks[taskIndex]!;
  return Math.max(0,Math.min(task.answers?.length??task.sub_count,max-previous));
}
