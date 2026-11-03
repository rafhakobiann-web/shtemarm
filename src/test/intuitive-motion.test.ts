import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { previewIndex, previewSwipeDirection } from "@/lib/preview-interaction";

const source = (path: string) => readFileSync(path, "utf8");

describe("Shtemarm intuitive interactive motion", () => {
  it("accepts deliberate horizontal swipes, rejects taps and vertical scrolling", () => {
    expect(previewSwipeDirection(-90, 12)).toBe(1);
    expect(previewSwipeDirection(90, -6)).toBe(-1);
    expect(previewSwipeDirection(-30, 2)).toBe(0);
    expect(previewSwipeDirection(-85, 90)).toBe(0);
    expect(previewSwipeDirection(80, 64)).toBe(0);
    expect(previewSwipeDirection(Number.NaN, 0)).toBe(0);
    expect(previewSwipeDirection(0, Number.POSITIVE_INFINITY)).toBe(0);
  });

  it("cycles preview activities safely in either direction", () => {
    expect(previewIndex(2, 1, 3)).toBe(0);
    expect(previewIndex(0, -1, 3)).toBe(2);
    expect(previewIndex(1, 1, 3)).toBe(2);
    expect(previewIndex(1, 0, 3)).toBe(1);
    expect(previewIndex(0, 1, 0)).toBe(0);
  });

  it("provides tap controls, swipe navigation and stable accessible updates", () => {
    const landing = source("src/routes/index.tsx");
    expect(landing).toContain("onPointerDown={startPreviewSwipe}");
    expect(landing).toContain("onPointerUp={finishPreviewSwipe}");
    expect(landing).toContain('className="sht-preview-message" aria-live="polite"');
    expect(landing).toContain("sht-preview-controls");
    expect(landing).toContain("changeActivity(-1)");
    expect(landing).toContain("changeActivity(1)");
    expect(landing).toContain("previewSwipeDirection(dx, dy)");
  });

  it("gives the mobile indicator immediate drag feedback and spring release", () => {
    const dock = source("src/components/MobileNav.tsx");
    const motion = source("src/interaction-motion-2026.css");
    expect(dock).toContain('data-dragging={dragging ? "true" : "false"}');
    expect(dock).toContain("setDragging(true)");
    expect(dock).toContain("setDragging(false)");
    expect(motion).toContain('data-dragging="true"');
    expect(motion).toContain("transition: none !important");
    expect(motion).toContain('data-dragging="false"');
  });

  it("prioritizes scrolling, accessibility and one-off feedback over visual effects", () => {
    const feedback = source("src/components/TouchGlassEffects.tsx");
    const motion = source("src/interaction-motion-2026.css");
    const root = source("src/routes/__root.tsx");
    expect(feedback).toContain('if (event.pointerType !== "mouse" || !enabled())');
    expect(feedback).toContain("data-motion-pressed");
    expect(feedback).toContain('window.addEventListener("scroll", onScroll, { passive: true })');
    expect(motion).toContain("touch-action: pan-y");
    expect(motion).toContain("prefers-reduced-motion: reduce");
    expect(motion).toContain("html.user-reduced-motion");
    expect(motion).not.toContain("animation-iteration-count: infinite");
    expect(motion).not.toContain("backdrop-filter: blur(");
    expect(root).toContain("href: interactionMotionCss");
  });
});
