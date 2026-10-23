import { useEffect, useRef, useState } from "react";
import { Calculator, Eraser, Pencil, Undo2, X } from "lucide-react";
import { useTx } from "@/lib/lang";

/* ---------- safe arithmetic evaluator (no eval) ---------- */
function evaluate(src: string): number {
  const s = src
    .replace(/÷/g, "/")
    .replace(/×/g, "*")
    .replace(/−/g, "-")
    .replace(/π/g, "pi")
    .replace(/√/g, "sqrt")
    .replace(/\s+/g, "");
  let i = 0;
  const peek = () => s[i];
  function expr(): number {
    let v = term();
    while (peek() === "+" || peek() === "-") {
      const op = s[i++];
      const r = term();
      v = op === "+" ? v + r : v - r;
    }
    return v;
  }
  function term(): number {
    let v = power();
    while (peek() === "*" || peek() === "/") {
      const op = s[i++];
      const r = power();
      v = op === "*" ? v * r : v / r;
    }
    return v;
  }
  function power(): number {
    const base = unary();
    if (peek() === "^") {
      i++;
      return Math.pow(base, power());
    }
    return base;
  }
  function unary(): number {
    if (peek() === "-") {
      i++;
      return -unary();
    }
    return primary();
  }
  function primary(): number {
    if (s.startsWith("sqrt", i)) {
      i += 4;
      if (peek() === "(") {
        i++;
        const v = expr();
        expect(")");
        return Math.sqrt(v);
      }
      return Math.sqrt(primary());
    }
    if (s.startsWith("pi", i)) {
      i += 2;
      return Math.PI;
    }
    if (peek() === "(") {
      i++;
      const v = expr();
      expect(")");
      return v;
    }
    const m = /^\d+(\.\d+)?/.exec(s.slice(i));
    if (!m) throw new Error("syntax");
    i += m[0].length;
    return parseFloat(m[0]);
  }
  function expect(ch: string) {
    if (s[i] !== ch) throw new Error("syntax");
    i++;
  }
  const v = expr();
  if (i !== s.length) throw new Error("syntax");
  if (!Number.isFinite(v)) throw new Error("math");
  return Math.round(v * 1e12) / 1e12;
}

const KEYS = ["7", "8", "9", "÷", "4", "5", "6", "×", "1", "2", "3", "−", "0", ".", "(", ")", "+", "^", "√", "π"];

export function CalculatorPanel() {
  const tx = useTx();
  const [expr, setExpr] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState(false);

  const press = (k: string) => {
    setError(false);
    if (result && !"+−×÷^".includes(k)) {
      setExpr(k === "√" || k === "π" || k === "(" ? k : k);
      setResult("");
      return;
    }
    setResult("");
    setExpr((e) => e + k);
  };

  const equals = () => {
    try {
      const v = evaluate(expr);
      setResult(String(v));
      setError(false);
    } catch {
      setError(true);
    }
  };

  return (
    <div className="space-y-3">
      <div className="min-h-16 break-all rounded-2xl bg-white px-4 py-3 text-right font-mono text-lg">
        <div className="text-sm text-muted-foreground">{expr || "\u00a0"}</div>
        <div className={`text-2xl font-black ${error ? "text-red-600" : ""}`}>{error ? tx("Սխալ") : result || "0"}</div>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {KEYS.map((k) => (
          <button key={k} type="button" onClick={() => press(k)} className="h-12 rounded-xl border bg-card text-lg font-bold hover:bg-stone-50">
            {k}
          </button>
        ))}
        <button type="button" onClick={() => { setExpr(""); setResult(""); setError(false); }} className="h-12 rounded-xl bg-red-50 font-bold text-red-700">C</button>
        <button type="button" onClick={() => { setExpr((e) => e.slice(0, -1)); setResult(""); }} className="h-12 rounded-xl bg-stone-100 font-bold">⌫</button>
        <button type="button" onClick={equals} className="col-span-2 h-12 rounded-xl bg-blue-700 font-bold text-white">=</button>
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
  const [open, setOpen] = useState<"calc" | "draw" | null>(null);
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button type="button" onClick={() => setOpen(open === "calc" ? null : "calc")} className={`inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-bold ${open === "calc" ? "bg-blue-700 text-white" : "border bg-card"}`}>
          <Calculator className="size-4" /> {tx("Հաշվիչ")}
        </button>
        <button type="button" onClick={() => setOpen(open === "draw" ? null : "draw")} className={`inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-bold ${open === "draw" ? "bg-blue-700 text-white" : "border bg-card"}`}>
          <Pencil className="size-4" /> {tx("Գրատախտակ")}
        </button>
      </div>
      {open === "calc" && <div className="rounded-3xl border bg-card p-4 shadow-sm"><CalculatorPanel /></div>}
      {open === "draw" && <div className="rounded-3xl border bg-card p-4 shadow-sm"><DrawingPad /></div>}
    </div>
  );
}
