import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";
import { normalizeBiologySecondBook, type Book } from "@/lib/books";
import { historyBookEntries, selectHistoryUnits } from "@/lib/history";
import { createMiniGame, GAME_BLUEPRINTS } from "@/lib/miniGameBank";
import { translate } from "@/lib/lang";
import { RU_DICT } from "@/i18n/ru";

const json=(name:string):Book=>JSON.parse(readFileSync("public/data/"+name,"utf8")) as Book;
afterEach(()=>vi.unstubAllGlobals());

describe("Biology question coverage and integrity",()=>{
  it("retains every playable question in both large existing Biology books",()=>{
    const b1=json("bio-book1.json"),b2=normalizeBiologySecondBook(json("bio-book2.json"));
    const first=historyBookEntries(b1,31),second=historyBookEntries(b2,32);
    expect(first).toHaveLength(1597);
    expect(second).toHaveLength(1070);
    expect(new Set([...first,...second].map(x=>x.unit.id)).size).toBe(2667);
    expect(b2.sections.every(sec=>sec.units.every(unit=>unit.kind!=="mc"||unit.questions.length===1))).toBe(true);
    expect(selectHistoryUnits([...first,...second],70,true)).toHaveLength(70);
  });
  it("adds 48 original questions in six new biology review themes with valid answers",()=>{
    const b=json("bio-supplement.json");
    expect(b.sections).toHaveLength(6);
    expect(b.sections.flatMap(s=>s.units)).toHaveLength(48);
    const answers=historyBookEntries(b,35);
    expect(answers).toHaveLength(48);
    expect(answers.every(x=>x.unit.kind==="mc"&&x.unit.questions.length===1
      &&x.unit.questions[0]!.options[x.unit.questions[0]!.answer])).toBe(true);
    expect(new Set(answers.map(x=>x.unit.id)).size).toBe(48);
    const raw=readFileSync("public/data/bio-supplement.json","utf8");
    expect(raw).toContain("NOT the 3rd or 4th official GTC books");
  });
});
describe("Russified UI and preserved source content",()=>{
  it("selects Russian for key actions and keeps placeholders",()=>{
    expect(translate("ru","Քննություն")).toBe("Экзамен");
    expect(translate("ru","Կենսաբանություն")).toBe("Биология");
    expect(translate("ru","Հասանելի է՝ {n}",{n:48})).toBe("Доступно: 48");
    expect(translate("en","Կենսաբանություն")).not.toBe("Биология");
    expect(Object.keys(RU_DICT).length).toBeGreaterThan(220);
  });
  it("moves thematic and accessibility options into logical menus",()=>{
    const header=readFileSync("src/components/AppHeader.tsx","utf8");
    const settings=readFileSync("src/components/PersonalizationControls.tsx","utf8");
    const home=readFileSync("src/routes/index.tsx","utf8");
    expect(header).toContain('to="/thematic"');
    expect(header).toContain('(["hy", "en", "ru"] as const)');
    expect(settings).toContain('changeLanguage("ru")');
    expect(settings).toContain('t.accessibility');
    expect(home).toContain('to="/flashcards"');
    expect(home).not.toContain("Սխալ գտե՞ր");
  });
});
describe("mini-games extend beyond five-question placeholders",()=>{
  const bank=(path:string)=>JSON.parse(readFileSync(path,"utf8"));
  const mock=vi.fn(async (input:RequestInfo|URL)=>{
    const url=String(input);
    if(!url.startsWith("/data/"))return new Response("Not found",{status:404});
    return new Response(JSON.stringify(bank("public"+url)),{status:200,headers:{"Content-Type":"application/json"}});
  });
  it("has five independent games with at least twelve questions each",()=>{
    expect(Object.keys(GAME_BLUEPRINTS)).toHaveLength(5);
    expect(Object.values(GAME_BLUEPRINTS).every(mode=>mode.size>=12)).toBe(true);
  });
  it("generates answerable, nonrepeating mixed and biology games",async()=>{
    vi.stubGlobal("fetch",mock);
    for(const mode of ["quick","marathon","biology","vocabulary","truefalse"] as const){
      const qs=await createMiniGame(mode);
      expect(qs).toHaveLength(GAME_BLUEPRINTS[mode].size);
      expect(new Set(qs.map(q=>q.id)).size).toBe(qs.length);
      expect(qs.every(q=>q.choices.includes(q.answer))).toBe(true);
      expect(qs.every(q=>q.prompt.trim().length>5)).toBe(true);
    }
  });
});
