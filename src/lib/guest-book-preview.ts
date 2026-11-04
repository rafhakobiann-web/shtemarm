import { ALL_BOOKS, type Book, type Unit, type Section } from "@/lib/books";
import type { MathBookIndex } from "@/lib/math-bank";
import type { GuestLang } from "@/lib/guest-demo";

export const GUEST_BOOK_LIMIT = 2 as const;
export type PreviewCategory = "all" | "english" | "math" | "history" | "biology" | "armenian" | "physics" | "other";
export type GuestBookMeta = { id: string; title: string; sub: string; cover: string; category: Exclude<PreviewCategory,"all">; regularId?: number };

export const GUEST_BOOKS: readonly GuestBookMeta[] = [
  ...ALL_BOOKS.map(({id,title,sub,cover})=>({
    id:String(id), title, sub, cover, regularId:id,
    category:(id<=3?"english":id<=23?"history":id<=34?"biology":
      id<=44?"armenian":id===51||id>=61?"physics":"other") as Exclude<PreviewCategory,"all">,
  })),
  {id:"matem-1",title:"Մաթեմատիկա",sub:"Մաս I",cover:"/covers/math-1.svg",category:"math"},
  {id:"matem-2",title:"Մաթեմատիկա",sub:"Մաս II",cover:"/covers/math-2.svg",category:"math"},
];

/** The guest UI only renders these two answerable items from the selected book.
 *  The original order, stem, answer, and source identifiers are preserved.
 *  The rest of the book is *never* rendered as an unlocked guest exercise.
 *  WARNING: original public /data files need a future authenticated API if
 *  downloading the underlying bank itself must also be restricted.
 */
export type GuestBookQuestion = {
  id:string; section:string; printedNo:string; passage?:string;
  stem:string; options:{key:string;value:string}[];
  answer:string; kind:"choice"|"number"; explanation?:string;
};

export function pickGuestBookQuestions(book:Book, limit:number=GUEST_BOOK_LIMIT):GuestBookQuestion[] {
  if(!Number.isInteger(limit)||limit<1)return [];
  const out:GuestBookQuestion[]=[];
  for(const section of book.sections){
    const sectionName=section.label||section.title||`Բաժին ${section.n}`;
    for(const unit of section.units){
      if(unit.kind!=="mc"&&unit.kind!=="num")continue;
      const passage=typeof unit.passage==="string"?unit.passage.trim()||undefined:undefined;
      for(let i=0;i<unit.questions.length;i++){
        const q=unit.questions[i]!;
        if(typeof q.stem!=="string"||typeof q.answer!=="string"||!q.stem.trim()||!q.answer.trim()||/still being processed|question text unavailable|հարցի տեքստը դեռ/i.test(q.stem))continue;
        const options=unit.kind==="mc"
          ? Object.entries(q.options||{}).filter(([key,value])=>key.trim()&&typeof value==="string"&&value.trim()).map(([key,value])=>({key,value}))
          : [];
        if(unit.kind==="mc"&&(!options.length||!options.some(x=>x.key===q.answer)))continue;
        out.push({
          id:`${book.id}:${section.n}:${unit.id}:${i}`,section:sectionName,
          printedNo:q.n,stem:q.stem,passage,options,answer:q.answer,
          kind:unit.kind==="mc"?"choice":"number",explanation:q.explanation,
        });
        if(out.length>=limit)return out;
      }
    }
  }
  return out;
}

/** Math uses its separate, already existing source index. We show at most two
 * text-transcribed questions with verified answer values and no PDFs or crops.
 */
export function pickGuestMathQuestions(index:MathBookIndex,bookId:"matem-1"|"matem-2",limit:number=GUEST_BOOK_LIMIT):GuestBookQuestion[] {
  if(!Number.isInteger(limit)||limit<1)return [];
  const out:GuestBookQuestion[]=[];
  const book=index.books[bookId];
  if(!book)return out;
  for(const section of book.sections){
    for(const task of section.tasks){
      for(let i=0;i<task.sub_count;i++){
        const q=task.questions?.[i];
        const answer=task.answers?.[i]?.trim();
        if(typeof q?.prompt!=="string"||!q.prompt.trim()||!answer||/still being processed|question text unavailable|հարցի տեքստը դեռ/i.test(q.prompt))continue;
        const optionTexts=(q.options||[]).filter(Boolean);
        const isChoice=/^[1-4]$/.test(answer)&&optionTexts.length>=Number(answer);
        out.push({
          id:`${bookId}:${section.chapter}:${section.section}:${task.task}:${i}`,
          section:section.title||`Գլուխ ${section.chapter} · Բաժին ${section.section}`,
          printedNo:`${task.task}.${i+1}`,stem:q.prompt,
          options:isChoice?optionTexts.map((value,j)=>({key:String(j+1),value})):[],
          answer,kind:isChoice?"choice":"number",
        });
        if(out.length>=limit)return out;
      }
    }
  }
  return out;
}


/** Guest preview is scoped to a SECTION, not a whole book.
 * English source units are complete exercises ("Text 1", "Text 2" ...):
 * a reading passage may contain five separate questions and must never be
 * truncated to two isolated MC questions. Non-English books give two
 * individual answerable questions per section; set/seq/match units count
 * as a single complete exercise where a section has no MC/NUM questions.
 */
export type GuestPreviewItem =
  | {type:"question";id:string;question:GuestBookQuestion}
  | {type:"unit";id:string;unit:Unit; label:string};
export type GuestPreviewSection = {
  id:string; label:string; instruction:string; instructionEn:string;
  items:GuestPreviewItem[]; totalExercises:number; textBased:boolean;
};

function usableQuestion(kind:"mc"|"num",q:{stem:string;answer:string;options?:Record<string,string>}):boolean {
  if(typeof q.answer!=="string"||!q.answer.trim())return false;
  if(typeof q.stem!=="string"||/still being processed|question text unavailable|հարցի տեքստը դեռ/i.test(q.stem))return false;
  if(kind==="num")return !!q.stem.trim();
  const options=Object.entries(q.options||{}).filter(([k,v])=>!!k&&typeof v==="string"&&!!v.trim());
  return !!q.stem.trim()||options.length>0; // English cloze questions may have an empty printed stem.
}
function validExercise(u:Unit):boolean {
  if(u.kind==="mc"||u.kind==="num")return u.questions.some(q=>usableQuestion(u.kind,q));
  if(!u.passage.trim())return false;
  return u.kind==="match"?Object.keys(u.answer).length>0:u.answer.length>0||u.kind==="set";
}
function questionItem(bookId:number,section:Section,u:Extract<Unit,{kind:"mc"|"num"}>,i:number):GuestPreviewItem|null {
  const q=u.questions[i]!;
  if(!usableQuestion(u.kind,q))return null;
  const options=u.kind==="mc"?
    Object.entries(q.options||{}).filter(([k,v])=>k.trim()&&typeof v==="string"&&v.trim()).map(([key,value])=>({key,value})):[];
  if(u.kind==="mc"&&!options.some(x=>x.key===q.answer))return null;
  const question:GuestBookQuestion={
    id:`${bookId}:${section.n}:${u.id}:${i}`,section:section.label||section.title||`Բաժին ${section.n}`,
    printedNo:q.n, passage:typeof u.passage==="string"?u.passage.trim()||undefined:undefined,
    stem:q.stem,options,answer:q.answer,kind:u.kind==="mc"?"choice":"number",explanation:q.explanation,
  };
  return {type:"question",id:question.id,question};
}

export function pickGuestBookSections(book:Book,limit:number=GUEST_BOOK_LIMIT):GuestPreviewSection[] {
  return book.sections.map((section)=>{
    const english=book.id>=1&&book.id<=3;
    const textBased=english && section.units.some(u=>u.passage?.trim()&&/(?:text\s*\d+|\d+-\d+-text)/i.test(u.label+" "+u.id));
    const items:GuestPreviewItem[]=[];
    // English: two complete source exercises/texts, including ALL their
    // subquestions; not two individual MC answers inside one text.
    if(english){
      for(const u of section.units){
        if(!validExercise(u))continue;
        items.push({type:"unit",id:`${book.id}:${section.n}:${u.id}`,unit:u,label:u.label||u.id});
        if(items.length>=limit)break;
      }
    }else{
      for(const u of section.units){
        if(u.kind==="mc"||u.kind==="num"){
          for(let i=0;i<u.questions.length;i++){
            const item=questionItem(book.id,section,u,i);
            if(item)items.push(item);
            if(items.length>=limit)break;
          }
        }else if(validExercise(u))items.push({type:"unit",id:`${book.id}:${section.n}:${u.id}`,unit:u,label:u.label||u.id});
        if(items.length>=limit)break;
      }
    }
    return {
      id:String(section.n),label:section.label||section.title||`Բաժին ${section.n}`,
      instruction:section.instr_hy,instructionEn:section.instr_en,items,
      totalExercises:english?section.units.length:section.units.reduce((n,u)=>n+(u.kind==="mc"||u.kind==="num"?u.questions.length:1),0),
      textBased,
    };
  });
}

export function pickGuestMathSections(index:MathBookIndex,bookId:"matem-1"|"matem-2",limit:number=GUEST_BOOK_LIMIT):GuestPreviewSection[] {
  const book=index.books[bookId];
  if(!book)return [];
  return book.sections.map(section=>{
    const items:GuestPreviewItem[]=[];
    for(const task of section.tasks){
      for(let i=0;i<task.sub_count;i++){
        const q=task.questions?.[i];
        const answer=task.answers?.[i]?.trim();
        if(typeof q?.prompt!=="string"||!q.prompt.trim()||!answer||/still being processed|question text unavailable|հարցի տեքստը դեռ/i.test(q.prompt))continue;
        const options=(q.options||[]).filter(v=>typeof v==="string"&&v.trim()).map((value,j)=>({key:String(j+1),value}));
        const isChoice=/^[1-4]$/.test(answer)&&options.some(x=>x.key===answer);
        const question:GuestBookQuestion={
          id:`${bookId}:${section.chapter}:${section.section}:${task.task}:${i}`,
          section:section.title||`Գլուխ ${section.chapter} · Բաժին ${section.section}`,
          printedNo:`${task.task}.${i+1}`,stem:q.prompt,
          options:isChoice?options:[],answer,kind:isChoice?"choice":"number",
        };
        items.push({type:"question",id:question.id,question});
        if(items.length>=limit)break;
      }
      if(items.length>=limit)break;
    }
    return {
      id:`${section.chapter}-${section.section}`,
      label:section.title||`Գլուխ ${section.chapter} · Բաժին ${section.section}`,
      instruction:"",instructionEn:"",items,
      totalExercises:section.tasks.reduce((n,task)=>n+task.sub_count,0),textBased:false,
    };
  });
}

export const GUEST_BOOK_TEXT: Record<GuestLang,{
  browse:string; title:string; description:string; all:string; categories:Record<PreviewCategory,string>;
  question:string; firstTwo:string; back:string; unlock:string; locked:string;
  rest:string; login:string; ready:string; explanation:string; correct:string; incorrect:string;
  check:string; next:string; restart:string; input:string; pending:string; failed:string;
  missing:string; preview:string; disclaimer:string; source:string; selected:string;
  sectionsLocked:string; count:string;
}> = {
  hy:{
    browse:"Դիտել բոլոր շտեմարանները",title:"Իրական շտեմարաններ",description:"Ընտրիր գիրք, փորձիր դրա առաջին 2 հարցը և բացահայտիր աշխատանքի ընթացքը։ Մնացած առաջադրանքները հասանելի են մուտք գործելուց հետո։",
    all:"Բոլորը",categories:{all:"Բոլորը",english:"Անգլերեն",math:"Մաթեմատիկա",history:"Հայոց պատմություն",biology:"Կենսաբանություն",armenian:"Հայոց լեզու",physics:"Ֆիզիկա",other:"Այլ առարկաներ"},
    question:"Հարց",firstTwo:"2 հարց՝ փորձարկման համար",back:"Վերադառնալ գրքերին",unlock:"Բացել ամբողջ շտեմարանը",locked:"Փակված",rest:"Մնացած հարցերը հասանելի են հաշիվ ստեղծելուց կամ մուտք գործելուց հետո։",
    login:"Գրանցվել կամ մուտք գործել",ready:"Ամբողջական պարապմունքները սկսվում են այստեղ",explanation:"Բացատրություն",correct:"Ճիշտ է",incorrect:"Սխալ է",
    check:"Ստուգել",next:"Հաջորդ հարցը",restart:"Կրկին փորձել",input:"Մուտքագրիր պատասխանը",pending:"Բեռնվում են իրական հարցերը…",
    failed:"Չհաջողվեց բեռնել այս շտեմարանը։",missing:"Այս գրքի համար երկու ստուգվող տեքստային հարց դեռ պատրաստ չեն։ Մուտք գործիր՝ առկա առաջադրանքները տեսնելու համար։",
    preview:"Բաց է միայն նախադիտումը",disclaimer:"Առաջադրանքները բեռնվում են Shtemarm-ի առկա գրքերից։ Հյուրի պատասխանները չեն պահպանվում։",
    source:"Շտեմարանի բաժին",selected:"Ընտրիր գիրքը",sectionsLocked:"Հաջորդ բաժիններն ու հարցերը փակ են",count:"Գիրք",
  },
  en:{
    browse:"Browse the question books",title:"Real question books",description:"Choose a book, answer its first 2 questions, and explore the actual study flow. Sign in to continue with the rest.",
    all:"All",categories:{all:"All",english:"English",math:"Mathematics",history:"History",biology:"Biology",armenian:"Armenian",physics:"Physics",other:"Other subjects"},
    question:"Question",firstTwo:"2 questions available to try",back:"Back to books",unlock:"Unlock the full question book",locked:"Locked",rest:"The remaining questions become available after you create an account or sign in.",
    login:"Sign up or sign in",ready:"Continue with the full study experience",explanation:"Explanation",correct:"Correct",incorrect:"Not quite",
    check:"Check answer",next:"Next question",restart:"Try again",input:"Enter your answer",pending:"Loading real questions…",
    failed:"This book could not be loaded.",missing:"This book does not yet contain two suitable text-based preview questions. Sign in to explore the available exercises.",
    preview:"Preview only",disclaimer:"Questions come from Shtemarm's existing book content. Guest answers aren't saved.",
    source:"Book section",selected:"Choose a book",sectionsLocked:"Further sections and questions are locked",count:"Books",
  },
  ru:{
    browse:"Посмотреть сборники",title:"Настоящие сборники заданий",description:"Выбери сборник, реши первые 2 вопроса и познакомься с интерфейсом. Остальное откроется после входа.",
    all:"Все",categories:{all:"Все",english:"Английский",math:"Математика",history:"История Армении",biology:"Биология",armenian:"Армянский язык",physics:"Физика",other:"Другие предметы"},
    question:"Вопрос",firstTwo:"2 вопроса для ознакомления",back:"К списку книг",unlock:"Открыть полный сборник",locked:"Заблокировано",rest:"Остальные вопросы станут доступны после регистрации или входа.",
    login:"Регистрация или вход",ready:"Продолжить полноценную подготовку",explanation:"Объяснение",correct:"Верно",incorrect:"Неверно",
    check:"Проверить",next:"Следующий вопрос",restart:"Начать заново",input:"Введи ответ",pending:"Загружаем реальные вопросы…",
    failed:"Не удалось загрузить этот сборник.",missing:"В сборнике пока нет двух доступных для предпросмотра текстовых вопросов. Войди, чтобы открыть остальные задания.",
    preview:"Только ознакомление",disclaimer:"Вопросы взяты из существующих сборников Shtemarm. Ответы гостя не сохраняются.",
    source:"Раздел сборника",selected:"Выбери сборник",sectionsLocked:"Следующие разделы и вопросы заблокированы",count:"Сборников",
  },
};
