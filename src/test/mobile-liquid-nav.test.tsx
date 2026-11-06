import { afterEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { MOBILE_TAB_TARGETS, MobileNav, getMobileNavIndex } from "@/components/MobileNav";

const mockLocation = vi.hoisted(() => ({pathname: "/", hash: ""}));
vi.mock("@tanstack/react-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-router")>();
  const React = await import("react");
  return {
    ...actual,
    useLocation: () => mockLocation,
    Link: ({to, hash, ...props}: {to: string; hash?: string; [key: string]: unknown}) =>
      React.createElement("a", {...props, href: to + (hash ? "#" + hash : "")}),
  };
});
vi.mock("@/lib/lang", () => ({
  useTx: () => (value: string) => value,
  useLang: () => "hy",
}));

afterEach(() => {
  mockLocation.pathname = "/";
  mockLocation.hash = "";
  vi.restoreAllMocks();
});

describe("Liquid Glass bottom dock routes", () => {
  it("maps five straightforward destinations to registered routes", () => {
    expect(MOBILE_TAB_TARGETS).toHaveLength(5);
    expect(MOBILE_TAB_TARGETS.map(tab => tab.id)).toEqual(["home", "explore", "exams", "tools", "profile"]);
    const routes = {
      "/dashboard": "src/routes/dashboard.tsx",
      "/explore": "src/routes/explore.tsx",
      "/study-tools": "src/routes/study-tools.tsx",
      "/profile": "src/routes/profile.tsx",
    } as const;
    for (const tab of MOBILE_TAB_TARGETS) {
      const routeFile = routes[tab.to];
      expect(readFileSync(routeFile, "utf8")).toContain('createFileRoute("' + tab.to + '")');
    }
    expect(readFileSync("src/routes/explore.tsx","utf8")).toContain('id="exams"');
    expect(readFileSync("src/routes/dashboard.tsx","utf8")).toContain('id="subjects"');
  });

  it("highlights the correct destination across books, exams, tools and profile", () => {
    const scenarios: Array<[string,string,number]> = [
      ["/dashboard","",0],["/dashboard","subjects",0],["/","",0],
      ["/explore","",1],["/explore","#exams",2],["/explore","subjects",1],
      ["/book/61","",1],["/study/61/1","",1],["/math/books","",1],
      ["/exam/english","",2],["/math","",2],["/biology","",2],
      ["/study-tools","",3],["/mini-games","",3],["/flashcards","",3],
      ["/calc","",3],["/chat","",3],["/study-plan","",3],
      ["/profile","",4],["/achievements","",4],["/learning-insights","",4],
    ];
    for(const [path,hash,index] of scenarios)
      expect(getMobileNavIndex(path,hash),path+"#"+hash).toBe(index);
  });

  it("renders five working, accessible and keyboard-reachable tabs", () => {
    mockLocation.pathname="/study-tools";
    const view=render(<MobileNav/>);
    const dock=screen.getByRole("navigation",{name:"Արագ նավարկում"});
    const links=within(dock).getAllByRole("link");
    expect(links).toHaveLength(5);
    expect(links.map(link=>link.getAttribute("href"))).toEqual([
      "/dashboard","/explore","/explore#exams","/study-tools","/profile"
    ]);
    expect(within(dock).getByRole("link",{name:"Գործիքներ"})).toHaveAttribute("aria-current","page");
    expect(dock.querySelector(".mobile-liquid-indicator")).toHaveStyle({transform:"translate3d(300%, 0, 0)"});
    view.unmount();
  });

  it("moves the active indicator to the current destination", () => {
    for(const [path,expected] of [
      ["/dashboard","translate3d(0%, 0, 0)"],
      ["/explore","translate3d(100%, 0, 0)"],
      ["/study-tools","translate3d(300%, 0, 0)"],
      ["/profile","translate3d(400%, 0, 0)"]
    ]) {
      mockLocation.pathname=path;
      const view=render(<MobileNav/>);
      expect(view.container.querySelector(".mobile-liquid-indicator")).toHaveStyle({transform:expected});
      view.unmount();
    }
  });

  it("compresses downward and expands upward without removing any touch targets", () => {
    const queue: FrameRequestCallback[] = [];
    vi.spyOn(window, "requestAnimationFrame").mockImplementation(callback => {
      queue.push(callback); return queue.length;
    });
    vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => undefined);
    Object.defineProperty(window, "scrollY", { value:0, writable:true, configurable:true });
    render(<MobileNav />);
    const dock = screen.getByRole("navigation", {name:"Արագ նավարկում"});
    expect(dock).toHaveAttribute("data-compact", "false");

    Object.defineProperty(window, "scrollY", {value:320,writable:true,configurable:true});
    fireEvent.scroll(window);
    act(() => { queue.shift()?.(0); });
    expect(dock).toHaveAttribute("data-compact", "true");
    expect(within(dock).getAllByRole("link")).toHaveLength(5);

    Object.defineProperty(window, "scrollY", {value:210,writable:true,configurable:true});
    fireEvent.scroll(window);
    act(() => { queue.shift()?.(0); });
    expect(dock).toHaveAttribute("data-compact", "false");
  });

  it("keeps fallback navigation when transparency or animations are reduced", () => {
    const css = readFileSync("src/styles.css", "utf8");
    expect(css).toContain(".mobile-liquid-dock");
    expect(css).toContain(".mobile-liquid-indicator");
    expect(css).toContain('prefers-reduced-motion: reduce');
    expect(css).toContain('prefers-reduced-transparency: reduce');
    expect(css).toContain('data-glass-blur="off"');
    expect(readFileSync("src/components/MobileNav.tsx", "utf8")).toContain("focus-visible:outline-2");
    // UI effects should not rely on heavy image-capture / SVG displacement.
    expect(css).not.toContain("feDisplacementMap");
  });
});

