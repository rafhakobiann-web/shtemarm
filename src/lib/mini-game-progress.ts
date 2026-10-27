/** Mini-games use only local device storage; no sign-in or network required. */
export type MiniGameMode = "quiz" | "truefalse" | "matching" | "flashcards";
export type MiniGameResult = { correct:number; total:number; at:string };
type Store = Record<string,MiniGameResult>;
const KEY="shtemarm-mini-games-v3";
const id=(mode:MiniGameMode,subject:string)=>mode+":"+subject;
function read():Store {
  if(typeof window==="undefined")return {};
  try {
    const json=JSON.parse(window.localStorage.getItem(KEY)??"{}");
    return json && typeof json==="object"&&!Array.isArray(json)?json:{};
  }catch {return {};}
}
function save(data:Store){
  try {window.localStorage.setItem(KEY,JSON.stringify(data));}catch{/* device storage blocked */}
}
export function bestResult(mode:MiniGameMode,subject:string):MiniGameResult|null{
  const result=read()[id(mode,subject)];
  if(!result||!Number.isFinite(result.correct)||!Number.isFinite(result.total)||result.total<=0)return null;
  return result;
}
export function recordResult(mode:MiniGameMode,subject:string,correct:number,total:number){
  if(!Number.isInteger(total)||total<=0||!Number.isInteger(correct)||correct<0||correct>total)return null;
  const old=bestResult(mode,subject);
  // Compare percentages, then favor a longer round when percentage is equal.
  if(old && (old.correct/old.total>correct/total ||
    (old.correct/old.total===correct/total && old.total>=total)))return old;
  const value={correct,total,at:new Date().toISOString()};
  save({...read(),[id(mode,subject)]:value});
  return value;
}
