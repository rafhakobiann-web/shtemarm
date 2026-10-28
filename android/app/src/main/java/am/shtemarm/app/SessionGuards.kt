package am.shtemarm.app

/**
 * Pure rules shared by the UI and local progress storage.
 * Keeping these independent of Android lets CI detect scoring regressions.
 */
internal object SessionGuards {
    data class ChoiceResult(val accepted: Boolean, val correct: Boolean)

    fun evaluate(previousChoice: Int, selected: Int, answer: Int, choices: Int): ChoiceResult {
        if (previousChoice >= 0 || choices !in 2..6 ||
            selected !in 0 until choices || answer !in 0 until choices) {
            return ChoiceResult(accepted = false, correct = false)
        }
        return ChoiceResult(accepted = true, correct = selected == answer)
    }

    fun validSession(answered: Int, correct: Int, sessionId: String): Boolean =
        answered in 1..100000 && correct in 0..answered &&
            sessionId.length in 16..128

    fun sourceAssets(bookmarkedIds: Set<String>): Set<String> =
        bookmarkedIds.mapNotNull { id ->
            val name = id.substringBefore(':')
            // Bookmarks originating from the offline source have IDs:
            // "book1.json:section:unit:index".
            name.takeIf { id.contains(':') && name.endsWith(".json") &&
                name.length in 6..120 && !name.contains('/') && !name.contains('\\') }
        }.toSet()
}
