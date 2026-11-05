import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { readFileSync } from "node:fs";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ to, children, ...props }: { to: string; children: ReactNode }) => (
    <a href={to} {...props}>{children}</a>
  ),
}));

import { LandingHeroPhone, LandingShowcase } from "@/components/LandingShowcase";

describe("video-inspired public landing", () => {
  it("shows a real tappable phone preview, not a static phone image", () => {
    render(<LandingHeroPhone lang="en" />);
    const english = screen.getByRole("button", { name: "English" });
    const math = screen.getByRole("button", { name: "Mathematics" });
    expect(english.getAttribute("aria-pressed")).toBe("true");
    fireEvent.click(math);
    expect(math.getAttribute("aria-pressed")).toBe("true");
    expect(screen.getAllByRole("link", { name: /Mathematics.*Open/ })).toHaveLength(3);
  });

  it("lets anonymous visitors solve a local sample without touching real results", () => {
    render(<LandingShowcase lang="en" />);
    fireEvent.click(screen.getByRole("button", { name: /x = 4/ }));
    expect(screen.getByText("Correct! 2x = 8, so x = 4.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Try again/ }));
    expect(screen.queryByText("Correct! 2x = 8, so x = 4.")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /x = 3/ }));
    expect(screen.getByText(/Subtract 6 from both sides/)).toBeInTheDocument();
  });

  it("previews reading controls and explains what is only demonstrative", () => {
    render(<LandingShowcase lang="en" />);
    fireEvent.click(screen.getByRole("button", { name: "curious" }));
    expect(screen.getByText(/eager to learn or know more/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Increase text size" }));
    expect(screen.getByRole("button", { name: "Increase text size" })).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText(/actual AI teacher is available after sign-in/)).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /Download the app/ }).some(link => link.getAttribute("href") === "/download")).toBe(true);
  });

  it("keeps CSS scoped, contrast-visible dark mode and reduced-motion fallback", () => {
    const css = readFileSync("src/landing-reference.css", "utf8");
    const route = readFileSync("src/routes/index.tsx", "utf8");
    const root = readFileSync("src/routes/__root.tsx", "utf8");
    expect(route).toContain('className="sht-landing ref-landing"');
    expect(route).toContain("<LandingShowcase lang={lang} />");
    expect(root).toContain('href: landingReferenceCss');
    expect(css).toContain("html.dark .sht-landing.ref-landing");
    expect(css).toContain("prefers-reduced-motion:reduce");
    expect(css).toContain(".ref-island");
  });
});
