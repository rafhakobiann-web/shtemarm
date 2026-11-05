// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
const mock=vi.hoisted(()=>({reply:vi.fn(),lang:"en" as "hy"|"en"|"ru"}));
vi.mock("@tanstack/react-router",()=>({createFileRoute:()=> (options:unknown)=>options}));
vi.mock("@/lib/chat.functions",()=>({chatReply:mock.reply}));
vi.mock("@/lib/lang",()=>({useLang:()=>mock.lang,useTx:()=>(text:string)=>text}));
vi.mock("@/components/MathText",()=>({useKatex:()=>null,RichText:({text}:{text:string})=><span>{text}</span>}));
import { ChatPage } from "@/routes/chat";
const submit=(text:string)=>{
  fireEvent.change(screen.getByRole("textbox"),{target:{value:text}});
  fireEvent.submit(screen.getByRole("textbox").closest("form")!);
};
beforeEach(()=>{mock.reply.mockReset();mock.lang="en";localStorage.clear();});
afterEach(cleanup);
describe("AI teacher conversation",()=>{
  it("retries a failed question once without duplicating the student's message",async()=>{
    mock.reply.mockRejectedValueOnce(new Error("network")).mockResolvedValueOnce({text:"1. Divide by 7.\n2. x = 3.",error:false,contextToken:"signed-retry"});
    render(<ChatPage/>);
    submit("Solve 7x = 21.");
    await screen.findByRole("button",{name:"Try again"});
    fireEvent.click(screen.getByRole("button",{name:"Try again"}));
    await screen.findByText("Divide by 7.");
    expect(screen.getAllByText("Solve 7x = 21.")).toHaveLength(1);
    expect(mock.reply).toHaveBeenCalledTimes(2);
    expect(mock.reply.mock.calls[1][0].data.question).toBe("Solve 7x = 21.");
  });
  it("uses signed context on follow-up, then clears it for a new conversation",async()=>{
    mock.reply.mockResolvedValueOnce({text:"First answer",contextToken:"signed-context"}).mockResolvedValueOnce({text:"Second answer",contextToken:"signed-second"}).mockResolvedValueOnce({text:"New answer"});
    render(<ChatPage/>);
    submit("First question");await screen.findByText("First answer");
    submit("Follow-up question");await screen.findByText("Second answer");
    expect(mock.reply.mock.calls[1][0].data.contextToken).toBe("signed-context");
    fireEvent.click(screen.getByRole("button",{name:"New conversation"}));
    expect(screen.queryByText("First answer")).toBeNull();
    expect(document.activeElement).toBe(screen.getByRole("textbox"));
    submit("New question");await screen.findByText("New answer");
    expect(mock.reply.mock.calls[2][0].data.contextToken).toBeUndefined();
  });
  it("blocks duplicate sends while a response is pending and submits the selected study mode",async()=>{
    let resolve!:(value:unknown)=>void;
    mock.reply.mockReturnValue(new Promise(r=>{resolve=r;}));
    render(<ChatPage/>);
    fireEvent.click(screen.getByRole("button",{name:/Full explanation/}));
    submit("Explain a cell");submit("Explain a cell");
    expect(mock.reply).toHaveBeenCalledTimes(1);
    expect(mock.reply.mock.calls[0][0].data).toMatchObject({mode:"explain",locale:"en"});
    resolve({text:"Cell explanation"});
    await screen.findByText("Cell explanation");
  });
  it("shows localized starters and honestly labels offline replies",async()=>{
    mock.lang="ru";mock.reply.mockResolvedValue({text:"Ограниченная справка",offline:true});
    render(<ChatPage/>);
    expect(screen.getByRole("heading",{name:"ИИ-учитель"})).toBeTruthy();
    fireEvent.click(screen.getByRole("button",{name:"Проверь мои знания о строении клетки."}));
    await screen.findByText("Ограниченная справка");
    expect(screen.getByRole("status")).toBeTruthy();
    await waitFor(()=>expect(mock.reply.mock.calls[0][0].data.locale).toBe("ru"));
  });
});
