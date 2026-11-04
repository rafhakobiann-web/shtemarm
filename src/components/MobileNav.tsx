import { useEffect, useRef, useState, type MouseEvent, type PointerEvent } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { BookOpen, ClipboardCheck, Gamepad2, House, Wrench } from "lucide-react";
import { useTx } from "@/lib/lang";

/**
 * The five tabs have stable destinations; subjects/exams are real anchors
 * on the signed-in dashboard. All other tabs use actual application routes.
 */
export const MOBILE_TAB_TARGETS = [
  { id: "home", to: "/dashboard", hash: "" },
  { id: "books", to: "/dashboard", hash: "subjects" },
  { id: "exams", to: "/dashboard", hash: "exams" },
  { id: "games", to: "/mini-games", hash: "" },
  { id: "tools", to: "/study-tools", hash: "" },
] as const;

export function getMobileNavIndex(pathname: string, hash = ""): number {
  const path = pathname.replace(/\/+$/, "") || "/";
  const anchor = hash.replace(/^#/, "");
  if (path === "/" || path === "/dashboard") return anchor === "subjects" ? 1 : anchor === "exams" ? 2 : 0;
  if (path === "/mini-games") return 3;
  if (
    path === "/study-tools" || path === "/flashcards" ||
    path === "/assessment-builder" || path === "/calc" ||
    path === "/chat" || path === "/vocabulary" || path === "/mistakes" || path === "/english-grammar" || path === "/math-handbook" || path === "/math-review"
  ) return 4;
  if (
    path.startsWith("/book/") || path.startsWith("/study/") ||
    path.startsWith("/math/books") || path === "/history-book" ||
    path.startsWith("/physics/books") || path.startsWith("/physics/original")
  ) return 1;
  if (
    path.startsWith("/exam/") || path.startsWith("/test/") ||
    path.startsWith("/level-test/") || path.startsWith("/math") ||
    path.startsWith("/history") || path.startsWith("/biology") ||
    path.startsWith("/subject/") || path.startsWith("/physics/scan-practice")
  ) return 2;
  return 0;
}

export function MobileNav() {
  const tx = useTx();
  const { pathname, hash } = useLocation();
  const [homeVisible, setHomeVisible] = useState<0 | 1 | 2 | null>(null);
  const selected = (pathname === "/" || pathname === "/dashboard") && homeVisible !== null
    ? homeVisible : getMobileNavIndex(pathname, hash);
  const [compact, setCompact] = useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;
    const update = () => {
      const element = document.activeElement;
      const editing = element instanceof HTMLElement &&
        (element.matches("input,textarea") || element.isContentEditable);
      setKeyboardOpen(editing && window.innerHeight - viewport.height > 150);
    };
    viewport.addEventListener("resize", update);
    document.addEventListener("focusin", update);
    document.addEventListener("focusout", update);
    return () => {
      viewport.removeEventListener("resize", update);
      document.removeEventListener("focusin", update);
      document.removeEventListener("focusout", update);
    };
  }, []);
  const lastY = useRef(0);
  const dockRef = useRef<HTMLElement>(null);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const drag = useRef<{ id: number; x: number; y: number; moved: boolean } | null>(null);
  const [hoverTab, setHoverTab] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const previewTab = hoverTab ?? selected;
  const pointerTab = (x: number) => {
    const rect = dockRef.current?.querySelector(".mobile-liquid-track")?.getBoundingClientRect();
    return rect ? Math.max(0, Math.min(4, Math.floor((x - rect.left) / (rect.width / 5)))) : 0;
  };
  const dockDown = (e: PointerEvent<HTMLElement>) => {
    if (e.pointerType === "mouse") return;
    if (settleTimer.current) {
      clearTimeout(settleTimer.current);
      settleTimer.current = null;
    }
    setHoverTab(null);
    // Do not capture simple taps: native Link clicks must remain intact.
    // Only a proven horizontal drag takes pointer ownership.
    drag.current = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: false };
  };
  const dockMove = (e: PointerEvent<HTMLElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = Math.abs(e.clientX - d.x);
    const dy = Math.abs(e.clientY - d.y);
    if (!d.moved && dy > 9 && dy > dx) {
      // Yield normal vertical scrolling to the browser.
      drag.current = null;
      setHoverTab(null);
      setDragging(false);
      return;
    }
    if (!d.moved && dx > 12 && dx > dy * 1.2) {
      d.moved = true;
      setDragging(true);
      e.currentTarget.setPointerCapture?.(e.pointerId);
    }
    if (d.moved) setHoverTab(pointerTab(e.clientX));
  };
  const dockEnd = (e: PointerEvent<HTMLElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    drag.current = null;
    setDragging(false);
    if (!d.moved || e.type === "pointercancel") {
      setHoverTab(null);
      return;
    }
    const index = pointerTab(e.clientX);
    // Keep the pill under the released finger until TanStack updates the route.
    setHoverTab(index);
    const link = dockRef.current?.querySelectorAll<HTMLAnchorElement>("a")[index];
    link?.click();
    // Same-route taps and interrupted navigation must never leave a stuck pill.
    settleTimer.current = setTimeout(() => {
      setHoverTab(null);
      settleTimer.current = null;
    }, 480);
    if (typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate?.(8);
  };

  // Never detach or unmount the dock during scroll; its links remain tappable.
  // A single animation frame throttles direction sensing.
  useEffect(() => {
    lastY.current = window.scrollY || 0;
    let frame = 0;
    let directionTravel = 0;
    let lastSectionY = lastY.current;
    const detectHomeSection = () => {
      if (pathname !== "/" && pathname !== "/dashboard") return;
      const subjects = document.getElementById("subjects");
      const exams = document.getElementById("exams");
      if (!subjects || !exams) return;
      const marker = Math.max(130, window.innerHeight * .28);
      const visible: 0 | 1 | 2 =
        exams.getBoundingClientRect().top <= marker ? 2 :
        subjects.getBoundingClientRect().top <= marker ? 1 : 0;
      setHomeVisible(previous => previous === visible ? previous : visible);
    };
    detectHomeSection();
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        const nextY = Math.max(0, window.scrollY || 0);
        const delta = nextY - lastY.current;
        // Accumulate movement in one direction. Tiny touch jitter must not
        // reanimate the floating dock on every scroll frame.
        directionTravel = delta * directionTravel < 0
          ? delta
          : Math.max(-180, Math.min(180, directionTravel + delta));
        if (nextY < 90) {
          directionTravel = 0;
          setCompact(false);
        } else if (directionTravel > 48) {
          setCompact(true);
          directionTravel = 0;
        } else if (directionTravel < -48) {
          setCompact(false);
          directionTravel = 0;
        }
        lastY.current = nextY;
        // Reading multiple bounding rectangles on every frame can force
        // layout on long books. Sample section position every ~80px instead.
        if ((pathname === "/" || pathname === "/dashboard") && Math.abs(nextY - lastSectionY) >= 80) {
          lastSectionY = nextY;
          detectHomeSection();
        }
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [pathname]);

  // Opening a different tab restores full labels for orientation.
  useEffect(() => {
    if (settleTimer.current) {
      clearTimeout(settleTimer.current);
      settleTimer.current = null;
    }
    setCompact(false);
    setHomeVisible(null);
    setHoverTab(null);
    setDragging(false);
  }, [pathname, hash]);
  useEffect(() => () => {
    if (settleTimer.current) clearTimeout(settleTimer.current);
  }, []);

  // Home-page hash targets always scroll to the actual catalogue/exams section.
  useEffect(() => {
    const anchor = hash?.replace(/^#/, "");
    if ((pathname !== "/" && pathname !== "/dashboard") || (anchor !== "subjects" && anchor !== "exams")) return;
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(anchor)?.scrollIntoView({
        behavior: window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches
          ? "auto" : "smooth",
        block: "start",
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [pathname, hash]);

  const onTabClick = (event: MouseEvent<HTMLAnchorElement>, index: number) => {
    if (index === 0 && (pathname === "/" || pathname === "/dashboard")) {
      // Home should take students to the top even from #subjects or #exams.
      // Clear the anchor using the actual router link, then scroll.
      window.scrollTo({
        top: 0,
        behavior: window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches
          ? "auto" : "smooth",
      });
    }
    if ((pathname === "/" || pathname === "/dashboard") && (index === 1 || index === 2)) {
      const anchor = index === 1 ? "subjects" : "exams";
      // Also works when tapping the currently selected tab again.
      if (hash.replace(/^#/, "") === anchor) {
        document.getElementById(anchor)?.scrollIntoView({
          behavior: window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches
            ? "auto" : "smooth",
          block: "start",
        });
      }
    }
    // Let TanStack Router handle navigation and update URL/history.
    if (event.defaultPrevented) return;
    setCompact(false);
  };

  const tabs = [
    { ...MOBILE_TAB_TARGETS[0], label: tx("Գլխավոր"), icon: House },
    { ...MOBILE_TAB_TARGETS[1], label: tx("Գրքեր"), icon: BookOpen },
    { ...MOBILE_TAB_TARGETS[2], label: tx("Թեստեր"), icon: ClipboardCheck },
    { ...MOBILE_TAB_TARGETS[3], label: tx("Խաղեր"), icon: Gamepad2 },
    { ...MOBILE_TAB_TARGETS[4], label: tx("Գործիքներ"), icon: Wrench },
  ] as const;

  return (
    <nav
      ref={dockRef}
      hidden={keyboardOpen}
      onPointerDown={dockDown}
      onPointerMove={dockMove}
      onPointerUp={dockEnd}
      onPointerCancel={dockEnd}
      aria-label={tx("Արագ նավարկում")}
      data-compact={compact ? "true" : "false"}
      data-dragging={dragging ? "true" : "false"}
      className="site-mobile-nav mobile-liquid-dock fixed inset-x-3 z-40 mx-auto max-w-[29rem] rounded-[1.7rem] p-[6px] md:hidden"
    >
      <div className="mobile-liquid-track relative grid grid-cols-5 items-stretch">
        <span
          aria-hidden="true"
          className="mobile-liquid-indicator pointer-events-none absolute inset-y-0 left-0 w-1/5 rounded-[1.3rem]"
          style={{ transform: "translate3d(" + previewTab * 100 + "%, 0, 0)" }}
        />
        {tabs.map(({ id, to, hash: tabHash, label, icon: Icon }, index) => (
          <Link
            key={id}
            to={to}
            {...(tabHash ? { hash: tabHash } : {})}
            onClick={(event) => onTabClick(event, index)}
            aria-current={selected === index ? "page" : undefined}
            aria-label={label}
            title={label}
            className={
              "mobile-liquid-tab relative z-10 flex min-h-[3.6rem] min-w-0 flex-col items-center justify-center gap-1 rounded-[1.3rem] px-0.5 py-2 text-center text-[10px] font-extrabold leading-tight outline-offset-2 focus-visible:outline-2 focus-visible:outline-primary " +
              (previewTab === index ? "is-selected" : "")
            }
          >
            <Icon aria-hidden="true" className="mobile-liquid-icon size-[1.3rem] shrink-0" strokeWidth={selected === index ? 2.3 : 1.85} />
            <span className="mobile-liquid-label block truncate">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

