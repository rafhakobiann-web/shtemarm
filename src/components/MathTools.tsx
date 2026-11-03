import { useEffect, useRef, useState } from "react";
import { Calculator, Eraser, Pencil, Undo2, X, Sigma, Copy, Check } from "lucide-react";
import { RichText, useKatex } from "@/components/MathText";
import { useTx } from "@/lib/lang";

/* ---------- scientific evaluator (no eval) ---------- */
type Mode = "DEG" | "RAD";
const FUNCS = ["sin", "cos", "tan", "asin", "acos", "atan", "ln", "log", "sqrt", "cbrt", "abs", "exp"];

function tokenize(src: string): string[] {
  const s = src
    .replace(/÷/g, "/")
    .replace(/×/g, "*")
    .replace(/−/g, "-")
    .replace(/π/g, "pi")
    .replace(/√/g, "sqrt")
    .replace(/∛/g, "cbrt")
    .replace(/\s+/g, "");
  const out: string[] = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (/[0-9.]/.test(c)) {
      let j = i;
      while (j < s.length && /[0-9.]/.test(s[j])) j++;
      out.push(s.slice(i, j));
      i = j;
    } else if (/[a-z]/.test(c)) {
      let j = i;
      while (j < s.length && /[a-z]/.test(s[j])) j++;
      out.push(s.slice(i, j));
      i = j;
    } else {
      out.push(c);
      i++;
    }
  }
  return out;
}

function evaluate(src: string, mode: Mode): number {
  const t = tokenize(src);
  let i = 0;
  const peek = () => t[i];
  const isStartOfPrimary = (tok?: string) => tok !== undefined && (/^[0-9.]/.test(tok) || tok === "(" || tok === "pi" || tok === "e" || FUNCS.includes(tok));
  const toRad = (x: number) => (mode === "DEG" ? (x * Math.PI) / 180 : x);
  const fromRad = (x: number) => (mode === "DEG" ? (x * 180) / Math.PI : x);

  function expr(): number {
    let v = term();
    while (peek() === "+" || peek() === "-") {
      const op = t[i++];
      const r = term();
      v = op === "+" ? v + r : v - r;
    }
    return v;
  }
  function term(): number {
    let v = unary();
    for (;;) {
      if (peek() === "*" || peek() === "/") {
        const op = t[i++];
        const r = unary();
        v = op === "*" ? v * r : v / r;
      } else if (isStartOfPrimary(peek())) {
        // implicit multiplication, e.g. 2π, 3sin(30), 2(4+1)
        v = v * unary();
      } else break;
    }
    return v;
  }
  function unary(): number {
    if (peek() === "-") { i++; return -unary(); }
    if (peek() === "+") { i++; return unary(); }
    return power();
  }
  function power(): number {
    const base = postfix();
    if (peek() === "^") {
      i++;
      return Math.pow(base, unary());
    }
    return base;
  }
  function postfix(): number {
    let v = primary();
    for (;;) {
      if (peek() === "!") {
        i++;
        if (!Number.isInteger(v) || v < 0 || v > 170) throw new Error("fact");
        let f = 1;
        for (let k = 2; k <= v; k++) f *= k;
        v = f;
      } else if (peek() === "%") {
        i++;
        v = v / 100;
      } else break;
    }
    return v;
  }
  function expect(ch: string) {
    if (peek() !== ch) throw new Error("syntax");
    i++;
  }
  function primary(): number {
    const tok = peek();
    if (tok === undefined) throw new Error("syntax");
    if (/^[0-9.]/.test(tok)) {
      i++;
      const v = parseFloat(tok);
      if (Number.isNaN(v)) throw new Error("syntax");
      return v;
    }
    if (tok === "pi") { i++; return Math.PI; }
    if (tok === "e") { i++; return Math.E; }
    if (tok === "(") {
      i++;
      const v = expr();
      expect(")");
      return v;
    }
    if (FUNCS.includes(tok)) {
      i++;
      expect("(");
      const a = expr();
      expect(")");
      switch (tok) {
        case "sin": return Math.sin(toRad(a));
        case "cos": return Math.cos(toRad(a));
        case "tan": return Math.tan(toRad(a));
        case "asin": return fromRad(Math.asin(a));
        case "acos": return fromRad(Math.acos(a));
        case "atan": return fromRad(Math.atan(a));
        case "ln": return Math.log(a);
        case "log": return Math.log10(a);
        case "exp": return Math.exp(a);
        case "sqrt": return Math.sqrt(a);
        case "cbrt": return Math.cbrt(a);
        case "abs": return Math.abs(a);
      }
    }
    throw new Error("syntax");
  }

  const v = expr();
  if (i !== t.length) throw new Error("syntax");
  if (!Number.isFinite(v)) throw new Error("math");
  return Math.round(v * 1e10) / 1e10;
}

/** Keys: each inserts text that the evaluator understands. */
const SCI_KEYS: { label: string; insert: string; wide?: boolean; tone?: "fn" | "op" | "num" | "warn" }[] = [
  { label: "sin", insert: "sin(", tone: "fn" },
  { label: "cos", insert: "cos(", tone: "fn" },
  { label: "tan", insert: "tan(", tone: "fn" },
  { label: "(", insert: "(", tone: "op" },
  { label: ")", insert: ")", tone: "op" },
  { label: "sin⁻¹", insert: "asin(", tone: "fn" },
  { label: "cos⁻¹", insert: "acos(", tone: "fn" },
  { label: "tan⁻¹", insert: "atan(", tone: "fn" },
  { label: "x²", insert: "^2", tone: "fn" },
  { label: "xʸ", insert: "^", tone: "fn" },
  { label: "√", insert: "sqrt(", tone: "fn" },
  { label: "∛", insert: "cbrt(", tone: "fn" },
  { label: "log", insert: "log(", tone: "fn" },
  { label: "ln", insert: "ln(", tone: "fn" },
  { label: "eˣ", insert: "exp(", tone: "fn" },
  { label: "n!", insert: "!", tone: "fn" },
  { label: "1/x", insert: "1/", tone: "fn" },
  { label: "π", insert: "π", tone: "num" },
  { label: "e", insert: "e", tone: "num" },
  { label: "%", insert: "%", tone: "fn" },
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

export function CalculatorPanel() {
  const [expr, setExpr] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState(false);
  const [mode, setMode] = useState<Mode>("DEG");

  const press = (insert: string) => {
    setError(false);
    const isOperator = /^[+\-−×÷^%!]/.test(insert);
    if (result) {
      setExpr(isOperator ? result + insert : insert);
      setResult("");
      return;
    }
    setExpr((e) => e + insert);
  };

  const equals = () => {
    try {
      setResult(String(evaluate(expr, mode)));
      setError(false);
    } catch {
      setError(true);
    }
  };

  const openParens = (expr.match(/\(/g) ?? []).length - (expr.match(/\)/g) ?? []).length;

  return (
    <div className="space-y-3">
      <div className="min-h-16 break-all rounded-2xl bg-white px-4 py-3 text-right font-mono">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <button type="button" onClick={() => setMode((m) => (m === "DEG" ? "RAD" : "DEG"))} className="rounded-md bg-stone-100 px-2 py-0.5 font-bold text-stone-700">{mode}</button>
          <span className="text-sm">{expr || "\u00a0"}</span>
        </div>
        <div className={`text-2xl font-black ${error ? "text-red-600" : ""}`}>{error ? "Սխալ" : result || "0"}</div>
      </div>
      <div className="grid grid-cols-5 gap-2">
        {SCI_KEYS.map((k) => (
          <button
            key={k.label}
            type="button"
            onClick={() => press(k.insert)}
            className={`h-11 rounded-xl border text-sm font-bold hover:bg-stone-50 ${k.tone === "fn" ? "bg-stone-50" : k.tone === "num" ? "bg-card" : "bg-blue-50 text-blue-800"}`}
          >
            {k.label}
          </button>
        ))}
        <button type="button" onClick={() => { setExpr(""); setResult(""); setError(false); }} className="h-11 rounded-xl bg-red-50 text-sm font-bold text-red-700">C</button>
        <button type="button" onClick={() => { setExpr((e) => e.slice(0, -1)); setResult(""); }} className="h-11 rounded-xl bg-stone-100 text-sm font-bold">⌫</button>
        <button type="button" onClick={() => setExpr((e) => e + ")".repeat(Math.max(0, openParens)))} className="h-11 rounded-xl bg-stone-100 text-xs font-bold">)×{Math.max(0, openParens)}</button>
        <button type="button" onClick={equals} className="col-span-2 h-11 rounded-xl bg-blue-700 text-sm font-bold text-white">=</button>
      </div>
    </div>
  );
}

type Stroke = ImageData;

export function DrawingPad() {
  const tx = useTx();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [color, setColor] = useState("#1d4ed8");
  const [eraser, setEraser] = useState(false);
  const history = useRef<Stroke[]>([]);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;
    const rect = c.getBoundingClientRect();
    c.width = Math.round(rect.width * 2);
    c.height = Math.round(rect.height * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, c.width, c.height);
  }, []);

  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const c = canvasRef.current!;
    const r = c.getBoundingClientRect();
    return { x: ((e.clientX - r.left) * c.width) / r.width, y: ((e.clientY - r.top) * c.height) / r.height };
  };

  const snapshot = () => {
    const c = canvasRef.current!;
    history.current.push(c.getContext("2d")!.getImageData(0, 0, c.width, c.height));
    if (history.current.length > 30) history.current.shift();
  };

  const onDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    snapshot();
    drawing.current = true;
    last.current = pos(e);
  };
  const onMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current || !last.current) return;
    const ctx = canvasRef.current!.getContext("2d")!;
    const p = pos(e);
    ctx.strokeStyle = eraser ? "#ffffff" : color;
    ctx.lineWidth = eraser ? 28 : 5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
  };
  const onUp = () => {
    drawing.current = false;
    last.current = null;
  };

  const undo = () => {
    const prev = history.current.pop();
    if (prev) canvasRef.current!.getContext("2d")!.putImageData(prev, 0, 0);
  };
  const clear = () => {
    const c = canvasRef.current!;
    snapshot();
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, c.width, c.height);
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {["#1d4ed8", "#dc2626", "#16a34a", "#111827"].map((c) => (
          <button
            key={c}
            type="button"
            aria-label={tx("Գույն")}
            onClick={() => { setColor(c); setEraser(false); }}
            className={`size-8 rounded-full border-2 ${color === c && !eraser ? "border-stone-900" : "border-white shadow"}`}
            style={{ background: c }}
          />
        ))}
        <button type="button" onClick={() => setEraser((v) => !v)} className={`inline-flex h-8 items-center gap-1 rounded-lg px-2 text-sm ${eraser ? "bg-stone-800 text-white" : "bg-stone-100"}`}>
          <Eraser className="size-4" /> {tx("Ջնջել")}
        </button>
        <button type="button" onClick={undo} className="inline-flex h-8 items-center gap-1 rounded-lg bg-stone-100 px-2 text-sm"><Undo2 className="size-4" /> {tx("Հետ")}</button>
        <button type="button" onClick={clear} className="inline-flex h-8 items-center gap-1 rounded-lg bg-red-50 px-2 text-sm text-red-700"><X className="size-4" /> {tx("Մաքրել")}</button>
      </div>
      <canvas
        ref={canvasRef}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerLeave={onUp}
        className="aspect-[4/3] w-full touch-none rounded-2xl border bg-white"
      />
    </div>
  );
}

/** Toolbar shown on math pages: opens a calculator or a drawing board. */
export function MathTools() {
  const tx = useTx();
  const [open, setOpen] = useState<"calc" | "draw" | "latex" | null>(null);
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => setOpen(open === "calc" ? null : "calc")} className={`inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-bold ${open === "calc" ? "bg-blue-700 text-white" : "border bg-card"}`}>
          <Calculator className="size-4" /> {tx("Հաշվիչ")}
        </button>
        <button type="button" onClick={() => setOpen(open === "draw" ? null : "draw")} className={`inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-bold ${open === "draw" ? "bg-blue-700 text-white" : "border bg-card"}`}>
          <Pencil className="size-4" /> {tx("Գրատախտակ")}
        </button>
        <button type="button" onClick={() => setOpen(open === "latex" ? null : "latex")}
          className={"inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-bold " +
            (open === "latex" ? "bg-primary text-primary-foreground" : "border bg-card")}>
          <Sigma className="size-4"/> {tx("LaTeX")}
        </button>
      </div>
      {open === "calc" && <div className="rounded-3xl border bg-card p-4 shadow-sm"><CalculatorPanel /></div>}
      {open === "draw" && <div className="rounded-3xl border bg-card p-4 shadow-sm"><DrawingPad /></div>}
      {open === "latex" && <div className="rounded-3xl border bg-card p-4 shadow-sm"><FormulaWorkbench /></div>}
    </div>
  );
}


const FORMULAS: readonly { label: string; tex: string }[] = [
  { label: "Կոտորակ", tex: "\\frac{a}{b}" },
  { label: "Քառակուսի արմատ", tex: "\\sqrt{x}" },
  { label: "Աստիճան", tex: "x^{2}" },
  { label: "Եռանկյունաչափություն", tex: "\\sin^{2} x+\\cos^{2} x=1" },
  { label: "Քառակուսային բանաձև", tex: "x=\\frac{-b\\pm\\sqrt{b^{2}-4ac}}{2a}" },
  { label: "Ինտեգրալ", tex: "\\int_{a}^{b} f(x)\\,dx" },
];
/** TeX editor is only a formula composer/preview, never executes the input. */
export function FormulaWorkbench() {
  const tx = useTx();
  const katex = useKatex();
  const [formula,setFormula] = useState("\\frac{-b\\pm\\sqrt{b^{2}-4ac}}{2a}");
  const [copied,setCopied] = useState(false);
  return <section className="space-y-4">
    <div className="flex items-center justify-between gap-3">
      <h3 className="font-black">{tx("LaTeX · Բանաձևերի խմբագիր")}</h3>
      <button type="button" className="inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm" onClick={async () => {
        try { await navigator.clipboard.writeText(formula);setCopied(true); }
        catch { setCopied(false); }
      }}>{copied ? <Check className="size-4"/> : <Copy className="size-4"/>}{tx(copied ? "Պատճենված է" : "Պատճենել")}</button>
    </div>
    <p className="text-sm text-muted-foreground">{tx("Գրիր LaTeX բանաձև և անմիջապես տես դրա մաթեմատիկական տեսքը։")}</p>
    <div className="flex flex-wrap gap-2">
      {FORMULAS.map(f => <button type="button" key={f.label} onClick={() => { setFormula(f.tex);setCopied(false); }}
        className="rounded-full border border-primary/20 bg-primary/5 px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/10">
        {tx(f.label)}
      </button>)}
    </div>
    <textarea aria-label={tx("LaTeX բանաձև")} spellCheck={false} rows={3}
      className="w-full resize-y rounded-2xl border bg-background p-3 font-mono text-sm outline-offset-2"
      value={formula} maxLength={1500} onChange={e => {setFormula(e.target.value);setCopied(false);}}/>
    <div className="min-h-24 overflow-x-auto rounded-2xl border bg-muted/30 p-4 text-center text-xl">
      {katex ? <RichText text={"$$"+formula+"$$"} katex={katex}/> : <span className="font-mono text-sm">{formula}</span>}
    </div>
    <p className="text-xs text-muted-foreground">{tx("Սա բանաձևի դիտարկիչ է, ոչ հավասարումներ լուծող հաշվիչ։")}</p>
  </section>;
}
