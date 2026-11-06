import { ALL_BOOKS, type Book } from "@/lib/books";

export type SearchHit = { key:string; bookId:number; kind:"book"|"section"|"question"; title:string; snippet:string; section?:number };
export function normalizeSearch(text:string):string {
  return text.normalize("NFKC").toLocaleLowerCase().replace(/[\u0300-\u036f]/g,"").replace(/\s+/g," ").trim();
}
function editDistance(a:string,b:string):number {
  if(Math.abs(a.length-b.length)>2)return 3;
  let prev=Array.from({length:b.length+1},(_,i)=>i);
  for(let i=1;i<=a.length;i++){const next=[i];for(let j=1;j<=b.length;j++)next[j]=Math.min(next[j-1]+1,prev[j]+1,prev[j-1]+(a[i-1]===b[j-1]?0:1));prev=next;}
  return prev[b.length];
}
export function matchesSearch(text:string,query:string):boolean {
  const a=normalizeSearch(text),b=normalizeSearch(query);
  if(!b)return false;
  if(a.includes(b))return true;
  if(b.length<4)return false;
  return a.split(/[^\p{L}\p{N}]+/u).some(word=>Math.abs(word.length-b.length)<=1&&editDistance(word,b)<=1);
}
export function searchBookCatalog(query:string,bookId?:number):SearchHit[] {
  return ALL_BOOKS.filter(book=>(bookId===undefined||book.id===bookId)&&matchesSearch(book.title+" "+book.sub,query)).map(book=>({
    key:"book:"+book.id,bookId:book.id,kind:"book" as const,title:book.title,snippet:book.sub,
  }));
}
/** Only search loaded books. Never fetch all banks or invent question identities. */
export function searchLoadedBooks(books:readonly Book[],query:string,limit=80):SearchHit[] {
  const result:SearchHit[]=[];
  if(!normalizeSearch(query))return result;
  for(const book of books){
    for(const section of book.sections){
      const title=section.label??section.title??"Բաժին "+section.n;
      if(matchesSearch(title+" "+section.instr_hy+" "+section.instr_en,query)){
        result.push({key:`section:${book.id}:${section.n}`,bookId:book.id,kind:"section",title,snippet:section.instr_hy||section.instr_en,section:section.n});
      }
      for(const unit of section.units){
        const questions=unit.kind==="mc"||unit.kind==="num"?unit.questions:[];
        for(let i=0;i<questions.length;i++){
          const q=questions[i];
          const stem=q.stem||"";
          if(matchesSearch(stem,query)){
            result.push({key:`question:${book.id}:${section.n}:${unit.id}:${i}`,bookId:book.id,kind:"question",title:stem.slice(0,120),snippet:title,section:section.n});
          }
          if(result.length>=limit)return result;
        }
      }
      if(result.length>=limit)return result;
    }
  }
  return result;
}
