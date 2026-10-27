import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import {
  PHYSICS_SOURCES,clampPhysicsPage,validatePhysicsSourceFile,
} from "@/lib/physics-source";

describe("source books supplied as scanned PDFs",()=>{
  it("indexes exactly 430 and 436 pages with their actual answer-table positions",()=>{
    expect(PHYSICS_SOURCES[61]).toMatchObject({
      pages:430,questionsStart:5,answersStart:406,
      fileName:"fizika-1_compressed.pdf",edition:"Երևան, 2017",
    });
    expect(PHYSICS_SOURCES[62]).toMatchObject({
      pages:436,questionsStart:5,answersStart:409,
      fileName:"fizika-2_compressed.pdf",edition:"Երևան, 2017",
    });
    for(const s of Object.values(PHYSICS_SOURCES)){
      expect(s.hash).toMatch(/^[a-f0-9]{64}$/);
      expect(s.webPdf).toMatch(/^https:\/\/cdn\.shtemaran\.am\/shtemarans\//);
      expect(s.answersStart).toBeLessThan(s.pages);
      expect(s.answersStart).toBeGreaterThan(400);
    }
  });
  it("never creates page requests outside each original scanned volume",()=>{
    expect(clampPhysicsPage(61,0)).toBe(1);
    expect(clampPhysicsPage(61,431)).toBe(430);
    expect(clampPhysicsPage(62,435)).toBe(435);
    expect(clampPhysicsPage(62,999)).toBe(436);
    expect(clampPhysicsPage(61,NaN)).toBe(1);
    expect(clampPhysicsPage(62,57.9)).toBe(57);
  });
  it("rejects missing or invalid PDF files and permits the original compressed size",()=>{
    expect(validatePhysicsSourceFile({name:"document.png",size:64000000,type:"image/png"})).toMatch(/PDF/);
    expect(validatePhysicsSourceFile({name:"fizika-1_compressed.pdf",size:5,type:"application/pdf"})).toMatch(/փոքր/);
    expect(validatePhysicsSourceFile({name:"fizika-2_compressed.pdf",size:64800000,type:"application/pdf"})).toBeNull();
    expect(validatePhysicsSourceFile({name:"fizika-2_compressed.pdf",size:200000000,type:"application/pdf"})).toMatch(/180/);
  });
  it("ensures app renders sources locally rather than distributing scanned book assets",()=>{
    const component=readFileSync("src/components/PhysicsSourceReader.tsx","utf8");
    expect(component).toContain("putLocalPhysicsPdf");
    expect(component).toContain("getLocalPhysicsPdf");
    expect(component).toContain("URL.createObjectURL");
    expect(component).toContain("iframe");
    expect(component).toContain("answersStart");
    expect(component).not.toContain("fetch(source.webPdf)");
    expect(readFileSync("src/routes/physics.books.tsx","utf8")).toContain("/physics/books");
    expect(readFileSync("src/components/PhysicsWorkspace.tsx","utf8")).toContain("/physics/books");
  });
});
