import { useEffect } from "react";

/**
 * One delegated, passive pointer listener for the entire site. Avoids a React
 * render on every touchmove and does not intercept scrolling or navigation.
 */
export function TouchGlassEffects() {
  useEffect(() => {
    const root = document.documentElement;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const targets = ".academy-bento, .academy-quick-action, .mobile-liquid-dock, .site-header";
    let active: HTMLElement | null = null;
    let frame = 0;
    let x = 50;
    let y = 50;
    let scrolling = false;
    const enabled = () => !reduced.matches && !root.classList.contains("user-reduced-motion") &&
      !root.classList.contains("user-high-contrast") && root.dataset.surface === "liquid";

    const paint = () => {
      frame = 0;
      if (!active) return;
      active.style.setProperty("--touch-x", x + "%");
      active.style.setProperty("--touch-y", y + "%");
    };
    const clear = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      if (active) {
        active.removeAttribute("data-touch-glow");
        active = null;
      }
    };
    const move = (event: PointerEvent) => {
      if (!enabled() || scrolling) { clear(); return; }
      if (event.pointerType === "mouse" && event.type === "pointermove" && event.buttons === 0) {
        // Hover can show a highlight, but never animate the whole page.
      }
      const target = (event.target as Element | null)?.closest?.(targets) as HTMLElement | null;
      if (!target) { clear(); return; }
      if (target !== active) {
        clear();
        active = target;
        active.dataset.touchGlow = "true";
      }
      const rect = target.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      x = Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100));
      y = Math.max(0, Math.min(100, ((event.clientY - rect.top) / rect.height) * 100));
      if (!frame) frame = requestAnimationFrame(paint);
    };
    // Touch glow should not compete with compositor-driven scrolling.
    // Resume only on the next intentional pointerdown after a scroll.
    const onScroll = () => {
      scrolling = true;
      clear();
    };
    const onDown = (event: PointerEvent) => {
      scrolling = false;
      move(event);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("pointerdown", onDown, { passive: true });
    // Only mouse hover needs continuous tracking; touchmove is reserved for scrolling.
    document.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("pointerup", clear, { passive: true });
    document.addEventListener("pointercancel", clear, { passive: true });
    window.addEventListener("blur", clear);
    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerup", clear);
      document.removeEventListener("pointercancel", clear);
      window.removeEventListener("blur", clear);
      clear();
    };
  }, []);
  return null;
}
