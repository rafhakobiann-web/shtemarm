package am.shtemarm.app

import org.junit.Assert.*
import org.junit.Test

/** Regression tests for the raw-string regex used by QuestionRepository. */
class EnglishNumberedGapTest {
    private val numberedGap = Regex("""\((\d+)\)\s*_{2,}""")

    @Test fun matchesOnlyActualNumberedBlanks() {
        val passage = "One (1)_____ and two (2) _____ but (3) is not a blank"
        assertEquals(setOf("1", "2"), numberedGap.findAll(passage).map { it.groupValues[1] }.toSet())
        assertTrue(Regex("""\(1\)\s*_{2,}""").containsMatchIn(passage))
        assertFalse(Regex("""\(3\)\s*_{2,}""").containsMatchIn(passage))
    }

    @Test fun rejectsMissingOrDuplicateImportedNumbers() {
        val passage = "First (1)_____ second (2)_____ third (3)_____"
        val sourceNumbers = numberedGap.findAll(passage).map { it.groupValues[1] }.toSet()
        fun valid(imported: List<String>) =
            imported.size == imported.toSet().size && imported.toSet() == sourceNumbers
        assertTrue(valid(listOf("1", "2", "3")))
        assertFalse(valid(listOf("2", "2")))
        assertFalse(valid(listOf("1", "3")))
    }
}
