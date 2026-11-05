// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
const mock=vi.hoisted(()=>({lang:"en" as "en"|"ru",reply:vi.fn()}));
vi.mock("@tanstack/react-start",()=>({useServerFn:()=>mock.reply}));
vi.mock("@/lib/explain.functions",()=>({explainAnswer:vi.fn()}));
vi.mock("@/lib/lang",()=>({useLang:()=>mock.lang,useTx:()=>(text:string)=>text}));
vi.mock("@/components/EnglishText",()=>({EnglishText:()=>null,PassageTranslation:()=>null}));
vi.mock("@/components/MathText",()=>({useKatex:()=>null,RichText:({text}:{text:string})=><span>{text}</span>}));
import { Explain } from "@/components/UnitCard";
afterEach(()=>{cleanup();mock.lang="en";mock.reply.mockReset();});
describe("Question explanation identity",()=>{
  it("clears a completed explanation when the selected language changes",async()=>{
    mock.reply.mockResolvedValueOnce({text:"English reasoning",error:false,cached:true});
    const props={instruction:"Choose",passage:"",question:"Question one",correct:"A",chosen:"B"};
    const {rerender}=render(<Explain {...props}/>);
    fireEvent.click(screen.getByRole("button"));
    await screen.findByText("English reasoning");
    mock.lang="ru";rerender(<Explain {...props}/>);
    expect(screen.queryByText("English reasoning")).toBeNull();
    expect(screen.getByRole("button")).toBeTruthy();
    mock.reply.mockResolvedValueOnce({text:"Русское объяснение",error:false});
    fireEvent.click(screen.getByRole("button"));
    await screen.findByText("Русское объяснение");
    expect(mock.reply.mock.calls[1][0].data.locale).toBe("ru");
  });
  it("does not show a late answer from a previous question",async()=>{
    let resolve!:(value:unknown)=>void;
    mock.reply.mockReturnValue(new Promise(r=>{resolve=r;}));
    const props={instruction:"Choose",passage:"",question:"Question one",correct:"A",chosen:null};
    const {rerender}=render(<Explain {...props}/>);
    fireEvent.click(screen.getByRole("button"));
    rerender(<Explain {...props} question="Question two"/>);
    resolve({text:"Old question reasoning",error:false});
    await Promise.resolve();
    expect(screen.queryByText("Old question reasoning")).toBeNull();
    expect(screen.getByRole("button")).toBeTruthy();
  });
});
