import { useState } from "react";
import { Delete } from "lucide-react";
import { Button } from "@/components/ui/button";
import { evaluate } from "@/lib/sci";
import { useTx } from "@/lib/lang";

type Key = { label: string; insert: string; tone?: "fn" | "op" | "num" | "eq" | "ctl" };

// Each key inserts text into the expression; the parser understands these tokens.
const KEYS: Key[] = [
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

export function ScientificCalc() {
  const tx = useTx();
  const [expr, setExpr] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [deg, setDeg] = useState(true);
  const [error, setError] = useState(false);

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

  const tone = (t?: Key["tone"]) =>
    t === "num" ? "bg-card" : t === "op" ? "bg-secondary" : t === "fn" ? "bg-muted" : "bg-card";

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border bg-card p-4" aria-live="polite">
        <p className="min-h-6 break-all font-mono text-sm text-muted-foreground">{expr || " "}</p>
        <p className="min-h-10 break-all text-right font-mono text-2xl font-black">
          {error ? <span className="text-destructive">{tx("Սխալ")}</span> : result ?? ""}
        </p>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="inline-flex rounded-xl border bg-card p-1 text-sm font-bold" role="group" aria-label={tx("Անկյունի միավոր")}>
          {(["DEG", "RAD"] as const).map((u) => (
            <button
              key={u}
              type="button"
              aria-pressed={(u === "DEG") === deg}
              onClick={() => setDeg(u === "DEG")}
              className={`rounded-lg px-3 py-1.5 ${(u === "DEG") === deg ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
            >
              {u}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={del} aria-label={tx("Ջնջել")}><Delete /></Button>
          <Button variant="outline" size="sm" onClick={clear}>{tx("Մաքրել")}</Button>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {KEYS.map((k) => (
          <button
            key={k.label}
            type="button"
            onClick={() => press(k.insert)}
            className={`${tone(k.tone)} h-12 rounded-xl border text-base font-bold shadow-sm transition active:scale-95 hover:bg-secondary`}
          >
            {k.label}
          </button>
        ))}
        <button
          type="button"
          onClick={equals}
          className="col-span-5 h-14 rounded-xl bg-primary text-lg font-black text-primary-foreground shadow-sm transition active:scale-95"
        >
          =
        </button>
      </div>
    </div>
  );
}
