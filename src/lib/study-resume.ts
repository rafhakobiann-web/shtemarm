/**
 * A tiny, account-scoped "Continue Learning" bookmark.
 * This stores only a validated study location on the current device.
 * No question text, responses, or private account details are persisted.
 */
import { ALL_BOOKS } from "@/lib/books";

export type StudyResume = {
  bookId: number;
  sectionId: number;
  mode: "game" | "classic";
  visitedAt: number;
};
const prefix="shtemarm:resume:v1:";
const ID_RE=/^[a-f0-9-]{20,64}$/i;

export function parseStudyResume(value:unknown, now=Date.now()):StudyResume|null {
  if(!value || typeof value!=="object" || Array.isArray(value))return null;
  const v=value as Record<string,unknown>;
  if(typeof v.bookId!=="number" || !ALL_BOOKS.some(b=>b.id===v.bookId))return null;
  if(typeof v.sectionId!=="number" || !Number.isSafeInteger(v.sectionId) || v.sectionId<1 || v.sectionId>10000)return null;
  if(v.mode!=="game" && v.mode!=="classic")return null;
  if(typeof v.visitedAt!=="number" || !Number.isFinite(v.visitedAt) ||
     v.visitedAt>now+60_000 || v.visitedAt<now-180*24*60*60_000)return null;
  return {bookId:v.bookId as number,sectionId:v.sectionId as number,
    mode:v.mode as "game" | "classic",visitedAt:v.visitedAt as number};
}
function storageKey(userId:string){return ID_RE.test(userId)?prefix+userId:null;}

export function readStudyResume(userId:string):StudyResume|null {
  if(typeof window==="undefined")return null;
  const key=storageKey(userId);if(!key)return null;
  try { const raw=window.localStorage.getItem(key);return raw?parseStudyResume(JSON.parse(raw)):null; }
  catch{return null;}
}
export function saveStudyResume(userId:string,value:StudyResume):boolean {
  if(typeof window==="undefined")return false;
  const key=storageKey(userId);
  const valid=parseStudyResume(value);
  if(!key||!valid)return false;
  try{window.localStorage.setItem(key,JSON.stringify(valid));return true;}
  catch{return false;}
}
