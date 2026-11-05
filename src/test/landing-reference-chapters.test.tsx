// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { readFileSync } from "node:fs";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ to, children, ...props }: { to: string; children: ReactNode; className?: string }) =>
    <a href={to} {...props}>{children}</a>,
}));

import { ReferenceChapters } from "@/components/ReferenceChapters";

describe("reference-inspired landing chapters", () => {
  afterEach(() => cleanup());

  it("places all seven reference chapters in the landing in the intended sequence", () => {
    const source = readFileSync("src/routes/index.tsx", "utf8");
    const chapters = ["books", "reading", "cards", "mistakes", "exam", "community", "access"];
    const indices = chapters.map(part => source.indexOf('<ReferenceChapters lang={lang} part="' + part + '" />'));
    expect(indices.every(index => index >= 0)).toBe(true);
    expect(indices).toEqual([...indices].sort((a, b) => a - b));
    expect(source).toContain('className="sht-landing sht-editorial sht-editorial-v3"');
  });

  it("renders the reading task, gives feedback, and allows correcting a mistake", () => {
    render(<ReferenceChapters lang="en" part="reading" />);
    expect(screen.getByText("Where does Ani go after school?")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /To the park/ }));
    expect(screen.getByRole("status").textContent).toContain("Read the first sentence");
    fireEvent.click(screen.getByRole("button", { name: /To the library/ }));
    expect(screen.getByRole("status").textContent).toContain("Correct");
    expect(screen.getByRole("button", { name: /To the library/ }).getAttribute("aria-pressed")).toBe("true");
  });

  it("makes vocabulary decisions interactive and keeps review separate from known words", () => {
    render(<ReferenceChapters lang="en" part="cards" />);
    expect(screen.getByText("Resilient")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /Review later/ }));
    expect(screen.getByText("Curious")).toBeTruthy();
    expect(screen.getByText(/Needs review:/).textContent).toContain("1");
    fireEvent.click(screen.getByRole("button", { name: /I know it/ }));
    expect(screen.getByText("Achieve")).toBeTruthy();
    expect(screen.getByText(/Needs review:/).textContent).toContain("1");
    fireEvent.click(screen.getByRole("button", { name: /I know it/ }));
    expect(screen.getByText("You finished all the sample cards.")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /Start again/ }));
    expect(screen.getByText("Resilient")).toBeTruthy();
    expect(screen.getByText(/Needs review:/).textContent).toContain("0");
  });

  it("switches question book subjects without losing the original labels", () => {
    const { container } = render(<ReferenceChapters lang="hy" part="books" />);
    fireEvent.click(screen.getByRole("button", { name: "Անգլերեն" }));
    const covers = container.querySelectorAll(".sht-ref-book");
    expect(covers).toHaveLength(3);
    expect(covers[0].textContent).toContain("Անգլերեն");
    expect(covers[0].textContent).toContain("I");
  });

  it("shows sample progress explicitly, not as genuine user scores", () => {
    render(<ReferenceChapters lang="en" part="community" />);
    expect(screen.getByText("Illustrative data, not real users")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "This month" }));
    expect(screen.getByRole("button", { name: "This month" }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByText("12")).toBeTruthy();
  });

  it("keeps download public, avoids imaginary Google Play links, and respects reduced motion", () => {
    const { container } = render(<ReferenceChapters lang="en" part="access" />);
    expect(container.querySelector('a[download="Shtemarm-Android.apk"]')?.getAttribute("href"))
      .toBe("/downloads/shtemarm-android.apk");
    expect(container.textContent).toContain("There is no Google Play listing yet");
    const css = readFileSync("src/components/reference-chapters.css", "utf8");
    expect(css).toContain("prefers-reduced-motion:reduce");
    expect(css).toContain(":focus-visible");
    expect(css).toContain("@media(max-width:400px)");
  });
});
