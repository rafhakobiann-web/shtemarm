import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
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

describe("Quiet mobile navigation", () => {
  it("maps four primary destinations to registered routes", () => {
    expect(MOBILE_TAB_TARGETS).toHaveLength(4);
    expect(MOBILE_TAB_TARGETS.map(tab => tab.id)).toEqual(["home", "explore", "exams", "tools"]);
    const routes = {
      "/dashboard": "src/routes/dashboard.tsx",
      "/explore": "src/routes/explore.tsx",
      "/study-tools": "src/routes/study-tools.tsx",
    } as const;
    for (const tab of MOBILE_TAB_TARGETS) {
      const routeFile = routes[tab.to];
      expect(readFileSync(routeFile, "utf8")).toContain('createFileRoute("' + tab.to + '")');
    }
    expect(readFileSync("src/routes/explore.tsx", "utf8")).toContain('id="exams"');
    expect(readFileSync("src/routes/dashboard.tsx", "utf8")).toContain('id="subjects"');
  });

  it("keeps study destinations on predictable tabs and profile accessible from the menu", () => {
    const scenarios: Array<[string,string,number]> = [
      ["/dashboard","",0],["/dashboard","subjects",0],["/","",0],
      ["/explore","",1],["/explore","#exams",2],["/explore","subjects",1],
      ["/book/61","",1],["/study/61/1","",1],["/math/books","",1],
      ["/subject/physics","",1],["/exam/english","",2],["/math","",2],
      ["/biology","",2],["/study-tools","",3],["/mini-games","",3],
      ["/flashcards","",3],["/calc","",3],["/chat","",3],["/study-plan","",3],
      ["/profile","",-1],["/achievements","",-1],["/learning-insights","",-1],
    ];
    for (const [path,hash,index] of scenarios)
      expect(getMobileNavIndex(path,hash), path + "#" + hash).toBe(index);
  });

  it("renders four accessible, keyboard-reachable links", () => {
    mockLocation.pathname = "/study-tools";
    const view = render(<MobileNav/>);
    const nav = screen.getByRole("navigation", {name:"Արագ նավարկում"});
    const links = within(nav).getAllByRole("link");
    expect(links).toHaveLength(4);
    expect(links.map(link => link.getAttribute("href"))).toEqual([
      "/dashboard", "/explore", "/explore#exams", "/study-tools",
    ]);
    expect(within(nav).getByRole("link", {name:"Գործիքներ"})).toHaveAttribute("aria-current", "page");
    expect(nav.className).toContain("sht-quiet-mobile-nav");
    expect(nav.className).not.toContain("mobile-liquid-dock");
    view.unmount();
  });

  it("hides the mobile dock during question sessions", () => {
    mockLocation.pathname = "/study/61/1";
    const view = render(<MobileNav/>);
    expect(view.container.querySelector(".sht-quiet-mobile-nav")).toHaveAttribute("hidden");
    view.unmount();
  });

  it("uses an opaque bar without liquid-glass styling", () => {
    const css = readFileSync("src/quiet-learning-2026.css", "utf8");
    const source = readFileSync("src/components/MobileNav.tsx", "utf8");
    expect(css).toContain(".site-mobile-nav.sht-quiet-mobile-nav");
    expect(css).toContain("backdrop-filter: none");
    expect(source).not.toContain("mobile-liquid");
    expect(source).toContain("focus-visible:outline-2");
  });
});
