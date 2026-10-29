package am.shtemarm.app

/** Deterministic native explanations; no AI key, network call, or fabricated source text. */
object NativeStudyGuide {
    val languages = listOf("hy", "en", "ru")
    fun label(language: String, hy: String, en: String, ru: String): String =
        when (language) { "en" -> en; "ru" -> ru; else -> hy }

    data class Rule(val id: String, val name: String, val hy: String, val en: String, val ru: String) {
        fun explanation(lang: String) = label(lang, hy, en, ru)
    }

    val grammar = listOf(
        Rule("future-perfect", "Future Perfect",
            "1. Գտիր ապագայի սահմանը՝ by Friday։ 2. Ստուգիր՝ գործողությունը մինչև այդ կավարտվի՞։ 3. Կազմիր will have + V3։ Օրինակ՝ By Friday, I will have finished. Մի՛ գրիր will has։",
            "1. Find a future deadline (by Friday). 2. Ask whether the action will be complete by then. 3. Use will have + past participle: By Friday, I will have finished. Never use will has.",
            "1. Найдите будущий срок (by Friday). 2. Проверьте завершённость к сроку. 3. Используйте will have + V3: By Friday, I will have finished. Не пишите will has."),
        Rule("mixed-conditionals", "Mixed Conditionals",
            "1. Որոշիր պայմանի և հետևանքի ժամանակները։ 2. Անցյալում չկատարված պայման՝ if + had + V3։ 3. Ներկայի հետևանք՝ would + V։ Օրինակ՝ If I had slept, I would feel better now։",
            "1. Identify the condition's time and the result's time. 2. Unreal past condition: if + had + V3. 3. Unreal present result: would + base verb. Example: If I had slept, I would feel better now.",
            "1. Определите времена условия и результата. 2. Нереальное прошлое: if + had + V3. 3. Результат сейчас: would + V. Пример: If I had slept, I would feel better now."),
        Rule("articles", "Articles: a / an / the",
            "1. Որոշիր՝ գոյականը հաշվելի՞ է և եզակի՞։ 2. Առաջին հիշատակման դեպքում՝ a/an ըստ հնչյունի (an hour, a university)։ 3. Կոնկրետ հայտնի առարկայի դեպքում՝ the։ Օրինակ՝ I saw a dog. The dog was friendly։",
            "1. Check if the noun is singular countable. 2. For a new nonspecific item, choose a/an by sound (an hour, a university). 3. For an identifiable item, use the: I saw a dog. The dog was friendly.",
            "1. Проверьте, исчисляемое ли существительное в единственном числе. 2. Для нового предмета — a/an по звуку (an hour, a university). 3. Для известного предмета — the: I saw a dog. The dog was friendly."),
        Rule("conditionals", "Conditionals",
            "Պայմանական նախադասություններ. I տեսակ՝ if + Present Simple, will + V1։ II տեսակ՝ if + Past Simple, would + V1։ III տեսակ՝ if + Past Perfect, would have + V3։",
            "Conditionals: Type 1 uses if + present simple, will + base verb. Type 2 uses if + past simple, would + base verb. Type 3 uses if + past perfect, would have + past participle.",
            "Условные предложения: тип 1 — if + Present Simple, will + V1; тип 2 — if + Past Simple, would + V1; тип 3 — if + Past Perfect, would have + V3."),
        Rule("passive", "Passive voice",
            "Կրավորական սեռ. be + V3։ Օրինակ՝ The letter was written yesterday։ be-ի ձևը փոխվում է ըստ ժամանակաձևի։",
            "Passive voice: be + past participle. Example: The letter was written yesterday. Choose the correct tense of be.",
            "Страдательный залог: be + V3. Пример: The letter was written yesterday. Время выражается формой be."),
        Rule("perfect", "Perfect tenses",
            "Perfect ժամանակաձևեր. have/has/had + V3։ Present Perfect-ը կապում է անցյալը ներկային, Past Perfect-ը նշում է մյուս անցյալ գործողությունից ավելի վաղ դեպք։",
            "Perfect tenses use have/has/had + past participle. Present perfect connects past to now; past perfect precedes another past event.",
            "Времена Perfect: have/has/had + V3. Present Perfect связывает прошлое с настоящим, Past Perfect обозначает более раннее событие."),
        Rule("reported", "Reported speech",
            "Անուղղակի խոսքում ստուգիր դերանունները, ժամանակի ցուցիչները և հաղորդող բայի ժամանակը։ Հետադարձ ժամանակաձևը միշտ չէ, որ պարտադիր է։",
            "In reported speech, check pronouns, time expressions and the reporting verb. Backshift depends on context.",
            "В косвенной речи учитывайте местоимения, указатели времени и время вводящего глагола. Сдвиг времён зависит от контекста."),
        Rule("relative", "Relative clauses",
            "Որոշիչ երկրորդական. who՝ մարդկանց, which՝ իրերին, that՝ շատ սահմանափակող կառույցներում։ Չսահմանափակող որոշիչները սովորաբար առանձնացվում են ստորակետերով։",
            "Relative clauses: who for people, which for things, and that in many defining clauses. Non-defining clauses use commas.",
            "Относительные придаточные: who — люди, which — предметы, that — многие ограничительные придаточные. Неограничительные выделяются запятыми."),
        Rule("comparison", "Comparison",
            "Համեմատական աստիճան՝ -er կամ more, գերադրական՝ the -est կամ the most։ Բացառություն՝ good → better → best։",
            "Comparative: -er or more; superlative: the -est or the most. Irregular: good → better → best.",
            "Сравнительная степень: -er или more; превосходная: the -est или the most. Исключение: good → better → best."),
        Rule("gerund", "Gerund / infinitive",
            "Բայից հետո -ing կամ to + infinitive ընտրությունը կախված է բայից և իմաստից. enjoy doing, decide to do։",
            "Verb patterns depend on meaning: enjoy doing, decide to do. Not every verb accepts both forms.",
            "Выбор -ing или to + infinitive зависит от глагола и смысла: enjoy doing, decide to do.")
    )

    data class Formula(val name: String, val hy: String, val en: String, val ru: String) {
        fun explanation(lang: String) = label(lang, hy, en, ru)
    }
    val math = listOf(
        Formula("Quadratic equation — worked example",
            "Լուծիր x² − 5x + 6 = 0։ 1. a = 1, b = −5, c = 6։ 2. D = 25 − 24 = 1։ 3. x = (5 ± 1)/2, հետևաբար x₁ = 2, x₂ = 3։ Ստուգում՝ (x−2)(x−3)=0։",
            "Solve x² − 5x + 6 = 0. 1. a = 1, b = −5, c = 6. 2. D = 25 − 24 = 1. 3. x = (5 ± 1)/2, giving x = 2 or 3. Check: (x−2)(x−3)=0.",
            "Решите x² − 5x + 6 = 0. 1. a = 1, b = −5, c = 6. 2. D = 25 − 24 = 1. 3. x = (5 ± 1)/2, то есть x = 2 или 3. Проверка: (x−2)(x−3)=0."),
        Formula("Arithmetic progression — worked example",
            "Տրված է 3, 7, 11, …։ 1. d = 7 − 3 = 4։ 2. a₅ = 3 + 4·4 = 19։ 3. S₅ = 5(3 + 19)/2 = 55։ Ստուգում՝ 3+7+11+15+19=55։",
            "Given 3, 7, 11, … . 1. d = 7 − 3 = 4. 2. a₅ = 3 + 4·4 = 19. 3. S₅ = 5(3 + 19)/2 = 55. Check: 3+7+11+15+19=55.",
            "Дано 3, 7, 11, … . 1. d = 7 − 3 = 4. 2. a₅ = 3 + 4·4 = 19. 3. S₅ = 5(3 + 19)/2 = 55. Проверка: 3+7+11+15+19=55."),
        Formula("Pythagoras — worked example",
            "Ուղղանկյուն եռանկյան էջերը 6 և 8 են։ 1. c² = 6² + 8²։ 2. c² = 100։ 3. c = 10։ Մի՛ գումարիր էջերը՝ ներքնաձիգը գտնելու համար։",
            "The legs of a right triangle are 6 and 8. 1. c² = 6² + 8². 2. c² = 100. 3. c = 10. Do not simply add the legs.",
            "Катеты прямоугольного треугольника равны 6 и 8. 1. c² = 6² + 8². 2. c² = 100. 3. c = 10. Не складывайте катеты напрямую."),
        Formula("Linear equations", "ax + b = c, a ≠ 0 ⇒ x = (c − b) / a։ Երկու կողմերից հանիր b-ն, ապա բաժանիր a-ի։",
            "ax + b = c, a ≠ 0 ⇒ x = (c − b) / a. Subtract b, then divide by a.",
            "ax + b = c, a ≠ 0 ⇒ x = (c − b) / a. Вычтите b и разделите на a."),
        Formula("Quadratic equations", "ax² + bx + c = 0, a ≠ 0։ D = b² − 4ac։ Եթե D ≥ 0, ապա x = (−b ± √D) / (2a)։",
            "ax² + bx + c = 0, a ≠ 0. D = b² − 4ac. For D ≥ 0, x = (−b ± √D) / (2a).",
            "ax² + bx + c = 0, a ≠ 0. D = b² − 4ac. При D ≥ 0: x = (−b ± √D) / (2a)."),
        Formula("Arithmetic progression", "aₙ = a₁ + (n − 1)d։ Sₙ = n(a₁ + aₙ)/2։",
            "aₙ = a₁ + (n − 1)d. Sₙ = n(a₁ + aₙ)/2.",
            "aₙ = a₁ + (n − 1)d. Sₙ = n(a₁ + aₙ)/2."),
        Formula("Pythagorean theorem", "Ուղղանկյուն եռանկյան համար a² + b² = c², որտեղ c-ն ներքնաձիգն է։",
            "In a right triangle, a² + b² = c², where c is the hypotenuse.",
            "В прямоугольном треугольнике a² + b² = c², где c — гипотенуза."),
        Formula("Geometric progression", "bₙ = b₁q⁽ⁿ⁻¹⁾։ Եթե q ≠ 1, Sₙ = b₁(1 − qⁿ)/(1 − q)։ Օրինակ՝ 2, 6, 18 շարքի q = 3, b₄ = 54։ Ստուգիր՝ արդյոք հարևան անդամների հարաբերությունը հաստատուն է։",
            "bₙ = b₁q⁽ⁿ⁻¹⁾. If q ≠ 1, Sₙ = b₁(1 − qⁿ)/(1 − q). Example: 2, 6, 18 has q = 3 and b₄ = 54. Check that the ratio is constant.",
            "bₙ = b₁q⁽ⁿ⁻¹⁾. При q ≠ 1: Sₙ = b₁(1 − qⁿ)/(1 − q). Пример: 2, 6, 18; q = 3, b₄ = 54. Проверьте постоянство отношения."),
        Formula("Linear inequalities", "ax + b > c։ Նախ մեկուսացրու ax-ը։ Բացասական թվի բաժանելիս անհավասարության նշանը շրջվում է։ Օրինակ՝ −2x > 6 ⇒ x < −3։",
            "For ax + b > c, isolate ax. Reverse the inequality sign when multiplying or dividing by a negative number. Example: −2x > 6 ⇒ x < −3.",
            "В ax + b > c выделите ax. При умножении или делении на отрицательное число знак меняется. Пример: −2x > 6 ⇒ x < −3."),
        Formula("Distance between points", "A(x₁,y₁), B(x₂,y₂) ⇒ AB = √((x₂−x₁)² + (y₂−y₁)²)։ Օրինակ՝ A(1,2), B(4,6) ⇒ AB = 5։",
            "A(x₁,y₁), B(x₂,y₂): AB = √((x₂−x₁)² + (y₂−y₁)²). Example: A(1,2), B(4,6) gives AB = 5.",
            "A(x₁,y₁), B(x₂,y₂): AB = √((x₂−x₁)² + (y₂−y₁)²). Пример: A(1,2), B(4,6), AB = 5."),
        Formula("Circle geometry", "Շրջանագծի երկարությունը L = 2πr, շրջանի մակերեսը S = πr²։ Օրինակ՝ r = 3 ⇒ L = 6π, S = 9π։ Մի՛ շփոթիր երկարության և մակերեսի միավորները։",
            "Circumference L = 2πr; circle area S = πr². For r = 3, L = 6π and S = 9π. Do not confuse length and area units.",
            "Длина окружности L = 2πr; площадь круга S = πr². При r = 3: L = 6π, S = 9π. Не путайте единицы длины и площади."),
        Formula("Trigonometry in right triangles", "sin α = հակադիր էջ / ներքնաձիգ, cos α = կից էջ / ներքնաձիգ, tan α = հակադիր էջ / կից էջ։ Օրինակ՝ 3–4–5 եռանկյան մեջ 3-ի դիմացի անկյան sin-ը 3/5 է։",
            "sin α = opposite/hypotenuse, cos α = adjacent/hypotenuse, tan α = opposite/adjacent. In a 3–4–5 triangle, sin of the angle opposite side 3 is 3/5.",
            "sin α = противолежащий катет/гипотенуза, cos α = прилежащий катет/гипотенуза, tan α = противолежащий/прилежащий. В треугольнике 3–4–5 sin угла напротив стороны 3 равен 3/5."),
        Formula("Probability", "Հավասարահնարավոր ելքերի դեպքում P(A) = նպաստավոր ելքերի քանակ / բոլոր ելքերի քանակ։ Օրինակ՝ արդար զառով զույգ թիվ ստանալու հավանականությունը 3/6 = 1/2։",
            "For equally likely outcomes, P(A) = favorable outcomes / total outcomes. On a fair die, an even result has probability 3/6 = 1/2.",
            "При равновозможных исходах P(A) = благоприятные исходы / все исходы. Для честного кубика вероятность чётного числа 3/6 = 1/2."),
        Formula("Triangle area", "S = ah/2։ Հերոնի բանաձևը՝ S = √(p(p−a)(p−b)(p−c)), p = (a+b+c)/2։",
            "S = ah/2. Heron's formula: S = √(p(p−a)(p−b)(p−c)), p = (a+b+c)/2.",
            "S = ah/2. Формула Герона: S = √(p(p−a)(p−b)(p−c)), p = (a+b+c)/2.")
    )

    fun ruleFor(question: StudyQuestion): Rule? {
        // Only match the prompt, not incidental words in a reading passage.
        val text = question.stem.lowercase()
        return when {
            Regex("passive voice|passive form|active into passive").containsMatchIn(text) -> grammar.first { it.id == "passive" }
            Regex("conditional|if-clause").containsMatchIn(text) -> grammar.first { it.id == "conditionals" }
            Regex("reported speech|indirect speech").containsMatchIn(text) -> grammar.first { it.id == "reported" }
            Regex("relative clause|relative pronoun").containsMatchIn(text) -> grammar.first { it.id == "relative" }
            Regex("present perfect|past perfect|future perfect").containsMatchIn(text) -> grammar.first { it.id == "perfect" }
            Regex("comparative|superlative").containsMatchIn(text) -> grammar.first { it.id == "comparison" }
            Regex("gerund|infinitive").containsMatchIn(text) -> grammar.first { it.id == "gerund" }
            else -> null
        }
    }

    fun explanation(question: StudyQuestion, subject: String, language: String): String {
        if (question.explanation.isNotBlank()) return question.explanation
        val rule = if (subject == "Անգլերեն") ruleFor(question) else null
        if (rule != null) return rule.explanation(language) + "\n\n" +
            label(language, "Սա ընդհանուր կանոն է, ոչ թե տվյալ պատասխանի ապացույց։",
                "This rule is guidance, not a verified proof of this answer.",
                "Это общее правило, а не доказательство ответа.")
        return label(language,
            "Այս հարցի անհատական բացատրությունը դեռ ստուգված չէ։ Ճիշտ պատասխանը տեսանելի է, բայց առանց հիմնավորման քայլեր չենք հորինում։ Օգտվիր համապատասխան կանոնների ձեռնարկից։",
            "A verified explanation for this exact question is not available yet. The answer key is shown, but no reasoning is invented. Consult the study guide.",
            "Проверенного объяснения именно этого задания пока нет. Ключ ответов доступен, но шаги не выдумываются. Откройте справочник.")
    }
}
