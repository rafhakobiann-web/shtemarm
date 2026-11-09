import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { StudyScratchpad } from "@/components/StudyScratchpad";
import {
  readScratchpad, scratchpadKey, sanitizeScratchpad,
  SCRATCHPAD_MAX_LENGTH, writeScratchpad,
} from "@/lib/study-scratchpad";

vi.mock("@/lib/lang", () => ({ useLang: () => "en" }));

beforeEach(() => window.localStorage.clear());
afterEach(() => { cleanup(); window.localStorage.clear(); });

describe("per-section study scratchpad", () => {
  it("uses separate keys for each valid book and section", () => {
    expect(scratchpadKey("1", "2")).not.toBe(scratchpadKey("1", "3"));
    expect(scratchpadKey("1", "2")).not.toBe(scratchpadKey("2", "2"));
    expect(() => scratchpadKey("../x", "1")).toThrow();
    expect(() => scratchpadKey("1", "0")).toThrow();
  });

  it("limits note length, rejects invalid stored types, and can clear without touching progress", () => {
    const key = scratchpadKey("1", "2");
    expect(sanitizeScratchpad(99)).toBe("");
    expect(sanitizeScratchpad("a".repeat(SCRATCHPAD_MAX_LENGTH + 100))).toHaveLength(SCRATCHPAD_MAX_LENGTH);
    window.localStorage.setItem("shtemaran-progress-v1", "keep-progress");
    expect(writeScratchpad(key, "First note")).toBe(true);
    expect(readScratchpad(key)).toBe("First note");
    expect(window.localStorage.getItem("shtemaran-progress-v1")).toBe("keep-progress");
    expect(writeScratchpad(key, "")).toBe(true);
    expect(readScratchpad(key)).toBe("");
    expect(window.localStorage.getItem("shtemaran-progress-v1")).toBe("keep-progress");
  });

  it("autosaves and restores notes for one section only", () => {
    const { unmount } = render(<StudyScratchpad bookId="1" sectionId="2" />);
    expect(screen.getByText("My scratchpad")).toBeInTheDocument();
    const input = screen.getByLabelText("Notes for this section");
    fireEvent.change(input, { target: { value: "Review the distributive rule" } });
    expect(readScratchpad(scratchpadKey("1", "2"))).toBe("Review the distributive rule");
    unmount();
    render(<StudyScratchpad bookId="1" sectionId="2" />);
    expect(screen.getByLabelText("Notes for this section")).toHaveValue("Review the distributive rule");
    cleanup();
    render(<StudyScratchpad bookId="1" sectionId="3" />);
    expect(screen.getByLabelText("Notes for this section")).toHaveValue("");
  });

  it("clears notes and handles another tab updating the same section", () => {
    render(<StudyScratchpad bookId="1" sectionId="2" />);
    const input = screen.getByLabelText("Notes for this section");
    fireEvent.change(input, { target: { value: "My reminder" } });
    fireEvent.click(screen.getByRole("button", { name: "Clear notes", hidden: true }));
    expect(readScratchpad(scratchpadKey("1", "2"))).toBe("");
    const key = scratchpadKey("1", "2");
    window.localStorage.setItem(key, "Saved from another tab");
    fireEvent(window, new StorageEvent("storage", { key }));
    expect(input).toHaveValue("Saved from another tab");
  });

  it("does not throw if storage is unavailable", () => {
    const broken = {
      getItem: () => { throw new Error("blocked"); },
      setItem: () => { throw new Error("blocked"); },
      removeItem: () => { throw new Error("blocked"); },
    };
    const key = scratchpadKey("1", "2");
    expect(readScratchpad(key, broken)).toBe("");
    expect(writeScratchpad(key, "text", broken)).toBe(false);
    expect(writeScratchpad(key, "text", null)).toBe(false);
  });
});
