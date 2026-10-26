import { Link } from "@tanstack/react-router";
import { BookOpen, Calculator, Gamepad2, History, House, Leaf } from "lucide-react";
import { useTx } from "@/lib/lang";

const base = "flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-[10px] font-bold leading-tight text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary";
export function MobileNav() {
  const tx = useTx();
  return (
    <nav aria-label={tx("Արագ նավարկում")} className="site-mobile-nav fixed inset-x-3 bottom-3 z-40 mx-auto grid max-w-md grid-cols-5 gap-1 rounded-2xl border bg-background/95 p-1.5 shadow-2xl backdrop-blur-xl md:hidden">
      <Link to="/" className={base}><House className="size-5" /><span>{tx("Գլխավոր")}</span></Link>
      <Link to="/" search={{ subject: "english" }} className={base}><BookOpen className="size-5" /><span>{tx("Անգլերեն")}</span></Link>
      <Link to="/math" className={base}><Calculator className="size-5" /><span>{tx("Մաթեմատիկա")}</span></Link>
      <Link to="/history" className={base}><History className="size-5" /><span>{tx("Պատմություն")}</span></Link>
      <Link to="/mini-games" className={base}><Gamepad2 className="size-5" /><span>{tx("Խաղեր")}</span></Link>
    </nav>
  );
}
