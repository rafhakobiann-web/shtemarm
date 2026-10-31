package am.shtemarm.app

import org.junit.Assert.*
import org.junit.Test

/** Regression coverage for navigation and question-pool generation. */
class BookStudyHelpersTest {
    @Test fun findsArmenianSectionNamesAndIgnoresSearchCase() {
        assertTrue(BookStudyHelpers.matches("  ՊԱՏՄ ", "Հայոց պատմություն", "Տարեթվեր"))
        assertFalse(BookStudyHelpers.matches("կենսաբանություն", "Հայոց պատմություն"))
        assertTrue(BookStudyHelpers.matches("  ", "Անգլերեն"))
    }

    @Test fun labelsEnglishSectionsWithoutInventingQuestionText() {
        assertEquals("Grammar", BookStudyHelpers.sectionTitle("Անգլերեն", "Grammar", "", "", 0))
        assertEquals("Բաժին 2 · Choose the correct answer",
            BookStudyHelpers.sectionTitle("Անգլերեն", "  ", "", " Choose   the correct answer. ", 1))
        assertEquals("Բաժին 3",
            BookStudyHelpers.sectionTitle("Ֆիզիկա", "", "", "Choose an option", 2))
    }

    @Test fun deduplicatesEquivalentQuestionsButKeepsDifferentAnswerOptions() {
        val questions = listOf(
            StudyQuestion("first", " The  sky is blue ", listOf("Yes", "No"), 0),
            StudyQuestion("duplicate", "the sky is BLUE", listOf("yes ", " no"), 0),
            StudyQuestion("different", "The sky is blue", listOf("No", "Yes"), 1)
        )
        val unique = BookStudyHelpers.uniquePracticeQuestions(questions)
        assertEquals(listOf("first", "different"), unique.map { it.id })
    }
}
