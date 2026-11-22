// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within, waitFor } from "@testing-library/react";
import { chatReply } from "@/lib/chat.functions";
import { StudyTutorDrawer } from "@/components/StudyTutorDrawer";

vi.mock("@/lib/lang", () => ({useLang:()=>"en"}));
vi.mock("@/lib/chat.functions", () => ({chatReply:vi.fn()}));
vi.mock("@/components/MathText",()=>({
  useKatex:()=>null,
  RichText:({text}:{text:string})=><span>{text}</span>,
}));

afterEach(()=>{
  cleanup();
  document.body.style.overflow="";
  delete document.body.dataset.studyTutorOpen;
});

describe("mobile AI assistant layer recovery",()=>{
  it("opens above the page, keeps the composer available and restores the page on closing",()=>{
    render(<StudyTutorDrawer/>);
    const trigger=screen.getByRole("button",{name:"Ask AI tutor"});
    fireEvent.click(trigger);
    const dialog=screen.getByRole("dialog",{name:"AI assistant"});
    expect(dialog).toBeInTheDocument();
    expect(document.body.dataset.studyTutorOpen).toBe("true");
    expect(document.body.style.overflow).toBe("hidden");
    expect(within(dialog).getByRole("textbox",{name:"Type your question…"})).toBeInTheDocument();
    expect(dialog.closest("[data-study-tutor-modal]")).toHaveClass("z-[100]");
    fireEvent.click(within(dialog).getByRole("button",{name:"Close AI assistant"}));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(document.body.dataset.studyTutorOpen).toBeUndefined();
    expect(document.body.style.overflow).toBe("");
  });

  it("opens via a question event but never grants AI context consent automatically",()=>{
    render(<StudyTutorDrawer/>);
    fireEvent(window,new CustomEvent("shtemarm:tutor-question",{
      detail:{question:"Which topic describes the passage?",chosen:"B"},
    }));
    const dialog=screen.getByRole("dialog");
    expect(within(dialog).getByText("Which topic describes the passage?")).toBeInTheDocument();
    const consent=within(dialog).getByRole("checkbox",{name:"I agree to share this context with AI"});
    expect(consent).not.toBeChecked();
    fireEvent.click(consent);
    expect(consent).toBeChecked();
    fireEvent.click(within(dialog).getByRole("button",{name:"Close AI assistant"}));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
  it("passes verified source identity but keeps question text private without consent",async()=>{
    vi.mocked(chatReply).mockResolvedValue({text:"Please share the question."} as Awaited<ReturnType<typeof chatReply>>);
    render(<StudyTutorDrawer studyContext={{subject:"English",bookPart:"Part III",sectionNumber:8,chapter:"Grammar"}}/>);
    fireEvent(window,new CustomEvent("shtemarm:tutor-question",{
      detail:{question:"Private question content",number:"1",unitLabel:"Exercise group A"},
    }));
    const dialog=screen.getByRole("dialog");
    expect(within(dialog).getByText(/English · Part III/)).toBeInTheDocument();
    fireEvent.change(within(dialog).getByRole("textbox"),{target:{value:"Explain exercise 1"}});
    fireEvent.click(within(dialog).getByRole("button",{name:"Send"}));
    await waitFor(()=>expect(chatReply).toHaveBeenCalled());
    const sentCall = vi.mocked(chatReply).mock.calls.at(-1)?.[0] as { data?: { question?: string } } | undefined;
    const sent = sentCall?.data?.question ?? "";
    expect(sent).toContain("Subject: English");
    expect(sent).toContain("Book/part: Part III");
    expect(sent).toContain("Section number: 8");
    expect(sent).toContain("Printed exercise number: 1");
    expect(sent).not.toContain("Private question content");
  });

});
