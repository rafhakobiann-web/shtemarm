import { useId } from "react";
import { useTx } from "@/lib/lang";

export type DiagramSpec =
  | { type: "function"; shape: "linear" | "quadratic" | "sine"; a: number; b: number; c: number; xmin?: number; xmax?: number; title?: string }
  | { type: "triangle"; labels?: [string, string, string]; sides?: [string, string, string]; title?: string }
  | { type: "circle"; radius?: string; title?: string }
  | { type: "right-triangle"; legA: string; legB: string; hypotenuse?: string; title?: string }
  | { type: "triangle-height"; base: string; height: string; title?: string }
  | { type: "vectors"; ax: number; ay: number; bx: number; by: number; title?: string }
  | { type: "solid"; shape: "cylinder" | "cone"; radius: number; height: number; title?: string };
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
    if (x.type === "right-triangle" && short(x.legA) && short(x.legB) && (x.hypotenuse === undefined || short(x.hypotenuse)))
      return { type:"right-triangle",legA:x.legA as string,legB:x.legB as string,
        hypotenuse:x.hypotenuse as string | undefined,title:x.title as string | undefined };
    if (x.type === "triangle-height" && short(x.base) && short(x.height))
      return {type:"triangle-height",base:x.base as string,height:x.height as string,title:x.title as string | undefined};
    if (x.type === "vectors" && [x.ax,x.ay,x.bx,x.by].every(n=>bounded(n,-12,12)))
      return { type:"vectors",ax:x.ax as number,ay:x.ay as number,bx:x.bx as number,by:x.by as number,title:x.title as string | undefined };
    if (x.type === "solid" && (x.shape === "cylinder" || x.shape === "cone") &&
        bounded(x.radius,0.1,20) && bounded(x.height,0.1,30))
      return { type:"solid",shape:x.shape,radius:x.radius as number,height:x.height as number,title:x.title as string | undefined };
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

/** Schematic right-angle construction. Numeric labels belong to the worked example, not book scans. */
function RightTriangleDiagram({spec}:{spec:Extract<DiagramSpec,{type:"right-triangle"}>}) {
  return <svg className="block w-full" viewBox="0 0 520 315" role="img" aria-label={spec.title || "Ուղղանկյուն եռանկյուն"}>
    <path d="M112 258H405L112 62Z" fill="var(--primary)" fillOpacity=".05" stroke="var(--primary)" strokeWidth="3"/>
    <path d="M112 226H144V258" fill="none" stroke="currentColor" strokeWidth="2"/>
    <g fontSize="18" fill="currentColor"><text x="245" y="286" textAnchor="middle">{spec.legA}</text>
      <text x="85" y="162" textAnchor="middle">{spec.legB}</text>
      <text x="286" y="135" textAnchor="middle">{spec.hypotenuse || "c"}</text></g>
    <g fontSize="13" fill="currentColor"><text x="94" y="278">A</text><text x="411" y="272">B</text><text x="95" y="52">C</text></g>
  </svg>;
}
function TriangleHeightDiagram({spec}:{spec:Extract<DiagramSpec,{type:"triangle-height"}>}) {
  return <svg viewBox="0 0 520 315" role="img" className="block w-full" aria-label={spec.title || "Եռանկյան հիմք և բարձրություն"}>
    <path d="M75 262L449 262L251 56Z" stroke="var(--primary)" strokeWidth="3" fill="var(--primary)" fillOpacity=".05"/>
    <path d="M251 56V262" stroke="currentColor" strokeDasharray="6 5" strokeWidth="2"/>
    <path d="M251 241H272V262" stroke="currentColor" fill="none" strokeWidth="1.6"/>
    <g fontSize="18" fill="currentColor"><text x="260" y="292" textAnchor="middle">{spec.base}</text>
      <text x="265" y="151">{spec.height}</text></g>
    <g fill="currentColor" fontSize="14"><text x="56" y="276">A</text><text x="455" y="275">B</text>
      <text x="248" y="42">C</text><text x="258" y="278">H</text></g>
  </svg>;
}
function VectorDiagram({spec}:{spec:Extract<DiagramSpec,{type:"vectors"}>}) {
  const id=useId();
  const pts=[[0,0],[spec.ax,spec.ay],[spec.ax+spec.bx,spec.ay+spec.by]];
  const xVals=[...pts.map(p=>p[0]),spec.bx], yVals=[...pts.map(p=>p[1]),spec.by];
  const maxX=Math.max(2,...xVals.map(Math.abs)), maxY=Math.max(2,...yVals.map(Math.abs));
  const scale=Math.min(168/maxX,110/maxY,35);
  const xy=(x:number,y:number)=>[260+x*scale,160-y*scale] as const;
  const [ox,oy]=xy(0,0),[ax,ay]=xy(spec.ax,spec.ay),[sx,sy]=xy(spec.ax+spec.bx,spec.ay+spec.by);
  return <svg viewBox="0 0 520 325" className="block w-full" role="img" aria-label={spec.title || "Վեկտորների գումարման գծագիր"}>
    <defs><marker id={id} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0 0L6 3L0 6" fill="none" stroke="context-stroke" strokeWidth="1.4"/></marker></defs>
    <g stroke="currentColor" strokeOpacity=".2"><path d="M38 160H482 M260 25V300"/></g>
    <g fill="none" strokeWidth="3.2" strokeLinecap="round" markerEnd={`url(#${id})`}>
      <line x1={ox} y1={oy} x2={ax} y2={ay} stroke="var(--primary)"/>
      <line x1={ax} y1={ay} x2={sx} y2={sy} stroke="#c07832"/>
      <line x1={ox} y1={oy} x2={sx} y2={sy} stroke="#29917b" strokeDasharray="6 4"/>
    </g>
    <g fill="currentColor" fontSize="16" fontWeight="600">
      <text x={ax+8} y={ay-8}>a</text><text x={sx+9} y={sy+15}>a+b</text><text x="268" y="177">O</text>
      <text x="485" y="155">x</text><text x="269" y="24">y</text>
      <text x={Math.max(35,Math.min(455,(ax+sx)/2+8))} y={(ay+sy)/2-10}>b</text>
    </g>
  </svg>;
}
function SolidDiagram({spec}:{spec:Extract<DiagramSpec,{type:"solid"}>}) {
  const cylinder=spec.shape==="cylinder";
  return <svg viewBox="0 0 520 315" className="block w-full" role="img" aria-label={spec.title || "Մարմնի ծավալի սխեմատիկ գծագիր"}>
    {cylinder
      ? <g stroke="var(--primary)" strokeWidth="2.8" fill="var(--primary)" fillOpacity=".05">
          <path d="M140 80V240C140 274 380 274 380 240V80"/>
          <ellipse cx="260" cy="80" rx="120" ry="33"/>
          <path d="M140 240C140 207 380 207 380 240" strokeDasharray="5 6" fill="none"/>
          <path d="M140 240C140 273 380 273 380 240" fill="none"/>
        </g>
      : <g stroke="var(--primary)" strokeWidth="2.8" fill="var(--primary)" fillOpacity=".05">
          <path d="M260 36L140 244Q260 310 380 244Z"/>
          <ellipse cx="260" cy="244" rx="120" ry="33"/>
        </g>}
    <g stroke="currentColor" strokeWidth="1.8" strokeDasharray="5 4" fill="none">
      <path d={cylinder?"M260 80V240":"M260 36V244"}/>
      <path d="M260 244H380"/>
    </g>
    <g fontSize="17" fontWeight="600" fill="currentColor">
      <text x="273" y="164">h = {spec.height}</text>
      <text x="303" y="234">r = {spec.radius}</text>
    </g>
  </svg>;
}
/** Educational SVG with safe numeric data, no executable or AI-generated markup. */
export function MathDiagram({ spec }: { spec: DiagramSpec }) {
  const tx = useTx();
  const id=useId();
  return <figure aria-describedby={id} className="my-4 overflow-hidden rounded-3xl border border-primary/15 bg-card p-3 shadow-sm sm:p-5">
    <div className="mb-3 flex items-center justify-between gap-3 text-xs font-bold text-primary">
      <span>{tx("Գծագիր")}</span><span className="rounded-full bg-primary/10 px-3 py-1">{spec.type === "function" ? tx("Գրաֆիկ") : spec.type === "vectors" ? tx("Վեկտորներ") : tx("Երկրաչափություն")}</span>
    </div>
    {spec.type === "function" ? <FunctionDiagram spec={spec}/>
      : spec.type === "right-triangle" ? <RightTriangleDiagram spec={spec}/>
      : spec.type === "triangle-height" ? <TriangleHeightDiagram spec={spec}/>
      : spec.type === "vectors" ? <VectorDiagram spec={spec}/>
      : spec.type === "solid" ? <SolidDiagram spec={spec}/>
      : <GeometryDiagram spec={spec}/>}
    <figcaption id={id} className="mt-2 text-xs leading-relaxed text-muted-foreground">
      {spec.title || (spec.type === "function" ? tx("Ֆունկցիայի գրաֆիկ՝ ըստ նշված գործակիցների") : tx("Սխեմատիկ պատկեր․ չափերը մասշտաբով չեն"))}
    </figcaption>
  </figure>;
}
