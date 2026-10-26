import type { ReactNode } from "react";
import { ClipboardCheck, Layers3, SlidersHorizontal, Timer } from "lucide-react";
import { useTx } from "@/lib/lang";

/** Shared exam setup header for every subject. No background jobs or schedules. */
export function ExamHero({
  title, description, subject, available, sources, icon,
}: {
  title: string;
  description: string;
  subject: string;
  available?: number | undefined;
  sources: string;
  icon: ReactNode;
}) {
  const tx = useTx();
  return (
    <header className="relative isolate overflow-hidden rounded-3xl border bg-card p-6 shadow-sm sm:p-9">
      <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-20 -z-10 size-72 rounded-full bg-primary/10 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute bottom-0 left-1/3 -z-10 size-40 rounded-full bg-primary/5 blur-3xl" />
      <div className="mb-4 flex items-center gap-2 text-sm font-bold text-primary">
        <span className="grid size-10 place-items-center rounded-xl bg-primary/10">{icon}</span>
        <span>{subject} · Shtemarm</span>
      </div>
      <h1 className="max-w-3xl text-3xl font-black tracking-tight sm:text-4xl">{title}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">{description}</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Metric icon={<Layers3 className="size-5" />} value={available === undefined ? "—" : available.toLocaleString("hy-AM")} label={tx("Հասանելի առաջադրանքներ")} />
        <Metric icon={<ClipboardCheck className="size-5" />} value={sources} label={tx("Հարցերի աղբյուրներ")} />
        <Metric icon={<Timer className="size-5" />} value={tx("Քո ընտրությամբ")} label={tx("Ժամանակ և ռեժիմ")} />
      </div>
    </header>
  );
}

function Metric({ icon, value, label }: { icon: ReactNode; value: string; label: string }) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-border/60 bg-muted/50 p-4">
      <span aria-hidden="true" className="shrink-0 text-primary">{icon}</span>
      <div className="min-w-0">
        <p className="truncate text-lg font-black">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

export function ExamBuilderTitle() {
  const tx = useTx();
  return (
    <div>
      <h2 className="flex items-center gap-2 text-xl font-black">
        <SlidersHorizontal aria-hidden="true" className="size-5 text-primary" />
        {tx("Կազմել անհատական թեստ")}
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        {tx("Ընտրիր հարցերի աղբյուրը, բաժինները, առաջադրանքների քանակը, ժամանակն ու ռեժիմը։")}
      </p>
    </div>
  );
}
