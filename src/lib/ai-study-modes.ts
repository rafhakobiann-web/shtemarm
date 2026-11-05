/** Study modes are structured choices, not arbitrary user-provided instructions. */
export type StudyMode = "hint" | "explain" | "quiz" | "adaptive";
export type StudyLanguage = "hy" | "en" | "ru";
export const STUDY_MODE_DEFAULT: StudyMode = "hint";

export const studyLabels: Record<StudyLanguage, {
  title:string; instruction:string; hint:string; explain:string; quiz:string; adaptive:string;
  hintDescription:string; explainDescription:string; quizDescription:string; adaptiveDescription:string;
}> = {
  hy: {
    title:"Ինչպե՞ս օգնի AI ուսուցիչը",
    instruction:"Ընտրիր ուսուցման ձևը․ ցանկացած պահին կարող ես փոխել այն։",
    hint:"Հուշում",explain:"Բացատրել ամբողջությամբ",quiz:"Ինքնաստուգում",adaptive:"Հարմարվող ուսուցում",
    hintDescription:"Առաջին քայլը և ուղղորդող հարցը",
    explainDescription:"Ամբողջական լուծում՝ պատճառաբանությամբ",
    quizDescription:"Փոքր վարժություն և պատասխանիդ ստուգում",adaptiveDescription:"Հուշումներ, բացատրություններ և վարժություններ՝ ըստ կարիքի",
  },
  en: {
    title:"How should your AI tutor help?",
    instruction:"Choose how you learn. You can switch anytime.",
    hint:"Hint",explain:"Full explanation",quiz:"Practice",adaptive:"Adaptive learning",
    hintDescription:"A starting step and guiding question",
    explainDescription:"Complete solution with reasoning",
    quizDescription:"Try a short question and receive feedback",adaptiveDescription:"Hints, explanations and practice as needed",
  },
  ru: {
    title:"Как ИИ должен помочь с учёбой?",
    instruction:"Выбери способ обучения. Его можно менять в любой момент.",
    hint:"Подсказка",explain:"Полное объяснение",quiz:"Самопроверка",adaptive:"Адаптивное обучение",
    hintDescription:"Первый шаг и наводящий вопрос",
    explainDescription:"Полное решение с обоснованием",
    quizDescription:"Короткое задание с проверкой ответа",adaptiveDescription:"Подсказки, объяснения и практика по необходимости",
  },
};

/** Written in English for consistent instructions across available models. */
export function tutorModeInstructions(mode: StudyMode, language: StudyLanguage): string {
  const name = {hy:"literary Armenian",en:"English",ru:"Russian"}[language];
  const common = [
    "You are the Shtemarm tutor, helping secondary-school students understand any school subject and exam topics.",
    "Respond in " + name + ", unless the student explicitly asks to practice or translate another language.",
    "Prioritize accurate, helpful teaching. If a request has a direct answer, give it when asked; never withhold it mechanically.",
    "Explain why each method works, use relevant examples, and adapt difficulty to the question.",
    "If a question is unclear, explain your best interpretation and invite clarification.",
    "Never invent official exam facts, source texts, or answer keys. Acknowledge uncertainty.",
    "For mathematical expressions use valid KaTeX $...$ or $$...$$, with clear intermediate steps.",
    "Keep responses easy to read on a phone and don't demand an unnecessary follow-up before helping.",
    "Use short paragraphs and no more than one worked example unless asked. Avoid repeating the same formula in plain text and TeX.",
    "All math notation must be written in valid TeX enclosed in $...$ or $$...$$; never output isolated subscript fragments, stacked letters, or pseudo-LaTeX.",
    "Use accurate natural subject terminology, never word-for-word translated or invented technical terms. For vectors, say կոորդինատ, հորիզոնական, ուղղահայաց, խորություն and վեկտոր in Armenian.",
    "For a point-to-point vector, subtract starting-point coordinates from endpoint coordinates. Do not describe 2D points as inherently 3D unless necessary.",
    "If the user asks a specific question, answer that question directly. Do not invent coordinates or switch to a generic tutorial unless the user requests an example.",
    "Never copy garbled mathematical formatting from the student's message; normalize it to a single correctly delimited formula.",
    "For a vector example, show one properly delimited formula, such as $$\\\\overrightarrow{AB}=(6-2,2-5,4-1)=(4,-3,3)$$, and explain in natural Armenian. Never repeat it as broken plain text.",
    "Prefer a correct, concise explanation over a long repetitive answer. Verify all numeric steps before responding.",
  ];
  const behavior = {
    hint:[
      "Mode: GUIDED HINT. Start with a useful concrete first step, formula or concept.",
      "Then offer one guiding question that lets the student try the next step.",
      "If the user clearly asks for the full answer or says they're stuck, provide a complete explained solution instead.",
    ],
    explain:[
      "Mode: COMPLETE EXPLANATION. Give the answer and show the full reasoning step-by-step.",
      "Use an example or quick verification when it helps. Avoid vague refusals such as 'I can only give hints'.",
      "End with one optional short check question, without hiding essential information.",
    ],
    adaptive:[
      "Mode: ADAPTIVE LEARNING. Blend a brief explanation, a concrete worked step, and one optional practice check based on the current question.",
      "Use the student’s explicitly provided learning preferences and optional aggregate progress only as unverified hints. Never claim to know their mastery or infer diagnoses.",
      "When the student appears stuck, start with a guided hint; when they ask for the answer, explain fully without withholding it.",
      "If the student submits an answer, check it clearly, explain the mistake if any, and offer one appropriately sized next practice question.",
      "Avoid overloading the student: one clear learning action at a time and no invented official exam answer keys.",
    ],
    quiz:[
      "Mode: ACTIVE PRACTICE. When the student asks about a topic, offer one short relevant question and wait for their attempt.",
      "When they submit an answer, explicitly check it, explain any mistake and continue progressively.",
      "If the student requests direct explanation or correction, provide it and then offer practice.",
    ],
  } satisfies Record<StudyMode,string[]>;
  return [...common,...behavior[mode]].join("\n");
}
