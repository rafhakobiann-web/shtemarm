package am.shtemarm.app

/**
 * Adaptive revision route built from existing local chapter statistics.
 * Never fabricates a question, answer key, or AI assessment.
 * Stable sorting ensures the same progress always produces the same route.
 */
data class RevisionChapter(
    val key: String,
    val answered: Int,
    val correct: Int,
    val sessions: Int,
)

data class RevisionStep(
    val chapterKey: String,
    val reason: String,
    val priority: Int,
)

object AdaptiveRevision {
    fun plan(chapters: List<RevisionChapter>, limit: Int = 5): List<RevisionStep> {
        if (limit <= 0) return emptyList()
        return chapters.asSequence()
            .filter { it.key.isNotBlank() && it.answered >= 0 && it.correct in 0..it.answered && it.sessions >= 0 }
            .distinctBy { it.key }
            .map { chapter ->
                val wrong = chapter.answered - chapter.correct
                val accuracy = if (chapter.answered == 0) 0 else chapter.correct * 100 / chapter.answered
                val priority = when {
                    chapter.answered == 0 -> 70
                    accuracy < 50 -> 100
                    accuracy < 75 -> 85
                    accuracy < 90 -> 55
                    else -> 20
                } + (if (wrong > 0) 10 else 0) + (if (chapter.sessions <= 1) 5 else 0)
                val reason = when {
                    chapter.answered == 0 -> "not-started"
                    accuracy < 75 -> "needs-practice"
                    accuracy < 90 -> "reinforce"
                    else -> "review"
                }
                RevisionStep(chapter.key, reason, priority)
            }
            .sortedWith(compareByDescending<RevisionStep> { it.priority }.thenBy { it.chapterKey })
            .take(limit.coerceAtMost(20))
            .toList()
    }
}
