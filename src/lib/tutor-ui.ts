/** Product copy stays localized without translating the student's source text. */
export const tutorUi = {
  hy: {
    title: "AI ուսուցիչ", description: "Հասկացիր թեման, լուծիր քայլերով և ստուգիր գիտելիքներդ։",
    newChat: "Նոր զրույց", retry: "Կրկին փորձել",
    starters: ["Բացատրիր՝ ինչպես լուծել 3x + 5 = 14 հավասարումը։", "Ե՞րբ օգտագործել Present Perfect ժամանակաձևը։", "Ստուգիր իմ գիտելիքները բջջի կառուցվածքից։"],
  },
  en: {
    title: "AI teacher", description: "Understand the topic, work through each step and check what you have learned.",
    newChat: "New conversation", retry: "Try again",
    starters: ["Explain how to solve 3x + 5 = 14.", "When should I use the Present Perfect tense?", "Quiz me on the structure of a cell."],
  },
  ru: {
    title: "ИИ-учитель", description: "Разберись в теме, решай по шагам и проверяй знания.",
    newChat: "Новый разговор", retry: "Попробовать снова",
    starters: ["Объясни, как решить уравнение 3x + 5 = 14.", "Когда используется Present Perfect?", "Проверь мои знания о строении клетки."],
  },
} as const;
