/** Browser-only personal notes for one study section. Never touches answer progress. */
export const SCRATCHPAD_MAX_LENGTH = 2500;
const PREFIX = "shtemarm:study-scratchpad:v1";

export function scratchpadKey(bookId: string, sectionId: string): string {
  if (!/^[1-9][0-9]*$/.test(bookId) || !/^[1-9][0-9]*$/.test(sectionId)) {
    throw new Error("Invalid book or section identifier");
  }
  return `${PREFIX}:${bookId}:${sectionId}`;
}

export function sanitizeScratchpad(value: unknown): string {
  return typeof value === "string" ? value.slice(0, SCRATCHPAD_MAX_LENGTH) : "";
}

type ScratchpadStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

function browserStorage(): ScratchpadStorage | null {
  try {
    return typeof window !== "undefined" ? window.localStorage : null;
  } catch {
    return null;
  }
}

export function readScratchpad(key: string, storage: ScratchpadStorage | null = browserStorage()): string {
  try {
    return sanitizeScratchpad(storage?.getItem(key));
  } catch {
    return "";
  }
}

export function writeScratchpad(key: string, value: string, storage: ScratchpadStorage | null = browserStorage()): boolean {
  try {
    if (!storage) return false;
    const safe = sanitizeScratchpad(value);
    if (safe) storage.setItem(key, safe);
    else storage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}
