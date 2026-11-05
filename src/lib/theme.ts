import { useSyncExternalStore } from "react";
import { applyAccent, readSavedAccent, DISPLAY_PREFERENCES_KEY } from "@/lib/accent";

export type Theme = "light" | "dark";
export type ColorMode = Theme | "system";
export type SurfaceTheme = "classic" | "soft";
export type GlassIntensity = "adaptive" | "subtle" | "balanced" | "vivid";
export type GlassQuality = "lite" | "balanced" | "rich";
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
  surface: "soft",
  glass: "adaptive",
  blur: true,
});
const modes: readonly ColorMode[] = ["system", "light", "dark"];
const surfaces: readonly SurfaceTheme[] = ["classic", "soft"];
const glasses: readonly GlassIntensity[] = ["adaptive", "subtle", "balanced", "vivid"];

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
// Conservative, capability-aware rendering: never test GPU benchmarks or block navigation.
// Unknown hardware receives balanced glass; reduced-transparency always takes priority.
export function detectGlassQuality(): GlassQuality {
  if (typeof window === "undefined" || typeof navigator === "undefined") return "balanced";
  const device = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean; effectiveType?: string };
  };
  if (window.matchMedia?.("(prefers-reduced-transparency: reduce)").matches ||
      device.connection?.saveData ||
      (device.deviceMemory !== undefined && device.deviceMemory <= 4) ||
      (device.hardwareConcurrency !== undefined && device.hardwareConcurrency <= 4)) return "lite";
  if ((device.deviceMemory ?? 0) >= 8 && (device.hardwareConcurrency ?? 0) >= 8 &&
      window.innerWidth >= 768) return "rich";
  return "balanced";
}

export function applyAppearance(appearance: Appearance) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.toggle("dark", resolvedTheme(appearance) === "dark");
  root.dataset.surface = appearance.surface;
  root.dataset.glass = appearance.glass;
  root.dataset.glassQuality = detectGlassQuality();
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
  applyAccent(readSavedAccent());
  broadcast();
  const media = window.matchMedia?.("(prefers-color-scheme: dark)");
  const onMediaChange = () => {
    if (snapshot.mode !== "system") return;
    applyAppearance(snapshot);
    snapshot = { ...snapshot };
    broadcast();
  };
  const onStorage = (event: StorageEvent) => {
    if (event.key === DISPLAY_PREFERENCES_KEY) {
      applyAccent(readSavedAccent());
      return;
    }
    if (event.key !== APPEARANCE_KEY && event.key !== LEGACY_KEY) return;
    snapshot = readAppearance();
    applyAppearance(snapshot);
    broadcast();
  };
  const onDeviceChange = () => {
    if (snapshot.glass !== "adaptive") return;
    const next = detectGlassQuality();
    if (document.documentElement.dataset.glassQuality !== next) {
      document.documentElement.dataset.glassQuality = next;
    }
  };
  const transparency = window.matchMedia?.("(prefers-reduced-transparency: reduce)");
  media?.addEventListener?.("change", onMediaChange);
  transparency?.addEventListener?.("change", onDeviceChange);
  window.addEventListener("resize", onDeviceChange, { passive: true });
  window.addEventListener("storage", onStorage);
  return () => {
    media?.removeEventListener?.("change", onMediaChange);
    transparency?.removeEventListener?.("change", onDeviceChange);
    window.removeEventListener("resize", onDeviceChange);
    window.removeEventListener("storage", onStorage);
  };
}

// This function is serialized as a script and runs synchronously before first paint.
// It uses a fixed allowlist, not arbitrary stored CSS values.
function startupAppearance() {
  try {
    const v = JSON.parse(localStorage.getItem("shtemarm-appearance-v2") || "null") || {};
    const legacy = localStorage.getItem("shtemarm-theme") ?? "";
    const mode = ["light", "dark", "system"].includes(v.mode)
      ? v.mode : (["light", "dark"].includes(legacy) ? legacy : "system");
    const surface = ["classic", "soft"].includes(v.surface) ? v.surface : "soft";
    const glass = ["adaptive", "subtle", "balanced", "vivid"].includes(v.glass) ? v.glass : "adaptive";
    const dark = mode === "dark" ||
      (mode === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
    const root = document.documentElement;
    root.classList.toggle("dark", dark);
    root.dataset.surface = surface;
    root.dataset.glass = glass;
    const hardware = navigator as Navigator & {
      deviceMemory?: number; connection?: { saveData?: boolean };
    };
    const isLite = matchMedia("(prefers-reduced-transparency: reduce)").matches ||
      hardware.connection?.saveData ||
      (hardware.deviceMemory !== undefined && hardware.deviceMemory <= 4) ||
      (hardware.hardwareConcurrency !== undefined && hardware.hardwareConcurrency <= 4);
    const isRich = (hardware.deviceMemory ?? 0) >= 8 &&
      (hardware.hardwareConcurrency ?? 0) >= 8 && window.innerWidth >= 768;
    root.dataset.glassQuality = isLite ? "lite" : isRich ? "rich" : "balanced";
    root.dataset.glassBlur = v.blur === false ? "off" : "on";
    // Match the stored palette before hydration; values come only from this list.
    const accents: Record<string, string> = {
      blue: "#4263eb", violet: "#7139ce", emerald: "#087f60",
      rose: "#c5274c", amber: "#96620e", teal: "#0b766b"
    };
    const preferences = JSON.parse(localStorage.getItem("shtemarm-display-preferences-v1") || "null");
    const chosen = typeof preferences?.accent === "string" && Object.prototype.hasOwnProperty.call(accents, preferences.accent)
      ? preferences.accent : "teal";
    root.dataset.accent = chosen;
    root.style.setProperty("--brand-accent", accents[chosen]);
    root.style.setProperty("--primary", accents[chosen]);
    root.style.setProperty("--ring", accents[chosen]);
    root.style.setProperty("--primary-foreground", "#ffffff");
  } catch { /* No stored theme: use CSS defaults. */ }
}
export const THEME_INIT_SCRIPT = "(" + startupAppearance.toString() + ")();";
