export type StudyItem = {
  id:string; title:string; subject:string; bookId?:number; section?:number;
  collection:string; note:string; reviewAt:string|null; createdAt:number;
};
const KEY="shtemarm:study-library:v1";
export const STUDY_LIBRARY_CHANGED="shtemarm:study-library-changed";
export function normalizeStudyLibrary(value:unknown):StudyItem[]{
  if(!Array.isArray(value))return [];
  const result:StudyItem[]=[];
  for(const item of value.slice(0,500)){
    if(!item||typeof item!=="object")continue;
    const v=item as Record<string,unknown>;
    if(typeof v.id!=="string"||!v.id||v.id.length>256||typeof v.title!=="string"||typeof v.subject!=="string")continue;
    result.push({
      id:v.id,title:v.title.slice(0,240),subject:v.subject.slice(0,80),
      bookId:typeof v.bookId==="number"&&Number.isInteger(v.bookId)?v.bookId:undefined,
      section:typeof v.section==="number"&&Number.isInteger(v.section)?v.section:undefined,
      collection:typeof v.collection==="string"?v.collection.slice(0,80):"",
      note:typeof v.note==="string"?v.note.slice(0,2000):"",
      reviewAt:typeof v.reviewAt==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(v.reviewAt)?v.reviewAt:null,
      createdAt:typeof v.createdAt==="number"&&Number.isFinite(v.createdAt)?v.createdAt:0,
    });
  }
  return [...new Map(result.map(item=>[item.id,item])).values()];
}
export function readStudyLibrary():StudyItem[]{
  if(typeof window==="undefined")return [];
  try{return normalizeStudyLibrary(JSON.parse(localStorage.getItem(KEY)??"[]"));}catch{return [];}
}
export function saveStudyLibrary(items:readonly StudyItem[]):boolean{
  if(typeof window==="undefined")return false;
  try{
    localStorage.setItem(KEY,JSON.stringify(normalizeStudyLibrary(items)));
    window.dispatchEvent(new Event(STUDY_LIBRARY_CHANGED));
    return true;
  }catch{return false;}
}
export function upsertStudyItem(item:StudyItem):boolean{
  const items=readStudyLibrary();
  return saveStudyLibrary([item,...items.filter(old=>old.id!==item.id)]);
}
export function filterStudyLibrary(items:readonly StudyItem[],query:string,collection:string):StudyItem[]{
  const q=query.trim().toLocaleLowerCase();
  return items.filter(item=>(!collection||item.collection===collection)&&(!q||[item.title,item.subject,item.collection,item.note].some(s=>s.toLocaleLowerCase().includes(q))));
}
