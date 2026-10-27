/**
 * Source metadata was verified against the two PDFs supplied directly by the
 * Shtemarm project owner (27 October 2026). The PDFs contain scanned page
 * images and only a watermark in the extractable text layer. DO NOT pretend
 * that the generated practice bank is a transcription of these books.
 *
 * Copyright: files are opened privately from the learner's device. This site
 * does not host, ingest, transmit or redistribute any pages of the PDFs.
 */
export type PhysicsVolume=61|62;
export type PhysicsSourceMeta={
  id:PhysicsVolume;title:string;fileName:string;pages:number;
  questionsStart:number;answersStart:number;hash:string;edition:string;
  webPdf:string;
};
export const PHYSICS_SOURCES:Readonly<Record<PhysicsVolume,PhysicsSourceMeta>>={
  61:{
    id:61,title:"Ֆիզիկա · Մաս I",fileName:"fizika-1_compressed.pdf",
    pages:430,questionsStart:5,answersStart:406,
    hash:"f2e92bfd8c2fe7918f8c02bdfd97504a5445dce83b8bd2b042b5749c3a42f8e0",
    edition:"Երևան, 2017",webPdf:"https://cdn.shtemaran.am/shtemarans/fizika-1.pdf",
  },
  62:{
    id:62,title:"Ֆիզիկա · Մաս II",fileName:"fizika-2_compressed.pdf",
    pages:436,questionsStart:5,answersStart:409,
    hash:"3e4af54287b3895f2ac401226d5915a6bf1467b312d7c7c66c30157ce0238d07",
    edition:"Երևան, 2017",webPdf:"https://cdn.shtemaran.am/shtemarans/fizika-2.pdf",
  },
};
const DB="shtemarm-physics-local-sources";
const STORE="pdfs";
const VERSION=1;
type Saved={id:PhysicsVolume;pdf:Blob;name:string;lastModified:number};
function db():Promise<IDBDatabase>{
  return new Promise((resolve,reject)=>{
    if(typeof indexedDB==="undefined"){reject(new Error("Այս դիտարկիչը չի պահպանում տեղական PDF ֆայլեր։"));return;}
    const request=indexedDB.open(DB,VERSION);
    request.onupgradeneeded=()=>{
      const current=request.result;
      if(!current.objectStoreNames.contains(STORE))current.createObjectStore(STORE,{keyPath:"id"});
    };
    request.onsuccess=()=>resolve(request.result);
    request.onerror=()=>reject(request.error||new Error("Չհաջողվեց բացել տեղական պահոցը։"));
  });
}
export function clampPhysicsPage(id:PhysicsVolume,page:number){
  const limit=PHYSICS_SOURCES[id].pages;
  return Math.max(1,Math.min(limit,Number.isFinite(page)?Math.trunc(page):1));
}
export function validatePhysicsSourceFile(file:Pick<File,"name"|"size"|"type">):string|null{
  if(!/\.pdf$/i.test(file.name)||file.type && file.type!=="application/pdf")
    return "Ընտրիր PDF ձևաչափով ֆայլ։";
  if(file.size<20_000)return "Ընտրված PDF-ը չափազանց փոքր է։";
  if(file.size>180_000_000)return "PDF-ի չափը գերազանցում է 180 ՄԲ սահմանը։";
  return null;
}
export async function putLocalPhysicsPdf(id:PhysicsVolume,file:File){
  const error=validatePhysicsSourceFile(file);
  if(error)throw new Error(error);
  const connection=await db();
  try{
    await new Promise<void>((resolve,reject)=>{
      const transaction=connection.transaction(STORE,"readwrite");
      transaction.objectStore(STORE).put({id,pdf:file,name:file.name,lastModified:file.lastModified} satisfies Saved);
      transaction.oncomplete=()=>resolve();
      transaction.onerror=()=>reject(transaction.error||new Error("PDF-ը հնարավոր չեղավ պահել։"));
      transaction.onabort=()=>reject(transaction.error||new Error("PDF-ի պահպանումը ընդհատվեց։"));
    });
  }finally{connection.close();}
}
export async function getLocalPhysicsPdf(id:PhysicsVolume):Promise<Saved|null>{
  const connection=await db();
  try{return await new Promise((resolve,reject)=>{
    const tr=connection.transaction(STORE,"readonly");
    const request=tr.objectStore(STORE).get(id);
    request.onsuccess=()=>resolve(request.result??null);
    request.onerror=()=>reject(request.error||new Error("PDF-ի ընթերցումը չհաջողվեց։"));
  });}finally{connection.close();}
}
export async function deleteLocalPhysicsPdf(id:PhysicsVolume):Promise<void>{
  const connection=await db();
  try{await new Promise<void>((resolve,reject)=>{
    const tr=connection.transaction(STORE,"readwrite");
    tr.objectStore(STORE).delete(id);
    tr.oncomplete=()=>resolve();
    tr.onerror=()=>reject(tr.error||new Error("PDF-ը հեռացնել չհաջողվեց։"));
  });}finally{connection.close();}
}
/** Hash checking is opt-in because full-book digests can be costly on phones. */
export async function confirmPhysicsSourcePdf(id:PhysicsVolume,blob:Blob):Promise<boolean>{
  if(!globalThis.crypto?.subtle)throw new Error("Այս դիտարկիչը չի աջակցում PDF-ի SHA-256 ստուգումը։");
  const digest=await crypto.subtle.digest("SHA-256",await blob.arrayBuffer());
  const actual=[...new Uint8Array(digest)].map(b=>b.toString(16).padStart(2,"0")).join("");
  return actual===PHYSICS_SOURCES[id].hash;
}
