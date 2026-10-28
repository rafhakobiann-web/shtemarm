import { useSyncExternalStore } from "react";

export type Theme = "light" | "dark";
export type ColorMode = Theme | "system";
export type SurfaceTheme = "classic" | "soft" | "liquid";
export type GlassIntensity = "subtle" | "balanced" | "vivid";
export type Appearance = {
  mode: ColorMode;
  surface: SurfaceTheme;
  glass: GlassIntensity;
  blur: boolean;
};

export const APPEARANCE_KEY = "shtemarm-appearance-v2";
const LEGACY_KEY = "shtemarm-theme";
export const DEFAULT_APPEARANCE: Readonly<Appearance> = Object.freeze({
  mode: "system",
  surface: "liquid",
  glass: "balanced",
  blur: true,
});
const modes: readonly ColorMode[] = ["system", "light", "dark"];
const surfaces: readonly SurfaceTheme[] = ["classic", "soft", "liquid"];
const glasses: readonly GlassIntensity[] = ["subtle", "balanced", "vivid"];

function valid<T extends string>(value: unknown, options: readonly T[], fallback: T): T {
  return typeof value === "string" && options.includes(value as T) ? value as T : fallback;
}
export function normalizeAppearance(value: unknown, legacyMode?: unknown): Appearance {
  const data = value && typeof value === "object" && !Array.isArray(value)
    ? value as Partial<Record<keyof Appearance, unknown>> : {};
  return {
    mode: valid(data.mode, modes, valid(legacyMode, modes, DEFAULT_APPEARANCE.mode)),
    surface: valid(data.surface, surfaces, DEFAULT_APPEARANCE.surface),
    glass: valid(data.glass, glasses, DEFAULT_APPEARANCE.glass),
    blur: typeof data.blur === "boolean" ? data.blur : DEFAULT_APPEARANCE.blur,
  };
}
export function readAppearance(): Appearance {
  if (typeof window === "undefined") return { ...DEFAULT_APPEARANCE };
  try {
    return normalizeAppearance(
      JSON.parse(window.localStorage.getItem(APPEARANCE_KEY) || "null"),
      window.localStorage.getItem(LEGACY_KEY),
    );
  } catch {
    try { return normalizeAppearance(null, window.localStorage.getItem(LEGACY_KEY)); }
    catch { return { ...DEFAULT_APPEARANCE }; }
  }
}
function systemDark() {
  return typeof window !== "undefined" &&
    !!window.matchMedia?.("(prefers-color-scheme: dark)").matches;
}
export function resolvedTheme(appearance: Appearance): Theme {
  return appearance.mode === "system" ? (systemDark() ? "dark" : "light") : appearance.mode;
}
export function applyAppearance(appearance: Appearance) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.toggle("dark", resolvedTheme(appearance) === "dark");
  root.dataset.surface = appearance.surface;
  root.dataset.glass = appearance.glass;
  root.dataset.glassBlur = appearance.blur ? "on" : "off";
}

// Compatibility with existing theme controls.
export function readTheme(): Theme { return resolvedTheme(readAppearance()); }
export function applyTheme(theme: Theme) { setAppearance({ mode: theme }); }
export function saveTheme(theme: Theme) { setAppearance({ mode: theme }); }

let snapshot: Appearance = { ...DEFAULT_APPEARANCE };
const subscribers = new Set<() => void>();
function broadcast() { for (const listener of subscribers) listener(); }
function subscribe(listener: () => void) {
  subscribers.add(listener);
  return () => { subscribers.delete(listener); };
}
function getSnapshot() { return snapshot; }
function getServerSnapshot() { return DEFAULT_APPEARANCE; }
export function useAppearance(): Appearance {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
export function setAppearance(patch: Partial<Appearance>) {
  snapshot = normalizeAppearance({ ...snapshot, ...patch });
  applyAppearance(snapshot);
  try { window.localStorage.setItem(APPEARANCE_KEY, JSON.stringify(snapshot)); }
  catch { /* Theme still works for current tab. */ }
  broadcast();
}
export function resetAppearance() {
  snapshot = { ...DEFAULT_APPEARANCE };
  applyAppearance(snapshot);
  try {
    window.localStorage.removeItem(APPEARANCE_KEY);
    window.localStorage.removeItem(LEGACY_KEY);
  } catch { /* Ignore blocked storage. */ }
  broadcast();
}
export function initAppearance() {
  snapshot = readAppearance();
  applyAppearance(snapshot);
  broadcast();
  const media = window.matchMedia?.("(prefers-color-scheme: dark)");
  const onMediaChange = () => {
    if (snapshot.mode !== "system") return;
    applyAppearance(snapshot);
    snapshot = { ...snapshot };
    broadcast();
  };
  const onStorage = (event: StorageEvent) => {
    if (event.key !== APPEARANCE_KEY && event.key !== LEGACY_KEY) return;
    snapshot = readAppearance();
    applyAppearance(snapshot);
    broadcast();
  };
  media?.addEventListener?.("change", onMediaChange);
  window.addEventListener("storage", onStorage);
  return () => {
    media?.removeEventListener?.("change", onMediaChange);
    window.removeEventListener("storage", onStorage);
  };
}

// This function is serialized as a script and runs synchronously before first paint.
// It uses a fixed allowlist, not arbitrary stored CSS values.
function startupAppearance() {
  try {
    const v = JSON.parse(localStorage.getItem("shtemarm-appearance-v2") || "null") || {};
    const legacy = localStorage.getItem("shtemarm-theme");
    const mode = ["light", "dark", "system"].includes(v.mode)
      ? v.mode : (["light", "dark"].includes(legacy) ? legacy : "system");
    const surface = ["classic", "soft", "liquid"].includes(v.surface) ? v.surface : "liquid";
    const glass = ["subtle", "balanced", "vivid"].includes(v.glass) ? v.glass : "balanced";
    const dark = mode === "dark" ||
      (mode === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
    const root = document.documentElement;
    root.classList.toggle("dark", dark);
    root.dataset.surface = surface;
    root.dataset.glass = glass;
    root.dataset.glassBlur = v.blur === false ? "off" : "on";
  } catch { /* No stored theme: use CSS defaults. */ }
}
export const THEME_INIT_SCRIPT = "(" + startupAppearance.toString() + ")();";
