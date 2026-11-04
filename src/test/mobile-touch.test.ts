import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { flashcardSwipeOutcome } from "@/lib/flashcard-swipe";

const code = (path: string) => readFileSync(path, "utf8");

describe("Mobile flashcards: deliberate, safe touch gestures", () => {
  it("keeps the approved left = I know, right = review later mapping", () => {
    expect(flashcardSwipeOutcome(-120, 4, true)).toBe("known");
    expect(flashcardSwipeOutcome(120, 4, true)).toBe("review");
    expect(flashcardSwipeOutcome(-84, 0, true)).toBe(null);
    expect(flashcardSwipeOutcome(84, 0, true)).toBe(null);
  });

  it("rejects accidental taps, scrolling, diagonal and invalid gestures", () => {
    expect(flashcardSwipeOutcome(130, 0, false)).toBe(null);
    expect(flashcardSwipeOutcome(90, 90, true)).toBe(null);
    expect(flashcardSwipeOutcome(-110, 120, true)).toBe(null);
    expect(flashcardSwipeOutcome(Number.NaN, 0, true)).toBe(null);
    expect(flashcardSwipeOutcome(100, Number.POSITIVE_INFINITY, true)).toBe(null);
  });

  it("never flips the flashcard from the synthesized click after a swipe", () => {
    const route = code("src/routes/flashcards.tsx");
    expect(route).toContain("suppressFlipClick.current=true");
    expect(route).toContain("if(!suppressFlipClick.current&&!animating");
    expect(route).toContain("flashcardSwipeOutcome(dx,dy,s.dragged)");
    expect(route).toContain("s.dragged=true");
    expect(route).toContain("setPointerCapture?.(e.pointerId)");
    expect(route).toContain("Math.abs(dy)>12");
    expect(route).toContain("onPointerCancel");
  });

  it("keeps a non-animated fallback and cleans up deferred swipe work", () => {
    const route = code("src/routes/flashcards.tsx");
    expect(route).toContain("prefers-reduced-motion: reduce");
    expect(route).toContain('classList.contains("user-reduced-motion")');
    expect(route).toContain("if(reduceMotion){answer(success);setDragX(0);return;}");
    expect(route).toContain("if(animationTimer.current)clearTimeout(animationTimer.current)");
    expect(route).toContain("if(clickResetTimer.current)clearTimeout(clickResetTimer.current)");
    expect(route).toContain("setOnlyMissed(e.target.checked);restart()");
    expect(route).toContain("setSelected(old=>e.target.checked?[...old,section]:old.filter(x=>x!==section));restart();");
  });

  it("provides visible swipe direction and phone-sized actions", () => {
    const route = code("src/routes/flashcards.tsx");
    const css = code("src/interaction-motion-2026.css");
    expect(route).toContain("sht-flashcard-session");
    expect(route).toContain('data-swipe-intent={dragX < -32 ? "known" : dragX > 32 ? "review" : "none"}');
    expect(route).toContain("sht-flashcard-choice-known");
    expect(route).toContain("sht-flashcard-choice-review");
    expect(route).toContain("sht-flashcard-actions grid grid-cols-2");
    expect(css).toContain(".sht-flashcard-card");
    expect(css).toContain("touch-action: pan-y");
    expect(css).toContain("prefers-reduced-motion: reduce");
  });
});

describe("Mobile dock: precise drag target and automatic recovery", () => {
  it("uses inner track geometry instead of padded outer dock geometry", () => {
    const dock = code("src/components/MobileNav.tsx");
    expect(dock).toContain('querySelector(".mobile-liquid-track")?.getBoundingClientRect()');
  });

  it("clears temporary drag selection when route does not change", () => {
    const dock = code("src/components/MobileNav.tsx");
    expect(dock).toContain("settleTimer.current = setTimeout");
    expect(dock).toContain("setHoverTab(null)");
    expect(dock).toContain("clearTimeout(settleTimer.current)");
    expect(dock).toContain("setPointerCapture?.(e.pointerId)");
    expect(dock).toContain("dy > 9 && dy > dx");
    expect(dock).toContain('data-dragging={dragging ? "true" : "false"}');
  });
});
