import { useEffect, useRef, useState, type MouseEvent } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { BookOpen, ClipboardCheck, Gamepad2, House, Wrench } from "lucide-react";
import { useTx } from "@/lib/lang";

/**
 * The five tabs have stable destinations; subjects/exams are real anchors
 * on the home screen. All other tabs use actual application routes.
 */
export const MOBILE_TAB_TARGETS = [
  { id: "home", to: "/", hash: "" },
  { id: "books", to: "/", hash: "subjects" },
  { id: "exams", to: "/", hash: "exams" },
  { id: "games", to: "/mini-games", hash: "" },
  { id: "tools", to: "/study-tools", hash: "" },
] as const;

export function getMobileNavIndex(pathname: string, hash = ""): number {
  const path = pathname.replace(/\/+$/, "") || "/";
  const anchor = hash.replace(/^#/, "");
  if (path === "/") return anchor === "subjects" ? 1 : anchor === "exams" ? 2 : 0;
  if (path === "/mini-games") return 3;
  if (
    path === "/study-tools" || path === "/flashcards" ||
    path === "/assessment-builder" || path === "/calc" ||
    path === "/chat" || path === "/vocabulary"
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
  const selected = pathname === "/" && homeVisible !== null
    ? homeVisible : getMobileNavIndex(pathname, hash);
  const [compact, setCompact] = useState(false);
  const lastY = useRef(0);

  // Never detach or unmount the dock during scroll; its links remain tappable.
  // A single animation frame throttles direction sensing.
  useEffect(() => {
    lastY.current = window.scrollY || 0;
    let frame = 0;
    let directionTravel = 0;
    let lastSectionY = lastY.current;
    const detectHomeSection = () => {
      if (pathname !== "/") return;
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
        if (pathname === "/" && Math.abs(nextY - lastSectionY) >= 80) {
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
    setCompact(false);
    setHomeVisible(null);
  }, [pathname, hash]);

  // Home-page hash targets always scroll to the actual catalogue/exams section.
  useEffect(() => {
    const anchor = hash?.replace(/^#/, "");
    if (pathname !== "/" || (anchor !== "subjects" && anchor !== "exams")) return;
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
    if (index === 0 && pathname === "/" && !hash) {
      window.scrollTo({
        top: 0,
        behavior: window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches
          ? "auto" : "smooth",
      });
    }
    if (pathname === "/" && (index === 1 || index === 2)) {
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
      aria-label={tx("Արագ նավարկում")}
      data-compact={compact ? "true" : "false"}
      className="site-mobile-nav mobile-liquid-dock fixed inset-x-3 z-40 mx-auto max-w-[29rem] rounded-[1.7rem] p-[6px] md:hidden"
    >
      <div className="mobile-liquid-track relative grid grid-cols-5 items-stretch">
        <span
          aria-hidden="true"
          className="mobile-liquid-indicator pointer-events-none absolute inset-y-0 left-0 w-1/5 rounded-[1.3rem]"
          style={{ transform: "translate3d(" + selected * 100 + "%, 0, 0)" }}
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
              (selected === index ? "is-selected" : "")
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
