import { useEffect } from "react";

/**
 * Lightweight delegated interaction feedback for Shtemarm.
 * Mouse hover follows the pointer at most once per animation frame; touch
 * only adds a press state, never tracks touchmove or blocks native scrolling.
 * No React rerenders, layout animations, observers or extra dependencies.
 */
export function TouchGlassEffects() {
  useEffect(() => {
    const root = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const glowTargets = ".academy-bento, .academy-quick-action, .mobile-liquid-dock, .site-header";
    const pressTargets = [
      ".sht-demo-option", ".sht-subject-card", ".sht-button-primary",
      ".sht-button-secondary", ".sht-nav-login", ".sht-palette-picker > summary",
      ".sht-palette-colors button", ".academy-quick-action", ".academy-download-cta",
      ".mobile-liquid-tab", ".site-header button", ".answer-option:not(:disabled)"
    ].join(", ");
    let glowing: HTMLElement | null = null;
    let pressed: HTMLElement | null = null;
    let pressedPointer: number | null = null;
    let frame = 0;
    let x = 50;
    let y = 50;

    const enabled = () => !reduced.matches &&
      !root.classList.contains("user-reduced-motion") &&
      !root.classList.contains("user-high-contrast") &&
      root.dataset.surface === "liquid";
    const targetOf = (event: PointerEvent, selector: string) => {
      const node = event.target;
      return node instanceof Element ? node.closest<HTMLElement>(selector) : null;
    };
    const clearGlow = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      glowing?.removeAttribute("data-touch-glow");
      glowing = null;
    };
    const clearPress = () => {
      pressed?.removeAttribute("data-motion-pressed");
      pressed = null;
      pressedPointer = null;
    };
    const paint = () => {
      frame = 0;
      if (!glowing) return;
      glowing.style.setProperty("--touch-x", x + "%");
      glowing.style.setProperty("--touch-y", y + "%");
    };
    const onMove = (event: PointerEvent) => {
      // Finger movement should belong exclusively to scrolling and gestures.
      if (event.pointerType !== "mouse" || !enabled()) {
        clearGlow();
        return;
      }
      const target = targetOf(event, glowTargets);
      if (target !== glowing) {
        clearGlow();
        glowing = target;
        if (glowing) glowing.dataset.touchGlow = "true";
      }
      if (!glowing) return;
      const rect = glowing.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      x = Math.max(0, Math.min(100, 100 * (event.clientX - rect.left) / rect.width));
      y = Math.max(0, Math.min(100, 100 * (event.clientY - rect.top) / rect.height));
      if (!frame) frame = requestAnimationFrame(paint);
    };
    const onDown = (event: PointerEvent) => {
      clearPress();
      if (!enabled() || event.button !== 0) return;
      pressed = targetOf(event, pressTargets);
      if (pressed) {
        pressedPointer = event.pointerId;
        pressed.dataset.motionPressed = "true";
      }
    };
    const onUp = (event: PointerEvent) => {
      if (event.pointerId === pressedPointer) clearPress();
    };
    const onScroll = () => {
      clearPress();
      clearGlow();
    };
    const onBlur = () => {
      clearPress();
      clearGlow();
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerdown", onDown, { passive: true });
    document.addEventListener("pointerup", onUp, { passive: true });
    document.addEventListener("pointercancel", onUp, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("blur", onBlur);
    return () => {
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointercancel", onUp);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("blur", onBlur);
      onBlur();
    };
  }, []);
  return null;
}
