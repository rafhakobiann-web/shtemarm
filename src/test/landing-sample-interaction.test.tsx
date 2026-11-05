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
    expect(screen.getByText(/Correct: 1 \/ 3/)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /Next/ }));
    expect(screen.getByText("Which sentence uses the Present Simple tense?")).toBeTruthy();
    fireEvent.click(container.querySelectorAll(".sht-story-answers button")[0]);
    expect(screen.getByRole("status").textContent).toContain("Look for a repeated");
    fireEvent.click(screen.getByRole("button", { name: "Try again" }));
    expect(screen.getByText("If 3x + 5 = 14, what is x?")).toBeTruthy();
    expect(screen.getByText(/Correct: 0 \/ 3/)).toBeTruthy();
  });

  it("keeps sample questions localized and APK downloads on the website", () => {
    const { container } = render(<LandingShowcase lang="hy" />);
    expect(screen.getByText("Եթե 3x + 5 = 14, ապա որքա՞ն է x-ը։")).toBeTruthy();
    const apk = container.querySelector('a[download="Shtemarm-Android.apk"]');
    expect(apk?.getAttribute("href")).toBe("/downloads/shtemarm-android.apk");
  });
});
