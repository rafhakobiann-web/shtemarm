import { useSyncExternalStore } from "react";
import { DICT } from "@/i18n";

export type Lang = "hy" | "en";

const KEY = "shtemarm-lang";

let current: Lang = "hy";
const listeners = new Set<() => void>();

function readStored(): Lang {
  try {
    const v = window.localStorage.getItem(KEY);
    if (v === "hy" || v === "en") return v;
  } catch {
    // storage unavailable (private window, blocked site data)
  }
  return "hy";
}

/** Call once on the client after mount to load the saved language. */
export function initLang() {
  current = readStored();
  document.documentElement.lang = current;
  listeners.forEach((f) => f());
}

export function setLang(next: Lang) {
  current = next;
  try {
    window.localStorage.setItem(KEY, next);
  } catch {
    // ignore: the choice then lasts for this page only
  }
  document.documentElement.lang = next;
  listeners.forEach((f) => f());
}

function subscribe(f: () => void) {
  listeners.add(f);
  return () => listeners.delete(f);
}

export function useLang(): Lang {
  return useSyncExternalStore(subscribe, () => current, () => "hy");
}

export const MENU_TEXT = {
  hy: {
    menu: "Մենյու",
    subjects: "Առարկաներ",
    english: "Անգլերեն",
    math: "Մաթեմատիկա",
    armenianLang: "Հայոց լեզու",
    biology: "Կենսաբանություն",
    history: "Հայոց պատմություն",
    soon: "Շուտով",
    about: "Մեր մասին",
    chat: "Չատբոտ",
    account: "Մուտք / Հաշիվ",
    language: "Լեզու",
    darkMode: "Մութ ռեժիմ",
    streak: "Օրեր անընդմեջ",
    points: "Միավորներ",
    level: "Մակարդակ",
    openMenu: "Բացել մենյուն",
    home: "Գլխավոր էջ",
  },
  en: {
    menu: "Menu",
    subjects: "Subjects",
    english: "English",
    math: "Mathematics",
    armenianLang: "Armenian language",
    biology: "Biology",
    history: "Armenian history",
    soon: "Soon",
    about: "About us",
    chat: "AI chatbot",
    account: "Sign in / Account",
    language: "Language",
    darkMode: "Dark mode",
    streak: "Days in a row",
    points: "Points",
    level: "Level",
    openMenu: "Open menu",
    home: "Home",
  },
} as const;

export function useT() {
  return MENU_TEXT[useLang()];
}

/**
 * Translate one UI string. The Armenian text is the key; in English mode it is
 * looked up in DICT and falls back to the Armenian when no entry exists.
 * Placeholders like {n} are filled from vars in both languages.
 */
export function translate(lang: Lang, hy: string, vars?: Record<string, string | number>): string {
  const base = lang === "en" ? (DICT[hy] ?? hy) : hy;
  if (!vars) return base;
  return base.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
}

/** Hook: returns tx(hyText, vars?) bound to the current language. */
export function useTx() {
  const lang = useLang();
  return (hy: string, vars?: Record<string, string | number>) => translate(lang, hy, vars);
}
