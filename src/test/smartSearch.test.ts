import {describe,expect,it} from "vitest";
import {matchesSearch,normalizeSearch,searchBookCatalog,searchLoadedBooks} from "@/lib/smartSearch";
import type {Book} from "@/lib/books";

describe("smart search",()=>{
  it("normalizes case and whitespace across scripts",()=>{
    expect(normalizeSearch("  English   BOOK  ")).toBe("english book");
    expect(matchesSearch("Հայոց պատմություն","պատմություն")).toBe(true);
    expect(matchesSearch("Mathematics","mathematcs")).toBe(true);
    expect(matchesSearch("Russian","ru")).toBe(false);
  });
  it("uses real catalog book ids",()=>{
    expect(searchBookCatalog("Կենսաբանություն").some(hit=>hit.bookId===31&&hit.kind==="book")).toBe(true);
    expect(searchBookCatalog("Կենսաբանություն",21)).toEqual([]);
  });
  it("searches loaded question stems without changing answer keys",()=>{
    const books:Book[]=[{id:21,sections:[{n:1,title:"Մաս առաջին",instr_en:"",instr_hy:"",units:[{kind:"mc",id:"u1",label:"",passage:"",questions:[{n:"1",stem:"Հայոց պատմության կարևոր հարց",options:{a:"ա"},answer:"a"}]}]}]}];
    const hits=searchLoadedBooks(books,"կարևոր");
    expect(hits).toMatchObject([{bookId:21,kind:"question",section:1}]);
    expect(searchLoadedBooks(books,"missing")).toEqual([]);
  });
});
