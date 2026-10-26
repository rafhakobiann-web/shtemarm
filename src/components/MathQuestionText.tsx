import { useQuery } from "@tanstack/react-query";
import type { MathQuestion, MathTranscriptionRef } from "@/lib/math-bank";
import { useTx } from "@/lib/lang";
import { MathSourceDiagram } from "@/components/MathSourceDiagram";
import { MathContent } from "@/components/MathText";

export type NativeMathBlock = {
  width: number; height: number;
  runs: [string, number | number[], number, number, number, number | number[]][];
  paths: [string, number, boolean, boolean][];
  diagrams?: [string, number, number, number, number][];
};
type NativeTask = { stem: NativeMathBlock[]; questions: NativeMathBlock[][] };
type NativeSection = { format: number; tasks: Record<string, NativeTask> };

export function NativeMathText({ block }: { block: NativeMathBlock }) {
  const scaledWidth = Math.min(760, block.width*1.4);
  return <div className="max-w-full overflow-x-auto py-1" tabIndex={0}>
    <svg viewBox={`0 0 ${block.width} ${block.height}`} width={scaledWidth} height={block.height*scaledWidth/block.width}
      style={{ minWidth: Math.min(420, scaledWidth), maxWidth: "100%", height: "auto", display: "block" }}
      className="select-text" role="group" aria-label="Առաջադրանքի տեքստը">
      {block.paths.map(([d,w,fill,stroke],i) => <path key={`p${i}`} d={d} stroke={stroke ? "currentColor" : "none"} fill={fill ? "currentColor" : "none"} strokeWidth={w} />)}
      {block.runs.map(([text,x,y,size,flags,width],i) => <text key={`t${i}`} x={Array.isArray(x) ? x[0] : x} y={y}
        fontSize={size} fill="currentColor" fontStyle={flags & 1 ? "italic" : "normal"} fontWeight={flags & 2 ? 700 : 400}
        fontFamily={Array.isArray(x) ? "'Times New Roman', 'Liberation Serif', 'DejaVu Serif', serif" : "'Noto Serif Armenian', Sylfaen, 'DejaVu Serif', serif"}
        {...(!Array.isArray(width) && width > 0 ? { textLength: width, lengthAdjust: "spacingAndGlyphs" as const } : {})}
        xmlSpace="preserve">{Array.isArray(x) ? Array.from(text).map((c,j) => <tspan key={j} x={x[j]} textLength={Array.isArray(width) ? width[j] : undefined} lengthAdjust="spacingAndGlyphs">{c}</tspan>) : text}</text>)}
      {block.diagrams?.map(([id,x,y,width,height],i) => <MathSourceDiagram key={`d${i}`} {...{id,x,y,width,height}} />)}
    </svg>
  </div>;
}

function TranscribedQuestion({ reference, fallback }: { reference: MathTranscriptionRef; fallback: string }) {
  const tx = useTx();
  const q = useQuery({
    queryKey: ["math-transcription", reference.book, reference.section],
    queryFn: async (): Promise<NativeSection> => {
      const r = await fetch(`/data/math-transcriptions/${reference.book}/${reference.section}.json`, { signal: AbortSignal.timeout(20000) });
      if (!r.ok) throw new Error("Question text could not be loaded");
      const data: NativeSection = await r.json();
      if (data.format !== 1 || !data.tasks) throw new Error("Invalid transcription data");
      return data;
    },
    staleTime: Infinity,
  });
  const task = q.data?.tasks[String(reference.task)];
  const body = task?.questions[reference.sub-1];
  if (q.isPending) return <p role="status" className="p-3 text-sm text-muted-foreground">{tx("Բեռնվում է…")}</p>;
  if (!task || !body) return <div role="alert" className="space-y-2 rounded-xl border border-amber-500/30 bg-muted/40 p-3 text-sm">
    <p>{tx("Գրքի բնօրինակ թվայնացումը ժամանակավորապես անհասանելի է։ Տրված է պահուստային տեքստը․ անհրաժեշտության դեպքում համեմատիր բնօրինակի հետ։")}</p>
    {fallback ? <p className="whitespace-pre-line"><MathContent text={fallback}/></p> : null}
    <button type="button" className="font-semibold text-primary underline" onClick={() => void q.refetch()}>{tx("Կրկին բեռնել գրքի բնօրինակը")}</button>
  </div>;
  return <div className="space-y-3" data-transcription={`${reference.book}:${reference.section}:${reference.task}:${reference.sub}`}>
    {task.stem.length > 0 && <div className="border-b border-border/60 pb-2">{task.stem.map((block,i) => <NativeMathText key={`s${i}`} block={block} />)}</div>}
    {body.map((block,i) => <NativeMathText key={`q${i}`} block={block} />)}
  </div>;
}

export function MathQuestionText({ question }: { question: Pick<MathQuestion, "prompt" | "transcription"> }) {
  return <div className="min-w-0 rounded-xl bg-muted/40 p-3 text-[15px] leading-relaxed sm:p-4 sm:text-base">
    {question.transcription ? <TranscribedQuestion reference={question.transcription} fallback={question.prompt} /> : <p className="whitespace-pre-line"><MathContent text={question.prompt}/></p>}
  </div>;
}
