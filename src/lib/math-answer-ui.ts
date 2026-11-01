/**
 * In a math exam, a selected answer is only a draft. It must stay editable
 * and its correctness must remain hidden until the whole exam is submitted.
 * Study/game mode continues to reveal and lock each answer immediately.
 */
export function isMathAnswerRevealed(
  value: string | undefined,
  locked: boolean,
  editableUntilLocked: boolean,
): boolean {
  return editableUntilLocked ? locked : value !== undefined;
}

export function canChangeMathAnswer(
  value: string | undefined,
  locked: boolean,
  editableUntilLocked: boolean,
): boolean {
  return !locked && (editableUntilLocked || value === undefined);
}
