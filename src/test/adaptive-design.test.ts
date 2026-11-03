// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { DEFAULT_APPEARANCE, normalizeAppearance } from "@/lib/theme";
import { ACCENT_SWATCHES, applyAccent, chooseAccent, normalizeAccent, readSavedAccent } from "@/lib/accent";

const read = (path: string) => readFileSync(path, "utf8");
const css = read("src/adaptive-design-2026.css");

describe("approved adaptive Liquid Glass design", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute("data-accent");
    document.documentElement.style.removeProperty("--primary");
  });

  it("defaults to adaptive, preserves explicit user glass settings and rejects unknown modes", () => {
    expect(DEFAULT_APPEARANCE.surface).toBe("liquid");
    expect(DEFAULT_APPEARANCE.glass).toBe("adaptive");
    expect(normalizeAppearance({ glass: "subtle" }).glass).toBe("subtle");
    expect(normalizeAppearance({ glass: "vivid" }).glass).toBe("vivid");
    expect(normalizeAppearance({ glass: "adaptive" }).glass).toBe("adaptive");
    expect(normalizeAppearance({ glass: "unknown" }).glass).toBe("adaptive");
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
    expect(dashboard).toContain("sht-dashboard-bento");
    expect(dashboard).toContain("sht-dashboard-shortcuts");
    expect(exam).toContain("sht-exam-hero");
    expect(exam).toContain("sht-exam-metric");
    expect(root).toContain("href: adaptiveDesignCss");
    expect(css).toContain(".sht-exam-hero");
    expect(css).toContain(".sht-dashboard-bento");
    expect(css).toContain(".sht-palette-picker");
  });

  it("keeps adaptive rendering and spring feedback accessible and low-cost", () => {
    expect(css).toContain('data-glass-quality="rich"');
    expect(css).toContain('data-glass-quality="lite"');
    expect(css).toContain("prefers-reduced-motion: reduce");
    expect(css).toContain("prefers-reduced-transparency: reduce");
    expect(css).toContain("touch-action: pan-y");
    expect(css).toContain("transform 420ms");
    expect(css).not.toContain("feDisplacementMap");
    const theme = read("src/lib/theme.ts");
    expect(theme).toContain("deviceMemory");
    expect(theme).toContain("hardwareConcurrency");
    expect(theme).toContain("saveData");
  });
});
