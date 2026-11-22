import { useEffect, useState } from "react";
import { Link, useLocation } from "@tanstack/react-router";
import { BookOpen, ClipboardCheck, House, Wrench } from "lucide-react";
import { useLang, useTx } from "@/lib/lang";

/** Four stable destinations: Home → Subjects → Exams → Tools. */
export const MOBILE_TAB_TARGETS = [
  { id: "home", to: "/dashboard", hash: "" },
  { id: "explore", to: "/explore", hash: "" },
  { id: "exams", to: "/explore", hash: "exams" },
  { id: "tools", to: "/study-tools", hash: "" },
] as const;

export function getMobileNavIndex(pathname: string, hash = ""): number {
  const path = pathname.replace(/\/+$/, "") || "/";
  const anchor = hash.replace(/^#/, "");
  if (path === "/" || path === "/dashboard") return 0;
  if (path === "/explore") return anchor === "exams" ? 2 : 1;
  if (["/profile", "/achievements", "/learning-insights"].includes(path)) return -1;
  if ([
    "/study-tools", "/flashcards", "/mini-games", "/assessment-builder", "/calc",
    "/chat", "/vocabulary", "/mistakes", "/english-grammar", "/math-handbook",
    "/math-review", "/study-plan",
  ].includes(path)) return 3;
  if (
    path.startsWith("/book/") || path.startsWith("/study/") ||
    path.startsWith("/math/books") || path === "/history-book" ||
    path.startsWith("/physics/books") || path.startsWith("/physics/original") ||
    path.startsWith("/subject/")
  ) return 1;
  if (
    path.startsWith("/exam/") || path.startsWith("/test/") ||
    path.startsWith("/level-test/") || path === "/math" ||
    path === "/history" || path === "/biology" ||
    path.startsWith("/physics/scan-practice")
  ) return 2;
  return 0;
}

export function MobileNav() {
  const tx = useTx();
  const lang = useLang();
  const { pathname, hash } = useLocation();
  const selected = getMobileNavIndex(pathname, typeof hash === "string" ? hash : "");
  const studyFocus = /^\/(?:study|test|exam|level-test|history|biology|physics)(?:[/.]|$)/.test(pathname) || pathname === "/math/play";
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;
    const update = () => {
      const active = document.activeElement;
      const editing = active instanceof HTMLElement &&
        (active.matches("input,textarea") || active.isContentEditable);
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

  useEffect(() => {
    const anchor = hash?.replace(/^#/, "");
    const dashboardAnchor = (pathname === "/" || pathname === "/dashboard") &&
      (anchor === "subjects" || anchor === "exams");
    const exploreAnchor = pathname === "/explore" &&
      (anchor === "subjects" || anchor === "exams" || anchor === "tools");
    if (!dashboardAnchor && !exploreAnchor) return;
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(anchor)?.scrollIntoView({
        behavior: window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ? "auto" : "smooth",
        block: "start",
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [pathname, hash]);

  const labels = {
    hy: ["Գլխավոր", "Առարկաներ", "Թեստեր", "Գործիքներ"],
    en: ["Home", "Subjects", "Tests", "Tools"],
    ru: ["Главная", "Предметы", "Тесты", "Инструменты"],
  }[lang];
  const tabs = [
    { ...MOBILE_TAB_TARGETS[0], label: labels[0], icon: House },
    { ...MOBILE_TAB_TARGETS[1], label: labels[1], icon: BookOpen },
    { ...MOBILE_TAB_TARGETS[2], label: labels[2], icon: ClipboardCheck },
    { ...MOBILE_TAB_TARGETS[3], label: labels[3], icon: Wrench },
  ] as const;

  return (
    <nav
      hidden={keyboardOpen || studyFocus}
      aria-label={tx("Արագ նավարկում")}
      className="site-mobile-nav sht-quiet-mobile-nav fixed inset-x-0 bottom-0 z-40 border-t bg-background pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <div className="mx-auto grid max-w-xl grid-cols-4">
        {tabs.map(({ id, to, hash: tabHash, label, icon: Icon }, index) => (
          <Link
            key={id}
            to={to}
            {...(tabHash ? { hash: tabHash } : {})}
            aria-current={selected === index ? "page" : undefined}
            aria-label={label}
            className={
              "flex min-h-16 flex-col items-center justify-center gap-1 px-1 text-[11px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-primary " +
              (selected === index ? "text-primary" : "text-muted-foreground hover:text-foreground")
            }
          >
            <Icon aria-hidden="true" className="size-5" strokeWidth={selected === index ? 2.2 : 1.8} />
            <span className="block max-w-full truncate">{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
