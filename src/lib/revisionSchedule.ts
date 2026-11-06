/** Review intervals are suggestions, not verified mastery scores. No network or personal identifiers. */
export type RevisionItem = { attempts: number; updatedAt: number; mastered: boolean };
export const REVISION_INTERVALS_DAYS = [1, 3, 7, 14] as const;
export function nextRevisionAt(item: RevisionItem): number | null {
  if (item.mastered) return null;
  const attempts = Number.isFinite(item.attempts) ? Math.max(1, Math.floor(item.attempts)) : 1;
  const index = Math.min(attempts - 1, REVISION_INTERVALS_DAYS.length - 1);
  const timestamp = Number.isFinite(item.updatedAt) ? item.updatedAt : 0;
  return timestamp + REVISION_INTERVALS_DAYS[index] * 86_400_000;
}
export function isRevisionDue(item: RevisionItem, now: number): boolean {
  const due = nextRevisionAt(item);
  return due !== null && now >= due;
}
export function summarizeRevision<T extends RevisionItem & { subject: string }>(items: T[], now: number) {
  const pending = items.filter(item => !item.mastered);
  const due = pending.filter(item => isRevisionDue(item, now));
  const bySubject = Object.entries(pending.reduce<Record<string, number>>((counts, item) => {
    counts[item.subject] = (counts[item.subject] ?? 0) + 1;
    return counts;
  }, {})).sort((a,b) => b[1] - a[1]);
  return { pending: pending.length, due: due.length, mastered: items.length - pending.length, bySubject };
}
