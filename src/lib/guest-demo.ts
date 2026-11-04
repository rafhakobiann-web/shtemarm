/**
 * Illustrated, self-contained guest exercises.
 * These are original sample prompts, not copied question-bank content.
 * Never write guest activity into account or device progress stores.
 */
export type GuestLang = "hy" | "en" | "ru";
export type GuestMode = "practice" | "cards" | "challenge";
export type GuestQuestion = {
  id: string;
  subject: string;
  stem: string;
  options: readonly string[];
  correct: number;
  why: string;
};
export type GuestCard = { id: string; front: string; back: string; context: string };

type GuestWords = {
  title: string; subtitle: string; guest: string; noSignup: string;
  example: string; note: string; practice: string; cards: string; challenge: string;
  navigation: string; back: string; signIn: string; create: string; createDescription: string;
  question: string; choose: string; correct: string; incorrect: string; why: string;
  next: string; finish: string; restart: string; score: string; complete: string;
  turnCard: string; flipHint: string; know: string; review: string; reviewCount: string;
  cardFinished: string; cardAgain: string; repeatMissed: string; leftRight: string; challengeIntro: string;
  begin: string; xp: string; progress: string; startExploring: string; nextFeature: string;
  theme: string; language: string; sampleOnly: string;
};

export const GUEST_DEMO: Record<GuestLang, {
  words: GuestWords;
  questions: readonly GuestQuestion[];
  cards: readonly GuestCard[];
}> = {
  hy: {
    words: {
      title: "Փորձիր Shtemarm-ը՝ առանց գրանցվելու",
      subtitle: "Բացիր իրական շտեմարանները, լուծիր յուրաքանչյուր գրքի առաջին երկու հարցերը և ծանոթացիր Shtemarm-ի աշխատանքին։ Մնացածը կբացվի մուտքից հետո։",
      guest: "Հյուրի ռեժիմ", noSignup: "Առանց հաշվի · Անվճար փորձարկում",
      example: "Ցուցադրական բովանդակություն", note: "Սրանք ցուցադրական օրինակներ են, ոչ պաշտոնական շտեմարանի հարցեր։ Քո արդյունքները չեն պահվում։",
      practice: "Հարցերի լուծում", cards: "Հիշողության քարտեր", challenge: "Փոքր մարտահրավեր",
      navigation: "Փորձարկման բաժիններ", back: "Գլխավոր էջ", signIn: "Մուտք", create: "Սկսել իրական ուսումը",
      createDescription: "Ստեղծիր հաշիվ՝ շտեմարանները բացելու, սխալները կրկնելու և առաջընթացդ պահպանելու համար։",
      question: "Հարց", choose: "Ընտրիր մեկ տարբերակ", correct: "Ճիշտ պատասխան է", incorrect: "Փորձը չհաջողվեց, տես բացատրությունը",
      why: "Բացատրություն", next: "Հաջորդ հարցը", finish: "Ավարտել", restart: "Կրկին փորձել",
      score: "Ճիշտ պատասխաններ", complete: "Ավարտեցիր այս փորձարկումը",
      turnCard: "Շրջել քարտը", flipHint: "Հպիր քարտին՝ պատասխանը տեսնելու համար", know: "Գիտեմ", review: "Կկրկնեմ",
      reviewCount: "Կրկնելու քարտեր", cardFinished: "Քարտերի փորձարկումն ավարտվեց", cardAgain: "Կրկնել քարտերը", repeatMissed: "Կրկնել բաց թողած քարտերը",
      leftRight: "Ձախ՝ գիտեմ · աջ՝ կկրկնեմ", challengeIntro: "Պատասխանիր երեք կարճ հարցի և հավաքիր փորձնական XP միավորներ։",
      begin: "Սկսել մարտահրավերը", xp: "Փորձնական XP", progress: "Առաջընթաց",
      startExploring: "Ընտրիր, թե ինչ ես ուզում փորձել", nextFeature: "Փորձիր մյուս բաժինը",
      theme: "Փոխել թեման", language: "Լեզու", sampleOnly: "Անձնական տվյալներ և առաջընթաց չեն հավաքվում",
    },
    questions: [
      {id:"math",subject:"Մաթեմատիկա",stem:"Լուծիր հավասարումը՝ 3x + 5 = 14։ Որքա՞ն է x-ը։",
       options:["2","3","4","5"],correct:1,why:"14 − 5 = 9, իսկ 9 ÷ 3 = 3։"},
      {id:"english",subject:"Անգլերեն",stem:"Ընտրիր ճիշտ տարբերակը. She ___ to school every day.",
       options:["go","goes","going","gone"],correct:1,why:"She-ը եզակի երրորդ դեմք է, և Present Simple-ում բայը ստանում է -s՝ goes։"},
      {id:"biology",subject:"Կենսաբանություն",stem:"Բջջի ո՞ր օրգանոիդն է հիմնականում արտադրում ATP։",
       options:["Կորիզը","Ռիբոսոմը","Միտոքոնդրիումը","Վակուոլը"],correct:2,why:"Միտոքոնդրիումներում բջջային շնչառության ընթացքում արտադրվում է ATP։"},
    ],
    cards: [
      {id:"create",front:"Create",back:"Ստեղծել",context:"Create something useful."},
      {id:"achieve",front:"Achieve",back:"Հասնել, նվաճել",context:"Achieve your goals."},
      {id:"review",front:"Review",back:"Կրկնել, վերանայել",context:"Review your mistakes."},
    ],
  },
  en: {
    words: {
      title:"Try Shtemarm before signing up",subtitle:"Explore real question books and try the first two questions from each. Sign in to unlock the rest, and try flashcards or mini-challenges too.",
      guest:"Guest mode",noSignup:"No account · Free preview",example:"Sample content",
      note:"These are illustrative examples, not official question-bank items. Your results are not saved.",
      practice:"Practice questions",cards:"Flashcards",challenge:"Mini challenge",
      navigation:"Demo sections",back:"Home",signIn:"Sign in",create:"Start learning for real",
      createDescription:"Create an account to use the question books, revisit mistakes, and save progress.",
      question:"Question",choose:"Choose one answer",correct:"Correct!",incorrect:"Not quite — read the explanation",
      why:"Explanation",next:"Next question",finish:"Finish",restart:"Try again",
      score:"Correct answers",complete:"You've completed this preview",
      turnCard:"Flip card",flipHint:"Tap to reveal the answer",know:"I know",review:"Review later",
      reviewCount:"Cards to review",cardFinished:"Flashcard preview complete",cardAgain:"Review the cards again",repeatMissed:"Review missed cards",
      leftRight:"Swipe left: I know · right: review later",challengeIntro:"Answer three quick questions and collect sample XP.",
      begin:"Start challenge",xp:"Sample XP",progress:"Progress",
      startExploring:"Choose what you'd like to try",nextFeature:"Explore another feature",
      theme:"Toggle theme",language:"Language",sampleOnly:"No personal data or study progress is collected",
    },
    questions: [
      {id:"math",subject:"Mathematics",stem:"Solve 3x + 5 = 14. What is x?",
       options:["2","3","4","5"],correct:1,why:"Subtract 5 from 14 to get 9. Divide by 3: x = 3."},
      {id:"english",subject:"English",stem:"Choose the correct option: She ___ to school every day.",
       options:["go","goes","going","gone"],correct:1,why:"In the present simple, third-person singular takes -s: she goes."},
      {id:"biology",subject:"Biology",stem:"Which cell organelle is the main site of ATP production?",
       options:["Nucleus","Ribosome","Mitochondrion","Vacuole"],correct:2,why:"Mitochondria produce ATP during cellular respiration."},
    ],
    cards: [
      {id:"create",front:"Create",back:"To make something new",context:"Create something useful."},
      {id:"achieve",front:"Achieve",back:"To successfully reach a goal",context:"Achieve your goals."},
      {id:"review",front:"Review",back:"To study something again",context:"Review your mistakes."},
    ],
  },
  ru: {
    words: {
      title:"Попробуй Shtemarm до регистрации",subtitle:"Открой настоящие сборники и попробуй первые два вопроса из каждого. Остальные задания станут доступны после входа.",
      guest:"Гостевой режим",noSignup:"Без аккаунта · Бесплатно",example:"Пример возможностей",
      note:"Это примеры для демонстрации, а не официальные вопросы сборников. Результаты не сохраняются.",
      practice:"Решение заданий",cards:"Карточки",challenge:"Мини-вызов",
      navigation:"Разделы демонстрации",back:"На главную",signIn:"Войти",create:"Начать учиться",
      createDescription:"Создай аккаунт, чтобы открыть сборники, повторять ошибки и сохранять прогресс.",
      question:"Вопрос",choose:"Выбери один ответ",correct:"Верно!",incorrect:"Не совсем — прочитай объяснение",
      why:"Объяснение",next:"Следующий вопрос",finish:"Завершить",restart:"Попробовать снова",
      score:"Правильных ответов",complete:"Ты прошёл демонстрацию",
      turnCard:"Перевернуть карточку",flipHint:"Нажми, чтобы увидеть ответ",know:"Знаю",review:"Повторить позже",
      reviewCount:"Для повторения",cardFinished:"Демонстрация карточек завершена",cardAgain:"Попробовать снова",repeatMissed:"Повторить сложные карточки",
      leftRight:"Влево — знаю · вправо — повторить",challengeIntro:"Ответь на три коротких вопроса и заработай демонстрационные XP.",
      begin:"Начать",xp:"Демо XP",progress:"Прогресс",
      startExploring:"Выбери, что хочешь попробовать",nextFeature:"Попробуй другой раздел",
      theme:"Сменить тему",language:"Язык",sampleOnly:"Личные данные и учебный прогресс не собираются",
    },
    questions: [
      {id:"math",subject:"Математика",stem:"Реши уравнение 3x + 5 = 14. Чему равен x?",
       options:["2","3","4","5"],correct:1,why:"14 − 5 = 9, а 9 ÷ 3 = 3."},
      {id:"english",subject:"Английский",stem:"Выбери правильный вариант: She ___ to school every day.",
       options:["go","goes","going","gone"],correct:1,why:"В Present Simple после she употребляется глагол с -s: goes."},
      {id:"biology",subject:"Биология",stem:"Какая органелла клетки в основном производит АТФ?",
       options:["Ядро","Рибосома","Митохондрия","Вакуоль"],correct:2,why:"Митохондрии производят АТФ при клеточном дыхании."},
    ],
    cards: [
      {id:"create",front:"Create",back:"Создавать",context:"Create something useful."},
      {id:"achieve",front:"Achieve",back:"Достигать",context:"Achieve your goals."},
      {id:"review",front:"Review",back:"Повторять, пересматривать",context:"Review your mistakes."},
    ],
  },
};

/** Touch-first, vertical-scroll-safe card swipe: left = known, right = review. */
export function guestCardSwipe(dx:number,dy:number):"known"|"review"|null {
  if(!Number.isFinite(dx)||!Number.isFinite(dy))return null;
  if(Math.abs(dx)<65||Math.abs(dx)<=Math.abs(dy)*1.25)return null;
  return dx<0?"known":"review";
}
