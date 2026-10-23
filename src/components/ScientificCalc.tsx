import { useState } from "react";
import { Delete } from "lucide-react";
import { Button } from "@/components/ui/button";
import { evaluate } from "@/lib/sci";
import { useTx } from "@/lib/lang";

type Key = { label: string; insert: string; tone?: "fn" | "op" | "num" };

const SCIENTIFIC_KEYS: Key[] = [
  { label: "sin", insert: "sin(", tone: "fn" },
  { label: "cos", insert: "cos(", tone: "fn" },
  { label: "tan", insert: "tan(", tone: "fn" },
  { label: "(", insert: "(", tone: "op" },
  { label: ")", insert: ")", tone: "op" },
  { label: "asin", insert: "asin(", tone: "fn" },
  { label: "acos", insert: "acos(", tone: "fn" },
  { label: "atan", insert: "atan(", tone: "fn" },
  { label: "x²", insert: "^2", tone: "fn" },
  { label: "xʸ", insert: "^", tone: "fn" },
  { label: "log", insert: "log(", tone: "fn" },
  { label: "ln", insert: "ln(", tone: "fn" },
  { label: "√", insert: "sqrt(", tone: "fn" },
  { label: "n!", insert: "!", tone: "fn" },
  { label: "π", insert: "π", tone: "fn" },
  { label: "e", insert: "e", tone: "fn" },
  { label: "7", insert: "7", tone: "num" },
  { label: "8", insert: "8", tone: "num" },
  { label: "9", insert: "9", tone: "num" },
  { label: "÷", insert: "÷", tone: "op" },
  { label: "4", insert: "4", tone: "num" },
  { label: "5", insert: "5", tone: "num" },
  { label: "6", insert: "6", tone: "num" },
  { label: "×", insert: "×", tone: "op" },
  { label: "1", insert: "1", tone: "num" },
  { label: "2", insert: "2", tone: "num" },
  { label: "3", insert: "3", tone: "num" },
  { label: "−", insert: "−", tone: "op" },
  { label: "0", insert: "0", tone: "num" },
  { label: ".", insert: ".", tone: "num" },
  { label: "+", insert: "+", tone: "op" },
];

const SIMPLE_KEYS: Key[] = [
  { label: "7", insert: "7", tone: "num" },
  { label: "8", insert: "8", tone: "num" },
  { label: "9", insert: "9", tone: "num" },
  { label: "÷", insert: "÷", tone: "op" },
  { label: "4", insert: "4", tone: "num" },
  { label: "5", insert: "5", tone: "num" },
  { label: "6", insert: "6", tone: "num" },
  { label: "×", insert: "×", tone: "op" },
  { label: "1", insert: "1", tone: "num" },
  { label: "2", insert: "2", tone: "num" },
  { label: "3", insert: "3", tone: "num" },
  { label: "−", insert: "−", tone: "op" },
  { label: "(", insert: "(", tone: "op" },
  { label: "0", insert: "0", tone: "num" },
  { label: ")", insert: ")", tone: "op" },
  { label: "+", insert: "+", tone: "op" },
  { label: ".", insert: ".", tone: "num" },
];

export function ScientificCalc() {
  const tx = useTx();
  const [expr, setExpr] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [deg, setDeg] = useState(true);
  const [error, setError] = useState(false);
  const [mode, setMode] = useState<"simple" | "scientific">("scientific");

  const press = (insert: string) => {
    setError(false);
    setResult(null);
    setExpr((e) => e + insert);
  };
  const equals = () => {
    if (!expr.trim()) return;
    try {
      const v = evaluate(expr, deg);
      setResult(String(Number(v.toPrecision(12))));
      setError(false);
    } catch {
      setResult(null);
      setError(true);
    }
  };
  const clear = () => {
    setExpr("");
    setResult(null);
    setError(false);
  };
  const del = () => {
    setExpr((e) => e.slice(0, -1));
    setResult(null);
    setError(false);
  };

  const keys = mode === "simple" ? SIMPLE_KEYS : SCIENTIFIC_KEYS;
  const tone = (t?: Key["tone"]) =>
    t === "num" ? "bg-card hover:bg-muted" : t === "op" ? "bg-secondary hover:bg-secondary/70" : "bg-muted hover:bg-secondary";

  return (
    <section className="mx-auto w-full min-w-0 max-w-xl space-y-3 sm:space-y-4">
      <div className="flex w-full rounded-xl border bg-card p-1" role="group" aria-label={tx("Հաշվիչի ռեժիմ")}>
        {(["simple", "scientific"] as const).map((m) => (
          <button
            key={m}
            type="button"
            aria-pressed={mode === m}
            onClick={() => setMode(m)}
            className={`min-w-0 flex-1 rounded-lg px-2 py-2 text-sm font-bold transition sm:text-base ${mode === m ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted"}`}
          >
            {m === "simple" ? tx("Պարզ") : tx("Գիտական")}
          </button>
        ))}
      </div>

      <div className="min-w-0 rounded-2xl border bg-card p-3 sm:p-4" aria-live="polite">
        <p className="min-h-6 break-words [overflow-wrap:anywhere] font-mono text-sm text-muted-foreground" dir="ltr">{expr || "\u00a0"}</p>
        <p className="min-h-10 break-words text-right font-mono text-2xl font-black [overflow-wrap:anywhere] sm:text-3xl" dir="ltr">
          {error ? <span className="text-destructive">{tx("Սխալ")}</span> : result ?? "\u00a0"}
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex rounded-xl border bg-card p-1 text-sm font-bold" role="group" aria-label={tx("Անկյունի միավոր")}>
          {(["DEG", "RAD"] as const).map((u) => (
            <button
              key={u}
              type="button"
              aria-pressed={(u === "DEG") === deg}
              onClick={() => setDeg(u === "DEG")}
              className={`rounded-lg px-3 py-2 ${(u === "DEG") === deg ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
            >
              {u}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-10 min-w-10" onClick={del} aria-label={tx("Ջնջել")}><Delete className="size-4" /></Button>
          <Button variant="outline" size="sm" className="h-10" onClick={clear}>{tx("Մաքրել")}</Button>
        </div>
      </div>

      <div className={`grid w-full min-w-0 gap-2 ${mode === "simple" ? "grid-cols-4" : "grid-cols-4 sm:grid-cols-5"}`}>
        {keys.map((k, i) => (
          <button
            key={`${k.label}-${i}`}
            type="button"
            onClick={() => press(k.insert)}
            className={`${tone(k.tone)} min-w-0 h-12 rounded-xl border px-1 text-base font-bold shadow-sm transition active:scale-[0.98] sm:h-14 sm:text-lg`}
          >
            {k.label}
          </button>
        ))}
        <button
          type="button"
          onClick={equals}
          className="col-span-4 h-14 rounded-xl bg-primary text-lg font-black text-primary-foreground shadow-sm transition active:scale-[0.99] sm:h-16"
        >
          =
        </button>
      </div>
    </section>
  );
}
