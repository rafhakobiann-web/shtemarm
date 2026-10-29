import type { GrammarTopic } from "./grammarHandbookTypes";

/** Supplementary rules: explicit counterexamples are intentionally unambiguous. */
export const GRAMMAR_SUPPLEMENT: GrammarTopic[] = [
  {
    id:"future-perfect",title:"Future Perfect",level:"B2",sections:[2,3,5,6],category:"grammar",
    formula:"will have + V3 · by + future deadline",
    correct:"By Friday, she will have finished the report.",
    incorrect:"By Friday, she will has finished the report.",
    content:{
      hy:{summary:"Future Perfect-ը ցույց է տալիս, որ գործողությունն ավարտված կլինի ապագայի որոշակի պահից առաջ։ Կառուցվածքը՝ will have + բայի երրորդ ձև։",why:"Will-ից հետո օգտագործվում է have, ոչ թե has, անկախ ենթակայից։"},
      en:{summary:"Use future perfect for an action completed before a future reference point. Form it with will have + past participle.",why:"After will, the auxiliary stays have, not has."},
      ru:{summary:"Future Perfect обозначает действие, которое завершится к определённому моменту в будущем. Форма: will have + V3.",why:"После will употребляется have, а не has."}
    }
  },
  {
    id:"future-continuous",title:"Future Continuous",level:"B1",sections:[2,3,5],category:"grammar",
    formula:"will be + V-ing",
    correct:"At eight tomorrow, I will be studying.",
    incorrect:"At eight tomorrow, I will studying.",
    content:{
      hy:{summary:"Future Continuous-ը ցույց է տալիս ապագայի որոշակի պահին ընթացող գործողություն։ Կառուցվածքը՝ will be + V-ing։",why:"Will-ից հետո անհրաժեշտ է be օժանդակ բայը՝ շարունակական ձևը կազմելու համար։"},
      en:{summary:"Future continuous describes an activity in progress at a particular future time. Use will be + -ing.",why:"The auxiliary be is required after will."},
      ru:{summary:"Future Continuous обозначает процесс в определённый момент будущего. Формула: will be + V-ing.",why:"После will нужен вспомогательный глагол be."}
    }
  },
  {
    id:"mixed-conditionals",title:"Mixed conditionals",level:"C1",sections:[3,5,6,13],category:"grammar",
    formula:"if + had + V3, would + V (past condition → present result)",
    correct:"If I had slept earlier, I would feel better now.",
    incorrect:"If I had slept earlier, I will feel better now.",
    content:{
      hy:{summary:"Խառը պայմանականում պայմանն ու հետևանքը կարող են վերաբերել տարբեր ժամանակների։ Անցյալում չիրականացած պայմանը կարող է ունենալ ներկա հետևանք՝ if + Past Perfect, would + V։",why:"Անցյալում չիրականացած պայմանին համապատասխան ներկա երևակայական հետևանքի համար այստեղ օգտագործվում է would, ոչ թե will։"},
      en:{summary:"Mixed conditionals connect different time frames, such as an unreal past condition with an unreal present result: if + past perfect, would + base verb.",why:"The present hypothetical result takes would rather than will here."},
      ru:{summary:"Смешанные условные предложения связывают разные времена: нереальное условие в прошлом и результат в настоящем — if + Past Perfect, would + V.",why:"Для гипотетического результата здесь нужно would, а не will."}
    }
  },
  {
    id:"past-perfect-continuous",title:"Past Perfect Continuous",level:"B2",sections:[2,3,5,6],category:"grammar",
    formula:"had been + V-ing",
    correct:"She had been waiting for an hour before the bus arrived.",
    incorrect:"She had waiting for an hour before the bus arrived.",
    content:{
      hy:{summary:"Past Perfect Continuous-ը շեշտում է մինչև անցյալի մեկ այլ պահը տևած գործողությունը։ Կառուցվածքը՝ had been + V-ing։",why:"Had-ից հետո պետք է been՝ շարունակական ժամանակաձևը կազմելու համար։"},
      en:{summary:"Past perfect continuous emphasizes duration before another past point. Form it with had been + -ing.",why:"Been is necessary between had and the -ing form."},
      ru:{summary:"Past Perfect Continuous подчёркивает длительность действия до другого момента в прошлом. Формула: had been + V-ing.",why:"Между had и формой -ing необходимо been."}
    }
  },
  {
    id:"neither-either",title:"Either / neither / both",level:"B1",sections:[3,4,5,10],category:"grammar",
    formula:"either ... or · neither ... nor · both ... and",
    correct:"Neither Anna nor Mariam was late.",
    incorrect:"Neither Anna or Mariam was late.",
    content:{
      hy:{summary:"Either ... or-ը նշանակում է երկու տարբերակներից մեկը, neither ... nor-ը՝ ոչ մեկը, both ... and-ը՝ երկուսն էլ։ Ստուգիր նաև ստորոգյալի համաձայնությունը։",why:"Neither-ի զույգ կապակցիչը nor-ն է, ոչ թե or-ը։"},
      en:{summary:"Use either ... or for one of two alternatives, neither ... nor for neither alternative, and both ... and for both. Check verb agreement.",why:"Neither pairs with nor, not or."},
      ru:{summary:"Either ... or означает один из двух вариантов, neither ... nor — ни один, both ... and — оба. Проверьте согласование глагола.",why:"После neither в парной конструкции используется nor."}
    }
  },
  {
    id:"so-such",title:"So / such / too / enough",level:"B1",sections:[3,4,5,10],category:"grammar",
    formula:"so + adjective · such + (a/an) + adjective + noun",
    correct:"It was such an interesting book.",
    incorrect:"It was so an interesting book.",
    content:{
      hy:{summary:"So-ն սովորաբար դրվում է ածականից կամ մակբայից առաջ, such-ը՝ գոյականային խմբից առաջ։ Too-ն հաճախ ցույց է տալիս չափազանցություն, enough-ը՝ բավարար աստիճան։",why:"An interesting book-ը գոյականային խումբ է, ուստի այստեղ պետք է such։"},
      en:{summary:"So usually modifies an adjective or adverb, while such introduces a noun phrase. Too often means excessive; enough expresses sufficiency.",why:"An interesting book is a noun phrase, so use such."},
      ru:{summary:"So обычно стоит перед прилагательным или наречием, such — перед именной группой. Too означает чрезмерность, enough — достаточность.",why:"An interesting book — именная группа, поэтому требуется such."}
    }
  },
  {
    id:"adjective-order",title:"Adjective order",level:"B1",sections:[3,4,5,10],category:"grammar",
    formula:"opinion → size → age → shape → colour → origin → material → noun",
    correct:"She bought a beautiful small wooden box.",
    incorrect:"She bought a wooden small beautiful box.",
    content:{
      hy:{summary:"Մի քանի ածականների սովորական հերթականությունը մոտավորապես հետևյալն է՝ կարծիք, չափ, տարիք, ձև, գույն, ծագում, նյութ։ Սա միտում է, ոչ բացարձակ օրենք։",why:"Beautiful-ը գնահատական է, small-ը՝ չափ, wooden-ը՝ նյութ․ այդ հերթականությունն ավելի բնական է։"},
      en:{summary:"Multiple adjectives often follow opinion, size, age, shape, colour, origin, material. This is a strong tendency, not an exceptionless rule.",why:"Opinion beautiful normally precedes size small and material wooden."},
      ru:{summary:"Обычный порядок определений: оценка, размер, возраст, форма, цвет, происхождение, материал. Это тенденция, а не абсолютное правило.",why:"Оценка beautiful обычно стоит перед размером small и материалом wooden."}
    }
  },
  {
    id:"determiners",title:"Each / every / all",level:"B1",sections:[3,4,5,10],category:"grammar",
    formula:"each/every + singular countable noun · all + plural/uncountable",
    correct:"Every student has a notebook.",
    incorrect:"Every students have a notebook.",
    content:{
      hy:{summary:"Each և every որոշիչներից հետո սովորաբար գալիս է եզակի հաշվելի գոյական և եզակի ստորոգյալ։ All-ը կարող է կիրառվել հոգնակի հաշվելի կամ անհաշվելի գոյականների հետ։",why:"Every-ից հետո student-ը եզակի է, հետևաբար այստեղ պետք է has։"},
      en:{summary:"Each and every normally take a singular countable noun and singular verb. All can refer to plural countables or uncountables.",why:"Every student is singular, so has is required here."},
      ru:{summary:"После each и every обычно стоит исчисляемое существительное в единственном числе и глагол в единственном числе. All сочетается с множественным или неисчисляемым.",why:"После every нужно student, а согласованный глагол — has."}
    }
  }
];
