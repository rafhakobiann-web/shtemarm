import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { mergeMathQuestions, type MathBookIndex } from "@/lib/math-bank";
import { isOpenTask } from "@/lib/math-progress";
import { NativeMathText } from "@/components/MathQuestionText";
import { MATH_SOURCE_PLOTS } from "@/components/MathSourceDiagram";
import fs from "node:fs";

describe("complete math transcriptions", () => {
  it("keeps chapter-2 answers typed even when every answer is 1–4", () => {
    expect(isOpenTask({ answer_type: "open", answers: ["1","2","3","4"] })).toBe(true);
    expect(isOpenTask({ answer_type: "choice", answers: ["1","2","3","4"] })).toBe(false);
    expect(isOpenTask({ answer_type: "tf", answers: ["T","F"] })).toBe(false);
  });
  it("retains the reference needed to render formula layout", () => {
    const index: MathBookIndex = { books: { "matem-1": { title: "Book", sections: [{ chapter:2,section:1,title:"Title",pages:[149,156],tasks:[{task:1,segments:[],answers:["2"],sub_count:1,questions:[{prompt:"original",options:[]}]}]}] } } };
    const reference={book:"matem-1",section:"2-1",task:1,sub:1};
    mergeMathQuestions(index,{"matem-1":{"2-1":{"1":[{prompt:"native",options:[],transcription:reference}]}}});
    expect(index.books["matem-1"]?.sections[0]?.tasks[0]?.questions?.[0]?.transcription).toEqual(reference);
    mergeMathQuestions(index,{"matem-1":{"2-1":{"1":[null]}}});
    expect(index.books["matem-1"]?.sections[0]?.tasks[0]?.questions?.[0]?.prompt).toBe("native");
  });
  it("renders fractions as selectable Unicode plus native rules", () => {
    const data=JSON.parse(fs.readFileSync("public/data/math-transcriptions/matem-1/2-1.json","utf8"));
    const block=data.tasks["6"].questions[0][0];
    const markup=renderToStaticMarkup(<NativeMathText block={block}/>);
    expect(markup).toContain("<text");
    expect(markup).toContain("<path");
    expect(markup).not.toMatch(/<img|<image|foreignObject|data:image|[\uE000-\uF8FF\uFFFD]/u);
    const wrapper = document.createElement("div");
    wrapper.innerHTML = markup;
    expect(wrapper.textContent).toContain("0,008");
  });
  it("decodes the Times Armenian ligature as and", () => {
    const bank=JSON.parse(fs.readFileSync("public/data/math-text-questions.json","utf8"));
    expect(bank["matem-2"]["1-10"]["9"][0].prompt).toContain("և");
    expect(bank["matem-2"]["1-10"]["9"][0].prompt).not.toContain("—");
  });
  it("shares graphs with every subquestion of the correct source task", () => {
    const data=JSON.parse(fs.readFileSync("public/data/math-transcriptions/matem-2/3-4.json","utf8"));
    for(const [tn,id] of [[24,"284-961"],[25,"285-966"],[33,"289-981"],[34,"290-985"]]) {
      const t=data.tasks[tn];
      expect(t.stem.flatMap((b:any)=>b.diagrams??[]).map((g:any)=>g[0])).toContain(id);
      expect(t.questions.flat().some((b:any)=>b.diagrams?.length)).toBe(false);
    }
    expect(data.tasks[35].stem.some((b:any)=>b.diagrams?.length)).toBe(false);
  });
  it("keeps the source domain, extrema and zeroes of the redrawn graphs", () => {
    expect(MATH_SOURCE_PLOTS["194-688"]?.points).toEqual(expect.arrayContaining([[-7,-3],[-2,5],[2,0],[3,2]]));
    expect(MATH_SOURCE_PLOTS["289-981"]?.points).toEqual([[0,2],[6,-1]]);
    expect(MATH_SOURCE_PLOTS["285-966"]?.yLabel).toBe("f′(x)");
  });
});
