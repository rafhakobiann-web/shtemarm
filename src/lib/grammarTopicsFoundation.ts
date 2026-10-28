import type { GrammarTopic } from "./grammarHandbookTypes";
/** Original instructional content, reviewed against conventional English grammar patterns. */
export const GRAMMAR_FOUNDATION: GrammarTopic[] = [
  {
    "id": "to-be",
    "title": "Verb to be · am/is/are",
    "level": "A1",
    "sections": [
      2,
      3,
      5,
      8
    ],
    "category": "grammar",
    "formula": "I am · he/she/it is · you/we/they are",
    "correct": "She is ready.",
    "incorrect": "She are ready.",
    "content": {
      "hy": {
        "summary": "Ենթական որոշում է be բայի ձևը․ I→am, he/she/it→is, we/you/they→are։ Հարցականում be-ն դրվում է ենթակայից առաջ։",
        "why": "She-ն եզակի երրորդ դեմք է, ուստի պետք է is, ոչ թե are։"
      },
      "en": {
        "summary": "The subject determines the present form of be. In questions, invert be and the subject.",
        "why": "She is third-person singular, so use is, not are."
      },
      "ru": {
        "summary": "Форма be зависит от подлежащего: I→am, he/she/it→is, we/you/they→are. В вопросах глагол ставится перед подлежащим.",
        "why": "She — третье лицо единственного числа; нужно is, а не are."
      }
    }
  },
  {
    "id": "articles",
    "title": "Articles · a/an/the/zero",
    "level": "A1",
    "sections": [
      3,
      4,
      5,
      10
    ],
    "category": "grammar",
    "formula": "a/an + singular countable noun · the + specific noun",
    "correct": "She bought an umbrella.",
    "incorrect": "She bought a umbrella.",
    "content": {
      "hy": {
        "summary": "Անորոշ a/an հոդը դրվում է եզակի հաշվելի գոյականի հետ՝ ըստ հաջորդ բառի հնչյունի. an՝ ձայնավոր հնչյունից առաջ։ The-ն նշում է որոշակի, համատեքստից հայտնի առարկա։",
        "why": "Umbrella բառը սկսվում է ձայնավոր հնչյունով, ուստի պետք է an։"
      },
      "en": {
        "summary": "Use a/an before a singular countable noun depending on the initial sound; use the for a specific, identifiable referent.",
        "why": "Umbrella begins with a vowel sound, so an is required."
      },
      "ru": {
        "summary": "A/an употребляются с исчисляемым существительным в единственном числе по начальному звуку; the указывает на конкретный предмет.",
        "why": "Umbrella начинается с гласного звука, поэтому нужно an."
      }
    }
  },
  {
    "id": "present-simple",
    "title": "Present Simple",
    "level": "A1",
    "sections": [
      2,
      3,
      5,
      6,
      8
    ],
    "category": "grammar",
    "formula": "subject + V / V-s · do/does + subject + V?",
    "correct": "He studies every evening.",
    "incorrect": "He study every evening.",
    "content": {
      "hy": {
        "summary": "Օգտագործվում է սովորությունների, կանոնավոր գործողությունների և ընդհանուր փաստերի համար։ Հաստատական նախադասությունում he/she/it-ի հետ բայը սովորաբար ստանում է -s/-es։",
        "why": "He-ն երրորդ դեմքի եզակի է։ Do/does օժանդակով հարցականում հիմնական բայը մնում է սկզբնական ձևով։"
      },
      "en": {
        "summary": "Use for habits, repeated actions, and general facts. In affirmative clauses, add -s/-es for he/she/it.",
        "why": "He needs studies in a statement; after does, the main verb returns to its base form."
      },
      "ru": {
        "summary": "Используется для привычек, повторяющихся действий и фактов. В утвердительных предложениях к глаголу с he/she/it добавляется -s/-es.",
        "why": "С he в утверждении нужно studies; после does основной глагол употребляется в начальной форме."
      }
    }
  },
  {
    "id": "present-continuous",
    "title": "Present Continuous",
    "level": "A1",
    "sections": [
      2,
      3,
      5,
      8
    ],
    "category": "grammar",
    "formula": "am/is/are + V-ing",
    "correct": "They are working now.",
    "incorrect": "They working now.",
    "content": {
      "hy": {
        "summary": "Օգտագործվում է խոսելու պահին ընթացող կամ ժամանակավոր գործողությունների համար։ Կազմվում է be + V-ing։",
        "why": "Առանց are օժանդակ բայի նախադասությունը լիարժեք ժամանակաձև չունի։"
      },
      "en": {
        "summary": "Use for actions happening now or temporary situations; form it with be + -ing.",
        "why": "A present continuous clause needs the auxiliary are here."
      },
      "ru": {
        "summary": "Употребляется для действий сейчас или временных ситуаций; форма be + -ing.",
        "why": "В Present Continuous здесь необходим вспомогательный глагол are."
      }
    }
  },
  {
    "id": "past-simple",
    "title": "Past Simple",
    "level": "A1",
    "sections": [
      2,
      3,
      5,
      6,
      8
    ],
    "category": "grammar",
    "formula": "subject + V2 / V-ed · did + subject + V?",
    "correct": "We visited Gyumri yesterday.",
    "incorrect": "We visit Gyumri yesterday.",
    "content": {
      "hy": {
        "summary": "Նշում է անցյալում ավարտված գործողություն, հաճախ՝ yesterday, last year, ago։ Հարցականում օգտագործվում է did + բայի սկզբնական ձև։",
        "why": "Yesterday հուշում է անցյալ ժամանակը․ visit-ի փոխարեն պետք է visited։"
      },
      "en": {
        "summary": "Use for completed events in the past. Questions use did + base verb.",
        "why": "Yesterday signals past time, so visited is needed."
      },
      "ru": {
        "summary": "Обозначает завершённое действие в прошлом. Вопросы строятся с did + начальная форма глагола.",
        "why": "Yesterday указывает на прошедшее время; нужно visited."
      }
    }
  },
  {
    "id": "past-continuous",
    "title": "Past Continuous",
    "level": "A2",
    "sections": [
      2,
      3,
      5,
      6
    ],
    "category": "grammar",
    "formula": "was/were + V-ing",
    "correct": "I was reading when she called.",
    "incorrect": "I read when she was calling me yesterday.",
    "content": {
      "hy": {
        "summary": "Նշում է անցյալում որոշակի պահին ընթացող գործողություն։ Այն հաճախ համադրվում է Past Simple-ով նկարագրված կարճ իրադարձության հետ։",
        "why": "Օրինակում կարդալը ընթացքի մեջ էր, իսկ զանգը՝ կարճ ավարտված իրադարձություն։"
      },
      "en": {
        "summary": "Use for an action in progress at a past moment, often interrupted by a shorter past-simple event.",
        "why": "Reading was in progress; the call was a shorter completed event."
      },
      "ru": {
        "summary": "Обозначает процесс в определённый момент прошлого, часто прерываемый кратким действием в Past Simple.",
        "why": "Чтение длилось, а звонок был коротким завершённым событием."
      }
    }
  },
  {
    "id": "future-forms",
    "title": "Future · will / be going to / present continuous",
    "level": "A2",
    "sections": [
      2,
      3,
      5,
      6
    ],
    "category": "grammar",
    "formula": "will + V · am/is/are going to + V · be + V-ing",
    "correct": "Look at those clouds! It is going to rain.",
    "incorrect": "Look at those clouds! It will raining.",
    "content": {
      "hy": {
        "summary": "Will-ը հաճախ արտահայտում է անմիջական որոշում կամ կանխատեսում, going to-ն՝ մտադրություն կամ տեսանելի ապացույցով կանխատեսում, Present Continuous-ը՝ պայմանավորված ծրագիր։",
        "why": "Will-ից հետո պետք է բայի սկզբնական ձևը՝ rain, ոչ թե raining։"
      },
      "en": {
        "summary": "Will often expresses spontaneous decisions or predictions; going to expresses plans or evidence-based predictions; present continuous can signal arrangements.",
        "why": "After will, use the base form rain, not raining."
      },
      "ru": {
        "summary": "Will — спонтанное решение или прогноз; going to — намерение или прогноз по признакам; Present Continuous — договорённость.",
        "why": "После will нужна начальная форма rain, а не raining."
      }
    }
  },
  {
    "id": "present-perfect",
    "title": "Present Perfect",
    "level": "A2",
    "sections": [
      2,
      3,
      5,
      6,
      8
    ],
    "category": "grammar",
    "formula": "have/has + past participle (V3)",
    "correct": "She has already finished.",
    "incorrect": "She has finished yesterday.",
    "content": {
      "hy": {
        "summary": "Կապում է անցյալ գործողությունը ներկայի հետ՝ փորձ, արդյունք կամ դեռ ընթացող ժամանակահատված։ Անցյալի հստակ ավարտված պահի հետ (yesterday) սովորաբար կիրառվում է Past Simple։",
        "why": "Yesterday-ը որոշակի ավարտված անցյալ է․ ավելի ճիշտ է She finished yesterday։"
      },
      "en": {
        "summary": "Connects the past with the present: experience, current result, or unfinished time. Use past simple with a definite finished time like yesterday.",
        "why": "Yesterday specifies finished past time: say She finished yesterday."
      },
      "ru": {
        "summary": "Связывает прошлое с настоящим: опыт, результат или незавершённый период. С yesterday обычно нужен Past Simple.",
        "why": "Yesterday обозначает завершённый период: лучше She finished yesterday."
      }
    }
  },
  {
    "id": "past-perfect",
    "title": "Past Perfect",
    "level": "B1",
    "sections": [
      2,
      3,
      5,
      6
    ],
    "category": "grammar",
    "formula": "had + past participle (V3)",
    "correct": "When we arrived, the train had left.",
    "incorrect": "When we arrived, the train has left.",
    "content": {
      "hy": {
        "summary": "Ցույց է տալիս գործողություն, որն ավարտվել է անցյալի մեկ այլ պահից առաջ։ Եթե երկու անցյալ իրադարձություններից մեկը նախորդում է մյուսին, Past Perfect-ը կարող է նշել նախորդը։",
        "why": "Առավոտյան հասնելը անցյալում էր․ գնացքը մեկնել էր դրանից առաջ, ուստի had left։"
      },
      "en": {
        "summary": "Marks an event completed before another past point or event.",
        "why": "The train left before our past arrival, so had left expresses the earlier event."
      },
      "ru": {
        "summary": "Обозначает действие, завершившееся до другого события или момента в прошлом.",
        "why": "Поезд ушёл до нашего прибытия в прошлом, поэтому had left."
      }
    }
  },
  {
    "id": "present-perfect-continuous",
    "title": "Present Perfect Continuous",
    "level": "B1",
    "sections": [
      2,
      3,
      5
    ],
    "category": "grammar",
    "formula": "have/has been + V-ing",
    "correct": "I have been studying for two hours.",
    "incorrect": "I am studying since two hours.",
    "content": {
      "hy": {
        "summary": "Ընդգծում է անցյալում սկսված և մինչ այժմ շարունակվող գործունեության տևողությունը կամ դրա ազդեցությունը ներկայում։",
        "why": "Տևողության համար՝ for two hours։ Since-ը նշում է մեկնարկի պահը։"
      },
      "en": {
        "summary": "Emphasizes duration of an activity begun in the past and continuing now, or its present result.",
        "why": "Use for two hours for duration; since names a starting point."
      },
      "ru": {
        "summary": "Подчёркивает длительность действия, начавшегося в прошлом и продолжающегося сейчас, либо его нынешний результат.",
        "why": "Для длительности — for two hours, а since обозначает начальную точку."
      }
    }
  },
  {
    "id": "since-for",
    "title": "Since vs for",
    "level": "A2",
    "sections": [
      2,
      3,
      5,
      9
    ],
    "category": "grammar",
    "formula": "since + starting point · for + duration",
    "correct": "We have lived here since 2020.",
    "incorrect": "We have lived here for 2020.",
    "content": {
      "hy": {
        "summary": "Since-ը օգտագործվում է մեկնարկային պահի, for-ը՝ տևողության հետ։",
        "why": "2020-ը մեկնարկի տարի է, հետևաբար պետք է since։"
      },
      "en": {
        "summary": "Since takes a starting point; for takes a period of duration.",
        "why": "2020 is a starting point, so use since."
      },
      "ru": {
        "summary": "Since обозначает начальную точку, for — продолжительность.",
        "why": "2020 — точка отсчёта, поэтому нужно since."
      }
    }
  },
  {
    "id": "subject-verb",
    "title": "Subject–verb agreement",
    "level": "A2",
    "sections": [
      2,
      3,
      5,
      8,
      10
    ],
    "category": "grammar",
    "formula": "singular subject → singular verb · plural subject → plural verb",
    "correct": "Each student has a book.",
    "incorrect": "Each student have a book.",
    "content": {
      "hy": {
        "summary": "Բայը համաձայնեցվում է իրական ենթակայի թվին, ոչ թե մոտակա այլ գոյականին։ Each, every, everyone սովորաբար պահանջում են եզակի համաձայնություն։",
        "why": "Each student-ը եզակի է, այդ պատճառով has, ոչ թե have։"
      },
      "en": {
        "summary": "Match the verb to the true subject, not a nearby noun. Each/every/everyone usually take singular agreement.",
        "why": "Each student is singular, so has is correct."
      },
      "ru": {
        "summary": "Согласуйте глагол с подлежащим, а не ближайшим существительным. Each/every/everyone обычно требуют единственного числа.",
        "why": "Each student — единственное число, поэтому has, а не have."
      }
    }
  },
  {
    "id": "countable-uncountable",
    "title": "Countable and uncountable nouns",
    "level": "A2",
    "sections": [
      3,
      4,
      5,
      10
    ],
    "category": "grammar",
    "formula": "many/few + countable plural · much/little + uncountable",
    "correct": "There isn't much water.",
    "incorrect": "There aren't many water.",
    "content": {
      "hy": {
        "summary": "Հաշվելի գոյականներն ունեն հոգնակի ձև, անհաշվելիները (water, information, advice) սովորաբար չեն ստանում հոգնակի -s։",
        "why": "Water-ը անհաշվելի է, ուստի գործածվում են much և isn't։"
      },
      "en": {
        "summary": "Countable nouns have plural forms; common uncountable nouns such as water, advice, and information do not normally take plural -s.",
        "why": "Water is uncountable, so much and isn't are appropriate."
      },
      "ru": {
        "summary": "Исчисляемые существительные имеют множественное число; water, advice, information обычно неисчисляемы.",
        "why": "Water неисчисляемое: нужны much и isn't."
      }
    }
  },
  {
    "id": "quantifiers",
    "title": "Quantifiers · some/any/few/little",
    "level": "A2",
    "sections": [
      3,
      5,
      10
    ],
    "category": "grammar",
    "formula": "few/a few + countable · little/a little + uncountable",
    "correct": "We have a few apples.",
    "incorrect": "We have a little apples.",
    "content": {
      "hy": {
        "summary": "A few/few-ը գործածվում է հաշվելի, a little/little-ը՝ անհաշվելի գոյականների հետ։ Few/little-ը հաճախ ընդգծում են անբավարար քանակ, իսկ a few/a little-ը՝ որոշակի առկայություն։",
        "why": "Apples-ը հաշվելի հոգնակի է, հետևաբար a few։"
      },
      "en": {
        "summary": "Use few/a few with countable plurals, little/a little with uncountables. The article a often makes the quantity sound more positive.",
        "why": "Apples is a countable plural, so use a few."
      },
      "ru": {
        "summary": "Few/a few — с исчисляемыми во множественном числе; little/a little — с неисчисляемыми. Артикль a часто делает оценку количества более положительной.",
        "why": "Apples — исчисляемое множественное число, поэтому a few."
      }
    }
  },
  {
    "id": "comparison",
    "title": "Comparatives and superlatives",
    "level": "A2",
    "sections": [
      3,
      4,
      5,
      10
    ],
    "category": "grammar",
    "formula": "adjective-er / more + adjective · the -est / the most",
    "correct": "This route is shorter than that one.",
    "incorrect": "This route is more shorter than that one.",
    "content": {
      "hy": {
        "summary": "Համեմատական աստիճանը կարճ ածականների համար հաճախ կազմվում է -er-ով, երկարների համար՝ more-ով։ Երկու ձևերը սովորաբար միասին չեն կիրառվում։",
        "why": "Shorter-ն արդեն համեմատական ձև է, այնպես որ more-ը ավելորդ է։"
      },
      "en": {
        "summary": "Comparatives usually use -er or more, not both; superlatives use -est or most. Remember irregular forms like good → better → best.",
        "why": "Shorter is already comparative, so more is redundant."
      },
      "ru": {
        "summary": "Сравнительная степень обычно образуется через -er или more, но не вместе; превосходная — -est или most. Есть исключения: good → better → best.",
        "why": "Shorter уже сравнительная форма, поэтому more лишнее."
      }
    }
  },
  {
    "id": "modals",
    "title": "Modal verbs · can/must/might/should",
    "level": "A2",
    "sections": [
      2,
      3,
      5,
      6,
      8
    ],
    "category": "grammar",
    "formula": "modal + base verb (without to)",
    "correct": "You must wear a seat belt.",
    "incorrect": "You must to wear a seat belt.",
    "content": {
      "hy": {
        "summary": "Can, must, might, should և այլ մոդալներից հետո հիմնական բայը սովորաբար առանց to-ի սկզբնական ձևով է։ Must-ը կարող է նշանակել պարտավորություն, might-ը՝ հնարավորություն։",
        "why": "Must-ի անմիջապես հետո to չի դրվում։"
      },
      "en": {
        "summary": "After core modals, use the bare infinitive. Must often expresses obligation; might expresses possibility.",
        "why": "Do not put to immediately after must."
      },
      "ru": {
        "summary": "После модальных can, must, might, should употребляется начальная форма глагола без to. Must выражает обязанность, might — возможность.",
        "why": "После must не ставят to."
      }
    }
  }
];
