/** Read-only filters based on existing answer records; never writes to student progress. */
export type WorkbookProgressFilter = "all" | "unfinished" | "review";
export type SectionProgressStatus = Readonly<{
  total: number;
  answered: number;
  correct: number;
  needsReview: boolean;
}>;

export function sectionProgressStatus(
  answerIds: readonly string[],
  answers: Readonly<Record<string, 0 | 1>>,
): SectionProgressStatus {
  let answered = 0;
  let correct = 0;
  let needsReview = false;
  for (const id of answerIds) {
    if (!Object.prototype.hasOwnProperty.call(answers, id)) continue;
    const result = answers[id];
    if (result !== 0 && result !== 1) continue;
    answered++;
    if (result === 1) correct++;
    else needsReview = true;
  }
  return { total: answerIds.length, answered, correct, needsReview };
}

export function matchesWorkbookProgressFilter(
  status: SectionProgressStatus,
  filter: WorkbookProgressFilter,
): boolean {
  if (filter === "all") return true;
  if (filter === "unfinished") return status.total > 0 && status.answered < status.total;
  return status.needsReview;
}
