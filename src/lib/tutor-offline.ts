import type { StudyLanguage } from "./ai-study-modes";
const REPLIES = {
  hy: {
    greeting:"Բարև։ Ես Shtemarm-ի ուսումնական օգնականն եմ։ Այս պահին հասանելի է սահմանափակ տեղային օգնությունը։ Գրիր կոնկրետ թեման կամ օգտվիր պահպանված բացատրություններից։",
    sinceFor:"Since-ը սովորաբար ցույց է տալիս սկզբնակետը, իսկ for-ը՝ տևողությունը։ Օրինակ՝ I have lived here since 2020 և I have lived here for three years։ Սա ընդհանուր կանոն է․ ճիշտ կիրառությունը ստուգիր ամբողջ նախադասության համատեքստով։",
    equation:"Հավասարումը լուծելիս երկու կողմերի նկատմամբ կատարիր նույն թույլատրելի գործողությունը և վերջում ստուգիր արդյունքը սկզբնական պայմանում։ Սա ընդհանուր ուղղորդում է․ տեղային ռեժիմը չի հաշվարկում բոլոր խնդիրների լուծումները։",
    unavailable:"Այս պահին AI ծառայությունը հասանելի չէ։ Օգտվիր պահպանված բացատրություններից և ուսումնական նյութերից։ Այս տեղային պատասխանը AI-ի ստեղծած լուծում չէ։",
  },
  en: {
    greeting:"Hello! I am Shtemarm's study helper. Only limited offline guidance is available right now. Choose a specific topic or use saved explanations.",
    sinceFor:"Since usually marks a starting point, while for marks a duration: I have lived here since 2020; I have lived here for three years. This is a general rule; check the complete sentence and its context.",
    equation:"Apply the same valid operation to both sides of an equation, then substitute the result into the original condition to check it. This is general guidance; offline mode does not calculate solutions to every problem.",
    unavailable:"The AI service is unavailable. Use saved explanations and study materials. This offline reply is not an AI-generated solution.",
  },
  ru: {
    greeting:"Привет! Я учебный помощник Shtemarm. Сейчас доступна только ограниченная локальная помощь. Выбери тему или используй сохранённые объяснения.",
    sinceFor:"Since обычно обозначает начальный момент, а for — длительность: I have lived here since 2020; I have lived here for three years. Это общее правило: учитывай полное предложение и контекст.",
    equation:"Выполняй одно и то же допустимое действие с обеими частями уравнения, затем подставь результат в исходное условие. Это общий совет: локальный режим не вычисляет решения всех задач.",
    unavailable:"Сервис ИИ недоступен. Используй сохранённые объяснения и учебные материалы. Этот локальный ответ не является решением, созданным ИИ.",
  },
} as const;
/** Deliberately bounded guidance. Never presented as a generated model answer. */
export function tutorOfflineReply(question:string,locale:StudyLanguage="hy"):string {
  const text=question.trim();
  const t=REPLIES[locale];
  if (/^(hi|hello|hey|բարև|բարեւ|ողջույն|привет|здравствуй(?:те)?)[!.? ]*$/i.test(text)) return t.greeting;
  if (/\b(since|for)\b/i.test(text) && /tense|grammar|ժամանակ|քերական|врем[яе]|граммат/i.test(text)) return t.sinceFor;
  if (/\b(equation|solve)\b|հավասար|լուծել|уравнен|реши/i.test(text)) return t.equation;
  return t.unavailable;
}
