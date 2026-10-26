// Source graph anchor points and extrema, transcribed from the six book diagrams.
// Curves interpolate the source anchors; they do not assert an analytic formula.
type Point = [number, number];
type Plot = {
  range: [number, number, number, number]; points: Point[]; slopes: number[];
  xticks: number[]; yticks: number[]; guides: Point[]; yLabel?: string;
};
export const MATH_SOURCE_PLOTS: Record<string, Plot> = {
  "194-688": { range: [-7.8, 4.8, -3.8, 6.6], points: [[-7,-3],[-6,-2],[-5,0],[-4,3],[-2,5],[0,3],[2,0],[3,2]], slopes: [.6,1.3,2.5,2.1,0,-1.6,0,3.5], xticks: [-7,-6,-5,-4,-3,-2,-1,1,2,3], yticks: [-3,-2,-1,1,2,3,4,5], guides: [[-7,-3],[-6,-2],[-4,3],[-2,5],[3,2]] },
  "203-704": { range: [-3.9, 8, -5.6, 4], points: [[-3,-1],[-2,0],[0,-3],[2,-5],[4,-3],[5,0],[6,2],[7,3]], slopes: [1.5,0,-1.8,0,1.8,2.5,1.5,.7], xticks: [-3,-2,-1,1,2,3,4,5,6,7], yticks: [-5,-4,-3,-2,-1,1,2,3], guides: [[-3,-1],[2,-5],[4,-3],[6,2],[7,3]] },
  "284-961": { range: [-5.8, 7, -3.8, 6.6], points: [[-5,3],[-4,0],[-3,-3],[-2,0],[0,3],[2.5,5],[5,0]], slopes: [-3,-4,0,3,1.2,0,-4], xticks: [-5,-4,-3,-2,-1,1,2.5,5], yticks: [-3,-2,-1,1,2,3,4,5], guides: [[-5,3],[-3,-3],[2.5,5]] },
  "285-966": { range: [-5.8, 6, -2.5, 6.6], points: [[-5,3],[-4,0],[-2,-1.75],[0,-1],[1,0],[3,5],[4,4]], slopes: [-4,-1.8,0,.5,1.3,0,-1.5], xticks: [-5,-4,-2,1,3,4], yticks: [-1,5], guides: [[-5,3],[-2,-1.75],[3,5],[4,4]], yLabel: "f′(x)" },
  "289-981": { range: [-1.9, 7.8, -2.5, 4.8], points: [[0,2],[6,-1]], slopes: [-.5,-.5], xticks: [1,2,3,4,5,6], yticks: [-2,-1,1,2,3], guides: [[6,-1]] },
  "290-985": { range: [-6, 4.8, -2.6, 5], points: [[-5,-2],[0,3]], slopes: [1,1], xticks: [-5,-4,-3,-2,-1], yticks: [-2,-1,1,2,3], guides: [[-5,-2]] },
};

export function MathSourceDiagram({ id, x, y, width, height }: { id: string; x: number; y: number; width: number; height: number }) {
  const p = MATH_SOURCE_PLOTS[id];
  if (!p) return null;
  const [xmin,xmax,ymin,ymax] = p.range;
  const X = (v: number) => 8 + (v-xmin)/(xmax-xmin)*404;
  const Y = (v: number) => 292 - (v-ymin)/(ymax-ymin)*284;
  const label = (v: number) => String(v).replace(".", ",").replace("-", "−");
  let path = "";
  p.points.forEach(([a,b], i) => {
    if (!i) { path = `M${X(a)},${Y(b)}`; return; }
    const prev = p.points[i-1]!;
    const h = (a-prev[0])/3;
    path += `C${X(prev[0]+h)},${Y(prev[1]+h*p.slopes[i-1]!)},${X(a-h)},${Y(b-h*p.slopes[i]!)},${X(a)},${Y(b)}`;
  });
  return <svg x={x} y={y} width={width} height={height} viewBox="0 0 420 300" aria-label="Գրքի գրաֆիկը" role="img">
    <g fill="none" stroke="currentColor" strokeWidth="1.1">
      <path d={`M8,${Y(0)}H412M${X(0)},292V8`} />
      <path d={`M406,${Y(0)-2}L412,${Y(0)}L406,${Y(0)+2}ZM${X(0)-2},14L${X(0)},8L${X(0)+2},14Z`} fill="currentColor" />
      {p.guides.map(([a,b],i) => <path key={i} d={`M${X(a)},${Y(0)}V${Y(b)}H${X(0)}`} strokeDasharray="3 3" strokeWidth=".6" />)}
      <path d={path} strokeWidth="1.4" />
    </g>
    <g fontFamily="serif" fontSize="15" fill="currentColor">
      <text x="407" y={Y(0)-7} fontStyle="italic">x</text>
      <text x={X(0)-9} y="14" textAnchor="end" fontStyle="italic">{p.yLabel ?? "y"}</text>
      <text x={X(0)+3} y={Y(0)+13}>0</text>
      {p.xticks.map(v => <g key={v}><circle cx={X(v)} cy={Y(0)} r="1.5" /><text x={X(v)} y={Y(0)+13} textAnchor="middle">{label(v)}</text></g>)}
      {p.yticks.map(v => <g key={v}><circle cx={X(0)} cy={Y(v)} r="1.5" /><text x={X(0)+4} y={Y(v)+4}>{label(v)}</text></g>)}
      {p.points.map(([a,b],i) => <circle key={i} cx={X(a)} cy={Y(b)} r="1.8" />)}
    </g>
  </svg>;
}
