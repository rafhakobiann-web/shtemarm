/** Review intervals are suggestions, not verified mastery scores. No network or personal identifiers. */
export type RevisionItem = { attempts: number; updatedAt: number; mastered: boolean };
export const REVISION_INTERVALS_DAYS = [1, 3, 7, 14] as const;

/** Restored progress snapshots often have updatedAt: 0: the old system did
 * not record a real date. A 1970 date or a Unix timestamp in seconds is not a
 * genuine Shtemarm study timestamp (the app stores milliseconds). */
const MIN_VALID_STUDY_TIMESTAMP = Date.UTC(2000, 0, 1);
function hasKnownStudyDate(timestamp: number): boolean {
  return Number.isFinite(timestamp) && timestamp >= MIN_VALID_STUDY_TIMESTAMP;
}

export function nextRevisionAt(item: RevisionItem): number | null {
  if (item.mastered || !hasKnownStudyDate(item.updatedAt)) return null;
  const attempts = Number.isFinite(item.attempts) ? Math.max(1, Math.floor(item.attempts)) : 1;
  const index = Math.min(attempts - 1, REVISION_INTERVALS_DAYS.length - 1);
  return item.updatedAt + REVISION_INTERVALS_DAYS[index] * 86_400_000;
}

export function isRevisionDue(item: RevisionItem, now: number): boolean {
  if (item.mastered) return false;
  const due = nextRevisionAt(item);
  // Unknown dates are ready to review now, not falsely scheduled in 1970.
  return due === null || now >= due;
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
