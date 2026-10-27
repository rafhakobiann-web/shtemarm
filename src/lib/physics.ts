import { loadBook, shuffle, type Book, type Unit } from "./books";
import { GTC_BLUEPRINTS, assertBlueprint } from "./gtc-blueprints";
import { historyBookEntries, type HistoryEntry } from "./history";

/**
 * These are ORIGINAL study questions aligned to the official exam response
 * structure. They are NOT a transcription of, or replacement for, the two
 * copyrighted GTC physics collections.
 */
export const PHYSICS_BOOK_IDS = [61, 62] as const;
export const PHYSICS_SOURCE = {
  guide: GTC_BLUEPRINTS.physics.guide,
  part1: "https://shtemaran.am/shtems/fizika-1",
  part2: "https://shtemaran.am/shtems/fizika-2",
} as const;
export async function loadPhysicsBooks():Promise<Book[]> {
  return Promise.all(PHYSICS_BOOK_IDS.map(id=>loadBook(id)));
}
export function physicsEntries(books:readonly Book[]):HistoryEntry[] {
  // Preserve six-claim bundles as one compound GTC-style task (6 points).
  // The generic history flattener splits all MC groups, unintentionally
  // changing the scoring and hiding claims from question-type filters.
  return books.flatMap(book=>book.sections.flatMap(section=>
    section.units.flatMap(unit=>{
      if(physicsSlotType(unit)==="claims"){
        return [{
          source:"book-"+book.id,
          section:"Գիրք "+book.id+" · "+(section.title??section.label??("Բաժին "+section.n)),
          unit:{...unit,id:"book-"+book.id+":"+section.n+":"+unit.id},
        } satisfies HistoryEntry];
      }
      return historyBookEntries({...book,sections:[{...section,units:[unit]}]},book.id);
    })
  ));
}
export function physicsSlotType(u:Unit):"choice"|"short"|"claims" {
  if(u.kind==="num")return "short";
  if(u.kind==="mc" && u.questions.length===6 &&
    /վեց պնդում/i.test(u.passage))return "claims";
  return "choice";
}
export function checkPhysicsBook(book:Book) {
  if(!PHYSICS_BOOK_IDS.includes(book.id as (typeof PHYSICS_BOOK_IDS)[number]))
    throw new Error("Ֆիզիկայի գրքի անհայտ համար։");
  const units=book.sections.flatMap(s=>s.units);
  const choice=units.filter(u=>physicsSlotType(u)==="choice");
  const short=units.filter(u=>physicsSlotType(u)==="short");
  const claims=units.filter(u=>physicsSlotType(u)==="claims");
  const slots=short.reduce((n,u)=>n+(u.kind==="num"?u.questions.length:0),0);
  if(choice.length!==40||short.length!==13||slots!==28||claims.length!==2||units.length!==55)
    throw new Error("Ֆիզիկայի հեղինակային մասի կառուցվածքը սխալ է։");
  const ids=new Set(units.map(u=>u.id));
  if(ids.size!==units.length)throw new Error("Առաջադրանքների ID-ները կրկնվում են։");
  for(const u of units){
    const type=physicsSlotType(u);
    if(type==="short"){
      if(u.kind!=="num"||u.questions.length<1||u.questions.length>4)
        throw new Error("Թվային խնդրում պետք է լինի 1–4 ենթահարց։");
      for(const q of u.questions)if(!/^\d{1,4}$/.test(q.answer))
        throw new Error("Թվային պատասխանները պետք է լինեն 0–9999 ամբողջ թվեր։");
    }else if(type==="claims"){
      if(u.kind!=="mc"||u.questions.length!==6||
        !u.questions.every(q=>q.answer==="1"||q.answer==="2"))
        throw new Error("Պնդումների փունջը պետք է պարունակի վեց պնդում։");
    }else{
      if(u.kind!=="mc"||u.questions.length!==1||
         Object.keys(u.questions[0]!.options).length!==4||
         !u.questions[0]!.options[u.questions[0]!.answer])
         throw new Error("Ընտրովի առաջադրանքը պետք է ունենա չորս տարբերակ և մեկ ճիշտ պատասխան։");
    }
  }
  return {taskCount:units.length,choice:choice.length,shortGroups:short.length,shortSlots:slots,
    claims:claims.length,maxPoints:40+slots+claims.length*6,answerSlots:40+slots+claims.length};
}
export function selectPhysicsSource(books:readonly Book[],source:string):Book[]{
  const selected=source==="all"?books:books.filter(b=>String(b.id)===source);
  if(!selected.length)throw new Error("Ընտրված ֆիզիկայի մասի հարցերը հասանելի չեն։");
  selected.forEach(checkPhysicsBook);
  return selected;
}
function chooseNumericalGroups(groups:Unit[],random:boolean):Unit[] {
  const order=random?shuffle(groups):[...groups];
  // Exactly 13 actual physical problems containing exactly 28 numeric answers.
  // DP avoids losing official short-answer slot quotas when combining books.
  const dp:Array<Map<number,Unit[]>>=Array.from({length:14},()=>new Map());
  dp[0]!.set(0,[]);
  for(const u of order){
    const n=u.kind==="num"?u.questions.length:0;
    for(let count=12;count>=0;count--){
      for(const [slots,chosen] of [...dp[count]!.entries()]){
        if(slots+n<=28 && !dp[count+1]!.has(slots+n))
          dp[count+1]!.set(slots+n,[...chosen,u]);
      }
    }
  }
  const found=dp[13]!.get(28);
  if(!found)throw new Error("Թվային ենթահարցերի կառուցվածքը չի լրացվում։");
  return found;
}
export function makePhysicsModel(
  books:readonly Book[],source:string,random=true,
):{units:Unit[];bookId:number;totalPoints:number;answerSlots:number;mainTasks:number} {
  assertBlueprint(GTC_BLUEPRINTS.physics);
  const selected=selectPhysicsSource(books,source);
  const units=selected.flatMap(b=>b.sections.flatMap(s=>s.units));
  const pick=(items:Unit[],n:number)=>(random?shuffle(items):items).slice(0,n);
  const choice=pick(units.filter(u=>physicsSlotType(u)==="choice"),40);
  const short=chooseNumericalGroups(units.filter(u=>physicsSlotType(u)==="short"),random);
  const claims=pick(units.filter(u=>physicsSlotType(u)==="claims"),2);
  if(choice.length!==40||short.length!==13||claims.length!==2)throw new Error("Թեստի կառուցվածքը բավարար չէ։");
  let numeric=41;
  const numberedChoice=choice.map((u,i)=>({
    ...u,label:String(i+1),
    questions:u.kind==="mc"?u.questions.map(q=>({...q,n:String(i+1)})):[],
  }) as Unit);
  const numberedShort=short.map(u=>{
    if(u.kind!=="num")throw new Error("Incorrect physics short-answer grouping");
    const start=numeric;
    const questions=u.questions.map(q=>({...q,n:String(numeric++)}));
    return {...u,label:questions.length===1?String(start):start+"–"+(numeric-1),questions};
  });
  const numberedClaims=claims.map((u,i)=>{
    if(u.kind!=="mc")throw new Error("Invalid claims task");
    const label=String(i+69);
    return {...u,label,questions:u.questions.map((q,j)=>({...q,n:label+"."+(j+1)}))};
  });
  const result=[...numberedChoice,...numberedShort,...numberedClaims];
  const points=result.reduce((sum,u)=>sum+(u.kind==="mc"||u.kind==="num"?u.questions.length:1),0);
  if(result.length!==55||points!==80||numeric!==69)
    throw new Error("Ֆիզիկայի փորձնական թեստի 55/70/80 կառուցվածքը չի պահպանվել։");
  return {units:result,bookId:source==="all"?60:selected[0]!.id,totalPoints:80,answerSlots:70,mainTasks:55};
}
