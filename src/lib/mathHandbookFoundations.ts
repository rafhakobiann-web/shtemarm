import type { MathTopic } from "./mathHandbookTypes";
/** Original, manually checked lessons with worked steps in three UI languages. */
export const MATH_FOUNDATIONS: MathTopic[] = [
  {
    "id": "order",
    "category": "arithmetic",
    "title": {
      "hy": "Գործողությունների հերթականություն",
      "en": "Order of operations",
      "ru": "Порядок действий"
    },
    "summary": {
      "hy": "Սկզբում փակագծերն ու աստիճանները, ապա բազմապատկումն ու բաժանումը, վերջում՝ գումարումն ու հանումը։ Նույն առաջնահերթության գործողությունները կատարիր ձախից աջ։",
      "en": "Evaluate brackets and powers first, then multiplication/division, then addition/subtraction. Work left to right within equal priority.",
      "ru": "Сначала скобки и степени, затем умножение и деление, затем сложение и вычитание. При одинаковом приоритете — слева направо."
    },
    "formula": "( ) → powers → × ÷ → + −",
    "problem": {
      "hy": "Հաշվել 8 + 3 × (6 − 2)։",
      "en": "Calculate 8 + 3 × (6 − 2).",
      "ru": "Вычислите 8 + 3 × (6 − 2)."
    },
    "steps": {
      "hy": [
        "Փակագծում՝ 6 − 2 = 4։",
        "Այնուհետև՝ 3 × 4 = 12։",
        "Վերջապես՝ 8 + 12 = 20։"
      ],
      "en": [
        "Brackets: 6 − 2 = 4.",
        "Multiply: 3 × 4 = 12.",
        "Add: 8 + 12 = 20."
      ],
      "ru": [
        "В скобках: 6 − 2 = 4.",
        "Умножение: 3 × 4 = 12.",
        "Сложение: 8 + 12 = 20."
      ]
    },
    "answer": "20",
    "mistake": {
      "hy": "Սխալ՝ (8+3)×4=44։ Գումարումը չպետք է նախորդի բազմապատկմանը։",
      "en": "Wrong: (8+3)×4=44. Addition cannot precede multiplication here.",
      "ru": "Ошибка: (8+3)×4=44. Здесь сложение не выполняется раньше умножения."
    }
  },
  {
    "id": "fractions",
    "category": "arithmetic",
    "title": {
      "hy": "Կոտորակներ և ընդհանուր հայտարար",
      "en": "Fractions and common denominators",
      "ru": "Дроби и общий знаменатель"
    },
    "summary": {
      "hy": "Գումարելու/հանելու համար բեր ընդհանուր հայտարարի։ Բազմապատկելիս բազմապատկիր համարիչները և հայտարարները, բաժանելիս՝ երկրորդ կոտորակը շրջիր։",
      "en": "Use a common denominator for addition/subtraction. Multiply numerators and denominators; division uses the reciprocal.",
      "ru": "Для сложения и вычитания нужен общий знаменатель. При умножении перемножайте числители и знаменатели, при делении переворачивайте вторую дробь."
    },
    "formula": "$\\frac{a}{b}+\\frac{c}{d}=\\frac{ad+bc}{bd}$, $b,d\\ne0$",
    "problem": {
      "hy": "Հաշվել 1/3 + 1/6։",
      "en": "Compute 1/3 + 1/6.",
      "ru": "Вычислите 1/3 + 1/6."
    },
    "steps": {
      "hy": [
        "Ընդհանուր հայտարարը 6 է։",
        "1/3-ը վերածիր 2/6-ի։",
        "2/6 + 1/6 = 3/6 = 1/2։"
      ],
      "en": [
        "The common denominator is 6.",
        "Rewrite 1/3 as 2/6.",
        "2/6 + 1/6 = 3/6 = 1/2."
      ],
      "ru": [
        "Общий знаменатель — 6.",
        "Приведите 1/3 к 2/6.",
        "2/6 + 1/6 = 3/6 = 1/2."
      ]
    },
    "answer": "1/2",
    "mistake": {
      "hy": "Մի գումարիր հայտարարները. 1/3 + 1/6 ≠ 2/9։",
      "en": "Never add the denominators directly: 1/3 + 1/6 ≠ 2/9.",
      "ru": "Нельзя просто складывать знаменатели: 1/3 + 1/6 ≠ 2/9."
    }
  },
  {
    "id": "percent",
    "category": "arithmetic",
    "title": {
      "hy": "Տոկոսներ",
      "en": "Percentages",
      "ru": "Проценты"
    },
    "summary": {
      "hy": "p%-ը նշանակում է p/100։ Ավելացումից հետո թիվը բազմապատկիր 1+p/100-ով, նվազումից հետո՝ 1−p/100-ով։",
      "en": "p% means p/100. For a percent increase multiply by 1+p/100; for a decrease by 1−p/100.",
      "ru": "p% означает p/100. После увеличения умножайте на 1+p/100, после уменьшения — на 1−p/100."
    },
    "formula": "$p\\%=\\frac{p}{100}$",
    "problem": {
      "hy": "Գտնել 200-ի 15%-ը։",
      "en": "Find 15% of 200.",
      "ru": "Найдите 15% от 200."
    },
    "steps": {
      "hy": [
        "15% = 15/100 = 0.15։",
        "200 × 0.15 = 30։",
        "Ստուգում՝ 10%=20, 5%=10, միասին՝ 30։"
      ],
      "en": [
        "15% = 0.15.",
        "200 × 0.15 = 30.",
        "Check: 10% is 20 and 5% is 10."
      ],
      "ru": [
        "15% = 0,15.",
        "200 × 0,15 = 30.",
        "Проверка: 10% = 20 и 5% = 10."
      ]
    },
    "answer": "30",
    "mistake": {
      "hy": "15%-ը 15-ով բազմապատկել չէ, պետք է բաժանել 100-ի։",
      "en": "15% is not a multiplier of 15; divide by 100.",
      "ru": "15% — не множитель 15: разделите на 100."
    }
  },
  {
    "id": "ratio",
    "category": "arithmetic",
    "title": {
      "hy": "Համեմատություններ և համամասնություններ",
      "en": "Ratios and proportions",
      "ru": "Отношения и пропорции"
    },
    "summary": {
      "hy": "Համամասնության խաչաձև արտադրյալները հավասար են՝ պայմանով, որ հայտարարները զրո չեն։",
      "en": "In a proportion, cross-products are equal, provided the denominators are nonzero.",
      "ru": "В пропорции произведения крест-накрест равны, если знаменатели ненулевые."
    },
    "formula": "$\\frac{a}{b}=\\frac{c}{d}\\Rightarrow ad=bc$",
    "problem": {
      "hy": "Լուծել x/5 = 6/10։",
      "en": "Solve x/5 = 6/10.",
      "ru": "Решите x/5 = 6/10."
    },
    "steps": {
      "hy": [
        "Խաչաձև բազմապատկում՝ 10x = 5×6։",
        "10x = 30։",
        "x = 3։"
      ],
      "en": [
        "Cross-multiply: 10x = 5×6.",
        "10x = 30.",
        "x = 3."
      ],
      "ru": [
        "Крест-накрест: 10x = 5×6.",
        "10x = 30.",
        "x = 3."
      ]
    },
    "answer": "x = 3",
    "mistake": {
      "hy": "Համամասնության մեջ x-ը մի՛ շփոթիր 5-ի հետ. ստուգիր՝ 3/5=6/10։",
      "en": "Check by substitution: 3/5 = 6/10.",
      "ru": "Проверяйте подстановкой: 3/5 = 6/10."
    }
  },
  {
    "id": "divisibility",
    "category": "arithmetic",
    "title": {
      "hy": "Բաժանելիություն, ԱՄԲ և ԱՓԲ",
      "en": "Divisibility, GCD and LCM",
      "ru": "Делимость, НОД и НОК"
    },
    "summary": {
      "hy": "ԱՄԲ-ը երկու թվերի ամենամեծ ընդհանուր բաժանարարն է, ԱՓԲ-ը՝ ամենափոքր ընդհանուր բազմապատիկը։ Դրական ամբողջ թվերի համար՝ ԱՄԲ×ԱՓԲ=արտադրյալ։",
      "en": "The GCD is the greatest common divisor; the LCM is the least common multiple. For positive integers, GCD×LCM equals their product.",
      "ru": "НОД — наибольший общий делитель, НОК — наименьшее общее кратное. Для положительных целых НОД×НОК равно произведению."
    },
    "formula": "gcd(a,b)·lcm(a,b)=a·b (a,b>0)",
    "problem": {
      "hy": "Գտնել 12-ի և 18-ի ԱՄԲ-ն ու ԱՓԲ-ը։",
      "en": "Find GCD and LCM of 12 and 18.",
      "ru": "Найдите НОД и НОК чисел 12 и 18."
    },
    "steps": {
      "hy": [
        "12 = 2²×3, 18 = 2×3²։",
        "Ընդհանուր պարզ արտադրիչների նվազագույն աստիճանները՝ 2×3=6։",
        "ԱՓԲ = 12×18/6 = 36։"
      ],
      "en": [
        "12 = 2²×3, 18 = 2×3².",
        "GCD = 2×3 = 6.",
        "LCM = 12×18/6 = 36."
      ],
      "ru": [
        "12 = 2²×3, 18 = 2×3².",
        "НОД = 2×3 = 6.",
        "НОК = 12×18/6 = 36."
      ]
    },
    "answer": "GCD = 6; LCM = 36",
    "mistake": {
      "hy": "ԱՄԲ-ն ու ԱՓԲ-ը մի՛ փոխատեղիր. 6-ը բաժանում է երկուսն էլ, 36-ը բազմապատիկ է երկուսին էլ։",
      "en": "Do not swap GCD and LCM: 6 divides both, while 36 is a multiple of both.",
      "ru": "Не путайте НОД и НОК: 6 делит оба числа, 36 кратно обоим."
    }
  },
  {
    "id": "integer-signs",
    "category": "arithmetic",
    "title": {
      "hy": "Բացասական թվեր և մոդուլ",
      "en": "Signed numbers and absolute value",
      "ru": "Отрицательные числа и модуль"
    },
    "summary": {
      "hy": "Մոդուլը թվի հեռավորությունն է զրոյից և միշտ ոչ բացասական է։ Երկու բացասական թվերի արտադրյալը դրական է։",
      "en": "Absolute value is distance from zero and is always nonnegative. The product of two negatives is positive.",
      "ru": "Модуль — расстояние до нуля и неотрицателен. Произведение двух отрицательных чисел положительно."
    },
    "formula": "$|-a|=|a|$, $(-a)(-b)=ab$",
    "problem": {
      "hy": "Հաշվել |−7| + (−3)×(−2)։",
      "en": "Compute |−7| + (−3)×(−2).",
      "ru": "Вычислите |−7| + (−3)×(−2)."
    },
    "steps": {
      "hy": [
        "|−7| = 7։",
        "(−3)×(−2) = 6։",
        "7 + 6 = 13։"
      ],
      "en": [
        "|−7| = 7.",
        "(−3)×(−2) = 6.",
        "7 + 6 = 13."
      ],
      "ru": [
        "|−7| = 7.",
        "(−3)×(−2) = 6.",
        "7 + 6 = 13."
      ]
    },
    "answer": "13",
    "mistake": {
      "hy": "|−7| = −7 գրելը սխալ է. մոդուլը բացասական չի լինում։",
      "en": "|−7| is 7, not −7: an absolute value is not negative.",
      "ru": "|−7| равно 7, а не −7: модуль не бывает отрицательным."
    }
  },
  {
    "id": "powers",
    "category": "expressions",
    "title": {
      "hy": "Աստիճանների հատկությունները",
      "en": "Laws of exponents",
      "ru": "Свойства степеней"
    },
    "summary": {
      "hy": "Նույն հիմքերով աստիճանները բազմապատկելիս գումարիր ցուցիչները, բաժանելիս՝ հանիր։ Ոչ զրոյական հիմքի զրոյական աստիճանը 1 է։",
      "en": "For the same base, add exponents when multiplying and subtract when dividing. A nonzero base to the zero power is 1.",
      "ru": "При умножении степеней с одинаковым основанием показатели складывают, при делении — вычитают. Ненулевое число в нулевой степени равно 1."
    },
    "formula": "$a^m a^n=a^{m+n}$, $a^m/a^n=a^{m-n}$ ($a\\ne0$)",
    "problem": {
      "hy": "Պարզեցնել x³·x⁴/x² (x≠0)։",
      "en": "Simplify x³·x⁴/x² (x≠0).",
      "ru": "Упростите x³·x⁴/x² (x≠0)."
    },
    "steps": {
      "hy": [
        "Բազմապատկման ցուցիչները՝ 3+4=7։",
        "Բաժանելիս՝ 7−2=5։",
        "Ստանում ենք x⁵։"
      ],
      "en": [
        "Multiplying: 3+4=7.",
        "Dividing: 7−2=5.",
        "Result: x⁵."
      ],
      "ru": [
        "Умножение: 3+4=7.",
        "Деление: 7−2=5.",
        "Ответ: x⁵."
      ]
    },
    "answer": "x⁵",
    "mistake": {
      "hy": "x³·x⁴-ը x¹² չէ։ Ցուցիչները գումարվում են, ոչ թե բազմապատկվում։",
      "en": "x³·x⁴ is not x¹²: add exponents.",
      "ru": "x³·x⁴ не равно x¹²: показатели складываются."
    }
  },
  {
    "id": "roots",
    "category": "expressions",
    "title": {
      "hy": "Քառակուսի արմատներ",
      "en": "Square roots",
      "ru": "Квадратные корни"
    },
    "summary": {
      "hy": "√a-ը a≥0-ի ոչ բացասական քառակուսի արմատն է։ √(x²)=|x|, ոչ թե միշտ x։",
      "en": "For a≥0, √a denotes the nonnegative square root. Remember √(x²)=|x|, not always x.",
      "ru": "Для a≥0 √a — неотрицательный квадратный корень. Помните: √(x²)=|x|, а не всегда x."
    },
    "formula": "$\\sqrt{x^2}=|x|$",
    "problem": {
      "hy": "Պարզեցնել √50։",
      "en": "Simplify √50.",
      "ru": "Упростите √50."
    },
    "steps": {
      "hy": [
        "50 = 25×2։",
        "√50 = √25 × √2։",
        "Արդյունքը՝ 5√2։"
      ],
      "en": [
        "50 = 25×2.",
        "√50 = √25 × √2.",
        "Result: 5√2."
      ],
      "ru": [
        "50 = 25×2.",
        "√50 = √25 × √2.",
        "Результат: 5√2."
      ]
    },
    "answer": "5√2",
    "mistake": {
      "hy": "√(x²)=x միայն x≥0 դեպքում։ Բացասական x-ի համար պետք է |x|։",
      "en": "√(x²)=x only when x≥0; otherwise use |x|.",
      "ru": "√(x²)=x только при x≥0; всегда правильно |x|."
    }
  },
  {
    "id": "identities",
    "category": "expressions",
    "title": {
      "hy": "Կրճատ բազմապատկման բանաձևեր",
      "en": "Algebraic identities",
      "ru": "Формулы сокращённого умножения"
    },
    "summary": {
      "hy": "Քառակուսին բացելիս մի՛ մոռացիր 2ab միջին անդամը։ Քառակուսիների տարբերությունը վերլուծվում է (a−b)(a+b)։",
      "en": "When expanding a square, remember the middle term 2ab. Difference of squares factors as (a−b)(a+b).",
      "ru": "При раскрытии квадрата учитывайте средний член 2ab. Разность квадратов раскладывается на (a−b)(a+b)."
    },
    "formula": "$(a+b)^2=a^2+2ab+b^2$; $a^2-b^2=(a-b)(a+b)$",
    "problem": {
      "hy": "Բացել (x+3)²։",
      "en": "Expand (x+3)².",
      "ru": "Раскройте (x+3)²."
    },
    "steps": {
      "hy": [
        "Օգտագործիր (a+b)² բանաձևը։",
        "x² + 2·x·3 + 3²։",
        "Ստացվում է x²+6x+9։"
      ],
      "en": [
        "Use (a+b)².",
        "x² + 2·x·3 + 3².",
        "Result: x²+6x+9."
      ],
      "ru": [
        "Примените (a+b)².",
        "x² + 2·x·3 + 3².",
        "Ответ: x²+6x+9."
      ]
    },
    "answer": "x² + 6x + 9",
    "mistake": {
      "hy": "(x+3)² ≠ x²+9. Միջին 6x անդամը պարտադիր է։",
      "en": "(x+3)² is not x²+9: include 6x.",
      "ru": "(x+3)² не равно x²+9: нужен член 6x."
    }
  },
  {
    "id": "rational",
    "category": "expressions",
    "title": {
      "hy": "Ռացիոնալ արտահայտությունների պարզեցում",
      "en": "Rational expression simplification",
      "ru": "Упрощение рациональных выражений"
    },
    "summary": {
      "hy": "Կրճատվում են ամբողջական ընդհանուր արտադրիչները, ոչ թե գումարվող առանձին անդամները։ Սկզբնական հայտարարի արգելված արժեքները պահպանիր։",
      "en": "Cancel common factors, not terms within sums. Preserve the restrictions from the original denominator.",
      "ru": "Сокращать можно общие множители, а не слагаемые. Сохраняйте ограничения из исходного знаменателя."
    },
    "formula": "$\\frac{x^2-9}{x-3}=x+3,\\quad x\\ne3$",
    "problem": {
      "hy": "Պարզեցնել (x²−9)/(x−3)։",
      "en": "Simplify (x²−9)/(x−3).",
      "ru": "Упростите (x²−9)/(x−3)."
    },
    "steps": {
      "hy": [
        "Վերլուծիր x²−9=(x−3)(x+3)։",
        "Կրճատիր ընդհանուր (x−3) արտադրիչը։",
        "Պատասխան՝ x+3, միայն x≠3 դեպքում։"
      ],
      "en": [
        "Factor x²−9=(x−3)(x+3).",
        "Cancel the factor x−3.",
        "Answer x+3, with x≠3."
      ],
      "ru": [
        "Разложите x²−9=(x−3)(x+3).",
        "Сократите множитель x−3.",
        "Ответ x+3 при x≠3."
      ]
    },
    "answer": "x + 3 (x≠3)",
    "mistake": {
      "hy": "x=3-ը չի կարելի ներառել անգամ կրճատելուց հետո։",
      "en": "x=3 remains excluded even after simplification.",
      "ru": "x=3 остаётся запрещённым даже после сокращения."
    }
  },
  {
    "id": "logarithms",
    "category": "expressions",
    "title": {
      "hy": "Լոգարիթմներ և ցուցչային արտահայտություններ",
      "en": "Logarithms and exponentials",
      "ru": "Логарифмы и показательные выражения"
    },
    "summary": {
      "hy": "logₐ b-ն այն ցուցիչն է, որով a-ն պետք է աստիճան բարձրացնել՝ b ստանալու համար։ Անհրաժեշտ է a>0, a≠1, b>0։",
      "en": "logₐ b is the power to which a is raised to obtain b. Require a>0, a≠1, and b>0.",
      "ru": "logₐ b — показатель, в который нужно возвести a для получения b. Требуются a>0, a≠1, b>0."
    },
    "formula": "$\\log_a b=c\\iff a^c=b$",
    "problem": {
      "hy": "Հաշվել log₂ 32։",
      "en": "Evaluate log₂ 32.",
      "ru": "Вычислите log₂ 32."
    },
    "steps": {
      "hy": [
        "Փնտրիր ցուցիչ c, որի համար 2ᶜ=32։",
        "2⁵=32։",
        "Հետևաբար log₂ 32=5։"
      ],
      "en": [
        "Find c such that 2ᶜ=32.",
        "2⁵=32.",
        "Therefore log₂ 32=5."
      ],
      "ru": [
        "Найдите c из 2ᶜ=32.",
        "2⁵=32.",
        "Значит log₂ 32=5."
      ]
    },
    "answer": "5",
    "mistake": {
      "hy": "logₐ(b+c) ≠ logₐb + logₐc։ Գումարի լոգարիթմը չի բաժանվում։",
      "en": "logₐ(b+c) is not logₐb+logₐc; no sum law exists.",
      "ru": "logₐ(b+c) не равно logₐb+logₐc: такого свойства нет."
    }
  }
];
