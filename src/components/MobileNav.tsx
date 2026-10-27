import { Link } from "@tanstack/react-router";
import { BookOpen, ClipboardCheck, Gamepad2, House, Timer } from "lucide-react";
import { useTx } from "@/lib/lang";

/** Five predictable destinations for touch devices. Detailed subjects live
 * in the category catalogue, not behind tiny mobile-tab items. */
const base =
  "flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-[10px] font-extrabold leading-tight text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary focus-visible:outline-2 focus-visible:outline-primary";

export function MobileNav() {
  const tx = useTx();
  return (
    <nav aria-label={tx("Արագ նավարկում")}
      className="site-mobile-nav fixed inset-x-3 bottom-[max(.75rem,env(safe-area-inset-bottom))] z-40 mx-auto grid max-w-md grid-cols-5 gap-0.5 rounded-[1.2rem] border border-border bg-card p-1.5 shadow-card md:hidden">
      <Link to="/" className={base}><House className="size-5"/><span>{tx("Գլխավոր")}</span></Link>
      <Link to="/" hash="subjects" className={base}><BookOpen className="size-5"/><span>{tx("Գրքեր")}</span></Link>
      <Link to="/" hash="exams" className={base}><ClipboardCheck className="size-5"/><span>{tx("Թեստեր")}</span></Link>
      <Link to="/mini-games" className={base}><Gamepad2 className="size-5"/><span>{tx("Խաղեր")}</span></Link>
      <Link to="/study-tools" className={base}><Timer className="size-5"/><span>{tx("Գործիքներ")}</span></Link>
    </nav>
  );
}
