import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTx } from "@/lib/lang";

/** Shown when a book or test could not be downloaded, so the page never spins forever. */
export function LoadError({ onRetry, detail, retrying = false }: { onRetry: () => void; detail?: string; retrying?: boolean }) {
  const tx = useTx();
  return (
    <div role="alert" className="mx-auto flex max-w-sm flex-col items-center gap-4 py-20 text-center">
      <p className="text-base font-semibold">{tx("Չհաջողվեց բեռնել բովանդակությունը։")}</p>
      <p className="text-sm text-muted-foreground">{tx("Ստուգիր ինտերնետը և փորձիր նորից։")}</p>
      {detail && <p className="break-all font-mono text-xs text-muted-foreground">{detail}</p>}
      <Button variant="outline" onClick={onRetry} disabled={retrying}>
        <RefreshCw aria-hidden="true" className={retrying ? "animate-spin" : ""} /> {tx(retrying ? "Կրկին բեռնվում է…" : "Փորձել նորից")}
      </Button>
    </div>
  );
}
