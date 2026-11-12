import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { findSourceTaskIndex, guestSubQuestionLimit, sourceTaskPage, SOURCE_TASK_PAGE_SIZE } from "@/lib/source-solutions-navigation";

const file=(path:string)=>readFileSync(path,"utf8");
const tasks=[
  {task:3,sub_count:1,answers:["1"]},
  {task:9,sub_count:3,answers:["2","3","1"]},
  {task:17,sub_count:1,answers:["3"]},
  {task:24,sub_count:2,answers:["4","4"]},
];

describe("Focused solutions navigation",()=>{
  it("finds printed task numbers, not array positions, and rejects malformed input",()=>{
    expect(findSourceTaskIndex(tasks," 9 ")).toBe(1);
    expect(findSourceTaskIndex(tasks,"17")).toBe(2);
    for(const bad of ["","0","-1","3.2","1e3","9abc","99999999999999999999","4"]){
      expect(findSourceTaskIndex(tasks,bad),bad).toBe(-1);
    }
    expect(SOURCE_TASK_PAGE_SIZE).toBe(3);
    expect(sourceTaskPage(0)).toBe(0);
    expect(sourceTaskPage(3)).toBe(1);
    expect(sourceTaskPage(7)).toBe(2);
  });

  it("restricts the guest preview by question count, even within a multi-part task",()=>{
    expect(guestSubQuestionLimit(tasks,0)).toBe(1);
    expect(guestSubQuestionLimit(tasks,1)).toBe(1);
    expect(guestSubQuestionLimit(tasks,2)).toBe(0);
    expect(guestSubQuestionLimit(tasks,3)).toBe(0);
    expect(guestSubQuestionLimit(tasks,-1)).toBe(0);
    expect(guestSubQuestionLimit(tasks,8)).toBe(0);
    expect(guestSubQuestionLimit(tasks,1,4)).toBe(3);
    expect(guestSubQuestionLimit([{task:1,sub_count:4,answers:null}],0)).toBe(2);
  });

  it("opens on a calm overview, then keeps solutions, rules and questions in separate routes",()=>{
    const route=file("src/routes/solutions.tsx");
    expect(route).toContain('view ?? "home"');
    expect(route).toContain('subject==="home"');
    expect(route).toContain('subject==="source" ? <MathSourceSolutions');
    expect(route).toContain('view: z.enum(["math", "source", "english"]).optional()');
    expect(route).toContain('aria-current={subject===key?"page":undefined}');
    expect(route).toContain("visibleMathTopics=mathTopics.slice(0,visibleLimit)");
    expect(route).toContain("visibleEnglishTopics=englishTopics.slice(0,visibleLimit)");
    expect(route).toContain('className="min-h-11 w-full rounded-lg border bg-background px-3 py-2 lg:hidden"');
    expect(route).toContain('search={{book:englishBook,section,topic:topic.id}}');
    expect(route).toContain('params={{bookId:String(englishBook),sectionId:String(section)}}');
    const css=file("src/solutions-library.css");
    expect(css).toContain('.sht-solutions-tabs a[aria-current="page"]');
    expect(css).toContain(".sht-solutions-overview-card");
  });

  it("preserves exact book and section on arrival from maths or English",()=>{
    const math=file("src/routes/math.books.tsx");
    const grammar=file("src/routes/english-grammar.tsx");
    const source=file("src/components/MathSourceSolutions.tsx");
    expect(math).toContain('search={{view:"source",book:bookId');
    expect(grammar).toContain('search={{view:"english",englishBook:book,section}}');
    expect(source).toContain("initialBookId");
    expect(source).toContain("initialChapter");
    expect(source).toContain("initialSection");
    expect(source).toContain("findSourceTaskIndex(target?.tasks ?? [],taskNumber)");
    expect(source).toContain("sourceTaskPage(index)");
    expect(source).toContain('showRelatedLinks={false}');
    expect(source).not.toContain("setAnswer(");
    expect(source).not.toContain("recordMathMistake(");
  });

  it("uses one clear learning entry on dashboards and Explore",()=>{
    const dashboard=file("src/routes/dashboard.tsx");
    const explore=file("src/routes/explore.tsx");
    expect(dashboard).toContain('search={{view:"english"}}');
    expect(dashboard).toContain('search={{view:"math"}}');
    expect(explore).toContain('to:"/solutions"');
    expect(explore).not.toContain('to:"/math-handbook", label:l');
    expect(explore).not.toContain('to:"/english-grammar", label:l');
    expect(file("src/routes/study-tools.tsx")).toContain('to:"/solutions"');
    const explain=file("src/components/MathExplain.tsx");
    expect(explain).toContain("showRelatedLinks!==false");
    expect(explain).toContain("/solutions?view=source&book=");
  });
});
