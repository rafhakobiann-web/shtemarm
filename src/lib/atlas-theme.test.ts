import { describe, expect, it } from "vitest";
import { DEFAULT_APPEARANCE, normalizeAppearance } from "./theme";

describe("Atlas surface selection", () => {
  it("preserves the current default for new users", () => {
    expect(DEFAULT_APPEARANCE.surface).toBe("soft");
    expect(normalizeAppearance(null).surface).toBe("soft");
  });
  it("accepts an explicitly selected Atlas surface", () => {
    expect(normalizeAppearance({ surface: "atlas", mode: "dark" })).toMatchObject({
      surface: "atlas", mode: "dark",
    });
  });
  it("rejects unknown surface names", () => {
    expect(normalizeAppearance({ surface: "made-up" }).surface).toBe("soft");
  });
  it("keeps existing Classic and Academy choices", () => {
    expect(normalizeAppearance({ surface: "classic" }).surface).toBe("classic");
    expect(normalizeAppearance({ surface: "soft" }).surface).toBe("soft");
  });
});
