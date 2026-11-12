import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { readDiagram } from "@/components/MathDiagram";
import { diagramForWorkedExample } from "@/lib/math-worked-diagrams";
import { MATH_HANDBOOK_TOPICS } from "@/lib/mathHandbook";
import { GRAMMAR_TOPICS, getSectionTopics } from "@/lib/grammarHandbook";
import { GRAMMAR_DEEP_DIVES } from "@/lib/grammarDeepDives";

const read=(file:string)=>readFileSync(file,"utf8");

describe("solutions library and diagrams",()=>{
  it("registers /solutions with the router and navigation",()=>{
    const route=read("src/routes/solutions.tsx"),tree=read("src/routeTree.gen.ts"),explore=read("src/routes/explore.tsx");
    expect(route).toContain('createFileRoute("/solutions")');
    expect(tree).toContain("SolutionsRouteImport");
    expect(tree).toContain("'/solutions': typeof SolutionsRoute");
    expect(explore).toContain('to:"/solutions"');
  });
  it("renders known worked-example diagrams, not arbitrary guessed source diagrams",()=>{
    const expected=["linear-function","quadratic-function","geometry-pythagoras","geometry-area","geometry-circles","stereometry-prism","stereometry-pyramid","vectors"];
    for(const id of expected){
      expect(MATH_HANDBOOK_TOPICS.some(topic=>topic.id===id),id).toBe(true);
      const diagram=diagramForWorkedExample(id);
      expect(diagram,id).not.toBeNull();
      expect(diagram?.title).toBeTruthy();
      expect(readDiagram(JSON.stringify(diagram))).toEqual(diagram);
    }
    expect(diagramForWorkedExample("unverified-book-task")).toBeNull();
    expect(diagramForWorkedExample("dot-product")).toBeNull();
  });
  it("rejects invalid diagram data or executable markup",()=>{
    expect(readDiagram('{"type":"vectors","ax":2,"ay":-1,"bx":3,"by":4}')).toMatchObject({type:"vectors"});
    expect(readDiagram('{"type":"vectors","ax":1000,"ay":0,"bx":3,"by":4}')).toBeNull();
    expect(readDiagram('{"type":"solid","shape":"cone","radius":3,"height":0}')).toBeNull();
    expect(readDiagram('{"type":"right-triangle","legA":"<svg>","legB":"6"}')).toBeNull();
    expect(readDiagram('{"type":"solid","shape":"cone","radius":3,"height":4}')).toMatchObject({type:"solid"});
  });
  it("offers source-numbered question lookup and on-demand explanations without grading attempts",()=>{
    const source=read("src/components/MathSourceSolutions.tsx");
    expect(source).toContain("useMathBookIndex()");
    expect(source).toContain("<MathDemandReference");
    expect(source).toContain("<MathExplain");
    expect(source).toContain("chosen={null}");
    expect(source).toContain("taskPages(segments)");
    expect(source).not.toContain("setAnswer(");
    expect(source).not.toContain("recordMathMistake(");
    expect(read("src/routes/math.books.tsx")).toContain("if (correct === undefined) return null;");
    expect(read("src/routes/math.play.tsx")).toContain("it.answer !== undefined && (");
    expect(read("src/routes/math.play.tsx")).toContain("chosen={current ?? null}");
  });
  it("makes English rules and optional explanations available BEFORE a wrong answer",()=>{
    const card=read("src/components/UnitCard.tsx");
    expect(card).toContain("function PeekExplanation");
    expect(card).toContain("!show && <PeekExplanation");
    expect(card).toContain('englishSource && <Link to="/english-grammar"');
    expect(card).toContain("setOpen(x => !x)");
    expect(card).not.toContain("show && chosen !== q.answer && englishSource");
  });
  it("expands English section 3 and 10 with existing rules and full teaching steps",()=>{
    const ids=new Set(GRAMMAR_TOPICS.map(topic=>topic.id));
    const section3=getSectionTopics(3),section10=getSectionTopics(10);
    expect(section3.length).toBeGreaterThanOrEqual(25);
    expect(section10.length).toBeGreaterThanOrEqual(17);
    for(const topic of [...section3,...section10])expect(ids.has(topic.id)).toBe(true);
    for(const id of ["redundant-words","articles","subject-verb","prepositions","comparison","questions","passive"]){
      const dive=GRAMMAR_DEEP_DIVES[id];
      expect(dive,id).toBeDefined();
      for(const lang of ["hy","en","ru"] as const){
        expect(dive?.[lang].steps.length).toBeGreaterThanOrEqual(3);
        expect(dive?.[lang].contrast.length).toBeGreaterThan(20);
        expect(dive?.[lang].caution.length).toBeGreaterThan(15);
      }
    }
  });
});
