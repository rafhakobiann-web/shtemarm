import { GRAMMAR_FOUNDATION } from "./grammarTopicsFoundation";
import { GRAMMAR_ADVANCED } from "./grammarTopicsAdvanced";
import { GRAMMAR_SKILLS } from "./grammarTopicsSkills";
import type { GrammarTopic, GrammarLanguage } from "./grammarHandbookTypes";
export type { GrammarTopic, GrammarLanguage } from "./grammarHandbookTypes";
export const GRAMMAR_TOPICS: readonly GrammarTopic[] = [...GRAMMAR_FOUNDATION, ...GRAMMAR_ADVANCED, ...GRAMMAR_SKILLS];
export type SectionGuide = {
 section:number; title:Record<GrammarLanguage,string>;
 description:Record<GrammarLanguage,string>; topicIds:string[];
};
/** Based on the instructions of the actual 13 sections shared by English books 1, 2 and 3.
 * These are pedagogical topic suggestions, not one-to-one question-to-rule claims.
 */
export const GRAMMAR_SECTION_GUIDES: readonly SectionGuide[] = [
  {
    "section": 1,
    "title": {
      "hy": "Ընթերցանություն և տեքստի ընկալում",
      "en": "Reading comprehension",
      "ru": "Чтение и понимание текста"
    },
    "description": {
      "hy": "Հիմնական գաղափար, տեքստում փաստերի որոնում, եզրակացություններ, դերանվանական հղումներ և համատեքստով բառերի իմաստ։",
      "en": "Main idea, locating evidence, inference, pronoun reference and context vocabulary.",
      "ru": "Главная мысль, поиск подтверждений, выводы, местоименные отсылки и слова в контексте."
    },
    "topicIds": [
      "reading-main",
      "reading-details",
      "reading-inference",
      "reading-reference",
      "vocabulary-context"
    ]
  },
  {
    "section": 2,
    "title": {
      "hy": "Ժամանակաձևեր և ճիշտ տարբերակ",
      "en": "Tenses and choosing the right form",
      "ru": "Времена и выбор правильной формы"
    },
    "description": {
      "hy": "Ընտրիր ճիշտ ժամանակաձևը ըստ ժամանակային հուշումների և գործողությունների հերթականության։ 3-րդ գրքում բաժինը հատուկ նվիրված է ժամանակաձևերին։",
      "en": "Choose tenses from time markers and event order. In Book 3 the section explicitly tests tense forms.",
      "ru": "Выбирайте время по указателям и последовательности событий. В книге 3 раздел специально посвящён временам."
    },
    "topicIds": [
      "present-simple",
      "present-continuous",
      "past-simple",
      "past-continuous",
      "present-perfect",
      "past-perfect",
      "present-perfect-continuous",
      "future-forms"
    ]
  },
  {
    "section": 3,
    "title": {
      "hy": "Խառը քերականություն և լեզվի կիրառում",
      "en": "Mixed grammar and use of English",
      "ru": "Смешанная грамматика и употребление"
    },
    "description": {
      "hy": "Տարբեր թեմաների հարցեր․ ուշադրություն դարձրու համատեքստին, խոսքի մասերին, նախդիրներին և կառուցվածքին։",
      "en": "Mixed constructions: use the sentence context, word classes, prepositions, and grammar patterns.",
      "ru": "Смешанные конструкции: учитывайте контекст, часть речи, предлоги и структуру."
    },
    "topicIds": [
      "articles",
      "subject-verb",
      "modals",
      "quantifiers",
      "second-conditional",
      "gerund-infinitive",
      "dependent-prepositions",
      "vocabulary-context"
    ]
  },
  {
    "section": 4,
    "title": {
      "hy": "Բառակազմություն և խոսքի մասեր",
      "en": "Word formation and parts of speech",
      "ru": "Словообразование и части речи"
    },
    "description": {
      "hy": "Բացթողման տեղում որոշիր՝ անհրաժեշտ է գոյական, բայ, ածական թե մակբայ, ապա ստուգիր ձևափոխությունն ու համատեքստը։",
      "en": "Identify the needed noun, verb, adjective or adverb before choosing a form.",
      "ru": "Определите необходимую часть речи — существительное, глагол, прилагательное или наречие."
    },
    "topicIds": [
      "word-formation",
      "articles",
      "quantifiers",
      "comparison",
      "collocations"
    ]
  },
  {
    "section": 5,
    "title": {
      "hy": "Քերականական կառույցների ընտրություն",
      "en": "Choosing grammar constructions",
      "ru": "Выбор грамматических конструкций"
    },
    "description": {
      "hy": "Ընտրիր խոսքի իմաստին համապատասխանող կապակցիչ, նախդիր, պայմանական ձև կամ քերականական կառուցվածք։",
      "en": "Choose the connector, preposition, conditional form or structure that fits the sentence.",
      "ru": "Выбирайте союзы, предлоги, условные формы и конструкции по смыслу."
    },
    "topicIds": [
      "linking-words",
      "zero-first-conditional",
      "second-conditional",
      "third-conditional",
      "wish-if-only",
      "prepositions",
      "modals",
      "gerund-infinitive"
    ]
  },
  {
    "section": 6,
    "title": {
      "hy": "Նախադասությունների փոխակերպում",
      "en": "Sentence transformations",
      "ru": "Преобразование предложений"
    },
    "description": {
      "hy": "Պահպանիր սկզբնական նախադասության իմաստը՝ փոխելով ուղիղ/անուղղակի խոսքը, պայմանական ձևը, սեռը կամ կառուցվածքը։",
      "en": "Preserve the original meaning when transforming direct/reported speech, passives, conditionals, and other forms.",
      "ru": "Сохраняйте исходный смысл при преобразовании прямой речи, пассива, условных и других конструкций."
    },
    "topicIds": [
      "reported-speech",
      "indirect-questions",
      "passive",
      "second-conditional",
      "third-conditional",
      "wish-if-only",
      "causative"
    ]
  },
  {
    "section": 7,
    "title": {
      "hy": "Բացթողումներ և բառի ճիշտ ընտրություն",
      "en": "Gap filling and word choice",
      "ru": "Пропуски и выбор слов"
    },
    "description": {
      "hy": "Նախադասության հոլովումը և ամբողջ պարբերության իմաստը պետք է համապատասխանեն ընտրված բառին։ Որոշ տարբերակներ ավելորդ են։",
      "en": "Fit each word into the grammar and meaning of the whole passage; some given options are distractors.",
      "ru": "Подбирайте слова с учётом грамматики и смысла всего текста; некоторые варианты лишние."
    },
    "topicIds": [
      "cloze-context",
      "vocabulary-context",
      "collocations",
      "linking-words",
      "phrasal-verbs"
    ]
  },
  {
    "section": 8,
    "title": {
      "hy": "Հարցական նախադասություններ",
      "en": "Questions and question tags",
      "ru": "Вопросы и разделительные вопросы"
    },
    "description": {
      "hy": "Ստուգիր օժանդակ բայի տեղը, հարցական բառերի կարգը, անուղղակի հարցերը և պոչիկ հարցերի համաձայնությունը։",
      "en": "Check auxiliary inversion, wh-word order, indirect questions and question tags.",
      "ru": "Проверяйте порядок вспомогательного глагола, косвенные вопросы и разделительные вопросы."
    },
    "topicIds": [
      "questions",
      "indirect-questions",
      "question-tags",
      "inversion",
      "to-be"
    ]
  },
  {
    "section": 9,
    "title": {
      "hy": "Նախդիրներ և մակբայներ",
      "en": "Prepositions and adverbs",
      "ru": "Предлоги и наречия"
    },
    "description": {
      "hy": "Նախդիրներն ընտրիր կայուն կապակցություններով ու համատեքստով։ Մի սովորիր դրանք միայն մեկուսացված թարգմանությամբ։",
      "en": "Use context and fixed word combinations to choose prepositions and adverbs.",
      "ru": "Выбирайте предлоги и наречия по контексту и устойчивым сочетаниям."
    },
    "topicIds": [
      "prepositions",
      "dependent-prepositions",
      "phrasal-verbs",
      "cloze-context"
    ]
  },
  {
    "section": 10,
    "title": {
      "hy": "Ավելորդ բառերի հայտնաբերում",
      "en": "Finding redundant words",
      "ru": "Поиск лишних слов"
    },
    "description": {
      "hy": "Որոնիր ավելորդ օժանդակ բայ, դերանուն, նախդիր կամ կրկնակի համեմատական ձև՝ առանց ճիշտ կառուցվածքը խախտելու։",
      "en": "Identify redundant auxiliaries, pronouns, prepositions, or double comparatives without breaking correct grammar.",
      "ru": "Находите лишние вспомогательные глаголы, местоимения, предлоги и двойные сравнения."
    },
    "topicIds": [
      "redundant-words",
      "comparison",
      "subject-verb",
      "articles",
      "questions"
    ]
  },
  {
    "section": 11,
    "title": {
      "hy": "Կրավորական սեռ",
      "en": "Passive voice",
      "ru": "Страдательный залог"
    },
    "description": {
      "hy": "Որոշիր ժամանակաձևը և ստուգիր be + V3 կառուցվածքը, ինչպես նաև արդյոք նախադասությունն իսկապես կրավորական է։",
      "en": "Check the tense of be + V3 and distinguish genuine passive constructions from other sentence types.",
      "ru": "Проверьте время конструкции be + V3 и отличайте настоящий пассив от других форм."
    },
    "topicIds": [
      "passive",
      "present-perfect",
      "past-simple",
      "subject-verb"
    ]
  },
  {
    "section": 12,
    "title": {
      "hy": "Բառերի և սահմանումների համապատասխանեցում",
      "en": "Matching words with definitions",
      "ru": "Соответствие слов и определений"
    },
    "description": {
      "hy": "Սահմանումները համեմատիր բառերի հիմնական իմաստի և խոսքի մասի հետ։ Սա հիմնականում բառապաշարի առաջադրանք է։",
      "en": "Match meanings and word classes; this section tests vocabulary more than grammar.",
      "ru": "Сопоставляйте значение и часть речи; раздел в основном проверяет лексику."
    },
    "topicIds": [
      "matching-definitions",
      "vocabulary-context",
      "word-formation",
      "collocations"
    ]
  },
  {
    "section": 13,
    "title": {
      "hy": "Նախադասության մասերի համապատասխանեցում",
      "en": "Matching sentence halves",
      "ru": "Соединение частей предложений"
    },
    "description": {
      "hy": "Ընտրիր քերականորեն և իմաստով համատեղելի շարունակությունը՝ հետևելով կապակցիչներին ու պայմանական կառուցվածքներին։",
      "en": "Match halves by both grammatical form and meaning, especially links and conditionals.",
      "ru": "Сопоставляйте части по грамматике и смыслу, особенно союзы и условные конструкции."
    },
    "topicIds": [
      "sentence-matching",
      "linking-words",
      "zero-first-conditional",
      "second-conditional",
      "third-conditional",
      "relative-clauses"
    ]
  }
];
export function getGrammarTopic(id:string):GrammarTopic|undefined {
 return GRAMMAR_TOPICS.find(topic=>topic.id===id);
}
export function getSectionGuide(section:number):SectionGuide|undefined {
 return GRAMMAR_SECTION_GUIDES.find(guide=>guide.section===section);
}
export function getSectionTopics(section:number):GrammarTopic[] {
 const guide = getSectionGuide(section);
 if (!guide) return [];
 const ids = new Set(guide.topicIds);
 return GRAMMAR_TOPICS.filter(topic=>ids.has(topic.id));
}
/** Match only explicit phrases in explanations. Never invent a rule for unrelated reading/vocabulary items. */
export function matchGrammarTopic(skill:string, explanation:string):GrammarTopic|undefined {
 if (skill !== "grammar" && skill !== "use-of-english") return undefined;
 const source = explanation.toLowerCase();
 const patterns: readonly [RegExp,string][] = [
  [/\b(be used to|used to.*gerund)\b/,"used-to"],
  [/\bthird conditional\b/,"third-conditional"],
  [/\bsecond conditional\b|\bif.clause\b/,"second-conditional"],
  [/\bfirst conditional\b/,"zero-first-conditional"],
  [/\bpresent perfect continuous\b/,"present-perfect-continuous"],
  [/\bpast perfect\b/,"past-perfect"],
  [/\bpresent perfect\b/,"present-perfect"],
  [/\bpast continuous\b/,"past-continuous"],
  [/\bpast simple\b|\bfinished event yesterday\b/,"past-simple"],
  [/\bpresent continuous\b/,"present-continuous"],
  [/\bpresent simple\b|\bthird.person singular\b|\bbase verb with\b/,"present-simple"],
  [/\b(question tag|tag question)\b/,"question-tags"],
  [/\bindirect question\b/,"indirect-questions"],
  [/\bpassive\b|\bwere \+ past participle\b/,"passive"],
  [/\bmodal\b|\bmust.*obligation\b|\bcan.*base form\b/,"modals"],
  [/\bcomparative\b|\bsuperlative\b|\bcheaper\b/,"comparison"],
  [/\buncountable\b/,"countable-uncountable"],
  [/\bgerund\b|\b-infinitive\b/,"gerund-infinitive"],
  [/\bvowel sound\b|\bindefinite article\b/,"articles"],
  [/\b(phrasal verb|put off means)\b/,"phrasal-verbs"],
  [/\b(are with a plural|is with he|am with i|verb to be)\b/,"to-be"],
  [/\bstarting point in time\b|\buse since\b/,"since-for"],
  [/\bquestion.*(do|does).*base verb\b/,"questions"],
  [/\badverb.*-ly\b|\bword form\b/,"word-formation"],
 ];
 const found = patterns.find(([pattern])=>pattern.test(source));
 return found ? getGrammarTopic(found[1]) : undefined;
}
