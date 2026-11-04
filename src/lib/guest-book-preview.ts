import { ALL_BOOKS, type Book } from "@/lib/books";
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
