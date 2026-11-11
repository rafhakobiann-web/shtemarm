import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { createElement, type ReactNode } from "react";
import type { Progress } from "@/lib/progress";
import {
  RECENT_STUDY_KEY, readRecentStudy, saveRecentStudy, normalizeRecentStudy,
} from "@/lib/recent-study";

vi.mock("@/lib/lang", () => ({ useLang: () => "en" }));
vi.mock("@tanstack/react-router", () => ({
  Link: ({ to, params, search: _search, children, ...rest }: {
    to: string;
    params?: Record<string,string>;
    search?: unknown;
    children: ReactNode;
    [key: string]: unknown;
  }) => createElement("a", {
    ...rest,
    href: to.replace(/\$bookId|\$sectionId/g, key => params?.[key.slice(1)] ?? key),
  }, children),
}));
import { DashboardOverview } from "@/components/DashboardOverview";

function progress(answers: Progress["answers"] = {}): Progress {
  return { answers, xp: 0, streak: 0, lastDay: "", exams: [], mode: "classic" };
}

afterEach(() => {
  cleanup();
  window.localStorage.removeItem(RECENT_STUDY_KEY);
});

describe("purposeful recent study navigation", () => {
  const current = { bookId: "1", sectionId: "3", title: "Reading texts", mode: "classic" as const };

  it("validates local navigation data and rejects malformed IDs", () => {
    expect(normalizeRecentStudy(current)).toEqual(current);
    expect(normalizeRecentStudy({ ...current, sectionId: "0" })).toBeNull();
    expect(normalizeRecentStudy({ ...current, bookId: "../1" })).toBeNull();
    expect(normalizeRecentStudy({ ...current, mode: "unsafe" })).toBeNull();
    expect(normalizeRecentStudy({ ...current, title: "" })).toBeNull();
    expect(normalizeRecentStudy(JSON.parse('{"bookId":"1","sectionId":"3","mode":"game","title":"  Topic  "}')))
      .toEqual({ bookId: "1", sectionId: "3", mode: "game", title: "Topic" });
  });

  it("leaves existing answer progress untouched when opening or returning", () => {
    const savedProgress = '{"answers":{"unit:1":0},"xp":40}';
    window.localStorage.setItem("shtemaran-progress-v1", savedProgress);
    expect(saveRecentStudy(current)).toBe(true);
    expect(readRecentStudy()).toEqual(current);
    expect(window.localStorage.getItem("shtemaran-progress-v1")).toBe(savedProgress);
  });

  it("renders a useful resume action, review action and profile navigation", () => {
    saveRecentStudy(current);
    render(createElement(DashboardOverview, { progress: progress({ "a": 0, "b": 1 }) }));
    expect(screen.getByRole("link", { name: /Continue studying/ })).toHaveAttribute("href", "/study/1/3");
    expect(screen.getByText("Reading texts")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Review mistakes/ })).toHaveAttribute("href", "/mistakes");
    expect(screen.getByRole("link", { name: /My Profile/ })).toHaveAttribute("href", "/profile");
  });

  it("falls back to Explore on an invalid or missing last location", () => {
    window.localStorage.setItem(RECENT_STUDY_KEY, JSON.stringify({ ...current, bookId: "999999" }));
    render(createElement(DashboardOverview, { progress: progress() }));
    expect(screen.queryByRole("link", { name: /Continue studying/ })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Explore subjects/ })).toHaveAttribute("href", "/explore");
    expect(readRecentStudy()?.bookId).toBe("999999");
  });

  it("refreshes the dashboard after the same browser opens a different section", () => {
    render(createElement(DashboardOverview, { progress: progress() }));
    expect(screen.queryByRole("link", { name: /Continue studying/ })).not.toBeInTheDocument();
    saveRecentStudy(current);
    expect(screen.getByRole("link", { name: /Continue studying/ })).toHaveAttribute("href", "/study/1/3");
    window.localStorage.removeItem(RECENT_STUDY_KEY);
    fireEvent(window, new StorageEvent("storage", { key: RECENT_STUDY_KEY }));
    expect(screen.queryByRole("link", { name: /Continue studying/ })).not.toBeInTheDocument();
  });

  it("handles missing browser storage gracefully", () => {
    const broken = {
      getItem: () => { throw new Error("storage blocked"); },
      setItem: () => { throw new Error("storage blocked"); },
    };
    expect(readRecentStudy(broken)).toBeNull();
    expect(saveRecentStudy(current, broken)).toBe(false);
    expect(readRecentStudy(null)).toBeNull();
    expect(saveRecentStudy(current, null)).toBe(false);
  });
});

describe("Explore and dashboard editorial styling", () => {
  it("keeps the new stylesheet last, with semantic selection states and reduced motion", async () => {
    const { readFileSync } = await import("node:fs");
    const root = readFileSync("src/routes/__root.tsx", "utf8");
    const css = readFileSync("src/editorial-learning-2026.css", "utf8");
    expect(root.indexOf("href: editorialLearningCss")).toBeGreaterThan(root.indexOf("href: editorialFormsCss"));
    expect(css).toContain('.explore-filter-tab[aria-pressed="true"]');
    expect(css).toContain(".sht-dashboard-primary-action");
    expect(css).toContain("prefers-reduced-motion: reduce");
    expect(css).not.toContain("linear-gradient(");
    expect(css).not.toContain("radial-gradient(");
  });
});
