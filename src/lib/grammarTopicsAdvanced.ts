import type { GrammarTopic } from "./grammarHandbookTypes";
export const GRAMMAR_ADVANCED: GrammarTopic[] = [
  {
    "id": "passive",
    "title": "Passive voice",
    "level": "B1",
    "sections": [
      2,
      3,
      5,
      6,
      11
    ],
    "category": "grammar",
    "formula": "be (correct tense) + past participle (V3)",
    "correct": "The report was written yesterday.",
    "incorrect": "The report was wrote yesterday.",
    "content": {
      "hy": {
        "summary": "Կրավորական սեռը կարևորում է գործողությունը կամ դրա կրողը։ Կազմությունը՝ be-ի համապատասխան ժամանակաձև + V3։ Կատարողը կարելի է նշել by-ով։",
        "why": "Write-ի երրորդ ձևը written է, ոչ թե wrote։"
      },
      "en": {
        "summary": "The passive focuses on the action or its recipient. Use the appropriate form of be plus the past participle; the agent can follow by.",
        "why": "The past participle of write is written, not wrote."
      },
      "ru": {
        "summary": "Страдательный залог выделяет действие или объект действия: форма be в нужном времени + V3, исполнитель может вводиться через by.",
        "why": "Третья форма write — written, а не wrote."
      }
    }
  },
  {
    "id": "questions",
    "title": "Questions and inversion",
    "level": "A2",
    "sections": [
      2,
      3,
      8,
      10
    ],
    "category": "grammar",
    "formula": "auxiliary + subject + main verb · Wh-word + auxiliary + subject + V?",
    "correct": "Where do you live?",
    "incorrect": "Where you live?",
    "content": {
      "hy": {
        "summary": "Սովորական անգլերեն հարցում օժանդակ բայը նախորդում է ենթակային՝ do/does/did, be, have, modal։ Երբ who/what-ն ինքն է ենթական, do օժանդակը հաճախ պետք չէ։",
        "why": "Present Simple-ի ընդհանուր հարցում you-ի հետ անհրաժեշտ է do։"
      },
      "en": {
        "summary": "In most direct questions, put the auxiliary before the subject. Do not add do when who/what itself is the subject of a subject question.",
        "why": "With you in a present-simple direct question, add do."
      },
      "ru": {
        "summary": "В большинстве прямых вопросов вспомогательный глагол стоит перед подлежащим. Если who/what — само подлежащее, do обычно не нужно.",
        "why": "В вопросе Present Simple с you нужен do."
      }
    }
  },
  {
    "id": "question-tags",
    "title": "Question tags",
    "level": "B1",
    "sections": [
      3,
      8,
      10
    ],
    "category": "grammar",
    "formula": "positive clause + negative tag · negative clause + positive tag",
    "correct": "She is here, isn't she?",
    "incorrect": "She is here, doesn't she?",
    "content": {
      "hy": {
        "summary": "Պոչիկ հարցը սովորաբար կրկնում է գլխավոր նախադասության օժանդակ բայը՝ հակառակ բևեռականությամբ։ Ենթական փոխարինվում է համապատասխան դերանունով։",
        "why": "She is-ի համար պոչիկը isn't she է, ոչ թե doesn't she։"
      },
      "en": {
        "summary": "A question tag normally repeats the appropriate auxiliary with opposite polarity and a matching pronoun.",
        "why": "The main clause uses is, so the tag is isn't she."
      },
      "ru": {
        "summary": "Разделительный вопрос повторяет подходящий вспомогательный глагол с противоположным отрицанием и правильным местоимением.",
        "why": "В основном предложении is, поэтому хвостик — isn't she."
      }
    }
  },
  {
    "id": "indirect-questions",
    "title": "Indirect questions",
    "level": "B1",
    "sections": [
      3,
      6,
      8
    ],
    "category": "grammar",
    "formula": "intro + wh/if + subject + verb",
    "correct": "Could you tell me where she lives?",
    "incorrect": "Could you tell me where does she live?",
    "content": {
      "hy": {
        "summary": "Քաղաքավարի անուղղակի հարցի ներսում բառերի կարգը սովորաբար հաստատականի պես է՝ ենթակա + բայ, ոչ թե ուղիղ հարցի շրջադասություն։",
        "why": "Where she lives-ը ճիշտ է․ ներքին մասում does չի դրվում։"
      },
      "en": {
        "summary": "Inside an indirect question, use statement word order: subject before verb.",
        "why": "Use where she lives, not where does she live, within the indirect question."
      },
      "ru": {
        "summary": "В косвенном вопросе внутри придаточного используется прямой порядок слов: подлежащее перед сказуемым.",
        "why": "Правильно where she lives, а не where does she live внутри косвенного вопроса."
      }
    }
  },
  {
    "id": "reported-speech",
    "title": "Reported speech",
    "level": "B1",
    "sections": [
      3,
      5,
      6,
      8
    ],
    "category": "grammar",
    "formula": "say/tell + (that) + clause · ask + if/whether/wh + clause",
    "correct": "He said that he was tired.",
    "incorrect": "He said that I am tired. (when reporting 'I am tired')",
    "content": {
      "hy": {
        "summary": "Ուրիշի խոսքը փոխանցելիս կարող են փոխվել ժամանակաձևը, դերանունները և ժամանակի/վայրի ցուցիչները։ Backshift-ը միշտ պարտադիր չէ, հատկապես եթե փաստը շարունակում է ճիշտ լինել։",
        "why": "Եթե խոսողը ասել է I am tired, փոխանցողը սովորաբար կասի he was tired՝ փոխելով դերանունը։"
      },
      "en": {
        "summary": "Reported speech may require changes to tense, pronouns, and time/place references. Backshift is not automatic when the fact is still true.",
        "why": "Reporting 'I am tired' about another person usually requires he, and often was."
      },
      "ru": {
        "summary": "При передаче чужой речи могут меняться время, местоимения и указатели времени/места. Сдвиг времени необязателен, если факт по-прежнему актуален.",
        "why": "При передаче 'I am tired' о другом человеке обычно нужно he и часто was."
      }
    }
  },
  {
    "id": "relative-clauses",
    "title": "Relative clauses · who/which/that",
    "level": "B1",
    "sections": [
      3,
      5,
      6,
      10,
      13
    ],
    "category": "grammar",
    "formula": "person + who/that · thing + which/that",
    "correct": "The girl who won is my sister.",
    "incorrect": "The girl which won is my sister.",
    "content": {
      "hy": {
        "summary": "Who-ն սովորաբար վերաբերում է մարդկանց, which-ը՝ առարկաներին, that-ը հաճախ կիրառվում է սահմանափակող որոշիչ նախադասություններում։ Ոչ սահմանափակող նախադասություններում that սովորաբար չի կիրառվում։",
        "why": "Girl-ը մարդ է, հետևաբար who-ն ավելի ճիշտ է։"
      },
      "en": {
        "summary": "Use who for people, which for things; that is common in defining clauses but not normally in non-defining clauses.",
        "why": "A girl is a person, so who is appropriate."
      },
      "ru": {
        "summary": "Who употребляется о людях, which — о предметах; that часто возможно в ограничительных придаточных, но не в неограничительных.",
        "why": "Girl обозначает человека, поэтому уместно who."
      }
    }
  },
  {
    "id": "zero-first-conditional",
    "title": "Zero and first conditionals",
    "level": "B1",
    "sections": [
      3,
      5,
      6,
      13
    ],
    "category": "grammar",
    "formula": "if + present, present (zero) · if + present, will + V (first)",
    "correct": "If it rains, we will stay inside.",
    "incorrect": "If it will rain, we will stay inside.",
    "content": {
      "hy": {
        "summary": "Zero conditional-ը փաստերի և սովորական հետևանքների համար է (if + Present, Present)։ First conditional-ը իրական ապագա հավանականության համար է (if + Present, will + V)։",
        "why": "If-clause-ում ապագան սովորաբար արտահայտվում է Present Simple-ով՝ rains։"
      },
      "en": {
        "summary": "Zero conditional describes general truths; first conditional describes a realistic future possibility. Normally avoid will in the if-clause.",
        "why": "For ordinary future conditions, use present simple rains in the if-clause."
      },
      "ru": {
        "summary": "Нулевое условное описывает закономерности, первое — реальное будущее условие. В части с if обычно не ставят will.",
        "why": "В условии о будущем обычно нужно rains, а не will rain."
      }
    }
  },
  {
    "id": "second-conditional",
    "title": "Second conditional",
    "level": "B1",
    "sections": [
      3,
      5,
      6,
      13
    ],
    "category": "grammar",
    "formula": "if + past simple, would + V",
    "correct": "If I had time, I would join.",
    "incorrect": "If I would have time, I would join.",
    "content": {
      "hy": {
        "summary": "Ներկա կամ ապագա երևակայական/քիչ հավանական իրավիճակների համար՝ if + Past Simple, would + բայի սկզբնական ձև։ Be բայի հետ պաշտոնական ձևում հաճախ were է օգտագործվում բոլոր դեմքերի համար։",
        "why": "Սովորական երկրորդ պայմանականի if-մասում would-ը չի դրվում։"
      },
      "en": {
        "summary": "For unreal or unlikely present/future situations: if + past simple, would + base verb. Were is often used with all subjects in formal hypothetical expressions.",
        "why": "Do not normally put would in the if-clause of a second conditional."
      },
      "ru": {
        "summary": "Для нереального или маловероятного условия: if + Past Simple, would + инфинитив без to. В формальных выражениях часто употребляется were.",
        "why": "В части с if второго условного обычно не используется would."
      }
    }
  },
  {
    "id": "third-conditional",
    "title": "Third conditional",
    "level": "B2",
    "sections": [
      3,
      5,
      6,
      13
    ],
    "category": "grammar",
    "formula": "if + had + V3, would/could/might have + V3",
    "correct": "If she had studied, she would have passed.",
    "incorrect": "If she would study, she would have passed.",
    "content": {
      "hy": {
        "summary": "Անցյալում չիրականացած պայմանի և դրա հնարավոր հետևանքի մասին՝ if + Past Perfect, would have + V3։",
        "why": "Անցյալում չիրականացած պայմանը պետք է if she had studied։"
      },
      "en": {
        "summary": "For an unreal past event and its imagined result: if + past perfect, would have + past participle.",
        "why": "The unreal past condition needs had studied, not would study."
      },
      "ru": {
        "summary": "Для нереального прошлого: if + Past Perfect, would have + третья форма глагола.",
        "why": "В условии о нереальном прошлом нужно had studied."
      }
    }
  },
  {
    "id": "mixed-conditionals",
    "title": "Mixed conditionals",
    "level": "C1",
    "sections": [
      3,
      5,
      6,
      13
    ],
    "category": "grammar",
    "formula": "if + had + V3, would + V (present result)",
    "correct": "If I had slept, I would feel better now.",
    "incorrect": "If I had slept, I would have felt better now.",
    "content": {
      "hy": {
        "summary": "Երբ անցյալի չիրականացած իրադարձությունն ունի ներկա հետևանք, հնարավոր է if + Past Perfect, would + բայի սկզբնական ձև։ Ժամանակային հղումները պետք է համընկնեն իմաստին։",
        "why": "Now-ը ցույց է տալիս ներկա հետևանքը, ուստի այս իմաստով would feel է։"
      },
      "en": {
        "summary": "A past unreal condition may have a present hypothetical result: if + past perfect, would + base verb.",
        "why": "Now marks a present consequence, so would feel fits this meaning."
      },
      "ru": {
        "summary": "Нереальное условие в прошлом может иметь результат в настоящем: if + Past Perfect, would + начальная форма.",
        "why": "Now указывает на результат в настоящем, поэтому здесь would feel."
      }
    }
  },
  {
    "id": "gerund-infinitive",
    "title": "Gerund and infinitive",
    "level": "B1",
    "sections": [
      3,
      4,
      5,
      6,
      10
    ],
    "category": "grammar",
    "formula": "enjoy + V-ing · want + to + V · modal + V",
    "correct": "She enjoys reading.",
    "incorrect": "She enjoys to read.",
    "content": {
      "hy": {
        "summary": "Որոշ բայերից հետո օգտագործվում է -ing, մյուսներից հետո՝ to + բայի սկզբնական ձև։ Ընտրությունը հաճախ կախված է կոնկրետ բայից. enjoy + V-ing, want + to V։",
        "why": "Enjoy-ից հետո այս իմաստով կիրառվում է reading, ոչ թե to read։"
      },
      "en": {
        "summary": "Some verbs take -ing, others take to-infinitive. Learn verb patterns, e.g. enjoy reading and want to read.",
        "why": "Enjoy takes reading, not to read, in this use."
      },
      "ru": {
        "summary": "После одних глаголов требуется -ing, после других — to-инфинитив. Запоминайте управление: enjoy reading, want to read.",
        "why": "После enjoy здесь нужно reading, а не to read."
      }
    }
  },
  {
    "id": "used-to",
    "title": "Used to vs be used to",
    "level": "B1",
    "sections": [
      3,
      5,
      6,
      10
    ],
    "category": "grammar",
    "formula": "used to + V · be used to + noun/V-ing",
    "correct": "I'm used to getting up early.",
    "incorrect": "I'm used to get up early.",
    "content": {
      "hy": {
        "summary": "Used to + V-ն անցյալ սովորության մասին է։ Be used to + գոյական կամ V-ing նշանակում է «սովոր լինել»։ Երկուսի to-ն նույն քերականական դերը չունի։",
        "why": "Be used to-ից հետո get-ի փոխարեն պետք է getting։"
      },
      "en": {
        "summary": "Used to + base verb describes a past habit; be used to + noun/-ing means being accustomed to something.",
        "why": "After be used to, use getting, not get."
      },
      "ru": {
        "summary": "Used to + глагол — привычка в прошлом; be used to + существительное/-ing — быть привычным к чему-то.",
        "why": "После be used to нужна форма getting, а не get."
      }
    }
  },
  {
    "id": "wish-if-only",
    "title": "Wish / if only",
    "level": "B2",
    "sections": [
      3,
      5,
      6,
      10
    ],
    "category": "grammar",
    "formula": "wish + past simple (present unreal) · wish + had V3 (past regret)",
    "correct": "I wish I knew the answer.",
    "incorrect": "I wish I know the answer.",
    "content": {
      "hy": {
        "summary": "Wish + Past Simple-ը նկարագրում է ներկայի ոչ իրական ցանկություն, wish + Past Perfect-ը՝ անցյալի ափսոսանք։ Wish + would-ը կիրառվում է որոշ փոփոխություններ ցանկանալու դեպքում։",
        "why": "Ներկայի չիրականացած ցանկության մեջ knew է, ոչ թե know։"
      },
      "en": {
        "summary": "Wish + past simple expresses an unreal present wish; wish + past perfect expresses past regret. Wish + would has different uses for desired changes.",
        "why": "An unreal present wish takes knew, not know."
      },
      "ru": {
        "summary": "Wish + Past Simple — нереальное желание о настоящем, wish + Past Perfect — сожаление о прошлом. Wish + would употребляется для желаемых изменений.",
        "why": "При нереальном желании о настоящем нужно knew, а не know."
      }
    }
  },
  {
    "id": "causative",
    "title": "Have/get something done",
    "level": "B2",
    "sections": [
      3,
      5,
      6,
      10
    ],
    "category": "grammar",
    "formula": "have/get + object + V3",
    "correct": "I had my phone repaired.",
    "incorrect": "I had my phone repair.",
    "content": {
      "hy": {
        "summary": "Կառույցը ցույց է տալիս, որ ուրիշն է մեր համար գործողությունը կատարում (երբեմն՝ մեզ հետ պատահած դեպք)։ Կազմությունը՝ have/get + առարկա + V3։",
        "why": "Repair-ի անհրաժեշտ ձևը repaired է, քանի որ սա past participle է։"
      },
      "en": {
        "summary": "Use have/get + object + past participle when someone else does something for you (or for some events that happen to you).",
        "why": "The structure requires the participle repaired."
      },
      "ru": {
        "summary": "Have/get + дополнение + V3 означает действие, выполненное кем-то для нас (иногда событие, случившееся с нами).",
        "why": "В этой конструкции нужно причастие repaired."
      }
    }
  },
  {
    "id": "prepositions",
    "title": "Prepositions · time/place",
    "level": "A2",
    "sections": [
      3,
      5,
      9,
      10
    ],
    "category": "grammar",
    "formula": "at + time · on + day · in + month/year",
    "correct": "The meeting is on Monday at six.",
    "incorrect": "The meeting is in Monday at six.",
    "content": {
      "hy": {
        "summary": "Ժամանակի հիմնական կապակցությունները՝ at six, on Monday, in October/2026։ Տեղային կիրառություններն ունեն առանձին կանոններ և բացառություններ։",
        "why": "Շաբաթվա օրվա հետ սովորաբար օգտագործվում է on, ոչ թե in։"
      },
      "en": {
        "summary": "For time: at six, on Monday, in October/2026. Place uses related but distinct patterns; many fixed phrases must be learned.",
        "why": "Use on, not in, with days of the week."
      },
      "ru": {
        "summary": "Для времени: at six, on Monday, in October/2026. Для места есть отдельные правила и устойчивые сочетания.",
        "why": "С днями недели обычно употребляется on, а не in."
      }
    }
  },
  {
    "id": "dependent-prepositions",
    "title": "Verb/adjective + preposition",
    "level": "B1",
    "sections": [
      3,
      5,
      9,
      10
    ],
    "category": "grammar",
    "formula": "depend on · interested in · good at · responsible for",
    "correct": "She is interested in science.",
    "incorrect": "She is interested on science.",
    "content": {
      "hy": {
        "summary": "Շատ բայեր ու ածականներ ունեն հաստատուն նախդրային կապակցություններ՝ depend on, listen to, interested in։ Դրանք սովորիր ամբողջական արտահայտություններով։",
        "why": "Interested ածականի հետ սովորաբար օգտագործվում է in։"
      },
      "en": {
        "summary": "Many verbs and adjectives take fixed prepositions. Learn the combination as a phrase: interested in, depend on, listen to.",
        "why": "Interested is normally followed by in."
      },
      "ru": {
        "summary": "Многие глаголы и прилагательные требуют фиксированного предлога. Учите сочетания целиком: interested in, depend on, listen to.",
        "why": "После interested обычно ставится in."
      }
    }
  },
  {
    "id": "phrasal-verbs",
    "title": "Phrasal verbs",
    "level": "B1",
    "sections": [
      3,
      5,
      7,
      9,
      12
    ],
    "category": "grammar",
    "formula": "verb + particle (meaning may change)",
    "correct": "They put off the meeting.",
    "incorrect": "They put the meeting off of.",
    "content": {
      "hy": {
        "summary": "Phrasal verb-ի մասնիկը հաճախ փոխում է հիմնական բայի իմաստը. put off = հետաձգել։ Որոշ բայեր բաժանելի են, մյուսները՝ ոչ։",
        "why": "Put off արտահայտության համար հավելյալ of պետք չէ։"
      },
      "en": {
        "summary": "A particle can change a verb's meaning: put off means postpone. Some phrasal verbs are separable, some inseparable.",
        "why": "Put off does not take an extra of here."
      },
      "ru": {
        "summary": "Частица часто меняет значение глагола: put off — отложить. Одни фразовые глаголы разделяемые, другие нет.",
        "why": "После put off дополнительное of здесь не нужно."
      }
    }
  },
  {
    "id": "word-formation",
    "title": "Word formation · noun/verb/adjective/adverb",
    "level": "B1",
    "sections": [
      3,
      4,
      5,
      10,
      12
    ],
    "category": "grammar",
    "formula": "adjective + -ly → adverb (often) · suffix changes word class",
    "correct": "She spoke quietly.",
    "incorrect": "She spoke quiet.",
    "content": {
      "hy": {
        "summary": "Ընտրիր ձևը ըստ նախադասության դերի. բնութագրող բառը հաճախ ածական է, գործողության եղանակը՝ մակբայ։ -ly հաճախ, բայց ոչ միշտ, մակբայ է կազմում։",
        "why": "Spoke բայը այստեղ բնութագրվում է մակբայով՝ quietly։"
      },
      "en": {
        "summary": "Choose the grammatical word class required by the sentence. Many adverbs end in -ly, but there are exceptions.",
        "why": "Spoke is modified by the adverb quietly."
      },
      "ru": {
        "summary": "Выбирайте часть речи по роли в предложении. Многие наречия образуются с -ly, но есть исключения.",
        "why": "Глагол spoke здесь определяется наречием quietly."
      }
    }
  },
  {
    "id": "linking-words",
    "title": "Linking words · although/despite/however",
    "level": "B1",
    "sections": [
      3,
      5,
      7,
      10,
      13
    ],
    "category": "grammar",
    "formula": "although + clause · despite + noun/-ing · however, + clause",
    "correct": "Despite the rain, we went out.",
    "incorrect": "Despite it rained, we went out.",
    "content": {
      "hy": {
        "summary": "Although-ից հետո գալիս է ամբողջական ենթակա+բայ նախադասություն, despite/in spite of-ից հետո՝ գոյական կամ -ing ձև։ However-ը սովորաբար կապում է առանձին նախադասություններ։",
        "why": "Despite-ի հետո it rained ամբողջական նախադասությունն այս ձևով չի դրվում․ օգտագործիր despite the rain կամ although it rained։"
      },
      "en": {
        "summary": "Although introduces a clause; despite/in spite of takes a noun or -ing phrase. However generally links separate clauses or sentences.",
        "why": "After despite use the rain, or switch to although it rained."
      },
      "ru": {
        "summary": "После although следует придаточное предложение, после despite/in spite of — существительное или -ing. However связывает предложения.",
        "why": "После despite нужно the rain; либо используйте although it rained."
      }
    }
  },
  {
    "id": "inversion",
    "title": "Inversion after negative adverbials",
    "level": "C1",
    "sections": [
      3,
      5,
      6,
      8,
      10
    ],
    "category": "grammar",
    "formula": "Never/Rarely/Not only + auxiliary + subject + verb",
    "correct": "Never have I seen this before.",
    "incorrect": "Never I have seen this before.",
    "content": {
      "hy": {
        "summary": "Never, rarely, hardly, not only և որոշ այլ ժխտական/սահմանափակող մակբայային արտահայտությունների նախադասասկզբում հաճախ պահանջվում է օժանդակ բայի շրջադասություն։",
        "why": "Never-ից հետո օժանդակ have-ը պետք է անցնի I-ից առաջ։"
      },
      "en": {
        "summary": "Fronted negative or limiting adverbials such as never and rarely often trigger subject–auxiliary inversion.",
        "why": "After fronted never, place have before I."
      },
      "ru": {
        "summary": "При вынесении отрицательных или ограничительных наречий (never, rarely и т. п.) часто требуется инверсия вспомогательного глагола и подлежащего.",
        "why": "После начального never вспомогательный have ставится перед I."
      }
    }
  }
];
