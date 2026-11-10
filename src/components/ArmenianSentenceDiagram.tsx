import type { SentenceDiagram } from "@/lib/books";

/** Accessible, responsive rendering for the circle-and-connector sentence charts
 * printed in Armenian GTC Volume I, Syntax questions 89–98. */
export function ArmenianSentenceDiagram({ graph, label }: { graph: SentenceDiagram; label: string }) {
  const positions = new Map(graph.nodes.map(([id, x, y]) => [id, { x: 26 + x * 54, y: 26 + y * 58 }]));
  const maxX = Math.max(0, ...graph.nodes.map(([, x]) => x));
  const maxY = Math.max(0, ...graph.nodes.map(([, , y]) => y));
  const width = 52 + maxX * 54;
  const height = 52 + maxY * 58;
  return (
    <svg role="img" aria-label={label} viewBox={`0 0 ${width} ${height}`}
      width={width} height={height} className="h-auto max-w-full text-foreground">
      {graph.branches.map(([from, to], index) => {
        const a = positions.get(from);
        const b = positions.get(to);
        return a && b ? <line key={`b-${index}`} x1={a.x} y1={a.y} x2={b.x} y2={b.y}
          stroke="currentColor" strokeWidth="1.8" /> : null;
      })}
      {graph.equals.map(([from, to], index) => {
        const a = positions.get(from);
        const b = positions.get(to);
        return a && b ? <g key={`e-${index}`}>
          <rect x={(a.x + b.x) / 2 - 11} y={(a.y + b.y) / 2 - 13} width="22" height="26"
            rx="3" fill="white" />
          <text x={(a.x + b.x) / 2} y={(a.y + b.y) / 2 + 6}
            fontSize="19" textAnchor="middle" fill="#111827">=</text>
        </g> : null;
      })}
      {graph.nodes.map(([id]) => {
        const p = positions.get(id)!;
        return <g key={id}>
          <circle cx={p.x} cy={p.y} r="18" stroke="#111827" strokeWidth="1.7" fill="white" />
          <text x={p.x} y={p.y + 5} textAnchor="middle" fontSize="15"
            fontWeight="600" fill="#111827">{id}</text>
        </g>;
      })}
    </svg>
  );
}
