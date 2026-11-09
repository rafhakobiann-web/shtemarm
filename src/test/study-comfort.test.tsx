import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { UnitCard, type UnitAnswer } from "@/components/UnitCard";
import { Route } from "@/routes/study.$bookId.$sectionId";
import type { Unit } from "@/lib/books";

const state = vi.hoisted(() => ({ mode: "classic", recordAnswer: vi.fn(), book: null as unknown }));
vi.mock("@tanstack/react-router", async () => {
  const React = await import("react");
  return {
    createFileRoute: () => (options: unknown) => ({options, useParams: () => ({bookId:"1",sectionId:"1"}), useSearch: () => ({mode:state.mode})}),
    notFound: () => new Error("not found"),
    Link: ({to, params: _params, search: _search, ...props}: Record<string, unknown>) => React.createElement("a", {...props,href:to}),
  };
});
vi.mock("@tanstack/react-start", () => ({useServerFn: () => vi.fn()}));
vi.mock("@/lib/explain.functions", () => ({explainAnswer:vi.fn()}));
vi.mock("@/components/EnglishText", () => ({EnglishText: ({text}: {text:string}) => <span>{text}</span>, PassageTranslation: () => null}));
vi.mock("@/lib/lang", () => ({useLang: () => "en", useTx: () => (s:string, vars?:Record<string,string|number>) => s.replace(/\{(\w+)\}/g, (m,k) => String(vars?.[k] ?? m))}));
vi.mock("@/lib/useBook", () => ({useBook: () => ({data:state.book,refetch:vi.fn()})}));
vi.mock("@/lib/progress", () => ({recordAnswer: (...args:unknown[]) => state.recordAnswer(...args), update:vi.fn(),useProgress: () => ({answers:{}})}));
vi.mock("@/lib/unitMistakes", () => ({recordUnitMistakes:vi.fn(),subjectForBookId: () => "english"}));
afterEach(() => {cleanup();state.mode="classic";state.recordAnswer.mockReset();});

const unit:Unit = {id:"demo-unit",label:"1",kind:"mc",passage:"A complete original reading passage. Keep all its sentences.",questions:[
  {n:"1",stem:"First question",options:{A:"First choice",B:"Second choice"},answer:"A"},
  {n:"2",stem:"Second question",options:{A:"Another choice",B:"Last choice"},answer:"B"},
]};
function Card() {
  const [value,setValue] = useState<UnitAnswer>();
  const [checked,setChecked] = useState<Record<string,boolean>>({});
  return <UnitCard unit={unit} instruction="Read and answer" value={value} onChange={setValue}
    revealed={k => !!checked[k]} onCheck={k => setChecked(previous => ({...previous,[k]:true}))} />;
}

describe("comfortable question practice", () => {
  it("keeps every passage sentence, lets students collapse it and restores it from questions", () => {
    render(<Card />);
    const toggle = screen.getByRole("button", {name:/Reading text/});
    const text = document.getElementById(toggle.getAttribute("aria-controls")!)!;
    expect(text).toHaveTextContent(unit.passage);
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded","false");
    expect(text).not.toBeVisible();
    fireEvent.click(screen.getByRole("link", {name:/Back to text/}));
    expect(text).toBeVisible();
    expect(toggle).toHaveAttribute("aria-expanded","true");
  });

  it("selects an answer when the student taps the option text or empty row space", () => {
    render(<Card />);
    const first = screen.getByRole("region", {name:"First question"});
    const choices = within(first).getAllByRole("radio");
    const label = choices[1]!.closest("label");
    expect(label).not.toBeNull();
    // Text must activate the native radio, not a nested translation button.
    fireEvent.click(within(first).getByText("Second choice"));
    expect(choices[1]).toBeChecked();
    // The entire option row must also remain tappable.
    fireEvent.click(choices[0]!.closest("label")!);
    expect(choices[0]).toBeChecked();
    expect(choices[1]).not.toBeChecked();
  });

  it("announces wrong answers, locks checked choices and tracks each question separately", () => {
    render(<Card />);
    expect(screen.getAllByRole("button", {name:"Ստուգել →"})).toHaveLength(2);
    expect(screen.getAllByRole("button", {name:"Ստուգել →"}).every(button => button.hasAttribute("disabled"))).toBe(true);
    const first = screen.getByRole("region", {name:"First question"});
    const choices = within(first).getAllByRole("radio");
    fireEvent.click(choices[1]!);
    expect(choices[1]).toBeChecked();
    expect(choices[1]).toHaveAccessibleDescription("Second choice");
    fireEvent.click(within(first).getByRole("button", {name:"Ստուգել →"}));
    expect(within(first).getByRole("status")).toHaveTextContent("Review the correct answer: A) First choice");
    expect(choices[0]).toBeDisabled();
    expect(screen.getByText("1 / 2 checked")).toBeInTheDocument();
    expect(within(screen.getByRole("region", {name:"Second question"})).getAllByRole("radio")[0]).not.toBeDisabled();
  });

  it("supports keyboard-only choice and checking when the question card is focused", () => {
    render(<Card />);
    const first = screen.getByRole("region", { name: "First question" });
    const choices = within(first).getAllByRole("radio");
    first.focus();
    fireEvent.keyDown(first, { key: "2" });
    expect(choices[1]).toBeChecked();
    fireEvent.keyDown(first, { key: "Enter" });
    expect(choices[1]).toBeDisabled();
    expect(within(first).getByRole("status")).toHaveTextContent("Review the correct answer:");
  });

  it("does not override native input keyboard handling", () => {
    render(<Card />);
    const first = screen.getByRole("region", { name: "First question" });
    const choices = within(first).getAllByRole("radio");
    fireEvent.click(choices[1]!);
    fireEvent.keyDown(choices[1]!, { key: "1" });
    expect(choices[1]).toBeChecked();
  });

  it("pages a long section in source order without losing selected or checked answers", () => {
    const units:Unit[] = Array.from({length:25}, (_,i) => ({id:`demo-${i}`,label:String(i+1),kind:"mc",passage:"",questions:[
      {n:String(i+1),stem:`Question ${i+1}`,options:{A:"Yes",B:"No"},answer:"A"},
    ]}));
    state.book = {id:1,sections:[{n:1,title:"Reading",instr_hy:"Read",instr_en:"Read",units}]};
    const Component = Route.options.component as React.ComponentType;
    render(<Component />);
    expect(screen.getAllByRole("article")).toHaveLength(12);
    const first = screen.getByRole("region", {name:"Question 1"});
    fireEvent.click(within(first).getAllByRole("radio")[0]!);
    fireEvent.click(within(first).getByRole("button", {name:"Ստուգել →"}));
    fireEvent.click(screen.getAllByRole("button", {name:"Next →"})[0]!);
    expect(screen.queryByRole("region", {name:"Question 1"})).not.toBeInTheDocument();
    expect(screen.getByRole("region", {name:"Question 13"})).toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(12);
    fireEvent.click(screen.getAllByRole("button", {name:"← Previous"})[0]!);
    const saved = within(screen.getByRole("region", {name:"Question 1"})).getAllByRole("radio")[0]!;
    expect(saved).toBeChecked();
    expect(saved).toBeDisabled();
    expect(state.recordAnswer).toHaveBeenCalledTimes(1);
  });
});
