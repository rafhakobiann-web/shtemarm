import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import type { Book } from "@/lib/books";
import type { MathBookIndex } from "@/lib/math-bank";
import { GUEST_BOOKS, GUEST_BOOK_LIMIT, GUEST_BOOK_TEXT, pickGuestBookQuestions, pickGuestMathQuestions } from "@/lib/guest-book-preview";

const source=(path:string)=>readFileSync(path,"utf8");

const sampleBook:Book = {
  id: 21,sections:[
    {n:1,title:"First section",instr_hy:"",instr_en:"",units:[
      {id:"sequence",label:"",kind:"seq",passage:"",answer:[1,2,3]},
      {id:"first",label:"",kind:"mc",passage:"Example passage",questions:[
        {n:"1",stem:"Which option is correct?",options:{"1":"A","2":"B","3":"C","4":"D"},answer:"2",explanation:"Correct because B."},
        {n:"2",stem:"Which choice is next?",options:{"1":"Yes","2":"No"},answer:"1"},
        {n:"3",stem:"Hidden third question",options:{"1":"True","2":"False"},answer:"1"},
      ]},
    ]},
    {n:2,title:"Locked section",instr_hy:"",instr_en:"",units:[
      {id:"later",label:"",kind:"num",passage:"",questions:[{n:"4",stem:"Last numeric problem",answer:"8"}]},
    ]},
  ],
};

const mathFixture:MathBookIndex = {
  books:{"matem-1":{title:"Math",sections:[{
    chapter:1,section:1,title:"Equations",pages:[1,2],tasks:[
      {task:1,segments:[],sub_count:3,answers:["2","3","4"],questions:[
        {prompt:"First real math text",options:["One","Two","Three","Four"]},
        {prompt:"Second real math text",options:["One","Two","Three","Four"]},
        {prompt:"Third locked math text",options:["One","Two","Three","Four"]},
      ]},
    ],
  }]}, "matem-2":{title:"Math II",sections:[]}},
};

describe("Book previews before registration",()=>{
  it("shows first two original answerable questions without inventing or editing their content",()=>{
    const preview=pickGuestBookQuestions(sampleBook);
    expect(preview).toHaveLength(GUEST_BOOK_LIMIT);
    expect(preview[0]).toMatchObject({stem:"Which option is correct?",answer:"2",printedNo:"1",section:"First section",passage:"Example passage"});
    expect(preview[1]).toMatchObject({stem:"Which choice is next?",answer:"1",printedNo:"2"});
    expect(JSON.stringify(preview)).not.toContain("Hidden third question");
    expect(JSON.stringify(preview)).not.toContain("Last numeric problem");
    expect(sampleBook.sections[0]!.units).toHaveLength(2); // no mutation
  });

  it("supports numeric books and skips malformed, unanswerable MC items",()=>{
    const book:Book={id:52,sections:[{n:1,instr_en:"",instr_hy:"",units:[
      {id:"invalid",label:"",kind:"mc",passage:"",questions:[{n:"1",stem:"Incomplete",options:{A:"A"},answer:"B"}]},
      {id:"num",label:"",kind:"num",passage:"",questions:[{n:"2",stem:"What is 4 + 4?",answer:"8"}]},
    ]}]};
    const result=pickGuestBookQuestions(book);
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({kind:"number",stem:"What is 4 + 4?",answer:"8"});
    expect(pickGuestBookQuestions(book,0)).toEqual([]);
  });

  it("limits the separate two-volume math bank to two source-transcribed items",()=>{
    const v=pickGuestMathQuestions(mathFixture,"matem-1");
    expect(v).toHaveLength(2);
    expect(v[0]).toMatchObject({kind:"choice",answer:"2",stem:"First real math text"});
    expect(v[1]!.stem).toBe("Second real math text");
    expect(JSON.stringify(v)).not.toContain("Third locked math text");
    expect(pickGuestMathQuestions(mathFixture,"matem-2")).toEqual([]);
  });

  it("lists all existing playable question books plus both math volumes without replacing signed-in book pages",()=>{
    expect(GUEST_BOOKS.length).toBeGreaterThan(15);
    expect(GUEST_BOOKS.map(b=>b.id)).toContain("matem-1");
    expect(GUEST_BOOKS.map(b=>b.id)).toContain("matem-2");
    expect(GUEST_BOOKS.map(b=>b.id)).toContain("31");
    expect(GUEST_BOOKS.map(b=>b.id)).toContain("41");
    expect(new Set(GUEST_BOOKS.map(b=>b.id)).size).toBe(GUEST_BOOKS.length);
  });

  it("provides guest/locked/continue affordances in all UI languages",()=>{
    for(const lang of ["hy","en","ru"] as const){
      const t=GUEST_BOOK_TEXT[lang];
      expect(t.firstTwo.length).toBeGreaterThan(4);
      expect(t.rest.length).toBeGreaterThan(30);
      expect(t.locked.length).toBeGreaterThan(3);
      expect(t.login.length).toBeGreaterThan(4);
    }
    const browser=source("src/components/GuestBookBrowser.tsx");
    const route=source("src/routes/try.tsx");
    const root=source("src/routes/__root.tsx");
    expect(browser).toContain("pickGuestBookQuestions(data)");
    expect(browser).toContain("pickGuestMathQuestions(data,bookId)");
    expect(browser).toContain("disabled={!canAdvance}");
    expect(browser).toContain("onAnswered={()=>setCanAdvance(true)}");
    expect(browser).toContain("GUEST_BOOK_LIMIT+1");
    expect(browser).toContain('to="/auth"');
    expect(browser).toContain('to="/book/$bookId"');
    expect(browser).toContain('to="/math/books"');
    expect(browser).toContain("aria-pressed={category===filter}");
    expect(route).toContain("mode===\"practice\" && <GuestBookBrowser");
    expect(root).toContain('"/try"');
    expect(route).toContain('initialCategory={guestSubject ?? "all"}');
    expect(route).toContain("validateSearch: z.object({subject:");
    expect(source("src/routes/index.tsx")).toContain('to="/try" search={{subject:key}}');
    expect(root).not.toContain('"/dashboard", "/try"');
  });

  it("never renders full book units in the unlocked guest question UI and keeps guest answers ephemeral",()=>{
    const browser=source("src/components/GuestBookBrowser.tsx");
    expect(browser).not.toContain("recordAnswer(");
    expect(browser).not.toContain("localStorage");
    expect(browser).not.toContain("sessionStorage");
    expect(browser).not.toContain("pullAndMerge");
    expect(browser).not.toContain("supabase.auth");
    expect(browser).not.toContain("book.sections.map");
    expect(browser).toContain("BookSamples questions={questions}");
    expect(browser).toContain('key={questions[position]!.id}');
  });

  it("keeps the book grid mobile-responsive with controls accessible to touch and keyboard",()=>{
    const css=source("src/guest-experience-2026.css");
    expect(css).toContain(".sht-try-book-grid");
    expect(css).toContain(".sht-try-locked-content");
    expect(css).toContain("@media (max-width:650px)");
    expect(css).toContain("@media (prefers-reduced-motion:reduce)");
    expect(css).toContain(":focus-visible");
  });
});
