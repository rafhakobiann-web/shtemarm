import { readFileSync } from "node:fs";
import { describe,expect,it } from "vitest";
const read=(path:string)=>readFileSync(path,"utf8");
describe("simplified study experience and truthful biology status",()=>{
 it("does not mount music or background playback on any page",()=>{
   const root=read("src/routes/__root.tsx");
   expect(root).not.toContain("<StudyMusicDock");
   expect(read("src/routes/study-tools.tsx")).not.toContain("<StudyMusicSettings");
 });
 it("does not expose focus mode or hide navigation",()=>{
   expect(read("src/components/StudyTools.tsx")).not.toContain("setFocusMode");
   expect(read("src/styles.css")).not.toContain("html.study-focus-mode");
   expect(read("src/components/AppHeader.tsx")).not.toContain("<Headphones");
 });
 it("provides a same-device cooperative game with a 30-question target",()=>{
   expect(read("src/routes/mini-games.tsx")).toContain("<CooperativeQuiz");
   const coop=read("src/components/CooperativeQuiz.tsx");
   expect(coop).toContain("const COUNT=30");
   expect(coop).toContain("questionId");
   expect(coop).toContain("player");
 });
 it("displays all four biology covers but does not pretend volumes III and IV are playable",()=>{
   const data=JSON.parse(read("public/data/biology-pending-books.json"));
   expect(data.books.map((b:{id:number})=>b.id)).toEqual([33,34]);
   expect(data.books.every((b:{verifiedQuestions:number})=>b.verifiedQuestions===0)).toBe(true);
   const ui=read("src/components/BiologyWorkspace.tsx");
   expect(ui).toContain("BIO_BOOKS.map");
   expect(ui).toContain("book.locked?");
 });
});
