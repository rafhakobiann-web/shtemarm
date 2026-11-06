import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import type { ReactNode } from "react";

vi.mock("@/lib/lang", () => ({useLang:()=> "en"}));
vi.mock("@/components/MathText", () => ({
  useKatex:()=>null,
  RichText:({text}:{text:string})=><span>{text}</span>,
}));
vi.mock("@/components/MathDiagram", () => ({
  readDiagram:(src:string)=>{
    try {
      const value=JSON.parse(src);
      return value.type==="triangle" ? value : null;
    } catch { return null; }
  },
  MathDiagram:()=> <div data-testid="safe-math-diagram">Verified geometry diagram</div>,
}));
vi.mock("@/components/ui/dialog", () => ({
  Dialog:({open,children}:{open:boolean;children:ReactNode})=>open?<div>{children}</div>:null,
  DialogContent:({children,...props}:{children:ReactNode;[key:string]:unknown})=><section role="dialog" {...props}>{children}</section>,
  DialogHeader:({children,...props}:{children:ReactNode;[key:string]:unknown})=><header {...props}>{children}</header>,
  DialogTitle:({children}:{children:ReactNode})=><h2>{children}</h2>,
  DialogDescription:({children,...props}:{children:ReactNode;[key:string]:unknown})=><p {...props}>{children}</p>,
}));

import { RichExplanation, splitExplanation } from "@/components/RichExplanation";

describe("near-full-screen step-by-step lesson",()=>{
  it("opens automatically and lets students go forward, backward, finish and reopen",()=>{
    render(<RichExplanation source="ai" text={"1. Understand the problem\n2. Apply the rule\n3. Check the answer"}/>);
    const dialog=screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText("Understand the problem")).toBeInTheDocument();
    expect(within(dialog).getByRole("progressbar")).toHaveAttribute("aria-valuemax","3");
    expect(within(dialog).getByRole("button",{name:/Previous step/})).toBeDisabled();

    fireEvent.click(within(dialog).getByRole("button",{name:/Next step/}));
    expect(within(dialog).getByText("Apply the rule")).toBeInTheDocument();
    expect(within(dialog).getByRole("progressbar")).toHaveAttribute("aria-valuenow","2");
    fireEvent.click(within(dialog).getByRole("button",{name:/Previous step/}));
    expect(within(dialog).getByText("Understand the problem")).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole("button",{name:/Next step/}));
    fireEvent.click(within(dialog).getByRole("button",{name:/Next step/}));
    expect(within(dialog).getByText("Check the answer")).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole("button",{name:/Finish lesson/}));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button",{name:/Open full-screen explanation/}));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Understand the problem")).toBeInTheDocument();
  });

  it("shows a single step for unnumbered offline responses without inventing details",()=>{
    render(<RichExplanation source="offline" text="Always multiply numerator and denominator by the same number."/>);
    const dialog=screen.getByRole("dialog");
    expect(within(dialog).getByRole("progressbar")).toHaveAttribute("aria-valuemax","1");
    expect(within(dialog).getByRole("button",{name:/Finish lesson/})).toBeInTheDocument();
    expect(within(dialog).queryByText(/AI explanations can be inaccurate/)).not.toBeInTheDocument();
  });

  it("retains validated diagram fences as separate pages, never injected HTML",()=>{
    const ticks=String.fromCharCode(96).repeat(3);
    const source=["1. Set up triangle",ticks+"diagram",
      '{"type":"triangle","labels":["A","B","C"]}',ticks].join("\n");
    const blocks=splitExplanation(source);
    expect(blocks.map(block=>block.kind)).toEqual(["text","diagram"]);
    render(<RichExplanation text={source}/>);
    fireEvent.click(within(screen.getByRole("dialog")).getByRole("button",{name:/Next step/}));
    expect(screen.getByTestId("safe-math-diagram")).toBeInTheDocument();
  });

  it("keeps errors readable inline instead of trapping students in a modal",()=>{
    render(<RichExplanation text="Explanation unavailable; retry the request." error/>);
    expect(screen.getByRole("alert")).toHaveTextContent("Explanation unavailable");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
