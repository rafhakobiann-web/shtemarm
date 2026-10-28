export type Mistake = {
  id: string; subject: string; section: string; prompt: string;
  options: string[]; chosen: number; correct: number; explanation: string;
  attempts: number; updatedAt: number; mastered: boolean;
};
const KEY = "shtemarm:mistakes:v1";
export function getMistakes(): Mistake[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(parsed) ? parsed.filter((item): item is Mistake =>
      !!item && typeof item.id === "string" && Array.isArray(item.options) &&
      typeof item.correct === "number" && typeof item.prompt === "string") : [];
  } catch { return []; }
}
function save(items: Mistake[]) {
  try { localStorage.setItem(KEY, JSON.stringify(items.slice(0, 1000))); window.dispatchEvent(new Event("shtemarm:mistakes-changed")); } catch { /* storage unavailable */ }
}
export function recordMistake(item: Omit<Mistake, "attempts" | "updatedAt" | "mastered">) {
  const items = getMistakes();
  const index = items.findIndex(m => m.id === item.id && m.subject === item.subject);
  const previous = index >= 0 ? items[index] : undefined;
  const entry: Mistake = { ...item, attempts: (previous?.attempts ?? 0) + 1, updatedAt: Date.now(), mastered: false };
  if (index >= 0) items.splice(index, 1);
  save([entry, ...items]);
}
export function markMistakeMastered(id: string, subject: string) {
  save(getMistakes().map(m => m.id === id && m.subject === subject ? { ...m, mastered: true } : m));
}
export function removeMistake(id: string, subject: string) {
  save(getMistakes().filter(m => !(m.id === id && m.subject === subject)));
}
