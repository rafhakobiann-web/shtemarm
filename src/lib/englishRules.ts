export type EnglishRule = { id: string; title: string; armenian: string; example: string };
export const ENGLISH_RULES: EnglishRule[] = [
  { id:"be",title:"Verb to be",armenian:"Ներկա ժամանակում I-ի հետ գործածվում է am, he/she/it-ի հետ՝ is, իսկ we/you/they-ի հետ՝ are։",example:"She is a student. We are ready." },
  { id:"present-simple",title:"Present Simple",armenian:"Սովորությունների և կրկնվող գործողությունների համար օգտագործիր Present Simple։ He/she/it-ի հետ հաստատական նախադասության բային սովորաբար ավելանում է -s/-es։",example:"We play football. He plays chess." },
  { id:"past-simple",title:"Past Simple",armenian:"Անցյալում ավարտված գործողությունները արտահայտվում են Past Simple-ով։ Կանոնավոր բայերին սովորաբար ավելացվում է -ed, անկանոն բայերն ունեն առանձին ձևեր։",example:"We watched a film yesterday." },
  { id:"since-for",title:"Since and for",armenian:"Since-ը նշում է ժամանակի մեկնարկային պահը, for-ը՝ տևողությունը։",example:"I have lived here since 2022. I have lived here for four years." },
  { id:"comparative",title:"Comparatives",armenian:"Երկու առարկա համեմատելիս կարճ ածականներին սովորաբար ավելացվում է -er, իսկ երկար ածականների հետ գործածվում է more։ Կան բացառություններ։",example:"This bag is cheaper than that one." },
  { id:"modal",title:"Modal verbs",armenian:"Can, must և այլ մոդալ բայերից հետո հիմնական բայը սովորաբար դրվում է առանց to-ի՝ սկզբնական ձևով։",example:"She can swim. You must study." },
  { id:"conditional",title:"Second conditional",armenian:"Երևակայական կամ քիչ հավանական ներկա իրավիճակների համար կիրառվում է if + past simple, would + բայի սկզբնական ձև։",example:"If I had time, I would join." },
  { id:"passive",title:"Passive voice",armenian:"Կրավորական սեռը կազմվում է be բայի համապատասխան ձևով և անցյալ դերբայով (past participle)։",example:"The emails were sent yesterday." },
  { id:"gerund",title:"Gerunds after prepositions",armenian:"Նախդիրներից հետո բայը սովորաբար օգտագործվում է -ing ձևով։ Be used to արտահայտության to-ն նախդիր է։",example:"I am used to getting up early." },
  { id:"uncountable",title:"Countable and uncountable nouns",armenian:"Much-ը սովորաբար օգտագործվում է անհաշվելի գոյականների հետ, many-ը՝ հաշվելի հոգնակի գոյականների հետ։",example:"There isn't much milk left." },
];
export function ruleForEnglishQuestion(id: string, explanation: string, skill: string): EnglishRule | undefined {
  if (skill !== "grammar" && skill !== "use-of-english") return undefined;
  const s = explanation.toLowerCase();
  const tests: [RegExp,string][] = [
    [/\b(am|is|are)\b.*\b(i|he|she|plural|we)\b|\buse .is. with\b/,"be"],
    [/present simple|base verb with|third.person/,"present-simple"],
    [/past simple.*(finished|yesterday)|finished event yesterday/,"past-simple"],
    [/\bsince\b|\bfor\b.*starting point/,"since-for"],
    [/comparative|cheaper|than to compare/,"comparative"],
    [/modal verb|\bmust\b.*obligation|\bcan\b.*base/,"modal"],
    [/second conditional|if.clause/,"conditional"],
    [/passive|past participle/,"passive"],
    [/gerund|used to.*followed/,"gerund"],
    [/uncountable|\bmuch\b.*milk/,"uncountable"],
  ];
  const found = tests.find(([pattern]) => pattern.test(s));
  return found ? ENGLISH_RULES.find(rule => rule.id === found[1]) : undefined;
}
