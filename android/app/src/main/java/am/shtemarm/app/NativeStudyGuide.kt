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
