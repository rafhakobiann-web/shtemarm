import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  APPEARANCE_KEY, DEFAULT_APPEARANCE, THEME_INIT_SCRIPT,
  normalizeAppearance, readAppearance, resolvedTheme, setAppearance,
  resetAppearance, initAppearance,
} from "@/lib/theme";

describe("persisted user appearance", () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.classList.remove("dark");
    document.documentElement.removeAttribute("data-surface");
    document.documentElement.removeAttribute("data-glass");
    document.documentElement.removeAttribute("data-glass-blur");
  });
  afterEach(() => {
    resetAppearance();
  });
  it("uses bounded, safe values and migrates old dark-mode preference", () => {
    expect(normalizeAppearance(null)).toEqual(DEFAULT_APPEARANCE);
    expect(DEFAULT_APPEARANCE.surface).toBe("soft");
    expect(DEFAULT_APPEARANCE.blur).toBe(false);
    expect(normalizeAppearance(null, "dark").mode).toBe("dark");
    expect(normalizeAppearance({
      mode: "hacked", surface: "nonexistent", glass: "<script>", blur: "false",
    })).toEqual(DEFAULT_APPEARANCE);
  });
  it("applies and remembers the complete Liquid Glass configuration", () => {
    setAppearance({ mode: "dark", surface: "liquid", glass: "vivid", blur: false });
    expect(readAppearance()).toEqual({ mode: "dark", surface: "liquid", glass: "vivid", blur: false });
    const root = document.documentElement;
    expect(root.classList.contains("dark")).toBe(true);
    expect(root.dataset.surface).toBe("liquid");
    expect(root.dataset.glass).toBe("vivid");
    expect(root.dataset.glassBlur).toBe("off");
    expect(JSON.parse(localStorage.getItem(APPEARANCE_KEY) ?? "null").glass).toBe("vivid");
  });
  it("restores saved settings without forcing them after reset", () => {
    localStorage.setItem(APPEARANCE_KEY, JSON.stringify({ mode: "light", surface: "soft", glass: "subtle", blur: true }));
    const cleanup = initAppearance();
    expect(document.documentElement.dataset.surface).toBe("soft");
    cleanup();
    resetAppearance();
    expect(localStorage.getItem(APPEARANCE_KEY)).toBeNull();
    expect(document.documentElement.dataset.surface).toBe("soft");
  });
  it("renders OS mode without throwing if browser matchMedia is absent", () => {
    expect(["light", "dark"]).toContain(resolvedTheme({ ...DEFAULT_APPEARANCE }));
    expect(THEME_INIT_SCRIPT).toContain("shtemarm-appearance-v2");
    expect(THEME_INIT_SCRIPT).toContain("prefers-color-scheme: dark");
  });
});
