import type {Unit} from "@/lib/books";
export type PhysicsSourceEntry={
  id:string;book:61|62;number:number;page:number;answerKeyPage:number;
  section:string;kind:"mc";stem:string;options:Record<string,string>;
  answer:string;explanation:string;status:"source-reviewed";
};
export type PhysicsTranscriptionBank={
  format:"shtemarm-physics-source-v1";provenance:string;items:PhysicsSourceEntry[];
};
export async function loadPhysicsOriginalBank():Promise<PhysicsTranscriptionBank>{
  const response=await fetch("/data/physics-original-transcribed.json");
  if(!response.ok)throw new Error("Բնօրինակ ֆիզիկայի հարցաշարը չհաջողվեց բեռնել։");
  const bank=await response.json() as PhysicsTranscriptionBank;
  validatePhysicsOriginalBank(bank);
  return bank;
}
export function validatePhysicsOriginalBank(bank:PhysicsTranscriptionBank):number{
  if(bank.format!=="shtemarm-physics-source-v1"||!Array.isArray(bank.items))
    throw new Error("Բնօրինակների հարցաշարի կառուցվածքը սխալ է։");
  const ids=new Set<string>();
  const numbers=new Set<string>();
  for(const q of bank.items){
    const key=q.book+":"+q.number;
    if((q.book!==61&&q.book!==62)||!Number.isInteger(q.number)||q.number<1||
      !Number.isInteger(q.page)||q.page<5||q.page> (q.book===61?430:436) ||
      q.answerKeyPage!==(q.book===61?406:409) ||q.kind!=="mc" ||
      !["1","2","3","4"].includes(q.answer) || q.status!=="source-reviewed" ||
      q.options[q.answer]?.trim().length===0 ||Object.keys(q.options).length!==4 ||
      q.stem.trim().length<15 || q.explanation.trim().length<15 ||ids.has(q.id) ||
      numbers.has(key))throw new Error("Վնասված կամ չստուգված հարց՝ "+q.id);
    ids.add(q.id);numbers.add(key);
  }
  return bank.items.length;
}
export function sourceAsUnit(q:PhysicsSourceEntry):Unit{
  return {id:q.id,kind:"mc",label:String(q.number),passage:"",
    questions:[{n:String(q.number),stem:q.stem,options:q.options,answer:q.answer,explanation:q.explanation}]};
}
export function sourceQuestionsForVolume(bank:PhysicsTranscriptionBank,volume:61|62){
  return bank.items.filter(q=>q.book===volume).sort((a,b)=>a.number-b.number);
}
