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
   expect(coop).toContain("const [count,setCount]=useState(10)");
   expect(coop).toContain("[10,20,30,50,100]");
   expect(coop).toContain("const team=(index%2) as Team");
 });
 it("renders stable book covers, without embedding question-page pictures",()=>{
   const home=read("src/routes/dashboard.tsx");
   const detail=read("src/routes/book.$bookId.tsx");
   const reader=read("src/components/BiologyQuestionFromPdf.tsx");
   const practice=read("src/components/BiologyOriginalPractice.tsx");
   expect(home).toContain("function TileBody");
   expect(home).not.toContain("cover-frame");
   expect(home).toContain("<BookCover src={cover}");
   expect(detail).toContain("<BookCover src={meta.cover}");
   expect(reader).not.toContain("<canvas");
   expect(reader).not.toContain("<img");
   expect(practice).not.toContain("<iframe");
   expect(practice).toContain("recordAnswer(key, selected === answer)");
 });
 it("keeps uploaded user data local, original books distinct from authored practice",()=>{
   const data=JSON.parse(read("public/data/biology-pending-books.json"));
   expect(data.books.map((b:{id:number})=>b.id)).toEqual([33,34]);
   expect(data.books.every((b:{verifiedQuestions:number,transcribedQuestions:number})=>b.verifiedQuestions>=0 && b.verifiedQuestions<=b.transcribedQuestions)).toBe(true);
   expect(read("src/components/BiologyWorkspace.tsx")).toContain('to="/biology/original"');
 });

});
