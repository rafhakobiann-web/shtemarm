import type { ExplanationInput } from "./explanation";
type Locale="hy"|"en"|"ru";
type Rule={id:string;test:RegExp;texts:Record<Locale,string>};
const RULES:Rule[]=[
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
 else lines.push(t.unknown);
 return lines.join("\n\n");
}
