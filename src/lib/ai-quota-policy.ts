/** Pure AI budget policy helpers; safe to test without server, keys, or DB. */
export type AiQuotaReason = "quota" | "unavailable";
export type AiLanguage = "hy" | "en" | "ru";

export function aiQuotaLimit(input: string | undefined, defaultValue: number, maximum = 100000): number {
  if (!input || !/^[1-9]\d*$/.test(input)) return defaultValue;
  const n = Number(input);
  return Number.isSafeInteger(n) && n <= maximum ? n : defaultValue;
}

export function quotaMessage(reason: AiQuotaReason, lang: AiLanguage = "hy"): string {
  const labels = {
    hy: {
      quota: "ԱԲ հարցումների սահմանաչափը լրացել է։ Օգտվիր պատրաստի բացատրություններից կամ փորձիր ավելի ուշ։",
      unavailable: "ԱԲ հարցումների անվտանգ սահմանափակման ծառայությունը ժամանակավորապես հասանելի չէ։ Փորձիր ավելի ուշ։",
    },
    en: {
      quota: "The AI usage limit has been reached. Try saved explanations or come back later.",
      unavailable: "The AI usage protection service is temporarily unavailable. Please try later.",
    },
    ru: {
      quota: "Лимит запросов к ИИ исчерпан. Используй сохранённые объяснения или попробуй позже.",
      unavailable: "Сервис контроля запросов к ИИ временно недоступен. Попробуй позже.",
    },
  } as const;
  return labels[lang][reason];
}
