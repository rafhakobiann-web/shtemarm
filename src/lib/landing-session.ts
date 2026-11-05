/** Public landing stays public for every session state. Only destinations change. */
export type LandingSession = "loading" | "signed-in" | "signed-out" | "unavailable";
export type LandingDestination = "/auth" | "/dashboard";

export function landingDestination(status: LandingSession): LandingDestination {
  return status === "signed-in" ? "/dashboard" : "/auth";
}

export function landingActionLabel(lang: "hy" | "en" | "ru", status: LandingSession): string {
  if (status === "signed-in") {
    return { hy: "Անցնել իմ վահանակ", en: "Go to my dashboard", ru: "Перейти в мой кабинет" }[lang];
  }
  return { hy: "Սկսել սովորել", en: "Start learning", ru: "Начать обучение" }[lang];
}
