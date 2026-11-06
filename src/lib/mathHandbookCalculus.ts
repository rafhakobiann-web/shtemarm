import type { MathTopic } from "./mathHandbookTypes";

/** Original teaching examples. These explain techniques; they are not a solution key for book questions. */
export const MATH_HANDBOOK_CALCULUS: MathTopic[] = [
  {
    id:"derivative-power", category:"functions",
    title:{hy:"Ածանցյալի հիմնական կանոնները",en:"Basic differentiation rules",ru:"Основные правила производной"},
    summary:{
      hy:"Ածանցյալը բնութագրում է ֆունկցիայի փոփոխության արագությունը։ Հաստատի ածանցյալը զրո է, իսկ գումարի ածանցյալը հավասար է ածանցյալների գումարին։",
      en:"A derivative measures instantaneous change. The derivative of a constant is zero, and sums are differentiated term by term.",
      ru:"Производная показывает скорость изменения функции. Производная константы равна нулю, а сумма дифференцируется по слагаемым."
    },
    formula:"$(x^n)'=nx^{n-1},\\quad (c)'=0,\\quad (u+v)'=u'+v'$",
    problem:{
      hy:"Եթե $f(x)=2x^3-3x^2-7$, գտնել $f'(1)$-ը։",
      en:"For $f(x)=2x^3-3x^2-7$, calculate $f'(1)$.",
      ru:"Для $f(x)=2x^3-3x^2-7$ найдите $f'(1)$."
    },
    steps:{
      hy:["Կիրառիր աստիճանային կանոնը՝ $(2x^3)'=6x^2$։","Մնացած անդամների համար՝ $(-3x^2)'=-6x$, $(-7)'=0$, հետևաբար $f'(x)=6x^2-6x$։","Տեղադրիր $x=1$՝ $f'(1)=6-6=0$։"],
      en:["Differentiate the cubic term: $(2x^3)'=6x^2$.","Differentiate the remaining terms: $(-3x^2)'=-6x$, $(-7)'=0$, hence $f'(x)=6x^2-6x$.","Substitute $x=1$: $f'(1)=6-6=0$."],
      ru:["Применим степенное правило: $(2x^3)'=6x^2$.","Для остальных членов: $(-3x^2)'=-6x$, $(-7)'=0$, значит $f'(x)=6x^2-6x$.","Подставим $x=1$: $f'(1)=6-6=0$."]
    },
    answer:"$f'(1)=0$",
    mistake:{
      hy:"$(x^n)'$-ը $x^{n-1}$ չէ․ պետք է բազմապատկել նաև $n$-ով։ Հաստատուն անդամը չի մնում ածանցյալում։",
      en:"The derivative of $x^n$ includes the factor $n$. Constants disappear under differentiation.",
      ru:"При дифференцировании $x^n$ не забывайте множитель $n$. Постоянное слагаемое даёт нуль."
    }
  },
  {
    id:"derivative-product-exponential", category:"functions",
    title:{hy:"Արտադրյալի և ցուցչային ֆունկցիայի ածանցյալ",en:"Product rule and exponential derivatives",ru:"Производная произведения и экспоненты"},
    summary:{
      hy:"Երկու ֆունկցիաների արտադրյալն ածանցելիս երկու գործոններն էլ ածանցվում են հերթով։ $e^x$-ի ածանցյալը կրկին $e^x$ է։",
      en:"When differentiating a product, differentiate each factor in turn. The derivative of $e^x$ equals $e^x$.",
      ru:"При дифференцировании произведения поочерёдно дифференцируют оба множителя. Производная $e^x$ равна $e^x$."
    },
    formula:"$(uv)'=u'v+uv',\\quad (e^x)'=e^x$",
    problem:{
      hy:"Տրված է $f(x)=e^x(-x^2+x+1)$։ Գտնել $f'(0)$-ը։",
      en:"Given $f(x)=e^x(-x^2+x+1)$, find $f'(0)$.",
      ru:"Дано $f(x)=e^x(-x^2+x+1)$. Найдите $f'(0)$."
    },
    steps:{
      hy:["Նշանակիր $u=e^x$, $v=-x^2+x+1$, ուրեմն $u'=e^x$, $v'=-2x+1$։","Արտադրյալի կանոնով՝ $f'(x)=e^x((-x^2+x+1)+(-2x+1))=e^x(-x^2-x+2)$։","$x=0$ դեպքում՝ $f'(0)=e^0\\cdot2=2$։"],
      en:["Let $u=e^x$, $v=-x^2+x+1$: $u'=e^x$, $v'=-2x+1$.","By the product rule, $f'(x)=e^x(-x^2-x+2)$.","At $x=0$, $f'(0)=e^0\\cdot2=2$."],
      ru:["Положим $u=e^x$, $v=-x^2+x+1$: $u'=e^x$, $v'=-2x+1$.","По правилу произведения $f'(x)=e^x(-x^2-x+2)$.","При $x=0$ получаем $f'(0)=e^0\\cdot2=2$."]
    },
    answer:"$f'(0)=2$",
    mistake:{
      hy:"$(uv)'=u'v+uv'$ է, ոչ թե $u'v'$։ Մի՛ մոռացիր երկու գումարելիներն էլ։",
      en:"The product rule is $u'v+uv'$, not $u'v'$. Both terms matter.",
      ru:"Правило произведения: $u'v+uv'$, а не $u'v'$. Нужны оба слагаемых."
    }
  },
  {
    id:"tangent-equation", category:"functions",
    title:{hy:"Շոշափողի հավասարում և թեքություն",en:"Tangent-line equation and slope",ru:"Уравнение касательной и её наклон"},
    summary:{
      hy:"Ֆունկցիայի գրաֆիկին $x=a$ կետում տարված շոշափողի թեքության գործակիցը $f'(a)$-ն է։ Շոշափողը անցնում է $(a,f(a))$ կետով։",
      en:"At $x=a$, the tangent slope is $f'(a)$. The tangent passes through the point $(a,f(a))$.",
      ru:"Угловой коэффициент касательной в точке $x=a$ равен $f'(a)$. Она проходит через $(a,f(a))$."
    },
    formula:"$y-f(a)=f'(a)(x-a),\\quad k=f'(a)=\\tan\\alpha$",
    problem:{
      hy:"Գտնել $f(x)=x^2$ ֆունկցիայի գրաֆիկի շոշափողը $x=2$ կետում։",
      en:"Find the tangent to $f(x)=x^2$ at $x=2$.",
      ru:"Найдите касательную к $f(x)=x^2$ в точке $x=2$."
    },
    steps:{
      hy:["Գտիր կետի օրդինատը՝ $f(2)=4$։","Գտիր ածանցյալը՝ $f'(x)=2x$, հետևաբար թեքությունը $f'(2)=4$ է։","Օգտագործիր բանաձևը՝ $y-4=4(x-2)$, այսինքն՝ $y=4x-4$։"],
      en:["Find the point: $f(2)=4$.","Differentiate: $f'(x)=2x$, so $f'(2)=4$.","Use the tangent formula: $y-4=4(x-2)$, hence $y=4x-4$."],
      ru:["Вычислим координату точки: $f(2)=4$.","Найдём производную: $f'(x)=2x$, значит $f'(2)=4$.","Подставим: $y-4=4(x-2)$, то есть $y=4x-4$."]
    },
    answer:"$y=4x-4$",
    mistake:{
      hy:"Շոշափողի հավասարման մեջ պետք են և՛ $f(a)$-ը, և՛ $f'(a)$-ը. միայն ածանցյալը շոշափողի հավասարումը չէ։",
      en:"Both $f(a)$ and $f'(a)$ are needed; the derivative alone is not the equation of the tangent.",
      ru:"Нужны и $f(a)$, и $f'(a)$; одной производной недостаточно для уравнения касательной."
    }
  },
  {
    id:"absolute-value-derivative", category:"functions",
    title:{hy:"Մոդուլով ֆունկցիան և նրա ածանցյալը",en:"Absolute-value functions and derivatives",ru:"Функции с модулем и их производные"},
    summary:{
      hy:"Մոդուլի սահմանմամբ $x|x|$-ը $x^2$ է, երբ $x\\ge0$, և $-x^2$ է, երբ $x<0$։ Այս ֆունկցիան ածանցելի է նաև զրոյում։",
      en:"By the definition of absolute value, $x|x|=x^2$ for $x\\ge0$ and $-x^2$ for $x<0$. This function is differentiable at zero.",
      ru:"По определению модуля $x|x|=x^2$ при $x\\ge0$ и $-x^2$ при $x<0$. Функция дифференцируема и в нуле."
    },
    formula:"$f(x)=x|x|\\quad\\Rightarrow\\quad f'(x)=2|x|$",
    problem:{
      hy:"Տրված է $f(x)=x|x|$։ Գտնել $f'(-2)$-ը։",
      en:"For $f(x)=x|x|$, calculate $f'(-2)$.",
      ru:"Дано $f(x)=x|x|$. Найдите $f'(-2)$."
    },
    steps:{
      hy:["Երբ $x<0$, ունենք $|x|=-x$, ուստի $f(x)=-x^2$։","Ածանցյալը այդ միջակայքում $f'(x)=-2x$ է։","Տեղադրիր $x=-2$՝ $f'(-2)=-2(-2)=4$։"],
      en:["For $x<0$, $|x|=-x$, so $f(x)=-x^2$.","Its derivative in that interval is $f'(x)=-2x$.","At $x=-2$, $f'(-2)=-2(-2)=4$."],
      ru:["Если $x<0$, то $|x|=-x$, поэтому $f(x)=-x^2$.","Производная на этом промежутке $f'(x)=-2x$.","При $x=-2$: $f'(-2)=-2(-2)=4$."]
    },
    answer:"$f'(-2)=4$",
    mistake:{
      hy:"$x|x|$-ի ածանցյալը բոլոր $x$-երի համար $2x$ չէ։ Բացասական $x$-ի դեպքում ածանցյալը $-2x$ է։",
      en:"The derivative of $x|x|$ is not $2x$ for all $x$. For negative $x$, it is $-2x$.",
      ru:"Производная $x|x|$ не равна $2x$ при всех $x$: при отрицательных $x$ она равна $-2x$."
    }
  },
  {
    id:"derivative-extrema", category:"functions",
    title:{hy:"Աճման, նվազման և էքստրեմումների կանոններ",en:"Increasing, decreasing, and extrema",ru:"Возрастание, убывание и экстремумы"},
    summary:{
      hy:"Եթե միջակայքում ածանցյալը դրական է, ֆունկցիան աճում է, եթե բացասական՝ նվազում։ Կրիտիկական կետերում ստուգիր ածանցյալի նշանի փոփոխությունը։",
      en:"A positive derivative implies increasing behaviour, a negative one decreasing. Check sign changes around critical points.",
      ru:"При положительной производной функция возрастает, при отрицательной убывает. В критических точках проверяйте смену знака."
    },
    formula:"$f'(x)>0\\Rightarrow\\nearrow,\\qquad f'(x)<0\\Rightarrow\\searrow$",
    problem:{
      hy:"Գտնել $f(x)=x^3-3x$ ֆունկցիայի տեղային առավելագույնն ու նվազագույնը։",
      en:"Find the local maximum and minimum of $f(x)=x^3-3x$.",
      ru:"Найдите локальный максимум и минимум $f(x)=x^3-3x$."
    },
    steps:{
      hy:["Ածանցիր՝ $f'(x)=3x^2-3=3(x-1)(x+1)$։","Ածանցյալի նշանը փոխվում է $x=-1$ և $x=1$ կետերում՝ համապատասխանաբար $+\\to-$ և $-\\to+$։","Ուրեմն $x=-1$-ում կա տեղային առավելագույն՝ $f(-1)=2$, իսկ $x=1$-ում տեղային նվազագույն՝ $f(1)=-2$։"],
      en:["Differentiate: $f'(x)=3(x-1)(x+1)$.","The derivative changes from positive to negative at $x=-1$, then from negative to positive at $x=1$.","Thus $f(-1)=2$ is a local maximum, and $f(1)=-2$ a local minimum."],
      ru:["Производная: $f'(x)=3(x-1)(x+1)$.","При $x=-1$ знак меняется с плюса на минус, при $x=1$ — с минуса на плюс.","Поэтому $f(-1)=2$ — локальный максимум, а $f(1)=-2$ — локальный минимум."]
    },
    answer:"$f(-1)=2,\\quad f(1)=-2$",
    mistake:{
      hy:"$f'(a)=0$ պայմանը միայն թեկնածու էքստրեմում է, ոչ թե ինքնին ապացույց։ Անհրաժեշտ է նշանի կամ վարքի ստուգում։",
      en:"The equation $f'(a)=0$ only identifies a candidate extremum. It is not proof without a sign or behaviour check.",
      ru:"Равенство $f'(a)=0$ лишь указывает на возможный экстремум. Нужна проверка смены знака или поведения."
    }
  },
  {
    id:"logarithm-properties", category:"expressions",
    title:{hy:"Լոգարիթմների հիմնական հատկությունները",en:"Logarithm laws and domains",ru:"Свойства логарифмов и область определения"},
    summary:{
      hy:"Լոգարիթմների գումարը նույն հիմքով դրական թվերի արտադրյալի լոգարիթմն է։ Հիմքը պետք է լինի դրական և մեկից տարբեր, իսկ փաստարկները՝ դրական։",
      en:"Logs with the same valid base turn products into sums. The base must be positive and unequal to one; arguments must be positive.",
      ru:"Логарифм произведения положительных чисел равен сумме логарифмов при одинаковом основании. Основание положительно и не равно единице."
    },
    formula:"$\\log_a(xy)=\\log_a x+\\log_a y,\\quad\\log_a(x^k)=k\\log_a x$",
    problem:{
      hy:"Հաշվել $\\log_2 8+\\log_2 4$։",
      en:"Evaluate $\\log_2 8+\\log_2 4$.",
      ru:"Вычислите $\\log_2 8+\\log_2 4$."
    },
    steps:{
      hy:["Ստուգիր՝ $2>0$, $2\\ne1$, իսկ $8,4>0$։","Օգտագործիր արտադրյալի կանոնը՝ $\\log_2 8+\\log_2 4=\\log_2(8\\cdot4)$։","Քանի որ $32=2^5$, պատասխանը $5$ է։"],
      en:["Check the base $2>0$, $2\\ne1$, and arguments $8,4>0$.","Apply the product law: $\\log_2 8+\\log_2 4=\\log_2 32$.","Since $32=2^5$, the result is $5$."],
      ru:["Проверим: $2>0$, $2\\ne1$, а аргументы $8,4>0$.","Применим свойство: $\\log_2 8+\\log_2 4=\\log_2 32$.","Так как $32=2^5$, получаем $5$."]
    },
    answer:"$5$",
    mistake:{
      hy:"$\\log_a(x+y)$-ը սովորաբար հավասար չէ $\\log_a x+\\log_a y$-ի։ Գումարի կանոնը վերաբերում է փաստարկների արտադրյալին։",
      en:"Do not confuse $\\log_a(x+y)$ with $\\log_a x+\\log_a y$: the sum rule applies to a product of arguments.",
      ru:"Не путайте $\\log_a(x+y)$ с $\\log_a x+\\log_a y$: правило суммы относится к произведению аргументов."
    }
  }
];
