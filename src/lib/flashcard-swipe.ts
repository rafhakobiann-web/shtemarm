/**
 * Pure gesture decision for flashcard actions. A horizontal card swipe must
 * be intentional; ordinary taps and vertical reading gestures do nothing.
 * Product mapping: LEFT = "I know" and RIGHT = "Review later".
 */
export type FlashcardSwipeOutcome = "known" | "review" | null;

export function flashcardSwipeOutcome(
  dx: number,
  dy: number,
  hadHorizontalDrag: boolean,
): FlashcardSwipeOutcome {
  if (!hadHorizontalDrag || !Number.isFinite(dx) || !Number.isFinite(dy)) return null;
  if (Math.abs(dx) < 85 || Math.abs(dx) <= Math.abs(dy) * 1.25) return null;
  return dx < 0 ? "known" : "review";
}
