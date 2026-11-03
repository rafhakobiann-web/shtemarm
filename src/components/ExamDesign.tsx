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
    <header className="academy-card sht-exam-hero relative isolate overflow-hidden p-5 sm:p-8">
      <div aria-hidden="true" className="pointer-events-none absolute right-0 top-0 -z-10 h-24 w-40 rounded-bl-full bg-primary/5" />
      <div aria-hidden="true" className="pointer-events-none absolute right-10 top-9 -z-10 size-12 rounded-full border-2 border-primary/10" />
      <div className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-wider text-primary">
        <span className="grid size-10 place-items-center rounded-xl border border-primary/15 bg-primary/10">{icon}</span>
        <span>{subject} · Shtemarm</span>
      </div>
      <h1 className="max-w-3xl text-balance text-2xl font-black tracking-tight sm:text-4xl">{title}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">{description}</p>
      <div className="sht-exam-metrics mt-6 grid gap-2 sm:grid-cols-3">
        <Metric icon={<Layers3 className="size-5" />} value={available === undefined ? "—" : available.toLocaleString("hy-AM")} label={tx("Հասանելի առաջադրանքներ")} />
        <Metric icon={<ClipboardCheck className="size-5" />} value={sources} label={tx("Հարցերի աղբյուրներ")} />
        <Metric icon={<Timer className="size-5" />} value={tx("Քո ընտրությամբ")} label={tx("Ժամանակ և ռեժիմ")} />
      </div>
    </header>
  );
}

function Metric({ icon, value, label }: { icon: ReactNode; value: string; label: string }) {
  return (
    <div className="sht-exam-metric flex min-w-0 items-center gap-3 rounded-xl border border-border/70 bg-muted/35 p-3.5">
      <span aria-hidden="true" className="shrink-0 text-primary">{icon}</span>
      <div className="min-w-0">
        <p className="line-clamp-2 break-words text-base font-black sm:text-lg">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}

export function ExamBuilderTitle() {
  const tx = useTx();
  return (
    <div className="sht-exam-builder-title">
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
