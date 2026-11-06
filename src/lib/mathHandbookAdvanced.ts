import type { MathTopic } from "./mathHandbookTypes";

/** Verified teaching examples for core algebra, geometry and combinatorics rules. */
export const MATH_HANDBOOK_ADVANCED: MathTopic[] = [
  {
    id:"derivative-chain", category:"functions",
    title:{hy:"Բարդ ֆունկցիայի ածանցյալ",en:"Chain rule",ru:"Правило производной сложной функции"},
    summary:{
      hy:"Եթե ֆունկցիան կազմված է արտաքին և ներքին ֆունկցիաներից, պետք է ածանցել արտաքին ֆունկցիան և բազմապատկել ներքինի ածանցյալով։",
      en:"For a composite function, differentiate the outer function at the inner value, then multiply by the inner derivative.",
      ru:"Для сложной функции производную внешней функции умножают на производную внутренней."
    },
    formula:"$(f(g(x)))'=f'(g(x))g'(x)$",
    problem:{hy:"Գտնել $h'(1)$-ը, եթե $h(x)=(3x-1)^4$։",en:"Find $h'(1)$ for $h(x)=(3x-1)^4$.",ru:"Найдите $h'(1)$, если $h(x)=(3x-1)^4$."},
    steps:{
      hy:["Ներքին ֆունկցիան $g(x)=3x-1$ է, և $g'(x)=3$։","Շղթայական կանոնով $h'(x)=4(3x-1)^3\\cdot3=12(3x-1)^3$։","$x=1$ դեպքում $h'(1)=12\\cdot2^3=96$։"],
      en:["The inner function is $g(x)=3x-1$, so $g'(x)=3$.","Apply the chain rule: $h'(x)=4(3x-1)^3\\cdot3=12(3x-1)^3$.","At $x=1$, $h'(1)=12\\cdot2^3=96$."],
      ru:["Внутренняя функция $g(x)=3x-1$, её производная равна $3$.","По правилу цепочки $h'(x)=4(3x-1)^3\\cdot3=12(3x-1)^3$.","При $x=1$: $h'(1)=12\\cdot2^3=96$."]
    },
    answer:"$h'(1)=96$",
    mistake:{
      hy:"Մի՛ մոռացիր բազմապատկել ներքին ֆունկցիայի ածանցյալով՝ $3$-ով։",
      en:"Do not forget the inner derivative: the extra factor of $3$ is essential.",
      ru:"Не забывайте умножить на производную внутренней функции: множитель $3$."
    }
  },
  {
    id:"derivative-quotient",category:"functions",
    title:{hy:"Քանորդի ածանցման կանոնը",en:"Quotient rule",ru:"Правило производной частного"},
    summary:{
      hy:"Քանորդի ածանցյալում համարիչում առաջանում է արտադրյալների տարբերությունը, իսկ հայտարարում՝ սկզբնական հայտարարի քառակուսին։ Հաշվի առ տիրույթը։",
      en:"The quotient rule uses a difference of two products over the square of the denominator. Always preserve the domain.",
      ru:"Производная частного содержит разность двух произведений в числителе и квадрат знаменателя. Учитывайте область определения."
    },
    formula:"$\\left(\\frac{u}{v}\\right)'=\\frac{u'v-uv'}{v^2},\\quad v\\ne0$",
    problem:{hy:"Գտնել $f'(2)$-ը, եթե $f(x)=\\frac{x+1}{x-1}$։",en:"Find $f'(2)$ for $f(x)=\\frac{x+1}{x-1}$.",ru:"Найдите $f'(2)$ для $f(x)=\\frac{x+1}{x-1}$."},
    steps:{
      hy:["Ընտրիր $u=x+1$, $v=x-1$, ուրեմն $u'=v'=1$։","$f'(x)=\\frac{(x-1)-(x+1)}{(x-1)^2}=\\frac{-2}{(x-1)^2}$՝ $x\\ne1$։","Տեղադրիր $x=2$՝ $f'(2)=-2$։"],
      en:["Let $u=x+1$, $v=x-1$, so $u'=v'=1$.","Then $f'(x)=\\frac{(x-1)-(x+1)}{(x-1)^2}=\\frac{-2}{(x-1)^2}$ for $x\\ne1$.","At $x=2$, $f'(2)=-2$."],
      ru:["Возьмём $u=x+1$, $v=x-1$, тогда $u'=v'=1$.","Получаем $f'(x)=\\frac{(x-1)-(x+1)}{(x-1)^2}=\\frac{-2}{(x-1)^2}$ при $x\\ne1$.","При $x=2$ имеем $f'(2)=-2$."]
    },
    answer:"$f'(2)=-2$",
    mistake:{
      hy:"Քանորդի ածանցյալը $u'/v'$ չէ։ Մի՛ կորցրու հանման նշանը և $v^2$ հայտարարի քառակուսին։",
      en:"The derivative is not $u'/v'$. Keep the minus sign and the squared denominator.",
      ru:"Производная частного не равна $u'/v'$. Не потеряйте минус и квадрат знаменателя."
    }
  },
  {
    id:"geometry-sine-law",category:"plane-geometry",
    title:{hy:"Սինուսների թեորեմ",en:"Law of sines",ru:"Теорема синусов"},
    summary:{
      hy:"Ցանկացած եռանկյան կողմերը համեմատական են իրենց դիմացի անկյունների սինուսներին։ Կողմի ու անկյան համապատասխանությունը կարևոր է։",
      en:"In any triangle, each side divided by the sine of its opposite angle has the same value.",
      ru:"В любом треугольнике отношение стороны к синусу противолежащего угла одинаково для всех сторон."
    },
    formula:"$\\frac{a}{\\sin A}=\\frac{b}{\\sin B}=\\frac{c}{\\sin C}$",
    problem:{hy:"Եթե $A=30^\\circ$, $B=60^\\circ$ և $a=4$, գտնել $b$։",en:"If $A=30^\\circ$, $B=60^\\circ$ and $a=4$, find $b$.",ru:"Если $A=30^\\circ$, $B=60^\\circ$ и $a=4$, найдите $b$."},
    steps:{
      hy:["Սինուսների թեորեմից $b=a\\cdot\\frac{\\sin B}{\\sin A}$։","Տեղադրիր $\\sin60^\\circ=\\frac{\\sqrt3}{2}$ և $\\sin30^\\circ=\\frac12$։","Ստացվում է $b=4\\cdot\\frac{\\sqrt3/2}{1/2}=4\\sqrt3$։"],
      en:["The sine law gives $b=a\\cdot\\frac{\\sin B}{\\sin A}$.","Use $\\sin60^\\circ=\\frac{\\sqrt3}{2}$ and $\\sin30^\\circ=\\frac12$.","Then $b=4\\cdot\\frac{\\sqrt3/2}{1/2}=4\\sqrt3$."],
      ru:["По теореме синусов $b=a\\cdot\\frac{\\sin B}{\\sin A}$.","Подставим $\\sin60^\\circ=\\frac{\\sqrt3}{2}$ и $\\sin30^\\circ=\\frac12$.","Получим $b=4\\cdot\\frac{\\sqrt3/2}{1/2}=4\\sqrt3$."]
    },
    answer:"$b=4\\sqrt3$",
    mistake:{
      hy:"Մի՛ բաժանիր կողմը ուրիշ անկյան սինուսին. $a$ կողմին համապատասխանում է հենց $A$ անկյունը։",
      en:"Pair each side with its opposite angle; mismatching them gives a wrong ratio.",
      ru:"Соотносите сторону с противолежащим углом, иначе пропорция окажется неверной."
    }
  },
  {
    id:"geometry-cosine-law",category:"plane-geometry",
    title:{hy:"Կոսինուսների թեորեմ",en:"Law of cosines",ru:"Теорема косинусов"},
    summary:{
      hy:"Կոսինուսների թեորեմը կապում է երկու կողմերն ու դրանց կազմած անկյունը երրորդ կողմի հետ։ Այն կիրառվում է նաև ոչ ուղղանկյուն եռանկյուններում։",
      en:"The cosine rule finds a side from two other sides and their included angle, including non-right triangles.",
      ru:"Теорема косинусов связывает две стороны и угол между ними с третьей стороной, в том числе в непрямоугольных треугольниках."
    },
    formula:"$c^2=a^2+b^2-2ab\\cos C$",
    problem:{hy:"Եռանկյան երկու կողմերը $5$ են, իսկ դրանց անկյունը՝ $60^\\circ$։ Գտնել երրորդ կողմը։",en:"Two sides are $5$ and their included angle is $60^\\circ$. Find the third side.",ru:"Две стороны равны $5$, угол между ними — $60^\\circ$. Найдите третью сторону."},
    steps:{
      hy:["Ընտրիր $a=b=5$, $C=60^\\circ$։","$c^2=25+25-2\\cdot5\\cdot5\\cdot\\frac12=25$։","Քանի որ կողմը դրական է՝ $c=5$։"],
      en:["Use $a=b=5$ and $C=60^\\circ$.","Then $c^2=25+25-2\\cdot5\\cdot5\\cdot\\frac12=25$.","Side lengths are positive, so $c=5$."],
      ru:["Возьмём $a=b=5$, $C=60^\\circ$.","Тогда $c^2=25+25-2\\cdot5\\cdot5\\cdot\\frac12=25$.","Длина стороны положительна, следовательно $c=5$."]
    },
    answer:"$c=5$",
    mistake:{
      hy:"Կոսինուսի անդամը հանվում է՝ $-2ab\\cos C$։ Մի՛ շփոթիր նշանը։",
      en:"The cosine term is subtracted: $-2ab\\cos C$. Do not change the sign.",
      ru:"Косинусный член вычитается: $-2ab\\cos C$. Не меняйте знак."
    }
  },
  {
    id:"arrangements",category:"combinatorics",
    title:{hy:"Կարգավորություններ և տեղադրություններ",en:"Ordered arrangements",ru:"Размещения без повторений"},
    summary:{
      hy:"Եթե ընտրված տարրերի հերթականությունը կարևոր է, պետք է հաշվել կարգավորված ընտրությունները։ Առանց կրկնության տեղադրությունների թիվը որոշվում է նվազող արտադրյալով։",
      en:"When order matters, count ordered selections. Without replacement, successive choices form a descending product.",
      ru:"Если порядок важен, считают упорядоченные выборы. Без повторений число размещений задаётся убывающим произведением."
    },
    formula:"$A_n^k=\\frac{n!}{(n-k)!},\\quad 0\\le k\\le n$",
    problem:{hy:"5 աշակերտից ընտրել նախագահ, քարտուղար և համակարգող։ Քանի՞ ձև կա։",en:"Assign president, secretary and coordinator from five students. How many ways?",ru:"Назначьте председателя, секретаря и координатора из пяти учеников. Сколько способов?"},
    steps:{
      hy:["Պաշտոնները տարբեր են, հետևաբար հերթականությունը կարևոր է։","Առաջին դերի համար կա $5$, երկրորդի՝ $4$, երրորդի՝ $3$ տարբերակ։","$A_5^3=5\\cdot4\\cdot3=60$ եղանակ։"],
      en:["The three roles are distinct, so order matters.","There are $5$, then $4$, then $3$ available students.","Thus $A_5^3=5\\cdot4\\cdot3=60$ arrangements."],
      ru:["Три должности различны, порядок важен.","Для первой роли $5$ вариантов, для второй $4$, для третьей $3$.","Итого $A_5^3=5\\cdot4\\cdot3=60$ способов."]
    },
    answer:"$60$",
    mistake:{
      hy:"Սա զուգորդություն չէ․ տարբեր պաշտոնների համար նույն երեք աշակերտների փոխատեղումները տարբեր են։",
      en:"Do not use combinations: assigning the same three people to different roles produces different arrangements.",
      ru:"Не используйте сочетания: одни и те же три человека на разных должностях дают разные размещения."
    }
  },
  {
    id:"logarithm-base-change",category:"expressions",
    title:{hy:"Լոգարիթմի հիմքի փոփոխություն",en:"Change of logarithm base",ru:"Переход к новому основанию логарифма"},
    summary:{
      hy:"Լոգարիթմի հիմքը կարելի է փոխել՝ օգտագործելով նույն նոր հիմքով երկու լոգարիթմների քանորդը։ Նախ ստուգիր հիմքի և փաստարկի թույլատրելիությունը։",
      en:"Change logarithm bases by dividing logs in the same new base. Check that the original base and argument are valid.",
      ru:"Основание логарифма меняют отношением логарифмов с общим новым основанием. Проверяйте область определения."
    },
    formula:"$\\log_a b=\\frac{\\ln b}{\\ln a},\\quad a>0,\\ a\\ne1,\\ b>0$",
    problem:{hy:"Հաշվել $\\log_4 8$։",en:"Evaluate $\\log_4 8$.",ru:"Вычислите $\\log_4 8$."},
    steps:{
      hy:["Օգտագործիր հիմքի փոփոխությունը՝ $\\log_4 8=\\frac{\\log_2 8}{\\log_2 4}$։","Գտիր $\\log_2 8=3$ և $\\log_2 4=2$։","Հետևաբար $\\log_4 8=\\frac32$։"],
      en:["Apply the change-of-base formula: $\\log_4 8=\\frac{\\log_2 8}{\\log_2 4}$.","Compute $\\log_2 8=3$ and $\\log_2 4=2$.","Therefore $\\log_4 8=\\frac32$."],
      ru:["По формуле перехода $\\log_4 8=\\frac{\\log_2 8}{\\log_2 4}$.","Здесь $\\log_2 8=3$, $\\log_2 4=2$.","Значит $\\log_4 8=\\frac32$."]
    },
    answer:"$\\frac32$",
    mistake:{
      hy:"Հիմքի փոփոխության բանաձևում մի՛ փոխատեղիր համարիչն ու հայտարարը. հակառակ դեպքում կստանաս հակադարձ թիվ։",
      en:"Do not swap numerator and denominator in the change-of-base formula; that produces the reciprocal.",
      ru:"Не меняйте местами числитель и знаменатель при переходе к новому основанию: получится обратное число."
    }
  }
];
