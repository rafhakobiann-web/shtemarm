export type Theme = "light" | "dark";

const KEY = "shtemarm-theme";

export function readTheme(): Theme {
  try {
    const v = window.localStorage.getItem(KEY);
    if (v === "light" || v === "dark") return v;
  } catch {
    // storage unavailable (private window, blocked site data)
  }
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function applyTheme(t: Theme) {
  document.documentElement.classList.toggle("dark", t === "dark");
}

export function saveTheme(t: Theme) {
  try {
    window.localStorage.setItem(KEY, t);
  } catch {
    // ignore: the theme still applies for this page view
  }
}

// Runs before first paint so the page never flashes the wrong theme.
export const THEME_INIT_SCRIPT = `(function(){try{var v=localStorage.getItem("${KEY}");var d=(v==="dark"||v==="light")?v==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;if(d)document.documentElement.classList.add("dark");}catch(e){}})();`;
