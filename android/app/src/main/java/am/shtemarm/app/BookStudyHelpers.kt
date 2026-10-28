package am.shtemarm.app

/** Pure book-navigation helpers; safe to test without an Android device. */
internal object BookStudyHelpers {
    fun sectionTitle(
        subject: String,
        title: String,
        label: String,
        instruction: String,
        index: Int
    ): String {
        val descriptive = sequenceOf(title, label)
            .map { it.trim() }
            .firstOrNull { candidate ->
                candidate.isNotBlank() && candidate.any { it.isLetter() }
            }
        if (descriptive != null) return descriptive
        val chapter = "Բաժին ${index + 1}"
        if (subject == "Անգլերեն" && instruction.isNotBlank()) {
            val instructions = instruction.trim().replace(Regex("\\s+"), " ")
                .trimEnd('.', '։', ':')
            return chapter + " · " + instructions.take(92) +
                if (instructions.length > 92) "…" else ""
        }
        return chapter
    }

    fun matches(query: String, vararg fields: String): Boolean {
        val sought = query.trim().lowercase()
        return sought.isEmpty() || fields.any { it.lowercase().contains(sought) }
    }

    /** Dedupe a generated exam without removing records from the source books. */
    fun uniquePracticeQuestions(questions: List<StudyQuestion>): List<StudyQuestion> {
        return questions.distinctBy { q ->
            q.stem.trim().lowercase().replace(Regex("\\s+"), " ") +
                "\u0001" + q.choices.joinToString("\u0002") {
                    it.trim().lowercase().replace(Regex("\\s+"), " ")
                }
        }
    }
}
