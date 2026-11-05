import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import type { Progress } from "@/lib/progress";
import { readFileSync } from "node:fs";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ to, children, hash }: { to: string; children: ReactNode; hash?: string }) => (
    <a href={to + (hash ? "#" + hash : "")}>{children}</a>
  ),
}));
vi.mock("@/lib/lang", () => ({ useLang: () => "en" }));

import { DashboardFocus, progressSummary } from "@/components/DashboardFocus";

function makeProgress(overrides: Partial<Progress> = {}): Progress {
  return { answers: {}, xp: 0, streak: 0, lastDay: "", exams: [], mode: "game", ...overrides };
}

describe("dashboard focuses on the actual student's work", () => {
  it("computes accuracy from saved answers without fabricated progress", () => {
    expect(progressSummary(makeProgress())).toEqual({
      answered: 0, correct: 0, review: 0, accuracy: null, recentExam: null,
    });
    const recent = { date: "2026-11-05", book: 1, score: 18, total: 20 };
    expect(progressSummary(makeProgress({
      answers: { q1: 1, q2: 0, q3: 1 }, exams: [recent],
    }))).toEqual({
      answered: 3, correct: 2, review: 1, accuracy: 67, recentExam: recent,
    });
  });

  it("shows real review priority, favorites, recent exam and way back home", () => {
    render(<DashboardFocus name="Ada" progress={makeProgress({
      answers: { q1: 0, q2: 1 }, xp: 120,
      exams: [{ date: "2026-11-05", book: 2, score: 12, total: 15 }],
    })} subjects={["math", "physics"]} />);
    expect(screen.getByRole("heading", { name: "Welcome back, Ada" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Review mistakes/ })).toHaveAttribute("href", "/mistakes");
    expect(screen.getByRole("link", { name: /View landing page/ })).toHaveAttribute("href", "/");
    expect(screen.getByText("12 / 15")).toBeInTheDocument();
    expect(screen.getByText("Physics")).toBeInTheDocument();
  });

  it("does not claim any exam or accuracy when no activity exists", () => {
    render(<DashboardFocus progress={makeProgress()} subjects={[]} />);
    expect(screen.getByText("No exam results yet")).toBeInTheDocument();
    expect(screen.getByText("No answers recorded yet. Try your first practice session.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Continue learning/ })).toHaveAttribute("href", "/study-plan");
  });

  it("keeps book and exam destinations and adds keyboard-accessible subject filters", () => {
    const dashboard = readFileSync("src/routes/dashboard.tsx", "utf8");
    expect(dashboard).toContain("LIBRARY_FILTERS.map");
    expect(dashboard).toContain("aria-pressed={libraryFilter === option.id}");
    expect(dashboard).toContain("showLibrary");
    expect(dashboard).toContain("defaultOpen={libraryFilter !==");
    expect(dashboard).toContain("onToggle={event => setExpanded");
    expect(dashboard).toContain('id="exams"');
    expect(dashboard).toContain('id="subjects"');
    expect(dashboard).toContain('search={{ mode: "exam" }}');
    expect(dashboard).toContain("sht-dashboard-bento");
    expect(dashboard).toContain('<DashboardFocus name={name} progress={progress} subjects={savedSubjects} />');
    expect(readFileSync("src/components/AppHeader.tsx", "utf8")).toContain('<Link to="/"');
  });
});
