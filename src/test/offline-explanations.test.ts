import {describe,it,expect} from "vitest";
import {reliableEnglishFallback} from "@/lib/reliableEnglishFallback";
import {reliableMathFallback} from "@/lib/reliableMathFallback";
describe("offline explanations",()=>{
 const en={instruction:"Choose the correct form in passive voice",passage:"",question:"Which passive form is correct?",correct:"2) was written",chosen:"1) wrote"};
 it("explains identified English grammar in all languages",()=>{
  expect(reliableEnglishFallback(en,"hy")).toContain("Կրավորական");
  expect(reliableEnglishFallback(en,"en")).toContain("Passive voice");
  expect(reliableEnglishFallback(en,"ru")).toContain("Страдательный");
 });
 it("does not invent grammar rules for unrelated reading questions",()=>{
  const r=reliableEnglishFallback({...en,instruction:"Read the passage",question:"What is the main idea?"},"en");
  expect(r).toContain("not yet available");
  expect(r).not.toContain("Passive voice");
 });
 it("solves exact verified simple linear equations",()=>{
  const r=reliableMathFallback({kind:"open",question:"3x-7=11",correct:"6",chosen:"5",options:[]},"hy");
  expect(r).toContain("x=6");
  expect(r).toContain("Ստուգում");
 });
 it("does not fabricate steps when the key conflicts",()=>{
  const r=reliableMathFallback({kind:"open",question:"3x-7=11",correct:"8",chosen:null,options:[]},"en");
  expect(r).toContain("verified step-by-step solution is not available");
  expect(r).not.toContain("x=6");
 });
 it("does not mistake prose or quadratic equations for simple linear equations",()=>{
  const r=reliableMathFallback({kind:"open",question:"Find the roots of x²-5x+6=0",correct:"2;3",chosen:null,options:[]},"en");
  expect(r).toContain("not available");
 });
});
