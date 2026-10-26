import { loadBook, shuffle } from "@/lib/books";
import { LEVEL_TEST_QUESTIONS } from "@/lib/levelTests";
export type MiniGameMode = "quick" | "marathon" | "biology" | "vocabulary" | "truefalse";
export type GameQuestion = { id:string; prompt:string; choices:string[]; answer:string; subject:string; explanation:string };
export const GAME_BLUEPRINTS: Readonly<Record<MiniGameMode,{size:number;title:string;description:string}>> = {
 quick:{size:12,title:"Արագ մարտահրավեր",description:"12 հարց՝ արագ կրկնության համար"},
 marathon:{size:25,title:"Գիտելիքների մարաթոն",description:"25 հարց՝ տարբեր առարկաներից"},
 biology:{size:20,title:"Կենսաբանության լաբորատորիա",description:"20 հարց կենսաբանության շտեմարանից"},
 vocabulary:{size:15,title:"Անգլերեն բառապաշար",description:"15 բառային հարց A1–C1 մակարդակներից"},
 truefalse:{size:20,title:"Ճիշտ, թե՞ սխալ",description:"20 պնդում՝ տարբեր առարկաներից"},
};
const mathRows: readonly [string,string[],string,string][] = [
 ["12 × 8 = ?",["96","86","108","88"],"96","12 × 8 = 96"],
 ["3x = 27, x = ?",["9","6","12","24"],"9","Երկու կողմը բաժանում ենք 3-ի։"],
 ["15%-ը 200-ից",["30","15","20","35"],"30","0.15 × 200 = 30"],
 ["7² = ?",["49","14","21","56"],"49","7 × 7 = 49"],
 ["√144 = ?",["12","11","14","24"],"12","12 × 12 = 144"],
 ["2⁵ = ?",["32","10","16","25"],"32","2-ի հինգերորդ աստիճանը 32 է։"],
 ["Եռանկյան ներքին անկյունների գումարը",["180°","90°","360°","270°"],"180°","Եռանկյան անկյունների գումարը 180° է։"],
 ["50-ի 20%-ը",["10","5","20","25"],"10","50 × 0.20 = 10"],
 ["(6 + 4) ÷ 2 = ?",["5","10","8","20"],"5","Սկզբում գումարում, ապա բաժանում։"],
 ["4x − 5 = 11. Գտնել x-ը։",["4","3","5","6"],"4","4x = 16, հետևաբար x = 4։"],
 ["Ուղղանկյան մակերեսը՝ կողմերը 5 և 8",["40","13","26","80"],"40","Մակերեսը կողմերի արտադրյալն է։"],
 ["3/4 + 1/4 = ?",["1","1/2","2","3/8"],"1","Գումարում ենք համարիչները։"],
];
const math:GameQuestion[]=mathRows.map(([prompt,choices,answer,explanation],i)=>({
 id:"math-"+i,prompt,choices,answer,explanation,subject:"Մաթեմատիկա",
}));
function fromBook(id:number,book:Awaited<ReturnType<typeof loadBook>>):GameQuestion[]{
 const subjects:Record<number,string>={31:"Կենսաբանություն",32:"Կենսաբանություն",51:"Ֆիզիկա",52:"Քիմիա",53:"Աշխարհագրություն",54:"Ռուսաց լեզու"};
 return book.sections.flatMap(section=>section.units.flatMap(unit=>{
   if(unit.kind!=="mc")return [];
   return unit.questions.flatMap(q=>{
     const entries=Object.entries(q.options??{});
     if(!q.stem?.trim()||entries.length<2||!q.options[q.answer])return [];
     return [{id:id+":"+section.n+":"+unit.id+":"+q.n,prompt:q.stem,choices:entries.map(([,v])=>v),
       answer:q.options[q.answer]!,subject:subjects[id]??"Կենսաբանություն",
       explanation:"Ստուգված պատասխանը՝ "+q.options[q.answer]+"։"}];
   });
 }));
}
function english(vocabularyOnly=false):GameQuestion[]{
 return Object.entries(LEVEL_TEST_QUESTIONS).flatMap(([level,questions])=>
   questions.filter(q=>!vocabularyOnly||q.skill==="vocabulary").map(q=>({
     id:"en-"+q.id,prompt:q.prompt,choices:[...q.options],answer:q.options[q.answerIndex]!,
     subject:"English "+level.toUpperCase(),explanation:q.explanation,
   })));
}
export async function createMiniGame(mode:MiniGameMode):Promise<GameQuestion[]>{
 let pool:GameQuestion[];
 if(mode==="biology"){
   const book=await loadBook(31);
   pool=fromBook(31,book);
 }else if(mode==="vocabulary"){
   pool=english(true);
 }else{
   const books=await Promise.all([51,52,53,54].map(loadBook));
   pool=[...math,...english(),...books.flatMap((book,i)=>fromBook(51+i,book))];
 }
 const size=GAME_BLUEPRINTS[mode].size;
 const selection=shuffle(pool).slice(0,size);
 if(selection.length!==size)throw new Error("Հարցաշարում բավարար առաջադրանքներ չկան։");
 if(mode==="truefalse"){
   return shuffle(selection.map((q,i)=>{
     const correct=i%2===0;
     const candidate=correct?q.answer:q.choices.find(opt=>opt!==q.answer)??q.answer;
     return {...q,id:"tf-"+q.id,prompt:q.prompt+"\nՃի՞շտ պատասխանն է՝ "+candidate+"։",
       choices:["Ճիշտ է","Սխալ է"],answer:correct?"Ճիշտ է":"Սխալ է"};
   }));
 }
 return selection.map(q=>({...q,choices:shuffle(q.choices)}));
}
