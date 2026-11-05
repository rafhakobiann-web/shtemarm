// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
const navigate = vi.fn();
vi.mock("@tanstack/react-router", () => ({
  Link: ({ to, children, ...rest }: { to:string; children:ReactNode }) => <a href={to} {...rest}>{children}</a>,
  createFileRoute: () => (config:unknown) => config,
  useNavigate: () => navigate,
}));
vi.mock("@/lib/lang", () => ({useLang:()=>"en",initLang:vi.fn(),setLang:vi.fn()}));
vi.mock("@/integrations/supabase/client", () => ({ensureBrowserSupabaseConfig:async()=>false,supabase:{auth:{}}}));
import { LandingPage } from "@/routes/index";
import { LandingShowcase } from "@/components/LandingShowcase";
function pointer(node:Element,type:string,x:number,y:number) {
  const event=new Event(type,{bubbles:true});
  Object.assign(event,{pointerId:1,pointerType:"touch",clientX:x,clientY:y});
  fireEvent(node,event);
}
afterEach(cleanup);
describe("Landing interaction polish",()=>{
  it("closes navigation and appearance menus on Escape or an outside tap",()=>{
    const {container}=render(<LandingPage/>);
    const menu=container.querySelector<HTMLDetailsElement>(".sht-mobile-links")!;
    const palette=container.querySelector<HTMLDetailsElement>(".sht-palette-picker")!;
    menu.open=true;
    fireEvent.keyDown(document,{key:"Escape"});
    expect(menu.open).toBe(false);
    expect(document.activeElement).toBe(menu.querySelector("summary"));
    palette.open=true;
    fireEvent.pointerDown(palette.querySelector("summary")!);
    expect(palette.open).toBe(true);
    fireEvent.pointerDown(screen.getByRole("heading",{level:1}));
    expect(palette.open).toBe(false);
  });
  it("closes the phone island on Escape",()=>{
    render(<LandingPage/>);
    const toggle=screen.getByRole("button",{name:"Open interactive phone island"});
    fireEvent.click(toggle);
    expect(toggle.getAttribute("aria-expanded")).toBe("true");
    fireEvent.keyDown(document,{key:"Escape"});
    expect(toggle.getAttribute("aria-expanded")).toBe("false");
  });
  it("swipes sample questions while preserving vertical scrolling and answer taps",()=>{
    const {container}=render(<LandingShowcase lang="en"/>);
    const question=screen.getByText("If 3x + 5 = 14, what is x?");
    pointer(question,"pointerdown",200,100);pointer(question,"pointerup",100,110);
    expect(screen.getByText("Which sentence uses the Present Simple tense?")).toBeTruthy();
    const next=container.querySelector(".sht-story-question")!;
    pointer(next,"pointerdown",200,100);pointer(next,"pointerup",190,240);
    expect(screen.getByText("Which sentence uses the Present Simple tense?")).toBeTruthy();
    const option=container.querySelectorAll(".sht-story-answers button")[1];
    pointer(option,"pointerdown",200,100);pointer(option,"pointerup",100,100);
    fireEvent.click(option);
    expect(screen.getByRole("status").textContent).toContain("habit");
    expect(container.querySelector(".sht-story-feedback-slot")).toBeTruthy();
  });
});
