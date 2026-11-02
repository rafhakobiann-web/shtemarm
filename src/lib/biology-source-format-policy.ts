/**
 * Biology III–IV original-source review gate.
 *
 * Never infer the answer format from a PDF question's wording alone.
 * Human review must establish the printed question, printed answer key
 * and whether any original illustration can be represented without loss.
 * This policy is intentionally independent of route structure.
 */
export type BiologySourceFormat =
  | { type: "one-choice"; options: Record<string, string>; answer: string }
  | { type: "numbered-selection"; statements: string[]; correct: number[] }
  | { type: "true-false"; statements: string[]; answers: ("true" | "false")[] }
  | { type: "numeric-subtasks"; subtasks: { number: string; prompt: string; answer: string }[] }
  | { type: "unclassified" };

export type BiologyReviewEvidence = {
  volume: 3 | 4;
  chapter: number;
  printedNumber: number;
  originalPageChecked: boolean;
  wordingChecked: boolean;
  printedKeyChecked: boolean;
  includesEssentialFigure: boolean;
  /** Verified complete substitute description; not an AI-created guess. */
  equivalentTextChecked: boolean;
  format: BiologySourceFormat;
};

export type BiologyFormatReview =
  | { status: "ready"; kind: "mc" | "set" | "num"; groupedSubtasks: boolean }
  | { status: "pending"; reason: "source-unchecked" | "illustration-required" | "invalid-answer-format" | "unsupported-answer-format" };

const filled = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

/** A ready result only authorizes an import after the actual source text has been verified. */
export function reviewBiologyFormat(review: BiologyReviewEvidence): BiologyFormatReview {
  const pending = (reason: Extract<BiologyFormatReview, {status:"pending"}>["reason"]): BiologyFormatReview =>
    ({ status: "pending", reason });
  if (!(review.volume === 3 || review.volume === 4) ||
    !Number.isInteger(review.chapter) || review.chapter < 1 || review.chapter > 6 ||
    !Number.isInteger(review.printedNumber) || review.printedNumber < 1 ||
    !review.originalPageChecked || !review.wordingChecked || !review.printedKeyChecked) {
    return pending("source-unchecked");
  }
  if (review.includesEssentialFigure && !review.equivalentTextChecked)
    return pending("illustration-required");

  const answer = review.format;
  if (answer.type === "one-choice") {
    if (!/^[1-4]$/.test(answer.answer) ||
      Object.keys(answer.options).sort().join(",") !== "1,2,3,4" ||
      !Object.values(answer.options).every(filled)) return pending("invalid-answer-format");
    return { status: "ready", kind: "mc", groupedSubtasks: false };
  }

  if (answer.type === "numbered-selection") {
    const indices = new Set(answer.correct);
    if (answer.statements.length < 2 || !answer.statements.every(filled) ||
      indices.size !== answer.correct.length ||
      !answer.correct.every(n => Number.isInteger(n) && n >= 1 && n <= answer.statements.length)) {
      return pending("invalid-answer-format");
    }
    return { status: "ready", kind: "set", groupedSubtasks: false };
  }

  if (answer.type === "true-false") {
    if (answer.statements.length < 2 || !answer.statements.every(filled) ||
      answer.answers.length !== answer.statements.length ||
      !answer.answers.every(v => v === "true" || v === "false"))
      return pending("invalid-answer-format");
    // Each printed statement is independently answerable; preserve a single
    // grouped unit with 1/2 radio choices rather than inventing a set key.
    return { status: "ready", kind: "mc", groupedSubtasks: true };
  }

  if (answer.type === "numeric-subtasks") {
    const numbers = answer.subtasks.map(q => q.number);
    if (answer.subtasks.length < 2 || new Set(numbers).size !== numbers.length ||
      !answer.subtasks.every(q => filled(q.number) && filled(q.prompt) && filled(q.answer))) {
      return pending("invalid-answer-format");
    }
    return { status: "ready", kind: "num", groupedSubtasks: true };
  }
  return pending("unsupported-answer-format");
}
