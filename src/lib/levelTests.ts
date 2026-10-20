/** Original, illustrative CEFR-style practice items for Shtemarm.
 * These are not copied from British Council or Cambridge. Review before publication.
 * Add a level by adding an entry to ENGLISH_LEVELS and a matching bank below.
 */
export type LevelQuestion = {
  id: string;
  type: "choice";
  skill: "grammar" | "vocabulary" | "reading" | "use-of-english";
  prompt: string;
  options: [string, string, string, string];
  answerIndex: number;
  explanation: string;
  passage?: string;
};
export type LevelConfig = { id: string; title: string; subtitle: string; description: string };
export const ENGLISH_LEVELS: LevelConfig[] = [
  { id: "a1", title: "A1", subtitle: "Beginner", description: "Սկսնակ մակարդակ" },
  { id: "a2", title: "A2", subtitle: "Elementary", description: "Տարրական մակարդակ" },
  { id: "b1", title: "B1", subtitle: "Intermediate", description: "Միջին մակարդակ" },
  { id: "b2", title: "B2", subtitle: "Upper-intermediate", description: "Միջինից բարձր մակարդակ" },
  { id: "c1", title: "C1", subtitle: "Advanced", description: "Բարձր մակարդակ" },
];
const q = (id: string, skill: LevelQuestion["skill"], prompt: string, options: LevelQuestion["options"], answerIndex: number, explanation: string, passage?: string): LevelQuestion => ({ id, type: "choice", skill, prompt, options, answerIndex, explanation, passage });
export const LEVEL_TEST_QUESTIONS: Record<string, LevelQuestion[]> = {
  a1: [
    q("a1-01","grammar","My sister ___ a student.",["am","is","are","be"],1,"Use ‘is’ with he, she, or it."),
    q("a1-02","vocabulary","Which word means the opposite of ‘big’?",["long","small","tall","wide"],1,"‘Small’ is the opposite of ‘big’."),
    q("a1-03","grammar","We ___ football on Saturdays.",["plays","playing","play","is play"],2,"Use the base verb with ‘we’ in the present simple."),
    q("a1-04","vocabulary","You sleep in a ___. ",["kitchen","garden","bedroom","office"],2,"A bedroom is the room where you usually sleep."),
    q("a1-05","grammar","There ___ two apples on the table.",["is","are","am","be"],1,"Use ‘are’ with plural nouns."),
    q("a1-06","use-of-english","Choose the correct sentence.",["He can swims.","He cans swim.","He can swim.","He can to swim."],2,"A modal verb such as ‘can’ is followed by the base form."),
    q("a1-07","reading","Mia is ten. She has a cat called Pip. What is the cat’s name?",["Mia","Ten","Pip","Cat"],2,"The passage says her cat is called Pip.","Mia is ten years old. She has a cat called Pip."),
    q("a1-08","grammar","I ___ from Armenia.",["are","is","am","be"],2,"Use ‘am’ with ‘I’."),
  ],
  a2: [
    q("a2-01","grammar","Yesterday, we ___ a film at home.",["watch","watched","watching","have watch"],1,"Use the past simple for a finished event yesterday."),
    q("a2-02","vocabulary","If a shop is ‘crowded’, it has ___. ",["very low prices","many people","no products","short opening hours"],1,"‘Crowded’ means full of people."),
    q("a2-03","grammar","I have lived here ___ 2022.",["for","during","since","from"],2,"Use ‘since’ with the starting point in time."),
    q("a2-04","use-of-english","You ___ wear a seat belt in a car; it is the law.",["might","must","would","could"],1,"‘Must’ expresses obligation."),
    q("a2-05","reading","The library closes at six on weekdays, but at two on Saturdays. When does it close on Saturday?",["At 6 p.m.","At 2 p.m.","At noon","It stays open"],1,"The notice says it closes at two on Saturdays.","Library notice: Weekdays 09:00–18:00. Saturday 10:00–14:00. Closed Sunday."),
    q("a2-06","grammar","This bag is ___ than that one.",["cheap","cheapest","cheaper","more cheap"],2,"Use the comparative ‘cheaper’ to compare two things."),
    q("a2-07","vocabulary","Which is closest in meaning to ‘borrow’?",["Give something forever","Take something temporarily and return it","Buy something new","Lose something"],1,"To borrow is to use something temporarily and return it."),
    q("a2-08","grammar","There isn’t ___ milk left.",["many","a few","much","several"],2,"‘Milk’ is uncountable, so use ‘much’ in this negative sentence."),
  ],
  b1: [
    q("b1-01","grammar","If I ___ more time, I would join the club.",["have","had","will have","would have"],1,"The second conditional uses past simple in the if-clause."),
    q("b1-02","use-of-english","The meeting was ___ because the manager was ill.",["put off","taken after","made up","looked into"],0,"‘Put off’ means postpone."),
    q("b1-03","vocabulary","A ‘reliable’ person is someone you can ___. ",["depend on","argue against","look after","laugh at"],0,"‘Reliable’ means trustworthy or dependable."),
    q("b1-04","grammar","The emails ___ before the office closed.",["sent","were sent","have sending","are send"],1,"Use the past simple passive: were + past participle."),
    q("b1-05","reading","Nora began cycling to work to save money. After a month, she noticed she also arrived feeling more awake. What was an additional benefit?",["Her workday became shorter","She felt more alert","She bought a new car","Her office moved"],1,"She noticed that she arrived feeling more awake.","Nora began cycling to work because bus fares had increased. A month later, she found that she was saving money and arriving at work feeling more awake."),
    q("b1-06","grammar","I’m not used to ___ so early.",["get up","got up","getting up","have got up"],2,"‘Be used to’ is followed by a noun or gerund (-ing form)."),
    q("b1-07","use-of-english","Despite ___ tired, he finished the report.",["be","being","was","to be"],1,"‘Despite’ is followed by a noun or gerund, not a finite clause."),
    q("b1-08","vocabulary","A ‘substantial’ improvement is ___. ",["very small","noticeable and significant","unlikely","temporary only"],1,"‘Substantial’ means considerable or significant."),
  ],
  b2: [
    q("b2-01","grammar","Had I known about the delay, I ___ earlier.",["would leave","left","would have left","will have left"],2,"This inverted third conditional means ‘If I had known…’"),
    q("b2-02","use-of-english","The new policy is intended to ___ unnecessary spending.",["curb","provoke","undergo","derive"],0,"‘Curb’ means limit or control."),
    q("b2-03","grammar","The proposal, ___ several experts had criticised, was revised.",["who","whose","which","where"],2,"Use ‘which’ to refer to the proposal."),
    q("b2-04","vocabulary","If evidence is ‘compelling’, it is ___. ",["difficult to understand","strong enough to persuade","mostly irrelevant","deliberately hidden"],1,"‘Compelling’ describes evidence that strongly convinces."),
    q("b2-05","reading","A town introduced bike lanes. Traffic did not fall immediately, but local shops later reported more visitors arriving by bicycle. Which conclusion is best supported?",["The scheme failed completely","Bike lanes may have brought more cyclists to shops","All drivers stopped using cars","The town closed its shops"],1,"The report supports a possible link, not a claim that all traffic disappeared.","When the town introduced protected bike lanes, some drivers complained that the change would harm local businesses. Traffic levels remained similar during the first few weeks. Later, several shops reported an increase in customers who arrived by bicycle, although officials said more data was needed to measure the scheme’s overall impact."),
    q("b2-06","use-of-english","No sooner ___ the train left than it began to rain.",["did","had","has","was"],1,"‘No sooner’ at the start takes inversion: had + subject + past participle."),
    q("b2-07","grammar","The report needs ___ before it is sent to the board.",["to revise","revising it","to be revised","revise"],2,"The report receives the action, so use the passive infinitive."),
    q("b2-08","vocabulary","A ‘tentative’ agreement is ___. ",["final and unchangeable","not yet definite","legally forbidden","widely publicised"],1,"‘Tentative’ means provisional or uncertain."),
  ],
  c1: [
    q("c1-01","vocabulary","Her argument was persuasive, but its central premise remained ___. ",["untenable","amiable","mundane","eloquent"],0,"‘Untenable’ means impossible to defend or maintain."),
    q("c1-02","use-of-english","The findings are intriguing; ___, they should be interpreted cautiously given the small sample.",["consequently","nevertheless","similarly","thereby"],1,"‘Nevertheless’ signals contrast with the preceding positive assessment."),
    q("c1-03","grammar","Were the data ___ independently, the conclusion might be more convincing.",["to replicate","replicated","replicating","replicate"],1,"The passive subjunctive construction is ‘were the data replicated’."),
    q("c1-04","vocabulary","The author’s tone is best described as ‘qualified’ when it is ___. ",["unreservedly enthusiastic","carefully limited by caveats","openly hostile","entirely informal"],1,"A qualified statement includes limitations or reservations."),
    q("c1-05","reading","The researcher says the results are promising but notes that the sample excluded rural participants. What is the main limitation?",["The results were never recorded","The study may not represent the whole population","The research had too many rural participants","The results were deliberately altered"],1,"Excluding a group limits how widely findings can be generalised.","The pilot produced encouraging results across the urban schools involved. However, the researcher cautioned against generalising too broadly: rural schools were not included, and their access to resources differed substantially. A larger follow-up study is planned before any nationwide recommendation is made."),
    q("c1-06","use-of-english","The minister’s remarks were deliberately equivocal, allowing several interpretations. ‘Equivocal’ most nearly means ___. ",["unambiguous","open to more than one interpretation","technically inaccurate","emotionally intense"],1,"‘Equivocal’ means ambiguous or open to different interpretations."),
    q("c1-07","grammar","Not until the appendix was published ___ the discrepancy become apparent.",["did","had","was","has"],0,"After ‘Not until’ at the start, invert subject and auxiliary: did the discrepancy become."),
    q("c1-08","vocabulary","A ‘cogent’ explanation is one that is ___. ",["logical and convincing","needlessly lengthy","emotionally detached","only partially audible"],0,"‘Cogent’ means clear, logical, and convincing."),
  ],
};

export function getLevel(levelId: string) {
  return ENGLISH_LEVELS.find((level) => level.id === levelId.toLowerCase());
}
