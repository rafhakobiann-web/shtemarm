import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { reviewBiologyFormat, type BiologyReviewEvidence } from "@/lib/biology-source-format-policy";
import { pageForBiologyQuestion, validateBiologyOriginalIndex } from "@/lib/biology-source";

const read = (path: string) => JSON.parse(readFileSync(path, "utf8"));
const base: Omit<BiologyReviewEvidence, "format"> = {
  volume: 3, chapter: 3, printedNumber: 85, originalPageChecked: true,
  wordingChecked: true, printedKeyChecked: true,
  includesEssentialFigure: false, equivalentTextChecked: false,
};

describe("Approved 1C,2C,3B,4B Biology review rules", () => {
  it("1C: tracks newly corrected wording with original pages and printed answer keys", () => {
    const reviewed = read("public/data/biology-reviewed-restorations.json");
    const expected = {3:1,4:6};
    expect(reviewed.entries).toHaveLength(7);
    for (const volume of [3,4] as const) {
      const book = read(`public/data/bio-book${volume}.json`);
      const index = validateBiologyOriginalIndex(read(`public/data/biology-original-volume${volume}-index.json`),volume);
      const pending=read("public/data/biology-pending-books.json").books.find((p:{part:number})=>p.part===volume);
      const candidates=reviewed.entries.filter((r:{volume:number})=>r.volume===volume);
      expect(candidates).toHaveLength(expected[volume]);
      expect(pending.verifiedQuestions).toBe(candidates.length);
      for (const entry of candidates) {
        expect(entry.sourceSha256).toBe(index.sourceSha256);
        expect(entry.wordingAndOptionsComparedToOriginal).toBe(true);
        expect(entry.printedAnswerComparedToOriginal).toBe(true);
        const chapter=index.chapters[entry.chapter-1];
        expect(entry.page).toBe(pageForBiologyQuestion(chapter,entry.number));
        expect(entry.answer).toBe(chapter.choiceKeys[entry.number-1]);
        const unit=book.sections.find((s:{n:number})=>s.n===entry.chapter).units.find((u:{label:string})=>u.label===String(entry.number));
        expect(unit?.kind).toBe("mc");
        expect(unit?.sourcePage).toBe(entry.page);
        expect(unit?.questions[0].answer).toBe(entry.answer);
        expect(unit?.questions[0].stem.length).toBeGreaterThan(8);
        expect(Object.values(unit?.questions[0].options??{}).every(s=>typeof s==="string" && s.trim().length>0)).toBe(true);
        const coverage=read(`public/data/biology-volume${volume}-coverage.json`);
        expect(coverage.chapters[entry.chapter-1].excluded.some((e:{n:number})=>e.n===entry.number)).toBe(false);
      }
    }
  });

  it("2C: preserves source-specific single, multi-select and true/false formats", () => {
    const choice=reviewBiologyFormat({...base, format:{type:"one-choice",answer:"4",options:{"1":"A","2":"B","3":"C","4":"D"}}});
    expect(choice).toEqual({status:"ready",kind:"mc",groupedSubtasks:false});
    const set=reviewBiologyFormat({...base,format:{type:"numbered-selection",statements:["A","B","C"],correct:[1,3]}});
    expect(set).toEqual({status:"ready",kind:"set",groupedSubtasks:false});
    const statements=reviewBiologyFormat({...base,format:{type:"true-false",statements:["A","B","C"],answers:["true","false","true"]}});
    expect(statements).toEqual({status:"ready",kind:"mc",groupedSubtasks:true});
    const undecided=reviewBiologyFormat({...base,format:{type:"unclassified"}});
    expect(undecided).toEqual({status:"pending",reason:"unsupported-answer-format"});
    const wrong=reviewBiologyFormat({...base,format:{type:"numbered-selection",statements:["A","B"],correct:[1,1]}});
    expect(wrong).toEqual({status:"pending",reason:"invalid-answer-format"});
  });

  it("3B: groups numeric subtasks without assuming unverified answers",()=>{
    const reviewed=reviewBiologyFormat({...base,chapter:6,format:{type:"numeric-subtasks",subtasks:[
      {number:"1.1",prompt:"Առաջին ենթահարց",answer:"5"},
      {number:"1.2",prompt:"Երկրորդ ենթահարց",answer:"9"},
    ]}});
    expect(reviewed).toEqual({status:"ready",kind:"num",groupedSubtasks:true});
    expect(reviewBiologyFormat({...base,chapter:6,format:{type:"numeric-subtasks",subtasks:[
      {number:"1.1",prompt:"Առաջին ենթահարց",answer:"5"},
      {number:"1.2",prompt:"Երկրորդ ենթահարց",answer:""},
    ]}})).toEqual({status:"pending",reason:"invalid-answer-format"});
    const card=readFileSync("src/components/UnitCard.tsx","utf8");
    expect(card).toContain('aria-label={u.questions.length > 1 ? tx("Միևնույն խնդրի ենթահարցերը") : undefined}');
    expect(card).toContain("u.questions.map(numBlock)");
  });

  it("4B: refuses image-dependent questions unless the complete text equivalent is verified",()=>{
    const format: BiologyReviewEvidence["format"]={type:"one-choice",answer:"1",options:{"1":"A","2":"B","3":"C","4":"D"}};
    expect(reviewBiologyFormat({...base,includesEssentialFigure:true,format})).toEqual({status:"pending",reason:"illustration-required"});
    expect(reviewBiologyFormat({...base,includesEssentialFigure:true,equivalentTextChecked:true,format}))
      .toEqual({status:"ready",kind:"mc",groupedSubtasks:false});
    expect(reviewBiologyFormat({...base,originalPageChecked:false,format})).toEqual({status:"pending",reason:"source-unchecked"});
    expect(reviewBiologyFormat({...base,printedKeyChecked:false,format})).toEqual({status:"pending",reason:"source-unchecked"});
  });

  it("never creates or changes an existing route",()=>{
    const route=readFileSync("src/routes/biology.tsx","utf8");
    const workspace=readFileSync("src/components/BiologyWorkspace.tsx","utf8");
    expect(route).toContain('createFileRoute("/biology")');
    expect(route).toContain('initialBook={book} initialSection={section}');
    expect(workspace).toContain('to="/book/$bookId"');
    expect(readFileSync("src/routes/biology_.original.tsx","utf8")).toContain('createFileRoute("/biology_/original")');
  });
});
