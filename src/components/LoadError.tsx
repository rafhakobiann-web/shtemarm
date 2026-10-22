import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Shown when a book or test could not be downloaded, so the page never spins forever. */
export function LoadError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="mx-auto flex max-w-sm flex-col items-center gap-4 py-20 text-center">
      <p className="text-base font-semibold">Չհաջողվեց բեռնել բովանդակությունը։</p>
      <p className="text-sm text-muted-foreground">Ստուգիր ինտերնետը և փորձիր նորից։</p>
      <Button variant="outline" onClick={onRetry}>
        <RefreshCw /> Փորձել նորից
      </Button>
    </div>
  );
}
