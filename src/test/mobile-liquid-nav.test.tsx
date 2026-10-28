import { afterEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { MOBILE_TAB_TARGETS, MobileNav, getMobileNavIndex } from "@/components/MobileNav";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { QueryClient } from "@tanstack/react-query";
import { routeTree } from "@/routeTree.gen";

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
}));

afterEach(() => {
  mockLocation.pathname = "/";
  mockLocation.hash = "";
  vi.restoreAllMocks();
});

describe("Liquid Glass bottom dock routes", () => {
  it("maps all five destinations to existing routes or documented home anchors", () => {
    expect(MOBILE_TAB_TARGETS).toHaveLength(5);
    expect(MOBILE_TAB_TARGETS.map(tab => tab.id)).toEqual([
      "home", "books", "exams", "games", "tools",
    ]);
    const router = createRouter({
      routeTree, context: { queryClient: new QueryClient() },
    });
    for (const tab of MOBILE_TAB_TARGETS) {
      expect(router.matchRoutes(tab.to).at(-1)?.routeId).not.toBe(rootRouteId);
    }
    const home = readFileSync("src/routes/index.tsx", "utf8");
    expect(home).toContain('id="subjects"');
    expect(home).toContain('id="exams"');
  });

  it("keeps the correct selected item across studies, exams, games and tools", () => {
    const scenarios: Array<[string,string,number]> = [
      ["/", "", 0], ["/", "subjects", 1], ["/", "#exams", 2],
      ["/book/61", "", 1], ["/study/61/1", "", 1],
      ["/math/books", "", 1], ["/physics/original", "", 1],
      ["/physics/books", "", 1], ["/history-book", "", 1],
      ["/exam/english", "", 2], ["/test/1", "", 2],
      ["/subject/physics", "", 2], ["/biology", "", 2],
      ["/math", "", 2], ["/physics/scan-practice", "", 2],
      ["/mini-games", "", 3], ["/mini-games/", "", 3],
      ["/study-tools", "", 4], ["/assessment-builder", "", 4],
      ["/calc", "", 4], ["/chat", "", 4], ["/flashcards", "", 4],
    ];
    for (const [path, hash, index] of scenarios) {
      expect(getMobileNavIndex(path, hash), path + "#" + hash).toBe(index);
    }
  });

  it("renders five accessible working destinations and a moving active bubble", () => {
    mockLocation.pathname = "/mini-games";
    const view = render(<MobileNav />);
    const dock = screen.getByRole("navigation", {name:"Արագ նավարկում"});
    const links = within(dock).getAllByRole("link");
    expect(links).toHaveLength(5);
    expect(links.map(link => link.getAttribute("href"))).toEqual([
      "/", "/#subjects", "/#exams", "/mini-games", "/study-tools",
    ]);
    expect(within(dock).getByRole("link", {name:"Խաղեր"})).toHaveAttribute(
      "aria-current", "page",
    );
    expect(dock.querySelector(".mobile-liquid-indicator")).toHaveStyle({
      transform:"translate3d(300%, 0, 0)",
    });
    view.unmount();
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
    expect(css).toContain('focus-visible:outline-2');
    // UI effects should not rely on heavy image-capture / SVG displacement.
    expect(css).not.toContain("feDisplacementMap");
  });
});
