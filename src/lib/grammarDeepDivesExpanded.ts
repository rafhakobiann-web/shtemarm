import type { GrammarDeepDive } from "./grammarDeepDives";
import type { GrammarLanguage } from "./grammarHandbookTypes";

/** Expanded teacher-authored strategies for the mixed-grammar and extra-word sections.
 * They teach forms and checking methods, not unverified answers to individual book items.
 */
export const EXPANDED_GRAMMAR_DEEP_DIVES: Readonly<Record<string, Record<GrammarLanguage, GrammarDeepDive>>> = {
  "redundant-words": {
    hy: {steps:["Նախ կարդա նախադասությունն ամբողջությամբ և գտիր ենթական ու հիմնական բայը։","Ավելորդ թվացող բառը մտովի հեռացրու․ նախադասությունը պետք է մնա քերականորեն ճիշտ և նույն իմաստով։","Ստուգիր կրկնվող օժանդակ բայերը, կրկնակի համեմատականները, ավելորդ նախդիրներն ու դերանունները։"],
      contrast:"She can speak English (ճիշտ) — She can to speak English (ավելորդ է to-ն).",
      caution:"Մի՛ ջնջիր բառ միայն այն պատճառով, որ կրկնվում է․ համեմատիր կառուցվածքն ու իմաստը։"},
    en: {steps:["Read the entire sentence and locate the subject and main verb.","Remove the suspected extra word mentally; the sentence must stay grammatical and keep its meaning.","Check duplicate auxiliaries, double comparisons, unnecessary prepositions and repeated pronouns."],
      contrast:"She can speak English (correct); She can to speak English (unnecessary to).",caution:"A repeated word is not automatically incorrect: test grammar and meaning."},
    ru: {steps:["Прочитайте всё предложение, найдите подлежащее и сказуемое.","Мысленно уберите предполагаемое лишнее слово: конструкция должна остаться грамматичной, смысл — прежним.","Проверьте лишние вспомогательные глаголы, двойные сравнения, предлоги и местоимения."],
      contrast:"She can speak English — верно; She can to speak English — лишнее to.",caution:"Не удаляйте слова только потому, что они повторяются. Проверяйте смысл и структуру."}
  },
  "articles": {
    hy: {steps:["Որոշիր՝ գոյականը հաշվելի՞ է, եզակի՞, թե հոգնակի։","Առաջին անգամ հիշատակվող եզակի հաշվելի գոյականի համար սովորաբար պետք է a/an․ ընտրիր ըստ հնչյունի։","The-ն գործածիր, եթե խոսքը որոշակի կամ արդեն հայտնի առարկայի մասին է։"],
      contrast:"I saw a dog. The dog was friendly. / An hour (ձայնավոր հնչյուն), a university (բաղաձայն հնչյուն).",caution:"A/an-ը ոչ բոլոր գոյականների հետ է. ստուգիր հաշվելիությունն ու համատեքստը։"},
    en: {steps:["Check whether the noun is countable, singular or plural.","Use a/an for a new singular countable noun, choosing by sound.","Use the for a specific or already identified referent."],
      contrast:"I saw a dog. The dog was friendly. / An hour, a university.",caution:"Article choice depends on meaning and pronunciation, not spelling alone."},
    ru: {steps:["Определите исчисляемость и число существительного.","Для впервые упомянутого исчисляемого существительного в ед. числе обычно нужен a/an по произношению.","The используется для определённого или уже известного предмета."],
      contrast:"I saw a dog. The dog was friendly. / An hour, a university.",caution:"Проверяйте смысл и звук, а не только букву."}
  },
  "subject-verb": {
    hy: {steps:["Գտիր նախադասության իրական ենթական՝ շրջանցելով միջանկյալ դարձվածքները։","Որոշիր ենթակայի թիվը և ընտրված ժամանակաձևը։","Ընտրիր բայի համապատասխան ձևը․ Present Simple-ում he/she/it-ի հետ սովորաբար ավելանում է -s։"],
      contrast:"The list of items is long (ենթական՝ list). The items are important (ենթական՝ items).",caution:"Of-ով դարձվածքի հոգնակի գոյականը հաճախ հիմնական ենթական չէ։"},
    en: {steps:["Find the true subject, ignoring interrupting phrases.","Determine subject number and tense.","Choose the matching verb form; Present Simple normally uses -s with he/she/it."],
      contrast:"The list of items is long; the items are important.",caution:"A plural noun inside an of-phrase is not necessarily the subject."},
    ru: {steps:["Найдите настоящее подлежащее, не отвлекаясь на вставные обороты.","Проверьте число и время.","Выберите подходящую форму глагола; в Present Simple с he/she/it обычно -s."],
      contrast:"The list of items is long; the items are important.",caution:"Существительное после of не всегда является подлежащим."}
  },
  "prepositions": {
    hy: {steps:["Գտիր նախդրի կառավարող բայը, ածականը կամ գոյականը։","Որոշիր՝ ժամանակի՞, վայրի՞, ուղղության՞, թե կայուն կապակցության մասին է խոսքը։","Ստուգիր ամբողջ արտահայտությունը, օրինակ՝ depend on, interested in, arrive at/in։"],
      contrast:"Arrive at the station, arrive in London, depend on someone.",caution:"Նախդիրները հաճախ չեն թարգմանվում բառացի․ հիշիր ամբողջ կապակցությունը։"},
    en: {steps:["Identify the verb, adjective or noun governing the preposition.","Decide whether the meaning is time, place, movement or a fixed collocation.","Check the complete expression, e.g. depend on or interested in."],
      contrast:"Arrive at the station; arrive in London; depend on someone.",caution:"Literal word-for-word translation can lead to the wrong preposition."},
    ru: {steps:["Определите слово, от которого зависит предлог.","Уточните значение: время, место, направление или устойчивое сочетание.","Проверьте выражение целиком: depend on, interested in."],
      contrast:"Arrive at the station; arrive in London; depend on someone.",caution:"Предлоги часто не переводятся буквально."}
  },
  "comparison": {
    hy: {steps:["Որոշիր՝ համեմատո՞ւմ ես երկու առարկա, թե ընտրում ես ամենաբարձր աստիճանը խմբում։","Կարճ ածականների հետ սովորաբար օգտագործիր -er/-est, երկարների հետ՝ more/most։","Ստուգիր, որ more և -er միաժամանակ չկիրառվեն նույն ածականի հետ։"],
      contrast:"This book is better than that one. / This is the best book here.",caution:"More better-ը կրկնակի համեմատական է և սովորաբար սխալ։ Բացառիկ ձևերը սովորիր առանձին։"},
    en: {steps:["Decide whether comparing two things or selecting a maximum within a group.","Use -er/-est with many short adjectives and more/most with many longer ones.","Avoid combining more with a comparative suffix for the same adjective."],
      contrast:"This book is better than that one; this is the best book here.",caution:"More better is generally an incorrect double comparison; learn irregular forms."},
    ru: {steps:["Определите: сравнение двух предметов или превосходная степень в группе.","Для многих коротких прилагательных используйте -er/-est, для длинных — more/most.","Не соединяйте more и суффикс -er у одного прилагательного."],
      contrast:"This book is better than that one; this is the best book here.",caution:"More better — ошибочная двойная сравнительная форма."}
  },
  "questions": {
    hy: {steps:["Գտիր ժամանակաձևը և օժանդակ բայը։","Սովորական հարցականում օժանդակ բայը դիր ենթակայից առաջ։","Եթե do/does/did ես օգտագործում, հիմնական բայը պահիր սկզբնական ձևով։"],
      contrast:"Does she work here? (ոչ թե Does she works here?) / Where did they go?",caution:"Ենթակայի մասին հարցերում do/does-ը միշտ չէ, որ անհրաժեշտ է։"},
    en: {steps:["Identify tense and auxiliary.","Invert auxiliary and subject for an ordinary direct question.","After do/does/did, use the base form of the main verb."],
      contrast:"Does she work here? (not Does she works here?) / Where did they go?",caution:"Subject questions may not need do-support."},
    ru: {steps:["Определите время и вспомогательный глагол.","В прямом вопросе поставьте вспомогательный глагол перед подлежащим.","После do/does/did используйте начальную форму основного глагола."],
      contrast:"Does she work here? (не Does she works here?) / Where did they go?",caution:"В вопросе к подлежащему do/does нужен не всегда."}
  },
  "passive": {
    hy: {steps:["Որոշիր՝ ենթական գործողությունն անո՞ւմ է, թե ենթարկվում է դրան։","Ընտրիր be օժանդակ բայի ճիշտ ժամանակաձևը։","Ավելացրու հիմնական բայի երրորդ ձևը (V3)։"],
      contrast:"They built the bridge (Active). The bridge was built (Passive).",caution:"Մի՛ գրիր was build․ Past Simple Passive-ում անհրաժեշտ է was/were + V3։"},
    en: {steps:["Decide whether the subject performs or receives the action.","Put be in the required tense.","Use the past participle (V3) of the main verb."],
      contrast:"They built the bridge (active); the bridge was built (passive).",caution:"Use was built, not was build."},
    ru: {steps:["Определите, действует ли подлежащее или подвергается действию.","Выберите нужное время глагола be.","Добавьте третью форму основного глагола (V3)."],
      contrast:"They built the bridge — актив; the bridge was built — пассив.",caution:"Правильно was built, а не was build."}
  }
};
