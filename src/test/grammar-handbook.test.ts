import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  GRAMMAR_TOPICS, GRAMMAR_SECTION_GUIDES,
  getGrammarTopic, getSectionGuide, getSectionTopics, matchGrammarTopic,
} from "@/lib/grammarHandbook";

const langs = ["hy", "en", "ru"] as const;
describe("English grammar handbook", () => {
  it("covers all thirteen sections of every official-format English book", () => {
    expect(GRAMMAR_SECTION_GUIDES.map(s => s.section)).toEqual(Array.from({length:13},(_,i)=>i+1));
    for (let book=1;book<=3;book++) {
      const source = JSON.parse(readFileSync(join(process.cwd(), `public/data/book${book}.json`), "utf8")) as {sections:{n:number}[]};
      for (const s of source.sections.filter(s=>s.n>=1&&s.n<=13)) {
        const guide=getSectionGuide(s.n);
        expect(guide, `Book ${book} section ${s.n}`).toBeDefined();
        expect(getSectionTopics(s.n).length).toBeGreaterThan(0);
        for(const lang of langs){
          expect(guide?.title[lang].length).toBeGreaterThan(8);
          expect(guide?.description[lang].length).toBeGreaterThan(20);
        }
      }
    }
  });
  it("provides distinct meaningful descriptions, examples and mistakes in all available languages", () => {
    expect(GRAMMAR_TOPICS.length).toBeGreaterThanOrEqual(35);
    const unique=new Set(GRAMMAR_TOPICS.map(t=>t.id));
    expect(unique.size).toEqual(GRAMMAR_TOPICS.length);
    for(const topic of GRAMMAR_TOPICS){
      expect(topic.title.length).toBeGreaterThan(5);
      expect(topic.formula).toBeTruthy();
      expect(topic.correct).toBeTruthy();
      expect(topic.incorrect).toBeTruthy();
      expect(topic.correct).not.toEqual(topic.incorrect);
      expect(topic.sections.length).toBeGreaterThan(0);
      for(const section of topic.sections) expect(section).toBeGreaterThanOrEqual(1);
      for(const lang of langs) {
        expect(topic.content[lang].summary.length,topic.id+" "+lang).toBeGreaterThan(35);
        expect(topic.content[lang].why.length,topic.id+" "+lang).toBeGreaterThan(15);
      }
      expect(topic.content.hy.summary).not.toEqual(topic.content.en.summary);
      expect(topic.content.ru.summary).not.toEqual(topic.content.en.summary);
    }
    for(const guide of GRAMMAR_SECTION_GUIDES)
      for(const topicId of guide.topicIds) expect(getGrammarTopic(topicId),topicId).toBeDefined();
  });
  it("distinguishes grammar from reading/vocabulary to avoid invented rules",()=>{
    expect(getSectionTopics(1).some(t=>t.category==="reading")).toBe(true);
    expect(getSectionTopics(12).some(t=>t.category==="vocabulary")).toBe(true);
    expect(matchGrammarTopic("reading","Use past simple in a sentence")).toBeUndefined();
    expect(matchGrammarTopic("vocabulary","Use a modal verb")).toBeUndefined();
    expect(matchGrammarTopic("grammar","No rule is provided.")).toBeUndefined();
  });
  it("links explicit English level-test errors to the correct rule",()=>{
    expect(matchGrammarTopic("grammar","Use the past simple for a finished event yesterday.")?.id).toBe("past-simple");
    expect(matchGrammarTopic("grammar","The second conditional uses past simple in the if-clause.")?.id).toBe("second-conditional");
    expect(matchGrammarTopic("grammar","Use 'since' with the starting point in time.")?.id).toBe("since-for");
    expect(matchGrammarTopic("use-of-english","A modal verb such as can is followed by the base form.")?.id).toBe("modals");
    expect(matchGrammarTopic("grammar","Use the past simple passive: were + past participle.")?.id).toBe("passive");
  });
});
