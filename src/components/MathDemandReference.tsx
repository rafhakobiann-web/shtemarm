import { useState } from "react";
import { BookOpenCheck, ChevronDown } from "lucide-react";
import type { MathSegment } from "@/lib/math-bank";
import { useTx } from "@/lib/lang";

const PDF_WIDTH = 467.76;
/** Cross-check the shared instruction, notation and diagram against the
 * original book crop. Images aren't mounted until someone expands the card.
 */
export function MathDemandReference({
  bookId, segments, compact = false,
}: { bookId: string; segments: readonly MathSegment[]; compact?: boolean }) {
  const tx = useTx();
  const [expanded, setExpanded] = useState(false);
  const unique = segments.filter((s, i, arr) =>
    Number.isFinite(s.y0) && Number.isFinite(s.y1) && s.y1 > s.y0 &&
    arr.findIndex(v => v.page === s.page && v.y0 === s.y0 && v.y1 === s.y1) === i,
  ).slice(0, 5);
  if (!unique.length || (bookId !== "matem-1" && bookId !== "matem-2")) return null;
  return (
    <div className="my-2 rounded-xl border border-border/70 bg-muted/20">
      <button type="button" aria-expanded={expanded}
        className={"flex min-h-11 w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-left text-xs font-semibold text-primary hover:bg-muted/60 focus-visible:outline-2 focus-visible:outline-primary"}
        onClick={() => setExpanded(!expanded)}>
        <span className="inline-flex min-w-0 items-center gap-2">
          <BookOpenCheck className="size-4 shrink-0"/>
          {tx("Համեմատել առաջադրանքի պահանջը գրքի բնօրինակի հետ")}
        </span>
        <ChevronDown aria-hidden="true" className={"size-4 shrink-0 transition-transform "+(expanded?"rotate-180":"")}/>
      </button>
      {expanded && <div className={"space-y-3 border-t p-3 "+(compact?"":"sm:p-4")}>
        <p className="text-xs leading-relaxed text-muted-foreground">
          {tx("Սա գրքի էջի համապատասխան հատվածն է։ Տեքստային տարբերակի հետ անհամապատասխանության դեպքում առաջնորդվիր բնօրինակ պահանջով։")}
        </p>
        {unique.map((s,i)=>{
          const url="/math/books/"+bookId+"/p-"+String(s.page).padStart(3,"0")+".jpg";
          return <figure key={[s.page,s.y0,i].join(":")} className="space-y-1.5">
            <figcaption className="text-xs font-bold text-muted-foreground">{tx("Բնօրինակի էջ {n}",{n:s.page})}</figcaption>
            <div className="relative max-w-full overflow-hidden rounded-lg border bg-white" style={{aspectRatio:String(PDF_WIDTH)+" / "+String(s.y1-s.y0)}}>
              <img alt={tx("Մաթեմատիկայի գրքի էջ {n}՝ բնօրինակ պահանջով",{n:s.page})}
                src={url} decoding="async" loading="lazy" className="block w-full max-w-none"
                style={{marginTop:"-"+String(s.y0/PDF_WIDTH*100)+"%"}} />
            </div>
          </figure>;
        })}
      </div>}
    </div>
  );
}
