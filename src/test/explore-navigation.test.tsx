import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { readFileSync } from "node:fs";
import type { ReactNode } from "react";

vi.mock("@tanstack/react-router", async () => {
  const React = await import("react");
  return {
    createFileRoute: () => (options: unknown) => options,
    useLocation: () => ({pathname:"/explore",hash:""}),
    Link: ({ to, hash, children, ...rest }: {to:string;hash?:string;children:ReactNode;search?:unknown;params?:unknown;[key:string]:unknown}) => {
      const {search: _search, params: _params, ...attrs} = rest;
      return React.createElement("a", {...attrs, href:to+(hash?"#"+hash:"")},children);
    },
  };
});
vi.mock("@/lib/lang",()=>({useLang:()=> "en",useTx:()=> (s:string)=>s}));
import { EXPLORE_SUBJECTS, ExplorePage } from "@/routes/explore";
import { MOBILE_TAB_TARGETS, getMobileNavIndex } from "@/components/MobileNav";

describe("exploration-first information architecture",()=>{
  it("has nine distinct, localized subjects with clear existing destinations",()=>{
    expect(EXPLORE_SUBJECTS).toHaveLength(9);
    expect(new Set(EXPLORE_SUBJECTS.map(item=>item.id)).size).toBe(9);
    for(const subject of EXPLORE_SUBJECTS){
      for(const locale of ["hy","en","ru"] as const){
        expect(subject.title[locale].length,subject.id).toBeGreaterThan(1);
        expect(subject.detail[locale].length,subject.id).toBeGreaterThan(8);
      }
    }
    const code=readFileSync("src/routes/explore.tsx","utf8");
    expect(code).toContain('to="/dashboard" search={{subject:item.id}}');
    expect(code).toContain('to="/subject/$subject" params={{subject:item.id}}');
  });

  it("lets students search directly for a subject",()=>{
    render(<ExplorePage/>);
    expect(screen.getByRole("heading",{name:"Find a subject, exam, or tool"})).toBeInTheDocument();
    const input=screen.getByRole("searchbox",{name:"Search subjects and tools"});
    fireEvent.change(input,{target:{value:"biology"}});
    expect(screen.getByRole("heading",{name:"Biology"})).toBeInTheDocument();
    expect(screen.queryByRole("heading",{name:"Mathematics"})).not.toBeInTheDocument();
    expect(screen.getByRole("heading",{name:"Practice exams"})).toBeInTheDocument();
    expect(screen.getAllByRole("link",{name:/Biology/}).length).toBeGreaterThan(0);
  });

  it("keeps search when switching tabs and supports Escape to clear",()=>{
    render(<ExplorePage/>);
    const input=screen.getByRole("searchbox",{name:"Search subjects and tools"});
    fireEvent.change(input,{target:{value:"biology"}});
    fireEvent.click(screen.getByRole("button",{name:"Exams"}));
    expect(input).toHaveValue("biology");
    expect(screen.getByRole("heading",{name:"Practice exams"})).toBeInTheDocument();
    fireEvent.keyDown(input,{key:"Escape"});
    expect(input).toHaveValue("");
  });

  it("finds tools without forcing students to browse every category",()=>{
    render(<ExplorePage/>);
    fireEvent.change(screen.getByRole("searchbox"),{target:{value:"AI tutor"}});
    expect(screen.getByRole("heading",{name:"Helpful tools, when you need them"})).toBeInTheDocument();
    expect(screen.getByRole("link",{name:/AI tutor/})).toBeInTheDocument();
    expect(screen.queryByRole("heading",{name:"Choose a subject"})).not.toBeInTheDocument();
  });

  it("shows a useful empty result and reset instead of a blank page",()=>{
    render(<ExplorePage/>);
    fireEvent.change(screen.getByRole("searchbox"),{target:{value:"this subject does not exist"}});
    expect(screen.getByRole("status")).toHaveTextContent("No matches found");
    fireEvent.click(screen.getByRole("button",{name:"Show all"}));
    expect(screen.getByRole("heading",{name:"Mathematics"})).toBeInTheDocument();
    expect(screen.getByRole("heading",{name:"Practice exams"})).toBeInTheDocument();
  });

  it("separates subject, exam, and tool discovery",()=>{
    render(<ExplorePage/>);
    fireEvent.click(screen.getByRole("button",{name:"Exams"}));
    expect(screen.getByRole("heading",{name:"Practice exams"})).toBeInTheDocument();
    expect(screen.queryByRole("heading",{name:"Choose a subject"})).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button",{name:"Tools"}));
    expect(screen.getByRole("heading",{name:"Helpful tools, when you need them"})).toBeInTheDocument();
    expect(screen.queryByRole("heading",{name:"Practice exams"})).not.toBeInTheDocument();
  });

  it("has a consistent five-tab navigation and protected personal route",()=>{
    expect(MOBILE_TAB_TARGETS.map(tab=>tab.id)).toEqual(["home","explore","exams","tools","profile"]);
    expect(MOBILE_TAB_TARGETS[1].to).toBe("/explore");
    expect(MOBILE_TAB_TARGETS[2].hash).toBe("exams");
    expect(getMobileNavIndex("/explore")).toBe(1);
    expect(getMobileNavIndex("/explore","#exams")).toBe(2);
    expect(getMobileNavIndex("/profile")).toBe(4);
    const root=readFileSync("src/routes/__root.tsx","utf8");
    expect(root).not.toMatch(/PUBLIC_PATHS = new Set\(\[[^\]]*"\/explore"/);
    expect(root).not.toMatch(/PUBLIC_PATHS = new Set\(\[[^\]]*"\/profile"/);
    expect(root).toContain('if(status==="signed-out"&&!isPublic)');
    const dashboard=readFileSync("src/routes/dashboard.tsx","utf8");
    expect(dashboard).toContain("sht-home-subject-grid");
    expect(dashboard).not.toContain("LIBRARY_FILTERS");
  });
});
