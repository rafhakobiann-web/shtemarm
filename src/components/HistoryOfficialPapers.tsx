import { useQuery } from "@tanstack/react-query";
import { ExternalLink, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { loadHistoryOfficialCatalog } from "@/lib/history-official";
import { useTx } from "@/lib/lang";

export function HistoryOfficialPapers({ subject = "history" }: { subject?: "history" | "biology" }) {
  const tx = useTx();
  const catalog = useQuery({
    queryKey: ["official-catalog-v1", subject],
    queryFn: () => loadHistoryOfficialCatalog(subject),
    staleTime: 15 * 60 * 1000,
  });
  const papers = catalog.data?.papers ?? [];
  return (
    <section className="space-y-3 rounded-3xl border bg-card p-5" aria-label="Պաշտոնական քննական նյութեր">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-black">{tx(subject === "history" ? "Հայոց պատմություն · Քննությունների արխիվ" : "Կենսաբանություն · Քննությունների արխիվ")}</h2>
        <Button size="icon" variant="ghost" onClick={() => void catalog.refetch()} aria-label={tx("Թարմացնել աղբյուրները")}>
          <RefreshCw className="size-4" />
        </Button>
      </div>
      <p className="text-xs leading-relaxed text-muted-foreground">
        {tx("Քննական նյութերի պաշտոնական էջերն ու հրապարակված թեստերի հղումները։ Արխիվը թարմացվում է միայն ձեռքով իրականացված ստուգումից հետո։ Չհրապարակված թեստերը չեն ցուցադրվում որպես պատրաստ։")}
      </p>
      {catalog.isPending && <p role="status" className="text-sm">{tx("Բեռնվում է…")}</p>}
      {catalog.isError && (
        <p role="alert" className="text-sm text-destructive">
          {tx("Չհաջողվեց բեռնել արխիվը։")}{" "}
          <a className="underline" href="https://dimord.am/public/tests" target="_blank" rel="noopener noreferrer">
            {tx("Բացել ԳԹԿ կայքը")}
          </a>
        </p>
      )}
      {papers.map((paper) => (
        <div key={paper.id} className="space-y-2 rounded-xl border p-3 text-sm">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <strong className="leading-snug">{paper.title}</strong>
            <span className={paper.status === "published" ? "text-primary text-xs" : "text-muted-foreground text-xs"}>
              {tx(paper.status === "published" ? "Հրապարակված" : "Սպասվում է")}
            </span>
          </div>
          <a href={paper.sourceUrl} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-semibold text-primary underline underline-offset-2">
            {tx("Բացել աղբյուրի էջը")} <ExternalLink className="size-3" />
          </a>
          {paper.links.length > 0 && (
            <details className="rounded-lg bg-muted/50 p-2">
              <summary className="cursor-pointer text-xs font-semibold">{tx("Թեստերի հղումներ · {n}", { n: paper.links.length })}</summary>
              <div className="mt-2 space-y-2">
                {paper.links.map((link) => (
                  <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer"
                    className="block break-words text-xs text-primary underline underline-offset-2">
                    {link.title}
                  </a>
                ))}
              </div>
            </details>
          )}
        </div>
      ))}
      <p className="text-xs text-muted-foreground">
        {tx("Արխիվային հղումները կարող են պահանջել մուտք աղբյուրի կայքում։ Պաշտոնական PDF-ի հրապարակումը ինքնաշխատ չի ավելացնում դրա հարցերը կայքի շտեմարանին։")}
      </p>
      <a href="https://escs.gov.am/articles/news/183" target="_blank" rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-xs font-semibold text-primary underline">
        {tx("2026–2027 քննությունների ուղեցույց")} <ExternalLink className="size-3" />
      </a>
    </section>
  );
}
