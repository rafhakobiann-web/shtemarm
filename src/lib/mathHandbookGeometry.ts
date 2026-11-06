import type { MathTopic } from "./mathHandbookTypes";
/** Manually worked geometry, functions, coordinate and combinatorics examples. */
export const MATH_GEOMETRY: MathTopic[] = [
  {
    "id": "function-domain",
    "category": "functions",
    "title": {
      "hy": "Ֆունկցիայի որոշման տիրույթ",
      "en": "Domain of a function",
      "ru": "Область определения функции"
    },
    "summary": {
      "hy": "Որոշման տիրույթը x-ի այն արժեքների բազմությունն է, որոնց համար արտահայտությունն իմաստ ունի։ Հայտարարը ≠0, զույգ աստիճանի արմատի տակ՝ ≥0, լոգարիթմի արգումենտը՝ >0։",
      "en": "A function's domain contains inputs for which it is defined: denominators nonzero, even roots with nonnegative radicands, and logarithm arguments positive.",
      "ru": "Область определения включает допустимые x: знаменатель ≠0, подкоренное выражение чётного корня ≥0, аргумент логарифма >0."
    },
    "formula": "$y=\\frac{1}{x-2}\\Rightarrow x\\ne2$",
    "problem": {
      "hy": "Գտնել y=1/(x−2) ֆունկցիայի որոշման տիրույթը։",
      "en": "Find the domain of y=1/(x−2).",
      "ru": "Найдите область определения y=1/(x−2)."
    },
    "steps": {
      "hy": [
        "Հայտարարը չի կարող զրո լինել։",
        "x−2≠0, հետևաբար x≠2։",
        "Տիրույթը՝ բոլոր իրական թվերը, բացի 2-ից։"
      ],
      "en": [
        "Denominator must be nonzero.",
        "x−2≠0, so x≠2.",
        "Domain: all real x except 2."
      ],
      "ru": [
        "Знаменатель не равен нулю.",
        "x−2≠0, значит x≠2.",
        "Область: все действительные x, кроме 2."
      ]
    },
    "answer": "ℝ ∖ {2}",
    "mistake": {
      "hy": "Մի՛ որոշիր տիրույթը միայն գրաֆիկը տեսնելով․ ստուգիր բանաձևի բոլոր սահմանափակումները։",
      "en": "Check algebraic restrictions, not only a sketch.",
      "ru": "Проверяйте ограничения формулы, а не только график."
    }
  },
  {
    "id": "linear-function",
    "category": "functions",
    "title": {
      "hy": "Գծային ֆունկցիա և թեքություն",
      "en": "Linear functions and slope",
      "ru": "Линейная функция и наклон"
    },
    "summary": {
      "hy": "y=kx+b գրաֆիկը ուղիղ է։ k-ն ուղղության գործակիցն է, b-ն՝ y առանցքի հետ հատման կետը։",
      "en": "y=kx+b graphs as a line. k is slope and b is the y-intercept.",
      "ru": "График y=kx+b — прямая. k — угловой коэффициент, b — пересечение с осью y."
    },
    "formula": "$y=kx+b$, $k=\\frac{y_2-y_1}{x_2-x_1}$",
    "problem": {
      "hy": "Գտնել (1,3) և (3,7) կետերով անցնող ուղղի k-ն։",
      "en": "Find the slope through (1,3) and (3,7).",
      "ru": "Найдите наклон прямой через (1,3) и (3,7)."
    },
    "steps": {
      "hy": [
        "k=(7−3)/(3−1)։",
        "k=4/2=2։",
        "Ուղիղը աճող է՝ k>0։"
      ],
      "en": [
        "k=(7−3)/(3−1).",
        "k=4/2=2.",
        "Positive slope means increasing."
      ],
      "ru": [
        "k=(7−3)/(3−1).",
        "k=4/2=2.",
        "Наклон положительный — функция возрастает."
      ]
    },
    "answer": "k=2",
    "mistake": {
      "hy": "x կոորդինատների տարբերությունն ու y-երի տարբերությունը մի՛ փոխատեղիր։",
      "en": "Slope is Δy/Δx, not Δx/Δy.",
      "ru": "Наклон равен Δy/Δx, а не наоборот."
    }
  },
  {
    "id": "quadratic-function",
    "category": "functions",
    "title": {
      "hy": "Քառակուսային ֆունկցիայի գրաֆիկ",
      "en": "Quadratic functions and vertices",
      "ru": "Квадратичная функция и вершина"
    },
    "summary": {
      "hy": "y=ax²+bx+c գրաֆիկը պարաբոլ է։ Գագաթի x կոորդինատը −b/(2a) է, իսկ y-ն ստացվում է տեղադրմամբ։",
      "en": "The graph of y=ax²+bx+c is a parabola. Its vertex has x=−b/(2a); substitute for y.",
      "ru": "График y=ax²+bx+c — парабола. Абсцисса вершины −b/(2a), ордината — подстановкой."
    },
    "formula": "$x_{\\mathrm{vertex}}=-\\frac{b}{2a}$",
    "problem": {
      "hy": "Գտնել y=x²−4x+1-ի գագաթը։",
      "en": "Find the vertex of y=x²−4x+1.",
      "ru": "Найдите вершину y=x²−4x+1."
    },
    "steps": {
      "hy": [
        "x=−(−4)/(2·1)=2։",
        "y(2)=4−8+1=−3։",
        "Գագաթը՝ (2,−3)։"
      ],
      "en": [
        "x=4/2=2.",
        "y(2)=4−8+1=−3.",
        "Vertex: (2,−3)."
      ],
      "ru": [
        "x=4/2=2.",
        "y(2)=4−8+1=−3.",
        "Вершина: (2,−3)."
      ]
    },
    "answer": "(2, −3)",
    "mistake": {
      "hy": "Գագաթի x-ը և y-ը շփոթելով գրաֆիկի նվազագույն արժեքը սխալ կստացվի։",
      "en": "Do not confuse the vertex's x-coordinate with its y-value.",
      "ru": "Не путайте координату x вершины со значением y."
    }
  },
  {
    "id": "graph-transform",
    "category": "functions",
    "title": {
      "hy": "Գրաֆիկի տեղաշարժեր",
      "en": "Graph transformations",
      "ru": "Преобразования графиков"
    },
    "summary": {
      "hy": "f(x−a) արտահայտությունը գրաֆիկը տեղափոխում է աջ a միավորով, f(x)+b՝ վեր b միավորով։",
      "en": "f(x−a) shifts the graph a units right; f(x)+b shifts it b units up.",
      "ru": "f(x−a) сдвигает график вправо на a, f(x)+b — вверх на b."
    },
    "formula": "$g(x)=f(x-3)+2$",
    "problem": {
      "hy": "y=(x−3)²+2-ի գագաթը ո՞րն է։",
      "en": "What is the vertex of y=(x−3)²+2?",
      "ru": "Где вершина y=(x−3)²+2?"
    },
    "steps": {
      "hy": [
        "Հիմքը y=x² է՝ (0,0) գագաթով։",
        "x−3-ը գրաֆիկը աջ է տեղափոխում 3-ով։",
        "+2-ը բարձրացնում է 2-ով՝ գագաթ (3,2)։"
      ],
      "en": [
        "Base y=x² has vertex (0,0).",
        "x−3 shifts right by 3.",
        "The +2 shifts up by 2: (3,2)."
      ],
      "ru": [
        "База y=x² имеет вершину (0,0).",
        "x−3 сдвигает вправо на 3.",
        "+2 сдвигает вверх на 2: (3,2)."
      ]
    },
    "answer": "(3,2)",
    "mistake": {
      "hy": "Փակագծում x−3-ը աջ տեղափոխում է, ոչ թե ձախ։",
      "en": "x−3 inside the function shifts right, not left.",
      "ru": "x−3 внутри функции сдвигает вправо, не влево."
    }
  },
  {
    "id": "trig-basic",
    "category": "functions",
    "title": {
      "hy": "Եռանկյունաչափական հարաբերություններ",
      "en": "Basic trigonometry",
      "ru": "Основы тригонометрии"
    },
    "summary": {
      "hy": "Ուղղանկյուն եռանկյան սուր անկյան համար sin-ը դիմացի էջի հարաբերությունն է ներքնաձիգին, cos-ը՝ կից էջի։",
      "en": "In a right triangle, sin of an acute angle equals opposite/hypotenuse; cos equals adjacent/hypotenuse.",
      "ru": "В прямоугольном треугольнике sin острого угла — противолежащий катет/гипотенуза, cos — прилежащий/гипотенуза."
    },
    "formula": "$\\sin\\alpha=\\frac{\\mathrm{opp}}{\\mathrm{hyp}},\\quad \\cos\\alpha=\\frac{\\mathrm{adj}}{\\mathrm{hyp}}$",
    "problem": {
      "hy": "Ուղղանկյուն եռանկյան սուր անկյան դիմացի էջը 3 է, ներքնաձիգը՝ 5։ Գտնել sin α։",
      "en": "In a right triangle, opposite side is 3 and hypotenuse 5. Find sin α.",
      "ru": "В прямоугольном треугольнике противолежащий катет 3, гипотенуза 5. Найдите sin α."
    },
    "steps": {
      "hy": [
        "Սինուսը դիմացի էջի հարաբերությունն է ներքնաձիգին։",
        "sin α = 3/5։",
        "sin α = 0.6։"
      ],
      "en": [
        "Sine = opposite / hypotenuse.",
        "sin α = 3/5.",
        "sin α = 0.6."
      ],
      "ru": [
        "sin = противолежащий / гипотенуза.",
        "sin α = 3/5.",
        "sin α = 0,6."
      ]
    },
    "answer": "sin α = 3/5",
    "mistake": {
      "hy": "Սինուսն ու կոսինուսը մի՛ խառնիր՝ որ էջն է անկյանը դիմացի կամ կից։",
      "en": "Do not confuse the opposite side with the adjacent side.",
      "ru": "Не путайте противолежащий и прилежащий катеты."
    }
  },
  {
    "id": "trig-identities",
    "category": "functions",
    "title": {
      "hy": "Եռանկյունաչափական հիմնական նույնություն",
      "en": "Pythagorean trig identity",
      "ru": "Основное тригонометрическое тождество"
    },
    "summary": {
      "hy": "Ցանկացած իրական α-ի համար sin²α+cos²α=1։ Այն օգնում է գտնել երկրորդ հարաբերությունը՝ հաշվի առնելով անկյան քառորդն ու նշանը։",
      "en": "For any real α, sin²α+cos²α=1. Determine the sign of the missing ratio using the quadrant.",
      "ru": "Для любого α: sin²α+cos²α=1. Знак неизвестного отношения определяют по четверти."
    },
    "formula": "$\\sin^2\\alpha+\\cos^2\\alpha=1$",
    "problem": {
      "hy": "Եթե α սուր է և sin α=3/5, գտնել cos α։",
      "en": "If α is acute and sin α=3/5, find cos α.",
      "ru": "Если α острый и sin α=3/5, найдите cos α."
    },
    "steps": {
      "hy": [
        "cos²α=1−9/25=16/25։",
        "cos α=±4/5։",
        "Սուր անկյան կոսինուսը դրական է՝ 4/5։"
      ],
      "en": [
        "cos²α=1−9/25=16/25.",
        "cos α=±4/5.",
        "For an acute angle cos α>0: 4/5."
      ],
      "ru": [
        "cos²α=1−9/25=16/25.",
        "cos α=±4/5.",
        "Для острого угла cos α>0: 4/5."
      ]
    },
    "answer": "cos α=4/5",
    "mistake": {
      "hy": "Քառակուսի արմատ հանելիս նշանը կախված է անկյան տիրույթից։",
      "en": "Choose the sign using the quadrant, not automatically positive.",
      "ru": "Знак корня зависит от четверти угла."
    }
  },
  {
    "id": "geometry-pythagoras",
    "category": "plane-geometry",
    "title": {
      "hy": "Պյութագորասի թեորեմ",
      "en": "Pythagorean theorem",
      "ru": "Теорема Пифагора"
    },
    "summary": {
      "hy": "Ուղղանկյուն եռանկյան էջերի քառակուսիների գումարը ներքնաձիգի քառակուսին է։ Թեորեմը չի կիրառվում կամայական եռանկյան համար առանց լրացուցիչ պայմանի։",
      "en": "In a right triangle, the squares of the legs sum to the square of the hypotenuse. It does not apply directly to arbitrary triangles.",
      "ru": "В прямоугольном треугольнике сумма квадратов катетов равна квадрату гипотенузы. Для произвольного треугольника формула неприменима."
    },
    "formula": "$a^2+b^2=c^2$ (c = hypotenuse)",
    "problem": {
      "hy": "Երկու էջերն են 6 և 8։ Գտնել ներքնաձիգը։",
      "en": "Legs are 6 and 8. Find the hypotenuse.",
      "ru": "Катеты равны 6 и 8. Найдите гипотенузу."
    },
    "steps": {
      "hy": [
        "c²=6²+8²=36+64։",
        "c²=100։",
        "c=10 (երկարությունը դրական է)։"
      ],
      "en": [
        "c²=36+64=100.",
        "Take the positive square root.",
        "c=10."
      ],
      "ru": [
        "c²=36+64=100.",
        "Возьмите положительный корень.",
        "c=10."
      ]
    },
    "answer": "10",
    "mistake": {
      "hy": "Ներքնաձիգը ամենաերկար կողմն է․ մի՛ վերցրու բացասական երկարություն։",
      "en": "The hypotenuse is the longest side and has positive length.",
      "ru": "Гипотенуза — наибольшая сторона, длина положительна."
    }
  },
  {
    "id": "geometry-area",
    "category": "plane-geometry",
    "title": {
      "hy": "Եռանկյան մակերես և Հերոնի բանաձև",
      "en": "Triangle area and Heron's formula",
      "ru": "Площадь треугольника и формула Герона"
    },
    "summary": {
      "hy": "Եռանկյան մակերեսը՝ հիմք×համապատասխան բարձրություն/2։ Երեք կողմերով կարելի է կիրառել Հերոնի բանաձևը՝ նախ ստուգելով եռանկյան գոյությունը։",
      "en": "Area is base×corresponding height/2. With three sides, use Heron's formula after checking triangle inequalities.",
      "ru": "Площадь — основание×соответствующая высота/2. По трём сторонам используйте формулу Герона, сначала проверив неравенства треугольника."
    },
    "formula": "$S=\\frac{ah}{2}$; $p=\\frac{a+b+c}{2}$; $S=\\sqrt{p(p-a)(p-b)(p-c)}$",
    "problem": {
      "hy": "Հիմքը 10 է, բարձրությունը՝ 6։ Գտնել մակերեսը։",
      "en": "Base 10, corresponding height 6. Find area.",
      "ru": "Основание 10, соответствующая высота 6. Найдите площадь."
    },
    "steps": {
      "hy": [
        "S=ah/2։",
        "S=10×6/2։",
        "S=30։"
      ],
      "en": [
        "Use S=ah/2.",
        "S=10×6/2.",
        "S=30."
      ],
      "ru": [
        "S=ah/2.",
        "S=10×6/2.",
        "S=30."
      ]
    },
    "answer": "30",
    "mistake": {
      "hy": "Բարձրությունը պետք է ուղղահայաց լինի ընտրված հիմքին։",
      "en": "Height must be perpendicular to the chosen base.",
      "ru": "Высота должна быть перпендикулярна основанию."
    }
  },
  {
    "id": "geometry-similarity",
    "category": "plane-geometry",
    "title": {
      "hy": "Նման եռանկյուններ",
      "en": "Similar triangles",
      "ru": "Подобные треугольники"
    },
    "summary": {
      "hy": "Նման եռանկյունների համապատասխան անկյունները հավասար են, կողմերը՝ համեմատական։ Մակերեսների հարաբերությունը նմանության գործակցի քառակուսին է։",
      "en": "Corresponding angles are equal and sides proportional. Their areas are in the square of the similarity ratio.",
      "ru": "У подобных треугольников соответствующие углы равны, стороны пропорциональны. Площади относятся как квадраты коэффициента подобия."
    },
    "formula": "$\\frac{S_1}{S_2}=k^2$",
    "problem": {
      "hy": "Նմանության գործակիցը 2 է։ Մակերեսների հարաբերությունը ո՞րն է։",
      "en": "Similarity scale factor is 2. What is the area ratio?",
      "ru": "Коэффициент подобия 2. Каково отношение площадей?"
    },
    "steps": {
      "hy": [
        "Մակերեսները փոխվում են գծային չափի քառակուսով։",
        "k²=2²=4։",
        "Մակերեսների հարաբերությունը 4:1 է։"
      ],
      "en": [
        "Areas scale as the square of the side ratio.",
        "k²=2²=4.",
        "Area ratio = 4:1."
      ],
      "ru": [
        "Площади относятся как квадрат коэффициента.",
        "k²=2²=4.",
        "Отношение площадей 4:1."
      ]
    },
    "answer": "4:1",
    "mistake": {
      "hy": "Եթե կողմերը 2 անգամ մեծ են, մակերեսը 2 չէ, այլ 4 անգամ է մեծ։",
      "en": "Doubling side lengths quadruples the area.",
      "ru": "При удвоении сторон площадь увеличивается в 4 раза, не в 2."
    }
  },
  {
    "id": "geometry-circles",
    "category": "plane-geometry",
    "title": {
      "hy": "Շրջանագիծ, շրջան և աղեղ",
      "en": "Circles, disks and arcs",
      "ru": "Окружность, круг и дуги"
    },
    "summary": {
      "hy": "Շրջանագծի երկարությունը 2πr է, շրջանի մակերեսը πr²։ Կենտրոնական անկյանը համապատասխան աղեղի երկարությունը համեմատական է անկյանը։",
      "en": "Circumference is 2πr, area is πr². Arc length scales with its central angle.",
      "ru": "Длина окружности 2πr, площадь круга πr². Длина дуги пропорциональна центральному углу."
    },
    "formula": "$C=2\\pi r,\\quad S=\\pi r^2,\\quad l=\\frac{\\theta}{360^\\circ}2\\pi r$",
    "problem": {
      "hy": "Գտնել r=3 շրջանագծի երկարությունն ու շրջանի մակերեսը։",
      "en": "For r=3, find circumference and disk area.",
      "ru": "Для r=3 найдите длину окружности и площадь круга."
    },
    "steps": {
      "hy": [
        "C=2π×3=6π։",
        "S=π×3²=9π։",
        "Չշփոթես չափման միավորները՝ երկարություն և մակերես։"
      ],
      "en": [
        "C=2π×3=6π.",
        "S=π×3²=9π.",
        "Circumference and area have different units."
      ],
      "ru": [
        "C=2π×3=6π.",
        "S=π×3²=9π.",
        "Единицы длины и площади различаются."
      ]
    },
    "answer": "C=6π; S=9π",
    "mistake": {
      "hy": "Շրջանի մակերեսը πr² է, ոչ թե 2πr։",
      "en": "Area πr² is not circumference 2πr.",
      "ru": "Площадь πr² — не длина окружности 2πr."
    }
  },
  {
    "id": "geometry-polygons",
    "category": "plane-geometry",
    "title": {
      "hy": "Բազմանկյունների անկյուններ",
      "en": "Polygon angle sums",
      "ru": "Суммы углов многоугольника"
    },
    "summary": {
      "hy": "Ուռուցիկ n-անկյան ներքին անկյունների գումարը (n−2)·180° է։ Կանոնավոր n-անկյան յուրաքանչյուր ներքին անկյուն ստացվում է բաժանելով n-ի։",
      "en": "The interior-angle sum of a convex n-gon is (n−2)×180°. Divide by n for each interior angle of a regular n-gon.",
      "ru": "Сумма внутренних углов выпуклого n-угольника равна (n−2)×180°. Для правильного многоугольника делите на n."
    },
    "formula": "$\\Sigma\\mathrm{angles}=(n-2)\\cdot180^\\circ$",
    "problem": {
      "hy": "Գտնել կանոնավոր վեցանկյան մեկ ներքին անկյունը։",
      "en": "Find each interior angle of a regular hexagon.",
      "ru": "Найдите внутренний угол правильного шестиугольника."
    },
    "steps": {
      "hy": [
        "Գումարը (6−2)×180°=720°։",
        "Կանոնավորության պատճառով անկյունները հավասար են։",
        "720°/6=120°։"
      ],
      "en": [
        "Sum = (6−2)×180° = 720°.",
        "All six angles are equal.",
        "Each is 720°/6=120°."
      ],
      "ru": [
        "Сумма = (6−2)×180°=720°.",
        "Шесть углов равны.",
        "Каждый равен 120°."
      ]
    },
    "answer": "120°",
    "mistake": {
      "hy": "180°-ը եռանկյան գումարն է, ոչ բոլոր բազմանկյուններինը։",
      "en": "180° is only the triangle's angle sum.",
      "ru": "180° — сумма углов треугольника, не любого многоугольника."
    }
  },
  {
    "id": "stereometry-prism",
    "category": "solid-geometry",
    "title": {
      "hy": "Ուղիղ պրիզմա և գլան",
      "en": "Prisms and cylinders",
      "ru": "Призмы и цилиндры"
    },
    "summary": {
      "hy": "Պրիզմայի կամ գլանի ծավալը հիմքի մակերեսի և բարձրության արտադրյալն է։ Գլանի հիմքը շրջան է՝ πr²։",
      "en": "The volume of a prism or cylinder is base area times perpendicular height. A cylinder has a circular base πr².",
      "ru": "Объём призмы или цилиндра — площадь основания на высоту. У цилиндра основание πr²."
    },
    "formula": "$V=S_{\\mathrm{base}}h,\\quad V_{\\mathrm{cyl}}=\\pi r^2h$",
    "problem": {
      "hy": "Գտնել r=2, h=5 գլանի ծավալը։",
      "en": "Find volume of a cylinder with r=2, h=5.",
      "ru": "Найдите объём цилиндра с r=2, h=5."
    },
    "steps": {
      "hy": [
        "Հիմքի մակերես՝ π×2²=4π։",
        "V=4π×5։",
        "V=20π։"
      ],
      "en": [
        "Base area = π×2²=4π.",
        "Multiply by height 5.",
        "V=20π."
      ],
      "ru": [
        "Основание = π×2²=4π.",
        "Умножьте на высоту 5.",
        "V=20π."
      ]
    },
    "answer": "20π",
    "mistake": {
      "hy": "Բարձրությունը պետք է ուղղահայաց լինի հիմքին, ոչ թե կողային թեք եզրը։",
      "en": "Use perpendicular height, not slant height.",
      "ru": "Нужна перпендикулярная высота, не наклонная образующая."
    }
  },
  {
    "id": "stereometry-pyramid",
    "category": "solid-geometry",
    "title": {
      "hy": "Բուրգ և կոն",
      "en": "Pyramids and cones",
      "ru": "Пирамиды и конусы"
    },
    "summary": {
      "hy": "Բուրգի կամ կոնի ծավալը հիմք×բարձրություն/3 է։ Կոնի հիմքի մակերեսը πr² է։",
      "en": "Pyramid or cone volume is one-third of base area times perpendicular height. Cone base area is πr².",
      "ru": "Объём пирамиды или конуса равен одной трети площади основания на высоту. Основание конуса — πr²."
    },
    "formula": "$V=\\frac{1}{3}S_{\\mathrm{base}}h$",
    "problem": {
      "hy": "Գտնել r=3, h=4 կոնի ծավալը։",
      "en": "Find cone volume for r=3, h=4.",
      "ru": "Найдите объём конуса с r=3, h=4."
    },
    "steps": {
      "hy": [
        "Հիմքի մակերես՝ π·3²=9π։",
        "V=(1/3)·9π·4։",
        "V=12π։"
      ],
      "en": [
        "Base area = 9π.",
        "V=(1/3)·9π·4.",
        "V=12π."
      ],
      "ru": [
        "Площадь основания 9π.",
        "V=(1/3)·9π·4.",
        "V=12π."
      ]
    },
    "answer": "12π",
    "mistake": {
      "hy": "Կոնի/բուրգի ծավալի 1/3 գործակիցը մի՛ մոռացիր։",
      "en": "Do not omit the 1/3 factor.",
      "ru": "Не забывайте множитель 1/3."
    }
  },
  {
    "id": "stereometry-sphere",
    "category": "solid-geometry",
    "title": {
      "hy": "Գունդ և գնդային մակերևույթ",
      "en": "Sphere and ball",
      "ru": "Шар и сфера"
    },
    "summary": {
      "hy": "Գնդի ծավալը 4πr³/3 է, գնդային մակերևույթի մակերեսը՝ 4πr²։",
      "en": "The volume of a ball is 4πr³/3; the sphere's surface area is 4πr².",
      "ru": "Объём шара 4πr³/3, площадь поверхности сферы 4πr²."
    },
    "formula": "$V=\\frac43\\pi r^3,\\quad S=4\\pi r^2$",
    "problem": {
      "hy": "Գտնել r=3 գնդի ծավալը։",
      "en": "Find the volume of a ball of radius 3.",
      "ru": "Найдите объём шара радиуса 3."
    },
    "steps": {
      "hy": [
        "r³=27։",
        "V=(4/3)π·27։",
        "V=36π։"
      ],
      "en": [
        "r³=27.",
        "V=(4/3)π×27.",
        "V=36π."
      ],
      "ru": [
        "r³=27.",
        "V=(4/3)π×27.",
        "V=36π."
      ]
    },
    "answer": "36π",
    "mistake": {
      "hy": "Ծավալի բանաձևում r³ է, մակերեսինը՝ r²։",
      "en": "Volume uses r³, area uses r².",
      "ru": "В объёме r³, а в площади r²."
    }
  },
  {
    "id": "coordinate-distance",
    "category": "coordinates",
    "title": {
      "hy": "Կոորդինատներ․ հեռավորություն և միջնակետ",
      "en": "Coordinate distance and midpoint",
      "ru": "Расстояние и середина отрезка"
    },
    "summary": {
      "hy": "Երկու կետերի հեռավորությունը գտնելու համար կիրառիր Պյութագորասի թեորեմը կոորդինատների տարբերությունների վրա։ Միջնակետի կոորդինատները միջին թվաբանականներն են։",
      "en": "Distance between points follows Pythagoras on coordinate differences; the midpoint averages each coordinate.",
      "ru": "Расстояние между точками находят по разностям координат с теоремой Пифагора; середина — средние координаты."
    },
    "formula": "$d=\\sqrt{(x_2-x_1)^2+(y_2-y_1)^2}$",
    "problem": {
      "hy": "Գտնել A(1,2), B(4,6) կետերի հեռավորությունը։",
      "en": "Find distance between A(1,2), B(4,6).",
      "ru": "Найдите расстояние между A(1,2) и B(4,6)."
    },
    "steps": {
      "hy": [
        "Δx=4−1=3, Δy=6−2=4։",
        "d=√(3²+4²)։",
        "d=5։"
      ],
      "en": [
        "Δx=3, Δy=4.",
        "d=√(9+16).",
        "d=5."
      ],
      "ru": [
        "Δx=3, Δy=4.",
        "d=√(9+16).",
        "d=5."
      ]
    },
    "answer": "5",
    "mistake": {
      "hy": "Հեռավորությունը բացասական չի կարող լինել։",
      "en": "Distance cannot be negative.",
      "ru": "Расстояние не бывает отрицательным."
    }
  },
  {
    "id": "vectors",
    "category": "coordinates",
    "title": {
      "hy": "Վեկտորների գործողություններ",
      "en": "Vector addition and scaling",
      "ru": "Действия с векторами"
    },
    "summary": {
      "hy": "Վեկտորները գումարվում են համապատասխան կոորդինատներով։ k·v-ն բազմապատկում է յուրաքանչյուր կոորդինատը k-ով։",
      "en": "Add vectors componentwise; multiply each component by the scalar k.",
      "ru": "Векторы складывают покоординатно; умножение на k меняет каждую координату."
    },
    "formula": "$(a,b)+(c,d)=(a+c,b+d)$",
    "problem": {
      "hy": "Տրված են a=(2,−1), b=(3,4)։ Գտնել a+b։",
      "en": "Given a=(2,−1), b=(3,4), find a+b.",
      "ru": "Дано a=(2,−1), b=(3,4). Найдите a+b."
    },
    "steps": {
      "hy": [
        "Առաջին կոորդինատ՝ 2+3=5։",
        "Երկրորդ՝ −1+4=3։",
        "a+b=(5,3)։"
      ],
      "en": [
        "First coordinate: 2+3=5.",
        "Second: −1+4=3.",
        "a+b=(5,3)."
      ],
      "ru": [
        "Первая координата: 2+3=5.",
        "Вторая: −1+4=3.",
        "a+b=(5,3)."
      ]
    },
    "answer": "(5,3)",
    "mistake": {
      "hy": "Վեկտորի երկարությունն ու կոորդինատները տարբեր մեծություններ են։",
      "en": "Do not confuse vector components with vector length.",
      "ru": "Не путайте координаты вектора с его длиной."
    }
  },
  {
    "id": "dot-product",
    "category": "coordinates",
    "title": {
      "hy": "Վեկտորների սկալյար արտադրյալ",
      "en": "Dot product of vectors",
      "ru": "Скалярное произведение"
    },
    "summary": {
      "hy": "Սկալյար արտադրյալը կոորդինատային տեսքով համապատասխան բաղադրիչների արտադրյալների գումարն է։ Զրո ոչ-զրոյական վեկտորների դեպքում նշանակում է ուղղահայացություն։",
      "en": "The dot product is the sum of pairwise component products. A zero dot product between nonzero vectors means perpendicularity.",
      "ru": "Скалярное произведение — сумма произведений соответствующих координат. Нуль для ненулевых векторов означает перпендикулярность."
    },
    "formula": "$\\vec a\\cdot\\vec b=a_xb_x+a_yb_y$",
    "problem": {
      "hy": "Տրված են a=(1,2), b=(2,−1)։ Գտնել սկալյար արտադրյալը։",
      "en": "Find the dot product of a=(1,2), b=(2,−1).",
      "ru": "Найдите скалярное произведение a=(1,2), b=(2,−1)."
    },
    "steps": {
      "hy": [
        "a·b=1×2+2×(−1)։",
        "a·b=2−2=0։",
        "Ոչ-զրոյական վեկտորները ուղղահայաց են։"
      ],
      "en": [
        "a·b=1×2+2×(−1).",
        "a·b=2−2=0.",
        "The two nonzero vectors are perpendicular."
      ],
      "ru": [
        "a·b=1×2+2×(−1).",
        "a·b=2−2=0.",
        "Векторы ненулевые и перпендикулярны."
      ]
    },
    "answer": "0",
    "mistake": {
      "hy": "Սկալյար արտադրյալի արդյունքը թիվ է, ոչ վեկտոր։",
      "en": "A dot product yields a scalar, not a vector.",
      "ru": "Скалярное произведение — число, а не вектор."
    }
  },
  {
    "id": "counting",
    "category": "combinatorics",
    "title": {
      "hy": "Հաշվարկման սկզբունքներ և ֆակտորիալ",
      "en": "Counting principle and factorial",
      "ru": "Правило умножения и факториал"
    },
    "summary": {
      "hy": "Եթե ընտրությունները կատարվում են հաջորդաբար՝ m և n տարբերակով, ապա ընդհանուր արդյունքների թիվը m·n է։ n!-ը 1-ից n արտադրյալն է։",
      "en": "Sequential independent choices with m and n possibilities give m×n outcomes. n! is the product 1 through n.",
      "ru": "При последовательных независимых выборах m и n вариантов всего m×n исходов. n! — произведение чисел от 1 до n."
    },
    "formula": "$n!=1\\cdot2\\cdots n$, $0!=1$",
    "problem": {
      "hy": "Քանի՞ կերպ կարելի է դասավորել 4 տարբեր գիրք։",
      "en": "How many orders of 4 distinct books?",
      "ru": "Сколькими способами можно расставить 4 разные книги?"
    },
    "steps": {
      "hy": [
        "Առաջին տեղում՝ 4 տարբերակ։",
        "Հետո՝ 3, 2 և 1։",
        "4!=4×3×2×1=24։"
      ],
      "en": [
        "4 choices for the first position.",
        "Then 3, 2 and 1 choices.",
        "4!=24."
      ],
      "ru": [
        "На первое место 4 варианта.",
        "Далее 3, 2 и 1.",
        "4!=24."
      ]
    },
    "answer": "24",
    "mistake": {
      "hy": "Եթե առարկաները նույնական են, n! հաշվելը կարող է գերագնահատել տարբերակները։",
      "en": "Factorial counts arrangements of distinct items; repeated items need adjustment.",
      "ru": "n! считает перестановки разных объектов; при повторениях нужна поправка."
    }
  },
  {
    "id": "combinations",
    "category": "combinatorics",
    "title": {
      "hy": "Զուգորդություններ և տեղադրություններ",
      "en": "Combinations and arrangements",
      "ru": "Сочетания и размещения"
    },
    "summary": {
      "hy": "n տարբեր առարկայից k ընտրելու դեպքում՝ եթե հերթականությունը կարևոր չէ, օգտագործիր զուգորդություններ C(n,k), եթե կարևոր է՝ տեղադրություններ A(n,k)։",
      "en": "Choose k from n distinct objects: use C(n,k) if order does not matter, A(n,k) if order matters.",
      "ru": "При выборе k из n различных объектов используйте C(n,k), если порядок не важен, и A(n,k), если важен."
    },
    "formula": "$C_n^k=\\frac{n!}{k!(n-k)!}$",
    "problem": {
      "hy": "5 աշակերտից ընտրել 2 հոգանոց խումբ․ քանի՞ ձև։",
      "en": "Choose a 2-person team from 5 students.",
      "ru": "Выберите команду из 2 человек из 5 учащихся."
    },
    "steps": {
      "hy": [
        "Հերթականությունը կարևոր չէ։",
        "C(5,2)=5!/(2!3!)։",
        "C(5,2)=10։"
      ],
      "en": [
        "Order does not matter.",
        "C(5,2)=5!/(2!3!).",
        "Result: 10."
      ],
      "ru": [
        "Порядок не важен.",
        "C(5,2)=5!/(2!3!).",
        "Результат: 10."
      ]
    },
    "answer": "10",
    "mistake": {
      "hy": "Խումբ ընտրելիս AB-ն և BA-ն նույնն են․ մի՛ հաշվի երկու անգամ։",
      "en": "AB and BA form the same team; do not double-count.",
      "ru": "AB и BA — одна и та же группа; не считайте дважды."
    }
  },
  {
    "id": "probability",
    "category": "combinatorics",
    "title": {
      "hy": "Հավանականության հիմունքներ",
      "en": "Basic probability",
      "ru": "Основы вероятности"
    },
    "summary": {
      "hy": "Հավասարահավանական ելքերի դեպքում իրադարձության հավանականությունը բարենպաստ ելքերի թվի հարաբերությունն է բոլոր ելքերի թվին։",
      "en": "With equally likely outcomes, probability equals favorable outcomes divided by all possible outcomes.",
      "ru": "При равновозможных исходах вероятность равна числу благоприятных исходов, делённому на общее число."
    },
    "formula": "$P(A)=\\frac{m}{n}$ (equally likely)",
    "problem": {
      "hy": "Արդար զառով զույգ թիվ ստանալու հավանականությունը։",
      "en": "Probability of an even number on a fair die.",
      "ru": "Вероятность чётного числа на честном кубике."
    },
    "steps": {
      "hy": [
        "Ընդամենը 6 հավասարահավանական ելք։",
        "Զույգ են 2,4,6՝ 3 ելք։",
        "P=3/6=1/2։"
      ],
      "en": [
        "Six equally likely outcomes.",
        "Even outcomes: 2,4,6 (three).",
        "P=3/6=1/2."
      ],
      "ru": [
        "Всего 6 равновозможных исходов.",
        "Чётные: 2,4,6 — три.",
        "P=3/6=1/2."
      ]
    },
    "answer": "1/2",
    "mistake": {
      "hy": "P=m/n բանաձևը մի՛ կիրառիր անհավասարահավանական ելքերի համար առանց կշռելու։",
      "en": "This ratio assumes equal likelihood; do not use it blindly for biased outcomes.",
      "ru": "Формула требует равновозможности исходов."
    }
  },
  {
    "id": "true-false-check",
    "category": "equations",
    "title": {
      "hy": "Ճիշտ/սխալ պնդումների ստուգում",
      "en": "Testing true/false mathematical claims",
      "ru": "Проверка утверждений «верно/неверно»"
    },
    "summary": {
      "hy": "Համընդհանուր պնդումը հերքելու համար բավական է մեկ ճիշտ հակաօրինակ։ Ապացուցելու համար մեկ օրինակն ընդհանրապես բավարար չէ։",
      "en": "One valid counterexample disproves a universal claim; one positive example does not prove it universally.",
      "ru": "Один контрпример опровергает утверждение «для всех»; один подтверждающий пример не доказывает его."
    },
    "formula": "$\\neg\\bigl(\\forall x\\,P(x)\\bigr)\\iff\\exists x\\,\\neg P(x)$",
    "problem": {
      "hy": "Պնդում՝ «ցանկացած իրական x-ի համար x²>x»։ Ճի՞շտ է։",
      "en": "Claim: 'x²>x for every real x'. True?",
      "ru": "Утверждение: «x²>x для любого действительного x». Верно ли?"
    },
    "steps": {
      "hy": [
        "Ընտրիր x=1/2 հակաօրինակ։",
        "x²=1/4, իսկ 1/4>1/2-ը սխալ է։",
        "Ուստի պնդումը սխալ է։"
      ],
      "en": [
        "Try x=1/2.",
        "x²=1/4 is not greater than 1/2.",
        "The universal claim is false."
      ],
      "ru": [
        "Возьмите x=1/2.",
        "x²=1/4 не больше 1/2.",
        "Утверждение для всех неверно."
      ]
    },
    "answer": "False",
    "mistake": {
      "hy": "Մեկ օրինակով բոլոր իրական թվերի վերաբերյալ պնդում չես ապացուցի։",
      "en": "A single confirming example cannot prove a universal statement.",
      "ru": "Одного подтверждающего примера недостаточно для доказательства."
    }
  }
];
