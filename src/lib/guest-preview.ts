/** Original, self-contained sample exercises for the public guest experience.
 * Never read the user's question history or answer keys from private routes.
 * Guest responses are ephemeral and are not synced or stored.
 */
export type GuestLocale = "hy" | "en" | "ru";
export type GuestSubject = "math" | "english" | "armenian" | "history" | "biology" | "physics";
export type Localized = Record<GuestLocale, string>;
export type GuestQuestion = {
  prompt: Localized;
  options: readonly string[];
  correct: number;
  explanation: Localized;
  reading?: string;
};

const l = (hy: string, en: string, ru: string): Localized => ({ hy, en, ru });
const question = (
  prompt: Localized, options: readonly string[], correct: number, explanation: Localized, reading?: string,
): GuestQuestion => ({ prompt, options, correct, explanation, reading });

export const GUEST_SUBJECTS: readonly GuestSubject[] = [
  "math", "english", "armenian", "history", "biology", "physics",
];

export const GUEST_SUBJECT_NAMES: Record<GuestSubject, Localized> = {
  math: l("Մաթեմատիկա", "Mathematics", "Математика"),
  english: l("Անգլերեն", "English", "Английский"),
  armenian: l("Հայոց լեզու", "Armenian language", "Армянский язык"),
  history: l("Հայոց պատմություն", "Armenian history", "История Армении"),
  biology: l("Կենսաբանություն", "Biology", "Биология"),
  physics: l("Ֆիզիկա", "Physics", "Физика"),
};

export const GUEST_QUESTIONS: Record<GuestSubject, readonly GuestQuestion[]> = {
  math: [
    question(
      l("Լուծիր հավասարումը՝ 3x + 5 = 20։", "Solve 3x + 5 = 20.", "Решите 3x + 5 = 20."),
      ["x = 3", "x = 5", "x = 7", "x = 15"], 1,
      l("Հանիր 5՝ 3x = 15, ապա բաժանիր 3-ի՝ x = 5։",
        "Subtract 5 to get 3x = 15, then divide by 3: x = 5.",
        "Вычтем 5: 3x = 15. Разделим на 3: x = 5."),
    ),
    question(
      l("Եռանկյան հիմքը 8 սմ է, բարձրությունը՝ 6 սմ։ Գտիր մակերեսը։",
        "A triangle has a base of 8 cm and a height of 6 cm. Find its area.",
        "Основание треугольника 8 см, высота 6 см. Найдите площадь."),
      ["14 սմ²", "24 սմ²", "48 սմ²", "28 սմ²"], 1,
      l("S = ah/2 = 8 × 6/2 = 24 սմ²։",
        "Area = base × height / 2 = 8 × 6 / 2 = 24 cm².",
        "S = ah/2 = 8 × 6 / 2 = 24 см²."),
    ),
  ],
  english: [
    question(
      l("Ըստ տեքստի՝ ե՞րբ է Աննան կարդում։", "According to the text, when does Anna read?",
        "Согласно тексту, когда Анна читает?"),
      ["Every morning", "Every evening", "Only on Sundays", "At lunchtime"], 1,
      l("Տեքստում ասվում է՝ «Every evening, she reads for twenty minutes»։",
        "The text says Anna reads for twenty minutes every evening.",
        "В тексте сказано, что Анна читает по двадцать минут каждый вечер."),
      "Anna enjoys learning new words. Every evening, she reads for twenty minutes before going to bed. She writes unfamiliar words in her notebook.",
    ),
    question(
      l("Ըստ տեքստի՝ ինչո՞ւ է Արամը գնում ոտքով։", "Why does Aram walk, according to the text?",
        "Почему Арам ходит пешком, согласно тексту?"),
      ["To meet a teacher", "Because he missed the bus", "To enjoy the fresh air", "To buy a notebook"], 2,
      l("Նա սիրում է մաքուր օդը՝ «because he likes the fresh air»։",
        "The passage says he walks because he likes the fresh air.",
        "В тексте сказано, что ему нравится свежий воздух."),
      "Aram lives near his school. He usually walks there because he likes the fresh air. On rainy days, his father drives him.",
    ),
  ],
  armenian: [
    question(
      l("Ո՞ր խոսքի մաս է «արևոտ» բառը։", "Which part of speech is «արևոտ»?",
        "Какой частью речи является слово «արևոտ»?"),
      ["Գոյական", "Ածական", "Բայ", "Թվական"], 1,
      l("«Արևոտ»-ը ցույց է տալիս առարկայի հատկանիշը, հետևաբար ածական է։",
        "«Արևոտ» (sunny) describes a quality, so it is an adjective.",
        "«Արևոտ» (солнечный) обозначает признак предмета, поэтому это прилагательное."),
    ),
    question(
      l("Ո՞րն է «գրել» բառի խոսքի մասը։", "Which part of speech is «գրել»?",
        "Какой частью речи является слово «գրել»?"),
      ["Բայ", "Մակբայ", "Ածական", "Դերանուն"], 0,
      l("«Գրել»-ը գործողություն է անվանում՝ բայի անորոշ դերբայ։",
        "«Գրել» means 'to write'; it is a verb in the infinitive form.",
        "«Գրել» означает «писать» — это неопределённая форма глагола."),
    ),
  ],
  history: [
    question(
      l("Ո՞ր թվականին է Մեսրոպ Մաշտոցը ստեղծել հայոց գրերը։",
        "In which year were the Armenian letters created by Mesrop Mashtots?",
        "В каком году Месроп Маштоц создал армянский алфавит?"),
      ["301", "387", "405", "451"], 2,
      l("Հայոց գրերի ստեղծման ընդունված թվականը 405-ն է։",
        "The commonly accepted date for the creation of the Armenian alphabet is 405 CE.",
        "Общепринятая дата создания армянского алфавита — 405 год."),
    ),
    question(
      l("Ո՞ր թվականին է քրիստոնեությունը Հայաստանում ընդունվել որպես պետական կրոն՝ ավանդական թվագրմամբ։",
        "According to the traditional dating, when did Armenia adopt Christianity as its state religion?",
        "Когда Армения приняла христианство как государственную религию по традиционной датировке?"),
      ["301", "405", "451", "885"], 0,
      l("Հայկական պատմագրության ավանդական թվականը 301-ն է։",
        "In the traditional Armenian historical chronology, the date is 301 CE.",
        "В традиционной армянской хронологии это 301 год."),
    ),
  ],
  biology: [
    question(
      l("Ո՞ր օրգանոիդն է բջջային շնչառության ընթացքում արտադրում ATP-ի մեծ մասը։",
        "Which organelle produces most ATP during cellular respiration?",
        "Какая органелла производит большую часть АТФ при клеточном дыхании?"),
      ["Ռիբոսոմ", "Միտոքոնդրիում", "Գոլջիի համալիր", "Լիզոսոմ"], 1,
      l("Միտոքոնդրիումներում բջջային շնչառության ընթացքում սինթեզվում է ATP-ի մեծ մասը։",
        "Mitochondria produce most of the ATP during aerobic cellular respiration.",
        "В митохондриях синтезируется большая часть АТФ при аэробном дыхании."),
    ),
    question(
      l("Բուսական բջջի ո՞ր օրգանոիդում է տեղի ունենում ֆոտոսինթեզը։",
        "Which organelle carries out photosynthesis in plant cells?",
        "В какой органелле растительной клетки происходит фотосинтез?"),
      ["Քլորոպլաստ", "Միտոքոնդրիում", "Միջուկ", "Վակուոլ"], 0,
      l("Ֆոտոսինթեզը տեղի է ունենում քլորոպլաստներում, որոնք պարունակում են քլորոֆիլ։",
        "Photosynthesis takes place in chloroplasts, which contain chlorophyll.",
        "Фотосинтез происходит в хлоропластах, содержащих хлорофилл."),
    ),
  ],
  physics: [
    question(
      l("12 Վ լարման և 4 Օմ դիմադրության դեպքում որքա՞ն է հոսանքի ուժը։",
        "What is the current through a 4 Ω resistor with 12 V across it?",
        "Какова сила тока при напряжении 12 В и сопротивлении 4 Ом?"),
      ["2 Ա", "3 Ա", "4 Ա", "48 Ա"], 1,
      l("Օհմի օրենքով I = U/R = 12/4 = 3 Ա։",
        "By Ohm's law, I = V/R = 12/4 = 3 A.",
        "По закону Ома I = U/R = 12/4 = 3 А."),
    ),
    question(
      l("Մարմինը 2 ժամում անցել է 120 կմ։ Որքա՞ն է միջին արագությունը։",
        "An object travels 120 km in 2 hours. What is its average speed?",
        "Тело прошло 120 км за 2 часа. Какова средняя скорость?"),
      ["30 կմ/ժ", "60 կմ/ժ", "120 կմ/ժ", "240 կմ/ժ"], 1,
      l("v = s/t = 120/2 = 60 կմ/ժ։",
        "Average speed = distance/time = 120/2 = 60 km/h.",
        "v = s/t = 120/2 = 60 км/ч."),
    ),
  ],
};

export function guestQuestionFor(subject: GuestSubject, index: number): GuestQuestion | undefined {
  return GUEST_QUESTIONS[subject]?.[index];
}

export function isGuestSubject(value: string | undefined): value is GuestSubject {
  return !!value && GUEST_SUBJECTS.some(subject => subject === value);
}
