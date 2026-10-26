import { BookMarked, ExternalLink } from "lucide-react";
import { GTC_BLUEPRINTS, type GuideSubject } from "@/lib/gtc-blueprints";
import { useTx } from "@/lib/lang";

export function GtcGuidePanel({ subject }: { subject: GuideSubject }) {
  const tx = useTx();
  const blueprint = GTC_BLUEPRINTS[subject];
  return (
    <section className="space-y-4 rounded-3xl border bg-card p-5" aria-label={tx("ԳԹԿ-ի պաշտոնական կառուցվածք")}>
      <div className="flex items-center gap-2">
        <BookMarked aria-hidden="true" className="size-5 text-primary" />
        <h2 className="font-black">{tx("ԳԹԿ · 2027 թ. ուղեցույց")}</h2>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {[
          [blueprint.taskCount, "Առաջադրանք"],
          [blueprint.maxPoints, "Միավոր"],
          [blueprint.minutes, "Րոպե"],
        ].map(([value, label]) => (
          <div key={label} className="rounded-xl bg-muted/60 p-2 text-center">
            <p className="text-xl font-black">{value}</p>
            <p className="text-[11px] text-muted-foreground">{tx(label)}</p>
          </div>
        ))}
      </div>
      {blueprint.parts.map((part) => (
        <div key={part.name} className="space-y-2 rounded-xl border p-3 text-sm">
          <h3 className="font-semibold">{part.name} · {part.points} {tx("միավոր")}</h3>
          <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
            {part.slots.map((slot) => (
              <span key={slot.type} className="rounded-lg bg-muted px-2 py-1">
                {slot.type === "choice" ? tx("Ընտրովի") : slot.type === "short" ? tx("Կարճ") : tx("6 պնդումով փունջ")}: {slot.count}
              </span>
            ))}
          </div>
        </div>
      ))}
      {"note" in blueprint && blueprint.note && (
        <p className="text-xs leading-relaxed text-muted-foreground">{blueprint.note}</p>
      )}
      <p className="text-xs leading-relaxed text-muted-foreground">
        {tx("Այս աղյուսակը պաշտոնական ուղեցույցի պահանջն է։ Առկա շտեմարանից կազմվող սովորական թեստը պարտադիր չէ, որ ունենա այս նույն տեսակներն ու պաշտոնական գնահատումը։")}
      </p>
      <a className="inline-flex items-center gap-2 text-sm font-semibold text-primary underline underline-offset-2"
        href={blueprint.guide} target="_blank" rel="noopener noreferrer">
        {tx("Կարդալ ԳԹԿ-ի ուղեցույցը")} <ExternalLink className="size-4" />
      </a>
    </section>
  );
}
