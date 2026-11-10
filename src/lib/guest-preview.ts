import type { Unit } from "./books";

/** Guests can preview two complete source tasks per section.
 * English reading texts and multipart Biology tasks stay intact.
 * Never mutate the source tasks or their progress identities.
 */
export const GUEST_PREVIEW_LIMIT = 2;
export function guestPreviewUnits(units: Unit[], signedIn: boolean): Unit[] {
  return signedIn ? units : units.slice(0, GUEST_PREVIEW_LIMIT);
}
