export type VocabularyEntry = {
  id: string;
  word: string;
  meaning: string;
  context: string;
  createdAt: number;
};

const STORAGE_KEY = "shtemarm-vocabulary";
const CHANGE_EVENT = "shtemarm-vocabulary-change";

export function readVocabulary(): VocabularyEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]");
    if (!Array.isArray(value)) return [];
    return value.filter((item): item is VocabularyEntry =>
      !!item && typeof item.id === "string" && typeof item.word === "string" &&
      typeof item.meaning === "string" && typeof item.context === "string" &&
      typeof item.createdAt === "number"
    );
  } catch {
    return [];
  }
}

export function addVocabularyEntry(entry: Omit<VocabularyEntry, "id" | "createdAt">): boolean {
  if (typeof window === "undefined" || !entry.word.trim() || !entry.meaning.trim()) return false;
  try {
    const current = readVocabulary();
    const existing = current.find(item => item.word.toLocaleLowerCase() === entry.word.trim().toLocaleLowerCase());
    const nextEntry: VocabularyEntry = {
      id: existing?.id ?? `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      word: entry.word.trim(),
      meaning: entry.meaning.trim(),
      context: entry.context.trim(),
      createdAt: existing?.createdAt ?? Date.now(),
    };
    const next = [nextEntry, ...current.filter(item => item.id !== nextEntry.id)];
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(CHANGE_EVENT));
    return true;
  } catch {
    return false;
  }
}

export function removeVocabularyEntry(id: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(readVocabulary().filter(item => item.id !== id)));
    window.dispatchEvent(new Event(CHANGE_EVENT));
  } catch {
    // Storage can be disabled; the UI remains usable without persistence.
  }
}

export function subscribeVocabulary(callback: () => void): () => void {
  if (typeof window === "undefined") return () => undefined;
  window.addEventListener(CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}
