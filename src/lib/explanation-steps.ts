export type ExplanationBlock = {
  kind: "text" | "diagram" | "code";
  value: string;
};
export type ExplanationStep = ExplanationBlock;

/** Finds English, Armenian, Russian and plain numbered steps.
 * A decimal or a LaTeX formula is never treated as a heading.
 */
const STEP_START = /^\s*(?:#{1,3}\s*)?(?:\*\*\s*)?(?:(?:step|քայլ|шаг)\s+)?\d{1,2}[.)]\s+/i;

/** Keep supporting prose, formulas and blank-line paragraphs within the same
 * numbered step; do not create extra pages just because the AI used spacing.
 * Separate diagram/code blocks remain visible and are never executed.
 */
export function buildExplanationSteps(blocks: readonly ExplanationBlock[]): ExplanationStep[] {
  const steps: ExplanationStep[] = [];
  let activeNumbered = false;
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
      const value = current.join("\n").trim();
      if (!value) return;
      const previous = steps.at(-1);
      if (activeNumbered && previous?.kind === "text") previous.value += "\n\n" + value;
      else add("text", value);
      current = [];
    };
    for (const line of block.value.replace(/\r\n?/g, "\n").split("\n")) {
      const trimmed = line.trim();
      if (!trimmed) {
        if (!activeNumbered) flush();
        else if (current.length) current.push("");
        continue;
      }
      if (STEP_START.test(trimmed)) {
        flush();
        activeNumbered = true;
        // Force each real step boundary into its own navigable page.
        add("text", trimmed.replace(STEP_START, ""));
      } else current.push(line);
    }
    flush();
  }
  return steps;
}
