import { useMemo, useState } from "react";
import { CheckCircle2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTx } from "@/lib/lang";

export const TRUE_FALSE_ITEMS = [
  { statement:"Մարդու սիրտն ունի չորս խոռոչ։",truth:true,reason:"Երկու նախասիրտ և երկու փորոք։",subject:"Կենսաբանություն" },
  { statement:"Բոլոր բակտերիաներն ունեն բջջակորիզ։",truth:false,reason:"Բակտերիաները նախակորիզավորներ են և թաղանթով սահմանազատված կորիզ չունեն։",subject:"Կենսաբանություն" },
  { statement:"Ֆոտոսինթեզի ընթացքում բույսերը սովորաբար օգտագործում են ածխաթթու գազ։",truth:true,reason:"Ածխաթթու գազը լուսասինթեզի ելանյութերից մեկն է։",subject:"Կենսաբանություն" },
  { statement:"Քառակուսին ունի երեք անկյուն։",truth:false,reason:"Քառակուսին ունի չորս անկյուն և չորս կողմ։",subject:"Մաթեմատիկա" },
  { statement:"2³ = 8։",truth:true,reason:"2 × 2 × 2 = 8։",subject:"Մաթեմատիկա" },
  { statement:"Զրոն պարզ թիվ է։",truth:false,reason:"Պարզ բնական թիվն ունի ճիշտ երկու դրական բաժանարար։",subject:"Մաթեմատիկա" },
  { statement:"The comparative form of good is better.",truth:true,reason:"Good → better → best.",subject:"English" },
  { statement:"'She go to school' is correct in standard present simple English.",truth:false,reason:"Third-person singular requires 'goes': She goes to school.",subject:"English" },
  { statement:"A triangle has an angle sum of 180° in Euclidean geometry.",truth:true,reason:"Եվկլիդեսյան հարթության ցանկացած եռանկյան անկյունների գումարը 180° է։",subject:"Մաթեմատիկա" },
  { statement:"An adjective always names an action.",truth:false,reason:"Adjectives describe qualities; verbs express actions or states.",subject:"English" },
  { statement:"ԴՆԹ-ն ժառանգական տեղեկության կրողներից է։",truth:true,reason:"ԴՆԹ-ն պահպանում է օրգանիզմի ժառանգական տեղեկությունը։",subject:"Կենսաբանություն" },
  { statement:"Ջուրը կազմված է միայն ջրածնի ատոմներից։",truth:false,reason:"H₂O-ը պարունակում է ջրածին և թթվածին։",subject:"Քիմիա" },
] as const;
export const MATCH_PAIRS = [
  {left:"Միտոքոնդրիում",right:"Էներգիայի արտադրություն",subject:"Կենսաբանություն"},
  {left:"Ռիբոսոմ",right:"Սպիտակուցների սինթեզ",subject:"Կենսաբանություն"},
  {left:"Քլորոպլաստ",right:"Ֆոտոսինթեզ",subject:"Կենսաբանություն"},
  {left:"Սիրտ",right:"Արյան շրջանառություն",subject:"Կենսաբանություն"},
  {left:"Հիպոթենուզ",right:"Ուղղանկյուն եռանկյան ամենաերկար կողմ",subject:"Մաթեմատիկա"},
  {left:"Ուղղանկյուն",right:"Չորս ուղիղ անկյուն",subject:"Մաթեմատիկա"},
  {left:"Գումար",right:"Գումարման արդյունք",subject:"Մաթեմատիկա"},
  {left:"Արմատ",right:"x² = a հավասարման հնարավոր լուծում",subject:"Մաթեմատիկա"},
  {left:"Reliable",right:"Վստահելի",subject:"English"},
  {left:"Despite",right:"Չնայած",subject:"English"},
  {left:"Eventually",right:"Ի վերջո",subject:"English"},
  {left:"Accurate",right:"Ճշգրիտ",subject:"English"},
] as const;

function mix<T>(values:readonly T[]) {
  const a=[...values];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j]!,a[i]!];}
  return a;
}
type GameSubject="all"|"Կենսաբանություն"|"Մաթեմատիկա"|"English"|"Քիմիա";
export function TrueFalseGame({subject}:{subject:GameSubject}){
  const tx=useTx();
  const [round,setRound]=useState(0);
  const items=useMemo(()=>mix(TRUE_FALSE_ITEMS.filter(q=>subject==="all"||q.subject===subject)).slice(0,12),[subject,round]);
  const [index,setIndex]=useState(0);
  const [choice,setChoice]=useState<boolean|null>(null);
  const [score,setScore]=useState(0);
  const current=items[index];
  const complete=index>=items.length;
  const reset=()=>{setRound(v=>v+1);setIndex(0);setChoice(null);setScore(0)};
  return <section className="space-y-5 rounded-3xl border bg-card p-5 shadow-sm sm:p-8">
    {complete?<div className="space-y-4 text-center">
      <CheckCircle2 className="mx-auto size-12 text-primary"/>
      <h2 className="text-2xl font-black">{tx("Խաղն ավարտվեց")}</h2><p>{tx("Արդյունք")}՝ {score} / {items.length}</p>
      <Button onClick={reset}><RefreshCw className="mr-2 size-4"/>{tx("Կրկին խաղալ")}</Button>
    </div>:current ? <>
      <div className="flex justify-between gap-3 text-sm text-muted-foreground">
        <span className="font-bold">{tx("Ճի՞շտ, թե՞ սխալ")}</span><span>{index+1} / {items.length}</span>
      </div>
      <progress className="h-2 w-full accent-primary" value={index} max={items.length}/>
      <h2 className="min-h-28 text-center text-xl font-black leading-relaxed sm:text-2xl">{current.statement}</h2>
      <div className="grid grid-cols-2 gap-3">
        <Button size="lg" disabled={choice!==null} variant={choice===true?"default":"outline"} onClick={()=>{setChoice(true);if(current.truth)setScore(v=>v+1)}}>{tx("Ճիշտ է")}</Button>
        <Button size="lg" disabled={choice!==null} variant={choice===false?"default":"outline"} onClick={()=>{setChoice(false);if(!current.truth)setScore(v=>v+1)}}>{tx("Սխալ է")}</Button>
      </div>
      {choice!==null && <div className="space-y-3 rounded-2xl border bg-muted/30 p-4" role="status">
        <p className="font-bold">{choice===current.truth?tx("Ճիշտ պատասխան"):tx("Սխալ պատասխան")}</p>
        <p className="text-sm leading-relaxed">{current.reason}</p>
        <Button className="w-full" onClick={()=>{setIndex(i=>i+1);setChoice(null)}}>{tx(index===items.length-1?"Ավարտել":"Հաջորդ հարցը")}</Button>
      </div>}
    </>:<p>{tx("Այս առարկայի համար առայժմ համապատասխան հարցեր չկան։")}</p>}
  </section>;
}

export function MatchingGame({subject}:{subject:GameSubject}){
  const tx=useTx();
  const [round,setRound]=useState(0);
  const pairs=useMemo(()=>mix(MATCH_PAIRS.filter(p=>subject==="all"||p.subject===subject)).slice(0,6),[subject,round]);
  const [rightItems,setRightItems]=useState(()=>mix(pairs.map(p=>p.right)));
  const [left,setLeft]=useState<string|null>(null);
  const [matched,setMatched]=useState<string[]>([]);
  const [mistakes,setMistakes]=useState(0);
  const [feedback,setFeedback]=useState("");
  const reset=()=>{setRound(n=>n+1);setLeft(null);setMatched([]);setMistakes(0);setFeedback("");setRightItems(mix(pairs.map(p=>p.right)))};
  // Reseed answer choices whenever the subject or round changes.
  const right=useMemo(()=>mix(pairs.map(p=>p.right)),[pairs]);
  const complete=pairs.length>0&&matched.length===pairs.length;
  function choose(value:string){
    if(!left||matched.includes(left))return;
    const pair=pairs.find(p=>p.left===left);
    if(pair?.right===value){setMatched(v=>[...v,left]);setFeedback(tx("Ճիշտ է"));setLeft(null);}
    else{setMistakes(v=>v+1);setFeedback(tx("Փորձիր կրկին"));}
  }
  return <section className="space-y-5 rounded-3xl border bg-card p-5 shadow-sm sm:p-8">
    {complete?<div className="space-y-4 text-center">
      <CheckCircle2 className="mx-auto size-12 text-primary"/>
      <h2 className="text-2xl font-black">{tx("Բոլոր զույգերը գտնված են")}</h2>
      <p>{tx("Սխալ փորձեր")}՝ {mistakes}</p>
      <Button onClick={reset}><RefreshCw className="mr-2 size-4"/>{tx("Նոր խաղ")}</Button>
    </div>:!pairs.length ? <p>{tx("Այս առարկայի համար զույգեր դեռ չկան։")}</p> : <>
      <div className="flex justify-between gap-2 text-sm font-semibold">
        <p>{tx("Գտիր համապատասխան զույգերը")}</p><p>{matched.length} / {pairs.length}</p>
      </div>
      <p className="text-xs text-muted-foreground">{tx("Նախ սեղմիր ձախ կողմի տերմինը, հետո՝ աջ կողմի բացատրությունը։")}</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-2">{pairs.map(pair=><button key={pair.left} type="button" disabled={matched.includes(pair.left)}
          aria-pressed={left===pair.left} onClick={()=>{setLeft(pair.left);setFeedback("")}}
          className={"min-h-16 rounded-xl border p-2 text-left text-xs font-semibold sm:text-sm "+
            (matched.includes(pair.left)?"border-emerald-500 bg-emerald-500/10 opacity-60":
            left===pair.left?"border-primary bg-primary/10":"bg-background hover:border-primary")}>{pair.left}</button>)}</div>
        <div className="grid gap-2">{right.map(value=><button key={value} type="button"
          disabled={pairs.some(p=>matched.includes(p.left)&&p.right===value)}
          onClick={()=>choose(value)}
          className={"min-h-16 rounded-xl border p-2 text-left text-xs font-semibold sm:text-sm "+
            (pairs.some(p=>matched.includes(p.left)&&p.right===value)?"border-emerald-500 bg-emerald-500/10 opacity-60":"bg-background hover:border-primary")}>{value}</button>)}</div>
      </div>
      {feedback&&<p role="status" className="text-sm font-bold text-primary">{feedback}</p>}
    </>}
  </section>;
}
