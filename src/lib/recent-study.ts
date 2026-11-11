/** A local navigation shortcut. This does not record answers or change student progress. */
export const RECENT_STUDY_KEY = "shtemarm:recent-study:v1";
export const RECENT_STUDY_EVENT = "shtemarm:recent-study-changed";

export type RecentStudy = Readonly<{
  bookId: string;
  sectionId: string;
  title: string;
  mode: "game" | "classic";
}>;

const validId = (value: unknown): value is string =>
  typeof value === "string" && /^[1-9][0-9]{0,8}$/.test(value) && Number.isSafeInteger(Number(value));

export function normalizeRecentStudy(value: unknown): RecentStudy | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const data = value as Record<string, unknown>;
  if (!validId(data.bookId) || !validId(data.sectionId)) return null;
  if (data.mode !== "game" && data.mode !== "classic") return null;
  if (typeof data.title !== "string") return null;
  const title = data.title.trim().slice(0, 100);
  if (!title) return null;
  return { bookId: data.bookId, sectionId: data.sectionId, title, mode: data.mode };
}

type ReadStorage = Pick<Storage, "getItem">;
type WriteStorage = Pick<Storage, "setItem">;

function browserStorage(): Storage | null {
  try { return typeof window === "undefined" ? null : window.localStorage; }
  catch { return null; }
}

export function readRecentStudy(storage: ReadStorage | null = browserStorage()): RecentStudy | null {
  try {
    const raw = storage?.getItem(RECENT_STUDY_KEY);
    return raw ? normalizeRecentStudy(JSON.parse(raw)) : null;
  } catch { return null; }
}

export function saveRecentStudy(value: RecentStudy, storage: WriteStorage | null = browserStorage()): boolean {
  const safe = normalizeRecentStudy(value);
  if (!safe || !storage) return false;
  try {
    storage.setItem(RECENT_STUDY_KEY, JSON.stringify(safe));
    if (typeof window !== "undefined") window.dispatchEvent(new Event(RECENT_STUDY_EVENT));
    return true;
  } catch { return false; }
}
