import type { GrammarLanguage } from "./grammarHandbookTypes";
import { EXPANDED_GRAMMAR_DEEP_DIVES } from "./grammarDeepDivesExpanded";

export type GrammarDeepDive = {
  steps: readonly string[];
  contrast: string;
  caution: string;
};
type Three = Record<GrammarLanguage, GrammarDeepDive>;

/** Hand-authored explanations; examples teach a pattern, not a claimed answer to a book question. */
export const GRAMMAR_DEEP_DIVES: Readonly<Record<string, Three>> = {
  "future-perfect": {
    hy: {steps:["Գտիր ապագայի սահմանային պահը՝ by Friday, by the time և այլն։","Որոշիր՝ գործողությունն այդ պահին արդեն ավարտվա՞ծ կլինի։","Կազմիր will have + V3. Հարցականում will-ը տեղափոխիր ենթակայից առաջ։"],contrast:"I will finish at five = կավարտեմ հինգին։ I will have finished by five = մինչև հինգը արդեն ավարտած կլինեմ։",caution:"By-ը նշանակում է «ոչ ուշ, քան», իսկ until-ը հաճախ ցույց է տալիս գործողության շարունակությունը մինչև պահը։"},
    en: {steps:["Find a future deadline, such as by Friday or by the time.","Ask whether the action will already be complete before that point.","Use will have + past participle; invert will for questions."],contrast:"I will finish at five states when; I will have finished by five states completion before the deadline.",caution:"By marks a deadline; until often marks continuation up to a time."},
    ru: {steps:["Найдите будущую границу: by Friday, by the time.","Определите, будет ли действие уже завершено к этому моменту.","Постройте will have + V3; в вопросе вынесите will вперёд."],contrast:"I will finish at five — закончу в пять; I will have finished by five — уже закончу к пяти.",caution:"By обозначает срок завершения; until часто означает продолжение до момента."}
  },
  "future-continuous": {
    hy: {steps:["Ընտրիր ապագայի կոնկրետ պահ՝ at 8 tomorrow։","Պարզիր՝ գործողությունն այդ պահին ընթացքի մե՞ջ կլինի։","Օգտագործիր will be + V-ing՝ անկախ ենթակայից։"],contrast:"I will study tomorrow = կսովորեմ վաղը։ I will be studying at eight = ժամը ութին սովորելու ընթացքում կլինեմ։",caution:"Future Continuous-ը պարտադիր չէ ապագայի բոլոր գործողությունների համար. ավարտի փաստը և ընթացքը տարբեր են։"},
    en: {steps:["Choose a specific future time.","Decide whether the action will be in progress then.","Form will be + -ing for every subject."],contrast:"I will study tomorrow focuses on the event; I will be studying at eight focuses on its progress.",caution:"Do not use this tense for every future statement; choose it when duration or progress matters."},
    ru: {steps:["Выберите конкретный момент в будущем.","Проверьте, будет ли действие происходить в этот момент.","Используйте will be + V-ing для любого подлежащего."],contrast:"I will study tomorrow — событие; I will be studying at eight — процесс в восемь.",caution:"Это время не требуется для каждого будущего действия; важен акцент на процессе."}
  },
  "past-perfect-continuous": {
    hy: {steps:["Գտիր անցյալում երկրորդ իրադարձությունը՝ before the bus arrived։","Ստուգիր՝ առաջին գործողությունը մինչ այդ տևե՞լ է որոշ ժամանակ։","Կազմիր had been + V-ing, հաճախ՝ for կամ since-ով։"],contrast:"She had waited կարող է շեշտել փաստը։ She had been waiting շեշտում է տևողությունը կամ ընթացքը։",caution:"Վիճակ նկարագրող որոշ բայեր (օր. know) սովորաբար չեն գործածվում Continuous-ով։"},
    en: {steps:["Identify the later past reference event.","Check whether the earlier activity had continued for a period.","Use had been + -ing, often with for or since."],contrast:"Had waited may focus on completion; had been waiting emphasizes duration or ongoing activity.",caution:"Many stative verbs, such as know, are not normally used in continuous forms."},
    ru: {steps:["Найдите более позднее событие в прошлом.","Определите, длилось ли первое действие до этого события.","Используйте had been + V-ing, часто с for или since."],contrast:"Had waited может подчёркивать результат; had been waiting — длительность.",caution:"Многие глаголы состояния, например know, обычно не употребляются в Continuous."}
  },
  "mixed-conditionals": {
    hy: {steps:["Առանձին որոշիր պայմանի ժամանակը և հետևանքի ժամանակը։","Եթե պայմանը անցյալում չկատարված է, օգտագործիր if + had + V3։","Եթե հետևանքը վերաբերում է ներկային, օգտագործիր would + V։"],contrast:"If I had studied, I would have passed = անցյալի արդյունք։ If I had studied, I would know it now = ներկայի արդյունք։",caution:"Խառը պայմանականների բոլոր օրինակները նույն բանաձևով չեն կազմվում. ժամանակային կապը ստուգիր։"},
    en: {steps:["Identify the time of the condition and of the result separately.","For an unreal past condition, use if + had + past participle.","For an unreal present result, use would + base verb."],contrast:"If I had studied, I would have passed: past result. If I had studied, I would know it now: present result.",caution:"Mixed conditionals have more than one pattern; match both time frames."},
    ru: {steps:["Отдельно определите время условия и результата.","Для нереального прошлого условия: if + had + V3.","Для нереального результата в настоящем: would + V."],contrast:"If I had studied, I would have passed — прошлый результат; I would know it now — результат сейчас.",caution:"У смешанных условных предложений есть несколько схем; учитывайте оба времени."}
  },
  "neither-either": {
    hy: {steps:["Որոշիր իմաստը՝ մեկը, ոչ մեկը, թե երկուսն էլ։","Ընտրիր համապատասխան զույգը՝ either/or, neither/nor կամ both/and։","Ստուգիր բայի համաձայնությունը՝ հատկապես տարբեր դեմքերով ենթակաների դեպքում։"],contrast:"Either tea or coffee = մեկը։ Neither tea nor coffee = ոչ մեկը։ Both tea and coffee = երկուսն էլ։",caution:"Neither ... nor և either ... or կառույցներում համաձայնության կանոնները կարող են կախված լինել մոտակա ենթակայից։"},
    en: {steps:["Decide whether you mean one, neither, or both.","Choose either/or, neither/nor, or both/and.","Check subject–verb agreement, especially with different subjects."],contrast:"Either tea or coffee: one; neither: none; both: the two together.",caution:"Agreement with either/or and neither/nor can depend on the nearest subject."},
    ru: {steps:["Определите смысл: один, ни один или оба.","Выберите either/or, neither/nor или both/and.","Проверьте согласование сказуемого с подлежащим."],contrast:"Either tea or coffee — один вариант; neither — ни один; both — оба.",caution:"Согласование при either/or и neither/nor иногда зависит от ближайшего подлежащего."}
  },
  "so-such": {
    hy: {steps:["Ստուգիր՝ հաջորդում է միայն ածական/մակբա՞յ, թե գոյականային խումբ։","Ածականի հետ ընտրիր so, գոյականային խմբի հետ՝ such։","Too-ի դեպքում գնահատիր «չափազանց», enough-ի դեպքում՝ «բավական» իմաստը։"],contrast:"So beautiful = այնքան գեղեցիկ։ Such a beautiful day = այդպիսի գեղեցիկ օր։ Too hot to drink = չափազանց տաք։",caution:"So many / so much բացառություն է պարզ «so + adjective» հուշումից։"},
    en: {steps:["Check whether the following phrase is an adjective/adverb or a noun phrase.","Use so with adjectives/adverbs; such with noun phrases.","Choose too for excess and enough for sufficiency."],contrast:"So beautiful versus such a beautiful day; too hot to drink versus warm enough to drink.",caution:"So many and so much are important exceptions to the simple pattern."},
    ru: {steps:["Определите, идёт ли далее прилагательное/наречие или именная группа.","С прилагательным используйте so, с именной группой — such.","Too означает чрезмерность, enough — достаточность."],contrast:"So beautiful — так красиво; such a beautiful day — такой прекрасный день.",caution:"So many и so much — важные исключения из упрощённого правила."}
  },
  "adjective-order": {
    hy: {steps:["Գտիր գոյականը, որին վերաբերում են ածականները։","Դասակարգիր ածականները՝ գնահատական, չափ, տարիք, գույն, ծագում, նյութ։","Ընտրիր բնական հերթականությունը և բարձրաձայն կարդա արտահայտությունը։"],contrast:"A beautiful small wooden box բնական է, քանի որ գնահատականը նախորդում է չափին և նյութին։",caution:"Սա սովորական հերթականություն է, ոչ անփոփոխ օրենք. շեշտադրումը և կայուն կապակցությունները կարող են փոխել այն։"},
    en: {steps:["Identify the noun being described.","Classify modifiers: opinion, size, age, colour, origin, material.","Put them in the conventional order and reread the phrase."],contrast:"A beautiful small wooden box sounds natural: opinion before size before material.",caution:"This is a tendency, not an absolute law; emphasis and fixed expressions matter."},
    ru: {steps:["Найдите определяемое существительное.","Распределите определения: оценка, размер, возраст, цвет, происхождение, материал.","Расположите их в обычном порядке и перечитайте сочетание."],contrast:"A beautiful small wooden box: оценка стоит перед размером и материалом.",caution:"Это тенденция, а не жёсткий закон: акцент и устойчивые сочетания влияют на порядок."}
  },
  "determiners": {
    hy: {steps:["Ստուգիր՝ գոյականը եզակի հաշվելի՞ է, հոգնակի՞, թե անհաշվելի։","Each/every-ի հետ սովորաբար ընտրիր եզակի հաշվելի գոյական։","All-ի հետ համաձայնեցրու բայը իրական գոյականի թվին։"],contrast:"Every student has a book։ All students have books։ All the water is clean։",caution:"Every-ն անհաշվելի գոյականի հետ ուղղակի չի գործածվում. օգտագործիր համապատասխան այլ որոշիչ։"},
    en: {steps:["Identify whether the noun is singular countable, plural, or uncountable.","Use each/every with singular countable nouns.","With all, agree the verb with the actual noun phrase."],contrast:"Every student has a book; all students have books; all the water is clean.",caution:"Do not place every directly before an uncountable noun."},
    ru: {steps:["Определите тип существительного: единственное исчисляемое, множественное или неисчисляемое.","С each/every обычно нужно единственное исчисляемое существительное.","После all согласуйте глагол с существительным."],contrast:"Every student has; all students have; all the water is.",caution:"Every нельзя напрямую ставить перед неисчисляемым существительным."}
  },
  ...EXPANDED_GRAMMAR_DEEP_DIVES,
};
