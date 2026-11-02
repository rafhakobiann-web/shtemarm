import type { ExplanationInput } from "./explanation";
type Locale="hy"|"en"|"ru";
type Rule={id:string;test:RegExp;texts:Record<Locale,string>};
const RULES:Rule[]=[
{id:"articles",test:/\b(articles?|a\s*\/\s*an\s*\/\s*the|definite article|indefinite article)\b/i,texts:{
hy:"a/an-ը օգտագործվում է եզակի հաշվելի գոյականի հետ՝ առաջին հիշատակման կամ ոչ որոշակիության դեպքում։ a կամ an ընտրիր ըստ հաջորդող բառի արտասանության, ոչ միայն առաջին տառի։ the-ն օգտագործվում է որոշակի կամ արդեն հայտնի առարկայի դեպքում։",
en:"Use a/an with a singular countable noun when its identity is not specified; choose a or an by the following sound, not just the letter. Use the for a specific or previously identified referent.",
ru:"a/an употребляют с исчисляемым существительным в единственном числе при неопределённости; выбор зависит от звука следующего слова. the указывает на конкретный или уже известный предмет."}},
{id:"prepositions",test:/\b(prepositions?|preposition of (time|place)|in on at)\b/i,texts:{
hy:"Ժամանակի համար at-ը հաճախ գործածվում է ճշգրիտ ժամի, on-ը՝ օրերի և ամսաթվերի, in-ը՝ ամիսների, տարիների և ավելի երկար ժամանակահատվածների հետ։ Տեղի նշանակությամբ կիրառությունը կախված է համատեքստից և կայուն կապակցություններից։",
en:"For time, at commonly marks exact times, on days and dates, and in months, years and longer periods. Place prepositions depend on the specific context and fixed expressions.",
ru:"Для времени at обычно обозначает точное время, on — дни и даты, in — месяцы, годы и периоды. Предлоги места зависят от контекста и устойчивых выражений."}},
{id:"modals",test:/\b(modal verbs?|modal auxiliaries|must vs have to|should vs must)\b/i,texts:{
hy:"Մոդալ բայերից (can, must, should, may) հետո հիմնական բայը սովորաբար դրվում է առանց to-ի սկզբնական ձևով։ must-ը հաճախ արտահայտում է անհրաժեշտություն, should-ը՝ խորհուրդ, may-ը՝ հնարավորություն կամ թույլտվություն։",
en:"Modal auxiliaries such as can, must, should and may normally take the bare infinitive. Must commonly expresses necessity, should advice, and may possibility or permission.",
ru:"После can, must, should, may обычно употребляют инфинитив без to. Must часто выражает необходимость, should — совет, may — возможность или разрешение."}},
{id:"subject-verb-agreement",test:/\b(subject.?verb agreement|subject and verb agreement|singular or plural verb)\b/i,texts:{
hy:"Ենթական և ստորոգյալը համաձայնեցրու թվով ու դեմքով։ Present Simple-ում եզակի երրորդ դեմքի հետ բայը սովորաբար ստանում է -s/-es, իսկ բազմակի ենթակայի հետ՝ ոչ։ Ստուգիր իրական ենթական, ոչ թե մոտակա գոյականը։",
en:"Match the verb to the actual subject in person and number. In the present simple, third-person singular usually takes -s/-es. Ignore intervening phrases when identifying the subject.",
ru:"Согласуйте сказуемое с подлежащим по лицу и числу. В Present Simple третье лицо единственного числа обычно требует -s/-es. Определяйте подлежащее, не ориентируясь на ближайшее существительное."}},
{id:"question-tags",test:/\b(question tags?|tag questions?)\b/i,texts:{
hy:"Հարցական պոչիկը սովորաբար հակառակ բևեռականություն ունի. դրական նախադասությանը՝ ժխտական պոչիկ, ժխտականին՝ դրական։ Օժանդակ բայն ու դերանունը համաձայնեցրու հիմնական նախադասությանը։",
en:"Question tags normally reverse polarity: positive statement, negative tag; negative statement, positive tag. Match the auxiliary and pronoun to the main clause.",
ru:"Разделительный вопрос обычно меняет полярность: утвердительная часть — отрицательный хвостик, и наоборот. Согласуйте вспомогательный глагол и местоимение."}},

{id:"conditional-third",test:/\b(third conditional|type 3 conditional|if\s+.{0,75}\bhad\s+\w+|would have\s+\w+)\b/i,texts:{
hy:"Երրորդ պայմանականը նկարագրում է անցյալում չիրականացած պայման. if + Past Perfect, would/could/might have + V3։ Համեմատիր գործողությունների ժամանակները և ընտրիր այս կառուցվածքին համապատասխան ձևը։",
en:"The third conditional describes an unreal past condition: if + past perfect, would/could/might have + past participle. Check the timing of both clauses.",
ru:"Третий тип условных предложений описывает нереальное прошлое: if + Past Perfect, would/could/might have + V3. Проверьте времена обеих частей."}},
{id:"conditional-second",test:/\b(second conditional|type 2 conditional|if\s+.{0,60}\bwere\b.{0,60}\bwould\b)\b/i,texts:{
hy:"Երկրորդ պայմանականը վերաբերում է ներկայի կամ ապագայի անիրական/քիչ հավանական իրավիճակին. if + Past Simple, would + բայի սկզբնական ձև։",
en:"The second conditional describes an unreal or unlikely present/future situation: if + past simple, would + base verb.",
ru:"Второй тип условных предложений выражает нереальное или маловероятное настоящее/будущее: if + Past Simple, would + начальная форма глагола."}},
{id:"passive",test:/\b(passive voice|passive form|active into passive|change.*passive)\b/i,texts:{
hy:"Կրավորական սեռում գործառույթն արտահայտվում է be + V3 ձևով։ be-ն համաձայնեցրու ենթակայի թվին ու նախադասության ժամանակաձևին։",
en:"Passive voice uses be + past participle. Conjugate be for the sentence's tense and subject agreement.",
ru:"Страдательный залог образуется be + V3. Форму be выбирают по времени и согласуют с подлежащим."}},
{id:"reported",test:/\b(reported speech|indirect speech|report(ed)? (the|his|her) words)\b/i,texts:{
hy:"Անուղղակի խոսքում ստուգիր հաղորդող բայի ժամանակը, դերանունները և ժամանակի/վայրի ցուցիչները։ Անցյալում հաղորդելիս հաճախ կատարվում է ժամանակաձևի հետադարձ փոփոխություն։",
en:"In reported speech, check the reporting verb, pronouns, and time/place words. Backshift is common after a past reporting verb but not universal.",
ru:"В косвенной речи учитывайте время вводящего глагола, местоимения и указатели времени/места. Сдвиг времён зависит от контекста."}},
{id:"relative",test:/\b(relative clause|relative pronoun|who or which|which or that)\b/i,texts:{
hy:"Որոշիչ երկրորդականում who-ն սովորաբար վերաբերում է մարդկանց, which-ը՝ իրերին, that-ը՝ սահմանափակող որոշիչ կառույցներում մարդկանց կամ իրերին։ Ստուգիր նաև նախադասության կետադրությունը։",
en:"Relative clauses use who for people, which for things, and that in many defining clauses. Also check whether the clause is defining or non-defining.",
ru:"В относительных придаточных who относится к людям, which — к предметам, that возможно во многих ограничительных придаточных. Учитывайте запятые."}},
{id:"perfect",test:/\b(present perfect|past perfect|future perfect|have been|has been|had been)\b/i,texts:{
hy:"Perfect ժամանակաձևերում հիմնական կառուցվածքը have/has/had + V3 է։ Present Perfect-ը կապում է անցյալը ներկային, Past Perfect-ը՝ մի անցյալ գործողությունը մյուսից ավելի վաղ պահի հետ։",
en:"Perfect tenses use have/has/had + past participle. Present perfect connects past events to now; past perfect places one event before another past event.",
ru:"Времена Perfect используют have/has/had + V3. Present Perfect связывает прошлое с настоящим, Past Perfect указывает на более раннее событие в прошлом."}},
{id:"comparison",test:/\b(comparative|superlative|degrees? of comparison|more than|the most)\b/i,texts:{
hy:"Comparative-ը համեմատում է երկու առարկա (-er / more), superlative-ը՝ խմբի առավելագույնը (the -est / the most)։ Հիշիր բացառությունները՝ good → better → best։",
en:"Comparatives compare two items (-er/more); superlatives identify an extreme in a group (the -est/the most). Irregular: good → better → best.",
ru:"Сравнительная степень сопоставляет два объекта (-er/more), превосходная — выделяет крайний признак в группе (the -est/the most). Исключение: good → better → best."}},
{id:"gerund",test:/\b(gerund|infinitive|to-infinitive|verb\s*\+\s*ing)\b/i,texts:{
hy:"Բայից հետո -ing կամ to + infinitive ընտրությունը կախված է տվյալ բայի կառավարումից և իմաստից։ Օրինակ՝ enjoy doing, decide to do. Մի՛ ենթադրիր, որ բոլոր բայերի հետ նույն ձևն է։",
en:"Whether a verb takes -ing or to + infinitive depends on the governing verb and meaning: enjoy doing, decide to do. There is no universal single form.",
ru:"Выбор -ing или to + infinitive зависит от глагола и смысла: enjoy doing, decide to do. Единого правила для всех глаголов нет."}},
];

// A useful subject-specific study method when no reviewed solution exists.
// These are learning steps, never a claim that a specific answer is proven.
const STUDY_STEPS: Record<Locale, Record<"math"|"biology"|"history"|"physics",string>> = {
 hy: {
  math:"Լուծման ուղեցույց․ 1. Առանձնացրու տրվածներն ու պահանջվողը։ 2. Ընտրիր համապատասխան բանաձևը կամ թեորեմը։ 3. Հաշվիր հերթականությամբ և ստուգիր արդյունքը՝ տեղադրելով սկզբնական պայմանում։",
  biology:"Ուսումնասիրության քայլեր․ 1. Գտիր հարցի հիմնական կենսաբանական հասկացությունը։ 2. Համեմատիր տարբերակները դասագրքի սահմանումների հետ։ 3. Բացառիր հակասող պնդումները և ստուգիր պատասխանը սկզբնաղբյուրով։",
  history:"Ուսումնասիրության քայլեր․ 1. Որոշիր ժամանակաշրջանն ու պատմական իրադարձությունը։ 2. Տարբերակիր պատճառները, ընթացքը և հետևանքները։ 3. Համեմատիր տարեթվերն ու անունները դասագրքի հետ։",
  physics:"Լուծման ուղեցույց․ 1. Գրիր հայտնի մեծություններն ու միավորները։ 2. Ընտրիր համապատասխան ֆիզիկական օրենքը։ 3. Կատարիր հաշվարկը և ստուգիր չափման միավորներն ու արդյունքի իմաստը։"
 },
 en: {
  math:"Study steps: 1. Identify the givens and the unknown. 2. Choose a relevant formula or theorem. 3. Work through the calculation and check it against the original conditions.",
  biology:"Study steps: 1. Identify the biological concept. 2. Compare choices with textbook definitions. 3. Eliminate contradictions and verify against the source.",
  history:"Study steps: 1. Identify the period and event. 2. Separate causes, events and consequences. 3. Check dates and names against the textbook.",
  physics:"Study steps: 1. List quantities and units. 2. Select the relevant physical law. 3. Calculate and check dimensions and plausibility."
 },
 ru: {
  math:"Шаги: 1. Выпишите данные и искомое. 2. Выберите формулу или теорему. 3. Выполните расчёт и проверьте ответ по условию.",
  biology:"Шаги: 1. Определите биологическое понятие. 2. Сравните варианты с определениями учебника. 3. Исключите противоречия и проверьте источник.",
  history:"Шаги: 1. Определите период и событие. 2. Разделите причины, ход и последствия. 3. Сверьте даты и имена с учебником.",
  physics:"Шаги: 1. Запишите величины и единицы. 2. Выберите физический закон. 3. Рассчитайте и проверьте единицы и смысл результата."
 }
};
function detectSubject(source:string): "math"|"biology"|"history"|"physics"|null {
 if (/մաթեմատիկ|հանրահաշիվ|երկրաչափ|mathematics|algebra|geometry|математик|геометр/i.test(source)) return "math";
 if (/կենսաբան|biology|биолог/i.test(source)) return "biology";
 if (/պատմութ|history|истори/i.test(source)) return "history";
 if (/ֆիզիկ|physics|физик/i.test(source)) return "physics";
 return null;
}

const NOTES={
hy:{answer:"Պատասխանների բանալու համաձայն՝",wrong:"Քո ընտրած տարբերակը՝",mismatch:"չի համընկնում բանալու հետ։",correct:"համընկնում է բանալու հետ։",unknown:"Այս հարցի համար դեռ չկա հաստատված անհատական հիմնավորում։ Միայն պատասխանների բանալուց չի կարելի վստահորեն վերականգնել լուծումը․ ուսումնասիրիր հարցի պայմանն ու համապատասխան բաժնի կանոնը։",rule:"Համապատասխան քերականական կանոն",note:"Կանոնը ընդհանուր ուղեցույց է. միայն դրանով տվյալ տարբերակի ճիշտ լինելը հաստատված չէ։"},
en:{answer:"According to the answer key:",wrong:"Your selection:",mismatch:"does not match the key.",correct:"matches the key.",unknown:"A verified question-specific explanation is not yet available. The answer key alone does not establish the reasoning; review the source question and the related section.",rule:"Relevant grammar rule",note:"This is general guidance, not proof that a particular choice is correct."},
ru:{answer:"Согласно ключу ответов:",wrong:"Ваш выбор:",mismatch:"не совпадает с ключом.",correct:"совпадает с ключом.",unknown:"Проверенного объяснения именно этого вопроса пока нет. Одного ключа ответов недостаточно для доказательства; изучите условие и правила раздела.",rule:"Подходящее правило грамматики",note:"Это общее правило, а не доказательство правильности конкретного варианта."}
};
export function reliableEnglishFallback(input:ExplanationInput,locale:Locale="hy"){
 const t=NOTES[locale];
 const lines=[`${t.answer} ${input.correct}`];
 if(input.chosen)lines.push(`${t.wrong} ${input.chosen} — ${input.chosen===input.correct?t.correct:t.mismatch}`);
 // Identify rules only from the question and instruction, not arbitrary passage text.
 const source=`${input.instruction}\n${input.question}`;
 const rule=RULES.find(r=>r.test.test(source));
 if(rule)lines.push(`${t.rule}: ${rule.texts[locale]}\n${t.note}`);
 else {
  lines.push(t.unknown);
  const subject=detectSubject(input.instruction);
  if(subject) lines.push(STUDY_STEPS[locale][subject]);
 }
 return lines.join("\n\n");
}
