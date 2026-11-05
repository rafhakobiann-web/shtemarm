import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { readFileSync } from "node:fs";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ to, children, ...props }: { to: string; children: ReactNode }) => <a href={to} {...props}>{children}</a>,
}));

import { LandingHeroLab, LandingExperiences } from "@/components/LandingLabV3";

describe("Shtemarm V3 real interactive learning playground", () => {
  it("renders accessible subjects and scores real sample answers", () => {
    render(<LandingHeroLab lang="en" />);
    expect(screen.getByRole("tab", { name: /Mathematics/ })).toHaveAttribute("aria-selected", "true");
    fireEvent.click(screen.getByRole("button", { name: /x = 4/ }));
    expect(screen.getByText("Exactly right")).toBeInTheDocument();
    expect(screen.getByText(/14 - 6 = 8/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Next question/ }));
    expect(screen.getByText(/Calculate: 3/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /18/ }));
    fireEvent.click(screen.getByRole("button", { name: /Next question/ }));
    expect(screen.getByText("Mini challenge complete")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Try again/ }));
    expect(screen.getByText(/Solve: 2x/)).toBeInTheDocument();
  });

  it("resets questions on subject switch and retains original subject languages", () => {
    render(<LandingHeroLab lang="hy" />);
    fireEvent.click(screen.getByRole("tab", { name: /Անգլերեն/ }));
    expect(screen.getByText(/She ___ every day/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /reads/ }));
    expect(screen.getByText(/Present Simple/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("tab", { name: /Հայոց լեզու/ }));
    expect(screen.getByText(/Ո՞ր բառը գոյական է/)).toBeInTheDocument();
    expect(screen.getByText(/Հարց 1 ից 2/)).toBeInTheDocument();
  });

  it("supports real flashcard flips, answer choices, teaching prompts and reading", () => {
    render(<LandingExperiences lang="en" />);
    const flashcard = screen.getByRole("button", { name: /Tap to flip: curious/ });
    fireEvent.click(flashcard);
    expect(screen.getByText("wanting to know more")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Review again/ }));
    expect(screen.getByText(/Marked for review: 1/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Tap to flip: improve/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /What is Present Simple/ }));
    expect(screen.getByText(/habits and repeated actions/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "curious" }));
    expect(screen.getByText("wanting to know or learn more")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Change text size" }));
    expect(screen.getByRole("button", { name: "Change text size" })).toHaveAttribute("aria-pressed", "true");
  });

  it("uses touch swipe to advance flashcards while preserving native vertical scrolling", () => {
    render(<LandingExperiences lang="en" />);
    const flashcard = screen.getByRole("button", { name: /Tap to flip: curious/ });
    fireEvent.pointerDown(flashcard, { pointerId: 5, pointerType: "touch", clientX: 200, clientY: 100 });
    fireEvent.pointerMove(flashcard, { pointerId: 5, pointerType: "touch", clientX: 115, clientY: 106 });
    fireEvent.pointerUp(flashcard, { pointerId: 5, pointerType: "touch", clientX: 115, clientY: 106 });
    expect(screen.getByRole("button", { name: /Tap to flip: improve/ })).toBeInTheDocument();
  });

  it("updates the learning journey and routes the Android download correctly", () => {
    render(<LandingExperiences lang="en" />);
    fireEvent.click(screen.getByRole("tab", { name: /Understand/ }));
    expect(screen.getByText(/Explore the reason behind each answer/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Download Android app/ })).toHaveAttribute("href", "/download");
  });

  it("loads native semantic CSS with motion, contrast and fallback controls", () => {
    const css = readFileSync("src/landing-v3.css", "utf8");
    const route = readFileSync("src/routes/index.tsx", "utf8");
    const root = readFileSync("src/routes/__root.tsx", "utf8");
    expect(route).toContain('className="sht-landing sht-v3"');
    expect(route).toContain("<LandingHeroLab lang={lang} />");
    expect(route).toContain("<LandingExperiences lang={lang} />");
    expect(root).toContain('href: landingV3Css');
    expect(css).toContain("var(--primary)");
    expect(css).toContain("var(--foreground)");
    expect(css).toContain("var(--card)");
    expect(css).toContain("html.dark");
    expect(css).toContain("prefers-reduced-motion:reduce");
    expect(css).toContain("prefers-reduced-transparency:reduce");
    expect(css).toContain("touch-action:pan-y");
    expect(css).toContain("sl-motion-ready");
    expect(css).not.toContain("animation-iteration-count:infinite");
  });
});
