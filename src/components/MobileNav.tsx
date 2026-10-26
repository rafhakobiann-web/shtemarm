import { Link, useRouterState } from "@tanstack/react-router";
import { ClipboardList, Gamepad2, House, Timer, User } from "lucide-react";
import { useTx } from "@/lib/lang";

const base="flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 py-2 text-[10px] font-bold leading-tight transition-colors focus-visible:outline-2 focus-visible:outline-primary";
export function MobileNav(){
  const tx=useTx();
  const path=useRouterState({select:s=>s.location.pathname});
  const item=(active:boolean)=>base+" "+(active?"bg-primary/10 text-primary":"text-muted-foreground hover:bg-muted hover:text-foreground");
  return <nav aria-label={tx("Արագ նավարկում")}
    className="site-mobile-nav fixed inset-x-3 bottom-3 z-40 mx-auto grid max-w-md grid-cols-5 gap-1 rounded-2xl border bg-background/95 p-1.5 shadow-xl backdrop-blur-sm md:hidden">
    <Link to="/" className={item(path==="/")}><House className="size-5"/><span>{tx("Գլխավոր")}</span></Link>
    <Link to="/thematic" className={item(path==="/thematic")}><ClipboardList className="size-5"/><span>{tx("Թեմատիկ")}</span></Link>
    <Link to="/mini-games" className={item(path==="/mini-games")}><Gamepad2 className="size-5"/><span>{tx("Խաղեր")}</span></Link>
    <Link to="/study-tools" className={item(path==="/study-tools")}><Timer className="size-5"/><span>{tx("Գործիքներ")}</span></Link>
    <Link to="/auth" className={item(path==="/auth")}><User className="size-5"/><span>{tx("Իմ հաշիվը")}</span></Link>
  </nav>;
}
