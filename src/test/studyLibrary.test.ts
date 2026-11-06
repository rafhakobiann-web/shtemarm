import {describe,expect,it} from "vitest";
import {filterStudyLibrary,normalizeStudyLibrary,type StudyItem} from "@/lib/studyLibrary";
const item:StudyItem={id:"book:21",title:"Հայոց պատմություն",subject:"history",bookId:21,collection:"Քննություն",note:"Կրկնել բաժինը",reviewAt:"2026-11-12",createdAt:1};
describe("my study library",()=>{
  it("rejects malformed items and bounds notes",()=>{
    expect(normalizeStudyLibrary([null,{}, {...item,note:"x".repeat(3000)}])).toMatchObject([{id:"book:21"}]);
    expect(normalizeStudyLibrary([{...item,note:"x".repeat(3000)}])[0].note).toHaveLength(2000);
  });
  it("deduplicates saved question identities",()=>{
    expect(normalizeStudyLibrary([item,{...item,title:"Updated"}])).toHaveLength(1);
  });
  it("filters collection, title, subject and notes",()=>{
    expect(filterStudyLibrary([item],"պատմություն","Քննություն")).toHaveLength(1);
    expect(filterStudyLibrary([item],"Կրկնել","Քննություն")).toHaveLength(1);
    expect(filterStudyLibrary([item],"","Other")).toEqual([]);
  });
});
