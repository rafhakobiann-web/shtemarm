import { useId } from "react";
import { useTx } from "@/lib/lang";

export type DiagramSpec =
  | { type: "function"; shape: "linear" | "quadratic" | "sine"; a: number; b: number; c: number; xmin?: number; xmax?: number; title?: string }
  | { type: "triangle"; labels?: [string, string, string]; sides?: [string, string, string]; title?: string }
  | { type: "circle"; radius?: string; title?: string };
const bounded = (v: unknown, low: number, high: number) => typeof v === "number" && Number.isFinite(v) && v >= low && v <= high;
const short = (v: unknown) => typeof v === "string" && v.length <= 50 && !/[<>]/.test(v);
export function readDiagram(source: string): DiagramSpec | null {
  try {
    if (source.length > 1800) return null;
    const d: unknown = JSON.parse(source);
    if (!d || typeof d !== "object" || Array.isArray(d)) return null;
    const x = d as Record<string, unknown>;
    if (x.title !== undefined && !short(x.title)) return null;
    if (x.type === "function") {
      if (!["linear", "quadratic", "sine"].includes(String(x.shape))) return null;
      if (![x.a, x.b, x.c].every(v => bounded(v, -25, 25))) return null;
      const xmin = x.xmin ?? -6, xmax = x.xmax ?? 6;
      if (!bounded(xmin, -30, 30) || !bounded(xmax, -30, 30) || Number(xmax) - Number(xmin) < 2) return null;
      return { type: "function", shape: x.shape as "linear" | "quadratic" | "sine",
        a: x.a as number, b: x.b as number, c: x.c as number,
        xmin: xmin as number, xmax: xmax as number, title: x.title as string | undefined };
    }
    if (x.type === "triangle") {
      if (x.labels !== undefined && (!Array.isArray(x.labels) || x.labels.length !== 3 || !x.labels.every(short))) return null;
      if (x.sides !== undefined && (!Array.isArray(x.sides) || x.sides.length !== 3 || !x.sides.every(short))) return null;
      return { type: "triangle", labels: x.labels as [string,string,string] | undefined,
        sides: x.sides as [string,string,string] | undefined, title: x.title as string | undefined };
    }
    if (x.type === "circle" && (x.radius === undefined || short(x.radius)))
      return { type: "circle", radius: x.radius as string | undefined, title: x.title as string | undefined };
    return null;
  } catch { return null; }
}
function FunctionDiagram({ spec }: { spec: Extract<DiagramSpec,{type:"function"}> }) {
  const formula = (x: number) => spec.shape === "sine"
    ? spec.a * Math.sin(spec.b * x) + spec.c
    : spec.shape === "linear" ? spec.a * x + spec.b
    : spec.a * x * x + spec.b * x + spec.c;
  const xmin = spec.xmin ?? -6, xmax = spec.xmax ?? 6;
  const samples = Array.from({ length: 141 }, (_, i) => {
    const x = xmin + i / 140 * (xmax - xmin); return [x, formula(x)] as const;
  });
  const lo = Math.min(0, ...samples.map(p => p[1])), hi = Math.max(0, ...samples.map(p => p[1]));
  const pad = Math.max(1, (hi-lo)*0.12);
  const ymin = lo-pad, ymax = hi+pad;
  const px = (x:number) => 38+(x-xmin)/(xmax-xmin)*444;
  const py = (y:number) => 292-(y-ymin)/(ymax-ymin)*258;
  const axisX = Math.max(38,Math.min(482,px(0))), axisY = Math.max(34,Math.min(292,py(0)));
  const pts = samples.map(([x,y]) => px(x).toFixed(2)+","+py(y).toFixed(2)).join(" ");
  return <svg className="block w-full" viewBox="0 0 520 325" role="img" aria-label={spec.title || "Ֆունկցիայի գրաֆիկ"}>
    {Array.from({length:9},(_,i)=><line key={"v"+i} x1={38+i*55.5} x2={38+i*55.5} y1="34" y2="292" stroke="currentColor" strokeOpacity=".075"/>)}
    {Array.from({length:7},(_,i)=><line key={"h"+i} x1="38" x2="482" y1={34+i*43} y2={34+i*43} stroke="currentColor" strokeOpacity=".075"/>)}
    <g stroke="currentColor" strokeOpacity=".45" strokeWidth="1.3"><path d={"M38 "+axisY+" H482 M"+axisX+" 34V292"}/></g>
    <polyline points={pts} fill="none" stroke="var(--primary)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
    <g fill="currentColor" fontSize="13"><text x="486" y={axisY-8}>x</text><text x={axisX+10} y="26">y</text><text x="38" y="314">{xmin}</text><text x="475" y="314">{xmax}</text></g>
  </svg>;
}
function GeometryDiagram({ spec }: { spec: Extract<DiagramSpec,{type:"triangle"|"circle"}> }) {
  if (spec.type==="circle") return <svg viewBox="0 0 520 305" role="img" aria-label={spec.title || "Շրջանագծի սխեմատիկ գծագիր"} className="block w-full">
    <circle cx="260" cy="152" r="108" stroke="var(--primary)" strokeWidth="3.5" fill="var(--primary)" fillOpacity=".035"/>
    <path d="M260 152H368" stroke="var(--primary)" strokeWidth="2" strokeDasharray="5 4"/>
    <circle cx="260" cy="152" r="4" fill="var(--primary)"/>
    <text x="250" y="171" textAnchor="end" fontSize="17" fill="currentColor">O</text>
    <text x="316" y="142" textAnchor="middle" fontSize="16" fill="currentColor">{spec.radius || "r"}</text>
  </svg>;
  const [a,b,c]=spec.labels??["A","B","C"],[ab,bc,ca]=spec.sides??["c","a","b"];
  return <svg className="block w-full" viewBox="0 0 520 305" role="img" aria-label={spec.title || "Եռանկյան սխեմատիկ գծագիր"}>
    <path d="M80 263L420 263L276 49Z" stroke="var(--primary)" strokeWidth="3" strokeLinejoin="round" fill="var(--primary)" fillOpacity=".05"/>
    <g fontSize="20" fontWeight="600" fill="currentColor"><text x="56" y="282">{a}</text><text x="431" y="282">{b}</text><text x="268" y="34">{c}</text></g>
    <g fill="var(--primary)" fontSize="17"><text x="250" y="292" textAnchor="middle">{ab}</text><text x="367" y="139">{bc}</text><text x="146" y="134">{ca}</text></g>
  </svg>;
}
/** Educational SVG with safe numeric data, no executable or AI-generated markup. */
export function MathDiagram({ spec }: { spec: DiagramSpec }) {
  const tx = useTx();
  const id=useId();
  return <figure aria-describedby={id} className="my-4 overflow-hidden rounded-3xl border border-primary/15 bg-card p-3 shadow-sm sm:p-5">
    <div className="mb-3 flex items-center justify-between gap-3 text-xs font-bold text-primary">
      <span>{tx("Գծագիր")}</span><span className="rounded-full bg-primary/10 px-3 py-1">{spec.type === "function" ? tx("Գրաֆիկ") : tx("Երկրաչափություն")}</span>
    </div>
    {spec.type === "function" ? <FunctionDiagram spec={spec}/> : <GeometryDiagram spec={spec}/>}
    <figcaption id={id} className="mt-2 text-xs leading-relaxed text-muted-foreground">
      {spec.title || (spec.type === "function" ? tx("Ֆունկցիայի գրաֆիկ՝ ըստ նշված գործակիցների") : tx("Սխեմատիկ պատկեր․ չափերը մասշտաբով չեն"))}
    </figcaption>
  </figure>;
}
