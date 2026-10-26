import type { LevelQuestion } from "./levelTests";

/**
 * Original Shtemarm practice items written for CEFR-aligned assessment.
 * NOT IELTS/Cambridge/TOEFL exam questions and NOT endorsed by test owners.
 * Official sample papers remain at their rights holders' websites.
 */
type Skill = LevelQuestion["skill"];
const q = (id: string, skill: Skill, prompt: string, options: [string,string,string,string],
  answerIndex: number, explanation: string, passage?: string): LevelQuestion => ({
    id, type: "choice", skill, prompt, options, answerIndex, explanation,
    ...(passage ? { passage } : {}),
  });
export const EXTRA_ENGLISH_LEVEL_QUESTIONS: Record<"a1" | "a2" | "b1" | "b2" | "c1", LevelQuestion[]> = {
  a1: [
    q("a1-09","grammar","Anna and Tom ___ at school today.",["is","am","are","be"],2,"Use 'are' with a plural subject."),
    q("a1-10","vocabulary","Which place can you visit to buy bread?",["Hospital","Bakery","Library","Station"],1,"A bakery sells bread."),
    q("a1-11","use-of-english","Choose the correct question.",["Where you live?","Where does you live?","Where do you live?","Where are live you?"],2,"Present simple questions with 'you' use 'do + subject + base verb'."),
    q("a1-12","reading","Where will the club meet on Tuesday?",["At the school gate","In Room 12","In the park","At the station"],1,"The notice specifies Room 12 for the Tuesday meeting.","School art club: Meet in Room 12 every Tuesday at 3:30 p.m. Bring a pencil and paper."),
    q("a1-13","grammar","This is ___ orange.",["a","an","the an","some"],1,"Use 'an' before the vowel sound at the start of 'orange'."),
    q("a1-14","vocabulary","A person who teaches children is a ___.",["pilot","teacher","chef","driver"],1,"A teacher helps students learn."),
    q("a1-15","grammar","There ___ any water in this bottle.",["aren't","isn't","don't","haven't"],1,"'Water' is uncountable; use 'isn't'."),
    q("a1-16","reading","What does Leo want to eat?",["Rice","Soup","A sandwich","An apple"],2,"Leo specifically asks for a sandwich.","Hi Mum, I'm home. I'm hungry. Could you make me a cheese sandwich? Thanks! — Leo"),
    q("a1-17","use-of-english","Complete the reply. 'How old are you?' '___ twelve.'",["I'm","He's","It's","We're"],0,"The speaker answers about their own age using 'I'm'."),
    q("a1-18","grammar","My father ___ coffee every morning.",["drink","drinks","drinking","is drink"],1,"Third-person singular verbs in the present simple often take -s."),
    q("a1-19","vocabulary","Which word describes weather with lots of rain?",["sunny","cloudless","rainy","windless"],2,"'Rainy' describes weather when rain falls."),
    q("a1-20","reading","Which day is the museum closed?",["Monday","Friday","Saturday","Sunday"],0,"The sign says the museum closes on Mondays.","City Museum: Open Tuesday–Sunday, 10 a.m.–5 p.m. Closed on Mondays."),
  ],
  a2: [
    q("a2-09","grammar","When I arrived, my brother ___ dinner.",["cooks","was cooking","has cook","will cooking"],1,"Past continuous shows an activity in progress at a past moment."),
    q("a2-10","vocabulary","A 'refund' is money you ___.",["borrow from a friend","get back after returning a purchase","pay for transport","earn from work"],1,"A refund is money paid back."),
    q("a2-11","use-of-english","Choose the most natural request.",["You give me pen.","Could you lend me a pen, please?","I want you pen now.","Do pen me a favour?"],1,"'Could you ... please?' is a polite request."),
    q("a2-12","reading","Why did Emma choose the later train?",["It was cheaper","She missed a bus","She wanted to meet her sister","It arrived before noon"],0,"She explains that the later ticket cost less.","Emma needed to travel to the city. She compared two trains: the 9:00 service cost £18, while the 11:00 service cost £12. As she was not in a hurry, she booked the later one."),
    q("a2-13","grammar","I've never ___ to London.",["go","went","been","going"],2,"The present perfect uses 'been' for life experience."),
    q("a2-14","vocabulary","If a jacket is 'waterproof', it ___.",["cannot be washed","keeps rain out","is very expensive","feels heavy"],1,"Waterproof material prevents water from passing through."),
    q("a2-15","grammar","You ___ park here. It's a pedestrian street.",["mustn't","needn't","might","should"],0,"'Mustn't' expresses prohibition."),
    q("a2-16","reading","What should applicants do before Friday?",["Attend the interview","Send their form","Collect a book","Pay the fee"],1,"Applications must be sent before Friday.","Volunteers wanted for the weekend reading festival. Please email your application form by Thursday evening. Interviews will be held next Monday."),
    q("a2-17","use-of-english","Which sentence is grammatically correct?",["She's interested on music.","She's interested at music.","She's interested in music.","She's interested for music."],2,"'Interested' takes the preposition 'in'."),
    q("a2-18","grammar","If it rains tomorrow, we ___ at home.",["stay","stayed","will stay","would stayed"],2,"First conditional: if + present, will + base verb."),
    q("a2-19","vocabulary","To 'reserve' a table means to ___.",["clean it","book it in advance","sell it","carry it"],1,"Reserve means arrange to have something available later."),
    q("a2-20","reading","How long is the swimming lesson?",["Thirty minutes","Forty-five minutes","One hour","Ninety minutes"],1,"The timetable runs from 4:15 to 5:00, which is 45 minutes.","Swimming lessons: Beginners, Wednesday 4:15–5:00 p.m. Bring your swimming cap. The first lesson is free."),
  ],
  b1: [
    q("b1-09","grammar","By the time we got to the cinema, the film ___.",["starts","had started","will start","has starting"],1,"Past perfect marks an event completed before another past event."),
    q("b1-10","vocabulary","To 'accommodate' a request means to ___.",["refuse it immediately","make arrangements to meet it","forget about it","criticise its wording"],1,"Accommodate can mean adapt to someone’s needs or request."),
    q("b1-11","use-of-english","I look forward to ___ from you.",["hear","hearing","heard","have heard"],1,"'Look forward to' is followed by an -ing form."),
    q("b1-12","reading","Why did the organisers move the outdoor concert?",["A musician was ill","The weather forecast was poor","Tickets had sold out","The stage was too small"],1,"The announcement mentions a risk of heavy rain.","The town concert was due to take place in Riverside Park. However, forecasts predicted heavy rain and strong winds on Saturday. The organisers moved the event to the community hall; ticket times are unchanged."),
    q("b1-13","grammar","The teacher asked us ___ our phones away.",["put","putting","to put","puts"],2,"'Ask someone to do something' takes a to-infinitive."),
    q("b1-14","vocabulary","A 'drawback' is ___.",["a major advantage","a disadvantage","a clear instruction","a final decision"],1,"Drawback means a negative feature or disadvantage."),
    q("b1-15","grammar","This is the friend ___ helped me move house.",["where","which","who","whose"],2,"'Who' is the relative pronoun for a person acting as the subject."),
    q("b1-16","reading","Which claim is supported by the review?",["All visitors were disappointed","The exhibition was interesting but crowded","The paintings were damaged","Entry was free"],1,"The reviewer praises the works but complains about the crowds.","Review: The science exhibition included clever interactive displays and clear explanations. I enjoyed most of it, although there were so many visitors that I had to wait to try several exhibits. I would still recommend going on a weekday."),
    q("b1-17","use-of-english","We ran ___ milk, so I went to the shop.",["into","away","out of","over"],2,"'Run out of' means use up the supply of something."),
    q("b1-18","grammar","I wish I ___ speak French better.",["can","could","will","would be"],1,"After 'wish' for present ability, use 'could'."),
    q("b1-19","vocabulary","'Eventually' means ___.",["immediately","in the end","frequently","at the same time"],1,"Eventually refers to something that happens after some time."),
    q("b1-20","reading","What is the writer's main purpose?",["To warn against buses","To recommend a trial travel option","To ask readers to buy bicycles","To explain how engines work"],1,"The writer encourages readers to try the service before deciding.","For one month, the city is offering free rides on its electric minibuses. Routes are limited, but residents can use the trial to decide whether public transport would suit their daily journey. Feedback will help the council decide what to do next."),
  ],
  b2: [
    q("b2-09","grammar","It's high time the company ___ its safety procedures.",["reviews","reviewed","will review","has reviewing"],1,"'It's high time' usually takes past tense for a change needed now."),
    q("b2-10","vocabulary","The proposal was dismissed as 'impractical', meaning it was ___.",["not realistic to carry out","particularly creative","already implemented","very profitable"],0,"Impractical means difficult or impossible to implement."),
    q("b2-11","use-of-english","Little ___ that the experiment would change her career.",["she knew","did she know","she had knowing","was she know"],1,"Negative adverb 'Little' at the beginning triggers inversion."),
    q("b2-12","reading","Which conclusion is best supported by the report?",["The policy definitely caused all changes","The figures improved, but causation is uncertain","The data was deliberately falsified","No improvement was recorded"],1,"The report notes improvement while acknowledging other contributing factors.","A school introduced quiet study hours in its library. Borrowing rose by 12% over the next term, and students reported fewer distractions. However, the same term also included a new reading campaign, so researchers cautioned against attributing the entire increase to study hours."),
    q("b2-13","grammar","He denied ___ the confidential document.",["to share","sharing","share","having share"],1,"'Deny' takes an -ing form."),
    q("b2-14","vocabulary","A 'feasible' plan is one that is ___.",["unpredictable","possible to carry out","illegal","widely criticised"],1,"Feasible means practical and achievable."),
    q("b2-15","grammar","The documents are believed ___ last week.",["to have been stolen","to steal","to stealing","being stole"],0,"A past passive event after 'are believed' uses 'to have been' + past participle."),
    q("b2-16","reading","What is the author's attitude towards remote working?",["Completely opposed","Unconditionally enthusiastic","Supportive but aware of limitations","Uninterested in the subject"],2,"The text balances benefits with disadvantages.","Working from home can reduce commuting time and give employees more control over their schedules. Nevertheless, newer staff may find it harder to learn informally from colleagues, and some teams struggle to maintain communication. Hybrid arrangements might offer a reasonable compromise."),
    q("b2-17","use-of-english","The museum's attendance rose ___ the increase in ticket prices.",["although","despite","however","in spite"],1,"'Despite' directly precedes a noun phrase."),
    q("b2-18","grammar","If she ___ the map, she wouldn't have taken the wrong road.",["checked","had checked","has checked","would check"],1,"A third conditional uses if + past perfect, would have + past participle."),
    q("b2-19","vocabulary","The two accounts are 'inconsistent' because they ___.",["say exactly the same thing","contradict each other","refer to different languages","are equally detailed"],1,"Inconsistent statements are not mutually compatible."),
    q("b2-20","reading","What does the second sentence suggest?",["All forecasts were accurate","The experts acknowledge uncertainty","The island is uninhabited","The project has already ended"],1,"The forecast has value, but possible errors are explicitly recognised.","Researchers predict that coastal flooding may become more frequent over the next two decades. They stress, however, that local conditions are complex and that current models cannot forecast the exact effects on every neighbourhood."),
  ],
  c1: [
    q("c1-09","grammar","___ the intervention been introduced sooner, fewer errors might have occurred.",["If","Had","Were","Should"],1,"Formal third-conditional inversion begins 'Had the intervention been...'."),
    q("c1-10","vocabulary","A 'perfunctory' inspection is one carried out ___.",["thoroughly and patiently","without adequate care or interest","by several experts","at unusually high cost"],1,"Perfunctory means done routinely with little attention."),
    q("c1-11","use-of-english","The report stops short ___ recommending an immediate ban.",["from","of","to","at"],1,"'Stop short of' is a fixed expression meaning refrain from going as far as."),
    q("c1-12","reading","Which assumption does the author challenge?",["Algorithms require data","More complex models are always more accurate","Some models are used in hospitals","Data needs interpretation"],1,"The author questions whether increased complexity automatically improves practical accuracy.","It is tempting to assume that a more elaborate prediction model must outperform a simpler one. Yet on small datasets, extra parameters can amplify noise rather than reveal meaningful patterns. Evaluations should therefore assess performance on unseen cases instead of treating complexity itself as evidence of reliability."),
    q("c1-13","grammar","Seldom ___ such a rapid shift in public opinion.",["we witness","have we witnessed","we have witnessing","did we witnessed"],1,"Fronted restrictive adverbials such as 'seldom' require auxiliary inversion."),
    q("c1-14","vocabulary","A 'nuanced' interpretation is ___.",["oversimplified","sensitive to fine distinctions","entirely speculative","deliberately vague"],1,"Nuanced reasoning recognises subtle differences and context."),
    q("c1-15","grammar","The treaty, the terms of ___ remain disputed, was signed last year.",["that","whose","which","whom"],2,"'The terms of which' is a formal relative construction."),
    q("c1-16","reading","What is the function of the final sentence?",["It dismisses every concern","It qualifies the positive outcome","It confirms the project was cancelled","It repeats the initial hypothesis"],1,"The final sentence limits the strength of the earlier findings.","The trial of digital textbooks produced encouraging gains in students' reported engagement. Teachers particularly valued the ability to adjust reading difficulty. Nevertheless, the study lasted only one term and involved volunteers, so the findings cannot yet establish a lasting effect across all schools."),
    q("c1-17","use-of-english","The proposed reform is contingent ___ additional funding.",["in","on","at","for"],1,"The standard collocation is 'contingent on'."),
    q("c1-18","grammar","So intricate ___ the mechanism that engineers needed weeks to analyse it.",["was","were","had","did"],0,"'So + adjective' at the start triggers inversion: 'So intricate was...'."),
    q("c1-19","vocabulary","To 'mitigate' a problem means to ___.",["make it less severe","deny that it exists","postpone all research","measure it precisely"],0,"Mitigate means reduce the severity or harmful effects."),
    q("c1-20","reading","Which statement most accurately captures the writer's position?",["Tradition should never change","Innovation must always replace tradition","Change is valuable when evaluated critically","Historical methods are useless"],2,"The writer advocates evidence-based change rather than automatic acceptance or rejection.","Institutions often describe innovation as inherently desirable, while defenders of tradition assume that longevity proves effectiveness. Both views are inadequate. A useful reform should identify the problem it seeks to solve, compare alternatives, and remain open to revision when new evidence emerges."),
  ],
};
