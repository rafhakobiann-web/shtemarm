import type { StudyMode } from "./ai-study-modes";

/** Optional browser-only preferences. Never store conversations or answer text. */
export type TutorMemory = {
  enabled: boolean;
  preferredMode: StudyMode;
  focusTopics: string[];
};
export const TUTOR_MEMORY_KEY = "shtemarm:tutor-memory:v1";
export const EMPTY_TUTOR_MEMORY: TutorMemory = { enabled: false, preferredMode: "hint", focusTopics: [] };

export function normalizeTutorMemory(value: unknown): TutorMemory {
  if (!value || typeof value !== "object" || Array.isArray(value)) return { ...EMPTY_TUTOR_MEMORY };
  const item = value as Record<string, unknown>;
  const preferredMode: StudyMode = item.preferredMode === "explain" || item.preferredMode === "quiz" ? item.preferredMode : "hint";
  const focusTopics = Array.isArray(item.focusTopics)
    ? item.focusTopics.filter((topic): topic is string => typeof topic === "string" && topic.trim().length > 0 && topic.length <= 60).slice(0, 5)
    : [];
  return { enabled: item.enabled === true, preferredMode, focusTopics };
}

export function readTutorMemory(): TutorMemory {
  if (typeof window === "undefined") return { ...EMPTY_TUTOR_MEMORY };
  try {
    const raw = window.localStorage.getItem(TUTOR_MEMORY_KEY);
    return raw ? normalizeTutorMemory(JSON.parse(raw)) : { ...EMPTY_TUTOR_MEMORY };
  } catch { return { ...EMPTY_TUTOR_MEMORY }; }
}

export function writeTutorMemory(memory: TutorMemory): void {
  if (typeof window === "undefined") return;
  try {
    if (!memory.enabled) {
      window.localStorage.removeItem(TUTOR_MEMORY_KEY);
    } else {
      window.localStorage.setItem(TUTOR_MEMORY_KEY, JSON.stringify(normalizeTutorMemory(memory)));
    }
  } catch { /* Browser storage is optional. */ }
}

export function clearTutorMemory(): void {
  if (typeof window === "undefined") return;
  try { window.localStorage.removeItem(TUTOR_MEMORY_KEY); } catch { /* Storage blocked. */ }
}
