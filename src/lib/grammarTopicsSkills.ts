import type { GrammarTopic } from "./grammarHandbookTypes";
/** These reading and vocabulary guides are intentionally not labelled grammar rules. */
export const GRAMMAR_SKILLS: GrammarTopic[] = [
  {
    "id": "reading-main",
    "title": "Reading · main idea",
    "level": "A1",
    "sections": [
      1
    ],
    "category": "reading",
    "formula": "main idea = what the whole text is about",
    "correct": "The passage is mainly about the inventor's career.",
    "incorrect": "The passage is about just one detail from line 2.",
    "content": {
      "hy": {
        "summary": "Հիմնական գաղափարի հարցում պարզիր՝ ինչի մասին է ամբողջ տեքստը։ Վերնագիրը կամ ամենալայն ճիշտ ձևակերպումն ընտրիր՝ ոչ թե մեկ պարբերության մանրամասը։",
        "why": "Մի ենթադրիր, որ մեկ հիշատակված դեպքը ամբողջ տեքստի թեման է։"
      },
      "en": {
        "summary": "For main-idea questions, identify what the whole passage is about; reject options that cover only one isolated detail.",
        "why": "A fact appearing in the text is not necessarily its central topic."
      },
      "ru": {
        "summary": "В вопросе об основной мысли определите тему всего текста; отвергайте варианты, относящиеся лишь к одной детали.",
        "why": "Один факт из текста не обязательно является его главной темой."
      }
    }
  },
  {
    "id": "reading-details",
    "title": "Reading · finding evidence",
    "level": "A1",
    "sections": [
      1
    ],
    "category": "reading",
    "formula": "question → locate relevant line → compare every option",
    "correct": "The passage says the bridge had five arches.",
    "incorrect": "The bridge must have had ten arches.",
    "content": {
      "hy": {
        "summary": "Ըստ տեքստի հարցերում վերադարձիր նշված տողերին, գտիր հաստատող արտահայտությունը և տարբերակները համեմատիր դրա հետ։ «Չի նշվում» և «սխալ է» տարբեր հարցեր են։",
        "why": "Եթե տարբերակը տեքստից դուրս նոր փաստ է ավելացնում, այն մի՛ ընդունիր առանց ապացույցի։"
      },
      "en": {
        "summary": "For factual questions, locate the exact evidence and compare each option. 'Not mentioned' is different from 'false'.",
        "why": "Do not treat extra information as true merely because it sounds plausible."
      },
      "ru": {
        "summary": "Для вопросов по фактам найдите точные строки и сопоставьте каждый вариант. «Не упомянуто» и «неверно» — разные вещи.",
        "why": "Не считайте добавленную информацию верной только потому, что она звучит правдоподобно."
      }
    }
  },
  {
    "id": "reading-inference",
    "title": "Reading · inference",
    "level": "B1",
    "sections": [
      1
    ],
    "category": "reading",
    "formula": "stated evidence + reasonable conclusion",
    "correct": "The park remains successful, so its name may stay famous.",
    "incorrect": "The park is successful, so every future park will be built.",
    "content": {
      "hy": {
        "summary": "Եզրակացության հարցում ընտրիր տեքստի փաստերից խելամտորեն բխող տարբերակը։ Զգուշացիր չափազանց խիստ always, never, all արտահայտություններից։",
        "why": "Հնարավոր հետևանքը փաստ չէ, եթե տեքստը չի հաստատում այն։"
      },
      "en": {
        "summary": "Inference must be supported by the passage. Avoid overconfident claims, especially words like always and never.",
        "why": "A possible future event is not an established fact."
      },
      "ru": {
        "summary": "Вывод должен опираться на текст. Остерегайтесь категоричных always, never, all, если они не доказаны.",
        "why": "Возможное следствие не является установленным фактом."
      }
    }
  },
  {
    "id": "reading-reference",
    "title": "Reading · pronoun reference",
    "level": "A2",
    "sections": [
      1
    ],
    "category": "reading",
    "formula": "pronoun → nearest meaningful antecedent",
    "correct": "Stone obtained willow bark and crushed it. ('it' = bark)",
    "incorrect": "Stone obtained willow bark and crushed it. ('it' = fever)",
    "content": {
      "hy": {
        "summary": "It, they, this, those և այլ հղումները գտնելու համար ստուգիր նախորդ նախադասության համապատասխան գոյականը՝ իմաստով և թվով։",
        "why": "Fever-ը տվյալ դեպքում չէ, որ մանրացվել է։"
      },
      "en": {
        "summary": "To resolve pronouns, find an earlier noun that matches meaning and grammatical number, not just the nearest word.",
        "why": "The bark, not the fever, was crushed."
      },
      "ru": {
        "summary": "Чтобы определить, к чему относится местоимение, найдите предыдущее существительное, подходящее по смыслу и числу.",
        "why": "Измельчали кору, а не лихорадку."
      }
    }
  },
  {
    "id": "vocabulary-context",
    "title": "Vocabulary · meaning in context",
    "level": "A2",
    "sections": [
      1,
      3,
      7,
      12
    ],
    "category": "vocabulary",
    "formula": "sentence meaning → possible synonym → re-read",
    "correct": "Enduring creations = lasting creations.",
    "incorrect": "Enduring creations = suffering creations.",
    "content": {
      "hy": {
        "summary": "Բառի իմաստը որոշիր նախադասության և հարևան տողերի համատեքստով։ Բառի բոլոր բառարանային իմաստներից ընտրիր հենց տվյալ գործածության հոմանիշը։",
        "why": "Enduring-ը այս համատեքստում նշանակում է երկարատև, ոչ թե տառապող։"
      },
      "en": {
        "summary": "Use nearby context to choose a synonym that preserves the meaning in this sentence; a dictionary word may have several senses.",
        "why": "Here enduring means lasting, not suffering."
      },
      "ru": {
        "summary": "Используйте контекст вокруг слова и выбирайте синоним, подходящий именно к данному употреблению.",
        "why": "Здесь enduring означает «долговечный», а не «страдающий»."
      }
    }
  },
  {
    "id": "cloze-context",
    "title": "Cloze · word choice in context",
    "level": "B1",
    "sections": [
      3,
      4,
      7,
      9
    ],
    "category": "strategy",
    "formula": "grammar + meaning + collocation",
    "correct": "She is keen on learning.",
    "incorrect": "She is keen at learning.",
    "content": {
      "hy": {
        "summary": "Բացթողումը լրացնելիս նախ որոշիր խոսքի մասը, ապա ստուգիր իմաստը, հարևան բառերը, նախդիրները և ամբողջ պարբերության կապակցվածությունը։",
        "why": "Keen-ի բնական կապակցությունը keen on է։"
      },
      "en": {
        "summary": "For cloze passages, check part of speech, meaning, common combinations, and the full paragraph — not only the isolated gap.",
        "why": "Keen commonly takes on in this construction."
      },
      "ru": {
        "summary": "При заполнении пропусков проверяйте часть речи, смысл, устойчивые сочетания и связность всего абзаца.",
        "why": "В сочетании keen on используется предлог on."
      }
    }
  },
  {
    "id": "redundant-words",
    "title": "Error correction · extra words",
    "level": "B1",
    "sections": [
      10
    ],
    "category": "strategy",
    "formula": "remove one word → re-read meaning and structure",
    "correct": "This is the best answer.",
    "incorrect": "This is the most best answer.",
    "content": {
      "hy": {
        "summary": "Ավելորդ բառ փնտրելիս ստուգիր կրկնակի համեմատականները, կրկնվող նախդիրները, օժանդակ բայերը և ավելորդ դերանունները։ Մի հեռացրու անհրաժեշտ բառը։",
        "why": "Best-ը արդեն գերադրական աստիճան է, most-ը ավելորդ է։"
      },
      "en": {
        "summary": "To find an unnecessary word, check double comparisons, duplicated prepositions, extra auxiliaries, and redundant pronouns.",
        "why": "Best is already superlative; most is redundant."
      },
      "ru": {
        "summary": "Ищите двойную сравнительную степень, повторные предлоги, лишние вспомогательные глаголы и местоимения.",
        "why": "Best уже превосходная степень, поэтому most лишнее."
      }
    }
  },
  {
    "id": "matching-definitions",
    "title": "Vocabulary · matching definitions",
    "level": "A2",
    "sections": [
      12
    ],
    "category": "vocabulary",
    "formula": "meaning + word class → definition",
    "correct": "Expansion = becoming larger.",
    "incorrect": "Expansion = becoming smaller.",
    "content": {
      "hy": {
        "summary": "Բառը սահմանմանը համապատասխանեցնելիս համեմատիր բառի խոսքի մասը և հիմնական իմաստը։ Ծանոթ արտաքինով, բայց այլ իմաստով տարբերակներից զգուշացիր։",
        "why": "Expansion-ը ընդլայնումն է, ոչ թե փոքրացումը։"
      },
      "en": {
        "summary": "Match the central meaning and word class to the definition. Beware of similar-looking but different words.",
        "why": "Expansion means growth, not reduction."
      },
      "ru": {
        "summary": "Соотносите основное значение и часть речи с определением. Избегайте внешне похожих слов с другим значением.",
        "why": "Expansion означает расширение, а не уменьшение."
      }
    }
  },
  {
    "id": "sentence-matching",
    "title": "Sentence matching · logic and structure",
    "level": "B1",
    "sections": [
      13
    ],
    "category": "strategy",
    "formula": "grammar agreement + logical connector + complete meaning",
    "correct": "If it rains, we will stay home.",
    "incorrect": "If it rains, we would stayed home.",
    "content": {
      "hy": {
        "summary": "Նախադասության մասերը զուգակցելիս ստուգիր և՛ տրամաբանական շարունակությունը, և՛ քերականությունը՝ պայմանական ձև, ժամանակաձևերի համադրություն, հղումներ և կապակցիչներ։",
        "why": "If + Present-ի ապագա իրական հետևանքը հաճախ will + բայի սկզբնական ձևն է։"
      },
      "en": {
        "summary": "Match sentence halves by both logical meaning and grammar: conditional forms, tense agreement, pronoun reference, and connectors.",
        "why": "With a realistic future if-clause, the result commonly uses will + base verb."
      },
      "ru": {
        "summary": "Соединяйте части предложения по логике и грамматике: условные конструкции, времена, местоимения и связки.",
        "why": "Для реального будущего условия результат часто строится через will + начальную форму глагола."
      }
    }
  },
  {
    "id": "collocations",
    "title": "Collocations · natural word combinations",
    "level": "B1",
    "sections": [
      3,
      4,
      5,
      7,
      9,
      12
    ],
    "category": "vocabulary",
    "formula": "make a decision · do homework · take a break",
    "correct": "We made a decision.",
    "incorrect": "We did a decision.",
    "content": {
      "hy": {
        "summary": "Որոշ բառեր բնականաբար կիրառվում են միասին՝ make a decision, do homework, take a break։ Ընտրիր ոչ միայն քերականորեն, այլև բառապաշարով բնական տարբերակը։",
        "why": "Decision գոյականի սովորական բայը make-ն է։"
      },
      "en": {
        "summary": "Some words normally occur together: make a decision, do homework, take a break. Choose idiomatic combinations.",
        "why": "The normal verb with decision is make."
      },
      "ru": {
        "summary": "Некоторые слова образуют устойчивые сочетания: make a decision, do homework, take a break. Выбирайте естественное сочетание.",
        "why": "С decision обычно употребляется make."
      }
    }
  }
];
