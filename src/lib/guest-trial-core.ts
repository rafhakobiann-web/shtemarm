/**
 * Pure rules for the signed-out answer trial. No React or Supabase imports, so
 * the counting logic can be tested in isolation.
 *
 * Signed-out visitors may check this many answers per book section before the
 * sign-up prompt appears. The counter is a per-browser convenience, not a
 * security boundary: clearing site data resets it, and server-side AI quotas
 * remain the protection for paid requests.
 */
export const GUEST_TRIAL_LIMIT = 2;

export type GuestTrialCounts = Record<string, number>;

export function sectionTrialKey(bookId: string, sectionId: string) {
  return `${bookId}:${sectionId}`;
}

/** Returns a new count map with one more answer, capped at the limit. */
export function recordGuestAnswer(counts: GuestTrialCounts, key: string): GuestTrialCounts {
  return { ...counts, [key]: Math.min(GUEST_TRIAL_LIMIT, (counts[key] ?? 0) + 1) };
}

/** True once a section's guest allowance is used up. */
export function isGuestTrialExhausted(counts: GuestTrialCounts, key: string) {
  return (counts[key] ?? 0) >= GUEST_TRIAL_LIMIT;
}

/** Drops anything that is not a non-negative safe integer, so tampered storage is ignored. */
export function sanitizeGuestTrial(raw: unknown): GuestTrialCounts {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const clean: GuestTrialCounts = {};
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === "number" && Number.isSafeInteger(value) && value >= 0) {
      clean[key] = Math.min(GUEST_TRIAL_LIMIT, value);
    }
  }
  return clean;
}
