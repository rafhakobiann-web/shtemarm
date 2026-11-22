// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { DEFAULT_APPEARANCE, normalizeAppearance } from "@/lib/theme";
import { ACCENT_SWATCHES, applyAccent, chooseAccent, normalizeAccent, readSavedAccent } from "@/lib/accent";

const read = (path: string) => readFileSync(path, "utf8");
const css = read("src/adaptive-design-2026.css");

describe("matte responsive study design", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-accent");
    document.documentElement.style.removeProperty("--primary");
  });

  it("defaults to a matte surface and maps legacy glass values to the safe default", () => {
    expect(DEFAULT_APPEARANCE.surface).toBe("soft");
    expect(normalizeAppearance({ surface: "liquid" }).surface).toBe("soft");
    expect(normalizeAppearance({ surface: "soft" }).surface).toBe("soft");
  });

  it("provides a strict 6-color palette shared with the signed-in settings", () => {
    expect(ACCENT_SWATCHES).toHaveLength(6);
    expect(normalizeAccent("unsafe-color()")).toBe("teal");
    chooseAccent("violet");
    expect(readSavedAccent()).toBe("violet");
    expect(document.documentElement.dataset.accent).toBe("violet");
    expect(document.documentElement.style.getPropertyValue("--primary")).toBe("#7139ce");
    applyAccent("teal");
    expect(document.documentElement.style.getPropertyValue("--primary")).toBe("#0b766b");
  });

  it("retains the HTML and TanStack routing while styling public, dashboard and exam surfaces", () => {
    const landing = read("src/routes/index.tsx");
    const dashboard = read("src/routes/dashboard.tsx");
    const exam = read("src/components/ExamDesign.tsx");
    const root = read("src/routes/__root.tsx");
    expect(landing).toContain('createFileRoute("/")');
    expect(landing).toContain("sht-palette-picker");
    expect(dashboard).toContain('createFileRoute("/dashboard")');
    expect(dashboard).toContain("sht-home-subject-grid");
    expect(dashboard).toContain("sht-quiet-shortcuts");
    expect(exam).toContain("sht-exam-hero");
    expect(exam).toContain("sht-exam-metric");
    expect(root).toContain("href: adaptiveDesignCss");
    expect(css).toContain(".sht-exam-hero");
    expect(css).toContain(".sht-dashboard-bento");
    expect(css).toContain(".sht-palette-picker");
  });

  it("uses the quiet matte navigation and honors reduced motion", () => {
    const quiet = read("src/quiet-learning-2026.css");
    const root = read("src/routes/__root.tsx");
    expect(quiet).toContain(".site-mobile-nav.sht-quiet-mobile-nav");
    expect(quiet).toContain("backdrop-filter: none");
    expect(quiet).toContain("prefers-reduced-motion: reduce");
    expect(root).not.toContain("liquid-glass-2026.css");
    expect(root).not.toContain("TouchGlassEffects");
  });
});

