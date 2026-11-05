// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ to, children, ...rest }: { to: string; children: ReactNode; className?: string }) =>
    <a href={to} {...rest}>{children}</a>,
}));

import { LandingShowcase } from "@/components/LandingShowcase";

describe("Interactive landing sample", () => {
  afterEach(() => cleanup());
  it("lets guests answer multiple questions, navigate between subjects and reset", () => {
    const { container } = render(<LandingShowcase lang="en" />);
    expect(screen.getByText("If 3x + 5 = 14, what is x?")).toBeTruthy();
    const firstOptions = container.querySelectorAll(".sht-story-answers button");
    expect(firstOptions.length).toBe(3);
    fireEvent.click(firstOptions[1]);
    expect(screen.getByRole("status").textContent).toContain("14 − 5 = 9");
    expect(screen.getByText(/Correct: 1 \/ 6/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /Next/ }));
    expect(screen.getByText("If 2(x + 3) = 18, what is x?")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name:"English" }));
    expect(screen.getByText("Which sentence uses the Present Simple tense?")).toBeTruthy();
    fireEvent.click(container.querySelectorAll(".sht-story-answers button")[0]);
    expect(screen.getByRole("status").textContent).toContain("Look for a repeated");
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(screen.getByText("If 3x + 5 = 14, what is x?")).toBeTruthy();
    expect(screen.getByText(/Correct: 0 \/ 6/)).toBeTruthy();
  });

  it("supports all three teacher modes with local, non-billable examples",()=>{
    render(<LandingShowcase lang="en" />);
    fireEvent.click(screen.getByRole("button",{name:"Step by step"}));
    expect(screen.getByText(/Subtract 5 from both sides/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button",{name:"Try it"}));
    expect(screen.getByText(/Your turn: if 2x/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button",{name:"Hint"}));
    expect(screen.getByText(/What would remove the \+5/)).toBeTruthy();
  });

  it("lets visitors swipe and mark words to review within the demonstration only",()=>{
    const { container }=render(<LandingShowcase lang="en" />);
    expect(screen.getByText("achieve")).toBeTruthy();
    fireEvent.click(screen.getByRole("button",{name:"Review again"}));
    expect(screen.getByText("consider")).toBeTruthy();
    expect(screen.getByText(/Words to review:/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button",{name:"Review saved words"}));
    expect(screen.getByText("achieve")).toBeTruthy();
    expect(container.querySelector(".sht-reference-flashcard")).toBeTruthy();
    expect(screen.getByText("Only during this demo session")).toBeTruthy();
  });

  it("keeps sample questions localized and APK downloads on the website", () => {
    const { container } = render(<LandingShowcase lang="hy" />);
    expect(screen.getByText("Եթե 3x + 5 = 14, ապա որքա՞ն է x-ը։")).toBeTruthy();
    const apk = container.querySelector('a[download="Shtemarm-Android.apk"]');
    expect(apk?.getAttribute("href")).toBe("/downloads/shtemarm-android.apk");
  });
});
