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
import { DashboardOverview } from "@/components/DashboardOverview";

function makeProgress(overrides: Partial<Progress> = {}): Progress {
  return { answers: {}, xp: 0, streak: 0, lastDay: "", exams: [], mode: "game", ...overrides };
}

describe("dashboard focuses on the actual student's work", () => {
  it("replaces the oversized Biology tile but retains direct access to exams", () => {
    const dashboard = readFileSync("src/routes/dashboard.tsx", "utf8");
    expect(dashboard).toContain('<Link to="/biology" className="inline-flex min-h-12');
    expect(dashboard).toContain('tx("Կենսաբանության քննություններ")');
    expect(dashboard).not.toContain('tx("Բոլոր կենսաբանության թեստերը")');
    expect(dashboard).toContain('title={tx("Կենսաբանություն · Փորձնական քննություն")}');
  });

  it("shares landing design tokens without changing student data or route logic", () => {
    const css = readFileSync("src/dashboard-focus.css", "utf8");
    const landing = readFileSync("src/landing-v3.css", "utf8");
    expect(css).toContain("--dash-glass");
    expect(css).toContain("--dash-line");
    expect(css).toContain("prefers-reduced-motion: reduce");
    expect(css).toContain("user-high-contrast");
    expect(landing).toContain("--sl-line");
    expect(css).not.toContain("position: fixed");
  });

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

  it("shows only a compact learning start and profile navigation on the dashboard", () => {
    const { container } = render(<DashboardOverview name="Ada" progress={makeProgress({
      answers: { one: 1, two: 0, three: 0 }, xp: 200,
    })} />);
    expect(screen.getByRole("heading", { name: "Your study dashboard" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Review mistakes/ })).toHaveAttribute("href", "/mistakes");
    expect(screen.getByRole("link", { name: /My Profile/ })).toHaveAttribute("href", "/profile");
    expect(screen.getByText("3 questions answered · 2 questions to review")).toBeInTheDocument();
    expect(container.querySelectorAll(".academy-bento")).toHaveLength(1);
    expect(container.querySelectorAll("select, [role=progressbar], [data-achievement]")).toHaveLength(0);
  });

  it("starts with a subject picker when no answers are recorded", () => {
    render(<DashboardOverview progress={makeProgress()} />);
    expect(screen.getByText("Your first practice session starts with one question.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Explore subjects/ })).toHaveAttribute("href", "/explore");
    expect(screen.getByRole("link", { name: /My Profile/ })).toHaveAttribute("href", "/profile");
  });

  it("keeps book routes and exposes a simpler discovery entry", () => {
    const dashboard = readFileSync("src/routes/dashboard.tsx", "utf8");
    const explore = readFileSync("src/routes/explore.tsx","utf8");
    expect(dashboard).toContain('id="subjects"');
    expect(dashboard).toContain('id="exams"');
    expect(dashboard).toContain('to="/explore"');
    expect(dashboard).toContain('sht-home-subject-grid');
    for (const route of ['to="/math"', 'to="/history"', 'to="/biology"'])
      expect(explore).toContain(route);
    expect(dashboard).toContain('<DashboardOverview name={name} progress={progress} />');
    expect(readFileSync("src/routes/profile.tsx", "utf8")).toContain('<DashboardFocus name={name} progress={progress} subjects={subjects} showGreeting={false} />');
    expect(readFileSync("src/components/AppHeader.tsx", "utf8")).toContain('<Link to="/"');
  });
});
