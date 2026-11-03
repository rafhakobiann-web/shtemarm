// One allowlisted accent palette, shared by the public HTML shell and signed-in controls.
// A color preference must never inject arbitrary CSS through storage.
export const ACCENT_SWATCHES = [
  { id: "blue", label: "Blue", color: "#4263eb" },
  { id: "violet", label: "Violet", color: "#7139ce" },
  { id: "emerald", label: "Emerald", color: "#087f60" },
  { id: "rose", label: "Rose", color: "#c5274c" },
  { id: "amber", label: "Amber", color: "#96620e" },
  { id: "teal", label: "Academy teal", color: "#0b766b" },
] as const;

export type Accent = (typeof ACCENT_SWATCHES)[number]["id"];
export const DEFAULT_ACCENT: Accent = "teal";
export const DISPLAY_PREFERENCES_KEY = "shtemarm-display-preferences-v1";

export function normalizeAccent(value: unknown): Accent {
  return ACCENT_SWATCHES.find((option) => option.id === value)?.id ?? DEFAULT_ACCENT;
}
export function readSavedAccent(): Accent {
  if (typeof window === "undefined") return DEFAULT_ACCENT;
  try {
    const prefs = JSON.parse(window.localStorage.getItem(DISPLAY_PREFERENCES_KEY) || "null");
    return normalizeAccent(prefs?.accent);
  } catch { return DEFAULT_ACCENT; }
}
export function applyAccent(value: Accent) {
  if (typeof document === "undefined") return;
  const selected = ACCENT_SWATCHES.find((option) => option.id === value) ?? ACCENT_SWATCHES[5];
  const root = document.documentElement;
  root.dataset.accent = selected.id;
  root.style.setProperty("--brand-accent", selected.color);
  root.style.setProperty("--primary", selected.color);
  root.style.setProperty("--ring", selected.color);
  root.style.setProperty("--primary-foreground", "#ffffff");
}
export function chooseAccent(value: Accent) {
  const accent = normalizeAccent(value);
  applyAccent(accent);
  if (typeof window === "undefined") return;
  try {
    const previous = JSON.parse(window.localStorage.getItem(DISPLAY_PREFERENCES_KEY) || "null");
    const safe = previous && typeof previous === "object" && !Array.isArray(previous) ? previous : {};
    window.localStorage.setItem(DISPLAY_PREFERENCES_KEY, JSON.stringify({ ...safe, accent }));
  } catch { /* The swatch remains selected in the current document. */ }
}
