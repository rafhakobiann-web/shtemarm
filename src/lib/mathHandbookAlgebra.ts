import type { MathTopic } from "./mathHandbookTypes";
export const MATH_ALGEBRA: MathTopic[] = [
  {
    "id": "linear",
    "category": "equations",
    "title": {
      "hy": "Գծային հավասարումներ",
      "en": "Linear equations",
      "ru": "Линейные уравнения"
    },
    "summary": {
      "hy": "Գծային հավասարումում անհայտը մեկ աստիճանի է։ Նույն գործողությունը կատարիր հավասարման երկու կողմում՝ լուծումը պահպանելու համար։",
      "en": "A linear equation has the unknown to the first power. Perform equivalent operations on both sides to preserve solutions.",
      "ru": "В линейном уравнении неизвестная в первой степени. Выполняйте одинаковые преобразования обеих частей."
    },
    "formula": "$ax+b=0,\\ a\\ne0\\Rightarrow x=-\\frac{b}{a}$",
    "problem": {
      "hy": "Լուծել 3x−7=11։",
      "en": "Solve 3x−7=11.",
      "ru": "Решите 3x−7=11."
    },
    "steps": {
      "hy": [
        "Երկու կողմին ավելացրու 7՝ 3x=18։",
        "Բաժանիր 3-ի՝ x=6։",
        "Ստուգում՝ 3·6−7=11։"
      ],
      "en": [
        "Add 7 to both sides: 3x=18.",
        "Divide by 3: x=6.",
        "Check: 3·6−7=11."
      ],
      "ru": [
        "Прибавьте 7: 3x=18.",
        "Разделите на 3: x=6.",
        "Проверка: 3·6−7=11."
      ]
    },
    "answer": "x=6",
    "mistake": {
      "hy": "Անդամ տեղափոխելիս նշանը փոխիր միայն ճիշտ հավասարարժեք գործողությամբ։",
      "en": "Changing a term's side requires the corresponding sign change.",
      "ru": "При переносе слагаемого нужно менять знак корректно."
    }
  },
  {
    "id": "quadratic",
    "category": "equations",
    "title": {
      "hy": "Քառակուսային հավասարումներ և տարբերիչ",
      "en": "Quadratic equations and discriminant",
      "ru": "Квадратные уравнения и дискриминант"
    },
    "summary": {
      "hy": "ax²+bx+c=0 (a≠0) հավասարման իրական արմատների քանակը որոշում է D=b²−4ac տարբերիչը։ D<0 դեպքում իրական արմատներ չկան։",
      "en": "For ax²+bx+c=0 with a≠0, the discriminant D=b²−4ac determines the number of real roots. If D<0 there are no real roots.",
      "ru": "Для ax²+bx+c=0 (a≠0) число действительных корней определяет D=b²−4ac. При D<0 действительных корней нет."
    },
    "formula": "$D=b^2-4ac,\\quad x=\\frac{-b\\pm\\sqrt{D}}{2a}$",
    "problem": {
      "hy": "Լուծել x²−5x+6=0։",
      "en": "Solve x²−5x+6=0.",
      "ru": "Решите x²−5x+6=0."
    },
    "steps": {
      "hy": [
        "a=1, b=−5, c=6։",
        "D=25−24=1։",
        "x=(5±1)/2, այսինքն՝ 2 և 3։"
      ],
      "en": [
        "a=1, b=−5, c=6.",
        "D=25−24=1.",
        "x=(5±1)/2 gives 2 and 3."
      ],
      "ru": [
        "a=1, b=−5, c=6.",
        "D=25−24=1.",
        "x=(5±1)/2: 2 и 3."
      ]
    },
    "answer": "x=2; x=3",
    "mistake": {
      "hy": "Արմատի բանաձևի հայտարարում ամբողջ 2a-ն է։ D-ի քառակուսի արմատից «±»-ը մի՛ մոռացիր։",
      "en": "The whole denominator is 2a; do not drop the ± sign.",
      "ru": "В знаменателе стоит 2a целиком; не забывайте ±."
    }
  },
  {
    "id": "vieta",
    "category": "equations",
    "title": {
      "hy": "Վիետի թեորեմ",
      "en": "Vieta's formulas",
      "ru": "Теорема Виета"
    },
    "summary": {
      "hy": "Եթե x₁, x₂-ը ax²+bx+c=0-ի արմատներն են, ապա դրանց գումարը −b/a է, արտադրյալը՝ c/a։",
      "en": "For roots x₁ and x₂ of ax²+bx+c=0, their sum is −b/a and product c/a.",
      "ru": "Если x₁ и x₂ — корни ax²+bx+c=0, то сумма равна −b/a, произведение — c/a."
    },
    "formula": "$x_1+x_2=-\\frac{b}{a},\\quad x_1x_2=\\frac{c}{a}$",
    "problem": {
      "hy": "Գտնել x²−7x+12=0-ի արմատները։",
      "en": "Find roots of x²−7x+12=0.",
      "ru": "Найдите корни x²−7x+12=0."
    },
    "steps": {
      "hy": [
        "Արմատների գումարը պետք է լինի 7։",
        "Արտադրյալը՝ 12։",
        "Այդ թվերն են 3 և 4։"
      ],
      "en": [
        "Their sum is 7.",
        "Their product is 12.",
        "The numbers are 3 and 4."
      ],
      "ru": [
        "Сумма равна 7.",
        "Произведение равно 12.",
        "Подходят числа 3 и 4."
      ]
    },
    "answer": "x=3; x=4",
    "mistake": {
      "hy": "−b/a-ի բացասական նշանը մի՛ մոռացիր։",
      "en": "Do not forget the minus sign in −b/a.",
      "ru": "Не забывайте минус в −b/a."
    }
  },
  {
    "id": "systems",
    "category": "equations",
    "title": {
      "hy": "Երկու անհայտով գծային համակարգեր",
      "en": "Systems of linear equations",
      "ru": "Системы линейных уравнений"
    },
    "summary": {
      "hy": "Փոխարինման կամ գումարման եղանակով ստացիր մեկ անհայտով հավասարում, հետո գտիր մյուսը։ Վերջում ստուգիր երկու սկզբնական հավասարումները։",
      "en": "Use substitution or elimination to reduce to one unknown, then back-substitute and check both equations.",
      "ru": "Решайте подстановкой или сложением, затем найдите вторую переменную и проверьте обе исходные строки."
    },
    "formula": "$\\begin{cases}x+y=7\\\\x-y=1\\end{cases}$",
    "problem": {
      "hy": "Լուծել x+y=7, x−y=1 համակարգը։",
      "en": "Solve x+y=7, x−y=1.",
      "ru": "Решите систему x+y=7, x−y=1."
    },
    "steps": {
      "hy": [
        "Գումարիր հավասարումները՝ 2x=8։",
        "x=4։",
        "4+y=7, հետևաբար y=3։"
      ],
      "en": [
        "Add the equations: 2x=8.",
        "Thus x=4.",
        "From 4+y=7, y=3."
      ],
      "ru": [
        "Сложите уравнения: 2x=8.",
        "Следовательно x=4.",
        "Из 4+y=7 получаем y=3."
      ]
    },
    "answer": "(x,y)=(4,3)",
    "mistake": {
      "hy": "Մի ստուգիր միայն առաջին հավասարումը․ երկրորդը նույնպես պարտադիր է։",
      "en": "Check both equations, not just the first.",
      "ru": "Проверьте оба уравнения, не только первое."
    }
  },
  {
    "id": "equation-domains",
    "category": "equations",
    "title": {
      "hy": "Թույլատրելի արժեքներ և կողմնակի արմատներ",
      "en": "Domains and extraneous roots",
      "ru": "ОДЗ и посторонние корни"
    },
    "summary": {
      "hy": "Հայտարարում անհայտ ունենալիս այն չպետք է զրո լինի։ Արմատ կամ լոգարիթմ պարունակող հավասարումները լուծելիս ստուգիր արգելված արժեքներն ու կողմնակի արմատները։",
      "en": "Never allow a zero denominator. Check domain restrictions and extraneous roots, especially after squaring or logarithmic transformations.",
      "ru": "Знаменатель не должен быть нулём. Проверяйте ОДЗ и посторонние корни после возведения в квадрат или преобразования логарифмов."
    },
    "formula": "$\\frac{x^2-4}{x-2}=0,\\quad x\\ne2$",
    "problem": {
      "hy": "Լուծել (x²−4)/(x−2)=0։",
      "en": "Solve (x²−4)/(x−2)=0.",
      "ru": "Решите (x²−4)/(x−2)=0."
    },
    "steps": {
      "hy": [
        "x≠2՝ սկզբնական արտահայտությունից։",
        "Համարիչը զրո է, երբ x²−4=0, այսինքն x=±2։",
        "x=2-ը արգելված է, ուստի մնում է x=−2։"
      ],
      "en": [
        "The original denominator requires x≠2.",
        "Set numerator zero: x=±2.",
        "Exclude x=2; only x=−2 remains."
      ],
      "ru": [
        "Из знаменателя x≠2.",
        "Из x²−4=0 имеем x=±2.",
        "Исключаем x=2, остаётся x=−2."
      ]
    },
    "answer": "x=−2",
    "mistake": {
      "hy": "Կրճատումից հետո x=2-ը թույլատրելի չի դառնում։",
      "en": "Cancelling factors never restores an excluded value.",
      "ru": "После сокращения x=2 не становится допустимым."
    }
  },
  {
    "id": "linear-inequality",
    "category": "inequalities",
    "title": {
      "hy": "Գծային անհավասարումներ",
      "en": "Linear inequalities",
      "ru": "Линейные неравенства"
    },
    "summary": {
      "hy": "Անհավասարության երկու կողմը բացասական թվով բազմապատկելիս կամ բաժանելիս նշանը շրջվում է։",
      "en": "Reverse the inequality when multiplying or dividing both sides by a negative number.",
      "ru": "При умножении или делении обеих частей на отрицательное число знак неравенства меняется."
    },
    "formula": "$-2x<6\\Rightarrow x>-3$",
    "problem": {
      "hy": "Լուծել −2x<6։",
      "en": "Solve −2x<6.",
      "ru": "Решите −2x<6."
    },
    "steps": {
      "hy": [
        "Երկու կողմը բաժանիր −2-ի։",
        "< նշանը փոխվում է >-ի։",
        "x>−3։"
      ],
      "en": [
        "Divide both sides by −2.",
        "Reverse the inequality sign.",
        "x>−3."
      ],
      "ru": [
        "Разделите обе части на −2.",
        "Поменяйте знак неравенства.",
        "x>−3."
      ]
    },
    "answer": "x>−3",
    "mistake": {
      "hy": "Բացասականով բաժանելիս < նշանը չշրջելը սխալ պատասխան կտա։",
      "en": "Failing to reverse < after division by a negative gives a wrong set.",
      "ru": "При делении на отрицательное обязательно меняйте знак."
    }
  },
  {
    "id": "quadratic-inequality",
    "category": "inequalities",
    "title": {
      "hy": "Քառակուսային անհավասարումներ",
      "en": "Quadratic inequalities",
      "ru": "Квадратные неравенства"
    },
    "summary": {
      "hy": "Գտիր քառակուսային արտահայտության զրոները և որոշիր նշանը միջակայքներում։ Պարունակվող սահմանային կետերը կախված են ≥/≤ կամ >/< նշանից։",
      "en": "Factor or find zeros, then determine the sign on intervals. Whether endpoints are included depends on strict vs non-strict signs.",
      "ru": "Найдите нули и определите знак на промежутках. Включение концов зависит от строгого или нестрогого знака."
    },
    "formula": "$x^2-5x+6=(x-2)(x-3)$",
    "problem": {
      "hy": "Լուծել x²−5x+6≤0։",
      "en": "Solve x²−5x+6≤0.",
      "ru": "Решите x²−5x+6≤0."
    },
    "steps": {
      "hy": [
        "Վերլուծիր (x−2)(x−3)≤0։",
        "Արտադրյալը ոչ դրական է 2 և 3 արմատների միջև։",
        "Պատասխան՝ [2,3]։"
      ],
      "en": [
        "Factor as (x−2)(x−3)≤0.",
        "The product is nonpositive between the roots.",
        "Include endpoints: [2,3]."
      ],
      "ru": [
        "Разложите (x−2)(x−3)≤0.",
        "Произведение неположительно между корнями.",
        "Ответ: [2,3]."
      ]
    },
    "answer": "[2,3]",
    "mistake": {
      "hy": "≤ դեպքում արմատները ներառվում են։ > դեպքում լուծումների ձևը կարող է լրիվ այլ լինել։",
      "en": "With ≤, include the roots; do not confuse this with >.",
      "ru": "При ≤ корни включаются; для > решение другое."
    }
  },
  {
    "id": "absolute-inequality",
    "category": "inequalities",
    "title": {
      "hy": "Մոդուլ պարունակող անհավասարումներ",
      "en": "Absolute-value inequalities",
      "ru": "Неравенства с модулем"
    },
    "summary": {
      "hy": "a>0 դեպքում |x|<a ⇔ −a<x<a, իսկ |x|>a ⇔ x<−a կամ x>a։",
      "en": "For a>0, |x|<a means −a<x<a; |x|>a means x<−a or x>a.",
      "ru": "При a>0: |x|<a означает −a<x<a; |x|>a означает x<−a или x>a."
    },
    "formula": "$|x|<a\\iff-a<x<a\\ (a>0)$",
    "problem": {
      "hy": "Լուծել |x−2|<3։",
      "en": "Solve |x−2|<3.",
      "ru": "Решите |x−2|<3."
    },
    "steps": {
      "hy": [
        "−3<x−2<3։",
        "Երեք մասերին ավելացրու 2։",
        "−1<x<5։"
      ],
      "en": [
        "−3<x−2<3.",
        "Add 2 to all three parts.",
        "−1<x<5."
      ],
      "ru": [
        "−3<x−2<3.",
        "Прибавьте 2 ко всем трём частям.",
        "−1<x<5."
      ]
    },
    "answer": "−1<x<5",
    "mistake": {
      "hy": "|A|<a-ի համար «կամ» չէ, այլ երկու սահմանափակումը միաժամանակ։",
      "en": "For |A|<a, both bounds hold simultaneously (and, not or).",
      "ru": "Для |A|<a обе границы выполняются одновременно (и, не или)."
    }
  },
  {
    "id": "motion",
    "category": "word-problems",
    "title": {
      "hy": "Շարժման խնդիրներ",
      "en": "Distance–speed–time problems",
      "ru": "Задачи на движение"
    },
    "summary": {
      "hy": "Հիմնական կապը S=vt է։ Միավորները միատեսակ դարձրու։ Հանդիպակաց շարժման հարաբերական արագությունները գումարվում են։",
      "en": "Use distance = speed × time with consistent units. For objects moving toward each other, add relative speeds.",
      "ru": "Используйте S=vt с согласованными единицами. При встречном движении относительные скорости складываются."
    },
    "formula": "$S=vt,\\quad t=\\frac{S}{v}$",
    "problem": {
      "hy": "120 կմ ճանապարհը 60 կմ/ժ արագությամբ որքան ժամանակ կտևի՞։",
      "en": "How long for 120 km at 60 km/h?",
      "ru": "Сколько времени потребуется на 120 км при 60 км/ч?"
    },
    "steps": {
      "hy": [
        "t=S/v։",
        "t=120/60։",
        "t=2 ժամ։"
      ],
      "en": [
        "t=S/v.",
        "t=120/60.",
        "t=2 hours."
      ],
      "ru": [
        "t=S/v.",
        "t=120/60.",
        "t=2 часа."
      ]
    },
    "answer": "2 hours",
    "mistake": {
      "hy": "Կիլոմետրն ու մետրը կամ րոպեն ու ժամը մի՛ խառնիր առանց փոխակերպման։",
      "en": "Do not mix kilometres with metres or minutes with hours.",
      "ru": "Не смешивайте километры с метрами и минуты с часами."
    }
  },
  {
    "id": "work-rates",
    "category": "word-problems",
    "title": {
      "hy": "Աշխատանքի և արտադրողականության խնդիրներ",
      "en": "Work-rate problems",
      "ru": "Задачи на совместную работу"
    },
    "summary": {
      "hy": "Եթե մեկը գործը կատարում է a ժամում, ապա ժամում կատարում է 1/a մասը։ Միասին աշխատանքի արագությունները գումարվում են։",
      "en": "A worker who finishes in a hours completes 1/a of the job per hour. Add rates to find a combined rate.",
      "ru": "Если один работник делает всю работу за a часов, за час он выполняет 1/a работы. Совместные скорости складываются."
    },
    "formula": "$\\frac{1}{T}=\\frac{1}{a}+\\frac{1}{b}$",
    "problem": {
      "hy": "Մի աշխատողը ավարտում է 6 ժամում, մյուսը՝ 3-ում։ Միասին՝ քանի՞ ժամ։",
      "en": "One worker takes 6 hours, another 3. How long together?",
      "ru": "Один работает 6 часов, другой 3. За сколько справятся вместе?"
    },
    "steps": {
      "hy": [
        "Ժամային մասերը՝ 1/6 և 1/3։",
        "Միասին՝ 1/6+1/3=1/2 աշխատանք/ժամ։",
        "T=1÷(1/2)=2 ժամ։"
      ],
      "en": [
        "Rates are 1/6 and 1/3 jobs/hour.",
        "Combined rate = 1/2 job/hour.",
        "Time = 2 hours."
      ],
      "ru": [
        "Скорости: 1/6 и 1/3 работы/час.",
        "Вместе: 1/2 работы/час.",
        "Время = 2 часа."
      ]
    },
    "answer": "2 hours",
    "mistake": {
      "hy": "Ժամանակները՝ 6 և 3, ուղղակի գումարելով 9 ժամ չես ստանում միասնական ժամանակը։",
      "en": "Do not add the times 6+3; add the rates.",
      "ru": "Не складывайте 6 и 3 часа: складывайте производительности."
    }
  },
  {
    "id": "mixtures",
    "category": "word-problems",
    "title": {
      "hy": "Խառնուրդներ և կոնցենտրացիա",
      "en": "Mixtures and concentrations",
      "ru": "Смеси и концентрации"
    },
    "summary": {
      "hy": "Խառնուրդի նյութի քանակը հավասար է զանգված×բաժնեմաս։ Խառնելիս պահպանվում է խառնվող նյութի ընդհանուր քանակը (եթե նյութ չի կորչում)։",
      "en": "Amount of a component equals total mass times concentration fraction. In a lossless mixture, component amounts add.",
      "ru": "Масса компонента равна общей массе, умноженной на долю концентрации. При смешивании без потерь массы компонентов складываются."
    },
    "formula": "$c=\\frac{m_{\\mathrm{solute}}}{m_{\\mathrm{mixture}}}\\cdot100\\%$",
    "problem": {
      "hy": "2 կգ 10% լուծույթին ավելացրին 1 կգ մաքուր ջուր։ Որքա՞ն տոկոս է նոր լուծույթը։",
      "en": "Add 1 kg pure water to 2 kg of 10% solution. New concentration?",
      "ru": "К 2 кг 10%-го раствора добавили 1 кг воды. Новая концентрация?"
    },
    "steps": {
      "hy": [
        "Նյութի զանգվածը՝ 2×0.10=0.2 կգ։",
        "Ընդհանուր զանգված՝ 2+1=3 կգ։",
        "(0.2/3)×100%≈6.67%։"
      ],
      "en": [
        "Solute mass = 2×0.10=0.2 kg.",
        "Total mass = 3 kg.",
        "(0.2/3)×100%≈6.67%."
      ],
      "ru": [
        "Масса вещества = 2×0,10=0,2 кг.",
        "Общая масса = 3 кг.",
        "(0,2/3)×100%≈6,67%."
      ]
    },
    "answer": "≈6.67%",
    "mistake": {
      "hy": "Ջուր ավելացնելուց հետո լուծված նյութի զանգվածը չի մեծանում։",
      "en": "Adding water changes the total mass, not the solute mass.",
      "ru": "Добавление воды не увеличивает массу растворённого вещества."
    }
  },
  {
    "id": "arithmetic-progression",
    "category": "sequences",
    "title": {
      "hy": "Թվաբանական պրոգրեսիա",
      "en": "Arithmetic progression",
      "ru": "Арифметическая прогрессия"
    },
    "summary": {
      "hy": "Հաջորդականության հարևան անդամների տարբերությունը հաստատուն է՝ d։ Առաջին n անդամների գումարը կարելի է գտնել առաջին և վերջին անդամներով։",
      "en": "Consecutive terms differ by a constant d. The first n terms sum to n times the average of first and last.",
      "ru": "Разность соседних членов постоянна и равна d. Сумма n членов — n на среднее первого и последнего."
    },
    "formula": "$a_n=a_1+(n-1)d$; $S_n=\\frac{n(a_1+a_n)}{2}$",
    "problem": {
      "hy": "Տրված է a₁=3, d=2։ Գտնել a₅-ը և S₅-ը։",
      "en": "Given a₁=3 and d=2, find a₅ and S₅.",
      "ru": "Дано a₁=3, d=2. Найдите a₅ и S₅."
    },
    "steps": {
      "hy": [
        "a₅=3+(5−1)×2=11։",
        "S₅=5(3+11)/2։",
        "S₅=35։"
      ],
      "en": [
        "a₅=3+4×2=11.",
        "S₅=5(3+11)/2.",
        "S₅=35."
      ],
      "ru": [
        "a₅=3+4×2=11.",
        "S₅=5(3+11)/2.",
        "S₅=35."
      ]
    },
    "answer": "a₅=11; S₅=35",
    "mistake": {
      "hy": "aₙ-ի բանաձևում n−1 է, ոչ թե n։",
      "en": "Use n−1 rather than n in the nth-term formula.",
      "ru": "В формуле n-го члена используется n−1, а не n."
    }
  },
  {
    "id": "geometric-progression",
    "category": "sequences",
    "title": {
      "hy": "Երկրաչափական պրոգրեսիա",
      "en": "Geometric progression",
      "ru": "Геометрическая прогрессия"
    },
    "summary": {
      "hy": "Յուրաքանչյուր հաջորդ անդամը ստացվում է նախորդը q-ով բազմապատկելով։ q≠1 դեպքում գումարի բանաձևը տարբեր է թվաբանականից։",
      "en": "Each term is multiplied by a constant ratio q to get the next. The sum formula differs from arithmetic progression.",
      "ru": "Каждый следующий член получается умножением на q. Формула суммы отличается от арифметической."
    },
    "formula": "$b_n=b_1q^{n-1}$, $S_n=b_1\\frac{q^n-1}{q-1}$ ($q\\ne1$)",
    "problem": {
      "hy": "b₁=2, q=3։ Գտնել b₄-ը և S₄-ը։",
      "en": "Given b₁=2 and q=3, find b₄ and S₄.",
      "ru": "Дано b₁=2, q=3. Найдите b₄ и S₄."
    },
    "steps": {
      "hy": [
        "b₄=2×3³=54։",
        "S₄=2(3⁴−1)/(3−1)։",
        "S₄=80։"
      ],
      "en": [
        "b₄=2×3³=54.",
        "S₄=2(81−1)/2.",
        "S₄=80."
      ],
      "ru": [
        "b₄=2×3³=54.",
        "S₄=2(81−1)/2.",
        "S₄=80."
      ]
    },
    "answer": "b₄=54; S₄=80",
    "mistake": {
      "hy": "Երկրաչափական պրոգրեսիայի q-ն բազմապատկիչ է, ոչ թե գումարվող տարբերություն։",
      "en": "q is a multiplier, not an additive difference.",
      "ru": "q — множитель, а не прибавляемая разность."
    }
  }
];
