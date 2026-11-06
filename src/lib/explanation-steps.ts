export type ExplanationBlock = {
  kind: "text" | "diagram" | "code";
  value: string;
};
export type ExplanationStep = ExplanationBlock;

/** Recognizes "1. ...", "Step 1. ...", "Քայլ 1. ..." and "Шаг 1. ...".
 * Numbered lines become separate pages, even when the model omits blank lines.
 * Maths such as 1.25 or LaTeX commands are not mistaken for step boundaries.
 */
const STEP_START = /^\s*(?:#{1,3}\s*)?(?:\*\*\s*)?(?:(?:step|քայլ|шаг)\s+)?\d{1,2}[.)]\s+/i;

/** Split human-readable paragraphs into pages without discarding unnumbered
 * introduction, formula lines, diagrams or code fences. Pure and locale-agnostic.
 */
export function buildExplanationSteps(blocks: readonly ExplanationBlock[]): ExplanationStep[] {
  const steps: ExplanationStep[] = [];
  const add = (kind: ExplanationBlock["kind"], value: string) => {
    const trimmed = value.trim();
    if (trimmed) steps.push({ kind, value: trimmed });
  };

  for (const block of blocks) {
    if (block.kind !== "text") {
      add(block.kind, block.value);
      continue;
    }
    let current: string[] = [];
    const flush = () => {
      add("text", current.join("\n"));
      current = [];
    };
    for (const line of block.value.replace(/\r\n?/g, "\n").split("\n")) {
      const trimmed = line.trim();
      if (!trimmed) {
        flush();
        continue;
      }
      const numbered = STEP_START.test(trimmed);
      if (numbered) flush();
      current.push(numbered ? trimmed.replace(STEP_START, "") : line);
    }
    flush();
  }
  return steps;
}
