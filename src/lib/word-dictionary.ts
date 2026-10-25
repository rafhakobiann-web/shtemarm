import type { TranslationLanguage } from "./translation";

// Curated, reviewed starter glossary for common words in the English exercises.
// Values are plain translations, not generated at runtime. Unknown words fall back to the cached AI translator.
type Meanings = Record<TranslationLanguage, string>;
export const WORD_DICTIONARY: Record<string, Meanings> = {
  "a": { hy: "մի, մեկ", ru: "один; неопределённый артикль", de: "ein; eine", fr: "un; une", es: "un; una", it: "un; una", pt: "um; uma", en: "the indefinite article" },
  "about": { hy: "մասին", ru: "о; об", de: "über", fr: "à propos de", es: "sobre", it: "su", pt: "sobre", en: "concerning; regarding" },
  "answer": { hy: "պատասխանել; պատասխան", ru: "отвечать; ответ", de: "antworten; die Antwort", fr: "répondre; la réponse", es: "responder; la respuesta", it: "rispondere; la risposta", pt: "responder; a resposta", en: "a reply to a question" },
  "art": { hy: "արվեստ", ru: "искусство", de: "die Kunst", fr: "l’art", es: "el arte", it: "l’arte", pt: "a arte", en: "creative expression" },
  "artist": { hy: "արվեստագետ", ru: "художник; артист", de: "der Künstler", fr: "l’artiste", es: "el artista", it: "l’artista", pt: "o artista", en: "a person who creates art" },
  "beautiful": { hy: "գեղեցիկ", ru: "красивый", de: "schön", fr: "beau; belle", es: "hermoso; bello", it: "bello", pt: "bonito; belo", en: "pleasing to look at" },
  "beloved": { hy: "սիրված", ru: "любимый", de: "geliebt", fr: "bien-aimé", es: "amado", it: "amato", pt: "amado", en: "dearly loved" },
  "best": { hy: "լավագույն", ru: "лучший", de: "am besten; der Beste", fr: "le meilleur", es: "el mejor", it: "il migliore", pt: "o melhor", en: "better than all others" },
  "beginning": { hy: "սկիզբ", ru: "начало", de: "der Anfang", fr: "le début", es: "el comienzo", it: "l’inizio", pt: "o começo", en: "the start of something" },
  "born": { hy: "ծնված", ru: "родившийся", de: "geboren", fr: "né; née", es: "nacido", it: "nato", pt: "nascido", en: "brought into life at birth" },
  "book": { hy: "գիրք", ru: "книга", de: "das Buch", fr: "le livre", es: "el libro", it: "il libro", pt: "o livro", en: "a written or printed work" },
  "choose": { hy: "ընտրել", ru: "выбирать", de: "wählen", fr: "choisir", es: "elegir", it: "scegliere", pt: "escolher", en: "to select from options" },
  "city": { hy: "քաղաք", ru: "город", de: "die Stadt", fr: "la ville", es: "la ciudad", it: "la città", pt: "a cidade", en: "a large town" },
  "continue": { hy: "շարունակել", ru: "продолжать", de: "fortsetzen", fr: "continuer", es: "continuar", it: "continuare", pt: "continuar", en: "to keep going" },
  "correct": { hy: "ճիշտ; ուղղել", ru: "правильный; исправлять", de: "richtig; korrigieren", fr: "correct; corriger", es: "correcto; corregir", it: "corretto; correggere", pt: "correto; corrigir", en: "right or accurate" },
  "country": { hy: "երկիր", ru: "страна", de: "das Land", fr: "le pays", es: "el país", it: "il paese", pt: "o país", en: "a nation or territory" },
  "create": { hy: "ստեղծել", ru: "создавать", de: "erschaffen", fr: "créer", es: "crear", it: "creare", pt: "criar", en: "to make something new" },
  "famous": { hy: "հայտնի", ru: "известный", de: "berühmt", fr: "célèbre", es: "famoso", it: "famoso", pt: "famoso", en: "known by many people" },
  "farm": { hy: "ֆերմա; ագարակ", ru: "ферма", de: "der Bauernhof", fr: "la ferme", es: "la granja", it: "la fattoria", pt: "a fazenda", en: "land used for growing crops or raising animals" },
  "following": { hy: "հետևյալ", ru: "следующий; нижеследующий", de: "folgend", fr: "suivant", es: "siguiente", it: "seguente", pt: "seguinte", en: "coming next; listed below" },
  "history": { hy: "պատմություն", ru: "история", de: "die Geschichte", fr: "l’histoire", es: "la historia", it: "la storia", pt: "a história", en: "the study or record of the past" },
  "humble": { hy: "համեստ", ru: "скромный", de: "bescheiden", fr: "humble; modeste", es: "humilde", it: "umile", pt: "humilde", en: "modest; not proud" },
  "influence": { hy: "ազդել; ազդեցություն", ru: "влиять; влияние", de: "beeinflussen; der Einfluss", fr: "influencer; l’influence", es: "influir; la influencia", it: "influenzare; l’influenza", pt: "influenciar; a influência", en: "the power to affect someone or something" },
  "life": { hy: "կյանք", ru: "жизнь", de: "das Leben", fr: "la vie", es: "la vida", it: "la vita", pt: "a vida", en: "the state of being alive; a person's experience" },
  "legacy": { hy: "ժառանգություն", ru: "наследие", de: "das Vermächtnis", fr: "l’héritage", es: "el legado", it: "l’eredità", pt: "o legado", en: "something handed down from the past" },
  "mean": { hy: "նշանակել; նկատի ունենալ", ru: "значить; иметь в виду", de: "bedeuten; meinen", fr: "signifier; vouloir dire", es: "significar; querer decir", it: "significare; voler dire", pt: "significar; querer dizer", en: "to signify or intend" },
  "meaning": { hy: "իմաստ; նշանակություն", ru: "значение; смысл", de: "die Bedeutung", fr: "le sens; la signification", es: "el significado", it: "il significato", pt: "o significado", en: "what a word or thing expresses" },
  "millions": { hy: "միլիոնավորներ", ru: "миллионы", de: "Millionen", fr: "des millions", es: "millones", it: "milioni", pt: "milhões", en: "many groups of one million" },
  "motion": { hy: "շարժում", ru: "движение", de: "die Bewegung", fr: "le mouvement", es: "el movimiento", it: "il movimento", pt: "o movimento", en: "the act or process of moving" },
  "movie": { hy: "կինոնկար", ru: "фильм", de: "der Film", fr: "le film", es: "la película", it: "il film", pt: "o filme", en: "a film shown on a screen" },
  "people": { hy: "մարդիկ", ru: "люди", de: "die Menschen", fr: "les gens", es: "la gente", it: "le persone", pt: "as pessoas", en: "human beings in general" },
  "picture": { hy: "նկար; պատկեր", ru: "картина; изображение", de: "das Bild", fr: "l’image; la photo", es: "la imagen; la foto", it: "l’immagine; la foto", pt: "a imagem; a foto", en: "an image or photograph" },
  "producer": { hy: "արտադրող; պրոդյուսեր", ru: "производитель; продюсер", de: "der Produzent", fr: "le producteur", es: "el productor", it: "il produttore", pt: "o produtor", en: "a person who makes or organizes a film or other work" },
  "question": { hy: "հարց", ru: "вопрос", de: "die Frage", fr: "la question", es: "la pregunta", it: "la domanda", pt: "a pergunta", en: "a sentence asking for information" },
  "rather": { hy: "բավականին; ավելի շուտ", ru: "довольно; скорее", de: "ziemlich; eher", fr: "plutôt; assez", es: "bastante; más bien", it: "piuttosto; abbastanza", pt: "bastante; antes", en: "to some degree; more accurately" },
  "read": { hy: "կարդալ", ru: "читать", de: "lesen", fr: "lire", es: "leer", it: "leggere", pt: "ler", en: "to look at and understand written words" },
  "rural": { hy: "գյուղական", ru: "сельский", de: "ländlich", fr: "rural; champêtre", es: "rural", it: "rurale", pt: "rural", en: "related to the countryside" },
  "sentence": { hy: "նախադասություն", ru: "предложение", de: "der Satz", fr: "la phrase", es: "la oración", it: "la frase", pt: "a frase", en: "a group of words expressing a complete thought" },
  "soon": { hy: "շուտով", ru: "скоро", de: "bald", fr: "bientôt", es: "pronto", it: "presto", pt: "em breve", en: "in a short time" },
  "states": { hy: "պնդում է; նշում է", ru: "утверждает; указывает", de: "sagt; stellt fest", fr: "déclare; indique", es: "afirma; indica", it: "afferma; indica", pt: "afirma; indica", en: "expresses or declares" },
  "text": { hy: "տեքստ", ru: "текст", de: "der Text", fr: "le texte", es: "el texto", it: "il testo", pt: "o texto", en: "written words" },
  "theme": { hy: "թեմա; հիմնական գաղափար", ru: "тема; основная идея", de: "das Thema; die Hauptidee", fr: "le thème; l’idée principale", es: "el tema; la idea principal", it: "il tema; l’idea principale", pt: "o tema; a ideia principal", en: "the main subject or idea" },
  "throughout": { hy: "ամբողջ ընթացքում; ամբողջ տարածքում", ru: "на протяжении; по всему", de: "während; überall in", fr: "tout au long de; partout dans", es: "a lo largo de; por todo", it: "durante; in tutto", pt: "ao longo de; por todo", en: "in every part of; during the whole period" },
  "world": { hy: "աշխարհ", ru: "мир", de: "die Welt", fr: "le monde", es: "el mundo", it: "il mondo", pt: "o mundo", en: "the Earth and its people" },
  "word": { hy: "բառ", ru: "слово", de: "das Wort", fr: "le mot", es: "la palabra", it: "la parola", pt: "a palavra", en: "a single unit of language" },
};

export function getDictionaryTranslation(word: string, language: TranslationLanguage): string | null {
  return WORD_DICTIONARY[word.trim().toLocaleLowerCase("en")]?.[language] ?? null;
}
