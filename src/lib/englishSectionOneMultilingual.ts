import { SECTION_ONE_EXPLANATIONS } from "./englishSectionOneExplanations";
import { SECTION_ONE_TEXTS_4_9 } from "./englishSectionOneTexts4to9";
import { SECTION_ONE_TEXTS_10_15 } from "./englishSectionOneTexts10to15";
import { SECTION_ONE_TEXTS_16_20 } from "./englishSectionOneTexts16to20";
import { SECTION_ONE_TEXTS_21_25 } from "./englishSectionOneTexts21to25";
type Language = "hy" | "en" | "ru";
type Explanation = Record<Language, string>;
const DETAILS: Record<string, Explanation> = {
 "1-1-Text1:1": {hy:"Տեքստը ներկայացնում է Ուոլթ Դիսնեյի կյանքը, ֆիլմերն ու թեմատիկ այգիները։ Ուստի հիմնական թեման նրա ժառանգությունն է, ոչ թե միայն մանկությունը կամ մուլտֆիլմերը։",en:"The passage covers Walt Disney's life, films, and theme parks. Its main topic is his legacy, not just his childhood or cartoons.",ru:"Текст рассказывает о жизни Уолта Диснея, его фильмах и тематических парках. Главная тема — его наследие, а не только детство или мультфильмы."},
 "1-1-Text1:2": {hy:"12–14-րդ տողերում ասվում է, որ Snow White-ը առաջին լիամետրաժ մուլտֆիլմն էր։",en:"Lines 12–14 identify Snow White as the first full-length cartoon film.",ru:"В строках 12–14 сказано, что «Белоснежка» стала первым полнометражным мультфильмом."},
 "1-1-Text1:3": {hy:"Enduring բառը նշանակում է «երկարատև, պահպանվող»։ Այստեղ այն բնութագրում է տարիներով ճանաչված ստեղծագործությունները։",en:"Enduring means lasting. Here it describes creations that remained popular over time.",ru:"Enduring означает «долговечный, сохраняющийся». Здесь речь о произведениях, популярных долгие годы."},
 "1-1-Text1:4": {hy:"Վերջին պարբերությունը նկարագրում է այգիների շարունակական հաջողությունը և ապագա ծրագրերը, հետևաբար Դիսնեյի անունը հավանաբար կմնա հայտնի։",en:"The final paragraph describes continuing success and future park plans, supporting the prediction that Disney's name will remain well known.",ru:"В последнем абзаце говорится об успехе парков и новых планах, поэтому имя Диснея, вероятно, останется известным."},
 "1-1-Text1:5": {hy:"14–15-րդ տողերում գրված է both animated and not՝ և՛ անիմացիոն, և՛ ոչ անիմացիոն ֆիլմեր։",en:"Lines 14–15 explicitly say Disney's studio produced both animated and non-animated films.",ru:"В строках 14–15 прямо сказано, что студия выпускала как анимационные, так и неанимационные фильмы."},
 "1-1-Text2:1": {hy:"Տեքստի գլխավոր թեման Լոնդոնի կամրջի տեղափոխումն է Լոնդոնից Արիզոնա։",en:"The passage is mainly about London Bridge being moved from London to Arizona.",ru:"Основная тема текста — перенос Лондонского моста из Лондона в Аризону."},
 "1-1-Text2:2": {hy:"4-րդ տողում նշված է կամրջի հինգ կամարը՝ five curved arches։",en:"Line 4 states that the bridge has five curved arches.",ru:"В строке 4 указано, что у моста пять арок."},
 "1-1-Text2:3": {hy:"5-րդ տողում ասվում է, որ կամուրջը կառուցվել է 19-րդ դարի առաջին կեսին։",en:"Line 5 says the bridge was built in the first half of the nineteenth century.",ru:"В строке 5 сказано, что мост построили в первой половине XIX века."},
 "1-1-Text2:4": {hy:"8–9-րդ տողերում ասվում է, որ հին կամուրջը չափազանց նեղ էր, և քաղաքին անհրաժեշտ էր ավելի լայն կամուրջ։",en:"Lines 8–9 explain that the old bridge was too narrow and London needed a wider one.",ru:"В строках 8–9 объясняется, что старый мост был слишком узким и городу требовался более широкий."},
 "1-1-Text2:5": {hy:"12-րդ տողում գրված է two and a half million dollars՝ երկուսուկես միլիոն դոլար։",en:"Line 12 gives the price as two and a half million dollars.",ru:"В строке 12 указана цена — два с половиной миллиона долларов."},
 "1-1-Text3:1": {hy:"Առաջին տողում գրված է at least as early as 1758, այսինքն՝ ծագումը վերաբերում է 1758 թվականին կամ ավելի վաղ ժամանակի։",en:"The phrase 'at least as early as 1758' means the origin dates to 1758 or earlier.",ru:"Выражение 'at least as early as 1758' означает, что происхождение относится к 1758 году или более раннему времени."},
 "1-1-Text3:2": {hy:"7-րդ տողի it դերանունը վերաբերում է նախորդ նախադասության willow bark-ին՝ ուռենու կեղևին, որը Սթոունը մանրացրել էր։",en:"The pronoun 'it' refers back to willow bark, which Stone obtained and crushed.",ru:"Местоимение 'it' относится к коре ивы (willow bark), которую Стоун взял и измельчил."},
 "1-1-Text3:3": {hy:"Properties-ը այստեղ նշանակում է հատկություններ՝ characteristics, ոչ թե սեփականություն։",en:"In this context 'properties' means characteristics or qualities, not ownership.",ru:"В данном контексте 'properties' означает свойства или характеристики, а не собственность."},
 "1-1-Text3:4": {hy:"12–16-րդ տողերում ասվում է, որ իտալացի գիտնականներ Բրունյատելլին և Ֆոնտանան ուսումնասիրել են ուռենու կեղևը։",en:"Lines 12–16 state that the Italian scientists Brugnatelli and Fontana studied willow bark.",ru:"В строках 12–16 говорится, что итальянские учёные Бруньятелли и Фонтана изучали кору ивы."},
 "1-1-Text3:5": {hy:"12–16-րդ տողերում անվանվում է salicin քիմիական նյութը։ Հենց այդ հատվածն է պահանջում հարցը։",en:"Lines 12–16 name salicin as the active chemical; that is the location asked for.",ru:"В строках 12–16 названо активное вещество салицин. Именно этот фрагмент требуется найти."},
};
export function getOfflineEnglishExplanation(unitId:string, questionNumber:string, language:string):string|undefined {
 const key = unitId + ":" + questionNumber;
 const entry = DETAILS[key];
 const additional = SECTION_ONE_TEXTS_4_9[key] ?? SECTION_ONE_TEXTS_10_15[key] ?? SECTION_ONE_TEXTS_16_20[key] ?? SECTION_ONE_TEXTS_21_25[key];
 if (additional) return additional[language === "ru" ? 2 : language === "en" ? 1 : 0];
 if (entry) return entry[language === "ru" || language === "en" ? language : "hy"];
 return SECTION_ONE_EXPLANATIONS[key];
}
